import { ForecastChart } from './ForecastChart';
import { ModelCard } from './ModelCard';

export class ForecastSection {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'demand-section-block';

    // Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'demand-section-header';
    sectionHeader.innerHTML = `
      <div class="demand-section-title-wrap">
        <h2 class="demand-section-title">Medium-Term Demand Forecast & Confidence Bounds</h2>
      </div>
      <span class="demand-section-subtitle">Predictive trajectory projection with confidence intervals and algorithmic transparency card</span>
    `;

    const forecastChart = new ForecastChart();
    const modelCard = new ModelCard();

    this.element.appendChild(sectionHeader);
    this.element.appendChild(forecastChart.element);
    this.element.appendChild(modelCard.element);
  }
}
