import './tourismDemand.css';
import { CompositionSection } from './CompositionSection/CompositionSection';
import { SeasonalitySection } from './SeasonalitySection/SeasonalitySection';
import { ForecastSection } from './ForecastSection/ForecastSection';
import { TripCharacteristicsSection } from './TripCharacteristics/TripCharacteristicsSection';

export class TourismDemandPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'tourism-demand-page';

    // 1. Section 1: Demand Composition & Source Markets
    const compositionSection = new CompositionSection();
    this.element.appendChild(compositionSection.element);

    // 2. Section 2: Seasonality & Concentration
    const seasonalitySection = new SeasonalitySection();
    this.element.appendChild(seasonalitySection.element);

    // 3. Section 3: Forecast & Model Card
    const forecastSection = new ForecastSection();
    this.element.appendChild(forecastSection.element);

    // 4. Section 4: Trip Characteristics
    const tripSection = new TripCharacteristicsSection();
    this.element.appendChild(tripSection.element);
  }
}
