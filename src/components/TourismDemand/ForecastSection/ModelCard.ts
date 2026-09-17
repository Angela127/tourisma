import { FORECAST_MODEL_CARD } from '../../../data/tourismDemandData';

export class ModelCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'model-card-box';

    const m = FORECAST_MODEL_CARD;

    this.element.innerHTML = `
      <div class="model-card-header">
        <span class="model-card-title">Forecast Model Specification Card</span>
        <span style="font-size: 0.7rem; color: #64748b; font-weight: 500;">Last Calibrated: ${m.lastUpdated}</span>
      </div>

      <div class="model-card-meta-grid">
        <div class="model-meta-item">
          <span class="model-meta-label">Methodology</span>
          <span class="model-meta-val">${m.algorithm}</span>
        </div>
        <div class="model-meta-item">
          <span class="model-meta-label">Training Period</span>
          <span class="model-meta-val">${m.trainingWindow}</span>
        </div>
        <div class="model-meta-item">
          <span class="model-meta-label">Validation Error</span>
          <span class="model-meta-val">MAPE: ${m.mape}% (RMSE: ${m.rmse}M, R²: ${m.rSquared})</span>
        </div>
        <div class="model-meta-item">
          <span class="model-meta-label">Validation Window</span>
          <span class="model-meta-val">${m.validationWindow}</span>
        </div>
      </div>

      <div class="model-limitations-row">
        <span class="limitations-title">What this model cannot account for (Model Limitations)</span>
        <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 3px;">
          ${m.limitations.map((lim) => `<li class="limitations-text">${lim}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}
