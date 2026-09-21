"""
Tourisma — State Master Dataset Builder

Consolidates all 5 Tourisma dimensions into a single state-level master dataset
(23-column schema, 1 row per Malaysian state / Federal Territory):

1. Tourism Demand:
   - domestic_visitors
   - international_hotel_guests
   - domestic_receipts_rm_million
   - average_length_of_stay
2. Accommodation Capacity & Utilization:
   - accommodation_rooms
   - accommodation_establishments
   - aor_pct (Official Tourism Malaysia Average Occupancy Rate)
   - visitor_to_room_ratio (Demand-to-capacity pressure: domestic_visitors / accommodation_rooms)
3. Geographic Area & Asset Supply / Density:
   - land_area_km2
   - core_asset_count
   - core_asset_density (assets per 1,000 km2)
   - supporting_asset_count
   - supporting_asset_density (facilities per 1,000 km2)
   - total_tourism_assets (core + supporting)
4. Accessibility:
   - road_access_rate (% of core assets within 1 km of main road)
   - pt_access_rate (% of core assets within 1 km of public transport)
5. Environmental Exposure:
   - inside_sensitive_rate (% of total assets inside protected area)
   - near_sensitive_rate (% of total assets within 1 km buffer of protected area)
   - terrestrial_exposure_rate (% of total assets inside/near land protected areas)
   - marine_exposure_rate (% of total assets inside/near marine protected areas)
   - environmental_exposure_rate (% of total assets inside OR near sensitive area)

Reference Year:
   - reference_year = 2025 (Anchor reference year. Demand reflects 2025; accommodation
     reflects latest published stock year 2024; geospatial layers reflect current extracts).
"""

import os
import sys
import json
import pandas as pd

CANONICAL_STATES = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'W.P. Kuala Lumpur',
    'W.P. Labuan',
    'W.P. Putrajaya'
]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fin_dir = os.path.join(base_dir, 'finalized_dataset')
    data_dir = os.path.join(base_dir, 'dataset')

    # 1. Load Demand Dataset
    demand_path = os.path.join(fin_dir, 'tourism_demand_state.csv')
    if not os.path.exists(demand_path):
        demand_path = os.path.join(data_dir, 'tourism_demand_state.csv')
    print(f"Step 1: Loading Tourism Demand from {demand_path}...")
    df_demand = pd.read_csv(demand_path)

    # 2. Load Accommodation Capacity Dataset
    cap_path = os.path.join(fin_dir, 'accommodation_capacity_state.csv')
    if not os.path.exists(cap_path):
        cap_path = os.path.join(data_dir, 'accommodation_capacity_state.csv')
    print(f"Step 2: Loading Accommodation Capacity from {cap_path}...")
    df_cap = pd.read_csv(cap_path)

    # Load aor_pct from raw accommodation file
    raw_acc_path = os.path.join(fin_dir, 'accommodation_capacity_raw.csv')
    if not os.path.exists(raw_acc_path):
        raw_acc_path = os.path.join(data_dir, 'accommodation_capacity_raw.csv')
    print(f"Step 2b: Loading AOR % from {raw_acc_path}...")
    df_raw_acc = pd.read_csv(raw_acc_path)
    aor_dict = dict(zip(df_raw_acc['state'], df_raw_acc['aor_pct']))

    # 3. Load State Land Area from Official District Polygons
    districts_path = os.path.join(data_dir, 'boundaries', 'malaysia_districts_official.geojson')
    print(f"Step 3: Calculating state land areas from {districts_path}...")
    with open(districts_path, 'r', encoding='utf-8') as f:
        gj = json.load(f)

    areas_km2 = {}
    for feat in gj['features']:
        p = feat['properties']
        st = p['NEGERI']
        # Convert Shape__Area (m2) to km2
        a = p.get('Shape__Area', 0) / 1e6
        areas_km2[st] = areas_km2.get(st, 0) + a

    # 4. Load Core Assets & Supporting Assets
    core_path = os.path.join(fin_dir, 'tourism_asset_coverage.csv')
    print(f"Step 4: Loading Core Tourism Assets from {core_path}...")
    df_core = pd.read_csv(core_path)
    core_counts = df_core['state'].value_counts()

    supp_path = os.path.join(fin_dir, 'tourism_supporting_assets.csv')
    print(f"Step 5: Loading Supporting Tourism Assets from {supp_path}...")
    df_supp = pd.read_csv(supp_path, low_memory=False)
    supp_counts = df_supp['state'].value_counts()

    # 5. Load Road Accessibility
    road_path = os.path.join(fin_dir, 'tourism_road_accessibility.csv')
    print(f"Step 6: Loading Road Accessibility from {road_path}...")
    df_road = pd.read_csv(road_path)
    df_road['is_road_acc'] = df_road['distance_to_road_km'] <= 1.0
    road_acc_series = df_road.groupby('state')['is_road_acc'].sum()
    road_total_series = df_road.groupby('state')['asset_id'].count()
    road_rate_series = (road_acc_series / road_total_series * 100).round(2)

    # 6. Load Public Transport Accessibility
    pt_path = os.path.join(fin_dir, 'tourism_pt_accessibility.csv')
    print(f"Step 7: Loading Public Transport Accessibility from {pt_path}...")
    df_pt = pd.read_csv(pt_path)
    df_pt['is_pt_acc'] = df_pt['distance_to_pt_km'] <= 1.0
    pt_acc_series = df_pt.groupby('state')['is_pt_acc'].sum()
    pt_total_series = df_pt.groupby('state')['asset_id'].count()
    pt_rate_series = (pt_acc_series / pt_total_series * 100).round(2)

    # 7. Load Environmental Relationship
    env_path = os.path.join(fin_dir, 'tourism_environment_relationship.csv')
    print(f"Step 8: Loading Environmental Relationship from {env_path}...")
    df_env = pd.read_csv(env_path, low_memory=False)
    env_total = df_env.groupby('state')['asset_id'].count()
    
    # Overall Inside & Near
    env_inside = df_env[df_env['relationship'] == 'Inside'].groupby('state')['asset_id'].count().reindex(env_total.index, fill_value=0)
    env_near = df_env[df_env['relationship'] == 'Near'].groupby('state')['asset_id'].count().reindex(env_total.index, fill_value=0)
    env_exposed = df_env[df_env['relationship'].isin(['Inside', 'Near'])].groupby('state')['asset_id'].count().reindex(env_total.index, fill_value=0)

    # Terrestrial (Land) Exposure
    env_land_exp = df_env[df_env['land_relationship'].isin(['Inside', 'Near'])].groupby('state')['asset_id'].count().reindex(env_total.index, fill_value=0)

    # Marine Exposure
    env_marine_exp = df_env[df_env['marine_relationship'].isin(['Inside', 'Near'])].groupby('state')['asset_id'].count().reindex(env_total.index, fill_value=0)

    inside_rate_series = (env_inside / env_total * 100).round(2)
    near_rate_series = (env_near / env_total * 100).round(2)
    exposure_rate_series = (env_exposed / env_total * 100).round(2)
    land_rate_series = (env_land_exp / env_total * 100).round(2)
    marine_rate_series = (env_marine_exp / env_total * 100).round(2)

    # Step 9: Assemble Consolidated 23-Column Master Dataset
    print("\nStep 9: Assembling 23-column Master Table...")
    rows = []
    for st in CANONICAL_STATES:
        d_row = df_demand[df_demand['state'] == st].iloc[0]
        c_row = df_cap[df_cap['state'] == st].iloc[0]

        dom_vis = int(d_row['domestic_visitors'])
        rooms = int(c_row['accommodation_rooms'])
        estabs = int(c_row['accommodation_establishments'])
        
        # New feature 1: aor_pct
        aor = float(aor_dict.get(st, 0.0))
        
        # New feature 2: visitor_to_room_ratio
        ratio = round(dom_vis / rooms, 2) if rooms > 0 else 0.0

        land_area = round(areas_km2.get(st, 0), 2)
        c_count = int(core_counts.get(st, 0))
        s_count = int(supp_counts.get(st, 0))
        tot_assets = c_count + s_count

        c_density = round((c_count / land_area) * 1000, 2) if land_area > 0 else 0.0
        s_density = round((s_count / land_area) * 1000, 2) if land_area > 0 else 0.0

        road_rate = float(road_rate_series.get(st, 0.0))
        pt_rate = float(pt_rate_series.get(st, 0.0))

        in_rate = float(inside_rate_series.get(st, 0.0))
        nr_rate = float(near_rate_series.get(st, 0.0))
        
        # New feature 3: terrestrial_exposure_rate
        land_exp_rate = float(land_rate_series.get(st, 0.0))
        
        # New feature 4: marine_exposure_rate
        marine_exp_rate = float(marine_rate_series.get(st, 0.0))
        
        exp_rate = float(exposure_rate_series.get(st, 0.0))

        rows.append({
            'state': st,
            'reference_year': 2025,
            'domestic_visitors': dom_vis,
            'international_hotel_guests': int(d_row['international_hotel_guests']),
            'domestic_receipts_rm_million': float(d_row['domestic_receipts_rm_million']),
            'average_length_of_stay': float(d_row['average_length_of_stay_nights']),
            'accommodation_rooms': rooms,
            'accommodation_establishments': estabs,
            'aor_pct': aor,
            'visitor_to_room_ratio': ratio,
            'land_area_km2': land_area,
            'core_asset_count': c_count,
            'core_asset_density': c_density,
            'supporting_asset_count': s_count,
            'supporting_asset_density': s_density,
            'total_tourism_assets': tot_assets,
            'road_access_rate': road_rate,
            'pt_access_rate': pt_rate,
            'inside_sensitive_rate': in_rate,
            'near_sensitive_rate': nr_rate,
            'terrestrial_exposure_rate': land_exp_rate,
            'marine_exposure_rate': marine_exp_rate,
            'environmental_exposure_rate': exp_rate
        })

    df_master = pd.DataFrame(rows).sort_values(by='domestic_visitors', ascending=False).reset_index(drop=True)

    # Step 10: Quality Control Checks
    print("\n--- Running Master Table Quality Control Checks ---")
    assert len(df_master) == 16, f"Expected 16 states, got {len(df_master)}"
    assert df_master['state'].nunique() == 16, "Duplicate state entries detected!"
    assert df_master.isnull().sum().sum() == 0, "Null or NaN values detected!"
    assert len(df_master.columns) == 23, f"Expected 23 columns, got {len(df_master.columns)}"
    print("[PASS] Check 1: Exactly 16 unique states with zero null values across all 23 columns.")

    assert (df_master['total_tourism_assets'] == df_master['core_asset_count'] + df_master['supporting_asset_count']).all()
    assert df_master['total_tourism_assets'].sum() == 60731
    print(f"[PASS] Check 2: Total tourism assets sum ({df_master['total_tourism_assets'].sum():,d}) matches Core + Supporting.")

    assert (df_master['aor_pct'] >= 0).all() and (df_master['aor_pct'] <= 100).all()
    assert (df_master['visitor_to_room_ratio'] > 0).all()
    print("[PASS] Check 3: AOR % and Visitor-to-Room Ratio verified.")

    assert (df_master['terrestrial_exposure_rate'] >= 0).all() and (df_master['terrestrial_exposure_rate'] <= 100).all()
    assert (df_master['marine_exposure_rate'] >= 0).all() and (df_master['marine_exposure_rate'] <= 100).all()
    print("[PASS] Check 4: Terrestrial and Marine exposure rates strictly between 0% and 100%.")

    # Step 11: Export to dataset/ and finalized_dataset/
    out_dirs = [data_dir, fin_dir]
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        csv_path = os.path.join(d, 'tourisma_state_master.csv')
        df_master.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"Saved: {csv_path}")

    print("\n=== Master Table Preview (All 16 States with 4 New Features) ===")
    cols_preview = ['state', 'accommodation_rooms', 'aor_pct', 'visitor_to_room_ratio', 'terrestrial_exposure_rate', 'marine_exposure_rate', 'environmental_exposure_rate']
    print(df_master[cols_preview].to_string(index=False))

if __name__ == '__main__':
    main()
