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

interface WalletToken {
  token_address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  usd_price?: number;
  usd_value?: number;
  native_token: boolean;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [walletAddress, setWalletAddress] = useState("");
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

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

  const fetchWalletBalance = async () => {
    if (!walletAddress) return;

    try {
      setWalletLoading(true);
      setWalletError(null);
      const response = await fetch(`/api/wallet-balance?address=${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        setWalletTokens(data.data.tokens);
      } else {
        setWalletError(data.error || "Failed to fetch wallet balance");
      }
    } catch (err) {
      setWalletError("Failed to fetch wallet balance");
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWalletBalance();
  };

  return (
    <div className="min-h-screen bg-[#121315]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Search Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Check Wallet Balance</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter BSC wallet address..."
              className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#efbe84] transition-colors"
            />
            <button
              type="submit"
              disabled={walletLoading || !walletAddress}
              className="bg-[#efbe84] text-[#121315] px-6 py-3 rounded-lg hover:bg-[#f5d4a8] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {walletLoading ? "Loading..." : "Search"}
            </button>
          </form>

          {/* Wallet Balance Results */}
          {walletError && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400">{walletError}</p>
            </div>
          )}

          {walletTokens.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Wallet Tokens ({walletTokens.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {walletTokens.map((token, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 hover:border-[#efbe84] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {token.thumbnail && (
                          <img
                            src={token.thumbnail}
                            alt={token.symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <h4 className="font-bold text-white">{token.symbol}</h4>
                      </div>
                      {token.native_token && (
                        <span className="text-xs bg-[#efbe84] text-[#121315] px-2 py-1 rounded">
                          Native
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{token.name}</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-500">Balance: </span>
                        <span className="text-white font-medium">
                          {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(6)}
                        </span>
                      </p>
                      {token.usd_value !== undefined && (
                        <p className="text-sm">
                          <span className="text-gray-500">Value: </span>
                          <span className="text-[#efbe84] font-medium">
                            ${token.usd_value.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trading Pairs Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Spot Trading Pairs</h1>
          <p className="text-gray-400 mt-2">Live spot market data from Aster Dex</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading trading pairs...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchTokens}
              className="mt-2 bg-[#efbe84] text-[#121315] px-4 py-2 rounded-lg hover:bg-[#f5d4a8] transition-colors font-medium"
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
                className="bg-[#1a1a1a] border border-gray-300 rounded-xl p-3 hover:border-[#efbe84] transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#efbe84] transition-colors">
                    {token.symbol}
                  </h3>
                  <div className="w-2 h-2 bg-[#efbe84] rounded-full animate-pulse"></div>
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
                      <span className="text-xs font-semibold text-gray-300">
                        ${parseFloat(pair.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {token.pairs.length > 2 && (
                    <p className="text-[10px] text-gray-600 mt-1">
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
            <p className="text-gray-400">No trading pairs found</p>
          </div>
        )}
      </main>
    </div>
  );
}
