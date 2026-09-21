import type { ClusterType } from './overviewData';

export type PressureDimension =
  | 'visitor_density'
  | 'accommodation_strain'
  | 'seasonal_concentration'
  | 'environmental_indicators'
  | 'composite_pressure';

export interface DimensionMetric {
  score: number; // 0 - 100
  value: string;
  threshold: string;
  status: 'headroom' | 'strain' | 'critical';
  trend: 'up' | 'stable' | 'down';
}

export interface StateSustainabilityData {
  id: string;
  name: string;
  code: string;
  cluster: ClusterType;
  compositeScore: number;
  receiptsPerVisitor: number; // in RM
  dimensions: {
    visitor_density: DimensionMetric;
    accommodation_strain: DimensionMetric;
    seasonal_concentration: DimensionMetric;
    environmental_indicators: DimensionMetric;
    composite_pressure: DimensionMetric;
  };
  trajectoryHistory: { year: number; score: number }[];
  isAboveThreshold: boolean;
  primarySignalDimension: string;
  narrative: string;
}

export const SUSTAINABILITY_METHODOLOGY = {
  title: 'Methodology & Composition of Tourism Pressure Index (TPI)',
  subtitle: 'Modelled Composite Diagnostic Index (Not an Official Government Statistic)',
  description:
    'The Tourism Pressure Index (TPI) is a synthetic composite metric engineered to detect spatial, infrastructure, seasonal, and ecological carry-capacity stress across Malaysian states before irreversible degradation occurs. It operates on a normalized 0–100 scale where scores below 50 reflect abundant headroom, 50–75 indicate emerging strain, and scores above 75 denote critical capacity bottlenecks.',
  weights: [
    { dimension: 'Accommodation & Lodging Load', weight: '30%', indicators: 'Monthly room occupancy rate, visitor-nights per available room, and peak-season weekend hotel deficits.' },
    { dimension: 'Spatial & Resident Density', weight: '25%', indicators: 'Annual tourist volume per square kilometer and ratio of daily peak visitor count to local resident population.' },
    { dimension: 'Seasonal Inflow Concentration', weight: '20%', indicators: 'Gini coefficient of monthly arrivals, peak-to-trough ratio, and monsoon arrival compression multipliers.' },
    { dimension: 'Ecological & Resource Footprint', weight: '15%', indicators: 'Municipal solid waste generation surges, potable water draw in heritage/island zones, and eco-buffer proximity.' },
    { dimension: 'Infrastructure & Arterial Transit', weight: '10%', indicators: 'First-mile highway ingress congestion index, airport runway slot saturation, and island ferry terminal throughput.' },
  ],
  disclaimer:
    'Notice: TPI is an algorithmic simulation model generated from combined MOTAC, DOSM, State Tourism Action Councils, and transport telemetry data. It is intended for spatial planning diagnostics and policy scenario modeling.',
};

export const SUSTAINABILITY_STATES_DATA: Record<string, StateSustainabilityData> = {
  penang: {
    id: 'penang',
    name: 'Pulau Pinang',
    code: 'PNG',
    cluster: 'Mature Gateway Hubs',
    compositeScore: 86.4,
    receiptsPerVisitor: 719,
    isAboveThreshold: true,
    primarySignalDimension: 'Accommodation Strain & Heritage Density',
    narrative:
      'Penang faces acute heritage buffer zone saturation in George Town. Weekend occupancy exceeds 84.5% against a 70% threshold, while vehicular density across the dual bridge corridors creates extreme transit bottlenecks during public holidays.',
    dimensions: {
      visitor_density: { score: 92.0, value: '14,038 pax/km²', threshold: '8,000 pax/km²', status: 'critical', trend: 'up' },
      accommodation_strain: { score: 88.5, value: '84.5% occ (312 nts/rm)', threshold: '70.0% occ', status: 'critical', trend: 'up' },
      seasonal_concentration: { score: 76.2, value: '1.92× peak-to-trough', threshold: '1.60×', status: 'strain', trend: 'stable' },
      environmental_indicators: { score: 84.0, value: '2.84 kg waste/pax/day', threshold: '2.10 kg', status: 'critical', trend: 'up' },
      composite_pressure: { score: 86.4, value: '86.4 / 100', threshold: '70.0 / 100', status: 'critical', trend: 'up' },
    },
    trajectoryHistory: [
      { year: 2020, score: 38.0 },
      { year: 2021, score: 32.5 },
      { year: 2022, score: 62.0 },
      { year: 2023, score: 74.5 },
      { year: 2024, score: 80.2 },
      { year: 2025, score: 83.8 },
      { year: 2026, score: 86.4 },
    ],
  },
  melaka: {
    id: 'melaka',
    name: 'Melaka',
    code: 'MLK',
    cluster: 'Mature Gateway Hubs',
    compositeScore: 81.2,
    receiptsPerVisitor: 654,
    isAboveThreshold: true,
    primarySignalDimension: 'Weekend Historic Core Saturation',
    narrative:
      'Melaka exhibits extreme weekend visitor surge concentration in the UNESCO historic zone. While weekday capacity has headroom, weekend lodging demand pushes past 78% occupancy with localized river-corridor waste and parking deficits.',
    dimensions: {
      visitor_density: { score: 85.0, value: '6,265 pax/km²', threshold: '5,000 pax/km²', status: 'critical', trend: 'up' },
      accommodation_strain: { score: 79.8, value: '77.8% occ (284 nts/rm)', threshold: '70.0% occ', status: 'strain', trend: 'up' },
      seasonal_concentration: { score: 83.5, value: '2.18× weekend surge', threshold: '1.75×', status: 'critical', trend: 'up' },
      environmental_indicators: { score: 74.0, value: '2.45 kg waste/pax/day', threshold: '2.10 kg', status: 'strain', trend: 'stable' },
      composite_pressure: { score: 81.2, value: '81.2 / 100', threshold: '70.0 / 100', status: 'critical', trend: 'up' },
    },
    trajectoryHistory: [
      { year: 2020, score: 34.0 },
      { year: 2021, score: 29.0 },
      { year: 2022, score: 58.0 },
      { year: 2023, score: 69.5 },
      { year: 2024, score: 75.0 },
      { year: 2025, score: 78.4 },
      { year: 2026, score: 81.2 },
    ],
  },
  sabah: {
    id: 'sabah',
    name: 'Sabah',
    code: 'SBH',
    cluster: 'Eco & Heritage Frontiers',
    compositeScore: 78.6,
    receiptsPerVisitor: 875,
    isAboveThreshold: true,
    primarySignalDimension: 'Eco-System & Marine Island Carry-Capacity',
    narrative:
      'Sabah high-yield eco-tourism destinations (Sipadan, Kinabatangan, Mount Kinabalu) operate near strict biological carrying limits. Island resort water drawdown and dive permit caps require strict decentralized visitor management.',
    dimensions: {
      visitor_density: { score: 62.0, value: '173 pax/km²', threshold: '300 pax/km²', status: 'strain', trend: 'stable' },
      accommodation_strain: { score: 75.4, value: '73.4% occ (268 nts/rm)', threshold: '70.0% occ', status: 'strain', trend: 'up' },
      seasonal_concentration: { score: 82.0, value: '2.34× peak-to-trough', threshold: '1.80×', status: 'critical', trend: 'up' },
      environmental_indicators: { score: 89.5, value: '88% Marine Park Capacity', threshold: '75%', status: 'critical', trend: 'up' },
      composite_pressure: { score: 78.6, value: '78.6 / 100', threshold: '70.0 / 100', status: 'critical', trend: 'up' },
    },
    trajectoryHistory: [
      { year: 2020, score: 28.0 },
      { year: 2021, score: 22.0 },
      { year: 2022, score: 49.0 },
      { year: 2023, score: 64.0 },
      { year: 2024, score: 71.2 },
      { year: 2025, score: 75.8 },
      { year: 2026, score: 78.6 },
    ],
  },
  terengganu: {
    id: 'terengganu',
    name: 'Terengganu',
    code: 'TRG',
    cluster: 'Eco & Heritage Frontiers',
    compositeScore: 76.5,
    receiptsPerVisitor: 587,
    isAboveThreshold: true,
    primarySignalDimension: 'Monsoon Arrival Compression (3.15× Peak/Trough)',
    narrative:
      'Terengganu experiences extreme seasonal compression where Redang and Perhentian islands absorb an entire year of demand across 6 dry months, creating massive seasonal infrastructure strain before winter shutdown.',
    dimensions: {
      visitor_density: { score: 58.0, value: '710 pax/km²', threshold: '800 pax/km²', status: 'strain', trend: 'stable' },
      accommodation_strain: { score: 72.8, value: '70.8% occ (258 nts/rm)', threshold: '70.0% occ', status: 'strain', trend: 'up' },
      seasonal_concentration: { score: 94.0, value: '3.15× peak-to-trough', threshold: '1.80×', status: 'critical', trend: 'up' },
      environmental_indicators: { score: 81.0, value: 'Island Marine Runoff 82%', threshold: '70%', status: 'critical', trend: 'up' },
      composite_pressure: { score: 76.5, value: '76.5 / 100', threshold: '70.0 / 100', status: 'critical', trend: 'up' },
    },
    trajectoryHistory: [
      { year: 2020, score: 32.0 },
      { year: 2021, score: 24.0 },
      { year: 2022, score: 51.0 },
      { year: 2023, score: 65.0 },
      { year: 2024, score: 71.0 },
      { year: 2025, score: 74.2 },
      { year: 2026, score: 76.5 },
    ],
  },
  kuala_lumpur: {
    id: 'kuala_lumpur',
    name: 'WP Kuala Lumpur',
    code: 'KUL',
    cluster: 'Mature Gateway Hubs',
    compositeScore: 74.8,
    receiptsPerVisitor: 689,
    isAboveThreshold: true,
    primarySignalDimension: 'Golden Triangle Peak Congestion & 5-Star Occupancy',
    narrative:
      'KL possesses deep transit carrying capacity but experiences concentrated arterial congestion around the Bukit Bintang / KLCC corridor during concurrent MICE and leisure peak weekends.',
    dimensions: {
      visitor_density: { score: 88.0, value: '121,810 pax/km²', threshold: '90,000 pax/km²', status: 'critical', trend: 'up' },
      accommodation_strain: { score: 82.5, value: '81.2% occ (298 nts/rm)', threshold: '70.0% occ', status: 'critical', trend: 'stable' },
      seasonal_concentration: { score: 54.0, value: '1.45× peak-to-trough', threshold: '1.60×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 68.0, value: '1.95 kg waste/pax/day', threshold: '2.10 kg', status: 'strain', trend: 'down' },
      composite_pressure: { score: 74.8, value: '74.8 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 35.0 },
      { year: 2021, score: 28.0 },
      { year: 2022, score: 54.0 },
      { year: 2023, score: 66.0 },
      { year: 2024, score: 70.8 },
      { year: 2025, score: 73.1 },
      { year: 2026, score: 74.8 },
    ],
  },
  johor: {
    id: 'johor',
    name: 'Johor',
    code: 'JHR',
    cluster: 'High-Growth Emerging',
    compositeScore: 69.4,
    receiptsPerVisitor: 437,
    isAboveThreshold: false,
    primarySignalDimension: 'Causeway Ingress & Desaru Weekend Peak',
    narrative:
      'High cross-border day-trip volume from Singapore creates localized bridge checkpoint delays and Desaru coastal hotel compression, though mainland capacity remains broadly absorptive.',
    dimensions: {
      visitor_density: { score: 66.0, value: '1,166 pax/km²', threshold: '1,500 pax/km²', status: 'strain', trend: 'up' },
      accommodation_strain: { score: 72.0, value: '71.5% occ (261 nts/rm)', threshold: '70.0% occ', status: 'strain', trend: 'up' },
      seasonal_concentration: { score: 62.0, value: '1.53× peak-to-trough', threshold: '1.60×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 67.0, value: '1.88 kg waste/pax/day', threshold: '2.10 kg', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 69.4, value: '69.4 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'up' },
    },
    trajectoryHistory: [
      { year: 2020, score: 30.0 },
      { year: 2021, score: 25.0 },
      { year: 2022, score: 48.0 },
      { year: 2023, score: 59.0 },
      { year: 2024, score: 64.2 },
      { year: 2025, score: 67.1 },
      { year: 2026, score: 69.4 },
    ],
  },
  selangor: {
    id: 'selangor',
    name: 'Selangor',
    code: 'SGR',
    cluster: 'Mature Gateway Hubs',
    compositeScore: 66.8,
    receiptsPerVisitor: 637,
    isAboveThreshold: false,
    primarySignalDimension: 'Balanced Gateway Transport Grid',
    narrative:
      'Selangor benefits from extensive dual-airport transit corridors and dispersed hotel supply across Petaling and Sepang, maintaining stable capacity headroom despite high gross visitor volumes.',
    dimensions: {
      visitor_density: { score: 74.0, value: '4,296 pax/km²', threshold: '5,000 pax/km²', status: 'strain', trend: 'up' },
      accommodation_strain: { score: 66.5, value: '66.2% occ (242 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 48.0, value: '1.38× peak-to-trough', threshold: '1.60×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 71.0, value: '1.92 kg waste/pax/day', threshold: '2.10 kg', status: 'strain', trend: 'down' },
      composite_pressure: { score: 66.8, value: '66.8 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 32.0 },
      { year: 2021, score: 26.0 },
      { year: 2022, score: 47.0 },
      { year: 2023, score: 56.5 },
      { year: 2024, score: 61.2 },
      { year: 2025, score: 64.5 },
      { year: 2026, score: 66.8 },
    ],
  },
  pahang: {
    id: 'pahang',
    name: 'Pahang',
    code: 'PHG',
    cluster: 'High-Growth Emerging',
    compositeScore: 64.2,
    receiptsPerVisitor: 456,
    isAboveThreshold: false,
    primarySignalDimension: 'Cameron Highlands Ingress Bottleneck',
    narrative:
      'Pressure is concentrated in Cameron Highlands hill station access roads during holiday weekends, contrasting with large absorptive capacity across coastal Kuantan and national park reserves.',
    dimensions: {
      visitor_density: { score: 52.0, value: '440 pax/km²', threshold: '600 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 64.0, value: '63.5% occ (232 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 71.0, value: '1.74× peak-to-trough', threshold: '1.70×', status: 'strain', trend: 'up' },
      environmental_indicators: { score: 68.0, value: '72% Highland Water Load', threshold: '75%', status: 'strain', trend: 'stable' },
      composite_pressure: { score: 64.2, value: '64.2 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 27.0 },
      { year: 2021, score: 21.0 },
      { year: 2022, score: 43.0 },
      { year: 2023, score: 53.0 },
      { year: 2024, score: 58.6 },
      { year: 2025, score: 61.8 },
      { year: 2026, score: 64.2 },
    ],
  },
  kedah: {
    id: 'kedah',
    name: 'Kedah',
    code: 'KDH',
    cluster: 'High-Growth Emerging',
    compositeScore: 62.5,
    receiptsPerVisitor: 463,
    isAboveThreshold: false,
    primarySignalDimension: 'Langkawi Luxury Inflow Decoupled from Mainland',
    narrative:
      'Langkawi island operates at elevated occupancy during peak dry season, while mainland agricultural corridors hold substantial untapped capacity headroom.',
    dimensions: {
      visitor_density: { score: 58.0, value: '1,277 pax/km²', threshold: '1,600 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 68.0, value: '67.4% occ (247 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'up' },
      seasonal_concentration: { score: 64.0, value: '1.58× peak-to-trough', threshold: '1.65×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 60.0, value: '66% Island Solid Waste', threshold: '75%', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 62.5, value: '62.5 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 26.0 },
      { year: 2021, score: 20.0 },
      { year: 2022, score: 42.0 },
      { year: 2023, score: 52.0 },
      { year: 2024, score: 57.0 },
      { year: 2025, score: 60.1 },
      { year: 2026, score: 62.5 },
    ],
  },
  sarawak: {
    id: 'sarawak',
    name: 'Sarawak',
    code: 'SWK',
    cluster: 'Eco & Heritage Frontiers',
    compositeScore: 54.2,
    receiptsPerVisitor: 767,
    isAboveThreshold: false,
    primarySignalDimension: 'Ample Green Headroom & Eco Carry Capacity',
    narrative:
      'Sarawak maintains broad sustainability headroom across its vast landmass, with festival-driven peak compression well-managed within the Kuching and Miri urban perimeters.',
    dimensions: {
      visitor_density: { score: 32.0, value: '93 pax/km²', threshold: '300 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 66.8, value: '66.8% occ (245 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 58.0, value: '1.48× peak-to-trough', threshold: '1.70×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 48.0, value: '52% Resource Load', threshold: '70%', status: 'headroom', trend: 'down' },
      composite_pressure: { score: 54.2, value: '54.2 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 22.0 },
      { year: 2021, score: 18.0 },
      { year: 2022, score: 36.0 },
      { year: 2023, score: 44.0 },
      { year: 2024, score: 49.0 },
      { year: 2025, score: 52.0 },
      { year: 2026, score: 54.2 },
    ],
  },
  negeri_sembilan: {
    id: 'negeri_sembilan',
    name: 'Negeri Sembilan',
    code: 'NSN',
    cluster: 'High-Growth Emerging',
    compositeScore: 52.8,
    receiptsPerVisitor: 436,
    isAboveThreshold: false,
    primarySignalDimension: 'Port Dickson Weekend Beach Swell',
    narrative:
      'Beach tourism in Port Dickson exhibits high weekend occupancy variance, while inland cultural zones in Seremban and Rembau operate with substantial absorptive capacity.',
    dimensions: {
      visitor_density: { score: 54.0, value: '1,168 pax/km²', threshold: '1,500 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 61.2, value: '61.2% occ (224 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 59.0, value: '1.54× peak-to-trough', threshold: '1.65×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 48.0, value: '1.65 kg waste/pax/day', threshold: '2.10 kg', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 52.8, value: '52.8 / 100', threshold: '70.0 / 100', status: 'strain', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 24.0 },
      { year: 2021, score: 19.0 },
      { year: 2022, score: 36.0 },
      { year: 2023, score: 44.5 },
      { year: 2024, score: 48.0 },
      { year: 2025, score: 50.8 },
      { year: 2026, score: 52.8 },
    ],
  },
  perak: {
    id: 'perak',
    name: 'Perak',
    code: 'PRK',
    cluster: 'High-Growth Emerging',
    compositeScore: 48.5,
    receiptsPerVisitor: 437,
    isAboveThreshold: false,
    primarySignalDimension: 'High Expansion Headroom across Heritage & Ecotourism',
    narrative:
      'Perak maintains strong sustainable capacity headroom across Ipoh, Taiping, and Royal Belum, positioning the state as an ideal destination to absorb dispersed regional growth.',
    dimensions: {
      visitor_density: { score: 45.0, value: '642 pax/km²', threshold: '1,200 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 59.8, value: '59.8% occ (219 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 52.0, value: '1.44× peak-to-trough', threshold: '1.65×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 42.0, value: '45% Resource Load', threshold: '70%', status: 'headroom', trend: 'down' },
      composite_pressure: { score: 48.5, value: '48.5 / 100', threshold: '70.0 / 100', status: 'headroom', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 22.0 },
      { year: 2021, score: 17.0 },
      { year: 2022, score: 33.0 },
      { year: 2023, score: 41.0 },
      { year: 2024, score: 44.5 },
      { year: 2025, score: 46.8 },
      { year: 2026, score: 48.5 },
    ],
  },
  kelantan: {
    id: 'kelantan',
    name: 'Kelantan',
    code: 'KTN',
    cluster: 'Developing Infrastructure',
    compositeScore: 46.2,
    receiptsPerVisitor: 412,
    isAboveThreshold: false,
    primarySignalDimension: 'Foundational Growth Potential',
    narrative:
      'Low density and minimal commercial hotel strain provide extensive headroom, with opportunities focused on upgrading homestay standards and seasonal highway connectivity.',
    dimensions: {
      visitor_density: { score: 42.0, value: '452 pax/km²', threshold: '1,000 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 56.4, value: '56.4% occ (206 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 68.0, value: '2.64× peak-to-trough', threshold: '1.80×', status: 'strain', trend: 'up' },
      environmental_indicators: { score: 38.0, value: '1.42 kg waste/pax/day', threshold: '2.10 kg', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 46.2, value: '46.2 / 100', threshold: '70.0 / 100', status: 'headroom', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 20.0 },
      { year: 2021, score: 16.0 },
      { year: 2022, score: 31.0 },
      { year: 2023, score: 38.0 },
      { year: 2024, score: 42.0 },
      { year: 2025, score: 44.5 },
      { year: 2026, score: 46.2 },
    ],
  },
  putrajaya: {
    id: 'putrajaya',
    name: 'WP Putrajaya',
    code: 'PJY',
    cluster: 'Mature Gateway Hubs',
    compositeScore: 44.0,
    receiptsPerVisitor: 375,
    isAboveThreshold: false,
    primarySignalDimension: 'Under-utilised Civic & Leisure Capacity Buffer',
    narrative:
      'Extensive modern administrative infrastructure and convention centers experience high weekday capacity buffers with ample space to host major weekend cultural events.',
    dimensions: {
      visitor_density: { score: 48.0, value: '97,959 pax/km²', threshold: '120,000 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 52.8, value: '52.8% occ (193 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 38.0, value: '1.28× peak-to-trough', threshold: '1.60×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 40.0, value: '1.50 kg waste/pax/day', threshold: '2.10 kg', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 44.0, value: '44.0 / 100', threshold: '70.0 / 100', status: 'headroom', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 18.0 },
      { year: 2021, score: 14.0 },
      { year: 2022, score: 28.0 },
      { year: 2023, score: 36.0 },
      { year: 2024, score: 40.0 },
      { year: 2025, score: 42.1 },
      { year: 2026, score: 44.0 },
    ],
  },
  labuan: {
    id: 'labuan',
    name: 'WP Labuan',
    code: 'LBN',
    cluster: 'Developing Infrastructure',
    compositeScore: 41.5,
    receiptsPerVisitor: 500,
    isAboveThreshold: false,
    primarySignalDimension: 'Unconstrained Offshore Island Capacity',
    narrative:
      'Low annual visitor volume and established business hotel inventory provide full carrying headroom with opportunities to expand duty-free and diving tourism.',
    dimensions: {
      visitor_density: { score: 36.0, value: '19,650 pax/km²', threshold: '30,000 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 48.2, value: '48.2% occ (176 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 42.0, value: '1.34× peak-to-trough', threshold: '1.60×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 38.0, value: '42% Island Utility Load', threshold: '70%', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 41.5, value: '41.5 / 100', threshold: '70.0 / 100', status: 'headroom', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 19.0 },
      { year: 2021, score: 15.0 },
      { year: 2022, score: 27.0 },
      { year: 2023, score: 34.0 },
      { year: 2024, score: 38.0 },
      { year: 2025, score: 40.0 },
      { year: 2026, score: 41.5 },
    ],
  },
  perlis: {
    id: 'perlis',
    name: 'Perlis',
    code: 'PLS',
    cluster: 'Developing Infrastructure',
    compositeScore: 37.8,
    receiptsPerVisitor: 364,
    isAboveThreshold: false,
    primarySignalDimension: 'Maximum Ecological & Spatial Headroom',
    narrative:
      'Perlis registers the lowest composite pressure nationwide with substantial capacity to absorb cross-border, nature, and agri-tourism initiatives.',
    dimensions: {
      visitor_density: { score: 38.0, value: '2,696 pax/km²', threshold: '4,500 pax/km²', status: 'headroom', trend: 'stable' },
      accommodation_strain: { score: 44.5, value: '44.5% occ (142 nts/rm)', threshold: '70.0% occ', status: 'headroom', trend: 'stable' },
      seasonal_concentration: { score: 46.0, value: '1.40× peak-to-trough', threshold: '1.65×', status: 'headroom', trend: 'stable' },
      environmental_indicators: { score: 30.0, value: '1.20 kg waste/pax/day', threshold: '2.10 kg', status: 'headroom', trend: 'stable' },
      composite_pressure: { score: 37.8, value: '37.8 / 100', threshold: '70.0 / 100', status: 'headroom', trend: 'stable' },
    },
    trajectoryHistory: [
      { year: 2020, score: 17.0 },
      { year: 2021, score: 13.0 },
      { year: 2022, score: 24.0 },
      { year: 2023, score: 30.5 },
      { year: 2024, score: 34.0 },
      { year: 2025, score: 36.2 },
      { year: 2026, score: 37.8 },
    ],
  },
};
