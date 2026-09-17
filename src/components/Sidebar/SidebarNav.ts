import type { NavItemConfig, NavItemClickHandler } from '../../types/navigation';
import { SidebarNavItem } from './SidebarNavItem';

export class SidebarNav {
  public readonly element: HTMLElement;
  private readonly items: Map<string, SidebarNavItem> = new Map();
  private activeId: string;
  private onSelect?: NavItemClickHandler;

  constructor(
    configs: NavItemConfig[],
    initialActiveId: string = 'overview',
    onSelect?: NavItemClickHandler
  ) {
    this.activeId = initialActiveId;
    this.onSelect = onSelect;

    this.element = document.createElement('nav');
    this.element.className = 'sidebar-nav';
    this.element.setAttribute('aria-label', 'Dashboard Main Navigation');

    const listElement = document.createElement('ul');
    listElement.className = 'sidebar-nav-list';

    configs.forEach((config) => {
      const li = document.createElement('li');
      li.className = 'sidebar-nav-item-wrapper';

      const navItem = new SidebarNavItem(
        config,
        config.id === this.activeId,
        (selectedId) => this.handleItemClick(selectedId)
      );

      this.items.set(config.id, navItem);
      li.appendChild(navItem.element);
      listElement.appendChild(li);
    });

    this.element.appendChild(listElement);
  }

  private handleItemClick(selectedId: string): void {
    if (selectedId === this.activeId) return;

    this.setActiveId(selectedId);
    if (this.onSelect) {
      this.onSelect(selectedId);
    }
  }

  public setActiveId(newActiveId: string): void {
    const prevItem = this.items.get(this.activeId);
    if (prevItem) {
      prevItem.setActive(false);
    }

    const nextItem = this.items.get(newActiveId);
    if (nextItem) {
      nextItem.setActive(true);
      this.activeId = newActiveId;
    }
  }

  public getActiveId(): string {
    return this.activeId;
  }
}
