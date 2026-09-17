export interface SparklinePoint {
  month: string;
  value: number;
}

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  tooltipNote: string;
}

export type ClusterType =
  | 'Mature Gateway Hubs'
  | 'High-Growth Emerging'
  | 'Eco & Heritage Frontiers'
  | 'Developing Infrastructure';

export interface StateData {
  id: string;
  name: string;
  shortName: string;
  code: string;
  region: 'Peninsular' | 'Borneo';
  visitorsTotal: number; // Millions
  visitorsDomestic: number; // Millions
  visitorsInternational: number; // Millions
  receipts: number; // RM Billions
  receiptsPerVisitor: number; // RM
  readinessScore: number; // 0-100
  cluster: ClusterType;
  pressureScore: number; // 0-100
  bindingConstraint: string;
  pressureTrend: 'up' | 'down' | 'stable';
  topAttractions: string[];
  keyInsight: string;
  monthlyTrend: number[];
}

export interface NationalProgress {
  targetVisitors: number; // 47.0 M
  currentVisitors: number; // 28.5 M
  targetYear: number;
  gapVisitors: number; // 18.5 M
  requiredCagr: number; // 13.8%
  deadlineNotice: string;
}

export interface EconomyShare {
  gdpShare: {
    malaysia: number; // 14.9%
    aseanAvg: number; // 12.1%
  };
  employmentShare: {
    malaysia: number; // 23.4%
    aseanAvg: number; // 16.8%
  };
}

export interface ClusterInfo {
  cluster: ClusterType;
  color: string;
  count: number;
  percentage: number;
  description: string;
  states: string[];
}

export interface MonthlySeasonality {
  month: string;
  currentYear: number; // in Millions
  previousYear: number; // in Millions
  annotation?: string;
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

// 1. KPI Cards Data (Row 1)
export const KPI_DATA: KpiItem[] = [
  {
    id: 'domestic-visitors',
    title: 'Domestic Visitors',
    value: '213.7',
    unit: 'Million',
    change: '+14.2% YoY',
    isPositive: true,
    sparkline: [14.2, 16.5, 15.1, 14.8, 17.2, 21.0, 19.4, 20.1, 16.8, 15.9, 18.2, 24.5],
    tooltipNote: 'Total domestic trips across 16 states & federal territories in 2026',
  },
  {
    id: 'international-arrivals',
    title: 'International Arrivals',
    value: '28.5',
    unit: 'Million',
    change: '+28.4% YoY',
    isPositive: true,
    sparkline: [1.8, 2.1, 2.0, 1.9, 2.3, 2.6, 2.5, 2.7, 2.2, 2.1, 2.5, 3.8],
    tooltipNote: 'Foreign tourists arriving via air, land, and sea checkpoints',
  },
  {
    id: 'total-receipts',
    title: 'Total Tourism Receipts',
    value: '102.4',
    unit: 'RM Billion',
    change: '+22.1% YoY',
    isPositive: true,
    sparkline: [6.8, 7.5, 7.2, 7.1, 8.4, 9.8, 9.1, 9.5, 7.9, 8.0, 9.2, 11.9],
    tooltipNote: 'Combined domestic expenditure and international inbound receipts',
  },
  {
    id: 'avg-expenditure',
    title: 'Avg. Expenditure / Trip',
    value: '1,845',
    unit: 'RM',
    change: '+6.8% YoY',
    isPositive: true,
    sparkline: [1680, 1710, 1700, 1725, 1780, 1820, 1810, 1835, 1800, 1815, 1830, 1845],
    tooltipNote: 'Average spending per visitor trip on lodging, F&B, retail, and transit',
  },
  {
    id: 'avg-length-stay',
    title: 'Avg. Length of Stay',
    value: '4.3',
    unit: 'Nights',
    change: '+0.4 nights',
    isPositive: true,
    sparkline: [3.8, 3.9, 3.9, 4.0, 4.1, 4.2, 4.1, 4.3, 4.2, 4.2, 4.3, 4.3],
    tooltipNote: 'Mean duration of stay per foreign & interstate overnight visitor',
  },
];

// 2. Comprehensive 16 States Data (Row 2 & 3)
export const STATES_DATA: Record<string, StateData> = {
  selangor: {
    id: 'selangor',
    name: 'Selangor',
    shortName: 'Selangor',
    code: 'SGR',
    region: 'Peninsular',
    visitorsTotal: 34.2,
    visitorsDomestic: 26.8,
    visitorsInternational: 7.4,
    receipts: 21.8,
    receiptsPerVisitor: 637,
    readinessScore: 92,
    cluster: 'Mature Gateway Hubs',
    pressureScore: 68,
    bindingConstraint: 'Suburban Arterial Transit',
    pressureTrend: 'up',
    topAttractions: ['Batu Caves', 'Sunway Lagoon', 'Klang Heritage Walk', 'Sepang Circuit'],
    keyInsight: 'Prime industrial & transit corridor with high business tourism throughput.',
    monthlyTrend: [2.5, 2.8, 2.6, 2.7, 3.0, 3.4, 3.1, 3.2, 2.7, 2.8, 3.0, 3.6],
  },
  kuala_lumpur: {
    id: 'kuala_lumpur',
    name: 'WP Kuala Lumpur',
    shortName: 'KL',
    code: 'KUL',
    region: 'Peninsular',
    visitorsTotal: 29.6,
    visitorsDomestic: 15.4,
    visitorsInternational: 14.2,
    receipts: 20.4,
    receiptsPerVisitor: 689,
    readinessScore: 96,
    cluster: 'Mature Gateway Hubs',
    pressureScore: 64,
    bindingConstraint: 'City Core Peak Congestion',
    pressureTrend: 'stable',
    topAttractions: ['Petronas Twin Towers', 'Merdeka 118', 'Bukit Bintang', 'National Museum'],
    keyInsight: 'National capital driving over 50% of total international inbound arrivals.',
    monthlyTrend: [2.2, 2.5, 2.3, 2.4, 2.6, 2.9, 2.8, 2.8, 2.4, 2.5, 2.7, 3.2],
  },
  sabah: {
    id: 'sabah',
    name: 'Sabah',
    shortName: 'Sabah',
    code: 'SBH',
    region: 'Borneo',
    visitorsTotal: 12.8,
    visitorsDomestic: 8.9,
    visitorsInternational: 3.9,
    receipts: 11.2,
    receiptsPerVisitor: 875,
    readinessScore: 78,
    cluster: 'Eco & Heritage Frontiers',
    pressureScore: 79,
    bindingConstraint: 'Airport Gate Capacity',
    pressureTrend: 'up',
    topAttractions: ['Mount Kinabalu', 'Sipadan Island', 'Kinabatangan River', 'Tunku Abdul Rahman Park'],
    keyInsight: 'Premier eco-tourism yield with constrained direct international runway slots.',
    monthlyTrend: [0.9, 1.1, 1.0, 1.0, 1.2, 1.4, 1.3, 1.3, 1.0, 1.1, 1.2, 1.5],
  },
  penang: {
    id: 'penang',
    name: 'Pulau Pinang',
    shortName: 'Penang',
    code: 'PNG',
    region: 'Peninsular',
    visitorsTotal: 14.6,
    visitorsDomestic: 9.8,
    visitorsInternational: 4.8,
    receipts: 10.5,
    receiptsPerVisitor: 719,
    readinessScore: 89,
    cluster: 'Mature Gateway Hubs',
    pressureScore: 88,
    bindingConstraint: 'Accommodation',
    pressureTrend: 'up',
    topAttractions: ['George Town UNESCO Core', 'Penang Hill', 'Batu Ferringhi', 'Kek Lok Si'],
    keyInsight: 'Extreme heritage zone density and weekend hotel capacity saturation.',
    monthlyTrend: [1.1, 1.3, 1.2, 1.1, 1.3, 1.5, 1.4, 1.4, 1.2, 1.2, 1.3, 1.7],
  },
  johor: {
    id: 'johor',
    name: 'Johor',
    shortName: 'Johor',
    code: 'JHR',
    region: 'Peninsular',
    visitorsTotal: 22.4,
    visitorsDomestic: 16.2,
    visitorsInternational: 6.2,
    receipts: 9.8,
    receiptsPerVisitor: 437,
    readinessScore: 82,
    cluster: 'High-Growth Emerging',
    pressureScore: 70,
    bindingConstraint: 'Highway Ingress',
    pressureTrend: 'up',
    topAttractions: ['Legoland Malaysia', 'Desaru Coast', 'Johor Bahru Old Town', 'Endau-Rompin Park'],
    keyInsight: 'Cross-border Singapore day-tripper volume driving high visitor turnover.',
    monthlyTrend: [1.7, 2.0, 1.8, 1.7, 1.9, 2.3, 2.1, 2.2, 1.8, 1.9, 2.1, 2.6],
  },
  sarawak: {
    id: 'sarawak',
    name: 'Sarawak',
    shortName: 'Sarawak',
    code: 'SWK',
    region: 'Borneo',
    visitorsTotal: 10.5,
    visitorsDomestic: 7.6,
    visitorsInternational: 2.9,
    receipts: 8.4,
    receiptsPerVisitor: 800,
    readinessScore: 76,
    cluster: 'Eco & Heritage Frontiers',
    pressureScore: 54,
    bindingConstraint: 'Hinterland Flight Frequency',
    pressureTrend: 'stable',
    topAttractions: ['Gunung Mulu National Park', 'Kuching Waterfront', 'Bako National Park', 'Cultural Village'],
    keyInsight: 'High value nature & festival tourism (RWMF) with ample spatial capacity.',
    monthlyTrend: [0.7, 0.9, 0.8, 0.8, 1.0, 1.2, 1.1, 1.1, 0.8, 0.9, 1.0, 1.2],
  },
  pahang: {
    id: 'pahang',
    name: 'Pahang',
    shortName: 'Pahang',
    code: 'PHG',
    region: 'Peninsular',
    visitorsTotal: 18.2,
    visitorsDomestic: 16.1,
    visitorsInternational: 2.1,
    receipts: 7.6,
    receiptsPerVisitor: 417,
    readinessScore: 79,
    cluster: 'High-Growth Emerging',
    pressureScore: 73,
    bindingConstraint: 'Eco-trail Footfall',
    pressureTrend: 'stable',
    topAttractions: ['Genting Highlands', 'Cameron Highlands', 'Taman Negara', 'Tioman Island'],
    keyInsight: 'Heavy highland domestic leisure concentration facing mountain road bottlenecks.',
    monthlyTrend: [1.3, 1.6, 1.4, 1.4, 1.6, 2.0, 1.8, 1.9, 1.5, 1.5, 1.7, 2.2],
  },
  melaka: {
    id: 'melaka',
    name: 'Melaka',
    shortName: 'Melaka',
    code: 'MLK',
    region: 'Peninsular',
    visitorsTotal: 11.2,
    visitorsDomestic: 8.7,
    visitorsInternational: 2.5,
    receipts: 4.9,
    receiptsPerVisitor: 437,
    readinessScore: 84,
    cluster: 'High-Growth Emerging',
    pressureScore: 84,
    bindingConstraint: 'Seasonal Concentration',
    pressureTrend: 'up',
    topAttractions: ['Jonker Street', 'A Famosa', 'Stadthuys', 'Melaka River Cruise'],
    keyInsight: 'Severe weekend visitor clustering leading to historic city gridlock.',
    monthlyTrend: [0.8, 1.1, 0.9, 0.9, 1.0, 1.3, 1.1, 1.2, 0.9, 1.0, 1.1, 1.4],
  },
  perak: {
    id: 'perak',
    name: 'Perak',
    shortName: 'Perak',
    code: 'PRK',
    region: 'Peninsular',
    visitorsTotal: 15.8,
    visitorsDomestic: 14.4,
    visitorsInternational: 1.4,
    receipts: 4.5,
    receiptsPerVisitor: 285,
    readinessScore: 73,
    cluster: 'High-Growth Emerging',
    pressureScore: 62,
    bindingConstraint: 'Intercity Rail Frequency',
    pressureTrend: 'stable',
    topAttractions: ['Ipoh Old Town', 'Pangkor Island', 'Kellie\'s Castle', 'Belum Rainforest'],
    keyInsight: 'Culinary and eco-heritage leader benefiting from ETS train connectivity.',
    monthlyTrend: [1.1, 1.4, 1.2, 1.2, 1.4, 1.7, 1.5, 1.6, 1.3, 1.3, 1.5, 1.9],
  },
  kedah: {
    id: 'kedah',
    name: 'Kedah',
    shortName: 'Kedah',
    code: 'KDH',
    region: 'Peninsular',
    visitorsTotal: 12.4,
    visitorsDomestic: 9.6,
    visitorsInternational: 2.8,
    receipts: 3.9,
    receiptsPerVisitor: 314,
    readinessScore: 74,
    cluster: 'High-Growth Emerging',
    pressureScore: 66,
    bindingConstraint: 'Ferry Terminal Throughput',
    pressureTrend: 'stable',
    topAttractions: ['Langkawi Geopark', 'Alor Setar Tower', 'Zahir Mosque', 'Gunung Jerai'],
    keyInsight: 'Langkawi duty-free island anchors receipts; mainland rural tourism emerging.',
    monthlyTrend: [0.9, 1.2, 1.0, 0.9, 1.1, 1.3, 1.2, 1.2, 1.0, 1.0, 1.2, 1.5],
  },
  terengganu: {
    id: 'terengganu',
    name: 'Terengganu',
    shortName: 'Terengganu',
    code: 'TRG',
    region: 'Peninsular',
    visitorsTotal: 7.8,
    visitorsDomestic: 6.9,
    visitorsInternational: 0.9,
    receipts: 2.8,
    receiptsPerVisitor: 359,
    readinessScore: 68,
    cluster: 'Eco & Heritage Frontiers',
    pressureScore: 58,
    bindingConstraint: 'Monsoon Off-Season Downtime',
    pressureTrend: 'down',
    topAttractions: ['Redang Island', 'Perhentian Islands', 'Kenyir Lake', 'Crystal Mosque'],
    keyInsight: 'Pristine marine parks experiencing extreme seasonal monsoon swings (Nov-Feb).',
    monthlyTrend: [0.3, 0.4, 0.7, 0.8, 1.0, 1.2, 1.1, 1.1, 0.8, 0.6, 0.3, 0.2],
  },
  negeri_sembilan: {
    id: 'negeri_sembilan',
    name: 'Negeri Sembilan',
    shortName: 'N. Sembilan',
    code: 'NSN',
    region: 'Peninsular',
    visitorsTotal: 8.4,
    visitorsDomestic: 7.7,
    visitorsInternational: 0.7,
    receipts: 2.3,
    receiptsPerVisitor: 274,
    readinessScore: 67,
    cluster: 'Developing Infrastructure',
    pressureScore: 52,
    bindingConstraint: 'Coastal Road Congestion',
    pressureTrend: 'stable',
    topAttractions: ['Port Dickson Beach', 'Seremban Cultural Hub', 'Gunung Datuk', 'Sri Menanti Palace'],
    keyInsight: 'Weekend coastal retreat for Klang Valley residents with room for luxury upgrades.',
    monthlyTrend: [0.6, 0.7, 0.6, 0.6, 0.7, 0.9, 0.8, 0.8, 0.7, 0.7, 0.8, 1.0],
  },
  kelantan: {
    id: 'kelantan',
    name: 'Kelantan',
    shortName: 'Kelantan',
    code: 'KTN',
    region: 'Peninsular',
    visitorsTotal: 6.5,
    visitorsDomestic: 5.9,
    visitorsInternational: 0.6,
    receipts: 1.9,
    receiptsPerVisitor: 292,
    readinessScore: 62,
    cluster: 'Eco & Heritage Frontiers',
    pressureScore: 48,
    bindingConstraint: 'East Coast Expressway Ingress',
    pressureTrend: 'stable',
    topAttractions: ['Siti Khadijah Market', 'Pantai Cahaya Bulan', 'Gunung Stong', 'Handicraft Village'],
    keyInsight: 'Rich Malay artisan heritage with festive balik-kampung surges.',
    monthlyTrend: [0.5, 0.6, 0.5, 0.5, 0.6, 0.7, 0.6, 0.6, 0.5, 0.5, 0.6, 0.7],
  },
  putrajaya: {
    id: 'putrajaya',
    name: 'WP Putrajaya',
    shortName: 'Putrajaya',
    code: 'PJY',
    region: 'Peninsular',
    visitorsTotal: 3.8,
    visitorsDomestic: 3.1,
    visitorsInternational: 0.7,
    receipts: 1.4,
    receiptsPerVisitor: 368,
    readinessScore: 88,
    cluster: 'Developing Infrastructure',
    pressureScore: 42,
    bindingConstraint: 'Evening/Weekend Activations',
    pressureTrend: 'stable',
    topAttractions: ['Putra Mosque', 'Putrajaya Botanical Garden', 'Seri Wawasan Bridge', 'Lake Cruise'],
    keyInsight: 'Modern administrative city with top infrastructure but under-leveraged night economy.',
    monthlyTrend: [0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4],
  },
  labuan: {
    id: 'labuan',
    name: 'WP Labuan',
    shortName: 'Labuan',
    code: 'LBN',
    region: 'Borneo',
    visitorsTotal: 1.2,
    visitorsDomestic: 0.9,
    visitorsInternational: 0.3,
    receipts: 0.5,
    receiptsPerVisitor: 416,
    readinessScore: 65,
    cluster: 'Eco & Heritage Frontiers',
    pressureScore: 38,
    bindingConstraint: 'Mainland Ferry Frequency',
    pressureTrend: 'stable',
    topAttractions: ['Labuan Marine Park', 'War Memorial', 'The Chimney', 'Layang-Layangan Beach'],
    keyInsight: 'Offshore financial center and duty-free island with maritime wreck diving.',
    monthlyTrend: [0.09, 0.10, 0.09, 0.10, 0.10, 0.12, 0.11, 0.11, 0.10, 0.10, 0.11, 0.13],
  },
  perlis: {
    id: 'perlis',
    name: 'Perlis',
    shortName: 'Perlis',
    code: 'PLS',
    region: 'Peninsular',
    visitorsTotal: 1.8,
    visitorsDomestic: 1.6,
    visitorsInternational: 0.2,
    receipts: 0.4,
    receiptsPerVisitor: 222,
    readinessScore: 59,
    cluster: 'Developing Infrastructure',
    pressureScore: 45,
    bindingConstraint: 'Quality Star-Rated Hotels',
    pressureTrend: 'stable',
    topAttractions: ['Gua Kelam', 'Wang Kelian View Point', 'Perlis State Park', 'Timah Tasoh Lake'],
    keyInsight: 'Border crossing state to Thailand with growing eco-geopark agro-tourism appeal.',
    monthlyTrend: [0.13, 0.16, 0.14, 0.14, 0.16, 0.19, 0.17, 0.18, 0.15, 0.15, 0.17, 0.22],
  },
};

// 3. National Progress Arc Data (Row 2 Right)
export const NATIONAL_PROGRESS: NationalProgress = {
  targetVisitors: 47.0,
  currentVisitors: 28.5,
  targetYear: 2026,
  gapVisitors: 18.5,
  requiredCagr: 13.8,
  deadlineNotice: 'Visit Malaysia Strategic Target: 47.0M Arrivals',
};

// 4. Tourism in National Economy (Row 2 Right)
export const ECONOMY_SHARE: EconomyShare = {
  gdpShare: {
    malaysia: 14.9,
    aseanAvg: 12.1,
  },
  employmentShare: {
    malaysia: 23.4,
    aseanAvg: 16.8,
  },
};

// 5. Top States by Receipts (Row 3 Card 1 - Top 8)
export const TOP_STATES_RECEIPTS = [
  { id: 'selangor', name: 'Selangor', receipts: 21.8, share: 21.3 },
  { id: 'kuala_lumpur', name: 'WP Kuala Lumpur', receipts: 20.4, share: 19.9 },
  { id: 'sabah', name: 'Sabah', receipts: 11.2, share: 10.9 },
  { id: 'penang', name: 'Pulau Pinang', receipts: 10.5, share: 10.3 },
  { id: 'johor', name: 'Johor', receipts: 9.8, share: 9.6 },
  { id: 'sarawak', name: 'Sarawak', receipts: 8.4, share: 8.2 },
  { id: 'pahang', name: 'Pahang', receipts: 7.6, share: 7.4 },
  { id: 'melaka', name: 'Melaka', receipts: 4.9, share: 4.8 },
];

// 6. Destination Profiles / Clusters (Row 3 Card 2)
export const CLUSTERS_DATA: ClusterInfo[] = [
  {
    cluster: 'Mature Gateway Hubs',
    color: '#0b57d0',
    count: 3,
    percentage: 18.8,
    description: 'Advanced air connectivity, dense hospitality, and major international transit gateways.',
    states: ['WP Kuala Lumpur', 'Selangor', 'Pulau Pinang'],
  },
  {
    cluster: 'High-Growth Emerging',
    color: '#3b82f6',
    count: 5,
    percentage: 31.2,
    description: 'Rapid domestic drive-to demand, theme parks, and expanding commercial leisure assets.',
    states: ['Johor', 'Melaka', 'Pahang', 'Perak', 'Kedah'],
  },
  {
    cluster: 'Eco & Heritage Frontiers',
    color: '#60a5fa',
    count: 5,
    percentage: 31.2,
    description: 'High-biodiversity, UNESCO geoparks, and indigenous culture with delicate carrying limits.',
    states: ['Sabah', 'Sarawak', 'Terengganu', 'Kelantan', 'WP Labuan'],
  },
  {
    cluster: 'Developing Infrastructure',
    color: '#93c5fd',
    count: 3,
    percentage: 18.8,
    description: 'High latent tourism potential needing upgraded transit links, branded keys, and amenities.',
    states: ['Negeri Sembilan', 'WP Putrajaya', 'Perlis'],
  },
];

// 7. Seasonality Line Chart Data (Row 3 Card 3)
export const SEASONALITY_DATA: MonthlySeasonality[] = [
  { month: 'Jan', currentYear: 2.30, previousYear: 1.95 },
  { month: 'Feb', currentYear: 2.45, previousYear: 2.10, annotation: 'Chinese New Year' },
  { month: 'Mar', currentYear: 2.15, previousYear: 1.80 },
  { month: 'Apr', currentYear: 2.05, previousYear: 1.70, annotation: 'Hari Raya Aidilfitri' },
  { month: 'May', currentYear: 2.35, previousYear: 2.00 },
  { month: 'Jun', currentYear: 2.85, previousYear: 2.40, annotation: 'Mid-Year Holidays' },
  { month: 'Jul', currentYear: 2.70, previousYear: 2.25 },
  { month: 'Aug', currentYear: 2.75, previousYear: 2.30, annotation: 'National Day' },
  { month: 'Sep', currentYear: 2.20, previousYear: 1.85 },
  { month: 'Oct', currentYear: 2.10, previousYear: 1.75 },
  { month: 'Nov', currentYear: 2.50, previousYear: 2.05 },
  { month: 'Dec', currentYear: 3.10, previousYear: 2.65, annotation: 'Year-End Surge' },
];

// 8. States Approaching Capacity (Row 3 Card 4) - ONLY PLACE WITH AMBER
export const CAPACITY_TABLE_DATA: CapacityState[] = [
  {
    stateId: 'penang',
    stateName: 'Pulau Pinang',
    code: 'PNG',
    pressureScore: 88,
    bindingConstraint: 'Accommodation',
    trend: 'up',
    status: 'critical',
  },
  {
    stateId: 'melaka',
    stateName: 'Melaka',
    code: 'MLK',
    pressureScore: 84,
    bindingConstraint: 'Seasonal Concentration',
    trend: 'up',
    status: 'critical',
  },
  {
    stateId: 'sabah',
    stateName: 'Sabah',
    code: 'SBH',
    pressureScore: 79,
    bindingConstraint: 'Airport Gate Capacity',
    trend: 'up',
    status: 'watch',
  },
  {
    stateId: 'pahang',
    stateName: 'Pahang',
    code: 'PHG',
    pressureScore: 73,
    bindingConstraint: 'Eco-trail Footfall',
    trend: 'stable',
    status: 'watch',
  },
  {
    stateId: 'johor',
    stateName: 'Johor',
    code: 'JHR',
    pressureScore: 70,
    bindingConstraint: 'Highway Ingress',
    trend: 'up',
    status: 'moderate',
  },
];

// 9. Single Factual Limitation Sentence
export const DATA_LIMITATION_NOTE =
  'Data limitation: Figures represent annual state-level aggregates and do not capture intra-annual district disparities or informal homestay transactions.';
