'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { IncomeExpenseChart, TrendLineChart } from '@/components/Dashboard/TrendsCharts';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
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
import { fetchWithRetry } from '@/lib/utils';

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
  const [selectedLOB] = useState('Home & Lifestyle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [ratioData, setRatioData] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const batchId = localStorage.getItem('upload_batch_id');
        const token = localStorage.getItem('auth_token');
        if (!batchId) throw new Error("No batch id");
        const headers = { 'Authorization': `Bearer ${token}` };
        const baseUrl = 'https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net';

        // 1. Fetch Years
        const yearsRes = await fetchWithRetry(`${baseUrl}/reporting/pnl/years?batch_id=${batchId}`, { headers }).catch(() => null);
        let years = ['2021', '2022', '2023', '2024', '2025'];
        if (yearsRes && yearsRes.ok) {
          const yearsData = await yearsRes.json();
          if (yearsData.success && yearsData.data?.length > 0) {
            years = yearsData.data.map((y: any) => String(y.value)).sort();
          }
        }

        // 2. Fetch LOBs (use first available)
        const lobsRes = await fetchWithRetry(`${baseUrl}/reporting/pnl/lobs?batch_id=${batchId}`, { headers }).catch(() => null);
        let lob = 'Australia';
        if (lobsRes && lobsRes.ok) {
          const lobsData = await lobsRes.json();
          if (lobsData.success && lobsData.data?.length > 0) {
            lob = String(lobsData.data[0].value);
          }
        }

        // 3. Fetch data for each year sequentially to avoid overwhelming the server
        const results = [];
        for (const year of years) {
          const [pnlRes, kpiRes] = await Promise.all([
            fetchWithRetry(`${baseUrl}/reporting/pnl/yearly-summary?batch_id=${batchId}&year=${year}&month_start=1&month_end=12&lob=${encodeURIComponent(lob)}`, { headers }).catch(() => null),
            fetchWithRetry(`${baseUrl}/reporting/kpi/monthly?batch_id=${batchId}&year=${year}&month_start=1&month_end=12&lob=${encodeURIComponent(lob)}`, { headers }).catch(() => null)
          ]);

          let pnlData = null;
          if (pnlRes && pnlRes.ok) {
            const data = await pnlRes.json();
            if (data.success) pnlData = data.data;
          }

          let kpiData = null;
          if (kpiRes && kpiRes.ok) {
            const data = await kpiRes.json();
            if (data.success) kpiData = data.data;
          }

          results.push({ year, pnlData, kpiData });
        }

        // 4. Map results to Chart Data formats
        const newIncomeExpense = results.map(({ year, pnlData }) => {
          const mockRef = MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[year];
          
          return {
            year,
            revenue: pnlData?.revenue ?? (mockRef ? mockRef.revenue.actual * 100000 : 0),
            grossProfit: pnlData?.gross_profit ?? (mockRef ? mockRef.grossProfit.actual * 100000 : 0),
            ebit: pnlData?.ebit ?? (mockRef ? mockRef.ebit.actual * 100000 : 0),
            netIncome: pnlData?.net_income ?? (mockRef ? mockRef.netIncome.actual * 100000 : 0),
          };
        });

        const newRatioData = results.map(({ year, kpiData }) => {
          const mockRef = MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[year];
          
          // Map KPI fields from API or fallback to 0 if mock doesn't exist
          return {
            year,
            eva: kpiData?.eva?.value ?? mockRef?.eva ?? 0,
            roa: kpiData?.roa?.value ?? mockRef?.roa ?? 0,
            roe: kpiData?.roe?.value ?? mockRef?.roe ?? 0,
            debtToEquity: kpiData?.debt_to_equity?.value ?? kpiData?.debtToEquity?.value ?? mockRef?.debtToEquity ?? 0,
            wcRatio: kpiData?.working_capital_ratio?.value ?? kpiData?.wc_ratio?.value ?? kpiData?.wcRatio?.value ?? mockRef?.wcRatio ?? 0,
            peRatio: kpiData?.pe_ratio?.value ?? kpiData?.peRatio?.value ?? mockRef?.peRatio ?? 0,
            berryRatio: kpiData?.berry_ratio?.value ?? kpiData?.berryRatio?.value ?? mockRef?.berryRatio ?? 0,
          };
        });

        setIncomeExpenseData(newIncomeExpense);
        setRatioData(newRatioData);
      } catch (e) {
        console.error("Trends data fetch error", e);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated || isDataLoading) {
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
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Financial Trends</h1>
                <p className="text-sm text-zinc-500 font-medium">Historical performance analysis and key financial ratios.</p>
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
