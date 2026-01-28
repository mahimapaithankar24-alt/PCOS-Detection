# app/models/ultrasound_model.py

from catboost import CatBoostClassifier
from app.core.config import ULTRASOUND_MODEL_PATH

ultrasound_model = None

def load_ultrasound_model():
    global ultrasound_model
    model = CatBoostClassifier()
    model.load_model(str(ULTRASOUND_MODEL_PATH))
    ultrasound_model = model
    return ultrasound_model
