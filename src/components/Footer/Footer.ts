import './footer.css';
import { createElement, Feather } from 'lucide';

export interface FooterProps {
  copyrightText?: string;
  taglineText?: string;
}

export class Footer {
  public readonly element: HTMLElement;
  private readonly copyrightElement: HTMLSpanElement;
  private readonly taglineElement: HTMLSpanElement;

  constructor(props: FooterProps = {}) {
    const {
      copyrightText = 'Tourisma © 2026',
      taglineText = 'Tourism Intelligence for a Better Tomorrow',
    } = props;

    this.element = document.createElement('footer');
    this.element.className = 'footer-container';
    this.element.setAttribute('role', 'contentinfo');

    const content = document.createElement('div');
    content.className = 'footer-content';

    // Lucide icon
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'footer-icon-wrapper';
    iconWrapper.setAttribute('aria-hidden', 'true');

    const featherIcon = createElement(Feather, {
      class: 'footer-icon',
      width: 15,
      height: 15,
      'stroke-width': 2.2,
    });
    iconWrapper.appendChild(featherIcon);

    // Copyright text
    this.copyrightElement = document.createElement('span');
    this.copyrightElement.className = 'footer-copyright';
    this.copyrightElement.textContent = copyrightText;

    // Vertical separator
    const divider = document.createElement('span');
    divider.className = 'footer-divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = '|';

    // Tagline text
    this.taglineElement = document.createElement('span');
    this.taglineElement.className = 'footer-tagline';
    this.taglineElement.textContent = taglineText;

    content.appendChild(iconWrapper);
    content.appendChild(this.copyrightElement);
    content.appendChild(divider);
    content.appendChild(this.taglineElement);

    this.element.appendChild(content);
  }

  public setText(copyright?: string, tagline?: string): void {
    if (copyright !== undefined) {
      this.copyrightElement.textContent = copyright;
    }
    if (tagline !== undefined) {
      this.taglineElement.textContent = tagline;
    }
  }
}
