import pandas as pd

tsa_path = 'dataset/Datasets/Tourism Satellite Account.xlsx'
xl = pd.ExcelFile(tsa_path)

print("=== Jad 5 (GVATI & GDP) ===")
df5 = xl.parse('Jad 5')
print(df5.to_string())

print("\n=== Jad 7 (Tourism Employment) ===")
df7 = xl.parse('Jad 7')
print(df7.to_string())

print("\n=== Indicator Domestik ===")
df_d = xl.parse('Indicator Domestik')
print(df_d.iloc[:20].to_string())
