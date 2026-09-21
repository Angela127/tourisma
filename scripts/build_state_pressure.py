"""
Tourisma — State Pressure Dataset Builder

Generates:
- dataset/tourisma_state_pressure.csv
- finalized_dataset/tourisma_state_pressure.csv

Exact Schema (14 columns):
state,reference_year,demand_score,readiness_score,domestic_visitors,international_hotel_guests,domestic_receipts_rm_million,aor_pct,visitor_to_room_ratio,road_access_rate,pt_access_rate,environmental_exposure_rate,terrestrial_exposure_rate,marine_exposure_rate

Core Components:
1. Contextual Demand & Readiness:
   - demand_score (0-100)
   - readiness_score (0-100)
   - domestic_visitors
   - international_hotel_guests
   - domestic_receipts_rm_million

2. Accommodation Pressure:
   - aor_pct: Official Tourism Malaysia Average Occupancy Rate % (actual capacity utilization)
   - visitor_to_room_ratio: domestic_visitors / accommodation_rooms (demand-to-capacity proxy, NOT hotel occupancy)

3. Accessibility Pressure:
   - road_access_rate: % of mapped core tourism assets within 1 km of main road network
   - pt_access_rate: % of mapped core tourism assets within 1 km of public transport

4. Environmental Exposure (Described strictly as "exposure", NOT "damage"):
   - environmental_exposure_rate: Total % of assets inside or near (<= 1 km) protected areas
   - terrestrial_exposure_rate: % of assets inside or near land protected areas
   - marine_exposure_rate: % of assets inside or near marine protected areas

Sources:
- finalized_dataset/tourisma_state_scores.csv
- finalized_dataset/tourisma_state_master.csv
"""

import os
import sys
import pandas as pd

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fin_dir = os.path.join(base_dir, 'finalized_dataset')
    data_dir = os.path.join(base_dir, 'dataset')

    master_path = os.path.join(fin_dir, 'tourisma_state_master.csv')
    scores_path = os.path.join(fin_dir, 'tourisma_state_scores.csv')

    if not os.path.exists(master_path):
        master_path = os.path.join(data_dir, 'tourisma_state_master.csv')
    if not os.path.exists(scores_path):
        scores_path = os.path.join(data_dir, 'tourisma_state_scores.csv')

    if not os.path.exists(master_path) or not os.path.exists(scores_path):
        print(f"Error: Required source files missing ({master_path} or {scores_path})")
        sys.exit(1)

    print(f"Step 1: Loading input datasets...")
    df_master = pd.read_csv(master_path)
    df_scores = pd.read_csv(scores_path)

    assert len(df_master) == 16, f"Expected 16 states in master, got {len(df_master)}"
    assert len(df_scores) == 16, f"Expected 16 states in scores, got {len(df_scores)}"

    print("Step 2: Merging scores with pressure and exposure dimensions...")
    merged = pd.merge(
        df_scores[['state', 'reference_year', 'demand_score', 'readiness_score']],
        df_master[['state', 'domestic_visitors', 'international_hotel_guests', 'domestic_receipts_rm_million',
                   'aor_pct', 'visitor_to_room_ratio', 'road_access_rate', 'pt_access_rate',
                   'environmental_exposure_rate', 'terrestrial_exposure_rate', 'marine_exposure_rate']],
        on='state',
        how='inner'
    )

    target_cols = [
        'state',
        'reference_year',
        'demand_score',
        'readiness_score',
        'domestic_visitors',
        'international_hotel_guests',
        'domestic_receipts_rm_million',
        'aor_pct',
        'visitor_to_room_ratio',
        'road_access_rate',
        'pt_access_rate',
        'environmental_exposure_rate',
        'terrestrial_exposure_rate',
        'marine_exposure_rate'
    ]

    df_pressure = merged[target_cols].sort_values(by='demand_score', ascending=False).reset_index(drop=True)

    print("\n--- Running Quality Checks on Pressure Dataset ---")
    assert len(df_pressure) == 16, f"Expected 16 states, got {len(df_pressure)}"
    assert df_pressure['state'].nunique() == 16, "Duplicate states detected!"
    assert df_pressure.isnull().sum().sum() == 0, "Null or NaN values detected!"
    assert len(df_pressure.columns) == 14, f"Expected 14 columns, got {len(df_pressure.columns)}"
    print("[PASS] Check 1: Exactly 16 unique states, 14 columns, zero null values.")

    # Bound checks
    assert (df_pressure['demand_score'] >= 0).all() and (df_pressure['demand_score'] <= 100).all()
    assert (df_pressure['readiness_score'] >= 0).all() and (df_pressure['readiness_score'] <= 100).all()
    assert (df_pressure['aor_pct'] >= 0).all() and (df_pressure['aor_pct'] <= 100).all()
    assert (df_pressure['visitor_to_room_ratio'] > 0).all()
    assert (df_pressure['road_access_rate'] >= 0).all() and (df_pressure['road_access_rate'] <= 100).all()
    assert (df_pressure['pt_access_rate'] >= 0).all() and (df_pressure['pt_access_rate'] <= 100).all()
    assert (df_pressure['environmental_exposure_rate'] >= 0).all() and (df_pressure['environmental_exposure_rate'] <= 100).all()
    assert (df_pressure['terrestrial_exposure_rate'] >= 0).all() and (df_pressure['terrestrial_exposure_rate'] <= 100).all()
    assert (df_pressure['marine_exposure_rate'] >= 0).all() and (df_pressure['marine_exposure_rate'] <= 100).all()
    print("[PASS] Check 2: All rates and ratios strictly within valid mathematical bounds.")

    # Save to dataset and finalized_dataset
    for out_d in [data_dir, fin_dir]:
        os.makedirs(out_d, exist_ok=True)
        out_path = os.path.join(out_d, 'tourisma_state_pressure.csv')
        df_pressure.to_csv(out_path, index=False, encoding='utf-8')
        print(f"Saved: {out_path}")

    print("\n=== tourisma_state_pressure.csv Preview ===")
    print(df_pressure.to_string(index=False))

if __name__ == '__main__':
    main()
