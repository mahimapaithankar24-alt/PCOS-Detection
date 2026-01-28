import os
import cv2
import numpy as np
from tqdm import tqdm

# ----------------------------
# PATH CONFIG
# ----------------------------
INPUT_DIR = "../data/ultrasound/standardized/kaggle"
OUTPUT_DIR = "../data/ultrasound/processed/kaggle"

IMG_SIZE = 224

# Create output folders
for cls in ["pcos", "non_pcos"]:
    os.makedirs(os.path.join(OUTPUT_DIR, cls), exist_ok=True)

# ----------------------------
# PREPROCESS FUNCTION
# ----------------------------
def preprocess_image(img_path):
    # Load grayscale
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    # Resize
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

    # Normalize to [0,1]
    img = img.astype(np.float32) / 255.0

    # Median blur (speckle noise)
    img = cv2.medianBlur((img * 255).astype(np.uint8), 5)

    # CLAHE (contrast enhancement)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)

    # Otsu threshold (weak segmentation)
    _, thresh = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Morphological opening (remove small noise)
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    # Apply mask
    processed = cv2.bitwise_and(img, img, mask=mask)

    return processed

# ----------------------------
# MAIN LOOP
# ----------------------------
print("🔄 Preprocessing Kaggle ultrasound images...")

for cls in ["pcos", "non_pcos"]:
    input_cls_dir = os.path.join(INPUT_DIR, cls)
    output_cls_dir = os.path.join(OUTPUT_DIR, cls)

    for img_name in tqdm(os.listdir(input_cls_dir), desc=f"{cls}"):
        src_path = os.path.join(input_cls_dir, img_name)
        dst_path = os.path.join(output_cls_dir, img_name)

        processed_img = preprocess_image(src_path)
        if processed_img is None:
            continue

        cv2.imwrite(dst_path, processed_img)

print("\n✅ Kaggle preprocessing complete.")
