'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RatioCard } from '@/components/Dashboard/RatioCard';
import { RevenueTrendChart, CostBreakupChart } from '@/components/Dashboard/Charts';
import { motion } from 'motion/react';
import { Wallet, Zap, Package, UserCircle, TrendingUp, Loader2 } from 'lucide-react';
import { MOCK_FINANCIAL_DATA } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  // Fallback to Home & Lifestyle if LOB data doesn't exist for the selected year
  const currentData = MOCK_FINANCIAL_DATA[selectedLOB]?.[selectedYear] || MOCK_FINANCIAL_DATA['Home & Lifestyle'][selectedYear];

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
          {/* Top Metrics Grid */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Financial Overview 
              {selectedYear === '2026' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  YTD PERFORMANCE
                </span>
              )}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard 
              title="Revenue" 
              actual={`${currentData.revenue.actual}M`} 
              forecasted={`${currentData.revenue.forecasted}M`} 
              change={currentData.revenue.change} 
            />
            <MetricCard 
              title="Gross Profit" 
              actual={`${currentData.grossProfit.actual}M`} 
              forecasted={`${currentData.grossProfit.forecasted}M`} 
              change={currentData.grossProfit.change} 
            />
            <MetricCard 
              title="EBIT" 
              actual={`${currentData.ebit.actual}M`} 
              forecasted={`${currentData.ebit.forecasted}M`} 
              change={currentData.ebit.change} 
            />
            <MetricCard 
              title="EBIT %" 
              actual={currentData.ebitPercent.actual.toString()} 
              forecasted={currentData.ebitPercent.forecasted.toString()} 
              change={currentData.ebitPercent.change} 
              prefix="" 
              suffix="%" 
            />
            <MetricCard 
              title="Op Ex" 
              actual={`${currentData.opEx.actual}M`} 
              forecasted={`${currentData.opEx.forecasted}M`} 
              change={currentData.opEx.change} 
            />
            <MetricCard 
              title="Net Income" 
              actual={`${currentData.netIncome.actual}M`} 
              forecasted={`${currentData.netIncome.forecasted}M`} 
              change={currentData.netIncome.change} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Ratios & Trends */}
            <div className="xl:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatioCard 
                  title="EVA" 
                  value={currentData.eva.toString()} 
                  benchmark="1.15" 
                  benchmarkType="Industry" 
                />
                <RatioCard 
                  title="ROA" 
                  value={`${currentData.roa}%`} 
                  benchmark="12.8%" 
                  benchmarkType="Industry" 
                />
                <RatioCard 
                  title="ROE" 
                  value={`${currentData.roe}%`} 
                  benchmark="20.1%" 
                  benchmarkType="Industry" 
                />
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Revenue Trend</h3>
                    <p className="text-xs text-zinc-500 font-medium">Projected vs Actual performance over 7 years</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">ACTUAL</span>
                    </div>
                  </div>
                </div>
                <RevenueTrendChart />
              </motion.div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">Cost Break-up</h3>
                <p className="text-xs text-zinc-500 font-medium mb-6">Distribution across operational sectors</p>
                <CostBreakupChart />
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <p className="text-[10px] font-bold text-zinc-500 mb-2 uppercase">Fixed Cost</p>
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white">
                        RENT <Wallet className="w-3 h-3 text-zinc-400" />
                      </button>
                      <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white">
                        UTILITIES <Zap className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <p className="text-[10px] font-bold text-zinc-500 mb-2 uppercase">Variable Cost</p>
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white">
                        MATERIAL <Package className="w-3 h-3 text-zinc-400" />
                      </button>
                      <button className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white">
                        WAGES <UserCircle className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden group shadow-lg shadow-indigo-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-32 h-32" />
                </div>
                <h4 className="text-xl font-bold mb-2 relative z-10">Smart Forecasting</h4>
                <p className="text-sm text-indigo-100 mb-6 relative z-10 opacity-80">AI-driven financial projections based on historical data and market trends.</p>
                <button 
                  onClick={() => {
                    const btn = document.getElementById('gen-report-btn');
                    if (btn) {
                      btn.innerText = 'Generating...';
                      setTimeout(() => {
                        btn.innerText = 'Report Generated!';
                        setTimeout(() => btn.innerText = 'Generate Report', 2000);
                      }, 1500);
                    }
                  }}
                  id="gen-report-btn"
                  className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors relative z-10"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
