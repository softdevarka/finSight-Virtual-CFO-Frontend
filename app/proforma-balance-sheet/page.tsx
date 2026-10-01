'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Activity, Info, FileText, Anchor } from 'lucide-react';
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

const BALANCE_SHEET_DATA: TableRowData[] = [
  { label: 'Cash', actual: '$10.00', forecasted: '$15.00', note: 'Derived - % of sales' },
  { label: 'Receivables', actual: '$100.00', forecasted: '$150.00', note: 'Derived - % of sales' },
  { label: 'Inventory', actual: '$150.00', forecasted: '$225.00', note: 'Derived - % of sales' },
  { label: 'Total Current Assets', actual: '$260.00', forecasted: '$390.00', note: 'Derived figure', isBold: true, isBorderTop: true },
  { label: 'PP&E', actual: '$300.00', forecasted: '$700.00', note: 'End user need to put the value' },
  { label: 'Total Assets', actual: '$560.00', forecasted: '$1,090.00', note: 'Derived figure', isBold: true, isBorderTop: true },
  { label: 'Payables', actual: '$100.00', forecasted: '$150.00', note: 'Derived - % of sales' },
  { label: 'Total Current Liabilities', actual: '$100.00', forecasted: '$150.00', note: 'Derived figure', isBold: true, isBorderTop: true },
  { label: 'Debt Payable', actual: '$300.00', forecasted: '$744.00', note: 'Plug-in - primary' },
  { label: 'Total Liabilities', actual: '$400.00', forecasted: '$894.00', note: 'Derived figure', isBold: true, isBorderTop: true },
  { label: 'Paid in Capital', actual: '$100.00', forecasted: '$100.00', note: 'Plug-in - secondary' },
  { label: 'Retained Earnings', actual: '$60.00', forecasted: '$96.00', note: 'Derived from statement of RE' },
  { label: 'Total Equity', actual: '$160.00', forecasted: '$196.00', note: 'Derived figure', isBold: true, isBorderDouble: true },
];

export default function ProformaBalanceSheetPage() {
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
                Proforma Balance Sheet
              </h1>
              <p className="text-sm text-zinc-500 font-medium mt-1">Projected statement of financial position based on forecasts.</p>
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
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Balance Sheet</h3>
              <StatementTable data={BALANCE_SHEET_DATA} />
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
                  {row.note.includes('End user need to put the value') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      <Activity className="w-3.5 h-3.5" />
                      {row.note}
                    </span>
                  ) : row.note.includes('Derived') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                      <Info className="w-3.5 h-3.5" />
                      {row.note}
                    </span>
                  ) : row.note.includes('Plug-in') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                      <Anchor className="w-3.5 h-3.5" />
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
