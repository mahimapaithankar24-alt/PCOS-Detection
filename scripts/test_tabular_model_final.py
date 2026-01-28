import pandas as pd
from catboost import CatBoostClassifier, Pool

MODEL_PATH = "../models/catboost_tabular_final.cbm"
DATA_PATH = "../data/tabular/tabular_unified_clean.csv"

CAT_COLS = [
    "blood_group","cycler/i","pregnanty/n",
    "weight_gainy/n","hair_growthy/n",
    "skin_darkening_y/n","hair_lossy/n",
    "pimplesy/n","fast_food_y/n","reg.exercisey/n"
]

# Load
df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["label"])
y = df["label"]

# Cast categoricals
for col in CAT_COLS:
    X[col] = X[col].astype(str)

pool = Pool(X, cat_features=CAT_COLS)

model = CatBoostClassifier()
model.load_model(MODEL_PATH)

probs = model.predict_proba(pool)[:, 1]

print("Mean PCOS probability (label=1):", probs[y == 1].mean())
print("Mean Non-PCOS probability (label=0):", probs[y == 0].mean())
