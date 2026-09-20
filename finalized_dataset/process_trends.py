import pandas as pd

# Load raw
df = pd.read_excel('tourisma_state_trends (1).xlsx')

# Rename 'accomodation_room' to 'accommodation_rooms' if it exists
df = df.rename(columns={'accomodation_room': 'accommodation_rooms'})

# Select and order columns as requested
raw_columns = [
    'state',
    'year',
    'domestic_visitors',
    'international_hotel_guests',
    'domestic_receipts_rm_million',
    'accommodation_rooms',
    'accommodation_establishments',
    'aor_pct'
]

df_raw = df[raw_columns].copy()

# Save raw dataset
df_raw.to_csv('tourisma_state_trends.csv', index=False)

# Calculate YoY
df_analysis = df_raw.copy()
df_analysis = df_analysis.sort_values(['state', 'year'])

# Group by state to calculate pct_change and diff
grouped = df_analysis.groupby('state')

df_analysis['domestic_visitors_yoy_pct'] = grouped['domestic_visitors'].pct_change()
df_analysis['international_hotel_guests_yoy_pct'] = grouped['international_hotel_guests'].pct_change()
df_analysis['receipts_yoy_pct'] = grouped['domestic_receipts_rm_million'].pct_change()
df_analysis['accommodation_rooms_yoy_pct'] = grouped['accommodation_rooms'].pct_change()
df_analysis['accommodation_establishments_yoy_pct'] = grouped['accommodation_establishments'].pct_change()
df_analysis['aor_change_pp'] = grouped['aor_pct'].diff()

# Save calculated dataset
df_analysis.to_csv('tourisma_state_trends_analysis.csv', index=False)
print("Data processing complete.")
