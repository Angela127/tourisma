"""
Malaysia Tourism Asset Coverage Dataset Builder
Extracts tourism POIs from OpenStreetMap via Overpass API,
fetches official Malaysian administrative district boundaries (DOSM / MyGDI),
and performs high-performance spatial join (point-in-polygon) to map every asset
to its official State and District.
"""

import os
import sys
import json
import time
import argparse
import requests
import pandas as pd
from shapely.geometry import shape, Point
from shapely.strtree import STRtree

# Project paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
BOUNDARIES_DIR = os.path.join(DATASET_DIR, "boundaries")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
OUTPUT_CSV = os.path.join(DATASET_DIR, "tourism_asset_coverage.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "tourism_asset_coverage.json")

os.makedirs(BOUNDARIES_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)

# Overpass API endpoints
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

HEADERS = {
    "User-Agent": "TourismaResearchDatasetBuilder/1.0 (Malaysia-Tourism-Asset-Coverage; contact: admin@tourisma.my)"
}

# Official Boundary Sources
OFFICIAL_ARCGIS_DISTRICTS_URL = (
    "https://services2.arcgis.com/bJ6KfwLVzO33GOlj/arcgis/rest/services/"
    "Sempadan_Daerah_Pentadbiran_13112018/FeatureServer/0/query?"
    "where=1%3D1&outFields=*&f=geojson"
)
DOSM_JAKIM_DISTRICTS_URL = (
    "https://raw.githubusercontent.com/mptwaktusolat/jakim.geojson/master/malaysia.district.geojson"
)
DOSM_KAWASANKU_DISTRICTS_URL = (
    "https://raw.githubusercontent.com/dosm-malaysia/kawasanku-front/main/geojson/district_desktop.json"
)

LOCAL_BOUNDARY_FILE = os.path.join(BOUNDARIES_DIR, "malaysia_districts_official.geojson")
LOCAL_RAW_OSM_FILE = os.path.join(RAW_DIR, "osm_tourism_raw.json")

# State Code Mapping
STATE_CODE_MAP = {
    "01": "Johor",
    "02": "Kedah",
    "03": "Kelantan",
    "04": "Melaka",
    "05": "Negeri Sembilan",
    "06": "Pahang",
    "07": "Pulau Pinang",
    "08": "Perak",
    "09": "Perlis",
    "10": "Selangor",
    "11": "Terengganu",
    "12": "Sabah",
    "13": "Sarawak",
    "14": "W.P. Kuala Lumpur",
    "15": "W.P. Labuan",
    "16": "W.P. Putrajaya",
    1: "Johor",
    2: "Kedah",
    3: "Kelantan",
    4: "Melaka",
    5: "Negeri Sembilan",
    6: "Pahang",
    7: "Pulau Pinang",
    8: "Perak",
    9: "Perlis",
    10: "Selangor",
    11: "Terengganu",
    12: "Sabah",
    13: "Sarawak",
    14: "W.P. Kuala Lumpur",
    15: "W.P. Labuan",
    16: "W.P. Putrajaya",
    "JHR": "Johor",
    "KDH": "Kedah",
    "KTN": "Kelantan",
    "MLK": "Melaka",
    "NSN": "Negeri Sembilan",
    "PHG": "Pahang",
    "PNG": "Pulau Pinang",
    "PRK": "Perak",
    "PLS": "Perlis",
    "SGR": "Selangor",
    "TRG": "Terengganu",
    "SBH": "Sabah",
    "SWK": "Sarawak",
    "KUL": "W.P. Kuala Lumpur",
    "LBN": "W.P. Labuan",
    "PJY": "W.P. Putrajaya",
}

def standardize_state_name(val):
    if not val:
        return "Unknown"
    val = str(val).strip()
    if val in STATE_CODE_MAP:
        return STATE_CODE_MAP[val]
    val_upper = val.upper()
    if "KUALA LUMPUR" in val_upper:
        return "W.P. Kuala Lumpur"
    if "LABUAN" in val_upper:
        return "W.P. Labuan"
    if "PUTRAJAYA" in val_upper:
        return "W.P. Putrajaya"
    if "PINANG" in val_upper or "PENANG" in val_upper:
        return "Pulau Pinang"
    if "SEMBILAN" in val_upper:
        return "Negeri Sembilan"
    for code, name in STATE_CODE_MAP.items():
        if isinstance(code, str) and name.lower() == val.lower():
            return name
    return val.title()


def build_overpass_query():
    """
    Builds the Overpass QL query covering:
    - tourism: attraction, museum, viewpoint, gallery, theme_park, zoo, aquarium
    - historic: monument, memorial, castle, fort, archaeological_site, ruins, heritage, building, etc.
    - natural: beach, waterfall (and waterway=waterfall)
    - leisure: water_park
    Excluding accommodations and information offices.
    """
    return """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  // Core tourism tags
  nwr["tourism"="attraction"](area.my);
  nwr["tourism"="museum"](area.my);
  nwr["tourism"="viewpoint"](area.my);
  nwr["tourism"="gallery"](area.my);
  nwr["tourism"="theme_park"](area.my);
  nwr["tourism"="zoo"](area.my);
  nwr["tourism"="aquarium"](area.my);

  // Selected non-tourism attraction tags
  nwr["historic"](area.my);
  nwr["natural"="beach"](area.my);
  nwr["natural"="waterfall"](area.my);
  nwr["waterway"="waterfall"](area.my);
  nwr["leisure"="water_park"](area.my);
);
out center tags;
"""


def fetch_osm_data(force_refresh=False):
    """
    Executes the Overpass API query or loads from local cache.
    """
    if not force_refresh and os.path.exists(LOCAL_RAW_OSM_FILE):
        print(f"Loading cached OSM data from: {LOCAL_RAW_OSM_FILE}")
        with open(LOCAL_RAW_OSM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    query = build_overpass_query()
    print("Extracting nationwide tourism POIs from OpenStreetMap via Overpass API...")

    for endpoint in OVERPASS_ENDPOINTS:
        print(f"  Attempting endpoint: {endpoint}")
        try:
            resp = requests.post(endpoint, data={"data": query}, headers=HEADERS, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                count = len(data.get("elements", []))
                print(f"  Success from {endpoint}! Retrieved {count} raw elements.")
                with open(LOCAL_RAW_OSM_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                return data
            else:
                print(f"  Endpoint returned status {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"  Endpoint failed: {e}")
        time.sleep(2)

    raise RuntimeError("All Overpass API endpoints failed or timed out.")


def fetch_official_district_boundaries(force_refresh=False):
    """
    Fetches the official Malaysian administrative district boundary GeoJSON
    with 158-160 districts and standard attributes.
    """
    if not force_refresh and os.path.exists(LOCAL_BOUNDARY_FILE):
        print(f"Loading cached district boundaries from: {LOCAL_BOUNDARY_FILE}")
        with open(LOCAL_BOUNDARY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    print("Fetching official Malaysian district boundaries...")
    geojson_data = None

    # Source 1: Official DOSM ArcGIS REST Feature Server
    try:
        print(f"  Attempting DOSM FeatureServer: {OFFICIAL_ARCGIS_DISTRICTS_URL}")
        r = requests.get(OFFICIAL_ARCGIS_DISTRICTS_URL, headers=HEADERS, timeout=30)
        if r.status_code == 200:
            d = r.json()
            if "features" in d and len(d["features"]) >= 100:
                print(f"  Successfully fetched {len(d['features'])} districts from DOSM FeatureServer.")
                geojson_data = d
    except Exception as e:
        print(f"  DOSM FeatureServer request failed: {e}")

    # Source 2: DOSM Kawasanku Front / JAKIM GeoJSON (160 districts with state code)
    if not geojson_data:
        for fallback_url in [DOSM_JAKIM_DISTRICTS_URL, DOSM_KAWASANKU_DISTRICTS_URL]:
            try:
                print(f"  Attempting fallback boundary source: {fallback_url}")
                r = requests.get(fallback_url, headers=HEADERS, timeout=30)
                if r.status_code == 200:
                    d = r.json()
                    if "features" in d and len(d["features"]) >= 100:
                        print(f"  Successfully fetched {len(d['features'])} districts from fallback source.")
                        geojson_data = d
                        break
            except Exception as e:
                print(f"  Fallback source failed: {e}")

    if not geojson_data:
        raise RuntimeError("Failed to fetch official Malaysian district boundaries.")

    # Save to local cache
    with open(LOCAL_BOUNDARY_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=2)
    print(f"Saved official boundaries to {LOCAL_BOUNDARY_FILE}")
    return geojson_data


# Accommodation tags to strictly exclude
ACCOMMODATION_VALUES = {
    "hotel", "hostel", "motel", "guest_house", "chalet",
    "camp_site", "caravan_site", "apartment", "information", "yes"
}

def determine_category(tags):
    """
    Classifies an OSM feature into a clean, standardized tourism category.
    Returns (category_name, osm_tag_string) or None if excluded.
    """
    tourism = tags.get("tourism")
    historic = tags.get("historic")
    natural = tags.get("natural")
    leisure = tags.get("leisure")
    waterway = tags.get("waterway")

    # Filter out pure accommodations
    if tourism in ACCOMMODATION_VALUES:
        if not (historic and historic != "no"):
            return None

    # 1. Theme Park & Water Park
    if tourism == "theme_park":
        return ("Theme Park", "tourism=theme_park")
    if leisure == "water_park":
        return ("Water Park", "leisure=water_park")

    # 2. Zoo & Aquarium
    if tourism == "zoo":
        return ("Zoo", "tourism=zoo")
    if tourism == "aquarium":
        return ("Aquarium", "tourism=aquarium")

    # 3. Museum & Gallery
    if tourism == "museum":
        return ("Museum", "tourism=museum")
    if tourism == "gallery":
        return ("Gallery", "tourism=gallery")

    # 4. Viewpoint
    if tourism == "viewpoint":
        return ("Viewpoint", "tourism=viewpoint")

    # 5. Natural attractions (Waterfalls & Beaches)
    if natural == "waterfall" or waterway == "waterfall":
        return ("Waterfall", "waterway=waterfall" if waterway == "waterfall" else "natural=waterfall")
    if natural == "beach":
        return ("Beach", "natural=beach")

    # 6. Historic sites
    if historic and historic not in ("no", "none"):
        sub_type = historic.replace("_", " ").title()
        return (f"Historic Site ({sub_type})" if historic != "yes" else "Historic Site", f"historic={historic}")

    # 7. Attraction
    if tourism == "attraction":
        return ("Attraction", "tourism=attraction")

    return None


def clean_asset_name(tags, category):
    """
    Extracts the best name for the tourism asset, falling back to English or Malay names.
    """
    name = tags.get("name") or tags.get("name:en") or tags.get("name:ms") or tags.get("official_name")
    if not name:
        alt = tags.get("alt_name") or tags.get("loc_name") or tags.get("int_name")
        if alt:
            name = alt
        else:
            name = f"Unnamed {category}"
    return name.strip()


def parse_district_boundaries(boundary_geojson):
    """
    Parses GeoJSON features into Shapely polygons with district metadata.
    Handles newly gazetted districts (DP_BARU) and standard DOSM/JUPEM codes.
    """
    districts = []
    for feat in boundary_geojson.get("features", []):
        geom = feat.get("geometry")
        if not geom:
            continue
        try:
            poly = shape(geom)
        except Exception:
            continue

        props = feat.get("properties", {})
        
        # Robust district name check (prioritize DP_BARU for newly gazetted districts)
        district_name = "Unknown"
        for field in ["DP_BARU", "Daerah_1", "district", "name", "DAERAH"]:
            val = props.get(field)
            if val and str(val).strip():
                district_name = str(val).strip()
                break

        state_raw = (
            props.get("NEGERI") or
            props.get("state") or
            props.get("code_state") or
            props.get("KOD_NG_1") or
            props.get("KOD_NEGERI") or
            ""
        )
        state_name = standardize_state_name(state_raw)

        # District & State Codes
        district_code = ""
        for field in ["KODDP_BA_1", "KOD_DP", "KOD_DAERAH"]:
            val = props.get(field)
            if val and str(val).strip():
                district_code = str(val).strip()
                break

        state_code = ""
        for field in ["KOD_NG_1", "code_state", "KOD_NEGERI"]:
            val = props.get(field)
            if val and str(val).strip():
                state_code = str(val).strip()
                break

        districts.append({
            "geometry": poly,
            "district": district_name.title(),
            "state": state_name,
            "district_code": district_code,
            "state_code": state_code
        })

    print(f"Loaded {len(districts)} district boundary polygons.")
    return districts


def perform_spatial_join(osm_elements, districts):
    """
    Performs Point-in-Polygon spatial join using Shapely STRtree.
    Handles:
    1. Exact Point-in-Polygon
    2. Coastal buffer (<4.4 km) for immediate coastal/beach assets
    3. Offshore marine / island attraction snap (<250 km within Malaysian waters)
    """
    print("Building spatial index for districts (STRtree)...")
    polygons = [d["geometry"] for d in districts]
    tree = STRtree(polygons)

    records = []
    skipped_accommodation = 0
    skipped_no_coord = 0
    matched_exact = 0
    matched_buffer = 0
    matched_offshore = 0
    unmatched = 0

    print("Joining tourism assets to Malaysian districts...")
    for elem in osm_elements:
        tags = elem.get("tags", {})
        if not tags:
            continue

        cat_info = determine_category(tags)
        if not cat_info:
            skipped_accommodation += 1
            continue

        category, osm_category = cat_info

        # Extract coordinates (node lat/lon or centroid for way/relation)
        lat = elem.get("lat")
        lon = elem.get("lon")
        if lat is None or lon is None:
            center = elem.get("center")
            if center:
                lat = center.get("lat")
                lon = center.get("lon")

        if lat is None or lon is None:
            skipped_no_coord += 1
            continue

        pt = Point(lon, lat)

        # 1. Exact Point-in-Polygon query
        match_idx = None
        candidate_indices = tree.query(pt)
        for idx in candidate_indices:
            if polygons[idx].contains(pt) or polygons[idx].touches(pt):
                match_idx = idx
                matched_exact += 1
                break

        # 2. Coastal buffer check (up to ~0.04 degrees ≈ 4.4 km) for offshore islands/beaches
        if match_idx is None:
            buf_pt = pt.buffer(0.04)
            nearby_indices = tree.query(buf_pt)
            min_dist = 999.0
            best_idx = None
            for idx in nearby_indices:
                dist = polygons[idx].distance(pt)
                if dist < min_dist and dist <= 0.04:
                    min_dist = dist
                    best_idx = idx

            if best_idx is not None:
                match_idx = best_idx
                matched_buffer += 1

        # 3. Offshore marine / island attraction snap (<2.5 degrees ≈ 275 km)
        if match_idx is None:
            nearest_idx = tree.nearest(pt)
            dist_deg = polygons[nearest_idx].distance(pt)
            if dist_deg <= 2.5:
                match_idx = nearest_idx
                matched_offshore += 1

        if match_idx is not None:
            d_info = districts[match_idx]
            state = d_info["state"]
            district = d_info["district"]
            state_code = d_info["state_code"]
            district_code = d_info["district_code"]
        else:
            unmatched += 1
            state = "Outside Admin Boundary"
            district = "Outside Admin Boundary"
            state_code = ""
            district_code = ""

        asset_name = clean_asset_name(tags, category)
        name_ms = tags.get("name:ms") or ""
        name_en = tags.get("name:en") or ""
        osm_type = elem.get("type", "node")
        osm_id = elem.get("id")

        records.append({
            "asset_id": f"OSM_{osm_type}_{osm_id}",
            "name": asset_name,
            "name_en": name_en,
            "name_ms": name_ms,
            "category": category,
            "osm_category": osm_category,
            "osm_type": osm_type,
            "osm_id": osm_id,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "state": state,
            "state_code": state_code,
            "district": district,
            "district_code": district_code,
            "website": tags.get("website") or tags.get("contact:website") or "",
            "phone": tags.get("phone") or tags.get("contact:phone") or "",
            "opening_hours": tags.get("opening_hours") or "",
            "fee": tags.get("fee") or tags.get("charge") or "",
            "wheelchair": tags.get("wheelchair") or "",
        })

    print("\nSpatial Join Results:")
    print(f"  Total valid tourism assets extracted: {len(records):,}")
    print(f"  Exact district polygon matches:       {matched_exact:,}")
    print(f"  Coastal/beach buffer snapped (<4km):   {matched_buffer:,}")
    print(f"  Offshore island/marine snapped (<275km):{matched_offshore:,}")
    print(f"  Unmatched / outside border:           {unmatched:,}")
    print(f"  Excluded accommodations/info:         {skipped_accommodation:,}")

    return pd.DataFrame(records)


def print_dataset_summary(df):
    """
    Prints a rich breakdown of the dataset.
    """
    print("\n" + "=" * 60)
    print("MALAYSIA TOURISM ASSET COVERAGE DATASET SUMMARY")
    print("=" * 60)
    print(f"Total Tourism Assets: {len(df):,}")

    print("\n--- Distribution by Category ---")
    cat_counts = df["category"].value_counts()
    for cat, cnt in cat_counts.items():
        print(f"  {cat:<35}: {cnt:>5,}")

    print("\n--- Distribution by State ---")
    state_counts = df["state"].value_counts()
    for st, cnt in state_counts.items():
        print(f"  {st:<30}: {cnt:>5,}")

    print("\n--- Top 15 Districts by Asset Density ---")
    district_counts = df[df["district"] != "Outside Admin Boundary"]["district"].value_counts().head(15)
    for dist, cnt in district_counts.items():
        print(f"  {dist:<30}: {cnt:>5,}")

    # Spot check famous landmarks
    print("\n--- Landmark Spot Check ---")
    landmarks = [
        "Petronas", "KLCC", "Batu Caves", "Penang Hill", "Kinabalu",
        "A Famosa", "Langkawi", "Bako", "Kek Lok Si", "Sipadan", "Payar"
    ]
    for lm in landmarks:
        matches = df[df["name"].str.contains(lm, case=False, na=False)]
        if not matches.empty:
            sample = matches.iloc[0]
            print(f"  [OK] {sample['name'][:35]:<35} -> State: {sample['state']}, District: {sample['district']}")


def main():
    parser = argparse.ArgumentParser(description="Build Tourisma Tourism Asset Coverage Dataset")
    parser.add_argument("--force-refresh", action="store_true", help="Force fresh download from Overpass & boundaries")
    parser.add_argument("--boundaries-only", action="store_true", help="Download official boundaries only")
    args = parser.parse_args()

    # Step 3: Fetch official district boundaries
    boundary_geojson = fetch_official_district_boundaries(force_refresh=args.force_refresh)
    districts = parse_district_boundaries(boundary_geojson)

    if args.boundaries_only:
        print("Completed boundary preparation.")
        return

    # Step 1 & 2: Fetch OSM tourism assets
    osm_raw = fetch_osm_data(force_refresh=args.force_refresh)
    elements = osm_raw.get("elements", [])
    print(f"Loaded {len(elements)} raw OSM elements.")

    # Step 4: Spatial Join
    df = perform_spatial_join(elements, districts)

    # Sort by State, District, Category, Name
    df = df.sort_values(by=["state", "district", "category", "name"]).reset_index(drop=True)

    # Save CSV
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"\nSaved final CSV dataset: {OUTPUT_CSV} ({len(df):,} rows)")

    # Save JSON
    df.to_json(OUTPUT_JSON, orient="records", indent=2, force_ascii=False)
    print(f"Saved final JSON dataset: {OUTPUT_JSON}")

    # Print summary
    print_dataset_summary(df)


if __name__ == "__main__":
    main()
