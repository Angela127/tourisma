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

geo_map = {}
for g in geo_list:
    coords = re.findall(r'([\d\.]+)\s+([\d\.]+)', g['svgPath'])
    xs = [float(x) for x, y in coords]
    ys = [float(y) for x, y in coords]
    geo_map[g['id']] = {
        'id': g['id'],
        'name': g['name'],
        'shortName': g['shortName'],
        'code': g['code'],
        'region': g['region'],
        'bbox': [min(xs), min(ys), max(xs), max(ys)],
        'centroid': g['centroid']
    }

print("Loaded geo items:", len(geo_map))
for k, v in list(geo_map.items())[:3]:
    print(k, v)
