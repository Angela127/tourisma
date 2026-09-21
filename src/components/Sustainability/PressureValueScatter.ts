import { SUSTAINABILITY_STATES_DATA } from '../../data/sustainabilityData';

export class PressureValueScatter {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;

  constructor(onSelectState?: (stateId: string) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'sus-card';

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
    header.className = 'sus-card-header';
    header.innerHTML = `
      <div class="sus-card-title-group">
        <h3 class="sus-card-title">Pressure vs Economic Yield Quadrant</h3>
        <span class="sus-card-desc">Composite pressure (X) vs receipts per visitor (Y)</span>
      </div>
    `;

    const stage = document.createElement('div');
    stage.className = 'sus-scatter-stage';
    stage.appendChild(this.createScatterSvg());

    this.element.appendChild(header);
    this.element.appendChild(stage);
  }

  private createScatterSvg(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 300');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    const ml = 48;
    const mr = 20;
    const mt = 20;
    const mb = 36;
    const w = 500 - ml - mr;
    const h = 300 - mt - mb;

    const scaleX = (val: number) => ml + (val / 100) * w;
    const scaleY = (val: number) => mt + h - ((val - 300) / 700) * h;

    const midX = scaleX(60); // Pressure threshold midpoint
    const midY = scaleY(550); // Yield threshold midpoint

    // 4 Quadrants Background Shading
    const qTopLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qTopLeft.setAttribute('x', ml.toString());
    qTopLeft.setAttribute('y', mt.toString());
    qTopLeft.setAttribute('width', (midX - ml).toString());
    qTopLeft.setAttribute('height', (midY - mt).toString());
    qTopLeft.setAttribute('fill', '#f0fdf4');
    qTopLeft.setAttribute('opacity', '0.6');
    svg.appendChild(qTopLeft);

    const qTopRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qTopRight.setAttribute('x', midX.toString());
    qTopRight.setAttribute('y', mt.toString());
    qTopRight.setAttribute('width', (ml + w - midX).toString());
    qTopRight.setAttribute('height', (midY - mt).toString());
    qTopRight.setAttribute('fill', '#fef2f2');
    qTopRight.setAttribute('opacity', '0.6');
    svg.appendChild(qTopRight);

    const qBotLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qBotLeft.setAttribute('x', ml.toString());
    qBotLeft.setAttribute('y', midY.toString());
    qBotLeft.setAttribute('width', (midX - ml).toString());
    qBotLeft.setAttribute('height', (mt + h - midY).toString());
    qBotLeft.setAttribute('fill', '#eff6ff');
    qBotLeft.setAttribute('opacity', '0.6');
    svg.appendChild(qBotLeft);

    const qBotRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    qBotRight.setAttribute('x', midX.toString());
    qBotRight.setAttribute('y', midY.toString());
    qBotRight.setAttribute('width', (ml + w - midX).toString());
    qBotRight.setAttribute('height', (mt + h - midY).toString());
    qBotRight.setAttribute('fill', '#fffbeb');
    qBotRight.setAttribute('opacity', '0.6');
    svg.appendChild(qBotRight);

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

    // Quadrant Labels in plain language
    const addQText = (text: string, x: number, y: number, anchor: string, fill: string) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x.toString());
      t.setAttribute('y', y.toString());
      t.setAttribute('text-anchor', anchor);
      t.setAttribute('font-size', '8');
      t.setAttribute('font-weight', '800');
      t.setAttribute('fill', fill);
      t.textContent = text;
      svg.appendChild(t);
    };

    addQText('HIGH VALUE, LOW PRESSURE (Ideal Yield)', ml + 8, mt + 14, 'start', '#15803d');
    addQText('HIGH VALUE, HIGH PRESSURE (Stress Zone)', ml + w - 8, mt + 14, 'end', '#b91c1c');
    addQText('LOW VALUE, LOW PRESSURE (Growth Headroom)', ml + 8, mt + h - 8, 'start', '#1d4ed8');
    addQText('LOW VALUE, HIGH PRESSURE (Congestion Risk)', ml + w - 8, mt + h - 8, 'end', '#b45309');

    // Data points
    Object.values(SUSTAINABILITY_STATES_DATA).forEach((state) => {
      const cx = scaleX(state.compositeScore);
      const cy = scaleY(state.receiptsPerVisitor);
      const color = state.compositeScore >= 75 ? '#dc2626' : state.compositeScore >= 50 ? '#f59e0b' : '#10b981';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', '7');
      circle.setAttribute('fill', color);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      circle.style.cursor = 'pointer';

      circle.addEventListener('mouseenter', (e) => {
        circle.setAttribute('r', '10');
        circle.setAttribute('stroke', '#0f172a');
        this.tooltip.innerHTML = `
          <strong>${state.name} (${state.code})</strong><br/>
          • Composite Pressure: <strong>${state.compositeScore.toFixed(1)}/100</strong><br/>
          • Receipts / Visitor: <strong>RM ${state.receiptsPerVisitor}</strong><br/>
          <span style="font-size:0.65rem; color:#94a3b8;">🖱 Click to open State Profile</span>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      circle.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '7');
        circle.setAttribute('stroke', '#ffffff');
        this.tooltip.style.display = 'none';
      });

      circle.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      svg.appendChild(circle);

      // Label
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', cx.toString());
      txt.setAttribute('y', (cy - 9).toString());
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '7.5');
      txt.setAttribute('font-weight', '750');
      txt.setAttribute('fill', '#1e293b');
      txt.style.pointerEvents = 'none';
      txt.textContent = state.code;
      svg.appendChild(txt);
    });

    return svg;
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
