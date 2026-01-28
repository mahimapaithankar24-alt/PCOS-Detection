# app/services/document_router.py

import io
import pdfplumber

from app.services.extract_pdf import extract_from_pdf
from app.services.extract_ocr import extract_from_ocr
from app.services.normalize_fields import normalize_extracted_fields

def is_born_digital(pdf_bytes: bytes) -> bool:
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return any(page.extract_text() for page in pdf.pages)
    except:
        return False

def process_document(file_bytes: bytes, filename: str):
    if filename.lower().endswith(".pdf") and is_born_digital(file_bytes):
        raw_data = extract_from_pdf(file_bytes)
        source = "pdf_digital"
    else:
        raw_data = extract_from_ocr(file_bytes)
        source = "ocr"

    cleaned = normalize_extracted_fields(raw_data)

    return {
        "source": source,
        "fields": cleaned
    }
