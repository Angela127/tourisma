import { DESTINATION_PROFILES_DATA, type QuadrantProfileSummary } from '../../../data/overviewData';

export class DestinationProfilesCard {
  public readonly element: HTMLElement;
  private profiles: QuadrantProfileSummary[];

  constructor(profiles: QuadrantProfileSummary[] = DESTINATION_PROFILES_DATA) {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.profiles = profiles;
    this.render();
  }

  public updateData(profiles: QuadrantProfileSummary[]): void {
    this.profiles = profiles;
    this.render();
  }

  private render(): void {
    const listHtml = this.profiles.map((p) => `
      <div class="profile-cluster-row" title="${p.states.join(', ')}">
        <div class="profile-header-line">
          <span class="profile-cluster-title">
            <span class="cluster-dot ${p.colorClass}"></span>
            ${p.label}
          </span>
          <span class="profile-cluster-pct">${p.percentage}%</span>
        </div>
        <div class="profile-track">
          <div class="profile-fill ${p.colorClass}" style="width: ${p.percentage}%;"></div>
        </div>
      </div>
    `).join('');

    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">DESTINATION READINESS PROFILES</h3>
        <span class="bottom-card-subtitle">Cluster distribution of states (16 states)</span>
      </div>
      <div class="bottom-card-list">
        ${listHtml}
      </div>
    `;
  }
}
