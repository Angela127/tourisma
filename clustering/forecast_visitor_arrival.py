from pathlib import Path

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Input Excel file
EXCEL_PATH = BASE_DIR / "consolidated_domestic_tourism.xlsx"

# Output Excel file
OUTPUT_PATH = BASE_DIR / "domestic_tourism_forecast_2026_2030.xlsx"

# Output folder for charts
CHART_DIR = BASE_DIR / "forecast_charts"
CHART_DIR.mkdir(exist_ok=True)

# Historical period
HISTORICAL_START_YEAR = 2022
HISTORICAL_END_YEAR = 2025

# Forecast period
FORECAST_START_YEAR = 2026
FORECAST_END_YEAR = 2030


# ============================================================
# DATA LOADING
# ============================================================

cols = [
    "State",
    "Year",
    "Domestic visitor arrivals (000)"
]

df = pd.read_excel(
    EXCEL_PATH,
    usecols=cols
)


# ============================================================
# DATA CLEANING
# ============================================================

df["Year"] = pd.to_numeric(
    df["Year"],
    errors="coerce"
)

df["Domestic visitor arrivals (000)"] = pd.to_numeric(
    df["Domestic visitor arrivals (000)"],
    errors="coerce"
)

df["State"] = (
    df["State"]
    .astype(str)
    .str.strip()
)

df = df.dropna(
    subset=[
        "State",
        "Year",
        "Domestic visitor arrivals (000)"
    ]
)

df["Year"] = df["Year"].astype(int)


# ============================================================
# FILTER 2022-2025
# ============================================================

historical = df[
    (df["Year"] >= HISTORICAL_START_YEAR) &
    (df["Year"] <= HISTORICAL_END_YEAR)
].copy()

historical = historical.sort_values(
    ["State", "Year"]
).reset_index(drop=True)


# ============================================================
# CALCULATE ACTUAL YOY GROWTH
# ============================================================

historical["Actual Growth (%)"] = (
    historical
    .groupby("State")["Domestic visitor arrivals (000)"]
    .pct_change()
    * 100
)


# ============================================================
# FORECAST FUNCTION
# ============================================================

def forecast_state(state_df):

    state_df = state_df.sort_values("Year").copy()

    state_name = state_df["State"].iloc[0]

    # --------------------------------------------------------
    # Get arrival observations
    # --------------------------------------------------------

    arrival_data = state_df[
        state_df["Domestic visitor arrivals (000)"].notna()
    ].copy()

    if len(arrival_data) < 3:
        return None

    arrival_years = arrival_data["Year"].values
    arrivals = arrival_data["Domestic visitor arrivals (000)"].values

    # --------------------------------------------------------
    # LINEAR REGRESSION
    #
    # Arrivals = slope × Year + intercept
    # --------------------------------------------------------

    slope, intercept = np.polyfit(
        arrival_years,
        arrivals,
        1
    )

    # --------------------------------------------------------
    # Latest actual arrivals = 2025
    # --------------------------------------------------------

    latest_row = state_df[
        state_df["Year"] == HISTORICAL_END_YEAR
    ]

    if latest_row.empty:
        return None

    previous_arrival = latest_row[
        "Domestic visitor arrivals (000)"
    ].iloc[0]

    forecast_rows = []

    # --------------------------------------------------------
    # FORECAST 2026-2030
    # --------------------------------------------------------

    for year in range(
        FORECAST_START_YEAR,
        FORECAST_END_YEAR + 1
    ):

        # Forecast arrivals
        forecast_arrival = slope * year + intercept

        # Prevent negative arrivals, floor at some reasonable value
        forecast_arrival = max(forecast_arrival, previous_arrival * 0.1)

        # Forecast growth %
        if previous_arrival > 0:
            forecast_growth = (
                (forecast_arrival - previous_arrival)
                / previous_arrival
                * 100
            )
        else:
            forecast_growth = 0.0

        forecast_rows.append({
            "State": state_name,
            "Year": year,
            "Type": "Forecast",
            "Domestic visitor arrivals (000)": forecast_arrival,
            "Growth (%)": forecast_growth
        })

        # Forecast becomes base for next year
        previous_arrival = forecast_arrival

    return pd.DataFrame(forecast_rows)


# ============================================================
# FORECAST ALL STATES
# ============================================================

forecast_results = []

states = sorted(
    historical["State"].unique()
)

for state in states:

    state_df = historical[
        historical["State"] == state
    ].copy()

    result = forecast_state(state_df)

    if result is not None:
        forecast_results.append(result)


forecast_df = pd.concat(
    forecast_results,
    ignore_index=True
)


# ============================================================
# PREPARE HISTORICAL DATA
# ============================================================

historical_output = historical[
    [
        "State",
        "Year",
        "Domestic visitor arrivals (000)",
        "Actual Growth (%)"
    ]
].copy()

historical_output["Type"] = "Actual"

historical_output = historical_output.rename(
    columns={
        "Actual Growth (%)": "Growth (%)"
    }
)

historical_output = historical_output[
    [
        "State",
        "Year",
        "Type",
        "Domestic visitor arrivals (000)",
        "Growth (%)"
    ]
]


# ============================================================
# COMBINE ACTUAL + FORECAST
# ============================================================

full_forecast = pd.concat(
    [
        historical_output,
        forecast_df
    ],
    ignore_index=True
)

full_forecast = full_forecast.sort_values(
    ["State", "Year"]
).reset_index(drop=True)


# ============================================================
# ROUND VALUES
# ============================================================

full_forecast[
    "Domestic visitor arrivals (000)"
] = full_forecast[
    "Domestic visitor arrivals (000)"
].round(2)

full_forecast[
    "Growth (%)"
] = full_forecast[
    "Growth (%)"
].round(2)


# ============================================================
# FORECAST ARRIVALS TABLE
# ============================================================

forecast_arrivals = forecast_df.pivot(
    index="State",
    columns="Year",
    values="Domestic visitor arrivals (000)"
).reset_index()

forecast_arrivals.columns.name = None

forecast_arrivals = forecast_arrivals.rename(
    columns={
        year: f"Forecast Arrivals {year} (000)"
        for year in range(
            FORECAST_START_YEAR,
            FORECAST_END_YEAR + 1
        )
    }
)


# ============================================================
# FORECAST GROWTH TABLE
# ============================================================

forecast_growth = forecast_df.pivot(
    index="State",
    columns="Year",
    values="Growth (%)"
).reset_index()

forecast_growth.columns.name = None

forecast_growth = forecast_growth.rename(
    columns={
        year: f"Forecast Growth {year} (%)"
        for year in range(
            FORECAST_START_YEAR,
            FORECAST_END_YEAR + 1
        )
    }
)


# ============================================================
# ACTUAL GROWTH TABLE
# ============================================================

actual_growth = historical_output[
    historical_output["Year"] >= 2023
].pivot(
    index="State",
    columns="Year",
    values="Growth (%)"
).reset_index()

actual_growth.columns.name = None

actual_growth = actual_growth.rename(
    columns={
        2023: "Actual Growth 2023 (%)",
        2024: "Actual Growth 2024 (%)",
        2025: "Actual Growth 2025 (%)"
    }
)


# ============================================================
# SUMMARY TABLE
# ============================================================

latest_actual = historical[
    historical["Year"] == 2025
][
    [
        "State",
        "Domestic visitor arrivals (000)"
    ]
].copy()

latest_actual = latest_actual.rename(
    columns={
        "Domestic visitor arrivals (000)":
            "Actual Arrivals 2025 (000)"
    }
)

summary = latest_actual.merge(
    actual_growth,
    on="State",
    how="left"
)

summary = summary.merge(
    forecast_growth,
    on="State",
    how="left"
)

summary = summary.merge(
    forecast_arrivals,
    on="State",
    how="left"
)


# ============================================================
# ROUND SUMMARY
# ============================================================

numeric_columns = summary.select_dtypes(
    include="number"
).columns

summary[numeric_columns] = (
    summary[numeric_columns].round(2)
)


# ============================================================
# SAVE EXCEL
# ============================================================

with pd.ExcelWriter(
    OUTPUT_PATH,
    engine="openpyxl"
) as writer:

    full_forecast.to_excel(
        writer,
        sheet_name="Full Forecast",
        index=False
    )

    actual_growth.to_excel(
        writer,
        sheet_name="Actual Growth",
        index=False
    )

    forecast_growth.to_excel(
        writer,
        sheet_name="Forecast Growth",
        index=False
    )

    forecast_arrivals.to_excel(
        writer,
        sheet_name="Forecast Arrivals",
        index=False
    )

    summary.to_excel(
        writer,
        sheet_name="Summary",
        index=False
    )


# ============================================================
# CHART 1
# ACTUAL ARRIVALS + FORECAST ARRIVALS
# ============================================================

print("\nGenerating arrival forecast charts...")

for state in states:

    state_data = full_forecast[
        full_forecast["State"] == state
    ].copy()

    actual = state_data[
        state_data["Type"] == "Actual"
    ]

    forecast = state_data[
        state_data["Type"] == "Forecast"
    ]

    # Connect the lines
    if not actual.empty and not forecast.empty:
        forecast = pd.concat([actual.iloc[[-1]], forecast], ignore_index=True)

    plt.figure(figsize=(10, 6))

    # Actual arrivals
    plt.plot(
        actual["Year"],
        actual["Domestic visitor arrivals (000)"],
        marker="o",
        linewidth=2,
        label="Actual"
    )

    # Forecast arrivals
    plt.plot(
        forecast["Year"],
        forecast["Domestic visitor arrivals (000)"],
        marker="o",
        linestyle="--",
        linewidth=2,
        label="Forecast"
    )

    # Mark the transition between actual and forecast
    plt.axvline(
        x=2025.5,
        linestyle=":",
        linewidth=1.5
    )

    plt.title(
        f"{state} - Domestic Visitor Arrivals Forecast",
        fontsize=14
    )

    plt.xlabel("Year")
    plt.ylabel(
        "Domestic Visitor Arrivals (000)"
    )

    plt.xticks(
        range(
            HISTORICAL_START_YEAR,
            FORECAST_END_YEAR + 1
        )
    )

    plt.grid(
        True,
        linestyle="--",
        alpha=0.4
    )

    plt.legend()

    plt.tight_layout()

    # Clean filename
    safe_state = (
        state
        .replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
    )

    output_file = (
        CHART_DIR
        / f"{safe_state}_arrival_forecast.png"
    )

    plt.savefig(
        output_file,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


# ============================================================
# CHART 2
# ACTUAL + FORECAST YEARLY GROWTH
# ============================================================

print("Generating growth trend charts...")

for state in states:

    state_data = full_forecast[
        full_forecast["State"] == state
    ].copy()

    actual = state_data[
        state_data["Type"] == "Actual"
    ]

    forecast = state_data[
        state_data["Type"] == "Forecast"
    ]

    # Connect the lines
    if not actual.empty and not forecast.empty:
        forecast = pd.concat([actual.iloc[[-1]], forecast], ignore_index=True)

    plt.figure(figsize=(10, 6))

    # Actual growth
    plt.plot(
        actual["Year"],
        actual["Growth (%)"],
        marker="o",
        linewidth=2,
        label="Actual Growth"
    )

    # Forecast growth
    plt.plot(
        forecast["Year"],
        forecast["Growth (%)"],
        marker="o",
        linestyle="--",
        linewidth=2,
        label="Forecast Growth"
    )

    # Zero growth line
    plt.axhline(
        y=0,
        linewidth=1
    )

    # Actual / forecast boundary
    plt.axvline(
        x=2025.5,
        linestyle=":",
        linewidth=1.5
    )

    plt.title(
        f"{state} - Annual Tourism Growth Trend",
        fontsize=14
    )

    plt.xlabel("Year")
    plt.ylabel("Year-on-Year Growth (%)")

    plt.xticks(
        range(
            2023,
            FORECAST_END_YEAR + 1
        )
    )

    plt.grid(
        True,
        linestyle="--",
        alpha=0.4
    )

    plt.legend()

    plt.tight_layout()

    safe_state = (
        state
        .replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
    )

    output_file = (
        CHART_DIR
        / f"{safe_state}_growth_forecast.png"
    )

    plt.savefig(
        output_file,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


# ============================================================
# CHART 3
# 2030 FORECAST ARRIVALS - ALL STATES
# ============================================================

print("Generating 2030 comparison chart...")

comparison = forecast_df[
    forecast_df["Year"] == 2030
].copy()

comparison = comparison.sort_values(
    "Domestic visitor arrivals (000)",
    ascending=True
)

plt.figure(figsize=(12, 8))

plt.barh(
    comparison["State"],
    comparison["Domestic visitor arrivals (000)"]
)

plt.title(
    "Projected Domestic Visitor Arrivals by State - 2030",
    fontsize=15
)

plt.xlabel(
    "Domestic Visitor Arrivals (000)"
)

plt.ylabel("State")

plt.grid(
    axis="x",
    linestyle="--",
    alpha=0.4
)

plt.tight_layout()

plt.savefig(
    CHART_DIR / "2030_state_comparison.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# CHART 4
# 2025 ACTUAL VS 2030 FORECAST
# ============================================================

print("Generating 2025 vs 2030 comparison chart...")

comparison = summary[
    [
        "State",
        "Actual Arrivals 2025 (000)",
        "Forecast Arrivals 2030 (000)"
    ]
].copy()

comparison = comparison.sort_values(
    "Forecast Arrivals 2030 (000)",
    ascending=True
)

x = np.arange(
    len(comparison)
)

width = 0.38

plt.figure(figsize=(13, 8))

plt.barh(
    x - width / 2,
    comparison["Actual Arrivals 2025 (000)"],
    width,
    label="2025 Actual"
)

plt.barh(
    x + width / 2,
    comparison["Forecast Arrivals 2030 (000)"],
    width,
    label="2030 Forecast"
)

plt.yticks(
    x,
    comparison["State"]
)

plt.xlabel(
    "Domestic Visitor Arrivals (000)"
)

plt.ylabel("State")

plt.title(
    "Domestic Visitor Arrivals: 2025 Actual vs 2030 Forecast",
    fontsize=15
)

plt.grid(
    axis="x",
    linestyle="--",
    alpha=0.4
)

plt.legend()

plt.tight_layout()

plt.savefig(
    CHART_DIR / "2025_vs_2030_comparison.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n" + "=" * 70)
print("FORECAST COMPLETED")
print("=" * 70)

print(
    f"\nExcel output:"
)

print(
    OUTPUT_PATH
)

print(
    f"\nCharts saved in:"
)

print(
    CHART_DIR
)

print(
    "\nGenerated charts:"
)

print(
    "1. Individual state arrival forecast charts"
)

print(
    "2. Individual state annual growth charts"
)

print(
    "3. 2030 state comparison chart"
)

print(
    "4. 2025 vs 2030 comparison chart"
)

print("\n" + "=" * 70)