# app/schemas/response.py

from pydantic import BaseModel

class PCOSPredictionResponse(BaseModel):
    tabular_risk: float
    ultrasound_risk: float
    final_pcos_probability: float
    risk_level: str
