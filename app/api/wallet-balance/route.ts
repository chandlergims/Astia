import { NextResponse } from 'next/server';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Fetch token balances from Moralis API (BSC chain)
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=bsc&limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch wallet balance from Moralis');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        address,
        tokens: data.result || [],
        cursor: data.cursor,
      },
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch wallet balance' 
      },
      { status: 500 }
    );
  }
}
