import { STATE_SEASONALITY_DATA, MONTH_LABELS } from '../../../data/tourismDemandData';
import type { StateSeasonality } from '../../../data/tourismDemandData';

export class SeasonalityHeatmap {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header
    const header = document.createElement('div');
    header.className = 'demand-card-header';
    header.innerHTML = `
      <div class="demand-card-title-group">
        <h3 class="demand-card-title">State × Month Seasonality Heatmap</h3>
        <span class="demand-card-desc">Monthly visitor volume indexed to state baseline (100 = state monthly average)</span>
      </div>
    `;

    // Heatmap Container
    const container = document.createElement('div');
    container.className = 'heatmap-container';
    container.innerHTML = this.renderHeatmapTable();

    // Color Scale Bar Footer
    const scaleBar = document.createElement('div');
    scaleBar.className = 'heatmap-scale-bar-wrap';
    scaleBar.innerHTML = `
      <span>Low Inflow (&lt;80)</span>
      <div class="heatmap-scale-bar">
        <span style="flex: 1; background-color: #fdba74;"></span>
        <span style="flex: 1; background-color: #fed7aa;"></span>
        <span style="flex: 1; background-color: #e2e8f0;"></span>
        <span style="flex: 1; background-color: #93c5fd;"></span>
        <span style="flex: 1; background-color: #3b82f6;"></span>
        <span style="flex: 1; background-color: #0b57d0;"></span>
      </div>
      <span>Peak Pressure (&gt;140)</span>
    `;

    this.element.appendChild(header);
    this.element.appendChild(container);
    this.element.appendChild(scaleBar);
  }

  // Diverging color scale mapping based on 100 baseline
  private getCellColor(val: number): { bg: string; text: string } {
    if (val >= 140) return { bg: '#0b57d0', text: '#ffffff' };
    if (val >= 120) return { bg: '#2563eb', text: '#ffffff' };
    if (val >= 108) return { bg: '#60a5fa', text: '#ffffff' };
    if (val >= 101) return { bg: '#bfdbfe', text: '#1e3a8a' };
    if (val >= 95) return { bg: '#e2e8f0', text: '#475569' }; // Baseline 100
    if (val >= 80) return { bg: '#fed7aa', text: '#7c2d12' };
    return { bg: '#fdba74', text: '#7c2d12' }; // Low season <80
  }

  private renderHeatmapTable(): string {
    const data = STATE_SEASONALITY_DATA;

    const headersHtml = MONTH_LABELS.map((m) => `<th class="heatmap-th">${m}</th>`).join('');

    const rowsHtml = data
      .map((state: StateSeasonality) => {
        const cellsHtml = state.monthlyIndex
          .map((val, idx) => {
            const { bg, text } = this.getCellColor(val);
            const delta = val - 100;
            const sign = delta > 0 ? '+' : '';
            const tooltip = `${state.stateName} in ${MONTH_LABELS[idx]}: Index ${val} (${sign}${delta}% vs monthly avg)`;

            return `
              <td
                class="heatmap-cell"
                style="background-color: ${bg}; color: ${text};"
                title="${tooltip}"
              >
                ${val}
              </td>
            `;
          })
          .join('');

        return `
          <tr>
            <td class="heatmap-state-label">${state.stateName}</td>
            ${cellsHtml}
          </tr>
        `;
      })
      .join('');

    return `
      <table class="heatmap-table" aria-label="Seasonality Heatmap of 16 Malaysian States">
        <thead>
          <tr>
            <th class="heatmap-th state-th">State</th>
            ${headersHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }
}
