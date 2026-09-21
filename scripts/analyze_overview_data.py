import pandas as pd
import json
import os

master = pd.read_csv('finalized_dataset/tourisma_state_master.csv')
print('=== MASTER DATASET SUMMARY ===')
print('Total Domestic Visitors (M):', master['domestic_visitors'].sum() / 1e6)
print('Total Domestic Receipts (RM M):', master['domestic_receipts_rm_million'].sum())
print('Total Domestic Receipts (RM B):', master['domestic_receipts_rm_million'].sum() / 1000)
print('Mean ALOS:', master['average_length_of_stay'].mean())
weighted_alos = (master['average_length_of_stay'] * master['domestic_visitors']).sum() / master['domestic_visitors'].sum()
print('Weighted ALOS:', weighted_alos)
print('Total Accom Rooms:', master['accommodation_rooms'].sum())
print('Mean AOR %:', master['aor_pct'].mean())

print('\nTop 8 Receipts:')
top_r = master[['state', 'domestic_receipts_rm_million']].sort_values('domestic_receipts_rm_million', ascending=False)
for idx, r in top_r.iterrows():
    print(f"  {r['state']}: RM {r['domestic_receipts_rm_million']/1000:.2f}B ({r['domestic_receipts_rm_million']:.1f}M)")

quad = pd.read_csv('finalized_dataset/tourisma_state_quadrant.csv')
print('\n=== QUADRANT DISTRIBUTION ===')
print(quad['quadrant'].value_counts(normalize=True) * 100)
print(quad['quadrant'].value_counts())

trends = pd.read_csv('finalized_dataset/tourisma_state_trends_analysis.csv')
print('\n=== NATIONAL TRENDS BY YEAR ===')
nat_trends = trends.groupby('year').agg({
    'domestic_visitors': 'sum',
    'domestic_receipts_rm_million': 'sum',
    'international_hotel_guests': 'sum',
    'accommodation_rooms': 'sum'
}).reset_index()
nat_trends['visitors_yoy'] = nat_trends['domestic_visitors'].pct_change() * 100
nat_trends['receipts_yoy'] = nat_trends['domestic_receipts_rm_million'].pct_change() * 100
print(nat_trends)

clean = pd.read_csv('finalized_dataset/tourism_domestic_cleaned.csv')
print('\n=== QUARTERLY DOMESTIC CLEANED ===')
print(clean)
