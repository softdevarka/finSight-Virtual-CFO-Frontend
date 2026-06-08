
export interface FinancialMetric {
  actual: number;
  forecasted: number;
  change: number;
}

export interface YearData {
  revenue: FinancialMetric;
  grossProfit: FinancialMetric;
  ebit: FinancialMetric;
  ebitPercent: FinancialMetric;
  opEx: FinancialMetric;
  netIncome: FinancialMetric;
  eva: number;
  roa: number;
  roe: number;
  debtToEquity: number;
  wcRatio: number;
  peRatio: number;
  berryRatio: number;
}

export interface LOBData {
  [year: string]: YearData;
}

// Data specifically for Home & Lifestyle with 98% accuracy for historical years
export const MOCK_FINANCIAL_DATA: { [lob: string]: LOBData } = {
  'Home & Lifestyle': {
    '2023': {
      revenue: { actual: 10.2, forecasted: 10.4, change: 4.1 },
      grossProfit: { actual: 6.8, forecasted: 6.9, change: 4.6 },
      ebit: { actual: 3.4, forecasted: 3.45, change: 6.2 },
      ebitPercent: { actual: 33.3, forecasted: 33.1, change: 2.1 },
      opEx: { actual: 2.8, forecasted: 2.85, change: 3.7 },
      netIncome: { actual: 2.4, forecasted: 2.44, change: 9.1 },
      eva: 1.12, roa: 12.5, roe: 18.4, debtToEquity: 1.85, wcRatio: 0.88, peRatio: 32, berryRatio: 1.12
    },
    '2024': {
      revenue: { actual: 11.8, forecasted: 12.0, change: 4.5 },
      grossProfit: { actual: 7.9, forecasted: 8.0, change: 2.7 },
      ebit: { actual: 3.9, forecasted: 4.0, change: 5.5 },
      ebitPercent: { actual: 33.0, forecasted: 33.3, change: 0.9 },
      opEx: { actual: 3.1, forecasted: 3.15, change: 3.4 },
      netIncome: { actual: 2.7, forecasted: 2.75, change: 4.0 },
      eva: 1.18, roa: 13.2, roe: 19.8, debtToEquity: 1.75, wcRatio: 0.85, peRatio: 30, berryRatio: 1.11
    },
    '2025': {
      revenue: { actual: 13.5, forecasted: 13.8, change: 5.1 },
      grossProfit: { actual: 8.9, forecasted: 9.1, change: 3.8 },
      ebit: { actual: 4.4, forecasted: 4.5, change: 7.9 },
      ebitPercent: { actual: 32.6, forecasted: 32.6, change: 2.8 },
      opEx: { actual: 3.4, forecasted: 3.5, change: 3.2 },
      netIncome: { actual: 3.1, forecasted: 3.15, change: 7.7 },
      eva: 1.24, roa: 14.2, roe: 22.5, debtToEquity: 1.68, wcRatio: 0.82, peRatio: 38, berryRatio: 1.10
    },
    '2026': {
      // April 2026: Actual is YTD (approx 3.5 months), Forecast is for full year
      revenue: { actual: 4.2, forecasted: 15.2, change: 4.5 }, 
      grossProfit: { actual: 2.8, forecasted: 10.1, change: 3.4 },
      ebit: { actual: 1.4, forecasted: 5.1, change: 7.0 },
      ebitPercent: { actual: 33.3, forecasted: 33.5, change: 2.5 },
      opEx: { actual: 1.1, forecasted: 3.9, change: 2.9 },
      netIncome: { actual: 0.9, forecasted: 3.6, change: 6.7 },
      eva: 1.32, roa: 15.1, roe: 24.2, debtToEquity: 1.62, wcRatio: 0.80, peRatio: 42, berryRatio: 1.09
    }
  }
};

export const REGIONS = ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'];
export const STATES: { [region: string]: string[] } = {
  'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast'],
  'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
  'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville'],
  'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Geraldton'],
  'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Gawler'],
  'Tasmania': ['Hobart', 'Launceston', 'Devonport', 'Burnie']
};

export const TREND_DATA = [
  { name: '2020', revenue: 4200000, ebit: 1200000, netIncome: 800000 },
  { name: '2021', revenue: 4800000, ebit: 1400000, netIncome: 950000 },
  { name: '2022', revenue: 5100000, ebit: 1550000, netIncome: 1100000 },
  { name: '2023', revenue: 10200000, ebit: 3400000, netIncome: 2400000 },
  { name: '2024', revenue: 11500000, ebit: 3800000, netIncome: 2600000 },
  { name: '2025', revenue: 12400000, ebit: 4100000, netIncome: 2800000 },
  { name: '2026', revenue: 13800000, ebit: 4600000, netIncome: 3200000 },
];

export const COST_DATA = [
  { name: 'COGS', value: 75.32, color: '#6366f1' },
  { name: 'D&A', value: 2.05, color: '#8b5cf6' },
  { name: 'SG&A', value: 21.38, color: '#a855f7' },
  { name: 'Unusual', value: 0.30, color: '#d946ef' },
  { name: 'Interest', value: 0.51, color: '#ec4899' },
  { name: 'Tax', value: 1.04, color: '#f43f5e' },
];

export const CUSTOMER_SEGMENTS = [
  {
    name: 'Strategic Accounts',
    children: [
      { name: 'Global Corp A', size: 2400, segment: 'Segment 1' },
      { name: 'Tech Giant B', size: 1800, segment: 'Segment 1' },
      { name: 'Retail King C', size: 1200, segment: 'Segment 1' },
    ],
  },
  {
    name: 'Mid-Market',
    children: [
      { name: 'Growth Co D', size: 900, segment: 'Segment 2' },
      { name: 'Innovate Ltd E', size: 750, segment: 'Segment 2' },
      { name: 'Service Pro F', size: 600, segment: 'Segment 2' },
    ],
  },
  {
    name: 'Emerging',
    children: [
      { name: 'Startup G', size: 400, segment: 'Segment 3' },
      { name: 'Local Biz H', size: 300, segment: 'Segment 3' },
      { name: 'Niche Inc I', size: 250, segment: 'Segment 3' },
    ],
  },
];
