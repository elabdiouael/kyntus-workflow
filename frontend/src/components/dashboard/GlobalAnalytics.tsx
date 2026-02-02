"use client";

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PilotStats {
  username: string;
  leaguePoints: number;
  qualityScore: number;
  totalTasks: number;
  tier: string;
}

export default function GlobalAnalytics() {
  const [data, setData] = useState<PilotStats[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/stats/leaderboard")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Err Chart:", err));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-indigo-600 font-semibold">
              🏆 League Pts: {payload[0].value}
            </p>
            <p className="text-emerald-600">
              ✅ Qualité: {payload[0].payload.qualityScore}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 z-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Performance League
          </h2>
          <p className="text-gray-500 mt-1">Comparatif global des performances (Points & Qualité)</p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-6">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-sm font-medium text-gray-600">Standard</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="text-sm font-medium text-gray-600">Gold Tier</span>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[400px] z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="username" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                dy={15}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            
            <Bar dataKey="leaguePoints" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.tier === 'GOLD' ? '#fbbf24' : '#6366f1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}