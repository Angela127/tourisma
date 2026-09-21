import json
import re
import numpy as np
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIN_DIR = os.path.join(BASE_DIR, "finalized_dataset")

# Load state geo info
with open(os.path.join(BASE_DIR, 'src', 'data', 'malaysiaGeoGenerated.json'), 'r', encoding='utf-8') as f:
    geo_list = json.load(f)

# Load tourism assets
df_assets = pd.read_csv(os.path.join(FIN_DIR, 'tourism_healthcare_accessibility.csv'))

# State name mapping to geo ID
state_id_map = {
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

for g in geo_list:
    gid = g['id']
    coords = re.findall(r'([\d\.]+)\s+([\d\.]+)', g['svgPath'])
    xs = [float(x) for x, y in coords]
    ys = [float(y) for x, y in coords]
    
    # find corresponding state name
    sname = next((k for k, v in state_id_map.items() if v == gid), None)
    if not sname:
        continue
    sub = df_assets[df_assets['state'] == sname]
    if len(sub) == 0:
        continue
    
    # State SVG bbox
    svg_min_x, svg_max_x = min(xs), max(xs)
    svg_min_y, svg_max_y = min(ys), max(ys)
    
    # Asset lon/lat bbox
    lon_min, lon_max = sub['lon'].min(), sub['lon'].max()
    lat_min, lat_max = sub['lat'].min(), sub['lat'].max()
    
    print(f"{sname:18s} ({len(sub)} assets): Lon[{lon_min:.2f}, {lon_max:.2f}] -> X[{svg_min_x:.1f}, {svg_max_x:.1f}] | Lat[{lat_min:.2f}, {lat_max:.2f}] -> Y[{svg_min_y:.1f}, {svg_max_y:.1f}]")
