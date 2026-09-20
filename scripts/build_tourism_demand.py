"""
Tourisma — State-Level Tourism Demand Dataset Builder

Generates:
1. dataset/tourism_demand_state.csv & finalized_dataset/tourism_demand_state.csv
   Standardized 5-column schema:
   - state (String)
   - domestic_visitors (Integer)
   - international_hotel_guests (Integer)
   - domestic_receipts_rm_million (Float, 2 decimals)
   - average_length_of_stay_nights (Float, 2 decimals)

2. dataset/tourism_demand_indicators_state.csv & finalized_dataset/tourism_demand_indicators_state.csv
   Derived analytical dataset with state rankings for downstream index modeling.

Sources:
- Domestic metrics: DOSM Domestic Tourism Survey 2025 (via dataset/Datasets/consolidated_domestic_tourism.xlsx)
- International metrics: Tourism Malaysia Paid Accommodation Survey Jan-Dec 2025 (via clustering/hotel_guests.xlsx)
"""

import os
import sys
import pandas as pd

# Canonical 16-state Tourisma naming convention
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
    if cleaned in STATE_MAPPING:
        return STATE_MAPPING[cleaned]
    # Fallback title case
    return str(name).strip().title()

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dts_path = os.path.join(base_dir, 'dataset', 'Datasets', 'consolidated_domestic_tourism.xlsx')
    hg_path = os.path.join(base_dir, 'clustering', 'hotel_guests.xlsx')

    if not os.path.exists(dts_path):
        print(f"Error: DTS source file not found at {dts_path}")
        sys.exit(1)
    if not os.path.exists(hg_path):
        print(f"Error: Hotel Guests source file not found at {hg_path}")
        sys.exit(1)

    print("Step 1: Loading input datasets...")
    # 1. Domestic Tourism Survey
    df_dts = pd.read_excel(dts_path)
    df_dts_2025 = df_dts[df_dts['Year'] == 2025].copy()
    df_dts_2025['norm_state'] = df_dts_2025['State'].apply(normalize_state)

    # 2. International Hotel Guests
    df_hg = pd.read_excel(hg_path)
    df_hg_2025 = df_hg[df_hg['year'] == 2025].copy()
    df_hg_2025['norm_state'] = df_hg_2025['state'].apply(normalize_state)

    print(f"Loaded DTS 2025 rows: {len(df_dts_2025)}, Hotel Guests 2025 rows: {len(df_hg_2025)}")

    # Step 2: Merge on normalized state
    print("Step 2: Merging data on canonical state names...")
    merged = pd.merge(
        df_dts_2025,
        df_hg_2025[['norm_state', 'international_guests']],
        on='norm_state',
        how='outer'
    )

    # Step 3: Build Standardized Output
    print("Step 3: Formatting fields according to schema...")
    df_demand = pd.DataFrame({
        'state': merged['norm_state'],
        'domestic_visitors': (merged['Domestic visitor arrivals (000)'] * 1000).round().astype(int),
        'international_hotel_guests': merged['international_guests'].astype(int),
        'domestic_receipts_rm_million': merged['Domestic tourism expenditure (RM million)'].round(2),
        'average_length_of_stay_nights': merged['Average length of stay (nights)'].round(2)
    }).sort_values(by='domestic_visitors', ascending=False).reset_index(drop=True)

    # Step 4: Quality Control & Validation Checks
    print("\n--- Running Quality Control Checks ---")
    # Check 1: State completeness (exactly 16 states)
    assert len(df_demand) == 16, f"Expected 16 states, got {len(df_demand)}"
    missing_states = set(CANONICAL_STATES) - set(df_demand['state'])
    assert len(missing_states) == 0, f"Missing canonical states: {missing_states}"
    print("[PASS] Check 1: Exactly 16 canonical states present.")

    # Check 2: Uniqueness
    assert df_demand['state'].nunique() == 16, "Duplicate state entries detected!"
    print("[PASS] Check 2: All 16 states are strictly unique.")

    # Check 3: Missing values
    assert df_demand.isnull().sum().sum() == 0, "Null or NaN values detected in dataset!"
    print("[PASS] Check 3: Zero null or missing values across all columns.")

    # Check 4: Numeric constraints
    assert (df_demand['domestic_visitors'] >= 0).all(), "Negative domestic visitor count!"
    assert (df_demand['international_hotel_guests'] >= 0).all(), "Negative international hotel guests!"
    assert (df_demand['domestic_receipts_rm_million'] >= 0).all(), "Negative receipts!"
    assert (df_demand['average_length_of_stay_nights'] > 0).all(), "Non-positive length of stay!"
    print("[PASS] Check 4: All numeric constraints verified.")

    # Check 5: Methodological verification (No combined total_visitors column)
    assert 'total_visitors' not in df_demand.columns, "Total visitors column must NOT be created!"
    print("[PASS] Check 5: Methodological rule upheld (domestic and international remain separate).")

    # Step 5: Create Derived Analytical Dataset
    print("\nStep 5: Generating derived analytical indicators with state rankings...")
    df_indicators = df_demand.copy()
    df_indicators['domestic_visitors_rank'] = df_indicators['domestic_visitors'].rank(ascending=False, method='min').astype(int)
    df_indicators['international_hotel_guests_rank'] = df_indicators['international_hotel_guests'].rank(ascending=False, method='min').astype(int)
    df_indicators['domestic_receipts_rank'] = df_indicators['domestic_receipts_rm_million'].rank(ascending=False, method='min').astype(int)
    df_indicators['average_length_of_stay_rank'] = df_indicators['average_length_of_stay_nights'].rank(ascending=False, method='min').astype(int)

    # Output paths
    out_dirs = [
        os.path.join(base_dir, 'dataset'),
        os.path.join(base_dir, 'finalized_dataset')
    ]

    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        raw_csv = os.path.join(d, 'tourism_demand_state.csv')
        ind_csv = os.path.join(d, 'tourism_demand_indicators_state.csv')
        
        df_demand.to_csv(raw_csv, index=False, encoding='utf-8')
        df_indicators.to_csv(ind_csv, index=False, encoding='utf-8')
        print(f"Saved: {raw_csv}")
        print(f"Saved: {ind_csv}")

    print("\n=== Finalized Tourism Demand Dataset Summary ===")
    print(df_demand.to_string(index=False))

if __name__ == '__main__':
    main()
