'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Filter, 
  Activity, 
  Layers, 
  ChevronDown,
  Info,
  Calendar,
  Clock,
  Scale,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LOB_OPTIONS = ['ALL', 'LOB 1', 'LOB 2'];
const YEAR_OPTIONS = ['2023', '2022', '2021', '2024', '2025', '2026'];
const BASE_CASH_SERIES = [102, 114, 117, 152, 122, 128, 154, 132, 134, 158, 144, 148];

interface BenchmarksConfig {
  currentRatio: {
    Industry: number;
    'Competitor 1': number;
    'Competitor 2': number;
  };
  quickRatio: {
    Industry: number;
    'Competitor 1': number;
    'Competitor 2': number;
  };
  ccc: {
    Industry: number;
    'Competitor 1': number;
    'Competitor 2': number;
  };
}

const benchmarksConfig: BenchmarksConfig = {
  currentRatio: {
    Industry: 1.5,
    'Competitor 1': 1.7,
    'Competitor 2': 1.4,
  },
  quickRatio: {
    Industry: 1.0,
    'Competitor 1': 1.1,
    'Competitor 2': 0.9,
  },
  ccc: {
    Industry: 42,
    'Competitor 1': 45,
    'Competitor 2': 38,
  }
};

export default function WorkingCapitalPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedLOB, setSelectedLOB] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('Dec');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Benchmarking states
  const [currentRatioBenchmark, setCurrentRatioBenchmark] = useState<'Industry' | 'Competitor 1' | 'Competitor 2'>('Industry');
  const [quickRatioBenchmark, setQuickRatioBenchmark] = useState<'Industry' | 'Competitor 1' | 'Competitor 2'>('Industry');
  const [cccBenchmark, setCccBenchmark] = useState<'Industry' | 'Competitor 1' | 'Competitor 2'>('Industry');

  // Handle start/end month sequence correction
  const handleStartMonthChange = (val: string) => {
    setStartMonth(val);
    const startIdx = MONTHS.indexOf(val);
    const endIdx = MONTHS.indexOf(endMonth);
    if (startIdx > endIdx) {
      setEndMonth(val);
    }
  };

  const handleEndMonthChange = (val: string) => {
    setEndMonth(val);
    const startIdx = MONTHS.indexOf(startMonth);
    const endIdx = MONTHS.indexOf(val);
    if (endIdx < startIdx) {
      setStartMonth(val);
    }
  };

  // Dynamic calculations representing the numbers under clean state management
  const numbers = useMemo(() => {
    const yearFactors: { [key: string]: number } = {
      '2021': 0.85,
      '2022': 0.92,
      '2023': 1.0,
      '2024': 1.12,
      '2025': 1.25,
      '2026': 1.38
    };
    const lobFactors: { [key: string]: number } = {
      'ALL': 1.0,
      'LOB 1': 0.62,
      'LOB 2': 0.38
    };

    const yFactor = yearFactors[selectedYear] || 1.0;
    const lFactor = lobFactors[selectedLOB] || 1.0;
    const factor = yFactor * lFactor;

    // Use current ending month to influence balance sheet numbers dynamically
    const endIdx = MONTHS.indexOf(endMonth);
    const mFactor = 1 + (endIdx - 5) * 0.015;

    const baseCash = 34000;
    const baseAR = 59000;
    const baseInv = 31000;
    const basePrepaid = 5000;

    const baseAP = 25000;
    const baseCC = 2000;
    const baseCredit = 27000;
    const baseAccrued = 9000;
    const baseTaxes = 5000;

    const cash = Math.round(baseCash * factor * mFactor);
    const ar = Math.round(baseAR * factor * (1 + (6 - endIdx) * 0.01));
    const inv = Math.round(baseInv * factor * (1 + (endIdx - 3) * 0.008));
    const prepaid = Math.round(basePrepaid * factor);

    const ap = Math.round(baseAP * factor * mFactor);
    const cc = Math.round(baseCC * factor * (1 + (2 - (endIdx % 3)) * 0.03));
    const credit = Math.round(baseCredit * factor);
    const accrued = Math.round(baseAccrued * factor * (1 + (endIdx % 2) * 0.02));
    const taxes = Math.round(baseTaxes * factor);

    const totalAssets = cash + ar + inv + prepaid;
    const totalLiabilities = ap + cc + credit + accrued + taxes;
    const workingCapital = totalAssets - totalLiabilities;
    const currentRatio = parseFloat((totalAssets / totalLiabilities).toFixed(1));
    const quickRatio = parseFloat(((cash + ar) / totalLiabilities).toFixed(2));

    const dso = Math.round(38 * (selectedLOB === 'LOB 2' ? 0.9 : 1.05) * yFactor);
    const dio = Math.round(48 * (selectedLOB === 'LOB 1' ? 1.1 : 0.95) * yFactor);
    const dpo = Math.round(42 * yFactor);
    const ccc = dso + dio - dpo;

    return {
      cash, ar, inv, prepaid, totalAssets,
      ap, cc, credit, accrued, taxes, totalLiabilities,
      workingCapital, currentRatio, quickRatio,
      dso, dio, dpo, ccc
    };
  }, [selectedLOB, selectedYear, endMonth]);

  // Monthly cash trend generator with responsive scaling
  const cashBalanceData = useMemo(() => {
    const yearFactors: { [key: string]: number } = {
      '2021': 0.88,
      '2022': 0.94,
      '2023': 1.0,
      '2024': 1.10,
      '2025': 1.20,
      '2026': 1.30
    };
    const lobFactors: { [key: string]: number } = {
      'ALL': 1.0,
      'LOB 1': 0.60,
      'LOB 2': 0.40
    };
    const factor = (yearFactors[selectedYear] || 1.0) * (lobFactors[selectedLOB] || 1.0);

    const startIdx = MONTHS.indexOf(startMonth);
    const endIdx = MONTHS.indexOf(endMonth);

    return MONTHS.map((m, i) => {
      const baseValue = BASE_CASH_SERIES[i];
      const yearMultiplier = 1 + (parseInt(selectedYear) - 2021) * 0.01;
      const value = parseFloat((baseValue * factor * yearMultiplier).toFixed(1));
      
      const inRange = i >= startIdx && i <= endIdx;

      return {
        month: m,
        value,
        inRange
      };
    });
  }, [selectedLOB, selectedYear, startMonth, endMonth]);

  // Cash to cash series
  const cashCycleSeries = useMemo(() => {
    const bases = [
      { year: '2022', dso: 35, dio: 45, dpo: 40 },
      { year: '2023', dso: 38, dio: 48, dpo: 42 },
      { year: '2024', dso: 40, dio: 50, dpo: 44 },
      { year: '2025', dso: 42, dio: 52, dpo: 45 },
      { year: '2026', dso: 45, dio: 55, dpo: 48 }
    ];

    const lobMultiplier = selectedLOB === 'ALL' ? 1.0 : selectedLOB === 'LOB 1' ? 0.92 : 1.08;

    return bases.map(item => ({
      year: item.year,
      DSO: Math.round(item.dso * lobMultiplier),
      DIO: Math.round(item.dio * lobMultiplier),
      DPO: Math.round(item.dpo * lobMultiplier)
    }));
  }, [selectedLOB]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Evaluate KPI states for visual alerts
  const currentRatioTarget = benchmarksConfig.currentRatio[currentRatioBenchmark];
  const isCurrentRatioOptimal = numbers.currentRatio >= currentRatioTarget;

  const quickRatioTarget = benchmarksConfig.quickRatio[quickRatioBenchmark];
  const isQuickRatioOptimal = numbers.quickRatio >= quickRatioTarget;

  const cccTarget = benchmarksConfig.ccc[cccBenchmark];
  // For cash conversion cycle, a lower lifecycle represents better efficiency
  const isCccOptimal = numbers.ccc <= cccTarget;

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Verifying Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear}
          selectedLOB={selectedLOB === 'ALL' ? 'Home & Lifestyle' : selectedLOB}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div id="working-capital-viewport" className="p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Liquidity & Cash
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Working Capital</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                AI-guided balance sheet analysis, key credit indexes, and cash conversion models.
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm self-start md:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                FY Cumulative through {endMonth}
              </span>
            </div>
          </div>

          {/* Premium Filter Control Panel */}
          <div id="filter-panel" className="p-5 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/85 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
            
            {/* LOB Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Line of Business
              </span>
              <div className="relative">
                <select 
                  value={selectedLOB}
                  onChange={(e) => setSelectedLOB(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-850 transition-all text-xs font-bold outline-none pr-9"
                >
                  {LOB_OPTIONS.map(lob => (
                    <option key={lob} value={lob}>{lob === 'ALL' ? 'All Lines (Combined)' : lob}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Financial Year
              </span>
              <div className="relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-850 transition-all text-xs font-bold outline-none pr-9"
                >
                  {YEAR_OPTIONS.map(y => (
                    <option key={y} value={y}>FY {y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
              </div>
            </div>

            {/* Starting Month Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Starting Period
              </span>
              <div className="relative">
                <select 
                  value={startMonth}
                  onChange={(e) => handleStartMonthChange(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-850 transition-all text-xs font-bold outline-none pr-9"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
              </div>
            </div>

            {/* Ending Month Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Ending Period
              </span>
              <div className="relative">
                <select 
                  value={endMonth}
                  onChange={(e) => handleEndMonthChange(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-850 transition-all text-xs font-bold outline-none pr-9"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Premium Overview Section with 3 Column KPIs structured like the main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* KPI Card 1: Current Ratio */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              id="kpi-current-ratio"
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group relative"
            >
              {/* Card Header Selector Embedded cleanly as in dynamic designs */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                    isCurrentRatioOptimal ? "bg-emerald-500/10" : "bg-amber-500/10"
                  )}>
                    <Scale className={cn(
                      "w-4 h-4",
                      isCurrentRatioOptimal ? "text-emerald-500" : "text-amber-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Current Ratio</h3>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      {isCurrentRatioOptimal ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Target Met
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Lower Cover
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Subtly designed inline custom benchmark selector */}
                <div className="relative">
                  <select 
                    value={currentRatioBenchmark}
                    onChange={(e) => setCurrentRatioBenchmark(e.target.value as any)}
                    className="appearance-none pl-3 pr-7 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 hover:bg-zinc-100 transition-colors text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="Industry">vs Industry</option>
                    <option value="Competitor 1">vs Comp 1</option>
                    <option value="Competitor 2">vs Comp 2</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Large Actual and Target comparative values */}
              <div className="grid grid-cols-2 gap-4 items-end mb-5">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-155 dark:border-zinc-800">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mb-0.5">Actual Value</p>
                  <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono">
                    {numbers.currentRatio}x
                  </p>
                </div>
                <div className="p-3.5 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.02] rounded-2xl border border-indigo-100/40 dark:border-indigo-900/40">
                  <p className="text-[9px] text-indigo-500 font-bold uppercase mb-0.5">Target Cap</p>
                  <p className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                    {currentRatioTarget}x
                  </p>
                </div>
              </div>

              {/* Sliding target comparator metric */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Target Fulfillment</span>
                  <span className={isCurrentRatioOptimal ? "text-emerald-500" : "text-amber-500"}>
                    {Math.round((numbers.currentRatio / currentRatioTarget) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (numbers.currentRatio / currentRatioTarget) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      isCurrentRatioOptimal ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* KPI Card 2: Quick Ratio */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -3 }}
              id="kpi-quick-ratio"
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                    isQuickRatioOptimal ? "bg-emerald-500/10" : "bg-amber-500/10"
                  )}>
                    <Activity className={cn(
                      "w-4 h-4",
                      isQuickRatioOptimal ? "text-emerald-500" : "text-amber-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Quick Ratio</h3>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      {isQuickRatioOptimal ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Target Met
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Lower Buffer
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={quickRatioBenchmark}
                    onChange={(e) => setQuickRatioBenchmark(e.target.value as any)}
                    className="appearance-none pl-3 pr-7 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 hover:bg-zinc-100 transition-colors text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="Industry">vs Industry</option>
                    <option value="Competitor 1">vs Comp 1</option>
                    <option value="Competitor 2">vs Comp 2</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end mb-5">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-155 dark:border-zinc-800">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mb-0.5">Actual (Acid)</p>
                  <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono">
                    {numbers.quickRatio}x
                  </p>
                </div>
                <div className="p-3.5 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.02] rounded-2xl border border-indigo-100/40 dark:border-indigo-900/40">
                  <p className="text-[9px] text-indigo-500 font-bold uppercase mb-0.5">Target Requirement</p>
                  <p className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                    {quickRatioTarget}x
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Target Fulfillment</span>
                  <span className={isQuickRatioOptimal ? "text-emerald-500" : "text-amber-500"}>
                    {Math.round((numbers.quickRatio / quickRatioTarget) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (numbers.quickRatio / quickRatioTarget) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      isQuickRatioOptimal ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* KPI Card 3: CCC */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -3 }}
              id="kpi-ccc"
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group relative"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                    isCccOptimal ? "bg-emerald-500/10" : "bg-rose-500/10"
                  )}>
                    <Clock className={cn(
                      "w-4 h-4",
                      isCccOptimal ? "text-emerald-500" : "text-rose-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Cash Conversion Cycle</h3>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      {isCccOptimal ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Optimum Speed
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Cycle Lag Warning
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={cccBenchmark}
                    onChange={(e) => setCccBenchmark(e.target.value as any)}
                    className="appearance-none pl-3 pr-7 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 hover:bg-zinc-100 transition-colors text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="Industry">vs Industry</option>
                    <option value="Competitor 1">vs Comp 1</option>
                    <option value="Competitor 2">vs Comp 2</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end mb-5">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-155 dark:border-zinc-800">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mb-0.5">Actual Lifecycle</p>
                  <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono">
                    {numbers.ccc}d
                  </p>
                </div>
                <div className="p-3.5 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.02] rounded-2xl border border-indigo-100/40 dark:border-indigo-900/40">
                  <p className="text-[9px] text-indigo-500 font-bold uppercase mb-0.5">Benchmark Threshold</p>
                  <p className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                    {cccTarget}d
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Cycle Efficiency Index</span>
                  <span className={isCccOptimal ? "text-emerald-500" : "text-rose-500"}>
                    {isCccOptimal ? 'Highly Active' : 'Slower Conversion'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (cccTarget / numbers.ccc) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full-right",
                      isCccOptimal ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Balanced Sheet Sections & Analytical Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: Bento-driven Asset and Liability Statement (Span 7 for prominent layout) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              id="statement-bento"
              className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />
                    Asset-Liability Liquidity Statement
                  </h3>
                  <p className="text-xs text-zinc-400 font-semibold tracking-tight mt-0.5">
                    Real-time Balance Sheet snapshot derived of {selectedLOB === 'ALL' ? 'all combined sectors' : selectedLOB}.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  BASE: USD ($)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Assets Column */}
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/45 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Current Assets</p>
                      <p className="text-xl font-extrabold text-indigo-955 dark:text-indigo-300 font-mono">
                        ${formatNumber(numbers.totalAssets)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100/50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg font-mono">100%</span>
                  </div>

                  <ul className="text-xs space-y-3.5 px-1.5 pt-1">
                    <li className="group flex justify-between items-center transition-colors">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Cash Holdings</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Contribution</span>
                          <span className="font-mono text-indigo-500">{Math.round((numbers.cash / numbers.totalAssets) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.cash)}</span>
                    </li>

                    <li className="group flex justify-between items-center transition-colors">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Accounts Receivables</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Contribution</span>
                          <span className="font-mono text-indigo-500">{Math.round((numbers.ar / numbers.totalAssets) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.ar)}</span>
                    </li>

                    <li className="group flex justify-between items-center transition-colors">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Inventory Inventory</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Contribution</span>
                          <span className="font-mono text-indigo-500">{Math.round((numbers.inv / numbers.totalAssets) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.inv)}</span>
                    </li>

                    <li className="group flex justify-between items-center transition-colors">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Pre-paid Expenses</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Contribution</span>
                          <span className="font-mono text-indigo-500">{Math.round((numbers.prepaid / numbers.totalAssets) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.prepaid)}</span>
                    </li>

                  </ul>
                </div>

                {/* Liabilities Column */}
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/40 dark:border-rose-905/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-0.5">Current Liabilities</p>
                      <p className="text-xl font-extrabold text-rose-955 dark:text-rose-300 font-mono">
                        ${formatNumber(numbers.totalLiabilities)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-650 bg-rose-100/40 dark:bg-rose-900/30 px-2 py-0.5 rounded-lg font-mono">100%</span>
                  </div>

                  <ul className="text-xs space-y-3.5 px-1.5 pt-1">
                    <li className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Accounts Payable</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Liability share</span>
                          <span className="font-mono text-rose-500">{Math.round((numbers.ap / numbers.totalLiabilities) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.ap)}</span>
                    </li>

                    <li className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Credit Card Liabilities</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Liability share</span>
                          <span className="font-mono text-rose-500">{Math.round((numbers.cc / numbers.totalLiabilities) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.cc)}</span>
                    </li>

                    <li className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Bank Operating Credit</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Liability share</span>
                          <span className="font-mono text-rose-500">{Math.round((numbers.credit / numbers.totalLiabilities) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.credit)}</span>
                    </li>

                    <li className="flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Accrued Operational Costs</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Liability share</span>
                          <span className="font-mono text-rose-500">{Math.round((numbers.accrued / numbers.totalLiabilities) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.accrued)}</span>
                    </li>

                    <li className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px] block">Taxes Payable</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                          <span>Liability share</span>
                          <span className="font-mono text-rose-500">{Math.round((numbers.taxes / numbers.totalLiabilities) * 100)}%</span>
                        </div>
                      </div>
                      <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-sm">${formatNumber(numbers.taxes)}</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bento Footer Sheet displaying Working Capital net status */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Working Capital Score card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/[0.04] to-teal-500/[0.03] border border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">NET WORKING CAPITAL</p>
                      <p className="text-xl font-extrabold text-emerald-850 dark:text-emerald-300 font-mono">
                        ${formatNumber(numbers.workingCapital)}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded-lg tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> LIQUID
                    </div>
                  </div>

                  {/* Operational cover index */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">NET LIQUID COVER</p>
                      <p className="text-xl font-extrabold text-zinc-800 dark:text-zinc-200 font-mono">
                        {numbers.currentRatio}x Assets
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase py-1 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      Optimal Cover
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>

            {/* COLUMN 2: Analytical Visualizations (Span 5 for balanced right column structure) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Monthly Cash Balance bar chart Container */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Monthly Cash Balance
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    MUSD ($)
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-6 font-semibold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  Glow columns indicate active period ({startMonth} - {endMonth}) parameters.
                </p>

                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashBalanceData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cashGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.5} />
                        </linearGradient>
                        <linearGradient id="cashFade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-850" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
                        domain={[0, 180]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                        }}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 750, fontSize: '11px', textTransform: 'uppercase' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                        formatter={(value) => [`$${value}M`, 'Liquid Balance']}
                      />
                      <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {cashBalanceData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.inRange ? 'url(#cashGlow)' : 'url(#cashFade)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Cash to Cash Cycle stacked column chart Container */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
                    Cash-to-Cash Cycle Trend
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    DAYS (D)
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
                  DSO + DIO - DPO breakdown history
                </p>

                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashCycleSeries} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-850" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '12px' 
                        }}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 755, fontSize: '11px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                      <Legend 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '15px' }} 
                        formatter={(value) => <span className="text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">{value}</span>}
                      />
                      <Bar dataKey="DSO" stackId="a" fill="#6366f1" name="DSO (Sales Outstanding)" />
                      <Bar dataKey="DIO" stackId="a" fill="#f97316" name="DIO (Inv Outstanding)" />
                      <Bar dataKey="DPO" stackId="a" fill="#10b981" name="DPO (Pay Outstanding)" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
