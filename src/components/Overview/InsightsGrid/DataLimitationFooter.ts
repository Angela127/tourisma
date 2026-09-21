import { createElement, Info } from 'lucide';
import { DATA_LIMITATION_NOTE } from '../../../data/overviewData';

export class DataLimitationFooter {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'data-limitation-strip';
    this.element.setAttribute('role', 'note');

    const icon = createElement(Info, {
      width: 14,
      height: 14,
      'stroke-width': 2,
      class: 'limitation-icon',
    });

    const prefix = document.createElement('strong');
    prefix.className = 'limitation-prefix';
    prefix.textContent = 'What this page does not tell you:';

    const text = document.createElement('span');
    text.className = 'limitation-text';
    text.textContent = ` ${DATA_LIMITATION_NOTE}`;

    this.element.appendChild(icon);
    this.element.appendChild(prefix);
    this.element.appendChild(text);
  }
}
