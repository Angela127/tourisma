import numpy as np
import scipy.stats as stats
import json

# Historical Data
history = [
  {"period": '2022 Q1', "year": 2022, "quarter": 1, "domestic": 36.36},
  {"period": '2022 Q2', "year": 2022, "quarter": 2, "domestic": 45.47},
  {"period": '2022 Q3', "year": 2022, "quarter": 3, "domestic": 43.00},
  {"period": '2022 Q4', "year": 2022, "quarter": 4, "domestic": 46.77},
  {"period": '2023 Q1', "year": 2023, "quarter": 1, "domestic": 49.26},
  {"period": '2023 Q2', "year": 2023, "quarter": 2, "domestic": 55.28},
  {"period": '2023 Q3', "year": 2023, "quarter": 3, "domestic": 54.17},
  {"period": '2023 Q4', "year": 2023, "quarter": 4, "domestic": 55.03},
  {"period": '2024 Q1', "year": 2024, "quarter": 1, "domestic": 58.61},
  {"period": '2024 Q2', "year": 2024, "quarter": 2, "domestic": 68.44},
  {"period": '2024 Q3', "year": 2024, "quarter": 3, "domestic": 66.26},
  {"period": '2024 Q4', "year": 2024, "quarter": 4, "domestic": 66.82},
  {"period": '2025 Q1', "year": 2025, "quarter": 1, "domestic": 69.68},
  {"period": '2025 Q2', "year": 2025, "quarter": 2, "domestic": 73.75},
  {"period": '2025 Q3', "year": 2025, "quarter": 3, "domestic": 72.60},
  {"period": '2025 Q4', "year": 2025, "quarter": 4, "domestic": 74.03},
  {"period": '2026 Q1', "year": 2026, "quarter": 1, "domestic": 74.67},
]

# x values: simply 0 to len-1
x = np.arange(len(history))
y = np.array([item["domestic"] for item in history])

# Linear regression
slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

# We want to forecast up to 2030 Q4
# 2026 Q2 will be index 17
forecast = []
idx = len(history)

# standard error of prediction
n = len(x)
mean_x = np.mean(x)
sum_sq_x = np.sum((x - mean_x)**2)
residuals = y - (slope * x + intercept)
sum_sq_resid = np.sum(residuals**2)
s_err = np.sqrt(sum_sq_resid / (n - 2))
t_val = stats.t.ppf(1 - 0.025, df=n-2) # 95% confidence interval

for year in range(2026, 2031):
    for q in range(1, 5):
        if year == 2026 and q == 1:
            continue
        
        pred_y = slope * idx + intercept
        
        # Calculate confidence interval margin
        margin = t_val * s_err * np.sqrt(1 + 1/n + (idx - mean_x)**2 / sum_sq_x)
        
        forecast.append({
            "period": f"{year} Q{q}",
            "year": year,
            "quarter": q,
            "domestic": round(pred_y, 2),
            "international": 0,
            "total": round(pred_y, 2),
            "domesticShare": 100,
            "internationalShare": 0,
            "isForecast": True,
            "lowerBound": round(pred_y - margin, 2),
            "upperBound": round(pred_y + margin, 2)
        })
        idx += 1

print(json.dumps(forecast, indent=2))
