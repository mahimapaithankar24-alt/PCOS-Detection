from sqlalchemy.orm import Session
from app.users.user_models import User
from app.auth.password_utils import hash_password, verify_password
from app.auth.jwt_utils import create_access_token
from app.database import SessionLocal

def create_user(email: str, password: str, first_name: str, last_name: str):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return None

    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(email: str, password: str):
    db = SessionLocal()
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None, None
    if not verify_password(password, user.password_hash):
        return None, None
    
    # Generate JWT token
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return token, user