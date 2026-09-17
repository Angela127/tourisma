import './sustainability.css';
import { PressureMapHero } from './PressureMapHero';
import { PressureSignalsList } from './PressureSignalsList';
import { PressureRadarCard } from './PressureRadarCard';
import { PressureValueScatter } from './PressureValueScatter';
import { PressureTrajectoryChart } from './PressureTrajectoryChart';
import { MethodologyPanel } from './MethodologyPanel';
import { StateDetailDrawer } from '../Common/StateDetailDrawer';

export class SustainabilityPage {
  public readonly element: HTMLElement;
  private stateDrawer: StateDetailDrawer;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'sustainability-page';

    this.stateDrawer = new StateDetailDrawer();
    this.render();
  }

  private handleSelectState(stateId: string): void {
    this.stateDrawer.open(stateId);
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Hero Section: Map + Right Rail Signals
    const heroSection = document.createElement('section');
    heroSection.className = 'sus-section-block';

    const heroHeader = document.createElement('div');
    heroHeader.className = 'sus-section-header';
    heroHeader.innerHTML = `
      <div class="sus-section-title-wrap">
        <h2 class="sus-section-title">Spatial Carry-Capacity & Early Warning Diagnostic</h2>
      </div>
      <span class="sus-section-subtitle">Multi-dimensional pressure thresholds and active destination stress signals</span>
    `;

    const heroGrid = document.createElement('div');
    heroGrid.className = 'sus-hero-grid';

    const mapHero = new PressureMapHero((stateId) => this.handleSelectState(stateId));
    const signalsList = new PressureSignalsList((stateId) => this.handleSelectState(stateId));

    heroGrid.appendChild(mapHero.element);
    heroGrid.appendChild(signalsList.element);

    heroSection.appendChild(heroHeader);
    heroSection.appendChild(heroGrid);
    this.element.appendChild(heroSection);

    // 2. Middle Band: Radar Comparison
    const middleSection = document.createElement('section');
    middleSection.className = 'sus-section-block';

    const middleGrid = document.createElement('div');
    middleGrid.className = 'sus-middle-grid';

    const radarCard = new PressureRadarCard();
    middleGrid.appendChild(radarCard.element);
    middleSection.appendChild(middleGrid);
    this.element.appendChild(middleSection);

    // 3. Lower Band: Value vs Pressure Scatter & Trajectory Chart
    const lowerSection = document.createElement('section');
    lowerSection.className = 'sus-section-block';

    const lowerHeader = document.createElement('div');
    lowerHeader.className = 'sus-section-header';
    lowerHeader.innerHTML = `
      <div class="sus-section-title-wrap">
        <h2 class="sus-section-title">Economic Yield Balance & Multi-Year Trajectory</h2>
      </div>
      <span class="sus-section-subtitle">Pressure vs visitor yield quadrants and longitudinal index evolution (2020–2026)</span>
    `;

    const lowerGrid = document.createElement('div');
    lowerGrid.className = 'sus-lower-grid';

    const valueScatter = new PressureValueScatter((stateId) => this.handleSelectState(stateId));
    const trajectoryChart = new PressureTrajectoryChart((stateId) => this.handleSelectState(stateId));

    lowerGrid.appendChild(valueScatter.element);
    lowerGrid.appendChild(trajectoryChart.element);

    lowerSection.appendChild(lowerHeader);
    lowerSection.appendChild(lowerGrid);
    this.element.appendChild(lowerSection);

    // 4. Collapsible Methodology Panel
    const methodology = new MethodologyPanel();
    this.element.appendChild(methodology.element);

    // Append State Detail Drawer
    this.element.appendChild(this.stateDrawer.backdrop);
    this.element.appendChild(this.stateDrawer.element);
  }
}
