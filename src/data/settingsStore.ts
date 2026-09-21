export type ThemeMode = 'light' | 'dark';
export type CurrencyCode = 'MYR' | 'USD';
export type NumberFormatType = 'metric' | 'comma';
export type LanguageCode = 'en' | 'ms';

export interface DisplaySettings {
  theme: ThemeMode;
  currency: CurrencyCode;
  numberFormat: NumberFormatType;
  language: LanguageCode;
}

export interface ThresholdConfig {
  id: string;
  name: string;
  category: 'capacity' | 'sustainability' | 'seasonality';
  currentValue: number;
  defaultValue: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  impactNote: string;
}

export interface IndexWeights {
  lodging: number; // default 30
  density: number; // default 25
  seasonality: number; // default 20
  ecological: number; // default 15
  transit: number; // default 10
}

export interface DataConfig {
  refreshInterval: 'realtime' | '5m' | '15m' | '1h' | 'manual';
  apiEndpoints: { name: string; url: string; status: 'online' | 'synced' | 'degraded' }[];
  lastSyncTimestamp: string;
  cachedRecordsCount: number;
}

export interface AboutInfo {
  version: string;
  buildDate: string;
  teamName: string;
  competition: string;
  leadAffiliation: string;
  attribution: string;
}

class SettingsStore {
  private display: DisplaySettings;
  private thresholds: ThresholdConfig[];
  private indexWeights: IndexWeights;
  private defaultIndexWeights: IndexWeights;
  private dataConfig: DataConfig;
  private aboutInfo: AboutInfo;
  private subscribers: Array<() => void> = [];

  constructor() {
    this.display = {
      theme: 'light',
      currency: 'MYR',
      numberFormat: 'metric',
      language: 'en',
    };

    this.defaultIndexWeights = {
      lodging: 30,
      density: 25,
      seasonality: 20,
      ecological: 15,
      transit: 10,
    };

    this.indexWeights = { ...this.defaultIndexWeights };

    this.thresholds = [
      {
        id: 'occupancy_strain',
        name: 'Hotel Occupancy Strain Threshold',
        category: 'capacity',
        currentValue: 70.0,
        defaultValue: 70.0,
        unit: '%',
        step: 1.0,
        min: 50.0,
        max: 90.0,
        impactNote: 'Bars turning GOLD in Capacity Utilisation charts and triggers emerging strain warnings in state drawers.',
      },
      {
        id: 'occupancy_critical',
        name: 'Hotel Occupancy Critical Bottleneck Threshold',
        category: 'capacity',
        currentValue: 80.0,
        defaultValue: 80.0,
        unit: '%',
        step: 1.0,
        min: 60.0,
        max: 95.0,
        impactNote: 'Bars turning CRIMSON in Capacity Utilisation charts and flags acute accommodation deficits nationwide.',
      },
      {
        id: 'visitor_nights_strain',
        name: 'Visitor-Nights per Room Strain Threshold',
        category: 'capacity',
        currentValue: 260,
        defaultValue: 260,
        unit: 'nights/room',
        step: 5,
        min: 180,
        max: 320,
        impactNote: 'Triggers gold utilization shading when annual nights sold exceed physical room stock turnaround limits.',
      },
      {
        id: 'visitor_nights_critical',
        name: 'Visitor-Nights per Room Critical Threshold',
        category: 'capacity',
        currentValue: 300,
        defaultValue: 300,
        unit: 'nights/room',
        step: 5,
        min: 220,
        max: 360,
        impactNote: 'Triggers crimson critical alert on Infrastructure scatter quadrant and State Drawers.',
      },
      {
        id: 'pressure_strain',
        name: 'Tourism Pressure Index (TPI) Strain Threshold',
        category: 'sustainability',
        currentValue: 50.0,
        defaultValue: 50.0,
        unit: 'points',
        step: 1.0,
        min: 30.0,
        max: 70.0,
        impactNote: 'Transitions states from forest green (headroom) to gold (strain) on the interactive Malaysia pressure map.',
      },
      {
        id: 'pressure_critical',
        name: 'Tourism Pressure Index (TPI) Critical Threshold',
        category: 'sustainability',
        currentValue: 75.0,
        defaultValue: 75.0,
        unit: 'points',
        step: 1.0,
        min: 60.0,
        max: 90.0,
        impactNote: 'Flags states in crimson on Early Warning Signals list and triggers UNESCO heritage zone alerts.',
      },
      {
        id: 'peak_seasonality_multiplier',
        name: 'Seasonal Concentration Multiplier Warning',
        category: 'seasonality',
        currentValue: 1.75,
        defaultValue: 1.75,
        unit: '× peak/trough',
        step: 0.05,
        min: 1.2,
        max: 3.0,
        impactNote: 'Flags states on the Seasonal Concentration ranked list whose peak month arrival volume causes extreme off-peak revenue volatility.',
      },
    ];

    this.dataConfig = {
      refreshInterval: 'realtime',
      apiEndpoints: [
        { name: 'MOTAC Inbound Border Registry', url: 'https://api.data.gov.my/v1/motac/arrivals', status: 'online' },
        { name: 'DOSM Domestic Survey Microdata', url: 'https://open.dosm.gov.my/api/dts/v2', status: 'synced' },
        { name: 'MAHB Airport Movement Telemetry', url: 'https://telemetry.mahb.com.my/slots/v1', status: 'online' },
        { name: 'MAH Registered Hotel Inventory', url: 'https://registry.hotels.org.my/stats/monthly', status: 'online' },
      ],
      lastSyncTimestamp: '15 Dec 2026, 14:30:00 MYT',
      cachedRecordsCount: 248600,
    };

    this.aboutInfo = {
      version: 'v2.4.0-production (Build 2026.09.18)',
      buildDate: '18 September 2026',
      teamName: 'Team Tourisma Analytics Group',
      competition: 'National Tourism Data Innovation Challenge 2026 (MOTAC Policy Lab)',
      leadAffiliation: 'Ministry of Tourism, Arts and Culture (MOTAC) & OpenDOSM Research Initiative',
      attribution:
        'All raw statistical foundations derived from the Department of Statistics Malaysia (DOSM) Open Data Portal and MOTAC Tourism Statistics Division. Models and simulated scenarios are engineered specifically for policy diagnostic circulation.',
    };

    this.loadPersistedState();
    this.applyThemeToDOM();
  }

  // --- Display Settings ---
  public getDisplay(): DisplaySettings {
    return { ...this.display };
  }

  public updateDisplay(partial: Partial<DisplaySettings>): void {
    this.display = { ...this.display, ...partial };
    if (partial.theme) {
      this.applyThemeToDOM();
    }
    this.persistState();
    this.notify();
  }

  private applyThemeToDOM(): void {
    if (this.display.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  // --- Thresholds ---
  public getThresholds(): ThresholdConfig[] {
    return this.thresholds.map((t) => ({ ...t }));
  }

  public getThreshold(id: string): number {
    const t = this.thresholds.find((item) => item.id === id);
    return t ? t.currentValue : 70;
  }

  public updateThreshold(id: string, newValue: number): void {
    const item = this.thresholds.find((t) => t.id === id);
    if (item) {
      item.currentValue = Number(newValue);
      this.persistState();
      this.notify();
    }
  }

  public resetThresholds(): void {
    this.thresholds.forEach((t) => {
      t.currentValue = t.defaultValue;
    });
    this.persistState();
    this.notify();
  }

  // --- Index Weights ---
  public getIndexWeights(): IndexWeights {
    return { ...this.indexWeights };
  }

  public getDefaultIndexWeights(): IndexWeights {
    return { ...this.defaultIndexWeights };
  }

  public updateIndexWeights(weights: Partial<IndexWeights>): void {
    this.indexWeights = { ...this.indexWeights, ...weights };
    this.persistState();
    this.notify();
  }

  public resetIndexWeights(): void {
    this.indexWeights = { ...this.defaultIndexWeights };
    this.persistState();
    this.notify();
  }

  public isWeightsModified(): boolean {
    return (
      this.indexWeights.lodging !== this.defaultIndexWeights.lodging ||
      this.indexWeights.density !== this.defaultIndexWeights.density ||
      this.indexWeights.seasonality !== this.defaultIndexWeights.seasonality ||
      this.indexWeights.ecological !== this.defaultIndexWeights.ecological ||
      this.indexWeights.transit !== this.defaultIndexWeights.transit
    );
  }

  // --- Data Controls ---
  public getDataConfig(): DataConfig {
    return { ...this.dataConfig };
  }

  public setRefreshInterval(interval: DataConfig['refreshInterval']): void {
    this.dataConfig.refreshInterval = interval;
    this.persistState();
    this.notify();
  }

  public clearTelemetryCache(): void {
    this.dataConfig.cachedRecordsCount = 0;
    this.dataConfig.lastSyncTimestamp = 'Cache Purged (Ready for Ingestion)';
    this.notify();
  }

  public refreshDataFeed(): void {
    const now = new Date();
    this.dataConfig.cachedRecordsCount = 248600;
    this.dataConfig.lastSyncTimestamp = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString()} MYT`;
    this.notify();
  }

  // --- About Info ---
  public getAboutInfo(): AboutInfo {
    return { ...this.aboutInfo };
  }

  // --- Pub/Sub ---
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    window.dispatchEvent(new CustomEvent('tourisma:settings-changed', { detail: { store: this } }));
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in settings subscriber:', err);
      }
    });
  }

  // --- LocalStorage persistence ---
  private persistState(): void {
    try {
      const payload = {
        display: this.display,
        thresholds: this.thresholds.map((t) => ({ id: t.id, val: t.currentValue })),
        indexWeights: this.indexWeights,
        refreshInterval: this.dataConfig.refreshInterval,
      };
      localStorage.setItem('tourisma_settings_v2', JSON.stringify(payload));
    } catch {
      // Ignore localStorage failure in restricted contexts
    }
  }

  private loadPersistedState(): void {
    try {
      const raw = localStorage.getItem('tourisma_settings_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.display) this.display = { ...this.display, ...parsed.display };
        if (parsed.indexWeights) this.indexWeights = { ...this.indexWeights, ...parsed.indexWeights };
        if (Array.isArray(parsed.thresholds)) {
          parsed.thresholds.forEach((saved: { id: string; val: number }) => {
            const item = this.thresholds.find((t) => t.id === saved.id);
            if (item) item.currentValue = saved.val;
          });
        }
        if (parsed.refreshInterval) this.dataConfig.refreshInterval = parsed.refreshInterval;
      }
    } catch {
      // Ignore parse failure
    }
  }
}

export const settingsStore = new SettingsStore();
