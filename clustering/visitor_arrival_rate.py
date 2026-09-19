from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

# ============================================================
# DATA LOADING & FILTERING
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
EXCEL_PATH = BASE_DIR / "consolidated_domestic_tourism.xlsx"

# Direct fetch from Excel, reading only the required features:
# 'State', 'Year', and 'Domestic visitor arrivals (000)'
cols = ["State", "Year", "Domestic visitor arrivals (000)"]
df = pd.read_excel(EXCEL_PATH, usecols=cols)

# Ensure data types and clean states
df["Year"] = df["Year"].astype(int)
df["Domestic visitor arrivals (000)"] = pd.to_numeric(df["Domestic visitor arrivals (000)"], errors="coerce")
df["State"] = df["State"].astype(str).str.strip()

# ============================================================
# GRAPH 1: ALL STATES IN ONE GRAPH
# ============================================================

plt.figure(figsize=(16, 9))

# Matplotlib only has 10 default colors, causing colors to repeat for 16 states.
# We use tab20 (20 distinct colors) + distinct markers so every state is unique.
colors = plt.cm.tab20.colors
markers = ["o", "s", "^", "D", "v", "p", "*", "h", "<", ">", "8", "P", "X", "d", "H", "1"]

# Sort states by their latest (2025) arrival volume so the legend entries
# match the visual top-to-bottom order of the curves on the right side.
latest_year = df["Year"].max()
sorted_states = (
    df[df["Year"] == latest_year]
    .sort_values("Domestic visitor arrivals (000)", ascending=False)["State"]
    .tolist()
)

for i, state in enumerate(sorted_states):
    state_data = df[df["State"] == state].sort_values("Year")

    plt.plot(
        state_data["Year"],
        state_data["Domestic visitor arrivals (000)"],
        marker=markers[i % len(markers)],
        markersize=6,
        linewidth=2,
        color=colors[i % len(colors)],
        label=state
    )

plt.title(
    "Yearly Trend of Domestic Visitor Arrivals by State (2019–2025)",
    fontsize=15,
    fontweight="bold",
    pad=15
)

plt.xlabel("Year", fontsize=12, labelpad=10)
plt.ylabel("Domestic Visitor Arrivals ('000)", fontsize=12, labelpad=10)
plt.xticks(sorted(df["Year"].unique()))
plt.gca().yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{int(x):,}"))
plt.grid(True, alpha=0.3)

# Place legend outside on the right, ordered to match curves
plt.legend(
    bbox_to_anchor=(1.02, 1),
    loc="upper left",
    fontsize=9.5,
    frameon=True,
    title="States (by 2025 Volume)"
)
plt.tight_layout()
plt.show()

# ============================================================
# GRAPH 2: INDIVIDUAL GRAPH FOR EACH STATE (4x4 Grid)
# ============================================================

states = sorted(df["State"].unique())

# 16 states fits a 4x4 grid (zero empty subplots)
n_cols = 4
n_rows = 4

fig, axes = plt.subplots(
    n_rows,
    n_cols,
    figsize=(16, 10)
)

axes = axes.flatten()

for ax, state in zip(axes, states):
    state_data = df[df["State"] == state].sort_values("Year")

    ax.plot(
        state_data["Year"],
        state_data["Domestic visitor arrivals (000)"],
        marker="o",
        markersize=4,
        linewidth=1.8,
        color="#1f77b4"
    )

    # Subplot title with generous top padding to prevent overlap
    ax.set_title(
        state,
        fontsize=10,
        fontweight="bold",
        pad=6
    )

    ax.set_xticks(sorted(df["Year"].unique()))
    ax.set_xticklabels(sorted(df["Year"].unique()), fontsize=7.5)
    ax.grid(True, alpha=0.25)
    ax.tick_params(axis="both", labelsize=7.5)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{int(x):,}"))

# Overall title and axis labels with designated margins
fig.suptitle(
    "Domestic Visitor Arrivals by State (2019–2025)",
    fontsize=15,
    fontweight="bold",
    y=0.98
)

fig.supxlabel("Year", fontsize=11, fontweight="bold", y=0.01)
fig.supylabel("Visitor Arrivals ('000)", fontsize=11, fontweight="bold", x=0.01)

# Generous margins and spacing so labels and titles never collide
plt.tight_layout(rect=[0.02, 0.03, 0.99, 0.95])
plt.subplots_adjust(hspace=0.45, wspace=0.28)

plt.show()
