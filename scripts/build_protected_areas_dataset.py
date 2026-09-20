"""
Malaysia Environmentally Protected & Sensitive Areas Dataset Builder
Extracts authoritative polygon boundaries for nationwide protected areas across
both Land and Sea from the UNEP-WCMC World Database on Protected and Conserved Areas (WDPCA/WDPA).

Features:
- 485 official designated protected areas in Malaysia with full Polygon/MultiPolygon geometries.
- Standardized environment: Land (terrestrial) and Marine (marine parks, marine reserves, coastal sanctuaries).
- Spatial join to official Malaysian State and District boundaries with coastal snapping.
- Exports to GeoJSON (spatial), CSV (with WKT geometry), and JSON.
"""

import os
import sys
import json
import argparse
import requests
import pandas as pd
from shapely.geometry import shape, Point, mapping
from shapely.strtree import STRtree

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
BOUNDARIES_DIR = os.path.join(DATASET_DIR, "boundaries")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
LOCAL_BOUNDARY_FILE = os.path.join(BOUNDARIES_DIR, "malaysia_districts_official.geojson")
RAW_WDPCA_FILE = os.path.join(RAW_DIR, "wdpca_malaysia_raw.geojson")

OUTPUT_GEOJSON = os.path.join(DATASET_DIR, "environmentally_protected_areas.geojson")
OUTPUT_CSV = os.path.join(DATASET_DIR, "environmentally_protected_areas.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "environmentally_protected_areas.json")

os.makedirs(BOUNDARIES_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)

# UNEP-WCMC FeatureServer endpoint for Protected Planet WDPCA
WDPCA_API_URL = (
    "https://data-gis.unep-wcmc.org/server/rest/services/ProtectedPlanet/WDPCA/FeatureServer/1/query?"
    "where=iso3=%27MYS%27&outFields=*&f=geojson"
)

HEADERS = {
    "User-Agent": "TourismaProtectedAreasBuilder/1.0 (Malaysia-Conservation-Research; contact: admin@tourisma.my)"
}


def standardize_protection_type(desig_eng):
    """
    Normalizes official designation names into clean categories.
    """
    if not desig_eng:
        return "Protected Area"
    d = str(desig_eng).strip()
    d_lower = d.lower()

    if "marine park" in d_lower:
        return "Marine Park"
    elif "national park" in d_lower:
        return "National Park"
    elif "state park" in d_lower:
        return "State Park"
    elif "forest reserve" in d_lower:
        return "Forest Reserve"
    elif "wildlife" in d_lower or "widlife" in d_lower:
        return "Wildlife Reserve"
    elif "turtle" in d_lower:
        return "Turtle Sanctuary"
    elif "ramsar" in d_lower:
        return "Ramsar Site"
    elif "fisheries" in d_lower or "marine protected" in d_lower or "sea cucumber" in d_lower:
        return "Marine Protected Area"
    elif "nature" in d_lower:
        return "Nature Reserve"
    elif "world heritage" in d_lower:
        return "World Heritage Site"
    return d.title()


def standardize_environment(realm, desig_type):
    """
    Maps environment to either 'Land' or 'Marine'.
    """
    r_lower = str(realm).lower().strip()
    d_lower = str(desig_type).lower().strip()

    if "marine" in r_lower or "marine" in d_lower or "sea" in d_lower:
        return "Marine"
    if "coastal" in r_lower:
        return "Marine"
    return "Land"


def fetch_wdpca_data(force_refresh=False):
    """
    Fetches raw GeoJSON features from UNEP-WCMC FeatureServer or local cache.
    """
    if not force_refresh and os.path.exists(RAW_WDPCA_FILE):
        print(f"Loading cached protected areas: {RAW_WDPCA_FILE}")
        with open(RAW_WDPCA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    print("Fetching official protected areas from UNEP-WCMC FeatureServer...")
    resp = requests.get(WDPCA_API_URL, headers=HEADERS, timeout=120)
    if resp.status_code == 200:
        data = resp.json()
        print(f"  Successfully retrieved {len(data.get('features', []))} features from UNEP-WCMC.")
        with open(RAW_WDPCA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        return data
    else:
        raise RuntimeError(f"UNEP-WCMC FeatureServer returned status {resp.status_code}: {resp.text[:120]}")


def load_district_boundaries():
    """
    Loads official Malaysian district boundary polygons for spatial matching.
    """
    if not os.path.exists(LOCAL_BOUNDARY_FILE):
        raise FileNotFoundError(f"Missing district boundaries at {LOCAL_BOUNDARY_FILE}. Run build_tourism_dataset.py first.")

    with open(LOCAL_BOUNDARY_FILE, "r", encoding="utf-8") as f:
        bd = json.load(f)

    districts = []
    for feat in bd.get("features", []):
        poly = shape(feat["geometry"])
        props = feat.get("properties", {})
        d_name = next((str(props.get(k, "")).strip() for k in ["DP_BARU", "Daerah_1", "district", "name", "DAERAH"] if str(props.get(k, "")).strip()), "Unknown")
        s_name = str(props.get("NEGERI", "")).strip()
        districts.append({"geometry": poly, "district": d_name.title(), "state": s_name})

    print(f"Loaded {len(districts)} district boundaries for spatial state attribution.")
    return districts


def build_protected_areas_dataset(force_refresh=False):
    print("=" * 65)
    print("BUILDING ENVIRONMENTALLY PROTECTED & SENSITIVE AREAS DATASET")
    print("=" * 65)

    # 1. Fetch data and boundaries
    raw_geojson = fetch_wdpca_data(force_refresh=force_refresh)
    districts = load_district_boundaries()

    # 2. Spatial Index for district attribution
    tree = STRtree([d["geometry"] for d in districts])

    features_in = raw_geojson.get("features", [])
    print(f"Processing {len(features_in):,} protected area boundaries...")

    processed_geojson_features = []
    tabular_rows = []

    for i, feat in enumerate(features_in, start=1):
        props = feat.get("properties", {})
        geom_raw = feat.get("geometry")

        if not geom_raw:
            continue

        try:
            poly = shape(geom_raw)
            if not poly.is_valid:
                poly = poly.buffer(0)
        except Exception as e:
            print(f"  Warning: Invalid geometry for {props.get('name')}: {e}")
            continue

        # Interior representative point for spatial state attribution
        rep_pt = poly.representative_point()

        # Spatial Join to District / State
        match_idx = None
        cands = tree.query(rep_pt)
        for idx in cands:
            if districts[idx]["geometry"].contains(rep_pt) or districts[idx]["geometry"].touches(rep_pt):
                match_idx = idx
                break

        # Fallback nearest district (for offshore marine parks e.g. Tioman, Redang, Payar, Sipadan)
        if match_idx is None:
            match_idx = tree.nearest(rep_pt)

        matched_state = districts[match_idx]["state"]
        matched_district = districts[match_idx]["district"]

        # Attributes
        area_id = f"{i:03d}"
        name = props.get("name") or props.get("name_eng") or f"Protected Area {area_id}"
        desig_eng = props.get("desig_eng") or props.get("desig") or "Protected Area"
        realm = props.get("realm") or "Terrestrial"

        protection_type = standardize_protection_type(desig_eng)
        environment = standardize_environment(realm, protection_type)

        iucn_cat = props.get("iucn_cat") or "Not Reported"
        status = props.get("status") or "Designated"
        status_year = props.get("status_yr") or None
        if status_year == 0:
            status_year = None

        area_km2 = props.get("gis_area") or props.get("rep_area") or None
        if area_km2 is not None:
            area_km2 = round(float(area_km2), 2)

        wdpa_id = props.get("site_id") or props.get("site_pid")

        # GeoJSON feature structure
        clean_props = {
            "area_id": area_id,
            "area_name": name.strip(),
            "state": matched_state,
            "district": matched_district,
            "protection_type": protection_type,
            "environment": environment,
            "iucn_category": iucn_cat,
            "status": status,
            "status_year": status_year,
            "area_km2": area_km2,
            "wdpa_id": wdpa_id
        }

        processed_geojson_features.append({
            "type": "Feature",
            "id": area_id,
            "properties": clean_props,
            "geometry": mapping(poly)
        })

        # Tabular structure (including WKT geometry)
        row_dict = dict(clean_props)
        row_dict["geometry"] = poly.wkt
        tabular_rows.append(row_dict)

    out_geojson = {
        "type": "FeatureCollection",
        "features": processed_geojson_features
    }

    df = pd.DataFrame(tabular_rows)

    # Sort logically by State, Protection Type, Area Name
    df = df.sort_values(by=["state", "environment", "protection_type", "area_name"]).reset_index(drop=True)
    # Re-assign sequential area_id
    df["area_id"] = [f"{idx + 1:03d}" for idx in range(len(df))]

    # Sync back to GeoJSON features
    id_map = dict(zip(df["wdpa_id"], df["area_id"]))
    for feat in out_geojson["features"]:
        w_id = feat["properties"]["wdpa_id"]
        if w_id in id_map:
            feat["properties"]["area_id"] = id_map[w_id]
            feat["id"] = id_map[w_id]

    # Re-order columns to match user specification exactly:
    # area_id, area_name, state, protection_type, environment, geometry, ...
    cols = [
        "area_id", "area_name", "state", "protection_type", "environment", "geometry",
        "district", "iucn_category", "status", "status_year", "area_km2", "wdpa_id"
    ]
    df = df[cols]

    # 3. Save GeoJSON
    with open(OUTPUT_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(out_geojson, f, ensure_ascii=False)
    print(f"\nSaved GeoJSON dataset: {OUTPUT_GEOJSON} ({len(out_geojson['features']):,} polygon features)")

    # 4. Save CSV
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"Saved CSV dataset: {OUTPUT_CSV} ({len(df):,} rows)")

    # 5. Save JSON
    df.to_json(OUTPUT_JSON, orient="records", indent=2, force_ascii=False)
    print(f"Saved JSON dataset: {OUTPUT_JSON}")

    # 6. Quality Checks & Summary
    print("\n" + "=" * 65)
    print("ENVIRONMENTALLY PROTECTED AREAS SUMMARY")
    print("=" * 65)
    print(f"Total Protected Areas: {len(df):,}")

    print("\n--- Breakdown by Environment ---")
    env_counts = df["environment"].value_counts()
    for env, cnt in env_counts.items():
        pct = (cnt / len(df)) * 100.0
        print(f"  {env:<15}: {cnt:>4,} ({pct:>5.1f}%)")

    print("\n--- Breakdown by Protection Type ---")
    type_counts = df["protection_type"].value_counts()
    for ptype, cnt in type_counts.items():
        print(f"  {ptype:<25}: {cnt:>4,}")

    print("\n--- Breakdown by State ---")
    state_counts = df["state"].value_counts()
    for st, cnt in state_counts.items():
        print(f"  {st:<20}: {cnt:>4,}")

    print("\n--- Landmark Spot Check ---")
    spot_keys = ["Taman Negara", "Endau", "Tioman", "Redang", "Payar", "Kinabalu", "Mulu", "Bako"]
    for key in spot_keys:
        sub = df[df["area_name"].str.contains(key, case=False, na=False)]
        if not sub.empty:
            r = sub.iloc[0]
            print(f"  [OK] {r['area_id']} | {r['area_name'][:35]:<35} | {r['protection_type']:<15} | {r['environment']:<6} | {r['state']}")

    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Tourisma Environmentally Protected Areas Dataset")
    parser.add_argument("--force-refresh", action="store_true", help="Force fresh download from UNEP-WCMC")
    args = parser.parse_args()

    build_protected_areas_dataset(force_refresh=args.force_refresh)
