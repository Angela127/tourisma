import { ACCOMMODATION_DATA } from '../../data/accommodationData';

export class AccommodationScatterChart {
  public readonly element: HTMLElement;
  private tooltip!: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accommodation-scatter-card kpi-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'infra-tooltip';
    this.tooltip.style.display = 'none';
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.background = 'var(--bg-card)';
    this.tooltip.style.border = '1px solid var(--border-card)';
    this.tooltip.style.padding = '12px';
    this.tooltip.style.borderRadius = '8px';
    this.tooltip.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    this.tooltip.style.zIndex = '9999';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.fontSize = '13px';
    this.tooltip.style.color = 'var(--text-primary)';
    document.body.appendChild(this.tooltip);
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'kpi-card-header';
    header.style.marginBottom = '24px';
    header.innerHTML = `
      <div>
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;">Tourism Demand vs Accommodation Capacity (2025)</h3>
        <span style="font-size: 13px; color: var(--text-secondary);">Scatter analysis: Demand (Visitors) ↔ Capacity (Rooms). Bubble size indicates Average Occupancy Rate (AOR)</span>
      </div>
    `;

    const stage = document.createElement('div');
    stage.style.width = '100%';
    stage.style.height = '400px';
    stage.appendChild(this.createScatterSvg());

    this.element.appendChild(header);
    this.element.appendChild(stage);
  }

  private createScatterSvg(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    const ml = 60;
    const mr = 40;
    const mt = 20;
    const mb = 50;
    const w = 800 - ml - mr;
    const h = 400 - mt - mb;

    // X Axis: Rooms (0 to 70,000)
    const maxX = 70000;
    const scaleX = (val: number) => ml + (val / maxX) * w;
    
    // Y Axis: Visitors in Millions (0 to 40)
    const maxY = 40;
    const scaleY = (val: number) => mt + h - (val / maxY) * h;

    // Grid lines and axes
    for (let i = 0; i <= 7; i++) {
      const x = scaleX(i * 10000);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y1', mt.toString());
      line.setAttribute('y2', (mt + h).toString());
      line.setAttribute('stroke', 'var(--border-subtle, rgba(148, 163, 184, 0.2))');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', (mt + h + 15).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', 'var(--text-muted, #94a3b8)');
      text.textContent = `${i * 10}k`;
      svg.appendChild(text);
    }

    for (let i = 0; i <= 4; i++) {
      const y = scaleY(i * 10);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ml.toString());
      line.setAttribute('x2', (ml + w).toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', 'var(--border-subtle, rgba(148, 163, 184, 0.2))');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (ml - 10).toString());
      text.setAttribute('y', (y + 4).toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', 'var(--text-muted, #94a3b8)');
      text.textContent = `${i * 10}M`;
      svg.appendChild(text);
    }

    // Trendline / Ideal Ratio Line (Optional visual cue)
    const trendline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    trendline.setAttribute('x1', ml.toString());
    trendline.setAttribute('y1', (mt + h).toString());
    trendline.setAttribute('x2', scaleX(60000).toString());
    trendline.setAttribute('y2', scaleY(30).toString());
    trendline.setAttribute('stroke', 'rgba(59, 130, 246, 0.3)');
    trendline.setAttribute('stroke-width', '2');
    trendline.setAttribute('stroke-dasharray', '6 6');
    svg.appendChild(trendline);

    // Axis Labels
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', (ml + w / 2).toString());
    xAxisLabel.setAttribute('y', (mt + h + 35).toString());
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('font-size', '12');
    xAxisLabel.setAttribute('font-weight', '600');
    xAxisLabel.setAttribute('fill', 'var(--text-secondary, #64748b)');
    xAxisLabel.textContent = 'Accommodation Rooms (Capacity) →';
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', (-mt - h / 2).toString());
    yAxisLabel.setAttribute('y', '20');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('font-size', '12');
    yAxisLabel.setAttribute('font-weight', '600');
    yAxisLabel.setAttribute('fill', 'var(--text-secondary, #64748b)');
    yAxisLabel.textContent = 'Domestic Visitors (Millions) →';
    svg.appendChild(yAxisLabel);

    // Plot States
    ACCOMMODATION_DATA.forEach((state) => {
      const cx = scaleX(state.rooms);
      const cy = scaleY(state.visitors);
      
      // Bubble size based on AOR (range ~30 to 80)
      const minAOR = 30;
      const maxAOR = 80;
      const normalizedAOR = Math.max(0, Math.min(1, (state.aor - minAOR) / (maxAOR - minAOR)));
      const r = 6 + normalizedAOR * 16; // radius from 6 to 22

      // Color intensity based on Visitors
      const isHighVolume = state.visitors > 20 || state.rooms > 30000;
      const color = isHighVolume ? '#3b82f6' : '#10b981'; // Blue for hubs, green for others

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', r.toString());
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.6');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'all 0.2s ease';

      group.addEventListener('mouseenter', (e) => {
        circle.setAttribute('r', (r + 4).toString());
        circle.setAttribute('fill-opacity', '0.9');

        this.tooltip.innerHTML = `
          <strong style="font-size: 14px; margin-bottom: 4px; display: block;">${state.name} (${state.code})</strong>
          <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px;">
            <span>Accommodation Rooms:</span> <strong>${state.rooms.toLocaleString()}</strong>
            <span>Domestic Visitors:</span> <strong>${state.visitors.toFixed(1)}M</strong>
            <span>Avg Occupancy Rate:</span> <strong style="color: ${state.aor > 60 ? '#10b981' : 'inherit'}">${state.aor}%</strong>
          </div>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      group.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      group.addEventListener('mouseleave', () => {
        circle.setAttribute('r', r.toString());
        circle.setAttribute('fill-opacity', '0.6');
        this.tooltip.style.display = 'none';
      });

      group.appendChild(circle);

      // State Code Label
      const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      codeText.setAttribute('x', cx.toString());
      codeText.setAttribute('y', (cy + 3).toString());
      codeText.setAttribute('text-anchor', 'middle');
      codeText.setAttribute('font-size', '10');
      codeText.setAttribute('font-weight', '700');
      codeText.setAttribute('fill', '#ffffff');
      codeText.style.pointerEvents = 'none';
      // Only show text inside bubble if bubble is big enough
      if (r > 12) {
         codeText.textContent = state.code;
      }
      group.appendChild(codeText);

      // Show text above bubble if bubble is small
      if (r <= 12) {
          const smallText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          smallText.setAttribute('x', cx.toString());
          smallText.setAttribute('y', (cy - r - 4).toString());
          smallText.setAttribute('text-anchor', 'middle');
          smallText.setAttribute('font-size', '9');
          smallText.setAttribute('font-weight', '600');
          smallText.setAttribute('fill', 'var(--text-secondary, #64748b)');
          smallText.style.pointerEvents = 'none';
          smallText.textContent = state.code;
          group.appendChild(smallText);
      }

      svg.appendChild(group);
    });

    return svg;
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
