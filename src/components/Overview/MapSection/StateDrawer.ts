import { createElement, X, Sparkles } from 'lucide';
import type { StateData } from '../../../data/overviewData';

export class StateDrawer {
  public readonly element: HTMLElement;
  public readonly backdrop: HTMLElement;
  private contentContainer: HTMLElement;
  private onCloseCallback?: () => void;

  constructor(onClose?: () => void) {
    this.onCloseCallback = onClose;

    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'state-drawer-backdrop';
    this.backdrop.addEventListener('click', () => this.close());

    // Drawer Container
    this.element = document.createElement('aside');
    this.element.className = 'state-drawer';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-hidden', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'state-drawer-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'state-drawer-header-left';

    const flagBadge = document.createElement('span');
    flagBadge.className = 'state-flag-badge';
    flagBadge.textContent = 'MY';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'state-drawer-title-group';

    const title = document.createElement('h2');
    title.id = 'state-drawer-title';
    title.className = 'state-drawer-title';
    title.textContent = 'State Profile';

    const subtitle = document.createElement('span');
    subtitle.id = 'state-drawer-subtitle';
    subtitle.className = 'state-drawer-subtitle';
    subtitle.textContent = 'Select a state on the map';

    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);
    headerLeft.appendChild(flagBadge);
    headerLeft.appendChild(titleGroup);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'state-drawer-close-btn';
    closeBtn.setAttribute('aria-label', 'Close State Drawer');
    const closeIcon = createElement(X, {
      width: 18,
      height: 18,
      'stroke-width': 2.2,
    });
    closeBtn.appendChild(closeIcon);
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    // Scrollable Content
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'state-drawer-body';

    this.element.appendChild(header);
    this.element.appendChild(this.contentContainer);

    // Keyboard listener (Escape to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  public open(state: StateData): void {
    // Update Header
    const title = this.element.querySelector('#state-drawer-title');
    const subtitle = this.element.querySelector('#state-drawer-subtitle');
    const flagBadge = this.element.querySelector('.state-flag-badge');

    if (title) title.textContent = state.name;
    if (subtitle) subtitle.textContent = `${state.region} Malaysia • ${state.code}`;
    if (flagBadge) flagBadge.textContent = state.code;

    // Render Body
    this.renderBody(state);

    // Show Drawer
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

  private renderBody(state: StateData): void {
    this.contentContainer.innerHTML = '';

    // Cluster Banner
    const clusterBanner = document.createElement('div');
    clusterBanner.className = 'state-cluster-banner';
    const clusterIcon = createElement(Sparkles, { width: 14, height: 14 });
    const clusterText = document.createElement('span');
    clusterText.innerHTML = `Cluster: <strong>${state.cluster}</strong>`;
    clusterBanner.appendChild(clusterIcon);
    clusterBanner.appendChild(clusterText);
    this.contentContainer.appendChild(clusterBanner);

    // 4 Key Metrics Grid
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'state-metrics-grid';

    const metrics = [
      {
        label: 'Total Visitors',
        value: `${state.visitorsTotal}M`,
        sub: `Dom: ${state.visitorsDomestic}M | Int: ${state.visitorsInternational}M`,
      },
      {
        label: 'Tourism Receipts',
        value: `RM ${state.receipts}B`,
        sub: 'Gross state tourism revenue',
      },
      {
        label: 'Receipts / Visitor',
        value: `RM ${state.receiptsPerVisitor}`,
        sub: 'Yield per tourist trip',
      },
      {
        label: 'Readiness Index',
        value: Math.round(state.readinessScore).toString(),
        sub: 'Composite infrastructure index',
      },
    ];

    metrics.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'state-metric-tile';
      card.innerHTML = `
        <span class="tile-label">${m.label}</span>
        <span class="tile-value">${m.value}</span>
        <span class="tile-sub">${m.sub}</span>
      `;
      metricsGrid.appendChild(card);
    });
    this.contentContainer.appendChild(metricsGrid);

    // Domestic vs International Ratio Bar
    const domRatio = ((state.visitorsDomestic / state.visitorsTotal) * 100).toFixed(0);
    const intRatio = ((state.visitorsInternational / state.visitorsTotal) * 100).toFixed(0);

    const ratioSection = document.createElement('div');
    ratioSection.className = 'state-drawer-section';
    ratioSection.innerHTML = `
      <div class="section-title-row">
        <span class="section-heading">Visitor Origin Split</span>
        <span class="section-badge">${domRatio}% Domestic / ${intRatio}% International</span>
      </div>
      <div class="split-progress-bar">
        <div class="split-dom" style="width: ${domRatio}%"></div>
        <div class="split-int" style="width: ${intRatio}%"></div>
      </div>
    `;
    this.contentContainer.appendChild(ratioSection);

    // Monthly Visitor Seasonality Profile
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const maxVal = Math.max(...state.monthlyTrend) || 1;
    const seasonalityBars = state.monthlyTrend
      .map((val, idx) => {
        const heightPct = Math.round((val / maxVal) * 100);
        return `
          <div class="seasonality-bar-col" title="${months[idx]}: ${val.toFixed(2)}M">
            <div class="seasonality-bar-fill" style="height: ${heightPct}%"></div>
            <span class="seasonality-bar-label">${months[idx]}</span>
          </div>
        `;
      })
      .join('');

    const seasonalitySection = document.createElement('div');
    seasonalitySection.className = 'state-drawer-section';
    seasonalitySection.innerHTML = `
      <div class="section-title-row">
        <span class="section-heading">Monthly Volume Distribution</span>
        <span class="section-note">Jan – Dec (Millions)</span>
      </div>
      <div class="drawer-seasonality-chart">
        ${seasonalityBars}
      </div>
    `;
    this.contentContainer.appendChild(seasonalitySection);

    // Capacity & Bottlenecks Warning
    const capacitySection = document.createElement('div');
    capacitySection.className = 'state-drawer-section capacity-section';
    capacitySection.innerHTML = `
      <div class="section-title-row">
        <span class="section-heading">Capacity Pressure & Bottleneck</span>
        <span class="capacity-score-badge">Pressure: ${state.pressureScore}/100</span>
      </div>
      <div class="capacity-bottleneck-card">
        <div class="bottleneck-detail">
          <span class="bottleneck-label">Primary Constraint:</span>
          <span class="bottleneck-value">${state.bindingConstraint}</span>
        </div>
      </div>
    `;
    this.contentContainer.appendChild(capacitySection);

    // Top Attractions
    const attractionsSection = document.createElement('div');
    attractionsSection.className = 'state-drawer-section';
    const attractionsTags = state.topAttractions
      .map((a) => `<span class="attraction-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${a}</span>`)
      .join('');

    attractionsSection.innerHTML = `
      <div class="section-title-row">
        <span class="section-heading">Key Tourism Anchors</span>
      </div>
      <div class="attractions-container">
        ${attractionsTags}
      </div>
    `;
    this.contentContainer.appendChild(attractionsSection);

    // Policy Takeaway
    const insightSection = document.createElement('div');
    insightSection.className = 'state-drawer-section policy-insight';
    insightSection.innerHTML = `
      <div class="policy-insight-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>Policy Diagnostic</span>
      </div>
      <p class="policy-insight-text">${state.keyInsight}</p>
    `;
    this.contentContainer.appendChild(insightSection);
  }
}
