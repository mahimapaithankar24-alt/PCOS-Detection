import pandas as pd
import os

BASE_PATH = "../data/tabular"
INPUT_FILE = f"{BASE_PATH}/tabular_unified_clean.csv"

df = pd.read_csv(INPUT_FILE)

TARGET = "label"

HORMONAL_FEATURES = [
    "fshmiu/ml","lhmiu/ml","fsh/lh","amhng/ml",
    "tsh_miu/l","prlng/ml","prgng/ml",
    "i___beta-hcgmiu/ml","ii____beta-hcgmiu/ml"
]

METABOLIC_FEATURES = [
    "bmi","weight_kg","waistinch","hipinch",
    "waist:hip_ratio","rbsmg/dl","weight_gainy/n"
]

SYMPTOM_FEATURES = [
    "cycler/i","cycle_lengthdays","hair_growthy/n",
    "hair_lossy/n","skin_darkening_y/n",
    "pimplesy/n","fast_food_y/n","reg.exercisey/n"
]

EXPERTS = {
    "hormonal": HORMONAL_FEATURES,
    "metabolic": METABOLIC_FEATURES,
    "symptom": SYMPTOM_FEATURES,
}

os.makedirs(BASE_PATH, exist_ok=True)

for name, features in EXPERTS.items():
    expert_df = df[features + [TARGET]]
    out_path = f"{BASE_PATH}/tabular_{name}_expert.csv"
    expert_df.to_csv(out_path, index=False)
    print(f"✅ Saved {out_path}")
