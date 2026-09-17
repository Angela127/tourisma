import { createElement, Eye } from 'lucide';
import { WORLD_GEO_DATA } from '../../../data/worldGeo';

export class WorldMapCard {
  public readonly element: HTMLElement;
  private tooltipElement: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'world-map-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'world-map-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'world-map-header-left';

    const titleRow = document.createElement('div');
    titleRow.className = 'map-title-row';

    const mainTitle = document.createElement('h2');
    mainTitle.className = 'map-main-title';
    mainTitle.textContent = 'GLOBAL VIEW';

    const titleDivider = document.createElement('span');
    titleDivider.className = 'map-title-divider';
    titleDivider.textContent = '|';

    const subTitle = document.createElement('span');
    subTitle.className = 'map-sub-title';
    subTitle.textContent = 'Arrivals by Country';

    titleRow.appendChild(mainTitle);
    titleRow.appendChild(titleDivider);
    titleRow.appendChild(subTitle);

    const helperText = document.createElement('p');
    helperText.className = 'map-helper-text';
    helperText.textContent = 'Click on the map to explore';

    headerLeft.appendChild(titleRow);
    headerLeft.appendChild(helperText);

    // Right: Toggle view button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'map-toggle-view-btn';
    const eyeIcon = createElement(Eye, {
      width: 14,
      height: 14,
      'stroke-width': 2,
    });
    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = 'Toggle view';

    toggleBtn.appendChild(toggleLabel);
    toggleBtn.appendChild(eyeIcon);

    cardHeader.appendChild(headerLeft);
    cardHeader.appendChild(toggleBtn);

    // Map SVG Stage
    const mapStage = document.createElement('div');
    mapStage.className = 'world-map-stage';

    // Tooltip
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'world-map-tooltip';
    this.tooltipElement.style.display = 'none';

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'world-svg-wrapper';
    svgWrapper.innerHTML = this.renderWorldSvg();

    // Bottom Legend
    const legend = document.createElement('div');
    legend.className = 'world-map-legend';
    legend.innerHTML = `
      <span class="legend-metric-label">Arrivals (Millions)</span>
      <div class="legend-bar-container">
        <div class="legend-gradient-strip"></div>
        <div class="legend-ticks-row">
          <span>0</span>
          <span>1M</span>
          <span>10M</span>
          <span>50M</span>
          <span>100M+</span>
        </div>
      </div>
    `;

    mapStage.appendChild(svgWrapper);
    mapStage.appendChild(legend);
    mapStage.appendChild(this.tooltipElement);

    this.element.appendChild(cardHeader);
    this.element.appendChild(mapStage);

    this.attachEventListeners();
  }

  private getColorForLevel(level: number): string {
    switch (level) {
      case 0:
        return '#e0f2fe';
      case 1:
        return '#bae6fd';
      case 2:
        return '#60a5fa';
      case 3:
        return '#1d4ed8';
      case 4:
        return '#0b57d0';
      default:
        return '#cbd5e1';
    }
  }

  private renderWorldSvg(): string {
    const paths = WORLD_GEO_DATA.map((country) => {
      const fill = this.getColorForLevel(country.level);
      return `
        <path
          d="${country.path}"
          fill="${fill}"
          stroke="#ffffff"
          stroke-width="1.2"
          stroke-linejoin="round"
          class="world-country-path"
          data-id="${country.id}"
          data-name="${country.name}"
          data-arrivals="${country.arrivals}"
        />
      `;
    }).join('');

    return `
      <svg viewBox="0 0 1000 500" class="world-svg" preserveAspectRatio="xMidYMid meet">
        <g class="world-countries-group">
          ${paths}
        </g>
      </svg>
    `;
  }

  private attachEventListeners(): void {
    const paths = this.element.querySelectorAll<SVGPathElement>('.world-country-path');
    paths.forEach((p) => {
      p.addEventListener('mouseenter', (e: MouseEvent) => {
        const name = p.getAttribute('data-name') || '';
        const arrivals = p.getAttribute('data-arrivals') || '';
        this.showTooltip(name, arrivals, e);
      });

      p.addEventListener('mousemove', (e: MouseEvent) => {
        this.moveTooltip(e);
      });

      p.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  private showTooltip(name: string, arrivals: string, event: MouseEvent): void {
    this.tooltipElement.innerHTML = `
      <div class="tt-world-title">${name}</div>
      <div class="tt-world-val">Arrivals: <strong>${arrivals}</strong></div>
    `;
    this.tooltipElement.style.display = 'block';
    this.moveTooltip(event);
  }

  private moveTooltip(event: MouseEvent): void {
    const stageRect = this.element.getBoundingClientRect();
    const x = event.clientX - stageRect.left + 12;
    const y = event.clientY - stageRect.top + 12;
    this.tooltipElement.style.left = `${x}px`;
    this.tooltipElement.style.top = `${y}px`;
  }

  private hideTooltip(): void {
    this.tooltipElement.style.display = 'none';
  }
}
