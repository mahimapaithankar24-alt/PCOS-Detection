from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional

from app.auth.jwt_utils import decode_token
from app.database import SessionLocal
from app.users.user_models import User


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts user from JWT and returns User object
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts user from JWT if provided, returns None if not authenticated.
    Used for endpoints that work both with and without authentication.
    """
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "")
    
    try:
        payload = decode_token(token)
        
        if not payload or "sub" not in payload:
            return None

        user = db.query(User).filter(User.id == payload["sub"]).first()
        return user
    except Exception:
        return None
