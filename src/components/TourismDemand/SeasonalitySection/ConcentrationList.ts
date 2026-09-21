import { STATE_SEASONALITY_DATA } from '../../../data/tourismDemandData';

export class ConcentrationList {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header
    const header = document.createElement('div');
    header.className = 'demand-card-header';
    header.innerHTML = `
      <div class="demand-card-title-group">
        <h3 class="demand-card-title">Seasonal Concentration Ratio</h3>
        <span class="demand-card-desc">Peak-to-Trough Inflow Multiplier (Max Month / Min Month)</span>
      </div>
    `;

    // Ranked List Container
    const list = document.createElement('div');
    list.className = 'concentration-list';

    const sortedData = [...STATE_SEASONALITY_DATA].sort(
      (a, b) => b.peakToTroughRatio - a.peakToTroughRatio
    );

    if (sortedData.length === 0) {
      list.innerHTML = `
        <div class="demand-empty-state">
          <svg class="demand-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          <span class="demand-empty-state-title">No concentration data available</span>
          <span class="demand-empty-state-desc">State peak-to-trough surge multipliers will appear once data is connected.</span>
        </div>
      `;
    } else {
      const maxRatio = sortedData[0].peakToTroughRatio;

      list.innerHTML = sortedData
        .map((item) => {
          const pct = ((item.peakToTroughRatio / maxRatio) * 100).toFixed(1);
          return `
            <div class="concentration-row" title="${item.stateName}: Peak ${item.peakMonth} vs Trough ${item.troughMonth}">
              <span class="concentration-name">${item.stateName}</span>
              <div class="concentration-bar-track">
                <div class="concentration-bar-fill" style="width: ${pct}%;"></div>
              </div>
              <span class="concentration-ratio-val">${item.peakToTroughRatio.toFixed(2)}×</span>
            </div>
          `;
        })
        .join('');
    }

    // Explanatory Policy Callout
    const note = document.createElement('div');
    note.className = 'concentration-policy-note';
    note.innerHTML = `
      <strong>Why concentration matters:</strong> The same annual visitor volume causes far more operational pressure, infrastructure bottlenecks, and staffing strain when it arrives concentrated in three months than when distributed evenly across the year.
    `;

    this.element.appendChild(header);
    this.element.appendChild(list);
    this.element.appendChild(note);
  }
}
