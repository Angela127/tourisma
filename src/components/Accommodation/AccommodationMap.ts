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
    this.element.className = 'acc-map-card';

    this.createTooltip();
    this.render();
  }

  public setToggle(toggle: MapToggleLayer): void {
    if (this.currentToggle !== toggle) {
      this.currentToggle = toggle;
      this.updateMapSvg();
      this.updateLegend();
    }
  }

  private createTooltip(): void {
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

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'acc-map-canvas-wrap';

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'acc-svg-container';

    canvasWrap.appendChild(this.svgWrapper);

    this.legendElement = document.createElement('div');
    this.legendElement.className = 'acc-map-legend';
    
    this.element.appendChild(canvasWrap);
    this.element.appendChild(this.legendElement);

    this.updateMapSvg();
    this.updateLegend();
  }

  private updateLegend(): void {
    if (this.currentToggle === 'aor') {
      this.legendElement.innerHTML = `
        <span class="acc-legend-title">Average Occupancy Rate (AOR):</span>
        <div class="acc-legend-steps">
          <span class="acc-legend-chip"><i style="background:#f1f5f9;"></i> &lt;45%</span>
          <span class="acc-legend-chip"><i style="background:#bae6fd;"></i> 45–50%</span>
          <span class="acc-legend-chip"><i style="background:#38bdf8;"></i> 50–55%</span>
          <span class="acc-legend-chip"><i style="background:#0284c7;"></i> 55–65%</span>
          <span class="acc-legend-chip"><i style="background:#0369a1;"></i> &gt;65%</span>
        </div>
      `;
    } else {
      this.legendElement.innerHTML = `
        <span class="acc-legend-title">Visitor-to-Room Ratio:</span>
        <div class="acc-legend-steps">
          <span class="acc-legend-chip"><i style="background:#fef3c7;"></i> &lt;500</span>
          <span class="acc-legend-chip"><i style="background:#fcd34d;"></i> 500–700</span>
          <span class="acc-legend-chip"><i style="background:#f59e0b;"></i> 700–1000</span>
          <span class="acc-legend-chip"><i style="background:#ea580c;"></i> 1000–1500</span>
          <span class="acc-legend-chip"><i style="background:#9a3412;"></i> &gt;1500</span>
        </div>
      `;
    }
  }

  private getColor(stateId: string): string {
    const data = ACCOMMODATION_DATA.find(d => d.id === stateId);
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
      
      const stroke = isSelected ? '#0f172a' : (isHovered ? '#334155' : '#475569');
      const strokeWidth = isSelected ? '2.5' : (isHovered ? '1.5' : '0.8');

      return `
        <path
          d="${geo.svgPath}"
          data-state-id="${geo.code}"
          fill="${fillColor}"
          stroke="${stroke}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          class="acc-map-path"
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
      
      const fontWeight = isSelected ? '900' : (isHovered ? '800' : '750');
      const fill = isSelected ? '#0f172a' : (isHovered ? '#1e293b' : '#334155');

      return `
        <text
          x="${lx}"
          y="${ly}"
          text-anchor="middle"
          font-size="8"
          font-weight="${fontWeight}"
          fill="${fill}"
          style="pointer-events: none; text-shadow: 0 0 3px #ffffff, 0 0 3px #ffffff;"
        >${geo.code}</text>
      `;
    }).join('');

    this.svgWrapper.innerHTML = `
      <svg viewBox="0 0 1000 440" class="acc-map-svg">
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

    // Add event listeners for hover and click
    this.svgWrapper.querySelectorAll('path[data-state-id]').forEach((pathEl) => {
      const stateId = pathEl.getAttribute('data-state-id');
      if (!stateId) return;

      pathEl.addEventListener('mouseenter', (e) => {
        if (this.hoveredStateId !== stateId) {
          this.hoveredStateId = stateId;
          this.updateMapSvg(); // re-render paths to show thicker stroke
        }
        
        const data = ACCOMMODATION_DATA.find(d => d.code === stateId);
        if (data) {
          const ratio = Math.round((data.visitors * 1000000) / data.rooms);
          this.tooltip.innerHTML = `
            <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">${data.name}</div>
            <div style="font-size:0.7rem; color:#475569;">AOR: <strong>${data.aor}%</strong></div>
            <div style="font-size:0.7rem; color:#475569;">Ratio: <strong>${ratio.toLocaleString()}</strong> visitors/room</div>
          `;
          this.tooltip.style.display = 'block';
          this.updateTooltipPos(e as MouseEvent);
        }
      });

      pathEl.addEventListener('mousemove', (e) => this.updateTooltipPos(e as MouseEvent));
      
      pathEl.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent svgWrapper click
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
}
