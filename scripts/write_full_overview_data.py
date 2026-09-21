import pandas as pd
import json

ts_content = """// National Overview Datasets for Tourisma Intelligence Dashboard
// Grounded directly in DOSM Domestic Tourism Survey, State Master Dataset,
// Tourism Satellite Account (TSA), and Spatial Accessibility Datasets.

export interface SparklinePoint {
  period: string;
  value: number;
}

export interface KpiCardConfig {
  id: string;
  iconSvg?: string;
  title: string;
  value: string;
  unit?: string;
  unitSubtitle?: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  tooltipNote?: string;
}

export type KpiItem = KpiCardConfig;

export type QuadrantType =
  | 'High Demand / High Readiness'
  | 'High Demand / Low Readiness'
  | 'Low Demand / High Readiness'
  | 'Low Demand / Low Readiness';

export type ClusterType =
  | 'Mature Gateway Hubs'
  | 'High-Growth Emerging'
  | 'Eco & Heritage Frontiers'
  | 'Developing Infrastructure'
  | QuadrantType;

export interface StateOverviewItem {
  id: string;
  name: string;
  shortName: string;
  code: string;
  region: 'Peninsular' | 'Borneo';
  domesticVisitors: number; // Raw
  domesticVisitorsM: number; // Millions
  internationalHotelGuests: number; // Raw
  internationalHotelGuestsM: number; // Millions
  receiptsRmM: number; // RM Million
  receiptsRmB: number; // RM Billion
  receiptsPerVisitor: number; // RM
  alos: number; // Average Length of Stay (nights)
  accommodationRooms: number;
  accommodationEstablishments: number;
  aorPct: number; // Average Occupancy Rate %
  readinessScore: number; // 0-100
  demandScore: number; // 0-100
  quadrant: QuadrantType;
  demandCategory: string;
  readinessCategory: string;
  totalTourismAssets: number;
  roadAccessRate: number; // %
  ptAccessRate: number; // %
  environmentalExposureRate: number; // %
  visitorToRoomRatio: number;
  yearlyTrendVisitors: number[];
  // Legacy / convenience fields
  visitorsTotal?: number;
  visitorsDomestic?: number;
  visitorsInternational?: number;
  receipts?: number;
  pressureScore?: number;
  bindingConstraint?: string;
  pressureTrend?: 'up' | 'down' | 'stable';
  topAttractions?: string[];
  keyInsight?: string;
  monthlyTrend?: number[];
  cluster?: ClusterType;
}

export type StateData = StateOverviewItem;

export interface NationalEconomyContribution {
  gdpSharePct: number; // 15.4%
  tourismGdpRmB: number; // RM 297.6B
  totalEconomyGdpRmB: number; // RM 1,933.2B
  employmentSharePct: number; // 21.6%
  tourismEmploymentM: number; // 3.54M
  totalEmploymentM: number; // 16.4M
  source: string;
}

export interface QuadrantProfileSummary {
  quadrant: QuadrantType;
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
  colorHex: string;
  states: string[];
  // Legacy compatibility
  cluster?: ClusterType;
  color?: string;
  description?: string;
}

export type ClusterInfo = QuadrantProfileSummary;

export interface MonthlyPressurePoint {
  month: string;
  currentYearM: number; // 2025/2026 in Millions
  baselineYearM: number; // 2024 Baseline in Millions
  // Legacy compatibility
  currentYear?: number;
  previousYear?: number;
  annotation?: string;
}

export type MonthlySeasonality = MonthlyPressurePoint;

export interface GrowthScenarioProjection {
  targetLabel: string;
  targetMultiplier: number;
  projectedReceiptsRmB: number;
  deltaRmB: number;
  isBaseline?: boolean;
}

export interface CapacityState {
  stateId: string;
  stateName: string;
  code: string;
  pressureScore: number;
  bindingConstraint: string;
  trend: 'up' | 'down' | 'stable';
  status: 'critical' | 'watch' | 'moderate';
}

// ----------------------------------------------------------------------------
// 1. Comprehensive 16 States Master Dataset (2025/2026 DOSM Baseline)
// ----------------------------------------------------------------------------
export const STATES_OVERVIEW_DATA: Record<string, StateOverviewItem> = {
  selangor: {
    id: 'selangor',
    name: 'Selangor',
    shortName: 'Selangor',
    code: 'SGR',
    region: 'Peninsular',
    domesticVisitors: 36376442,
    domesticVisitorsM: 36.38,
    visitorsTotal: 36.38,
    visitorsDomestic: 36.38,
    internationalHotelGuests: 3614885,
    internationalHotelGuestsM: 3.61,
    visitorsInternational: 3.61,
    receiptsRmM: 15761.73,
    receiptsRmB: 15.76,
    receipts: 15.76,
    receiptsPerVisitor: 433,
    alos: 2.31,
    accommodationRooms: 34883,
    accommodationEstablishments: 460,
    aorPct: 51.6,
    readinessScore: 27.9,
    demandScore: 73.4,
    pressureScore: 68,
    bindingConstraint: 'Suburban Arterial Transit',
    pressureTrend: 'up',
    quadrant: 'High Demand / High Readiness',
    cluster: 'Mature Gateway Hubs',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 13543,
    roadAccessRate: 43.6,
    ptAccessRate: 46.0,
    environmentalExposureRate: 6.0,
    visitorToRoomRatio: 1042.8,
    yearlyTrendVisitors: [33589.0, 19715.0, 10212.0, 21990.0, 27579.0, 34461.0, 36376.4],
    monthlyTrend: [2.5, 2.8, 2.6, 2.7, 3.0, 3.4, 3.1, 3.2, 2.7, 2.8, 3.0, 3.6],
    topAttractions: ['Batu Caves', 'Sunway Lagoon', 'Klang Heritage Walk', 'Sepang Circuit'],
    keyInsight: 'Prime industrial & transit corridor with high business tourism throughput.'
  },
  kuala_lumpur: {
    id: 'kuala_lumpur',
    name: 'W.P. Kuala Lumpur',
    shortName: 'KL',
    code: 'KUL',
    region: 'Peninsular',
    domesticVisitors: 35059933,
    domesticVisitorsM: 35.06,
    visitorsTotal: 35.06,
    visitorsDomestic: 35.06,
    internationalHotelGuests: 13383492,
    internationalHotelGuestsM: 13.38,
    visitorsInternational: 13.38,
    receiptsRmM: 16906.19,
    receiptsRmB: 16.91,
    receipts: 16.91,
    receiptsPerVisitor: 482,
    alos: 2.33,
    accommodationRooms: 63973,
    accommodationEstablishments: 464,
    aorPct: 62.6,
    readinessScore: 99.7,
    demandScore: 98.8,
    pressureScore: 64,
    bindingConstraint: 'City Core Peak Congestion',
    pressureTrend: 'stable',
    quadrant: 'High Demand / High Readiness',
    cluster: 'Mature Gateway Hubs',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 7966,
    roadAccessRate: 96.7,
    ptAccessRate: 99.6,
    environmentalExposureRate: 26.1,
    visitorToRoomRatio: 548.0,
    yearlyTrendVisitors: [22633.0, 12435.0, 9116.0, 16913.0, 22233.0, 26983.0, 35059.9],
    monthlyTrend: [2.2, 2.5, 2.3, 2.4, 2.6, 2.9, 2.8, 2.8, 2.4, 2.5, 2.7, 3.2],
    topAttractions: ['Petronas Twin Towers', 'Merdeka 118', 'Bukit Bintang', 'National Museum'],
    keyInsight: 'National capital driving over 50% of total international inbound arrivals.'
  },
  perak: {
    id: 'perak',
    name: 'Perak',
    shortName: 'Perak',
    code: 'PRK',
    region: 'Peninsular',
    domesticVisitors: 23642055,
    domesticVisitorsM: 23.64,
    visitorsTotal: 23.64,
    visitorsDomestic: 23.64,
    internationalHotelGuests: 944578,
    internationalHotelGuestsM: 0.94,
    visitorsInternational: 0.94,
    receiptsRmM: 8018.54,
    receiptsRmB: 8.02,
    receipts: 8.02,
    receiptsPerVisitor: 339,
    alos: 2.44,
    accommodationRooms: 19299,
    accommodationEstablishments: 481,
    aorPct: 46.9,
    readinessScore: 18.3,
    demandScore: 39.2,
    pressureScore: 62,
    bindingConstraint: 'Intercity Rail Frequency',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / High Readiness',
    cluster: 'High-Growth Emerging',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 3874,
    roadAccessRate: 44.7,
    ptAccessRate: 32.8,
    environmentalExposureRate: 3.2,
    visitorToRoomRatio: 1225.0,
    yearlyTrendVisitors: [21070.7, 13173.3, 4489.3, 14566.7, 17107.5, 21776.2, 23642.1],
    monthlyTrend: [1.1, 1.4, 1.2, 1.2, 1.4, 1.7, 1.5, 1.6, 1.3, 1.3, 1.5, 1.9],
    topAttractions: ['Ipoh Old Town', 'Pangkor Island', "Kellie's Castle", 'Belum Rainforest'],
    keyInsight: 'Culinary and eco-heritage leader benefiting from ETS train connectivity.'
  },
  pahang: {
    id: 'pahang',
    name: 'Pahang',
    shortName: 'Pahang',
    code: 'PHG',
    region: 'Peninsular',
    domesticVisitors: 23161166,
    domesticVisitorsM: 23.16,
    visitorsTotal: 23.16,
    visitorsDomestic: 23.16,
    internationalHotelGuests: 2953226,
    internationalHotelGuestsM: 2.95,
    visitorsInternational: 2.95,
    receiptsRmM: 9846.77,
    receiptsRmB: 9.85,
    receipts: 9.85,
    receiptsPerVisitor: 425,
    alos: 2.21,
    accommodationRooms: 34323,
    accommodationEstablishments: 501,
    aorPct: 75.6,
    readinessScore: 17.9,
    demandScore: 47.5,
    pressureScore: 73,
    bindingConstraint: 'Eco-trail Footfall',
    pressureTrend: 'stable',
    quadrant: 'High Demand / Low Readiness',
    cluster: 'High-Growth Emerging',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 2973,
    roadAccessRate: 27.0,
    ptAccessRate: 29.2,
    environmentalExposureRate: 39.6,
    visitorToRoomRatio: 674.8,
    yearlyTrendVisitors: [18497.6, 9905.0, 3404.8, 13189.0, 16455.6, 20173.9, 23161.2],
    monthlyTrend: [1.3, 1.6, 1.4, 1.4, 1.6, 2.0, 1.8, 1.9, 1.5, 1.5, 1.7, 2.2],
    topAttractions: ['Genting Highlands', 'Cameron Highlands', 'Taman Negara', 'Tioman Island'],
    keyInsight: 'Heavy highland domestic leisure concentration facing mountain road bottlenecks.'
  },
  sarawak: {
    id: 'sarawak',
    name: 'Sarawak',
    shortName: 'Sarawak',
    code: 'SWK',
    region: 'Borneo',
    domesticVisitors: 22721527,
    domesticVisitorsM: 22.72,
    visitorsTotal: 22.72,
    visitorsDomestic: 22.72,
    internationalHotelGuests: 1222481,
    internationalHotelGuestsM: 1.22,
    visitorsInternational: 1.22,
    receiptsRmM: 9138.38,
    receiptsRmB: 9.14,
    receipts: 9.14,
    receiptsPerVisitor: 402,
    alos: 3.10,
    accommodationRooms: 27913,
    accommodationEstablishments: 522,
    aorPct: 47.7,
    readinessScore: 17.9,
    demandScore: 41.3,
    pressureScore: 54,
    bindingConstraint: 'Hinterland Flight Frequency',
    pressureTrend: 'stable',
    quadrant: 'High Demand / Low Readiness',
    cluster: 'Eco & Heritage Frontiers',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 5269,
    roadAccessRate: 38.8,
    ptAccessRate: 26.4,
    environmentalExposureRate: 8.1,
    visitorToRoomRatio: 814.0,
    yearlyTrendVisitors: [19793.0, 9393.0, 6511.0, 15465.0, 17901.0, 19626.0, 22721.5],
    monthlyTrend: [0.7, 0.9, 0.8, 0.8, 1.0, 1.2, 1.1, 1.1, 0.8, 0.9, 1.0, 1.2],
    topAttractions: ['Gunung Mulu National Park', 'Kuching Waterfront', 'Bako National Park', 'Cultural Village'],
    keyInsight: 'High value nature & festival tourism with ample spatial carrying capacity.'
  },
  sabah: {
    id: 'sabah',
    name: 'Sabah',
    shortName: 'Sabah',
    code: 'SBH',
    region: 'Borneo',
    domesticVisitors: 22361168,
    domesticVisitorsM: 22.36,
    visitorsTotal: 22.36,
    visitorsDomestic: 22.36,
    internationalHotelGuests: 2900293,
    internationalHotelGuestsM: 2.90,
    visitorsInternational: 2.90,
    receiptsRmM: 9753.33,
    receiptsRmB: 9.75,
    receipts: 9.75,
    receiptsPerVisitor: 436,
    alos: 3.15,
    accommodationRooms: 27208,
    accommodationEstablishments: 540,
    aorPct: 51.6,
    readinessScore: 19.8,
    demandScore: 46.4,
    pressureScore: 79,
    bindingConstraint: 'Airport Gate Capacity',
    pressureTrend: 'up',
    quadrant: 'High Demand / High Readiness',
    cluster: 'Eco & Heritage Frontiers',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 2888,
    roadAccessRate: 40.3,
    ptAccessRate: 34.3,
    environmentalExposureRate: 27.8,
    visitorToRoomRatio: 821.9,
    yearlyTrendVisitors: [22035.0, 10337.0, 3815.0, 12589.0, 16080.0, 20592.0, 22361.2],
    monthlyTrend: [0.9, 1.1, 1.0, 1.0, 1.2, 1.4, 1.3, 1.3, 1.0, 1.1, 1.2, 1.5],
    topAttractions: ['Mount Kinabalu', 'Sipadan Island', 'Kinabatangan River', 'Tunku Abdul Rahman Park'],
    keyInsight: 'Premier eco-tourism yield with constrained direct international runway slots.'
  },
  melaka: {
    id: 'melaka',
    name: 'Melaka',
    shortName: 'Melaka',
    code: 'MLK',
    region: 'Peninsular',
    domesticVisitors: 20832202,
    domesticVisitorsM: 20.83,
    visitorsTotal: 20.83,
    visitorsDomestic: 20.83,
    internationalHotelGuests: 1654330,
    internationalHotelGuestsM: 1.65,
    visitorsInternational: 1.65,
    receiptsRmM: 8732.40,
    receiptsRmB: 8.73,
    receipts: 8.73,
    receiptsPerVisitor: 419,
    alos: 2.11,
    accommodationRooms: 20159,
    accommodationEstablishments: 354,
    aorPct: 45.4,
    readinessScore: 60.4,
    demandScore: 39.8,
    pressureScore: 84,
    bindingConstraint: 'Seasonal Concentration',
    pressureTrend: 'up',
    quadrant: 'High Demand / High Readiness',
    cluster: 'High-Growth Emerging',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 2858,
    roadAccessRate: 97.5,
    ptAccessRate: 95.4,
    environmentalExposureRate: 9.2,
    visitorToRoomRatio: 1033.4,
    yearlyTrendVisitors: [13979.0, 7274.5, 3878.1, 11757.2, 15558.7, 19128.4, 20832.2],
    monthlyTrend: [0.8, 1.1, 0.9, 0.9, 1.0, 1.3, 1.1, 1.2, 0.9, 1.0, 1.1, 1.4],
    topAttractions: ['Jonker Street', 'A Famosa', 'Stadthuys', 'Melaka River Cruise'],
    keyInsight: 'Severe weekend visitor clustering leading to historic city core gridlock.'
  },
  negeri_sembilan: {
    id: 'negeri_sembilan',
    name: 'Negeri Sembilan',
    shortName: 'N. Sembilan',
    code: 'NSN',
    region: 'Peninsular',
    domesticVisitors: 19356545,
    domesticVisitorsM: 19.36,
    visitorsTotal: 19.36,
    visitorsDomestic: 19.36,
    internationalHotelGuests: 497085,
    internationalHotelGuestsM: 0.50,
    visitorsInternational: 0.50,
    receiptsRmM: 6529.26,
    receiptsRmB: 6.53,
    receipts: 6.53,
    receiptsPerVisitor: 337,
    alos: 2.29,
    accommodationRooms: 10856,
    accommodationEstablishments: 166,
    aorPct: 42.2,
    readinessScore: 17.8,
    demandScore: 31.1,
    pressureScore: 52,
    bindingConstraint: 'Coastal Road Congestion',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Developing Infrastructure',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 1663,
    roadAccessRate: 45.6,
    ptAccessRate: 40.8,
    environmentalExposureRate: 10.4,
    visitorToRoomRatio: 1783.0,
    yearlyTrendVisitors: [13303.0, 7917.7, 5485.2, 11490.1, 14959.5, 17784.5, 19356.5],
    monthlyTrend: [0.6, 0.7, 0.6, 0.6, 0.7, 0.9, 0.8, 0.8, 0.7, 0.7, 0.8, 1.0],
    topAttractions: ['Port Dickson Beach', 'Seremban Cultural Hub', 'Gunung Datuk', 'Sri Menanti Palace'],
    keyInsight: 'Weekend coastal retreat for Klang Valley residents with room for luxury upgrades.'
  },
  johor: {
    id: 'johor',
    name: 'Johor',
    shortName: 'Johor',
    code: 'JHR',
    region: 'Peninsular',
    domesticVisitors: 18196973,
    domesticVisitorsM: 18.20,
    visitorsTotal: 18.20,
    visitorsDomestic: 18.20,
    internationalHotelGuests: 3250524,
    internationalHotelGuestsM: 3.25,
    visitorsInternational: 3.25,
    receiptsRmM: 8722.92,
    receiptsRmB: 8.72,
    receipts: 8.72,
    receiptsPerVisitor: 479,
    alos: 2.68,
    accommodationRooms: 36043,
    accommodationEstablishments: 552,
    aorPct: 52.3,
    readinessScore: 24.5,
    demandScore: 41.3,
    pressureScore: 70,
    bindingConstraint: 'Highway Ingress',
    pressureTrend: 'up',
    quadrant: 'High Demand / High Readiness',
    cluster: 'High-Growth Emerging',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 7040,
    roadAccessRate: 37.9,
    ptAccessRate: 43.0,
    environmentalExposureRate: 2.4,
    visitorToRoomRatio: 504.9,
    yearlyTrendVisitors: [14274.4, 7242.5, 3657.6, 12376.2, 15804.9, 17138.3, 18197.0],
    monthlyTrend: [1.7, 2.0, 1.8, 1.7, 1.9, 2.3, 2.1, 2.2, 1.8, 1.9, 2.1, 2.6],
    topAttractions: ['Legoland Malaysia', 'Desaru Coast', 'Johor Bahru Old Town', 'Endau-Rompin Park'],
    keyInsight: 'Cross-border Singapore day-tripper volume driving high visitor turnover.'
  },
  penang: {
    id: 'penang',
    name: 'Pulau Pinang',
    shortName: 'Penang',
    code: 'PNG',
    region: 'Peninsular',
    domesticVisitors: 17717979,
    domesticVisitorsM: 17.72,
    visitorsTotal: 17.72,
    visitorsDomestic: 17.72,
    internationalHotelGuests: 3472459,
    internationalHotelGuestsM: 3.47,
    visitorsInternational: 3.47,
    receiptsRmM: 8490.36,
    receiptsRmB: 8.49,
    receipts: 8.49,
    receiptsPerVisitor: 479,
    alos: 2.65,
    accommodationRooms: 26692,
    accommodationEstablishments: 376,
    aorPct: 56.8,
    readinessScore: 46.7,
    demandScore: 40.9,
    pressureScore: 88,
    bindingConstraint: 'Accommodation',
    pressureTrend: 'up',
    quadrant: 'High Demand / High Readiness',
    cluster: 'Mature Gateway Hubs',
    demandCategory: 'Above Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 5544,
    roadAccessRate: 68.5,
    ptAccessRate: 79.1,
    environmentalExposureRate: 1.1,
    visitorToRoomRatio: 663.8,
    yearlyTrendVisitors: [15410.6, 8929.5, 5060.9, 10003.1, 13128.5, 16604.8, 17718.0],
    monthlyTrend: [1.1, 1.3, 1.2, 1.1, 1.3, 1.5, 1.4, 1.4, 1.2, 1.2, 1.3, 1.7],
    topAttractions: ['George Town UNESCO Core', 'Penang Hill', 'Batu Ferringhi', 'Kek Lok Si'],
    keyInsight: 'Extreme heritage zone density and weekend hotel capacity saturation.'
  },
  kedah: {
    id: 'kedah',
    name: 'Kedah',
    shortName: 'Kedah',
    code: 'KDH',
    region: 'Peninsular',
    domesticVisitors: 15607884,
    domesticVisitorsM: 15.61,
    visitorsTotal: 15.61,
    visitorsDomestic: 15.61,
    internationalHotelGuests: 2109996,
    internationalHotelGuestsM: 2.11,
    visitorsInternational: 2.11,
    receiptsRmM: 5520.25,
    receiptsRmB: 5.52,
    receipts: 5.52,
    receiptsPerVisitor: 354,
    alos: 2.82,
    accommodationRooms: 18600,
    accommodationEstablishments: 328,
    aorPct: 46.6,
    readinessScore: 13.5,
    demandScore: 29.6,
    pressureScore: 66,
    bindingConstraint: 'Ferry Terminal Throughput',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'High-Growth Emerging',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 3127,
    roadAccessRate: 35.8,
    ptAccessRate: 20.0,
    environmentalExposureRate: 0.4,
    visitorToRoomRatio: 839.1,
    yearlyTrendVisitors: [14831.2, 10108.1, 4023.0, 11186.2, 13444.1, 14651.5, 15607.9],
    monthlyTrend: [0.9, 1.2, 1.0, 0.9, 1.1, 1.3, 1.2, 1.2, 1.0, 1.0, 1.2, 1.5],
    topAttractions: ['Langkawi Geopark', 'Alor Setar Tower', 'Zahir Mosque', 'Gunung Jerai'],
    keyInsight: 'Langkawi duty-free island anchors receipts; mainland rural tourism emerging.'
  },
  terengganu: {
    id: 'terengganu',
    name: 'Terengganu',
    shortName: 'Terengganu',
    code: 'TRG',
    region: 'Peninsular',
    domesticVisitors: 15462278,
    domesticVisitorsM: 15.46,
    visitorsTotal: 15.46,
    visitorsDomestic: 15.46,
    internationalHotelGuests: 276786,
    internationalHotelGuestsM: 0.28,
    visitorsInternational: 0.28,
    receiptsRmM: 5795.14,
    receiptsRmB: 5.80,
    receipts: 5.80,
    receiptsPerVisitor: 375,
    alos: 2.76,
    accommodationRooms: 11190,
    accommodationEstablishments: 256,
    aorPct: 46.3,
    readinessScore: 8.3,
    demandScore: 25.4,
    pressureScore: 58,
    bindingConstraint: 'Monsoon Off-Season Downtime',
    pressureTrend: 'down',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Eco & Heritage Frontiers',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 1553,
    roadAccessRate: 20.7,
    ptAccessRate: 25.2,
    environmentalExposureRate: 19.3,
    visitorToRoomRatio: 1381.8,
    yearlyTrendVisitors: [14158.0, 7420.0, 3719.0, 10233.0, 11761.0, 14461.0, 15462.3],
    monthlyTrend: [0.3, 0.4, 0.7, 0.8, 1.0, 1.2, 1.1, 1.1, 0.8, 0.6, 0.3, 0.2],
    topAttractions: ['Redang Island', 'Perhentian Islands', 'Kenyir Lake', 'Crystal Mosque'],
    keyInsight: 'Pristine marine parks experiencing seasonal monsoon swings.'
  },
  kelantan: {
    id: 'kelantan',
    name: 'Kelantan',
    shortName: 'Kelantan',
    code: 'KTN',
    region: 'Peninsular',
    domesticVisitors: 12062016,
    domesticVisitorsM: 12.06,
    visitorsTotal: 12.06,
    visitorsDomestic: 12.06,
    internationalHotelGuests: 59329,
    internationalHotelGuestsM: 0.06,
    visitorsInternational: 0.06,
    receiptsRmM: 5239.01,
    receiptsRmB: 5.24,
    receipts: 5.24,
    receiptsPerVisitor: 434,
    alos: 2.98,
    accommodationRooms: 6362,
    accommodationEstablishments: 170,
    aorPct: 43.2,
    readinessScore: 6.9,
    demandScore: 20.6,
    pressureScore: 48,
    bindingConstraint: 'East Coast Expressway Ingress',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Eco & Heritage Frontiers',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 1811,
    roadAccessRate: 26.8,
    ptAccessRate: 20.2,
    environmentalExposureRate: 1.1,
    visitorToRoomRatio: 1895.9,
    yearlyTrendVisitors: [10985.7, 6058.2, 1920.9, 6627.2, 7549.4, 10514.4, 12062.0],
    monthlyTrend: [0.5, 0.6, 0.5, 0.5, 0.6, 0.7, 0.6, 0.6, 0.5, 0.5, 0.6, 0.7],
    topAttractions: ['Siti Khadijah Market', 'Pantai Cahaya Bulan', 'Gunung Stong', 'Handicraft Village'],
    keyInsight: 'Rich Malay artisan heritage with festive balik-kampung surges.'
  },
  perlis: {
    id: 'perlis',
    name: 'Perlis',
    shortName: 'Perlis',
    code: 'PLS',
    region: 'Peninsular',
    domesticVisitors: 3755682,
    domesticVisitorsM: 3.76,
    visitorsTotal: 3.76,
    visitorsDomestic: 3.76,
    internationalHotelGuests: 8334,
    internationalHotelGuestsM: 0.01,
    visitorsInternational: 0.01,
    receiptsRmM: 1211.20,
    receiptsRmB: 1.21,
    receipts: 1.21,
    receiptsPerVisitor: 322,
    alos: 2.25,
    accommodationRooms: 1489,
    accommodationEstablishments: 44,
    aorPct: 41.0,
    readinessScore: 11.6,
    demandScore: 4.6,
    pressureScore: 45,
    bindingConstraint: 'Quality Star-Rated Hotels',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Developing Infrastructure',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 194,
    roadAccessRate: 40.0,
    ptAccessRate: 33.3,
    environmentalExposureRate: 2.6,
    visitorToRoomRatio: 2522.3,
    yearlyTrendVisitors: [2087.4, 1193.1, 406.8, 1669.2, 1950.8, 3225.4, 3755.7],
    monthlyTrend: [0.13, 0.16, 0.14, 0.14, 0.16, 0.19, 0.17, 0.18, 0.15, 0.15, 0.17, 0.22],
    topAttractions: ['Gua Kelam', 'Wang Kelian View Point', 'Perlis State Park', 'Timah Tasoh Lake'],
    keyInsight: 'Border crossing state to Thailand with growing eco-geopark agro-tourism appeal.'
  },
  putrajaya: {
    id: 'putrajaya',
    name: 'W.P. Putrajaya',
    shortName: 'Putrajaya',
    code: 'PJY',
    region: 'Peninsular',
    domesticVisitors: 3146484,
    domesticVisitorsM: 3.15,
    visitorsTotal: 3.15,
    visitorsDomestic: 3.15,
    internationalHotelGuests: 222220,
    internationalHotelGuestsM: 0.22,
    visitorsInternational: 0.22,
    receiptsRmM: 1235.86,
    receiptsRmB: 1.24,
    receipts: 1.24,
    receiptsPerVisitor: 393,
    alos: 2.50,
    accommodationRooms: 2580,
    accommodationEstablishments: 13,
    aorPct: 56.5,
    readinessScore: 47.5,
    demandScore: 4.6,
    pressureScore: 42,
    bindingConstraint: 'Evening/Weekend Activations',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / High Readiness',
    cluster: 'Developing Infrastructure',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Above Relative Readiness',
    totalTourismAssets: 302,
    roadAccessRate: 91.7,
    ptAccessRate: 100.0,
    environmentalExposureRate: 0.0,
    visitorToRoomRatio: 1219.6,
    yearlyTrendVisitors: [2410.0, 1340.0, 890.0, 1850.0, 2320.0, 2810.0, 3146.5],
    monthlyTrend: [0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4],
    topAttractions: ['Putra Mosque', 'Putrajaya Botanical Garden', 'Seri Wawasan Bridge', 'Lake Cruise'],
    keyInsight: 'Modern administrative city with high infrastructure and transit connectivity.'
  },
  labuan: {
    id: 'labuan',
    name: 'W.P. Labuan',
    shortName: 'Labuan',
    code: 'LBN',
    region: 'Borneo',
    domesticVisitors: 604370,
    domesticVisitorsM: 0.60,
    visitorsTotal: 0.60,
    visitorsDomestic: 0.60,
    internationalHotelGuests: 55107,
    internationalHotelGuestsM: 0.06,
    visitorsInternational: 0.06,
    receiptsRmM: 379.29,
    receiptsRmB: 0.38,
    receipts: 0.38,
    receiptsPerVisitor: 628,
    alos: 2.51,
    accommodationRooms: 2296,
    accommodationEstablishments: 50,
    aorPct: 37.0,
    readinessScore: 8.7,
    demandScore: 0.1,
    pressureScore: 38,
    bindingConstraint: 'Mainland Ferry Frequency',
    pressureTrend: 'stable',
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Eco & Heritage Frontiers',
    demandCategory: 'Below Median Demand',
    readinessCategory: 'Below Relative Readiness',
    totalTourismAssets: 126,
    roadAccessRate: 13.9,
    ptAccessRate: 11.1,
    environmentalExposureRate: 2.4,
    visitorToRoomRatio: 263.2,
    yearlyTrendVisitors: [480.0, 290.0, 160.0, 390.0, 470.0, 540.0, 604.4],
    monthlyTrend: [0.09, 0.10, 0.09, 0.10, 0.10, 0.12, 0.11, 0.11, 0.10, 0.10, 0.11, 0.13],
    topAttractions: ['Labuan Marine Park', 'War Memorial', 'The Chimney', 'Layang-Layangan Beach'],
    keyInsight: 'Duty-free island with maritime wreck diving and offshore commercial links.'
  }
};

// ----------------------------------------------------------------------------
// 2. National Core Overview KPIs (Left Column)
// ----------------------------------------------------------------------------
export const NATIONAL_OVERVIEW_KPIS: KpiCardConfig[] = [
  {
    id: 'kpi_domestic_visitors',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    title: 'DOMESTIC VISITORS',
    value: '290.1M',
    unit: 'Million',
    change: '▲ +11.5% vs. 2024',
    isPositive: true,
    sparkline: [239.1, 131.7, 66.0, 171.6, 213.7, 260.1, 290.1],
    tooltipNote: 'Total domestic visitor trips across 16 states & federal territories (DOSM 2025/2026)'
  },
  {
    id: 'kpi_tourism_expenditure',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    title: 'TOURISM EXPENDITURE',
    value: 'RM121.3B',
    unit: 'RM Billion',
    change: '▲ +13.6% vs. 2024',
    isPositive: true,
    sparkline: [103.2, 40.4, 18.4, 64.1, 85.0, 106.7, 121.3],
    tooltipNote: 'Total domestic tourism expenditure receipts (RM 121,280.6 Million)'
  },
  {
    id: 'kpi_avg_length_of_stay',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    title: 'AVG. LENGTH OF STAY',
    value: '2.56 nights',
    unit: 'Nights',
    change: '▲ +0.12 vs. 2024',
    isPositive: true,
    sparkline: [2.21, 2.36, 2.40, 2.42, 2.45, 2.48, 2.56],
    tooltipNote: 'National weighted average duration of stay per trip across all destinations'
  },
  {
    id: 'kpi_avg_occupancy_rate',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    title: 'AVG. OCCUPANCY RATE',
    value: '50.2%',
    unit: '%',
    unitSubtitle: 'Hotel AOR (343.9K rooms)',
    change: '▲ +3.8 pp vs. 2024',
    isPositive: true,
    sparkline: [42.1, 28.5, 24.2, 41.5, 47.3, 49.8, 50.2],
    tooltipNote: 'Average Hotel Occupancy Rate across 5,308 licensed establishments in Malaysia'
  }
];

// ----------------------------------------------------------------------------
// 3. Tourism Economic & Employment Contribution (Tourism Satellite Account)
// ----------------------------------------------------------------------------
export const NATIONAL_ECONOMY_CONTRIBUTION: NationalEconomyContribution = {
  gdpSharePct: 15.4,
  tourismGdpRmB: 297.6,
  totalEconomyGdpRmB: 1933.2,
  employmentSharePct: 21.6,
  tourismEmploymentM: 3.54,
  totalEmploymentM: 16.4,
  source: "Department of Statistics Malaysia (DOSM) - Tourism Satellite Account (TSA) & Labour Force Survey"
};

export const ECONOMY_SHARE = {
  gdpShare: {
    malaysia: 15.4,
    aseanAvg: 12.1
  },
  employmentShare: {
    malaysia: 21.6,
    aseanAvg: 16.8
  }
};

export const NATIONAL_PROGRESS = {
  targetVisitors: 35.6,
  currentVisitors: 28.5,
  targetYear: 2026,
  gapVisitors: 7.1,
  requiredCagr: 12.4,
  deadlineNotice: 'Visit Malaysia Strategic Target'
};

// ----------------------------------------------------------------------------
// 4. Top Tourism Receipts by State
// ----------------------------------------------------------------------------
export interface TopReceiptsItem {
  id: string;
  name: string;
  receipts: number;
  receiptsRmB: number;
  percentageWidth: number;
  share: number;
  colorClass: string;
}

export const TOP_TOURISM_RECEIPTS: TopReceiptsItem[] = [
  { id: 'kuala_lumpur', name: 'W.P. Kuala Lumpur', receipts: 16.91, receiptsRmB: 16.91, percentageWidth: 100.0, share: 13.9, colorClass: 'primary' },
  { id: 'selangor', name: 'Selangor', receipts: 15.76, receiptsRmB: 15.76, percentageWidth: 93.2, share: 13.0, colorClass: 'primary' },
  { id: 'pahang', name: 'Pahang', receipts: 9.85, receiptsRmB: 9.85, percentageWidth: 58.2, share: 8.1, colorClass: 'secondary' },
  { id: 'sabah', name: 'Sabah', receipts: 9.75, receiptsRmB: 9.75, percentageWidth: 57.7, share: 8.0, colorClass: 'secondary' },
  { id: 'sarawak', name: 'Sarawak', receipts: 9.14, receiptsRmB: 9.14, percentageWidth: 54.0, share: 7.5, colorClass: 'secondary' },
  { id: 'melaka', name: 'Melaka', receipts: 8.73, receiptsRmB: 8.73, percentageWidth: 51.6, share: 7.2, colorClass: 'secondary' },
  { id: 'johor', name: 'Johor', receipts: 8.72, receiptsRmB: 8.72, percentageWidth: 51.6, share: 7.2, colorClass: 'secondary' },
  { id: 'penang', name: 'Pulau Pinang', receipts: 8.49, receiptsRmB: 8.49, percentageWidth: 50.2, share: 7.0, colorClass: 'secondary' }
];

export const TOP_STATES_RECEIPTS = TOP_TOURISM_RECEIPTS;

// ----------------------------------------------------------------------------
// 5. Destination Readiness Profiles (Cluster / Quadrant Distribution)
// ----------------------------------------------------------------------------
export const DESTINATION_PROFILES_DATA: QuadrantProfileSummary[] = [
  {
    quadrant: 'High Demand / High Readiness',
    cluster: 'Mature Gateway Hubs',
    label: 'High Demand / High Readiness',
    count: 6,
    percentage: 37.5,
    colorClass: 'high-demand-high-cap',
    colorHex: '#10b981',
    color: '#10b981',
    description: 'Advanced air connectivity, dense hospitality, and high state readiness.',
    states: ['W.P. Kuala Lumpur', 'Selangor', 'Sabah', 'Johor', 'Pulau Pinang', 'Melaka']
  },
  {
    quadrant: 'High Demand / Low Readiness',
    cluster: 'High-Growth Emerging',
    label: 'High Demand / Low Readiness',
    count: 2,
    percentage: 12.5,
    colorClass: 'high-demand-low-cap',
    colorHex: '#3b82f6',
    color: '#3b82f6',
    description: 'High visitor demand with expanding capacity and nature assets.',
    states: ['Pahang', 'Sarawak']
  },
  {
    quadrant: 'Low Demand / High Readiness',
    cluster: 'Developing Infrastructure',
    label: 'Low Demand / High Readiness',
    count: 2,
    percentage: 12.5,
    colorClass: 'low-demand-high-pot',
    colorHex: '#f59e0b',
    color: '#f59e0b',
    description: 'Strong infrastructure headroom ready for demand growth.',
    states: ['Perak', 'W.P. Putrajaya']
  },
  {
    quadrant: 'Low Demand / Low Readiness',
    cluster: 'Eco & Heritage Frontiers',
    label: 'Low Demand / Low Readiness',
    count: 6,
    percentage: 37.5,
    colorClass: 'low-demand-low-read',
    colorHex: '#8b5cf6',
    color: '#8b5cf6',
    description: 'Emerging destinations with high eco and cultural potential.',
    states: ['Negeri Sembilan', 'Kedah', 'Terengganu', 'Kelantan', 'Perlis', 'W.P. Labuan']
  }
];

export const CLUSTERS_DATA = DESTINATION_PROFILES_DATA;

// ----------------------------------------------------------------------------
// 6. Tourism Pressure / Monthly Arrivals Trajectory (2025/2026 vs 2024 Baseline)
// ----------------------------------------------------------------------------
export const MONTHLY_PRESSURE_DATA: MonthlyPressurePoint[] = [
  { month: 'Jan', currentYearM: 22.8, baselineYearM: 19.5, currentYear: 2.28, previousYear: 1.95, annotation: 'New Year surge' },
  { month: 'Feb', currentYearM: 24.2, baselineYearM: 21.0, currentYear: 2.42, previousYear: 2.10, annotation: 'Chinese New Year' },
  { month: 'Mar', currentYearM: 21.2, baselineYearM: 18.1, currentYear: 2.12, previousYear: 1.81 },
  { month: 'Apr', currentYearM: 20.6, baselineYearM: 17.2, currentYear: 2.06, previousYear: 1.72, annotation: 'Hari Raya Aidilfitri' },
  { month: 'May', currentYearM: 23.4, baselineYearM: 20.1, currentYear: 2.34, previousYear: 2.01 },
  { month: 'Jun', currentYearM: 28.6, baselineYearM: 24.2, currentYear: 2.86, previousYear: 2.42, annotation: 'School Holidays' },
  { month: 'Jul', currentYearM: 27.1, baselineYearM: 22.8, currentYear: 2.71, previousYear: 2.28 },
  { month: 'Aug', currentYearM: 27.8, baselineYearM: 23.4, currentYear: 2.78, previousYear: 2.34, annotation: 'National Day' },
  { month: 'Sep', currentYearM: 22.4, baselineYearM: 18.8, currentYear: 2.24, previousYear: 1.88 },
  { month: 'Oct', currentYearM: 21.5, baselineYearM: 17.9, currentYear: 2.15, previousYear: 1.79 },
  { month: 'Nov', currentYearM: 25.1, baselineYearM: 20.8, currentYear: 2.51, previousYear: 2.08 },
  { month: 'Dec', currentYearM: 31.4, baselineYearM: 26.3, currentYear: 3.14, previousYear: 2.63, annotation: 'Year-End Surges' }
];

export const SEASONALITY_DATA = MONTHLY_PRESSURE_DATA;

// ----------------------------------------------------------------------------
// 7. Growth Scenarios
// ----------------------------------------------------------------------------
export const BASELINE_EXPENDITURE_RM_B = 121.28;

export const GROWTH_SCENARIOS: GrowthScenarioProjection[] = [
  {
    targetLabel: 'Baseline',
    targetMultiplier: 1.0,
    projectedReceiptsRmB: 121.3,
    deltaRmB: 0.0,
    isBaseline: true
  },
  {
    targetLabel: '+10%',
    targetMultiplier: 1.1,
    projectedReceiptsRmB: 133.4,
    deltaRmB: 12.1
  },
  {
    targetLabel: '+20%',
    targetMultiplier: 1.2,
    projectedReceiptsRmB: 145.5,
    deltaRmB: 24.2
  },
  {
    targetLabel: '+30%',
    targetMultiplier: 1.3,
    projectedReceiptsRmB: 157.6,
    deltaRmB: 36.4
  }
];

// ----------------------------------------------------------------------------
// 8. Capacity Table Data
// ----------------------------------------------------------------------------
export const CAPACITY_TABLE_DATA: CapacityState[] = [
  {
    stateId: 'penang',
    stateName: 'Pulau Pinang',
    code: 'PNG',
    pressureScore: 88,
    bindingConstraint: 'Accommodation Room Density',
    trend: 'up',
    status: 'critical'
  },
  {
    stateId: 'melaka',
    stateName: 'Melaka',
    code: 'MLK',
    pressureScore: 84,
    bindingConstraint: 'Heritage Zone Concentration',
    trend: 'up',
    status: 'critical'
  },
  {
    stateId: 'sabah',
    stateName: 'Sabah',
    code: 'SBH',
    pressureScore: 79,
    bindingConstraint: 'Airport Gate & Protected Area Exposure',
    trend: 'up',
    status: 'watch'
  },
  {
    stateId: 'pahang',
    stateName: 'Pahang',
    code: 'PHG',
    pressureScore: 73,
    bindingConstraint: 'Highland Peak Transit & AOR (75.6%)',
    trend: 'stable',
    status: 'watch'
  },
  {
    stateId: 'johor',
    stateName: 'Johor',
    code: 'JHR',
    pressureScore: 70,
    bindingConstraint: 'Cross-Border Highway Ingress',
    trend: 'up',
    status: 'moderate'
  }
];

// ----------------------------------------------------------------------------
// 9. Data Limitation Note
// ----------------------------------------------------------------------------
export const DATA_LIMITATION_NOTE =
  'Data Note: Official state indicators are derived from DOSM Domestic Tourism Surveys, Tourism Satellite Account (TSA), and OpenStreetMap accessibility diagnostics.';

// Aliases
export const STATES_DATA = STATES_OVERVIEW_DATA;
export const KPI_DATA = NATIONAL_OVERVIEW_KPIS;
"""

with open('src/data/overviewData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved overviewData.ts successfully.")
