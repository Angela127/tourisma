"""
Malaysia Tourism Road Accessibility Dataset Builder
Measures how easily each of the 5,491 mapped tourism assets can be reached
by the Main Road Network (motorway, trunk, primary).

Extracts LineString geometries from OpenStreetMap via Overpass API (cached in dataset/raw/).
Projects road lines and asset points into an AEQD metric coordinate system
and computes the shortest geometric perpendicular distance to the nearest road geometry
using shapely.strtree.STRtree.
"""

import os
import sys
import json
import time
import argparse
import requests
import numpy as np
import pandas as pd
from pyproj import Transformer
from shapely.geometry import Point, LineString
from shapely.strtree import STRtree

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
TOURISM_ASSETS_CSV = os.path.join(DATASET_DIR, "tourism_asset_coverage.csv")
OUTPUT_CSV = os.path.join(DATASET_DIR, "tourism_road_accessibility.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "tourism_road_accessibility.json")

os.makedirs(RAW_DIR, exist_ok=True)

# Overpass API endpoints
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

HEADERS = {
    "User-Agent": "TourismaRoadAccessibilityBuilder/1.0 (Malaysia-Road-Research; contact: admin@tourisma.my)"
}

# Road Queries by Class
ROAD_QUERIES = {
    "motorway": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  way["highway"="motorway"](area.my);
);
out geom tags;
""",
    "trunk": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  way["highway"="trunk"](area.my);
);
out geom tags;
""",
    "primary": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  way["highway"="primary"](area.my);
);
out geom tags;
"""
}

# Azimuthal Equidistant projection centered on Malaysia (lat_0=4.0, lon_0=109.5)
PROJ_AEQD = "+proj=aeqd +lat_0=4.0 +lon_0=109.5 +datum=WGS84 +units=m"
transformer = Transformer.from_crs("EPSG:4326", PROJ_AEQD, always_xy=True)


def assign_road_tier(distance_m):
    """
    Tourisma Road Accessibility Tiers:
    <= 100 m: Direct Access
    > 100 m - 500 m: Very Close
    > 500 m - 1 km: Good Access
    > 1 - 2 km: Limited Access
    > 2 km: Low Access
    """
    if distance_m <= 100.0:
        return "Direct Access"
    elif distance_m <= 500.0:
        return "Very Close"
    elif distance_m <= 1000.0:
        return "Good Access"
    elif distance_m <= 2000.0:
        return "Limited Access"
    else:
        return "Low Access"


def fetch_road_class_data(road_class, force_refresh=False):
    """
    Fetches road segments with geometry for a specific highway class
    (motorway, trunk, or primary) or loads from local cache.
    """
    cache_file = os.path.join(RAW_DIR, f"osm_roads_{road_class}.json")
    if not force_refresh and os.path.exists(cache_file):
        print(f"[{road_class}] Loading cached roads: {cache_file}")
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)

    query = ROAD_QUERIES[road_class]
    print(f"[{road_class}] Extracting road geometry from OpenStreetMap via Overpass API...")

    for endpoint in OVERPASS_ENDPOINTS:
        print(f"  Attempting {endpoint}...")
        try:
            resp = requests.post(endpoint, data={"data": query}, headers=HEADERS, timeout=180)
            if resp.status_code == 200:
                data = resp.json()
                count = len(data.get("elements", []))
                print(f"  Success from {endpoint}! Retrieved {count:,} {road_class} road segments.")
                with open(cache_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False)
                return data
            else:
                print(f"  Status {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"  Error on {endpoint}: {e}")
        time.sleep(2)

    raise RuntimeError(f"Failed to fetch road data for class: {road_class}")


def parse_and_project_roads(raw_data, road_type_label):
    """
    Parses OSM road elements, extracts vertex coordinates, projects to AEQD,
    and returns list of road dicts with projected LineString geometries.
    """
    roads = []
    skipped_no_geom = 0

    for elem in raw_data.get("elements", []):
        tags = elem.get("tags", {})
        geom_points = elem.get("geometry", [])

        if not geom_points or len(geom_points) < 2:
            skipped_no_geom += 1
            continue

        lons = [p["lon"] for p in geom_points]
        lats = [p["lat"] for p in geom_points]

        # Project vertices to metric coordinates
        xs, ys = transformer.transform(lons, lats)
        line = LineString(zip(xs, ys))

        name = tags.get("name") or tags.get("name:en") or tags.get("name:ms") or ""
        ref = tags.get("ref") or ""

        if not name:
            name = f"Unnamed {road_type_label} ({ref})" if ref else f"Unnamed {road_type_label}"

        roads.append({
            "osm_id": elem.get("id"),
            "name": name.strip(),
            "ref": ref.strip(),
            "type": road_type_label,
            "geom": line
        })

    print(f"  Processed {len(roads):,} valid projected LineStrings for {road_type_label} (skipped: {skipped_no_geom})")
    return roads


def build_road_accessibility_dataset(force_refresh=False):
    print("=" * 65)
    print("BUILDING TOURISM ROAD ACCESSIBILITY DATASET")
    print("=" * 65)

    # 1. Load tourism assets
    if not os.path.exists(TOURISM_ASSETS_CSV):
        raise FileNotFoundError(f"Missing tourism assets: {TOURISM_ASSETS_CSV}")

    df_assets = pd.read_csv(TOURISM_ASSETS_CSV)
    print(f"Loaded {len(df_assets):,} tourism assets.")

    # 2. Fetch and parse road networks
    motorways = parse_and_project_roads(fetch_road_class_data("motorway", force_refresh), "Motorway")
    trunks = parse_and_project_roads(fetch_road_class_data("trunk", force_refresh), "Trunk")
    primaries = parse_and_project_roads(fetch_road_class_data("primary", force_refresh), "Primary")

    all_main_roads = motorways + trunks + primaries
    print(f"\nTotal Main Road segments: {len(all_main_roads):,}")

    # 3. Build spatial indices (STRtree on LineString geometries in metric CRS)
    print("\nBuilding metric spatial indices (STRtree)...")
    tree_all = STRtree([r["geom"] for r in all_main_roads])
    tree_motorway = STRtree([r["geom"] for r in motorways])
    tree_trunk = STRtree([r["geom"] for r in trunks])

    # 4. Project tourism assets
    asset_xs, asset_ys = transformer.transform(df_assets["lon"].values, df_assets["lat"].values)
    df_assets["x"] = asset_xs
    df_assets["y"] = asset_ys

    results = []
    print(f"Calculating shortest geometric road distances for {len(df_assets):,} assets...")

    for i, row in df_assets.iterrows():
        pt_geom = Point(row["x"], row["y"])

        # Nearest Main Road (geometric perpendicular distance to LineString)
        nearest_idx = tree_all.nearest(pt_geom)
        match_road = all_main_roads[nearest_idx]
        dist_m = round(pt_geom.distance(match_road["geom"]), 1)
        dist_km = round(dist_m / 1000.0, 3)

        # Nearest Motorway
        nearest_mw_idx = tree_motorway.nearest(pt_geom)
        match_mw = motorways[nearest_mw_idx]
        dist_mw_km = round(pt_geom.distance(match_mw["geom"]) / 1000.0, 3)

        # Nearest Trunk Road
        nearest_tk_idx = tree_trunk.nearest(pt_geom)
        match_tk = trunks[nearest_tk_idx]
        dist_tk_km = round(pt_geom.distance(match_tk["geom"]) / 1000.0, 3)

        tier = assign_road_tier(dist_m)

        results.append({
            "asset_id": row["asset_id"],
            "asset_name": row["name"],
            "category": row["category"],
            "state": row["state"],
            "district": row["district"],
            "lat": row["lat"],
            "lon": row["lon"],
            "nearest_road_name": match_road["name"],
            "nearest_road_ref": match_road["ref"],
            "nearest_road_type": match_road["type"],
            "distance_to_road_m": dist_m,
            "distance_to_road_km": dist_km,
            "nearest_motorway_name": match_mw["name"],
            "distance_to_motorway_km": dist_mw_km,
            "nearest_trunk_name": match_tk["name"],
            "distance_to_trunk_km": dist_tk_km,
            "road_access_tier": tier
        })

    out_df = pd.DataFrame(results)

    # 5. Export
    out_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"\nSaved CSV: {OUTPUT_CSV} ({len(out_df):,} rows)")

    out_df.to_json(OUTPUT_JSON, orient="records", indent=2, force_ascii=False)
    print(f"Saved JSON: {OUTPUT_JSON}")

    # 6. Quality Checks & Summary
    print("\n" + "=" * 65)
    print("ROAD ACCESSIBILITY QUALITY CHECKS & SUMMARY")
    print("=" * 65)

    print(f"Total Rows: {len(out_df):,} (Expected: 5,491)")
    print(f"Null values across all columns: {out_df.isnull().sum().sum()}")
    print(f"Negative distances: {(out_df['distance_to_road_m'] < 0).sum()}")

    print("\n--- Distribution by Road Accessibility Tier ---")
    tier_counts = out_df["road_access_tier"].value_counts()
    for t, cnt in tier_counts.items():
        pct = (cnt / len(out_df)) * 100.0
        print(f"  {t:<20}: {cnt:>5,} ({pct:>5.1f}%)")

    # Rate indicators
    road_access_rate = (out_df["distance_to_road_km"] <= 1.0).mean() * 100.0
    direct_access_rate = (out_df["distance_to_road_m"] <= 100.0).mean() * 100.0
    print(f"\nRoad Accessibility Rate (<=1 km): {road_access_rate:.2f}%")
    print(f"Direct Road Access Rate (<=100 m): {direct_access_rate:.2f}%")

    print("\n--- Nearest Road Type Breakdown ---")
    type_counts = out_df["nearest_road_type"].value_counts()
    for rtype, cnt in type_counts.items():
        print(f"  {rtype:<20}: {cnt:>5,}")

    print("\n--- Landmark Spot Check ---")
    landmarks = [
        "Petronas",
        "Batu Caves",
        "Penang Hill",
        "Kek Lok Si",
        "A Famosa"
    ]
    for lm in landmarks:
        sub = out_df[out_df["asset_name"].str.contains(lm, case=False, na=False)]
        if not sub.empty:
            r = sub.iloc[0]
            print(f"  [OK] {r['asset_name'][:30]:<30} -> Nearest Road: {r['nearest_road_name']} ({r['nearest_road_type']}) at {r['distance_to_road_m']:.0f}m | Motorway: {r['nearest_motorway_name']} at {r['distance_to_motorway_km']:.2f}km")

    return out_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Tourisma Road Accessibility Dataset")
    parser.add_argument("--force-refresh", action="store_true", help="Force fresh download from Overpass API")
    args = parser.parse_args()

    build_road_accessibility_dataset(force_refresh=args.force_refresh)
