from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.auth.auth_service import create_user, authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    user = create_user(
        email=data.email,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name
    )
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    }


@router.post("/login")
def login(data: LoginRequest):
    token, user = authenticate_user(data.email, data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    }
}
