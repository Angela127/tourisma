import pandas as pd

tsa_path = 'dataset/Datasets/Tourism Satellite Account.xlsx'
xl = pd.ExcelFile(tsa_path)

df5 = xl.parse('Jad 5')
print("Jad 5:")
print(df5.iloc[1:4, :].to_string())
print(df5.iloc[12:17, :].to_string())

df7 = xl.parse('Jad 7')
print("\nJad 7:")
print(df7.iloc[1:4, :].to_string())
print(df7.iloc[12:15, :].to_string())

lf_path = 'dataset/Datasets/LabourForce_Employment.csv'
df_lf = pd.read_csv(lf_path)
print("\nLabour force total employment:")
print(df_lf[df_lf['state'] == 'Malaysia'].tail(10))
