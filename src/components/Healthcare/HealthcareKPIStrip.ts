import {
  NATIONAL_HEALTHCARE_SUMMARY,
  getStateHealthcare,
  type StateHealthcareData,
} from '../../data/healthcareData';

export class HealthcareKPIStrip {
  public readonly element: HTMLElement;
  private selectedStateId: string | null = null;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'hc-kpi-strip';
    this.render();
  }

  public updateState(stateId: string | null): void {
    this.selectedStateId = stateId;
    this.render();
  }

  private render(): void {
    const stateData: StateHealthcareData | undefined = this.selectedStateId
      ? getStateHealthcare(this.selectedStateId)
      : undefined;

    const isState = !!stateData;
    const scopeLabel = isState ? stateData.code : 'NATIONAL';

    // 1. Healthcare Facilities
    const facilitiesCount = isState ? stateData.totalFacilities : NATIONAL_HEALTHCARE_SUMMARY.totalFacilities;
    const hospitalsCount = isState ? stateData.hospitals : NATIONAL_HEALTHCARE_SUMMARY.totalHospitals;
    const clinicsCount = isState ? stateData.clinics : NATIONAL_HEALTHCARE_SUMMARY.totalClinics;

    // 2. Hospital Beds
    const bedsCount = isState ? stateData.totalBeds : NATIONAL_HEALTHCARE_SUMMARY.totalBeds;
    const icuBeds = isState ? stateData.bedsIcu : 893;

    // 3. Healthcare Access
    const accessPct = isState ? stateData.healthcareAccessRate5km : NATIONAL_HEALTHCARE_SUMMARY.accessRate5km;
    const immediatePct = isState ? stateData.primaryAccessTiers.highPct : NATIONAL_HEALTHCARE_SUMMARY.accessRate2km;

    // 4. Bed Occupancy Rate
    const bor = isState ? stateData.bedOccupancyRate : NATIONAL_HEALTHCARE_SUMMARY.bedOccupancyRate;
    const borBadgeClass = bor >= 75 ? 'badge-critical' : bor >= 50 ? 'badge-warning' : 'badge-safe';

    this.element.innerHTML = `
      <!-- Card 1: Healthcare Facilities -->
      <div class="hc-kpi-card">
        <div class="hc-kpi-top">
          <span class="hc-kpi-label">HEALTHCARE FACILITIES</span>
          <span class="hc-kpi-scope-tag">${scopeLabel}</span>
        </div>
        <div class="hc-kpi-value-wrap">
          <span class="hc-kpi-num">${facilitiesCount.toLocaleString()}</span>
          <span class="hc-kpi-pill pill-blue">${hospitalsCount} Hospitals</span>
        </div>
        <span class="hc-kpi-sub">${clinicsCount.toLocaleString()} clinics & pharmacies registered</span>
      </div>

      <!-- Card 2: Hospital Beds -->
      <div class="hc-kpi-card">
        <div class="hc-kpi-top">
          <span class="hc-kpi-label">HOSPITAL BEDS</span>
          <span class="hc-kpi-scope-tag">${scopeLabel}</span>
        </div>
        <div class="hc-kpi-value-wrap">
          <span class="hc-kpi-num">${bedsCount.toLocaleString()}</span>
          <span class="hc-kpi-pill pill-indigo">${icuBeds} ICU</span>
        </div>
        <span class="hc-kpi-sub">Physical operational bed capacity (MOH Malaysia)</span>
      </div>

      <!-- Card 3: Healthcare Access -->
      <div class="hc-kpi-card">
        <div class="hc-kpi-top">
          <span class="hc-kpi-label">HEALTHCARE ACCESS RATE</span>
          <span class="hc-kpi-scope-tag">${scopeLabel}</span>
        </div>
        <div class="hc-kpi-value-wrap">
          <span class="hc-kpi-num">${accessPct.toFixed(1)}%</span>
          <span class="hc-kpi-pill pill-emerald">Within 5km</span>
        </div>
        <span class="hc-kpi-sub">${immediatePct.toFixed(1)}% within ≤2km immediate walkable/transit reach</span>
      </div>

      <!-- Card 4: Bed Occupancy Rate -->
      <div class="hc-kpi-card">
        <div class="hc-kpi-top">
          <span class="hc-kpi-label">BED OCCUPANCY RATE (BOR)</span>
          <span class="hc-kpi-scope-tag">${scopeLabel}</span>
        </div>
        <div class="hc-kpi-value-wrap">
          <span class="hc-kpi-num">${bor.toFixed(1)}%</span>
          <span class="hc-kpi-pill ${borBadgeClass}">${bor >= 75 ? 'High Load' : bor >= 50 ? 'Moderate' : 'Headroom'}</span>
        </div>
        <span class="hc-kpi-sub">Overall clinical utilisation (MOH, not tourist demand)</span>
      </div>
    `;
  }
}
