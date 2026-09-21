import './destinations.css';
import { ClusterScatterChart } from './ClusterScatterChart';
import { DestinationCardGrid } from './DestinationCardGrid';
import { StateDetailDrawer } from '../Common/StateDetailDrawer';

export class DestinationsPage {
  public readonly element: HTMLElement;
  private stateDrawer: StateDetailDrawer;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'destinations-page';

    this.stateDrawer = new StateDetailDrawer();
    this.render();
  }

  private handleSelectState(stateId: string): void {
    this.stateDrawer.open(stateId);
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Top Section: Cluster Overview Quadrant Scatter
    const topSection = document.createElement('section');
    topSection.className = 'dest-section-block';

    const topHeader = document.createElement('div');
    topHeader.className = 'dest-section-header';
    topHeader.innerHTML = `
      <div class="dest-section-title-wrap">
        <h2 class="dest-section-title">Destination Cluster Overview</h2>
      </div>
      <span class="dest-section-subtitle">Algorithmic classification across demand volume, lodging capacity, and growth elasticity</span>
    `;

    const clusterChart = new ClusterScatterChart((stateId) => this.handleSelectState(stateId));
    topSection.appendChild(topHeader);
    topSection.appendChild(clusterChart.element);
    this.element.appendChild(topSection);

    // 2. Middle Section: 16 Destination Cards Grid
    const cardsSection = document.createElement('section');
    cardsSection.className = 'dest-section-block';

    const cardsHeader = document.createElement('div');
    cardsHeader.className = 'dest-section-header';
    cardsHeader.innerHTML = `
      <div class="dest-section-title-wrap">
        <h2 class="dest-section-title">Destination Profiles & Performance Matrix</h2>
      </div>
      <span class="dest-section-subtitle">Comprehensive diagnostic profiles and deep drill-down analytics for all 16 states</span>
    `;

    const cardGrid = new DestinationCardGrid((stateId) => this.handleSelectState(stateId));
    cardsSection.appendChild(cardsHeader);
    cardsSection.appendChild(cardGrid.element);
    this.element.appendChild(cardsSection);

    // Append State Detail Drawer
    this.element.appendChild(this.stateDrawer.backdrop);
    this.element.appendChild(this.stateDrawer.element);
  }
}
