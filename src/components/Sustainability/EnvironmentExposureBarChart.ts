import {
  STATE_ENVIRONMENT_LIST,
  type StateEnvironmentData,
} from '../../data/environmentData';

export type BarMetricMode = 'count' | 'percent';
export type BarSortMode = 'total' | 'land' | 'marine' | 'name';

export class EnvironmentExposureBarChart {
  public readonly element: HTMLElement;
  private metricMode: BarMetricMode = 'count';
  private sortMode: BarSortMode = 'total';
  private selectedStateId: string | null = null;
  private barsContainer!: HTMLElement;
  private tooltip!: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'env-card env-barchart-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'env-floating-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);

    // Hide tooltip whenever mouse leaves the chart container
    this.element.addEventListener('mouseleave', () => this.hideTooltip());
  }

  public hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  public setSelectedState(stateId: string | null): void {
    this.selectedStateId = stateId;
    this.hideTooltip();
    this.updateBars();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Card Header
    const header = document.createElement('div');
    header.className = 'env-card-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'env-title-group';
    titleGroup.innerHTML = `
      <div class="env-badge-header">
        <span class="env-badge-dot bar"></span>
        <span>STATE COMPARATIVE DIAGNOSTIC</span>
      </div>
      <h3 class="env-card-title">Environmental Exposure by State (Land & Marine)</h3>
      <span class="env-card-desc">Comparative side-by-side asset exposure to terrestrial conservation reserves vs marine & reef parks</span>
    `;

    // Right-side Controls
    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'env-bar-controls-wrap';

    // Metric Mode Toggle (Count vs %)
    const metricToggle = document.createElement('div');
    metricToggle.className = 'env-segmented-toggle';
    metricToggle.innerHTML = `
      <button class="env-seg-btn ${this.metricMode === 'count' ? 'active' : ''}" data-mode="count">Asset Count</button>
      <button class="env-seg-btn ${this.metricMode === 'percent' ? 'active' : ''}" data-mode="percent">Percentage (%)</button>
    `;
    metricToggle.querySelectorAll('.env-seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as BarMetricMode;
        if (mode && this.metricMode !== mode) {
          this.metricMode = mode;
          metricToggle.querySelectorAll('.env-seg-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateBars();
        }
      });
    });

    // Sort Dropdown
    const sortSelect = document.createElement('select');
    sortSelect.className = 'env-sort-select';
    sortSelect.innerHTML = `
      <option value="total" ${this.sortMode === 'total' ? 'selected' : ''}>Sort: Total Exposure</option>
      <option value="land" ${this.sortMode === 'land' ? 'selected' : ''}>Sort: Land Eco-Exposure</option>
      <option value="marine" ${this.sortMode === 'marine' ? 'selected' : ''}>Sort: Marine Eco-Exposure</option>
      <option value="name" ${this.sortMode === 'name' ? 'selected' : ''}>Sort: State Name (A–Z)</option>
    `;
    sortSelect.addEventListener('change', () => {
      this.sortMode = sortSelect.value as BarSortMode;
      this.updateBars();
    });

    controlsWrap.appendChild(metricToggle);
    controlsWrap.appendChild(sortSelect);

    header.appendChild(titleGroup);
    header.appendChild(controlsWrap);

    // Legend Strip
    const legendStrip = document.createElement('div');
    legendStrip.className = 'env-bar-legend-strip';
    legendStrip.innerHTML = `
      <div class="env-bar-legend-item">
        <span class="env-legend-color land"></span>
        <strong>Land Environmental Exposure</strong>
        <span class="env-legend-sub">(Forest Reserves, National Parks, Wildlife Sanctuaries)</span>
      </div>
      <div class="env-bar-legend-item">
        <span class="env-legend-color marine"></span>
        <strong>Marine Environmental Exposure</strong>
        <span class="env-legend-sub">(Marine Parks, Coastal Protected Areas, Turtle Sanctuaries)</span>
      </div>
    `;

    // Bars Container
    this.barsContainer = document.createElement('div');
    this.barsContainer.className = 'env-bars-list-container';

    this.element.appendChild(header);
    this.element.appendChild(legendStrip);
    this.element.appendChild(this.barsContainer);

    this.updateBars();
  }

  private getSortedData(): StateEnvironmentData[] {
    const list = [...STATE_ENVIRONMENT_LIST];
    if (this.sortMode === 'total') {
      if (this.metricMode === 'percent') {
        return list.sort((a, b) => b.exposurePct - a.exposurePct);
      }
      return list.sort((a, b) => b.totalExposed - a.totalExposed);
    }
    if (this.sortMode === 'land') {
      if (this.metricMode === 'percent') {
        return list.sort((a, b) => b.land.percent - a.land.percent);
      }
      return list.sort((a, b) => b.land.exposed - a.land.exposed);
    }
    if (this.sortMode === 'marine') {
      if (this.metricMode === 'percent') {
        return list.sort((a, b) => b.marine.percent - a.marine.percent);
      }
      return list.sort((a, b) => b.marine.exposed - a.marine.exposed);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  private updateBars(): void {
    const data = this.getSortedData();

    // Determine max value for 100% scale width
    let maxVal = 1;
    if (this.metricMode === 'count') {
      data.forEach((s) => {
        if (s.land.exposed > maxVal) maxVal = s.land.exposed;
        if (s.marine.exposed > maxVal) maxVal = s.marine.exposed;
      });
    } else {
      data.forEach((s) => {
        if (s.land.percent > maxVal) maxVal = s.land.percent;
        if (s.marine.percent > maxVal) maxVal = s.marine.percent;
      });
      // Give a bit of headroom
      maxVal = Math.max(maxVal * 1.1, 35);
    }

    this.barsContainer.innerHTML = '';

    data.forEach((state) => {
      const isSelected = this.selectedStateId === state.id;
      const row = document.createElement('div');
      row.className = `env-bar-row ${isSelected ? 'selected' : ''}`;
      row.setAttribute('data-state-id', state.id);

      const landVal = this.metricMode === 'count' ? state.land.exposed : state.land.percent;
      const marineVal = this.metricMode === 'count' ? state.marine.exposed : state.marine.percent;

      const landWidthPct = Math.min((landVal / maxVal) * 100, 100);
      const marineWidthPct = Math.min((marineVal / maxVal) * 100, 100);

      const landLabel = this.metricMode === 'count'
        ? `${state.land.exposed.toLocaleString()} (${state.land.percent}%)`
        : `${state.land.percent}% (${state.land.exposed.toLocaleString()})`;

      const marineLabel = this.metricMode === 'count'
        ? `${state.marine.exposed.toLocaleString()} (${state.marine.percent}%)`
        : `${state.marine.percent}% (${state.marine.exposed.toLocaleString()})`;

      row.innerHTML = `
        <div class="env-bar-state-label">
          <span class="env-state-code-badge">${state.code}</span>
          <div class="env-state-name-wrap">
            <span class="env-bar-state-name">${state.name}</span>
            <span class="env-bar-state-total">${state.totalAssets.toLocaleString()} total assets</span>
          </div>
        </div>

        <div class="env-bar-track-group">
          <!-- Land Bar Track -->
          <div class="env-bar-channel">
            <div class="env-bar-fill land" style="width: ${landWidthPct}%;"></div>
            <span class="env-bar-val-text land">${landVal > 0 ? landLabel : '0 (0%)'}</span>
          </div>

          <!-- Marine Bar Track -->
          <div class="env-bar-channel">
            <div class="env-bar-fill marine" style="width: ${marineWidthPct}%;"></div>
            <span class="env-bar-val-text marine">${marineVal > 0 ? marineLabel : '0 (0%)'}</span>
          </div>
        </div>

        <div class="env-bar-total-badge" title="Total Exposed Assets (${state.exposurePct}% of state)">
          <strong>${state.totalExposed.toLocaleString()}</strong>
          <span class="env-badge-pct">${state.exposurePct}%</span>
        </div>
      `;

      // Hover Tooltip
      row.addEventListener('mouseenter', (e) => {
        this.tooltip.innerHTML = `
          <div class="env-tooltip-header">
            <strong>${state.name}</strong> (${state.code})
            <span class="env-tooltip-rate">${state.exposurePct}% Combined Exposure</span>
          </div>
          <div class="env-tooltip-body">
            <div class="env-tooltip-row">
              <span>Total State Assets:</span>
              <strong>${state.totalAssets.toLocaleString()}</strong>
            </div>
            <div class="env-tooltip-row" style="border-top:1px solid #e2e8f0; padding-top:4px; margin-top:4px;">
              <span style="color:#059669; font-weight:700;">🌲 Land Environmental Exposure:</span>
              <strong>${state.land.exposed.toLocaleString()} (${state.land.percent}%)</strong>
            </div>
            <div style="font-size:0.68rem; color:#64748b; margin-left:14px; margin-bottom:4px;">
              • Inside Forest/Parks: <strong>${state.land.inside}</strong> | Near Buffer: <strong>${state.land.near}</strong>
            </div>
            <div class="env-tooltip-row" style="border-top:1px solid #e2e8f0; padding-top:4px; margin-top:4px;">
              <span style="color:#0284c7; font-weight:700;">🌊 Marine Environmental Exposure:</span>
              <strong>${state.marine.exposed.toLocaleString()} (${state.marine.percent}%)</strong>
            </div>
            <div style="font-size:0.68rem; color:#64748b; margin-left:14px; margin-bottom:4px;">
              • Inside Marine Parks: <strong>${state.marine.inside}</strong> | Near Coastal Buffer: <strong>${state.marine.near}</strong>
            </div>
            <div class="env-tooltip-footer">
              <strong>Key Proximate Reserves:</strong> ${state.keyProtectedAreas.join(', ') || 'None'}
            </div>
            <div style="font-size:0.64rem; color:#64748b; margin-top:5px;">🖱 Click to select & filter tab view</div>
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e as MouseEvent);
      });

      row.addEventListener('mousemove', (e) => this.updateTooltipPos(e as MouseEvent));
      row.addEventListener('mouseleave', () => {
        this.tooltip.style.display = 'none';
      });

      row.addEventListener('click', () => {
        this.hideTooltip();
        this.selectedStateId = this.selectedStateId === state.id ? null : state.id;
        this.updateBars();
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      this.barsContainer.appendChild(row);
    });
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
