import json
import re
import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN_DIR = os.path.join(BASE_DIR, "finalized_dataset")

# 1. Load Geo Data
with open(os.path.join(BASE_DIR, 'src', 'data', 'malaysiaGeoGenerated.json'), 'r', encoding='utf-8') as f:
    geo_list = json.load(f)

state_id_to_geo = {g['id']: g for g in geo_list}

state_name_to_id = {
    'Johor': 'johor',
    'Kedah': 'kedah',
    'Kelantan': 'kelantan',
    'Melaka': 'melaka',
    'Negeri Sembilan': 'negeri_sembilan',
    'Pahang': 'pahang',
    'Perak': 'perak',
    'Perlis': 'perlis',
    'Pulau Pinang': 'penang',
    'Sabah': 'sabah',
    'Sarawak': 'sarawak',
    'Selangor': 'selangor',
    'Terengganu': 'terengganu',
    'W.P. Kuala Lumpur': 'kuala_lumpur',
    'W.P. Labuan': 'labuan',
    'W.P. Putrajaya': 'putrajaya'
}

# 2. Load Datasets
df_hosp_state = pd.read_csv(os.path.join(FIN_DIR, 'hospital_bed_occupancy_state.csv'))
df_acc_assets = pd.read_csv(os.path.join(FIN_DIR, 'tourism_healthcare_accessibility.csv'))
df_supp = pd.read_csv(os.path.join(FIN_DIR, 'tourism_supporting_assets.csv'), low_memory=False)
df_hc_supp = df_supp[df_supp['category'] == 'Essential Services'].copy()

# Standardize hc type
def clean_type(val):
    s = str(val).strip()
    if 'hospital' in s.lower():
        return 'Hospital'
    elif 'clinic' in s.lower():
        return 'Clinic'
    elif 'pharmacy' in s.lower():
        return 'Pharmacy'
    return 'Clinic'

df_hc_supp['std_type'] = df_hc_supp['subcategory'].apply(clean_type)

def get_disp_name(row):
    for c in ['name_en', 'name', 'name_ms']:
        v = str(row.get(c, '')).strip()
        if v and v != 'nan':
            return v
    return f"Unnamed {row['std_type']}"

df_hc_supp['display_name'] = df_hc_supp.apply(get_disp_name, axis=1)
df_hc_supp = df_hc_supp.dropna(subset=['lat', 'lon'])
df_hc_supp = df_hc_supp.drop_duplicates(subset=['asset_id'])

# National metrics
malaysia_row = df_hosp_state[df_hosp_state['state'] == 'Malaysia'].iloc[0]
nat_beds = int(malaysia_row['total_beds'])
nat_bor = round(float(malaysia_row['util_overall_pct']), 1)
nat_assets = len(df_acc_assets)
nat_facilities = len(df_hc_supp)
nat_hosp = len(df_hc_supp[df_hc_supp['std_type'] == 'Hospital'])
nat_clinics = len(df_hc_supp[df_hc_supp['std_type'] == 'Clinic'])
nat_pharmacies = len(df_hc_supp[df_hc_supp['std_type'] == 'Pharmacy'])
nat_access_5km = round((df_acc_assets['distance_to_healthcare_km'] <= 5.0).sum() / nat_assets * 100, 1)
nat_access_2km = round((df_acc_assets['distance_to_healthcare_km'] <= 2.0).sum() / nat_assets * 100, 1)

# State-by-state data
state_data_dict = {}

for sname, gid in state_name_to_id.items():
    geo = state_id_to_geo[gid]
    coords = re.findall(r'([\d\.]+)\s+([\d\.]+)', geo['svgPath'])
    xs = [float(x) for x, y in coords]
    ys = [float(y) for x, y in coords]
    svg_min_x, svg_max_x = min(xs), max(xs)
    svg_min_y, svg_max_y = min(ys), max(ys)
    
    # Assets for this state
    sub_assets = df_acc_assets[df_acc_assets['state'] == sname].copy()
    sub_hc = df_hc_supp[df_hc_supp['state'] == sname].copy()
    
    # Hospital beds & utilisation
    hosp_row = df_hosp_state[df_hosp_state['state'] == sname]
    if len(hosp_row) > 0:
        hr = hosp_row.iloc[0]
        beds_total = int(hr['total_beds'])
        beds_nonicu = int(hr['beds_nonicu'])
        beds_icu = int(hr['beds_icu'])
        bor = round(float(hr['util_overall_pct']), 1)
    else:
        beds_total = 0
        beds_nonicu = 0
        beds_icu = 0
        bor = 0.0
        
    num_assets = len(sub_assets)
    num_facilities = len(sub_hc)
    num_hosp = len(sub_hc[sub_hc['std_type'] == 'Hospital'])
    num_clinic = len(sub_hc[sub_hc['std_type'] == 'Clinic'])
    num_pharm = len(sub_hc[sub_hc['std_type'] == 'Pharmacy'])
    
    # Access rates
    hc_5km_pct = round((sub_assets['distance_to_healthcare_km'] <= 5.0).sum() / max(1, num_assets) * 100, 1)
    hosp_15km_pct = round((sub_assets['distance_to_hospital_km'] <= 15.0).sum() / max(1, num_assets) * 100, 1)
    
    avg_dist_hc = round(sub_assets['distance_to_healthcare_km'].mean(), 1)
    med_dist_hc = round(sub_assets['distance_to_healthcare_km'].median(), 1)
    avg_dist_hosp = round(sub_assets['distance_to_hospital_km'].mean(), 1)
    med_dist_hosp = round(sub_assets['distance_to_hospital_km'].median(), 1)
    
    # 1. Primary care tiers: <=2km (High), 2-5km (Mod), >5km (Lim)
    p_high = (sub_assets['distance_to_healthcare_km'] <= 2.0).sum()
    p_mod = ((sub_assets['distance_to_healthcare_km'] > 2.0) & (sub_assets['distance_to_healthcare_km'] <= 5.0)).sum()
    p_lim = (sub_assets['distance_to_healthcare_km'] > 5.0).sum()
    
    # 2. Hospital Emergency tiers: <=5km (High), 5-15km (Mod), >15km (Lim)
    e_high = (sub_assets['distance_to_hospital_km'] <= 5.0).sum()
    e_mod = ((sub_assets['distance_to_hospital_km'] > 5.0) & (sub_assets['distance_to_hospital_km'] <= 15.0)).sum()
    e_lim = (sub_assets['distance_to_hospital_km'] > 15.0).sum()
    
    # Coordinate bounding box for mapping
    # To project points inside state SVG:
    # Use real geographic bounds for this state with a slight margin
    all_lons = list(sub_assets['lon']) + list(sub_hc['lon'])
    all_lats = list(sub_assets['lat']) + list(sub_hc['lat'])
    if all_lons and all_lats:
        lon_min, lon_max = min(all_lons), max(all_lons)
        lat_min, lat_max = min(all_lats), max(all_lats)
        # expand by 3%
        lon_pad = max(0.01, (lon_max - lon_min) * 0.03)
        lat_pad = max(0.01, (lat_max - lat_min) * 0.03)
        lon_min -= lon_pad
        lon_max += lon_pad
        lat_min -= lat_pad
        lat_max += lat_pad
    else:
        lon_min, lon_max = 100.0, 104.0
        lat_min, lat_max = 1.0, 6.0
        
    def project_pt(lon, lat):
        # lon -> X, lat -> Y (inverted)
        fx = (lon - lon_min) / max(0.0001, (lon_max - lon_min))
        fy = (lat_max - lat) / max(0.0001, (lat_max - lat_min))
        # map to [svg_min_x + pad, svg_max_x - pad]
        pad_x = (svg_max_x - svg_min_x) * 0.05
        pad_y = (svg_max_y - svg_min_y) * 0.05
        px = (svg_min_x + pad_x) + fx * (svg_max_x - svg_min_x - 2 * pad_x)
        py = (svg_min_y + pad_y) + fy * (svg_max_y - svg_min_y - 2 * pad_y)
        return round(px, 2), round(py, 2)
        
    # Project tourism assets
    asset_list = []
    for _, a in sub_assets.iterrows():
        px, py = project_pt(a['lon'], a['lat'])
        asset_list.append({
            'id': str(a['asset_id']),
            'name': str(a['asset_name']),
            'category': str(a['category']),
            'x': px,
            'y': py,
            'lat': round(float(a['lat']), 4),
            'lon': round(float(a['lon']), 4),
            'nearestFacility': str(a['nearest_healthcare_name']),
            'distKm': round(float(a['distance_to_healthcare_km']), 2),
            'tier': str(a['healthcare_access_tier'])
        })
        
    # Project healthcare facilities
    fac_list = []
    for _, frow in sub_hc.iterrows():
        px, py = project_pt(frow['lon'], frow['lat'])
        fac_list.append({
            'id': str(frow['asset_id']),
            'name': str(frow['display_name']),
            'type': str(frow['std_type']),
            'x': px,
            'y': py,
            'lat': round(float(frow['lat']), 4),
            'lon': round(float(frow['lon']), 4)
        })
        
    state_data_dict[gid] = {
        'stateId': gid,
        'stateName': sname,
        'code': geo['code'],
        'region': geo['region'],
        'coreTourismAssets': num_assets,
        'totalFacilities': num_facilities,
        'hospitals': num_hosp,
        'clinics': num_clinic,
        'pharmacies': num_pharm,
        'totalBeds': beds_total,
        'bedsNonIcu': beds_nonicu,
        'bedsIcu': beds_icu,
        'bedOccupancyRate': bor,
        'healthcareAccessRate5km': hc_5km_pct,
        'hospitalAccessRate15km': hosp_15km_pct,
        'avgDistToHealthcareKm': avg_dist_hc,
        'medianDistToHealthcareKm': med_dist_hc,
        'avgDistToHospitalKm': avg_dist_hosp,
        'medianDistToHospitalKm': med_dist_hosp,
        'primaryAccessTiers': {
            'highPct': round(p_high / max(1, num_assets) * 100, 1),
            'modPct': round(p_mod / max(1, num_assets) * 100, 1),
            'limPct': round(p_lim / max(1, num_assets) * 100, 1),
            'highCount': int(p_high),
            'modCount': int(p_mod),
            'limCount': int(p_lim)
        },
        'emergencyAccessTiers': {
            'highPct': round(e_high / max(1, num_assets) * 100, 1),
            'modPct': round(e_mod / max(1, num_assets) * 100, 1),
            'limPct': round(e_lim / max(1, num_assets) * 100, 1),
            'highCount': int(e_high),
            'modCount': int(e_mod),
            'limCount': int(e_lim)
        },
        'bbox': [round(svg_min_x, 1), round(svg_min_y, 1), round(svg_max_x, 1), round(svg_max_y, 1)],
        'centroid': geo['centroid'],
        'assets': asset_list,
        'facilities': fac_list
    }

print("Processed", len(state_data_dict), "states.")

# Generate TypeScript file
ts_content = f"""// Real Healthcare and Tourism Accessibility Dataset
// Sources: Ministry of Health Malaysia (KKMNOW) & Core Tourism Assets Spatial Matrix
// Auto-generated from finalized_dataset/hospital_bed_occupancy_state.csv & tourism_healthcare_accessibility.csv

export interface HealthcareAssetPoint {{
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  nearestFacility: string;
  distKm: number;
  tier: string;
}}

export interface HealthcareFacilityPoint {{
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy';
  x: number;
  y: number;
  lat: number;
  lon: number;
}}

export interface AccessTierSummary {{
  highPct: number;
  modPct: number;
  limPct: number;
  highCount: number;
  modCount: number;
  limCount: number;
}}

export interface StateHealthcareData {{
  stateId: string;
  stateName: string;
  code: string;
  region: 'Peninsular' | 'Borneo';
  coreTourismAssets: number;
  totalFacilities: number;
  hospitals: number;
  clinics: number;
  pharmacies: number;
  totalBeds: number;
  bedsNonIcu: number;
  bedsIcu: number;
  bedOccupancyRate: number;
  healthcareAccessRate5km: number;
  hospitalAccessRate15km: number;
  avgDistToHealthcareKm: number;
  medianDistToHealthcareKm: number;
  avgDistToHospitalKm: number;
  medianDistToHospitalKm: number;
  primaryAccessTiers: AccessTierSummary;
  emergencyAccessTiers: AccessTierSummary;
  bbox: [number, number, number, number];
  centroid: {{ x: number; y: number }};
  assets: HealthcareAssetPoint[];
  facilities: HealthcareFacilityPoint[];
}}

export interface NationalHealthcareSummary {{
  totalFacilities: number;
  totalBeds: number;
  bedOccupancyRate: number;
  accessRate5km: number;
  accessRate2km: number;
  totalAssets: number;
  totalHospitals: number;
  totalClinics: number;
  totalPharmacies: number;
}}

export const NATIONAL_HEALTHCARE_SUMMARY: NationalHealthcareSummary = {{
  totalFacilities: {nat_facilities},
  totalBeds: {nat_beds},
  bedOccupancyRate: {nat_bor},
  accessRate5km: {nat_access_5km},
  accessRate2km: {nat_access_2km},
  totalAssets: {nat_assets},
  totalHospitals: {nat_hosp},
  totalClinics: {nat_clinics},
  totalPharmacies: {nat_pharmacies}
}};

export const STATE_HEALTHCARE_DATA: Record<string, StateHealthcareData> = {json.dumps(state_data_dict, indent=2)};

export function getStateHealthcare(stateId: string): StateHealthcareData | undefined {{
  return STATE_HEALTHCARE_DATA[stateId];
}}

export function getAllStateHealthcare(): StateHealthcareData[] {{
  return Object.values(STATE_HEALTHCARE_DATA);
}}
"""

out_ts_path = os.path.join(BASE_DIR, 'src', 'data', 'healthcareData.ts')
with open(out_ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Saved: {out_ts_path} ({os.path.getsize(out_ts_path):,} bytes)")
