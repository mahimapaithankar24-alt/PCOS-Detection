# app/core/startup.py

from app.models.tabular_model import load_tabular_model
from app.models.ultrasound_model import load_ultrasound_model
from app.models.cnn_feature_extractor import load_cnn_model

def startup_event():
    print("🔄 Loading ML models at startup...")
    tabular_model = load_tabular_model()
    print(tabular_model)
    ultrasound_model = load_ultrasound_model()
    print(ultrasound_model)
    cnn_model = load_cnn_model()
    print(cnn_model)
    print("✅ All ML models loaded")