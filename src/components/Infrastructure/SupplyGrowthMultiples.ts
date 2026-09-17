import { STATE_INFRASTRUCTURE_DATA } from '../../data/infrastructureData';

export class SupplyGrowthMultiples {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'infra-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'infra-card-header';
    header.innerHTML = `
      <div class="infra-card-title-group">
        <h3 class="infra-card-title">Accommodation Supply Trajectory (2019 – 2026)</h3>
        <span class="infra-card-desc">Small multiples tracking room pipeline responsiveness vs supply stagnation across 16 states</span>
      </div>
      <span class="infra-toggle-group" style="padding: 4px 8px; font-size: 0.7rem; color: #475569; font-weight: 600;">
        16 States • 7-Year Trajectory
      </span>
    `;

    const grid = document.createElement('div');
    grid.className = 'multiples-grid';

    // Sort by supply growth percentage descending to highlight high-response vs flat states
    const sorted = [...STATE_INFRASTRUCTURE_DATA].sort((a, b) => b.supplyGrowthPct - a.supplyGrowthPct);

    sorted.forEach((state) => {
      const tile = document.createElement('div');
      tile.className = 'multiple-state-tile';
      tile.title = `${state.name}: ${state.rooms.toLocaleString()} rooms (+${state.supplyGrowthPct}% since 2019). Click to open state profile.`;

      const sparklineSvg = this.generateSparklineSvg(state.supplyGrowthHistory);
      const isStagnant = state.supplyGrowthPct <= 5.0;

      tile.innerHTML = `
        <div class="multiple-tile-top">
          <span class="multiple-state-name">${state.name}</span>
          <span class="multiple-growth-badge ${isStagnant ? 'stagnant' : ''}">
            ${state.supplyGrowthPct > 0 ? `+${state.supplyGrowthPct}%` : `${state.supplyGrowthPct}%`}
          </span>
        </div>
        <div class="multiple-room-count">${state.rooms.toLocaleString()} <span style="font-size:0.65rem; color:#64748b; font-weight:500;">rms</span></div>
        <div class="multiple-sparkline-svg">${sparklineSvg}</div>
      `;

      tile.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      grid.appendChild(tile);
    });

    this.element.appendChild(header);
    this.element.appendChild(grid);
  }

  private generateSparklineSvg(history: { year: number; rooms: number }[]): string {
    if (!history || history.length < 2) return '';
    const w = 110;
    const h = 26;
    const vals = history.map((d) => d.rooms);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    const points = history
      .map((d, i) => {
        const x = (i / (history.length - 1)) * (w - 8) + 4;
        const y = h - ((d.rooms - min) / range) * (h - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = '#0b57d0';

    return `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
        <polyline
          fill="none"
          stroke="${strokeColor}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${points}"
        />
        <circle cx="${(w - 4).toFixed(1)}" cy="${(h - ((vals[vals.length - 1] - min) / range) * (h - 8) - 4).toFixed(1)}" r="2.5" fill="#0b57d0" />
      </svg>
    `;
  }
}
