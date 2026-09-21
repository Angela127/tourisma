export class AccessibilityPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accessibility-page';
  }
}
