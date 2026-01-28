import shap
import pandas as pd
import matplotlib.pyplot as plt
from catboost import CatBoostClassifier

# -----------------------------
# LOAD MODEL
# -----------------------------
model = CatBoostClassifier()
model.load_model("../models/ultrasound_catboost_combined.cbm")

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv("../data/features/combined_ultrasound_fused_features.csv")

X = df.drop(columns=["image", "label", "source"])
y = df["label"]

print("Data loaded:", X.shape)

# -----------------------------
# SHAP EXPLAINER
# -----------------------------
explainer = shap.TreeExplainer(model)

X_sample = X.sample(300, random_state=42)

shap_values = explainer.shap_values(X_sample)
expected_value = explainer.expected_value

print("SHAP values computed")

# -----------------------------
# GLOBAL IMPORTANCE
# -----------------------------
shap.summary_plot(
    shap_values,
    X_sample,
    plot_type="bar"
)

# -----------------------------
# DETAILED DISTRIBUTION
# -----------------------------
shap.summary_plot(
    shap_values,
    X_sample
)

# -----------------------------
# LOCAL EXPLANATION
# -----------------------------
idx = 0
shap.force_plot(
    expected_value,
    shap_values[idx],
    X_sample.iloc[idx],
    matplotlib=True
)

plt.tight_layout()
plt.savefig("../results/shap_ultrasound_global_importance.png", dpi=300)
plt.show()
