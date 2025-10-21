import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24");
    
    const AGENT_WALLET = process.env.NEXT_PUBLIC_AGENT_WALLET;

    if (!AGENT_WALLET) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 500 }
      );
    }

    // Calculate the timestamp for X hours ago
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    const hoursAgoTimestamp = Timestamp.fromDate(hoursAgo);

    // Query Firestore for snapshots within the time range
    const snapshotsRef = collection(db, "balance_snapshots");
    const q = query(
      snapshotsRef,
      where("wallet_address", "==", AGENT_WALLET),
      where("timestamp", ">=", hoursAgoTimestamp),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        timestamp: docData.timestamp.toDate().toISOString(),
        bnb_balance: docData.bnb_balance,
        bnb_usd_value: docData.bnb_usd_value,
        portfolio_value: docData.portfolio_value,
        total_tokens: docData.total_tokens,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        snapshots: data,
        count: data.length,
        hours,
      },
    });
  } catch (error: any) {
    console.error("Error fetching balance history:", error);
    
    // If it's an index error or no data, return empty array instead of failing
    if (error.message?.includes("index") || error.message?.includes("requires an index")) {
      return NextResponse.json({
        success: true,
        data: {
          snapshots: [],
          count: 0,
          hours: parseInt(new URL(request.url).searchParams.get("hours") || "24"),
          message: "No data available yet. Firestore index needs to be created, or no snapshots have been saved."
        },
      });
    }
    
    // For other errors, return empty data gracefully
    return NextResponse.json({
      success: true,
      data: {
        snapshots: [],
        count: 0,
        hours: parseInt(new URL(request.url).searchParams.get("hours") || "24"),
      },
    });
  }
}
