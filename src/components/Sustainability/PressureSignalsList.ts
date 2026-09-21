import { SUSTAINABILITY_STATES_DATA } from '../../data/sustainabilityData';
import { settingsStore } from '../../data/settingsStore';

export class PressureSignalsList {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private unsubscribeSettings?: () => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'sus-card';
    this.render();

    this.unsubscribeSettings = settingsStore.subscribe(() => {
      this.render();
    });
  }

  public destroy(): void {
    if (this.unsubscribeSettings) {
      this.unsubscribeSettings();
    }
  }

  private render(): void {
    this.element.innerHTML = '';

    const strainThreshold = settingsStore.getThreshold('pressure_strain');
    const criticalThreshold = settingsStore.getThreshold('pressure_critical');

    const header = document.createElement('div');
    header.className = 'sus-card-header';
    header.innerHTML = `
      <div class="sus-card-title-group">
        <h3 class="sus-card-title">Early Warning Pressure Signals</h3>
        <span class="sus-card-desc">Destinations exceeding carry capacity thresholds (Strain: ≥${strainThreshold}, Critical: ≥${criticalThreshold})</span>
      </div>
      <span class="infra-kpi-change-pill negative" style="font-size:0.68rem;">
        Active Alerts
      </span>
    `;

    const listWrap = document.createElement('div');
    listWrap.className = 'signals-list-wrap';

    // Filter states above dynamic strain threshold
    const signalStates = Object.values(SUSTAINABILITY_STATES_DATA).filter(
      (s) => s.compositeScore >= strainThreshold
    );

    signalStates.forEach((state, idx) => {
      const card = document.createElement('div');
      const isCritical = state.compositeScore >= criticalThreshold;
      card.className = `signal-accordion-card ${isCritical ? 'critical' : 'strain'}`;

      const metric = state.dimensions.composite_pressure;
      const trendSymbol = metric.trend === 'up' ? '▲ Up' : metric.trend === 'down' ? '▼ Down' : '▬ Stable';

      card.innerHTML = `
        <div class="signal-accordion-header" data-idx="${idx}">
          <div class="signal-header-left">
            <span class="signal-state-title">${state.name}</span>
            <span class="signal-dim-badge">• ${state.primarySignalDimension}</span>
          </div>
          <div class="signal-header-right">
            <span class="signal-val-tag ${isCritical ? 'critical' : 'strain'}">${metric.value}</span>
            <span class="signal-trend-pill">${trendSymbol}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s ease;">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="signal-accordion-body" style="display: ${idx === 0 ? 'block' : 'none'};">
          <p style="margin: 0 0 8px 0;">${state.narrative}</p>
          <button class="infra-toggle-btn active" style="font-size:0.68rem; padding: 3px 8px;" data-open-state="${state.id}">
            View Full State Diagnostic →
          </button>
        </div>
      `;

      // Accordion toggle
      const headerEl = card.querySelector('.signal-accordion-header');
      const bodyEl = card.querySelector('.signal-accordion-body') as HTMLElement;
      const arrowIcon = card.querySelector('.signal-header-right svg') as SVGElement;

      if (idx === 0) {
        arrowIcon.style.transform = 'rotate(180deg)';
      }

      headerEl?.addEventListener('click', () => {
        const isClosed = bodyEl.style.display === 'none';
        bodyEl.style.display = isClosed ? 'block' : 'none';
        arrowIcon.style.transform = isClosed ? 'rotate(180deg)' : 'rotate(0deg)';
      });

      card.querySelector('button[data-open-state]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      listWrap.appendChild(card);
    });

    this.element.appendChild(header);
    this.element.appendChild(listWrap);
  }
}
