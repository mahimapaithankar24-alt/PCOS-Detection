# app/models/tabular_model.py

from catboost import CatBoostClassifier
from app.core.config import TABULAR_MODEL_PATH

tabular_model = "../../models/catboost_pcos_tabular_clean.cbm"

def load_tabular_model():
    global tabular_model
    model = CatBoostClassifier()
    model.load_model(str(TABULAR_MODEL_PATH))
    tabular_model = model
    return tabular_model