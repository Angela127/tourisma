import pandas as pd
import json

master = pd.read_csv('finalized_dataset/tourisma_state_master.csv')
scores = pd.read_csv('finalized_dataset/tourisma_state_scores.csv')
quad = pd.read_csv('finalized_dataset/tourisma_state_quadrant.csv')

print("States in master:", master['state'].tolist())

# Map helper to ID
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

for s in master['state']:
    assert s in state_id_map, f"Missing id map for {s}"

print("All 16 states successfully mapped to IDs.")
