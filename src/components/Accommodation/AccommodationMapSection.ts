import { AccommodationMap } from './AccommodationMap';
import { AccommodationMapDetail } from './AccommodationMapDetail';

export class AccommodationMapSection {
  public readonly element: HTMLElement;
  private map: AccommodationMap;
  private detail: AccommodationMapDetail;
  private onSelectStateCallback?: (stateId: string | null) => void;

  constructor(onSelectState?: (stateId: string | null) => void) {
    this.onSelectStateCallback = onSelectState;
    this.element = document.createElement('div');
    this.element.className = 'accommodation-map-section';

    this.detail = new AccommodationMapDetail(() => {
      this.setSelectedState(null);
    });

    this.map = new AccommodationMap((stateId) => {
      this.detail.setSelectedState(stateId);
      if (this.onSelectStateCallback) {
        this.onSelectStateCallback(stateId);
      }
    });

    this.render();
  }

  public setSelectedState(stateId: string | null): void {
    this.map.setSelectedState(stateId);
    this.detail.setSelectedState(stateId);
    if (this.onSelectStateCallback) {
      this.onSelectStateCallback(stateId);
    }
  }

  private render(): void {
    this.element.innerHTML = '';
    this.element.appendChild(this.map.element);
    this.element.appendChild(this.detail.element);
  }

  public destroy(): void {
    if (this.map) {
      this.map.destroy();
    }
  }
}
