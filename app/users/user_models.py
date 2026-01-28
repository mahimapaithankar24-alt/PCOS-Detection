from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default="patient")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )