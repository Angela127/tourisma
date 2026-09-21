import './sustainability.css';
import { NATIONAL_ENVIRONMENT_DATA } from '../../data/environmentData';
import { EnvironmentMapCard } from './EnvironmentMapCard';
import { EnvironmentRingChartCard } from './EnvironmentRingChartCard';
import { EnvironmentExposureBarChart } from './EnvironmentExposureBarChart';
import { StateDetailDrawer } from '../Common/StateDetailDrawer';

export class SustainabilityPage {
  public readonly element: HTMLElement;
  private stateDrawer: StateDetailDrawer;
  private mapCard!: EnvironmentMapCard;
  private ringCard!: EnvironmentRingChartCard;
  private barChart!: EnvironmentExposureBarChart;
  private selectedStateId: string | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'sustainability-page environment-page';

    this.stateDrawer = new StateDetailDrawer();
    this.render();
  }

  private handleSelectState(stateId: string): void {
    this.mapCard.hideTooltip();
    this.barChart.hideTooltip();

    if (this.selectedStateId === stateId) {
      // Toggle off selection
      this.selectedStateId = null;
      this.mapCard.setSelectedState(null);
      this.ringCard.setScope('all');
      this.barChart.setSelectedState(null);
    } else {
      this.selectedStateId = stateId;
      this.mapCard.setSelectedState(stateId);
      this.ringCard.setScope(stateId);
      this.barChart.setSelectedState(stateId);

      // Open State Drawer for comprehensive drilldown
      this.stateDrawer.open(stateId);
    }
  }

  private handleRingScopeChange(scope: string): void {
    if (scope === 'all') {
      this.selectedStateId = null;
      this.mapCard.setSelectedState(null);
      this.barChart.setSelectedState(null);
    } else {
      this.selectedStateId = scope;
      this.mapCard.setSelectedState(scope);
      this.barChart.setSelectedState(scope);
    }
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Top KPI Summary Strip
    const kpiStrip = document.createElement('section');
    kpiStrip.className = 'env-kpi-strip';

    const nat = NATIONAL_ENVIRONMENT_DATA;

    kpiStrip.innerHTML = `
      <div class="env-kpi-card">
        <span class="env-kpi-label">TOTAL SCREENED ASSETS</span>
        <div class="env-kpi-value-wrap">
          <span class="env-kpi-num">${nat.totalAssets.toLocaleString()}</span>
        </div>
        <span class="env-kpi-sub">Across all 16 states & federal territories</span>
      </div>

      <div class="env-kpi-card highlight-exposed">
        <span class="env-kpi-label">SENSITIVE PROXIMITY</span>
        <div class="env-kpi-value-wrap">
          <span class="env-kpi-num">${nat.totalExposed.toLocaleString()}</span>
          <span class="env-kpi-badge warning">${nat.exposurePct}%</span>
        </div>
        <span class="env-kpi-sub">Inside or within 5km ecological buffer</span>
      </div>

      <div class="env-kpi-card highlight-inside">
        <span class="env-kpi-label">PHYSICAL INCURSIONS</span>
        <div class="env-kpi-value-wrap">
          <span class="env-kpi-num">${nat.inside.toLocaleString()}</span>
          <span class="env-kpi-badge critical">${nat.insidePct}%</span>
        </div>
        <span class="env-kpi-sub">Located directly inside protected boundaries</span>
      </div>

      <div class="env-kpi-card highlight-land">
        <span class="env-kpi-label">LAND ECO-EXPOSURE</span>
        <div class="env-kpi-value-wrap">
          <span class="env-kpi-num">${nat.land.exposed.toLocaleString()}</span>
          <span class="env-kpi-badge land">${nat.land.percent}%</span>
        </div>
        <span class="env-kpi-sub">Forest reserves & national terrestrial parks</span>
      </div>

      <div class="env-kpi-card highlight-marine">
        <span class="env-kpi-label">MARINE & REEF EXPOSURE</span>
        <div class="env-kpi-value-wrap">
          <span class="env-kpi-num">${nat.marine.exposed.toLocaleString()}</span>
          <span class="env-kpi-badge marine">${nat.marine.percent}%</span>
        </div>
        <span class="env-kpi-sub">Marine parks, coral ecosystems & turtle sanctuaries</span>
      </div>
    `;

    this.element.appendChild(kpiStrip);

    // 2. Upper Grid: Environmental Map (Left) + Ring Chart (Right)
    const upperGrid = document.createElement('div');
    upperGrid.className = 'env-upper-grid';

    this.mapCard = new EnvironmentMapCard((stateId) => this.handleSelectState(stateId));
    this.ringCard = new EnvironmentRingChartCard((scope) => this.handleRingScopeChange(scope));

    upperGrid.appendChild(this.mapCard.element);
    upperGrid.appendChild(this.ringCard.element);
    this.element.appendChild(upperGrid);

    // 3. Lower Section: Environmental Exposure by State (Land & Marine) Horizontal Bar Chart
    const lowerSection = document.createElement('section');
    lowerSection.className = 'env-lower-section';

    this.barChart = new EnvironmentExposureBarChart((stateId) => this.handleSelectState(stateId));
    lowerSection.appendChild(this.barChart.element);
    this.element.appendChild(lowerSection);

    // Universal State Detail Drawer
    this.element.appendChild(this.stateDrawer.backdrop);
    this.element.appendChild(this.stateDrawer.element);
  }
}
