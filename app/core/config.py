# app/core/config.py

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_DIR = BASE_DIR / "models"

TABULAR_MODEL_PATH = MODEL_DIR / "catboost_tabular_final.cbm"
ULTRASOUND_MODEL_PATH = MODEL_DIR / "ultrasound_catboost_combined.cbm"
