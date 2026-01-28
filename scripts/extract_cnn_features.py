import os
import numpy as np
import pandas as pd
from tqdm import tqdm
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# ----------------------------
# PATH CONFIG
# ----------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

DATA_DIR = os.path.join(
    PROJECT_ROOT, "data", "ultrasound", "processed", "pcosgen"
)
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "data", "features")
os.makedirs(OUTPUT_DIR, exist_ok=True)

OUTPUT_CSV = os.path.join(OUTPUT_DIR, "pcosgen_ultrasound_cnn_features.csv")

IMG_SIZE = 224

# ----------------------------
# LOAD PRETRAINED CNN
# ----------------------------
model = ResNet50(
    weights="imagenet",
    include_top=False,
    pooling="avg",   # IMPORTANT: global average pooling
    input_shape=(224, 224, 3)
)

model.trainable = False  # freeze

print("✅ ResNet50 loaded as feature extractor")

# ----------------------------
# FEATURE EXTRACTION
# ----------------------------
rows = []

for label_name, label_value in [("pcos", 1), ("non_pcos", 0)]:
    class_dir = os.path.join(DATA_DIR, label_name)

    for img_name in tqdm(os.listdir(class_dir), desc=label_name):
        img_path = os.path.join(class_dir, img_name)

        # Load image (convert grayscale → RGB)
        img = load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
        img = img_to_array(img)
        img = np.expand_dims(img, axis=0)

        img = preprocess_input(img)

        # Extract features
        features = model.predict(img, verbose=0)[0]

        row = {
            "image": img_name,
            "label": label_value
        }

        for i, val in enumerate(features):
            row[f"f_{i}"] = val

        rows.append(row)

# ----------------------------
# SAVE FEATURES
# ----------------------------
df = pd.DataFrame(rows)
df.to_csv(OUTPUT_CSV, index=False)

print(f"\n✅ CNN features saved to:\n{OUTPUT_CSV}")
print(f"Feature shape: {df.shape}")
