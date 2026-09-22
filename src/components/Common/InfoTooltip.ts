// Reusable Dataset Information & Methodology Tooltip
// Conforms to Tourisma data governance guidelines: Organization, Dataset Name, Year, Measure, Formula & Limitations.

export interface InfoTooltipConfig {
  sourceOrg: string;
  datasetName: string;
  referenceYear: string;
  measure: string;
  formula?: string;
  limitations?: string;
}

let activeFloatingTooltip: HTMLElement | null = null;

function ensureFloatingTooltip(): HTMLElement {
  if (!activeFloatingTooltip) {
    activeFloatingTooltip = document.createElement('div');
    activeFloatingTooltip.className = 'global-info-floating-tooltip';
    activeFloatingTooltip.style.display = 'none';
    document.body.appendChild(activeFloatingTooltip);
  }
  return activeFloatingTooltip;
}

export function createInfoIcon(config: InfoTooltipConfig): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'info-tooltip-trigger';
  btn.setAttribute('aria-label', `Data source info: ${config.datasetName}`);
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  const tooltip = ensureFloatingTooltip();

  const show = () => {
    tooltip.innerHTML = `
      <div class="info-tooltip-content">
        <div class="info-tooltip-header">
          <span class="info-tooltip-badge">DATA SOURCE</span>
          <span class="info-tooltip-year">${config.referenceYear}</span>
        </div>
        <div class="info-tooltip-org">${config.sourceOrg}</div>
        <div class="info-tooltip-dataset">${config.datasetName}</div>
        
        <div class="info-tooltip-section">
          <div class="info-tooltip-label">What it measures:</div>
          <div class="info-tooltip-text">${config.measure}</div>
        </div>

        ${
          config.formula
            ? `
          <div class="info-tooltip-section">
            <div class="info-tooltip-label">Formula / Method:</div>
            <div class="info-tooltip-code">${config.formula}</div>
          </div>
        `
            : ''
        }

        ${
          config.limitations
            ? `
          <div class="info-tooltip-limitations">
            <div class="info-tooltip-limitations-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Limitations</span>
            </div>
            <div class="info-tooltip-limitations-text">${config.limitations}</div>
          </div>
        `
            : ''
        }
      </div>
    `;

    const rect = btn.getBoundingClientRect();
    tooltip.style.display = 'block';

    const ttWidth = 280;
    let left = rect.left + rect.width / 2 - ttWidth / 2;
    if (left < 10) left = 10;
    if (left + ttWidth > window.innerWidth - 10) {
      left = window.innerWidth - ttWidth - 10;
    }

    let top = rect.bottom + 8;
    if (top + 260 > window.innerHeight) {
      top = rect.top - 260 - 8;
    }

    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
    tooltip.style.width = `${ttWidth}px`;
  };

  const hide = () => {
    tooltip.style.display = 'none';
  };

  btn.addEventListener('mouseenter', show);
  btn.addEventListener('mouseleave', hide);
  btn.addEventListener('focus', show);
  btn.addEventListener('blur', hide);

  return btn;
}
