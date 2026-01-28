import os
import shutil
import pandas as pd
from collections import Counter

# ----------------------------
# PATH CONFIG
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PCOSGEN_DIR = os.path.join(BASE_DIR, "../data/ultrasound/raw/pcosgen")
IMAGES_DIR = os.path.join(RAW_PCOSGEN_DIR, "images")
LABEL_FILE = os.path.join(RAW_PCOSGEN_DIR, "class_label.xlsx")

OUTPUT_DIR = os.path.join(BASE_DIR, "../data/ultrasound/standardized/pcosgen")
PCOS_DIR = os.path.join(OUTPUT_DIR, "pcos")
NON_PCOS_DIR = os.path.join(OUTPUT_DIR, "non_pcos")

# ----------------------------
# CREATE OUTPUT DIRECTORIES
# ----------------------------
os.makedirs(PCOS_DIR, exist_ok=True)
os.makedirs(NON_PCOS_DIR, exist_ok=True)

# ----------------------------
# LOAD LABELS (EXCEL FILE)
# ----------------------------
df = pd.read_excel(LABEL_FILE)

# Normalize column names
df.columns = [c.strip().lower() for c in df.columns]

# Infer column names safely
image_col = [c for c in df.columns if "imagepath" in c][0]
label_col = [c for c in df.columns if "healthy" in c][0]

stats = Counter()
missing_files = []

# ----------------------------
# MAIN LOOP
# ----------------------------
for _, row in df.iterrows():
    img_name = str(row[image_col]).strip()
    label = int(row[label_col])

    src_path = os.path.join(IMAGES_DIR, img_name)

    # IMPORTANT: PCOSGen label inversion
    # 0 = PCOS (unhealthy)
    # 1 = Non-PCOS (healthy)
    if label == 0:
        dst_dir = PCOS_DIR
        stats["pcos"] += 1
    else:
        dst_dir = NON_PCOS_DIR
        stats["non_pcos"] += 1

    if not os.path.exists(src_path):
        missing_files.append(img_name)
        continue

    shutil.copy2(src_path, os.path.join(dst_dir, img_name))

# ----------------------------
# SUMMARY
# ----------------------------
print("\n===== PCOSGEN CONVERSION SUMMARY =====")
print(f"PCOS images      : {stats['pcos']}")
print(f"Non-PCOS images  : {stats['non_pcos']}")
print(f"Total copied     : {stats['pcos'] + stats['non_pcos']}")

if missing_files:
    print("\n⚠️ Missing image files:")
    for m in missing_files:
        print(" -", m)
else:
    print("\n✅ No missing image files detected.")
