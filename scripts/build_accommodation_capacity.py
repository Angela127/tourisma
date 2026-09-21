"""
Tourisma — State-Level Accommodation Capacity Dataset Builder

Generates:
1. accommodation_capacity_raw.csv:
   Unmodified historical records from Tourism Malaysia Paid Accommodation Survey (2019–2024).
   Columns: state, year, accommodation_establishments, accommodation_rooms, aor_pct

2. accommodation_capacity_state.csv:
   Standardized 4-column schema for the latest official stock year:
   - state (String)
   - year (Integer)
   - accommodation_establishments (Integer)
   - accommodation_rooms (Integer)

3. accommodation_demand_pressure_state.csv:
   Derived indicator linking Tourism Demand with Accommodation Capacity:
   - state (String)
   - domestic_visitors (Integer)
   - accommodation_rooms (Integer)
   - visitor_to_room_ratio (Float, 2 decimals)
   - demand_pressure_rank (Integer, 1 = highest pressure)

Primary Source:
- Tourism Malaysia Paid Accommodation Survey (via clustering/accommodation.xlsx)
- Domestic visitors from dataset/tourism_demand_state.csv
"""

import os
import sys
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

STATE_MAPPING = {
    'JOHOR': 'Johor',
    'KEDAH': 'Kedah',
    'KELANTAN': 'Kelantan',
    'MELAKA': 'Melaka',
    'NEGERI SEMBILAN': 'Negeri Sembilan',
    'PAHANG': 'Pahang',
    'PERAK': 'Perak',
    'PERLIS': 'Perlis',
    'PULAU PINANG': 'Pulau Pinang',
    'SABAH': 'Sabah',
    'SARAWAK': 'Sarawak',
    'SELANGOR': 'Selangor',
    'TERENGGANU': 'Terengganu',
    'W.P. KUALA LUMPUR': 'W.P. Kuala Lumpur',
    'W.P. LABUAN': 'W.P. Labuan',
    'W.P. PUTRAJAYA': 'W.P. Putrajaya',
    'KUALA LUMPUR': 'W.P. Kuala Lumpur',
    'LABUAN': 'W.P. Labuan',
    'PUTRAJAYA': 'W.P. Putrajaya'
}

def normalize_state(name: str) -> str:
    cleaned = str(name).strip().upper()
    return STATE_MAPPING.get(cleaned, str(name).strip().title())

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    acc_path = os.path.join(base_dir, 'clustering', 'accommodation.xlsx')
    demand_path = os.path.join(base_dir, 'finalized_dataset', 'tourism_demand_state.csv')

    if not os.path.exists(acc_path):
        print(f"Error: Accommodation source not found at {acc_path}")
        sys.exit(1)
    if not os.path.exists(demand_path):
        demand_path = os.path.join(base_dir, 'dataset', 'tourism_demand_state.csv')
        if not os.path.exists(demand_path):
            print(f"Error: Tourism demand dataset not found at {demand_path}")
            sys.exit(1)

    print("Step 1: Loading accommodation dataset...")
    df_raw = pd.read_excel(acc_path)
    print(f"Loaded {len(df_raw)} records across years {df_raw['year'].unique().tolist()}")

    # Build raw dataset preserving historical values
    df_raw_clean = df_raw.rename(columns={
        'hotels': 'accommodation_establishments',
        'rooms': 'accommodation_rooms'
    })[['state', 'year', 'accommodation_establishments', 'accommodation_rooms', 'aor_pct']].copy()

    # Normalize state names in raw table
    df_raw_clean['state'] = df_raw_clean['state'].apply(normalize_state)

    # Step 2: Extract latest capacity stock (Year: 2024)
    latest_year = int(df_raw['year'].max())
    print(f"Step 2: Extracting latest capacity stock (Year: {latest_year})...")
    
    # Filter to single reference year (no time series)
    df_raw_latest = df_raw_clean[df_raw_clean['year'] == latest_year].copy()
    df_raw_clean = df_raw_latest
    
    # Target standardized schema
    df_capacity = pd.DataFrame({
        'state': df_raw_latest['state'],
        'year': df_raw_latest['year'].astype(int),
        'accommodation_establishments': df_raw_latest['accommodation_establishments'].astype(int),
        'accommodation_rooms': df_raw_latest['accommodation_rooms'].astype(int)
    }).sort_values(by='accommodation_rooms', ascending=False).reset_index(drop=True)

    # Step 3: Validation Checks
    print("\n--- Running Validation Checks on Accommodation Capacity ---")
    assert len(df_capacity) == 16, f"Expected 16 states, got {len(df_capacity)}"
    missing = set(CANONICAL_STATES) - set(df_capacity['state'])
    assert len(missing) == 0, f"Missing canonical states: {missing}"
    print("[PASS] Check 1: Exactly 16 canonical states present.")

    assert df_capacity['state'].nunique() == 16, "Duplicate state entries detected!"
    print("[PASS] Check 2: All 16 states are strictly unique.")

    assert df_capacity.isnull().sum().sum() == 0, "Null values detected!"
    print("[PASS] Check 3: Zero null or missing values across all columns.")

    assert (df_capacity['accommodation_establishments'] > 0).all(), "Non-positive establishments found!"
    assert (df_capacity['accommodation_rooms'] > 0).all(), "Non-positive rooms found!"
    print("[PASS] Check 4: Establishments and rooms are strictly positive.")

    # Logical consistency: rooms >= establishments
    assert (df_capacity['accommodation_rooms'] >= df_capacity['accommodation_establishments']).all(), \
        "Logical inconsistency: establishments exceed rooms!"
    print("[PASS] Check 5: Logical consistency verified (rooms >= establishments for all states).")

    # Step 4: Derived Demand Pressure Indicator (Visitor-to-Room Ratio)
    print("\nStep 4: Computing Derived Visitor-to-Room Ratio...")
    df_demand = pd.read_csv(demand_path)
    df_merged = pd.merge(df_demand[['state', 'domestic_visitors']], df_capacity[['state', 'accommodation_rooms']], on='state', how='inner')
    
    df_merged['visitor_to_room_ratio'] = (df_merged['domestic_visitors'] / df_merged['accommodation_rooms']).round(2)
    df_merged['demand_pressure_rank'] = df_merged['visitor_to_room_ratio'].rank(ascending=False, method='min').astype(int)
    df_pressure = df_merged.sort_values(by='visitor_to_room_ratio', ascending=False).reset_index(drop=True)

    # Step 5: Save Datasets
    out_dirs = [
        os.path.join(base_dir, 'dataset'),
        os.path.join(base_dir, 'finalized_dataset')
    ]

    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        raw_csv = os.path.join(d, 'accommodation_capacity_raw.csv')
        clean_csv = os.path.join(d, 'accommodation_capacity_state.csv')
        pressure_csv = os.path.join(d, 'accommodation_demand_pressure_state.csv')

        df_raw_clean.to_csv(raw_csv, index=False, encoding='utf-8')
        df_capacity.to_csv(clean_csv, index=False, encoding='utf-8')
        df_pressure.to_csv(pressure_csv, index=False, encoding='utf-8')

        print(f"Saved: {raw_csv}")
        print(f"Saved: {clean_csv}")
        print(f"Saved: {pressure_csv}")

    print("\n=== Accommodation Capacity Summary (Latest Year: 2024) ===")
    print(df_capacity.to_string(index=False))

    print("\n=== Derived Visitor-to-Room Ratio (Demand Pressure) ===")
    print(df_pressure.to_string(index=False))

if __name__ == '__main__':
    main()
