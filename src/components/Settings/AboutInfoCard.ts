import { settingsStore } from '../../data/settingsStore';

export class AboutInfoCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'set-card';
    this.render();
  }

  private render(): void {
    const about = settingsStore.getAboutInfo();
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'set-card-header';
    header.innerHTML = `
      <div class="set-card-title-group">
        <h3 class="set-card-title">About Tourisma & Attribution</h3>
        <span class="set-card-desc">Platform architecture, release build, and institutional governance</span>
      </div>
      <span style="font-size:0.68rem; background:#eff6ff; color:#0b57d0; border:1px solid #bfdbfe; padding:2px 8px; border-radius:4px; font-weight:700;">
        Official Release
      </span>
    `;
    this.element.appendChild(header);

    const specGrid = document.createElement('div');
    specGrid.className = 'about-spec-grid';

    specGrid.innerHTML = `
      <div class="about-spec-item">
        <span class="about-spec-label">Version</span>
        <span class="about-spec-value">${about.version}</span>
      </div>
      <div class="about-spec-item">
        <span class="about-spec-label">Release Build Date</span>
        <span class="about-spec-value">${about.buildDate}</span>
      </div>
      <div class="about-spec-item">
        <span class="about-spec-label">Development Team</span>
        <span class="about-spec-value">${about.teamName}</span>
      </div>
      <div class="about-spec-item">
        <span class="about-spec-label">Competition / Track</span>
        <span class="about-spec-value" style="font-size:0.7rem;">${about.competition}</span>
      </div>
    `;
    this.element.appendChild(specGrid);

    const attribution = document.createElement('div');
    attribution.className = 'about-attribution-box';
    attribution.innerHTML = `
      <strong style="display:block; margin-bottom:4px; font-size:0.75rem;">Official Data Attribution & Disclaimer:</strong>
      <p style="margin:0; font-size:0.72rem; line-height:1.45;">
        ${about.attribution}
      </p>
      <div style="margin-top:8px; display:flex; gap:16px; font-size:0.68rem; font-weight:700; color:#1e40af;">
        <span>• Department of Statistics Malaysia (DOSM)</span>
        <span>• Ministry of Tourism, Arts and Culture (MOTAC)</span>
        <span>• Malaysia Airports Holdings Berhad (MAHB)</span>
        <span>• Malaysian Association of Hotels (MAH)</span>
      </div>
    `;
    this.element.appendChild(attribution);
  }
}
