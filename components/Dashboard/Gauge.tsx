import React from 'react';
import { motion } from 'motion/react';

interface GaugeProps {
  value: number;
  label: string;
  min?: number;
  max?: number;
  color?: string;
}

export function Gauge({ value, label, min = 0, max = 100 }: GaugeProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * (circumference / 2); // Semi-circle

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-20">
        <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 60">
          {/* Background Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-100 dark:text-zinc-800"
          />
          {/* Segments */}
          <path d="M 10 50 A 40 40 0 0 1 30 20" fill="none" stroke="#ef4444" strokeWidth="8" />
          <path d="M 30 20 A 40 40 0 0 1 70 20" fill="none" stroke="#eab308" strokeWidth="8" />
          <path d="M 70 20 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="8" />
          
          {/* Needle */}
          <motion.line
            initial={{ rotate: -90 }}
            animate={{ rotate: (value / max) * 180 - 90 }}
            transition={{ type: 'spring', stiffness: 50 }}
            x1="50" y1="50" x2="50" y2="15"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-900 dark:text-white origin-bottom"
            style={{ transformOrigin: '50px 50px' }}
          />
          <circle cx="50" cy="50" r="3" className="fill-zinc-900 dark:fill-white" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
