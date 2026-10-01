import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  actual: string;
  forecasted?: string;
  change?: number | string;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
}

export function MetricCard({ title, actual, forecasted, change, prefix = "$", suffix = "", isLoading = false }: MetricCardProps) {
  const hasChange = change !== undefined && change !== null;
  let isPositive = false;
  if (hasChange) {
    if (typeof change === 'number') {
      isPositive = change > 0;
    } else {
      isPositive = !change.toString().startsWith('-');
    }
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="w-10 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        ) : hasChange ? (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
            isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive && typeof change === 'number' ? "+" : ""}{change}{typeof change === 'number' ? '%' : ''}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-zinc-500 font-medium mb-1">Actual</p>
          {isLoading ? (
            <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {prefix}{actual}{suffix}
            </p>
          )}
        </div>

        {forecasted !== undefined && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 font-medium mb-0.5">Forecasted</p>
              {isLoading ? (
                <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              ) : (
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {prefix}{forecasted}{suffix}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            ) : (
              <div className="w-12 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    parseFloat(actual.replace(/M|K|,/g, '')) >= parseFloat(forecasted.replace(/M|K|,/g, '')) ? "bg-emerald-500" : "bg-indigo-500"
                  )} 
                  style={{ width: `${Math.min(100, (parseFloat(actual.replace(/M|K|,/g, '')) / parseFloat(forecasted.replace(/M|K|,/g, ''))) * 100)}%` }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
