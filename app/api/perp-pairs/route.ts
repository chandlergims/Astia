import { NextResponse } from 'next/server';

const ASTER_FUTURES_API_BASE = 'https://fapi.asterdex.com';

export async function GET() {
  try {
    // Fetch exchange info to get all perpetual contracts
    const response = await fetch(`${ASTER_FUTURES_API_BASE}/fapi/v1/exchangeInfo`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch perpetual pairs from Aster Dex');
    }

    const data = await response.json();

    // Filter for perpetual contracts that are actively trading
    const perpPairs = data.symbols?.filter((symbol: any) => 
      symbol.contractType === 'PERPETUAL' && symbol.status === 'TRADING'
    ) || [];

    // Get 24hr ticker statistics for all pairs (includes price changes, volume, etc.)
    const tickerResponse = await fetch(`${ASTER_FUTURES_API_BASE}/fapi/v1/ticker/24hr`);
    const tickers = tickerResponse.ok ? await tickerResponse.json() : [];

    // Create ticker map
    const tickerMap = new Map();
    if (Array.isArray(tickers)) {
      tickers.forEach((ticker: any) => {
        tickerMap.set(ticker.symbol, ticker);
      });
    }

    // Enrich perpetual pairs with 24hr statistics
    const enrichedPairs = perpPairs.map((pair: any) => {
      const ticker = tickerMap.get(pair.symbol) || {};
      return {
        symbol: pair.symbol,
        pair: pair.pair,
        baseAsset: pair.baseAsset,
        quoteAsset: pair.quoteAsset,
        marginAsset: pair.marginAsset,
        status: pair.status,
        contractType: pair.contractType,
        currentPrice: ticker.lastPrice || '0',
        priceChange: ticker.priceChange || '0',
        priceChangePercent: ticker.priceChangePercent || '0',
        highPrice: ticker.highPrice || '0',
        lowPrice: ticker.lowPrice || '0',
        volume: ticker.volume || '0',
        quoteVolume: ticker.quoteVolume || '0',
        openPrice: ticker.openPrice || '0',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        perpPairs: enrichedPairs,
        total: enrichedPairs.length,
        serverTime: data.serverTime
      }
    });

  } catch (error) {
    console.error('Error fetching perpetual pairs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch perpetual pairs from Aster Dex' 
      },
      { status: 500 }
    );
  }
}
