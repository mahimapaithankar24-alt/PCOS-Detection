import pandas as pd
import os
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# ======================================================
# PATHS
# ======================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "tabular", "tabular_unified_clean.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "catboost_tabular_final.cbm")

# ======================================================
# LOAD DATA
# ======================================================
df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["label"])
y = df["label"]

# ======================================================
# CATEGORICAL FEATURES
# ======================================================
CAT_COLS = [
    "blood_group","cycler/i","pregnanty/n",
    "weight_gainy/n","hair_growthy/n",
    "skin_darkening_y/n","hair_lossy/n",
    "pimplesy/n","fast_food_y/n","reg.exercisey/n"
]

# ======================================================
# SPLIT
# ======================================================
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ======================================================
# TRAIN
# ======================================================
model = CatBoostClassifier(
    iterations=1200,
    depth=6,
    learning_rate=0.03,
    loss_function="Logloss",
    eval_metric="AUC",
    cat_features=CAT_COLS,
    random_seed=42,
    verbose=100,
    early_stopping_rounds=50
)

model.fit(X_train, y_train, eval_set=(X_val, y_val))

# ======================================================
# EVALUATE
# ======================================================
val_probs = model.predict_proba(X_val)[:, 1]
auc = roc_auc_score(y_val, val_probs)
print(f"\n🔥 Validation ROC-AUC: {auc:.4f}")

# ======================================================
# SAVE
# ======================================================
model.save_model(MODEL_PATH)
print("✅ Model saved:", MODEL_PATH)
