import pandas as pd
from catboost import CatBoostClassifier
from sklearn.metrics import (
    roc_auc_score,
    classification_report,
    confusion_matrix
)

# -----------------------------
# LOAD DATA
# -----------------------------
train_df = pd.read_csv("../data/features/kaggle_ultrasound_fused_features.csv")
test_df  = pd.read_csv("../data/features/mmotu_ultrasound_fused_features.csv")

X_train = train_df.drop(columns=["image", "label"])
y_train = train_df["label"]

X_test = test_df.drop(columns=["image", "label"])
y_test = test_df["label"]

# -----------------------------
# TRAIN MODEL
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

model.fit(X_train, y_train)

# -----------------------------
# EVALUATE
# -----------------------------
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob >= 0.5).astype(int)

print("\nCross-Dataset Evaluation: Kaggle → MMOTU")
print("ROC-AUC:", roc_auc_score(y_test, y_prob))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
