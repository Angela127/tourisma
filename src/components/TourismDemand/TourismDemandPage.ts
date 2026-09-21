import './tourismDemand.css';
import { DemandCompositionChart } from './CompositionSection/DemandCompositionChart';
import { StateMetricsChart } from './CompositionSection/StateMetricsChart';

export class TourismDemandPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'tourism-demand-page';

    const section = document.createElement('section');
    section.className = 'demand-section-block';

    const demandChart = new DemandCompositionChart();
    section.appendChild(demandChart.element);

    const stateMetricsChart = new StateMetricsChart();
    section.appendChild(stateMetricsChart.element);

    this.element.appendChild(section);
  }
}
