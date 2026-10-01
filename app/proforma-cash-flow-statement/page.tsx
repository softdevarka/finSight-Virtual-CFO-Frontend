'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Activity, FileText } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RowData {
  label: string;
  isHeader?: boolean;
  isIndent?: boolean;
  isBold?: boolean;
  isBorderTop?: boolean;
  isBorderDouble?: boolean;
  val1?: string;
  val2?: string;
}

const INCOME_STATEMENT: RowData[] = [
  { label: 'Revenue', val1: '$44,490' },
  { label: 'COGS', val1: '-$23,840' },
  { label: 'Gross Income', val1: '$20,650', isBold: true, isBorderTop: true },
  { label: 'Operating Expenses', val1: '-$13,231' },
  { label: 'EBITDA', val1: '$7,419', isBold: true, isBorderTop: true },
  { label: 'D&A', val1: '-$744' },
  { label: 'EBIT', val1: '$6,675', isBold: true, isBorderTop: true },
  { label: 'Other Income / Expense', val1: '$279' },
  { label: 'Interest Expense', val1: '-$289' },
  { label: 'EBT', val1: '$6,665', isBold: true, isBorderTop: true },
  { label: 'Taxes', val1: '-$934' },
  { label: 'Net Income', val1: '$5,731', isBold: true, isBorderTop: true },
  { label: 'Dividends', val1: '-$1,638' }
];

const BALANCE_SHEET: RowData[] = [
  { label: 'Assets', isHeader: true },
  { label: 'Current Assets:', isHeader: true },
  { label: 'Cash', val1: '$8,790', val2: '$14,925', isIndent: true },
  { label: 'Accounts Receivables', val1: '$2,750', val2: '$4,460', isIndent: true },
  { label: 'Inventory', val1: '$7,370', val2: '$6,850', isIndent: true },
  { label: 'Other Current Assets', val1: '$1,650', val2: '$1,500', isIndent: true },
  { label: 'Total Current Assets', val1: '$20,560', val2: '$27,735', isBold: true, isBorderTop: true },
  { label: 'Non-current Assets:', isHeader: true },
  { label: 'PP&E', val1: '$12,760', val2: '$13,170', isIndent: true },
  { label: 'Accumulated Depreciation', val1: '-$4,800', val2: '-$5,160', isIndent: true },
  { label: 'Net PP&E', val1: '$7,960', val2: '$8,010', isIndent: true, isBorderTop: true },
  { label: 'Other Long Term Investments', val1: '$1', val2: '$16', isIndent: true },
  { label: 'Other Assets', val1: '$2,330', val2: '$2,910', isIndent: true },
  { label: 'Total Non-current Assets', val1: '$10,291', val2: '$10,936', isBold: true, isBorderTop: true },
  { label: 'Total Assets', val1: '$30,851', val2: '$38,671', isBold: true, isBorderDouble: true },
  { label: '', isHeader: true }, // Spacer
  { label: 'Liabilities', isHeader: true },
  { label: 'Current Liabilities:', isHeader: true },
  { label: 'Short Term Debt', val1: '$693', val2: '$469', isIndent: true },
  { label: 'Current portion of long term debt', val1: '$3', val2: '$0', isIndent: true },
  { label: 'Accounts Payable', val1: '$2,250', val2: '$2,840', isIndent: true },
  { label: 'Taxes Payable', val1: '$156', val2: '$306', isIndent: true },
  { label: 'Other Current Liabilities', val1: '$5,180', val2: '$6,060', isIndent: true },
  { label: 'Total current liabilities', val1: '$8,282', val2: '$9,675', isBold: true, isBorderTop: true },
  { label: 'Non-current liabilities:', isHeader: true },
  { label: 'Long-term debt', val1: '$12,320', val2: '$12,340', isIndent: true },
  { label: 'Other Liabilities', val1: '$2,192', val2: '$2,457', isIndent: true },
  { label: 'Total non-current liabilities', val1: '$14,512', val2: '$14,797', isBold: true, isBorderTop: true },
  { label: 'Total Liabilities', val1: '$22,794', val2: '$24,472', isBold: true, isBorderTop: true },
  { label: '', isHeader: true },
  { label: "Stockholder's Equity", isHeader: true },
  { label: 'Common Equity', val1: '$8,302', val2: '$9,967', isIndent: true },
  { label: 'Accumulated other Comprehensive Income / Loss', val1: '-$54', val2: '$330', isIndent: true },
  { label: 'Retained Earnings', val1: '-$191', val2: '$3,902', isIndent: true },
  { label: "Total Stockholder's Equity", val1: '$8,057', val2: '$14,199', isBold: true, isBorderTop: true },
  { label: "Total Liabilities and Stockholder's Equity", val1: '$30,851', val2: '$38,671', isBold: true, isBorderDouble: true },
];

const CASH_FLOW_STATEMENT: RowData[] = [
  { label: 'Net Income', val1: '$5,731' },
  { label: 'Depreciation and Amortization', val1: '$744' },
  { label: 'Changes in Working Capital', isHeader: true },
  { label: 'Changes in AR', val1: '-$1,710', isIndent: true },
  { label: 'Changes in Inventory', val1: '$520', isIndent: true },
  { label: 'Changes in Other Current Assets', val1: '$150', isIndent: true },
  { label: 'Changes in Short-term Debt', val1: '-$224', isIndent: true },
  { label: 'Changes in AP', val1: '$590', isIndent: true },
  { label: 'Changes in Taxes Payable', val1: '$150', isIndent: true },
  { label: 'Changes in Other Current Liabilities', val1: '$880', isIndent: true },
  { label: 'Cash Flow from Operating Activities', val1: '$6,831', isBold: true, isBorderTop: true },
  { label: '', isHeader: true },
  { label: 'Purchase of PP&E', val1: '-$410' },
  { label: 'Purchase of Other Long-term Investments', val1: '-$15' },
  { label: 'Other Assets', val1: '-$580' },
  { label: 'Cash Flow from Investing Activities', val1: '-$1,005', isBold: true, isBorderTop: true },
  { label: '', isHeader: true },
  { label: 'Increase in Long-term debt', val1: '$17' },
  { label: 'Increase in Other Liabilities', val1: '$265' },
  { label: 'Proceeds from Share Issuance', val1: '$1,665' },
  { label: 'Dividends', val1: '-$1,638' },
  { label: 'Cash Flow from Financing Activities', val1: '$309', isBold: true, isBorderTop: true },
  { label: '', isHeader: true },
  { label: 'Beginning Cash Balance', val1: '$8,790' },
  { label: 'Change in Cash', val1: '$6,135' },
  { label: 'Ending Cash Balance', val1: '$14,925', isBold: true, isBorderDouble: true },
];

export default function ProformaCashFlowStatementPage() {
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
                Proforma Cash Flow Statement
              </h1>
              <p className="text-sm text-zinc-500 font-medium mt-1">Comprehensive view of projected cash movements across all activities.</p>
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Income Statement</h3>
              <StatementTable 
                data={INCOME_STATEMENT} 
                columns={[{ label: 'Forecasted Period', date: '5/30/2021' }]} 
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Balance Sheet</h3>
              <StatementTable 
                data={BALANCE_SHEET} 
                columns={[
                  { label: 'Current Period', date: '5/30/2020' }, 
                  { label: 'Forecasted Period', date: '5/30/2021' }
                ]} 
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Cash Flow Statement</h3>
              <StatementTable 
                data={CASH_FLOW_STATEMENT} 
                columns={[{ label: 'Forecasted Period', date: '5/30/2021' }]} 
              />
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatementTable({ data, columns }: { data: RowData[], columns: {label: string, date: string}[] }) {
  const isTwoCols = columns.length === 2;

  return (
    <div className="min-w-full text-sm">
      {/* Table Header */}
      <div className="grid grid-cols-12 pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className={cn("text-xs font-bold text-zinc-400", isTwoCols ? "col-span-6" : "col-span-8")}>
          <div className="uppercase tracking-wider">$ in Millions</div>
        </div>
        {columns.map((col, idx) => (
          <div key={idx} className={cn("text-right", isTwoCols ? "col-span-3" : "col-span-4")}>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">{col.label}</div>
            <div className="text-[10px] font-medium text-zinc-400">{col.date}</div>
          </div>
        ))}
      </div>
      
      {/* Table Body */}
      <div className="space-y-0.5">
        {data.map((row, idx) => {
          if (row.isHeader && !row.label) {
            // Spacer
            return <div key={idx} className="h-4" />;
          }

          if (row.isHeader) {
            return (
              <div key={idx} className="grid grid-cols-12 py-1.5 px-2">
                <div className="col-span-12 font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wide mt-2">
                  {row.label}
                </div>
              </div>
            );
          }

          return (
            <div key={idx}>
              {row.isBorderTop && <div className="border-t border-zinc-200 dark:border-zinc-700/50 my-1" />}
              {row.isBorderDouble && <div className="border-t-[3px] border-double border-zinc-300 dark:border-zinc-600 my-1" />}
              
              <div className={cn(
                "grid grid-cols-12 items-center py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
                row.isBold ? "font-bold text-zinc-900 dark:text-white" : "font-medium text-zinc-600 dark:text-zinc-300"
              )}>
                <div className={cn("truncate pr-2 text-xs", isTwoCols ? "col-span-6" : "col-span-8", row.isIndent ? "pl-4 text-zinc-500 dark:text-zinc-400" : "")}>
                  {row.label}
                </div>
                
                {isTwoCols ? (
                  <>
                    <div className="col-span-3 text-right text-xs">
                      <span className={cn(row.val1?.startsWith('-') && "text-rose-500")}>{row.val1}</span>
                    </div>
                    <div className="col-span-3 text-right text-xs">
                      <span className={cn(row.val2?.startsWith('-') && "text-rose-500")}>{row.val2}</span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-4 text-right text-xs">
                    <span className={cn(row.val1?.startsWith('-') && "text-rose-500")}>{row.val1}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
