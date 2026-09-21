import { createElement, PieChart } from 'lucide';
import { CLUSTERS_DATA } from '../../../data/overviewData';

export class DestinationDonut {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'insight-card destination-donut-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const icon = createElement(PieChart, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#0b57d0',
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'Destination Profiles';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    const statesCountBadge = document.createElement('span');
    statesCountBadge.className = 'scope-pill';
    statesCountBadge.textContent = '16 States • 4 Clusters';

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(statesCountBadge);

    // Body: Donut Visual + Detailed Legend
    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'donut-content-body';

    // Donut SVG stage
    const donutStage = document.createElement('div');
    donutStage.className = 'donut-chart-container';
    donutStage.innerHTML = this.renderDonutSvg();

    // Legend with one-line plain language descriptions
    const legendList = document.createElement('div');
    legendList.className = 'donut-cluster-legend';

    CLUSTERS_DATA.forEach((cluster) => {
      const item = document.createElement('div');
      item.className = 'cluster-legend-item';

      item.innerHTML = `
        <div class="legend-header-line">
          <span class="legend-color-dot" style="background-color: ${cluster.color};"></span>
          <span class="legend-cluster-name">${cluster.cluster}</span>
          <span class="legend-cluster-count">${cluster.count} States (${cluster.percentage}%)</span>
        </div>
        <p class="legend-cluster-desc">${cluster.description}</p>
      `;

      legendList.appendChild(item);
    });

    bodyContainer.appendChild(donutStage);
    bodyContainer.appendChild(legendList);

    this.element.appendChild(cardHeader);
    this.element.appendChild(bodyContainer);
  }

  private renderDonutSvg(): string {
    const radius = 54;
    const circumference = 2 * Math.PI * radius; // 339.29
    let accumulatedOffset = 0;

    const arcs = CLUSTERS_DATA.map((c) => {
      const fraction = c.count / 16;
      const arcLength = fraction * circumference;
      const strokeDasharray = `${arcLength.toFixed(2)} ${(circumference - arcLength).toFixed(2)}`;
      const strokeDashoffset = (-accumulatedOffset).toFixed(2);
      accumulatedOffset += arcLength;

      return `
        <circle
          cx="75"
          cy="75"
          r="${radius}"
          fill="transparent"
          stroke="${c.color}"
          stroke-width="20"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment"
          transform="rotate(-90 75 75)"
        />
      `;
    }).join('');

    return `
      <div class="donut-svg-wrapper">
        <svg viewBox="0 0 150 150" class="donut-svg">
          ${arcs}
        </svg>
        <div class="donut-center-label">
          <span class="donut-center-num">16</span>
          <span class="donut-center-text">States</span>
        </div>
      </div>
    `;
  }
}
