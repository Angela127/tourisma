import { AccommodationMap } from './AccommodationMap';
import { AccommodationMapDetail } from './AccommodationMapDetail';

export class AccommodationMapSection {
  public readonly element: HTMLElement;
  private map: AccommodationMap;
  private detail: AccommodationMapDetail;
  private activeToggle: 'aor' | 'ratio' = 'aor';

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accommodation-map-section';

    this.detail = new AccommodationMapDetail();
    this.map = new AccommodationMap((stateId) => {
      this.detail.setHoveredState(stateId);
    });

    this.render();
  }

  private render(): void {
    // Header with toggles
    const header = document.createElement('div');
    header.className = 'acc-map-header';
    header.innerHTML = `
      <div class="acc-map-title-group">
        <h3 class="acc-map-title">Accommodation Capacity & Utilisation Map</h3>
        <span class="acc-map-desc">Geospatial distribution of available inventory and resulting demand pressure.</span>
      </div>
      <div class="acc-map-toggles">
        <button class="acc-map-btn ${this.activeToggle === 'aor' ? 'active' : ''}" data-toggle="aor">Average Occupancy Rate</button>
        <button class="acc-map-btn ${this.activeToggle === 'ratio' ? 'active' : ''}" data-toggle="ratio">Visitor-to-Room Ratio</button>
      </div>
    `;

    header.querySelectorAll('.acc-map-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const toggle = target.getAttribute('data-toggle') as 'aor' | 'ratio';
        if (this.activeToggle !== toggle) {
          this.activeToggle = toggle;
          header.querySelectorAll('.acc-map-btn').forEach(b => b.classList.remove('active'));
          target.classList.add('active');
          this.map.setToggle(this.activeToggle);
        }
      });
    });

    // Content Grid
    const content = document.createElement('div');
    content.className = 'acc-map-content';
    
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'acc-map-wrapper';
    mapWrapper.appendChild(this.map.element);

    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'acc-detail-wrapper';
    detailWrapper.appendChild(this.detail.element);

    content.appendChild(mapWrapper);
    content.appendChild(detailWrapper);

    this.element.appendChild(header);
    this.element.appendChild(content);
  }
}
