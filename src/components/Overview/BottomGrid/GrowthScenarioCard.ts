import { GROWTH_SCENARIOS, type GrowthScenarioProjection } from '../../../data/overviewData';

export class GrowthScenarioCard {
  public readonly element: HTMLElement;
  private selectedScenario: string = '+10%';
  private scenarios: GrowthScenarioProjection[];

  constructor(scenarios: GrowthScenarioProjection[] = GROWTH_SCENARIOS) {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.scenarios = scenarios;
    this.render();
  }

  public updateData(scenarios: GrowthScenarioProjection[]): void {
    this.scenarios = scenarios;
    this.render();
  }

  private render(): void {
    const maxVal = Math.max(...this.scenarios.map((s) => s.projectedReceiptsRmB), 170.0);
    const nonBaseline = this.scenarios.filter((s) => !s.isBaseline);

    const buttonsHtml = nonBaseline.map((s) => `
      <button class="scenario-pill-btn ${this.selectedScenario === s.targetLabel ? 'active' : ''}" data-target="${s.targetLabel}">${s.targetLabel}</button>
    `).join('');

    const barsHtml = this.scenarios.map((s) => {
      const heightPct = Math.round((s.projectedReceiptsRmB / maxVal) * 100);
      const isSelected = this.selectedScenario === s.targetLabel;
      const isBase = s.isBaseline;

      let barClass = 'scenario-bar-fill baseline';
      if (!isBase) {
        barClass = `scenario-bar-fill ${isSelected ? 'active' : 'subtle'}`;
      }

      return `
        <div class="scenario-bar-col">
          <span class="bar-value-label ${isSelected ? 'highlight' : ''}">${s.projectedReceiptsRmB.toFixed(1)}</span>
          <div class="scenario-bar-track">
            <div class="${barClass}" style="height: ${heightPct}%;"></div>
          </div>
          <span class="bar-name-label">${s.targetLabel}</span>
        </div>
      `;
    }).join('');

    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">GROWTH SCENARIO</h3>
        <span class="bottom-card-subtitle">Projected tourism expenditure (RM billion)</span>
      </div>

      <div class="scenario-toggle-strip">
        ${buttonsHtml}
      </div>

      <div class="scenario-bars-stage">
        ${barsHtml}
      </div>
    `;

    // Attach click events
    this.element.querySelectorAll('.scenario-pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-target');
        if (target) {
          this.selectedScenario = target;
          this.render();
        }
      });
    });
  }
}
