# app/api/pcos.py

import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services import multimodal_service
from app.parsing.document_parser import parse_document
from app.auth.dependencies import get_current_user, get_current_user_optional, get_db
from app.users.user_models import User
from app.assessments.assessment_service import save_assessment
from app.services.gradcam_service import gradcam_service
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/api/pcos", tags=["PCOS"])

REQUIRED_FIELDS = [
    "Age (yrs)",
    "Cycle(R/I)",
    "Cycle length(days)",
]

def validate_minimum_inputs(tabular: dict):
    missing = []

    for f in REQUIRED_FIELDS:
        if f not in tabular or tabular[f] in [None, "", 0]:
            missing.append(f)

    # Hormonal sufficiency
    hormonal_present = any(
        tabular.get(k, 0) > 0
        for k in ["LH(mIU/mL)", "FSH(mIU/mL)", "AMH(ng/mL)"]
    )

    if not hormonal_present:
        missing.append("At least one hormonal value (LH / FSH / AMH)")

    # Ovarian sufficiency
    ovarian_present = any(
        tabular.get(k, 0) > 0
        for k in [
            "Follicle No. (L)",
            "Follicle No. (R)",
            "Avg. F size (L) (mm)",
            "Avg. F size (R) (mm)",
            "Endometrium (mm)",
        ]
    )

    if not ovarian_present:
        missing.append("At least one ovarian ultrasound metric")

    return missing


@router.post("/predict")
async def predict(
    tabular_data: str = Form(...),
    ultrasound: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    PCOS prediction endpoint with Grad-CAM visualization.
    Combines tabular clinical data with ultrasound image analysis.
    """
    
    # Parse tabular data
    try:
        tabular_dict = json.loads(tabular_data)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON format for tabular data"
        )
    
    # Validate required fields
    missing_fields = validate_minimum_inputs(tabular_dict)
    if missing_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )
    
    # Read ultrasound image
    if not ultrasound:
        raise HTTPException(
            status_code=400,
            detail="Ultrasound image is required"
        )
    
    ultrasound_bytes = await ultrasound.read()
    
    # Validate image file
    if len(ultrasound_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image file is empty"
        )
    
    # =====================================================
    # MAIN PREDICTION - Using multimodal service
    # =====================================================
    try:
        prediction_result = multimodal_service.predict_pcos(
            tabular_data=tabular_dict,
            ultrasound_bytes=ultrasound_bytes
        )
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Check if data was insufficient
    if prediction_result.get("status") == "INSUFFICIENT_DATA":
        return {
            "status": "insufficient_data",
            "message": prediction_result["message"],
            "errors": prediction_result["details"],
            "numeric_fields_present": prediction_result["numeric_fields_present"],
            "required_minimum": prediction_result["required_minimum_numeric"]
        }
    
    # =====================================================
    # GRAD-CAM VISUALIZATION (Explainability)
    # =====================================================
    gradcam_visualization = None
    
    if gradcam_service:
        try:
            gradcam_visualization = gradcam_service.generate_heatmap(ultrasound_bytes)
            print(f"✅ Grad-CAM heatmap generated successfully")
        except Exception as e:
            print(f"⚠️ Grad-CAM generation failed: {e}")
            # Don't fail the entire request if Grad-CAM fails
    else:
        print("⚠️ Grad-CAM service not available")
    
    # =====================================================
    # BUILD RESPONSE
    # =====================================================
    response = {
        "status": "success",
        "tabular_risk": prediction_result["tabular_risk"],
        "ultrasound_risk": prediction_result["ultrasound_risk"],
        "final_pcos_probability": prediction_result["final_pcos_probability"],
        "risk_level": prediction_result["risk_level"],
        "prediction": "PCOS" if prediction_result["final_pcos_probability"] > 0.5 else "Non-PCOS",
        "gradcam_visualization": gradcam_visualization,
        "confidence": round(prediction_result["final_pcos_probability"] * 100, 1),
        "assessment_date": None  # Will be set if saved to DB
    }
    
    # =====================================================
    # GENERATE AI RECOMMENDATIONS (NEW!)
    # =====================================================
    try:
        print("🤖 Generating personalized AI recommendations...")
        ai_recommendations = recommendation_service.generate_personalized_recommendations(
            assessment_data=tabular_dict,
            prediction_result={
                "risk_level": prediction_result["risk_level"],
                "final_pcos_probability": prediction_result["final_pcos_probability"],
                "tabular_risk": prediction_result["tabular_risk"],
                "ultrasound_risk": prediction_result["ultrasound_risk"]
            },
            ultrasound_image=ultrasound_bytes  # Pass image for multimodal analysis
        )
        
        if ai_recommendations["status"] == "success" and ai_recommendations["recommendations"]:
            response["personalized_recommendations"] = ai_recommendations["recommendations"]
            response["recommendations_source"] = "gemini-ai"
            response["multimodal_analysis"] = ai_recommendations.get("multimodal", False)
            print(f"✅ Generated {len(ai_recommendations['recommendations'])} AI recommendations")
        else:
            response["personalized_recommendations"] = None
            response["recommendations_source"] = "fallback"
            print(f"⚠️ AI recommendations failed: {ai_recommendations.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"⚠️ AI recommendation generation error: {e}")
        response["personalized_recommendations"] = None
        response["recommendations_source"] = "fallback"
    
    # =====================================================
    # SAVE TO DATABASE (if user is authenticated)
    # =====================================================
    if current_user:
        try:
            assessment_id = save_assessment(
                db=db,
                user_id=current_user.id,
                tabular_data=tabular_dict,
                ultrasound_filename=ultrasound.filename if ultrasound else None,
                prediction=response,
            )
            response["assessment_id"] = assessment_id
            print(f"✅ Assessment saved to database (ID: {assessment_id})")
        except Exception as e:
            print(f"⚠️ Failed to save assessment: {e}")
            # Don't fail the request if DB save fails
    
    return response


@router.post("/parse-document")
async def parse_medical_document(
    document: UploadFile = File(...)
):
    """
    Parse medical PDF document and extract clinical parameters.
    Supports laboratory reports and medical records.
    """
    if not document.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents are supported"
        )

    pdf_bytes = await document.read()
    
    if len(pdf_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF file is empty"
        )

    try:
        extracted = parse_document(pdf_bytes)
        return {
            "status": "success",
            "fields": extracted,
            "fields_count": len(extracted)
        }

    except Exception as e:
        print(f"[ERROR] Document parsing failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Document parsing failed: {str(e)}"
        )