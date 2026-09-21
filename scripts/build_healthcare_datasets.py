"""
Malaysia Healthcare & Tourism Accessibility Dataset Builder
-----------------------------------------------------------
1. Downloads primary source hospital bed capacity and bed occupancy datasets:
   - Ministry of Health Malaysia (KKMNOW): State-level bed occupancy & utilisation (bedutil_state.csv)
   - Ministry of Health Malaysia (KKMNOW): Facility-level bed occupancy & utilisation (bedutil_facility.csv)
   - data.gov.my: Hospital beds by state, district, and type (hospital_beds API)

2. Generates the Tourism Healthcare Accessibility Dataset (tourism_healthcare_accessibility.csv & .json):
   - Measures proximity from all 5,491 core tourism assets to 4,749 healthcare facilities (Hospitals, Clinics, Pharmacies).
   - Uses sub-decimetre metric Azimuthal Equidistant projection (AEQD) and Shapely STRtree.
   - Computes distances to nearest overall healthcare facility, nearest hospital, nearest clinic, and nearest pharmacy.
   - Classifies access tiers for primary and emergency care.
   - Computes state-level healthcare accessibility benchmarks.

Outputs saved to:
  - finalized_dataset/
  - dataset/
"""

import os
import sys
import json
import requests
import numpy as np
import pandas as pd
from pyproj import Transformer
from shapely.geometry import Point
from shapely.strtree import STRtree

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN_DIR = os.path.join(BASE_DIR, "finalized_dataset")
DATA_DIR = os.path.join(BASE_DIR, "dataset")
os.makedirs(FIN_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Sources
MOH_BEDUTIL_STATE_URL = "https://raw.githubusercontent.com/MoH-Malaysia/data-resources-public/main/bedutil_state.csv"
MOH_BEDUTIL_FACILITY_URL = "https://raw.githubusercontent.com/MoH-Malaysia/data-resources-public/main/bedutil_facility.csv"
DATA_GOV_MY_BEDS_API = "https://api.data.gov.my/data-catalogue?id=hospital_beds"

# Metric projection centered on Malaysia
PROJ_AEQD = "+proj=aeqd +lat_0=4.0 +lon_0=109.5 +datum=WGS84 +units=m"
transformer = Transformer.from_crs("EPSG:4326", PROJ_AEQD, always_xy=True)


def download_primary_healthcare_datasets():
    print("=" * 70)
    print("STEP 1: FETCHING PRIMARY SOURCE HOSPITAL DATASETS (MOH / DATA.GOV.MY)")
    print("=" * 70)

    # 1. State-level Bed Utilisation from MOH / KKMNOW
    print(f"Fetching state bed utilisation from: {MOH_BEDUTIL_STATE_URL}")
    r_state = requests.get(MOH_BEDUTIL_STATE_URL, timeout=15)
    r_state.raise_for_status()
    df_state = pd.read_csv(pd.io.common.StringIO(r_state.text))

    # Add calculated total beds and overall utilisation rate
    df_state["total_beds"] = df_state["beds_nonicu"].fillna(0) + df_state["beds_icu"].fillna(0)
    df_state["util_overall_pct"] = np.where(
        df_state["total_beds"] > 0,
        (
            (df_state["beds_nonicu"].fillna(0) * df_state["util_nonicu"].fillna(0))
            + (df_state["beds_icu"].fillna(0) * df_state["util_icu"].fillna(0))
        )
        / df_state["total_beds"],
        0.0,
    ).round(2)

    # Save to finalized_dataset and dataset
    state_csv_fin = os.path.join(FIN_DIR, "hospital_bed_occupancy_state.csv")
    state_json_fin = os.path.join(FIN_DIR, "hospital_bed_occupancy_state.json")
    state_csv_data = os.path.join(DATA_DIR, "hospital_bed_occupancy_state.csv")
    state_json_data = os.path.join(DATA_DIR, "hospital_bed_occupancy_state.json")

    df_state.to_csv(state_csv_fin, index=False, encoding="utf-8")
    df_state.to_json(state_json_fin, orient="records", indent=2)
    df_state.to_csv(state_csv_data, index=False, encoding="utf-8")
    df_state.to_json(state_json_data, orient="records", indent=2)
    print(f"Saved: {state_csv_fin} ({len(df_state)} rows)")

    # 2. Facility-level Bed Utilisation from MOH / KKMNOW
    print(f"\nFetching facility bed utilisation from: {MOH_BEDUTIL_FACILITY_URL}")
    r_facility = requests.get(MOH_BEDUTIL_FACILITY_URL, timeout=15)
    r_facility.raise_for_status()
    df_facility = pd.read_csv(pd.io.common.StringIO(r_facility.text))

    # Add total beds
    df_facility["total_beds"] = df_facility["beds_nonicu"].fillna(0) + df_facility["beds_icu"].fillna(0)

    fac_csv_fin = os.path.join(FIN_DIR, "hospital_bed_occupancy_facility.csv")
    fac_json_fin = os.path.join(FIN_DIR, "hospital_bed_occupancy_facility.json")
    fac_csv_data = os.path.join(DATA_DIR, "hospital_bed_occupancy_facility.csv")
    fac_json_data = os.path.join(DATA_DIR, "hospital_bed_occupancy_facility.json")

    df_facility.to_csv(fac_csv_fin, index=False, encoding="utf-8")
    df_facility.to_json(fac_json_fin, orient="records", indent=2)
    df_facility.to_csv(fac_csv_data, index=False, encoding="utf-8")
    df_facility.to_json(fac_json_data, orient="records", indent=2)
    print(f"Saved: {fac_csv_fin} ({len(df_facility)} facilities)")

    # 3. data.gov.my Official Hospital Beds Catalogue
    try:
        print(f"\nFetching hospital beds time-series from data.gov.my API...")
        r_datagov = requests.get(DATA_GOV_MY_BEDS_API, timeout=15)
        if r_datagov.status_code == 200:
            df_datagov = pd.DataFrame(r_datagov.json())
            gov_csv_fin = os.path.join(FIN_DIR, "hospital_beds_by_state_type.csv")
            gov_csv_data = os.path.join(DATA_DIR, "hospital_beds_by_state_type.csv")
            df_datagov.to_csv(gov_csv_fin, index=False, encoding="utf-8")
            df_datagov.to_csv(gov_csv_data, index=False, encoding="utf-8")
            print(f"Saved: {gov_csv_fin} ({len(df_datagov)} records)")
    except Exception as e:
        print(f"Note: Could not reach data.gov.my API ({e}), proceeding with MOH dataset.")

    return df_state, df_facility


def assign_healthcare_access_tier(distance_km):
    """
    General Healthcare Accessibility (walkable or short drive to primary/urgent care):
      <= 2.0 km: High Access (Immediate vicinity)
      2.0 - 5.0 km: Moderate Access (Short transit / drive)
      5.0 - 10.0 km: Limited Access (Extended transit)
      > 10.0 km: Low Access (Remote)
    """
    if distance_km <= 2.0:
        return "High Access"
    elif distance_km <= 5.0:
        return "Moderate Access"
    elif distance_km <= 10.0:
        return "Limited Access"
    else:
        return "Low Access"


def assign_hospital_emergency_tier(distance_km):
    """
    Hospital Emergency Care Accessibility (golden hour travel distance):
      <= 5.0 km: High Emergency Access (Within 10-15 mins)
      5.0 - 15.0 km: Moderate Emergency Access (Within 20-30 mins)
      15.0 - 30.0 km: Limited Emergency Access (30-60 mins)
      > 30.0 km: Remote Emergency Access (> 60 mins)
    """
    if distance_km <= 5.0:
        return "High Emergency Access"
    elif distance_km <= 15.0:
        return "Moderate Emergency Access"
    elif distance_km <= 30.0:
        return "Limited Emergency Access"
    else:
        return "Remote Emergency Access"


def clean_and_prepare_healthcare_data(df_supp):
    # Filter to Essential Services (hospitals, clinics, pharmacies)
    hc_df = df_supp[df_supp["category"] == "Essential Services"].copy()

    # Drop invalid coordinates
    hc_df = hc_df.dropna(subset=["lat", "lon"])
    hc_df = hc_df[
        (hc_df["lat"] >= 0.5)
        & (hc_df["lat"] <= 8.5)
        & (hc_df["lon"] >= 99.0)
        & (hc_df["lon"] <= 120.0)
    ]

    # Standardize subcategory
    def clean_subcat(val):
        val_str = str(val).strip()
        if val_str in ["Hospital", "Clinic", "Pharmacy"]:
            return val_str
        elif "hospital" in val_str.lower():
            return "Hospital"
        elif "clinic" in val_str.lower():
            return "Clinic"
        elif "pharmacy" in val_str.lower():
            return "Pharmacy"
        return "Clinic"

    hc_df["std_type"] = hc_df["subcategory"].apply(clean_subcat)

    # Standardize display name
    def get_display_name(row):
        for col in ["name_en", "name", "name_ms"]:
            val = str(row.get(col, "")).strip()
            if val and val != "nan" and val != "":
                return val
        return f"Unnamed {row['std_type']}"

    hc_df["display_name"] = hc_df.apply(get_display_name, axis=1)

    # Deduplicate
    hc_df = hc_df.drop_duplicates(subset=["asset_id"])
    hc_df = hc_df.drop_duplicates(subset=["std_type", "lat", "lon"])

    # Project to metric coordinates
    x_coords, y_coords = transformer.transform(hc_df["lon"].values, hc_df["lat"].values)
    hc_df["x"] = x_coords
    hc_df["y"] = y_coords
    hc_df["geom"] = [Point(x, y) for x, y in zip(x_coords, y_coords)]

    print(f"\nPrepared {len(hc_df):,} cleaned healthcare facilities:")
    print(hc_df["std_type"].value_counts().to_string())

    return hc_df


def build_healthcare_accessibility_dataset():
    print("\n" + "=" * 70)
    print("STEP 2: BUILDING TOURISM HEALTHCARE ACCESSIBILITY DATASET")
    print("=" * 70)

    # Locate tourism assets and supporting assets
    assets_csv = os.path.join(FIN_DIR, "tourism_asset_coverage.csv")
    if not os.path.exists(assets_csv):
        assets_csv = os.path.join(DATA_DIR, "tourism_asset_coverage.csv")

    supp_csv = os.path.join(FIN_DIR, "tourism_supporting_assets.csv")
    if not os.path.exists(supp_csv):
        supp_csv = os.path.join(DATA_DIR, "tourism_supporting_assets.csv")

    df_assets = pd.read_csv(assets_csv)
    df_supp = pd.read_csv(supp_csv, low_memory=False)
    print(f"Loaded {len(df_assets):,} core tourism assets.")

    # Prepare healthcare facilities
    hc_df = clean_and_prepare_healthcare_data(df_supp)

    # Build subsets
    hosp_df = hc_df[hc_df["std_type"] == "Hospital"].copy().reset_index(drop=True)
    clinic_df = hc_df[hc_df["std_type"] == "Clinic"].copy().reset_index(drop=True)
    pharm_df = hc_df[hc_df["std_type"] == "Pharmacy"].copy().reset_index(drop=True)
    all_hc_df = hc_df.copy().reset_index(drop=True)

    print("\nBuilding metric spatial indices (STRtree)...")
    tree_all = STRtree(all_hc_df["geom"].tolist())
    tree_hosp = STRtree(hosp_df["geom"].tolist())
    tree_clinic = STRtree(clinic_df["geom"].tolist())
    tree_pharm = STRtree(pharm_df["geom"].tolist())

    # Project tourism assets
    asset_x, asset_y = transformer.transform(df_assets["lon"].values, df_assets["lat"].values)
    df_assets["x"] = asset_x
    df_assets["y"] = asset_y

    results = []
    print(f"Calculating nearest healthcare facility distances for {len(df_assets):,} assets...")

    for i, row in df_assets.iterrows():
        pt = Point(row["x"], row["y"])

        # 1. Nearest Overall Healthcare Facility
        idx_all = tree_all.nearest(pt)
        m_all = all_hc_df.iloc[idx_all]
        dist_hc_m = round(pt.distance(m_all["geom"]), 1)
        dist_hc_km = round(dist_hc_m / 1000.0, 3)

        # 2. Nearest Hospital
        idx_hosp = tree_hosp.nearest(pt)
        m_hosp = hosp_df.iloc[idx_hosp]
        dist_hosp_km = round(pt.distance(m_hosp["geom"]) / 1000.0, 3)

        # 3. Nearest Clinic
        idx_clinic = tree_clinic.nearest(pt)
        m_clinic = clinic_df.iloc[idx_clinic]
        dist_clinic_km = round(pt.distance(m_clinic["geom"]) / 1000.0, 3)

        # 4. Nearest Pharmacy
        idx_pharm = tree_pharm.nearest(pt)
        m_pharm = pharm_df.iloc[idx_pharm]
        dist_pharm_km = round(pt.distance(m_pharm["geom"]) / 1000.0, 3)

        # Determine asset display name
        asset_name = str(row.get("name_en", "")).strip()
        if not asset_name or asset_name == "nan":
            asset_name = str(row.get("name", "")).strip()
        if not asset_name or asset_name == "nan":
            asset_name = f"Unnamed Asset {row['asset_id']}"

        results.append({
            "asset_id": row["asset_id"],
            "asset_name": asset_name,
            "category": row.get("category", "Tourism"),
            "state": row.get("state", "Unknown"),
            "district": row.get("district", "Unknown"),
            "lat": round(row["lat"], 6),
            "lon": round(row["lon"], 6),
            "nearest_healthcare_name": m_all["display_name"],
            "nearest_healthcare_type": m_all["std_type"],
            "distance_to_healthcare_m": dist_hc_m,
            "distance_to_healthcare_km": dist_hc_km,
            "nearest_hospital_name": m_hosp["display_name"],
            "distance_to_hospital_km": dist_hosp_km,
            "nearest_clinic_name": m_clinic["display_name"],
            "distance_to_clinic_km": dist_clinic_km,
            "nearest_pharmacy_name": m_pharm["display_name"],
            "distance_to_pharmacy_km": dist_pharm_km,
            "healthcare_access_tier": assign_healthcare_access_tier(dist_hc_km),
            "hospital_access_tier": assign_hospital_emergency_tier(dist_hosp_km),
        })

    df_out = pd.DataFrame(results)

    # Save to finalized_dataset & dataset
    out_csv_fin = os.path.join(FIN_DIR, "tourism_healthcare_accessibility.csv")
    out_json_fin = os.path.join(FIN_DIR, "tourism_healthcare_accessibility.json")
    out_csv_data = os.path.join(DATA_DIR, "tourism_healthcare_accessibility.csv")
    out_json_data = os.path.join(DATA_DIR, "tourism_healthcare_accessibility.json")

    df_out.to_csv(out_csv_fin, index=False, encoding="utf-8")
    df_out.to_json(out_json_fin, orient="records", indent=2)
    df_out.to_csv(out_csv_data, index=False, encoding="utf-8")
    df_out.to_json(out_json_data, orient="records", indent=2)

    print(f"\nSaved {len(df_out):,} rows to:")
    print(f"  - {out_csv_fin}")
    print(f"  - {out_json_fin}")

    # Generate State-Level Healthcare Accessibility Summary
    print("\n" + "=" * 70)
    print("STEP 3: COMPUTING STATE HEALTHCARE ACCESSIBILITY SUMMARY")
    print("=" * 70)

    df_out["is_hc_access_5km"] = df_out["distance_to_healthcare_km"] <= 5.0
    df_out["is_hosp_access_15km"] = df_out["distance_to_hospital_km"] <= 15.0

    state_summary = []
    for state, group in df_out.groupby("state"):
        tot = len(group)
        hc_acc = group["is_hc_access_5km"].sum()
        hosp_acc = group["is_hosp_access_15km"].sum()
        state_summary.append({
            "state": state,
            "core_tourism_assets": tot,
            "healthcare_access_rate_5km": round((hc_acc / tot) * 100, 2),
            "hospital_access_rate_15km": round((hosp_acc / tot) * 100, 2),
            "avg_dist_to_healthcare_km": round(group["distance_to_healthcare_km"].mean(), 2),
            "median_dist_to_healthcare_km": round(group["distance_to_healthcare_km"].median(), 2),
            "avg_dist_to_hospital_km": round(group["distance_to_hospital_km"].mean(), 2),
            "median_dist_to_hospital_km": round(group["distance_to_hospital_km"].median(), 2),
            "high_access_pct": round((group["healthcare_access_tier"] == "High Access").sum() / tot * 100, 2),
            "low_access_pct": round((group["healthcare_access_tier"] == "Low Access").sum() / tot * 100, 2),
        })

    df_state_sum = pd.DataFrame(state_summary).sort_values("healthcare_access_rate_5km", ascending=False)
    summary_csv_fin = os.path.join(FIN_DIR, "tourism_healthcare_accessibility_state.csv")
    summary_json_fin = os.path.join(FIN_DIR, "tourism_healthcare_accessibility_state.json")
    summary_csv_data = os.path.join(DATA_DIR, "tourism_healthcare_accessibility_state.csv")
    summary_json_data = os.path.join(DATA_DIR, "tourism_healthcare_accessibility_state.json")

    df_state_sum.to_csv(summary_csv_fin, index=False, encoding="utf-8")
    df_state_sum.to_json(summary_json_fin, orient="records", indent=2)
    df_state_sum.to_csv(summary_csv_data, index=False, encoding="utf-8")
    df_state_sum.to_json(summary_json_data, orient="records", indent=2)

    print(f"Saved state healthcare accessibility summary to: {summary_csv_fin}")
    print("\nState Healthcare Summary Table:")
    print(df_state_sum.to_string(index=False))

    return df_out, df_state_sum


if __name__ == "__main__":
    download_primary_healthcare_datasets()
    build_healthcare_accessibility_dataset()
    print("\nAll datasets built and stored in finalized_dataset/ successfully!")
