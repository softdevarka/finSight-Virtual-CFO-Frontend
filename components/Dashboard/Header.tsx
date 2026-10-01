'use client';

import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, Filter, Sun, Moon, Menu, X, Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string | number;
}

interface HeaderProps {
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedLOB?: string;
  onLOBChange?: (lob: string) => void;
  selectedMonthStart?: string;
  onMonthStartChange?: (month: string) => void;
  selectedMonthEnd?: string;
  onMonthEndChange?: (month: string) => void;
  onApplyFilters?: () => void;
  isApplyingFilters?: boolean;
  availableYears?: FilterOption[];
  availableLOBs?: FilterOption[];
  isSidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export function Header({ 
  selectedYear = '2025', 
  onYearChange, 
  selectedLOB = 'All LOBs', 
  onLOBChange,
  selectedMonthStart = '1',
  onMonthStartChange,
  selectedMonthEnd = '12',
  onMonthEndChange,
  onApplyFilters,
  isApplyingFilters = false,
  availableYears = [],
  availableLOBs = [],
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

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-0">
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={(e) => onYearChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              {availableYears.length > 0 ? (
                availableYears.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))
              ) : (
                <option value="2026">FY 2026</option>
              )}
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={selectedLOB}
              onChange={(e) => onLOBChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              {availableLOBs.length > 0 ? (
                availableLOBs.map(lob => (
                  <option key={lob.value} value={lob.value}>{lob.label}</option>
                ))
              ) : (
                <option value="Home & Lifestyle">Home & Lifestyle</option>
              )}
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>

          <div className="relative group hidden lg:block">
            <select 
              value={selectedMonthStart}
              onChange={(e) => onMonthStartChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>

          <span className="text-xs font-semibold text-zinc-400 hidden lg:block">-</span>

          <div className="relative group hidden lg:block">
            <select 
              value={selectedMonthEnd}
              onChange={(e) => onMonthEndChange?.(e.target.value)}
              className="appearance-none flex items-center gap-2 px-2 md:px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-[10px] md:text-xs font-medium pr-6 md:pr-8 outline-none"
            >
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
          </div>

          <button 
            onClick={onApplyFilters}
            disabled={isApplyingFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] md:text-xs font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed ml-1"
          >
            {isApplyingFilters ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Filter className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">APPLY</span>
          </button>
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
