import re
import numpy as np
import pandas as pd

# Load centroids from malaysiaGeo.ts
with open('src/data/malaysiaGeo.ts', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'"name":\s*"([^"]+)".*?"region":\s*"([^"]+)".*?"centroid":\s*\{\s*"x":\s*([\d\.]+),\s*"y":\s*([\d\.]+)', text, re.DOTALL)
geo_df = pd.DataFrame(matches, columns=['state', 'region', 'svg_x', 'svg_y'])
geo_df['svg_x'] = geo_df['svg_x'].astype(float)
geo_df['svg_y'] = geo_df['svg_y'].astype(float)

# Load real centroids from tourism assets
df_assets = pd.read_csv('finalized_dataset/tourism_asset_coverage.csv')
# clean state names
real_coords = df_assets.groupby('state')[['lat', 'lon']].mean().reset_index()

# Merge
merged = pd.merge(geo_df, real_coords, on='state')
print("Merged state coordinates:")
print(merged)

for reg in ['Peninsular', 'Borneo']:
    sub = merged[merged['region'] == reg]
    print(f"\n--- Fitting {reg} ---")
    # x = a*lon + b*lat + c
    # y = d*lon + e*lat + f
    A = np.column_stack([sub['lon'], sub['lat'], np.ones(len(sub))])
    params_x, _, _, _ = np.linalg.lstsq(A, sub['svg_x'], rcond=None)
    params_y, _, _, _ = np.linalg.lstsq(A, sub['svg_y'], rcond=None)
    print(f"X = {params_x[0]:.4f}*lon + {params_x[1]:.4f}*lat + {params_x[2]:.4f}")
    print(f"Y = {params_y[0]:.4f}*lon + {params_y[1]:.4f}*lat + {params_y[2]:.4f}")
    
    pred_x = A @ params_x
    pred_y = A @ params_y
    err_x = np.abs(pred_x - sub['svg_x']).max()
    err_y = np.abs(pred_y - sub['svg_y']).max()
    print(f"Max residual: X={err_x:.2f}px, Y={err_y:.2f}px")
