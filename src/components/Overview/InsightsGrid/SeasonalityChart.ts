import { createElement, CalendarDays } from 'lucide';
import { SEASONALITY_DATA } from '../../../data/overviewData';

export class SeasonalityChart {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'insight-card seasonality-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const icon = createElement(CalendarDays, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#0b57d0',
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'Monthly Seasonality';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    // Legend pills (Current Year vs Previous Year)
    const legendPills = document.createElement('div');
    legendPills.className = 'seasonality-legend-pills';
    legendPills.innerHTML = `
      <span class="legend-pill current"><span class="line-swatch current"></span>2026 (Current)</span>
      <span class="legend-pill previous"><span class="line-swatch previous"></span>2025 (Previous)</span>
    `;

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(legendPills);

    // Chart SVG Area
    const chartContainer = document.createElement('div');
    chartContainer.className = 'seasonality-chart-container';
    chartContainer.innerHTML = this.renderLineChartSvg();

    this.element.appendChild(cardHeader);
    this.element.appendChild(chartContainer);
  }

  private renderLineChartSvg(): string {
    const width = 360;
    const height = 170;
    const padLeft = 32;
    const padRight = 14;
    const padTop = 16;
    const padBottom = 26;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const maxVal = 3.5; // Max 3.5M visitors
    const minVal = 1.5; // Min 1.5M visitors
    const range = maxVal - minVal;

    const getX = (idx: number) => padLeft + (idx / (SEASONALITY_DATA.length - 1)) * plotW;
    const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;

    // Current Year points & path
    const currPoints = SEASONALITY_DATA.map((d, i) => ({ x: getX(i), y: getY(d.currentYear) }));
    let currPath = `M ${currPoints[0].x.toFixed(1)} ${currPoints[0].y.toFixed(1)}`;
    for (let i = 0; i < currPoints.length - 1; i++) {
      const p0 = currPoints[i === 0 ? 0 : i - 1];
      const p1 = currPoints[i];
      const p2 = currPoints[i + 1];
      const p3 = currPoints[i + 2 < currPoints.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      currPath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const currArea = `${currPath} L ${currPoints[currPoints.length - 1].x.toFixed(1)} ${height - padBottom} L ${currPoints[0].x.toFixed(1)} ${height - padBottom} Z`;

    // Previous Year points & path
    const prevPoints = SEASONALITY_DATA.map((d, i) => ({ x: getX(i), y: getY(d.previousYear) }));
    let prevPath = `M ${prevPoints[0].x.toFixed(1)} ${prevPoints[0].y.toFixed(1)}`;
    for (let i = 0; i < prevPoints.length - 1; i++) {
      const p0 = prevPoints[i === 0 ? 0 : i - 1];
      const p1 = prevPoints[i];
      const p2 = prevPoints[i + 1];
      const p3 = prevPoints[i + 2 < prevPoints.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      prevPath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // Grid lines & labels
    const gridY1 = getY(3.0);
    const gridY2 = getY(2.0);

    // X axis month labels
    const monthLabels = SEASONALITY_DATA.map((d, i) => {
      const x = getX(i);
      return `<text x="${x.toFixed(1)}" y="${height - 8}" class="chart-axis-label" text-anchor="middle">${d.month}</text>`;
    }).join('');

    // Peak dots
    const peakCircles = currPoints
      .map((p, i) => {
        const d = SEASONALITY_DATA[i];
        return `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" class="chart-point-dot" />
          <title>${d.month}: 2026 = ${d.currentYear.toFixed(2)}M (${d.annotation || 'Regular'})</title>
        `;
      })
      .join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="seasonality-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="seasonalityAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b57d0" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#0b57d0" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid lines -->
        <line x1="${padLeft}" y1="${gridY1.toFixed(1)}" x2="${width - padRight}" y2="${gridY1.toFixed(1)}" stroke="#e2e8f0" stroke-dasharray="3 3" />
        <text x="${padLeft - 6}" y="${gridY1 + 4}" class="chart-axis-label" text-anchor="end">3.0M</text>

        <line x1="${padLeft}" y1="${gridY2.toFixed(1)}" x2="${width - padRight}" y2="${gridY2.toFixed(1)}" stroke="#e2e8f0" stroke-dasharray="3 3" />
        <text x="${padLeft - 6}" y="${gridY2 + 4}" class="chart-axis-label" text-anchor="end">2.0M</text>

        <!-- Previous Year Dash Line -->
        <path d="${prevPath}" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4 4" />

        <!-- Current Year Area & Line -->
        <path d="${currArea}" fill="url(#seasonalityAreaGrad)" />
        <path d="${currPath}" fill="none" stroke="#0b57d0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Peak Markers -->
        ${peakCircles}

        <!-- X Axis Labels -->
        ${monthLabels}
      </svg>
    `;
  }
}
