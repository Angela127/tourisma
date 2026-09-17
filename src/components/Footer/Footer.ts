import './footer.css';
import { createElement, Feather } from 'lucide';

export interface FooterProps {
  copyrightText?: string;
  taglineText?: string;
  dataAsOfText?: string;
}

export class Footer {
  public readonly element: HTMLElement;
  private readonly copyrightElement: HTMLSpanElement;
  private readonly taglineElement: HTMLSpanElement;
  private readonly dataAsOfElement: HTMLSpanElement;

  constructor(props: FooterProps = {}) {
    const {
      copyrightText = 'Tourisma © 2024',
      taglineText = 'Tourism Intelligence for a Better Tomorrow',
      dataAsOfText = 'Data as of Dec 2024',
    } = props;

    this.element = document.createElement('footer');
    this.element.className = 'footer-container';
    this.element.setAttribute('role', 'contentinfo');

    const leftContent = document.createElement('div');
    leftContent.className = 'footer-left-content';

    // Lucide icon
    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'footer-icon-wrapper';
    iconWrapper.setAttribute('aria-hidden', 'true');

    const featherIcon = createElement(Feather, {
      class: 'footer-icon',
      width: 14,
      height: 14,
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

    leftContent.appendChild(iconWrapper);
    leftContent.appendChild(this.copyrightElement);
    leftContent.appendChild(divider);
    leftContent.appendChild(this.taglineElement);

    // Right Content
    const rightContent = document.createElement('div');
    rightContent.className = 'footer-right-content';

    this.dataAsOfElement = document.createElement('span');
    this.dataAsOfElement.className = 'footer-data-as-of';
    this.dataAsOfElement.textContent = dataAsOfText;

    rightContent.appendChild(this.dataAsOfElement);

    this.element.appendChild(leftContent);
    this.element.appendChild(rightContent);
  }

  public setText(copyright?: string, tagline?: string, dataAsOf?: string): void {
    if (copyright !== undefined) {
      this.copyrightElement.textContent = copyright;
    }
    if (tagline !== undefined) {
      this.taglineElement.textContent = tagline;
    }
    if (dataAsOf !== undefined) {
      this.dataAsOfElement.textContent = dataAsOf;
    }
  }
}
