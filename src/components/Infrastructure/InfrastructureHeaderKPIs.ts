import { createElement, TrendingUp, TrendingDown, Info } from 'lucide';
import { INFRASTRUCTURE_KPIS } from '../../data/infrastructureData';

export class InfrastructureHeaderKPIs {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'infra-kpi-grid';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    INFRASTRUCTURE_KPIS.forEach((kpi) => {
      const card = document.createElement('div');
      card.className = 'infra-kpi-card';

      // Card Header
      const header = document.createElement('div');
      header.className = 'infra-kpi-top';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'infra-kpi-title-wrap';

      const title = document.createElement('span');
      title.className = 'infra-kpi-title';
      title.textContent = kpi.title;

      const infoIconWrapper = document.createElement('span');
      infoIconWrapper.className = 'infra-kpi-info-icon';
      infoIconWrapper.setAttribute('title', kpi.tooltipNote);
      const infoIcon = createElement(Info, {
        width: 12,
        height: 12,
        'stroke-width': 2,
      });
      infoIconWrapper.appendChild(infoIcon);

      titleWrap.appendChild(title);
      titleWrap.appendChild(infoIconWrapper);

      const badge = document.createElement('div');
      badge.className = `infra-kpi-change-pill ${kpi.isPositive ? '' : 'negative'}`;
      const trendIcon = createElement(kpi.isPositive ? TrendingUp : TrendingDown, {
        width: 11,
        height: 11,
        'stroke-width': 2.2,
      });
      const changeText = document.createElement('span');
      changeText.textContent = kpi.change;
      badge.appendChild(trendIcon);
      badge.appendChild(changeText);

      header.appendChild(titleWrap);
      header.appendChild(badge);

      // Card Value Row
      const valueRow = document.createElement('div');
      valueRow.className = 'infra-kpi-middle';

      const valSpan = document.createElement('span');
      valSpan.className = 'infra-kpi-value';
      valSpan.textContent = kpi.value;

      const unitSpan = document.createElement('span');
      unitSpan.className = 'infra-kpi-unit';
      unitSpan.textContent = kpi.unit;

      valueRow.appendChild(valSpan);
      valueRow.appendChild(unitSpan);

      // Full-Width Smooth Sparkline
      const sparklineWrapper = document.createElement('div');
      sparklineWrapper.className = 'infra-sparkline-wrapper';
      sparklineWrapper.innerHTML = this.generateSparklineSvg(kpi.sparkline, kpi.id, kpi.isPositive);

      card.appendChild(header);
      card.appendChild(valueRow);
      card.appendChild(sparklineWrapper);

      this.element.appendChild(card);
    });
  }

  private generateSparklineSvg(data: number[], id: string, isPositive: boolean): string {
    if (!data || data.length < 2) return '';
    const width = 220;
    const height = 34;
    const padding = 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });

    // Smooth cubic bezier path
    let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
    const lastPoint = points[points.length - 1];
    const gradId = `infra-spark-grad-${id}`;
    const strokeColor = isPositive ? '#0b57d0' : '#dc2626';

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="infra-sparkline-svg">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.22" />
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#${gradId})" />
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${lastPoint.x.toFixed(1)}" cy="${lastPoint.y.toFixed(1)}" r="3" fill="${strokeColor}" />
      </svg>
    `;
  }
}
