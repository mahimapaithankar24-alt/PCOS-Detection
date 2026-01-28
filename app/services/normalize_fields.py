# app/services/normalize_fields.py

import re

FIELD_RANGES = {
    "Age (yrs)": (10, 55),
    "BMI": (10, 60),
    "AMH(ng/mL)": (0, 30),
}

def clean_number(val):
    if not val:
        return None
    val = str(val)
    val = re.sub(r"[^\d\.,-]", "", val)
    val = val.replace(",", ".")
    try:
        return float(val)
    except:
        return None

def normalize_extracted_fields(raw_data: dict):
    result = {}

    for key, raw_val in raw_data.items():
        val = clean_number(raw_val[0] if isinstance(raw_val, list) else raw_val)

        confidence = 0.9 if val is not None else 0.3

        if key in FIELD_RANGES and val is not None:
            lo, hi = FIELD_RANGES[key]
            if not (lo <= val <= hi):
                confidence = 0.2

        result[key] = {
            "value": val,
            "confidence": round(confidence, 2)
        }

    return result
