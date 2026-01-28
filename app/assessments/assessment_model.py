import uuid
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON, UUID
from sqlalchemy.sql import func
from app.database import Base

class PCOSAssessment(Base):
    __tablename__ = "pcos_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    tabular_data = Column(JSON, nullable=False)
    ultrasound_filename = Column(String)

    tabular_risk = Column(Float, nullable=False)
    ultrasound_risk = Column(Float, nullable=False)
    final_pcos_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)

    model_version = Column(String, default="v1")
    prediction = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())