'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UploadedFiles } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Info, 
  Trash2, 
  BarChart3, 
  Sparkles, 
  ArrowRight,
  Database,
  ArrowLeft,
  RefreshCw,
  Clock,
  Loader2
} from 'lucide-react';

interface FileUploadState {
  key: keyof UploadedFiles;
  label: string;
  description: string;
  sampleName: string;
}

const UPLOAD_ITEMS: FileUploadState[] = [
  { key: 'coa', label: 'Chart of Accounts (COA) CSV', description: 'Defines accounts ledger mappings, general ledger keys, and structures.', sampleName: 'coa_reit_retail_v2.csv' },
  { key: 'dim_products', label: 'dim_products CSV', description: 'Product dimensions, SKU parameters, inventory category groupings.', sampleName: 'dim_products_main.csv' },
  { key: 'bsv_tax', label: 'bsv_tax CSV', description: 'Tax balance sheet definitions, withholding indices, and region matrices.', sampleName: 'bsv_tax_jurisdiction_2026.csv' },
  { key: 'subledger', label: 'Subledger CSV', description: 'Subledger transaction listings, daily credit/debit logs, and offset balances.', sampleName: 'subledger_accruals_q2.csv' },
  { key: 'asset_value', label: 'Asset Value CSV', description: 'Asset valuations, historical deprecations, and current holding levels.', sampleName: 'asset_values_retail_portfolio.csv' },
];

export default function DocumentUploadPage() {
  const router = useRouter();
  const { user, uploadedFiles, uploadFile, removeFile, logout } = useAuth();
  
  // Track visual uploading states for elegant simulated loading animations
  const [uploadingProgress, setUploadingProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});
  
  const fileInputRefs = {
    coa: useRef<HTMLInputElement>(null),
    dim_products: useRef<HTMLInputElement>(null),
    bsv_tax: useRef<HTMLInputElement>(null),
    subledger: useRef<HTMLInputElement>(null),
    asset_value: useRef<HTMLInputElement>(null),
  };

  const simulateUpload = (key: keyof UploadedFiles, fileName: string) => {
    setUploadingProgress(prev => ({ ...prev, [key]: 1 }));
    
    // Smooth progress increment
    let progress = 1;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadingProgress(prev => ({ ...prev, [key]: 100 }));
        setTimeout(() => {
          uploadFile(key, fileName);
          // clear progress bar state so it displays the finished UI
          setUploadingProgress(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }, 300);
      } else {
        setUploadingProgress(prev => ({ ...prev, [key]: progress }));
      }
    }, 100);
  };

  const handleFileChange = (key: keyof UploadedFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload(key, file.name);
    }
  };

  const handleDrag = (key: keyof UploadedFiles, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [key]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDrop = (key: keyof UploadedFiles, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [key]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv') || file.type === "text/csv") {
        simulateUpload(key, file.name);
      } else {
        alert('Please drop a valid .csv file.');
      }
    }
  };

  const handleAutoPopulate = () => {
    // Fill all with sandbox mock variables in sequence
    UPLOAD_ITEMS.forEach(item => {
      uploadFile(item.key, item.sampleName);
    });
  };

  const handleReset = () => {
    UPLOAD_ITEMS.forEach(item => {
      removeFile(item.key);
    });
  };

  const handleProceed = () => {
    // Always permit going next to page even with blanks as requested
    router.push('/');
  };

  const countUploaded = Object.values(uploadedFiles).filter(Boolean).length;
  const isAllUploaded = countUploaded === 5;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col">
      
      {/* Header Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">FinSight</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              SANDBOX PROVISIONING
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{user.name}</span>
                <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[150px]">{user.company_name}</span>
              </div>
            )}
            <button 
              onClick={logout}
              className="text-xs font-bold text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Provision Business Ledger</h1>
            <p className="text-xs text-zinc-500 font-semibold max-w-[550px]">
              Upload the 5 primary business CSV dimensions below. These align accounts, product tiers, tax parameters, daily transactions, and depreciation layers.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 text-right">
              Completed <span className="text-indigo-600 dark:text-indigo-400">{countUploaded}</span> of <span className="font-extrabold text-zinc-900 dark:text-white">5</span> ledgers
            </div>
            {/* Progress bar */}
            <div className="w-full md:w-40 h-2 bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                animate={{ width: `${(countUploaded / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Floating Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-500/5 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/15">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-zinc-800 dark:text-indigo-300">Sandbox Accelerator:</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold">Instantly load premium demo CSVs standard for REIT &amp; Retail sectors.</span>
          </div>

          <div className="flex items-center gap-2">
            {countUploaded > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[10px] font-extrabold text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                RESET ALL
              </button>
            )}
            <button
              onClick={handleAutoPopulate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-750 font-extrabold text-[10px] tracking-wide transition-all cursor-pointer shadow-sm shadow-indigo-500/10"
            >
              <Database className="w-3 h-3" />
              AUTO-FILL SANDBOX CSVs
            </button>
          </div>
        </div>

        {/* Upload Sequence List */}
        <div className="space-y-4">
          {UPLOAD_ITEMS.map((item, index) => {
            const fileName = uploadedFiles[item.key];
            const isProgress = uploadingProgress[item.key] !== undefined;
            const progressVal = uploadingProgress[item.key] || 0;
            const isActive = countUploaded === index; // Highlight current expected step
            
            return (
              <motion.div 
                key={item.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  fileName 
                    ? 'bg-emerald-500/[0.02] border-emerald-500/30' 
                    : isActive 
                      ? 'bg-indigo-500/[0.01] border-indigo-500/40 shadow-xs ring-1 ring-indigo-500/10' 
                      : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info Column */}
                  <div className="flex items-start gap-3.5 max-w-[500px]">
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-colors ${
                      fileName 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400' 
                        : isActive
                          ? 'bg-indigo-600 text-white border-transparent'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                    }`}>
                      {fileName ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-black">{index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-950 dark:text-white">{item.label}</span>
                        {index === 0 && !fileName && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-500 text-white rounded">START</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 font-semibold tracking-tight">{item.description}</p>
                    </div>
                  </div>

                  {/* Upload Controls / States */}
                  <div className="md:w-64 shrink-0 flex items-center justify-end">
                    <AnimatePresence mode="wait">
                      {isProgress ? (
                        /* Simulated upload progress loader */
                        <motion.div 
                          key="progress"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              PARSING CSV...
                            </span>
                            <span>{progressVal}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progressVal}%` }} />
                          </div>
                        </motion.div>
                      ) : fileName ? (
                        /* Active file uploaded card */
                        <motion.div 
                          key="completed"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between w-full p-2 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/25 rounded-xl gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden pl-1">
                            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[140px]" title={fileName}>
                              {fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(item.key)}
                            className="p-1 px-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ) : (
                        /* Drag and drop input trigger zone */
                        <motion.div 
                          key="input"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onDragEnter={(e) => handleDrag(item.key, e)}
                          onDragOver={(e) => handleDrag(item.key, e)}
                          onDragLeave={(e) => handleDrag(item.key, e)}
                          onDrop={(e) => handleDrop(item.key, e)}
                          onClick={() => fileInputRefs[item.key].current?.click()}
                          className={`w-full py-2.5 px-3 border border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-center ${
                            dragActive[item.key]
                              ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600'
                              : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Drag or browse File</span>
                          <input
                            ref={fileInputRefs[item.key]}
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileChange(item.key, e)}
                            className="hidden"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Actions for main progression */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold max-w-sm">
              Sandbox limits are disabled. If no actual CSV files are available, click &quot;PROCEED&quot; anyway to access default charts with preset values.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleProceed}
              id="proceed_dashboard_btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{isAllUploaded ? 'COMPILE ACCRUALS & LAUNCH' : 'PROCEED TO DASHBOARD'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
