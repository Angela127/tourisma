import { TOP_TOURISM_RECEIPTS, type TopReceiptsItem } from '../../../data/overviewData';

export class TopReceiptsCard {
  public readonly element: HTMLElement;
  private items: TopReceiptsItem[];

  constructor(items: TopReceiptsItem[] = TOP_TOURISM_RECEIPTS) {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.items = items;
    this.render();
  }

  public updateData(items: TopReceiptsItem[]): void {
    this.items = items;
    this.render();
  }

  private render(): void {
    const listHtml = this.items.slice(0, 4).map((item) => `
      <div class="receipts-bar-row">
        <div class="receipts-label-line">
          <span class="state-name-text">${item.name}</span>
          <span class="state-receipt-val">RM${item.receiptsRmB.toFixed(1)}B</span>
        </div>
        <div class="receipts-track">
          <div class="receipts-fill ${item.colorClass}" style="width: ${item.percentageWidth}%;"></div>
        </div>
      </div>
    `).join('');

    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">TOP TOURISM RECEIPTS BY STATE</h3>
        <span class="bottom-card-subtitle">Tourism receipts (RM billion)</span>
      </div>
      <div class="bottom-card-list">
        ${listHtml}
      </div>
    `;
  }
}
