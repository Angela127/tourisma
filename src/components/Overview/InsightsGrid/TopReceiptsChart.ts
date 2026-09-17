import { createElement, Banknote } from 'lucide';
import { TOP_STATES_RECEIPTS } from '../../../data/overviewData';

export class TopReceiptsChart {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'insight-card top-receipts-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const icon = createElement(Banknote, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#0b57d0',
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'Top States by Receipts';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    const unitBadge = document.createElement('span');
    unitBadge.className = 'scope-pill';
    unitBadge.textContent = 'Top 8 • RM Billion';

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(unitBadge);

    // Bars List Container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'horizontal-bars-container';

    const maxReceipt = TOP_STATES_RECEIPTS[0].receipts; // 21.8B

    TOP_STATES_RECEIPTS.forEach((state, index) => {
      const row = document.createElement('div');
      row.className = 'hbar-row';

      const barWidthPct = Math.round((state.receipts / maxReceipt) * 100);

      row.innerHTML = `
        <div class="hbar-meta">
          <span class="hbar-rank">${index + 1}</span>
          <span class="hbar-name" title="${state.name}">${state.name}</span>
          <span class="hbar-val">RM ${state.receipts.toFixed(1)}B</span>
        </div>
        <div class="hbar-track">
          <div class="hbar-fill" style="width: ${barWidthPct}%;"></div>
        </div>
      `;

      barsContainer.appendChild(row);
    });

    this.element.appendChild(cardHeader);
    this.element.appendChild(barsContainer);
  }
}
