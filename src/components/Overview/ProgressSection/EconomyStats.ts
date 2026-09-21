import { createElement, Landmark } from 'lucide';
import { ECONOMY_SHARE } from '../../../data/overviewData';

export class EconomyStats {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'economy-stats-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const icon = createElement(Landmark, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#0b57d0',
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'Tourism in the National Economy';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    const scopeBadge = document.createElement('span');
    scopeBadge.className = 'scope-pill';
    scopeBadge.textContent = 'vs ASEAN Avg';

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(scopeBadge);

    // Stat Blocks Container
    const blocksContainer = document.createElement('div');
    blocksContainer.className = 'economy-blocks-container';

    // Stat Block 1: GDP Share
    const gdpBlock = this.createStatBlock(
      'Share of National GDP',
      ECONOMY_SHARE.gdpShare.malaysia,
      ECONOMY_SHARE.gdpShare.aseanAvg,
      '% of Gross Domestic Product',
      30 // max scale for benchmark bar
    );

    // Stat Block 2: Employment Share
    const empBlock = this.createStatBlock(
      'Share of Total Employment',
      ECONOMY_SHARE.employmentShare.malaysia,
      ECONOMY_SHARE.employmentShare.aseanAvg,
      '% of National Workforce (3.6M Jobs)',
      35 // max scale for benchmark bar
    );

    blocksContainer.appendChild(gdpBlock);
    blocksContainer.appendChild(empBlock);

    this.element.appendChild(cardHeader);
    this.element.appendChild(blocksContainer);
  }

  private createStatBlock(
    title: string,
    myVal: number,
    aseanVal: number,
    subtext: string,
    maxScale: number
  ): HTMLElement {
    const block = document.createElement('div');
    block.className = 'economy-stat-block';

    const myPct = Math.round((myVal / maxScale) * 100);
    const aseanPct = Math.round((aseanVal / maxScale) * 100);
    const delta = (myVal - aseanVal).toFixed(1);

    block.innerHTML = `
      <div class="stat-block-header">
        <span class="stat-block-title">${title}</span>
        <span class="stat-benchmark-delta">+${delta}% vs ASEAN</span>
      </div>

      <div class="stat-main-figure">
        <span class="figure-number">${myVal.toFixed(1)}%</span>
        <span class="figure-sub">${subtext}</span>
      </div>

      <!-- Comparative Benchmark Bars -->
      <div class="benchmark-bars-group">
        <div class="benchmark-row">
          <div class="bar-label-col">
            <span class="bar-entity-name">Malaysia</span>
            <span class="bar-entity-val">${myVal.toFixed(1)}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill bar-fill-my" style="width: ${myPct}%"></div>
          </div>
        </div>

        <div class="benchmark-row">
          <div class="bar-label-col">
            <span class="bar-entity-name asean">ASEAN Avg</span>
            <span class="bar-entity-val asean">${aseanVal.toFixed(1)}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill bar-fill-asean" style="width: ${aseanPct}%"></div>
          </div>
        </div>
      </div>
    `;

    return block;
  }
}
