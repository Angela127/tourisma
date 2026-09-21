import './accommodation.css';
import { AccommodationMapSection } from './AccommodationMapSection';
import { AccommodationRoomsBarChart } from './AccommodationRoomsBarChart';
import { AccommodationBarChart } from './AccommodationBarChart';
import { VisitorRatioBarChart } from './VisitorRatioBarChart';
import { 
  createElement, 
  Building2, 
  BedDouble, 
  Activity, 
  Users, 
} from 'lucide';

export class AccommodationPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accommodation-page';
    this.render();
  }

  private render() {
    this.element.innerHTML = `
      <div class="accommodation-container">
        <div class="kpi-cards-row" id="accommodation-kpis"></div>
        <div class="accommodation-dashboard-grid" id="chart-container">
          <!-- Main Chart is injected here via TS -->
        </div>
      </div>
    `;

    // Render KPI Cards (Matching Tourism Assets style with icons & growth trends)
    const kpiContainer = this.element.querySelector('#accommodation-kpis');
    if (kpiContainer) {
      const kpis = [
        {
          title: 'Accommodation Rooms',
          value: '349,580',
          trend: '+1.7% vs 2024',
          trendTitle: '+1.7% growth from 343,866 rooms in 2024',
          subtext: 'Total national room inventory',
          icon: BedDouble,
          accentColor: '#2563eb', // Royal Blue
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
        },
        {
          title: 'Accommodation Establishments',
          value: '5,390',
          trend: '+2.1% vs 2024',
          trendTitle: '+2.1% growth from 5,277 establishments in 2024',
          subtext: 'Registered hotels and lodgings',
          icon: Building2,
          accentColor: '#059669', // Emerald
          iconBg: '#ecfdf5',
          iconColor: '#059669',
        },
        {
          title: 'Average Occupancy Rate',
          value: '55.7%',
          trend: '+2.1% vs 2024',
          trendTitle: '+1.1 pp (+2.1% growth) from 54.6% in 2024',
          subtext: 'National weighted average for 2025',
          icon: Activity,
          accentColor: '#7c3aed', // Purple
          iconBg: '#f5f3ff',
          iconColor: '#7c3aed',
        },
        {
          title: 'Visitor-to-Room Ratio',
          value: '830',
          trend: '+9.7% vs 2024',
          trendTitle: '+9.7% annual growth from 756 visitors/room in 2024',
          subtext: 'Visitors per room annually',
          icon: Users,
          accentColor: '#ea580c', // Orange
          iconBg: '#fff7ed',
          iconColor: '#ea580c',
        },
      ];

      kpis.forEach((kpi) => {
        const card = document.createElement('div');
        card.className = 'kpi-card';
        card.style.setProperty('--card-accent', kpi.accentColor);
        card.style.setProperty('--icon-bg', kpi.iconBg);
        card.style.setProperty('--icon-color', kpi.iconColor);

        // Info left
        const infoDiv = document.createElement('div');
        infoDiv.className = 'kpi-info';

        const titleEl = document.createElement('h4');
        titleEl.className = 'kpi-label';
        titleEl.textContent = kpi.title;

        const valRow = document.createElement('div');
        valRow.className = 'kpi-value-wrap';

        const valEl = document.createElement('span');
        valEl.className = 'kpi-value';
        valEl.textContent = kpi.value;
        valRow.appendChild(valEl);

        if (kpi.trend) {
          const trendEl = document.createElement('span');
          trendEl.className = 'kpi-trend positive';
          trendEl.textContent = kpi.trend;
          if (kpi.trendTitle) {
            trendEl.title = kpi.trendTitle;
          }
          valRow.appendChild(trendEl);
        }

        const subEl = document.createElement('span');
        subEl.className = 'kpi-subtext';
        subEl.textContent = kpi.subtext;

        infoDiv.appendChild(titleEl);
        infoDiv.appendChild(valRow);
        infoDiv.appendChild(subEl);

        // Icon right
        const iconWrap = document.createElement('div');
        iconWrap.className = 'kpi-icon-wrap';

        const iconSvg = createElement(kpi.icon, {
          width: 22,
          height: 22,
          'stroke-width': 2,
        });

        iconWrap.appendChild(iconSvg);

        card.appendChild(infoDiv);
        card.appendChild(iconWrap);
        kpiContainer.appendChild(card);
      });
    }

    const chartContainer = this.element.querySelector('#chart-container');
    if (chartContainer) {
      let isUpdating = false;

      const roomsChart = new AccommodationRoomsBarChart((stateId) => {
        if (isUpdating) return;
        isUpdating = true;
        mapSection.setSelectedState(stateId);
        barChart.setSelectedState(stateId);
        ratioChart.setSelectedState(stateId);
        isUpdating = false;
      });

      const barChart = new AccommodationBarChart((stateId) => {
        if (isUpdating) return;
        isUpdating = true;
        mapSection.setSelectedState(stateId);
        roomsChart.setSelectedState(stateId);
        ratioChart.setSelectedState(stateId);
        isUpdating = false;
      });

      const ratioChart = new VisitorRatioBarChart((stateId) => {
        if (isUpdating) return;
        isUpdating = true;
        mapSection.setSelectedState(stateId);
        roomsChart.setSelectedState(stateId);
        barChart.setSelectedState(stateId);
        isUpdating = false;
      });

      const mapSection = new AccommodationMapSection((stateId) => {
        if (isUpdating) return;
        isUpdating = true;
        roomsChart.setSelectedState(stateId);
        barChart.setSelectedState(stateId);
        ratioChart.setSelectedState(stateId);
        isUpdating = false;
      });

      chartContainer.appendChild(mapSection.element);

      // Render the 3 horizontal bar charts below the map section (full height, no scrolling)
      const barChartsRow = document.createElement('div');
      barChartsRow.className = 'bar-charts-row';

      barChartsRow.appendChild(roomsChart.element);
      barChartsRow.appendChild(barChart.element);
      barChartsRow.appendChild(ratioChart.element);

      chartContainer.appendChild(barChartsRow);
    }
  }
}
