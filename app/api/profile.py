from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth.dependencies import get_current_user
from app.users.profile_schemas import ProfileCreate, ProfileUpdate, ProfileResponse
from app.users.profile_service import get_profile, create_or_update_profile
from app.users.user_models import User

router = APIRouter(prefix="/api/profile", tags=["Profile"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_profile_complete(profile) -> bool:
    """Check if essential profile fields are filled"""
    if not profile:
        return False
    return all([
        profile.phone,
        profile.blood_group,
        profile.age or profile.date_of_birth,
        profile.height_cm,
        profile.weight_kg
    ])

@router.get("/me", response_model=ProfileResponse)
def fetch_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile(db, current_user.id)
    if not profile:
        return {
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "is_complete": False
        }
    
    profile_dict = {
        "email": profile.email,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "phone": profile.phone,
        "address": profile.address,
        "blood_group": profile.blood_group,
        "date_of_birth": profile.date_of_birth,
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "profile_picture": profile.profile_picture,
        "is_complete": check_profile_complete(profile)
    }
    return profile_dict

@router.post("/me", response_model=ProfileResponse)
@router.put("/me", response_model=ProfileResponse)
def save_profile(
    data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = create_or_update_profile(db, current_user, data)
    profile_dict = {
        "email": profile.email,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "phone": profile.phone,
        "address": profile.address,
        "blood_group": profile.blood_group,
        "date_of_birth": profile.date_of_birth,
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "profile_picture": profile.profile_picture,
        "is_complete": check_profile_complete(profile)
    }
    return profile_dict
