import os
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# ======================================================
# CONFIG — CHANGE ONLY THIS
# ======================================================
DATASET_NAME = "symptom"  
# options: hormonal | metabolic | symptom

# ======================================================
# PATHS (ABSOLUTE, SAFE)
# ======================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATA_PATH = os.path.join(
    BASE_DIR, "data", "tabular", f"tabular_{DATASET_NAME}_expert.csv"
)

MODEL_OUT = os.path.join(
    BASE_DIR, "models", f"expert_{DATASET_NAME}.cbm"
)

# ======================================================
# LOAD DATA
# ======================================================
print(f"🔄 Loading dataset: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

assert "label" in df.columns, "❌ label column missing"

X = df.drop(columns=["label"])
y = df["label"]

# Detect categorical columns safely
cat_cols = X.select_dtypes(include=["object"]).columns.tolist()

print("Categorical columns:", cat_cols)

# ======================================================
# TRAIN / VAL SPLIT
# ======================================================
X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# ======================================================
# MODEL
# ======================================================
model = CatBoostClassifier(
    iterations=800,
    learning_rate=0.05,
    depth=6,
    loss_function="Logloss",
    eval_metric="AUC",
    cat_features=cat_cols,
    random_seed=42,
    early_stopping_rounds=50,
    verbose=100
)

print("🚀 Training expert:", DATASET_NAME)
model.fit(
    X_train,
    y_train,
    eval_set=(X_val, y_val),
    use_best_model=True
)

# ======================================================
# EVALUATION
# ======================================================
val_probs = model.predict_proba(X_val)[:, 1]
auc = roc_auc_score(y_val, val_probs)

print(f"🔥 Validation ROC-AUC ({DATASET_NAME}): {auc:.4f}")

# ======================================================
# SAVE MODEL
# ======================================================
model.save_model(MODEL_OUT)
print(f"✅ Model saved to: {MODEL_OUT}")
