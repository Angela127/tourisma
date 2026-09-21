import { MALAYSIA_GEO_DATA } from '../../data/malaysiaGeo';
import {
  getAllStateHealthcare,
  getStateHealthcare,
} from '../../data/healthcareData';

export class HealthcareMapCard {
  public readonly element: HTMLElement;
  private selectedStateId: string | null = null;
  private showAssets: boolean = true;
  private showFacilities: boolean = true;
  private showRadius: boolean = true;
  private svgWrapper!: HTMLElement;
  private svgElement!: SVGSVGElement;
  private tooltip!: HTMLElement;
  private stateSelectEl!: HTMLSelectElement;
  private onSelectStateCallback?: (stateId: string | null) => void;

  // ViewBox animation state for smooth camera fly-in / zoom
  private currentViewBox: [number, number, number, number] = [0, 0, 1000, 440];
  private animFrameId: number | null = null;

  constructor(onSelectState?: (stateId: string | null) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'hc-card hc-map-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'hc-floating-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);

    this.element.addEventListener('mouseleave', () => this.hideTooltip());
  }

  public hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  public setSelectedState(stateId: string | null): void {
    const prev = this.selectedStateId;
    this.selectedStateId = stateId;
    if (this.stateSelectEl) {
      this.stateSelectEl.value = stateId || 'malaysia';
    }
    this.hideTooltip();

    if (prev !== stateId) {
      this.updateMapSvg();
      this.zoomToTargetState();
    }
    this.updateStateStats();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Card Header
    const header = document.createElement('div');
    header.className = 'hc-card-header hc-map-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'hc-title-group';
    titleGroup.innerHTML = `
      <div class="hc-badge-header">
        <span class="hc-badge-dot"></span>
        <span>SPATIAL CONGRUENCE MAP</span>
      </div>
      <h3 class="hc-card-title">Tourism & Healthcare Access Map</h3>
      <span class="hc-card-desc">Geospatial proximity from destinations to nearest medical care</span>
    `;

    // Map Controls: State Dropdown + Layer Toggles
    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'hc-map-controls-wrap';

    // State Selector Dropdown
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'hc-select-wrapper';

    this.stateSelectEl = document.createElement('select');
    this.stateSelectEl.className = 'hc-state-select';
    this.stateSelectEl.id = 'hc-state-select-dropdown';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'malaysia';
    defaultOpt.textContent = '🇲🇾 Malaysia (Overview)';
    this.stateSelectEl.appendChild(defaultOpt);

    const states = getAllStateHealthcare().sort((a, b) => a.stateName.localeCompare(b.stateName));
    states.forEach((st) => {
      const opt = document.createElement('option');
      opt.value = st.stateId;
      opt.textContent = `${st.stateName} (${st.code})`;
      this.stateSelectEl.appendChild(opt);
    });

    this.stateSelectEl.addEventListener('change', () => {
      const val = this.stateSelectEl.value;
      const targetState = val === 'malaysia' ? null : val;
      if (this.onSelectStateCallback) {
        this.onSelectStateCallback(targetState);
      } else {
        this.setSelectedState(targetState);
      }
    });

    selectWrapper.appendChild(this.stateSelectEl);

    // Layer toggles (clean previous pill design)
    const layerGroup = document.createElement('div');
    layerGroup.className = 'hc-layer-toggles';

    // 1. Assets Toggle
    const assetBtn = document.createElement('button');
    assetBtn.type = 'button';
    assetBtn.className = `hc-layer-btn ${this.showAssets ? 'active' : ''}`;
    assetBtn.innerHTML = `<span class="hc-btn-dot dot-asset"></span> Assets`;
    assetBtn.title = 'Toggle tourism asset points';
    assetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showAssets = !this.showAssets;
      assetBtn.classList.toggle('active', this.showAssets);
      this.updateLayerVisibility();
    });

    // 2. Facilities Toggle
    const facBtn = document.createElement('button');
    facBtn.type = 'button';
    facBtn.className = `hc-layer-btn ${this.showFacilities ? 'active' : ''}`;
    facBtn.innerHTML = `<span class="hc-btn-dot dot-facility"></span> Facilities`;
    facBtn.title = 'Toggle healthcare facilities (hospitals & clinics)';
    facBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showFacilities = !this.showFacilities;
      facBtn.classList.toggle('active', this.showFacilities);
      this.updateLayerVisibility();
    });

    // 3. 5km Radius Buffer
    const radiusBtn = document.createElement('button');
    radiusBtn.type = 'button';
    radiusBtn.className = `hc-layer-btn ${this.showRadius ? 'active' : ''}`;
    radiusBtn.innerHTML = `<span class="hc-btn-dot dot-buffer"></span> 5km Radius`;
    radiusBtn.title = 'Toggle 5km emergency & primary care catchment buffer';
    radiusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showRadius = !this.showRadius;
      radiusBtn.classList.toggle('active', this.showRadius);
      this.updateLayerVisibility();
    });

    layerGroup.appendChild(assetBtn);
    layerGroup.appendChild(facBtn);
    layerGroup.appendChild(radiusBtn);

    controlsWrap.appendChild(selectWrapper);
    controlsWrap.appendChild(layerGroup);

    header.appendChild(titleGroup);
    header.appendChild(controlsWrap);

    // Canvas Wrap
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'hc-map-canvas-wrap';

    this.svgWrapper = document.createElement('div');
    this.svgWrapper.className = 'hc-svg-container';
    canvasWrap.appendChild(this.svgWrapper);

    // State stats footer strip
    const statsStrip = document.createElement('div');
    statsStrip.className = 'hc-map-stats-strip';
    statsStrip.id = 'hc-map-stats-strip';

    this.element.appendChild(header);
    this.element.appendChild(canvasWrap);
    this.element.appendChild(statsStrip);

    this.updateMapSvg();
    this.updateStateStats();
  }

  private updateLayerVisibility(): void {
    const buffersLayer = this.svgWrapper.querySelector<SVGGElement>('#hc-buffers-layer');
    const facilitiesLayer = this.svgWrapper.querySelector<SVGGElement>('#hc-facilities-layer');
    const assetsLayer = this.svgWrapper.querySelector<SVGGElement>('#hc-assets-layer');

    if (buffersLayer) {
      buffersLayer.classList.toggle('layer-hidden', !this.showRadius);
      buffersLayer.classList.toggle('layer-visible', this.showRadius);
    }
    if (facilitiesLayer) {
      facilitiesLayer.classList.toggle('layer-hidden', !this.showFacilities);
      facilitiesLayer.classList.toggle('layer-visible', this.showFacilities);
    }
    if (assetsLayer) {
      assetsLayer.classList.toggle('layer-hidden', !this.showAssets);
      assetsLayer.classList.toggle('layer-visible', this.showAssets);
    }
  }

  private zoomToTargetState(): void {
    const isStateMode = !!this.selectedStateId;
    const currentState = isStateMode ? getStateHealthcare(this.selectedStateId!) : undefined;

    let target: [number, number, number, number] = [0, 0, 1000, 440];
    if (isStateMode && currentState) {
      const [bx1, by1, bx2, by2] = currentState.bbox;
      const w = Math.max(30, bx2 - bx1);
      const h = Math.max(30, by2 - by1);
      const padX = w * 0.16;
      const padY = h * 0.16;
      const vx = Math.max(0, bx1 - padX);
      const vy = Math.max(0, by1 - padY);
      const vw = w + 2 * padX;
      const vh = h + 2 * padY;
      target = [vx, vy, vw, vh];
    }

    this.animateViewBox(target, 450);
  }

  private animateViewBox(target: [number, number, number, number], duration: number): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const start = [...this.currentViewBox] as [number, number, number, number];
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // EaseInOutCubic
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const curX = start[0] + (target[0] - start[0]) * ease;
      const curY = start[1] + (target[1] - start[1]) * ease;
      const curW = start[2] + (target[2] - start[2]) * ease;
      const curH = start[3] + (target[3] - start[3]) * ease;

      this.currentViewBox = [curX, curY, curW, curH];
      if (this.svgElement) {
        this.svgElement.setAttribute(
          'viewBox',
          `${curX.toFixed(2)} ${curY.toFixed(2)} ${curW.toFixed(2)} ${curH.toFixed(2)}`
        );
      }

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.currentViewBox = target;
        this.animFrameId = null;
      }
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  private updateStateStats(): void {
    const strip = this.element.querySelector('#hc-map-stats-strip');
    if (!strip) return;

    if (this.selectedStateId) {
      const st = getStateHealthcare(this.selectedStateId);
      if (st) {
        strip.innerHTML = `
          <div class="hc-stats-left">
            <div class="hc-strip-stat">
              <span class="hc-stat-k">State:</span>
              <strong class="hc-stat-v">${st.stateName}</strong>
            </div>
            <div class="hc-strip-stat">
              <span class="hc-stat-k">Assets:</span>
              <strong class="hc-stat-v">${st.coreTourismAssets}</strong>
            </div>
            <div class="hc-strip-stat">
              <span class="hc-stat-k">Facilities:</span>
              <strong class="hc-stat-v">${st.totalFacilities}</strong>
            </div>
            <div class="hc-strip-stat">
              <span class="hc-stat-k">5km Access:</span>
              <strong class="hc-stat-v" style="color:#059669;">${st.healthcareAccessRate5km}%</strong>
            </div>
          </div>
          <button type="button" class="hc-reset-btn" id="hc-reset-map-zoom" title="Return to Malaysia national map">
            ✕ Reset Map
          </button>
        `;

        strip.querySelector('#hc-reset-map-zoom')?.addEventListener('click', () => {
          if (this.onSelectStateCallback) {
            this.onSelectStateCallback(null);
          } else {
            this.setSelectedState(null);
          }
        });
        return;
      }
    }

    // National default
    strip.innerHTML = `
      <div class="hc-stats-left">
        <div class="hc-strip-stat">
          <span class="hc-stat-k">National Scope:</span>
          <strong class="hc-stat-v">16 States & FTs</strong>
        </div>
        <div class="hc-strip-stat">
          <span class="hc-stat-k">Screened Assets:</span>
          <strong class="hc-stat-v">5,491</strong>
        </div>
        <div class="hc-strip-stat">
          <span class="hc-stat-k">Facilities:</span>
          <strong class="hc-stat-v">4,749</strong>
        </div>
        <div class="hc-strip-stat">
          <span class="hc-stat-k">Catchment:</span>
          <strong class="hc-stat-v" style="color:#0284c7;">75.1% within 5km</strong>
        </div>
      </div>
      <span class="hc-strip-hint">Click a state on the map or choose from dropdown to zoom</span>
    `;
  }

  private updateMapSvg(): void {
    const isStateMode = !!this.selectedStateId;
    const currentState = isStateMode ? getStateHealthcare(this.selectedStateId!) : undefined;

    // Render State Polygons
    const paths = MALAYSIA_GEO_DATA.map((geo) => {
      const stData = getStateHealthcare(geo.id);
      const isSelected = this.selectedStateId === geo.id;
      const isOtherStateInZoom = isStateMode && !isSelected;

      // Color coding for national overview
      let fillColor = '#f8fafc';
      if (stData) {
        if (isSelected) {
          fillColor = '#eff6ff';
        } else if (isOtherStateInZoom) {
          fillColor = '#f1f5f9';
        } else {
          const rate = stData.healthcareAccessRate5km;
          if (rate >= 90) fillColor = '#dcfce7';
          else if (rate >= 75) fillColor = '#ecfdf5';
          else if (rate >= 50) fillColor = '#fef3c7';
          else fillColor = '#fee2e2';
        }
      }

      const strokeColor = isSelected ? '#1d4ed8' : isOtherStateInZoom ? '#cbd5e1' : '#64748b';
      const strokeWidth = isSelected ? (isStateMode ? '1.2' : '1.8') : isStateMode ? '0.4' : '0.7';
      const opacity = isOtherStateInZoom ? '0.35' : '1.0';

      return `
        <path
          d="${geo.svgPath}"
          id="hc-path-${geo.id}"
          data-state-id="${geo.id}"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          opacity="${opacity}"
          style="cursor: pointer; transition: all 0.25s ease;"
        />
      `;
    }).join('');

    // State Centroid Labels (shown in national view)
    let labels = '';
    if (!isStateMode) {
      labels = MALAYSIA_GEO_DATA.map((geo) => {
        const offset = geo.labelOffset || { x: 0, y: 0 };
        const lx = geo.centroid.x + offset.x;
        const ly = geo.centroid.y + offset.y;
        return `
          <text
            x="${lx}"
            y="${ly}"
            text-anchor="middle"
            font-size="8"
            font-weight="700"
            fill="#334155"
            style="pointer-events: none; text-shadow: 0 0 3px #ffffff, 0 0 3px #ffffff;"
          >${geo.code}</text>
        `;
      }).join('');
    }

    // Markers: Buffers, Facilities, Assets
    let buffersSvg = '';
    let facilitiesSvg = '';
    let assetsSvg = '';

    const targetStates = isStateMode && currentState ? [currentState] : getAllStateHealthcare();

    targetStates.forEach((st) => {
      // 1. Buffers (5km service radius)
      const radiusUnits = isStateMode ? 2.6 : 2.0;
      const facsToBuffer = isStateMode ? st.facilities : st.facilities.filter((f) => f.type === 'Hospital');

      facsToBuffer.forEach((f) => {
        buffersSvg += `
          <circle
            cx="${f.x}"
            cy="${f.y}"
            r="${radiusUnits}"
            class="hc-buffer-circle"
            fill="rgba(59, 130, 246, 0.14)"
            stroke="#3b82f6"
            stroke-width="0.35"
            stroke-dasharray="0.8, 0.4"
            style="pointer-events: none;"
          />
        `;
      });

      // 2. Facilities
      const facsToRender = isStateMode ? st.facilities : st.facilities.filter((f) => f.type === 'Hospital');
      const facSize = isStateMode ? 1.4 : 1.7;

      facsToRender.forEach((f) => {
        const isHosp = f.type === 'Hospital';
        const fill = isHosp ? '#ef4444' : '#0284c7';
        facilitiesSvg += `
          <circle
            cx="${f.x}"
            cy="${f.y}"
            r="${facSize}"
            fill="${fill}"
            stroke="#ffffff"
            stroke-width="0.35"
            class="hc-facility-dot"
            data-name="${escapeXml(f.name)}"
            data-type="${f.type}"
            data-lat="${f.lat}"
            data-lon="${f.lon}"
            style="cursor: pointer; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));"
          />
        `;
      });

      // 3. Tourism Assets
      const assetsToRender = isStateMode
        ? st.assets
        : st.assets.filter((_, idx) => idx % 4 === 0);
      const assetSize = isStateMode ? 1.0 : 1.1;

      assetsToRender.forEach((a) => {
        const isHigh = a.distKm <= 2.0;
        const isMod = a.distKm > 2.0 && a.distKm <= 5.0;
        const fill = isHigh ? '#10b981' : isMod ? '#f59e0b' : '#64748b';

        assetsSvg += `
          <circle
            cx="${a.x}"
            cy="${a.y}"
            r="${assetSize}"
            fill="${fill}"
            stroke="#ffffff"
            stroke-width="0.25"
            class="hc-asset-dot"
            data-name="${escapeXml(a.name)}"
            data-cat="${escapeXml(a.category)}"
            data-fac="${escapeXml(a.nearestFacility)}"
            data-dist="${a.distKm}"
            data-tier="${a.tier}"
            style="cursor: pointer; opacity: 0.95;"
          />
        `;
      });
    });

    const vb = `${this.currentViewBox[0].toFixed(2)} ${this.currentViewBox[1].toFixed(2)} ${this.currentViewBox[2].toFixed(2)} ${this.currentViewBox[3].toFixed(2)}`;

    this.svgWrapper.innerHTML = `
      <svg viewBox="${vb}" class="hc-map-svg">
        <rect x="-3000" y="-3000" width="8000" height="8000" fill="rgba(255, 255, 255, 0.001)" id="hc-map-blank-bg" pointer-events="all" style="cursor: ${isStateMode ? 'pointer' : 'default'};" />
        <g id="hc-states-layer">${paths}</g>
        <g id="hc-labels-layer">${labels}</g>
        <g id="hc-buffers-layer" class="hc-animated-layer ${this.showRadius ? 'layer-visible' : 'layer-hidden'}">${buffersSvg}</g>
        <g id="hc-facilities-layer" class="hc-animated-layer ${this.showFacilities ? 'layer-visible' : 'layer-hidden'}">${facilitiesSvg}</g>
        <g id="hc-assets-layer" class="hc-animated-layer ${this.showAssets ? 'layer-visible' : 'layer-hidden'}">${assetsSvg}</g>
      </svg>
    `;

    this.svgElement = this.svgWrapper.querySelector('svg')!;

    // Helper to zoom back out to whole map
    const resetToWholeMap = () => {
      if (this.selectedStateId !== null) {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(null);
        } else {
          this.setSelectedState(null);
        }
      }
    };

    // 1. Blank space click on map background rect
    this.svgWrapper.querySelector('#hc-map-blank-bg')?.addEventListener('click', (e) => {
      e.stopPropagation();
      resetToWholeMap();
    });

    // 2. Blank space click anywhere inside SVG that isn't a state path or marker
    this.svgElement.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | SVGElement | null;
      if (!target) return;
      if (
        target.closest('[data-state-id]') ||
        target.closest('.hc-facility-dot') ||
        target.closest('.hc-asset-dot')
      ) {
        return;
      }
      resetToWholeMap();
    });

    // 3. Also clicking blank area of container resets map
    const canvasWrap = this.element.querySelector('.hc-map-canvas-wrap');
    canvasWrap?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | SVGElement | null;
      if (!target) return;
      if (
        target.closest('[data-state-id]') ||
        target.closest('.hc-facility-dot') ||
        target.closest('.hc-asset-dot') ||
        target.closest('.hc-layer-toggles') ||
        target.closest('.hc-select-wrapper')
      ) {
        return;
      }
      resetToWholeMap();
    });

    // Hook state path clicks
    this.svgWrapper.querySelectorAll<SVGPathElement>('#hc-states-layer path').forEach((path) => {
      const stateId = path.getAttribute('data-state-id');
      if (stateId) {
        path.addEventListener('click', (e) => {
          e.stopPropagation();
          const nextState = stateId === this.selectedStateId ? null : stateId;
          if (this.onSelectStateCallback) {
            this.onSelectStateCallback(nextState);
          } else {
            this.setSelectedState(nextState);
          }
        });
      }
    });

    this.attachMarkerTooltips();
  }

  private attachMarkerTooltips(): void {
    this.svgWrapper.querySelectorAll<SVGCircleElement>('.hc-facility-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => e.stopPropagation());
      dot.addEventListener('mouseenter', (e) => {
        const name = dot.getAttribute('data-name') || 'Healthcare Facility';
        const type = dot.getAttribute('data-type') || 'Facility';
        const lat = dot.getAttribute('data-lat') || '';
        const lon = dot.getAttribute('data-lon') || '';

        this.tooltip.innerHTML = `
          <div class="hc-tt-header">
            <strong>${name}</strong>
            <span class="hc-tt-badge" style="background:${type === 'Hospital' ? '#fee2e2' : '#e0f2fe'}; color:${type === 'Hospital' ? '#dc2626' : '#0369a1'};">${type}</span>
          </div>
          <div class="hc-tt-body">
            <div class="hc-tt-row">
              <span>Service Type:</span>
              <strong>${type === 'Hospital' ? 'Hospital & Emergency Care' : 'Outpatient Clinic & Primary Care'}</strong>
            </div>
            <div class="hc-tt-row">
              <span>GPS:</span>
              <span style="font-size:11px; color:#64748b;">${lat}, ${lon}</span>
            </div>
            <div class="hc-tt-row">
              <span>Catchment:</span>
              <span style="font-size:11px; color:#2563eb; font-weight:600;">5.0 km primary response buffer</span>
            </div>
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.positionTooltip(e);
      });

      dot.addEventListener('mousemove', (e) => this.positionTooltip(e));
      dot.addEventListener('mouseleave', () => this.hideTooltip());
    });

    this.svgWrapper.querySelectorAll<SVGCircleElement>('.hc-asset-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => e.stopPropagation());
      dot.addEventListener('mouseenter', (e) => {
        const name = dot.getAttribute('data-name') || 'Tourism Destination';
        const cat = dot.getAttribute('data-cat') || 'Tourism Asset';
        const fac = dot.getAttribute('data-fac') || 'Medical Center';
        const dist = dot.getAttribute('data-dist') || '0';
        const tier = dot.getAttribute('data-tier') || 'Access';

        const tierColor = tier.includes('High') ? '#10b981' : tier.includes('Moderate') ? '#f59e0b' : '#ef4444';

        this.tooltip.innerHTML = `
          <div class="hc-tt-header">
            <strong>${name}</strong>
            <span class="hc-tt-badge" style="background:#f1f5f9; color:#334155;">${cat}</span>
          </div>
          <div class="hc-tt-body">
            <div class="hc-tt-row">
              <span>Nearest Facility:</span>
              <strong>${fac}</strong>
            </div>
            <div class="hc-tt-row">
              <span>Distance:</span>
              <strong style="color: ${tierColor}; font-size:13px;">${dist} km</strong>
            </div>
            <div class="hc-tt-row">
              <span>Access Tier:</span>
              <span style="font-weight:700; color:${tierColor};">${tier}</span>
            </div>
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.positionTooltip(e);
      });

      dot.addEventListener('mousemove', (e) => this.positionTooltip(e));
      dot.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  private positionTooltip(e: MouseEvent): void {
    if (!this.tooltip) return;
    const x = e.clientX + 14;
    const y = e.clientY + 14;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
