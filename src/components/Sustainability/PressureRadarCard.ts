import { SUSTAINABILITY_STATES_DATA, type PressureDimension } from '../../data/sustainabilityData';

const STATE_COLORS = ['#dc2626', '#10b981', '#0b57d0'];

export class PressureRadarCard {
  public readonly element: HTMLElement;
  private selectedStateIds: string[] = ['penang', 'sarawak', 'perak'];
  private radarStage!: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'sus-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'sus-card-header';
    header.innerHTML = `
      <div class="sus-card-title-group">
        <h3 class="sus-card-title">Cross-Destination Pressure Dimension Comparison</h3>
        <span class="sus-card-desc">Compare carry-capacity footprint across 5 core dimensions for up to 3 destinations</span>
      </div>
    `;

    // State Pickers Row
    const controlsRow = document.createElement('div');
    controlsRow.className = 'radar-controls-row';

    const selectorsGroup = document.createElement('div');
    selectorsGroup.className = 'radar-state-selectors';

    const allStates = Object.values(SUSTAINABILITY_STATES_DATA);

    // 3 Selectors
    for (let i = 0; i < 3; i++) {
      const select = document.createElement('select');
      select.className = 'radar-select';
      select.style.borderLeft = `3px solid ${STATE_COLORS[i]}`;

      allStates.forEach((st) => {
        const opt = document.createElement('option');
        opt.value = st.id;
        opt.textContent = st.name;
        if (this.selectedStateIds[i] === st.id) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        this.selectedStateIds[i] = (e.target as HTMLSelectElement).value;
        this.updateRadarSvg();
      });

      selectorsGroup.appendChild(select);
    }

    controlsRow.appendChild(selectorsGroup);

    this.radarStage = document.createElement('div');
    this.radarStage.className = 'sus-radar-stage';

    this.element.appendChild(header);
    this.element.appendChild(controlsRow);
    this.element.appendChild(this.radarStage);

    this.updateRadarSvg();
  }

  private updateRadarSvg(): void {
    const dimensions: { key: PressureDimension; label: string }[] = [
      { key: 'visitor_density', label: 'Visitor Density' },
      { key: 'accommodation_strain', label: 'Lodging Strain' },
      { key: 'seasonal_concentration', label: 'Seasonality' },
      { key: 'environmental_indicators', label: 'Environmental' },
      { key: 'composite_pressure', label: 'Composite Risk' },
    ];

    const size = 320;
    const center = size / 2;
    const radius = 95;
    const count = dimensions.length;

    // Grid concentric webs
    const levels = [0.25, 0.5, 0.75, 1.0];
    let gridSvg = '';
    levels.forEach((lvl) => {
      const r = radius * lvl;
      gridSvg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="1" />`;
      gridSvg += `<text x="${center + 4}" y="${center - r + 8}" font-size="7" fill="#94a3b8" font-weight="600">${lvl * 100}</text>`;
    });

    // 70 Critical threshold dashed circle
    const r70 = radius * 0.7;
    gridSvg += `<circle cx="${center}" cy="${center}" r="${r70}" fill="none" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 3" opacity="0.6" />`;

    // Spokes and labels
    let spokesSvg = '';
    let labelsSvg = '';
    dimensions.forEach((dim, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      spokesSvg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;

      const lx = center + Math.cos(angle) * (radius + 22);
      const ly = center + Math.sin(angle) * (radius + 16);
      const anchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
      labelsSvg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="8.5" font-weight="750" fill="#475569">${dim.label}</text>`;
    });

    // State Polygons
    let polygonsSvg = '';
    this.selectedStateIds.forEach((stateId, idx) => {
      const state = SUSTAINABILITY_STATES_DATA[stateId];
      if (!state) return;
      const color = STATE_COLORS[idx];

      const points = dimensions
        .map((dim, i) => {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const val = state.dimensions[dim.key].score;
          const r = (val / 100) * radius;
          return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
        })
        .join(' ');

      polygonsSvg += `
        <polygon points="${points}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2.2" />
      `;
    });

    this.radarStage.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" style="width:100%; max-width:400px; height:100%;">
        ${gridSvg}
        ${spokesSvg}
        ${polygonsSvg}
        ${labelsSvg}
      </svg>
    `;
  }
}
