import './reports.css';
import { ReportBuilder, type ReportBuildConfig } from './ReportBuilder';
import { ReportPreviewPane } from './ReportPreviewPane';
import { PreviousReportsTable } from './PreviousReportsTable';
import { type GeneratedReportItem } from '../../data/reportsData';

export class ReportsPage {
  public readonly element: HTMLElement;
  private builder: ReportBuilder;
  private previewPane: ReportPreviewPane;
  private historyTable: PreviousReportsTable;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'reports-page';

    this.historyTable = new PreviousReportsTable();

    this.builder = new ReportBuilder(
      (newConfig: ReportBuildConfig) => {
        this.previewPane.updateConfig(newConfig);
      },
      (newReport: GeneratedReportItem) => {
        this.historyTable.addReport(newReport);
      }
    );

    this.previewPane = new ReportPreviewPane(this.builder.getConfig());

    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Header strip
    const headerSection = document.createElement('div');
    headerSection.className = 'rep-section-block';
    headerSection.innerHTML = `
      <div class="rep-section-header">
        <div class="rep-section-title-wrap">
          <h2 class="rep-section-title">Reports & Policy Briefs</h2>
          <span class="rep-section-subtitle">Turn what is on screen into an authoritative briefing deck or printable PDF</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.72rem; color:#16a34a; background:#f0fdf4; border:1px solid #bbf7d0; padding:2px 8px; border-radius:4px; font-weight:700;">
            MOTAC / DOSM Validated
          </span>
        </div>
      </div>
    `;
    this.element.appendChild(headerSection);

    // Top Grid: Builder (Left) & Preview (Right)
    const mainGrid = document.createElement('div');
    mainGrid.className = 'rep-main-grid';
    mainGrid.appendChild(this.builder.element);
    mainGrid.appendChild(this.previewPane.element);
    this.element.appendChild(mainGrid);

    // Bottom Section: Previous Reports Archive Table
    const bottomSection = document.createElement('div');
    bottomSection.className = 'rep-section-block';
    bottomSection.style.marginTop = '12px';
    bottomSection.appendChild(this.historyTable.element);
    this.element.appendChild(bottomSection);
  }
}
