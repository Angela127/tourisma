import { LENGTH_OF_STAY_DATA } from '../../../data/tourismDemandData';

export class LengthOfStayCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header
    const header = document.createElement('div');
    header.className = 'demand-card-header';
    header.innerHTML = `
      <div class="demand-card-title-group">
        <h3 class="demand-card-title">Average Length of Stay</h3>
        <span class="demand-card-desc">Duration per trip by destination state (Nights)</span>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'trip-card-list';

    if (LENGTH_OF_STAY_DATA.length === 0) {
      list.innerHTML = `
        <div class="demand-empty-state">
          <svg class="demand-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="demand-empty-state-title">No length of stay data</span>
          <span class="demand-empty-state-desc">State duration metrics will appear once data is loaded.</span>
        </div>
      `;
    } else {
      const maxNights = 7.5;

      list.innerHTML = LENGTH_OF_STAY_DATA.map((item) => {
        const pct = ((item.nights / maxNights) * 100).toFixed(1);
        return `
          <div class="trip-list-row" title="${item.stateName}: ${item.nights} nights avg stay">
            <span class="trip-state-name">${item.stateName}</span>
            <div class="trip-bar-track">
              <div class="trip-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="trip-val-text">${item.nights.toFixed(1)} nights</span>
          </div>
        `;
      }).join('');
    }

    this.element.appendChild(header);
    this.element.appendChild(list);
  }
}
