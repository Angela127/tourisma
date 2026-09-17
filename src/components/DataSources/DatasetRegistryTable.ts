import { DATASET_REGISTRY } from '../../data/dataSourcesData';

export class DatasetRegistryTable {
  public readonly element: HTMLElement;
  private expandedDatasetId: string | null = 'ds_inbound_arrivals';

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
        <h3 class="ds-card-title">Dataset Registry & Schema Inventory</h3>
        <span class="ds-card-desc">Comprehensive log of administrative records, surveys, and infrastructure telemetry</span>
      </div>
      <span style="font-size:0.72rem; color:#64748b; font-weight:600;">
        ${DATASET_REGISTRY.length} Registered Sources (6 Active)
      </span>
    `;
    this.element.appendChild(header);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'registry-table-wrap';

    const table = document.createElement('table');
    table.className = 'registry-table';

    let tableHtml = `
      <thead>
        <tr>
          <th>Dataset Name</th>
          <th>Publisher</th>
          <th>Geographic Granularity</th>
          <th>Time Granularity</th>
          <th>Period Covered</th>
          <th>Records</th>
          <th>Last Updated</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
    `;

    DATASET_REGISTRY.forEach((ds) => {
      const isExpanded = this.expandedDatasetId === ds.id;
      const statusLabel = ds.status === 'not_used' ? 'Not Used' : ds.status;

      tableHtml += `
        <tr class="registry-row-clickable ${isExpanded ? 'expanded' : ''}" data-ds-id="${ds.id}">
          <td style="font-weight:750; color:#0f172a;">
            <div style="display:flex; align-items:center; gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform:${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}; transition:transform 0.15s ease;"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span>${ds.name}</span>
            </div>
          </td>
          <td style="color:#475569; font-weight:600;">${ds.publisher}</td>
          <td style="color:#64748b;">${ds.geoGranularity}</td>
          <td style="color:#64748b;">${ds.timeGranularity}</td>
          <td style="color:#64748b; white-space:nowrap;">${ds.periodCovered}</td>
          <td style="color:#64748b; white-space:nowrap;">${ds.recordCount}</td>
          <td style="color:#64748b; white-space:nowrap;">${ds.lastUpdated}</td>
          <td>
            <span class="status-chip ${ds.status}">${statusLabel}</span>
          </td>
        </tr>
      `;

      if (isExpanded) {
        tableHtml += `
          <tr class="registry-expanded-row">
            <td colspan="8" style="padding:0;">
              <div class="registry-details-box">
                <div>
                  <span style="font-size:0.68rem; font-weight:800; color:#475569; text-transform:uppercase; display:block; margin-bottom:6px;">
                    Variable Schema & Data Types:
                  </span>
                  <div class="variable-tag-grid">
                    ${ds.variables
                      .map(
                        (v) => `
                      <div class="variable-item-card">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <span class="variable-name-code">${v.name}</span>
                          <span class="variable-type-badge">${v.type}</span>
                        </div>
                        <span style="font-size:0.66rem; color:#475569; line-height:1.3;">${v.description}</span>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>

                <div>
                  <span style="font-size:0.68rem; font-weight:800; color:#475569; text-transform:uppercase; display:block; margin-bottom:4px;">
                    Model Integration & Analytical Usage:
                  </span>
                  <div class="model-usage-callout">
                    ${ds.modelUsage}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }
    });

    tableHtml += `</tbody>`;
    table.innerHTML = tableHtml;

    table.querySelectorAll('.registry-row-clickable').forEach((row) => {
      row.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-ds-id');
        this.expandedDatasetId = this.expandedDatasetId === id ? null : id;
        this.render();
      });
    });

    tableWrap.appendChild(table);
    this.element.appendChild(tableWrap);
  }
}
