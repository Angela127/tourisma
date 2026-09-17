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

    this.element.appendChild(header);
    this.element.appendChild(list);
  }
}
