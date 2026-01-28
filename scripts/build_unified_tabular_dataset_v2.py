import pandas as pd
import numpy as np
import os
import re

# ======================================================
# PATHS
# ======================================================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PCOS_PATH = os.path.join(BASE_DIR, "data", "tabular", "PCOS.xlsx")
INFERT_PATH = os.path.join(BASE_DIR, "data", "tabular", "PCOS_infertility.xlsx")
OUT_PATH = os.path.join(BASE_DIR, "data", "tabular", "tabular_unified_clean.csv")

# ======================================================
# LOAD
# ======================================================
df1 = pd.read_excel(PCOS_PATH)
df2 = pd.read_excel(INFERT_PATH)

# ======================================================
# RENAME COLUMNS (same as before)
# ======================================================
COLUMN_MAP = {
    "Age (yrs)": "age_yrs",
    "Weight (Kg)": "weight_kg",
    "Height(Cm)": "heightcm",
    "BMI": "bmi",
    "Blood Group": "blood_group",
    "Pulse rate(bpm)": "pulse_ratebpm",
    "RR (breaths/min)": "rr_breaths/min",
    "Hb(g/dl)": "hbg/dl",
    "Cycle(R/I)": "cycler/i",
    "Cycle length(days)": "cycle_lengthdays",
    "Marraige Status (Yrs)": "marraige_status_yrs",
    "Pregnant(Y/N)": "pregnanty/n",
    "No. of aborptions": "no._of_aborptions",
    "I   beta-HCG(mIU/mL)": "i___beta-hcgmiu/ml",
    "II    beta-HCG(mIU/mL)": "ii____beta-hcgmiu/ml",
    "FSH(mIU/mL)": "fshmiu/ml",
    "LH(mIU/mL)": "lhmiu/ml",
    "FSH/LH": "fsh/lh",
    "Hip(inch)": "hipinch",
    "Waist(inch)": "waistinch",
    "Waist:Hip Ratio": "waist:hip_ratio",
    "TSH (mIU/L)": "tsh_miu/l",
    "AMH(ng/mL)": "amhng/ml",
    "PRL(ng/mL)": "prlng/ml",
    "Vit D3 (ng/mL)": "vit_d3_ng/ml",
    "PRG(ng/mL)": "prgng/ml",
    "RBS(mg/dl)": "rbsmg/dl",
    "Weight gain(Y/N)": "weight_gainy/n",
    "hair growth(Y/N)": "hair_growthy/n",
    "Skin darkening (Y/N)": "skin_darkening_y/n",
    "Hair loss(Y/N)": "hair_lossy/n",
    "Pimples(Y/N)": "pimplesy/n",
    "Fast food (Y/N)": "fast_food_y/n",
    "Reg.Exercise(Y/N)": "reg.exercisey/n",
    "BP _Systolic (mmHg)": "bp__systolic_mmhg",
    "BP _Diastolic (mmHg)": "bp__diastolic_mmhg",
    "Follicle No. (L)": "follicle_no._l",
    "Follicle No. (R)": "follicle_no._r",
    "Avg. F size (L) (mm)": "avg._f_size_l_mm",
    "Avg. F size (R) (mm)": "avg._f_size_r_mm",
    "Endometrium (mm)": "endometrium_mm",
    "PCOS (Y/N)": "label"
}

df1 = df1.rename(columns=COLUMN_MAP)
df2 = df2.rename(columns=COLUMN_MAP)

# ======================================================
# DROP IDs
# ======================================================
DROP = ["sl. no", "patient file no.", "unnamed: 44"]
df1 = df1.drop(columns=[c for c in df1.columns if c.lower() in DROP], errors="ignore")
df2 = df2.drop(columns=[c for c in df2.columns if c.lower() in DROP], errors="ignore")

# ======================================================
# MERGE SCHEMAS
# ======================================================
FEATURES = sorted(set(df1.columns) | set(df2.columns))
FEATURES.remove("label")

for col in FEATURES:
    if col not in df1:
        df1[col] = np.nan
    if col not in df2:
        df2[col] = np.nan

df = pd.concat([df1, df2], ignore_index=True)

# ======================================================
# DEFINE FEATURE TYPES
# ======================================================
CAT_COLS = [
    "blood_group","cycler/i","pregnanty/n",
    "weight_gainy/n","hair_growthy/n",
    "skin_darkening_y/n","hair_lossy/n",
    "pimplesy/n","fast_food_y/n","reg.exercisey/n"
]

NUM_COLS = [c for c in FEATURES if c not in CAT_COLS]

# ======================================================
# CLEAN NUMERIC — HARD
# ======================================================
for col in NUM_COLS:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(r"[^\d\.-]", "", regex=True)
        .replace("", np.nan)
    )
    df[col] = pd.to_numeric(df[col], errors="coerce")

# ======================================================
# CLEAN CATEGORICAL — HARD
# ======================================================
for col in CAT_COLS:
    df[col] = (
        df[col]
        .astype(str)
        .str.strip()
        .replace({"": "Unknown", "nan": "Unknown", "None": "Unknown"})
    )

# ======================================================
# SAVE
# ======================================================
df.to_csv(OUT_PATH, index=False)
print("✅ CLEAN DATASET READY:", OUT_PATH)
print("Shape:", df.shape)
print("Null %:\n", df.isna().mean().sort_values(ascending=False).head())
