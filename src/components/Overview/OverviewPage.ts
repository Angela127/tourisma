import './overview.css';
import { LeftKpiCards } from './LeftKpiColumn/LeftKpiCards';
import { MalaysiaMap } from './MapSection/MalaysiaMap';
import { EconomicContributionCards } from './GdpEmployment/EconomicContributionCards';
import { TopReceiptsCard } from './BottomGrid/TopReceiptsCard';
import { DestinationProfilesCard } from './BottomGrid/DestinationProfilesCard';
import { TourismPressureCard } from './BottomGrid/TourismPressureCard';

export class OverviewPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'overview-page-layout';

    // ------------------------------------------------------------------------
    // Upper Section: 3-Column Grid (Left KPIs, Center Map, Right Gauges)
    // ------------------------------------------------------------------------
    const upperGrid = document.createElement('section');
    upperGrid.className = 'overview-upper-3col-grid';
    upperGrid.setAttribute('aria-label', 'National Overview KPIs, Map, and Economic Contribution');

    // 1. Left Column: 4 Vertical KPI Cards
    const leftKpis = new LeftKpiCards();

    // 2. Center Column: Malaysia Readiness Map
    const centerMap = new MalaysiaMap();

    // 3. Right Column: GDP & Employment Gauges
    const rightGauges = new EconomicContributionCards();

    upperGrid.appendChild(leftKpis.element);
    upperGrid.appendChild(centerMap.element);
    upperGrid.appendChild(rightGauges.element);

    // ------------------------------------------------------------------------
    // Lower Section: 3-Column Grid (Receipts, Profiles, Pressure)
    // ------------------------------------------------------------------------
    const lowerGrid = document.createElement('section');
    lowerGrid.className = 'overview-lower-3col-grid';
    lowerGrid.setAttribute('aria-label', 'State Receipts, Destination Readiness Profiles, and Tourism Pressure');

    const topReceipts = new TopReceiptsCard();
    const destinationProfiles = new DestinationProfilesCard();
    const tourismPressure = new TourismPressureCard();

    lowerGrid.appendChild(topReceipts.element);
    lowerGrid.appendChild(destinationProfiles.element);
    lowerGrid.appendChild(tourismPressure.element);

    // ------------------------------------------------------------------------
    // Bottom Data As Of Notice
    // ------------------------------------------------------------------------
    const dataAsOfFooter = document.createElement('div');
    dataAsOfFooter.className = 'overview-data-as-of-footer';
    dataAsOfFooter.innerHTML = `<span>Data as of 2026</span>`;

    // Assemble Page
    this.element.appendChild(upperGrid);
    this.element.appendChild(lowerGrid);
    this.element.appendChild(dataAsOfFooter);
  }
}
