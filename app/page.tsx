"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: string;
}

interface Token {
  symbol: string;
  pairs: TradingPair[];
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tokens");
      const data = await response.json();

      if (data.success) {
        setTokens(data.data.tokens);
      } else {
        setError(data.error || "Failed to fetch tokens");
      }
    } catch (err) {
      setError("Failed to fetch tokens");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Spot Trading Pairs</h1>
          <p className="text-gray-600 mt-2">Live spot market data from Aster Dex</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading trading pairs...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchTokens}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {token.symbol}
                </h3>
                <div className="space-y-2">
                  {token.pairs.slice(0, 3).map((pair) => (
                    <div
                      key={pair.symbol}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">
                        {pair.baseAsset}/{pair.quoteAsset}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${parseFloat(pair.price).toFixed(4)}
                      </span>
                    </div>
                  ))}
                  {token.pairs.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{token.pairs.length - 3} more pairs
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && tokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No trading pairs found</p>
          </div>
        )}
      </main>
    </div>
  );
}
