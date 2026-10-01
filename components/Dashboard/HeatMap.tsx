'use client';

import React from 'react';
import { motion } from 'motion/react';

const grid = [
  [1.00, 0.39, 0.00, -0.27, -0.02, 0.30, -0.26, -0.20, -0.12, 0.12],
  [-0.39, 1.00, 0.09, -0.23, -0.62, 0.04, 0.03, 0.06, -0.12, 0.02],
  [0.00, 0.09, 1.00, -0.20, -0.09, -0.63, -0.33, -0.16, -0.38, 0.21],
  [-0.27, -0.23, -0.20, 1.00, 0.17, 0.08, 0.17, 1.00, -0.27, 0.02],
  [-0.02, -0.62, -0.09, 0.17, 1.00, 0.14, -0.00, -0.01, -0.02, 0.35],
  [0.30, 0.04, -0.63, 0.08, 0.14, 1.00, -0.14, -0.37, 0.17, 0.14],
  [-0.26, 0.03, -0.33, 0.17, -0.00, -0.14, 1.00, -0.01, 0.14, -0.32],
  [-0.20, 0.06, -0.16, 1.00, -0.01, -0.37, -0.01, 1.00, 0.39, 1.00],
  [-0.12, -0.12, -0.38, -0.27, -0.02, 0.17, 0.14, 0.39, 1.00, -0.45],
  [0.12, 0.02, 0.21, 0.02, 0.35, 0.14, -0.32, 1.00, -0.45, 1.00],
];

const getColor = (value: number) => {
  if (value >= 0.8) return 'bg-rose-600';
  if (value >= 0.4) return 'bg-rose-400';
  if (value >= 0) return 'bg-rose-200';
  if (value >= -0.2) return 'bg-indigo-100';
  if (value >= -0.4) return 'bg-indigo-300';
  return 'bg-indigo-500';
};

const getDarkColor = (value: number) => {
  if (value >= 0.8) return 'dark:bg-rose-900';
  if (value >= 0.4) return 'dark:bg-rose-700';
  if (value >= 0) return 'dark:bg-rose-500/30';
  if (value >= -0.2) return 'dark:bg-indigo-500/20';
  if (value >= -0.4) return 'dark:bg-indigo-700';
  return 'dark:bg-indigo-900';
};

interface HeatmapData {
  sl_columns: string[];
  ext_columns: string[];
  correlation: number[][];
}

export function InfluencerHeatMap({ data }: { data?: HeatmapData | null }) {
  if (!data) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[300px]">
        <span className="text-sm font-bold text-zinc-500">Run forecast to view heatmap</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-3 py-4 mt-6">
          {data.sl_columns.map((col, i) => (
            <div key={`y-${i}`} className="text-[9px] font-bold text-zinc-500 whitespace-nowrap h-[32px] flex items-center justify-end">
              {col}
            </div>
          ))}
        </div>
        
        {/* Grid and X-axis labels */}
        <div className="flex flex-col flex-1 min-w-[300px]">
          {/* X-axis labels */}
          <div className="grid grid-cols-6 gap-1 mb-2">
            {data.ext_columns.map((col, i) => (
              <div key={`x-${i}`} className="text-[9px] font-bold text-zinc-500 text-center truncate px-1">
                {col}
              </div>
            ))}
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-6 gap-1 w-full">
            {data.correlation.map((row, i) => 
              row.map((val, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i * 6 + j) * 0.005 }}
                  className={`w-full h-[32px] rounded flex items-center justify-center text-[10px] font-bold ${getColor(val)} ${getDarkColor(val)} text-zinc-900 dark:text-zinc-100 border border-white/10`}
                  title={`${data.sl_columns[i]} vs ${data.ext_columns[j]}: ${val.toFixed(4)}`}
                >
                  {val.toFixed(2)}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase px-2 mt-4 max-w-[400px] mx-auto w-full">
        <span>Negative</span>
        <div className="flex gap-1 h-2 flex-1 mx-4 rounded-full bg-gradient-to-r from-indigo-500 via-zinc-200 to-rose-600 dark:via-zinc-800" />
        <span>Positive</span>
      </div>
    </div>
  );
}
