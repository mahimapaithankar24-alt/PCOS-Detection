import pandas as pd
import os

# -----------------------------
# PATHS
# -----------------------------
CNN_CSV = "../data/features/pcosgen_ultrasound_cnn_features.csv"
TEX_CSV = "../data/features/pcosgen_ultrasound_texture_features.csv"
OUT_CSV = "../data/features/pcosgen_ultrasound_fused_features.csv"

# -----------------------------
# LOAD
# -----------------------------
cnn_df = pd.read_csv(CNN_CSV)
tex_df = pd.read_csv(TEX_CSV)

# -----------------------------
# MERGE ON IMAGE
# -----------------------------
df = cnn_df.merge(
    tex_df,
    on=["image", "label"],
    how="inner"
)

# -----------------------------
# SAVE
# -----------------------------
df.to_csv(OUT_CSV, index=False)

print("✅ Feature fusion complete")
print("Final shape:", df.shape)
print("Saved to:", OUT_CSV)
