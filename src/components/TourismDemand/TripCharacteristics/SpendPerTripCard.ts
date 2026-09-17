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

    this.element.appendChild(header);
    this.element.appendChild(list);
  }
}
