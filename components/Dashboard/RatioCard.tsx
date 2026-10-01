import React from 'react';
import { ChevronDown, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RatioCardProps {
  title: string;
  value: string;
  benchmark: string | number;
  benchmarkType: string;
  status?: string;
  details?: Record<string, any>;
  isLoading?: boolean;
}

export function RatioCard({ title, value, benchmark, benchmarkType, status, details, isLoading = false }: RatioCardProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 shadow-sm min-h-[180px] flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="w-full h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="w-full h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const numericBenchmark = parseFloat(String(benchmark).replace(/[^0-9.-]/g, ''));
  
  // Custom status logic based on API or fallback
  let isBetter = false;
  if (status) {
    isBetter = ['Good', 'Strong', 'Healthy', 'Excellent'].includes(status);
  } else {
    isBetter = numericValue >= numericBenchmark;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:border-indigo-500/30 transition-all group relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isBetter ? "bg-emerald-500/10" : "bg-rose-500/10"
          )}>
            <Target className={cn(
              "w-4 h-4",
              isBetter ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )} />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{title}</p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
          isBetter ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        )}>
          {isBetter ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {status ? status.toUpperCase() : (isBetter ? 'ABOVE' : 'BELOW')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Current</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 group-hover:border-indigo-500/30 transition-colors relative cursor-help">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">{benchmarkType}</p>
          </div>
          <p className="text-base font-bold text-indigo-900 dark:text-indigo-100 truncate">{benchmark}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
          <span>Performance vs Target</span>
          <span>{numericBenchmark ? Math.round((numericValue / numericBenchmark) * 100) : 100}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${numericBenchmark ? Math.min(100, (numericValue / numericBenchmark) * 100) : 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isBetter ? "bg-emerald-500" : "bg-amber-500"
            )}
          />
        </div>
      </div>

      {details && Object.keys(details).length > 0 && (
        <div className="absolute opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 dark:bg-black border border-zinc-800 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-zinc-300 mb-2 border-b border-zinc-800 pb-1">Detailed Breakdown</p>
          <div className="space-y-1.5">
            {Object.entries(details).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-zinc-300 font-bold">{typeof val === 'number' && val > 1000 ? (val / 1000000).toFixed(2) + 'M' : val as React.ReactNode}</span>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 dark:bg-black border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}
    </motion.div>
  );
}
