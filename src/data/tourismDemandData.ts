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
  isForecast?: boolean;
  lowerBound?: number;
  upperBound?: number;

  expenditure?: number;
  expenditureLower?: number;
  expenditureUpper?: number;
  aor?: number;
  aorLower?: number;
  aorUpper?: number;
  isAorForecast?: boolean;
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

// 1. Composition: Historical Quarterly Arrivals
export const COMPOSITION_TIME_SERIES: TimeSeriesPoint[] = [
  { period: '2022 Q1', year: 2022, quarter: 1, domestic: 36.36, international: 0, total: 36.36, domesticShare: 100, internationalShare: 0, expenditure: 140.85, aor: 46.26, isForecast: false, isAorForecast: false },
  { period: '2022 Q2', year: 2022, quarter: 2, domestic: 45.47, international: 0, total: 45.47, domesticShare: 100, internationalShare: 0, expenditure: 152.20, aor: 46.26, isForecast: false, isAorForecast: false },
  { period: '2022 Q3', year: 2022, quarter: 3, domestic: 43.00, international: 0, total: 43.00, domesticShare: 100, internationalShare: 0, expenditure: 136.71, aor: 46.26, isForecast: false, isAorForecast: false },
  { period: '2022 Q4', year: 2022, quarter: 4, domestic: 46.77, international: 0, total: 46.77, domesticShare: 100, internationalShare: 0, expenditure: 153.94, aor: 46.26, isForecast: false, isAorForecast: false },
  { period: '2023 Q1', year: 2023, quarter: 1, domestic: 49.26, international: 0, total: 49.26, domesticShare: 100, internationalShare: 0, expenditure: 152.84, aor: 48.41, isForecast: false, isAorForecast: false },
  { period: '2023 Q2', year: 2023, quarter: 2, domestic: 55.28, international: 0, total: 55.28, domesticShare: 100, internationalShare: 0, expenditure: 155.13, aor: 48.41, isForecast: false, isAorForecast: false },
  { period: '2023 Q3', year: 2023, quarter: 3, domestic: 54.16, international: 0, total: 54.16, domesticShare: 100, internationalShare: 0, expenditure: 145.25, aor: 48.41, isForecast: false, isAorForecast: false },
  { period: '2023 Q4', year: 2023, quarter: 4, domestic: 55.03, international: 0, total: 55.03, domesticShare: 100, internationalShare: 0, expenditure: 169.38, aor: 48.41, isForecast: false, isAorForecast: false },
  { period: '2024 Q1', year: 2024, quarter: 1, domestic: 58.61, international: 0, total: 58.61, domesticShare: 100, internationalShare: 0, expenditure: 160.94, aor: 50.21, isForecast: false, isAorForecast: false },
  { period: '2024 Q2', year: 2024, quarter: 2, domestic: 68.44, international: 0, total: 68.44, domesticShare: 100, internationalShare: 0, expenditure: 161.16, aor: 50.21, isForecast: false, isAorForecast: false },
  { period: '2024 Q3', year: 2024, quarter: 3, domestic: 66.26, international: 0, total: 66.26, domesticShare: 100, internationalShare: 0, expenditure: 151.24, aor: 50.21, isForecast: false, isAorForecast: false },
  { period: '2024 Q4', year: 2024, quarter: 4, domestic: 66.82, international: 0, total: 66.82, domesticShare: 100, internationalShare: 0, expenditure: 170.05, aor: 50.21, isForecast: false, isAorForecast: false },
  { period: '2025 Q1', year: 2025, quarter: 1, domestic: 69.68, international: 0, total: 69.68, domesticShare: 100, internationalShare: 0, expenditure: 165.32, aor: 51.52, isForecast: false, isAorForecast: false },
  { period: '2025 Q2', year: 2025, quarter: 2, domestic: 73.75, international: 0, total: 73.75, domesticShare: 100, internationalShare: 0, expenditure: 155.23, aor: 51.52, isForecast: false, isAorForecast: false },
  { period: '2025 Q3', year: 2025, quarter: 3, domestic: 72.60, international: 0, total: 72.60, domesticShare: 100, internationalShare: 0, expenditure: 161.11, aor: 51.52, isForecast: false, isAorForecast: false },
  { period: '2025 Q4', year: 2025, quarter: 4, domestic: 74.03, international: 0, total: 74.03, domesticShare: 100, internationalShare: 0, expenditure: 172.45, aor: 51.52, isForecast: false, isAorForecast: false },
  { period: '2026 Q1', year: 2026, quarter: 1, domestic: 74.67, international: 0, total: 74.67, domesticShare: 100, internationalShare: 0, expenditure: 178.71, aor: 48.95, isForecast: false, isAorForecast: true, aorLower: 42.89, aorUpper: 55.02 },
  { period: '2026 Q2', year: 2026, quarter: 2, domestic: 80.88, international: 0, total: 80.88, domesticShare: 100, internationalShare: 0, expenditure: 173.15, aor: 48.95, isForecast: true, lowerBound: 75.28, upperBound: 86.48, expenditureLower: 158.05, expenditureUpper: 188.24, isAorForecast: true, aorLower: 42.89, aorUpper: 55.02 },
  { period: '2026 Q3', year: 2026, quarter: 3, domestic: 83.27, international: 0, total: 83.27, domesticShare: 100, internationalShare: 0, expenditure: 174.85, aor: 48.95, isForecast: true, lowerBound: 77.66, upperBound: 88.87, expenditureLower: 159.76, expenditureUpper: 189.95, isAorForecast: true, aorLower: 42.89, aorUpper: 55.02 },
  { period: '2026 Q4', year: 2026, quarter: 4, domestic: 85.65, international: 0, total: 85.65, domesticShare: 100, internationalShare: 0, expenditure: 176.56, aor: 48.95, isForecast: true, lowerBound: 80.05, upperBound: 91.25, expenditureLower: 161.46, expenditureUpper: 191.66, isAorForecast: true, aorLower: 42.89, aorUpper: 55.02 },
  { period: '2027 Q1', year: 2027, quarter: 1, domestic: 88.03, international: 0, total: 88.03, domesticShare: 100, internationalShare: 0, expenditure: 178.27, aor: 48.67, isForecast: true, lowerBound: 82.43, upperBound: 93.64, expenditureLower: 163.17, expenditureUpper: 193.36, isAorForecast: true, aorLower: 42.60, aorUpper: 54.73 },
  { period: '2027 Q2', year: 2027, quarter: 2, domestic: 90.42, international: 0, total: 90.42, domesticShare: 100, internationalShare: 0, expenditure: 179.97, aor: 48.67, isForecast: true, lowerBound: 84.82, upperBound: 96.02, expenditureLower: 164.88, expenditureUpper: 195.07, isAorForecast: true, aorLower: 42.60, aorUpper: 54.73 },
  { period: '2027 Q3', year: 2027, quarter: 3, domestic: 92.80, international: 0, total: 92.80, domesticShare: 100, internationalShare: 0, expenditure: 181.68, aor: 48.67, isForecast: true, lowerBound: 87.20, upperBound: 98.40, expenditureLower: 166.58, expenditureUpper: 196.77, isAorForecast: true, aorLower: 42.60, aorUpper: 54.73 },
  { period: '2027 Q4', year: 2027, quarter: 4, domestic: 95.19, international: 0, total: 95.19, domesticShare: 100, internationalShare: 0, expenditure: 183.38, aor: 48.67, isForecast: true, lowerBound: 89.58, upperBound: 100.79, expenditureLower: 168.29, expenditureUpper: 198.48, isAorForecast: true, aorLower: 42.60, aorUpper: 54.73 },
  { period: '2028 Q1', year: 2028, quarter: 1, domestic: 97.57, international: 0, total: 97.57, domesticShare: 100, internationalShare: 0, expenditure: 185.09, aor: 48.38, isForecast: true, lowerBound: 91.97, upperBound: 103.17, expenditureLower: 169.99, expenditureUpper: 200.19, isAorForecast: true, aorLower: 42.32, aorUpper: 54.44 },
  { period: '2028 Q2', year: 2028, quarter: 2, domestic: 99.95, international: 0, total: 99.95, domesticShare: 100, internationalShare: 0, expenditure: 186.80, aor: 48.38, isForecast: true, lowerBound: 94.35, upperBound: 105.56, expenditureLower: 171.70, expenditureUpper: 201.89, isAorForecast: true, aorLower: 42.32, aorUpper: 54.44 },
  { period: '2028 Q3', year: 2028, quarter: 3, domestic: 102.34, international: 0, total: 102.34, domesticShare: 100, internationalShare: 0, expenditure: 188.50, aor: 48.38, isForecast: true, lowerBound: 96.74, upperBound: 107.94, expenditureLower: 173.41, expenditureUpper: 203.60, isAorForecast: true, aorLower: 42.32, aorUpper: 54.44 },
  { period: '2028 Q4', year: 2028, quarter: 4, domestic: 104.72, international: 0, total: 104.72, domesticShare: 100, internationalShare: 0, expenditure: 190.21, aor: 48.38, isForecast: true, lowerBound: 99.12, upperBound: 110.32, expenditureLower: 175.11, expenditureUpper: 205.30, isAorForecast: true, aorLower: 42.32, aorUpper: 54.44 },
  { period: '2029 Q1', year: 2029, quarter: 1, domestic: 107.11, international: 0, total: 107.11, domesticShare: 100, internationalShare: 0, expenditure: 191.91, aor: 48.09, isForecast: true, lowerBound: 101.50, upperBound: 112.71, expenditureLower: 176.82, expenditureUpper: 207.01, isAorForecast: true, aorLower: 42.03, aorUpper: 54.16 },
  { period: '2029 Q2', year: 2029, quarter: 2, domestic: 109.49, international: 0, total: 109.49, domesticShare: 100, internationalShare: 0, expenditure: 193.62, aor: 48.09, isForecast: true, lowerBound: 103.89, upperBound: 115.09, expenditureLower: 178.52, expenditureUpper: 208.72, isAorForecast: true, aorLower: 42.03, aorUpper: 54.16 },
  { period: '2029 Q3', year: 2029, quarter: 3, domestic: 111.87, international: 0, total: 111.87, domesticShare: 100, internationalShare: 0, expenditure: 195.33, aor: 48.09, isForecast: true, lowerBound: 106.27, upperBound: 117.48, expenditureLower: 180.23, expenditureUpper: 210.42, isAorForecast: true, aorLower: 42.03, aorUpper: 54.16 },
  { period: '2029 Q4', year: 2029, quarter: 4, domestic: 114.26, international: 0, total: 114.26, domesticShare: 100, internationalShare: 0, expenditure: 197.03, aor: 48.09, isForecast: true, lowerBound: 108.66, upperBound: 119.86, expenditureLower: 181.94, expenditureUpper: 212.13, isAorForecast: true, aorLower: 42.03, aorUpper: 54.16 },
  { period: '2030 Q1', year: 2030, quarter: 1, domestic: 116.64, international: 0, total: 116.64, domesticShare: 100, internationalShare: 0, expenditure: 198.74, aor: 47.81, isForecast: true, lowerBound: 111.04, upperBound: 122.24, expenditureLower: 183.64, expenditureUpper: 213.83, isAorForecast: true, aorLower: 41.74, aorUpper: 53.87 },
  { period: '2030 Q2', year: 2030, quarter: 2, domestic: 119.03, international: 0, total: 119.03, domesticShare: 100, internationalShare: 0, expenditure: 200.44, aor: 47.81, isForecast: true, lowerBound: 113.43, upperBound: 124.63, expenditureLower: 185.35, expenditureUpper: 215.54, isAorForecast: true, aorLower: 41.74, aorUpper: 53.87 },
  { period: '2030 Q3', year: 2030, quarter: 3, domestic: 121.41, international: 0, total: 121.41, domesticShare: 100, internationalShare: 0, expenditure: 202.15, aor: 47.81, isForecast: true, lowerBound: 115.81, upperBound: 127.01, expenditureLower: 187.05, expenditureUpper: 217.25, isAorForecast: true, aorLower: 41.74, aorUpper: 53.87 },
  { period: '2030 Q4', year: 2030, quarter: 4, domestic: 123.80, international: 0, total: 123.80, domesticShare: 100, internationalShare: 0, expenditure: 203.86, aor: 47.81, isForecast: true, lowerBound: 118.19, upperBound: 129.40, expenditureLower: 188.76, expenditureUpper: 218.95, isAorForecast: true, aorLower: 41.74, aorUpper: 53.87 },
];

// 2. Top 15 International Source Markets
export const TOP_15_SOURCE_MARKETS: SourceMarket[] = [];

// 3. Seasonality
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const STATE_SEASONALITY_DATA: StateSeasonality[] = [];

// 4. Forecast Section: National & State Historical
export const FORECAST_DATA: StateForecastMap = {};

// 5. Model Card Metadata (Null / Uncalibrated when no data)
export const FORECAST_MODEL_CARD: ModelCardMetadata | null = null;

// 6. Trip Characteristics: Average Length of Stay by State (Nights)
export const LENGTH_OF_STAY_DATA: LengthOfStayItem[] = [];

// 7. Trip Characteristics: Purpose of Visit Split
export const PURPOSE_OF_VISIT_DATA: PurposeSplitItem[] = [];

// 8. Trip Characteristics: Expenditure per Trip by State (RM)
export const SPEND_PER_TRIP_DATA: SpendPerTripItem[] = [];


export interface StateMetric {
  state: string;
  visitors: number;
  receipts: number;
  lengthOfStay: number;
}

export const STATE_METRICS_DATA: StateMetric[] = [
  { state: "Selangor", visitors: 36.38, receipts: 15761.73, lengthOfStay: 2.31 },
  { state: "W.P. Kuala Lumpur", visitors: 35.06, receipts: 16906.19, lengthOfStay: 2.33 },
  { state: "Perak", visitors: 23.64, receipts: 8018.54, lengthOfStay: 2.44 },
  { state: "Pahang", visitors: 23.16, receipts: 9846.77, lengthOfStay: 2.21 },
  { state: "Sarawak", visitors: 22.72, receipts: 9138.38, lengthOfStay: 3.10 },
  { state: "Sabah", visitors: 22.36, receipts: 9753.33, lengthOfStay: 3.15 },
  { state: "Melaka", visitors: 20.83, receipts: 8732.40, lengthOfStay: 2.11 },
  { state: "Negeri Sembilan", visitors: 19.36, receipts: 6529.26, lengthOfStay: 2.29 },
  { state: "Johor", visitors: 18.20, receipts: 8722.92, lengthOfStay: 2.68 },
  { state: "Pulau Pinang", visitors: 17.72, receipts: 8490.36, lengthOfStay: 2.65 },
  { state: "Kedah", visitors: 15.61, receipts: 5520.25, lengthOfStay: 2.82 },
  { state: "Terengganu", visitors: 15.46, receipts: 5795.14, lengthOfStay: 2.76 },
  { state: "Kelantan", visitors: 12.06, receipts: 5239.01, lengthOfStay: 2.98 },
  { state: "Perlis", visitors: 3.76, receipts: 1211.20, lengthOfStay: 2.25 },
  { state: "W.P. Putrajaya", visitors: 3.15, receipts: 1235.86, lengthOfStay: 2.50 },
  { state: "W.P. Labuan", visitors: 0.60, receipts: 379.29, lengthOfStay: 2.51 },
];
