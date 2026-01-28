import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score
)
from catboost import CatBoostClassifier

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv("../data/features/kaggle_ultrasound_fused_features.csv")

X = df.drop(columns=["image", "label"])
y = df["label"]

# -----------------------------
# TRAIN / TEST SPLIT
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# -----------------------------
# CATBOOST MODEL
# -----------------------------
model = CatBoostClassifier(
    iterations=500,
    learning_rate=0.05,
    depth=6,
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
# EVALUATION
# -----------------------------
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob >= 0.5).astype(int)
model.save_model("../models/kaggle_ultrasound_catboost.cbm")
print("\nROC-AUC:", roc_auc_score(y_test, y_prob))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
