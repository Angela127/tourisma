import { SUSTAINABILITY_METHODOLOGY } from '../../data/sustainabilityData';

export class MethodologyPanel {
  public readonly element: HTMLElement;
  private isOpen: boolean = true;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'sus-methodology-panel';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'sus-methodology-header';
    header.innerHTML = `
      <div class="sus-methodology-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>${SUSTAINABILITY_METHODOLOGY.title}</span>
        <span style="font-size:0.7rem; font-weight:600; color:#64748b;">(${SUSTAINABILITY_METHODOLOGY.subtitle})</span>
      </div>
      <svg id="meth-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: ${this.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}; transition: transform 0.2s ease;">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    const content = document.createElement('div');
    content.className = 'sus-methodology-content';
    content.style.display = this.isOpen ? 'flex' : 'none';

    const weightCards = SUSTAINABILITY_METHODOLOGY.weights
      .map(
        (w) => `
        <div class="sus-weight-card">
          <span class="sus-weight-pct">${w.weight}</span>
          <span class="sus-weight-name">${w.dimension}</span>
          <span class="sus-weight-sub">${w.indicators}</span>
        </div>
      `
      )
      .join('');

    content.innerHTML = `
      <p class="sus-methodology-desc">${SUSTAINABILITY_METHODOLOGY.description}</p>
      <div class="sus-weights-grid">
        ${weightCards}
      </div>
      <div class="sus-disclaimer-note">${SUSTAINABILITY_METHODOLOGY.disclaimer}</div>
    `;

    header.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      content.style.display = this.isOpen ? 'flex' : 'none';
      const arrow = header.querySelector('#meth-arrow') as SVGElement;
      if (arrow) {
        arrow.style.transform = this.isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });

    this.element.appendChild(header);
    this.element.appendChild(content);
  }
}
