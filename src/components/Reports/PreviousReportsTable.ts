import {
  type GeneratedReportItem,
  INITIAL_PREVIOUS_REPORTS,
} from '../../data/reportsData';

export class PreviousReportsTable {
  public readonly element: HTMLElement;
  private reports: GeneratedReportItem[] = [];

  constructor() {
    this.reports = [...INITIAL_PREVIOUS_REPORTS];
    this.element = document.createElement('div');
    this.element.className = 'rep-card';
    this.render();
  }

  public addReport(report: GeneratedReportItem): void {
    this.reports.unshift(report);
    this.render();
  }

  public loadSampleReports(): void {
    this.reports = [...INITIAL_PREVIOUS_REPORTS];
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rep-card-header';
    header.innerHTML = `
      <div class="rep-card-title-group">
        <h3 class="rep-card-title">Previously Generated Policy Reports</h3>
        <span class="rep-card-desc">Downloadable executive briefs, decks, and scenario exports</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.72rem; color:#64748b; font-weight:600;">
          ${this.reports.length} Reports Archived
        </span>
        ${
          this.reports.length > 0
            ? `<button class="report-action-btn delete" id="clear-all-btn">Clear All</button>`
            : ''
        }
      </div>
    `;

    header.querySelector('#clear-all-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the generated reports history?')) {
        this.reports = [];
        this.render();
      }
    });

    this.element.appendChild(header);

    if (this.reports.length === 0) {
      // Empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'reports-empty-state';
      emptyState.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span class="empty-state-title">No Reports Generated Yet</span>
        <p class="empty-state-desc">
          Policy reports assemble your customized demand composition, 16-state seasonality heatmaps, carry-capacity diagnostics, and scenario forecasts into official printable PDF briefs and PowerPoint circulation decks.
        </p>
        <button class="sample-report-btn" id="load-sample-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Load 3 Sample Policy Reports (1-Click)
        </button>
      `;

      emptyState.querySelector('#load-sample-btn')?.addEventListener('click', () => {
        this.loadSampleReports();
      });

      this.element.appendChild(emptyState);
    } else {
      // Table view
      const tableWrap = document.createElement('div');
      tableWrap.className = 'prev-reports-table-wrap';

      const table = document.createElement('table');
      table.className = 'prev-reports-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Report Title</th>
            <th>Type</th>
            <th>Scope</th>
            <th>Date Generated</th>
            <th>File Size</th>
            <th>Format</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.reports
            .map(
              (rep) => `
            <tr data-rep-id="${rep.id}">
              <td style="font-weight:750; color:#0f172a; max-width:280px;">
                <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${rep.name}
                </div>
              </td>
              <td>
                <span style="font-size:0.68rem; font-weight:600; color:#475569; text-transform:capitalize;">
                  ${rep.type.replace('_', ' ')}
                </span>
              </td>
              <td style="color:#64748b; font-size:0.7rem;">${rep.scope}</td>
              <td style="color:#64748b; font-size:0.7rem; white-space:nowrap;">${rep.dateGenerated}</td>
              <td style="color:#64748b; font-size:0.7rem;">${rep.fileSize}</td>
              <td>
                <span class="format-badge-pill ${rep.format}">${rep.format}</span>
              </td>
              <td style="text-align:right; white-space:nowrap;">
                <button class="report-action-btn download-btn" data-rep-id="${rep.id}" title="Download report file">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </button>
                <button class="report-action-btn delete delete-btn" data-rep-id="${rep.id}" title="Delete report" style="margin-left:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      `;

      // Wire Download buttons
      table.querySelectorAll('.download-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const target = (e.currentTarget as HTMLElement).getAttribute('data-rep-id');
          const report = this.reports.find((r) => r.id === target);
          if (report) {
            this.triggerSimulatedDownload(report);
          }
        });
      });

      // Wire Delete buttons
      table.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const target = (e.currentTarget as HTMLElement).getAttribute('data-rep-id');
          this.reports = this.reports.filter((r) => r.id !== target);
          this.render();
        });
      });

      tableWrap.appendChild(table);
      this.element.appendChild(tableWrap);
    }
  }

  private triggerSimulatedDownload(report: GeneratedReportItem): void {
    const dummyContent = `Tourisma Official Policy Report\n\nTitle: ${report.name}\nType: ${report.type}\nScope: ${report.scope}\nDate: ${report.dateGenerated}\nFormat: ${report.format.toUpperCase()}\n\nVerified by Tourisma Policy Analytics Engine\nMinistry of Tourism, Arts and Culture (MOTAC) Malaysia`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
