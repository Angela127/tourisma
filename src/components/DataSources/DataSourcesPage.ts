import './dataSources.css';
import { DatasetRegistryTable } from './DatasetRegistryTable';
import { DataLineageFlow } from './DataLineageFlow';
import { DataQualityMatrix } from './DataQualityMatrix';
import { ModelMethodologyCards } from './ModelMethodologyCards';

export class DataSourcesPage {
  public readonly element: HTMLElement;
  private datasetRegistry: DatasetRegistryTable;
  private lineageFlow: DataLineageFlow;
  private qualityMatrix: DataQualityMatrix;
  private methodologyCards: ModelMethodologyCards;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'data-sources-page';

    this.datasetRegistry = new DatasetRegistryTable();
    this.lineageFlow = new DataLineageFlow();
    this.qualityMatrix = new DataQualityMatrix();
    this.methodologyCards = new ModelMethodologyCards();

    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // Page Header
    const pageHeader = document.createElement('div');
    pageHeader.className = 'ds-section-block';
    pageHeader.innerHTML = `
      <div class="ds-section-header">
        <div class="ds-section-title-wrap">
          <h2 class="ds-section-title">Data Sources, Lineage & Methodology</h2>
          <span class="ds-section-subtitle">Exhaustive documentation of administrative inputs, analytical lineage, and econometric models</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.72rem; color:#0b57d0; background:#eff6ff; border:1px solid #bfdbfe; padding:2px 8px; border-radius:4px; font-weight:700;">
            Open Data Standard Compliance
          </span>
        </div>
      </div>
    `;
    this.element.appendChild(pageHeader);

    // Section 1: Dataset Registry Table
    const sec1 = document.createElement('div');
    sec1.className = 'ds-section-block';
    sec1.innerHTML = `
      <div class="ds-section-header">
        <div class="ds-section-title-wrap">
          <h3 class="ds-section-title">Dataset Registry</h3>
          <span class="ds-section-subtitle">Primary administrative collections, surveys, and spatial telemetry</span>
        </div>
      </div>
    `;
    sec1.appendChild(this.datasetRegistry.element);
    this.element.appendChild(sec1);

    // Section 2: Data Lineage Flow
    const sec2 = document.createElement('div');
    sec2.className = 'ds-section-block';
    sec2.innerHTML = `
      <div class="ds-section-header">
        <div class="ds-section-title-wrap">
          <h3 class="ds-section-title">Data Lineage & Pipeline Architecture</h3>
          <span class="ds-section-subtitle">Deterministic transformation from raw feeds to published policy indicators</span>
        </div>
      </div>
    `;
    sec2.appendChild(this.lineageFlow.element);
    this.element.appendChild(sec2);

    // Section 3: Data Quality & Coverage Matrix
    const sec3 = document.createElement('div');
    sec3.className = 'ds-section-block';
    sec3.innerHTML = `
      <div class="ds-section-header">
        <div class="ds-section-title-wrap">
          <h3 class="ds-section-title">Data Quality & Honest Coverage Matrix</h3>
          <span class="ds-section-subtitle">16-State spatial coverage audit and documented telemetry limitations</span>
        </div>
      </div>
    `;
    sec3.appendChild(this.qualityMatrix.element);
    this.element.appendChild(sec3);

    // Section 4: Model Methodology Cards
    const sec4 = document.createElement('div');
    sec4.className = 'ds-section-block';
    sec4.innerHTML = `
      <div class="ds-section-header">
        <div class="ds-section-title-wrap">
          <h3 class="ds-section-title">Model Specifications & Methodology</h3>
          <span class="ds-section-subtitle">Formulations, training intervals, validation metrics, and stated caveats</span>
        </div>
      </div>
    `;
    sec4.appendChild(this.methodologyCards.element);
    this.element.appendChild(sec4);
  }
}
