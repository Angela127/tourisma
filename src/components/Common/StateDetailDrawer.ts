import './stateDetailDrawer.css';
import { createElement, Download } from 'lucide';
import { DESTINATIONS_DATA, type DestinationProfile } from '../../data/destinationsData';

export class StateDetailDrawer {
  public readonly element: HTMLElement;
  public readonly backdrop: HTMLElement;
  private contentContainer: HTMLElement;
  private onCloseCallback?: () => void;
  private currentDestination: DestinationProfile | null = null;
  private currentScenario: 'baseline' | 'accelerated' | 'highYield' = 'baseline';

  constructor(onClose?: () => void) {
    this.onCloseCallback = onClose;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'state-detail-backdrop';
    this.backdrop.addEventListener('click', () => this.close());

    this.element = document.createElement('aside');
    this.element.className = 'state-detail-drawer';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-hidden', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'drawer-header';
    header.innerHTML = `
      <div class="drawer-header-top">
        <div class="drawer-title-group">
          <span class="drawer-flag-code" id="drawer-state-code">MY</span>
          <h2 class="drawer-title" id="drawer-state-name">State Profile</h2>
        </div>
        <button class="drawer-close-btn" id="drawer-close-btn" aria-label="Close Drawer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div id="drawer-cluster-pill" class="drawer-cluster-pill"></div>
      <p class="drawer-system-reading" id="drawer-system-reading">One-sentence system reading</p>
    `;

    header.querySelector('#drawer-close-btn')?.addEventListener('click', () => this.close());

    // Scrollable body
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'drawer-body';

    // Footer
    const footer = document.createElement('div');
    footer.className = 'drawer-footer';
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-brief-btn';
    const dlIcon = createElement(Download, { width: 14, height: 14, 'stroke-width': 2.2 });
    downloadBtn.appendChild(dlIcon);
    const dlText = document.createElement('span');
    dlText.textContent = 'Download State Brief (PDF)';
    downloadBtn.appendChild(dlText);
    downloadBtn.addEventListener('click', () => this.downloadStateBrief());
    footer.appendChild(downloadBtn);

    this.element.appendChild(header);
    this.element.appendChild(this.contentContainer);
    this.element.appendChild(footer);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  public open(stateId: string): void {
    const dest = DESTINATIONS_DATA[stateId];
    if (!dest) return;
    this.currentDestination = dest;

    // Header updates
    const codeEl = this.element.querySelector('#drawer-state-code');
    const nameEl = this.element.querySelector('#drawer-state-name');
    const pillEl = this.element.querySelector('#drawer-cluster-pill') as HTMLElement;
    const readingEl = this.element.querySelector('#drawer-system-reading');

    if (codeEl) codeEl.textContent = dest.code;
    if (nameEl) nameEl.textContent = dest.name;
    if (readingEl) readingEl.textContent = dest.systemReading;

    if (pillEl) {
      pillEl.style.backgroundColor = this.getClusterBg(dest.cluster);
      pillEl.style.color = this.getClusterColor(dest.cluster);
      pillEl.innerHTML = `Cluster: <strong>${dest.cluster}</strong>`;
    }

    this.renderBody(dest);

    this.backdrop.classList.add('open');
    this.element.classList.add('open');
    this.element.setAttribute('aria-hidden', 'false');
  }

  public close(): void {
    this.backdrop.classList.remove('open');
    this.element.classList.remove('open');
    this.element.setAttribute('aria-hidden', 'true');
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  public isOpen(): boolean {
    return this.element.classList.contains('open');
  }

  private renderBody(dest: DestinationProfile): void {
    this.contentContainer.innerHTML = '';

    // 1. Compact 8-Metric Table
    const metricsSection = document.createElement('div');
    metricsSection.innerHTML = `
      <div class="drawer-section-title">Current State Diagnostic Metrics</div>
      <div class="drawer-metrics-table">
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Total Visitors</span>
          <span class="drawer-metric-val">${dest.visitorsTotal}M</span>
        </div>
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Tourism Receipts</span>
          <span class="drawer-metric-val">RM ${dest.receiptsTotal}B</span>
        </div>
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Expenditure / Trip</span>
          <span class="drawer-metric-val">RM ${dest.expenditurePerTrip}</span>
        </div>
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Length of Stay</span>
          <span class="drawer-metric-val">${dest.lengthOfStay} Nights</span>
        </div>
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Total Rooms</span>
          <span class="drawer-metric-val">${dest.roomsTotal.toLocaleString()}</span>
        </div>
        <div class="drawer-metric-item">
          <span class="drawer-metric-label">Occupancy Rate</span>
          <span class="drawer-metric-val">${dest.occupancyRate.toFixed(1)}%</span>
        </div>
        <div class="drawer-metric-item" style="grid-column: span 2;">
          <span class="drawer-metric-label">Tourism Employment</span>
          <span class="drawer-metric-val" style="font-size:0.82rem;">${dest.tourismEmployment}</span>
        </div>
        <div class="drawer-metric-item" style="grid-column: span 2; background: ${dest.pressureScore >= 75 ? '#fef2f2' : '#f8fafc'};">
          <span class="drawer-metric-label">Composite Pressure Index</span>
          <span class="drawer-metric-val" style="color: ${dest.pressureScore >= 75 ? '#dc2626' : '#0b57d0'};">
            ${dest.pressureScore} / 100 • ${dest.pressureScore >= 75 ? 'Critical Strain' : dest.pressureScore >= 50 ? 'Moderate Pressure' : 'High Headroom'}
          </span>
        </div>
      </div>
    `;
    this.contentContainer.appendChild(metricsSection);

    // 2. Radar Chart (5 Profile Dimensions vs National Avg)
    const radarSection = document.createElement('div');
    radarSection.innerHTML = `
      <div class="drawer-section-title">5-Dimension Profile vs National Benchmark</div>
      <div class="drawer-radar-box">
        ${this.generateRadarSvg(dest.radarDimensions)}
        <div class="drawer-radar-legend">
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:9px; height:9px; border-radius:2px; background-color:#0b57d0;"></span>
            <span>${dest.name}</span>
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:9px; height:9px; border-radius:2px; background-color:#cbd5e1;"></span>
            <span>National Average</span>
          </span>
        </div>
      </div>
    `;
    this.contentContainer.appendChild(radarSection);

    // 3. Scenario Preview
    const scenarioSection = document.createElement('div');
    scenarioSection.className = 'drawer-scenario-card';
    scenarioSection.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span style="font-size:0.75rem; font-weight:800; color:#15803d; text-transform:uppercase;">Growth Scenario Projection (2026-2030)</span>
      </div>
      <div class="scenario-toggles-strip">
        <button class="scenario-toggle-btn ${this.currentScenario === 'baseline' ? 'active' : ''}" data-scen="baseline">Baseline (+5%)</button>
        <button class="scenario-toggle-btn ${this.currentScenario === 'accelerated' ? 'active' : ''}" data-scen="accelerated">Accelerated (+12%)</button>
        <button class="scenario-toggle-btn ${this.currentScenario === 'highYield' ? 'active' : ''}" data-scen="highYield">High Yield (+8%)</button>
      </div>
      <div class="scenario-values-grid" id="drawer-scenario-values">
        ${this.renderScenarioMetrics(dest, this.currentScenario)}
      </div>
      <button class="simulator-link-btn" id="drawer-simulator-btn">
        <span>Explore in Policy Simulator</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </button>
    `;

    scenarioSection.querySelectorAll('.scenario-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scen = btn.getAttribute('data-scen') as 'baseline' | 'accelerated' | 'highYield';
        this.currentScenario = scen;
        scenarioSection.querySelectorAll('.scenario-toggle-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const gridEl = scenarioSection.querySelector('#drawer-scenario-values');
        if (gridEl) gridEl.innerHTML = this.renderScenarioMetrics(dest, scen);
      });
    });

    this.contentContainer.appendChild(scenarioSection);

    // 4. Trend: Multi-Metric Sparkline Stack
    const trendSection = document.createElement('div');
    trendSection.innerHTML = `
      <div class="drawer-section-title">Historical Trajectory (2020 – 2026)</div>
      <div class="sparkline-stack-box">
        <div class="stack-spark-row">
          <span class="stack-spark-label">Demand (M)</span>
          <div class="stack-spark-svg">${this.generateMiniSparkline(dest.sparklineStack.demand, '#0b57d0')}</div>
        </div>
        <div class="stack-spark-row">
          <span class="stack-spark-label">Room Supply (k)</span>
          <div class="stack-spark-svg">${this.generateMiniSparkline(dest.sparklineStack.roomSupply, '#10b981')}</div>
        </div>
        <div class="stack-spark-row">
          <span class="stack-spark-label">Yield (RM/pax)</span>
          <div class="stack-spark-svg">${this.generateMiniSparkline(dest.sparklineStack.yield, '#8b5cf6')}</div>
        </div>
      </div>
    `;
    this.contentContainer.appendChild(trendSection);
  }

  private renderScenarioMetrics(dest: DestinationProfile, scenarioKey: 'baseline' | 'accelerated' | 'highYield'): string {
    const sc = dest.scenarioPreview[scenarioKey];
    return `
      <div class="scenario-metric-box">
        <span class="scenario-metric-label">Visitor Growth</span>
        <span class="scenario-metric-val">${sc.visitors}</span>
      </div>
      <div class="scenario-metric-box">
        <span class="scenario-metric-label">Receipts Delta</span>
        <span class="scenario-metric-val">${sc.receipts}</span>
      </div>
      <div class="scenario-metric-box">
        <span class="scenario-metric-label">Pressure Impact</span>
        <span class="scenario-metric-val" style="color:#d97706;">${sc.pressure}</span>
      </div>
    `;
  }

  private generateRadarSvg(dimensions: { axis: string; stateValue: number; nationalAvg: number }[]): string {
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const count = dimensions.length;

    // Grid circles
    const levels = [0.25, 0.5, 0.75, 1.0];
    let gridSvg = '';
    levels.forEach((lvl) => {
      const r = radius * lvl;
      gridSvg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="1" />`;
    });

    // Web spokes and Labels
    let spokesSvg = '';
    let labelsSvg = '';
    dimensions.forEach((dim, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      spokesSvg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;

      const lx = center + Math.cos(angle) * (radius + 18);
      const ly = center + Math.sin(angle) * (radius + 14);
      const anchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
      labelsSvg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="7.5" font-weight="700" fill="#64748b">${dim.axis}</text>`;
    });

    // National polygon
    const natPoints = dimensions
      .map((dim, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const r = (dim.nationalAvg / 100) * radius;
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
      })
      .join(' ');

    // State polygon
    const statePoints = dimensions
      .map((dim, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const r = (dim.stateValue / 100) * radius;
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
      })
      .join(' ');

    return `
      <svg viewBox="0 0 ${size} ${size}" class="drawer-radar-svg">
        ${gridSvg}
        ${spokesSvg}
        <polygon points="${natPoints}" fill="#cbd5e1" fill-opacity="0.25" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
        <polygon points="${statePoints}" fill="#0b57d0" fill-opacity="0.32" stroke="#0b57d0" stroke-width="2" />
        ${labelsSvg}
      </svg>
    `;
  }

  private generateMiniSparkline(data: number[], color: string): string {
    if (!data || data.length < 2) return '';
    const w = 180;
    const h = 22;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * (w - 6) + 3;
        const y = h - ((val - min) / range) * (h - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
        <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      </svg>
    `;
  }

  private downloadStateBrief(): void {
    if (!this.currentDestination) return;
    const d = this.currentDestination;
    const content = `Tourisma State Tourism Diagnostic Brief
==============================================
State: ${d.name} (${d.code})
Region: ${d.region} Malaysia
Cluster: ${d.cluster}
Readiness Score: ${d.readinessScore}/100
Pressure Score: ${d.pressureScore}/100

Key Metrics (2026):
-------------------
• Total Visitors: ${d.visitorsTotal} Million
• Tourism Receipts: RM ${d.receiptsTotal} Billion
• Expenditure per Trip: RM ${d.expenditurePerTrip}
• Avg. Length of Stay: ${d.lengthOfStay} Nights
• Available Room Inventory: ${d.roomsTotal.toLocaleString()} rooms
• Occupancy Rate: ${d.occupancyRate.toFixed(1)}%
• Tourism Employment: ${d.tourismEmployment}

System Diagnosis:
-----------------
${d.systemReading}

Generated by Tourisma Intelligence Engine on ${new Date().toLocaleDateString()}.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tourisma_State_Brief_${d.code}_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getClusterColor(cluster: string): string {
    switch (cluster) {
      case 'Mature Gateway Hubs': return '#0b57d0';
      case 'High-Growth Emerging': return '#10b981';
      case 'Eco & Heritage Frontiers': return '#f59e0b';
      default: return '#8b5cf6';
    }
  }

  private getClusterBg(cluster: string): string {
    switch (cluster) {
      case 'Mature Gateway Hubs': return '#eff6ff';
      case 'High-Growth Emerging': return '#ecfdf5';
      case 'Eco & Heritage Frontiers': return '#fefce8';
      default: return '#f5f3ff';
    }
  }
}
