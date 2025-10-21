"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BalancePoint {
  time: string;
  portfolio: number;
  bnb: number;
}

export default function PortfolioChart() {
  const [chartData, setChartData] = useState<BalancePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      const AGENT_WALLET = process.env.NEXT_PUBLIC_AGENT_WALLET || "";
      
      // Fetch current balance
      const response = await fetch(`/api/wallet-balance?address=${AGENT_WALLET}`);
      const data = await response.json();

      if (data.success) {
        const tokens = data.data.tokens;
        const nativeToken = tokens.find((t: any) => t.native_token);
        const bnbValue = nativeToken?.usd_value || 0;
        const portfolioValue = tokens.reduce((sum: number, t: any) => sum + (t.usd_value || 0), 0);

        // Create simple data showing progression from 0 to current
        const now = new Date();
        const dataPoints: BalancePoint[] = [
          {
            time: new Date(now.getTime() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            portfolio: 0,
            bnb: 0,
          },
          {
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            portfolio: portfolioValue,
            bnb: bnbValue,
          }
        ];

        setChartData(dataPoints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c1e] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Portfolio Value</h2>
        <button
          onClick={fetchBalanceData}
          className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
            <Line 
              type="monotone" 
              dataKey="portfolio" 
              stroke="#efbe84" 
              strokeWidth={3}
              dot={{ fill: '#efbe84', r: 4 }}
              name="Total Portfolio"
            />
            <Line 
              type="monotone" 
              dataKey="bnb" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="BNB Value"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && chartData.length === 0 && (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Chart will show historical data once the Railway cron job starts saving balance snapshots
        </p>
      </div>
    </div>
  );
}
