import './sidebar.css';
import { NAVIGATION_ITEMS } from '../../data/navigationItems';
import type { NavItemClickHandler } from '../../types/navigation';
import { createSidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { createSidebarIllustration } from './SidebarIllustration';

export class Sidebar {
  public readonly element: HTMLElement;
  private readonly nav: SidebarNav;

  constructor(onNavChange?: NavItemClickHandler) {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar-container';

    // 1. Header (Logo & Brand)
    const headerElement = createSidebarLogo();
    this.element.appendChild(headerElement);

    // 2. Navigation List
    this.nav = new SidebarNav(NAVIGATION_ITEMS, 'overview', (selectedId) => {
      if (onNavChange) {
        onNavChange(selectedId);
      }
    });
    this.element.appendChild(this.nav.element);

    // 3. Bottom Card (Illustration)
    const bottomWrapper = document.createElement('div');
    bottomWrapper.className = 'sidebar-bottom';
    bottomWrapper.appendChild(createSidebarIllustration());
    this.element.appendChild(bottomWrapper);
  }

  public getActiveNavId(): string {
    return this.nav.getActiveId();
  }

  public setActiveNavId(id: string): void {
    this.nav.setActiveId(id);
  }

  public toggleCollapse(): void {
    this.element.classList.toggle('collapsed');
  }

  public isCollapsed(): boolean {
    return this.element.classList.contains('collapsed');
  }
}
