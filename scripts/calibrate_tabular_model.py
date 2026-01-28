import joblib
import pandas as pd
import numpy as np
from catboost import CatBoostClassifier
from sklearn.isotonic import IsotonicRegression
from sklearn.model_selection import train_test_split

# -------------------------------
# PATHS
# -------------------------------
MODEL_PATH = "../models/catboost_tabular_final.cbm"
DATA_PATH = "../data/tabular/tabular_unified_clean.csv" 
CALIBRATOR_PATH = "../models/tabular_isotonic_calibrator.pkl"

TARGET_COL = "label"

# -------------------------------
# LOAD DATA
# -------------------------------
df = pd.read_csv(DATA_PATH)

X = df.drop(columns=[TARGET_COL])
y = df[TARGET_COL]

# -------------------------------
# SPLIT (important!)
# -------------------------------
X_train, X_cal, y_train, y_cal = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)

# -------------------------------
# LOAD MODEL
# -------------------------------
model = CatBoostClassifier()
model.load_model(MODEL_PATH)

# -------------------------------
# RAW PROBABILITIES
# -------------------------------
raw_probs = model.predict_proba(X_cal)[:, 1]

# -------------------------------
# FIT ISOTONIC REGRESSION
# -------------------------------
calibrator = IsotonicRegression(out_of_bounds="clip")
calibrator.fit(raw_probs, y_cal)

# -------------------------------
# SAVE CALIBRATOR
# -------------------------------
joblib.dump(calibrator, CALIBRATOR_PATH)

print("✅ Calibration complete")
print(f"Saved to: {CALIBRATOR_PATH}")

# -------------------------------
# QUICK SANITY CHECK
# -------------------------------
calibrated_probs = calibrator.transform(raw_probs)

print("\nMean probabilities:")
print("Raw PCOS:", raw_probs[y_cal == 1].mean())
print("Raw Non-PCOS:", raw_probs[y_cal == 0].mean())
print("Calibrated PCOS:", calibrated_probs[y_cal == 1].mean())
print("Calibrated Non-PCOS:", calibrated_probs[y_cal == 0].mean())
