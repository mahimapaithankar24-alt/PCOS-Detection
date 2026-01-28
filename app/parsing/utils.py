# app/parsing/utils.py

import re

def clean_number(text):
    try:
        val = re.sub(r"[^\d\.]", "", str(text))
        return float(val)
    except:
        return None

def validate_range(value, min_v, max_v):
    if min_v <= value <= max_v:
        return 0.95
    return 0.4

def normalize_bool(text):
    t = str(text).lower()
    if t in ["y", "yes", "true", "1"]:
        return "Y"
    if t in ["n", "no", "false", "0"]:
        return "N"
    return None
