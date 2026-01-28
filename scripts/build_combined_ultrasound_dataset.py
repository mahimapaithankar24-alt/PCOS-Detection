import pandas as pd

# -----------------------------
# LOAD DATASETS
# -----------------------------
kaggle = pd.read_csv("../data/features/kaggle_ultrasound_fused_features.csv")
mmotu  = pd.read_csv("../data/features/mmotu_ultrasound_fused_features.csv")
pcosgen = pd.read_csv("../data/features/pcosgen_ultrasound_fused_features.csv")

# -----------------------------
# ADD SOURCE COLUMN (IMPORTANT)
# -----------------------------
kaggle["source"] = "kaggle"
mmotu["source"] = "mmotu"
pcosgen["source"] = "pcosgen"

# -----------------------------
# COMBINE
# -----------------------------
combined = pd.concat([kaggle, mmotu, pcosgen], ignore_index=True)

# -----------------------------
# SAVE
# -----------------------------
out_path = "../data/features/combined_ultrasound_fused_features.csv"
combined.to_csv(out_path, index=False)

print("✅ Combined dataset created")
print("Shape:", combined.shape)
print("Label distribution:\n", combined["label"].value_counts())
print("Source distribution:\n", combined["source"].value_counts())
print("Saved to:", out_path)