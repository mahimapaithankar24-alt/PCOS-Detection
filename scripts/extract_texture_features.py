import os
import cv2
import numpy as np
import pandas as pd
from tqdm import tqdm
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern

# -----------------------------
# CONFIG
# -----------------------------
DATASET_NAME = "pcosgen"   # change later to mmotu / pcosgen
IMG_DIR = f"../data/ultrasound/processed/{DATASET_NAME}"
OUTPUT_CSV = f"../data/features/{DATASET_NAME}_ultrasound_texture_features.csv"

IMG_SIZE = 224
LBP_RADIUS = 1
LBP_POINTS = 8 * LBP_RADIUS

# -----------------------------
# FEATURE FUNCTIONS
# -----------------------------
def extract_glcm_features(img):
    glcm = graycomatrix(
        img,
        distances=[1],
        angles=[0],
        levels=256,
        symmetric=True,
        normed=True
    )

    features = {
        "glcm_contrast": graycoprops(glcm, "contrast")[0, 0],
        "glcm_correlation": graycoprops(glcm, "correlation")[0, 0],
        "glcm_energy": graycoprops(glcm, "energy")[0, 0],
        "glcm_homogeneity": graycoprops(glcm, "homogeneity")[0, 0],
    }
    return features


def extract_lbp_features(img):
    lbp = local_binary_pattern(
        img,
        P=LBP_POINTS,
        R=LBP_RADIUS,
        method="uniform"
    )

    hist, _ = np.histogram(
        lbp,
        bins=np.arange(0, LBP_POINTS + 3),
        density=True
    )

    return {f"lbp_{i}": hist[i] for i in range(len(hist))}


# -----------------------------
# MAIN LOOP
# -----------------------------
rows = []

print(f"🔍 Extracting texture features from {DATASET_NAME} dataset...")

for label_name, label in [("pcos", 1), ("non_pcos", 0)]:
    cls_dir = os.path.join(IMG_DIR, label_name)

    for img_name in tqdm(os.listdir(cls_dir), desc=label_name):
        img_path = os.path.join(cls_dir, img_name)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

        glcm_feats = extract_glcm_features(img)
        lbp_feats = extract_lbp_features(img)

        row = {
            "image": img_name,
            "label": label,
            **glcm_feats,
            **lbp_feats
        }
        rows.append(row)

# -----------------------------
# SAVE
# -----------------------------
df = pd.DataFrame(rows)
os.makedirs("../data/features", exist_ok=True)
df.to_csv(OUTPUT_CSV, index=False)

print("\n✅ Texture feature extraction complete")
print("Saved to:", OUTPUT_CSV)
print("Feature shape:", df.shape)
