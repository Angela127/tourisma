"""
Malaysia Tourism Supporting Assets Dataset Builder
Extracts supporting tourism POIs from OpenStreetMap via Overpass API:
1. Accommodation (hotels, resorts, guesthouses, hostels, motels, chalets, serviced apartments)
2. Food & Beverage (restaurants, cafés, food courts, fast food)
3. Public Transport (bus stops, bus stations, railway/LRT/MRT stations, ferry terminals)
4. Essential Services (hospitals, clinics, pharmacies)

Performs high-performance STRtree spatial join against official Malaysian
district boundaries (DOSM / MyGDI) to map each facility to its State and District.
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

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Project paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
BOUNDARIES_DIR = os.path.join(DATASET_DIR, "boundaries")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
LOCAL_BOUNDARY_FILE = os.path.join(BOUNDARIES_DIR, "malaysia_districts_official.geojson")
OUTPUT_CSV = os.path.join(DATASET_DIR, "tourism_supporting_assets.csv")
OUTPUT_JSON = os.path.join(DATASET_DIR, "tourism_supporting_assets.json")

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
    "User-Agent": "TourismaSupportingAssetsBuilder/1.0 (Malaysia-Tourism-Research; contact: admin@tourisma.my)"
}

# Category Overpass Queries
QUERIES = {
    "accommodation": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  nwr["tourism"~"^(hotel|resort|guest_house|hostel|motel|chalet|apartment)$"](area.my);
  nwr["leisure"="resort"](area.my);
);
out center tags;
""",
    "food_beverage": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  nwr["amenity"~"^(restaurant|cafe|food_court|fast_food)$"](area.my);
);
out center tags;
""",
    "public_transport": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  nwr["highway"="bus_stop"](area.my);
  nwr["amenity"="bus_station"](area.my);
  nwr["railway"~"^(station|halt)$"](area.my);
  nwr["amenity"="ferry_terminal"](area.my);
  nwr["public_transport"="station"](area.my);
);
out center tags;
""",
    "essential_services": """[out:json][timeout:180];
area["ISO3166-1"="MY"][admin_level=2]->.my;
(
  nwr["amenity"~"^(hospital|clinic|pharmacy)$"](area.my);
);
out center tags;
"""
}

# State Code Mapping
STATE_CODE_MAP = {
    "01": "Johor", "02": "Kedah", "03": "Kelantan", "04": "Melaka",
    "05": "Negeri Sembilan", "06": "Pahang", "07": "Pulau Pinang", "08": "Perak",
    "09": "Perlis", "10": "Selangor", "11": "Terengganu", "12": "Sabah",
    "13": "Sarawak", "14": "W.P. Kuala Lumpur", "15": "W.P. Labuan", "16": "W.P. Putrajaya",
    1: "Johor", 2: "Kedah", 3: "Kelantan", 4: "Melaka", 5: "Negeri Sembilan",
    6: "Pahang", 7: "Pulau Pinang", 8: "Perak", 9: "Perlis", 10: "Selangor",
    11: "Terengganu", 12: "Sabah", 13: "Sarawak", 14: "W.P. Kuala Lumpur",
    15: "W.P. Labuan", 16: "W.P. Putrajaya",
    "JHR": "Johor", "KDH": "Kedah", "KTN": "Kelantan", "MLK": "Melaka",
    "NSN": "Negeri Sembilan", "PHG": "Pahang", "PNG": "Pulau Pinang", "PRK": "Perak",
    "PLS": "Perlis", "SGR": "Selangor", "TRG": "Terengganu", "SBH": "Sabah",
    "SWK": "Sarawak", "KUL": "W.P. Kuala Lumpur", "LBN": "W.P. Labuan", "PJY": "W.P. Putrajaya",
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


def fetch_category_data(category_key, force_refresh=False):
    """
    Executes Overpass API query for a single supporting asset category
    or loads from local cache.
    """
    cache_path = os.path.join(RAW_DIR, f"supporting_{category_key}.json")
    if not force_refresh and os.path.exists(cache_path):
        print(f"[{category_key}] Loading cached data: {cache_path}")
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    query = QUERIES[category_key]
    print(f"[{category_key}] Extracting from OpenStreetMap via Overpass API...")

    for endpoint in OVERPASS_ENDPOINTS:
        print(f"  Attempting {endpoint}...")
        try:
            resp = requests.post(endpoint, data={"data": query}, headers=HEADERS, timeout=180)
            if resp.status_code == 200:
                data = resp.json()
                count = len(data.get("elements", []))
                print(f"  Success from {endpoint}! Retrieved {count:,} elements.")
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                return data
            else:
                print(f"  Status {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            print(f"  Error on {endpoint}: {e}")
        time.sleep(2)

    raise RuntimeError(f"All endpoints failed for category: {category_key}")


def classify_supporting_asset(elem):
    """
    Classifies an OSM element into (Category, Subcategory, osm_category_string).
    """
    tags = elem.get("tags", {})
    tourism = tags.get("tourism")
    amenity = tags.get("amenity")
    highway = tags.get("highway")
    railway = tags.get("railway")
    public_transport = tags.get("public_transport")
    leisure = tags.get("leisure")

    # 1. Accommodation
    if tourism in ("hotel", "resort", "guest_house", "hostel", "motel", "chalet", "apartment") or leisure == "resort":
        if tourism == "resort" or leisure == "resort" or tags.get("resort"):
            return ("Accommodation", "Resort", "tourism=resort" if tourism == "resort" else "leisure=resort")
        subcat_map = {
            "hotel": "Hotel",
            "guest_house": "Guesthouse",
            "hostel": "Hostel",
            "motel": "Motel",
            "chalet": "Chalet",
            "apartment": "Serviced Apartment / Rental"
        }
        subcat = subcat_map.get(tourism, tourism.title())
        return ("Accommodation", subcat, f"tourism={tourism}")

    # 2. Food & Beverage
    if amenity in ("restaurant", "cafe", "food_court", "fast_food"):
        subcat_map = {
            "restaurant": "Restaurant",
            "cafe": "Café",
            "food_court": "Food Court",
            "fast_food": "Fast Food"
        }
        subcat = subcat_map.get(amenity, amenity.replace("_", " ").title())
        return ("Food & Beverage", subcat, f"amenity={amenity}")

    # 3. Public Transport
    if highway == "bus_stop" or public_transport == "platform":
        return ("Public Transport", "Bus Stop", "highway=bus_stop")
    if amenity == "bus_station":
        return ("Public Transport", "Bus Station / Terminal", "amenity=bus_station")
    if railway in ("station", "halt"):
        return ("Public Transport", "Railway / Transit Station" if railway == "station" else "Railway Halt", f"railway={railway}")
    if amenity == "ferry_terminal":
        return ("Public Transport", "Ferry Terminal", "amenity=ferry_terminal")
    if public_transport == "station":
        return ("Public Transport", "Transit Station", "public_transport=station")

    # 4. Essential Services
    if amenity in ("hospital", "clinic", "pharmacy"):
        subcat_map = {
            "hospital": "Hospital",
            "clinic": "Clinic",
            "pharmacy": "Pharmacy"
        }
        subcat = subcat_map.get(amenity, amenity.title())
        return ("Essential Services", subcat, f"amenity={amenity}")

    return None


def clean_asset_name(tags, subcategory):
    """
    Extracts name with language fallback or descriptive fallback.
    """
    name = tags.get("name") or tags.get("name:en") or tags.get("name:ms") or tags.get("official_name")
    if not name:
        alt = tags.get("alt_name") or tags.get("loc_name") or tags.get("int_name")
        if alt:
            name = alt
        else:
            name = f"Unnamed {subcategory}"
    return name.strip()


def parse_district_boundaries():
    """
    Loads official district boundary GeoJSON and builds list of polygons with metadata.
    """
    if not os.path.exists(LOCAL_BOUNDARY_FILE):
        raise FileNotFoundError(f"District boundaries not found at {LOCAL_BOUNDARY_FILE}. Run build_tourism_dataset.py first.")

    with open(LOCAL_BOUNDARY_FILE, "r", encoding="utf-8") as f:
        boundary_geojson = json.load(f)

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
        district_name = "Unknown"
        for field in ["DP_BARU", "Daerah_1", "district", "name", "DAERAH"]:
            val = props.get(field)
            if val and str(val).strip():
                district_name = str(val).strip()
                break

        state_raw = (
            props.get("NEGERI") or props.get("state") or props.get("code_state") or
            props.get("KOD_NG_1") or props.get("KOD_NEGERI") or ""
        )
        state_name = standardize_state_name(state_raw)

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

    print(f"Loaded {len(districts)} district boundary polygons from {LOCAL_BOUNDARY_FILE}")
    return districts


def perform_spatial_join(all_elements, districts):
    """
    Spatial join for supporting tourism assets against official districts using STRtree.
    Deduplicates elements by OSM ID.
    """
    print("Building spatial index for districts (STRtree)...")
    polygons = [d["geometry"] for d in districts]
    tree = STRtree(polygons)

    records = []
    seen_ids = set()
    skipped_no_coord = 0
    matched_exact = 0
    matched_buffer = 0
    matched_offshore = 0

    print(f"Processing {len(all_elements):,} supporting assets...")
    for elem in all_elements:
        osm_type = elem.get("type", "node")
        osm_id = elem.get("id")
        unique_key = (osm_type, osm_id)
        if unique_key in seen_ids:
            continue
        seen_ids.add(unique_key)

        classification = classify_supporting_asset(elem)
        if not classification:
            continue

        category, subcategory, osm_cat = classification
        tags = elem.get("tags", {})

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

        # 1. Exact Point-in-Polygon
        match_idx = None
        candidate_indices = tree.query(pt)
        for idx in candidate_indices:
            if polygons[idx].contains(pt) or polygons[idx].touches(pt):
                match_idx = idx
                matched_exact += 1
                break

        # 2. Coastal buffer (<4.4 km) for beach resorts / piers
        if match_idx is None:
            buf_pt = pt.buffer(0.04)
            nearby = tree.query(buf_pt)
            min_dist = 999.0
            best = None
            for idx in nearby:
                d = polygons[idx].distance(pt)
                if d < min_dist and d <= 0.04:
                    min_dist = d
                    best = idx
            if best is not None:
                match_idx = best
                matched_buffer += 1

        # 3. Offshore marine / island snap (<250 km)
        if match_idx is None:
            nearest_idx = tree.nearest(pt)
            d_deg = polygons[nearest_idx].distance(pt)
            if d_deg <= 2.5:
                match_idx = nearest_idx
                matched_offshore += 1

        if match_idx is not None:
            d_info = districts[match_idx]
            state = d_info["state"]
            district = d_info["district"]
            state_code = d_info["state_code"]
            district_code = d_info["district_code"]
        else:
            state = "Outside Admin Boundary"
            district = "Outside Admin Boundary"
            state_code = ""
            district_code = ""

        name = clean_asset_name(tags, subcategory)
        name_en = tags.get("name:en") or ""
        name_ms = tags.get("name:ms") or ""

        records.append({
            "asset_id": f"OSM_{osm_type}_{osm_id}",
            "name": name,
            "name_en": name_en,
            "name_ms": name_ms,
            "category": category,
            "subcategory": subcategory,
            "osm_category": osm_cat,
            "osm_type": osm_type,
            "osm_id": osm_id,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "state": state,
            "state_code": state_code,
            "district": district,
            "district_code": district_code,
            "cuisine": tags.get("cuisine") or "",
            "brand": tags.get("brand") or "",
            "stars": tags.get("stars") or "",
            "rooms": tags.get("rooms") or "",
            "beds": tags.get("beds") or "",
            "operator": tags.get("operator") or "",
            "website": tags.get("website") or tags.get("contact:website") or "",
            "phone": tags.get("phone") or tags.get("contact:phone") or "",
            "opening_hours": tags.get("opening_hours") or "",
            "wheelchair": tags.get("wheelchair") or "",
        })

    print("\nSpatial Join Results:")
    print(f"  Total valid supporting assets:       {len(records):,}")
    print(f"  Exact district polygon matches:     {matched_exact:,}")
    print(f"  Coastal buffer snapped (<4.4km):     {matched_buffer:,}")
    print(f"  Offshore island snapped (<275km):    {matched_offshore:,}")
    print(f"  Skipped (no coordinate):             {skipped_no_coord:,}")

    return pd.DataFrame(records)


def print_dataset_summary(df):
    """
    Displays clean breakdown of supporting tourism assets.
    """
    print("\n" + "=" * 65)
    print("MALAYSIA TOURISM SUPPORTING ASSETS DATASET SUMMARY")
    print("=" * 65)
    print(f"Total Facilities: {len(df):,}")

    print("\n--- Distribution by Category ---")
    cat_counts = df["category"].value_counts()
    for cat, cnt in cat_counts.items():
        print(f"  {cat:<25}: {cnt:>6,}")

    print("\n--- Detailed Breakdown by Subcategory ---")
    subcat_counts = df.groupby(["category", "subcategory"]).size()
    for (cat, subcat), cnt in subcat_counts.items():
        print(f"  [{cat[:4]}] {subcat:<32}: {cnt:>6,}")

    print("\n--- Distribution by State ---")
    state_counts = df["state"].value_counts()
    for st, cnt in state_counts.items():
        print(f"  {st:<30}: {cnt:>6,}")

    print("\n--- Top 15 Districts by Facility Count ---")
    dist_counts = df[df["district"] != "Outside Admin Boundary"]["district"].value_counts().head(15)
    for dist, cnt in dist_counts.items():
        print(f"  {dist:<30}: {cnt:>6,}")


def main():
    parser = argparse.ArgumentParser(description="Build Tourisma Supporting Assets Dataset")
    parser.add_argument("--force-refresh", action="store_true", help="Force fresh download from Overpass API")
    parser.add_argument("--category", choices=list(QUERIES.keys()), help="Process only a specific category")
    args = parser.parse_args()

    # Step 1: Load official districts
    districts = parse_district_boundaries()

    # Step 2: Fetch and combine OSM supporting assets
    categories_to_fetch = [args.category] if args.category else list(QUERIES.keys())
    all_elements = []

    for cat in categories_to_fetch:
        data = fetch_category_data(cat, force_refresh=args.force_refresh)
        elements = data.get("elements", [])
        print(f"  -> Added {len(elements):,} elements for {cat}")
        all_elements.extend(elements)

    print(f"\nTotal collected raw elements: {len(all_elements):,}")

    # Step 3: Spatial Join
    df = perform_spatial_join(all_elements, districts)

    # Sort
    df = df.sort_values(by=["category", "subcategory", "state", "district", "name"]).reset_index(drop=True)

    # Step 4: Export
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"\nSaved CSV dataset: {OUTPUT_CSV} ({len(df):,} rows)")

    df.to_json(OUTPUT_JSON, orient="records", indent=2, force_ascii=False)
    print(f"Saved JSON dataset: {OUTPUT_JSON}")

    # Summary
    print_dataset_summary(df)


if __name__ == "__main__":
    main()
