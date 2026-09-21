import { MALAYSIA_GEO_DATA } from '../../data/malaysiaGeo';
import {
  SUSTAINABILITY_STATES_DATA,
  type PressureDimension,
} from '../../data/sustainabilityData';

export class PressureMapHero {
  public readonly element: HTMLElement;
  private currentDimension: PressureDimension = 'composite_pressure';
  private svgWrapper!: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'sus-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'map-floating-tooltip env-chart-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  private render(): void {
    this.element.innerHTML = '';

    // Header with Segmented Control
    const header = document.createElement('div');
    header.className = 'sus-card-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'sus-card-title-group';
    titleGroup.innerHTML = `
      <h3 class="sus-card-title">Malaysia Spatial Pressure Diagnostic Map</h3>
      <span class="sus-card-desc">Diverging Forest-Gold-Crimson carry capacity threshold index</span>
    `;

    const controls = document.createElement('div');
    controls.className = 'pressure-dim-controls';

    const dims: { id: PressureDimension; label: string }[] = [
      { id: 'composite_pressure', label: 'Composite Index' },
      { id: 'visitor_density', label: 'Visitor Density' },
      { id: 'accommodation_strain', label: 'Lodging Strain' },
      { id: 'seasonal_concentration', label: 'Seasonality' },
      { id: 'environmental_indicators', label: 'Environmental' },
    ];

    dims.forEach((d) => {
      const btn = document.createElement('button');
      btn.className = `pressure-dim-btn ${this.currentDimension === d.id ? 'active' : ''}`;
      btn.textContent = d.label;
      btn.addEventListener('click', () => {
        if (this.currentDimension !== d.id) {
          this.currentDimension = d.id;
          controls.querySelectorAll('.pressure-dim-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateMapSvg();
        }
      });
      controls.appendChild(btn);
    });

    header.appendChild(titleGroup);
    header.appendChild(controls);

    // Map Canvas
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'sus-map-canvas-wrap';

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.style.width = '100%';
    this.svgWrapper.style.height = '100%';
    this.updateMapSvg();

    canvasWrap.appendChild(this.svgWrapper);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'sus-map-legend';
    legend.innerHTML = `
      <div class="sus-legend-item">
        <span class="sus-legend-box headroom"></span>
        <span>Headroom (&lt;50)</span>
      </div>
      <div class="sus-legend-item">
        <span class="sus-legend-box strain"></span>
        <span>Emerging Strain (50–75)</span>
      </div>
      <div class="sus-legend-item">
        <span class="sus-legend-box critical"></span>
        <span>Critical Bottleneck (&gt;75)</span>
      </div>
    `;

    this.element.appendChild(header);
    this.element.appendChild(canvasWrap);
    this.element.appendChild(legend);
  }

  private updateMapSvg(): void {
    const paths = MALAYSIA_GEO_DATA.map((geo) => {
      const data = SUSTAINABILITY_STATES_DATA[geo.id];
      const metric = data ? data.dimensions[this.currentDimension] : null;
      const score = metric ? metric.score : 50;
      const fillColor = this.getColorForScore(score);

      return `
        <path
          d="${geo.svgPath}"
          id="sus-state-${geo.id}"
          data-state-id="${geo.id}"
          fill="${fillColor}"
          stroke="#ffffff"
          stroke-width="0.8"
          style="cursor: pointer; transition: fill 0.3s ease, filter 0.15s ease;"
        />
      `;
    }).join('');

    // Labels
    const labels = MALAYSIA_GEO_DATA.map((geo) => {
      const offset = geo.labelOffset || { x: 0, y: 0 };
      const lx = geo.centroid.x + offset.x;
      const ly = geo.centroid.y + offset.y;
      return `
        <text
          x="${lx}"
          y="${ly}"
          text-anchor="middle"
          font-size="8"
          font-weight="800"
          fill="#0f172a"
          style="pointer-events: none; text-shadow: 0 0 3px #ffffff, 0 0 3px #ffffff;"
        >${geo.code}</text>
      `;
    }).join('');

    this.svgWrapper.innerHTML = `
      <svg viewBox="0 0 1000 440" class="sus-map-svg">
        <g id="sus-states-group">${paths}</g>
        <g id="sus-labels-group">${labels}</g>
      </svg>
    `;

    // Attach listeners
    this.svgWrapper.querySelectorAll('path[data-state-id]').forEach((pathEl) => {
      const stateId = pathEl.getAttribute('data-state-id');
      if (!stateId) return;
      const data = SUSTAINABILITY_STATES_DATA[stateId];
      if (!data) return;

      pathEl.addEventListener('mouseenter', (e) => {
        (pathEl as SVGPathElement).style.filter = 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.3))';
        const metric = data.dimensions[this.currentDimension];
        const statusText = metric.status === 'critical' ? 'CRITICAL BOTTLENECK' : metric.status === 'strain' ? 'STRAIN WARNING' : 'HEALTHY HEADROOM';

        this.tooltip.innerHTML = `
          <div class="map-tooltip-header">
            <span class="map-tooltip-title">${data.name}</span>
            <span class="map-tooltip-quadrant ${metric.status}">${statusText}</span>
          </div>
          <div class="map-tooltip-body">
            <div class="map-tooltip-metric-row">
              <span>${this.getDimensionLabel(this.currentDimension)}:</span>
              <strong>${metric.value}</strong>
            </div>
            <div class="map-tooltip-metric-row">
              <span>Pressure Score:</span>
              <strong>${metric.score.toFixed(1)} / 100</strong>
            </div>
            <div class="map-tooltip-metric-row">
              <span>Threshold:</span>
              <strong>${metric.threshold}</strong>
            </div>
            <div class="map-tooltip-metric-row">
              <span>Trend:</span>
              <strong>${metric.trend.toUpperCase()}</strong>
            </div>
          </div>
          <div class="map-tooltip-footer">
            Click state to view detailed profile →
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e as MouseEvent);
      });

      pathEl.addEventListener('mousemove', (e) => this.updateTooltipPos(e as MouseEvent));
      pathEl.addEventListener('mouseleave', () => {
        (pathEl as SVGPathElement).style.filter = 'none';
        this.tooltip.style.display = 'none';
      });

      pathEl.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(stateId);
        }
      });
    });
  }

  private getColorForScore(score: number): string {
    if (score >= 75) {
      // Crimson
      return '#dc2626';
    } else if (score >= 50) {
      // Gold
      return '#f59e0b';
    } else {
      // Forest Green
      return '#10b981';
    }
  }

  private getDimensionLabel(dim: PressureDimension): string {
    switch (dim) {
      case 'visitor_density': return 'Visitor Density';
      case 'accommodation_strain': return 'Lodging Strain';
      case 'seasonal_concentration': return 'Seasonal Concentration';
      case 'environmental_indicators': return 'Environmental Footprint';
      default: return 'Composite Pressure Index';
    }
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
