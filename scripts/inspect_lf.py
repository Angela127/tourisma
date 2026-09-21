import pandas as pd

df_lf = pd.read_csv('dataset/Datasets/LabourForce_Employment.csv')
print("States in LF:", df_lf['state'].unique())
print("Sex in LF:", df_lf['sex'].unique())
df_lf_both = df_lf[(df_lf['sex'] == 'both') & (df_lf['state'] == 'All')]
if df_lf_both.empty:
    df_lf_both = df_lf[(df_lf['sex'] == 'both')]
print(df_lf_both.groupby('date')['lf_employed'].sum().tail(10))
