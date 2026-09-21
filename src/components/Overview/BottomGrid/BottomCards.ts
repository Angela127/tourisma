import {
  TOP_SOURCE_MARKETS,
  TOP_DESTINATIONS,
  PURPOSE_OF_VISIT,
  SEASONALITY_OVERVIEW_DATA,
} from '../../../data/globalOverviewData';
import type { HorizontalRankItem } from '../../../data/globalOverviewData';

// Reusable Horizontal Bar Ranking Card Component
export class HorizontalRankCard {
  public readonly element: HTMLElement;

  constructor(title: string, subtitle: string, items: HorizontalRankItem[]) {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';

    // Header: Title + Subtitle
    const header = document.createElement('div');
    header.className = 'bottom-card-header';

    const titleElem = document.createElement('h3');
    titleElem.className = 'bottom-card-title';
    titleElem.textContent = title;

    const subtitleElem = document.createElement('span');
    subtitleElem.className = 'bottom-card-subtitle';
    subtitleElem.textContent = subtitle;

    header.appendChild(titleElem);
    header.appendChild(subtitleElem);

    // List of Bars
    const list = document.createElement('div');
    list.className = 'bottom-card-list';

    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'rank-row';

      row.innerHTML = `
        <div class="rank-label-row">
          <span class="rank-name">${item.name}</span>
          <span class="rank-val">${item.value}</span>
        </div>
        <div class="rank-track">
          <div class="rank-fill" style="width: ${item.percentageWidth}%;"></div>
        </div>
      `;

      list.appendChild(row);
    });

    this.element.appendChild(header);
    this.element.appendChild(list);
  }
}

// Seasonality Line Chart Card
export class SeasonalityOverviewCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card seasonality-overview-card';

    // Header: Title + Subtitle on Left, Legend on Right
    const header = document.createElement('div');
    header.className = 'bottom-card-header flex-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'header-left-col';

    const titleElem = document.createElement('h3');
    titleElem.className = 'bottom-card-title';
    titleElem.textContent = 'SEASONALITY OVERVIEW';

    const subtitleElem = document.createElement('span');
    subtitleElem.className = 'bottom-card-subtitle';
    subtitleElem.textContent = 'Monthly Arrivals (Millions)';

    headerLeft.appendChild(titleElem);
    headerLeft.appendChild(subtitleElem);

    // Right: Year Legend
    const legend = document.createElement('div');
    legend.className = 'seasonality-years-legend';
    legend.innerHTML = `
      <span class="legend-year current"><span class="solid-dash"></span>2024</span>
      <span class="legend-year previous"><span class="dashed-dash"></span>2023</span>
    `;

    header.appendChild(headerLeft);
    header.appendChild(legend);

    // Chart SVG Area
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'seasonality-chart-stage';
    chartWrapper.innerHTML = this.renderSeasonalitySvg();

    this.element.appendChild(header);
    this.element.appendChild(chartWrapper);
  }

  private renderSeasonalitySvg(): string {
    const width = 280;
    const height = 145;
    const padLeft = 32;
    const padRight = 12;
    const padTop = 14;
    const padBottom = 22;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const maxVal = 16; // 0 to 16M
    const getX = (idx: number) => padLeft + (idx / (SEASONALITY_OVERVIEW_DATA.length - 1)) * plotW;
    const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

    // 2024 Points & Curve
    const pts24 = SEASONALITY_OVERVIEW_DATA.map((d, i) => ({ x: getX(i), y: getY(d.year2024) }));
    let path24 = `M ${pts24[0].x.toFixed(1)} ${pts24[0].y.toFixed(1)}`;
    for (let i = 0; i < pts24.length - 1; i++) {
      const p0 = pts24[i === 0 ? 0 : i - 1];
      const p1 = pts24[i];
      const p2 = pts24[i + 1];
      const p3 = pts24[i + 2 < pts24.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path24 += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // 2023 Points & Curve (Dashed)
    const pts23 = SEASONALITY_OVERVIEW_DATA.map((d, i) => ({ x: getX(i), y: getY(d.year2023) }));
    let path23 = `M ${pts23[0].x.toFixed(1)} ${pts23[0].y.toFixed(1)}`;
    for (let i = 0; i < pts23.length - 1; i++) {
      const p0 = pts23[i === 0 ? 0 : i - 1];
      const p1 = pts23[i];
      const p2 = pts23[i + 1];
      const p3 = pts23[i + 2 < pts23.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path23 += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // Grid lines for 15M, 10M, 5M, 0
    const y15 = getY(15);
    const y10 = getY(10);
    const y5 = getY(5);
    const y0 = getY(0);

    // X Axis Months (Jan, Mar, May, Jul, Sep, Nov)
    const xTicks = [
      { label: 'Jan', idx: 0 },
      { label: 'Mar', idx: 2 },
      { label: 'May', idx: 4 },
      { label: 'Jul', idx: 6 },
      { label: 'Sep', idx: 8 },
      { label: 'Nov', idx: 10 },
    ];

    const xLabelsSvg = xTicks
      .map((t) => `<text x="${getX(t.idx).toFixed(1)}" y="${height - 4}" class="season-axis-x" text-anchor="middle">${t.label}</text>`)
      .join('');

    // Circles on 2024 line
    const dots24 = pts24
      .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.4" class="season-dot-24" />`)
      .join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="seasonality-overview-svg" preserveAspectRatio="none">
        <!-- Horizontal Grid Lines -->
        <line x1="${padLeft}" y1="${y15.toFixed(1)}" x2="${width - padRight}" y2="${y15.toFixed(1)}" stroke="#eef2f6" stroke-width="1" />
        <text x="${padLeft - 6}" y="${(y15 + 3).toFixed(1)}" class="season-axis-y" text-anchor="end">15M</text>

        <line x1="${padLeft}" y1="${y10.toFixed(1)}" x2="${width - padRight}" y2="${y10.toFixed(1)}" stroke="#eef2f6" stroke-width="1" />
        <text x="${padLeft - 6}" y="${(y10 + 3).toFixed(1)}" class="season-axis-y" text-anchor="end">10M</text>

        <line x1="${padLeft}" y1="${y5.toFixed(1)}" x2="${width - padRight}" y2="${y5.toFixed(1)}" stroke="#eef2f6" stroke-width="1" />
        <text x="${padLeft - 6}" y="${(y5 + 3).toFixed(1)}" class="season-axis-y" text-anchor="end">5M</text>

        <line x1="${padLeft}" y1="${y0.toFixed(1)}" x2="${width - padRight}" y2="${y0.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" />
        <text x="${padLeft - 6}" y="${(y0 + 3).toFixed(1)}" class="season-axis-y" text-anchor="end">0</text>

        <!-- 2023 Curve (Dashed) -->
        <path d="${path23}" fill="none" stroke="#93c5fd" stroke-width="1.8" stroke-dasharray="4 3" stroke-linecap="round" />

        <!-- 2024 Curve (Solid) -->
        <path d="${path24}" fill="none" stroke="#0b57d0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- 2024 Data Dots -->
        ${dots24}

        <!-- X Axis Labels -->
        ${xLabelsSvg}
      </svg>
    `;
  }
}

// Container for the 4 bottom cards
export class BottomGrid {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insights-grid';

    const card1 = new HorizontalRankCard('TOP SOURCE MARKETS', 'By Arrivals (Millions)', TOP_SOURCE_MARKETS);
    const card2 = new HorizontalRankCard('TOP DESTINATIONS', 'By Arrivals (Millions)', TOP_DESTINATIONS);
    const card3 = new HorizontalRankCard('PURPOSE OF VISIT', 'By Arrivals (%)', PURPOSE_OF_VISIT);
    const card4 = new SeasonalityOverviewCard();

    this.element.appendChild(card1.element);
    this.element.appendChild(card2.element);
    this.element.appendChild(card3.element);
    this.element.appendChild(card4.element);
  }
}
