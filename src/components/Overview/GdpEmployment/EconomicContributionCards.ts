import { NATIONAL_ECONOMY_CONTRIBUTION, type NationalEconomyContribution } from '../../../data/overviewData';

export class EconomicContributionCards {
  public readonly element: HTMLElement;
  private data: NationalEconomyContribution;

  constructor(data: NationalEconomyContribution = NATIONAL_ECONOMY_CONTRIBUTION) {
    this.element = document.createElement('div');
    this.element.className = 'right-gauge-column-stack';
    this.data = data;
    this.render();
  }

  public updateData(data: NationalEconomyContribution): void {
    this.data = data;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Economic Contribution to GDP Card
    const gdpCard = document.createElement('div');
    gdpCard.className = 'economic-gauge-card';
    gdpCard.innerHTML = `
      <div class="gauge-card-header">
        <h3 class="gauge-card-title">TOURISME ECONOMIC CONTRIBUTION</h3>
        <span class="gauge-card-subtitle">% of Malaysia's GDP (Tourism Satellite Account)</span>
      </div>
      <div class="gauge-card-body-row">
        <div class="gauge-visual-box">
          ${this.renderSemiCircleGauge(this.data.gdpSharePct, 0, 30, `${this.data.gdpSharePct}%`, 'of GDP')}
        </div>
        <div class="gauge-metrics-side">
          <div class="gauge-metric-tile">
            <span class="gauge-metric-label">Total Tourism GDP</span>
            <span class="gauge-metric-val">RM${this.data.tourismGdpRmB}B</span>
          </div>
          <div class="gauge-metric-tile">
            <span class="gauge-metric-label">Total Economy</span>
            <span class="gauge-metric-val">RM${this.data.totalEconomyGdpRmB.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B</span>
          </div>
        </div>
      </div>
    `;

    // 2. Tourism Employment Card
    const empCard = document.createElement('div');
    empCard.className = 'economic-gauge-card';
    empCard.innerHTML = `
      <div class="gauge-card-header">
        <h3 class="gauge-card-title">TOURISME EMPLOYMENT</h3>
        <span class="gauge-card-subtitle">% of Total Employment</span>
      </div>
      <div class="gauge-card-body-row">
        <div class="gauge-visual-box">
          ${this.renderSemiCircleGauge(this.data.employmentSharePct, 0, 40, `${this.data.employmentSharePct}%`, 'of total employment')}
        </div>
        <div class="gauge-metrics-side">
          <div class="gauge-metric-tile">
            <span class="gauge-metric-label">Tourism Employment</span>
            <span class="gauge-metric-val">${this.data.tourismEmploymentM}M</span>
          </div>
          <div class="gauge-metric-tile">
            <span class="gauge-metric-label">Total Employment</span>
            <span class="gauge-metric-val">${this.data.totalEmploymentM}M</span>
          </div>
        </div>
      </div>
    `;

    this.element.appendChild(gdpCard);
    this.element.appendChild(empCard);
  }

  private renderSemiCircleGauge(
    value: number,
    min: number,
    max: number,
    centerValue: string,
    centerSub: string
  ): string {
    const radius = 54;
    const strokeWidth = 14;
    const cx = 75;
    const cy = 70;
    const circumference = Math.PI * radius; // ~169.6
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const strokeDash = ratio * circumference;
    const strokeDashoffset = circumference - strokeDash;

    return `
      <svg width="150" height="95" viewBox="0 0 150 95" style="overflow:visible;">
        <!-- Background Track -->
        <path
          d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}"
          fill="none"
          stroke="#dbeafe"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />
        <!-- Active Progress Arc -->
        <path
          d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}"
          fill="none"
          stroke="#0b57d0"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          style="transition: stroke-dashoffset 0.8s ease;"
        />
        <!-- Range Labels -->
        <text x="${cx - radius - 2}" y="${cy + 16}" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">${min}%</text>
        <text x="${cx + radius + 2}" y="${cy + 16}" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">${max}%</text>

        <!-- Center Text -->
        <text x="${cx}" y="${cy - 8}" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">${centerValue}</text>
        <text x="${cx}" y="${cy + 6}" font-size="8.5" font-weight="600" fill="#64748b" text-anchor="middle">${centerSub}</text>
      </svg>
    `;
  }
}
