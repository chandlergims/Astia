import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const AGENT_WALLET = process.env.NEXT_PUBLIC_AGENT_WALLET;
    const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

    if (!AGENT_WALLET || !MORALIS_API_KEY) {
      return NextResponse.json(
        { error: "Missing configuration" },
        { status: 500 }
      );
    }

    // Fetch wallet balance from Moralis
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${AGENT_WALLET}/tokens?chain=bsc`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": MORALIS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch wallet balance");
    }

    const data = await response.json();
    const tokens = data.result || [];

    // Calculate totals
    const nativeToken = tokens.find((t: any) => t.native_token);
    const bnbBalance = nativeToken
      ? parseFloat(nativeToken.balance) / Math.pow(10, nativeToken.decimals)
      : 0;
    const bnbUsdValue = nativeToken?.usd_value || 0;
    const portfolioValue = tokens.reduce(
      (sum: number, token: any) => sum + (token.usd_value || 0),
      0
    );

    // Save snapshot to Firestore
    const snapshot = {
      timestamp: Timestamp.now(),
      wallet_address: AGENT_WALLET,
      bnb_balance: bnbBalance,
      bnb_usd_value: bnbUsdValue,
      portfolio_value: portfolioValue,
      total_tokens: tokens.length,
    };

    await addDoc(collection(db, "balance_snapshots"), snapshot);

    return NextResponse.json({
      success: true,
      message: "Balance snapshot saved",
      data: snapshot,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
