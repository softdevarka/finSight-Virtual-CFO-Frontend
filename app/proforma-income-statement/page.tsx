'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Activity, Info, FileText } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface TableRowData {
  label: string;
  actual: string;
  forecasted: string;
  note: string;
  isBold?: boolean;
  isBorderTop?: boolean;
  isBorderDouble?: boolean;
}

const INCOME_STATEMENT_DATA: TableRowData[] = [
  { label: 'Sales', actual: '$1,000', forecasted: '$1,500', note: 'Predicted (Check Sales Forecast)' },
  { label: 'COGS', actual: '-$700', forecasted: '-$1,050', note: 'Predicted (Check COGS Forecast)' },
  { label: 'Gross Profit', actual: '$300', forecasted: '$450', note: 'Derived Figure', isBold: true, isBorderTop: true },
  { label: 'Depreciation', actual: '-$15', forecasted: '-$35', note: 'User Input Required' },
  { label: 'Other Operating Expenses', actual: '-$185', forecasted: '-$278', note: 'Predicted (Check SG&A Forecast)' },
  { label: 'Operating Profit', actual: '$100', forecasted: '$138', note: 'Derived Figure', isBold: true, isBorderTop: true },
  { label: 'Interest Expense', actual: '-$30', forecasted: '-$40', note: 'User Input Required' },
  { label: 'Income Before Taxes', actual: '$70', forecasted: '$98', note: 'Derived Figure', isBorderTop: true },
  { label: 'Income Tax', actual: '-$30', forecasted: '-$42', note: 'Derived Figure' },
  { label: 'Net Income', actual: '$40', forecasted: '$56', note: 'Derived Figure', isBold: true, isBorderDouble: true },
];

const RETAINED_EARNINGS_DATA: TableRowData[] = [
  { label: 'Beginning RE', actual: '$35.00', forecasted: '$60.00', note: "Previous period's ending figure", isBold: true },
  { label: 'Net Income', actual: '$40.00', forecasted: '$56.00', note: 'Flows from Income Statement' },
  { label: 'Dividends', actual: '-$15.00', forecasted: '-$20.00', note: 'User Input Required' },
  { label: 'Ending RE', actual: '$60.00', forecasted: '$96.00', note: 'Derived Figure', isBold: true, isBorderTop: true },
];

export default function ProformaIncomeStatementPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLOB, setSelectedLOB] = useState('ALL');
  const [availableLOBs, setAvailableLOBs] = useState<{label: string, value: string | number}[]>([]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const fetchLOBs = async () => {
      const batchId = localStorage.getItem('upload_batch_id');
      const token = localStorage.getItem('auth_token');
      if (!batchId || !token) return;

      try {
        const res = await fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/reporting/pnl/lobs?batch_id=${batchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const lobsData = await res.json();
          if (lobsData.success && lobsData.data?.length > 0) {
            setAvailableLOBs(lobsData.data);
            setSelectedLOB(String(lobsData.data[0].value));
          }
        }
      } catch (err) {
        console.error('Failed to fetch LOBs:', err);
      }
    };

    fetchLOBs();
  }, [isAuthenticated, loading]);

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
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Proforma Income Statement
              </h1>
              <p className="text-sm text-zinc-500 font-medium mt-1">Projected financial performance based on forecasts and user inputs.</p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">LOB</span>
              </div>
              <select 
                value={selectedLOB}
                onChange={(e) => setSelectedLOB(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer text-right max-w-[120px]"
              >
                {availableLOBs.length > 0 ? (
                  availableLOBs.map(lob => (
                    <option key={lob.value} value={lob.value}>{lob.label}</option>
                  ))
                ) : (
                  <option value="ALL">ALL</option>
                )}
              </select>
            </div>
          </div>

          {/* Statement Tables Grid */}
          <div className="grid grid-cols-1 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Income Statement</h3>
              <StatementTable data={INCOME_STATEMENT_DATA} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Statement of Retained Earnings</h3>
              <StatementTable data={RETAINED_EARNINGS_DATA} />
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatementTable({ data }: { data: TableRowData[] }) {
  return (
    <div className="min-w-[800px]">
      {/* Table Header */}
      <div className="grid grid-cols-12 pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
        <div className="col-span-4 pl-4">Metric ($ in Millions)</div>
        <div className="col-span-2 text-right">Actual</div>
        <div className="col-span-2 text-right">Forecasted</div>
        <div className="col-span-4 pl-8">Source / Note</div>
      </div>
      
      {/* Table Body */}
      <div className="space-y-1">
        {data.map((row, idx) => (
          <div key={idx}>
            {row.isBorderTop && <div className="border-t border-zinc-200 dark:border-zinc-700/50 my-2 mx-4" />}
            {row.isBorderDouble && <div className="border-t-[3px] border-double border-zinc-300 dark:border-zinc-600 my-2 mx-4" />}
            
            <div className={cn(
              "grid grid-cols-12 items-center py-2.5 px-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
              row.isBold ? "font-bold text-zinc-900 dark:text-white" : "font-medium text-zinc-600 dark:text-zinc-300"
            )}>
              <div className="col-span-4">{row.label}</div>
              <div className="col-span-2 text-right font-semibold">{row.actual}</div>
              <div className={cn(
                "col-span-2 text-right font-semibold",
                row.forecasted.startsWith('-') ? "text-rose-500" : "text-emerald-500"
              )}>
                {row.forecasted}
              </div>
              <div className="col-span-4 pl-8">
                <div className="flex items-center gap-2">
                  {row.note.includes('User Input Required') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Activity className="w-3.5 h-3.5" />
                      {row.note}
                    </span>
                  ) : row.note.includes('Derived Figure') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                      <Info className="w-3.5 h-3.5" />
                      {row.note}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                      {row.note}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
