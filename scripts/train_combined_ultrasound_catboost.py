import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report, confusion_matrix
from catboost import CatBoostClassifier

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv("../data/features/combined_ultrasound_fused_features.csv")

X = df.drop(columns=["image", "label", "source"])
y = df["label"]

# -----------------------------
# STRATIFIED SPLIT
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# -----------------------------
# MODEL
# -----------------------------
model = CatBoostClassifier(
    iterations=800,
    learning_rate=0.03,
    depth=7,
    loss_function="Logloss",
    eval_metric="AUC",
    random_seed=42,
    verbose=100
)

# -----------------------------
# TRAIN
# -----------------------------
model.fit(
    X_train, y_train,
    eval_set=(X_test, y_test),
    use_best_model=True
)

# -----------------------------
# SAVE MODEL
# -----------------------------
MODEL_DIR = "../models"
os.makedirs(MODEL_DIR, exist_ok=True)

model_path = os.path.join(
    MODEL_DIR, "ultrasound_catboost_combined.cbm"
)

model.save_model(model_path)

print(f"\n✅ Model saved to: {model_path}")


# -----------------------------
# EVALUATE
# -----------------------------
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob >= 0.5).astype(int)

print("\nCombined Dataset Evaluation")
print("ROC-AUC:", roc_auc_score(y_test, y_prob))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
# model.save_model("../models/combined_ultrasound_catboost.cbm")