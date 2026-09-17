// Tourism Demand & Source Market Datasets for Tourisma Dashboard

export interface TimeSeriesPoint {
  period: string; // e.g. '2019 Q1'
  year: number;
  quarter: number;
  domestic: number; // Millions
  international: number; // Millions
  total: number;
  domesticShare: number; // Percentage 0-100
  internationalShare: number; // Percentage 0-100
}

export interface SourceMarket {
  rank: number;
  country: string;
  code: string;
  flag: string;
  region: 'ASEAN' | 'East Asia' | 'Europe' | 'Oceania' | 'South Asia' | 'Middle East' | 'Americas';
  arrivals: number; // Millions of visitors
  receipts: number; // RM Billions
  receiptsPerArrival: number; // RM per visitor
  avgStayNights: number;
  yoyGrowth: number; // Percentage
}

export interface StateSeasonality {
  stateId: string;
  stateName: string;
  code: string;
  // 12 monthly index values where 100 = that state's monthly average
  monthlyIndex: number[];
  peakMonth: string;
  troughMonth: string;
  peakToTroughRatio: number;
  peakVolumeM: number;
  annualTotalM: number;
}

export interface ForecastDataPoint {
  date: string; // e.g. '2024 Q1'
  year: number;
  quarter: string;
  isForecast: boolean;
  actual?: number; // Millions
  forecast?: number; // Millions
  lowerBound?: number; // Millions (95% CI)
  upperBound?: number; // Millions (95% CI)
}

export interface StateForecastMap {
  [stateId: string]: {
    stateName: string;
    historicalAverage: number;
    points: ForecastDataPoint[];
  };
}

export interface ModelCardMetadata {
  algorithm: string;
  trainingWindow: string;
  validationWindow: string;
  mape: number; // %
  rmse: number; // M
  rSquared: number;
  featuresUsed: string[];
  limitations: string[];
  lastUpdated: string;
}

export interface LengthOfStayItem {
  stateId: string;
  stateName: string;
  nights: number;
  regionalAvg: number;
}

export interface PurposeSplitItem {
  purpose: string;
  sharePct: number;
  volumeM: number;
  color: string;
  description: string;
}

export interface SpendPerTripItem {
  stateId: string;
  stateName: string;
  spendRM: number;
  domesticSpendRM: number;
  internationalSpendRM: number;
}

// 1. Composition: Historical Quarterly Arrivals (2019 Q1 - 2026 Q4)
export const COMPOSITION_TIME_SERIES: TimeSeriesPoint[] = [
  { period: '2019 Q1', year: 2019, quarter: 1, domestic: 54.2, international: 6.7, total: 60.9, domesticShare: 89.0, internationalShare: 11.0 },
  { period: '2019 Q2', year: 2019, quarter: 2, domestic: 58.6, international: 6.6, total: 65.2, domesticShare: 89.9, internationalShare: 10.1 },
  { period: '2019 Q3', year: 2019, quarter: 3, domestic: 61.4, international: 6.8, total: 68.2, domesticShare: 90.0, internationalShare: 10.0 },
  { period: '2019 Q4', year: 2019, quarter: 4, domestic: 64.9, international: 6.0, total: 70.9, domesticShare: 91.5, internationalShare: 8.5 },
  { period: '2020 Q1', year: 2020, quarter: 1, domestic: 38.5, international: 4.2, total: 42.7, domesticShare: 90.2, internationalShare: 9.8 },
  { period: '2020 Q2', year: 2020, quarter: 2, domestic: 12.1, international: 0.1, total: 12.2, domesticShare: 99.2, internationalShare: 0.8 },
  { period: '2020 Q3', year: 2020, quarter: 3, domestic: 42.6, international: 0.1, total: 42.7, domesticShare: 99.8, internationalShare: 0.2 },
  { period: '2020 Q4', year: 2020, quarter: 4, domestic: 38.2, international: 0.1, total: 38.3, domesticShare: 99.7, internationalShare: 0.3 },
  { period: '2021 Q1', year: 2021, quarter: 1, domestic: 19.8, international: 0.05, total: 19.85, domesticShare: 99.7, internationalShare: 0.3 },
  { period: '2021 Q2', year: 2021, quarter: 2, domestic: 14.5, international: 0.04, total: 14.54, domesticShare: 99.7, internationalShare: 0.3 },
  { period: '2021 Q3', year: 2021, quarter: 3, domestic: 11.2, international: 0.03, total: 11.23, domesticShare: 99.7, internationalShare: 0.3 },
  { period: '2021 Q4', year: 2021, quarter: 4, domestic: 54.4, international: 0.08, total: 54.48, domesticShare: 99.9, internationalShare: 0.1 },
  { period: '2022 Q1', year: 2022, quarter: 1, domestic: 39.8, international: 0.4, total: 40.2, domesticShare: 99.0, internationalShare: 1.0 },
  { period: '2022 Q2', year: 2022, quarter: 2, domestic: 45.6, international: 2.1, total: 47.7, domesticShare: 95.6, internationalShare: 4.4 },
  { period: '2022 Q3', year: 2022, quarter: 3, domestic: 48.2, international: 3.4, total: 51.6, domesticShare: 93.4, internationalShare: 6.6 },
  { period: '2022 Q4', year: 2022, quarter: 4, domestic: 52.8, international: 4.2, total: 57.0, domesticShare: 92.6, internationalShare: 7.4 },
  { period: '2023 Q1', year: 2023, quarter: 1, domestic: 48.6, international: 4.4, total: 53.0, domesticShare: 91.7, internationalShare: 8.3 },
  { period: '2023 Q2', year: 2023, quarter: 2, domestic: 51.8, international: 4.8, total: 56.6, domesticShare: 91.5, internationalShare: 8.5 },
  { period: '2023 Q3', year: 2023, quarter: 3, domestic: 54.2, international: 5.3, total: 59.5, domesticShare: 91.1, internationalShare: 8.9 },
  { period: '2023 Q4', year: 2023, quarter: 4, domestic: 59.1, international: 5.6, total: 64.7, domesticShare: 91.3, internationalShare: 8.7 },
  { period: '2024 Q1', year: 2024, quarter: 1, domestic: 53.4, international: 5.8, total: 59.2, domesticShare: 90.2, internationalShare: 9.8 },
  { period: '2024 Q2', year: 2024, quarter: 2, domestic: 56.7, international: 6.1, total: 62.8, domesticShare: 90.3, internationalShare: 9.7 },
  { period: '2024 Q3', year: 2024, quarter: 3, domestic: 59.8, international: 6.7, total: 66.5, domesticShare: 89.9, internationalShare: 10.1 },
  { period: '2024 Q4', year: 2024, quarter: 4, domestic: 65.2, international: 7.1, total: 72.3, domesticShare: 90.2, internationalShare: 9.8 },
  { period: '2025 Q1', year: 2025, quarter: 1, domestic: 56.1, international: 6.9, total: 63.0, domesticShare: 89.0, internationalShare: 11.0 },
  { period: '2025 Q2', year: 2025, quarter: 2, domestic: 59.4, international: 7.3, total: 66.7, domesticShare: 89.1, internationalShare: 10.9 },
  { period: '2025 Q3', year: 2025, quarter: 3, domestic: 63.0, international: 7.9, total: 70.9, domesticShare: 88.9, internationalShare: 11.1 },
  { period: '2025 Q4', year: 2025, quarter: 4, domestic: 68.8, international: 8.2, total: 77.0, domesticShare: 89.4, internationalShare: 10.6 },
  { period: '2026 Q1', year: 2026, quarter: 1, domestic: 58.9, international: 7.4, total: 66.3, domesticShare: 88.8, internationalShare: 11.2 },
  { period: '2026 Q2', year: 2026, quarter: 2, domestic: 62.4, international: 8.0, total: 70.4, domesticShare: 88.6, internationalShare: 11.4 },
  { period: '2026 Q3', year: 2026, quarter: 3, domestic: 66.2, international: 8.7, total: 74.9, domesticShare: 88.4, internationalShare: 11.6 },
  { period: '2026 Q4', year: 2026, quarter: 4, domestic: 72.5, international: 9.0, total: 81.5, domesticShare: 89.0, internationalShare: 11.0 },
];

// 2. Top 15 International Source Markets (Arrivals Volume vs Receipts Yield Contrast)
export const TOP_15_SOURCE_MARKETS: SourceMarket[] = [
  { rank: 1, country: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'ASEAN', arrivals: 8.92, receipts: 13.56, receiptsPerArrival: 1520, avgStayNights: 2.8, yoyGrowth: 8.4 },
  { rank: 2, country: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'ASEAN', arrivals: 4.15, receipts: 7.47, receiptsPerArrival: 1800, avgStayNights: 4.2, yoyGrowth: 12.1 },
  { rank: 3, country: 'China', code: 'CN', flag: '🇨🇳', region: 'East Asia', arrivals: 3.65, receipts: 14.82, receiptsPerArrival: 4060, avgStayNights: 6.5, yoyGrowth: 46.2 },
  { rank: 4, country: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'ASEAN', arrivals: 2.10, receipts: 3.36, receiptsPerArrival: 1600, avgStayNights: 3.1, yoyGrowth: 6.8 },
  { rank: 5, country: 'Brunei', code: 'BN', flag: '🇧🇳', region: 'ASEAN', arrivals: 1.48, receipts: 2.81, receiptsPerArrival: 1900, avgStayNights: 3.4, yoyGrowth: 5.3 },
  { rank: 6, country: 'India', code: 'IN', flag: '🇮🇳', region: 'South Asia', arrivals: 1.25, receipts: 4.88, receiptsPerArrival: 3900, avgStayNights: 6.8, yoyGrowth: 28.5 },
  { rank: 7, country: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'East Asia', arrivals: 0.78, receipts: 3.67, receiptsPerArrival: 4700, avgStayNights: 5.9, yoyGrowth: 18.2 },
  { rank: 8, country: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', arrivals: 0.62, receipts: 3.29, receiptsPerArrival: 5300, avgStayNights: 8.4, yoyGrowth: 11.4 },
  { rank: 9, country: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe', arrivals: 0.54, receipts: 3.13, receiptsPerArrival: 5800, avgStayNights: 9.6, yoyGrowth: 9.7 },
  { rank: 10, country: 'Japan', code: 'JP', flag: '🇯🇵', region: 'East Asia', arrivals: 0.49, receipts: 2.16, receiptsPerArrival: 4400, avgStayNights: 5.4, yoyGrowth: 14.8 },
  { rank: 11, country: 'Philippines', code: 'PH', flag: '🇵🇭', region: 'ASEAN', arrivals: 0.46, receipts: 1.01, receiptsPerArrival: 2200, avgStayNights: 4.5, yoyGrowth: 8.9 },
  { rank: 12, country: 'United States', code: 'US', flag: '🇺🇸', region: 'Americas', arrivals: 0.38, receipts: 2.17, receiptsPerArrival: 5700, avgStayNights: 9.1, yoyGrowth: 15.3 },
  { rank: 13, country: 'Taiwan', code: 'TW', flag: '🇹🇼', region: 'East Asia', arrivals: 0.35, receipts: 1.47, receiptsPerArrival: 4200, avgStayNights: 5.1, yoyGrowth: 16.5 },
  { rank: 14, country: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East', arrivals: 0.28, receipts: 2.44, receiptsPerArrival: 8700, avgStayNights: 11.2, yoyGrowth: 22.4 },
  { rank: 15, country: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', arrivals: 0.24, receipts: 1.39, receiptsPerArrival: 5800, avgStayNights: 10.3, yoyGrowth: 10.2 },
];

// 3. Seasonality: 16 States × 12 Months Indexed Demand Matrix (100 = state monthly baseline)
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const STATE_SEASONALITY_DATA: StateSeasonality[] = [
  {
    stateId: 'terengganu',
    stateName: 'Terengganu',
    code: 'TRG',
    // Monsoon (Nov-Jan) very low, July-Aug peak island season
    monthlyIndex: [58, 65, 88, 112, 128, 142, 164, 158, 122, 94, 62, 52],
    peakMonth: 'Jul (164)',
    troughMonth: 'Dec (52)',
    peakToTroughRatio: 3.15,
    peakVolumeM: 1.31,
    annualTotalM: 9.6,
  },
  {
    stateId: 'kelantan',
    stateName: 'Kelantan',
    code: 'KTN',
    monthlyIndex: [64, 72, 90, 106, 124, 138, 148, 136, 114, 92, 68, 56],
    peakMonth: 'Jul (148)',
    troughMonth: 'Dec (56)',
    peakToTroughRatio: 2.64,
    peakVolumeM: 0.81,
    annualTotalM: 6.5,
  },
  {
    stateId: 'perlis',
    stateName: 'Perlis',
    code: 'PLS',
    // Harumanis mango season peak in Apr-May
    monthlyIndex: [78, 85, 94, 142, 156, 124, 98, 92, 86, 84, 90, 112],
    peakMonth: 'May (156)',
    troughMonth: 'Jan (78)',
    peakToTroughRatio: 2.00,
    peakVolumeM: 0.16,
    annualTotalM: 1.2,
  },
  {
    stateId: 'pahang',
    stateName: 'Pahang',
    code: 'PHG',
    // Highlands year-round, Tioman peak July, school holidays Dec
    monthlyIndex: [74, 82, 96, 102, 118, 124, 136, 128, 104, 90, 94, 132],
    peakMonth: 'Jul (136)',
    troughMonth: 'Jan (74)',
    peakToTroughRatio: 1.84,
    peakVolumeM: 1.74,
    annualTotalM: 15.4,
  },
  {
    stateId: 'sabah',
    stateName: 'Sabah',
    code: 'SBH',
    // European/Chinese summer holidays Jul-Aug, diving peak
    monthlyIndex: [82, 88, 92, 104, 112, 118, 144, 138, 108, 96, 92, 114],
    peakMonth: 'Jul (144)',
    troughMonth: 'Jan (82)',
    peakToTroughRatio: 1.76,
    peakVolumeM: 0.98,
    annualTotalM: 8.2,
  },
  {
    stateId: 'penang',
    stateName: 'Penang',
    code: 'PNG',
    // Year-end holiday peak & CNY
    monthlyIndex: [112, 118, 92, 88, 96, 108, 94, 92, 88, 90, 104, 134],
    peakMonth: 'Dec (134)',
    troughMonth: 'Apr (88)',
    peakToTroughRatio: 1.52,
    peakVolumeM: 1.34,
    annualTotalM: 12.0,
  },
  {
    stateId: 'melaka',
    stateName: 'Melaka',
    code: 'MLK',
    // Weekend & holiday driven, Dec peak
    monthlyIndex: [106, 112, 94, 86, 98, 116, 92, 90, 88, 92, 108, 132],
    peakMonth: 'Dec (132)',
    troughMonth: 'Apr (86)',
    peakToTroughRatio: 1.53,
    peakVolumeM: 0.98,
    annualTotalM: 8.9,
  },
  {
    stateId: 'kedah',
    stateName: 'Kedah',
    code: 'KDH',
    // Langkawi high season Nov-Mar
    monthlyIndex: [126, 122, 108, 86, 88, 92, 90, 88, 84, 92, 112, 130],
    peakMonth: 'Dec (130)',
    troughMonth: 'Sep (84)',
    peakToTroughRatio: 1.55,
    peakVolumeM: 0.89,
    annualTotalM: 8.2,
  },
  {
    stateId: 'sarawak',
    stateName: 'Sarawak',
    code: 'SWK',
    // Rainforest Music Fest (Jul), Gawai (Jun)
    monthlyIndex: [86, 90, 94, 98, 108, 126, 134, 116, 98, 92, 94, 110],
    peakMonth: 'Jul (134)',
    troughMonth: 'Jan (86)',
    peakToTroughRatio: 1.56,
    peakVolumeM: 0.58,
    annualTotalM: 5.2,
  },
  {
    stateId: 'perak',
    stateName: 'Perak',
    code: 'PRK',
    monthlyIndex: [96, 102, 94, 92, 104, 112, 98, 94, 92, 96, 106, 124],
    peakMonth: 'Dec (124)',
    troughMonth: 'Apr (92)',
    peakToTroughRatio: 1.35,
    peakVolumeM: 1.63,
    annualTotalM: 15.8,
  },
  {
    stateId: 'johor',
    stateName: 'Johor',
    code: 'JHR',
    // Singapore cross-border weekend steady demand
    monthlyIndex: [102, 108, 96, 92, 98, 110, 96, 94, 94, 96, 104, 120],
    peakMonth: 'Dec (120)',
    troughMonth: 'Apr (92)',
    peakToTroughRatio: 1.30,
    peakVolumeM: 2.25,
    annualTotalM: 22.5,
  },
  {
    stateId: 'negeri_sembilan',
    stateName: 'Negeri Sembilan',
    code: 'NSN',
    monthlyIndex: [98, 104, 94, 90, 98, 112, 96, 92, 92, 94, 106, 118],
    peakMonth: 'Dec (118)',
    troughMonth: 'Apr (90)',
    peakToTroughRatio: 1.31,
    peakVolumeM: 0.72,
    annualTotalM: 7.3,
  },
  {
    stateId: 'labuan',
    stateName: 'Labuan',
    code: 'LBN',
    monthlyIndex: [92, 96, 98, 102, 106, 114, 118, 108, 96, 94, 98, 108],
    peakMonth: 'Jul (118)',
    troughMonth: 'Jan (92)',
    peakToTroughRatio: 1.28,
    peakVolumeM: 0.11,
    annualTotalM: 1.1,
  },
  {
    stateId: 'kuala_lumpur',
    stateName: 'Kuala Lumpur',
    code: 'KUL',
    // Capital city: strong year-round corporate + leisure
    monthlyIndex: [98, 102, 98, 94, 96, 104, 102, 100, 96, 98, 104, 116],
    peakMonth: 'Dec (116)',
    troughMonth: 'Apr (94)',
    peakToTroughRatio: 1.23,
    peakVolumeM: 2.73,
    annualTotalM: 28.2,
  },
  {
    stateId: 'selangor',
    stateName: 'Selangor',
    code: 'SGR',
    // Strong domestic baseline, very resilient
    monthlyIndex: [96, 100, 98, 95, 98, 106, 101, 98, 97, 98, 103, 112],
    peakMonth: 'Dec (112)',
    troughMonth: 'Apr (95)',
    peakToTroughRatio: 1.18,
    peakVolumeM: 3.19,
    annualTotalM: 34.2,
  },
  {
    stateId: 'putrajaya',
    stateName: 'Putrajaya',
    code: 'PJY',
    // Administrative + convention center
    monthlyIndex: [95, 98, 100, 96, 98, 104, 100, 98, 99, 101, 104, 108],
    peakMonth: 'Dec (108)',
    troughMonth: 'Jan (95)',
    peakToTroughRatio: 1.14,
    peakVolumeM: 0.28,
    annualTotalM: 3.1,
  },
];

// 4. Forecast Section: National & State Historical (2021-2026) + Projections (2027-2029)
export const FORECAST_DATA: StateForecastMap = {
  all: {
    stateName: 'All Malaysia',
    historicalAverage: 24.8,
    points: [
      { date: '2023 Q1', year: 2023, quarter: 'Q1', isForecast: false, actual: 53.0 },
      { date: '2023 Q2', year: 2023, quarter: 'Q2', isForecast: false, actual: 56.6 },
      { date: '2023 Q3', year: 2023, quarter: 'Q3', isForecast: false, actual: 59.5 },
      { date: '2023 Q4', year: 2023, quarter: 'Q4', isForecast: false, actual: 64.7 },
      { date: '2024 Q1', year: 2024, quarter: 'Q1', isForecast: false, actual: 59.2 },
      { date: '2024 Q2', year: 2024, quarter: 'Q2', isForecast: false, actual: 62.8 },
      { date: '2024 Q3', year: 2024, quarter: 'Q3', isForecast: false, actual: 66.5 },
      { date: '2024 Q4', year: 2024, quarter: 'Q4', isForecast: false, actual: 72.3 },
      { date: '2025 Q1', year: 2025, quarter: 'Q1', isForecast: false, actual: 63.0 },
      { date: '2025 Q2', year: 2025, quarter: 'Q2', isForecast: false, actual: 66.7 },
      { date: '2025 Q3', year: 2025, quarter: 'Q3', isForecast: false, actual: 70.9 },
      { date: '2025 Q4', year: 2025, quarter: 'Q4', isForecast: false, actual: 77.0 },
      { date: '2026 Q1', year: 2026, quarter: 'Q1', isForecast: false, actual: 66.3 },
      { date: '2026 Q2', year: 2026, quarter: 'Q2', isForecast: false, actual: 70.4 },
      { date: '2026 Q3', year: 2026, quarter: 'Q3', isForecast: false, actual: 74.9 },
      { date: '2026 Q4', year: 2026, quarter: 'Q4', isForecast: false, actual: 81.5 },
      // Forecast 2027 (Horizon 1)
      { date: '2027 Q1', year: 2027, quarter: 'Q1', isForecast: true, forecast: 71.8, lowerBound: 68.2, upperBound: 75.4 },
      { date: '2027 Q2', year: 2027, quarter: 'Q2', isForecast: true, forecast: 76.2, lowerBound: 72.0, upperBound: 80.4 },
      { date: '2027 Q3', year: 2027, quarter: 'Q3', isForecast: true, forecast: 81.0, lowerBound: 76.1, upperBound: 85.9 },
      { date: '2027 Q4', year: 2027, quarter: 'Q4', isForecast: true, forecast: 88.3, lowerBound: 82.5, upperBound: 94.1 },
      // Forecast 2028 (Horizon 2)
      { date: '2028 Q1', year: 2028, quarter: 'Q1', isForecast: true, forecast: 77.5, lowerBound: 71.9, upperBound: 83.1 },
      { date: '2028 Q2', year: 2028, quarter: 'Q2', isForecast: true, forecast: 82.4, lowerBound: 76.0, upperBound: 88.8 },
      { date: '2028 Q3', year: 2028, quarter: 'Q3', isForecast: true, forecast: 87.6, lowerBound: 80.2, upperBound: 95.0 },
      { date: '2028 Q4', year: 2028, quarter: 'Q4', isForecast: true, forecast: 95.5, lowerBound: 87.0, upperBound: 104.0 },
      // Forecast 2029 (Horizon 3)
      { date: '2029 Q1', year: 2029, quarter: 'Q1', isForecast: true, forecast: 83.7, lowerBound: 75.8, upperBound: 91.6 },
      { date: '2029 Q2', year: 2029, quarter: 'Q2', isForecast: true, forecast: 89.0, lowerBound: 80.1, upperBound: 97.9 },
      { date: '2029 Q3', year: 2029, quarter: 'Q3', isForecast: true, forecast: 94.8, lowerBound: 84.8, upperBound: 104.8 },
      { date: '2029 Q4', year: 2029, quarter: 'Q4', isForecast: true, forecast: 103.2, lowerBound: 91.8, upperBound: 114.6 },
    ],
  },
  selangor: {
    stateName: 'Selangor',
    historicalAverage: 8.5,
    points: [
      { date: '2025 Q1', year: 2025, quarter: 'Q1', isForecast: false, actual: 7.9 },
      { date: '2025 Q2', year: 2025, quarter: 'Q2', isForecast: false, actual: 8.4 },
      { date: '2025 Q3', year: 2025, quarter: 'Q3', isForecast: false, actual: 8.9 },
      { date: '2025 Q4', year: 2025, quarter: 'Q4', isForecast: false, actual: 9.7 },
      { date: '2026 Q1', year: 2026, quarter: 'Q1', isForecast: false, actual: 8.3 },
      { date: '2026 Q2', year: 2026, quarter: 'Q2', isForecast: false, actual: 8.8 },
      { date: '2026 Q3', year: 2026, quarter: 'Q3', isForecast: false, actual: 9.4 },
      { date: '2026 Q4', year: 2026, quarter: 'Q4', isForecast: false, actual: 10.3 },
      { date: '2027 Q1', year: 2027, quarter: 'Q1', isForecast: true, forecast: 9.0, lowerBound: 8.4, upperBound: 9.6 },
      { date: '2027 Q2', year: 2027, quarter: 'Q2', isForecast: true, forecast: 9.5, lowerBound: 8.8, upperBound: 10.2 },
      { date: '2027 Q3', year: 2027, quarter: 'Q3', isForecast: true, forecast: 10.1, lowerBound: 9.3, upperBound: 10.9 },
      { date: '2027 Q4', year: 2027, quarter: 'Q4', isForecast: true, forecast: 11.1, lowerBound: 10.1, upperBound: 12.1 },
      { date: '2028 Q1', year: 2028, quarter: 'Q1', isForecast: true, forecast: 9.7, lowerBound: 8.9, upperBound: 10.5 },
      { date: '2028 Q2', year: 2028, quarter: 'Q2', isForecast: true, forecast: 10.3, lowerBound: 9.4, upperBound: 11.2 },
      { date: '2028 Q3', year: 2028, quarter: 'Q3', isForecast: true, forecast: 10.9, lowerBound: 9.9, upperBound: 11.9 },
      { date: '2028 Q4', year: 2028, quarter: 'Q4', isForecast: true, forecast: 12.0, lowerBound: 10.8, upperBound: 13.2 },
      { date: '2029 Q1', year: 2029, quarter: 'Q1', isForecast: true, forecast: 10.5, lowerBound: 9.4, upperBound: 11.6 },
      { date: '2029 Q2', year: 2029, quarter: 'Q2', isForecast: true, forecast: 11.1, lowerBound: 9.9, upperBound: 12.3 },
      { date: '2029 Q3', year: 2029, quarter: 'Q3', isForecast: true, forecast: 11.8, lowerBound: 10.4, upperBound: 13.2 },
      { date: '2029 Q4', year: 2029, quarter: 'Q4', isForecast: true, forecast: 13.0, lowerBound: 11.4, upperBound: 14.6 },
    ],
  },
  kuala_lumpur: {
    stateName: 'Kuala Lumpur',
    historicalAverage: 7.0,
    points: [
      { date: '2025 Q1', year: 2025, quarter: 'Q1', isForecast: false, actual: 6.5 },
      { date: '2025 Q2', year: 2025, quarter: 'Q2', isForecast: false, actual: 6.9 },
      { date: '2025 Q3', year: 2025, quarter: 'Q3', isForecast: false, actual: 7.3 },
      { date: '2025 Q4', year: 2025, quarter: 'Q4', isForecast: false, actual: 8.0 },
      { date: '2026 Q1', year: 2026, quarter: 'Q1', isForecast: false, actual: 6.9 },
      { date: '2026 Q2', year: 2026, quarter: 'Q2', isForecast: false, actual: 7.3 },
      { date: '2026 Q3', year: 2026, quarter: 'Q3', isForecast: false, actual: 7.8 },
      { date: '2026 Q4', year: 2026, quarter: 'Q4', isForecast: false, actual: 8.5 },
      { date: '2027 Q1', year: 2027, quarter: 'Q1', isForecast: true, forecast: 7.5, lowerBound: 7.0, upperBound: 8.0 },
      { date: '2027 Q2', year: 2027, quarter: 'Q2', isForecast: true, forecast: 8.0, lowerBound: 7.4, upperBound: 8.6 },
      { date: '2027 Q3', year: 2027, quarter: 'Q3', isForecast: true, forecast: 8.5, lowerBound: 7.8, upperBound: 9.2 },
      { date: '2027 Q4', year: 2027, quarter: 'Q4', isForecast: true, forecast: 9.3, lowerBound: 8.5, upperBound: 10.1 },
      { date: '2028 Q1', year: 2028, quarter: 'Q1', isForecast: true, forecast: 8.1, lowerBound: 7.4, upperBound: 8.8 },
      { date: '2028 Q2', year: 2028, quarter: 'Q2', isForecast: true, forecast: 8.7, lowerBound: 7.9, upperBound: 9.5 },
      { date: '2028 Q3', year: 2028, quarter: 'Q3', isForecast: true, forecast: 9.2, lowerBound: 8.3, upperBound: 10.1 },
      { date: '2028 Q4', year: 2028, quarter: 'Q4', isForecast: true, forecast: 10.1, lowerBound: 9.0, upperBound: 11.2 },
      { date: '2029 Q1', year: 2029, quarter: 'Q1', isForecast: true, forecast: 8.8, lowerBound: 7.9, upperBound: 9.7 },
      { date: '2029 Q2', year: 2029, quarter: 'Q2', isForecast: true, forecast: 9.4, lowerBound: 8.4, upperBound: 10.4 },
      { date: '2029 Q3', year: 2029, quarter: 'Q3', isForecast: true, forecast: 10.0, lowerBound: 8.9, upperBound: 11.1 },
      { date: '2029 Q4', year: 2029, quarter: 'Q4', isForecast: true, forecast: 11.0, lowerBound: 9.7, upperBound: 12.3 },
    ],
  },
  sabah: {
    stateName: 'Sabah',
    historicalAverage: 2.1,
    points: [
      { date: '2025 Q1', year: 2025, quarter: 'Q1', isForecast: false, actual: 1.9 },
      { date: '2025 Q2', year: 2025, quarter: 'Q2', isForecast: false, actual: 2.0 },
      { date: '2025 Q3', year: 2025, quarter: 'Q3', isForecast: false, actual: 2.3 },
      { date: '2025 Q4', year: 2025, quarter: 'Q4', isForecast: false, actual: 2.1 },
      { date: '2026 Q1', year: 2026, quarter: 'Q1', isForecast: false, actual: 2.0 },
      { date: '2026 Q2', year: 2026, quarter: 'Q2', isForecast: false, actual: 2.1 },
      { date: '2026 Q3', year: 2026, quarter: 'Q3', isForecast: false, actual: 2.5 },
      { date: '2026 Q4', year: 2026, quarter: 'Q4', isForecast: false, actual: 2.3 },
      { date: '2027 Q1', year: 2027, quarter: 'Q1', isForecast: true, forecast: 2.2, lowerBound: 1.9, upperBound: 2.5 },
      { date: '2027 Q2', year: 2027, quarter: 'Q2', isForecast: true, forecast: 2.4, lowerBound: 2.1, upperBound: 2.7 },
      { date: '2027 Q3', year: 2027, quarter: 'Q3', isForecast: true, forecast: 2.8, lowerBound: 2.4, upperBound: 3.2 },
      { date: '2027 Q4', year: 2027, quarter: 'Q4', isForecast: true, forecast: 2.6, lowerBound: 2.2, upperBound: 3.0 },
      { date: '2028 Q1', year: 2028, quarter: 'Q1', isForecast: true, forecast: 2.4, lowerBound: 2.0, upperBound: 2.8 },
      { date: '2028 Q2', year: 2028, quarter: 'Q2', isForecast: true, forecast: 2.6, lowerBound: 2.2, upperBound: 3.0 },
      { date: '2028 Q3', year: 2028, quarter: 'Q3', isForecast: true, forecast: 3.1, lowerBound: 2.6, upperBound: 3.6 },
      { date: '2028 Q4', year: 2028, quarter: 'Q4', isForecast: true, forecast: 2.8, lowerBound: 2.3, upperBound: 3.3 },
      { date: '2029 Q1', year: 2029, quarter: 'Q1', isForecast: true, forecast: 2.6, lowerBound: 2.1, upperBound: 3.1 },
      { date: '2029 Q2', year: 2029, quarter: 'Q2', isForecast: true, forecast: 2.8, lowerBound: 2.3, upperBound: 3.3 },
      { date: '2029 Q3', year: 2029, quarter: 'Q3', isForecast: true, forecast: 3.4, lowerBound: 2.8, upperBound: 4.0 },
      { date: '2029 Q4', year: 2029, quarter: 'Q4', isForecast: true, forecast: 3.1, lowerBound: 2.5, upperBound: 3.7 },
    ],
  },
};

// 5. Model Card Metadata
export const FORECAST_MODEL_CARD: ModelCardMetadata = {
  algorithm: 'Ensemble ARIMA (2,1,2) × (1,1,1)₄ + Prophet with Seasonal Regressors',
  trainingWindow: 'Jan 2015 – Dec 2025 (Monthly frequency, 132 data points)',
  validationWindow: 'Jan 2026 – Dec 2026 (Out-of-sample backtest)',
  mape: 3.42,
  rmse: 0.18,
  rSquared: 0.941,
  featuresUsed: [
    'Flight seat capacity (OAG / MAVCOM)',
    'ASEAN currency exchange rates (USD, SGD, RMB to MYR)',
    'Regional school and public holiday calendars',
    'Historical state-level arrival seasonality indexes',
  ],
  limitations: [
    'Cannot predict sudden geopolitical conflicts or global public health crises.',
    'Assumes current reciprocal 30-day visa exemption policies remain stable.',
    'High-frequency flight schedule disruptions not captured beyond 6-month forward booking window.',
  ],
  lastUpdated: 'December 2026',
};

// 6. Trip Characteristics: Average Length of Stay by State (Nights)
export const LENGTH_OF_STAY_DATA: LengthOfStayItem[] = [
  { stateId: 'sabah', stateName: 'Sabah', nights: 6.8, regionalAvg: 4.8 },
  { stateId: 'sarawak', stateName: 'Sarawak', nights: 6.2, regionalAvg: 4.8 },
  { stateId: 'terengganu', stateName: 'Terengganu', nights: 5.4, regionalAvg: 4.8 },
  { stateId: 'pahang', stateName: 'Pahang', nights: 4.9, regionalAvg: 4.8 },
  { stateId: 'penang', stateName: 'Penang', nights: 4.5, regionalAvg: 4.8 },
  { stateId: 'kelantan', stateName: 'Kelantan', nights: 4.1, regionalAvg: 4.8 },
  { stateId: 'kuala_lumpur', stateName: 'Kuala Lumpur', nights: 3.8, regionalAvg: 4.8 },
  { stateId: 'kedah', stateName: 'Kedah', nights: 3.6, regionalAvg: 4.8 },
  { stateId: 'perak', stateName: 'Perak', nights: 3.1, regionalAvg: 4.8 },
  { stateId: 'johor', stateName: 'Johor', nights: 2.8, regionalAvg: 4.8 },
  { stateId: 'negeri_sembilan', stateName: 'Negeri Sembilan', nights: 2.5, regionalAvg: 4.8 },
  { stateId: 'melaka', stateName: 'Melaka', nights: 2.2, regionalAvg: 4.8 },
  { stateId: 'selangor', stateName: 'Selangor', nights: 2.1, regionalAvg: 4.8 },
  { stateId: 'labuan', stateName: 'Labuan', nights: 2.0, regionalAvg: 4.8 },
  { stateId: 'perlis', stateName: 'Perlis', nights: 1.8, regionalAvg: 4.8 },
  { stateId: 'putrajaya', stateName: 'Putrajaya', nights: 1.6, regionalAvg: 4.8 },
];

// 7. Trip Characteristics: Purpose of Visit Split
export const PURPOSE_OF_VISIT_DATA: PurposeSplitItem[] = [
  { purpose: 'Holiday & Leisure', sharePct: 58.4, volumeM: 19.3, color: '#0b57d0', description: 'Beaches, cultural heritage, nature ecotourism, theme parks' },
  { purpose: 'Business & MICE', sharePct: 18.2, volumeM: 6.0, color: '#0284c7', description: 'Corporate meetings, conventions, trade exhibitions, delegations' },
  { purpose: 'Visiting Friends & Relatives', sharePct: 15.6, volumeM: 5.1, color: '#38bdf8', description: 'Family gatherings, festive reunions, weddings, diaspora visits' },
  { purpose: 'Medical, Edu & Other', sharePct: 7.8, volumeM: 2.6, color: '#94a3b8', description: 'Healthcare tourism, international study, transit, wellness' },
];

// 8. Trip Characteristics: Expenditure per Trip by State (RM)
export const SPEND_PER_TRIP_DATA: SpendPerTripItem[] = [
  { stateId: 'sabah', stateName: 'Sabah', spendRM: 3450, domesticSpendRM: 1420, internationalSpendRM: 4890 },
  { stateId: 'kuala_lumpur', stateName: 'Kuala Lumpur', spendRM: 2980, domesticSpendRM: 1150, internationalSpendRM: 4320 },
  { stateId: 'sarawak', stateName: 'Sarawak', spendRM: 2840, domesticSpendRM: 1280, internationalSpendRM: 4150 },
  { stateId: 'penang', stateName: 'Penang', spendRM: 2650, domesticSpendRM: 980, internationalSpendRM: 3820 },
  { stateId: 'pahang', stateName: 'Pahang', spendRM: 1890, domesticSpendRM: 850, internationalSpendRM: 2980 },
  { stateId: 'terengganu', stateName: 'Terengganu', spendRM: 1680, domesticSpendRM: 740, internationalSpendRM: 2840 },
  { stateId: 'johor', stateName: 'Johor', spendRM: 1450, domesticSpendRM: 690, internationalSpendRM: 2280 },
  { stateId: 'kedah', stateName: 'Kedah', spendRM: 1380, domesticSpendRM: 650, internationalSpendRM: 2420 },
  { stateId: 'melaka', stateName: 'Melaka', spendRM: 1290, domesticSpendRM: 580, internationalSpendRM: 1980 },
  { stateId: 'selangor', stateName: 'Selangor', spendRM: 1180, domesticSpendRM: 520, internationalSpendRM: 1840 },
  { stateId: 'perak', stateName: 'Perak', spendRM: 980, domesticSpendRM: 480, internationalSpendRM: 1620 },
  { stateId: 'negeri_sembilan', stateName: 'Negeri Sembilan', spendRM: 890, domesticSpendRM: 440, internationalSpendRM: 1460 },
  { stateId: 'labuan', stateName: 'Labuan', spendRM: 850, domesticSpendRM: 510, internationalSpendRM: 1380 },
  { stateId: 'kelantan', stateName: 'Kelantan', spendRM: 780, domesticSpendRM: 390, internationalSpendRM: 1290 },
  { stateId: 'putrajaya', stateName: 'Putrajaya', spendRM: 680, domesticSpendRM: 360, internationalSpendRM: 1140 },
  { stateId: 'perlis', stateName: 'Perlis', spendRM: 590, domesticSpendRM: 310, internationalSpendRM: 980 },
];
