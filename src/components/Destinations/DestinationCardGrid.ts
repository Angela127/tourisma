import { DESTINATIONS_DATA } from '../../data/destinationsData';
import type { ClusterType } from '../../data/overviewData';

type SortOption = 'name' | 'visitors' | 'receipts' | 'readiness' | 'pressure';

export class DestinationCardGrid {
  public readonly element: HTMLElement;
  private currentFilter: 'all' | ClusterType = 'all';
  private currentSort: SortOption = 'visitors';
  private cardsContainer!: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'dest-card';

    this.renderLayout();
    this.renderCards();
  }

  private renderLayout(): void {
    const header = document.createElement('div');
    header.className = 'dest-card-header';
    header.innerHTML = `
      <div class="dest-card-title-group">
        <h3 class="dest-card-title">16 Destination Strategic Profiles</h3>
        <span class="dest-card-desc">Click any destination card to open full state diagnostic drill-down</span>
      </div>
    `;

    // Toolbar (Filter Chips + Sort Select)
    const toolbar = document.createElement('div');
    toolbar.className = 'dest-toolbar-row';

    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'dest-filter-chips';

    const clusters: { key: 'all' | ClusterType; label: string }[] = [
      { key: 'all', label: 'All Destinations (16)' },
      { key: 'Mature Gateway Hubs', label: 'Mature Gateway Hubs' },
      { key: 'High-Growth Emerging', label: 'High-Growth Emerging' },
      { key: 'Eco & Heritage Frontiers', label: 'Eco & Heritage' },
      { key: 'Developing Infrastructure', label: 'Developing Infra' },
    ];

    clusters.forEach((c) => {
      const chip = document.createElement('button');
      chip.className = `dest-chip-btn ${this.currentFilter === c.key ? 'active' : ''}`;
      chip.textContent = c.label;
      chip.addEventListener('click', () => {
        if (this.currentFilter !== c.key) {
          this.currentFilter = c.key;
          chipsWrap.querySelectorAll('.dest-chip-btn').forEach((b) => b.classList.remove('active'));
          chip.classList.add('active');
          this.renderCards();
        }
      });
      chipsWrap.appendChild(chip);
    });

    const sortSelect = document.createElement('select');
    sortSelect.className = 'dest-sort-select';
    sortSelect.innerHTML = `
      <option value="visitors">Sort: Highest Visitors</option>
      <option value="receipts">Sort: Highest Receipts</option>
      <option value="readiness">Sort: Highest Readiness</option>
      <option value="pressure">Sort: Highest Pressure</option>
      <option value="name">Sort: Alphabetical</option>
    `;
    sortSelect.addEventListener('change', (e) => {
      this.currentSort = (e.target as HTMLSelectElement).value as SortOption;
      this.renderCards();
    });

    toolbar.appendChild(chipsWrap);
    toolbar.appendChild(sortSelect);

    this.cardsContainer = document.createElement('div');
    this.cardsContainer.className = 'destinations-grid';

    this.element.appendChild(header);
    this.element.appendChild(toolbar);
    this.element.appendChild(this.cardsContainer);
  }

  private renderCards(): void {
    this.cardsContainer.innerHTML = '';

    let items = Object.values(DESTINATIONS_DATA);

    // Filter
    if (this.currentFilter !== 'all') {
      items = items.filter((d) => d.cluster === this.currentFilter);
    }

    // Sort
    items.sort((a, b) => {
      switch (this.currentSort) {
        case 'visitors': return b.visitorsTotal - a.visitorsTotal;
        case 'receipts': return b.receiptsTotal - a.receiptsTotal;
        case 'readiness': return b.readinessScore - a.readinessScore;
        case 'pressure': return b.pressureScore - a.pressureScore;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    items.forEach((dest) => {
      const card = document.createElement('div');
      card.className = 'destination-card';

      const clusterBg = this.getClusterBg(dest.cluster);
      const clusterColor = this.getClusterColor(dest.cluster);

      card.innerHTML = `
        <div class="dest-card-top-row">
          <div class="dest-card-name-wrap">
            <span class="dest-card-name">${dest.name}</span>
            <span class="dest-card-region">${dest.region} Malaysia • ${dest.code}</span>
          </div>
          <span class="dest-card-cluster-badge" style="background-color: ${clusterBg}; color: ${clusterColor};">
            ${dest.cluster}
          </span>
        </div>

        <div class="dest-figures-grid">
          <div class="dest-figure-col">
            <span class="dest-figure-label">Visitors</span>
            <span class="dest-figure-val">${dest.visitorsTotal}M</span>
          </div>
          <div class="dest-figure-col">
            <span class="dest-figure-label">Receipts</span>
            <span class="dest-figure-val">RM ${dest.receiptsTotal}B</span>
          </div>
          <div class="dest-figure-col">
            <span class="dest-figure-label">Readiness</span>
            <span class="dest-figure-val">${dest.readinessScore}/100</span>
          </div>
        </div>

        <div class="dest-profile-bar-wrap">
          <div class="dest-profile-bar-label-row">
            <span>Profile (Demand • Cap • Value • Press)</span>
            <span style="font-weight:700; color:${dest.pressureScore >= 75 ? '#dc2626' : '#0f172a'};">${dest.pressureScore}/100</span>
          </div>
          <div class="dest-four-seg-bar">
            <div class="dest-seg-cell" title="Demand Index: ${dest.demandScore}">
              <div class="dest-seg-fill demand" style="width: ${dest.demandScore}%"></div>
            </div>
            <div class="dest-seg-cell" title="Capacity Index: ${dest.capacityScore}">
              <div class="dest-seg-fill capacity" style="width: ${dest.capacityScore}%"></div>
            </div>
            <div class="dest-seg-cell" title="Economic Yield: ${dest.economicValueScore}">
              <div class="dest-seg-fill value" style="width: ${dest.economicValueScore}%"></div>
            </div>
            <div class="dest-seg-cell" title="Pressure Index: ${dest.pressureScore}">
              <div class="dest-seg-fill pressure ${dest.pressureScore >= 75 ? 'critical' : ''}" style="width: ${dest.pressureScore}%"></div>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(dest.id);
        }
      });

      this.cardsContainer.appendChild(card);
    });
  }

  private getClusterColor(cluster: string): string {
    switch (cluster) {
      case 'Mature Gateway Hubs': return '#0b57d0';
      case 'High-Growth Emerging': return '#10b981';
      case 'Eco & Heritage Frontiers': return '#d97706';
      default: return '#7c3aed';
    }
  }

  private getClusterBg(cluster: string): string {
    switch (cluster) {
      case 'Mature Gateway Hubs': return '#eff6ff';
      case 'High-Growth Emerging': return '#ecfdf5';
      case 'Eco & Heritage Frontiers': return '#fefce8';
      default: return '#f5f3ff';
    }
  }
}
