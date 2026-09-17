export class DestinationProfilesCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">DESTINATION READINESS PROFILES</h3>
        <span class="bottom-card-subtitle">Cluster distribution of states</span>
      </div>
      <div class="bottom-card-list">
        <div class="profile-cluster-row">
          <div class="profile-header-line">
            <span class="profile-cluster-title">
              <span class="cluster-dot high-demand-high-cap"></span>
              High Demand / High Capacity
            </span>
            <span class="profile-cluster-pct">28%</span>
          </div>
          <div class="profile-track">
            <div class="profile-fill high-demand-high-cap" style="width: 28%;"></div>
          </div>
        </div>

        <div class="profile-cluster-row">
          <div class="profile-header-line">
            <span class="profile-cluster-title">
              <span class="cluster-dot high-demand-low-cap"></span>
              High Demand / Low Capacity
            </span>
            <span class="profile-cluster-pct">34%</span>
          </div>
          <div class="profile-track">
            <div class="profile-fill high-demand-low-cap" style="width: 34%;"></div>
          </div>
        </div>

        <div class="profile-cluster-row">
          <div class="profile-header-line">
            <span class="profile-cluster-title">
              <span class="cluster-dot low-demand-high-pot"></span>
              Low Demand / High Potential
            </span>
            <span class="profile-cluster-pct">22%</span>
          </div>
          <div class="profile-track">
            <div class="profile-fill low-demand-high-pot" style="width: 22%;"></div>
          </div>
        </div>

        <div class="profile-cluster-row">
          <div class="profile-header-line">
            <span class="profile-cluster-title">
              <span class="cluster-dot low-demand-low-read"></span>
              Low Demand / Low Readiness
            </span>
            <span class="profile-cluster-pct">16%</span>
          </div>
          <div class="profile-track">
            <div class="profile-fill low-demand-low-read" style="width: 16%;"></div>
          </div>
        </div>
      </div>
    `;
  }
}
