import { ACCOMMODATION_DATA } from '../../data/accommodationData';

export class AccommodationMapDetail {
  public readonly element: HTMLElement;
  private selectedStateId: string | null = null;
  private onResetCallback?: () => void;

  constructor(onReset?: () => void) {
    this.onResetCallback = onReset;
    this.element = document.createElement('div');
    this.element.className = 'asset-card acc-map-detail-panel';
    this.render();
  }

  public setSelectedState(stateId: string | null): void {
    if (this.selectedStateId !== stateId) {
      this.selectedStateId = stateId;
      this.render();
    }
  }

  // Backward compatibility alias
  public setHoveredState(stateId: string | null): void {
    this.setSelectedState(stateId);
  }

  private render(): void {
    this.element.innerHTML = '';

    let visitorsVal = 0; // in millions
    let roomsVal = 0;
    let label = 'National Totals';

    if (this.selectedStateId) {
      const stateData = ACCOMMODATION_DATA.find((d) => d.code === this.selectedStateId);
      if (stateData) {
        visitorsVal = stateData.visitors;
        roomsVal = stateData.rooms;
        label = stateData.name;
      }
    } else {
      // Calculate National Totals
      visitorsVal = ACCOMMODATION_DATA.reduce((sum, d) => sum + d.visitors, 0);
      roomsVal = ACCOMMODATION_DATA.reduce((sum, d) => sum + d.rooms, 0);
    }

    const visitorsTotal = visitorsVal * 1000000;
    const ratio = roomsVal > 0 ? Math.round(visitorsTotal / roomsVal) : 0;

    const maxStateVisitors = Math.max(...ACCOMMODATION_DATA.map((d) => d.visitors));
    const maxStateRooms = Math.max(...ACCOMMODATION_DATA.map((d) => d.rooms));

    const scaleMaxVisitors = this.selectedStateId ? maxStateVisitors : visitorsVal;
    const scaleMaxRooms = this.selectedStateId ? maxStateRooms : roomsVal;

    // Normalizing heights based on 130px max height for a 220px tall SVG
    const heightVisitors = Math.max((visitorsVal / scaleMaxVisitors) * 130, 8);
    const heightRooms = Math.max((roomsVal / scaleMaxRooms) * 130, 8);

    this.element.innerHTML = `
      <div class="asset-card-header" style="margin-bottom: 10px; display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
        <div class="asset-card-title-group" style="flex: 1; min-width: 0;">
          <div class="asset-card-badge">
            <span class="asset-badge-dot" style="background-color: #059669;"></span>
            <span>CAPACITY PRESSURE</span>
          </div>
          <h3 class="asset-card-title">${label}</h3>
          <p class="asset-card-subtitle">${this.selectedStateId ? 'State-level demand vs available capacity' : 'Click a state on the map to inspect details'}</p>
        </div>
        ${this.selectedStateId ? `
          <button type="button" class="asset-reset-scope-btn" title="Reset to National Totals" style="padding: 4px 8px; font-size: 11px; font-weight: 600; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s ease;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>All States</span>
          </button>
        ` : ''}
      </div>

      <div class="acc-detail-kpi">
        <span class="acc-kpi-val">${ratio.toLocaleString()}</span>
        <span class="acc-kpi-lbl">VISITORS PER ROOM</span>
      </div>

      <div class="acc-detail-chart">
        <div class="acc-chart-title">Demand vs Capacity Volume</div>
        <div class="acc-chart-svg-wrap">
          <svg width="100%" height="220" viewBox="0 0 200 220">
            <!-- Visitors Bar (Left) -->
            <rect x="45" y="${180 - heightVisitors}" width="46" height="${heightVisitors}" fill="url(#visitorGrad)" rx="6" ry="6" />
            
            <!-- Rooms Bar (Right) -->
            <rect x="109" y="${180 - heightRooms}" width="46" height="${heightRooms}" fill="url(#roomGrad)" rx="6" ry="6" />

            <!-- Labels Bottom -->
            <text x="68" y="200" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">Visitors</text>
            <text x="132" y="200" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">Rooms</text>

            <!-- Value Labels on top of bars -->
            <text x="68" y="${172 - heightVisitors}" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">${visitorsVal.toFixed(1)}M</text>
            <text x="132" y="${172 - heightRooms}" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">${(roomsVal / 1000).toFixed(1)}k</text>

            <defs>
              <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#2563eb" />
              </linearGradient>
              <linearGradient id="roomGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="acc-chart-legend">
          <div class="acc-chart-legend-item">
            <span style="background:#3b82f6; width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
            Left Axis: Quantity (M)
          </div>
          <div class="acc-chart-legend-item">
            <span style="background:#10b981; width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
            Right Axis: Quantity (000s)
          </div>
        </div>
      </div>
    `;

    const resetBtn = this.element.querySelector<HTMLButtonElement>('.asset-reset-scope-btn');
    resetBtn?.addEventListener('click', () => {
      this.setSelectedState(null);
      if (this.onResetCallback) {
        this.onResetCallback();
      }
    });
  }
}
