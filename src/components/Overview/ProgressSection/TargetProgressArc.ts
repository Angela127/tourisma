import { createElement, Target } from 'lucide';
import { NATIONAL_PROGRESS } from '../../../data/overviewData';

export class TargetProgressArc {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'progress-arc-card';

    const { targetVisitors, currentVisitors, gapVisitors, requiredCagr, targetYear } = NATIONAL_PROGRESS;
    const progressPercent = Math.round((currentVisitors / targetVisitors) * 100);

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    const icon = createElement(Target, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#0b57d0',
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'Strategic Visitor Target';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    const yearBadge = document.createElement('span');
    yearBadge.className = 'target-year-pill';
    yearBadge.textContent = `Target Year ${targetYear}`;

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(yearBadge);

    // Arc Visual Canvas
    const arcStage = document.createElement('div');
    arcStage.className = 'arc-stage';
    arcStage.innerHTML = `
      <div class="gauge-svg-container">
        <svg viewBox="0 0 220 125" class="progress-arc-svg">
          <defs>
            <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="60%" stop-color="#0b57d0" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>
          </defs>
          <!-- Background Track Arc (180 deg) -->
          <path
            d="M 24 112 A 86 86 0 0 1 196 112"
            fill="none"
            stroke="#e2e8f0"
            stroke-width="14"
            stroke-linecap="round"
          />
          <!-- Active Progress Arc -->
          <path
            d="M 24 112 A 86 86 0 0 1 196 112"
            fill="none"
            stroke="url(#arcGradient)"
            stroke-width="14"
            stroke-linecap="round"
            stroke-dasharray="270"
            stroke-dashoffset="${(270 * (1 - currentVisitors / targetVisitors)).toFixed(1)}"
            class="arc-meter-path"
          />
        </svg>
        <div class="arc-inner-readout">
          <span class="arc-current-val">${currentVisitors.toFixed(1)}M</span>
          <span class="arc-progress-pct">${progressPercent}% of ${targetVisitors.toFixed(1)}M Target</span>
        </div>
      </div>
    `;

    // Metrics Summary Footer (Current vs Target, Gap, CAGR)
    const metricsFooter = document.createElement('div');
    metricsFooter.className = 'arc-metrics-footer';

    // Gap Callout
    const gapBlock = document.createElement('div');
    gapBlock.className = 'arc-stat-callout gap-highlight';
    gapBlock.innerHTML = `
      <div class="callout-label">Explicit Gap to Target</div>
      <div class="callout-value-row">
        <span class="callout-number">${gapVisitors.toFixed(1)}M</span>
        <span class="callout-subtext">visitors needed</span>
      </div>
    `;

    // Required Growth Callout
    const cagrBlock = document.createElement('div');
    cagrBlock.className = 'arc-stat-callout cagr-highlight';
    cagrBlock.innerHTML = `
      <div class="callout-label">Required Annual Growth</div>
      <div class="callout-value-row">
        <span class="callout-number">+${requiredCagr.toFixed(1)}%</span>
        <span class="callout-subtext">CAGR needed p.a.</span>
      </div>
    `;

    metricsFooter.appendChild(gapBlock);
    metricsFooter.appendChild(cagrBlock);

    this.element.appendChild(cardHeader);
    this.element.appendChild(arcStage);
    this.element.appendChild(metricsFooter);
  }
}
