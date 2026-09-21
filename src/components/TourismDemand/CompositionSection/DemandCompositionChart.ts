import { COMPOSITION_TIME_SERIES } from '../../../data/tourismDemandData';
import type { TimeSeriesPoint } from '../../../data/tourismDemandData';

export type CompositionViewMode = 'absolute' | 'share';

export class DemandCompositionChart {
  public readonly element: HTMLElement;
  private currentMode: CompositionViewMode = 'absolute';
  private chartStage: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header with Toggle
    const header = document.createElement('div');
    header.className = 'demand-card-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'demand-card-title-group';
    titleGroup.innerHTML = `
      <h3 class="demand-card-title">Demand Composition Over Time</h3>
      <span class="demand-card-desc">Domestic vs. International Visitor Inflow (2019 – 2026)</span>
    `;

    // Segmented Toggle
    const toggle = document.createElement('div');
    toggle.className = 'segmented-control';
    toggle.innerHTML = `
      <button class="segmented-btn active" data-mode="absolute">Volume (M)</button>
      <button class="segmented-btn" data-mode="share">Share (%)</button>
    `;

    toggle.querySelectorAll('.segmented-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const mode = target.getAttribute('data-mode') as CompositionViewMode;
        if (mode && mode !== this.currentMode) {
          this.currentMode = mode;
          toggle.querySelectorAll('.segmented-btn').forEach((b) => b.classList.remove('active'));
          target.classList.add('active');
          this.renderChart();
        }
      });
    });

    header.appendChild(titleGroup);
    header.appendChild(toggle);

    this.chartStage = document.createElement('div');
    this.chartStage.className = 'composition-chart-stage';

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend-horizontal';
    legend.innerHTML = `
      <span class="legend-item-pill">
        <span class="legend-dot domestic"></span>
        Domestic Visitors
      </span>
      <span class="legend-item-pill">
        <span class="legend-dot international"></span>
        International Arrivals
      </span>
    `;

    this.element.appendChild(header);
    this.element.appendChild(this.chartStage);
    this.element.appendChild(legend);

    this.renderChart();
  }

  private renderChart(): void {
    const isShare = this.currentMode === 'share';
    const data = COMPOSITION_TIME_SERIES;

    const width = 640;
    const height = 240;
    const padLeft = 46;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 34;

    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const maxY = isShare ? 100 : 90; // 90M max for absolute, 100% for share
    const stepX = plotWidth / (data.length - 1);

    // Compute Points
    const getCoords = (p: TimeSeriesPoint, i: number) => {
      const x = padLeft + i * stepX;
      let yDomesticVal = isShare ? p.domesticShare : p.domestic;
      let yTotalVal = isShare ? 100 : p.total;

      const yDomestic = padTop + plotHeight - (yDomesticVal / maxY) * plotHeight;
      const yTotal = padTop + plotHeight - (yTotalVal / maxY) * plotHeight;
      const yBaseline = padTop + plotHeight;

      return { x, yDomestic, yTotal, yBaseline, point: p };
    };

    const coords = data.map((p, i) => getCoords(p, i));

    // Area 1: Domestic Area (from baseline to yDomestic)
    let domesticAreaD = `M ${coords[0].x} ${coords[0].yBaseline}`;
    coords.forEach((c) => {
      domesticAreaD += ` L ${c.x.toFixed(1)} ${c.yDomestic.toFixed(1)}`;
    });
    domesticAreaD += ` L ${coords[coords.length - 1].x} ${coords[coords.length - 1].yBaseline} Z`;

    // Area 2: International Area (stacked on top of domestic: from yDomestic to yTotal)
    let intlAreaD = `M ${coords[0].x} ${coords[0].yDomestic.toFixed(1)}`;
    coords.forEach((c) => {
      intlAreaD += ` L ${c.x.toFixed(1)} ${c.yTotal.toFixed(1)}`;
    });
    for (let i = coords.length - 1; i >= 0; i--) {
      intlAreaD += ` L ${coords[i].x.toFixed(1)} ${coords[i].yDomestic.toFixed(1)}`;
    }
    intlAreaD += ' Z';

    // Gridlines
    const yTicks = isShare ? [0, 25, 50, 75, 100] : [0, 20, 40, 60, 80];
    const gridLines = yTicks
      .map((val) => {
        const y = padTop + plotHeight - (val / maxY) * plotHeight;
        return `
          <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#f1f5f9" stroke-width="1.2" />
          <text x="${padLeft - 8}" y="${y + 3.5}" font-size="10" fill="#94a3b8" text-anchor="end" font-weight="600">
            ${val}${isShare ? '%' : 'M'}
          </text>
        `;
      })
      .join('');

    // X Axis Labels (every 4 quarters)
    const xLabels = coords
      .filter((_, i) => i % 4 === 0 || i === coords.length - 1)
      .map((c) => `
        <text x="${c.x}" y="${height - 10}" font-size="10" fill="#64748b" text-anchor="middle" font-weight="600">
          ${c.point.year} ${c.point.quarter === 1 ? '' : 'Q' + c.point.quarter}
        </text>
      `)
      .join('');

    // Interactive Hover Circles
    const hoverPoints = coords
      .map(
        (c) => `
        <g class="chart-hover-marker" data-period="${c.point.period}" data-dom="${c.point.domestic}" data-intl="${c.point.international}" data-total="${c.point.total}">
          <circle cx="${c.x}" cy="${c.yTotal}" r="3.5" fill="#0b57d0" stroke="#ffffff" stroke-width="2" />
        </g>
      `
      )
      .join('');

    this.chartStage.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="stacked-area-svg" aria-label="Domestic vs International Stacked Area Chart">
        <!-- Grid -->
        <g class="grid-layer">
          ${gridLines}
        </g>

        <!-- Domestic Area (Bottom Stack) -->
        <path d="${domesticAreaD}" fill="#38bdf8" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.8" />

        <!-- International Area (Top Stack) -->
        <path d="${intlAreaD}" fill="#0b57d0" fill-opacity="0.82" stroke="#1e3a8a" stroke-width="2" />

        <!-- X Labels -->
        <g class="x-axis-layer">
          ${xLabels}
        </g>

        <!-- Markers -->
        <g class="markers-layer">
          ${hoverPoints}
        </g>
      </svg>
    `;
  }
}
