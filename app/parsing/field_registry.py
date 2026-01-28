# app/parsing/field_registry.py

FIELD_REGISTRY = {

    # ==================================================
    # BASIC DEMOGRAPHICS
    # ==================================================
    "Age (yrs)": {
        "aliases": ["age", "age years", "patient age"],
        "type": "float",
        "range": (10, 55)
    },

    "Weight (Kg)": {
        "aliases": ["weight", "weight kg", "body weight"],
        "type": "float",
        "range": (30, 150)
    },

    "Height(Cm)": {
        "aliases": ["height", "height cm"],
        "type": "float",
        "range": (120, 200)
    },

    "BMI": {
        "aliases": ["bmi", "body mass index"],
        "type": "float",
        "range": (10, 60)
    },

    "Blood Group": {
        "aliases": ["blood group", "blood type"],
        "type": "str"
    },

    # ==================================================
    # VITAL SIGNS & BLOOD
    # ==================================================
    "Pulse rate(bpm)": {
        "aliases": ["pulse", "pulse rate", "heart rate"],
        "type": "float",
        "range": (40, 140)
    },

    "RR (breaths/min)": {
        "aliases": ["respiratory rate", "resp rate", "rr"],
        "type": "float",
        "range": (10, 40)
    },

    "Hb(g/dl)": {
        "aliases": ["hb", "hemoglobin", "haemoglobin"],
        "type": "float",
        "range": (5, 20)
    },

    "RBS(mg/dl)": {
        "aliases": ["rbs", "random blood sugar", "glucose"],
        "type": "float",
        "range": (50, 300)
    },

    # ==================================================
    # MENSTRUAL & OBSTETRIC HISTORY
    # ==================================================
    "Cycle(R/I)": {
        "aliases": ["cycle", "menstrual cycle"],
        "type": "enum",
        "allowed": ["R", "I"]
    },

    "Cycle length(days)": {
        "aliases": ["cycle length", "menstrual cycle length"],
        "type": "float",
        "range": (20, 60)
    },

    "Marraige Status (Yrs)": {
        "aliases": ["marriage", "marital duration"],
        "type": "float",
        "range": (0, 40)
    },

    "Pregnant(Y/N)": {
        "aliases": ["pregnant", "pregnancy status"],
        "type": "bool"
    },

    "No. of aborptions": {
        "aliases": ["abortion", "abortions"],
        "type": "float",
        "range": (0, 10)
    },

    # ==================================================
    # HORMONAL PROFILE
    # ==================================================
    "FSH(mIU/mL)": {
        "aliases": ["fsh", "follicle stimulating hormone"],
        "type": "float",
        "range": (0, 100)
    },

    "LH(mIU/mL)": {
        "aliases": ["lh", "luteinizing hormone"],
        "type": "float",
        "range": (0, 100)
    },

    "FSH/LH": {
        "aliases": ["fsh/lh", "fsh lh ratio"],
        "type": "float",
        "range": (0, 5)
    },

    "AMH(ng/mL)": {
        "aliases": ["amh", "anti mullerian hormone"],
        "type": "float",
        "range": (0, 30)
    },

    "TSH (mIU/L)": {
        "aliases": ["tsh", "thyroid stimulating hormone"],
        "type": "float",
        "range": (0, 20)
    },

    "PRL(ng/mL)": {
        "aliases": ["prl", "prolactin"],
        "type": "float",
        "range": (0, 100)
    },

    "Vit D3 (ng/mL)": {
        "aliases": ["vitamin d", "vit d3", "25 oh vitamin d"],
        "type": "float",
        "range": (0, 100)
    },

    "PRG(ng/mL)": {
        "aliases": ["progesterone", "prg"],
        "type": "float",
        "range": (0, 50)
    },

    "I   beta-HCG(mIU/mL)": {
        "aliases": ["beta hcg", "hcg"],
        "type": "float",
        "range": (0, 1000)
    },

    "II    beta-HCG(mIU/mL)": {
        "aliases": ["beta hcg", "hcg"],
        "type": "float",
        "range": (0, 1000)
    },

    # ==================================================
    # BODY MEASUREMENTS
    # ==================================================
    "Hip(inch)": {
        "aliases": ["hip", "hip circumference"],
        "type": "float",
        "range": (20, 60)
    },

    "Waist(inch)": {
        "aliases": ["waist", "waist circumference"],
        "type": "float",
        "range": (20, 60)
    },

    "Waist:Hip Ratio": {
        "aliases": ["waist hip ratio", "whr"],
        "type": "float",
        "range": (0.5, 1.2)
    },

    # ==================================================
    # BLOOD PRESSURE
    # ==================================================
    "BP _Systolic (mmHg)": {
        "aliases": ["systolic", "bp systolic"],
        "type": "float",
        "range": (80, 200)
    },

    "BP _Diastolic (mmHg)": {
        "aliases": ["diastolic", "bp diastolic"],
        "type": "float",
        "range": (40, 130)
    },

    # ==================================================
    # ULTRASOUND (TABULAR VALUES)
    # ==================================================
    "Follicle No. (L)": {
        "aliases": ["follicle left", "left ovary follicles"],
        "type": "float",
        "range": (0, 50)
    },

    "Follicle No. (R)": {
        "aliases": ["follicle right", "right ovary follicles"],
        "type": "float",
        "range": (0, 50)
    },

    "Avg. F size (L) (mm)": {
        "aliases": ["avg follicle left", "left follicle size"],
        "type": "float",
        "range": (0, 30)
    },

    "Avg. F size (R) (mm)": {
        "aliases": ["avg follicle right", "right follicle size"],
        "type": "float",
        "range": (0, 30)
    },

    "Endometrium (mm)": {
        "aliases": ["endometrium", "endometrial thickness"],
        "type": "float",
        "range": (0, 30)
    },

    # ==================================================
    # CLINICAL SYMPTOMS & LIFESTYLE
    # ==================================================
    "Weight gain(Y/N)": {
        "aliases": ["weight gain"],
        "type": "bool"
    },

    "hair growth(Y/N)": {
        "aliases": ["hair growth", "hirsutism"],
        "type": "bool"
    },

    "Skin darkening (Y/N)": {
        "aliases": ["skin darkening", "acanthosis"],
        "type": "bool"
    },

    "Hair loss(Y/N)": {
        "aliases": ["hair loss", "alopecia"],
        "type": "bool"
    },

    "Pimples(Y/N)": {
        "aliases": ["pimples", "acne"],
        "type": "bool"
    },

    "Fast food (Y/N)": {
        "aliases": ["fast food"],
        "type": "bool"
    },

    "Reg.Exercise(Y/N)": {
        "aliases": ["exercise", "physical activity"],
        "type": "bool"
    },
}