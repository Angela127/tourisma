import { MALAYSIA_GEO_DATA } from '../../data/malaysiaGeo';
import { ACCOMMODATION_DATA } from '../../data/accommodationData';

export type MapToggleLayer = 'aor' | 'ratio';

export class AccommodationMap {
  public readonly element: HTMLElement;
  private currentToggle: MapToggleLayer = 'aor';
  private svgWrapper!: HTMLElement;
  private legendElement!: HTMLElement;
  private tooltip!: HTMLElement;
  private onSelectStateCallback?: (stateId: string | null) => void;
  private hoveredStateId: string | null = null;
  private selectedStateId: string | null = null;

  constructor(onSelectState?: (stateId: string | null) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'asset-card acc-map-card';

    this.createTooltip();
    this.render();
  }

  public setToggle(toggle: MapToggleLayer): void {
    if (this.currentToggle !== toggle) {
      this.currentToggle = toggle;

      // Update segmented button styles
      const aorBtn = this.element.querySelector<HTMLButtonElement>('[data-toggle="aor"]');
      const ratioBtn = this.element.querySelector<HTMLButtonElement>('[data-toggle="ratio"]');
      if (aorBtn && ratioBtn) {
        aorBtn.classList.toggle('active', toggle === 'aor');
        aorBtn.setAttribute('aria-checked', String(toggle === 'aor'));
        ratioBtn.classList.toggle('active', toggle === 'ratio');
        ratioBtn.setAttribute('aria-checked', String(toggle === 'ratio'));
      }

      this.updateMapSvg();
      this.updateLegend();
    }
  }

  public setSelectedState(stateId: string | null): void {
    if (this.selectedStateId !== stateId) {
      this.selectedStateId = stateId;
      this.updateMapSvg();
    }
  }

  private createTooltip(): void {
    document.querySelectorAll('.acc-floating-tooltip').forEach((el) => el.remove());

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'acc-floating-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);

    this.element.addEventListener('mouseleave', () => this.hideTooltip());
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
    if (this.hoveredStateId !== null) {
      this.hoveredStateId = null;
      this.updateMapSvg();
    }
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Card Header: Title group on Left, Segmented toggle + compass on Right
    const mapHeader = document.createElement('div');
    mapHeader.className = 'asset-card-header';
    mapHeader.innerHTML = `
      <div class="asset-card-title-group">
        <div class="asset-card-badge">
          <span class="asset-badge-dot" style="background-color: #2563eb;"></span>
          <span>SPATIAL CONCENTRATION</span>
        </div>
        <h3 class="asset-card-title map-acc-title">Accommodation Capacity & Utilisation Map</h3>
        <p class="asset-card-subtitle map-acc-sub">Geospatial distribution of available inventory and resulting demand pressure</p>
      </div>
      <div class="map-header-actions" style="display: flex; align-items: center; gap: 10px;">
        <div class="asset-segmented-control" role="radiogroup" aria-label="Capacity and Utilisation Metric Toggle">
          <button type="button" class="asset-segment-btn ${this.currentToggle === 'aor' ? 'active' : ''}" data-toggle="aor" role="radio" aria-checked="${this.currentToggle === 'aor'}">Average Occupancy Rate</button>
          <button type="button" class="asset-segment-btn ${this.currentToggle === 'ratio' ? 'active' : ''}" data-toggle="ratio" role="radio" aria-checked="${this.currentToggle === 'ratio'}">Visitor-to-Room Ratio</button>
        </div>
        <div class="map-compass-icon" title="North orientation">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#93c5fd" stroke-width="1.2" />
            <polygon points="12 4 15 12 12 10 9 12" fill="#0b57d0" />
            <polygon points="12 20 15 12 12 14 9 12" fill="#cbd5e1" />
            <text x="12" y="3.2" font-size="5" font-weight="900" fill="#0b57d0" text-anchor="middle">N</text>
          </svg>
        </div>
      </div>
    `;

    // Hook up segmented button clicks
    const aorBtn = mapHeader.querySelector<HTMLButtonElement>('[data-toggle="aor"]');
    const ratioBtn = mapHeader.querySelector<HTMLButtonElement>('[data-toggle="ratio"]');
    aorBtn?.addEventListener('click', () => this.setToggle('aor'));
    ratioBtn?.addEventListener('click', () => this.setToggle('ratio'));

    // 2. Map Stage Container
    const mapStage = document.createElement('div');
    mapStage.className = 'acc-map-stage-container';

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'acc-svg-container';
    mapStage.appendChild(this.svgWrapper);

    // 3. Legend Step Bar
    this.legendElement = document.createElement('div');
    this.legendElement.className = 'map-legend-step-bar';
    mapStage.appendChild(this.legendElement);

    this.element.appendChild(mapHeader);
    this.element.appendChild(mapStage);

    this.updateMapSvg();
    this.updateLegend();
  }

  private updateLegend(): void {
    if (this.currentToggle === 'aor') {
      this.legendElement.innerHTML = `
        <span class="legend-label-readiness">Average Occupancy Rate (AOR)</span>
        <div class="legend-scale-row">
          <span class="legend-bound">&lt; 45%</span>
          <div class="legend-step-blocks">
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #f1f5f9; border: 1px solid #cbd5e1;" title="&lt; 45%"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #bae6fd;" title="45–50%"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #38bdf8;" title="50–55%"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #0284c7;" title="55–65%"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #0369a1;" title="&gt; 65%"></div>
          </div>
          <span class="legend-bound">&gt; 65%</span>
        </div>
      `;
    } else {
      this.legendElement.innerHTML = `
        <span class="legend-label-readiness">Visitor-to-Room Ratio</span>
        <div class="legend-scale-row">
          <span class="legend-bound">&lt; 500</span>
          <div class="legend-step-blocks">
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #fef3c7; border: 1px solid #fde68a;" title="&lt; 500"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #fcd34d;" title="500–700"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #f59e0b;" title="700–1,000"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #ea580c;" title="1,000–1,500"></div>
            <div class="step-block" style="width: 24px; height: 10px; border-radius: 2px; background-color: #9a3412;" title="&gt; 1,500"></div>
          </div>
          <span class="legend-bound">&gt; 1,500</span>
        </div>
      `;
    }
  }

  private getColor(stateId: string): string {
    const data = ACCOMMODATION_DATA.find((d) => d.id === stateId);
    if (!data) return '#cbd5e1';

    if (this.currentToggle === 'aor') {
      const val = data.aor;
      if (val > 65) return '#0369a1';
      if (val > 55) return '#0284c7';
      if (val > 50) return '#38bdf8';
      if (val > 45) return '#bae6fd';
      return '#f1f5f9';
    } else {
      const ratio = (data.visitors * 1000000) / data.rooms;
      if (ratio > 1500) return '#9a3412';
      if (ratio > 1000) return '#ea580c';
      if (ratio > 700) return '#f59e0b';
      if (ratio > 500) return '#fcd34d';
      return '#fef3c7';
    }
  }

  private updateMapSvg(): void {
    const paths = MALAYSIA_GEO_DATA.map((geo) => {
      const fillColor = this.getColor(geo.code);
      const isHovered = this.hoveredStateId === geo.code;
      const isSelected = this.selectedStateId === geo.code;

      const stroke = isSelected ? '#0f172a' : isHovered ? '#1e293b' : '#64748b';
      const strokeWidth = isSelected ? '2.4' : isHovered ? '1.6' : '0.9';

      return `
        <path
          d="${geo.svgPath}"
          data-state-id="${geo.code}"
          fill="${fillColor}"
          stroke="${stroke}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          class="acc-map-path ${isSelected ? 'selected' : ''}"
          style="cursor: pointer; transition: fill 0.25s ease, stroke 0.2s ease, stroke-width 0.15s ease;"
        />
      `;
    }).join('');

    const labels = MALAYSIA_GEO_DATA.map((geo) => {
      const offset = geo.labelOffset || { x: 0, y: 0 };
      const lx = geo.centroid.x + offset.x;
      const ly = geo.centroid.y + offset.y;
      const isHovered = this.hoveredStateId === geo.code;
      const isSelected = this.selectedStateId === geo.code;

      const fontWeight = isSelected ? '900' : isHovered ? '800' : '750';
      const fill = isSelected ? '#0f172a' : isHovered ? '#1e293b' : '#334155';

      return `
        <text
          x="${lx}"
          y="${ly}"
          text-anchor="middle"
          font-size="8.5"
          font-weight="${fontWeight}"
          fill="${fill}"
          style="pointer-events: none; paint-order: stroke; stroke: #ffffff; stroke-width: 2.5px; stroke-linejoin: round;"
        >${geo.code}</text>
      `;
    }).join('');

    this.svgWrapper.innerHTML = `
      <svg viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid meet" class="acc-map-svg">
        <g id="acc-states-group">${paths}</g>
        <g id="acc-labels-group">${labels}</g>
      </svg>
    `;

    // Click outside to clear selection
    this.svgWrapper.onclick = (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'path' && target.tagName !== 'text') {
        if (this.selectedStateId !== null) {
          this.selectedStateId = null;
          this.updateMapSvg();
          if (this.onSelectStateCallback) this.onSelectStateCallback(null);
        }
      }
    };

    // Mouse leave svgWrapper to clear hover outline
    this.svgWrapper.addEventListener('mouseleave', () => {
      if (this.hoveredStateId !== null) {
        this.hoveredStateId = null;
        this.updateMapSvg();
      }
    });

    // Add event listeners for hover and click
    this.svgWrapper.querySelectorAll('path[data-state-id]').forEach((pathEl) => {
      const stateId = pathEl.getAttribute('data-state-id');
      if (!stateId) return;

      // HOVER ONLY: show tooltip and outline. Do NOT change the bar chart!
      pathEl.addEventListener('mouseenter', (e) => {
        if (this.hoveredStateId !== stateId) {
          this.hoveredStateId = stateId;
          this.updateMapSvg();
        }

        const data = ACCOMMODATION_DATA.find((d) => d.code === stateId);
        if (data) {
          const ratio = Math.round((data.visitors * 1000000) / data.rooms);
          this.tooltip.innerHTML = `
            <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">${data.name}</div>
            <div style="font-size:0.75rem; color:#475569;">AOR: <strong>${data.aor}%</strong></div>
            <div style="font-size:0.75rem; color:#475569;">Ratio: <strong>${ratio.toLocaleString()}</strong> visitors/room</div>
          `;
          this.tooltip.style.display = 'block';
          this.updateTooltipPos(e as MouseEvent);
        }
      });

      pathEl.addEventListener('mousemove', (e) => this.updateTooltipPos(e as MouseEvent));

      // CLICK ONLY: change the selected state and trigger callback to update the bar chart!
      pathEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedStateId !== stateId) {
          this.selectedStateId = stateId;
          this.updateMapSvg();
          if (this.onSelectStateCallback) this.onSelectStateCallback(stateId);
        } else {
          // Toggle off if already selected
          this.selectedStateId = null;
          this.updateMapSvg();
          if (this.onSelectStateCallback) this.onSelectStateCallback(null);
        }
      });
    });
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }

  public destroy(): void {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}
