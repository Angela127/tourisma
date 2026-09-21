import pandas as pd
import json
import re

master = pd.read_csv('finalized_dataset/tourisma_state_master.csv')
scores = pd.read_csv('finalized_dataset/tourisma_state_scores.csv')
quad = pd.read_csv('finalized_dataset/tourisma_state_quadrant.csv')

state_id_map = {
    'Selangor': 'selangor',
    'W.P. Kuala Lumpur': 'kuala_lumpur',
    'Perak': 'perak',
    'Pahang': 'pahang',
    'Sarawak': 'sarawak',
    'Sabah': 'sabah',
    'Melaka': 'melaka',
    'Negeri Sembilan': 'negeri_sembilan',
    'Johor': 'johor',
    'Pulau Pinang': 'penang',
    'Kedah': 'kedah',
    'Terengganu': 'terengganu',
    'Kelantan': 'kelantan',
    'Perlis': 'perlis',
    'W.P. Putrajaya': 'putrajaya',
    'W.P. Labuan': 'labuan',
}

merged = master.merge(scores[['state', 'demand_score', 'readiness_score', 'quadrant']], on='state')

for _, row in merged.iterrows():
    sid = state_id_map[row['state']]
    print(f"{sid}: visitors={row['domestic_visitors']/1e6:.2f}M, receipts={row['domestic_receipts_rm_million']/1000:.2f}B, alos={row['average_length_of_stay']:.2f}, rooms={row['accommodation_rooms']}, aor={row['aor_pct']}%, readiness={row['readiness_score']:.1f}, demand={row['demand_score']:.1f}")
