import { createElement } from 'lucide';
import type { NavItemConfig, NavItemClickHandler } from '../../types/navigation';

export class SidebarNavItem {
  public readonly element: HTMLButtonElement;
  private readonly config: NavItemConfig;

  constructor(config: NavItemConfig, isActive: boolean, onClick: NavItemClickHandler) {
    this.config = config;

    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = `sidebar-nav-item ${isActive ? 'active' : ''}`;
    this.element.setAttribute('data-id', config.id);
    this.element.setAttribute('aria-label', config.label);
    this.element.setAttribute('aria-current', isActive ? 'page' : 'false');

    // Create Lucide icon element
    const iconElement = createElement(config.icon, {
      class: 'sidebar-nav-icon',
      'stroke-width': 2.2,
      width: 20,
      height: 20,
    });

    // Label
    const labelElement = document.createElement('span');
    labelElement.className = 'sidebar-nav-label';
    labelElement.textContent = config.label;

    this.element.appendChild(iconElement);
    this.element.appendChild(labelElement);

    this.element.addEventListener('click', () => {
      onClick(this.config.id);
    });
  }

  public setActive(isActive: boolean): void {
    if (isActive) {
      this.element.classList.add('active');
      this.element.setAttribute('aria-current', 'page');
    } else {
      this.element.classList.remove('active');
      this.element.setAttribute('aria-current', 'false');
    }
  }

  public getId(): string {
    return this.config.id;
  }
}
