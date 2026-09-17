import { KPI_DATA } from '../../../data/overviewData';
import { KpiCard } from './KpiCard';

export class KpiStrip {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'kpi-strip';
    this.element.setAttribute('aria-label', 'Key National Tourism Indicators');

    KPI_DATA.forEach((item) => {
      const card = new KpiCard(item);
      this.element.appendChild(card.element);
    });
  }
}
