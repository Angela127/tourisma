import './destinations.css';

export class DestinationsPage {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'destinations-page';
  }
}

