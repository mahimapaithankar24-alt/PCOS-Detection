# import os
# import pandas as pd
# from sklearn.linear_model import LogisticRegression
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import roc_auc_score
# import joblib

# BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# DATA_PATH = os.path.join(
#     BASE_DIR, "data", "tabular", "meta_training.csv"
# )

# MODEL_OUT = os.path.join(
#     BASE_DIR, "models", "meta_learner.pkl"
# )

# df = pd.read_csv(DATA_PATH)

# X = df.drop(columns=["label"])
# y = df["label"]

# X_train, X_val, y_train, y_val = train_test_split(
#     X, y, test_size=0.2, stratify=y, random_state=42
# )

# meta_model = LogisticRegression(
#     penalty="l2",
#     C=0.5,
#     class_weight="balanced",
#     max_iter=1000
# )

# meta_model.fit(X_train, y_train)

# preds = meta_model.predict_proba(X_val)[:, 1]
# auc = roc_auc_score(y_val, preds)

# print(f"🔥 Meta Learner ROC-AUC: {auc:.4f}")

# joblib.dump(meta_model, MODEL_OUT)
# print(f"✅ Meta model saved to: {MODEL_OUT}")


import pandas as pd
import joblib

df = pd.read_csv("../data/tabular/meta_training.csv")
meta = joblib.load("../models/meta_learner.pkl")

probs = meta.predict_proba(df.drop(columns=["label"]))[:,1]

print("PCOS mean:", probs[df.label == 1].mean())
print("Non-PCOS mean:", probs[df.label == 0].mean())
