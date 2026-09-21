import { LengthOfStayCard } from './LengthOfStayCard';
import { PurposeSplitCard } from './PurposeSplitCard';
import { SpendPerTripCard } from './SpendPerTripCard';

export class TripCharacteristicsSection {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'demand-section-block';

    // Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'demand-section-header';
    sectionHeader.innerHTML = `
      <div class="demand-section-title-wrap">
        <h2 class="demand-section-title">Trip Characteristics & Yield Profiles</h2>
      </div>
      <span class="demand-section-subtitle">Stay duration, travel motivations, and regional spending power distribution</span>
    `;

    // 3-Column Grid
    const grid = document.createElement('div');
    grid.className = 'trip-characteristics-grid';

    const stayCard = new LengthOfStayCard();
    const purposeCard = new PurposeSplitCard();
    const spendCard = new SpendPerTripCard();

    grid.appendChild(stayCard.element);
    grid.appendChild(purposeCard.element);
    grid.appendChild(spendCard.element);

    this.element.appendChild(sectionHeader);
    this.element.appendChild(grid);
  }
}
