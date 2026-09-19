"""
Malaysia Tourism Public Transport Accessibility Dataset Builder
Measures how easily each mapped tourism asset (5,491 POIs) can be reached
by public transport facilities (Bus Stops, Bus Terminals, Railway/Transit Stations, Ferry Terminals).

Uses pyproj (AEQD metric projection) and shapely STRtree for sub-decimetre
shortest straight-line distance calculations.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from pyproj import Transformer
from shapely.geometry import Point
from shapely.strtree import STRtree

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
TOURISM_ASSETS_CSV = os.path.join(DATASET_DIR, "tourism_asset_coverage.csv")
SUPPORTING_ASSETS_CSV = os.path.join(DATASET_DIR, "tourism_supporting_assets.csv")
OUTPUT_CSV = os.path.join(DATASET_DIR, "tourism_pt_accessibility.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "tourism_pt_accessibility.json")

# Azimuthal Equidistant projection centered on Malaysia (lat_0=4.0, lon_0=109.5)
# Preserves exact Euclidean distances in metres across the country
PROJ_AEQD = "+proj=aeqd +lat_0=4.0 +lon_0=109.5 +datum=WGS84 +units=m"
transformer = Transformer.from_crs("EPSG:4326", PROJ_AEQD, always_xy=True)


def assign_pt_tier(distance_m):
    """
    Tourisma Public Transport Accessibility Tiers:
    <= 400 m: High Access
    > 400 m - 1 km: Moderate Access
    > 1 - 3 km: Limited Access
    > 3 km: Low Access
    """
    if distance_m <= 400.0:
        return "High Access"
    elif distance_m <= 1000.0:
        return "Moderate Access"
    elif distance_m <= 3000.0:
        return "Limited Access"
    else:
        return "Low Access"


def clean_and_prepare_pt_data(df_supporting):
    """
    Filters, deduplicates, and standardizes public transport facilities.
    Only retains:
    - Bus Stop
    - Bus Terminal
    - Railway / Transit Station
    - Ferry Terminal
    """
    pt_df = df_supporting[df_supporting["category"] == "Public Transport"].copy()

    # Drop invalid coordinates
    pt_df = pt_df.dropna(subset=["lat", "lon"])
    pt_df = pt_df[(pt_df["lat"] >= 0.5) & (pt_df["lat"] <= 8.5) &
                  (pt_df["lon"] >= 99.0) & (pt_df["lon"] <= 120.0)]

    # Standardize to the 4 specific transport categories
    def map_standard_type(subcat):
        subcat_str = str(subcat).strip()
        if subcat_str == "Bus Stop":
            return "Bus Stop"
        elif "Bus Station" in subcat_str or "Bus Terminal" in subcat_str:
            return "Bus Terminal"
        elif "Railway" in subcat_str or "Transit" in subcat_str:
            return "Railway / Transit Station"
        elif "Ferry" in subcat_str:
            return "Ferry Terminal"
        return None

    pt_df["std_type"] = pt_df["subcategory"].apply(map_standard_type)
    pt_df = pt_df.dropna(subset=["std_type"])

    # Deduplicate by asset_id and coordinates
    pt_df = pt_df.drop_duplicates(subset=["asset_id"])
    pt_df = pt_df.drop_duplicates(subset=["std_type", "lat", "lon"])

    # Project coordinates to metric XY
    x_coords, y_coords = transformer.transform(pt_df["lon"].values, pt_df["lat"].values)
    pt_df["x"] = x_coords
    pt_df["y"] = y_coords
    pt_df["geom"] = [Point(x, y) for x, y in zip(x_coords, y_coords)]

    print(f"Prepared {len(pt_df):,} cleaned public transport facilities:")
    print(pt_df["std_type"].value_counts().to_string())

    return pt_df


def build_pt_accessibility_dataset():
    print("=" * 65)
    print("BUILDING TOURISM PUBLIC TRANSPORT ACCESSIBILITY DATASET")
    print("=" * 65)

    # 1. Load inputs
    if not os.path.exists(TOURISM_ASSETS_CSV):
        raise FileNotFoundError(f"Missing tourism assets: {TOURISM_ASSETS_CSV}")
    if not os.path.exists(SUPPORTING_ASSETS_CSV):
        raise FileNotFoundError(f"Missing supporting assets: {SUPPORTING_ASSETS_CSV}")

    df_assets = pd.read_csv(TOURISM_ASSETS_CSV)
    df_supporting = pd.read_csv(SUPPORTING_ASSETS_CSV, low_memory=False)

    print(f"Loaded {len(df_assets):,} tourism assets.")

    # 2. Clean and project PT facilities
    pt_df = clean_and_prepare_pt_data(df_supporting)

    # Subsets
    bus_df = pt_df[pt_df["std_type"].isin(["Bus Stop", "Bus Terminal"])].copy().reset_index(drop=True)
    rail_df = pt_df[pt_df["std_type"] == "Railway / Transit Station"].copy().reset_index(drop=True)
    ferry_df = pt_df[pt_df["std_type"] == "Ferry Terminal"].copy().reset_index(drop=True)
    all_pt_df = pt_df.copy().reset_index(drop=True)

    # 3. Build spatial indices (STRtree on Point geometries in metric CRS)
    print("\nBuilding metric spatial indices (STRtree)...")
    tree_all = STRtree(all_pt_df["geom"].tolist())
    tree_bus = STRtree(bus_df["geom"].tolist())
    tree_rail = STRtree(rail_df["geom"].tolist())
    tree_ferry = STRtree(ferry_df["geom"].tolist())

    # 4. Project tourism assets
    asset_x, asset_y = transformer.transform(df_assets["lon"].values, df_assets["lat"].values)
    df_assets["x"] = asset_x
    df_assets["y"] = asset_y

    results = []
    print(f"Calculating nearest PT distances for {len(df_assets):,} assets...")

    for i, row in df_assets.iterrows():
        pt_geom = Point(row["x"], row["y"])

        # Nearest Overall PT
        nearest_idx = tree_all.nearest(pt_geom)
        match_pt = all_pt_df.iloc[nearest_idx]
        dist_pt_m = round(pt_geom.distance(match_pt["geom"]), 1)
        dist_pt_km = round(dist_pt_m / 1000.0, 3)

        # Nearest Bus Facility (Stop or Terminal)
        nearest_bus_idx = tree_bus.nearest(pt_geom)
        match_bus = bus_df.iloc[nearest_bus_idx]
        dist_bus_km = round(pt_geom.distance(match_bus["geom"]) / 1000.0, 3)

        # Nearest Rail Facility
        nearest_rail_idx = tree_rail.nearest(pt_geom)
        match_rail = rail_df.iloc[nearest_rail_idx]
        dist_rail_km = round(pt_geom.distance(match_rail["geom"]) / 1000.0, 3)

        # Nearest Ferry Terminal
        nearest_ferry_idx = tree_ferry.nearest(pt_geom)
        match_ferry = ferry_df.iloc[nearest_ferry_idx]
        dist_ferry_km = round(pt_geom.distance(match_ferry["geom"]) / 1000.0, 3)

        tier = assign_pt_tier(dist_pt_m)

        results.append({
            "asset_id": row["asset_id"],
            "asset_name": row["name"],
            "category": row["category"],
            "state": row["state"],
            "district": row["district"],
            "lat": row["lat"],
            "lon": row["lon"],
            "nearest_pt_name": match_pt["name"],
            "nearest_pt_type": match_pt["std_type"],
            "distance_to_pt_m": dist_pt_m,
            "distance_to_pt_km": dist_pt_km,
            "nearest_bus_name": match_bus["name"],
            "distance_to_bus_km": dist_bus_km,
            "nearest_rail_name": match_rail["name"],
            "distance_to_rail_km": dist_rail_km,
            "nearest_ferry_name": match_ferry["name"],
            "distance_to_ferry_km": dist_ferry_km,
            "pt_access_tier": tier
        })

    out_df = pd.DataFrame(results)

    # 5. Export
    out_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"\nSaved CSV: {OUTPUT_CSV} ({len(out_df):,} rows)")

    out_df.to_json(OUTPUT_JSON, orient="records", indent=2, force_ascii=False)
    print(f"Saved JSON: {OUTPUT_JSON}")

    # 6. Quality Checks & Summary
    print("\n" + "=" * 65)
    print("QUALITY CHECKS & SUMMARY")
    print("=" * 65)

    print(f"Total Rows: {len(out_df):,} (Expected: 5,491)")
    print(f"Null values across all columns: {out_df.isnull().sum().sum()}")
    print(f"Negative distances: {(out_df['distance_to_pt_m'] < 0).sum()}")

    print("\n--- Distribution by PT Accessibility Tier ---")
    tier_counts = out_df["pt_access_tier"].value_counts()
    for t, cnt in tier_counts.items():
        pct = (cnt / len(out_df)) * 100.0
        print(f"  {t:<20}: {cnt:>5,} ({pct:>5.1f}%)")

    # Rate indicators
    pt_access_rate = (out_df["distance_to_pt_km"] <= 1.0).mean() * 100.0
    bus_access_rate = (out_df["distance_to_bus_km"] <= 1.0).mean() * 100.0
    rail_access_rate = (out_df["distance_to_rail_km"] <= 1.0).mean() * 100.0
    print(f"\nOverall PT Accessibility Rate (<=1 km): {pt_access_rate:.2f}%")
    print(f"Bus Accessibility Rate (<=1 km):        {bus_access_rate:.2f}%")
    print(f"Rail Accessibility Rate (<=1 km):       {rail_access_rate:.2f}%")

    print("\n--- Nearest PT Mode Breakdown ---")
    type_counts = out_df["nearest_pt_type"].value_counts()
    for mode, cnt in type_counts.items():
        print(f"  {mode:<28}: {cnt:>5,}")

    print("\n--- Landmark Spot Check ---")
    landmarks = [
        ("Petronas", "KLCC"),
        ("Batu Caves", "Gombak"),
        ("Penang Hill", "Timur Laut"),
        ("Kek Lok Si", "Timur Laut"),
        ("A Famosa", "Alor Gajah")
    ]
    for lm_name, dist_hint in landmarks:
        sub = out_df[out_df["asset_name"].str.contains(lm_name, case=False, na=False)]
        if not sub.empty:
            row = sub.iloc[0]
            print(f"  [OK] {row['asset_name'][:30]:<30} -> Nearest PT: {row['nearest_pt_name']} ({row['nearest_pt_type']}) at {row['distance_to_pt_m']:.0f}m | Nearest Rail: {row['nearest_rail_name']} at {row['distance_to_rail_km']:.2f}km")

    return out_df


if __name__ == "__main__":
    build_pt_accessibility_dataset()
