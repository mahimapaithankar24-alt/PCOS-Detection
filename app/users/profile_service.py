from sqlalchemy.orm import Session
from app.users.profile_models import UserProfile

def get_profile(db: Session, user_id: int):
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

def create_or_update_profile(db: Session, user, data):
    profile = get_profile(db, user.id)

    if profile:
        for field, value in data.dict().items():
            setattr(profile, field, value)
    else:
        profile = UserProfile(
            user_id=user.id,
            email=user.email,
            **data.dict()
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile
