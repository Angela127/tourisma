import { ACCOMMODATION_DATA } from '../../data/accommodationData';

export class AccommodationRoomsBarChart {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'accommodation-bar-card kpi-card';

    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'kpi-card-header';
    header.style.marginBottom = '20px';
    header.innerHTML = `
      <div>
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;">Accommodation Rooms by State</h3>
        <span style="font-size: 13px; color: var(--text-secondary);">Basic supply comparison of available room inventory</span>
      </div>
    `;

    // Sort data descending by rooms
    const sortedData = [...ACCOMMODATION_DATA].sort((a, b) => b.rooms - a.rooms);
    const maxRooms = Math.max(...sortedData.map(d => d.rooms));

    const chartContainer = document.createElement('div');
    chartContainer.style.display = 'flex';
    chartContainer.style.flexDirection = 'column';
    chartContainer.style.gap = '12px';
    chartContainer.style.maxHeight = '400px';
    chartContainer.style.overflowY = 'auto';
    chartContainer.style.paddingRight = '8px';

    sortedData.forEach((state) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '16px';
      
      // State Name
      const name = document.createElement('div');
      name.style.width = '120px';
      name.style.fontSize = '12px';
      name.style.fontWeight = '600';
      name.style.color = 'var(--text-secondary)';
      name.style.whiteSpace = 'nowrap';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.textContent = state.name;
      name.title = state.name;

      // Bar Container
      const barTrack = document.createElement('div');
      barTrack.style.flex = '1';
      barTrack.style.height = '14px';
      barTrack.style.background = 'var(--border-subtle, rgba(148, 163, 184, 0.15))';
      barTrack.style.borderRadius = '4px';
      barTrack.style.overflow = 'hidden';

      // Bar Fill
      const barFill = document.createElement('div');
      barFill.style.width = `${(state.rooms / maxRooms) * 100}%`;
      barFill.style.height = '100%';
      
      // Solid blue for capacity
      barFill.style.background = '#3b82f6';
      barFill.style.borderRadius = '4px';
      barFill.style.transition = 'width 1s ease-out';
      
      barTrack.appendChild(barFill);

      // Value
      const val = document.createElement('div');
      val.style.width = '55px';
      val.style.fontSize = '13px';
      val.style.fontWeight = '700';
      val.style.color = 'var(--text-primary)';
      val.style.textAlign = 'right';
      val.textContent = state.rooms.toLocaleString();

      row.appendChild(name);
      row.appendChild(barTrack);
      row.appendChild(val);

      chartContainer.appendChild(row);
    });

    this.element.appendChild(header);
    this.element.appendChild(chartContainer);
    
    // Add simple scrollbar styling for the container via a style block
    const style = document.createElement('style');
    style.textContent = `
      .accommodation-bar-card ::-webkit-scrollbar {
        width: 4px;
      }
      .accommodation-bar-card ::-webkit-scrollbar-track {
        background: transparent;
      }
      .accommodation-bar-card ::-webkit-scrollbar-thumb {
        background: var(--border-card);
        border-radius: 4px;
      }
    `;
    this.element.appendChild(style);
  }
}
