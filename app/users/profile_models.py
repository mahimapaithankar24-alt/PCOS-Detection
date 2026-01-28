from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Basic Information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    
    # Personal Details
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)  # URL or path to image
    
    # Medical Information
    blood_group = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")