import { settingsStore, type IndexWeights } from '../../data/settingsStore';

export class IndexWeightsCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'set-card';
    this.render();
  }

  private render(): void {
    const weights = settingsStore.getIndexWeights();
    const isModified = settingsStore.isWeightsModified();
    const sum =
      weights.lodging +
      weights.density +
      weights.seasonality +
      weights.ecological +
      weights.transit;
    const isValid = sum === 100;

    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'set-card-header';
    header.innerHTML = `
      <div class="set-card-title-group">
        <h3 class="set-card-title">Composite Index Weights (TPI & Readiness)</h3>
        <span class="set-card-desc">Relative weighting of the 5 multi-criteria pillars in composite carry-capacity scores</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="weights-sum-badge ${isValid ? 'valid' : 'invalid'}">
          Sum: ${sum}% ${isValid ? '✓ Valid (100%)' : '⚠ Must Equal 100%'}
        </span>
        <button class="display-toggle-btn" id="reset-weights-btn" style="flex:unset; padding:4px 10px; font-size:0.7rem;">
          Reset Weights
        </button>
      </div>
    `;

    header.querySelector('#reset-weights-btn')?.addEventListener('click', () => {
      settingsStore.resetIndexWeights();
      this.render();
    });

    this.element.appendChild(header);

    const container = document.createElement('div');
    container.className = 'weights-container';

    if (isModified) {
      const banner = document.createElement('div');
      banner.className = 'weights-warning-banner';
      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <strong>Notice:</strong> Non-default composite index weights are active. Composite state pressure scores will reflect customized policy priorities.
        </div>
      `;
      container.appendChild(banner);
    }

    const items: { key: keyof IndexWeights; label: string; def: number }[] = [
      { key: 'lodging', label: 'Accommodation & Lodging Load', def: 30 },
      { key: 'density', label: 'Spatial & Resident Visitor Density', def: 25 },
      { key: 'seasonality', label: 'Seasonal Inflow Concentration (Gini)', def: 20 },
      { key: 'ecological', label: 'Ecological & Resource Footprint', def: 15 },
      { key: 'transit', label: 'Infrastructure & Arterial Transit Saturation', def: 10 },
    ];

    items.forEach((item) => {
      const val = weights[item.key];
      const row = document.createElement('div');
      row.className = 'weight-slider-row';

      row.innerHTML = `
        <div class="weight-label-text">
          ${item.label}
          <span style="font-size:0.62rem; color:#64748b; display:block;">Default: ${item.def}%</span>
        </div>
        <input
          type="range"
          class="weight-range-input"
          data-key="${item.key}"
          min="0"
          max="60"
          step="1"
          value="${val}"
        />
        <div class="weight-value-tag" id="val-${item.key}">${val}%</div>
      `;

      const slider = row.querySelector('input') as HTMLInputElement;
      slider.addEventListener('input', (e) => {
        const newVal = parseInt((e.target as HTMLInputElement).value, 10);
        settingsStore.updateIndexWeights({ [item.key]: newVal });
        const valTag = row.querySelector(`#val-${item.key}`);
        if (valTag) valTag.textContent = `${newVal}%`;
        this.render();
      });

      container.appendChild(row);
    });

    this.element.appendChild(container);
  }
}
