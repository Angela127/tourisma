import { type ReportBuildConfig } from './ReportBuilder';
import { REPORT_SECTIONS_CONFIG } from '../../data/reportsData';

export class ReportPreviewPane {
  public readonly element: HTMLElement;
  private config: ReportBuildConfig;
  private currentPage: number = 1;
  private totalPages: number = 3;

  constructor(initialConfig: ReportBuildConfig) {
    this.config = initialConfig;
    this.element = document.createElement('div');
    this.element.className = 'rep-card';
    this.element.style.background = '#f1f5f9';
    this.render();
  }

  public updateConfig(newConfig: ReportBuildConfig): void {
    this.config = newConfig;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Header with Page Navigation & Zoom Indicator
    const header = document.createElement('div');
    header.className = 'rep-card-header';
    header.style.marginBottom = '8px';
    header.innerHTML = `
      <div class="rep-card-title-group">
        <div style="display:flex; align-items:center; gap:6px;">
          <h3 class="rep-card-title">Live Document Preview</h3>
          <span style="font-size:0.65rem; background:#dbeafe; color:#1d4ed8; padding:1px 6px; border-radius:4px; font-weight:700;">
            ${this.config.format.toUpperCase()}
          </span>
        </div>
        <span class="rep-card-desc">Real-time simulation of policy publication</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="report-action-btn" id="prev-page-btn" ${this.currentPage <= 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span style="font-size:0.72rem; font-weight:750; color:#334155;">Page ${this.currentPage} of ${this.totalPages}</span>
        <button class="report-action-btn" id="next-page-btn" ${this.currentPage >= this.totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    `;

    header.querySelector('#prev-page-btn')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
      }
    });

    header.querySelector('#next-page-btn')?.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.render();
      }
    });

    const canvas = document.createElement('div');
    canvas.className = 'preview-page-canvas';

    if (this.currentPage === 1) {
      canvas.appendChild(this.renderCoverPage());
    } else if (this.currentPage === 2) {
      canvas.appendChild(this.renderPageTwo());
    } else {
      canvas.appendChild(this.renderPageThree());
    }

    this.element.appendChild(header);
    this.element.appendChild(canvas);
  }

  private renderCoverPage(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'doc-cover-page';

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // Compute active section summary chips
    const activeSections = REPORT_SECTIONS_CONFIG.filter((s) =>
      this.config.selectedSections.includes(s.id)
    );

    page.innerHTML = `
      <div class="doc-cover-top">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="doc-emblem-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <span>MINISTRY OF TOURISM, ARTS AND CULTURE (MOTAC)</span>
          </div>
          <span style="font-size:0.62rem; font-weight:700; color:#dc2626; border:1px solid #fca5a5; background:#fef2f2; padding:2px 6px; border-radius:3px;">
            CONFIDENTIAL / CIRCULATION ONLY
          </span>
        </div>

        <div style="margin-top: 14px; display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:0.7rem; font-weight:800; color:#0b57d0; text-transform:uppercase; letter-spacing:0.05em;">
            NATIONAL STRATEGIC BRIEF • TOURISMA INTELLIGENCE SUITE
          </span>
          <h1 class="doc-main-title">${this.config.title}</h1>
          <div class="doc-subtitle-scope">
            <strong>Geographic Scope:</strong> ${this.config.scope} &nbsp;|&nbsp; 
            <strong>Temporal Horizon:</strong> ${this.config.period} &nbsp;|&nbsp; 
            <strong>Scenario Model:</strong> ${this.config.scenario}
          </div>
        </div>

        <div class="doc-executive-summary-box">
          <strong style="color:#0f172a; display:block; margin-bottom:4px; font-size:0.76rem;">Executive Policy Summary:</strong>
          This document provides a comprehensive capacity diagnostic across Malaysian destinations. Incorporating high-frequency MAHB air passenger manifests, MAH lodging surveys, and DOSM household microdata, this report evaluates structural visitor concentration, identifies regional carry-capacity bottlenecks, and delivers policy recommendations to maximize expenditure yield without triggering localized environmental or infrastructural failure.
        </div>

        <div>
          <span style="font-size:0.68rem; font-weight:800; color:#334155; text-transform:uppercase; display:block; margin-bottom:6px;">
            Key Diagnostic Indicators (2026 Baseline)
          </span>
          <div class="doc-kpi-highlight-strip">
            <div class="doc-kpi-tile">
              <span style="font-size:0.62rem; color:#64748b; font-weight:600;">Total Demand</span>
              <span style="font-size:0.95rem; font-weight:800; color:#0f172a;">118.4M</span>
              <span style="font-size:0.6rem; color:#16a34a; font-weight:700;">+7.2% YoY</span>
            </div>
            <div class="doc-kpi-tile">
              <span style="font-size:0.62rem; color:#64748b; font-weight:600;">Total Receipts</span>
              <span style="font-size:0.95rem; font-weight:800; color:#0f172a;">RM 102.4B</span>
              <span style="font-size:0.6rem; color:#16a34a; font-weight:700;">RM 865 / pax</span>
            </div>
            <div class="doc-kpi-tile">
              <span style="font-size:0.62rem; color:#64748b; font-weight:600;">High-Strain States</span>
              <span style="font-size:0.95rem; font-weight:800; color:#dc2626;">2 of 16</span>
              <span style="font-size:0.6rem; color:#dc2626; font-weight:700;">Penang, Melaka</span>
            </div>
          </div>
        </div>

        <div style="margin-top:10px;">
          <span style="font-size:0.68rem; font-weight:800; color:#334155; text-transform:uppercase; display:block; margin-bottom:6px;">
            Included Section Modules (${activeSections.length})
          </span>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            ${activeSections
              .map(
                (sec) =>
                  `<span style="font-size:0.62rem; background:#f1f5f9; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; color:#334155; font-weight:600;">✓ ${sec.name}</span>`
              )
              .join('')}
          </div>
        </div>
      </div>

      <div class="doc-cover-footer">
        <span><strong>Generated:</strong> ${dateFormatted}</span>
        <span><strong>Data-as-of:</strong> 15 Dec 2026 (MOTAC / DOSM Official Releases)</span>
        <span><strong>Document ID:</strong> TRM-2026-B81</span>
      </div>
    `;

    return page;
  }

  private renderPageTwo(): HTMLElement {
    const page = document.createElement('div');
    page.style.display = 'flex';
    page.style.flexDirection = 'column';
    page.style.height = '100%';
    page.style.justifyContent = 'space-between';

    page.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0b57d0; padding-bottom:6px; margin-bottom:12px;">
          <span style="font-size:0.75rem; font-weight:800; color:#0b57d0;">SECTION 1: DEMAND COMPOSITION & SEASONALITY CONCENTRATION</span>
          <span style="font-size:0.7rem; color:#64748b; font-weight:600;">Tourisma Intelligence Brief</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
            <span style="font-size:0.7rem; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">Domestic vs International Trajectory</span>
            <svg width="100%" height="80" viewBox="0 0 200 80">
              <path d="M 0,60 Q 50,45 100,50 T 200,30 L 200,80 L 0,80 Z" fill="#93c5fd" opacity="0.6" />
              <path d="M 0,40 Q 50,25 100,30 T 200,15 L 200,80 L 0,80 Z" fill="#0b57d0" opacity="0.8" />
              <polyline points="0,40 50,25 100,30 150,20 200,15" fill="none" stroke="#1d4ed8" stroke-width="2" />
            </svg>
            <span style="font-size:0.6rem; color:#64748b;">International share recovered to 22.1% of national volume.</span>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
            <span style="font-size:0.7rem; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">Top Origin Yield Multipliers</span>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:0.64rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>1. Singapore</span>
                <span style="font-weight:700; color:#0b57d0;">8.3M (RM 420/pax)</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>2. China</span>
                <span style="font-weight:700; color:#16a34a;">3.8M (RM 1,480/pax)</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>3. United Kingdom</span>
                <span style="font-weight:700; color:#16a34a;">0.48M (RM 2,650/pax)</span>
              </div>
            </div>
            <span style="font-size:0.58rem; color:#475569; margin-top:4px; display:block;">UK & China generate 3.5× higher yield per arrival.</span>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px;">
          <span style="font-size:0.72rem; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">16-State Seasonality Heatmap & Multiplier Assessment</span>
          <p style="font-size:0.68rem; color:#475569; line-height:1.4; margin:0 0 6px 0;">
            Peak-to-trough concentration is acute in Terengganu (2.65×) and Pahang (1.82×) driven by monsoonal weather and school holidays. Conversely, Selangor and Kuala Lumpur maintain balanced year-round demand indices (1.18× peak multiplier).
          </p>
          <div style="display:grid; grid-template-columns:repeat(12, 1fr); gap:2px; height:18px; border-radius:3px; overflow:hidden;">
            <div style="background:#dbeafe;"></div><div style="background:#bfdbfe;"></div><div style="background:#93c5fd;"></div>
            <div style="background:#bfdbfe;"></div><div style="background:#fed7aa;"></div><div style="background:#fca5a5;"></div>
            <div style="background:#f87171;"></div><div style="background:#fed7aa;"></div><div style="background:#bfdbfe;"></div>
            <div style="background:#93c5fd;"></div><div style="background:#fca5a5;"></div><div style="background:#ef4444;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.58rem; color:#94a3b8; margin-top:2px;">
            <span>Jan (Trough)</span>
            <span>Jun (Mid-Year Peak)</span>
            <span>Dec (Year-End Surge)</span>
          </div>
        </div>
      </div>

      <div class="doc-cover-footer">
        <span>Tourisma Platform • Policy Intelligence</span>
        <span>Page 2</span>
      </div>
    `;

    return page;
  }

  private renderPageThree(): HTMLElement {
    const page = document.createElement('div');
    page.style.display = 'flex';
    page.style.flexDirection = 'column';
    page.style.height = '100%';
    page.style.justifyContent = 'space-between';

    page.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0b57d0; padding-bottom:6px; margin-bottom:12px;">
          <span style="font-size:0.75rem; font-weight:800; color:#0b57d0;">SECTION 2: CARRY-CAPACITY DIAGNOSTIC & POLICY ACTIONS</span>
          <span style="font-size:0.7rem; color:#64748b; font-weight:600;">Tourisma Intelligence Brief</span>
        </div>

        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span style="font-size:0.74rem; font-weight:800; color:#991b1b;">High-Pressure Threshold Violations</span>
          </div>
          <p style="font-size:0.67rem; color:#7f1d1d; margin:0; line-height:1.4;">
            <strong>Pulau Pinang</strong> and <strong>Melaka</strong> exceed the 75-point sustainability threshold (78.4 and 76.2 respectively). George Town and Central Melaka suffer from acute visitor-to-resident pressure and peak hotel occupancy (>84%).
          </p>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; margin-bottom:12px;">
          <span style="font-size:0.72rem; font-weight:800; color:#0f172a; display:block; margin-bottom:6px;">Recommended Strategic Interventions</span>
          <ol style="font-size:0.68rem; color:#334155; margin:0; padding-left:16px; line-height:1.5;">
            <li><strong>Dynamic Heritage Ingress Management:</strong> Implement timed-entry slots for George Town and Melaka UNESCO zones during festive long weekends.</li>
            <li><strong>Dispersal to High-Headroom Corridors:</strong> Redirect group coach tours to Perak (Ipoh/Taiping) and Negeri Sembilan to absorb spillover volume.</li>
            <li><strong>Yield Shift Mandate:</strong> Incentivize 4-to-5 star eco-resort development in Sarawak and Sabah to maximize expenditure yield per capita rather than raw headcount.</li>
          </ol>
        </div>

        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px;">
          <span style="font-size:0.68rem; font-weight:750; color:#1e40af; display:block; margin-bottom:2px;">Sign-off & Verification</span>
          <span style="font-size:0.62rem; color:#3b82f6;">Certified by Tourisma Policy Analytics Engine • Ministry of Tourism, Arts and Culture</span>
        </div>
      </div>

      <div class="doc-cover-footer">
        <span>Tourisma Platform • Policy Intelligence</span>
        <span>Page 3</span>
      </div>
    `;

    return page;
  }
}
