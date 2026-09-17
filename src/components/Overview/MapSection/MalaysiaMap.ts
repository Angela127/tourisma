import { MALAYSIA_GEO_DATA } from '../../../data/malaysiaGeo';
import { STATES_DATA } from '../../../data/overviewData';
import { StateDetailDrawer } from '../../Common/StateDetailDrawer';

// Centroid lookup for tooltip positioning (in SVG viewBox 0 0 1000 440 space)
const STATE_CENTROIDS: Record<string, { x: number; y: number }> = {};
MALAYSIA_GEO_DATA.forEach((geo) => {
  STATE_CENTROIDS[geo.id] = { x: geo.centroid.x, y: geo.centroid.y };
});

export class MalaysiaMap {
  public readonly element: HTMLElement;
  private drawer: StateDetailDrawer;
  private tooltipElement: HTMLElement;
  private legendElement: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'malaysia-map-card';

    // Universal State Detail Drawer
    this.drawer = new StateDetailDrawer();
    document.body.appendChild(this.drawer.backdrop);
    document.body.appendChild(this.drawer.element);

    // Floating Tooltip
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'map-floating-tooltip';
    this.tooltipElement.style.display = 'none';

    // Card Header: Title + Subtitle on Left, North Compass on Right
    const mapHeader = document.createElement('div');
    mapHeader.className = 'map-card-header-clean';
    mapHeader.innerHTML = `
      <div class="map-title-left">
        <h3 class="map-main-title">MALAYSIA TOURISM READINESS</h3>
        <span class="map-sub-title">Click on a state to explore diagnostic details</span>
      </div>
      <div class="map-compass-icon" title="North orientation">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#93c5fd" stroke-width="1.2" />
          <polygon points="12 4 15 12 12 10 9 12" fill="#0b57d0" />
          <polygon points="12 20 15 12 12 14 9 12" fill="#cbd5e1" />
          <text x="12" y="3.2" font-size="5" font-weight="900" fill="#0b57d0" text-anchor="middle">N</text>
        </svg>
      </div>
    `;

    // Map Stage Container
    const mapStage = document.createElement('div');
    mapStage.className = 'map-stage-container';

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'svg-map-wrapper';
    svgWrapper.innerHTML = this.renderMapSvg();

    // Bottom 5-Step Legend Bar
    this.legendElement = document.createElement('div');
    this.legendElement.className = 'map-legend-step-bar';
    this.legendElement.innerHTML = `
      <span class="legend-label-readiness">Readiness / pressure</span>
      <div class="legend-scale-row">
        <span class="legend-scale-text">Low</span>
        <div class="legend-step-blocks">
          <span class="step-block" style="background:#bfdbfe;" title="Low (&lt;55)"></span>
          <span class="step-block" style="background:#93c5fd;" title="Moderate-Low (55-64)"></span>
          <span class="step-block" style="background:#60a5fa;" title="Moderate (65-74)"></span>
          <span class="step-block" style="background:#2563eb;" title="High (75-84)"></span>
          <span class="step-block" style="background:#1d4ed8;" title="Very High (85+)"></span>
        </div>
        <span class="legend-scale-text">High</span>
      </div>
    `;

    mapStage.appendChild(svgWrapper);
    mapStage.appendChild(this.legendElement);
    mapStage.appendChild(this.tooltipElement);

    this.element.appendChild(mapHeader);
    this.element.appendChild(mapStage);

    this.attachSvgEventListeners();
  }

  private getColorForScore(score: number): string {
    if (score >= 85) return '#1d4ed8';
    if (score >= 75) return '#2563eb';
    if (score >= 65) return '#60a5fa';
    if (score >= 55) return '#93c5fd';
    return '#bfdbfe';
  }

  private renderMapSvg(): string {
    const pathsSvg = MALAYSIA_GEO_DATA.map((geo) => {
      const data = STATES_DATA[geo.id];
      const score = data ? data.readinessScore : 70;
      const fill = this.getColorForScore(score);

      return `
        <path
          id="state-path-${geo.id}"
          class="state-map-path"
          data-state-id="${geo.id}"
          d="${geo.svgPath}"
          fill="${fill}"
          stroke="#ffffff"
          stroke-width="1.1"
          stroke-linejoin="round"
          style="cursor: pointer; transition: fill 0.2s ease, filter 0.2s ease, stroke-width 0.2s ease;"
        />
      `;
    }).join('');

    // State labels positioned inside their landmass
    const keyLabels = [
      { id: 'perlis', name: 'Perlis', x: 45, y: 78 },
      { id: 'kedah', name: 'Kedah', x: 65, y: 110 },
      { id: 'penang', name: 'Penang', x: 26, y: 138 },
      { id: 'perak', name: 'Perak', x: 88, y: 180 },
      { id: 'kelantan', name: 'Kelantan', x: 136, y: 145 },
      { id: 'terengganu', name: 'Terengganu', x: 190, y: 175 },
      { id: 'pahang', name: 'Pahang', x: 165, y: 255 },
      { id: 'selangor', name: 'Selangor', x: 68, y: 275 },
      { id: 'kuala_lumpur', name: 'KL', x: 95, y: 290 },
      { id: 'negeri_sembilan', name: 'N. Sembilan', x: 98, y: 320 },
      { id: 'melaka', name: 'Melaka', x: 130, y: 350 },
      { id: 'johor', name: 'Johor', x: 195, y: 355 },
      { id: 'sarawak', name: 'Sarawak', x: 674, y: 340 },
      { id: 'sabah', name: 'Sabah', x: 840, y: 160 },
    ];

    const labelsSvg = keyLabels
      .map(
        (lbl) => `
      <text
        x="${lbl.x}"
        y="${lbl.y}"
        class="map-state-label-text"
        font-size="9.5"
        font-weight="750"
        fill="#0f172a"
        text-anchor="middle"
        style="pointer-events: none; paint-order: stroke; stroke: #ffffff; stroke-width: 3px; stroke-linejoin: round;"
      >
        ${lbl.name}
      </text>
    `
      )
      .join('');

    return `
      <svg
        viewBox="0 0 1000 440"
        preserveAspectRatio="xMidYMid meet"
        class="main-malaysia-svg"
      >
        <g class="paths-group">${pathsSvg}</g>
        <g class="labels-group">${labelsSvg}</g>
      </svg>
    `;
  }

  /** Convert an SVG-space point (in viewBox coords) to pixel position relative to mapStage */
  private svgPointToPixel(svgX: number, svgY: number): { px: number; py: number } {
    const svg = this.element.querySelector<SVGSVGElement>('.main-malaysia-svg');
    if (!svg) return { px: 0, py: 0 };

    const pt = svg.createSVGPoint();
    pt.x = svgX;
    pt.y = svgY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return { px: 0, py: 0 };

    const screenPt = pt.matrixTransform(ctm);

    // Convert screen coords to position relative to map-stage-container
    const stageEl = this.element.querySelector<HTMLElement>('.map-stage-container');
    if (!stageEl) return { px: 0, py: 0 };
    const stageRect = stageEl.getBoundingClientRect();

    return {
      px: screenPt.x - stageRect.left,
      py: screenPt.y - stageRect.top,
    };
  }

  private attachSvgEventListeners(): void {
    const paths = this.element.querySelectorAll<SVGPathElement>('.state-map-path');

    paths.forEach((path) => {
      const stateId = path.getAttribute('data-state-id');
      if (!stateId) return;

      path.addEventListener('mouseenter', () => {
        path.style.filter = 'brightness(1.15) drop-shadow(0 3px 8px rgba(11, 87, 208, 0.4))';
        path.style.strokeWidth = '1.8';
        this.showTooltip(stateId);
      });

      path.addEventListener('mouseleave', () => {
        path.style.filter = 'none';
        path.style.strokeWidth = '1.1';
        this.hideTooltip();
      });

      path.addEventListener('click', () => {
        this.drawer.open(stateId);
      });
    });
  }

  private showTooltip(stateId: string): void {
    const data = STATES_DATA[stateId];
    if (!data) return;

    this.tooltipElement.innerHTML = `
      <div style="font-weight:800; font-size:0.78rem; color:#0f172a; margin-bottom:3px; display:flex; align-items:center; gap:6px;">
        <span>${data.name}</span>
        <span style="font-size:0.62rem; font-weight:700; padding:1px 5px; border-radius:4px; background:#eff6ff; color:#1d4ed8;">${data.cluster}</span>
      </div>
      <div style="font-size:0.7rem; color:#475569; display:flex; justify-content:space-between; gap:12px; margin-bottom:2px;">
        <span>Readiness Score:</span>
        <strong style="color:#0f172a;">${data.readinessScore} / 100</strong>
      </div>
      <div style="font-size:0.7rem; color:#475569; display:flex; justify-content:space-between; gap:12px; margin-bottom:2px;">
        <span>Annual Visitors:</span>
        <strong style="color:#0f172a;">${data.visitorsTotal}M</strong>
      </div>
      <div style="font-size:0.7rem; color:#475569; display:flex; justify-content:space-between; gap:12px; margin-bottom:4px;">
        <span>Tourism Receipts:</span>
        <strong style="color:#0f172a;">RM${data.receipts}B</strong>
      </div>
      <div style="font-size:0.64rem; color:#0b57d0; font-weight:750; border-top:1px solid #e2e8f0; padding-top:3px; margin-top:2px;">
        👆 Click to open State Diagnostic →
      </div>
    `;

    // Position tooltip anchored near the state's centroid
    const centroid = STATE_CENTROIDS[stateId];
    if (centroid) {
      const { px, py } = this.svgPointToPixel(centroid.x, centroid.y);

      // Offset slightly so the tooltip doesn't cover the state center
      const tooltipW = 200;
      const stageEl = this.element.querySelector<HTMLElement>('.map-stage-container');
      const stageW = stageEl ? stageEl.clientWidth : 500;

      // If centroid is on the right half, show tooltip to the left; otherwise to the right
      const xOffset = px > stageW * 0.6 ? -(tooltipW + 10) : 14;

      this.tooltipElement.style.left = `${px + xOffset}px`;
      this.tooltipElement.style.top = `${py - 40}px`;
    }

    this.tooltipElement.style.display = 'block';
  }

  private hideTooltip(): void {
    this.tooltipElement.style.display = 'none';
  }
}
