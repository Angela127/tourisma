export interface KpiCardConfig {
  id: string;
  iconSvg: string;
  title: string;
  value: string;
  unitSubtitle?: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export const OVERVIEW_LEFT_KPIS: KpiCardConfig[] = [
  {
    id: 'kpi_domestic_visitors',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    title: 'DOMESTIC VISITORS',
    value: '290.1M',
    change: '▲ +8.4% vs. 2024',
    isPositive: true,
    sparkline: [210, 218, 225, 238, 252, 264, 270, 275, 280, 284, 288, 290.1],
  },
  {
    id: 'kpi_tourism_expenditure',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    title: 'TOURISM EXPENDITURE',
    value: 'RM121.3B',
    change: '▲ +6.7% vs. 2024',
    isPositive: true,
    sparkline: [95, 98, 102, 105, 108, 112, 114, 116, 118, 119, 120.5, 121.3],
  },
  {
    id: 'kpi_avg_length_of_stay',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    title: 'AVG. LENGTH OF STAY',
    value: '2.56 nights',
    change: '▲ +4.2% vs. 2024',
    isPositive: true,
    sparkline: [2.2, 2.25, 2.3, 2.35, 2.4, 2.42, 2.45, 2.48, 2.5, 2.52, 2.54, 2.56],
  },
  {
    id: 'kpi_tourism_opportunity',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    title: 'TOURISM OPPORTUNITY',
    value: '78.3%',
    unitSubtitle: 'Visitor satisfaction rate',
    change: '▲ +5.1% vs. 2024',
    isPositive: true,
    sparkline: [68, 70, 71.5, 73, 74, 75.2, 76, 76.8, 77.2, 77.8, 78.0, 78.3],
  },
];

export class LeftKpiCards {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'left-kpi-column-stack';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    OVERVIEW_LEFT_KPIS.forEach((kpi) => {
      const card = document.createElement('div');
      card.className = 'vertical-kpi-card';

      card.innerHTML = `
        <div class="kpi-card-left-content">
          <div class="kpi-icon-bubble">
            ${kpi.iconSvg}
          </div>
          <div class="kpi-data-meta">
            <span class="kpi-title-label">${kpi.title}</span>
            <div class="kpi-main-val">${kpi.value}</div>
            <div class="kpi-trend-note">
              ${kpi.unitSubtitle ? `<span style="color:#64748b; margin-right:4px;">${kpi.unitSubtitle}</span>` : ''}
              <span class="trend-green-text">${kpi.change}</span>
            </div>
          </div>
        </div>
        <div class="kpi-sparkline-box">
          ${this.renderSparklineSvg(kpi.sparkline)}
        </div>
      `;

      this.element.appendChild(card);
    });
  }

  private renderSparklineSvg(points: number[]): string {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 36;
    const padding = 4;

    const coords = points.map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    // Build smooth cubic bezier curve
    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const fillD = `${d} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;

    const gradId = `kpi_grad_${Math.random().toString(36).substring(2, 7)}`;

    return `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:visible;">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b57d0" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#0b57d0" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${fillD}" fill="url(#${gradId})" />
        <path d="${d}" fill="none" stroke="#0b57d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${coords[coords.length - 1].x}" cy="${coords[coords.length - 1].y}" r="3" fill="#0b57d0" />
      </svg>
    `;
  }
}
