import { FORECAST_DATA } from '../../../data/tourismDemandData';

export type ForecastHorizon = 1 | 2 | 3;

export class ForecastChart {
  public readonly element: HTMLElement;
  private currentStateId = 'all';
  private currentHorizon: ForecastHorizon = 2;
  private chartContainer: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'demand-card forecast-card';

    // Header Controls Row
    const header = document.createElement('div');
    header.className = 'forecast-controls-row';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'demand-card-title-group';
    titleGroup.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <h3 class="demand-card-title">Medium-Term Demand Forecast</h3>
        <span class="modelled-tag-badge">modelled</span>
      </div>
      <span class="demand-card-desc">Historical arrivals (solid) & projected trajectory (dashed) with 95% confidence interval</span>
    `;

    // Filter controls: State Selector & Horizon Toggle
    const controls = document.createElement('div');
    controls.className = 'forecast-filter-group';

    // State Selector
    const stateSelect = document.createElement('select');
    stateSelect.className = 'forecast-select';
    stateSelect.innerHTML = `
      <option value="all">All Malaysia (National)</option>
      <option value="selangor">Selangor</option>
      <option value="kuala_lumpur">Kuala Lumpur</option>
      <option value="sabah">Sabah</option>
    `;
    stateSelect.addEventListener('change', (e) => {
      this.currentStateId = (e.target as HTMLSelectElement).value;
      this.renderChart();
    });

    // Horizon Toggle
    const horizonToggle = document.createElement('div');
    horizonToggle.className = 'segmented-control';
    horizonToggle.innerHTML = `
      <button class="segmented-btn" data-horizon="1">1 Yr (2027)</button>
      <button class="segmented-btn active" data-horizon="2">2 Yrs (2028)</button>
      <button class="segmented-btn" data-horizon="3">3 Yrs (2029)</button>
    `;

    horizonToggle.querySelectorAll('.segmented-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const horizon = parseInt(target.getAttribute('data-horizon') || '2', 10) as ForecastHorizon;
        if (horizon !== this.currentHorizon) {
          this.currentHorizon = horizon;
          horizonToggle.querySelectorAll('.segmented-btn').forEach((b) => b.classList.remove('active'));
          target.classList.add('active');
          this.renderChart();
        }
      });
    });

    controls.appendChild(stateSelect);
    controls.appendChild(horizonToggle);

    header.appendChild(titleGroup);
    header.appendChild(controls);

    this.chartContainer = document.createElement('div');
    this.chartContainer.className = 'forecast-chart-container';

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend-horizontal';
    legend.innerHTML = `
      <span class="legend-item-pill">
        <span style="width: 14px; height: 3px; background-color: #0b57d0; display: inline-block;"></span>
        Historical Actuals
      </span>
      <span class="legend-item-pill">
        <span style="width: 14px; height: 0px; border-top: 2px dashed #0284c7; display: inline-block;"></span>
        Projected Demand (<span class="modelled-tag-badge" style="font-size: 9px; padding: 1px 4px;">modelled</span>)
      </span>
      <span class="legend-item-pill">
        <span style="width: 12px; height: 10px; background-color: #e0f2fe; border: 1px solid #bae6fd; display: inline-block;"></span>
        95% Confidence Band
      </span>
    `;

    this.element.appendChild(header);
    this.element.appendChild(this.chartContainer);
    this.element.appendChild(legend);

    this.renderChart();
  }

  private renderChart(): void {
    const stateData = FORECAST_DATA[this.currentStateId] || FORECAST_DATA.all;
    const maxYear = 2026 + this.currentHorizon;

    const filteredPoints = stateData.points.filter((p) => p.year <= maxYear);

    const width = 860;
    const height = 240;
    const padLeft = 48;
    const padRight = 24;
    const padTop = 20;
    const padBottom = 34;

    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Find max value
    const allValues = filteredPoints.flatMap((p) => [
      p.actual || 0,
      p.forecast || 0,
      p.upperBound || 0,
    ]);
    const maxY = Math.ceil(Math.max(...allValues) / 10) * 10 || 100;
    const stepX = plotWidth / (filteredPoints.length - 1);

    const coords = filteredPoints.map((p, i) => {
      const x = padLeft + i * stepX;
      const actualY = p.actual !== undefined ? padTop + plotHeight - (p.actual / maxY) * plotHeight : null;
      const forecastY = p.forecast !== undefined ? padTop + plotHeight - (p.forecast / maxY) * plotHeight : null;
      const upperY = p.upperBound !== undefined ? padTop + plotHeight - (p.upperBound / maxY) * plotHeight : null;
      const lowerY = p.lowerBound !== undefined ? padTop + plotHeight - (p.lowerBound / maxY) * plotHeight : null;

      return { x, actualY, forecastY, upperY, lowerY, p };
    });

    // Solid line for historical
    const histCoords = coords.filter((c) => c.actualY !== null);
    let histPathD = '';
    histCoords.forEach((c, idx) => {
      histPathD += (idx === 0 ? 'M ' : ' L ') + `${c.x.toFixed(1)} ${c.actualY!.toFixed(1)}`;
    });

    // Dashed line for forecast (connects from last historical point)
    const lastHist = histCoords[histCoords.length - 1];
    const forecastCoords = coords.filter((c) => c.forecastY !== null);
    let forecastPathD = `M ${lastHist.x.toFixed(1)} ${lastHist.actualY!.toFixed(1)}`;
    forecastCoords.forEach((c) => {
      forecastPathD += ` L ${c.x.toFixed(1)} ${c.forecastY!.toFixed(1)}`;
    });

    // Confidence Interval Shaded Band
    let bandD = `M ${lastHist.x.toFixed(1)} ${lastHist.actualY!.toFixed(1)}`;
    forecastCoords.forEach((c) => {
      bandD += ` L ${c.x.toFixed(1)} ${c.upperY!.toFixed(1)}`;
    });
    for (let i = forecastCoords.length - 1; i >= 0; i--) {
      bandD += ` L ${forecastCoords[i].x.toFixed(1)} ${forecastCoords[i].lowerY!.toFixed(1)}`;
    }
    bandD += ` L ${lastHist.x.toFixed(1)} ${lastHist.actualY!.toFixed(1)} Z`;

    // Grid lines
    const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
    const gridLines = yTicks
      .map((val) => {
        const y = padTop + plotHeight - (val / maxY) * plotHeight;
        return `
          <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#f1f5f9" stroke-width="1.2" />
          <text x="${padLeft - 8}" y="${y + 3.5}" font-size="10" fill="#94a3b8" text-anchor="end" font-weight="600">
            ${Math.round(val)}M
          </text>
        `;
      })
      .join('');

    // X Axis Labels
    const xLabels = coords
      .filter((_, i) => i % 2 === 0 || i === coords.length - 1)
      .map((c) => `
        <text x="${c.x}" y="${height - 10}" font-size="10" fill="${c.p.isForecast ? '#0284c7' : '#64748b'}" text-anchor="middle" font-weight="${c.p.isForecast ? '700' : '600'}">
          ${c.p.date}
        </text>
      `)
      .join('');

    // Markers
    const markers = coords
      .map((c) => {
        if (c.p.isForecast) {
          return `
            <circle
              cx="${c.x}"
              cy="${c.forecastY}"
              r="4"
              fill="#ffffff"
              stroke="#0284c7"
              stroke-width="2.5"
              style="cursor: pointer;"
              title="${c.p.date} Forecast [modelled]: ${c.p.forecast}M (${c.p.lowerBound}M – ${c.p.upperBound}M 95% CI)"
            />
          `;
        } else {
          return `
            <circle
              cx="${c.x}"
              cy="${c.actualY}"
              r="3.5"
              fill="#0b57d0"
              stroke="#ffffff"
              stroke-width="1.5"
              title="${c.p.date} Actual: ${c.p.actual}M"
            />
          `;
        }
      })
      .join('');

    // Forecast vertical transition line
    const transitionX = lastHist.x;

    this.chartContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="forecast-svg" aria-label="Forecast Line Chart with Confidence Band">
        <g class="grid-layer">${gridLines}</g>
        
        <!-- Shaded Confidence Band -->
        <path d="${bandD}" fill="#0284c7" fill-opacity="0.14" stroke="#bae6fd" stroke-width="1" stroke-dasharray="3 3" />
        
        <!-- Transition Separator Line -->
        <line x1="${transitionX}" y1="${padTop}" x2="${transitionX}" y2="${padTop + plotHeight}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.2" />
        <text x="${transitionX + 6}" y="${padTop + 14}" font-size="9" fill="#0284c7" font-weight="700">FORECAST HORIZON ▶</text>

        <!-- Historical Solid Line -->
        <path d="${histPathD}" fill="none" stroke="#0b57d0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Forecast Dashed Line -->
        <path d="${forecastPathD}" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round" />

        <!-- X Axis Labels -->
        <g class="x-axis-layer">${xLabels}</g>

        <!-- Data Point Markers -->
        <g class="markers-layer">${markers}</g>
      </svg>
    `;
  }
}
