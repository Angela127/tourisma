export interface DatasetRegistryItem {
  id: string;
  name: string;
  publisher: string;
  geoGranularity: string;
  timeGranularity: string;
  periodCovered: string;
  recordCount: string;
  lastUpdated: string;
  status: 'active' | 'partial' | 'not_used';
  variables: { name: string; type: string; description: string }[];
  modelUsage: string;
}

export interface LineageNode {
  id: string;
  stage: string;
  title: string;
  summary: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface StateDataQuality {
  stateId: string;
  stateName: string;
  code: string;
  indicators: {
    inboundArrivals: 'complete' | 'partial' | 'unavailable';
    domesticVolume: 'complete' | 'partial' | 'unavailable';
    occupancyRate: 'complete' | 'partial' | 'unavailable';
    roomInventory: 'complete' | 'partial' | 'unavailable';
    visitorExpenditure: 'complete' | 'partial' | 'unavailable';
    transitIngress: 'complete' | 'partial' | 'unavailable';
    utilitiesWaste: 'complete' | 'partial' | 'unavailable';
    residentRatio: 'complete' | 'partial' | 'unavailable';
  };
}

export interface ModelMethodologyCard {
  id: string;
  modelName: string;
  purpose: string;
  method: string;
  inputFeatures: string[];
  trainingPeriod: string;
  validationApproach: string;
  validationResult: string;
  assumptionsAndCaveats: string;
}

// 1. Dataset Registry
export const DATASET_REGISTRY: DatasetRegistryItem[] = [
  {
    id: 'ds_inbound_arrivals',
    name: 'International Tourist Arrivals & Border Movements',
    publisher: 'Immigration Department of Malaysia / MOTAC',
    geoGranularity: 'Port of Entry & State Checkpoint',
    timeGranularity: 'Monthly',
    periodCovered: 'Jan 2018 – Dec 2026',
    recordCount: '48,200 records',
    lastUpdated: '15 Dec 2026',
    status: 'active',
    variables: [
      { name: 'country_of_origin', type: 'STRING (ISO-3166)', description: 'Nationality and passport country of foreign visitor' },
      { name: 'arrival_port_code', type: 'STRING (IATA/ICAO)', description: 'Air, land or sea international gateway checkpoint' },
      { name: 'visitor_count', type: 'INTEGER', description: 'Headcount of international travellers staying ≥24 hours' },
      { name: 'travel_mode', type: 'ENUM (Air/Land/Sea)', description: 'Transportation vehicle mode at border checkpoint' },
    ],
    modelUsage:
      'Feeds the Demand Composition stacked area chart, Top 15 Source Markets ranking, and provides ground-truth foreign visitor counts for ARIMA/Prophet forecasting.',
  },
  {
    id: 'ds_domestic_survey',
    name: 'Domestic Tourism Survey (DTS)',
    publisher: 'Department of Statistics Malaysia (DOSM)',
    geoGranularity: 'State of Destination (16 States)',
    timeGranularity: 'Quarterly / Annual Sample',
    periodCovered: '2018 – 2026',
    recordCount: '184,000 household samples',
    lastUpdated: '01 Nov 2026',
    status: 'active',
    variables: [
      { name: 'origin_state', type: 'STRING', description: 'State of residence of domestic traveler' },
      { name: 'dest_state', type: 'STRING', description: 'Primary destination visited during overnight/day trip' },
      { name: 'trip_purpose', type: 'ENUM', description: 'Holiday, Visiting Friends/Relatives (VFR), Business, Medical' },
      { name: 'spend_lodging_myr', type: 'DECIMAL', description: 'Expenditure on commercial accommodation in Ringgit Malaysia' },
      { name: 'spend_total_myr', type: 'DECIMAL', description: 'Total expenditure on lodging, F&B, retail, and domestic transit' },
    ],
    modelUsage:
      'Provides state-by-state domestic visitor volumes, expenditure yield distributions, and motivation breakdown in the Trip Characteristics module.',
  },
  {
    id: 'ds_hotel_occupancy',
    name: 'National Hotel Room & Occupancy Survey',
    publisher: 'Tourism Malaysia / Malaysian Association of Hotels (MAH)',
    geoGranularity: 'State & Tourism Star Tier',
    timeGranularity: 'Monthly',
    periodCovered: 'Jan 2019 – Dec 2026',
    recordCount: '34,500 monthly returns',
    lastUpdated: '10 Dec 2026',
    status: 'active',
    variables: [
      { name: 'hotel_id', type: 'STRING', description: 'Unique registered establishment identifier' },
      { name: 'star_rating', type: 'ENUM (1-Star to 5-Star, Boutique, Homestay)', description: 'Ministry classification rating' },
      { name: 'total_available_rooms', type: 'INTEGER', description: 'Commercial rooms available for sale during reporting month' },
      { name: 'occupied_room_nights', type: 'INTEGER', description: 'Sum of guest room nights sold during period' },
      { name: 'occupancy_rate_pct', type: 'PERCENTAGE', description: 'Ratio of occupied room nights to total room capacity' },
    ],
    modelUsage:
      'Forms the backbone of the Infrastructure Capacity Utilisation bar chart, strain thresholds, and the Accommodation Strain factor in the Sustainability TPI.',
  },
  {
    id: 'ds_airport_movements',
    name: 'Airport Passenger Movements & Flight Slots',
    publisher: 'Malaysia Airports Holdings Berhad (MAHB)',
    geoGranularity: '39 Commercial Airports',
    timeGranularity: 'Monthly / Real-Time Slots',
    periodCovered: '2019 – 2026',
    recordCount: '126,000 movements',
    lastUpdated: '05 Dec 2026',
    status: 'active',
    variables: [
      { name: 'airport_code', type: 'STRING', description: 'KUL, BKI, KCH, PEN, LGK, JHB, etc.' },
      { name: 'scheduled_seat_capacity', type: 'INTEGER', description: 'Available airline seat inventory on arriving routes' },
      { name: 'passenger_load_factor', type: 'PERCENTAGE', description: 'Utilisation percentage of aircraft seats' },
      { name: 'international_share', type: 'PERCENTAGE', description: 'Direct foreign flight proportion' },
    ],
    modelUsage:
      'Acts as high-frequency leading indicator in the Demand Forecast model and informs the Airport Gate Capacity binding constraint.',
  },
  {
    id: 'ds_environmental_telemetry',
    name: 'Municipal Waste, Potable Water & Marine Park Telemetry',
    publisher: 'Department of Environment (DOE) / State Water Authorities',
    geoGranularity: 'Selected Municipalities & Marine Islands',
    timeGranularity: 'Quarterly',
    periodCovered: '2020 – 2026',
    recordCount: '12,400 records',
    lastUpdated: '30 Sep 2026',
    status: 'partial',
    variables: [
      { name: 'district_code', type: 'STRING', description: 'District or Island Marine Park zone' },
      { name: 'waste_tonnage_pax', type: 'FLOAT', description: 'Solid municipal waste per estimated daily visitor' },
      { name: 'water_consumption_ratio', type: 'PERCENTAGE', description: 'Peak municipal water demand relative to dry-season reservoir capacity' },
    ],
    modelUsage:
      'Feeds the Environmental Indicators dimension in the Tourism Pressure Index and triggers early warning signals for island ecosystems (e.g. Redang, Sipadan).',
  },
  {
    id: 'ds_telecom_mobility',
    name: 'De-identified Cellular Ingress & Roaming Density',
    publisher: 'Telecom Operators / MCMC (Research Collaboration)',
    geoGranularity: '500m Grid Aggregate',
    timeGranularity: 'Hourly Sampled',
    periodCovered: '2024 – 2026',
    recordCount: '1.4M aggregated pings',
    lastUpdated: '01 Dec 2026',
    status: 'not_used',
    variables: [
      { name: 'grid_cell_id', type: 'STRING', description: '500m hexagonal spatial spatial identifier' },
      { name: 'active_roaming_sims', type: 'INTEGER', description: 'Aggregate foreign and out-of-state SIM devices' },
    ],
    modelUsage:
      'Reference only for high-density hotspot calibration; not included in live production pipelines to preserve privacy standards.',
  },
];

// 2. Data Lineage Flow
export const DATA_LINEAGE_NODES: LineageNode[] = [
  {
    id: 'node_raw',
    stage: '1. Raw Ingestion',
    title: 'Source Ingestion & API Telemetry',
    summary: 'Consolidates MOTAC, DOSM, MAHB, and MAH datasets via automated batch ETL pipelines.',
    description:
      'Automated extraction of structured tabular reports, border immigration tallies, airline seat telemetry, and hotel registry data with schema validation against ISO-3166 country and state codes.',
    inputs: ['Immigration border logs', 'DOSM domestic survey microdata', 'MAH hotel registry', 'MAHB flight manifests'],
    outputs: ['Unified Raw Landing Tables (PostgreSQL Staging)'],
  },
  {
    id: 'node_clean',
    stage: '2. Cleaning & Harmonisation',
    title: 'Cleansing, Imputation & Deflation',
    summary: 'Handles missing state-level splits, removes seasonal outliers, and deflates currency to 2026 constant RM.',
    description:
      'Missing state-level transport series (e.g. Putrajaya/Labuan) are marked as explicitly unavailable rather than imputed with biased proxies. Expenditure is deflated using DOSM Tourism Consumer Price Sub-Index.',
    inputs: ['Unified Raw Landing Tables'],
    outputs: ['Harmonized Clean Data Series (16 States × 84 Months)'],
  },
  {
    id: 'node_feature',
    stage: '3. Feature Engineering',
    title: 'Metrics & Elasticity Extraction',
    summary: 'Derives Gini seasonality indices, visitor-nights per available room, and peak-to-trough multipliers.',
    description:
      'Engineers 18 normalized features including: spatial visitor density per km², Gini coefficient of monthly arrival distribution, peak-to-trough surge ratios, and expenditure yield per visitor night.',
    inputs: ['Harmonized Clean Data Series'],
    outputs: ['Standardized Feature Matrix (Z-Score Normalized)'],
  },
  {
    id: 'node_models',
    stage: '4. Analytical Modeling',
    title: 'Clustering, Forecasts & Pressure Indices',
    summary: 'Executes K-Means destination clustering, Ensemble ARIMA+Prophet forecasting, and TPI computation.',
    description:
      'Runs K-Means (k=4) for destination archetypes, fits Ensemble ARIMA+Prophet with 95% confidence intervals on 7-year monthly history, and computes the 5-dimensional Tourism Pressure Index.',
    inputs: ['Standardized Feature Matrix'],
    outputs: ['Cluster Assignments', 'Demand Forecast Series', 'Composite Pressure Scores'],
  },
  {
    id: 'node_outputs',
    stage: '5. Dashboard & Report Engine',
    title: 'Interactive Diagnostics & Policy Briefs',
    summary: 'Presents responsive charts, real Malaysia maps, and exports executive PDF/PowerPoint reports.',
    description:
      'Renders high-contrast interactive views: Overview KPIs, Demand Composition & Seasonality, Capacity Utilisation bars, Sustainability Carry-Capacity Maps, and one-click PDF policy briefs.',
    inputs: ['Cluster Assignments', 'Forecast Series', 'TPI Diagnostic Tables'],
    outputs: ['Live Tourisma Platform & Downloadable Policy Briefs'],
  },
];

// 3. Data Quality & Coverage Matrix across all 16 States
export const STATE_DATA_QUALITY: StateDataQuality[] = [
  {
    stateId: 'selangor', stateName: 'Selangor', code: 'SGR',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'kuala_lumpur', stateName: 'WP Kuala Lumpur', code: 'KUL',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'penang', stateName: 'Pulau Pinang', code: 'PNG',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'johor', stateName: 'Johor', code: 'JHR',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'sabah', stateName: 'Sabah', code: 'SBH',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'sarawak', stateName: 'Sarawak', code: 'SWK',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'melaka', stateName: 'Melaka', code: 'MLK',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'pahang', stateName: 'Pahang', code: 'PHG',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'perak', stateName: 'Perak', code: 'PRK',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'kedah', stateName: 'Kedah', code: 'KDH',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'terengganu', stateName: 'Terengganu', code: 'TRG',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'negeri_sembilan', stateName: 'Negeri Sembilan', code: 'NSN',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'complete', transitIngress: 'complete', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
  {
    stateId: 'kelantan', stateName: 'Kelantan', code: 'KTN',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'partial', transitIngress: 'partial', utilitiesWaste: 'unavailable', residentRatio: 'complete' }
  },
  {
    stateId: 'putrajaya', stateName: 'WP Putrajaya', code: 'PJY',
    indicators: { inboundArrivals: 'partial', domesticVolume: 'complete', occupancyRate: 'complete', roomInventory: 'complete', visitorExpenditure: 'partial', transitIngress: 'unavailable', utilitiesWaste: 'complete', residentRatio: 'complete' }
  },
  {
    stateId: 'perlis', stateName: 'Perlis', code: 'PLS',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'partial', roomInventory: 'complete', visitorExpenditure: 'partial', transitIngress: 'partial', utilitiesWaste: 'unavailable', residentRatio: 'complete' }
  },
  {
    stateId: 'labuan', stateName: 'WP Labuan', code: 'LBN',
    indicators: { inboundArrivals: 'complete', domesticVolume: 'complete', occupancyRate: 'partial', roomInventory: 'complete', visitorExpenditure: 'partial', transitIngress: 'unavailable', utilitiesWaste: 'partial', residentRatio: 'complete' }
  },
];

export const KNOWN_LIMITATIONS: string[] = [
  'Annual Domestic Frequency: Household domestic survey data is conducted at an annual cadence; quarterly sub-period breakdowns utilize calibrated mobility indices.',
  'State-Level Transport Boundaries: Federal Territories of Putrajaya and Labuan lack autonomous state-level port registry data; Putrajaya ingress is merged with Selangor / KL transit lines.',
  'Pandemic Disruption Window (2020–2021): Structural collapse in mobility during Movement Control Orders requires intervention dummy variables in time-series forecasting to eliminate negative slope distortion.',
  'Ecological Telemetry Reporting Gaps: Potable water and solid waste data are reported with varying quarterly latency across regional water boards in Kelantan, Perlis, and Pahang.',
];

// 4. Model Methodology Cards
export const MODEL_METHODOLOGY_CARDS: ModelMethodologyCard[] = [
  {
    id: 'mod_clustering',
    modelName: 'K-Means Destination Strategic Clustering',
    purpose: 'Discovers empirical destination archetypes across 16 states based on capacity, demand intensity, and expenditure yield.',
    method: 'K-Means Clustering with Euclidean distance metric over 18 z-score normalized features; optimal k=4 selected via Elbow Method and Silhouette maximization.',
    inputFeatures: ['Annual visitor density', 'Room inventory', 'Occupancy rate', 'Length of stay', 'Expenditure per trip', 'Gini seasonality ratio'],
    trainingPeriod: '2022 – 2026 (Post-pandemic structural recovery baseline)',
    validationApproach: 'Silhouette coefficient analysis and 5-fold cross-validation of cluster boundary stability.',
    validationResult: 'Silhouette Score = 0.742 (High cluster cohesion and separation).',
    assumptionsAndCaveats:
      'Assumes linear metric normalization; destination cluster boundaries are algorithmic constructs and should be reviewed alongside qualitative state policy goals.',
  },
  {
    id: 'mod_forecast',
    modelName: 'Ensemble Medium-Term Demand Forecast (ARIMA + Prophet)',
    purpose: 'Projects quarterly visitor volume trajectories and 95% confidence intervals up to 2030.',
    method: 'Hybrid Weighted Ensemble: Auto-ARIMA(2,1,1)(1,1,0)[4] combined with additive Prophet model with holiday and school break seasonal regressors.',
    inputFeatures: ['Historical monthly arrival series', 'Scheduled airline seat capacity', 'GDP growth forecasts', 'ASEAN regional outbound index'],
    trainingPeriod: '2018 – 2026 (84 monthly observations with 2020–2021 intervention dummy)',
    validationApproach: 'Rolling-origin cross-validation (12-month out-of-sample backtesting).',
    validationResult: 'Mean Absolute Percentage Error (MAPE) = 3.42%, RMSE = 0.18M visitors.',
    assumptionsAndCaveats:
      'Assumes macroeconomic stability and no severe geopolitical or pandemic border closures over the forecast horizon.',
  },
  {
    id: 'mod_tpi',
    modelName: 'Tourism Pressure Index (TPI Carry-Capacity)',
    purpose: 'Quantifies spatial, lodging, and ecological strain to detect early warning bottlenecks before physical capacity failure.',
    method: 'Multi-criteria weighted composite index normalized to 0–100 scale using min-max scaling and expert-calibrated policy weights.',
    inputFeatures: ['Lodging load factor (30%)', 'Spatial resident density (25%)', 'Seasonality Gini (20%)', 'Ecological footprint (15%)', 'Transit congestion (10%)'],
    trainingPeriod: 'Calibrated on 2019–2026 historical congestion episodes',
    validationApproach: 'Sensitivity analysis across weight perturbations (±10%) and correlation against localized infrastructure incident logs.',
    validationResult: 'Strong empirical correlation (r = 0.88) with reported holiday congestion alerts.',
    assumptionsAndCaveats:
      'TPI is a synthetic diagnostic index designed for policy planning, not an official statutory standard.',
  },
  {
    id: 'mod_elasticity',
    modelName: 'Visitor Yield Elasticity & Expenditure Simulator',
    purpose: 'Simulates the macroeconomic impact of shifting visitor market mix toward high-yield source countries.',
    method: 'Log-log econometric regression estimating expenditure elasticity of length-of-stay and origin market spend multipliers.',
    inputFeatures: ['Per-diem market expenditure', 'Flight duration', 'Average stay duration', 'Exchange rate volatility index'],
    trainingPeriod: '2019 – 2026 MOTAC expenditure reports',
    validationApproach: 'Adjusted R-squared and heteroskedasticity-robust standard error estimation.',
    validationResult: 'Adjusted R² = 0.864; high explanatory power for origin spend dynamics.',
    assumptionsAndCaveats:
      'Assumes hotel and domestic service pricing adjusts smoothly to shifts in international guest composition.',
  },
];
