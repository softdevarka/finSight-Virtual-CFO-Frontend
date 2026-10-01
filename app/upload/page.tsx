'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Loader2,
  Lock,
  Download
} from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils';

interface FileUploadState {
  key: keyof UploadedFiles;
  label: string;
  description: string;
  sampleName: string;
}

const UPLOAD_ITEMS: FileUploadState[] = [
  { key: 'coa', label: 'Chart of Accounts (COA) CSV', description: 'Defines accounts ledger mappings, general ledger keys, and structures.', sampleName: 'coa_reit_retail_v2.csv' },
  { key: 'dim_products', label: 'Product CSV', description: 'Product dimensions, SKU parameters, inventory category groupings.', sampleName: 'dim_products_main.csv' },
  { key: 'bsv_tax', label: 'BSV Tax CSV', description: 'Tax balance sheet definitions, withholding indices, and region matrices.', sampleName: 'bsv_tax_jurisdiction_2026.csv' },
  { key: 'subledger', label: 'Subledger CSV', description: 'Subledger transaction listings, daily credit/debit logs, and offset balances.', sampleName: 'subledger_accruals_q2.csv' },
  { key: 'asset_value', label: 'Asset Value CSV', description: 'Asset valuations, historical deprecations, and current holding levels.', sampleName: 'asset_values_retail_portfolio.csv' },
];

export default function DocumentUploadPage() {
  const router = useRouter();
  const { user, uploadedFiles, uploadFile, removeFile, logout } = useAuth();
  
  // Track visual uploading states for elegant simulated loading animations
  const [uploadingProgress, setUploadingProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});
  const [deletingStates, setDeletingStates] = useState<{ [key: string]: boolean }>({});
  const [batchId, setBatchId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoadingHistory(false);
        return;
      }
      try {
        const response = await fetchWithRetry('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/get-reporting-history/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            setHistory(data.data.filter((b: any) => b.status === 'done'));
          }
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    // Load batchId from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedBatchId = localStorage.getItem('upload_batch_id');
      if (storedBatchId) {
        setBatchId(Number(storedBatchId));
      }
    }
  }, []);
  
  const fileInputRefs = {
    coa: useRef<HTMLInputElement>(null),
    dim_products: useRef<HTMLInputElement>(null),
    bsv_tax: useRef<HTMLInputElement>(null),
    subledger: useRef<HTMLInputElement>(null),
    asset_value: useRef<HTMLInputElement>(null),
  };

  const uploadFileToServer = async (key: keyof UploadedFiles, file: File) => {
    setUploadingProgress(prev => ({ ...prev, [key]: 10 })); // Show some initial progress

    const fileTypeMap: Record<keyof UploadedFiles, string> = {
      coa: "COA",
      dim_products: "PRODUCT",
      bsv_tax: "BSV_TAX",
      subledger: "SUBLEDGER",
      asset_value: "ASSET_VALUE"
    };

    const fileTypeStr = fileTypeMap[key];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileTypeStr);
    
    if (batchId !== null) {
      formData.append('batch_id', batchId.toString());
    }

    const token = localStorage.getItem('auth_token');

    try {
      // Fake progress increment while fetching
      const progressInterval = setInterval(() => {
        setUploadingProgress(prev => {
          const current = prev[key] || 10;
          if (current >= 90) return prev;
          return { ...prev, [key]: current + 10 };
        });
      }, 500);

      const response = await fetchWithRetry('https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/ingestion/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadingProgress(prev => ({ ...prev, [key]: 100 }));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        alert('File upload failed. Please try again.');
        
        // Remove progress to revert UI
        setUploadingProgress(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        return;
      }

      const data = await response.json();
      
      // Check if batch_id is returned and update state
      if (data.batch_id && batchId === null) {
        setBatchId(data.batch_id);
        localStorage.setItem('upload_batch_id', data.batch_id.toString());
      }

      setTimeout(() => {
        uploadFile(key, file.name, data.file_id);
        setUploadingProgress(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 300);

    } catch (e) {
      console.error('Upload error', e);
      alert('An error occurred while uploading. Please check your network and try again.');
      setUploadingProgress(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const deleteFileFromServer = async (key: keyof UploadedFiles, fileId: number) => {
    const token = localStorage.getItem('auth_token');
    setDeletingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/ingestion/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to delete file');
        alert('Failed to delete file. Please try again.');
        return;
      }

      const data = await response.json();

      if (data.batch_deleted === true) {
        setBatchId(null);
        localStorage.removeItem('upload_batch_id');
      }

      removeFile(key);
    } catch (e) {
      console.error('Delete error', e);
      alert('An error occurred while deleting the file.');
    } finally {
      setDeletingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleFileChange = (key: keyof UploadedFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadFileToServer(key, file);
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
        uploadFileToServer(key, file);
      } else {
        alert('Please drop a valid .csv file.');
      }
    }
  };

  const handleAutoPopulate = () => {
    // Fill all with sandbox mock variables in sequence
    UPLOAD_ITEMS.forEach((item, idx) => {
      uploadFile(item.key, item.sampleName, 99000 + idx);
    });
  };

  const handleReset = async () => {
    const filesToDelete = UPLOAD_ITEMS.map(item => ({ key: item.key, meta: uploadedFiles[item.key] }))
                                      .filter(f => f.meta !== null);
    
    for (const f of filesToDelete) {
      if (f.meta) {
        await deleteFileFromServer(f.key, f.meta.fileId);
      }
    }
  };

  const countUploaded = Object.values(uploadedFiles).filter(Boolean).length;
  const isAllUploaded = countUploaded === 5;

  const handleProceed = async () => {
    if (!isAllUploaded) {
      // Always permit going next to page even with blanks as requested
      router.push('/');
      return;
    }

    if (!batchId) {
      alert("No active batch found to process.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetchWithRetry(`https://finsight-virtual-cfo-gjdhdjhzbva8hzbe.centralindia-01.azurewebsites.net/processing/start-processing/${batchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to start processing');
        alert('Failed to start processing. Please try again.');
        setIsProcessing(false);
        return;
      }

      router.push('/');
    } catch (e) {
      console.error('Processing error', e);
      alert('An error occurred during processing.');
      setIsProcessing(false);
    }
  };

  const handleUseHistory = (selectedBatchId: number) => {
    localStorage.setItem('upload_batch_id', selectedBatchId.toString());
    router.push('/');
  };

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
        
        {/* Previous Upload History */}
        {!loadingHistory && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Previous Uploads Found</h2>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-5 max-w-[700px]">
              We found previously processed data for your account. You can directly proceed to the dashboard using an existing batch instead of re-uploading, as the chart of accounts cannot be changed once uploaded.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {history.map((batch: any) => (
                <div key={batch.batch_id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                  <div>
                    <div className="text-sm font-black text-zinc-900 dark:text-white mb-0.5">Batch #{batch.batch_id}</div>
                    <div className="text-[11px] text-zinc-500 font-semibold">
                      Created: {new Date(batch.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseHistory(batch.batch_id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-[10px] font-black transition-colors active:scale-95 shadow-sm shadow-indigo-500/20"
                  >
                    GO TO DASHBOARD
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {user?.role === 'admin' && (
          <>
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
            <a
              href="https://zenydata-my.sharepoint.com/:x:/p/arka_raha/IQBH7BXiyjjuQZanvicNHE9rAQUnmF0laiF-ECk55NRjgEk?e=guWchw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[10px] font-extrabold text-zinc-600 dark:text-zinc-300 transition-all shadow-sm"
            >
              <Download className="w-3 h-3" />
              DOWNLOAD TEMPLATE
            </a>
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
            const fileMeta = uploadedFiles[item.key];
            const fileName = fileMeta?.fileName;
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
                            onClick={() => fileMeta && !deletingStates[item.key] && deleteFileFromServer(item.key, fileMeta.fileId)}
                            disabled={deletingStates[item.key]}
                            className={`p-1 px-1.5 rounded-lg transition-colors shrink-0 ${
                              deletingStates[item.key] 
                                ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed' 
                                : 'hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 cursor-pointer'
                            }`}
                          >
                            {deletingStates[item.key] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
              disabled={isProcessing}
              id="proceed_dashboard_btn"
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all ${
                isProcessing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>{isAllUploaded ? 'START PROCESSING' : 'PROCEED TO DASHBOARD'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
        </>
        )}

        {user?.role !== 'admin' && history.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
            <Lock className="w-12 h-12 text-zinc-400 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Active Data Batches</h2>
            <p className="text-sm text-zinc-500 max-w-md">Your administrator has not provisioned any financial data batches yet. Please contact your Admin to upload the required ledger files.</p>
            <button
              onClick={logout}
              className="mt-8 px-6 py-3 rounded-xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
