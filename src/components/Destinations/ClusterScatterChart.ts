import { DESTINATIONS_DATA, DESTINATIONS_METADATA } from '../../data/destinationsData';

const CLUSTER_COLORS: Record<string, string> = {
  'Mature Gateway Hubs': '#0b57d0',
  'High-Growth Emerging': '#10b981',
  'Eco & Heritage Frontiers': '#f59e0b',
  'Developing Infrastructure': '#8b5cf6',
};

export class ClusterScatterChart {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'dest-card';

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
    header.className = 'dest-card-header';
    header.innerHTML = `
      <div class="dest-card-title-group">
        <h3 class="dest-card-title">Destination Cluster & Strategic Growth Matrix</h3>
        <span class="dest-card-desc">Multi-dimensional quadrant classification: Tourism Demand vs Destination Capacity</span>
      </div>
      <span class="infra-toggle-group" style="padding: 4px 8px; font-size: 0.7rem; color: #475569; font-weight: 600;">
        Bubble Size = Receipts (RM B)
      </span>
    `;

    const stage = document.createElement('div');
    stage.className = 'dest-cluster-stage';
    stage.appendChild(this.createScatterSvg());

    // Methodology Note
    const note = document.createElement('div');
    note.className = 'cluster-methodology-note';
    note.innerHTML = `
      <strong>Algorithmic Classification Note:</strong> ${DESTINATIONS_METADATA.note} (${DESTINATIONS_METADATA.clusteringMethod}).
    `;

    this.element.appendChild(header);
    this.element.appendChild(stage);
    this.element.appendChild(note);
  }

  private createScatterSvg(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 330');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    const ml = 54;
    const mr = 30;
    const mt = 24;
    const mb = 40;
    const w = 540 - ml - mr;
    const h = 330 - mt - mb;

    const scaleX = (val: number) => ml + (val / 100) * w;
    const scaleY = (val: number) => mt + h - (val / 100) * h;

    const midX = scaleX(70);
    const midY = scaleY(65);

    // 4 Quadrants Background Shading
    // 1. High Demand + High Capacity (Top-Right): Can absorb growth
    const qTopRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qTopRight.setAttribute('x', midX.toString());
    qTopRight.setAttribute('y', mt.toString());
    qTopRight.setAttribute('width', (ml + w - midX).toString());
    qTopRight.setAttribute('height', (midY - mt).toString());
    qTopRight.setAttribute('fill', '#eff6ff');
    qTopRight.setAttribute('opacity', '0.55');
    svg.appendChild(qTopRight);

    // 2. High Demand + Low Capacity (Bottom-Right): Under pressure
    const qBotRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qBotRight.setAttribute('x', midX.toString());
    qBotRight.setAttribute('y', midY.toString());
    qBotRight.setAttribute('width', (ml + w - midX).toString());
    qBotRight.setAttribute('height', (mt + h - midY).toString());
    qBotRight.setAttribute('fill', '#fef2f2');
    qBotRight.setAttribute('opacity', '0.55');
    svg.appendChild(qBotRight);

    // 3. Low Demand + High Capacity (Top-Left): Under-utilised potential
    const qTopLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qTopLeft.setAttribute('x', ml.toString());
    qTopLeft.setAttribute('y', mt.toString());
    qTopLeft.setAttribute('width', (midX - ml).toString());
    qTopLeft.setAttribute('height', (midY - mt).toString());
    qTopLeft.setAttribute('fill', '#f0fdf4');
    qTopLeft.setAttribute('opacity', '0.55');
    svg.appendChild(qTopLeft);

    // 4. Low Demand + Low Capacity (Bottom-Left): Needs foundational development
    const qBotLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qBotLeft.setAttribute('x', ml.toString());
    qBotLeft.setAttribute('y', midY.toString());
    qBotLeft.setAttribute('width', (midX - ml).toString());
    qBotLeft.setAttribute('height', (mt + h - midY).toString());
    qBotLeft.setAttribute('fill', '#faf5ff');
    qBotLeft.setAttribute('opacity', '0.55');
    svg.appendChild(qBotLeft);

    // Crosshairs
    const crossX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossX.setAttribute('x1', midX.toString());
    crossX.setAttribute('x2', midX.toString());
    crossX.setAttribute('y1', mt.toString());
    crossX.setAttribute('y2', (mt + h).toString());
    crossX.setAttribute('stroke', '#cbd5e1');
    crossX.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(crossX);

    const crossY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crossY.setAttribute('x1', ml.toString());
    crossY.setAttribute('x2', (ml + w).toString());
    crossY.setAttribute('y1', midY.toString());
    crossY.setAttribute('y2', midY.toString());
    crossY.setAttribute('stroke', '#cbd5e1');
    crossY.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(crossY);

    // Quadrant Headings
    const addQText = (title: string, sub: string, x: number, y: number, anchor: string, color: string) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x.toString());
      t.setAttribute('y', y.toString());
      t.setAttribute('text-anchor', anchor);
      t.setAttribute('font-size', '8');
      t.setAttribute('font-weight', '800');
      t.setAttribute('fill', color);
      t.textContent = title;
      svg.appendChild(t);

      const s = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      s.setAttribute('x', x.toString());
      s.setAttribute('y', (y + 9).toString());
      s.setAttribute('text-anchor', anchor);
      s.setAttribute('font-size', '7');
      s.setAttribute('fill', '#64748b');
      s.textContent = sub;
      svg.appendChild(s);
    };

    addQText('CAN ABSORB GROWTH', 'High Relative Demand / High Relative Readiness', ml + w - 8, mt + 14, 'end', '#0b57d0');
    addQText('UNDER PRESSURE', 'High Relative Demand / Low Relative Readiness', ml + w - 8, mt + h - 16, 'end', '#dc2626');
    addQText('UNDER-UTILISED POTENTIAL', 'Low Relative Demand / High Relative Readiness', ml + 8, mt + 14, 'start', '#16a34a');
    addQText('NEEDS FOUNDATIONAL DEV', 'Low Relative Demand / Low Relative Readiness', ml + 8, mt + h - 16, 'start', '#7c3aed');

    // Axis Labels
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', (ml + w / 2).toString());
    xAxisLabel.setAttribute('y', (mt + h + 28).toString());
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('font-size', '9.5');
    xAxisLabel.setAttribute('font-weight', '700');
    xAxisLabel.setAttribute('fill', '#475569');
    xAxisLabel.textContent = 'Tourism Demand Score (Volume & Inflow Index) →';
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', (-mt - h / 2).toString());
    yAxisLabel.setAttribute('y', '16');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('font-size', '9.5');
    yAxisLabel.setAttribute('font-weight', '700');
    yAxisLabel.setAttribute('fill', '#475569');
    yAxisLabel.textContent = 'Destination Capacity Score (Lodging & Readiness) →';
    svg.appendChild(yAxisLabel);

    // Plot 16 Destination Points
    Object.values(DESTINATIONS_DATA).forEach((dest) => {
      const cx = scaleX(dest.demandScore);
      const cy = scaleY(dest.capacityScore);
      const r = Math.max(5, Math.min(14, Math.sqrt(dest.receiptsTotal) * 2.9));
      const color = CLUSTER_COLORS[dest.cluster] || '#0b57d0';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', r.toString());
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.8');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      circle.style.cursor = 'pointer';

      circle.addEventListener('mouseenter', (e) => {
        circle.setAttribute('r', (r + 3).toString());
        circle.setAttribute('fill-opacity', '1');
        circle.setAttribute('stroke', '#0f172a');
        circle.setAttribute('stroke-width', '2');

        this.tooltip.innerHTML = `
          <strong>${dest.name} (${dest.code})</strong> • <span style="color:${color}">${dest.cluster}</span><br/>
          • Demand Index: <strong>${dest.demandScore}/100</strong> (${dest.visitorsTotal}M visitors)<br/>
          • Capacity Index: <strong>${dest.capacityScore}/100</strong> (${dest.roomsTotal.toLocaleString()} rms)<br/>
          • Receipts: <strong>RM ${dest.receiptsTotal}B</strong><br/>
          • Strategic Quadrant: <em>${dest.systemReading}</em><br/>
          <span style="font-size:0.65rem; color:#94a3b8;">🖱 Click bubble to open State Detail Drawer</span>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      circle.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', r.toString());
        circle.setAttribute('fill-opacity', '0.8');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1.5');
        this.tooltip.style.display = 'none';
      });

      circle.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(dest.id);
        }
      });

      svg.appendChild(circle);

      // State Code Label
      const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      codeText.setAttribute('x', cx.toString());
      codeText.setAttribute('y', (cy + 3).toString());
      codeText.setAttribute('text-anchor', 'middle');
      codeText.setAttribute('font-size', '7.5');
      codeText.setAttribute('font-weight', '800');
      codeText.setAttribute('fill', '#ffffff');
      codeText.style.pointerEvents = 'none';
      codeText.textContent = dest.code;
      svg.appendChild(codeText);
    });

    return svg;
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
