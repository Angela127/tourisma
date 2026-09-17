import { settingsStore } from '../../data/settingsStore';

export class DisplaySettingsCard {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'set-card';
    this.render();
  }

  private render(): void {
    const display = settingsStore.getDisplay();
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'set-card-header';
    header.innerHTML = `
      <div class="set-card-title-group">
        <h3 class="set-card-title">Display & Localization Preferences</h3>
        <span class="set-card-desc">Visual appearance, denomination units, and regional format standards</span>
      </div>
      <span style="font-size:0.68rem; background:#eff6ff; color:#0b57d0; padding:2px 8px; border-radius:4px; font-weight:700;">
        Live Preference Engine
      </span>
    `;
    this.element.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'display-options-grid';

    // 1. Theme (Light vs Dark)
    const themeGroup = document.createElement('div');
    themeGroup.className = 'display-field-group';
    themeGroup.innerHTML = `
      <label class="display-field-label">Interface Theme</label>
      <div class="display-toggle-row">
        <button class="display-toggle-btn ${display.theme === 'light' ? 'active' : ''}" id="theme-light-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          Light Mode
        </button>
        <button class="display-toggle-btn ${display.theme === 'dark' ? 'active' : ''}" id="theme-dark-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          Dark Mode
        </button>
      </div>
    `;
    themeGroup.querySelector('#theme-light-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ theme: 'light' });
      this.render();
    });
    themeGroup.querySelector('#theme-dark-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ theme: 'dark' });
      this.render();
    });
    grid.appendChild(themeGroup);

    // 2. Currency (MYR vs USD)
    const currencyGroup = document.createElement('div');
    currencyGroup.className = 'display-field-group';
    currencyGroup.innerHTML = `
      <label class="display-field-label">Receipts Currency</label>
      <div class="display-toggle-row">
        <button class="display-toggle-btn ${display.currency === 'MYR' ? 'active' : ''}" id="cur-myr-btn">
          Ringgit (MYR)
        </button>
        <button class="display-toggle-btn ${display.currency === 'USD' ? 'active' : ''}" id="cur-usd-btn">
          US Dollar (USD)
        </button>
      </div>
    `;
    currencyGroup.querySelector('#cur-myr-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ currency: 'MYR' });
      this.render();
    });
    currencyGroup.querySelector('#cur-usd-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ currency: 'USD' });
      this.render();
    });
    grid.appendChild(currencyGroup);

    // 3. Number Format (Metric Short vs Comma)
    const numGroup = document.createElement('div');
    numGroup.className = 'display-field-group';
    numGroup.innerHTML = `
      <label class="display-field-label">Number Notation</label>
      <div class="display-toggle-row">
        <button class="display-toggle-btn ${display.numberFormat === 'metric' ? 'active' : ''}" id="num-metric-btn">
          Short (118.4M)
        </button>
        <button class="display-toggle-btn ${display.numberFormat === 'comma' ? 'active' : ''}" id="num-comma-btn">
          Full (118,400,000)
        </button>
      </div>
    `;
    numGroup.querySelector('#num-metric-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ numberFormat: 'metric' });
      this.render();
    });
    numGroup.querySelector('#num-comma-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ numberFormat: 'comma' });
      this.render();
    });
    grid.appendChild(numGroup);

    // 4. Language (English vs Bahasa Melayu)
    const langGroup = document.createElement('div');
    langGroup.className = 'display-field-group';
    langGroup.innerHTML = `
      <label class="display-field-label">Language / Bahasa</label>
      <div class="display-toggle-row">
        <button class="display-toggle-btn ${display.language === 'en' ? 'active' : ''}" id="lang-en-btn">
          English (Official)
        </button>
        <button class="display-toggle-btn ${display.language === 'ms' ? 'active' : ''}" id="lang-ms-btn">
          Bahasa Melayu
        </button>
      </div>
    `;
    langGroup.querySelector('#lang-en-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ language: 'en' });
      this.render();
    });
    langGroup.querySelector('#lang-ms-btn')?.addEventListener('click', () => {
      settingsStore.updateDisplay({ language: 'ms' });
      this.render();
    });
    grid.appendChild(langGroup);

    this.element.appendChild(grid);
  }
}
