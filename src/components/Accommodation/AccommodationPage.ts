import './accommodation.css';
import { AccommodationMapSection } from './AccommodationMapSection';
import { AccommodationRoomsBarChart } from './AccommodationRoomsBarChart';
import { AccommodationBarChart } from './AccommodationBarChart';
import { VisitorRatioBarChart } from './VisitorRatioBarChart';
import { 
  createElement, 
  Building2, 
  BedDouble, 
  Hotel, 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide';

export class AccommodationPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accommodation-page';
    this.render();
  }

  private appendIcon(containerSelector: string, icon: any, props: any = {}) {
    const container = this.element.querySelector(containerSelector);
    if (container) {
      container.appendChild(createElement(icon, { ...props }));
    }
  }

  private render() {
    this.element.innerHTML = `
      <div class="accommodation-container">
        <div class="kpi-cards-row">
          
          <!-- Card 1: Rooms -->
          <div class="kpi-card">
            <span class="kpi-label">ACCOMMODATION ROOMS</span>
            <div class="kpi-value-wrap">
              <span class="kpi-value">349,580</span>
              <span class="kpi-trend positive">+1.7% vs 2024</span>
            </div>
            <span class="kpi-subtext">Total national room inventory</span>
          </div>
          
          <!-- Card 2: Establishments -->
          <div class="kpi-card">
            <span class="kpi-label">ACCOMMODATION ESTABLISHMENTS</span>
            <div class="kpi-value-wrap">
              <span class="kpi-value">5,390</span>
              <span class="kpi-trend positive">+2.1% vs 2024</span>
            </div>
            <span class="kpi-subtext">Registered hotels and lodgings</span>
          </div>

          <!-- Card 3: AOR -->
          <div class="kpi-card">
            <span class="kpi-label">AVERAGE OCCUPANCY RATE</span>
            <div class="kpi-value-wrap">
              <span class="kpi-value">55.7%</span>
            </div>
            <span class="kpi-subtext">National weighted average for 2025</span>
          </div>

          <!-- Card 4: Ratio -->
          <div class="kpi-card">
            <span class="kpi-label">VISITOR-TO-ROOM RATIO</span>
            <div class="kpi-value-wrap">
              <span class="kpi-value">830</span>
            </div>
            <span class="kpi-subtext">Visitors per room annually</span>
          </div>
          
        </div>

        <div class="accommodation-dashboard-grid" id="chart-container">
          <!-- Main Chart is injected here via TS -->
        </div>
      </div>
    `;

    // No icons required for sustainability UI style
    const chartContainer = this.element.querySelector('#chart-container');
    if (chartContainer) {
      const mapSection = new AccommodationMapSection();
      chartContainer.appendChild(mapSection.element);

      // We still render the 3 horizontal bar charts below the map section
      const barChartsRow = document.createElement('div');
      barChartsRow.className = 'bar-charts-row';
      
      const roomsChart = new AccommodationRoomsBarChart();
      const barChart = new AccommodationBarChart();
      const ratioChart = new VisitorRatioBarChart();
      
      barChartsRow.appendChild(roomsChart.element);
      barChartsRow.appendChild(barChart.element);
      barChartsRow.appendChild(ratioChart.element);

      chartContainer.appendChild(barChartsRow);
    }
  }
}
