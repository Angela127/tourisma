import { PURPOSE_OF_VISIT_DATA } from '../../../data/tourismDemandData';

export class PurposeSplitCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header
    const header = document.createElement('div');
    header.className = 'demand-card-header';
    header.innerHTML = `
      <div class="demand-card-title-group">
        <h3 class="demand-card-title">Purpose of Visit Split</h3>
        <span class="demand-card-desc">Visitor motivation distribution & volume shares</span>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'purpose-split-layout';

    // Stacked Segmented Strip
    const stripHtml = PURPOSE_OF_VISIT_DATA.map((item) => `
      <div
        class="purpose-strip-seg"
        style="width: ${item.sharePct}%; background-color: ${item.color};"
        title="${item.purpose}: ${item.sharePct}% (${item.volumeM}M visitors)"
      ></div>
    `).join('');

    // Detailed Item Rows
    const itemsHtml = PURPOSE_OF_VISIT_DATA.map((item) => `
      <div class="purpose-item-detail">
        <div class="purpose-info-left">
          <span class="purpose-color-dot" style="background-color: ${item.color};"></span>
          <div style="display: flex; flex-direction: column;">
            <span class="purpose-label-title">${item.purpose}</span>
            <span style="font-size: 0.65rem; color: #64748b;">${item.volumeM}M visitors • ${item.description}</span>
          </div>
        </div>
        <span class="purpose-pct-val">${item.sharePct}%</span>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="purpose-stacked-strip">
        ${stripHtml}
      </div>
      <div class="purpose-items-grid">
        ${itemsHtml}
      </div>
    `;

    this.element.appendChild(header);
    this.element.appendChild(body);
  }
}
