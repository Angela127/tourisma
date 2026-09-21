import { SeasonalityHeatmap } from './SeasonalityHeatmap';
import { ConcentrationList } from './ConcentrationList';

export class SeasonalitySection {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'demand-section-block';

    // Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'demand-section-header';
    sectionHeader.innerHTML = `
      <div class="demand-section-title-wrap">
        <h2 class="demand-section-title">Seasonal Distribution & Concentration Pressure</h2>
      </div>
      <span class="demand-section-subtitle">Monthly visitor intensity indexed by state baseline & peak-to-trough surge multipliers</span>
    `;

    // 2-Column Grid
    const grid = document.createElement('div');
    grid.className = 'seasonality-grid';

    const heatmap = new SeasonalityHeatmap();
    const concentrationList = new ConcentrationList();

    grid.appendChild(heatmap.element);
    grid.appendChild(concentrationList.element);

    this.element.appendChild(sectionHeader);
    this.element.appendChild(grid);
  }
}
