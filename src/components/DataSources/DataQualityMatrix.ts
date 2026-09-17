import {
  STATE_DATA_QUALITY,
  KNOWN_LIMITATIONS,
} from '../../data/dataSourcesData';

export class DataQualityMatrix {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ds-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'ds-card-header';
    header.innerHTML = `
      <div class="ds-card-title-group">
        <h3 class="ds-card-title">Data Quality & Honest Coverage Matrix</h3>
        <span class="ds-card-desc">State-by-state completeness audit across key diagnostic indicators</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px; font-size:0.68rem; font-weight:700;">
        <span style="display:flex; align-items:center; gap:4px; color:#15803d;"><span class="quality-dot complete"></span> Complete</span>
        <span style="display:flex; align-items:center; gap:4px; color:#b45309;"><span class="quality-dot partial"></span> Partial Coverage</span>
        <span style="display:flex; align-items:center; gap:4px; color:#b91c1c;"><span class="quality-dot unavailable"></span> Unavailable</span>
      </div>
    `;
    this.element.appendChild(header);

    // 2-Col Grid: Matrix Table on Left, Known Limitations on Right
    const grid = document.createElement('div');
    grid.className = 'quality-main-grid';

    // Left: Matrix Table
    const tableWrap = document.createElement('div');
    tableWrap.className = 'matrix-table-wrap';

    const table = document.createElement('table');
    table.className = 'matrix-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th style="text-align:left;">State / Territory</th>
          <th title="Inbound Foreign Arrivals">Foreign Arrivals</th>
          <th title="Domestic Survey Volume">Domestic Volume</th>
          <th title="Hotel Occupancy Rate">Hotel Occupancy</th>
          <th title="Room Inventory Supply">Room Supply</th>
          <th title="Visitor Expenditure Microdata">Expenditure</th>
          <th title="Transit & Gateway Ingress">Transit Ingress</th>
          <th title="Municipal Waste & Potable Water">Waste / Water</th>
          <th title="Resident Population Ratio">Resident Ratio</th>
        </tr>
      </thead>
      <tbody>
        ${STATE_DATA_QUALITY.map(
          (row) => `
          <tr>
            <td style="text-align:left; font-weight:750; color:#0f172a; white-space:nowrap;">
              ${row.stateName} <span style="font-size:0.6rem; color:#64748b;">(${row.code})</span>
            </td>
            <td><span class="quality-dot ${row.indicators.inboundArrivals}" title="${row.indicators.inboundArrivals}"></span></td>
            <td><span class="quality-dot ${row.indicators.domesticVolume}" title="${row.indicators.domesticVolume}"></span></td>
            <td><span class="quality-dot ${row.indicators.occupancyRate}" title="${row.indicators.occupancyRate}"></span></td>
            <td><span class="quality-dot ${row.indicators.roomInventory}" title="${row.indicators.roomInventory}"></span></td>
            <td><span class="quality-dot ${row.indicators.visitorExpenditure}" title="${row.indicators.visitorExpenditure}"></span></td>
            <td><span class="quality-dot ${row.indicators.transitIngress}" title="${row.indicators.transitIngress}"></span></td>
            <td><span class="quality-dot ${row.indicators.utilitiesWaste}" title="${row.indicators.utilitiesWaste}"></span></td>
            <td><span class="quality-dot ${row.indicators.residentRatio}" title="${row.indicators.residentRatio}"></span></td>
          </tr>
        `
        ).join('')}
      </tbody>
    `;
    tableWrap.appendChild(table);
    grid.appendChild(tableWrap);

    // Right: Known Limitations List
    const limitationsCol = document.createElement('div');
    limitationsCol.className = 'limitations-list';
    limitationsCol.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
        <span style="font-size:0.75rem; font-weight:800; color:#0f172a; text-transform:uppercase;">
          Known Methodological Limitations
        </span>
        <span style="font-size:0.65rem; color:#64748b; font-weight:600;">Transparent Audit</span>
      </div>
      ${KNOWN_LIMITATIONS.map(
        (lim, idx) => `
        <div class="limitation-card-item">
          <strong>${idx + 1}.</strong> ${lim}
        </div>
      `
      ).join('')}
    `;
    grid.appendChild(limitationsCol);

    this.element.appendChild(grid);
  }
}
