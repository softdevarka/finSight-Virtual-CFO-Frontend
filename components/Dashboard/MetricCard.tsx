import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  actual: string;
  forecasted: string;
  change: number;
  prefix?: string;
  suffix?: string;
}

export function MetricCard({ title, actual, forecasted, change, prefix = "$", suffix = "" }: MetricCardProps) {
  const isPositive = change > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
          isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? "+" : ""}{change}%
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-zinc-500 font-medium mb-1">Actual</p>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {prefix}{actual}{suffix}
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-medium mb-0.5">Forecasted</p>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {prefix}{forecasted}{suffix}
            </p>
          </div>
          <div className="w-12 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                parseFloat(actual) >= parseFloat(forecasted) ? "bg-emerald-500" : "bg-indigo-500"
              )} 
              style={{ width: `${Math.min(100, (parseFloat(actual) / parseFloat(forecasted)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
