export type ScenarioTarget = '+10%' | '+20%' | '+30%';

export class GrowthScenarioCard {
  public readonly element: HTMLElement;
  private selectedScenario: ScenarioTarget = '+10%';

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">GROWTH SCENARIO</h3>
        <span class="bottom-card-subtitle">Projected tourism expenditure (RM billion)</span>
      </div>

      <div class="scenario-toggle-strip">
        <button class="scenario-pill-btn ${this.selectedScenario === '+10%' ? 'active' : ''}" data-target="+10%">+10%</button>
        <button class="scenario-pill-btn ${this.selectedScenario === '+20%' ? 'active' : ''}" data-target="+20%">+20%</button>
        <button class="scenario-pill-btn ${this.selectedScenario === '+30%' ? 'active' : ''}" data-target="+30%">+30%</button>
      </div>

      <div class="scenario-bars-stage">
        <div class="scenario-bar-col">
          <span class="bar-value-label">121.3</span>
          <div class="scenario-bar-track">
            <div class="scenario-bar-fill baseline" style="height: 65%;"></div>
          </div>
          <span class="bar-name-label">Baseline</span>
        </div>

        <div class="scenario-bar-col">
          <span class="bar-value-label ${this.selectedScenario === '+10%' ? 'highlight' : ''}">133.4</span>
          <div class="scenario-bar-track">
            <div class="scenario-bar-fill ${this.selectedScenario === '+10%' ? 'active' : 'subtle'}" style="height: 72%;"></div>
          </div>
          <span class="bar-name-label">+10%</span>
        </div>

        <div class="scenario-bar-col">
          <span class="bar-value-label ${this.selectedScenario === '+20%' ? 'highlight' : ''}">145.5</span>
          <div class="scenario-bar-track">
            <div class="scenario-bar-fill ${this.selectedScenario === '+20%' ? 'active' : 'subtle'}" style="height: 80%;"></div>
          </div>
          <span class="bar-name-label">+20%</span>
        </div>

        <div class="scenario-bar-col">
          <span class="bar-value-label ${this.selectedScenario === '+30%' ? 'highlight' : ''}">157.6</span>
          <div class="scenario-bar-track">
            <div class="scenario-bar-fill ${this.selectedScenario === '+30%' ? 'active' : 'subtle'}" style="height: 92%;"></div>
          </div>
          <span class="bar-name-label">+30%</span>
        </div>
      </div>
    `;

    // Attach click events
    this.element.querySelectorAll('.scenario-pill-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-target') as ScenarioTarget;
        if (target) {
          this.selectedScenario = target;
          this.render();
        }
      });
    });
  }
}
