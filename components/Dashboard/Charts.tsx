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
import { Loader2 } from 'lucide-react';

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
    const isProjected = Number(label) > 2025;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-2xl">
        <p className="text-xs font-bold text-zinc-400 mb-1">
          {label} {isProjected && '(Projected)'}
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          ${(payload[0].value / 1000000).toFixed(2)}M
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueTrendChart() {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const batchIdStr = localStorage.getItem('upload_batch_id');
        const token = localStorage.getItem('auth_token');
        if (!batchIdStr) {
          setIsLoading(false);
          return;
        }

        const payload = {
          batch_id: Number(batchIdStr),
          CCI: 95,
          CPI: 3.2,
          Oil: 57.26,
          GDP: 731.418,
          Unemployment: 4.1,
          ROI: 3.6
        };

        const res = await fetch('/api/ml/predict/from-batch/1?prediction_start=2021-01-01&prediction_end=2028-12-31', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.predictions) {
            const yearlyData: Record<string, { actual: number, predicted: number }> = {};

            json.predictions.forEach((row: any) => {
              if (!row.order_date) return;
              const year = row.order_date.substring(0, 4);
              if (!yearlyData[year]) {
                yearlyData[year] = { actual: 0, predicted: 0 };
              }
              yearlyData[year].actual += (row.actual_total_revenue || 0);
              yearlyData[year].predicted += (row.predicted_total_revenue || 0);
            });

            const chartData = Object.keys(yearlyData).sort().map(year => {
              // 2021 to 2025 has actuals, 2026 to 2028 relies on predicted
              const isHistorical = Number(year) <= 2025;
              const rev = isHistorical ? yearlyData[year].actual : yearlyData[year].predicted;
              return {
                name: year,
                revenue: rev
              };
            });

            setData(chartData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch revenue trend data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : TREND_DATA;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
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

export function CostBreakupChart({ data, isLoading }: { data?: any[], isLoading?: boolean }) {
  const chartData = data && data.length > 0 ? data : costData;

  if (isLoading) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-[16px] border-zinc-100 dark:border-zinc-800/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry: any, index: number) => (
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
