# app/api/document.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_router import process_document

router = APIRouter(prefix="/api/document", tags=["Document"])

@router.post("/parse")
async def parse_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
        raise HTTPException(400, "Unsupported file type")

    contents = await file.read()
    result = process_document(contents, file.filename)

    return result
