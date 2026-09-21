import './infrastructure.css';

export class InfrastructurePage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'infrastructure-page';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';
  }
}

