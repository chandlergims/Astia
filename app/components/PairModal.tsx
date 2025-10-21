import { X } from "@phosphor-icons/react";

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

interface PairModalProps {
  pair: PerpPair | null;
  onClose: () => void;
}

export default function PairModal({ pair, onClose }: PairModalProps) {
  if (!pair) return null;

  const priceChangeNum = parseFloat(pair.priceChangePercent);
  const isPositive = priceChangeNum > 0;
  const isNegative = priceChangeNum < 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#1c1c1e] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{pair.baseAsset}</h2>
            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">PERP</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Current Price */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Price</p>
          <p className="text-4xl font-bold text-white">${parseFloat(pair.currentPrice).toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
              {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(priceChangeNum).toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">24h</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">24h High</p>
            <p className="text-lg font-semibold text-white">${parseFloat(pair.highPrice).toFixed(2)}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">24h Low</p>
            <p className="text-lg font-semibold text-white">${parseFloat(pair.lowPrice).toFixed(2)}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">24h Volume</p>
            <p className="text-lg font-semibold text-white">{parseFloat(pair.volume).toLocaleString()}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Price Change</p>
            <p className={`text-lg font-semibold ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
              ${parseFloat(pair.priceChange).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 pt-4 border-t border-gray-800/50">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Symbol</span>
            <span className="text-sm text-gray-300 font-mono">{pair.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Contract Type</span>
            <span className="text-sm text-gray-300">{pair.contractType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Status</span>
            <span className="text-sm text-green-500">{pair.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
