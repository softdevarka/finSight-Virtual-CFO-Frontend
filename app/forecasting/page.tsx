'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { ForecastChart } from '@/components/Dashboard/ForecastChart';
import { InfluencerHeatMap } from '@/components/Dashboard/HeatMap';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  ChevronDown, 
  Filter, 
  Globe, 
  MapPin, 
  PieChart, 
  Layers, 
  Box, 
  Activity,
  Table as TableIcon,
  Users,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIONS, STATES } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils';

const initialInfluencers = [
  { id: 1, name: 'CCI', baseValue: 95, adjustment: 0, unit: 'Points', desc: 'Consumer Confidence Index (CCI) measures the degree of optimism that consumers feel about the overall state of the economy and their personal financial situation.' },
  { id: 2, name: 'CPI', baseValue: 3.2, adjustment: 0, unit: '%', desc: 'Consumer Price Index (CPI) measures changes in the price level of a weighted average market basket of consumer goods and services purchased by households.' },
  { id: 3, name: 'Oil', baseValue: 57.26, adjustment: 0, unit: 'USD/bbl', desc: 'Crude oil prices impact transportation and production costs across many industries.' },
  { id: 4, name: 'GDP', baseValue: 731.418, adjustment: 0, unit: 'B USD', desc: 'Gross Domestic Product (GDP) is the total monetary or market value of all the finished goods and services produced within a country\'s borders in a specific time period.' },
  { id: 5, name: 'Unemployment', baseValue: 4.1, adjustment: 0, unit: '%', desc: 'The unemployment rate represents the number of unemployed as a percentage of the labor force.' },
  { id: 6, name: 'ROI', baseValue: 3.6, adjustment: 0, unit: '%', desc: 'Return on Investment (ROI) is a performance measure used to evaluate the efficiency or profitability of an investment.' },
];

const forecastTypes = ['Sales Forecast', 'COGS Forecast', 'SG & A Forecast'];

export default function ForecastingPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [availableLOBs, setAvailableLOBs] = useState<{label: string, value: string | number}[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [forecastType, setForecastType] = useState(forecastTypes[0]);
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInfluencerChange = (id: number, newAdjustment: number) => {
    setInfluencers(prev => prev.map(inf => inf.id === id ? { ...inf, adjustment: newAdjustment } : inf));
  };

  React.useEffect(() => {
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

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    try {
      const batchId = localStorage.getItem('upload_batch_id');
      const token = localStorage.getItem('auth_token');
      const getAdjusted = (name: string) => {
        const inf = influencers.find(i => i.name === name);
        if (!inf) return 0;
        return Number(((inf.baseValue || 0) * (1 + (inf.adjustment || 0) / 100)).toFixed(3));
      };

      const payload = {
        batch_id: Number(batchId),
        CCI: getAdjusted('CCI'),
        CPI: getAdjusted('CPI'),
        Oil: getAdjusted('Oil'),
        GDP: getAdjusted('GDP'),
        Unemployment: getAdjusted('Unemployment'),
        ROI: getAdjusted('ROI'),
      };

      const [res, heatmapRes] = await Promise.all([
        fetchWithRetry(`/api/ml/predict/from-batch/1?prediction_start=2021-01-01&prediction_end=2028-12-31`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        }).catch(e => { console.error("Predict API error", e); return null; }),
        
        fetchWithRetry(`/api/ml/heatmap/external-factors/append/1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        }).catch(e => { console.error("Heatmap API error", e); return null; })
      ]);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.predictions) {
          const grouped: Record<string, any> = {};
          data.predictions.forEach((row: any) => {
            const dateStr = row.order_date;
            if (!dateStr) return;
            const monthStr = dateStr.substring(0, 7);
            if (!grouped[monthStr]) {
              grouped[monthStr] = {
                actual_total_revenue: 0,
                predicted_total_revenue: 0,
                actual_COGS: 0,
                predicted_COGS: 0,
                actual_SGA: 0,
                predicted_SGA: 0,
              };
            }
            grouped[monthStr].actual_total_revenue += (row.actual_total_revenue || 0);
            grouped[monthStr].predicted_total_revenue += (row.predicted_total_revenue || 0);
            grouped[monthStr].actual_COGS += (row.actual_COGS || 0);
            grouped[monthStr].predicted_COGS += (row.predicted_COGS || 0);
            grouped[monthStr].actual_SGA += (row.actual_SGA || 0);
            grouped[monthStr].predicted_SGA += (row.predicted_SGA || 0);
          });
          
          const sortedMonths = Object.keys(grouped).sort();
          const finalData = sortedMonths.map(m => ({
            month: m,
            ...grouped[m]
          }));
          setChartData(finalData);
        }
      }

      if (heatmapRes && heatmapRes.ok) {
        const hData = await heatmapRes.json();
        setHeatmapData(hData);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const mappedChartData = useMemo(() => {
    return chartData.map(d => {
      let actual = null;
      let predicted = null;
      
      if (forecastType === 'Sales Forecast') {
        actual = d.actual_total_revenue > 0 ? d.actual_total_revenue : null;
        predicted = d.predicted_total_revenue > 0 ? d.predicted_total_revenue : null;
      } else if (forecastType === 'COGS Forecast') {
        actual = d.actual_COGS > 0 ? d.actual_COGS : null;
        predicted = d.predicted_COGS > 0 ? d.predicted_COGS : null;
      } else if (forecastType === 'SG & A Forecast') {
        actual = d.actual_SGA > 0 ? d.actual_SGA : null;
        predicted = d.predicted_SGA > 0 ? d.predicted_SGA : null;
      }
      
      return {
        month: d.month,
        actual,
        predicted
      };
    });
  }, [chartData, forecastType]);

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
          {/* Page Header & Forecast Type Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Forecasting Engine</h1>
              <p className="text-sm text-zinc-500 font-medium">AI-powered financial projections and scenario exploration.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isGenerating ? 'RUNNING AI...' : 'RUN FORECAST'}
              </button>
              <div className="relative group">
                <select 
                  value={forecastType}
                  onChange={(e) => setForecastType(e.target.value)}
                  className="appearance-none bg-zinc-800 text-white px-6 py-2.5 pr-12 rounded-xl text-sm font-bold cursor-pointer hover:bg-zinc-700 transition-all outline-none"
                >
                  {forecastTypes.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
              </div>
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
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                )}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Region</span>
              </div>
              <select 
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedState('ALL');
                }}
                disabled
                className="bg-transparent text-xs font-bold text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed text-right max-w-[120px]"
              >
                <option value="ALL">ALL</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">State</span>
              </div>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled
                className="bg-transparent text-xs font-bold text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed text-right max-w-[120px]"
              >
                <option value="ALL">ALL</option>
                {selectedRegion !== 'ALL' && STATES[selectedRegion].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {[
              { icon: Layers, label: 'P&L', value: 'Y' },
              { icon: PieChart, label: 'Cust Seg', value: 'ALL' },
              { icon: Users, label: 'Cust', value: 'ALL' },
              { icon: Box, label: 'Prod Cat', value: 'ALL' },
              { icon: BarChart3, label: 'Prod', value: 'ALL' },
            ].map((filter, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <filter.icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{filter.label}</span>
                </div>
                <select 
                  disabled
                  className="bg-transparent text-xs font-bold text-zinc-500 dark:text-zinc-400 outline-none cursor-not-allowed text-right max-w-[120px]"
                >
                  <option>{filter.value}</option>
                </select>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Forecast Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{forecastType} Analysis</h3>
                  <p className="text-xs text-zinc-500 font-medium">Historical performance vs AI prediction model</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  CONFIDENCE: 94.2%
                </div>
              </div>
              
              {mappedChartData.length > 0 ? (
                <ForecastChart data={mappedChartData} />
              ) : (
                <div className="h-[400px] w-full flex items-center justify-center flex-col gap-3">
                  <Activity className="w-8 h-8 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-500">Click 'RUN FORECAST' to generate predictions</span>
                </div>
              )}
            </motion.div>

            {/* Influencer Heat Map */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="xl:col-span-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">Influencer Heat Map</h3>
              <p className="text-xs text-zinc-500 font-medium mb-6">Correlation matrix of key market drivers</p>
              <InfluencerHeatMap data={heatmapData} />
            </motion.div>
          </div>

          {/* Scenario Explorer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TableIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Scenario Explorer</h3>
                <p className="text-xs text-zinc-500 font-medium">Adjust influencer values to simulate different market conditions.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {influencers.map((inf) => {
                const base = inf.baseValue || 0;
                const adj = inf.adjustment || 0;
                const adjustedValue = Number((base * (1 + adj / 100)).toFixed(3));
                return (
                  <div key={inf.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 gap-4">
                    <div className="flex flex-col gap-1 md:w-1/3">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-white group relative w-fit">
                        {inf.name}
                        {inf.desc && (
                          <div className="relative flex items-center">
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg shadow-lg z-10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-zinc-900 dark:before:border-t-zinc-800 text-center font-medium leading-relaxed">
                              {inf.desc}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <span>Base: {base} {inf.unit}</span>
                        <span>→</span>
                        <span className={cn(
                          adj > 0 ? "text-emerald-500" : adj < 0 ? "text-rose-500" : "text-indigo-500"
                        )}>New: {adjustedValue} {inf.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-4 max-w-md w-full">
                      <input 
                        type="range" 
                        min="-50"
                        max="50"
                        value={adj}
                        onChange={(e) => handleInfluencerChange(inf.id, parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className={cn(
                        "text-xs font-bold w-14 text-center py-1 px-2 rounded-md",
                        adj > 0 ? "bg-emerald-500/10 text-emerald-500" : adj < 0 ? "bg-rose-500/10 text-rose-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      )}>
                        {adj > 0 ? '+' : ''}{adj}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
