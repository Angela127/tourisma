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
export const COMPOSITION_TIME_SERIES: TimeSeriesPoint[] = [];

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
