import {
  createElement,
  Users,
  Banknote,
  CalendarDays,
  TrendingUp,
} from 'lucide';

export class DemandKpiRow {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-kpi-grid';
    this.render();
  }

  private render(): void {
    const kpis = [
      {
        title: 'DOMESTIC VISITORS',
        value: '290.1M',
        trend: '+11.5% vs 2024',
        trendTitle: '+11.5% YoY growth from 260.1M trips in 2024',
        subtext: 'Annual domestic tourist trips',
        icon: Users,
        accentColor: '#2563eb', // Royal Blue
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
      },
      {
        title: 'TOURISM EXPENDITURE',
        value: 'RM 121.3B',
        trend: '+13.6% vs 2024',
        trendTitle: '+13.6% YoY growth from RM 106.7B in 2024',
        subtext: 'Total domestic visitor receipts',
        icon: Banknote,
        accentColor: '#059669', // Emerald
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        title: 'AVG. LENGTH OF STAY',
        value: '2.56 nights',
        trend: '+3.2% vs 2024',
        trendTitle: '+0.08 nights (+3.2%) from 2.48 nights in 2024',
        subtext: 'National weighted trip duration',
        icon: CalendarDays,
        accentColor: '#7c3aed', // Purple
        iconBg: '#f5f3ff',
        iconColor: '#7c3aed',
      },
      {
        title: 'AVG. SPEND PER TRIP',
        value: 'RM 418',
        trend: '+1.9% vs 2024',
        trendTitle: '+1.9% YoY growth from RM 410 per trip in 2024',
        subtext: 'Average spending yield per visitor',
        icon: TrendingUp,
        accentColor: '#ea580c', // Orange
        iconBg: '#fff7ed',
        iconColor: '#ea580c',
      },
    ];

    kpis.forEach((kpi) => {
      const card = document.createElement('div');
      card.className = 'demand-kpi-card';
      card.style.setProperty('--card-accent', kpi.accentColor);
      card.style.setProperty('--icon-bg', kpi.iconBg);
      card.style.setProperty('--icon-color', kpi.iconColor);

      // Info left
      const infoDiv = document.createElement('div');
      infoDiv.className = 'demand-kpi-info';

      const titleEl = document.createElement('h4');
      titleEl.className = 'demand-kpi-label';
      titleEl.textContent = kpi.title;

      const valRow = document.createElement('div');
      valRow.className = 'demand-kpi-value-wrap';

      const valEl = document.createElement('span');
      valEl.className = 'demand-kpi-value';
      valEl.textContent = kpi.value;
      valRow.appendChild(valEl);

      if (kpi.trend) {
        const trendEl = document.createElement('span');
        trendEl.className = 'demand-kpi-trend positive';
        trendEl.textContent = kpi.trend;
        if (kpi.trendTitle) {
          trendEl.title = kpi.trendTitle;
        }
        valRow.appendChild(trendEl);
      }

      const subEl = document.createElement('span');
      subEl.className = 'demand-kpi-subtext';
      subEl.textContent = kpi.subtext;

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(valRow);
      infoDiv.appendChild(subEl);

      // Icon right
      const iconWrap = document.createElement('div');
      iconWrap.className = 'demand-kpi-icon-wrap';

      const iconSvg = createElement(kpi.icon, {
        width: 22,
        height: 22,
        'stroke-width': 2,
      });

      iconWrap.appendChild(iconSvg);

      card.appendChild(infoDiv);
      card.appendChild(iconWrap);
      this.element.appendChild(card);
    });
  }
}
