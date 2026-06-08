'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { Header } from '@/components/Dashboard/Header';
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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIONS, STATES } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const initialInfluencers = [
  { id: 1, name: 'Market Demand', value: 0 },
  { id: 2, name: 'Interest Rates', value: 0 },
  { id: 3, name: 'Competitor Pricing', value: 0 },
  { id: 4, name: 'Supply Chain Efficiency', value: 0 },
  { id: 5, name: 'Labor Costs', value: 0 },
  { id: 6, name: 'Consumer Confidence', value: 0 },
  { id: 7, name: 'Regulatory Changes', value: 0 },
  { id: 8, name: 'Tech Innovation', value: 0 },
  { id: 9, name: 'Marketing Spend', value: 0 },
  { id: 10, name: 'Seasonality Factor', value: 0 },
];

const forecastTypes = ['Sales Forecast', 'COGS Forecast', 'SG & A Forecast'];

export default function ForecastingPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedLOB, setSelectedLOB] = useState('Home & Lifestyle');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [forecastType, setForecastType] = useState(forecastTypes[0]);
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleInfluencerChange = (id: number, newValue: number) => {
    setInfluencers(prev => prev.map(inf => inf.id === id ? { ...inf, value: newValue } : inf));
  };

  const forecastData = useMemo(() => {
    // Base data with slight variations based on filters
    const regionMultiplier = selectedRegion === 'ALL' ? 1 : 0.8 + (REGIONS.indexOf(selectedRegion) * 0.1);
    const stateIndex = selectedRegion !== 'ALL' ? STATES[selectedRegion].indexOf(selectedState) : 0;
    const stateMultiplier = selectedState === 'ALL' ? 1 : 0.9 + (stateIndex * 0.05);
    const baseMultiplier = regionMultiplier * stateMultiplier;

    // Adjust base values based on forecast type
    let typeMultiplier = 1;
    let volatility = 0.1;
    
    if (forecastType === 'COGS Forecast') {
      typeMultiplier = 0.65; // COGS is typically ~65% of sales for furniture
      volatility = 0.05;
    } else if (forecastType === 'SG & A Forecast') {
      typeMultiplier = 0.25; // SG&A is typically ~25% of sales
      volatility = 0.02;
    }

    const base = [
      { month: 1, value: 2200 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 2, value: 2100 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 3, value: 4000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 4, value: 3000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 5, value: 3100 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 6, value: 6000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 7, value: 4100 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 8, value: 5000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 9, value: 7000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 10, value: 4000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 11, value: 5000 * baseMultiplier * typeMultiplier, type: 'historical' },
      { month: 12, value: 8000 * baseMultiplier * typeMultiplier, type: 'historical' },
    ];

    // Calculate impact based on influencers
    const totalImpact = influencers.reduce((acc, inf) => acc + inf.value, 0) / 10;
    
    const predictions = [
      { month: 13, value: 6000 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
      { month: 14, value: 6100 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
      { month: 15, value: 9000 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
      { month: 16, value: 6000 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
      { month: 17, value: 7000 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
      { month: 18, value: 11000 * baseMultiplier * typeMultiplier * (1 + totalImpact / 100), type: 'prediction' },
    ];

    return [...base, ...predictions];
  }, [influencers, selectedRegion, selectedState, forecastType]);

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
          {/* Page Header & Forecast Type Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Forecasting Engine</h1>
              <p className="text-sm text-zinc-500 font-medium">AI-powered financial projections and scenario exploration.</p>
            </div>
            
            <div className="relative group">
              <select 
                value={forecastType}
                onChange={(e) => setForecastType(e.target.value)}
                className="appearance-none bg-indigo-600 text-white px-6 py-2.5 pr-12 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-pointer hover:bg-indigo-700 transition-all outline-none"
              >
                {forecastTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
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
                className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Home & Lifestyle">Home & Lifestyle</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
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
                className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="ALL">ALL</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">State</span>
              </div>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
                disabled={selectedRegion === 'ALL'}
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
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <filter.icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{filter.label}</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors">{filter.value}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Forecast Dashboard Timeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold mb-4 text-zinc-900 dark:text-white uppercase tracking-wider">Forecast Timeline (36 Months)</h3>
            <div className="flex overflow-x-auto pb-4 gap-1 scrollbar-hide">
              {Array.from({ length: 37 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-12 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                    Mo. {i}
                  </div>
                  <div className={cn(
                    "w-full h-1 rounded-full",
                    i < 12 ? "bg-indigo-500" : "bg-emerald-500"
                  )} />
                </div>
              ))}
            </div>
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
              <ForecastChart data={forecastData} />
            </motion.div>

            {/* Influencer Heat Map */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="xl:col-span-4 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">Influencer Heat Map</h3>
              <p className="text-xs text-zinc-500 font-medium mb-6">Correlation matrix of key market drivers</p>
              <InfluencerHeatMap />
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Influencers</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Value</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-1/3">Adjustment</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.map((inf) => (
                    <tr key={inf.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                      <td className="py-4 px-4 text-sm font-bold text-zinc-900 dark:text-white">{inf.name}</td>
                      <td className="py-4 px-4 text-sm font-medium text-zinc-500">
                        {100 + inf.id * 50} Units
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="-50"
                            max="50"
                            value={inf.value}
                            onChange={(e) => handleInfluencerChange(inf.id, parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                          />
                          <span className={cn(
                            "text-xs font-bold w-12 text-right",
                            inf.value > 0 ? "text-emerald-500" : inf.value < 0 ? "text-rose-500" : "text-zinc-400"
                          )}>
                            {inf.value > 0 ? '+' : ''}{inf.value}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
