'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RatioCard } from '@/components/Dashboard/RatioCard';
import { RevenueTrendChart, CostBreakupChart } from '@/components/Dashboard/Charts';
import { motion } from 'motion/react';
import { Wallet, Zap, Package, UserCircle, TrendingUp, Loader2 } from 'lucide-react';
import { MOCK_FINANCIAL_DATA } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { fetchWithRetry } from '@/lib/utils';

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [availableYears, setAvailableYears] = useState<{ label: string, value: string | number }[]>([]);
  const [availableLOBs, setAvailableLOBs] = useState<{ label: string, value: string | number }[]>([]);

  const [selectedMonthStart, setSelectedMonthStart] = useState('1');
  const [selectedMonthEnd, setSelectedMonthEnd] = useState('12');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // Hold the merged data (real actuals + mock forecasts)
  const [dashboardData, setDashboardData] = useState<any>(null);

  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const fetchFilters = async () => {
      const batchId = localStorage.getItem('upload_batch_id');
      if (!batchId) return;

      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [yearsRes, lobsRes] = await Promise.all([
          fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/pnl/years?batch_id=${batchId}`, { headers }),
          fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/pnl/lobs?batch_id=${batchId}`, { headers })
        ]);

        if (yearsRes.ok) {
          const yearsData = await yearsRes.json();
          if (yearsData.success && yearsData.data?.length > 0) {
            setAvailableYears(yearsData.data);
            setSelectedYear(String(yearsData.data[0].value));
          }
        }

        if (lobsRes.ok) {
          const lobsData = await lobsRes.json();
          if (lobsData.success && lobsData.data?.length > 0) {
            setAvailableLOBs(lobsData.data);
            setSelectedLOB(String(lobsData.data[0].value));
          }
        }
      } catch (err) {
        console.error('Failed to fetch filters:', err);
      }
    };

    fetchFilters();
  }, [isAuthenticated, loading]);

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    const batchId = localStorage.getItem('upload_batch_id');
    const token = localStorage.getItem('auth_token');

    if (!batchId || !token) {
      alert("Missing batch ID or authentication token.");
      setIsApplyingFilters(false);
      return;
    }

    try {
      const predStart = `${selectedYear}-${String(selectedMonthStart).padStart(2, '0')}-01`;
      const endDay = new Date(Number(selectedYear), Number(selectedMonthEnd), 0).getDate();
      const predEnd = `${selectedYear}-${String(selectedMonthEnd).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

      const [response, forecastResponse, expenseResponse, kpiResponse] = await Promise.all([
        fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/pnl/yearly-summary?batch_id=${batchId}&year=${selectedYear}&lob=${encodeURIComponent(selectedLOB)}&month_start=${selectedMonthStart}&month_end=${selectedMonthEnd}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => { console.error("PnL API Error:", err); return { ok: false } as Response; }),
        
        fetchWithRetry(`https://virtual-cfo-ml-ewgafqanc3f7hfft.centralindia-01.azurewebsites.net/predict/from-batch/1?prediction_start=${predStart}&prediction_end=${predEnd}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            batch_id: Number(batchId),
            CCI: 95,
            CPI: 3.2,
            Oil: 57.26,
            GDP: 731.418,
            Unemployment: 4.1,
            ROI: 3.6
          })
        }).catch(err => { console.error("Forecast API Error:", err); return { ok: false } as Response; }),

        fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/expense-breakdown/expense-breakdown-monthly?batch_id=${batchId}&year=${selectedYear}&month_start=${selectedMonthStart}&month_end=${selectedMonthEnd}&lob=${encodeURIComponent(selectedLOB)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => { console.error("Expense API Error:", err); return { ok: false } as Response; }),

        fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/kpi/monthly?batch_id=${batchId}&year=${selectedYear}&month_start=${selectedMonthStart}&month_end=${selectedMonthEnd}&lob=${encodeURIComponent(selectedLOB)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => { console.error("KPI API Error:", err); return { ok: false } as Response; })
      ]);

      if (response.ok) {
        const resData = await response.json();
        let forecastData = null;
        if (forecastResponse.ok) {
          try {
            forecastData = await forecastResponse.json();
          } catch (e) {
            console.error('Error parsing forecast data', e);
          }
        }
        
        let expenseBreakdownData = null;
        if (expenseResponse.ok) {
          try {
            const expData = await expenseResponse.json();
            if (expData.success && expData.data) {
              const EXPENSE_COLORS: Record<string, string> = {
                'COGS': '#6366f1',
                'SG&A': '#a855f7',
                'D&A': '#8b5cf6',
                'Income Tax': '#f43f5e',
                'Unusual': '#d946ef',
                'Interest': '#ec4899'
              };
              expenseBreakdownData = expData.data.map((item: any, idx: number) => ({
                name: item.expense_head,
                value: item.percent_expense,
                color: EXPENSE_COLORS[item.expense_head] || ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'][idx % 6]
              }));
            }
          } catch (e) {
            console.error('Error parsing expense data', e);
          }
        }
        
        let kpiData = null;
        if (kpiResponse.ok) {
          try {
            const kData = await kpiResponse.json();
            if (kData.success && kData.data) {
              kpiData = kData.data;
            }
          } catch (e) {
            console.error('Error parsing KPI data', e);
          }
        }

        if (resData.success && resData.data) {
          // Format values (divide by 1M and fix to 2 decimals)
          const formatToM = (val: number) => (val / 1000000).toFixed(2);

          // Pull static mock forecasted values
          const mockRef = MOCK_FINANCIAL_DATA[selectedLOB]?.[selectedYear]
            || MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[selectedYear]
            || MOCK_FINANCIAL_DATA['Home & Lifestyle']['2026'];

          // Dynamic forecasts if available
          let revForecasted: string | number = mockRef.revenue.forecasted;
          let revChange: string | number = mockRef.revenue.change;
          let gpForecasted: string | number = mockRef.grossProfit.forecasted;
          let gpChange: string | number = mockRef.grossProfit.change;
          
          let ebitForecasted: string | number = mockRef.ebit.forecasted;
          let ebitChange: string | number = mockRef.ebit.change;
          let ebitPctForecasted: string | number = mockRef.ebitPercent.forecasted;
          let ebitPctChange: string | number = mockRef.ebitPercent.change;
          
          let opexForecasted: string | number = mockRef.opEx.forecasted;
          let opexChange: string | number = mockRef.opEx.change;
          
          let niForecasted: string | number = mockRef.netIncome.forecasted;
          let niChange: string | number = mockRef.netIncome.change;

          const calcChange = (actual: number, pred: number) => {
            if (!pred || pred === 0) return "+0.0%";
            const pct = ((actual - pred) / Math.abs(pred)) * 100;
            return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
          };

          if (forecastData && forecastData.summary) {
            const predRev = forecastData.summary.gross_predicted_revenue;
            const predGp = forecastData.summary.total_predicted_gross_profit;

            if (predRev) {
              revForecasted = formatToM(predRev);
              revChange = calcChange(resData.data.revenue, predRev);
            }
            if (predGp) {
              gpForecasted = formatToM(predGp);
              gpChange = calcChange(resData.data.gross_profit, predGp);
            }

            // Infer remaining metrics mathematically if base predictors exist
            if (predRev && predGp && resData.data.revenue > 0) {
              const actualRev = resData.data.revenue;
              const actualEbit = resData.data.ebit;
              const actualOpex = resData.data.opex;
              const actualNi = resData.data.net_income;

              // OpEx = Revenue * (Actual OpEx / Actual Revenue)
              const predOpex = predRev * (actualOpex / actualRev);
              opexForecasted = formatToM(predOpex);
              opexChange = calcChange(actualOpex, predOpex);

              // EBIT = Gross Profit - OpEx
              const predEbit = predGp - predOpex;
              ebitForecasted = formatToM(predEbit);
              ebitChange = calcChange(actualEbit, predEbit);

              // EBIT % = (EBIT / Revenue) * 100
              const predEbitPct = (predEbit / predRev) * 100;
              ebitPctForecasted = predEbitPct.toFixed(2);
              ebitPctChange = calcChange(resData.data.ebit_percent, predEbitPct);

              // Net Income = EBIT * (Actual Net Income / Actual EBIT)
              const niToEbitRatio = actualEbit !== 0 ? (actualNi / actualEbit) : 0;
              const predNi = predEbit * niToEbitRatio;
              niForecasted = formatToM(predNi);
              niChange = calcChange(actualNi, predNi);
            }
          }

          const newData = {
            revenue: {
              actual: formatToM(resData.data.revenue),
              forecasted: revForecasted,
              change: revChange
            },
            grossProfit: {
              actual: formatToM(resData.data.gross_profit),
              forecasted: gpForecasted,
              change: gpChange
            },
            ebit: {
              actual: formatToM(resData.data.ebit),
              forecasted: ebitForecasted,
              change: ebitChange
            },
            ebitPercent: {
              actual: resData.data.ebit_percent.toFixed(2),
              forecasted: ebitPctForecasted,
              change: ebitPctChange
            },
            opEx: {
              actual: formatToM(resData.data.opex),
              forecasted: opexForecasted,
              change: opexChange
            },
            netIncome: {
              actual: formatToM(resData.data.net_income),
              forecasted: niForecasted,
              change: niChange
            },
            // The rest are untouched ratios for now (falling back to mock if API fails)
            eva: kpiData?.eva?.value !== undefined ? kpiData.eva.value : mockRef.eva,
            roa: kpiData?.roa?.value !== undefined ? kpiData.roa.value : mockRef.roa,
            roe: kpiData?.roe?.value !== undefined ? kpiData.roe.value : mockRef.roe,
            kpiData: kpiData,
            expenseBreakdown: expenseBreakdownData
          };

          setDashboardData(newData);
        }
      } else {
        alert("Failed to fetch PnL data from the server.");
        if (!dashboardData) {
          const mockRef = MOCK_FINANCIAL_DATA[selectedLOB]?.[selectedYear] 
            || MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[selectedYear]
            || MOCK_FINANCIAL_DATA['Home & Lifestyle']['2026'];
          setDashboardData(mockRef); // Fallback to mock to clear loading state
        }
      }
    } catch (e) {
      console.error("Apply filters error", e);
      alert("An error occurred while fetching PnL data.");
      if (!dashboardData) {
        const mockRef = MOCK_FINANCIAL_DATA[selectedLOB]?.[selectedYear] 
          || MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[selectedYear]
          || MOCK_FINANCIAL_DATA['Home & Lifestyle']['2026'];
        setDashboardData(mockRef); // Fallback to mock to clear loading state
      }
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // On first load after we get filters (if we have years), we should ideally fetch the initial data.
  // We can do that by hooking into when availableYears is set.
  useEffect(() => {
    if (availableYears.length > 0 && !dashboardData) {
      handleApplyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableYears]);

  // Use dynamic data if available, otherwise fallback to mock
  const formatToM = (val: number) => (val / 1000000).toFixed(2);
  const currentData = dashboardData || MOCK_FINANCIAL_DATA[selectedLOB]?.[selectedYear]
    || MOCK_FINANCIAL_DATA['Home & Lifestyle']?.[selectedYear]
    || MOCK_FINANCIAL_DATA['Home & Lifestyle']['2026'];

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
          selectedMonthStart={selectedMonthStart}
          onMonthStartChange={setSelectedMonthStart}
          selectedMonthEnd={selectedMonthEnd}
          onMonthEndChange={setSelectedMonthEnd}
          onApplyFilters={handleApplyFilters}
          isApplyingFilters={isApplyingFilters}
          availableYears={availableYears}
          availableLOBs={availableLOBs}
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
              isLoading={isApplyingFilters || !dashboardData}
            />
            <MetricCard
              title="Gross Profit"
              actual={`${currentData.grossProfit.actual}M`}
              forecasted={`${currentData.grossProfit.forecasted}M`}
              change={currentData.grossProfit.change}
              isLoading={isApplyingFilters || !dashboardData}
            />
            <MetricCard
              title="EBIT"
              actual={`${currentData.ebit.actual}M`}
              forecasted={`${currentData.ebit.forecasted}M`}
              change={currentData.ebit.change}
              isLoading={isApplyingFilters || !dashboardData}
            />
            <MetricCard
              title="EBIT %"
              actual={currentData.ebitPercent.actual.toString()}
              forecasted={currentData.ebitPercent.forecasted.toString()}
              change={currentData.ebitPercent.change}
              prefix=""
              suffix="%"
              isLoading={isApplyingFilters || !dashboardData}
            />
            <MetricCard
              title="Op Ex"
              actual={`${currentData.opEx.actual}M`}
              forecasted={`${currentData.opEx.forecasted}M`}
              change={currentData.opEx.change}
              isLoading={isApplyingFilters || !dashboardData}
            />
            <MetricCard
              title="Net Income"
              actual={`${currentData.netIncome.actual}M`}
              forecasted={`${currentData.netIncome.forecasted}M`}
              change={currentData.netIncome.change}
              isLoading={isApplyingFilters || !dashboardData}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Ratios & Trends */}
            <div className="xl:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatioCard
                  title="EVA"
                  value={new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(currentData.eva))}
                  benchmark="> 0"
                  benchmarkType="Target"
                  status={currentData.kpiData?.eva?.status}
                  details={currentData.kpiData?.eva?.details}
                  isLoading={isApplyingFilters || !dashboardData}
                />
                <RatioCard
                  title="ROA"
                  value={`${currentData.roa}%`}
                  benchmark={typeof currentData.kpiData?.roa?.benchmark === 'object' ? currentData.kpiData.roa.benchmark.good || "12.8%" : currentData.kpiData?.roa?.benchmark || "12.8%"}
                  benchmarkType="Target"
                  status={currentData.kpiData?.roa?.status}
                  details={currentData.kpiData?.roa?.details}
                  isLoading={isApplyingFilters || !dashboardData}
                />
                <RatioCard
                  title="ROE"
                  value={`${currentData.roe}%`}
                  benchmark="12% - 17%"
                  benchmarkType="Target"
                  status={currentData.kpiData?.roe?.status}
                  details={currentData.kpiData?.roe?.details}
                  isLoading={isApplyingFilters || !dashboardData}
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
                <CostBreakupChart data={currentData.expenseBreakdown} isLoading={isApplyingFilters || !dashboardData} />
                
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
