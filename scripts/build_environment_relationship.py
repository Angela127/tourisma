"""
Malaysia Tourism Environmental Sensitivity Dataset Builder
Creates a spatial relationship between all mapped tourism assets (Core + Supporting)
and environmentally protected/sensitive areas (Land and Marine).

Methodology & Standards:
1. Spatial Projection:
   - Projects coordinates and polygon boundaries to an Azimuthal Equidistant
     metric coordinate system centered on Malaysia:
     +proj=aeqd +lat_0=4.0 +lon_0=109.5 +datum=WGS84 +units=m
2. Point-in-Polygon & Boundary Distance:
   - Evaluates whether polygon covers the asset point: polygon.covers(point).
   - If True: distance = 0 m / 0.00 km, relationship = "Inside".
   - If False: computes shortest Euclidean geometric distance to the area's boundary
     via shapely.strtree.STRtree.
3. Tourisma Analytical Thresholds:
   - Inside: within or touching the protected polygon (distance == 0 m).
   - Near: outside, but <= 1,000 m (1.00 km) from polygon boundary.
   - Outside: > 1,000 m (1.00 km) from polygon boundary.
   * Note: The 1 km threshold is a Tourisma analytical threshold,
     not an official environmental regulation or legal buffer.
4. Dual-Dimension Architecture:
   - Evaluates nearest protected area overall, nearest Land protected area (401 polygons),
     and nearest Marine protected area (84 polygons) independently.
   - Marine Interpretation: Marine relationships are determined using the asset's
     geographic point against the mapped marine polygon. On-land assets are not
     classified as Inside a marine area unless their coordinates actually fall within
     the marine polygon.
"""

import os
import sys
import json
import time
import argparse
import numpy as np
import pandas as pd
from pyproj import Transformer
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from shapely.ops import transform

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
CORE_ASSETS_CSV = os.path.join(DATASET_DIR, "tourism_asset_coverage.csv")
SUPPORTING_ASSETS_CSV = os.path.join(DATASET_DIR, "tourism_supporting_assets.csv")
PROTECTED_AREAS_GEOJSON = os.path.join(DATASET_DIR, "environmentally_protected_areas.geojson")

OUTPUT_CSV = os.path.join(DATASET_DIR, "tourism_environment_relationship.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "tourism_environment_relationship.json")

# Projection: Azimuthal Equidistant centered on Malaysia
AEQD_PROJ = "+proj=aeqd +lat_0=4.0 +lon_0=109.5 +datum=WGS84 +units=m"

# Protection priority for selecting primary polygon when an asset is covered by multiple
PROTECTION_PRIORITY = {
    "National Park": 10,
    "Marine Park": 10,
    "State Park": 9,
    "Marine Protected Area": 9,
    "Wildlife Reserve": 8,
    "Nature Reserve": 8,
    "Turtle Sanctuary": 7,
    "Ramsar Site": 6,
    "World Heritage Site": 5,
    "Forest Reserve": 4,
}


def load_and_project_protected_areas(geojson_path, transformer):
    """
    Loads protected area polygons from GeoJSON, projects them into AEQD metres,
    and partitions them into Land and Marine groups.
    """
    print(f"Loading protected areas from: {geojson_path}")
    with open(geojson_path, "r", encoding="utf-8") as f:
        gj = json.load(f)

    land_polys, land_props = [], []
    marine_polys, marine_props = [], []
    all_polys, all_props = [], []

    for feat in gj.get("features", []):
        raw_geom = shape(feat["geometry"])
        proj_geom = transform(transformer.transform, raw_geom)
        if not proj_geom.is_valid:
            proj_geom = proj_geom.buffer(0)

        props = feat["properties"]
        all_polys.append(proj_geom)
        all_props.append(props)

        env = props.get("environment", "Land")
        if env == "Land":
            land_polys.append(proj_geom)
            land_props.append(props)
        elif env == "Marine":
            marine_polys.append(proj_geom)
            marine_props.append(props)

    print(f"  Total protected areas: {len(all_polys)}")
    print(f"  Land protected areas: {len(land_polys)}")
    print(f"  Marine protected areas: {len(marine_polys)}")

    tree_all = STRtree(all_polys)
    tree_land = STRtree(land_polys)
    tree_marine = STRtree(marine_polys)

    return {
        "all": {"polys": all_polys, "props": all_props, "tree": tree_all},
        "land": {"polys": land_polys, "props": land_props, "tree": tree_land},
        "marine": {"polys": marine_polys, "props": marine_props, "tree": tree_marine},
    }


def find_nearest_in_group(pt, group_data):
    """
    Finds the nearest protected area in a specific group (Land or Marine).
    Returns (props, dist_m, dist_km, relationship).
    """
    polys = group_data["polys"]
    props = group_data["props"]
    tree = group_data["tree"]

    # 1. Point-in-polygon check: polygon.covers(point)
    candidate_indices = tree.query(pt, predicate="intersects")
    covered_indices = [idx for idx in candidate_indices if polys[idx].covers(pt)]

    if covered_indices:
        # Prioritize higher protection type and smaller/more specific area size
        def rank_key(idx):
            ptype = props[idx].get("protection_type", "")
            prio = PROTECTION_PRIORITY.get(ptype, 0)
            area = props[idx].get("area_km2", 1e9)
            return (-prio, area)

        best_idx = min(covered_indices, key=rank_key)
        return props[best_idx], 0.0, 0.0, "Inside"

    # 2. Outside all polygons: compute shortest geometric boundary distance
    nearest_idx = tree.nearest(pt)
    dist_m = float(pt.distance(polys[nearest_idx]))
    dist_m_rounded = round(dist_m, 1)
    dist_km = round(dist_m_rounded / 1000.0, 2)

    rel = "Near" if dist_m_rounded <= 1000.0 else "Outside"
    return props[nearest_idx], dist_m_rounded, dist_km, rel


def load_tourism_assets(limit=None):
    """
    Loads and standardizes Core and Supporting tourism assets.
    """
    print(f"Loading Core Tourism Assets from: {CORE_ASSETS_CSV}")
    df_core = pd.read_csv(CORE_ASSETS_CSV)
    df_core_std = pd.DataFrame({
        "asset_id": df_core["asset_id"].astype(str),
        "asset_name": df_core["name"].fillna("Unnamed Asset").astype(str),
        "asset_group": "Core Tourism Asset",
        "category": df_core["category"].fillna("Other Attraction").astype(str),
        "state": df_core["state"].fillna("Unknown").astype(str),
        "district": df_core["district"].fillna("Unknown").astype(str),
        "latitude": df_core["lat"].astype(float),
        "longitude": df_core["lon"].astype(float),
    })
    print(f"  Core assets loaded: {len(df_core_std)}")

    print(f"Loading Supporting Tourism Assets from: {SUPPORTING_ASSETS_CSV}")
    df_supp = pd.read_csv(SUPPORTING_ASSETS_CSV, low_memory=False)
    df_supp_std = pd.DataFrame({
        "asset_id": df_supp["asset_id"].astype(str),
        "asset_name": df_supp["name"].fillna("Unnamed Facility").astype(str),
        "asset_group": "Supporting Tourism Asset",
        "category": df_supp["category"].fillna("Other Supporting").astype(str),
        "state": df_supp["state"].fillna("Unknown").astype(str),
        "district": df_supp["district"].fillna("Unknown").astype(str),
        "latitude": df_supp["lat"].astype(float),
        "longitude": df_supp["lon"].astype(float),
    })
    print(f"  Supporting assets loaded: {len(df_supp_std)}")

    df_combined = pd.concat([df_core_std, df_supp_std], ignore_index=True)
    print(f"  Total combined assets: {len(df_combined)}")

    # Remove invalid coordinates
    valid_mask = (
        df_combined["latitude"].between(0.5, 8.5) &
        df_combined["longitude"].between(99.0, 120.5)
    )
    invalid_count = (~valid_mask).sum()
    if invalid_count > 0:
        print(f"  Warning: Dropping {invalid_count} records with invalid coordinates.")
        df_combined = df_combined[valid_mask].reset_index(drop=True)

    if limit and limit > 0:
        df_combined = df_combined.head(limit).copy()
        print(f"  Limited to first {limit} records for testing.")

    return df_combined


def build_relationship_dataset(limit=None):
    """
    Main pipeline function to construct the spatial relationship dataset.
    """
    start_time = time.time()
    print("=" * 70)
    print("Tourisma Environmental Sensitivity Dataset Builder")
    print("=" * 70)

    # 1. Initialize coordinate transformer (EPSG:4326 -> AEQD Malaysia)
    transformer = Transformer.from_crs(
        "EPSG:4326", AEQD_PROJ, always_xy=True
    )

    # 2. Load protected areas
    env_groups = load_and_project_protected_areas(PROTECTED_AREAS_GEOJSON, transformer)

    # 3. Load tourism assets
    df_assets = load_tourism_assets(limit=limit)
    n_assets = len(df_assets)

    # 4. Perform spatial matching
    print(f"\nProcessing spatial relationships for {n_assets:,} assets...")
    results = []
    t_start_loop = time.time()

    for i, row in df_assets.iterrows():
        if (i + 1) % 10000 == 0 or (i + 1) == n_assets:
            elapsed = time.time() - t_start_loop
            rate = (i + 1) / max(elapsed, 0.001)
            print(f"  Processed {i + 1:,} / {n_assets:,} assets ({rate:.0f} assets/sec)...")

        pt = Point(transformer.transform(row["longitude"], row["latitude"]))

        # Query Land group
        l_props, l_dist_m, l_dist_km, l_rel = find_nearest_in_group(pt, env_groups["land"])

        # Query Marine group
        m_props, m_dist_m, m_dist_km, m_rel = find_nearest_in_group(pt, env_groups["marine"])

        # Determine overall nearest sensitive area
        if l_dist_m <= m_dist_m:
            o_props = l_props
            o_dist_m = l_dist_m
            o_dist_km = l_dist_km
            o_rel = l_rel
        else:
            o_props = m_props
            o_dist_m = m_dist_m
            o_dist_km = m_dist_km
            o_rel = m_rel

        results.append({
            # Asset Information (8 columns)
            "asset_id": row["asset_id"],
            "asset_name": row["asset_name"],
            "asset_group": row["asset_group"],
            "category": row["category"],
            "state": row["state"],
            "district": row["district"],
            "latitude": round(row["latitude"], 6),
            "longitude": round(row["longitude"], 6),

            # Overall Nearest Sensitive Area (7 columns)
            "nearest_environment_id": o_props.get("area_id", ""),
            "nearest_environment_name": o_props.get("area_name", ""),
            "protection_type": o_props.get("protection_type", ""),
            "environment_type": o_props.get("environment", ""),
            "distance_to_sensitive_area_m": o_dist_m,
            "distance_to_sensitive_area_km": o_dist_km,
            "relationship": o_rel,

            # Terrestrial Land Breakdown (5 columns)
            "nearest_land_id": l_props.get("area_id", ""),
            "nearest_land_name": l_props.get("area_name", ""),
            "dist_land_m": l_dist_m,
            "dist_land_km": l_dist_km,
            "land_relationship": l_rel,

            # Marine Breakdown (5 columns)
            "nearest_marine_id": m_props.get("area_id", ""),
            "nearest_marine_name": m_props.get("area_name", ""),
            "dist_marine_m": m_dist_m,
            "dist_marine_km": m_dist_km,
            "marine_relationship": m_rel,
        })

    df_out = pd.DataFrame(results)

    # 5. Quality Checks & Verification
    print("\n" + "=" * 70)
    print("Quality Checks & Verification")
    print("=" * 70)

    # Check 1: Record count and uniqueness
    print(f"Check 1 — Total records: {len(df_out):,} (Expected: {n_assets:,})")
    assert len(df_out) == n_assets, "Mismatch in record count!"

    # Check 2: Distance logic verification
    inside_non_zero = df_out[(df_out["relationship"] == "Inside") & (df_out["distance_to_sensitive_area_m"] > 0)]
    near_out_of_bounds = df_out[(df_out["relationship"] == "Near") & ((df_out["distance_to_sensitive_area_m"] <= 0) | (df_out["distance_to_sensitive_area_m"] > 1000.0))]
    outside_in_bounds = df_out[(df_out["relationship"] == "Outside") & (df_out["distance_to_sensitive_area_m"] <= 1000.0)]
    print(f"Check 2 — Distance Logic Violations: Inside non-zero={len(inside_non_zero)}, Near out-of-bounds={len(near_out_of_bounds)}, Outside <=1km={len(outside_in_bounds)}")
    assert len(inside_non_zero) == 0, "Inside assets must have 0 distance!"
    assert len(near_out_of_bounds) == 0, "Near assets must have 0 < dist <= 1000m!"
    assert len(outside_in_bounds) == 0, "Outside assets must have dist > 1000m!"

    # Check 3: Dual-tree independence
    land_inside_non_zero = df_out[(df_out["land_relationship"] == "Inside") & (df_out["dist_land_km"] > 0)]
    marine_inside_non_zero = df_out[(df_out["marine_relationship"] == "Inside") & (df_out["dist_marine_km"] > 0)]
    print(f"Check 3 — Dual-tree Zero Verification: Land violations={len(land_inside_non_zero)}, Marine violations={len(marine_inside_non_zero)}")
    assert len(land_inside_non_zero) == 0, "Land inside assets must have 0 dist!"
    assert len(marine_inside_non_zero) == 0, "Marine inside assets must have 0 dist!"

    # Check 4: Null values in core fields
    null_counts = df_out[["asset_id", "asset_name", "relationship", "land_relationship", "marine_relationship"]].isna().sum().to_dict()
    print(f"Check 4 — Null counts in core fields: {null_counts}")
    assert all(c == 0 for c in null_counts.values()), "Found nulls in core fields!"

    # Check 5: Summary breakdown
    print("\nSummary Distributions:")
    print("-" * 50)
    print("Overall Relationship Distribution:")
    print(df_out["relationship"].value_counts().to_string())
    print("\nTerrestrial (Land) Relationship Distribution:")
    print(df_out["land_relationship"].value_counts().to_string())
    print("\nMarine Relationship Distribution:")
    print(df_out["marine_relationship"].value_counts().to_string())

    print("\nRelationship by Asset Group:")
    print(pd.crosstab(df_out["asset_group"], df_out["relationship"], margins=True).to_string())

    # 6. Save output files
    print("\n" + "=" * 70)
    print("Exporting Datasets")
    print("=" * 70)

    print(f"Saving CSV to: {OUTPUT_CSV}")
    df_out.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")

    print(f"Saving JSON to: {OUTPUT_JSON}")
    # Export records list to JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    elapsed_total = time.time() - start_time
    print(f"\nDone! Successfully generated relationship dataset in {elapsed_total:.2f} seconds.")
    return df_out


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tourisma Environmental Sensitivity Relationship Builder")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of assets for quick testing")
    args = parser.parse_args()

    build_relationship_dataset(limit=args.limit)
