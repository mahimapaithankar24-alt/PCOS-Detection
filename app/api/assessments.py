from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.auth_router import get_db
from app.auth.dependencies import get_current_user
from app.assessments.assessment_model import PCOSAssessment
from app.users.user_models import User
import uuid

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("/my-history")
def get_my_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Convert user_id to UUID if it's a string
    user_id = current_user.id
    if isinstance(user_id, str):
        user_id = uuid.UUID(user_id)
    
    assessments = (
        db.query(PCOSAssessment)
        .filter(PCOSAssessment.user_id == user_id)
        .order_by(PCOSAssessment.created_at.desc())
        .all()
    )

    return assessments

@router.get("/history")
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get assessment history for the current user
    Returns simplified history with id, date, risk_level, and probability
    """
    # Convert user_id to UUID if it's a string
    user_id = current_user.id
    if isinstance(user_id, str):
        user_id = uuid.UUID(user_id)
    
    assessments = (
        db.query(PCOSAssessment)
        .filter(PCOSAssessment.user_id == user_id)
        .order_by(PCOSAssessment.created_at.desc())
        .limit(10)  # Last 10 assessments
        .all()
    )

    history = []
    for assessment in assessments:
        # Determine risk level from probability
        if assessment.final_pcos_probability >= 0.6:
            risk_level = "HIGH"
        elif assessment.final_pcos_probability >= 0.3:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
        
        history.append({
            "id": assessment.id,
            "date": assessment.created_at.isoformat(),
            "risk_level": risk_level,
            "probability": assessment.final_pcos_probability
        })
    
    return history