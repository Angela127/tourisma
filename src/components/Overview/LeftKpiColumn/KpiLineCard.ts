import { createElement, Users, Wallet, CalendarCheck, Star, ArrowUp } from 'lucide';
import type { LeftKpiData } from '../../../data/globalOverviewData';

export class KpiLineCard {
  public readonly element: HTMLElement;

  constructor(item: LeftKpiData) {
    this.element = document.createElement('div');
    this.element.className = 'kpi-line-card';
    this.element.setAttribute('data-kpi', item.id);

    // Header Row: Icon + Title
    const header = document.createElement('div');
    header.className = 'kpi-card-header';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = `kpi-icon-circle ${item.id}`;

    let iconComponent = Users;
    if (item.id === 'receipts') iconComponent = Wallet;
    else if (item.id === 'length-of-stay') iconComponent = CalendarCheck;
    else if (item.id === 'tourist-satisfaction') iconComponent = Star;

    const icon = createElement(iconComponent, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      class: 'kpi-lucide-icon',
    });
    iconWrapper.appendChild(icon);

    const title = document.createElement('span');
    title.className = 'kpi-card-title';
    title.textContent = item.title;

    header.appendChild(iconWrapper);
    header.appendChild(title);

    // Value Row: Big Number
    const valueRow = document.createElement('div');
    valueRow.className = 'kpi-card-value';
    valueRow.textContent = item.value;

    // Subtitle Row: Arrow + YoY Change
    const changeRow = document.createElement('div');
    changeRow.className = 'kpi-card-change';

    const arrowIcon = createElement(ArrowUp, {
      width: 11,
      height: 11,
      'stroke-width': 3,
      class: 'kpi-arrow-up',
    });
    const changeText = document.createElement('span');
    changeText.textContent = item.change;

    changeRow.appendChild(arrowIcon);
    changeRow.appendChild(changeText);

    // Mini Sparkline with Axis (Y-Axis on left, X-Axis below)
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'kpi-mini-chart-wrapper';
    chartWrapper.innerHTML = this.renderMiniChartSvg(item);

    this.element.appendChild(header);
    this.element.appendChild(valueRow);
    this.element.appendChild(changeRow);
    this.element.appendChild(chartWrapper);
  }

  private renderMiniChartSvg(item: LeftKpiData): string {
    const width = 230;
    const height = 68;
    const padLeft = 32;
    const padRight = 8;
    const padTop = 6;
    const padBottom = 16;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const pts = item.dataPoints;
    const points = pts.map((val, idx) => {
      const x = padLeft + (idx / (pts.length - 1)) * plotW;
      const y = padTop + plotH - (val / item.maxVal) * plotH;
      return { x, y, val };
    });

    // Smooth Bezier curve
    let lineD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lineD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)} ${height - padBottom} L ${points[0].x.toFixed(1)} ${height - padBottom} Z`;
    const gradId = `kpiGrad-${item.id}`;

    // Y Axis Labels
    const yLabels = item.yAxis
      .map((lbl, idx) => {
        const yPos = padTop + (idx / (item.yAxis.length - 1)) * plotH + (idx === 0 ? 4 : idx === item.yAxis.length - 1 ? 0 : 3);
        return `<text x="${padLeft - 5}" y="${yPos.toFixed(1)}" class="kpi-axis-y" text-anchor="end">${lbl}</text>`;
      })
      .join('');

    // X Axis Labels (6 labels evenly spaced)
    const xLabels = item.xAxis
      .map((lbl, idx) => {
        const xPos = padLeft + (idx / (item.xAxis.length - 1)) * plotW;
        return `<text x="${xPos.toFixed(1)}" y="${height - 2}" class="kpi-axis-x" text-anchor="middle">${lbl}</text>`;
      })
      .join('');

    // Points on the line (showing alternating dots for clean look)
    const circles = points
      .filter((_, idx) => idx % 2 === 0 || idx === points.length - 1)
      .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.2" class="kpi-point-dot" />`)
      .join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="kpi-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b57d0" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#0b57d0" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        <!-- Horizontal base grid line -->
        <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#e2e8f0" stroke-width="0.8" />
        
        <!-- Y Axis -->
        ${yLabels}

        <!-- Gradient Area & Line -->
        <path d="${areaD}" fill="url(#${gradId})" />
        <path d="${lineD}" fill="none" stroke="#0b57d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data dots -->
        ${circles}

        <!-- X Axis -->
        ${xLabels}
      </svg>
    `;
  }
}
