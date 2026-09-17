import {
  REPORT_SECTIONS_CONFIG,
  type ReportType,
  type OutputFormat,
  type GeneratedReportItem,
} from '../../data/reportsData';

export interface ReportBuildConfig {
  type: ReportType;
  title: string;
  scope: string;
  period: string;
  scenario: string;
  selectedSections: string[];
  format: OutputFormat;
}

export class ReportBuilder {
  public readonly element: HTMLElement;
  private config: ReportBuildConfig;
  private onGenerateCallback?: (report: GeneratedReportItem) => void;
  private onChangeConfigCallback?: (config: ReportBuildConfig) => void;
  private generateBtn!: HTMLButtonElement;
  private progressTrack!: HTMLElement;
  private progressFill!: HTMLElement;

  constructor(
    onChangeConfig?: (config: ReportBuildConfig) => void,
    onGenerate?: (report: GeneratedReportItem) => void
  ) {
    this.onChangeConfigCallback = onChangeConfig;
    this.onGenerateCallback = onGenerate;

    this.config = {
      type: 'national_overview',
      title: 'Malaysia Tourism Intelligence Report: National Overview & Carry-Capacity Diagnostic',
      scope: 'All 16 States & Federal Territories',
      period: '2026 Annual Benchmark',
      scenario: 'Baseline (+5% CAGR)',
      selectedSections: REPORT_SECTIONS_CONFIG.filter((s) => s.defaultChecked).map((s) => s.id),
      format: 'pdf',
    };

    this.element = document.createElement('div');
    this.element.className = 'rep-card';
    this.render();
  }

  public getConfig(): ReportBuildConfig {
    return this.config;
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rep-card-header';
    header.innerHTML = `
      <div class="rep-card-title-group">
        <h3 class="rep-card-title">Policy Report Builder</h3>
        <span class="rep-card-desc">Configure scope, section modules, and publication format</span>
      </div>
      <span class="infra-toggle-group" style="padding:3px 8px; font-size:0.68rem; color:#0b57d0; font-weight:700;">
        Interactive Builder
      </span>
    `;

    const form = document.createElement('div');
    form.className = 'builder-form';

    // 1. Report Type
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group-block';
    typeGroup.innerHTML = `
      <label class="form-label-title">Report Type</label>
      <select class="form-select-control" id="rep-type-select">
        <option value="national_overview" selected>National Overview (Full Diagnostic)</option>
        <option value="state_brief">State Brief (Individual Destination Drill-Down)</option>
        <option value="scenario_comparison">Scenario Comparison (Policy Simulation Deck)</option>
        <option value="cluster_analysis">Cluster Analysis (Strategic Grouping Matrix)</option>
      </select>
    `;
    form.appendChild(typeGroup);

    // 2. Scope & Period 2-Col Row
    const scopeRow = document.createElement('div');
    scopeRow.className = 'form-row-2col';
    scopeRow.innerHTML = `
      <div class="form-group-block">
        <label class="form-label-title">Geographic Scope</label>
        <select class="form-select-control" id="rep-scope-select">
          <option value="All 16 States & Federal Territories" selected>All Malaysia (16 States)</option>
          <option value="Peninsular Malaysia (12 States)">Peninsular Malaysia</option>
          <option value="Borneo Malaysia (Sabah, Sarawak, Labuan)">Borneo Region</option>
          <option value="Pulau Pinang, Melaka">Heritage Gateway States</option>
          <option value="Selangor, WP Kuala Lumpur">Central Commercial Corridor</option>
        </select>
      </div>
      <div class="form-group-block">
        <label class="form-label-title">Temporal Period</label>
        <select class="form-select-control" id="rep-period-select">
          <option value="2026 Annual Benchmark" selected>2026 Annual Benchmark</option>
          <option value="2024–2026 3-Year Baseline">2024–2026 3-Year Baseline</option>
          <option value="2026–2030 Medium-Term Forecast">2026–2030 Medium-Term Forecast</option>
        </select>
      </div>
    `;
    form.appendChild(scopeRow);

    // 3. Scenario selector
    const scenarioGroup = document.createElement('div');
    scenarioGroup.className = 'form-group-block';
    scenarioGroup.innerHTML = `
      <label class="form-label-title">Macroeconomic Scenario</label>
      <select class="form-select-control" id="rep-scenario-select">
        <option value="Baseline (+5% CAGR)" selected>Baseline Scenario (+5% Volume CAGR)</option>
        <option value="Accelerated (+12% Target)">Accelerated Growth (+12% Tourism Target)</option>
        <option value="High-Yield Focus (+8% Yield)">High-Yield Focus (+8% Spend per Visitor)</option>
      </select>
    `;
    form.appendChild(scenarioGroup);

    // 4. Section Checkboxes with Thumbnails
    const sectionsGroup = document.createElement('div');
    sectionsGroup.className = 'form-group-block';
    sectionsGroup.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <label class="form-label-title">Included Section Modules</label>
        <span style="font-size:0.68rem; color:#64748b;" id="sections-selected-count">${this.config.selectedSections.length} of ${REPORT_SECTIONS_CONFIG.length} Selected</span>
      </div>
    `;

    const checkList = document.createElement('div');
    checkList.className = 'sections-check-list';

    REPORT_SECTIONS_CONFIG.forEach((sec) => {
      const isChecked = this.config.selectedSections.includes(sec.id);
      const item = document.createElement('div');
      item.className = `section-check-item ${isChecked ? 'active' : ''}`;
      item.setAttribute('data-sec-id', sec.id);

      item.innerHTML = `
        <input type="checkbox" ${isChecked ? 'checked' : ''} style="cursor:pointer;" />
        <span class="section-thumb-icon">${sec.previewThumbnail.toUpperCase()}</span>
        <div class="section-info-col">
          <span class="section-name-text">${sec.name}</span>
          <span class="section-desc-text">${sec.description}</span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }

        if (checkbox.checked) {
          item.classList.add('active');
          if (!this.config.selectedSections.includes(sec.id)) {
            this.config.selectedSections.push(sec.id);
          }
        } else {
          item.classList.remove('active');
          this.config.selectedSections = this.config.selectedSections.filter((id) => id !== sec.id);
        }

        const countEl = sectionsGroup.querySelector('#sections-selected-count');
        if (countEl) countEl.textContent = `${this.config.selectedSections.length} of ${REPORT_SECTIONS_CONFIG.length} Selected`;

        this.notifyChange();
      });

      checkList.appendChild(item);
    });

    sectionsGroup.appendChild(checkList);
    form.appendChild(sectionsGroup);

    // 5. Output Format (PDF vs PPTX)
    const formatGroup = document.createElement('div');
    formatGroup.className = 'form-group-block';
    formatGroup.innerHTML = `<label class="form-label-title">Output Publication Format</label>`;

    const formatRow = document.createElement('div');
    formatRow.className = 'format-toggle-row';

    const pdfCard = document.createElement('div');
    pdfCard.className = `format-radio-card ${this.config.format === 'pdf' ? 'active' : ''}`;
    pdfCard.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <div>
        <span class="format-title">PDF Document</span>
        <span style="display:block; font-size:0.65rem; color:#64748b;">Executive Brief (.pdf)</span>
      </div>
    `;
    pdfCard.addEventListener('click', () => {
      this.config.format = 'pdf';
      pdfCard.classList.add('active');
      pptxCard.classList.remove('active');
      this.notifyChange();
    });

    const pptxCard = document.createElement('div');
    pptxCard.className = `format-radio-card ${this.config.format === 'pptx' ? 'active' : ''}`;
    pptxCard.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      <div>
        <span class="format-title">PowerPoint Deck</span>
        <span style="display:block; font-size:0.65rem; color:#64748b;">Circulation Slides (.pptx)</span>
      </div>
    `;
    pptxCard.addEventListener('click', () => {
      this.config.format = 'pptx';
      pptxCard.classList.add('active');
      pdfCard.classList.remove('active');
      this.notifyChange();
    });

    formatRow.appendChild(pdfCard);
    formatRow.appendChild(pptxCard);
    formatGroup.appendChild(formatRow);
    form.appendChild(formatGroup);

    // 6. Generate Button & Animated Progress
    const actionGroup = document.createElement('div');
    actionGroup.className = 'form-group-block';

    this.generateBtn = document.createElement('button');
    this.generateBtn.className = 'generate-report-btn';
    this.generateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span id="generate-btn-text">Generate Official Report</span>
    `;

    this.progressTrack = document.createElement('div');
    this.progressTrack.className = 'progress-bar-track';
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'progress-bar-fill';
    this.progressTrack.appendChild(this.progressFill);

    this.generateBtn.addEventListener('click', () => this.handleGenerateClick());

    actionGroup.appendChild(this.generateBtn);
    actionGroup.appendChild(this.progressTrack);
    form.appendChild(actionGroup);

    // Form Change listeners
    form.querySelector('#rep-type-select')?.addEventListener('change', (e) => {
      this.config.type = (e.target as HTMLSelectElement).value as ReportType;
      this.updateTitleFromType();
      this.notifyChange();
    });

    form.querySelector('#rep-scope-select')?.addEventListener('change', (e) => {
      this.config.scope = (e.target as HTMLSelectElement).value;
      this.notifyChange();
    });

    form.querySelector('#rep-period-select')?.addEventListener('change', (e) => {
      this.config.period = (e.target as HTMLSelectElement).value;
      this.notifyChange();
    });

    form.querySelector('#rep-scenario-select')?.addEventListener('change', (e) => {
      this.config.scenario = (e.target as HTMLSelectElement).value;
      this.notifyChange();
    });

    this.element.appendChild(header);
    this.element.appendChild(form);
  }

  private updateTitleFromType(): void {
    switch (this.config.type) {
      case 'national_overview':
        this.config.title = 'Malaysia Tourism Intelligence Report: National Overview & Carry-Capacity Diagnostic';
        break;
      case 'state_brief':
        this.config.title = `State Tourism Diagnostic Brief: ${this.config.scope}`;
        break;
      case 'scenario_comparison':
        this.config.title = 'Tourism Growth Scenario Comparison & Macroeconomic Impact Analysis';
        break;
      case 'cluster_analysis':
        this.config.title = 'Destination Archetype Clustering & Strategic Growth Matrix';
        break;
    }
  }

  private notifyChange(): void {
    if (this.onChangeConfigCallback) {
      this.onChangeConfigCallback(this.config);
    }
  }

  private handleGenerateClick(): void {
    if (this.generateBtn.classList.contains('generating')) return;

    this.generateBtn.classList.add('generating');
    const btnText = this.generateBtn.querySelector('#generate-btn-text');
    this.progressTrack.classList.add('active');

    const steps = [
      { pct: 25, text: 'Synthesizing charts and state metrics...' },
      { pct: 55, text: 'Evaluating carry-capacity risk models...' },
      { pct: 85, text: 'Compiling executive PDF brief...' },
      { pct: 100, text: 'Report generated successfully!' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        this.progressFill.style.width = `${s.pct}%`;
        if (btnText) btnText.textContent = s.text;
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          this.generateBtn.classList.remove('generating');
          this.progressTrack.classList.remove('active');
          this.progressFill.style.width = '0%';
          if (btnText) btnText.textContent = 'Generate Official Report';

          const newReport: GeneratedReportItem = {
            id: `rep_${Date.now()}`,
            name: this.config.title,
            type: this.config.type,
            scope: this.config.scope,
            dateGenerated: 'Just now',
            fileSize: this.config.format === 'pdf' ? '2.8 MB' : '5.4 MB',
            format: this.config.format,
            downloadFilename: `Tourisma_${this.config.type}_${Date.now()}.${this.config.format}`,
          };

          if (this.onGenerateCallback) {
            this.onGenerateCallback(newReport);
          }
        }, 500);
      }
    }, 450);
  }
}
