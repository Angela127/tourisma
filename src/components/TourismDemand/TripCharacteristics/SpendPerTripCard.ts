import { SPEND_PER_TRIP_DATA } from '../../../data/tourismDemandData';

export class SpendPerTripCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header
    const header = document.createElement('div');
    header.className = 'demand-card-header';
    header.innerHTML = `
      <div class="demand-card-title-group">
        <h3 class="demand-card-title">Expenditure per Trip</h3>
        <span class="demand-card-desc">Average visitor yield by destination state (RM / Trip)</span>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'trip-card-list';

    if (SPEND_PER_TRIP_DATA.length === 0) {
      list.innerHTML = `
        <div class="demand-empty-state">
          <svg class="demand-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          <span class="demand-empty-state-title">No expenditure data</span>
          <span class="demand-empty-state-desc">State average spend per trip will appear once data is loaded.</span>
        </div>
      `;
    } else {
      const maxSpend = 3600;

      list.innerHTML = SPEND_PER_TRIP_DATA.map((item) => {
        const pct = ((item.spendRM / maxSpend) * 100).toFixed(1);
        return `
          <div class="trip-list-row" title="${item.stateName}: RM ${item.spendRM.toLocaleString()} (Domestic: RM ${item.domesticSpendRM}, Intl: RM ${item.internationalSpendRM})">
            <span class="trip-state-name">${item.stateName}</span>
            <div class="trip-bar-track">
              <div class="trip-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="trip-val-text">RM ${item.spendRM.toLocaleString()}</span>
          </div>
        `;
      }).join('');
    }

    this.element.appendChild(header);
    this.element.appendChild(list);
  }
}
