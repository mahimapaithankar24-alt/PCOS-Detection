from pydantic import BaseModel
from typing import Optional
from datetime import date

class ProfileCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    profile_picture: Optional[str] = None

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    profile_picture: Optional[str] = None

class ProfileResponse(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    profile_picture: Optional[str] = None
    is_complete: bool = False

    class Config:
        from_attributes = True
