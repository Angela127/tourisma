import pandas as pd

with open('src/data/overviewData.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Make KpiCardConfig fields non-optional or have default types
code = code.replace("iconSvg?: string;", "iconSvg: string;")
code = code.replace("unit?: string;", "unit: string;")
code = code.replace("visitorsTotal?: number;", "visitorsTotal: number;")
code = code.replace("visitorsDomestic?: number;", "visitorsDomestic: number;")
code = code.replace("visitorsInternational?: number;", "visitorsInternational: number;")
code = code.replace("receipts?: number;", "receipts: number;")
code = code.replace("pressureScore?: number;", "pressureScore: number;")
code = code.replace("bindingConstraint?: string;", "bindingConstraint: string;")
code = code.replace("pressureTrend?: 'up' | 'down' | 'stable';", "pressureTrend: 'up' | 'down' | 'stable';")
code = code.replace("topAttractions?: string[];", "topAttractions: string[];")
code = code.replace("keyInsight?: string;", "keyInsight: string;")
code = code.replace("monthlyTrend?: number[];", "monthlyTrend: number[];")
code = code.replace("cluster?: ClusterType;", "cluster: ClusterType;")
code = code.replace("currentYear?: number;", "currentYear: number;")
code = code.replace("previousYear?: number;", "previousYear: number;")

with open('src/data/overviewData.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated overviewData.ts successfully.")
