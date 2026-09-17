export class TourismPressureCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="bottom-card-header flex-between">
        <div>
          <h3 class="bottom-card-title">TOURISM PRESSURE</h3>
          <span class="bottom-card-subtitle">Visitor arrivals (million)</span>
        </div>
        <div class="pressure-chart-legend">
          <span class="legend-item-solid"><span class="solid-line-icon"></span> 2026</span>
          <span class="legend-item-dashed"><span class="dashed-line-icon"></span> Baseline</span>
        </div>
      </div>
      <div class="pressure-chart-wrapper">
        ${this.renderChartSvg()}
      </div>
    `;
  }

  private renderChartSvg(): string {
    const currentSeries = [3.4, 3.8, 4.8, 5.2, 6.2, 6.0, 6.8, 7.2, 7.8, 6.8, 5.2];
    const baselineSeries = [2.8, 3.0, 3.8, 3.2, 4.4, 4.6, 5.0, 5.2, 6.2, 5.5, 4.2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const width = 280;
    const height = 110;
    const padLeft = 24;
    const padRight = 10;
    const padTop = 10;
    const padBottom = 22;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const maxVal = 10.0;

    const getX = (idx: number) => padLeft + (idx / (months.length - 1)) * chartW;
    const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

    // Solid line (Current year)
    let currentD = `M ${getX(0)} ${getY(currentSeries[0])}`;
    for (let i = 1; i < currentSeries.length; i++) {
      currentD += ` L ${getX(i)} ${getY(currentSeries[i])}`;
    }

    // Dashed line (Baseline)
    let baselineD = `M ${getX(0)} ${getY(baselineSeries[0])}`;
    for (let i = 1; i < baselineSeries.length; i++) {
      baselineD += ` L ${getX(i)} ${getY(baselineSeries[i])}`;
    }

    // Y Axis Labels: 0.0, 2.5, 5.0, 7.5, 10.0
    const yTicks = [0, 2.5, 5.0, 7.5, 10.0];
    const yGridLines = yTicks
      .map((t) => {
        const y = getY(t);
        return `
          <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />
          <text x="${padLeft - 4}" y="${y + 3}" font-size="7.5" fill="#94a3b8" text-anchor="end">${t === 0 ? '0.0' : t.toFixed(1)}</text>
        `;
      })
      .join('');

    // X Axis Month Labels
    const xLabels = months
      .map((m, idx) => {
        const x = getX(idx);
        return `<text x="${x}" y="${height - 4}" font-size="7" fill="#94a3b8" text-anchor="middle">${m}</text>`;
      })
      .join('');

    // Dots on current series
    const currentDots = currentSeries
      .map((v, i) => `<circle cx="${getX(i)}" cy="${getY(v)}" r="2.2" fill="#0b57d0" />`)
      .join('');

    return `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:visible;">
        ${yGridLines}
        ${xLabels}
        <!-- Baseline Dashed Path -->
        <path d="${baselineD}" fill="none" stroke="#93c5fd" stroke-width="1.8" stroke-dasharray="3,3" stroke-linecap="round" />
        <!-- Current Solid Path -->
        <path d="${currentD}" fill="none" stroke="#0b57d0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        ${currentDots}
      </svg>
    `;
  }
}
