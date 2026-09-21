export interface LeftKpiData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  yAxis: string[];
  xAxis: string[];
  dataPoints: number[];
  maxVal: number;
}

export interface HorizontalRankItem {
  name: string;
  value: string;
  rawValue: number;
  percentageWidth: number; // 0 to 100 relative to max
}

export interface SeasonalityPoint {
  month: string;
  year2024: number; // in Millions
  year2023: number; // in Millions
}

// 1. Left Column 4 KPI Cards
export const LEFT_KPIS: LeftKpiData[] = [
  {
    id: 'arrivals',
    title: 'ARRIVALS',
    value: '98.7M',
    change: '12.4% vs. 2023',
    isPositive: true,
    yAxis: ['120M', '60M', '0'],
    xAxis: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    dataPoints: [32, 58, 52, 60, 72, 70, 82, 80, 88, 92, 105, 118],
    maxVal: 120,
  },
  {
    id: 'receipts',
    title: 'TOURISM RECEIPTS',
    value: '$71.6B',
    change: '8.3% vs. 2023',
    isPositive: true,
    yAxis: ['80B', '40B', '0'],
    xAxis: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    dataPoints: [25, 42, 48, 45, 47, 54, 52, 56, 60, 68, 76, 80],
    maxVal: 80,
  },
  {
    id: 'length-of-stay',
    title: 'AVERAGE LENGTH OF STAY',
    value: '4.7',
    change: '0.3 nights vs. 2023',
    isPositive: true,
    yAxis: ['6', '3', '0'],
    xAxis: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    dataPoints: [3.2, 4.8, 4.4, 4.9, 4.6, 5.0, 4.8, 4.6, 4.8, 4.7, 5.1, 5.3],
    maxVal: 6,
  },
  {
    id: 'tourist-satisfaction',
    title: 'TOURIST SATISFACTION',
    value: '4.6 / 5',
    change: '2.1% vs. 2023',
    isPositive: true,
    yAxis: ['5', '2.5', '0'],
    xAxis: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    dataPoints: [2.3, 4.1, 4.4, 4.0, 4.3, 4.8, 4.5, 4.1, 4.4, 4.6, 4.7, 4.6],
    maxVal: 5,
  },
];

// 2. Right Column Gauges
export const CONTRIBUTION_TO_GDP = {
  title: 'TOURISM CONTRIBUTION TO GDP',
  unitSubtitle: '(% of Total GDP)',
  value: 9.8,
  min: 0,
  max: 20,
  globalAvg: 9.8,
  asiaAvg: 8.4,
  rangeLabel: 'RANGE (% of GDP)',
  rangeBox: {
    min: 3.5,
    q1: 7.5,
    median: 9.8,
    q3: 13.2,
    max: 18.0,
  },
};

export const EMPLOYMENT_IN_TOURISM = {
  title: 'EMPLOYMENT IN TOURISM',
  unitSubtitle: '(% of Total Employment)',
  value: 7.3,
  min: 0,
  max: 20,
  globalAvg: 7.3,
  asiaAvg: 6.8,
  rangeLabel: 'RANGE (% of Employment)',
  rangeBox: {
    min: 2.8,
    q1: 5.8,
    median: 7.3,
    q3: 10.5,
    max: 15.6,
  },
};

// 3. Bottom Row 4 Cards Data
export const TOP_SOURCE_MARKETS: HorizontalRankItem[] = [
  { name: 'China', value: '22.8M', rawValue: 22.8, percentageWidth: 100 },
  { name: 'USA', value: '17.6M', rawValue: 17.6, percentageWidth: 77.2 },
  { name: 'Germany', value: '11.3M', rawValue: 11.3, percentageWidth: 49.6 },
  { name: 'UK', value: '9.8M', rawValue: 9.8, percentageWidth: 43.0 },
  { name: 'India', value: '7.2M', rawValue: 7.2, percentageWidth: 31.6 },
  { name: 'Australia', value: '6.1M', rawValue: 6.1, percentageWidth: 26.8 },
  { name: 'France', value: '5.4M', rawValue: 5.4, percentageWidth: 23.7 },
  { name: 'Japan', value: '4.9M', rawValue: 4.9, percentageWidth: 21.5 },
];

export const TOP_DESTINATIONS: HorizontalRankItem[] = [
  { name: 'France', value: '20.4M', rawValue: 20.4, percentageWidth: 100 },
  { name: 'Spain', value: '18.7M', rawValue: 18.7, percentageWidth: 91.7 },
  { name: 'USA', value: '17.2M', rawValue: 17.2, percentageWidth: 84.3 },
  { name: 'China', value: '14.3M', rawValue: 14.3, percentageWidth: 70.1 },
  { name: 'Italy', value: '9.6M', rawValue: 9.6, percentageWidth: 47.1 },
  { name: 'Türkiye', value: '7.8M', rawValue: 7.8, percentageWidth: 38.2 },
  { name: 'Thailand', value: '7.1M', rawValue: 7.1, percentageWidth: 34.8 },
  { name: 'Germany', value: '6.5M', rawValue: 6.5, percentageWidth: 31.9 },
];

export const PURPOSE_OF_VISIT: HorizontalRankItem[] = [
  { name: 'Leisure', value: '52.6%', rawValue: 52.6, percentageWidth: 100 },
  { name: 'Business', value: '18.7%', rawValue: 18.7, percentageWidth: 35.5 },
  { name: 'VFR (Friends & Relatives)', value: '13.1%', rawValue: 13.1, percentageWidth: 24.9 },
  { name: 'Other', value: '8.6%', rawValue: 8.6, percentageWidth: 16.3 },
  { name: 'Health', value: '4.2%', rawValue: 4.2, percentageWidth: 8.0 },
  { name: 'Education', value: '2.8%', rawValue: 2.8, percentageWidth: 5.3 },
];

export const SEASONALITY_OVERVIEW_DATA: SeasonalityPoint[] = [
  { month: 'Jan', year2024: 6.5, year2023: 5.4 },
  { month: 'Feb', year2024: 7.2, year2023: 6.1 },
  { month: 'Mar', year2024: 8.8, year2023: 7.6 },
  { month: 'Apr', year2024: 9.1, year2023: 7.9 },
  { month: 'May', year2024: 11.4, year2023: 9.8 },
  { month: 'Jun', year2024: 13.2, year2023: 11.5 },
  { month: 'Jul', year2024: 14.9, year2023: 13.1 },
  { month: 'Aug', year2024: 14.0, year2023: 12.4 },
  { month: 'Sep', year2024: 13.6, year2023: 11.8 },
  { month: 'Oct', year2024: 10.8, year2023: 9.2 },
  { month: 'Nov', year2024: 8.2, year2023: 6.9 },
  { month: 'Dec', year2024: 7.1, year2023: 5.8 },
];
