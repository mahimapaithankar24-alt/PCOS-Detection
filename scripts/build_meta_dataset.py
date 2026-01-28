import os
import pandas as pd
import numpy as np
from catboost import CatBoostClassifier

# =====================================================
# PATHS
# =====================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data", "tabular")
MODEL_DIR = os.path.join(BASE_DIR, "models")
OUT_PATH = os.path.join(DATA_DIR, "meta_training.csv")

# =====================================================
# EXPERT CONFIG
# =====================================================
EXPERTS = {
    "hormonal": {
        "data": "tabular_hormonal_expert.csv",
        "model": "expert_hormonal.cbm",
    },
    "metabolic": {
        "data": "tabular_metabolic_expert.csv",
        "model": "expert_metabolic.cbm",
    },
    "symptom": {
        "data": "tabular_symptom_expert.csv",
        "model": "expert_symptom.cbm",
    },
}

print("🔄 Building meta-training dataset with interaction features...")

meta_df = None
labels = None

# =====================================================
# COLLECT EXPERT PREDICTIONS
# =====================================================
for expert_name, cfg in EXPERTS.items():
    print(f"➡️ Loading expert: {expert_name}")

    df = pd.read_csv(os.path.join(DATA_DIR, cfg["data"]))
    X = df.drop(columns=["label"])
    y = df["label"]

    model = CatBoostClassifier()
    model.load_model(os.path.join(MODEL_DIR, cfg["model"]))

    probs = model.predict_proba(X)[:, 1]

    if meta_df is None:
        meta_df = pd.DataFrame(index=df.index)
        labels = y.reset_index(drop=True)

    meta_df[f"{expert_name}_prob"] = probs

# =====================================================
# ADD INTERACTION / CONFIDENCE FEATURES (CRITICAL)
# =====================================================
meta_df["max_prob"] = meta_df[
    ["hormonal_prob", "metabolic_prob", "symptom_prob"]
].max(axis=1)

meta_df["mean_prob"] = meta_df[
    ["hormonal_prob", "metabolic_prob", "symptom_prob"]
].mean(axis=1)

meta_df["std_prob"] = meta_df[
    ["hormonal_prob", "metabolic_prob", "symptom_prob"]
].std(axis=1)

meta_df["hormonal_symptom_gap"] = (
    meta_df["hormonal_prob"] - meta_df["symptom_prob"]
).abs()

meta_df["hormonal_metabolic_gap"] = (
    meta_df["hormonal_prob"] - meta_df["metabolic_prob"]
).abs()

meta_df["symptom_metabolic_gap"] = (
    meta_df["symptom_prob"] - meta_df["metabolic_prob"]
).abs()

# =====================================================
# FINALIZE
# =====================================================
meta_df["label"] = labels.values

meta_df.to_csv(OUT_PATH, index=False)

print(f"✅ Meta dataset saved to: {OUT_PATH}")
print("\nPreview:")
print(meta_df.head())
