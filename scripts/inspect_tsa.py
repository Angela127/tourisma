import pandas as pd

tsa_path = 'dataset/Datasets/Tourism Satellite Account.xlsx'
xl = pd.ExcelFile(tsa_path)
for s in xl.sheet_names:
    print(f"=== SHEET: {s} ===")
    df = xl.parse(s)
    # print non-empty rows
    print(df.dropna(how='all').iloc[:15, :8])
