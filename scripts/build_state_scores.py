"""
Tourisma — State Scoring & Relative Positioning Matrix Builder (Option 1)

Generates:
- dataset/tourisma_state_scores.csv
- finalized_dataset/tourisma_state_scores.csv
- clustering/tourisma_demand_readiness_matrix.png

Methodology (Option 1 — Relative Positioning):
1. Normalization:
   Min-Max scaling to 0–100 for all indicators:
   score = (value - min) / (max - min) * 100

2. Equal Weighting:
   - Demand Score (3 pillars, 33.3% each):
     (domestic_visitors_score + international_hotel_guests_score + receipts_score) / 3
   - Readiness Score (5 pillars, 20% each):
     (accommodation_capacity_score + core_asset_density_score + supporting_asset_density_score + road_access_score + pt_access_score) / 5
   - Supporting Profile: average_length_of_stay is kept separate as a supporting indicator.

3. Relative Positioning (Median Benchmark):
   - Median Demand Score = 39.50
   - Median Readiness Score = 18.12
   - Categories:
     * Above Median Demand vs Below Median Demand
     * Above Relative Readiness vs Below Relative Readiness
   - 4 Quadrants:
     * Above Median Demand / Above Relative Readiness
     * Above Median Demand / Below Relative Readiness
     * Below Median Demand / Above Relative Readiness
     * Below Median Demand / Below Relative Readiness
"""

import os
import sys
import shutil
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def min_max_norm(series: pd.Series) -> pd.Series:
    mn = series.min()
    mx = series.max()
    if mx == mn:
        return series * 0.0
    return ((series - mn) / (mx - mn) * 100).round(2)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fin_dir = os.path.join(base_dir, 'finalized_dataset')
    data_dir = os.path.join(base_dir, 'dataset')
    cluster_dir = os.path.join(base_dir, 'clustering')
    os.makedirs(cluster_dir, exist_ok=True)

    # Brain artifact directory for embedding in walkthrough
    artifact_dir = r"C:\Users\User\.gemini\antigravity-ide\brain\aff776fa-cdc6-4d70-9674-e66d154b0405"

    master_path = os.path.join(fin_dir, 'tourisma_state_master.csv')
    if not os.path.exists(master_path):
        master_path = os.path.join(data_dir, 'tourisma_state_master.csv')
    
    if not os.path.exists(master_path):
        print(f"Error: Master dataset not found at {master_path}")
        sys.exit(1)

    print(f"Step 1: Loading master dataset from {master_path}...")
    df_master = pd.read_csv(master_path)
    assert len(df_master) == 16, f"Expected 16 states, got {len(df_master)}"

    print("Step 2: Normalizing indicators to 0–100 scale...")
    dom_score = min_max_norm(df_master['domestic_visitors'])
    intl_score = min_max_norm(df_master['international_hotel_guests'])
    rec_score = min_max_norm(df_master['domestic_receipts_rm_million'])
    demand_score = ((dom_score + intl_score + rec_score) / 3.0).round(2)

    cap_score = min_max_norm(df_master['accommodation_rooms'])
    core_dens_score = min_max_norm(df_master['core_asset_density'])
    supp_dens_score = min_max_norm(df_master['supporting_asset_density'])
    road_score = min_max_norm(df_master['road_access_rate'])
    pt_score = min_max_norm(df_master['pt_access_rate'])
    readiness_score = ((cap_score + core_dens_score + supp_dens_score + road_score + pt_score) / 5.0).round(2)

    # Step 3: Relative Positioning using Median Thresholds
    med_demand = round(float(demand_score.median()), 2)
    med_readiness = round(float(readiness_score.median()), 2)
    print(f"Step 3: Calculating median thresholds (Demand: {med_demand}, Readiness: {med_readiness})...")

    demand_category = np.where(demand_score >= med_demand, 'Above Median Demand', 'Below Median Demand')
    readiness_category = np.where(readiness_score >= med_readiness, 'Above Relative Readiness', 'Below Relative Readiness')

    quadrants = []
    for d_cat, r_cat in zip(demand_category, readiness_category):
        quadrants.append(f"{d_cat} / {r_cat}")

    # Assemble dataset
    df_scores = pd.DataFrame({
        'state': df_master['state'],
        'reference_year': df_master['reference_year'],
        'domestic_visitors_score': dom_score,
        'international_hotel_guests_score': intl_score,
        'receipts_score': rec_score,
        'demand_score': demand_score,
        'demand_category': demand_category,
        'accommodation_capacity_score': cap_score,
        'core_asset_density_score': core_dens_score,
        'supporting_asset_density_score': supp_dens_score,
        'road_access_score': road_score,
        'pt_access_score': pt_score,
        'readiness_score': readiness_score,
        'readiness_category': readiness_category,
        'quadrant': quadrants,
        'average_length_of_stay': df_master['average_length_of_stay']
    }).sort_values(by='demand_score', ascending=False).reset_index(drop=True)

    # Save to finalized_dataset and dataset
    for out_d in [data_dir, fin_dir]:
        os.makedirs(out_d, exist_ok=True)
        out_path = os.path.join(out_d, 'tourisma_state_scores.csv')
        df_scores.to_csv(out_path, index=False, encoding='utf-8')
        print(f"Saved: {out_path}")

    # Step 4: Generate Publication-Quality Quadrant Matrix Chart
    print("\nStep 4: Generating Tourisma Demand vs. Readiness Matrix Visualization...")
    fig, ax = plt.subplots(figsize=(13, 9), dpi=300)

    # Axis limits
    ax.set_xlim(-2, 105)
    ax.set_ylim(-2, 105)

    # Quadrant Shading
    # Top-Right: Above Median Demand / Above Relative Readiness
    ax.fill_between([med_demand, 105], med_readiness, 105, color='#e8f5e9', alpha=0.6, zorder=1)
    # Bottom-Right: Above Median Demand / Below Relative Readiness
    ax.fill_between([med_demand, 105], -2, med_readiness, color='#fff3e0', alpha=0.6, zorder=1)
    # Top-Left: Below Median Demand / Above Relative Readiness
    ax.fill_between([-2, med_demand], med_readiness, 105, color='#e1f5fe', alpha=0.6, zorder=1)
    # Bottom-Left: Below Median Demand / Below Relative Readiness
    ax.fill_between([-2, med_demand], -2, med_readiness, color='#f5f5f5', alpha=0.6, zorder=1)

    # Median Benchmark Lines
    ax.axvline(med_demand, color='#b0bec5', linestyle='--', linewidth=1.5, zorder=2)
    ax.axhline(med_readiness, color='#b0bec5', linestyle='--', linewidth=1.5, zorder=2)

    # Quadrant Titles / Headers in background
    ax.text(70, 98, 'ABOVE MEDIAN DEMAND\nABOVE RELATIVE READINESS',
            fontsize=10, fontweight='bold', color='#2e7d32', ha='center', va='top', alpha=0.85)
    ax.text(70, 4, 'ABOVE MEDIAN DEMAND\nBELOW RELATIVE READINESS\n(Capacity-Constrained)',
            fontsize=10, fontweight='bold', color='#d84315', ha='center', va='bottom', alpha=0.85)
    ax.text(18, 98, 'BELOW MEDIAN DEMAND\nABOVE RELATIVE READINESS\n(Growth Potential)',
            fontsize=10, fontweight='bold', color='#0277bd', ha='center', va='top', alpha=0.85)
    ax.text(18, 4, 'BELOW MEDIAN DEMAND\nBELOW RELATIVE READINESS\n(Foundational)',
            fontsize=10, fontweight='bold', color='#616161', ha='center', va='bottom', alpha=0.85)

    # Color mapping for scatter dots
    color_map = {
        'Above Median Demand / Above Relative Readiness': '#2e7d32', # Forest Green
        'Above Median Demand / Below Relative Readiness': '#e65100', # Deep Orange
        'Below Median Demand / Above Relative Readiness': '#0288d1', # Cerulean Blue
        'Below Median Demand / Below Relative Readiness': '#757575'  # Neutral Grey
    }

    # Plot Scatter Points & Labels
    for _, row in df_scores.iterrows():
        x = row['demand_score']
        y = row['readiness_score']
        st = row['state']
        quad = row['quadrant']
        color = color_map[quad]

        ax.scatter(x, y, color=color, s=130, edgecolor='white', linewidth=1.5, zorder=4)

        # Smart label offsets to prevent collision
        dx, dy = 1.2, 1.2
        ha = 'left'
        if st == 'W.P. Kuala Lumpur':
            dx, dy = -1.5, -2.5
            ha = 'right'
        elif st == 'Selangor':
            dx, dy = 1.5, -2.0
        elif st == 'Melaka':
            dx, dy = 1.5, 1.5
        elif st == 'W.P. Putrajaya':
            dx, dy = 1.5, -2.2
        elif st == 'Pahang':
            dx, dy = 1.5, 1.2
        elif st == 'Sarawak':
            dx, dy = 1.5, -2.5
        elif st == 'Johor':
            dx, dy = 1.5, -2.5
        elif st == 'Sabah':
            dx, dy = 1.5, 1.5
        elif st == 'Perak':
            dx, dy = -1.5, 1.5
            ha = 'right'
        elif st == 'Negeri Sembilan':
            dx, dy = -1.5, -2.0
            ha = 'right'
        elif st == 'Perlis':
            dx, dy = 1.5, 1.2
        elif st == 'W.P. Labuan':
            dx, dy = 1.5, -2.0

        ax.annotate(st, (x, y), xytext=(x + dx, y + dy),
                    fontsize=8.5, fontweight='bold', color='#263238', ha=ha, zorder=5)

    # Median Line Annotations
    ax.annotate(f'Median Demand: {med_demand:.2f}', xy=(med_demand, 102), xytext=(med_demand + 1, 103),
                fontsize=8.5, color='#455a64', fontweight='bold', ha='left')
    ax.annotate(f'Median Readiness: {med_readiness:.2f}', xy=(102, med_readiness), xytext=(103, med_readiness + 1.2),
                fontsize=8.5, color='#455a64', fontweight='bold', ha='right')

    # Styling & Labels
    ax.set_title('Tourisma — Tourism Demand vs. Destination Readiness Matrix\nRelative Positioning Model (Option 1)',
                 fontsize=14, fontweight='bold', pad=15, color='#1a237e')
    ax.set_xlabel('Tourism Demand Score (0–100)\n[Domestic Visitors (33.3%) + International Guests (33.3%) + Receipts (33.3%)]',
                  fontsize=10.5, fontweight='bold', labelpad=10)
    ax.set_ylabel('Destination Readiness Score (0–100)\n[Rooms (20%) + Core Density (20%) + Supp Density (20%) + Road Acc (20%) + PT Acc (20%)]',
                  fontsize=10.5, fontweight='bold', labelpad=10)

    ax.grid(True, linestyle=':', alpha=0.5, color='#cfd8dc')
    ax.set_axisbelow(True)

    # Legend
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#2e7d32', markersize=9, label='Above Median Demand & Above Relative Readiness (6 states)'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#e65100', markersize=9, label='Above Median Demand & Below Relative Readiness (2 states)'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#0288d1', markersize=9, label='Below Median Demand & Above Relative Readiness (2 states)'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#757575', markersize=9, label='Below Median Demand & Below Relative Readiness (6 states)')
    ]
    ax.legend(handles=legend_elements, loc='lower right', framealpha=0.95, fontsize=8.5, edgecolor='#b0bec5')

    plt.tight_layout()

    # Save to clustering and artifact directory
    chart_path = os.path.join(cluster_dir, 'tourisma_demand_readiness_matrix.png')
    plt.savefig(chart_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved Matrix Visualization: {chart_path}")

    if os.path.exists(artifact_dir):
        artifact_chart = os.path.join(artifact_dir, 'tourisma_demand_readiness_matrix.png')
        shutil.copyfile(chart_path, artifact_chart)
        print(f"Copied to Artifacts: {artifact_chart}")

    print("\n=== Relative Positioning Summary (Option 1) ===")
    print(df_scores[['state', 'demand_score', 'demand_category', 'readiness_score', 'readiness_category', 'quadrant']].to_string(index=False))

if __name__ == '__main__':
    main()
