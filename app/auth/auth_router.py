from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth.auth_service import create_user, authenticate_user
from app.auth.jwt_utils import create_access_token
from app.users.user_models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(db, email, password)
    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}