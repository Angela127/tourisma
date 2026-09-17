import { createElement, TrendingUp, TrendingDown, Info } from 'lucide';
import type { KpiItem } from '../../../data/overviewData';

export class KpiCard {
  public readonly element: HTMLElement;

  constructor(item: KpiItem) {
    this.element = document.createElement('div');
    this.element.className = 'kpi-card';
    this.element.setAttribute('data-kpi-id', item.id);

    // Card Header
    const header = document.createElement('div');
    header.className = 'kpi-header';

    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'kpi-title-wrapper';

    const title = document.createElement('span');
    title.className = 'kpi-title';
    title.textContent = item.title;

    const infoIconWrapper = document.createElement('span');
    infoIconWrapper.className = 'kpi-info-icon';
    infoIconWrapper.setAttribute('title', item.tooltipNote);
    const infoIcon = createElement(Info, {
      width: 13,
      height: 13,
      'stroke-width': 2,
    });
    infoIconWrapper.appendChild(infoIcon);

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(infoIconWrapper);

    const badge = document.createElement('div');
    badge.className = `kpi-badge ${item.isPositive ? 'positive' : 'negative'}`;
    const trendIcon = createElement(item.isPositive ? TrendingUp : TrendingDown, {
      width: 12,
      height: 12,
      'stroke-width': 2.2,
    });
    const changeText = document.createElement('span');
    changeText.textContent = item.change;
    badge.appendChild(trendIcon);
    badge.appendChild(changeText);

    header.appendChild(titleWrapper);
    header.appendChild(badge);

    // Card Value
    const valueRow = document.createElement('div');
    valueRow.className = 'kpi-value-row';

    const value = document.createElement('span');
    value.className = 'kpi-value';
    value.textContent = item.value;

    const unit = document.createElement('span');
    unit.className = 'kpi-unit';
    unit.textContent = item.unit;

    valueRow.appendChild(value);
    valueRow.appendChild(unit);

    // 40px Sparkline Container
    const sparklineWrapper = document.createElement('div');
    sparklineWrapper.className = 'kpi-sparkline-wrapper';
    sparklineWrapper.innerHTML = this.generateSparklineSvg(item.sparkline, item.id);

    this.element.appendChild(header);
    this.element.appendChild(valueRow);
    this.element.appendChild(sparklineWrapper);
  }

  private generateSparklineSvg(data: number[], id: string): string {
    const width = 220;
    const height = 40;
    const padding = 3;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });

    // Generate smooth cubic bezier SVG path
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
    const gradId = `spark-grad-${id}`;

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="sparkline-svg">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b57d0" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#0b57d0" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#${gradId})" />
        <path d="${pathD}" fill="none" stroke="#0b57d0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${lastPoint.x.toFixed(1)}" cy="${lastPoint.y.toFixed(1)}" r="3" fill="#0b57d0" />
      </svg>
    `;
  }
}
