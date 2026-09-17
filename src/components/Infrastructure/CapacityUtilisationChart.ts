import {
  STATE_INFRASTRUCTURE_DATA,
  NATIONAL_OCCUPANCY_BENCHMARK,
  NATIONAL_VISITOR_NIGHTS_BENCHMARK,
} from '../../data/infrastructureData';
import { settingsStore } from '../../data/settingsStore';

export type CapacityMetric = 'occupancy' | 'nights';

export class CapacityUtilisationChart {
  public readonly element: HTMLElement;
  private currentMetric: CapacityMetric = 'occupancy';
  private barsContainer!: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;
  private unsubscribeSettings?: () => void;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'infra-card';

    this.createTooltip();
    this.renderLayout();
    this.renderBars();

    this.unsubscribeSettings = settingsStore.subscribe(() => {
      this.renderBars();
    });
  }

  public destroy(): void {
    if (this.unsubscribeSettings) {
      this.unsubscribeSettings();
    }
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'infra-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  private renderLayout(): void {
    const header = document.createElement('div');
    header.className = 'infra-card-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'infra-card-title-group';
    titleGroup.innerHTML = `
      <h3 class="infra-card-title">Capacity Utilisation & Bottleneck Diagnosis</h3>
      <span class="infra-card-desc">State-level lodging pressure indexed against national average & strain boundaries</span>
    `;

    const controls = document.createElement('div');
    controls.className = 'infra-toggle-group';

    const btnOccupancy = document.createElement('button');
    btnOccupancy.className = 'infra-toggle-btn active';
    btnOccupancy.textContent = 'Occupancy Rate (%)';
    btnOccupancy.addEventListener('click', () => {
      if (this.currentMetric !== 'occupancy') {
        this.currentMetric = 'occupancy';
        btnOccupancy.classList.add('active');
        btnNights.classList.remove('active');
        this.renderBars();
      }
    });

    const btnNights = document.createElement('button');
    btnNights.className = 'infra-toggle-btn';
    btnNights.textContent = 'Visitor-Nights / Room';
    btnNights.addEventListener('click', () => {
      if (this.currentMetric !== 'nights') {
        this.currentMetric = 'nights';
        btnNights.classList.add('active');
        btnOccupancy.classList.remove('active');
        this.renderBars();
      }
    });

    controls.appendChild(btnOccupancy);
    controls.appendChild(btnNights);

    header.appendChild(titleGroup);
    header.appendChild(controls);

    this.barsContainer = document.createElement('div');
    this.barsContainer.className = 'capacity-bars-container';

    // Legend
    const legend = document.createElement('div');
    legend.className = 'capacity-chart-legend';
    legend.innerHTML = `
      <div class="capacity-legend-pill">
        <span class="legend-swatch normal"></span>
        <span>Normal Utilisation (&lt;70%)</span>
      </div>
      <div class="capacity-legend-pill">
        <span class="legend-swatch strain"></span>
        <span>Strain Warning (70% - 80%)</span>
      </div>
      <div class="capacity-legend-pill">
        <span class="legend-swatch critical"></span>
        <span>Critical Bottleneck (&gt;80%)</span>
      </div>
    `;

    this.element.appendChild(header);
    this.element.appendChild(this.barsContainer);
    this.element.appendChild(legend);
  }

  private renderBars(): void {
    this.barsContainer.innerHTML = '';

    const isOccupancy = this.currentMetric === 'occupancy';
    const benchmarkVal = isOccupancy ? NATIONAL_OCCUPANCY_BENCHMARK : NATIONAL_VISITOR_NIGHTS_BENCHMARK;
    const strainThreshold = isOccupancy
      ? settingsStore.getThreshold('occupancy_strain')
      : settingsStore.getThreshold('visitor_nights_strain');
    const criticalThreshold = isOccupancy
      ? settingsStore.getThreshold('occupancy_critical')
      : settingsStore.getThreshold('visitor_nights_critical');
    const maxVal = isOccupancy ? 100 : 350;

    // Calculate left percentages for reference lines and bands
    const benchmarkLeftPct = (benchmarkVal / maxVal) * 100;
    const strainLeftPct = (strainThreshold / maxVal) * 100;
    const criticalLeftPct = (criticalThreshold / maxVal) * 100;

    // Add Strain and Critical shaded bands
    const strainBand = document.createElement('div');
    strainBand.className = 'capacity-band-strain';
    strainBand.style.left = `calc(120px + (100% - 180px) * ${strainLeftPct / 100})`;
    strainBand.style.width = `calc((100% - 180px) * ${(criticalLeftPct - strainLeftPct) / 100})`;
    this.barsContainer.appendChild(strainBand);

    const criticalBand = document.createElement('div');
    criticalBand.className = 'capacity-band-critical';
    criticalBand.style.left = `calc(120px + (100% - 180px) * ${criticalLeftPct / 100})`;
    criticalBand.style.right = '60px';
    this.barsContainer.appendChild(criticalBand);

    // National Benchmark dashed line
    const benchmarkLine = document.createElement('div');
    benchmarkLine.className = 'capacity-benchmark-guide';
    benchmarkLine.style.left = `calc(120px + (100% - 180px) * ${benchmarkLeftPct / 100})`;
    benchmarkLine.innerHTML = `
      <span class="capacity-benchmark-tag">Natl Avg: ${isOccupancy ? `${benchmarkVal}%` : `${benchmarkVal} nts`}</span>
    `;
    this.barsContainer.appendChild(benchmarkLine);

    // Sort data descending by chosen metric
    const sortedData = [...STATE_INFRASTRUCTURE_DATA].sort((a, b) => {
      const valA = isOccupancy ? a.occupancyRate : a.visitorNightsPerRoom;
      const valB = isOccupancy ? b.occupancyRate : b.visitorNightsPerRoom;
      return valB - valA;
    });

    sortedData.forEach((state) => {
      const val = isOccupancy ? state.occupancyRate : state.visitorNightsPerRoom;
      const fillPct = Math.min((val / maxVal) * 100, 100);

      let statusClass: 'normal' | 'strain' | 'critical' = 'normal';
      if (val >= criticalThreshold) {
        statusClass = 'critical';
      } else if (val >= strainThreshold) {
        statusClass = 'strain';
      }

      const row = document.createElement('div');
      row.className = 'capacity-bar-row';
      row.title = `${state.name} (${state.code}): ${isOccupancy ? `${val.toFixed(1)}% occupancy` : `${val} nights/room`}. Click to open state drawer.`;

      row.innerHTML = `
        <span class="capacity-bar-label">${state.name}</span>
        <div class="capacity-track-wrap">
          <div class="capacity-bar-core ${statusClass}" style="width: ${fillPct.toFixed(1)}%"></div>
        </div>
        <span class="capacity-value-col ${statusClass}">
          ${isOccupancy ? `${val.toFixed(1)}%` : `${val}`}
        </span>
      `;

      // Hover tooltip
      row.addEventListener('mouseenter', (e) => {
        const statusLabel = statusClass === 'critical' ? 'CRITICAL BOTTLENECK' : statusClass === 'strain' ? 'STRAIN WARNING' : 'NORMAL CAPACITY';
        this.tooltip.innerHTML = `
          <strong>${state.name} (${state.code})</strong> • <span style="color:${statusClass === 'critical' ? '#f87171' : statusClass === 'strain' ? '#fde047' : '#93c5fd'}">${statusLabel}</span><br/>
          • Rooms: <strong>${state.rooms.toLocaleString()}</strong> (${state.establishments} properties)<br/>
          • Occupancy: <strong>${state.occupancyRate.toFixed(1)}%</strong> (Nat'l: ${NATIONAL_OCCUPANCY_BENCHMARK}%)<br/>
          • Visitor-Nights/Room: <strong>${state.visitorNightsPerRoom}</strong>/yr<br/>
          • Constraint: <em>${state.bindingConstraint}</em><br/>
          <span style="font-size:0.65rem; color:#94a3b8;">🖱 Click bar to view full State Profile</span>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      row.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      row.addEventListener('mouseleave', () => {
        this.tooltip.style.display = 'none';
      });

      // Click to open State Drawer
      row.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      this.barsContainer.appendChild(row);
    });
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
