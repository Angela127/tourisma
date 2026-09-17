export type ReportType =
  | 'national_overview'
  | 'state_brief'
  | 'scenario_comparison'
  | 'cluster_analysis';

export type OutputFormat = 'pdf' | 'pptx';

export interface ReportSectionConfig {
  id: string;
  name: string;
  description: string;
  previewThumbnail: string; // SVG icon or mini visualization representation
  defaultChecked: boolean;
}

export interface GeneratedReportItem {
  id: string;
  name: string;
  type: ReportType;
  scope: string;
  dateGenerated: string;
  fileSize: string;
  format: OutputFormat;
  downloadFilename: string;
}

export const REPORT_SECTIONS_CONFIG: ReportSectionConfig[] = [
  {
    id: 'sec_exec_summary',
    name: 'Executive Summary & National KPIs',
    description: 'Headline visitor totals, receipts, length of stay, and macroeconomic GDP/employment shares.',
    previewThumbnail: 'kpi',
    defaultChecked: true,
  },
  {
    id: 'sec_demand_composition',
    name: 'Demand Composition & Source Markets',
    description: 'Domestic vs international volume split and top 15 origin markets yield contrast.',
    previewThumbnail: 'area',
    defaultChecked: true,
  },
  {
    id: 'sec_seasonality_matrix',
    name: '16×12 State Seasonality & Concentration Matrix',
    description: 'Monthly indexed volume heatmap and peak-to-trough surge multipliers across 16 states.',
    previewThumbnail: 'heatmap',
    defaultChecked: true,
  },
  {
    id: 'sec_capacity_utilisation',
    name: 'Accommodation Capacity & Strain Diagnosis',
    description: 'Occupancy benchmarks, room supply vs demand equilibrium, and binding constraints.',
    previewThumbnail: 'bar',
    defaultChecked: true,
  },
  {
    id: 'sec_sustainability_pressure',
    name: 'Carry-Capacity & Early Warning Signals',
    description: 'Diverging spatial pressure map, radar profiles, and critical bottleneck alerts.',
    previewThumbnail: 'radar',
    defaultChecked: true,
  },
  {
    id: 'sec_cluster_quadrants',
    name: 'Strategic Destination Clusters & Growth Quadrants',
    description: 'K-Means 4-cluster classification: absorb growth, under pressure, under-utilised, foundational.',
    previewThumbnail: 'scatter',
    defaultChecked: true,
  },
  {
    id: 'sec_scenario_forecast',
    name: 'Scenario Projections & Confidence Bounds',
    description: 'Medium-term trajectory simulation comparing Baseline, Accelerated, and High-Yield pathways.',
    previewThumbnail: 'line',
    defaultChecked: false,
  },
];

export const INITIAL_PREVIOUS_REPORTS: GeneratedReportItem[] = [
  {
    id: 'rep_001',
    name: 'National Tourism Performance & Capacity Diagnostic 2026',
    type: 'national_overview',
    scope: 'All 16 States (National Benchmark)',
    dateGenerated: '16 Sep 2026, 14:32',
    fileSize: '3.4 MB',
    format: 'pdf',
    downloadFilename: 'Tourisma_National_Diagnostic_2026.pdf',
  },
  {
    id: 'rep_002',
    name: 'Penang & Melaka Heritage Carry-Capacity Alert Brief',
    type: 'state_brief',
    scope: 'Pulau Pinang, Melaka',
    dateGenerated: '12 Sep 2026, 09:15',
    fileSize: '1.8 MB',
    format: 'pdf',
    downloadFilename: 'Tourisma_State_Brief_Penang_Melaka.pdf',
  },
  {
    id: 'rep_003',
    name: '2026–2030 Growth Scenario Comparison Deck',
    type: 'scenario_comparison',
    scope: 'Malaysia Macro Model',
    dateGenerated: '05 Sep 2026, 16:45',
    fileSize: '6.2 MB',
    format: 'pptx',
    downloadFilename: 'Tourisma_Scenario_Comparison_2030.pptx',
  },
];
