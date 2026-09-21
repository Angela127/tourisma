import {
  createElement,
  Route,
  Bus,
  Landmark,
  MapPin,
} from 'lucide';
import { ACCESSIBILITY_KPIS } from '../../data/accessibilityData';

export class AccessibilityKpiRow {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accessibility-kpi-grid';
    this.render();
  }

  private render(): void {
    const kpis = [
      {
        title: 'Road Access',
        value: `${ACCESSIBILITY_KPIS.roadAccessRate.toFixed(1)}%`,
        badgeText: 'Within 1 km of main road',
        badgeColor: 'blue',
        subtext: ACCESSIBILITY_KPIS.roadAccessSubtext,
        icon: Route,
        accentColor: '#2563eb', // Royal Blue
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
      },
      {
        title: 'Public Transport Access',
        value: `${ACCESSIBILITY_KPIS.ptAccessRate.toFixed(1)}%`,
        badgeText: 'Within 1 km of transit / bus',
        badgeColor: 'emerald',
        subtext: ACCESSIBILITY_KPIS.ptAccessSubtext,
        icon: Bus,
        accentColor: '#059669', // Emerald
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        title: 'Tourism Assets',
        value: ACCESSIBILITY_KPIS.totalTourismAssets.toLocaleString(),
        badgeText: '50 POI categories mapped',
        badgeColor: 'purple',
        subtext: ACCESSIBILITY_KPIS.assetsSubtext,
        icon: Landmark,
        accentColor: '#7c3aed', // Purple
        iconBg: '#f5f3ff',
        iconColor: '#7c3aed',
      },
      {
        title: 'States Covered',
        value: `${ACCESSIBILITY_KPIS.statesCovered} States & FTs`,
        badgeText: 'National spatial coverage',
        badgeColor: 'orange',
        subtext: ACCESSIBILITY_KPIS.statesSubtext,
        icon: MapPin,
        accentColor: '#ea580c', // Orange
        iconBg: '#fff7ed',
        iconColor: '#ea580c',
      },
    ];

    kpis.forEach((kpi) => {
      const card = document.createElement('div');
      card.className = 'access-kpi-card';
      card.style.setProperty('--card-accent', kpi.accentColor);
      card.style.setProperty('--icon-bg', kpi.iconBg);
      card.style.setProperty('--icon-color', kpi.iconColor);

      // Info left
      const infoDiv = document.createElement('div');
      infoDiv.className = 'access-kpi-info';

      const titleEl = document.createElement('h4');
      titleEl.className = 'access-kpi-title';
      titleEl.textContent = kpi.title;

      const valWrap = document.createElement('div');
      valWrap.className = 'access-kpi-value-wrap';

      const valEl = document.createElement('span');
      valEl.className = 'access-kpi-value';
      valEl.textContent = kpi.value;
      valWrap.appendChild(valEl);

      const badgeEl = document.createElement('span');
      badgeEl.className = `access-kpi-badge ${kpi.badgeColor}`;
      badgeEl.textContent = kpi.badgeText;
      valWrap.appendChild(badgeEl);

      const subEl = document.createElement('span');
      subEl.className = 'access-kpi-subtext';
      subEl.textContent = kpi.subtext;

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(valWrap);
      infoDiv.appendChild(subEl);

      // Icon right
      const iconWrap = document.createElement('div');
      iconWrap.className = 'access-kpi-icon-wrap';

      const iconSvg = createElement(kpi.icon, {
        width: 20,
        height: 20,
        'stroke-width': 2,
      });
      iconWrap.appendChild(iconSvg);

      card.appendChild(infoDiv);
      card.appendChild(iconWrap);
      this.element.appendChild(card);
    });
  }
}
