import { DemandCompositionChart } from './DemandCompositionChart';
import { SourceMarketsChart } from './SourceMarketsChart';

export class CompositionSection {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'demand-section-block';

    // Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'demand-section-header';
    sectionHeader.innerHTML = `
      <div class="demand-section-title-wrap">
        <h2 class="demand-section-title">Demand Composition & Source Markets</h2>
      </div>
      <span class="demand-section-subtitle">Domestic vs International visitor dynamics and market yield distribution</span>
    `;

    // 2-Column Grid
    const grid = document.createElement('div');
    grid.className = 'composition-grid';

    const compositionChart = new DemandCompositionChart();
    const sourceMarketsChart = new SourceMarketsChart();

    grid.appendChild(compositionChart.element);
    grid.appendChild(sourceMarketsChart.element);

    this.element.appendChild(sectionHeader);
    this.element.appendChild(grid);
  }
}
