import os
import cv2
import numpy as np
import pandas as pd
import joblib
from catboost import CatBoostClassifier, Pool
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from skimage.feature import local_binary_pattern

# =====================================================
# PATH SETUP
# =====================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MODEL_DIR = os.path.join(BASE_DIR, "models")

# =====================================================
# LOAD TABULAR EXPERT MODELS
# =====================================================
EXPERT_MODELS = {
    "hormonal": CatBoostClassifier(),
    "metabolic": CatBoostClassifier(),
    "symptom": CatBoostClassifier(),
}

EXPERT_MODELS["hormonal"].load_model(
    os.path.join(MODEL_DIR, "expert_hormonal.cbm")
)
EXPERT_MODELS["metabolic"].load_model(
    os.path.join(MODEL_DIR, "expert_metabolic.cbm")
)
EXPERT_MODELS["symptom"].load_model(
    os.path.join(MODEL_DIR, "expert_symptom.cbm")
)

META_MODEL = joblib.load(
    os.path.join(MODEL_DIR, "meta_learner.pkl")
)

# =====================================================
# CLINICAL DATA SUFFICIENCY RULES
# =====================================================

# Absolute required fields
REQUIRED_CORE_FIELDS = [
    "age_yrs",
    "cycler/i",
    "cycle_lengthdays",
]

# At least ONE hormonal indicator
HORMONAL_FIELDS = [
    "lhmiu/ml",
    "fshmiu/ml",
    "amhng/ml",
]

# At least ONE ovarian morphology indicator
OVARIAN_FIELDS = [
    "follicle_no._l",
    "follicle_no._r",
    "avg._f_size_l_mm",
    "avg._f_size_r_mm",
    "endometrium_mm",
]

# Minimum numeric fields required overall
MIN_NUMERIC_FIELDS = 6


# =====================================================
# LOAD ULTRASOUND MODEL
# =====================================================
ultrasound_model = CatBoostClassifier()
ultrasound_model.load_model(
    os.path.join(MODEL_DIR, "ultrasound_catboost_combined.cbm")
)

ULTRASOUND_FEATURE_NAMES = ultrasound_model.feature_names_

# =====================================================
# CNN FOR ULTRASOUND FEATURE EXTRACTION
# =====================================================
cnn_model = ResNet50(
    weights="imagenet",
    include_top=False,
    pooling="avg",
    input_shape=(224, 224, 3)
)

print("✅ All models loaded successfully")

# =====================================================
# CONSTANTS
# =====================================================
CATEGORICAL_COLS = [
    "blood_group", "cycler/i", "pregnanty/n",
    "weight_gainy/n", "hair_growthy/n",
    "skin_darkening_y/n", "hair_lossy/n",
    "pimplesy/n", "fast_food_y/n", "reg.exercisey/n"
]

TABULAR_FEATURES = [
    "age_yrs","weight_kg","heightcm","bmi","blood_group",
    "pulse_ratebpm","rr_breaths/min","hbg/dl","cycler/i",
    "cycle_lengthdays","marraige_status_yrs","pregnanty/n",
    "no._of_aborptions","i___beta-hcgmiu/ml",
    "ii____beta-hcgmiu/ml","fshmiu/ml","lhmiu/ml","fsh/lh",
    "hipinch","waistinch","waist:hip_ratio","tsh_miu/l",
    "amhng/ml","prlng/ml","vit_d3_ng/ml","prgng/ml","rbsmg/dl",
    "weight_gainy/n","hair_growthy/n","skin_darkening_y/n",
    "hair_lossy/n","pimplesy/n","fast_food_y/n","reg.exercisey/n",
    "bp__systolic_mmhg","bp__diastolic_mmhg",
    "follicle_no._l","follicle_no._r",
    "avg._f_size_l_mm","avg._f_size_r_mm","endometrium_mm"
]

# =====================================================
# TABULAR COLUMN NORMALIZATION
# =====================================================
def normalize_tabular_columns(df: pd.DataFrame) -> pd.DataFrame:
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
    }
    return df.rename(columns=COLUMN_MAP)

# =====================================================
# ULTRASOUND FEATURE EXTRACTION
# =====================================================
def extract_ultrasound_features(image_bytes: bytes) -> np.ndarray:
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Invalid ultrasound image")

    img = cv2.resize(img, (224, 224))

    lbp = local_binary_pattern(img, P=8, R=1, method="uniform")
    hist, _ = np.histogram(lbp.ravel(), bins=16, range=(0, 16))
    hist = hist.astype("float32")
    hist /= hist.sum() + 1e-6

    img_rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    img_rgb = preprocess_input(np.expand_dims(img_rgb, axis=0))

    cnn_features = cnn_model.predict(img_rgb, verbose=0).flatten()

    features = np.concatenate([cnn_features, hist])
    return features[:len(ULTRASOUND_FEATURE_NAMES)]

def build_meta_features(hormonal_prob, metabolic_prob, symptom_prob):
    probs = np.array([hormonal_prob, metabolic_prob, symptom_prob])

    meta = {
        "hormonal_prob": hormonal_prob,
        "metabolic_prob": metabolic_prob,
        "symptom_prob": symptom_prob,

        # Aggregates
        "max_prob": probs.max(),
        "mean_prob": probs.mean(),
        "std_prob": probs.std(),

        # Pairwise gaps
        "hormonal_metabolic_gap": abs(hormonal_prob - metabolic_prob),
        "hormonal_symptom_gap": abs(hormonal_prob - symptom_prob),
        "symptom_metabolic_gap": abs(symptom_prob - metabolic_prob),
    }

    return pd.DataFrame([meta])

def check_data_sufficiency(df: pd.DataFrame, has_ultrasound: bool):
    missing = []
    present_numeric = 0

    # Check core required fields
    for f in REQUIRED_CORE_FIELDS:
        if f not in df.columns or pd.isna(df.at[0, f]):
            missing.append(f)

    # Hormonal presence
    has_hormonal = any(
        f in df.columns and not pd.isna(df.at[0, f])
        for f in HORMONAL_FIELDS
    )

    # Ovarian presence
    has_ovarian = any(
        f in df.columns and not pd.isna(df.at[0, f])
        for f in OVARIAN_FIELDS
    )

    # Count numeric values
    for col in df.columns:
        if col not in CATEGORICAL_COLS:
            if not pd.isna(df.at[0, col]):
                present_numeric += 1

    errors = []

    if missing:
        errors.append("Missing core clinical fields")

    if not has_hormonal:
        errors.append("At least one hormonal marker required")

    if not has_ovarian:
        errors.append("At least one ovarian marker required")

    if present_numeric < MIN_NUMERIC_FIELDS:
        errors.append(
            f"Insufficient numeric data ({present_numeric}/{MIN_NUMERIC_FIELDS})"
        )

    if not has_ultrasound:
        errors.append("Ultrasound image required")

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "numeric_count": present_numeric,
    }

# =====================================================
# MAIN PREDICTION FUNCTION
# =====================================================
def predict_pcos(tabular_data: dict, ultrasound_bytes: bytes):

    # ---------- TABULAR ----------
    df = pd.DataFrame([tabular_data])
    df = normalize_tabular_columns(df)

    # Ensure all expected features exist
    for col in TABULAR_FEATURES:
        if col not in df.columns:
            df[col] = np.nan

    df = df[TABULAR_FEATURES]
    # Cast categoricals safely
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna("UNKNOWN")

    # ---------- CLINICAL SUFFICIENCY GATE ----------
    sufficiency = check_data_sufficiency(
        df,
        has_ultrasound=ultrasound_bytes is not None
    )

    if not sufficiency["is_valid"]:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "Not enough clinical data to assess PCOS risk safely",
            "details": sufficiency["errors"],
            "numeric_fields_present": sufficiency["numeric_count"],
            "required_minimum_numeric": MIN_NUMERIC_FIELDS
        }


    pool = Pool(df, cat_features=CATEGORICAL_COLS)

    expert_probs = {
        name: model.predict_proba(pool)[0][1]
        for name, model in EXPERT_MODELS.items()
    }

    # ✅ Build meta features EXACTLY as training
    meta_input = build_meta_features(
        hormonal_prob=expert_probs["hormonal"],
        metabolic_prob=expert_probs["metabolic"],
        symptom_prob=expert_probs["symptom"],
    )

    # 🔒 Enforce column order (extra safety)
    meta_input = meta_input[META_MODEL.feature_names_in_]

    p_tabular = META_MODEL.predict_proba(meta_input)[:, 1][0]


    # ---------- ULTRASOUND ----------
    us_features = extract_ultrasound_features(ultrasound_bytes)
    us_df = pd.DataFrame([us_features], columns=ULTRASOUND_FEATURE_NAMES)
    p_ultrasound = ultrasound_model.predict_proba(us_df)[0][1]

    # ---------- ADAPTIVE FUSION ----------
    alpha = 0.5
    if p_tabular > 0.75 and p_ultrasound < 0.6:
        alpha = 0.7
    elif p_ultrasound > 0.75 and p_tabular < 0.6:
        alpha = 0.3

    final_score = alpha * p_tabular + (1 - alpha) * p_ultrasound

    print(
        f"[DEBUG] Hormonal={expert_probs['hormonal']:.3f}, "
        f"Metabolic={expert_probs['metabolic']:.3f}, "
        f"Symptom={expert_probs['symptom']:.3f}, "
        f"Meta={p_tabular:.3f}, "
        f"Ultrasound={p_ultrasound:.3f}, "
        f"Final={final_score:.3f}"
    )

    risk = (
        "LOW" if final_score < 0.3
        else "MODERATE" if final_score < 0.6
        else "HIGH"
    )

    return {
        "tabular_risk": round(float(p_tabular), 3),
        "ultrasound_risk": round(float(p_ultrasound), 3),
        "final_pcos_probability": round(float(final_score), 3),
        "risk_level": risk
    }
