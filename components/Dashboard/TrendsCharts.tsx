'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

const incomeExpenseData = [
  { year: '2022', revenue: 850000, grossProfit: 450000, ebit: 250000, netIncome: 180000 },
  { year: '2023', revenue: 920000, grossProfit: 480000, ebit: 280000, netIncome: 210000 },
  { year: '2024', revenue: 1050000, grossProfit: 550000, ebit: 320000, netIncome: 240000 },
  { year: '2025', revenue: 1180000, grossProfit: 620000, ebit: 380000, netIncome: 290000 },
  { year: '2026', revenue: 1320000, grossProfit: 710000, ebit: 450000, netIncome: 350000 },
];

const ratioData = [
  { year: '2022', eva: 10000, roa: 5.8, roe: 15.2, debtToEquity: 1.67, wcRatio: 0.93, peRatio: 31, berryRatio: 1.142 },
  { year: '2023', eva: 5500, roa: 4.9, roe: 14.1, debtToEquity: 1.90, wcRatio: 0.82, peRatio: 33, berryRatio: 1.102 },
  { year: '2024', eva: 7000, roa: 6.2, roe: 17.5, debtToEquity: 1.79, wcRatio: 0.83, peRatio: 28, berryRatio: 1.107 },
  { year: '2025', eva: 8000, roa: 7.5, roe: 20.1, debtToEquity: 1.68, wcRatio: 0.82, peRatio: 38, berryRatio: 1.108 },
  { year: '2026', eva: 6500, roa: 7.8, roe: 21.0, debtToEquity: 1.69, wcRatio: 0.79, peRatio: 41, berryRatio: 1.097 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-zinc-500 mb-2 uppercase">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function IncomeExpenseChart({ data = incomeExpenseData }: { data?: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" vertical={false} />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#71717a' }}
          />
          <Bar dataKey="revenue" name="Revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="grossProfit" name="Gross Profit" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ebit" name="EBIT" fill="#15803d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="netIncome" name="Net Income" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ data = ratioData, dataKey, name, color, suffix = "" }: { data?: any[], dataKey: string, name: string, color: string, suffix?: string }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" vertical={false} />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `${value}${suffix}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            name={name}
            stroke={color} 
            strokeWidth={2} 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
