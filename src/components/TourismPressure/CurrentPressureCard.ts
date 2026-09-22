import type { TourismPressureStateData } from './pressureData';

export class CurrentPressureCard {
  public readonly element: HTMLElement;

  constructor(initialData: TourismPressureStateData) {
    this.element = document.createElement('div');
    this.element.className = 'pressure-kpi-grid';
    this.render(initialData);
  }

  public update(data: TourismPressureStateData): void {
    this.render(data);
  }

  private render(data: TourismPressureStateData): void {
    const visStr = data.domesticVisitorsM >= 100
      ? `${data.domesticVisitorsM.toFixed(1)}M`
      : `${data.domesticVisitorsM.toFixed(2)}M`;

    const intlStr = data.internationalHotelGuestsM >= 10
      ? `${data.internationalHotelGuestsM.toFixed(1)}M`
      : `${data.internationalHotelGuestsM.toFixed(2)}M`;

    const kpis = [
      {
        title: 'VISITOR DEMAND',
        value: visStr,
        subtext: `${visStr} Domestic · ${intlStr} Int'l Guests`,
        accentColor: '#2563eb', // Royal Blue
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        iconSvg: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        `,
      },
      {
        title: 'ACCOMMODATION UTILISATION',
        value: `AOR ${data.aorPct.toFixed(1)}%`,
        subtext: `${data.visitorToRoomRatio.toFixed(1)} / room · ${data.accommodationRooms.toLocaleString()} rooms`,
        accentColor: '#d97706', // Amber
        iconBg: '#fffbeb',
        iconColor: '#d97706',
        iconSvg: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
          </svg>
        `,
      },
      {
        title: 'SPATIAL ACCESSIBILITY',
        value: `Road ${data.roadAccessRate.toFixed(1)}%`,
        subtext: `PT Access ${data.ptAccessRate.toFixed(1)}% · ${data.roadAccessRate >= 40 ? 'High Arterial' : 'Developing Corridor'}`,
        accentColor: '#059669', // Emerald
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        iconSvg: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="19" r="3"></circle>
            <path d="M9 19h8.5a4.5 4.5 0 0 0 4.5-4.5v0a4.5 4.5 0 0 0-4.5-4.5H14"></path>
            <circle cx="18" cy="5" r="3"></circle>
            <path d="M12 9v10"></path>
          </svg>
        `,
      },
      {
        title: 'ENVIRONMENTAL PROXIMITY',
        value: `${data.environmentalExposureRate.toFixed(1)}%`,
        subtext: `${data.environmentalExposureRate >= 35 ? 'Elevated Buffer Proximity' : 'Moderate Ecological Buffer'}`,
        accentColor: '#7c3aed', // Violet
        iconBg: '#f5f3ff',
        iconColor: '#7c3aed',
        iconSvg: `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        `,
      },
    ];

    this.element.innerHTML = kpis.map((kpi) => `
      <div class="pressure-kpi-card" style="--card-accent: ${kpi.accentColor}; --icon-bg: ${kpi.iconBg}; --icon-color: ${kpi.iconColor};">
        <div class="pressure-kpi-info">
          <span class="pressure-kpi-title">${kpi.title}</span>
          <div class="pressure-kpi-value-row">
            <span class="pressure-kpi-value">${kpi.value}</span>
          </div>
          <span class="pressure-kpi-subtext" title="${kpi.subtext}">${kpi.subtext}</span>
        </div>
        <div class="pressure-kpi-icon-wrap">
          ${kpi.iconSvg}
        </div>
      </div>
    `).join('');
  }
}
