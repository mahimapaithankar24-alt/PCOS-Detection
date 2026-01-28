import os
import shutil
from collections import Counter

# ----------------------------
# PATH CONFIG (adjust if needed)
# ----------------------------
RAW_MMOTU_DIR = "../data/ultrasound/raw/mmotu"
IMAGES_DIR = os.path.join(RAW_MMOTU_DIR, "images")
TRAIN_CLS = os.path.join(RAW_MMOTU_DIR, "train_cls.txt")
VAL_CLS = os.path.join(RAW_MMOTU_DIR, "val_cls.txt")

OUTPUT_DIR = "../data/ultrasound/standardized/mmotu"
PCOS_DIR = os.path.join(OUTPUT_DIR, "pcos")
NON_PCOS_DIR = os.path.join(OUTPUT_DIR, "non_pcos")

# ----------------------------
# CREATE OUTPUT DIRECTORIES
# ----------------------------
os.makedirs(PCOS_DIR, exist_ok=True)
os.makedirs(NON_PCOS_DIR, exist_ok=True)

# ----------------------------
# HELPER FUNCTION
# ----------------------------
def process_cls_file(cls_file, stats):
    missing_files = []

    with open(cls_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            img_name, label = line.split()
            label = int(label)

            src_path = os.path.join(IMAGES_DIR, img_name)

            # Binary mapping (IMPORTANT)
            if label >= 4:
                dst_dir = PCOS_DIR
                stats["pcos"] += 1
            else:
                dst_dir = NON_PCOS_DIR
                stats["non_pcos"] += 1

            if not os.path.exists(src_path):
                missing_files.append(img_name)
                continue

            dst_path = os.path.join(dst_dir, img_name)

            # Copy (not move) to preserve raw dataset
            shutil.copy2(src_path, dst_path)

    return missing_files

# ----------------------------
# MAIN EXECUTION
# ----------------------------
stats = Counter()
all_missing = []

print("Processing train_cls.txt...")
all_missing.extend(process_cls_file(TRAIN_CLS, stats))

print("Processing val_cls.txt...")
all_missing.extend(process_cls_file(VAL_CLS, stats))

# ----------------------------
# SUMMARY
# ----------------------------
print("\n===== MMOTU CONVERSION SUMMARY =====")
print(f"PCOS images      : {stats['pcos']}")
print(f"Non-PCOS images  : {stats['non_pcos']}")
print(f"Total copied     : {stats['pcos'] + stats['non_pcos']}")

if all_missing:
    print("\n⚠️ Missing image files:")
    for m in all_missing:
        print(" -", m)
else:
    print("\n✅ No missing image files detected.")
