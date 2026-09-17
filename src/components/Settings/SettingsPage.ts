import './settings.css';
import { DisplaySettingsCard } from './DisplaySettingsCard';
import { ThresholdsSettingsCard } from './ThresholdsSettingsCard';
import { IndexWeightsCard } from './IndexWeightsCard';
import { DataControlsCard } from './DataControlsCard';
import { AboutInfoCard } from './AboutInfoCard';

export class SettingsPage {
  public readonly element: HTMLElement;
  private displayCard: DisplaySettingsCard;
  private thresholdsCard: ThresholdsSettingsCard;
  private indexWeightsCard: IndexWeightsCard;
  private dataControlsCard: DataControlsCard;
  private aboutCard: AboutInfoCard;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'settings-page';

    this.displayCard = new DisplaySettingsCard();
    this.thresholdsCard = new ThresholdsSettingsCard();
    this.indexWeightsCard = new IndexWeightsCard();
    this.dataControlsCard = new DataControlsCard();
    this.aboutCard = new AboutInfoCard();

    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Page Header
    const pageHeader = document.createElement('div');
    pageHeader.className = 'set-section-block';
    pageHeader.innerHTML = `
      <div class="set-section-header">
        <div class="set-section-title-wrap">
          <h2 class="set-section-title">Platform Settings & Model Parameter Console</h2>
          <span class="set-section-subtitle">Calibrate analytical thresholds, multi-criteria weights, display preferences, and ingestion feeds</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.72rem; color:#0b57d0; background:#eff6ff; border:1px solid #bfdbfe; padding:2px 8px; border-radius:4px; font-weight:700;">
            Real-time Parameter Binding
          </span>
        </div>
      </div>
    `;
    this.element.appendChild(pageHeader);

    // Section 1: Display & Localization Preferences
    const secDisplay = document.createElement('div');
    secDisplay.className = 'set-section-block';
    secDisplay.appendChild(this.displayCard.element);
    this.element.appendChild(secDisplay);

    // Section 2: Threshold Parameters & Warning Sensitivity (Analytically Meaningful!)
    const secThresholds = document.createElement('div');
    secThresholds.className = 'set-section-block';
    secThresholds.appendChild(this.thresholdsCard.element);
    this.element.appendChild(secThresholds);

    // Section 3: Composite Index Weights (Sliders sum to 100%)
    const secWeights = document.createElement('div');
    secWeights.className = 'set-section-block';
    secWeights.appendChild(this.indexWeightsCard.element);
    this.element.appendChild(secWeights);

    // Section 4: Data Ingestion & Cache Controls
    const secData = document.createElement('div');
    secData.className = 'set-section-block';
    secData.appendChild(this.dataControlsCard.element);
    this.element.appendChild(secData);

    // Section 5: About & Data Attribution
    const secAbout = document.createElement('div');
    secAbout.className = 'set-section-block';
    secAbout.appendChild(this.aboutCard.element);
    this.element.appendChild(secAbout);
  }
}
