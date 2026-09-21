import { STATE_INFRASTRUCTURE_DATA } from '../../data/infrastructureData';

type SortColumn = 'name' | 'rooms' | 'occupancyRate' | 'visitorNightsPerRoom';
type SortDirection = 'asc' | 'desc';

export class ConstraintTable {
  public readonly element: HTMLElement;
  private currentSortCol: SortColumn = 'occupancyRate';
  private currentSortDir: SortDirection = 'desc';
  private searchQuery: string = '';
  private tableBody!: HTMLTableSectionElement;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'infra-card constraint-table-card';

    this.renderLayout();
    this.renderTableRows();
  }

  private renderLayout(): void {
    const header = document.createElement('div');
    header.className = 'infra-card-header';
    header.innerHTML = `
      <div class="infra-card-title-group">
        <h3 class="infra-card-title">State Capacity & Binding Constraint Matrix</h3>
        <span class="infra-card-desc">Comprehensive lodging metrics, multi-modal connectivity & structural capacity bottlenecks</span>
      </div>
    `;

    // Toolbar (Search + CSV Export)
    const toolbar = document.createElement('div');
    toolbar.className = 'table-toolbar';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'table-search-input';
    searchInput.placeholder = 'Search state, constraint, or transport...';
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.renderTableRows();
    });

    const exportBtn = document.createElement('button');
    exportBtn.className = 'csv-export-btn';
    exportBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Export CSV
    `;
    exportBtn.addEventListener('click', () => this.exportCsv());

    toolbar.appendChild(searchInput);
    toolbar.appendChild(exportBtn);

    // Table Container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'table-scroll-container';

    const table = document.createElement('table');
    table.className = 'constraint-table';

    // Thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th data-sort="name">State <span class="th-sort-icon">↕</span></th>
        <th data-sort="rooms">Total Rooms <span class="th-sort-icon">↕</span></th>
        <th data-sort="occupancyRate">Occupancy (%) <span class="th-sort-icon">↕</span></th>
        <th data-sort="visitorNightsPerRoom">Nights / Room <span class="th-sort-icon">↕</span></th>
        <th>Accessibility & Connectivity</th>
        <th>Binding Constraint (Diagnostic)</th>
      </tr>
    `;

    // Sort listeners
    thead.querySelectorAll('th[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort') as SortColumn;
        if (this.currentSortCol === col) {
          this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSortCol = col;
          this.currentSortDir = 'desc';
        }
        this.renderTableRows();
      });
    });

    this.tableBody = document.createElement('tbody');

    table.appendChild(thead);
    table.appendChild(this.tableBody);
    scrollContainer.appendChild(table);

    this.element.appendChild(header);
    this.element.appendChild(toolbar);
    this.element.appendChild(scrollContainer);
  }

  private renderTableRows(): void {
    this.tableBody.innerHTML = '';

    let filtered = STATE_INFRASTRUCTURE_DATA.filter((state) => {
      if (!this.searchQuery) return true;
      const query = this.searchQuery;
      return (
        state.name.toLowerCase().includes(query) ||
        state.code.toLowerCase().includes(query) ||
        state.bindingConstraint.toLowerCase().includes(query) ||
        (state.accessibilityIndicator && state.accessibilityIndicator.toLowerCase().includes(query))
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let valA: any = a[this.currentSortCol];
      let valB: any = b[this.currentSortCol];

      if (typeof valA === 'string') {
        return this.currentSortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return this.currentSortDir === 'asc' ? valA - valB : valB - valA;
    });

    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">
          No states found matching "<strong>${this.searchQuery}</strong>"
        </td>
      `;
      this.tableBody.appendChild(emptyRow);
      return;
    }

    filtered.forEach((state) => {
      const row = document.createElement('tr');
      row.title = `Click to open state profile for ${state.name}`;

      // Status pill class
      const statusClass = state.capacityStatus;
      const statusText =
        statusClass === 'critical'
          ? 'Critical'
          : statusClass === 'strain'
          ? 'Strain'
          : statusClass === 'normal'
          ? 'Balanced'
          : 'Under-utilised';

      // Accessibility cell: explicit state if null
      const accessCellHtml = state.accessibilityIndicator
        ? `<span style="font-size:0.72rem; color:#334155;">${state.accessibilityIndicator}</span>`
        : `<span class="not-available-badge">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             Not available at state level
           </span>`;

      row.innerHTML = `
        <td>
          <span class="state-cell-name">${state.name}</span>
          <span style="font-size:0.65rem; color:#94a3b8; margin-left:4px;">(${state.code})</span>
        </td>
        <td style="font-weight:700; font-variant-numeric: tabular-nums;">
          ${state.rooms.toLocaleString()}
        </td>
        <td>
          <span class="status-pill ${statusClass}">
            ${state.occupancyRate.toFixed(1)}% • ${statusText}
          </span>
        </td>
        <td style="font-weight:700; font-variant-numeric: tabular-nums;">
          ${state.visitorNightsPerRoom}
        </td>
        <td>${accessCellHtml}</td>
        <td>
          <span class="constraint-plain-text">${state.bindingConstraint}</span>
        </td>
      `;

      row.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      this.tableBody.appendChild(row);
    });
  }

  private exportCsv(): void {
    const headers = [
      'State Code',
      'State Name',
      'Region',
      'Cluster',
      'Establishments',
      'Total Rooms',
      'Occupancy Rate (%)',
      'Visitor Nights Per Room',
      'Visitor Volume (M)',
      'Tourism Receipts (RM B)',
      'Supply Growth 2019-2026 (%)',
      'Accessibility & Connectivity',
      'Binding Constraint',
      'Capacity Status',
    ];

    const rows = STATE_INFRASTRUCTURE_DATA.map((s) => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.region}"`,
      `"${s.cluster}"`,
      s.establishments,
      s.rooms,
      s.occupancyRate,
      s.visitorNightsPerRoom,
      s.visitorVolume,
      s.receipts,
      s.supplyGrowthPct,
      `"${s.accessibilityIndicator || 'Not available at state level'}"`,
      `"${s.bindingConstraint.replace(/"/g, '""')}"`,
      `"${s.capacityStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `malaysia_tourism_infrastructure_capacity_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
