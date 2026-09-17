import { createElement, Menu } from 'lucide';

export interface HeaderTitleProps {
  initialTitle?: string;
  initialSubtitle?: string;
  onMenuToggle?: () => void;
}

export class HeaderTitle {
  public readonly element: HTMLElement;
  private readonly titleElement: HTMLElement;
  private readonly subtitleElement: HTMLElement;

  constructor(props: HeaderTitleProps = {}) {
    const {
      initialTitle = 'GLOBAL OVERVIEW',
      initialSubtitle = 'Tourism Performance at a Glance',
      onMenuToggle,
    } = props;

    this.element = document.createElement('div');
    this.element.className = 'header-title-section';

    // Menu toggle button with Lucide Menu icon
    const menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'header-menu-btn';
    menuBtn.setAttribute('aria-label', 'Toggle sidebar navigation');

    const menuIcon = createElement(Menu, {
      class: 'header-menu-icon',
      width: 20,
      height: 20,
      'stroke-width': 2,
    });
    menuBtn.appendChild(menuIcon);

    if (onMenuToggle) {
      menuBtn.addEventListener('click', () => {
        onMenuToggle();
      });
    }

    // Text group
    const textGroup = document.createElement('div');
    textGroup.className = 'header-text-group';

    this.titleElement = document.createElement('h2');
    this.titleElement.className = 'header-main-title';
    this.titleElement.textContent = initialTitle;

    this.subtitleElement = document.createElement('p');
    this.subtitleElement.className = 'header-sub-title';
    this.subtitleElement.textContent = initialSubtitle;

    textGroup.appendChild(this.titleElement);
    textGroup.appendChild(this.subtitleElement);

    this.element.appendChild(menuBtn);
    this.element.appendChild(textGroup);
  }

  public updateTitle(title: string, subtitle?: string): void {
    this.titleElement.textContent = title;
    if (subtitle !== undefined) {
      this.subtitleElement.textContent = subtitle;
    }
  }
}
