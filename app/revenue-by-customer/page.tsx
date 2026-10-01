'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { CustomerTreemap } from '@/components/Dashboard/CustomerTreemap';
import { Gauge } from '@/components/Dashboard/Gauge';
import { ProductReviews } from '@/components/Dashboard/ProductReviews';
import { motion } from 'motion/react';
import { Users, Target, Star, ChevronDown, Loader2 } from 'lucide-react';
import { CUSTOMER_SEGMENTS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { fetchWithRetry } from '@/lib/utils';

export default function RevenueByCustomerPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [availableYears, setAvailableYears] = useState<{label: string, value: string | number}[]>([]);
  const [availableLOBs, setAvailableLOBs] = useState<{label: string, value: string | number}[]>([]);
  const [selectedMonthStart, setSelectedMonthStart] = useState('1');
  const [selectedMonthEnd, setSelectedMonthEnd] = useState('12');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch available filters on mount
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
      setIsApplyingFilters(false);
      return;
    }
    
    setIsLoadingData(true);
    try {
      /* 
      // COMMENTED OUT FOR B2C STATIC DEMO
      const res = await fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/customer-segmentation?batch_id=${batchId}&year=${selectedYear}&month_start=${selectedMonthStart}&month_end=${selectedMonthEnd}&lob=${encodeURIComponent(selectedLOB)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setApiData(json.data);
        }
      }
      */
      
      // Simulate loading for the static demo
      await new Promise(resolve => setTimeout(resolve, 600));
      setApiData([]);

    } catch (err) {
      console.error('Failed to fetch customer segmentation:', err);
    } finally {
      setIsLoadingData(false);
      setIsApplyingFilters(false);
    }
  };

  // Automatically fetch initial data when availableYears populates
  useEffect(() => {
    if (availableYears.length > 0) {
      handleApplyFilters();
    }
  }, [availableYears]);

  const filteredTreemapData = useMemo(() => {
    const b2cCustomerData = [
      {
        name: 'Whales (Top 1%)',
        children: [
          { name: 'Sarah Jenkins', size: 45000 },
          { name: 'Michael Chen', size: 38200 },
          { name: 'Emma Watson', size: 34800 },
          { name: 'James Rodriguez', size: 31500 },
          { name: 'Olivia Kim', size: 28900 },
        ],
      },
      {
        name: 'High Value',
        children: [
          { name: 'David Lee', size: 15400 },
          { name: 'Lisa Taylor', size: 14800 },
          { name: 'Robert Fox', size: 14200 },
          { name: 'William Brown', size: 13900 },
          { name: 'Amanda White', size: 13500 },
          { name: 'Thomas Wilson', size: 12100 },
        ],
      },
      {
        name: 'Loyal Regulars',
        children: [
          { name: 'Jessica Davis', size: 8500 },
          { name: 'Daniel Moore', size: 8200 },
          { name: 'Paul Miller', size: 7900 },
          { name: 'Mark Taylor', size: 7500 },
          { name: 'Kevin Anderson', size: 6800 },
          { name: 'Rachel Green', size: 6100 },
        ],
      },
      {
        name: 'Recent Buyers',
        children: [
          { name: 'Sophie Turner', size: 4500 },
          { name: 'Chris Evans', size: 4200 },
          { name: 'Mark Ruffalo', size: 3900 },
          { name: 'Scarlett Johansson', size: 3500 },
          { name: 'Tom Holland', size: 3100 },
          { name: 'Zendaya Maree', size: 2800 },
          { name: 'Jacob Batalon', size: 2500 },
        ],
      },
      {
        name: 'Occasional',
        children: [
          { name: 'Benedict Cumberbatch', size: 1800 },
          { name: 'Chadwick Boseman', size: 1500 },
          { name: 'Paul Rudd', size: 1200 },
          { name: 'Brie Larson', size: 1100 },
          { name: 'Don Cheadle', size: 900 },
          { name: 'Jeremy Renner', size: 800 },
          { name: 'Anthony Mackie', size: 600 },
          { name: 'Sebastian Stan', size: 500 },
        ],
      },
    ];

    if (selectedSegment === 'All') return b2cCustomerData;
    return b2cCustomerData.filter(s => s.name === selectedSegment);
  }, [selectedSegment]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Revenue by Customer</h1>
              <p className="text-sm text-zinc-500 font-medium">Detailed breakdown of revenue distribution and customer health metrics.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <select 
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="appearance-none flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-bold outline-none pr-10"
                >
                  <option value="All">Segment: All</option>
                  <option value="Whales (Top 1%)">Whales (Top 1%)</option>
                  <option value="High Value">High Value</option>
                  <option value="Loyal Regulars">Loyal Regulars</option>
                  <option value="Recent Buyers">Recent Buyers</option>
                  <option value="Occasional">Occasional</option>
                </select>
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none hidden" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Treemap Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-12 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Revenue break-up by Customer</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Whales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">High Value</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Loyal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Recent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Occasional</span>
                  </div>
                </div>
              </div>
              {isLoadingData ? (
                <div className="w-full h-[600px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl animate-pulse">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                </div>
              ) : (
                <CustomerTreemap data={filteredTreemapData} />
              )}
            </motion.div>

            {/* Gauges & Reviews Section (Commented out for later use) 
            <div className="xl:col-span-4 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">Customer Health</h3>
                <div className="space-y-8">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold">Risk Score</span>
                      </div>
                      <select className="bg-transparent text-[10px] font-bold text-zinc-500 outline-none">
                        <option>Customer 1</option>
                        <option>Customer 2</option>
                      </select>
                    </div>
                    <Gauge value={60} label="Risk Index" />
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold">Propensity to pay</span>
                      </div>
                      <select className="bg-transparent text-[10px] font-bold text-zinc-500 outline-none">
                        <option>Customer 1</option>
                        <option>Customer 2</option>
                      </select>
                    </div>
                    <Gauge value={80} label="Propensity Score" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Feedback</h3>
                </div>
                <ProductReviews />
              </motion.div>
            </div>
            */}
          </div>
        </div>
      </main>
    </div>
  );
}
