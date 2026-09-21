import './infrastructure.css';
import { InfrastructureHeaderKPIs } from './InfrastructureHeaderKPIs';
import { CapacityUtilisationChart } from './CapacityUtilisationChart';
import { SupplyDemandScatter } from './SupplyDemandScatter';
import { SupplyGrowthMultiples } from './SupplyGrowthMultiples';
import { ConstraintTable } from './ConstraintTable';
import { StateDrawer } from '../Overview/MapSection/StateDrawer';
import { STATES_DATA } from '../../data/overviewData';

export class InfrastructurePage {
  public readonly element: HTMLElement;
  private stateDrawer: StateDrawer;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'infrastructure-page';

    // State Drawer instance
    this.stateDrawer = new StateDrawer();

    this.render();
  }

  private handleSelectState(stateId: string): void {
    const state = STATES_DATA[stateId];
    if (state) {
      this.stateDrawer.open(state);
    }
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Header Strip - 4 KPIs
    const kpis = new InfrastructureHeaderKPIs();
    this.element.appendChild(kpis.element);

    // 2. Main Area: Capacity Utilisation & Supply vs Demand Equilibrium
    const mainSection = document.createElement('section');
    mainSection.className = 'infra-section-block';

    const mainHeader = document.createElement('div');
    mainHeader.className = 'infra-section-header';
    mainHeader.innerHTML = `
      <div class="infra-section-title-wrap">
        <h2 class="infra-section-title">Capacity Utilisation & Balance</h2>
      </div>
      <span class="infra-section-subtitle">Accommodation load factors, national benchmark thresholds, and supply-demand equilibrium</span>
    `;

    const mainGrid = document.createElement('div');
    mainGrid.className = 'infra-main-grid';

    const capacityChart = new CapacityUtilisationChart((stateId) => this.handleSelectState(stateId));
    const scatterPlot = new SupplyDemandScatter((stateId) => this.handleSelectState(stateId));

    mainGrid.appendChild(capacityChart.element);
    mainGrid.appendChild(scatterPlot.element);

    mainSection.appendChild(mainHeader);
    mainSection.appendChild(mainGrid);
    this.element.appendChild(mainSection);

    // 3. Lower Section: Accommodation Supply Growth & Constraint Table
    const lowerSection = document.createElement('section');
    lowerSection.className = 'infra-section-block';

    const lowerHeader = document.createElement('div');
    lowerHeader.className = 'infra-section-header';
    lowerHeader.innerHTML = `
      <div class="infra-section-title-wrap">
        <h2 class="infra-section-title">Supply Trajectory & Binding Constraints</h2>
      </div>
      <span class="infra-section-subtitle">Multi-year room pipeline elasticity and destination-level capacity bottlenecks</span>
    `;

    const lowerGrid = document.createElement('div');
    lowerGrid.className = 'infra-lower-grid';

    const growthMultiples = new SupplyGrowthMultiples((stateId) => this.handleSelectState(stateId));
    const constraintTable = new ConstraintTable((stateId) => this.handleSelectState(stateId));

    lowerGrid.appendChild(growthMultiples.element);
    lowerGrid.appendChild(constraintTable.element);

    lowerSection.appendChild(lowerHeader);
    lowerSection.appendChild(lowerGrid);
    this.element.appendChild(lowerSection);

    // Append State Drawer backdrop & drawer element
    this.element.appendChild(this.stateDrawer.backdrop);
    this.element.appendChild(this.stateDrawer.element);
  }
}
