# app/main.py

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.core.startup import startup_event
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.pcos import router as pcos_router
from app.api.auth import router as auth_router
from app.api.assessments import router as assessments_router
from app.init_db import init_db
from app.api import profile

app = FastAPI(
    title="PCOS Multimodal Risk Assessment API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    startup_event()
    init_db()

app.include_router(health_router)
app.include_router(pcos_router)
app.include_router(auth_router)
app.include_router(assessments_router)
app.include_router(profile.router)