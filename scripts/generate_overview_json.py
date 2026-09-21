import pandas as pd
import json

# Load datasets
master = pd.read_csv('finalized_dataset/tourisma_state_master.csv')
scores = pd.read_csv('finalized_dataset/tourisma_state_scores.csv')
quad = pd.read_csv('finalized_dataset/tourisma_state_quadrant.csv')
pressure = pd.read_csv('finalized_dataset/tourisma_state_pressure.csv')
trends = pd.read_csv('finalized_dataset/tourisma_state_trends.csv')
trends_analysis = pd.read_csv('finalized_dataset/tourisma_state_trends_analysis.csv')
q_clean = pd.read_csv('finalized_dataset/tourism_domestic_cleaned.csv')

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

state_short_map = {
    'Selangor': 'Selangor',
    'W.P. Kuala Lumpur': 'KL',
    'Perak': 'Perak',
    'Pahang': 'Pahang',
    'Sarawak': 'Sarawak',
    'Sabah': 'Sabah',
    'Melaka': 'Melaka',
    'Negeri Sembilan': 'N. Sembilan',
    'Johor': 'Johor',
    'Pulau Pinang': 'Penang',
    'Kedah': 'Kedah',
    'Terengganu': 'Terengganu',
    'Kelantan': 'Kelantan',
    'Perlis': 'Perlis',
    'W.P. Putrajaya': 'Putrajaya',
    'W.P. Labuan': 'Labuan',
}

state_code_map = {
    'Selangor': 'SGR',
    'W.P. Kuala Lumpur': 'KUL',
    'Perak': 'PRK',
    'Pahang': 'PHG',
    'Sarawak': 'SWK',
    'Sabah': 'SBH',
    'Melaka': 'MLK',
    'Negeri Sembilan': 'NSN',
    'Johor': 'JHR',
    'Pulau Pinang': 'PNG',
    'Kedah': 'KDH',
    'Terengganu': 'TRG',
    'Kelantan': 'KTN',
    'Perlis': 'PLS',
    'W.P. Putrajaya': 'PJY',
    'W.P. Labuan': 'LBN',
}

# Merge state data
merged = master.merge(scores[['state', 'demand_score', 'readiness_score', 'demand_category', 'readiness_category', 'quadrant', 'accommodation_capacity_score', 'road_access_score', 'pt_access_score']], on='state')

states_dict = {}
for _, row in merged.iterrows():
    s_name = row['state']
    s_id = state_id_map[s_name]
    region = 'Borneo' if s_name in ['Sabah', 'Sarawak', 'W.P. Labuan'] else 'Peninsular'
    
    # State trends
    s_trends = trends_analysis[trends_analysis['state'].str.upper() == s_name.upper()].sort_values('year')
    yearly_visitors = s_trends['domestic_visitors'].tolist() if not s_trends.empty else []
    
    states_dict[s_id] = {
        'id': s_id,
        'name': s_name,
        'shortName': state_short_map[s_name],
        'code': state_code_map[s_name],
        'region': region,
        'domesticVisitors': int(row['domestic_visitors']),
        'domesticVisitorsM': round(row['domestic_visitors'] / 1e6, 2),
        'internationalHotelGuests': int(row['international_hotel_guests']),
        'internationalHotelGuestsM': round(row['international_hotel_guests'] / 1e6, 2),
        'receiptsRmM': round(row['domestic_receipts_rm_million'], 2),
        'receiptsRmB': round(row['domestic_receipts_rm_million'] / 1000, 2),
        'receiptsPerVisitor': round((row['domestic_receipts_rm_million'] * 1e6) / row['domestic_visitors'], 0),
        'alos': round(row['average_length_of_stay'], 2),
        'accommodationRooms': int(row['accommodation_rooms']),
        'accommodationEstablishments': int(row['accommodation_establishments']),
        'aorPct': round(row['aor_pct'], 1),
        'readinessScore': round(row['readiness_score'], 1),
        'demandScore': round(row['demand_score'], 1),
        'quadrant': row['quadrant'],
        'demandCategory': row['demand_category'],
        'readinessCategory': row['readiness_category'],
        'totalTourismAssets': int(row['total_tourism_assets']),
        'roadAccessRate': round(row['road_access_rate'], 1),
        'ptAccessRate': round(row['pt_access_rate'], 1),
        'environmentalExposureRate': round(row['environmental_exposure_rate'], 1),
        'visitorToRoomRatio': round(row['visitor_to_room_ratio'], 1),
        'yearlyTrendVisitors': yearly_visitors
    }

print("Generated states dict count:", len(states_dict))
with open('src/data/statesOverviewData.json', 'w') as f:
    json.dump(states_dict, f, indent=2)
print("Saved to src/data/statesOverviewData.json")
