import { NextResponse } from 'next/server';

const ASTER_API_BASE = 'https://sapi.asterdex.com';

export async function GET() {
  try {
    // Fetch exchange info to get all trading pairs (tokens)
    const exchangeInfoResponse = await fetch(`${ASTER_API_BASE}/api/v1/exchangeInfo`);
    
    if (!exchangeInfoResponse.ok) {
      throw new Error('Failed to fetch exchange info');
    }

    const exchangeInfo = await exchangeInfoResponse.json();

    // Fetch current prices for all symbols
    const priceResponse = await fetch(`${ASTER_API_BASE}/api/v1/ticker/price`);
    
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch prices');
    }

    const prices = await priceResponse.json();

    // Create a price map for quick lookup
    const priceMap = new Map();
    if (Array.isArray(prices)) {
      prices.forEach((item: { symbol: string; price: string }) => {
        priceMap.set(item.symbol, item.price);
      });
    }

    // Extract unique tokens from trading pairs
    const tokensSet = new Set<string>();
    const symbols = exchangeInfo.symbols || [];
    
    symbols.forEach((symbol: { baseAsset: string; quoteAsset: string; symbol: string; status: string }) => {
      if (symbol.status === 'TRADING') {
        tokensSet.add(symbol.baseAsset);
        tokensSet.add(symbol.quoteAsset);
      }
    });

    // Format the response
    const tokens = Array.from(tokensSet).map(token => ({
      symbol: token,
      // Find a trading pair with this token to get price info
      pairs: symbols
        .filter((s: { baseAsset: string; quoteAsset: string; status: string }) => 
          s.status === 'TRADING' && (s.baseAsset === token || s.quoteAsset === token)
        )
        .map((s: { symbol: string; baseAsset: string; quoteAsset: string }) => ({
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          price: priceMap.get(s.symbol) || '0'
        }))
    }));

    return NextResponse.json({
      success: true,
      data: {
        tokens,
        symbols: exchangeInfo.symbols,
        serverTime: exchangeInfo.serverTime
      }
    });

  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tokens from Aster Dex' 
      },
      { status: 500 }
    );
  }
}
