'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

import { TREND_DATA } from '@/lib/mock-data';

const costData = [
  { name: 'COGS', value: 75.32, color: '#6366f1' },
  { name: 'D&A', value: 2.05, color: '#8b5cf6' },
  { name: 'SG&A', value: 21.38, color: '#a855f7' },
  { name: 'Unusual', value: 0.30, color: '#d946ef' },
  { name: 'Interest', value: 0.51, color: '#ec4899' },
  { name: 'Tax', value: 1.04, color: '#f43f5e' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isYTD = label === '2026';
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-2xl">
        <p className="text-xs font-bold text-zinc-400 mb-1">
          {label} {isYTD && '(YTD)'}
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          ${(payload[0].value / 1000000).toFixed(1)}M
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueTrendChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `$${value / 1000000}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRev)" 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostBreakupChart() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={costData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {costData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="middle" 
            align="right" 
            layout="vertical"
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase ml-2">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
