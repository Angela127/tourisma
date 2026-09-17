import { LEFT_KPIS } from '../../../data/globalOverviewData';
import { KpiLineCard } from './KpiLineCard';

export class KpiColumn {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'kpi-left-column';
    this.element.setAttribute('aria-label', 'Key Tourism Metrics');

    LEFT_KPIS.forEach((kpi) => {
      const card = new KpiLineCard(kpi);
      this.element.appendChild(card.element);
    });
  }
}
