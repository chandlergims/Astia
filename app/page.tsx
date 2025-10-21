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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {token.symbol}
                  </h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1.5">
                  {token.pairs.slice(0, 2).map((pair) => (
                    <div
                      key={pair.symbol}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-gray-500 truncate pr-1">
                        {pair.quoteAsset}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        ${parseFloat(pair.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {token.pairs.length > 2 && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      +{token.pairs.length - 2} more
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
