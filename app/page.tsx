"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import PairModal from "./components/PairModal";
import { Copy, ArrowClockwise } from "@phosphor-icons/react";

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

interface PerpPair {
  symbol: string;
  pair: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: string;
  priceChangePercent: string;
  priceChange: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  contractType: string;
  status: string;
}

export default function Home() {
  const [perpPairs, setPerpPairs] = useState<PerpPair[]>([]);
  const [perpLoading, setPerpLoading] = useState(true);
  const [perpError, setPerpError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<PerpPair | null>(null);
  
  const AGENT_WALLET = process.env.NEXT_PUBLIC_AGENT_WALLET || "";
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchPerpPairs();
    fetchAgentWalletBalance();
  }, []);

  const fetchPerpPairs = async () => {
    try {
      setPerpLoading(true);
      const response = await fetch("/api/perp-pairs");
      const data = await response.json();

      if (data.success) {
        setPerpPairs(data.data.perpPairs);
      } else {
        setPerpError(data.error || "Failed to fetch perpetual pairs");
      }
    } catch (err) {
      setPerpError("Failed to fetch perpetual pairs");
      console.error(err);
    } finally {
      setPerpLoading(false);
    }
  };

  const fetchAgentWalletBalance = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);
      const response = await fetch(`/api/wallet-balance?address=${AGENT_WALLET}`);
      const data = await response.json();

      if (data.success) {
        setWalletTokens(data.data.tokens);
        setLastUpdated(new Date());
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

  return (
    <div className="min-h-screen bg-[#121315]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Dashboard */}
        <div className="mb-10">
          {walletError && (
            <div className="mb-4 bg-red-900/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{walletError}</p>
            </div>
          )}

          {walletLoading && (
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}

          {!walletLoading && !walletError && (
            <div className="flex items-center justify-between py-3 border-b border-gray-800/30">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-gray-400 mr-2">Balance:</span>
                  {walletTokens.find(t => t.native_token) ? (
                    <span className="text-sm font-semibold text-white">
                      {(parseFloat(walletTokens.find(t => t.native_token)!.balance) / Math.pow(10, walletTokens.find(t => t.native_token)!.decimals)).toFixed(4)} BNB
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">0.0000 BNB</span>
                  )}
                </div>
                <div className="h-4 w-px bg-gray-800"></div>
                <div>
                  <span className="text-xs text-gray-400 mr-2">Portfolio:</span>
                  <span className="text-sm font-semibold text-[#efbe84]">
                    ${walletTokens.reduce((sum, token) => sum + (token.usd_value || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-800"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Wallet:</span>
                  <code className="text-xs text-gray-400 font-mono">{AGENT_WALLET}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(AGENT_WALLET);
                    }}
                    className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                    title="Copy wallet address"
                  >
                    <Copy size={14} weight="regular" />
                  </button>
                </div>
              </div>
              <button
                onClick={fetchAgentWalletBalance}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                <ArrowClockwise size={12} />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Perpetual Pairs Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Perpetual Futures</h1>
          <p className="text-gray-400 mt-2">Live perpetual contracts from Aster Dex Futures</p>
        </div>

        {perpLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading perpetual pairs...</div>
          </div>
        )}

        {perpError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-400">{perpError}</p>
            <button
              onClick={fetchPerpPairs}
              className="mt-2 bg-[#efbe84] text-[#121315] px-4 py-2 rounded-lg hover:bg-[#f5d4a8] transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!perpLoading && !perpError && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {perpPairs.map((pair) => {
              const priceChangeNum = parseFloat(pair.priceChangePercent);
              const isPositive = priceChangeNum > 0;
              const isNegative = priceChangeNum < 0;
              
              return (
                <div
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair)}
                  className="bg-[#1c1c1e] rounded-xl p-3 hover:bg-[#2c2c2e] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#efbe84] transition-colors">
                      {pair.baseAsset}
                    </h3>
                    <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded">
                      PERP
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Price</span>
                      <span className="text-xs font-semibold text-gray-300">
                        ${parseFloat(pair.currentPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">24h</span>
                      <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
                        {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(priceChangeNum).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!perpLoading && !perpError && perpPairs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No perpetual pairs found</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <PairModal pair={selectedPair} onClose={() => setSelectedPair(null)} />
    </div>
  );
}
