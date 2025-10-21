"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BalanceSnapshot {
  id: string;
  timestamp: string;
  bnb_balance: number;
  bnb_usd_value: number;
  portfolio_value: number;
  total_tokens: number;
}

export default function BalanceChart() {
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // 24 hours default

  useEffect(() => {
    fetchBalanceHistory();
  }, [timeRange]);

  const fetchBalanceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/balance-history?hours=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setSnapshots(data.data.snapshots);
      } else {
        setError(data.error || "Failed to fetch balance history");
      }
    } catch (err) {
      setError("Failed to fetch balance history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = snapshots.map((snapshot) => ({
    time: new Date(snapshot.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    portfolio: snapshot.portfolio_value,
    bnb: snapshot.bnb_usd_value,
  }));

  return (
    <div className="bg-[#1c1c1e] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Portfolio Value</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(24)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              timeRange === 24
                ? "bg-[#efbe84] text-[#121315] font-semibold"
                : "bg-[#2c2c2e] text-gray-400 hover:text-white"
            }`}
          >
            24H
          </button>
          <button
            onClick={() => setTimeRange(72)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              timeRange === 72
                ? "bg-[#efbe84] text-[#121315] font-semibold"
                : "bg-[#2c2c2e] text-gray-400 hover:text-white"
            }`}
          >
            72H
          </button>
          <button
            onClick={() => setTimeRange(168)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              timeRange === 168
                ? "bg-[#efbe84] text-[#121315] font-semibold"
                : "bg-[#2c2c2e] text-gray-400 hover:text-white"
            }`}
          >
            7D
          </button>
        </div>
      </div>

      {loading && (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      )}

      {error && (
        <div className="h-64 flex items-center justify-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && snapshots.length === 0 && (
        <div className="h-64 flex items-center justify-center flex-col gap-3">
          <p className="text-gray-400 text-sm">No data available yet</p>
          <p className="text-gray-500 text-xs">Data will appear once the cron job starts collecting snapshots</p>
        </div>
      )}

      {!loading && !error && snapshots.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#efbe84" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#efbe84" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBnb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1c1c1e', 
                border: '1px solid #2c2c2e',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend 
              wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="portfolio" 
              stroke="#efbe84" 
              fillOpacity={1}
              fill="url(#colorPortfolio)"
              strokeWidth={2}
              name="Total Portfolio"
            />
            <Area 
              type="monotone" 
              dataKey="bnb" 
              stroke="#8b5cf6" 
              fillOpacity={1}
              fill="url(#colorBnb)"
              strokeWidth={2}
              name="BNB Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
