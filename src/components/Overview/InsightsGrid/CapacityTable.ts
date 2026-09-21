import { createElement, AlertTriangle } from 'lucide';
import { CAPACITY_TABLE_DATA } from '../../../data/overviewData';

export class CapacityTable {
  public readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'insight-card capacity-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header-compact';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title-wrap';

    // The Amber Warning Icon (The only place amber appears on the page)
    const icon = createElement(AlertTriangle, {
      width: 15,
      height: 15,
      'stroke-width': 2.2,
      color: '#d97706', // Amber warning color
    });

    const title = document.createElement('h3');
    title.className = 'card-title-text';
    title.textContent = 'States Approaching Capacity';

    titleWrap.appendChild(icon);
    titleWrap.appendChild(title);

    const alertBadge = document.createElement('span');
    alertBadge.className = 'amber-attention-pill';
    alertBadge.textContent = 'Policy Alert';

    cardHeader.appendChild(titleWrap);
    cardHeader.appendChild(alertBadge);

    // Table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'capacity-table-container';

    const table = document.createElement('table');
    table.className = 'capacity-table';

    table.innerHTML = `
      <thead>
        <tr>
          <th class="th-state">State</th>
          <th class="th-score">Pressure</th>
          <th class="th-constraint">Binding Constraint</th>
          <th class="th-trend">Trend</th>
        </tr>
      </thead>
      <tbody>
        ${CAPACITY_TABLE_DATA.map((row) => {
          const trendIcon =
            row.trend === 'up'
              ? '<span class="trend-icon-wrap amber-trend"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span>'
              : row.trend === 'down'
                ? '<span class="trend-icon-wrap stable-trend"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg></span>'
                : '<span class="trend-icon-wrap stable-trend"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>';

          return `
            <tr class="capacity-row">
              <td class="td-state">
                <div class="state-cell">
                  <span class="state-code-badge">${row.code}</span>
                  <span class="state-name-text">${row.stateName}</span>
                </div>
              </td>
              <td class="td-score">
                <div class="pressure-score-cell">
                  <span class="score-amber-badge">${row.pressureScore}</span>
                  <div class="mini-score-bar">
                    <div class="mini-score-fill" style="width: ${row.pressureScore}%;"></div>
                  </div>
                </div>
              </td>
              <td class="td-constraint">
                <span class="constraint-plain-text">${row.bindingConstraint}</span>
              </td>
              <td class="td-trend">
                ${trendIcon}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    tableContainer.appendChild(table);

    this.element.appendChild(cardHeader);
    this.element.appendChild(tableContainer);
  }
}
