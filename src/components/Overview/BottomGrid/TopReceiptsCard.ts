export class TopReceiptsCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'bottom-insight-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="bottom-card-header">
        <h3 class="bottom-card-title">TOP TOURISM RECEIPTS BY STATE</h3>
        <span class="bottom-card-subtitle">Tourism receipts (RM billion)</span>
      </div>
      <div class="bottom-card-list">
        <div class="receipts-bar-row">
          <div class="receipts-label-line">
            <span class="state-name-text">Kuala Lumpur</span>
            <span class="state-receipt-val">RM16.9B</span>
          </div>
          <div class="receipts-track">
            <div class="receipts-fill primary" style="width: 100%;"></div>
          </div>
        </div>

        <div class="receipts-bar-row">
          <div class="receipts-label-line">
            <span class="state-name-text">Selangor</span>
            <span class="state-receipt-val">RM15.8B</span>
          </div>
          <div class="receipts-track">
            <div class="receipts-fill primary" style="width: 93%;"></div>
          </div>
        </div>

        <div class="receipts-bar-row">
          <div class="receipts-label-line">
            <span class="state-name-text">Pahang</span>
            <span class="state-receipt-val">RM9.8B</span>
          </div>
          <div class="receipts-track">
            <div class="receipts-fill secondary" style="width: 58%;"></div>
          </div>
        </div>

        <div class="receipts-bar-row">
          <div class="receipts-label-line">
            <span class="state-name-text">Johor</span>
            <span class="state-receipt-val">RM8.4B</span>
          </div>
          <div class="receipts-track">
            <div class="receipts-fill secondary" style="width: 50%;"></div>
          </div>
        </div>
      </div>
    `;
  }
}
