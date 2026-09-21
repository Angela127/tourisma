import pandas as pd

file_path = r'c:\Users\xinye\tourisma\dataset\Datasets\tourism_domestic_2026-q1.xlsx'
df = pd.read_excel(file_path)

# Extract data starting from index 9
df = df.iloc[9:].copy()

# Select the required columns (excluding No. of Domestic Tourists which are 5, 6, 7)
cols_to_keep = [
    'Unnamed: 0',
    'Unnamed: 1',
    'Unnamed: 2',
    'Unnamed: 3',
    'Unnamed: 4',
    'Unnamed: 8',
    'Unnamed: 9',
    'Unnamed: 10'
]
df = df[cols_to_keep]

# Rename columns for clarity
df.columns = [
    'year',
    'quarter',
    'domestic_visitors',
    'visitors_qoq',
    'visitors_yoy',
    'total_tourism_expenditure',
    'expenditure_qoq',
    'expenditure_yoy'
]

# Clean up year column by forward filling
df['year'] = df['year'].ffill()

# Drop completely empty rows or rows without visitors data
df = df.dropna(subset=['domestic_visitors'])

output_path = r'c:\Users\xinye\tourisma\finalized_dataset\tourism_domestic_cleaned.csv'
df.to_csv(output_path, index=False)
print("Conversion successful. File saved to:", output_path)
