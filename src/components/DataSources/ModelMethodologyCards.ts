import {
  MODEL_METHODOLOGY_CARDS,
} from '../../data/dataSourcesData';

export class ModelMethodologyCards {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ds-section-block';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'methodology-cards-grid';

    MODEL_METHODOLOGY_CARDS.forEach((model) => {
      const card = document.createElement('div');
      card.className = 'model-spec-card';

      card.innerHTML = `
        <div class="model-header-row">
          <div>
            <span style="font-size:0.64rem; font-weight:800; color:#0b57d0; text-transform:uppercase; letter-spacing:0.04em;">Model Architecture</span>
            <div class="model-title-text">${model.modelName}</div>
          </div>
          <span style="font-size:0.65rem; background:#eff6ff; color:#1d4ed8; padding:2px 6px; border-radius:4px; font-weight:700; border:1px solid #bfdbfe;">Validated</span>
        </div>

        <div class="model-field-block">
          <span class="model-field-label">Purpose & Objective:</span>
          <span class="model-field-value">${model.purpose}</span>
        </div>

        <div class="model-field-block">
          <span class="model-field-label">Methodology & Mathematical Formulation:</span>
          <span class="model-field-value" style="font-family:'SFMono-Regular',Consolas,monospace; font-size:0.68rem; background:#f8fafc; padding:4px 6px; border-radius:4px; border:1px solid #e2e8f0;">
            ${model.method}
          </span>
        </div>

        <div class="model-field-block">
          <span class="model-field-label">Input Features (${model.inputFeatures.length}):</span>
          <div class="model-feature-tags">
            ${model.inputFeatures
              .map((f) => `<span class="feature-tag-pill">${f}</span>`)
              .join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div class="model-field-block">
            <span class="model-field-label">Training Period:</span>
            <span class="model-field-value" style="font-weight:600;">${model.trainingPeriod}</span>
          </div>
          <div class="model-field-block">
            <span class="model-field-label">Validation Result:</span>
            <span class="model-field-value" style="font-weight:750; color:#15803d;">${model.validationResult}</span>
          </div>
        </div>

        <div class="model-field-block">
          <span class="model-field-label">Validation Approach:</span>
          <span class="model-field-value">${model.validationApproach}</span>
        </div>

        <div class="model-caveat-box">
          <strong>Assumption & Caveat:</strong> ${model.assumptionsAndCaveats}
        </div>
      `;

      grid.appendChild(card);
    });

    this.element.appendChild(grid);
  }
}
