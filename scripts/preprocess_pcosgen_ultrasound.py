import os
import cv2
import numpy as np
from tqdm import tqdm

# ----------------------------
# PATH CONFIG (ROBUST)
# ----------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

INPUT_DIR = os.path.join(
    PROJECT_ROOT, "data", "ultrasound", "standardized", "pcosgen"
)
OUTPUT_DIR = os.path.join(
    PROJECT_ROOT, "data", "ultrasound", "processed", "pcosgen"
)

IMG_SIZE = 224

for cls in ["pcos", "non_pcos"]:
    os.makedirs(os.path.join(OUTPUT_DIR, cls), exist_ok=True)

# ----------------------------
# PREPROCESS FUNCTION (UNCHANGED)
# ----------------------------
def preprocess_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    img = cv2.medianBlur((img * 255).astype(np.uint8), 5)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)

    _, thresh = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    processed = cv2.bitwise_and(img, img, mask=mask)
    return processed

# ----------------------------
# MAIN LOOP
# ----------------------------
print("🔄 Preprocessing PCOSGen ultrasound images...")

for cls in ["pcos", "non_pcos"]:
    in_dir = os.path.join(INPUT_DIR, cls)
    out_dir = os.path.join(OUTPUT_DIR, cls)

    for img_name in tqdm(os.listdir(in_dir), desc=f"{cls}"):
        src = os.path.join(in_dir, img_name)
        dst = os.path.join(out_dir, img_name)

        processed = preprocess_image(src)
        if processed is not None:
            cv2.imwrite(dst, processed)

print("\n✅ PCOSGen preprocessing complete.")
