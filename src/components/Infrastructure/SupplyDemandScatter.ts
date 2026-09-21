import { STATE_INFRASTRUCTURE_DATA } from '../../data/infrastructureData';

const CLUSTER_COLORS: Record<string, string> = {
  'Mature Gateway Hubs': '#0b57d0',
  'High-Growth Emerging': '#10b981',
  'Eco & Heritage Frontiers': '#f59e0b',
  'Developing Infrastructure': '#8b5cf6',
};

export class SupplyDemandScatter {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'infra-card';

    this.createTooltip();
    this.render();
  }

  private createTooltip(): void {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'infra-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'infra-card-header';
    header.innerHTML = `
      <div class="infra-card-title-group">
        <h3 class="infra-card-title">Room Supply vs Visitor Demand Equilibrium</h3>
        <span class="infra-card-desc">Diagonal equilibrium line highlights supply-constrained vs under-utilised states</span>
      </div>
      <span class="infra-toggle-group" style="padding: 4px 8px; font-size: 0.7rem; color: #475569; font-weight: 600;">
        Bubble Size = Tourism Receipts (RM B)
      </span>
    `;

    const stage = document.createElement('div');
    stage.className = 'scatter-plot-stage';

    const svg = this.createScatterSvg();
    stage.appendChild(svg);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'scatter-legend-wrap';
    legend.innerHTML = `
      <div class="scatter-legend-item">
        <span class="scatter-dot" style="background-color: ${CLUSTER_COLORS['Mature Gateway Hubs']}"></span>
        <span>Mature Gateway Hubs</span>
      </div>
      <div class="scatter-legend-item">
        <span class="scatter-dot" style="background-color: ${CLUSTER_COLORS['High-Growth Emerging']}"></span>
        <span>High-Growth Emerging</span>
      </div>
      <div class="scatter-legend-item">
        <span class="scatter-dot" style="background-color: ${CLUSTER_COLORS['Eco & Heritage Frontiers']}"></span>
        <span>Eco & Heritage Frontiers</span>
      </div>
      <div class="scatter-legend-item">
        <span class="scatter-dot" style="background-color: ${CLUSTER_COLORS['Developing Infrastructure']}"></span>
        <span>Developing Infrastructure</span>
      </div>
    `;

    this.element.appendChild(header);
    this.element.appendChild(stage);
    this.element.appendChild(legend);
  }

  private createScatterSvg(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 340');
    svg.setAttribute('class', 'scatter-svg');

    // Margins
    const ml = 54;
    const mr = 30;
    const mt = 24;
    const mb = 44;
    const w = 540 - ml - mr;
    const h = 340 - mt - mb;

    // Domains
    const xMax = 75000; // Rooms
    const yMax = 38; // Million Visitors

    const scaleX = (val: number) => ml + (val / xMax) * w;
    const scaleY = (val: number) => mt + h - (val / yMax) * h;

    // Grid lines & Axis ticks
    const xTicks = [0, 15000, 30000, 45000, 60000, 75000];
    const yTicks = [0, 10, 20, 30, 38];

    // Horizontal grid lines
    yTicks.forEach((yt) => {
      const yPos = scaleY(yt);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ml.toString());
      line.setAttribute('x2', (ml + w).toString());
      line.setAttribute('y1', yPos.toString());
      line.setAttribute('y2', yPos.toString());
      line.setAttribute('stroke', '#f1f5f9');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (ml - 8).toString());
      text.setAttribute('y', (yPos + 3).toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', '#94a3b8');
      text.setAttribute('font-weight', '600');
      text.textContent = `${yt}M`;
      svg.appendChild(text);
    });

    // Vertical grid lines
    xTicks.forEach((xt) => {
      const xPos = scaleX(xt);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', xPos.toString());
      line.setAttribute('x2', xPos.toString());
      line.setAttribute('y1', mt.toString());
      line.setAttribute('y2', (mt + h).toString());
      line.setAttribute('stroke', '#f1f5f9');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', xPos.toString());
      text.setAttribute('y', (mt + h + 15).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', '#94a3b8');
      text.setAttribute('font-weight', '600');
      text.textContent = xt === 0 ? '0' : `${xt / 1000}k`;
      svg.appendChild(text);
    });

    // Axis Labels
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', (ml + w / 2).toString());
    xAxisLabel.setAttribute('y', (mt + h + 34).toString());
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('font-size', '10');
    xAxisLabel.setAttribute('font-weight', '700');
    xAxisLabel.setAttribute('fill', '#64748b');
    xAxisLabel.textContent = 'Room Supply (Available Graded Rooms)';
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', (-mt - h / 2).toString());
    yAxisLabel.setAttribute('y', '15');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('font-size', '10');
    yAxisLabel.setAttribute('font-weight', '700');
    yAxisLabel.setAttribute('fill', '#64748b');
    yAxisLabel.textContent = 'Annual Visitor Demand (Millions)';
    svg.appendChild(yAxisLabel);

    // Diagonal Equilibrium Balance Reference Line
    // Slope: 38M visitors / 75k rooms ~ 0.506 M per 1k rooms
    const diagLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    diagLine.setAttribute('x1', scaleX(0).toString());
    diagLine.setAttribute('y1', scaleY(0).toString());
    diagLine.setAttribute('x2', scaleX(75000).toString());
    diagLine.setAttribute('y2', scaleY(36).toString());
    diagLine.setAttribute('stroke', '#cbd5e1');
    diagLine.setAttribute('stroke-width', '1.5');
    diagLine.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(diagLine);

    // Diagonal Line Label
    const diagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    diagText.setAttribute('x', scaleX(42000).toString());
    diagText.setAttribute('y', (scaleY(20) + 14).toString());
    diagText.setAttribute('transform', `rotate(-24, ${scaleX(42000)}, ${scaleY(20) + 14})`);
    diagText.setAttribute('font-size', '8.5');
    diagText.setAttribute('fill', '#94a3b8');
    diagText.setAttribute('font-weight', '700');
    diagText.textContent = 'Balanced Supply / Demand Baseline';
    svg.appendChild(diagText);

    // Shaded Region Background Labels
    const constrainedLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    constrainedLabel.setAttribute('x', (ml + 12).toString());
    constrainedLabel.setAttribute('y', (mt + 20).toString());
    constrainedLabel.setAttribute('font-size', '9.5');
    constrainedLabel.setAttribute('fill', '#dc2626');
    constrainedLabel.setAttribute('font-weight', '800');
    constrainedLabel.setAttribute('letter-spacing', '0.04em');
    constrainedLabel.textContent = '▲ SUPPLY-CONSTRAINED REGION';
    svg.appendChild(constrainedLabel);

    const underutilisedLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    underutilisedLabel.setAttribute('x', (ml + w - 10).toString());
    underutilisedLabel.setAttribute('y', (mt + h - 12).toString());
    underutilisedLabel.setAttribute('text-anchor', 'end');
    underutilisedLabel.setAttribute('font-size', '9.5');
    underutilisedLabel.setAttribute('fill', '#2563eb');
    underutilisedLabel.setAttribute('font-weight', '800');
    underutilisedLabel.setAttribute('letter-spacing', '0.04em');
    underutilisedLabel.textContent = '▼ UNDER-UTILISED / EXCESS BUFFER';
    svg.appendChild(underutilisedLabel);

    // Render Data Points (Bubbles)
    STATE_INFRASTRUCTURE_DATA.forEach((state) => {
      const cx = scaleX(state.rooms);
      const cy = scaleY(state.visitorVolume);
      // Bubble radius proportional to receipts (RM 0.8B to RM 21.8B) -> r = 4.5 to 14
      const r = Math.max(4.5, Math.min(15, Math.sqrt(state.receipts) * 3.1));
      const color = CLUSTER_COLORS[state.cluster] || '#0b57d0';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', r.toString());
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.75');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'all 0.15s ease';

      // Hover
      circle.addEventListener('mouseenter', (e) => {
        circle.setAttribute('fill-opacity', '1');
        circle.setAttribute('r', (r + 3).toString());
        circle.setAttribute('stroke', '#0f172a');
        circle.setAttribute('stroke-width', '2');

        const constraintType = state.occupancyRate >= 78 ? 'Supply-Constrained' : state.occupancyRate <= 58 ? 'Under-Utilised Buffer' : 'Balanced Capacity';

        this.tooltip.innerHTML = `
          <strong>${state.name} (${state.code})</strong> • <span style="color:${color}">${state.cluster}</span><br/>
          • Room Inventory: <strong>${state.rooms.toLocaleString()}</strong> rooms<br/>
          • Annual Demand: <strong>${state.visitorVolume}M</strong> visitors<br/>
          • Tourism Receipts: <strong>RM ${state.receipts}B</strong><br/>
          • Status: <strong>${constraintType}</strong> (Occ: ${state.occupancyRate.toFixed(1)}%)<br/>
          <span style="font-size:0.65rem; color:#94a3b8;">🖱 Click bubble to view State Drawer</span>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      circle.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('fill-opacity', '0.75');
        circle.setAttribute('r', r.toString());
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1.5');
        this.tooltip.style.display = 'none';
      });

      // Click callback
      circle.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      svg.appendChild(circle);

      // Micro state code text
      const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      codeText.setAttribute('x', cx.toString());
      codeText.setAttribute('y', (cy + 3).toString());
      codeText.setAttribute('text-anchor', 'middle');
      codeText.setAttribute('font-size', '7.5');
      codeText.setAttribute('font-weight', '800');
      codeText.setAttribute('fill', '#ffffff');
      codeText.style.pointerEvents = 'none';
      codeText.textContent = state.code;
      svg.appendChild(codeText);
    });

    // Direct Callouts for the Two Extreme Points (Pulau Pinang & Putrajaya/Selangor)
    // 1. Extreme Supply-Constrained Point: Penang
    const penang = STATE_INFRASTRUCTURE_DATA.find((s) => s.id === 'penang');
    if (penang) {
      const px = scaleX(penang.rooms);
      const py = scaleY(penang.visitorVolume);

      // Callout Box & Arrow
      const calloutG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      calloutG.innerHTML = `
        <rect x="${px - 110}" y="${py - 36}" width="105" height="24" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="1" />
        <text x="${px - 58}" y="${py - 24}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#dc2626">PENANG: HIGH STRAIN</text>
        <text x="${px - 58}" y="${py - 15}" text-anchor="middle" font-size="6.8" fill="#475569">84.5% Occ • 29.4k Rms</text>
        <line x1="${px - 5}" y1="${py - 12}" x2="${px}" y2="${py - 4}" stroke="#dc2626" stroke-width="1.2" />
      `;
      svg.appendChild(calloutG);
    }

    // 2. Extreme Under-Utilised Point: WP Putrajaya
    const putrajaya = STATE_INFRASTRUCTURE_DATA.find((s) => s.id === 'putrajaya');
    if (putrajaya) {
      const pjx = scaleX(putrajaya.rooms);
      const pjy = scaleY(putrajaya.visitorVolume);

      const calloutG2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      calloutG2.innerHTML = `
        <rect x="${pjx + 12}" y="${pjy + 4}" width="118" height="24" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1" />
        <text x="${pjx + 71}" y="${pjy + 16}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#2563eb">PUTRAJAYA: BUFFER ROOM</text>
        <text x="${pjx + 71}" y="${pjy + 25}" text-anchor="middle" font-size="6.8" fill="#475569">52.8% Occ • Excess Capacity</text>
        <line x1="${pjx + 12}" y1="${pjy + 12}" x2="${pjx + 4}" y2="${pjy}" stroke="#2563eb" stroke-width="1.2" />
      `;
      svg.appendChild(calloutG2);
    }

    return svg;
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
