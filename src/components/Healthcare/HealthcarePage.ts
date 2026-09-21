import { HealthcareKPIStrip } from './HealthcareKPIStrip';
import { HealthcareAccessStackedBar } from './HealthcareAccessStackedBar';
import { HealthcareCapacityBarChart } from './HealthcareCapacityBarChart';
import { BedOccupancyRateBarChart } from './BedOccupancyRateBarChart';
import { HealthcareMapCard } from './HealthcareMapCard';
import './healthcare.css';

export class HealthcarePage {
  public readonly element: HTMLElement;
  private kpiStrip: HealthcareKPIStrip;
  private mapCard: HealthcareMapCard;
  private accessStackedBar: HealthcareAccessStackedBar;
  private capacityBarChart: HealthcareCapacityBarChart;
  private borBarChart: BedOccupancyRateBarChart;
  private selectedStateId: string | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'healthcare-page';

    // Instantiate components with reactive state synchronization
    this.kpiStrip = new HealthcareKPIStrip();

    this.mapCard = new HealthcareMapCard((stateId) => {
      this.handleStateChange(stateId);
    });

    this.accessStackedBar = new HealthcareAccessStackedBar((stateId) => {
      this.handleStateChange(stateId);
    });

    this.capacityBarChart = new HealthcareCapacityBarChart((stateId) => {
      this.handleStateChange(stateId);
    });

    this.borBarChart = new BedOccupancyRateBarChart((stateId) => {
      this.handleStateChange(stateId);
    });

    this.render();
  }

  public getSelectedStateId(): string | null {
    return this.selectedStateId;
  }

  private handleStateChange(stateId: string | null): void {
    this.selectedStateId = stateId;

    // Synchronize all child components
    this.kpiStrip.updateState(stateId);
    this.mapCard.setSelectedState(stateId);
    this.accessStackedBar.setSelectedState(stateId);
    this.capacityBarChart.setSelectedState(stateId);
    this.borBarChart.setSelectedState(stateId);
  }

  private render(): void {
    this.element.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'hc-page-container';

    // 1. KPI Cards (4 Cards)
    container.appendChild(this.kpiStrip.element);

    // 2. Upper Grid: Map on Left + 100% Stacked Bar on Right
    const upperGrid = document.createElement('div');
    upperGrid.className = 'hc-upper-grid';
    upperGrid.appendChild(this.mapCard.element);
    upperGrid.appendChild(this.accessStackedBar.element);
    container.appendChild(upperGrid);

    // 3. Lower Grid: Capacity Bar on Left + Bed Occupancy Rate on Right
    const lowerGrid = document.createElement('div');
    lowerGrid.className = 'hc-lower-grid';
    lowerGrid.appendChild(this.capacityBarChart.element);
    lowerGrid.appendChild(this.borBarChart.element);
    container.appendChild(lowerGrid);

    this.element.appendChild(container);
  }
}
