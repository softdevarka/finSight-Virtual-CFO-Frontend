'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
import { CustomerTreemap } from '@/components/Dashboard/CustomerTreemap';
import { Gauge } from '@/components/Dashboard/Gauge';
import { ProductReviews } from '@/components/Dashboard/ProductReviews';
import { motion } from 'motion/react';
import { Users, Target, Star, ChevronDown, Loader2 } from 'lucide-react';
import { CUSTOMER_SEGMENTS } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';

export default function RevenueByCustomerPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredTreemapData = useMemo(() => {
    if (selectedSegment === 'All') return CUSTOMER_SEGMENTS;
    return CUSTOMER_SEGMENTS.filter(s => s.name === selectedSegment);
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
                  <option value="Strategic Accounts">Strategic Accounts</option>
                  <option value="Mid-Market">Mid-Market</option>
                  <option value="Emerging">Emerging</option>
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
              className="xl:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Revenue break-up by Customer</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Strategic</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Mid-Market</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Emerging</span>
                  </div>
                </div>
              </div>
              <CustomerTreemap data={filteredTreemapData} />
            </motion.div>

            {/* Gauges & Reviews Section */}
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
          </div>
        </div>
      </main>
    </div>
  );
}
