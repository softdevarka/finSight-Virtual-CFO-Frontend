import React from 'react';
import { ChevronDown, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RatioCardProps {
  title: string;
  value: string;
  benchmark: string;
  benchmarkType: string;
}

export function RatioCard({ title, value, benchmark, benchmarkType }: RatioCardProps) {
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const numericBenchmark = parseFloat(benchmark.replace(/[^0-9.-]/g, ''));
  
  // For most financial ratios, higher is better (EVA, ROA, ROE)
  const isBetter = numericValue >= numericBenchmark;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:border-indigo-500/30 transition-all group"
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
          {isBetter ? 'ABOVE' : 'BELOW'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Current</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">{benchmarkType}</p>
          </div>
          <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{benchmark}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
          <span>Performance vs Target</span>
          <span>{Math.round((numericValue / numericBenchmark) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (numericValue / numericBenchmark) * 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isBetter ? "bg-emerald-500" : "bg-amber-500"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
