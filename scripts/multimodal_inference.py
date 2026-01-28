import cv2
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier, Pool
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from skimage.feature import local_binary_pattern

# =========================================================
# PATHS
# =========================================================
TABULAR_MODEL_PATH = "../models/catboost_pcos_model.cbm"
ULTRASOUND_MODEL_PATH = "../models/ultrasound_catboost_combined.cbm"

TABULAR_SAMPLE_PATH = "../data/sample_inputs/sample_tabular_patient.csv"
ULTRASOUND_SAMPLE_PATH = "../data/sample_inputs/sample_ultrasound.jpg"

# =========================================================
# LOAD MODELS
# =========================================================
print("🔄 Loading models...")

tabular_model = CatBoostClassifier()
tabular_model.load_model(TABULAR_MODEL_PATH)

ultrasound_model = CatBoostClassifier()
ultrasound_model.load_model(ULTRASOUND_MODEL_PATH)

cnn_model = ResNet50(
    weights="imagenet",
    include_top=False,
    pooling="avg",
    input_shape=(224, 224, 3)
)

print("✅ Models loaded")

# =========================================================
# FEATURE DEFINITIONS (MUST MATCH TRAINING)
# =========================================================
CATEGORICAL_COLS = [
    "blood_group",
    "cycler/i",
    "pregnanty/n",
    "weight_gainy/n",
    "hair_growthy/n",
    "skin_darkening_y/n",
    "hair_lossy/n",
    "pimplesy/n",
    "fast_food_y/n",
    "reg.exercisey/n"
]

TABULAR_FEATURES = [
    "age_yrs", "weight_kg", "heightcm", "bmi", "blood_group",
    "pulse_ratebpm", "rr_breaths/min", "hbg/dl", "cycler/i",
    "cycle_lengthdays", "marraige_status_yrs", "pregnanty/n",
    "no._of_aborptions", "i___beta-hcgmiu/ml", "ii____beta-hcgmiu/ml",
    "fshmiu/ml", "lhmiu/ml", "fsh/lh", "hipinch", "waistinch",
    "waist:hip_ratio", "tsh_miu/l", "amhng/ml", "prlng/ml",
    "vit_d3_ng/ml", "prgng/ml", "rbsmg/dl", "weight_gainy/n",
    "hair_growthy/n", "skin_darkening_y/n", "hair_lossy/n",
    "pimplesy/n", "fast_food_y/n", "reg.exercisey/n",
    "bp__systolic_mmhg", "bp__diastolic_mmhg",
    "follicle_no._l", "follicle_no._r",
    "avg._f_size_l_mm", "avg._f_size_r_mm", "endometrium_mm"
]

COLUMN_RENAME_MAP = {
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


# =========================================================
# ULTRASOUND FEATURE EXTRACTION
# =========================================================
def extract_ultrasound_features(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Cannot read ultrasound image: {image_path}")

    img = cv2.resize(img, (224, 224))

    # Texture (LBP)
    lbp = local_binary_pattern(img, P=8, R=1, method="uniform")
    hist, _ = np.histogram(lbp.ravel(), bins=16, range=(0, 16))
    hist = hist.astype(np.float32)
    hist /= hist.sum() + 1e-6

    # CNN
    img_rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    img_rgb = np.expand_dims(img_rgb, axis=0)
    img_rgb = preprocess_input(img_rgb)

    cnn_features = cnn_model.predict(img_rgb, verbose=0).flatten()

    features = np.concatenate([cnn_features, hist])
    return features.reshape(1, -1)

# =========================================================
# MULTIMODAL INFERENCE
# =========================================================
def predict_pcos(tabular_df, ultrasound_image_path, alpha=0.5):

    tabular_df = tabular_df.copy()

    # Remove unwanted columns
    # Drop non-feature columns
    for col in ["PCOS", "Sl. No", "Patient File No.", "Unnamed: 44"]:
        if col in tabular_df.columns:
            tabular_df.drop(columns=col, inplace=True)

    # Rename columns to training schema
    tabular_df = tabular_df.rename(columns=COLUMN_RENAME_MAP)


    # Enforce exact schema
    tabular_df = tabular_df[TABULAR_FEATURES]

    # Cast categorical
    for col in CATEGORICAL_COLS:
        tabular_df[col] = tabular_df[col].astype(str)

    # Cast numeric
    for col in tabular_df.columns:
        if col not in CATEGORICAL_COLS:
            tabular_df[col] = pd.to_numeric(tabular_df[col], errors="coerce")

    # CatBoost Pool
    tabular_pool = Pool(
        tabular_df,
        cat_features=CATEGORICAL_COLS
    )

    p_tabular = tabular_model.predict_proba(tabular_pool)[0][1]

    # Ultrasound
    us_features = extract_ultrasound_features(ultrasound_image_path)
    p_ultrasound = ultrasound_model.predict_proba(us_features)[0][1]

    # Fusion
    final_score = alpha * p_tabular + (1 - alpha) * p_ultrasound

    if final_score < 0.4:
        risk = "LOW"
    elif final_score < 0.7:
        risk = "MODERATE"
    else:
        risk = "HIGH"

    return {
        "tabular_risk": round(p_tabular, 3),
        "ultrasound_risk": round(p_ultrasound, 3),
        "final_pcos_probability": round(final_score, 3),
        "risk_level": risk
    }

# =========================================================
# DEMO RUN
# =========================================================
if __name__ == "__main__":

    print("\n🔄 Running multimodal PCOS inference...")

    tabular_input = pd.read_csv(TABULAR_SAMPLE_PATH)

    result = predict_pcos(
        tabular_input,
        ULTRASOUND_SAMPLE_PATH,
        alpha=0.5
    )

    print("\n🩺 PCOS RISK ASSESSMENT")
    print("----------------------")
    print(f"Tabular Model Risk     : {result['tabular_risk']}")
    print(f"Ultrasound Model Risk  : {result['ultrasound_risk']}")
    print(f"Final PCOS Probability : {result['final_pcos_probability']}")
    print(f"Risk Level             : {result['risk_level']}")
