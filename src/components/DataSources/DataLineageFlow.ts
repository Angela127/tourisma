import { DATA_LINEAGE_NODES } from '../../data/dataSourcesData';

export class DataLineageFlow {
  public readonly element: HTMLElement;
  private selectedNodeId: string = 'node_feature';

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ds-card';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'ds-card-header';
    header.innerHTML = `
      <div class="ds-card-title-group">
        <h3 class="ds-card-title">End-to-End Analytical Data Lineage</h3>
        <span class="ds-card-desc">Structural transformation pipeline from administrative ingestion to policy dashboards</span>
      </div>
      <span style="font-size:0.72rem; color:#0b57d0; font-weight:700;">
        Click any stage to inspect transformation logic
      </span>
    `;
    this.element.appendChild(header);

    // Flow diagram container
    const flowContainer = document.createElement('div');
    flowContainer.className = 'lineage-flow-container';

    DATA_LINEAGE_NODES.forEach((node, idx) => {
      const isSelected = this.selectedNodeId === node.id;
      const nodeCard = document.createElement('div');
      nodeCard.className = `lineage-node-card ${isSelected ? 'selected' : ''}`;
      nodeCard.setAttribute('data-node-id', node.id);

      nodeCard.innerHTML = `
        <div>
          <div class="lineage-stage-chip">${node.stage}</div>
          <div class="lineage-node-title">${node.title}</div>
          <div class="lineage-node-summary">${node.summary}</div>
        </div>
        <div style="margin-top:8px; font-size:0.62rem; color:#64748b; font-weight:700;">
          ${node.inputs.length} Inputs • ${node.outputs.length} Outputs
        </div>
      `;

      nodeCard.addEventListener('click', () => {
        this.selectedNodeId = node.id;
        this.render();
      });

      flowContainer.appendChild(nodeCard);

      if (idx < DATA_LINEAGE_NODES.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'lineage-arrow-divider';
        arrow.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        `;
        flowContainer.appendChild(arrow);
      }
    });

    this.element.appendChild(flowContainer);

    // Selected Detail Panel
    const selectedNode = DATA_LINEAGE_NODES.find((n) => n.id === this.selectedNodeId);
    if (selectedNode) {
      const detailPanel = document.createElement('div');
      detailPanel.className = 'lineage-detail-panel';
      detailPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.78rem; color:#0f172a;">${selectedNode.stage}: ${selectedNode.title} — Technical Deep Dive</strong>
          <span style="font-size:0.65rem; background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-weight:700;">Active Pipeline Node</span>
        </div>
        <p style="font-size:0.72rem; color:#334155; line-height:1.45; margin:4px 0 8px 0;">
          ${selectedNode.description}
        </p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.7rem;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:4px; padding:6px 10px;">
            <span style="font-size:0.65rem; font-weight:800; color:#475569; text-transform:uppercase; display:block; margin-bottom:4px;">Upstream Input Dependencies:</span>
            <ul style="margin:0; padding-left:14px; color:#64748b;">
              ${selectedNode.inputs.map((inp) => `<li>${inp}</li>`).join('')}
            </ul>
          </div>
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:4px; padding:6px 10px;">
            <span style="font-size:0.65rem; font-weight:800; color:#475569; text-transform:uppercase; display:block; margin-bottom:4px;">Downstream Output Artifacts:</span>
            <ul style="margin:0; padding-left:14px; color:#15803d;">
              ${selectedNode.outputs.map((out) => `<li>${out}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      this.element.appendChild(detailPanel);
    }
  }
}
