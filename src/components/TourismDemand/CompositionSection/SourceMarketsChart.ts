import { TOP_15_SOURCE_MARKETS } from '../../../data/tourismDemandData';

export type SourceMarketMetric = 'arrivals' | 'yield';

export class SourceMarketsChart {
  public readonly element: HTMLElement;
  private currentMetric: SourceMarketMetric = 'arrivals';
  private listContainer: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card';

    // Header with Toggle
    const header = document.createElement('div');
    header.className = 'demand-card-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'demand-card-title-group';
    titleGroup.innerHTML = `
      <h3 class="demand-card-title">Top 15 International Source Markets</h3>
      <span class="demand-card-desc">Volume vs. Yield Comparison</span>
    `;

    // Segmented Toggle
    const toggle = document.createElement('div');
    toggle.className = 'segmented-control';
    toggle.innerHTML = `
      <button class="segmented-btn active" data-metric="arrivals">Arrivals (M)</button>
      <button class="segmented-btn" data-metric="yield">Receipts / Vis. (RM)</button>
    `;

    toggle.querySelectorAll('.segmented-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const metric = target.getAttribute('data-metric') as SourceMarketMetric;
        if (metric && metric !== this.currentMetric) {
          this.currentMetric = metric;
          toggle.querySelectorAll('.segmented-btn').forEach((b) => b.classList.remove('active'));
          target.classList.add('active');
          this.renderList();
        }
      });
    });

    header.appendChild(titleGroup);
    header.appendChild(toggle);

    this.listContainer = document.createElement('div');
    this.listContainer.className = 'source-markets-list';

    // Contrast Policy Callout Strip
    const callout = document.createElement('div');
    callout.className = 'contrast-callout-strip';
    callout.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span><strong>Key Policy Insight:</strong> Short-haul ASEAN drives 70%+ of total volume, but long-haul markets (Saudi Arabia, UK, Germany, Australia) deliver up to 5.7× higher expenditure per visitor.</span>
    `;

    this.element.appendChild(header);
    this.element.appendChild(this.listContainer);

    if (TOP_15_SOURCE_MARKETS.length > 0) {
      this.element.appendChild(callout);
    }

    this.renderList();
  }

  private renderList(): void {
    const isYield = this.currentMetric === 'yield';
    const sortedData = [...TOP_15_SOURCE_MARKETS].sort((a, b) => {
      return isYield
        ? b.receiptsPerArrival - a.receiptsPerArrival
        : b.arrivals - a.arrivals;
    });

    if (sortedData.length === 0) {
      this.listContainer.innerHTML = `
        <div class="demand-empty-state">
          <svg class="demand-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span class="demand-empty-state-title">No source market data available</span>
          <span class="demand-empty-state-desc">Top international origin markets and yield metrics will appear once data is connected.</span>
        </div>
      `;
      return;
    }

    const maxVal = isYield
      ? Math.max(...sortedData.map((d) => d.receiptsPerArrival))
      : Math.max(...sortedData.map((d) => d.arrivals));

    this.listContainer.innerHTML = sortedData
      .map((item, index) => {
        const val = isYield ? item.receiptsPerArrival : item.arrivals;
        const pct = ((val / maxVal) * 100).toFixed(1);
        const formattedVal = isYield
          ? `RM ${item.receiptsPerArrival.toLocaleString()}`
          : `${item.arrivals.toFixed(2)}M`;

        return `
          <div class="source-market-row" title="${item.country}: ${item.arrivals}M arrivals, RM ${item.receipts}B receipts, RM ${item.receiptsPerArrival}/vis, avg stay ${item.avgStayNights} nights">
            <span class="source-rank">#${index + 1}</span>
            <span class="source-flag">${item.flag}</span>
            <span class="source-name">${item.country}</span>
            <div class="source-bar-wrapper">
              <div
                class="source-bar-fill ${isYield ? 'yield-mode' : 'volume-mode'}"
                style="width: ${pct}%;"
              ></div>
            </div>
            <span class="source-value">${formattedVal}</span>
          </div>
        `;
      })
      .join('');
  }
}
