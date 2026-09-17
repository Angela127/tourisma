import { settingsStore } from '../../data/settingsStore';

export class ThresholdsSettingsCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'set-card';
    this.render();
  }

  private render(): void {
    const thresholds = settingsStore.getThresholds();
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'set-card-header';
    header.innerHTML = `
      <div class="set-card-title-group">
        <h3 class="set-card-title">Threshold Parameters & Warning Sensitivity</h3>
        <span class="set-card-desc">Calibrate capacity strain benchmarks and sustainability early warning triggers across the platform</span>
      </div>
      <button class="display-toggle-btn" id="reset-thresholds-btn" style="flex:unset; padding:4px 10px; font-size:0.7rem;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
        Reset to Defaults
      </button>
    `;

    header.querySelector('#reset-thresholds-btn')?.addEventListener('click', () => {
      settingsStore.resetThresholds();
      this.render();
    });

    this.element.appendChild(header);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'thresholds-table-wrap';

    const table = document.createElement('table');
    table.className = 'thresholds-table';

    let rowsHtml = `
      <thead>
        <tr>
          <th>Threshold Parameter</th>
          <th>Domain</th>
          <th>Current Value</th>
          <th>Default</th>
          <th>Impact & Warning Sensitivity Note</th>
        </tr>
      </thead>
      <tbody>
    `;

    thresholds.forEach((t) => {
      const isModified = t.currentValue !== t.defaultValue;
      rowsHtml += `
        <tr data-t-id="${t.id}">
          <td style="font-weight:750; color:#0f172a; white-space:nowrap;">
            ${t.name}
          </td>
          <td>
            <span class="threshold-badge-tag ${t.category}">${t.category}</span>
          </td>
          <td style="white-space:nowrap;">
            <div style="display:flex; align-items:center; gap:6px;">
              <input
                type="number"
                class="threshold-input-control"
                data-t-id="${t.id}"
                min="${t.min}"
                max="${t.max}"
                step="${t.step}"
                value="${t.currentValue}"
              />
              <span style="font-size:0.68rem; color:#64748b; font-weight:700;">${t.unit}</span>
            </div>
          </td>
          <td style="color:#64748b; font-size:0.72rem; white-space:nowrap;">
            ${t.defaultValue} ${t.unit}
          </td>
          <td class="threshold-impact-text">
            ${t.impactNote}
            ${isModified ? `<strong style="display:block; color:#b45309; margin-top:2px;">• Custom parameter active</strong>` : ''}
          </td>
        </tr>
      `;
    });

    rowsHtml += `</tbody>`;
    table.innerHTML = rowsHtml;

    // Attach change listeners to inputs
    table.querySelectorAll('.threshold-input-control').forEach((input) => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const id = target.getAttribute('data-t-id');
        const val = parseFloat(target.value);
        if (id && !isNaN(val)) {
          settingsStore.updateThreshold(id, val);
          this.render();
        }
      });
    });

    tableWrap.appendChild(table);
    this.element.appendChild(tableWrap);
  }
}
