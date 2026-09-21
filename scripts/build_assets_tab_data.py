"""
Tourism Assets Tab Data Builder
-------------------------------
Generates:
1. src/data/tourismAssetsData.ts (Types & structured summary figures)
2. src/data/tourismAssetsMapData.json (Optimized spatial points for the interactive map)
"""

import os
import sys
import json
import pandas as pd
import numpy as np

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN_DIR = os.path.join(BASE_DIR, "finalized_dataset")
SRC_DATA_DIR = os.path.join(BASE_DIR, "src", "data")
os.makedirs(SRC_DATA_DIR, exist_ok=True)

CORE_CSV = os.path.join(FIN_DIR, "tourism_asset_coverage.csv")
SUPP_CSV = os.path.join(FIN_DIR, "tourism_supporting_assets.csv")
STATE_MASTER_CSV = os.path.join(FIN_DIR, "tourisma_state_master.csv")

def map_core_group(cat):
    c = str(cat).strip()
    if "Historic" in c:
        return "Heritage & Culture"
    elif c in ["Beach", "Waterfall", "Viewpoint"]:
        return "Nature & Outdoors"
    elif c in ["Museum", "Gallery"]:
        return "Museums & Galleries"
    elif c in ["Theme Park", "Water Park", "Zoo", "Aquarium"]:
        return "Amusement & Wildlife"
    else:
        return "Attractions & Landmarks"

def map_supp_group(cat):
    c = str(cat).strip()
    if c == "Food & Beverage":
        return "Food & Beverage"
    elif c == "Public Transport":
        return "Public Transport"
    elif c == "Accommodation":
        return "Accommodation"
    elif c == "Essential Services":
        return "Healthcare & Essential"
    return c

def main():
    print("Loading datasets...")
    df_core = pd.read_csv(CORE_CSV, low_memory=False)
    df_supp = pd.read_csv(SUPP_CSV, low_memory=False)
    df_state_master = pd.read_csv(STATE_MASTER_CSV)

    df_core["group_category"] = df_core["category"].apply(map_core_group)
    df_supp["group_category"] = df_supp["category"].apply(map_supp_group)

    core_count = len(df_core)
    supp_count = len(df_supp)
    total_count = core_count + supp_count

    print(f"Core: {core_count:,} | Supp: {supp_count:,} | Total: {total_count:,}")

    # 1. Category Breakdown: Core
    core_cats = df_core["group_category"].value_counts()
    core_breakdown = [
        {
            "category": cat,
            "count": int(cnt),
            "percentage": round((cnt / core_count) * 100, 1),
            "type": "core"
        }
        for cat, cnt in core_cats.items()
    ]

    # Category Breakdown: Supporting
    supp_cats = df_supp["group_category"].value_counts()
    supp_breakdown = [
        {
            "category": cat,
            "count": int(cnt),
            "percentage": round((cnt / supp_count) * 100, 1),
            "type": "supporting"
        }
        for cat, cnt in supp_cats.items()
    ]

    # Category Breakdown: All Combined
    all_cat_counts = {}
    for item in core_breakdown:
        all_cat_counts[item["category"]] = all_cat_counts.get(item["category"], 0) + item["count"]
    for item in supp_breakdown:
        all_cat_counts[item["category"]] = all_cat_counts.get(item["category"], 0) + item["count"]

    all_breakdown = sorted(
        [
            {
                "category": cat,
                "count": cnt,
                "percentage": round((cnt / total_count) * 100, 1),
                "type": "supporting" if cat in supp_cats else "core"
            }
            for cat, cnt in all_cat_counts.items()
        ],
        key=lambda x: x["count"],
        reverse=True
    )

    # 2. State Asset Distribution
    state_rows = []
    for _, r in df_state_master.iterrows():
        st = r["state"]
        c_cnt = int(r["core_asset_count"])
        s_cnt = int(r["supporting_asset_count"])
        tot = int(r["total_tourism_assets"])
        state_rows.append({
            "state": st,
            "core": c_cnt,
            "supporting": s_cnt,
            "total": tot,
            "corePercentage": round((c_cnt / tot) * 100, 1) if tot > 0 else 0,
            "supportingPercentage": round((s_cnt / tot) * 100, 1) if tot > 0 else 0,
        })

    state_dist_total = sorted(state_rows, key=lambda x: x["total"], reverse=True)
    state_dist_core = sorted(state_rows, key=lambda x: x["core"], reverse=True)
    state_dist_supp = sorted(state_rows, key=lambda x: x["supporting"], reverse=True)

    # 2b. State Asset Density Mapping
    id_map = {
        'Johor': 'johor', 'Kedah': 'kedah', 'Kelantan': 'kelantan', 'Melaka': 'melaka',
        'Negeri Sembilan': 'negeri_sembilan', 'Pahang': 'pahang', 'Perak': 'perak',
        'Perlis': 'perlis', 'Pulau Pinang': 'penang', 'Sabah': 'sabah', 'Sarawak': 'sarawak',
        'Selangor': 'selangor', 'Terengganu': 'terengganu', 'W.P. Kuala Lumpur': 'kuala_lumpur',
        'W.P. Labuan': 'labuan', 'W.P. Putrajaya': 'putrajaya'
    }
    state_density_map = {}
    for _, r in df_state_master.iterrows():
        st = r["state"]
        sid = id_map.get(st, st.lower())
        state_density_map[sid] = {
            "id": sid,
            "name": st,
            "coreAssets": int(r["core_asset_count"]),
            "supportingAssets": int(r["supporting_asset_count"]),
            "totalAssets": int(r["total_tourism_assets"]),
            "landAreaKm2": round(float(r["land_area_km2"]), 2),
            "coreDensity": round(float(r["core_asset_density"]), 2),
            "supportingDensity": round(float(r["supporting_asset_density"]), 2),
        }

    # 3. Ring Chart Palettes
    core_colors = {
        "Nature & Outdoors": "#059669",        # Emerald
        "Heritage & Culture": "#d97706",       # Amber
        "Attractions & Landmarks": "#2563eb",  # Royal Blue
        "Museums & Galleries": "#7c3aed",      # Purple
        "Amusement & Wildlife": "#ec4899",     # Rose / Pink
    }

    supp_colors = {
        "Food & Beverage": "#ea580c",          # Orange
        "Public Transport": "#0284c7",         # Sky / Transit Blue
        "Accommodation": "#4f46e5",            # Indigo
        "Healthcare & Essential": "#dc2626",    # Crimson
    }

    core_ring = [
        {
            "name": item["category"],
            "count": item["count"],
            "percentage": item["percentage"],
            "color": core_colors.get(item["category"], "#64748b"),
        }
        for item in core_breakdown
    ]

    supp_ring = [
        {
            "name": item["category"],
            "count": item["count"],
            "percentage": item["percentage"],
            "color": supp_colors.get(item["category"], "#64748b"),
        }
        for item in supp_breakdown
    ]

    # 3b. State Asset Mix Data (for interactive ring charts per state)
    core_categories = ['Nature & Outdoors', 'Heritage & Culture', 'Attractions & Landmarks', 'Museums & Galleries', 'Amusement & Wildlife']
    supp_categories = ['Food & Beverage', 'Public Transport', 'Accommodation', 'Healthcare & Essential']

    state_mix_data = {}
    for _, r in df_state_master.iterrows():
        st = r["state"]
        sid = id_map.get(st, st.lower())
        c_df = df_core[df_core["state"] == st]
        s_df = df_supp[df_supp["state"] == st]
        c_tot = len(c_df)
        s_tot = len(s_df)

        c_counts = c_df["group_category"].value_counts()
        s_counts = s_df["group_category"].value_counts()

        c_mix = []
        for cat in core_categories:
            cnt = int(c_counts.get(cat, 0))
            pct = round((cnt / c_tot) * 100, 1) if c_tot > 0 else 0
            c_mix.append({"name": cat, "count": cnt, "percentage": pct, "color": core_colors[cat]})
        c_mix.sort(key=lambda x: x["count"], reverse=True)

        s_mix = []
        for cat in supp_categories:
            cnt = int(s_counts.get(cat, 0))
            pct = round((cnt / s_tot) * 100, 1) if s_tot > 0 else 0
            s_mix.append({"name": cat, "count": cnt, "percentage": pct, "color": supp_colors[cat]})
        s_mix.sort(key=lambda x: x["count"], reverse=True)

        state_mix_data[sid] = {
            "id": sid,
            "name": st,
            "totalCore": c_tot,
            "totalSupporting": s_tot,
            "totalAssets": c_tot + s_tot,
            "coreMix": c_mix,
            "supportingMix": s_mix,
        }

    # 3c. State Attraction Portfolio Diversity Data (Graph 6.2)
    # Order matches Graph 6.2 from research report
    diversity_state_order = [
        'W.P. Labuan', 'Terengganu', 'Kelantan', 'Pahang', 'Kedah', 'Johor',
        'Sarawak', 'Perlis', 'Sabah', 'Selangor', 'Perak', 'Negeri Sembilan',
        'Pulau Pinang', 'W.P. Putrajaya', 'W.P. Kuala Lumpur', 'Melaka'
    ]

    diversity_colors = {
        'Attractions & Landmarks': '#2f4fa8',  # Navy / Slate Blue (Graph 6.2)
        'Heritage & Culture': '#169d74',       # Emerald Jade Green (Graph 6.2)
        'Museums & Galleries': '#209aa4',      # Cyan / Teal (Graph 6.2)
        'Amusement & Wildlife': '#7c3aed',     # Violet / Purple
        'Nature & Outdoors': '#dc8522',        # Warm Ochre / Amber (Graph 6.2)
    }

    diversity_cats = [
        'Attractions & Landmarks',
        'Heritage & Culture',
        'Museums & Galleries',
        'Amusement & Wildlife',
        'Nature & Outdoors'
    ]

    portfolio_diversity = []
    for s in diversity_state_order:
        sub = df_core[df_core['state'] == s]
        tot = len(sub)
        vc = sub['group_category'].value_counts()
        segments = []
        for c in diversity_cats:
            cnt = int(vc.get(c, 0))
            pct = round((cnt / tot) * 100, 1) if tot > 0 else 0
            segments.append({
                'category': c,
                'count': cnt,
                'percentage': pct,
                'color': diversity_colors[c]
            })
        portfolio_diversity.append({
            'id': id_map.get(s, s.lower()),
            'state': s,
            'totalCoreAssets': tot,
            'segments': segments
        })

    # Write TypeScript data module
    ts_content = f"""// Auto-generated by scripts/build_assets_tab_data.py
// Do not edit directly. Re-run script to update.

export interface AssetCategoryItem {{
  category: string;
  count: number;
  percentage: number;
  type: 'core' | 'supporting';
}}

export interface AssetRingSlice {{
  name: string;
  count: number;
  percentage: number;
  color: string;
}}

export interface StateAssetItem {{
  state: string;
  core: number;
  supporting: number;
  total: number;
  corePercentage: number;
  supportingPercentage: number;
}}

export interface TourismAssetKpis {{
  coreAssetsCount: number;
  supportingAssetsCount: number;
  totalAssetsCount: number;
  categoryCount: number;
  subCategoryCount: number;
  statesCoveredCount: number;
}}

export const TOURISM_ASSETS_KPIS: TourismAssetKpis = {{
  coreAssetsCount: {core_count},
  supportingAssetsCount: {supp_count},
  totalAssetsCount: {total_count},
  categoryCount: 9,
  subCategoryCount: 50,
  statesCoveredCount: 16,
}};

export const ASSET_BREAKDOWN_ALL: AssetCategoryItem[] = {json.dumps(all_breakdown, indent=2)};

export const ASSET_BREAKDOWN_CORE: AssetCategoryItem[] = {json.dumps(core_breakdown, indent=2)};

export const ASSET_BREAKDOWN_SUPPORTING: AssetCategoryItem[] = {json.dumps(supp_breakdown, indent=2)};

export const CORE_ASSET_MIX: AssetRingSlice[] = {json.dumps(core_ring, indent=2)};

export const SUPPORTING_ASSET_MIX: AssetRingSlice[] = {json.dumps(supp_ring, indent=2)};

export const STATE_ASSETS_TOTAL: StateAssetItem[] = {json.dumps(state_dist_total, indent=2)};

export const STATE_ASSETS_CORE: StateAssetItem[] = {json.dumps(state_dist_core, indent=2)};

export const STATE_ASSETS_SUPPORTING: StateAssetItem[] = {json.dumps(state_dist_supp, indent=2)};

export interface StateAssetDensityItem {{
  id: string;
  name: string;
  coreAssets: number;
  supportingAssets: number;
  totalAssets: number;
  landAreaKm2: number;
  coreDensity: number;
  supportingDensity: number;
}}

export const STATE_ASSET_DENSITY_DATA: Record<string, StateAssetDensityItem> = {json.dumps(state_density_map, indent=2)};

export interface StateAssetMixItem {{
  id: string;
  name: string;
  totalCore: number;
  totalSupporting: number;
  totalAssets: number;
  coreMix: AssetRingSlice[];
  supportingMix: AssetRingSlice[];
}}

export const STATE_ASSET_MIX_DATA: Record<string, StateAssetMixItem> = {json.dumps(state_mix_data, indent=2)};

export interface StatePortfolioDiversitySegment {{
  category: string;
  count: number;
  percentage: number;
  color: string;
}}

export interface StatePortfolioDiversityItem {{
  id: string;
  state: string;
  totalCoreAssets: number;
  segments: StatePortfolioDiversitySegment[];
}}

export const STATE_PORTFOLIO_DIVERSITY_DATA: StatePortfolioDiversityItem[] = {json.dumps(portfolio_diversity, indent=2)};

export const ASSET_CATEGORY_COLORS: Record<string, string> = {{
  'Food & Beverage': '#ea580c',
  'Public Transport': '#0284c7',
  'Accommodation': '#4f46e5',
  'Healthcare & Essential': '#dc2626',
  'Nature & Outdoors': '#059669',
  'Heritage & Culture': '#d97706',
  'Attractions & Landmarks': '#2563eb',
  'Museums & Galleries': '#7c3aed',
  'Amusement & Wildlife': '#ec4899',
}};
"""

    ts_output_path = os.path.join(SRC_DATA_DIR, "tourismAssetsData.ts")
    with open(ts_output_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Saved TypeScript definitions to: {ts_output_path}")

    # 4. Generate Spatial Points for the Interactive Map
    # All 5,491 Core Assets + Key Supporting Assets (accommodations, transit hubs, hospitals, and curated F&B)
    print("Generating spatial points for interactive map...")
    map_points = []

    # Add all core assets
    for _, r in df_core.iterrows():
        name = r.get("name_en")
        if pd.isna(name) or not str(name).strip():
            name = r.get("name")
        if pd.isna(name) or not str(name).strip():
            name = f"Unnamed {r['category']}"

        map_points.append({
            "id": r["asset_id"],
            "n": str(name)[:50],
            "g": r["group_category"],
            "c": r["category"],
            "s": r["state"],
            "d": str(r.get("district", "")),
            "lat": round(float(r["lat"]), 5),
            "lon": round(float(r["lon"]), 5),
            "t": "core"
        })

    # Add key supporting assets:
    # 100% Accommodation (6,281)
    # 100% Public Transport hubs (15,748 - or transit stations, terminals, bus stations)
    # 100% Essential Services (4,749)
    # Sampled Food & Beverage (top 20 per district to avoid huge file size)
    supp_lodging = df_supp[df_supp["category"] == "Accommodation"]
    supp_transit = df_supp[df_supp["subcategory"].isin([
        "Railway / Transit Station", "Bus Station / Terminal", "Ferry Terminal", "Transit Station", "Railway Halt"
    ])]
    supp_essential = df_supp[df_supp["category"] == "Essential Services"]
    supp_fb_sample = df_supp[df_supp["category"] == "Food & Beverage"].groupby(["state", "district"]).head(15)

    supp_subset = pd.concat([supp_lodging, supp_transit, supp_essential, supp_fb_sample]).drop_duplicates(subset=["asset_id"])

    print(f"Adding {len(supp_subset):,} supporting assets to map...")
    for _, r in supp_subset.iterrows():
        name = r.get("name_en")
        if pd.isna(name) or not str(name).strip():
            name = r.get("name")
        if pd.isna(name) or not str(name).strip():
            name = f"Unnamed {r['subcategory']}"

        map_points.append({
            "id": r["asset_id"],
            "n": str(name)[:50],
            "g": r["group_category"],
            "c": r["subcategory"],
            "s": r["state"],
            "d": str(r.get("district", "")),
            "lat": round(float(r["lat"]), 5),
            "lon": round(float(r["lon"]), 5),
            "t": "supporting"
        })

    map_json_path = os.path.join(SRC_DATA_DIR, "tourismAssetsMapData.json")
    with open(map_json_path, "w", encoding="utf-8") as f:
        json.dump(map_points, f, separators=(",", ":"))

    file_size_kb = os.path.getsize(map_json_path) / 1024
    print(f"Saved {len(map_points):,} map points to {map_json_path} ({file_size_kb:.1f} KB)")
    print("Done building Tourism Assets data!")

if __name__ == "__main__":
    main()
