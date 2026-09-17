import { SUSTAINABILITY_STATES_DATA } from '../../data/sustainabilityData';

export class PressureTrajectoryChart {
  public readonly element: HTMLElement;
  private onSelectStateCallback?: (stateId: string) => void;
  private tooltip!: HTMLElement;
  private svgEl!: SVGElement;

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
        <h3 class="sus-card-title">Pressure Index Trajectory (2020 – 2026)</h3>
        <span class="sus-card-desc">Multi-line evolution across all 16 states (Hover to isolate)</span>
      </div>
      <span class="infra-toggle-group" style="padding:4px 8px; font-size:0.68rem; color:#dc2626; font-weight:700;">
        Critical Limit: 75 pts
      </span>
    `;

    const stage = document.createElement('div');
    stage.className = 'sus-trajectory-stage';

    this.svgEl = this.createMultiLineSvg();
    stage.appendChild(this.svgEl);

    this.element.appendChild(header);
    this.element.appendChild(stage);
  }

  private createMultiLineSvg(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 300');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    const ml = 36;
    const mr = 42;
    const mt = 20;
    const mb = 30;
    const w = 500 - ml - mr;
    const h = 300 - mt - mb;

    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const scaleX = (yr: number) => ml + ((yr - 2020) / (2026 - 2020)) * w;
    const scaleY = (score: number) => mt + h - (score / 100) * h;

    // Critical 75 Line
    const critY = scaleY(75);
    const critLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    critLine.setAttribute('x1', ml.toString());
    critLine.setAttribute('x2', (ml + w).toString());
    critLine.setAttribute('y1', critY.toString());
    critLine.setAttribute('y2', critY.toString());
    critLine.setAttribute('stroke', '#dc2626');
    critLine.setAttribute('stroke-width', '1.2');
    critLine.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(critLine);

    const critText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    critText.setAttribute('x', (ml + w + 4).toString());
    critText.setAttribute('y', (critY + 3).toString());
    critText.setAttribute('font-size', '8');
    critText.setAttribute('font-weight', '800');
    critText.setAttribute('fill', '#dc2626');
    critText.textContent = '75 limit';
    svg.appendChild(critText);

    // Year ticks
    years.forEach((yr) => {
      const x = scaleX(yr);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x.toString());
      t.setAttribute('y', (mt + h + 18).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '8.5');
      t.setAttribute('fill', '#94a3b8');
      t.setAttribute('font-weight', '600');
      t.textContent = yr.toString();
      svg.appendChild(t);
    });

    const states = Object.values(SUSTAINABILITY_STATES_DATA);

    states.forEach((state) => {
      const pts = state.trajectoryHistory.map((d) => ({
        x: scaleX(d.year),
        y: scaleY(d.score),
      }));

      const isHighPressure = state.compositeScore >= 75;
      const baseColor = isHighPressure ? '#dc2626' : state.compositeScore >= 50 ? '#f59e0b' : '#10b981';

      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', baseColor);
      polyline.setAttribute('stroke-width', isHighPressure ? '2.2' : '1.2');
      polyline.setAttribute('opacity', isHighPressure ? '0.9' : '0.45');
      polyline.style.cursor = 'pointer';
      polyline.style.transition = 'all 0.15s ease';

      polyline.addEventListener('mouseenter', (e) => {
        svg.querySelectorAll('polyline').forEach((p) => {
          (p as SVGPolylineElement).style.opacity = '0.15';
          (p as SVGPolylineElement).setAttribute('stroke-width', '1');
        });
        polyline.style.opacity = '1';
        polyline.setAttribute('stroke-width', '3');

        this.tooltip.innerHTML = `
          <strong>${state.name} (${state.code})</strong><br/>
          • 2026 Score: <strong>${state.compositeScore.toFixed(1)}/100</strong><br/>
          • 2020 Baseline: <strong>${state.trajectoryHistory[0].score}/100</strong><br/>
          <span style="font-size:0.65rem; color:#94a3b8;">🖱 Click to open State Profile</span>
        `;
        this.tooltip.style.display = 'block';
        this.updateTooltipPos(e);
      });

      polyline.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
      polyline.addEventListener('mouseleave', () => {
        svg.querySelectorAll('polyline').forEach((p) => {
          const isCrit = (p as any)._isCrit;
          p.style.opacity = isCrit ? '0.9' : '0.45';
          p.setAttribute('stroke-width', isCrit ? '2.2' : '1.2');
        });
        this.tooltip.style.display = 'none';
      });

      (polyline as any)._isCrit = isHighPressure;

      polyline.addEventListener('click', () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state.id);
        }
      });

      svg.appendChild(polyline);

      // End dot
      const last = pts[pts.length - 1];
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', last.x.toString());
      dot.setAttribute('cy', last.y.toString());
      dot.setAttribute('r', isHighPressure ? '3' : '2');
      dot.setAttribute('fill', baseColor);
      svg.appendChild(dot);
    });

    return svg;
  }

  private updateTooltipPos(e: MouseEvent): void {
    this.tooltip.style.left = `${e.clientX + 14}px`;
    this.tooltip.style.top = `${e.clientY + 14}px`;
  }
}
