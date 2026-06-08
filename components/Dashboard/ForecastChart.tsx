'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

const data = [
  { month: 1, value: 2200, type: 'historical' },
  { month: 2, value: 2100, type: 'historical' },
  { month: 3, value: 4000, type: 'historical' },
  { month: 4, value: 3000, type: 'historical' },
  { month: 5, value: 3100, type: 'historical' },
  { month: 6, value: 6000, type: 'historical' },
  { month: 7, value: 4100, type: 'historical' },
  { month: 8, value: 5000, type: 'historical' },
  { month: 9, value: 7000, type: 'historical' },
  { month: 10, value: 4000, type: 'historical' },
  { month: 11, value: 5000, type: 'historical' },
  { month: 12, value: 8000, type: 'historical' },
  { month: 13, value: 6000, type: 'prediction' },
  { month: 14, value: 6100, type: 'prediction' },
  { month: 15, value: 9000, type: 'prediction' },
  { month: 16, value: 6000, type: 'prediction' },
  { month: 17, value: 7000, type: 'prediction' },
  { month: 18, value: 11000, type: 'prediction' },
];

export function ForecastChart({ data: propData }: { data?: any[] }) {
  const chartData = propData || data;
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            label={{ value: 'MUSD', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <ReferenceArea x1={1} x2={12} fill="#6366f1" fillOpacity={0.05} />
          <ReferenceArea x1={12} x2={18} fill="#22c55e" fillOpacity={0.05} />
          <ReferenceLine x={12} stroke="#8b5cf6" strokeWidth={2} label={{ value: 'Today', position: 'top', fill: '#8b5cf6', fontSize: 12, fontWeight: 'bold' }} />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase">Prediction</span>
        </div>
      </div>
    </div>
  );
}
