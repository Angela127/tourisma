import { CONTRIBUTION_TO_GDP, EMPLOYMENT_IN_TOURISM } from '../../../data/globalOverviewData';

export interface GaugeCardData {
  title: string;
  unitSubtitle: string;
  value: number;
  min: number;
  max: number;
  globalAvg: number;
  asiaAvg: number;
  rangeLabel: string;
  rangeBox: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
}

export class GdpEmploymentCard {
  public readonly element: HTMLElement;

  constructor(data: GaugeCardData) {
    this.element = document.createElement('div');
    this.element.className = 'gauge-range-card';

    // Header: Title + Unit Subtitle
    const header = document.createElement('div');
    header.className = 'gauge-card-header';

    const title = document.createElement('h3');
    title.className = 'gauge-card-title';
    title.textContent = data.title;

    const subtitle = document.createElement('span');
    subtitle.className = 'gauge-card-subtitle';
    subtitle.textContent = data.unitSubtitle;

    header.appendChild(title);
    header.appendChild(subtitle);

    // Body: Split between Speedometer Gauge (Left) and Range Box (Right)
    const body = document.createElement('div');
    body.className = 'gauge-card-body';

    // Left: Speedometer Gauge
    const gaugeSection = document.createElement('div');
    gaugeSection.className = 'gauge-section';
    gaugeSection.innerHTML = this.renderSpeedometerSvg(data);

    // Right: Range Box Chart
    const rangeSection = document.createElement('div');
    rangeSection.className = 'range-section';
    rangeSection.innerHTML = this.renderRangeBoxSvg(data);

    body.appendChild(gaugeSection);
    body.appendChild(rangeSection);

    this.element.appendChild(header);
    this.element.appendChild(body);
  }

  private renderSpeedometerSvg(data: GaugeCardData): string {
    const val = data.value;
    const min = data.min;
    const max = data.max;

    // Semi-circle arc geometry
    // Center at (90, 85), radius 65
    // Angle: 180 deg (from -180 to 0)
    const radius = 64;
    const circumference = Math.PI * radius; // ~201.06
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const activeLength = ratio * circumference;
    const dashOffset = circumference - activeLength;

    // Needle Angle: -180 deg (min) to 0 deg (max)
    const needleAngle = -180 + ratio * 180;
    const needleRad = (needleAngle * Math.PI) / 180;
    const needleLength = 54;
    const nx = 90 + needleLength * Math.cos(needleRad);
    const ny = 85 + needleLength * Math.sin(needleRad);

    return `
      <div class="speedometer-container">
        <svg viewBox="0 0 180 115" class="speedometer-svg">
          <defs>
            <linearGradient id="gaugeGrad-${data.value}" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="50%" stop-color="#0b57d0" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>
          </defs>

          <!-- Background Track (180 deg) -->
          <path
            d="M 26 85 A 64 64 0 0 1 154 85"
            fill="none"
            stroke="#e2e8f0"
            stroke-width="12"
            stroke-linecap="round"
          />

          <!-- Active Arc (Gradient) -->
          <path
            d="M 26 85 A 64 64 0 0 1 154 85"
            fill="none"
            stroke="url(#gaugeGrad-${data.value})"
            stroke-width="12"
            stroke-linecap="round"
            stroke-dasharray="${circumference.toFixed(1)}"
            stroke-dashoffset="${dashOffset.toFixed(1)}"
          />

          <!-- Scale Numbers: 0, 5, 10, 15, 20 -->
          <text x="22" y="100" class="gauge-scale-txt" text-anchor="middle">0</text>
          <text x="44" y="52" class="gauge-scale-txt" text-anchor="middle">5</text>
          <text x="90" y="24" class="gauge-scale-txt" text-anchor="middle">10</text>
          <text x="136" y="52" class="gauge-scale-txt" text-anchor="middle">15</text>
          <text x="158" y="100" class="gauge-scale-txt" text-anchor="middle">20</text>

          <!-- Center Needle & Pivot Pin -->
          <line x1="90" y1="85" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="90" cy="85" r="4.5" fill="#0f172a" />
        </svg>

        <!-- Big Center Readout -->
        <div class="gauge-center-val">${val.toFixed(1)}%</div>

        <!-- Legend -->
        <div class="gauge-legend-row">
          <span class="legend-item"><span class="legend-dot global"></span>Global Average</span>
          <span class="legend-item"><span class="legend-dot asia"></span>Asia Average</span>
        </div>
      </div>
    `;
  }

  private renderRangeBoxSvg(data: GaugeCardData): string {
    const box = data.rangeBox;
    const maxScale = 20;

    // SVG Height = 100, Width = 65
    // Y maps 20 -> y=10, 0 -> y=90
    const getY = (v: number) => 10 + (1 - v / maxScale) * 80;

    const yMin = getY(box.min);
    const yQ1 = getY(box.q1);
    const yMedian = getY(box.median);
    const yQ3 = getY(box.q3);
    const yMax = getY(box.max);

    return `
      <div class="range-box-container">
        <div class="range-header-label">${data.rangeLabel}</div>
        <div class="range-chart-stage">
          <svg viewBox="0 0 65 105" class="range-box-svg">
            <!-- Y Axis Numbers: 20, 10, 0 -->
            <text x="14" y="14" class="range-axis-txt" text-anchor="end">20</text>
            <text x="14" y="54" class="range-axis-txt" text-anchor="end">10</text>
            <text x="14" y="94" class="range-axis-txt" text-anchor="end">0</text>

            <!-- Whisker Line (Min to Max) -->
            <line x1="38" y1="${yMax.toFixed(1)}" x2="38" y2="${yMin.toFixed(1)}" stroke="#94a3b8" stroke-width="1.5" />
            <!-- Whisker Top & Bottom Caps -->
            <line x1="32" y1="${yMax.toFixed(1)}" x2="44" y2="${yMax.toFixed(1)}" stroke="#94a3b8" stroke-width="1.5" />
            <line x1="32" y1="${yMin.toFixed(1)}" x2="44" y2="${yMin.toFixed(1)}" stroke="#94a3b8" stroke-width="1.5" />

            <!-- Interquartile Box (Q1 to Q3) -->
            <rect
              x="26"
              y="${yQ3.toFixed(1)}"
              width="24"
              height="${(yQ1 - yQ3).toFixed(1)}"
              fill="#93c5fd"
              fill-opacity="0.8"
              stroke="#0b57d0"
              stroke-width="1.2"
              rx="2"
            />

            <!-- Median Indicator Line -->
            <line x1="26" y1="${yMedian.toFixed(1)}" x2="50" y2="${yMedian.toFixed(1)}" stroke="#0b57d0" stroke-width="2.5" />
          </svg>
        </div>
      </div>
    `;
  }
}

export class GdpEmploymentColumn {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'gdp-employment-column';

    const card1 = new GdpEmploymentCard(CONTRIBUTION_TO_GDP);
    const card2 = new GdpEmploymentCard(EMPLOYMENT_IN_TOURISM);

    this.element.appendChild(card1.element);
    this.element.appendChild(card2.element);
  }
}
