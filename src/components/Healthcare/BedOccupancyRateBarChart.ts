import {
  getAllStateHealthcare,
  NATIONAL_HEALTHCARE_SUMMARY,
  type StateHealthcareData,
} from '../../data/healthcareData';

export class BedOccupancyRateBarChart {
  public readonly element: HTMLElement;
  private selectedStateId: string | null = null;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'hc-card hc-bor-card';
    this.render();
  }

  public setSelectedState(stateId: string | null): void {
    this.selectedStateId = stateId;
    this.renderBars();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'hc-card-header';
    header.innerHTML = `
      <div class="hc-title-group">
        <div class="hc-badge-header">
          <span class="hc-badge-dot" style="background:#e11d48;"></span>
          <span>SERVICE UTILISATION</span>
        </div>
        <h3 class="hc-card-title">Hospital Bed Occupancy Rate (BOR)</h3>
        <span class="hc-card-desc">State clinical bed utilisation (resident population & healthcare load)</span>
      </div>
      <div class="hc-bor-national-pill">
        National BOR: <strong>${NATIONAL_HEALTHCARE_SUMMARY.bedOccupancyRate}%</strong>
      </div>
    `;
    this.element.appendChild(header);

    // Compact Analytical Callout
    const callout = document.createElement('div');
    callout.className = 'hc-bor-callout';
    callout.innerHTML = `
      <span class="hc-callout-icon">💡</span>
      <div class="hc-callout-body">
        <strong>Capacity vs. Utilisation:</strong>
        Hospital beds represent installed capacity; bed occupancy reflects overall health service load from resident admissions and epidemiology, not tourist-isolated pressure.
      </div>
    `;
    this.element.appendChild(callout);

    // Bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'hc-bor-bars-wrap';
    barsContainer.id = 'hc-bor-bars-wrap';
    this.element.appendChild(barsContainer);

    this.renderBars();
  }

  private renderBars(): void {
    const container = this.element.querySelector('#hc-bor-bars-wrap');
    if (!container) return;
    container.innerHTML = '';

    const states: StateHealthcareData[] = getAllStateHealthcare();

    // Sort descending by bedOccupancyRate
    states.sort((a, b) => b.bedOccupancyRate - a.bedOccupancyRate);

    states.forEach((st) => {
      const bor = st.bedOccupancyRate;
      const isSelected = this.selectedStateId === st.stateId;

      // Color coding
      const barColor =
        bor >= 75
          ? '#e11d48'
          : bor >= 50
            ? '#d97706'
            : '#0284c7';

      const row = document.createElement('div');
      row.className = `hc-bor-row ${isSelected ? 'selected' : ''}`;
      row.setAttribute('data-state-id', st.stateId);

      row.innerHTML = `
        <div class="hc-bor-label-col">
          <span class="hc-bor-code">${st.code}</span>
          <span class="hc-bor-name" title="${st.stateName}">${st.stateName}</span>
        </div>
        <div class="hc-bor-track-col">
          <div class="hc-bor-bg-track">
            <div class="hc-bor-benchmark-line" style="left: ${NATIONAL_HEALTHCARE_SUMMARY.bedOccupancyRate}%;" title="National Average (${NATIONAL_HEALTHCARE_SUMMARY.bedOccupancyRate}%)"></div>
            <div class="hc-bor-bar" style="width: ${bor}%; background-color: ${barColor};"></div>
          </div>
          <span class="hc-bor-val-tag">${bor.toFixed(1)}%</span>
        </div>
        <div class="hc-bor-beds-count">
          <span>${st.totalBeds.toLocaleString()} beds</span>
        </div>
      `;

      row.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(st.stateId);
        }
      });

      container.appendChild(row);
    });
  }
}
