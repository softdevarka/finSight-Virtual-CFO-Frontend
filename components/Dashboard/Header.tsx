'use client';

import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, Filter, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface HeaderProps {
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedLOB?: string;
  onLOBChange?: (lob: string) => void;
  isSidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export function Header({ 
  selectedYear = '2025', 
  onYearChange, 
  selectedLOB = 'All LOBs', 
  onLOBChange,
  isSidebarOpen,
  onSidebarToggle
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onSidebarToggle}
          className="p-2 md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search analytics..." 
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-sm w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-zinc-900 dark:text-white"
          />
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={(e) => onYearChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              <option value="2023">FY 2023</option>
              <option value="2024">FY 2024</option>
              <option value="2025">FY 2025</option>
              <option value="2026">FY 2026</option>
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={selectedLOB}
              onChange={(e) => onLOBChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              <option value="Home & Lifestyle">Home & Lifestyle</option>
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all relative hidden md:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-[#09090b]" />
        </button>
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 md:mx-2 hidden md:block" />
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] md:text-xs font-semibold">Alex Rivera</p>
            <p className="text-[8px] md:text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Live Tracking</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}
