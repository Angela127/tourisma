import { settingsStore } from '../../data/settingsStore';

export class DataControlsCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'set-card';
    this.render();
  }

  private render(): void {
    const dataCfg = settingsStore.getDataConfig();
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'set-card-header';
    header.innerHTML = `
      <div class="set-card-title-group">
        <h3 class="set-card-title">Data Ingestion, Telemetry & Cache Management</h3>
        <span class="set-card-desc">Source API connection status, automated refresh intervals, and client-side memory cache</span>
      </div>
      <span style="font-size:0.68rem; color:#15803d; background:#f0fdf4; border:1px solid #bbf7d0; padding:2px 8px; border-radius:4px; font-weight:700;">
        All Systems Nominal
      </span>
    `;
    this.element.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'data-controls-grid';

    // Left: Source Endpoints
    const leftCol = document.createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = '8px';

    leftCol.innerHTML = `
      <span style="font-size:0.72rem; font-weight:800; color:#334155; text-transform:uppercase;">
        Active Ingestion Endpoints (${dataCfg.apiEndpoints.length})
      </span>
      <div class="endpoint-list">
        ${dataCfg.apiEndpoints
          .map(
            (ep) => `
          <div class="endpoint-item">
            <div>
              <div class="endpoint-name">${ep.name}</div>
              <div class="endpoint-url">${ep.url}</div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="status-dot-online"></span>
              <span style="font-size:0.65rem; color:#15803d; font-weight:750; text-transform:uppercase;">Online</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
    grid.appendChild(leftCol);

    // Right: Refresh & Cache Controls
    const rightCol = document.createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.gap = '12px';

    rightCol.innerHTML = `
      <div>
        <span style="font-size:0.72rem; font-weight:800; color:#334155; text-transform:uppercase; display:block; margin-bottom:6px;">
          Telemetry Ingestion Cadence
        </span>
        <select class="form-select-control" id="refresh-interval-select" style="width:100%;">
          <option value="realtime" ${dataCfg.refreshInterval === 'realtime' ? 'selected' : ''}>Real-time WebSocket Streaming</option>
          <option value="5m" ${dataCfg.refreshInterval === '5m' ? 'selected' : ''}>Every 5 Minutes (High Cadence)</option>
          <option value="15m" ${dataCfg.refreshInterval === '15m' ? 'selected' : ''}>Every 15 Minutes (Standard)</option>
          <option value="1h" ${dataCfg.refreshInterval === '1h' ? 'selected' : ''}>Hourly Polling Batch</option>
          <option value="manual" ${dataCfg.refreshInterval === 'manual' ? 'selected' : ''}>Manual Refresh Only</option>
        </select>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 12px; display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; justify-content:space-between; font-size:0.72rem;">
          <span style="color:#64748b;">Cached Telemetry Records:</span>
          <strong style="color:#0f172a;">${dataCfg.cachedRecordsCount.toLocaleString()} items</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem;">
          <span style="color:#64748b;">Last Pipeline Ingestion:</span>
          <strong style="color:#0b57d0;">${dataCfg.lastSyncTimestamp}</strong>
        </div>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="display-toggle-btn" id="refresh-now-btn" style="flex:1;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Force Pipeline Sync
        </button>
        <button class="display-toggle-btn" id="purge-cache-btn" style="flex:1; color:#dc2626; border-color:#fca5a5;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Purge Cache
        </button>
      </div>
    `;

    rightCol.querySelector('#refresh-interval-select')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value as any;
      settingsStore.setRefreshInterval(val);
    });

    rightCol.querySelector('#refresh-now-btn')?.addEventListener('click', () => {
      settingsStore.refreshDataFeed();
      this.render();
    });

    rightCol.querySelector('#purge-cache-btn')?.addEventListener('click', () => {
      if (confirm('Purge local telemetry cache? Data will be re-fetched on next query.')) {
        settingsStore.clearTelemetryCache();
        this.render();
      }
    });

    grid.appendChild(rightCol);
    this.element.appendChild(grid);
  }
}
