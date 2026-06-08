'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { IncomeExpenseChart, TrendLineChart } from '@/components/Dashboard/TrendsCharts';
import { motion } from 'motion/react';
import { 
  ChevronDown, 
  Filter, 
  Calendar, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { MOCK_FINANCIAL_DATA } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const chartConfigs = [
  { title: 'EVA', name: 'EVA', dataKey: 'eva', color: '#6366f1', suffix: '' },
  { title: 'ROA', name: 'ROA', dataKey: 'roa', color: '#0ea5e9', suffix: '%' },
  { title: 'ROE', name: 'ROE', dataKey: 'roe', color: '#8b5cf6', suffix: '%' },
  { title: 'Debt to Equity', name: 'Debt to Equity', dataKey: 'debtToEquity', color: '#f43f5e', suffix: '' },
  { title: 'WC Ratio', name: 'WC Ratio', dataKey: 'wcRatio', color: '#10b981', suffix: '' },
  { title: 'P/E ratio', name: 'P/E ratio', dataKey: 'peRatio', color: '#f59e0b', suffix: '' },
  { title: 'Berry Ratio', name: 'Berry Ratio', dataKey: 'berryRatio', color: '#ec4899', suffix: '' },
];

export default function TrendsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('Dec');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const incomeExpenseData = useMemo(() => {
    const years = ['2023', '2024', '2025', '2026'];
    return years.map(year => {
      const data = MOCK_FINANCIAL_DATA[selectedLOB]?.[year] || MOCK_FINANCIAL_DATA['Home & Lifestyle'][year];
      return {
        year,
        revenue: data.revenue.actual * 100000, // scaled for chart
        grossProfit: data.grossProfit.actual * 100000,
        ebit: data.ebit.actual * 100000,
        netIncome: data.netIncome.actual * 100000,
      };
    });
  }, [selectedLOB]);

  const ratioData = useMemo(() => {
    const years = ['2023', '2024', '2025', '2026'];
    return years.map(year => {
      const data = MOCK_FINANCIAL_DATA[selectedLOB]?.[year] || MOCK_FINANCIAL_DATA['Home & Lifestyle'][year];
      return {
        year,
        eva: data.eva,
        roa: data.roa,
        roe: data.roe,
        debtToEquity: data.debtToEquity,
        wcRatio: data.wcRatio,
        peRatio: data.peRatio,
        berryRatio: data.berryRatio,
      };
    });
  }, [selectedLOB]);

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
    <div className="flex min-h-screen bg-white dark:bg-[#09090b] transition-colors">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear}
          selectedLOB={selectedLOB}
          onLOBChange={setSelectedLOB}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Page Header & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Financial Trends</h1>
              <p className="text-sm text-zinc-500 font-medium">Historical performance analysis and key financial ratios.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">LOB</span>
                <select 
                  value={selectedLOB}
                  onChange={(e) => setSelectedLOB(e.target.value)}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-bold outline-none min-w-[120px]"
                >
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Year</span>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-bold outline-none min-w-[120px]"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Starting month</span>
                <select 
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-bold outline-none min-w-[120px]"
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Ending month</span>
                <select 
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-bold outline-none min-w-[120px]"
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-transparent uppercase tracking-wider px-1">Action</span>
                <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Income and Expense (Large Card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-12 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Income and Expense</h3>
                  <p className="text-xs text-zinc-500 font-medium tracking-tight">Revenue, Gross Profit, EBIT, and Net Income trends</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+12.4% YoY</span>
                  </div>
                </div>
              </div>
              <IncomeExpenseChart data={incomeExpenseData} />
            </motion.div>

            {/* Ratio Charts Grid */}
            {chartConfigs.map((config, i) => (
              <motion.div 
                key={config.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="xl:col-span-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{config.title}</h3>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
                <TrendLineChart {...config} data={ratioData} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
