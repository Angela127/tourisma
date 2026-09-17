import './header.css';
import { HeaderTitle, type HeaderTitleProps } from './HeaderTitle';
import { HeaderActions, type HeaderActionsProps } from './HeaderActions';

export interface HeaderProps {
  titleProps?: HeaderTitleProps;
  actionProps?: HeaderActionsProps;
}

export class Header {
  public readonly element: HTMLElement;
  public readonly titleSection: HeaderTitle;
  public readonly actionsSection: HeaderActions;

  constructor(props: HeaderProps = {}) {
    this.element = document.createElement('header');
    this.element.className = 'header-container';

    this.titleSection = new HeaderTitle(props.titleProps);
    this.actionsSection = new HeaderActions(props.actionProps);

    this.element.appendChild(this.titleSection.element);
    this.element.appendChild(this.actionsSection.element);
  }

  public setTitle(title: string, subtitle?: string): void {
    this.titleSection.updateTitle(title, subtitle);
  }

  public setDateRange(dateRange: string): void {
    this.actionsSection.setDateRange(dateRange);
  }
}
