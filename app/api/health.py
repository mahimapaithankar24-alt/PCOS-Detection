# app/api/health.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PCOS Multimodal ML Backend"
    }