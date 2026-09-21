import {
  createElement,
  Landmark,
  Layers,
  Shapes,
  MapPin,
} from 'lucide';
import { TOURISM_ASSETS_KPIS } from '../../data/tourismAssetsData';

export class AssetKpiRow {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'assets-kpi-grid';
    this.render();
  }

  private render(): void {
    const kpis = [
      {
        title: 'Core Tourism Assets',
        value: TOURISM_ASSETS_KPIS.coreAssetsCount.toLocaleString(),
        subtext: 'Main attractions & heritage sites',
        icon: Landmark,
        accentColor: '#2563eb', // Royal Blue
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
      },
      {
        title: 'Supporting Assets',
        value: TOURISM_ASSETS_KPIS.supportingAssetsCount.toLocaleString(),
        subtext: 'F&B, transit, lodging & healthcare',
        icon: Layers,
        accentColor: '#059669', // Emerald
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        title: 'Asset Categories',
        value: `${TOURISM_ASSETS_KPIS.categoryCount} Groups`,
        subtext: `Covering ${TOURISM_ASSETS_KPIS.subCategoryCount} granular POI types`,
        icon: Shapes,
        accentColor: '#7c3aed', // Purple
        iconBg: '#f5f3ff',
        iconColor: '#7c3aed',
      },
      {
        title: 'States Covered',
        value: `${TOURISM_ASSETS_KPIS.statesCoveredCount} States & FTs`,
        subtext: '100% national spatial coverage',
        icon: MapPin,
        accentColor: '#ea580c', // Orange
        iconBg: '#fff7ed',
        iconColor: '#ea580c',
      },
    ];

    kpis.forEach((kpi) => {
      const card = document.createElement('div');
      card.className = 'assets-kpi-card';
      card.style.setProperty('--card-accent', kpi.accentColor);
      card.style.setProperty('--icon-bg', kpi.iconBg);
      card.style.setProperty('--icon-color', kpi.iconColor);

      // Info left
      const infoDiv = document.createElement('div');
      infoDiv.className = 'assets-kpi-info';

      const titleEl = document.createElement('h4');
      titleEl.className = 'assets-kpi-title';
      titleEl.textContent = kpi.title;

      const valRow = document.createElement('div');
      valRow.className = 'assets-kpi-value-row';

      const valEl = document.createElement('span');
      valEl.className = 'assets-kpi-value';
      valEl.textContent = kpi.value;

      valRow.appendChild(valEl);

      const subEl = document.createElement('span');
      subEl.className = 'assets-kpi-subtext';
      subEl.textContent = kpi.subtext;

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(valRow);
      infoDiv.appendChild(subEl);

      // Icon right
      const iconWrap = document.createElement('div');
      iconWrap.className = 'assets-kpi-icon-wrap';

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
