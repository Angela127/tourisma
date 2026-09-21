import { MALAYSIA_GEO_DATA } from '../../data/malaysiaGeo';
import {
  type StateEnvironmentData,
  getStateEnvironment,
} from '../../data/environmentData';

export type MapLayer = 'overall' | 'inside' | 'land' | 'marine';

export class EnvironmentMapCard {
  public readonly element: HTMLElement;
  private currentLayer: MapLayer = 'overall';
  private selectedStateId: string | null = null;
  private svgWrapper!: HTMLElement;
  private legendElement!: HTMLElement;
  private tooltip!: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'env-card env-map-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'env-floating-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);

    // Hide tooltip whenever mouse leaves card entirely
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
    this.updateMapSvg();
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
        <span class="env-badge-dot"></span>
        <span>SPATIAL CONSERVATION DIAGNOSTIC</span>
      </div>
      <h3 class="env-card-title">Malaysia Environmental Sensitivity Map</h3>
      <span class="env-card-desc">Geospatial proximity to 485 terrestrial forest reserves, national parks & marine sanctuaries</span>
    `;

    // Layer Controls
    const controls = document.createElement('div');
    controls.className = 'env-layer-controls';

    const layers: { id: MapLayer; label: string }[] = [
      { id: 'overall', label: 'Overall Exposure %' },
      { id: 'inside', label: 'Inside Reserves' },
      { id: 'land', label: 'Land Eco-Buffer' },
      { id: 'marine', label: 'Marine & Reef' },
    ];

    layers.forEach((l) => {
      const btn = document.createElement('button');
      btn.className = `env-layer-btn ${this.currentLayer === l.id ? 'active' : ''}`;
      btn.textContent = l.label;
      btn.addEventListener('click', () => {
        if (this.currentLayer !== l.id) {
          this.currentLayer = l.id;
          controls.querySelectorAll('.env-layer-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateMapSvg();
          this.updateLegend();
        }
      });
      controls.appendChild(btn);
    });

    header.appendChild(titleGroup);
    header.appendChild(controls);

    // Canvas Wrap
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'env-map-canvas-wrap';

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'env-svg-container';

    canvasWrap.appendChild(this.svgWrapper);

    // Legend
    this.legendElement = document.createElement('div');
    this.legendElement.className = 'env-map-legend';
    this.updateLegend();

    this.element.appendChild(header);
    this.element.appendChild(canvasWrap);
    this.element.appendChild(this.legendElement);

    this.updateMapSvg();
  }

  private updateLegend(): void {
    if (this.currentLayer === 'overall') {
      this.legendElement.innerHTML = `
        <span class="env-legend-title">Combined Exposure % (Inside + Near Buffer):</span>
        <div class="env-legend-steps">
          <span class="env-legend-chip"><i style="background:#ecfdf5;"></i> &lt;2% Safe</span>
          <span class="env-legend-chip"><i style="background:#a7f3d0;"></i> 2–5% Minimal</span>
          <span class="env-legend-chip"><i style="background:#fde047;"></i> 5–15% Moderate</span>
          <span class="env-legend-chip"><i style="background:#fb923c;"></i> 15–25% High</span>
          <span class="env-legend-chip"><i style="background:#ef4444;"></i> &gt;25% Critical Buffer</span>
        </div>
      `;
    } else if (this.currentLayer === 'inside') {
      this.legendElement.innerHTML = `
        <span class="env-legend-title">Assets Physically Inside Protected Reserves:</span>
        <div class="env-legend-steps">
          <span class="env-legend-chip"><i style="background:#f1f5f9;"></i> 0 Assets</span>
          <span class="env-legend-chip"><i style="background:#fecaca;"></i> 1–20 Low</span>
          <span class="env-legend-chip"><i style="background:#f87171;"></i> 21–80 Moderate</span>
          <span class="env-legend-chip"><i style="background:#dc2626;"></i> 81–150 Elevated</span>
          <span class="env-legend-chip"><i style="background:#991b1b;"></i> &gt;150 High Saturation</span>
        </div>
      `;
    } else if (this.currentLayer === 'land') {
      this.legendElement.innerHTML = `
        <span class="env-legend-title">Terrestrial & Forest Reserve Proximity:</span>
        <div class="env-legend-steps">
          <span class="env-legend-chip"><i style="background:#f0fdf4;"></i> &lt;2%</span>
          <span class="env-legend-chip"><i style="background:#bbf7d0;"></i> 2–5%</span>
          <span class="env-legend-chip"><i style="background:#4ade80;"></i> 5–15%</span>
          <span class="env-legend-chip"><i style="background:#16a34a;"></i> 15–25%</span>
          <span class="env-legend-chip"><i style="background:#14532d;"></i> &gt;25% Deep Forest</span>
        </div>
      `;
    } else {
      this.legendElement.innerHTML = `
        <span class="env-legend-title">Marine Park & Island Coral Reef Proximity:</span>
        <div class="env-legend-steps">
          <span class="env-legend-chip"><i style="background:#f8fafc;"></i> Landlocked (0%)</span>
          <span class="env-legend-chip"><i style="background:#bae6fd;"></i> &lt;2% Minimal</span>
          <span class="env-legend-chip"><i style="background:#38bdf8;"></i> 2–5% Coastal</span>
          <span class="env-legend-chip"><i style="background:#0284c7;"></i> 5–10% Active Marine</span>
          <span class="env-legend-chip"><i style="background:#0369a1;"></i> &gt;10% Coral Hotspot</span>
        </div>
      `;
    }
  }

  private getColor(data?: StateEnvironmentData): string {
    if (!data) return '#cbd5e1';

    if (this.currentLayer === 'overall') {
      const pct = data.exposurePct;
      if (pct > 25) return '#ef4444';
      if (pct > 15) return '#fb923c';
      if (pct > 5) return '#fde047';
      if (pct > 2) return '#a7f3d0';
      return '#ecfdf5';
    }

    if (this.currentLayer === 'inside') {
      const cnt = data.inside;
      if (cnt > 150) return '#991b1b';
      if (cnt > 80) return '#dc2626';
      if (cnt > 20) return '#f87171';
      if (cnt > 0) return '#fecaca';
      return '#f1f5f9';
    }

    if (this.currentLayer === 'land') {
      const pct = data.land.percent;
      if (pct > 25) return '#14532d';
      if (pct > 15) return '#16a34a';
      if (pct > 5) return '#4ade80';
      if (pct > 2) return '#bbf7d0';
      return '#f0fdf4';
    }

    // Marine
    const pct = data.marine.percent;
    if (pct > 10) return '#0369a1';
    if (pct > 5) return '#0284c7';
    if (pct > 2) return '#38bdf8';
    if (pct > 0) return '#bae6fd';
    return '#f8fafc';
  }

  private updateMapSvg(): void {
    const paths = MALAYSIA_GEO_DATA.map((geo) => {
      const data = getStateEnvironment(geo.id);
      const fillColor = this.getColor(data);
      const isSelected = this.selectedStateId === geo.id;

      return `
        <path
          d="${geo.svgPath}"
          id="env-state-${geo.id}"
          data-state-id="${geo.id}"
          fill="${fillColor}"
          stroke="${isSelected ? '#0f172a' : '#475569'}"
          stroke-width="${isSelected ? '2.2' : '0.8'}"
          stroke-linejoin="round"
          style="cursor: pointer; transition: fill 0.25s ease, stroke 0.2s ease, stroke-width 0.15s ease; ${isSelected ? 'filter: drop-shadow(0 3px 8px rgba(15,23,42,0.35));' : ''}"
        />
      `;
    }).join('');

    const labels = MALAYSIA_GEO_DATA.map((geo) => {
      const offset = geo.labelOffset || { x: 0, y: 0 };
      const lx = geo.centroid.x + offset.x;
      const ly = geo.centroid.y + offset.y;
      const isSelected = this.selectedStateId === geo.id;

      return `
        <text
          x="${lx}"
          y="${ly}"
          text-anchor="middle"
          font-size="8"
          font-weight="${isSelected ? '900' : '750'}"
          fill="${isSelected ? '#0f172a' : '#1e293b'}"
          style="pointer-events: none; text-shadow: 0 0 3px #ffffff, 0 0 3px #ffffff;"
        >${geo.code}</text>
      `;
    }).join('');

    this.svgWrapper.innerHTML = `
      <svg viewBox="0 0 1000 440" class="env-map-svg">
        <g id="env-states-group">${paths}</g>
        <g id="env-labels-group">${labels}</g>
      </svg>
    `;

    // Add event listeners
    this.svgWrapper.querySelectorAll('path[data-state-id]').forEach((pathEl) => {
      const stateId = pathEl.getAttribute('data-state-id');
      if (!stateId) return;
      const data = getStateEnvironment(stateId);
      if (!data) return;

      pathEl.addEventListener('mouseenter', (e) => {
        (pathEl as SVGPathElement).style.filter = 'brightness(1.1) drop-shadow(0 2px 6px rgba(0,0,0,0.25))';
        const keyAreasText = data.keyProtectedAreas.length > 0
          ? data.keyProtectedAreas.slice(0, 2).join(', ')
          : 'None proximate';

        this.tooltip.innerHTML = `
          <div class="env-tooltip-header">
            <strong>${data.name}</strong> (${data.code})
            <span class="env-tooltip-rate">${data.exposurePct}% exposed</span>
          </div>
          <div class="env-tooltip-body">
            <div class="env-tooltip-row">
              <span>Total Screened Assets:</span>
              <strong>${data.totalAssets.toLocaleString()}</strong>
            </div>
            <div class="env-tooltip-row">
              <span style="color:#dc2626; font-weight:600;">● Inside Protected Boundary:</span>
              <strong>${data.inside.toLocaleString()} (${data.insidePct}%)</strong>
            </div>
            <div class="env-tooltip-row">
              <span style="color:#d97706; font-weight:600;">● Near Sensitive Buffer:</span>
              <strong>${data.near.toLocaleString()} (${data.nearPct}%)</strong>
            </div>
            <div class="env-tooltip-row">
              <span style="color:#059669; font-weight:600;">● Land Eco-Exposed:</span>
              <strong>${data.land.exposed.toLocaleString()} (${data.land.percent}%)</strong>
            </div>
            <div class="env-tooltip-row">
              <span style="color:#0284c7; font-weight:600;">● Marine Eco-Exposed:</span>
              <strong>${data.marine.exposed.toLocaleString()} (${data.marine.percent}%)</strong>
            </div>
            <div class="env-tooltip-footer">
              <strong>Nearest Reserves:</strong> ${keyAreasText}
            </div>
            <div style="font-size:0.64rem; color:#64748b; margin-top:5px;">🖱 Click to focus state in charts & detail drawer</div>
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e as MouseEvent);
      });

      pathEl.addEventListener('mousemove', (e) => this.updateTooltipPos(e as MouseEvent));
      pathEl.addEventListener('mouseleave', () => {
        if (this.selectedStateId !== stateId) {
          (pathEl as SVGPathElement).style.filter = 'none';
        }
        this.tooltip.style.display = 'none';
      });

      pathEl.addEventListener('click', () => {
        this.hideTooltip();
        this.selectedStateId = this.selectedStateId === stateId ? null : stateId;
        this.updateMapSvg();
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(stateId);
        }
      });
    });
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
