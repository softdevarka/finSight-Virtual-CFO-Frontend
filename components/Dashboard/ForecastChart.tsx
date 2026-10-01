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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl shadow-xl min-w-[120px]">
        <p className="text-zinc-400 text-xs font-bold mb-2 uppercase tracking-wider">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-zinc-300 text-xs font-medium">{entry.name}</span>
              </div>
              <span className="text-white text-xs font-bold">${Number(entry.value).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ForecastChart({ data: propData }: { data?: any[] }) {
  const chartData = propData || [];
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line 
            type="monotone" 
            dataKey="actual" 
            name="Actual"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#18181b', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            name="Prediction"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#18181b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase">Predicted</span>
        </div>
      </div>
    </div>
  );
}
