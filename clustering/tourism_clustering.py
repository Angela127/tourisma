"""
Malaysia Tourism State Clustering — DOSM Datathon 2026
=========================================================
Clusters Malaysian states into 4 tourism profiles:
    - High Demand / High Capacity
    - High Demand / Low Capacity
    - Low Demand / High Potential
    - Low Demand / Low Readiness

Pipeline: load -> engineer features -> standardize -> K-Means (k=4)
          -> profile & auto-label clusters -> visualize -> export

Author: (fill in your team name)
"""

from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

# ---------------------------------------------------------------------------
# STEP 0 — CONFIG: point these at your actual downloaded files
# ---------------------------------------------------------------------------
# Expected input files (edit paths as needed):
#
# 1) consolidated_domestic_tourism.xlsx   columns: State, Year,
#       "Domestic visitor arrivals (000)", "Domestic tourism expenditure (RM million)",
#       "Average length of stay (nights)", "YoY visitor growth rate (%)"
#    -> covers Features #1, #2, #4, #5 (DOSM Domestic Tourism Survey by State)
#
# 2) accommodation.csv   columns: state, year, aor_pct, hotels, rooms
#    -> covers Features #6, #7, #8 (Tourism Malaysia Paid Accommodation Survey PDFs,
#       manually extracted)
#
# 3) hotel_guests.csv    columns: state, year, domestic_guests, international_guests
#    -> covers Feature #3 (international_guests column; from the same Tourism Malaysia PDFs)
#
# 4) population_state.csv  columns: date, state, sex, age, ethnicity, population
#    -> covers Feature #9, used both as a clustering feature (state scale) and as the
#       denominator for pressure/intensity ratios
#    (raw download from open.dosm.gov.my — filter to sex='both', age='overall',
#     ethnicity='overall' before merging; see STEP 1 below)


BASE_DIR = Path(__file__).resolve().parent

DOMESTIC_TOURISM_PATH = str(BASE_DIR / "consolidated_domestic_tourism.xlsx")
ACCOMMODATION_PATH = str(BASE_DIR / "accommodation.xlsx")
HOTEL_GUESTS_PATH = str(BASE_DIR / "hotel_guests.xlsx")
POPULATION_PATH = str(BASE_DIR / "population_state.csv")


# State-name normalization: the domestic tourism file uses DOSM-style names
# (e.g. "W.P. KUALA LUMPUR", "PULAU PINANG"); make sure your other 3 files use
# the same spelling before merging, or adjust STATE_NAME_MAP below.
STATE_NAME_MAP = {
    "WP KUALA LUMPUR": "W.P. KUALA LUMPUR",
    "KUALA LUMPUR": "W.P. KUALA LUMPUR",
    "PENANG": "PULAU PINANG",
    "WP LABUAN": "W.P. LABUAN",
    "LABUAN": "W.P. LABUAN",
    "WP PUTRAJAYA": "W.P. PUTRAJAYA",
    "PUTRAJAYA": "W.P. PUTRAJAYA",
}

RANDOM_STATE = 42
N_CLUSTERS = 4

# ---------------------------------------------------------------------------
# STEP 1 — LOAD & CLEAN
# ---------------------------------------------------------------------------

def normalize_state(name: str) -> str:
    name = str(name).strip().upper()
    return STATE_NAME_MAP.get(name, name)


def load_domestic_tourism(path: str) -> pd.DataFrame:
    """Load Features #1, #2, #4, #5 from the consolidated DOSM domestic tourism file."""
    df = pd.read_excel(path)
    df = df.rename(columns={
        "State": "state",
        "Year": "year",
        "Domestic visitor arrivals (000)": "visitor_arrivals_000",
        "Domestic tourism expenditure (RM million)": "expenditure_rm_million",
        "Average length of stay (nights)": "avg_length_of_stay",
        "YoY visitor growth rate (%)": "yoy_growth_pct",
    })
    df["state"] = df["state"].apply(normalize_state)
    expected = {
        "state", "year", "visitor_arrivals_000", "expenditure_rm_million",
        "avg_length_of_stay", "yoy_growth_pct",
    }
    missing = expected - set(df.columns)
    if missing:
        raise ValueError(f"consolidated_domestic_tourism.xlsx missing columns: {missing}")
    return df


def load_population(path: str) -> pd.DataFrame:
    """Load OpenDOSM population_state.csv and reduce to state x year totals."""
    pop = pd.read_excel(path) if str(path).endswith((".xlsx", ".xls")) else pd.read_csv(path)
    pop["date"] = pd.to_datetime(pop["date"])
    pop["year"] = pop["date"].dt.year
    pop = pop[
        (pop["sex"] == "both")
        & (pop["age"] == "overall")
        & (pop["ethnicity"] == "overall")
    ]
    pop = pop[["state", "year", "population"]].rename(
        columns={"population": "population_thousands"}
    )
    pop["state"] = pop["state"].apply(normalize_state)
    return pop


def load_accommodation(path: str) -> pd.DataFrame:
    df = pd.read_excel(path) if str(path).endswith((".xlsx", ".xls")) else pd.read_csv(path)
    df["state"] = df["state"].apply(normalize_state)
    expected = {"state", "year", "aor_pct", "hotels", "rooms"}
    missing = expected - set(df.columns)
    if missing:
        raise ValueError(f"accommodation file missing columns: {missing}")
    return df


def load_hotel_guests(path: str) -> pd.DataFrame:
    df = pd.read_excel(path) if str(path).endswith((".xlsx", ".xls")) else pd.read_csv(path)
    df["state"] = df["state"].apply(normalize_state)
    expected = {"state", "year", "domestic_guests", "international_guests"}
    missing = expected - set(df.columns)
    if missing:
        raise ValueError(f"hotel_guests file missing columns: {missing}")
    return df


def merge_sources(domestic: pd.DataFrame, acc: pd.DataFrame, guests: pd.DataFrame,
                   pop: pd.DataFrame) -> pd.DataFrame:
    panel = domestic.merge(acc, on=["state", "year"], how="outer")
    panel = panel.merge(guests, on=["state", "year"], how="outer")
    panel = panel.merge(pop, on=["state", "year"], how="left")
    return panel


# ---------------------------------------------------------------------------
# STEP 2 — FEATURE ENGINEERING (panel -> one row per state)
# ---------------------------------------------------------------------------

def engineer_features(panel: pd.DataFrame, baseline_year: int, latest_year: int) -> pd.DataFrame:
    """
    Collapse a state x year panel into one row per state.
    Every one of the 9 features from the table is represented explicitly:

        # 1  Domestic visitor arrivals          -> avg_visitor_arrivals   (Demand)
        # 2  Domestic tourism expenditure        -> avg_expenditure       (Demand)
        # 3  International hotel guests          -> avg_intl_guests       (Demand)
        # 4  Average length of stay              -> avg_length_of_stay    (Demand)
        # 5  YoY visitor growth rate             -> avg_yoy_growth        (Demand trend)
        # 6  Hotel occupancy rate                -> avg_aor               (Capacity)
        # 7  Number of hotels                    -> latest_hotels         (Capacity)
        # 8  Number of hotel rooms               -> latest_rooms          (Capacity)
        # 9  Population                          -> latest_population     (Readiness denominator)

    Averages are used for features that fluctuate year to year (arrivals, expenditure,
    length of stay, AOR, YoY growth, international guests) so a single volatile year
    (e.g. 2020-2021 COVID trough) doesn't dominate. Capacity and population use the
    latest available year, since infrastructure and headcount are stock, not flow,
    variables — you want the current level, not a historical average.
    """
    rows = []
    for state, g in panel.groupby("state"):
        g = g.sort_values("year")
        latest = g[g["year"] == latest_year]

        # --- Feature 1: Domestic visitor arrivals (avg across period) ---
        avg_visitor_arrivals = g["visitor_arrivals_000"].mean()

        # --- Feature 2: Domestic tourism expenditure (avg across period) ---
        avg_expenditure = g["expenditure_rm_million"].mean()

        # --- Feature 3: International hotel guests (avg across period) ---
        avg_intl_guests = g["international_guests"].mean()

        # --- Feature 4: Average length of stay (avg across period) ---
        avg_length_of_stay = g["avg_length_of_stay"].mean()

        # --- Feature 5: YoY visitor growth rate ---
        # Use the file's own YoY column, averaged over non-COVID years (2023-2025)
        # to avoid the 2020-2022 crash/rebound swings dominating the score.
        stable_years = g[g["year"] >= 2023]
        avg_yoy_growth = (
            stable_years["yoy_growth_pct"].mean()
            if not stable_years.empty else g["yoy_growth_pct"].mean()
        )

        # --- Feature 6: Hotel occupancy rate (avg across period) ---
        avg_aor = g["aor_pct"].mean()

        # --- Features 7 & 8: Number of hotels / rooms (latest year = current stock) ---
        latest_hotels = latest["hotels"].values[0] if not latest.empty else np.nan
        latest_rooms = latest["rooms"].values[0] if not latest.empty else np.nan

        # --- Feature 9: Population (latest year) ---
        latest_population = (
            latest["population_thousands"].values[0] if not latest.empty else np.nan
        )

        # --- Derived pressure/intensity ratios (denominator = Feature 9) ---
        rooms_per_1k_pop = (
            latest_rooms / latest_population if latest_population else np.nan
        )
        visitors_per_capita = (
            (avg_visitor_arrivals * 1000) / (latest_population * 1000)
            if latest_population else np.nan
        )

        rows.append({
            "state": state,
            "avg_visitor_arrivals": avg_visitor_arrivals,        # Feature 1
            "avg_expenditure": avg_expenditure,                  # Feature 2
            "avg_intl_guests": avg_intl_guests,                  # Feature 3
            "avg_length_of_stay": avg_length_of_stay,            # Feature 4
            "avg_yoy_growth": avg_yoy_growth,                    # Feature 5
            "avg_aor": avg_aor,                                  # Feature 6
            "latest_hotels": latest_hotels,                      # Feature 7
            "latest_rooms": latest_rooms,                        # Feature 8
            "latest_population": latest_population,              # Feature 9
            "rooms_per_1k_pop": rooms_per_1k_pop,                # derived (readiness)
            "visitors_per_capita": visitors_per_capita,          # derived (pressure)
        })

    features = pd.DataFrame(rows).set_index("state")
    return features


# ---------------------------------------------------------------------------
# STEP 3 — STANDARDIZE & CONSTRUCT SCORES
# ---------------------------------------------------------------------------

def standardize_and_score(features: pd.DataFrame):
    features_clean = features.fillna(features.median(numeric_only=True))
    scaler = StandardScaler()
    
    # Standardize all columns (useful for interpretation later)
    z_scores = scaler.fit_transform(features_clean)
    z_df = pd.DataFrame(z_scores, columns=features_clean.columns, index=features_clean.index)
    
    # Construct Demand Score and Capacity Score
    demand_features = [
        "avg_visitor_arrivals",
        "avg_expenditure",
        "avg_intl_guests",
        "avg_length_of_stay",
        "avg_yoy_growth"
    ]
    
    capacity_features = [
        "latest_hotels",
        "latest_rooms",
        "rooms_per_1k_pop"
    ]
    
    features_clean["demand_score"] = z_df[demand_features].mean(axis=1)
    features_clean["capacity_score"] = z_df[capacity_features].mean(axis=1)
    
    # The X matrix for K-Means is JUST the two scores
    X = features_clean[["demand_score", "capacity_score"]].values
    
    return X, features_clean, scaler


# ---------------------------------------------------------------------------
# STEP 4 — CHOOSE K (diagnostic only — we still use k=4 for interpretability)
# ---------------------------------------------------------------------------

def plot_k_diagnostics(X: np.ndarray, k_range=range(2, 8), out_path=None):
    if out_path is None:
        out_path = str(BASE_DIR / "k_diagnostics.png")
    inertias, sil_scores = [], []
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10).fit(X)
        inertias.append(km.inertia_)
        sil_scores.append(silhouette_score(X, km.labels_))

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].plot(list(k_range), inertias, marker="o")
    axes[0].set_title("Elbow method")
    axes[0].set_xlabel("k")
    axes[0].set_ylabel("Inertia")

    axes[1].plot(list(k_range), sil_scores, marker="o", color="darkorange")
    axes[1].set_title("Silhouette score")
    axes[1].set_xlabel("k")
    axes[1].set_ylabel("Score")

    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"Saved k-diagnostics plot -> {out_path}")


# ---------------------------------------------------------------------------
# STEP 5 — RUN K-MEANS
# ---------------------------------------------------------------------------

def run_kmeans(X: np.ndarray, k: int = N_CLUSTERS):
    km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
    labels = km.fit_predict(X)
    return km, labels


# ---------------------------------------------------------------------------
# STEP 6 — PROFILE & AUTO-LABEL CLUSTERS
# ---------------------------------------------------------------------------

def profile_and_label(features_clean: pd.DataFrame, labels: np.ndarray) -> tuple:
    result = features_clean.copy()
    result["cluster"] = labels

    demand_median = result["demand_score"].median()
    capacity_median = result["capacity_score"].median()

    def get_quadrant(d, c, d_thresh, c_thresh):
        high_d = d >= d_thresh
        high_c = c >= c_thresh
        if high_d and high_c:
            return "High Demand / High Capacity"
        elif high_d and not high_c:
            return "High Demand / Low Capacity"
        elif not high_d and high_c:
            return "Low Demand / High Potential"
        else:
            return "Low Demand / Low Readiness"

    # Evaluate each cluster based on its centroid
    cluster_summary = result.groupby("cluster")[["demand_score", "capacity_score"]].mean()
    cluster_summary["profile_label"] = cluster_summary.apply(
        lambda r: get_quadrant(r["demand_score"], r["capacity_score"], demand_median, capacity_median),
        axis=1
    )
    
    label_map = cluster_summary["profile_label"].to_dict()
    result["profile_label"] = result["cluster"].map(label_map)
    
    # State-level quadrant (evaluates each state independently against medians)
    result["state_quadrant"] = result.apply(
        lambda r: get_quadrant(r["demand_score"], r["capacity_score"], demand_median, capacity_median),
        axis=1
    )

    return result, cluster_summary


# ---------------------------------------------------------------------------
# STEP 7 — VISUALIZE
# ---------------------------------------------------------------------------

def plot_clusters(result: pd.DataFrame, out_path=None):
    if out_path is None:
        out_path = str(BASE_DIR / "cluster_scatter.png")

    fig, ax = plt.subplots(figsize=(8, 6))
    
    # Color by the actual 4 clusters found by K-Means
    clusters = sorted(result["cluster"].unique())
    colors = plt.cm.tab10(np.linspace(0, 1, len(clusters)))

    for cluster_id, color in zip(clusters, colors):
        mask = result["cluster"] == cluster_id
        # Get the profile label assigned to this cluster
        profile_lbl = result.loc[mask, "profile_label"].iloc[0]
        label_text = f"Cluster {cluster_id}: {profile_lbl}"
        ax.scatter(result.loc[mask, "demand_score"], result.loc[mask, "capacity_score"], label=label_text, s=80, color=color)

    for state, row in result.iterrows():
        ax.annotate(state, (row["demand_score"], row["capacity_score"]), fontsize=8, alpha=0.8)

    # Plot medians to show the quadrants
    d_median = result["demand_score"].median()
    c_median = result["capacity_score"].median()
    ax.axvline(d_median, color='gray', linestyle='--', alpha=0.5)
    ax.axhline(c_median, color='gray', linestyle='--', alpha=0.5)

    ax.set_xlabel("Demand Score")
    ax.set_ylabel("Capacity Score")
    ax.set_title("Malaysia Tourism State Clusters (K-Means, k=4)")
    ax.legend(fontsize=8, loc="best")
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"Saved cluster scatter plot -> {out_path}")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    BASELINE_YEAR = 2019
    LATEST_YEAR = 2024

    print("Loading data...")
    domestic = load_domestic_tourism(DOMESTIC_TOURISM_PATH)
    acc = load_accommodation(ACCOMMODATION_PATH)
    guests = load_hotel_guests(HOTEL_GUESTS_PATH)
    pop = load_population(POPULATION_PATH)
    panel = merge_sources(domestic, acc, guests, pop)

    print("Engineering features...")
    features = engineer_features(panel, BASELINE_YEAR, LATEST_YEAR)

    print("Standardizing & Computing Scores...")
    X, features_clean, scaler = standardize_and_score(features)

    print("Running k diagnostics (elbow + silhouette)...")
    plot_k_diagnostics(X)

    print(f"Running K-Means with k={N_CLUSTERS}...")
    km, labels = run_kmeans(X, k=N_CLUSTERS)

    print("Profiling and labeling clusters...")
    result, cluster_summary = profile_and_label(features_clean, labels)
    print("\nCluster summary (mean demand/capacity scores):")
    print(cluster_summary)

    print("\nFinal state -> cluster assignment & individual state quadrant:")
    print(result[["cluster", "profile_label", "demand_score", "capacity_score", "state_quadrant", "avg_aor"]])

    print("Plotting scatter...")
    plot_clusters(result)

    out_csv = str(BASE_DIR / "state_cluster_results.csv")
    result.to_csv(out_csv)
    print(f"\nSaved final results -> {out_csv}")


if __name__ == "__main__":
    main()
