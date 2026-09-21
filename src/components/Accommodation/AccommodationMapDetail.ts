import { ACCOMMODATION_DATA } from '../../data/accommodationData';

export class AccommodationMapDetail {
  public readonly element: HTMLElement;
  private hoveredStateId: string | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'acc-map-detail-panel';
    this.render();
  }

  public setHoveredState(stateId: string | null): void {
    if (this.hoveredStateId !== stateId) {
      this.hoveredStateId = stateId;
      this.render();
    }
  }

  private render(): void {
    this.element.innerHTML = '';

    let visitorsVal = 0; // in millions
    let roomsVal = 0;
    let label = 'National Totals';

    if (this.hoveredStateId) {
      const stateData = ACCOMMODATION_DATA.find(d => d.code === this.hoveredStateId);
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

    // We will render an SVG with a dual-axis vertical bar chart.
    // To do this simply in custom SVG, we normalize both bars to 100% of their respective maximums.
    
    // Find maximums for scaling. We want the bars to look good relative to their own scales.
    // For national, the values are the maximums.
    // For state, we scale relative to the highest state.
    const maxStateVisitors = Math.max(...ACCOMMODATION_DATA.map(d => d.visitors));
    const maxStateRooms = Math.max(...ACCOMMODATION_DATA.map(d => d.rooms));
    
    const scaleMaxVisitors = this.hoveredStateId ? maxStateVisitors : visitorsVal;
    const scaleMaxRooms = this.hoveredStateId ? maxStateRooms : roomsVal;

    // Normalizing heights based on 140px max height for a 200px tall SVG
    const heightVisitors = Math.max((visitorsVal / scaleMaxVisitors) * 140, 5);
    const heightRooms = Math.max((roomsVal / scaleMaxRooms) * 140, 5);

    this.element.innerHTML = `
      <div class="acc-detail-header">
        <h4 class="acc-detail-region">${label}</h4>
        <span class="acc-detail-sub">Hover map to view states</span>
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
  }
}
