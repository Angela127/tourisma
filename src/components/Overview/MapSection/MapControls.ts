import { createElement, Map as MapIcon, CircleDot } from 'lucide';

export type MapMetric = 'visitors' | 'receipts' | 'receiptsPerVisitor' | 'readinessScore';
export type MapViewMode = 'choropleth' | 'bubble';

export interface MapControlsProps {
  currentMetric: MapMetric;
  currentViewMode: MapViewMode;
  onMetricChange: (metric: MapMetric) => void;
  onViewModeChange: (mode: MapViewMode) => void;
}

export class MapControls {
  public readonly element: HTMLElement;
  private metricButtons: globalThis.Map<MapMetric, HTMLButtonElement> = new globalThis.Map();
  private viewButtons: globalThis.Map<MapViewMode, HTMLButtonElement> = new globalThis.Map();
  private props: MapControlsProps;

  constructor(props: MapControlsProps) {
    this.props = props;
    this.element = document.createElement('div');
    this.element.className = 'map-controls-bar';

    // Left: Metric Toggle Segmented Control
    const metricGroup = document.createElement('div');
    metricGroup.className = 'segmented-control metric-toggle';
    metricGroup.setAttribute('role', 'radiogroup');
    metricGroup.setAttribute('aria-label', 'Map Metric Selection');

    const metrics: { id: MapMetric; label: string }[] = [
      { id: 'visitors', label: 'Visitors' },
      { id: 'receipts', label: 'Receipts' },
      { id: 'receiptsPerVisitor', label: 'Receipts / Visitor' },
      { id: 'readinessScore', label: 'Readiness Score' },
    ];

    metrics.forEach(({ id, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `segmented-btn ${this.props.currentMetric === id ? 'active' : ''}`;
      btn.textContent = label;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(this.props.currentMetric === id));
      btn.addEventListener('click', () => {
        this.setMetric(id);
        this.props.onMetricChange(id);
      });
      this.metricButtons.set(id, btn);
      metricGroup.appendChild(btn);
    });

    // Right: View Mode Toggle (Choropleth vs Bubble)
    const viewGroup = document.createElement('div');
    viewGroup.className = 'segmented-control view-toggle';
    viewGroup.setAttribute('role', 'radiogroup');
    viewGroup.setAttribute('aria-label', 'Map Visualization Mode');

    const views = [
      { id: 'choropleth' as MapViewMode, label: 'Choropleth', icon: MapIcon },
      { id: 'bubble' as MapViewMode, label: 'Proportional Bubble', icon: CircleDot },
    ];

    views.forEach(({ id, label, icon }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `segmented-btn icon-btn ${this.props.currentViewMode === id ? 'active' : ''}`;
      btn.title = label;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(this.props.currentViewMode === id));

      const iconElem = createElement(icon, {
        class: 'btn-icon',
        width: 14,
        height: 14,
        'stroke-width': 2.2,
      });
      const textElem = document.createElement('span');
      textElem.textContent = label;

      btn.appendChild(iconElem);
      btn.appendChild(textElem);

      btn.addEventListener('click', () => {
        this.setViewMode(id);
        this.props.onViewModeChange(id);
      });

      this.viewButtons.set(id, btn);
      viewGroup.appendChild(btn);
    });

    this.element.appendChild(metricGroup);
    this.element.appendChild(viewGroup);
  }

  public setMetric(metric: MapMetric): void {
    this.metricButtons.forEach((btn, id) => {
      const isActive = id === metric;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });
  }

  public setViewMode(mode: MapViewMode): void {
    this.viewButtons.forEach((btn, id) => {
      const isActive = id === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });
  }
}
