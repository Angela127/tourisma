import pandas as pd
import numpy as np

print("--- 1. DTS QUARTERLY 2025 ---")
df_q = pd.read_excel('dataset/Datasets/tourism_domestic_2026-q1.xlsx', sheet_name='DTS 2025 Q2')
q_rows = df_q.iloc[44:48]
for idx, r in q_rows.iterrows():
    q_num = int(r['Unnamed: 1'])
    vis_m = r['Unnamed: 2'] / 1000
    yoy_v = r['Unnamed: 4']
    rec_b = r['Unnamed: 8'] / 1000
    print(f"Q{q_num}: {vis_m:.1f}M visitors (+{yoy_v:.1f}%), RM {rec_b:.1f}B receipts")

print("\n--- 2. STATE MASTER DATASET (TOP RECEIPTS) ---")
df_m = pd.read_csv('dataset/tourisma_state_master.csv')
top_receipts = df_m.sort_values(by='domestic_receipts_rm_million', ascending=False).head(4)
for idx, r in top_receipts.iterrows():
    print(f"{r['state']}: RM {r['domestic_receipts_rm_million']/1000:.1f}B (raw: RM {r['domestic_receipts_rm_million']:.2f}M)")

print("\n--- 3. NATIONAL ALOS & HOTEL AOR ---")
tot_vis = df_m['domestic_visitors'].sum()
w_alos = (df_m['domestic_visitors'] * df_m['average_length_of_stay']).sum() / tot_vis
tot_rooms = df_m['accommodation_rooms'].sum()
w_aor = (df_m['accommodation_rooms'] * df_m['aor_pct']).sum() / tot_rooms
print(f"Weighted ALOS: {w_alos:.2f} nights")
print(f"Weighted Hotel AOR: {w_aor:.1f}% across {tot_rooms:,} rooms")

print("\n--- 4. QUADRANT CLUSTERS (16 STATES) ---")
df_scores = pd.read_csv('dataset/tourisma_state_scores.csv')
print("Total states in scores:", len(df_scores))
for quad, count in df_scores['quadrant'].value_counts().items():
    pct = (count / len(df_scores)) * 100
    print(f"{quad}: {count} states ({pct:.1f}%)")
