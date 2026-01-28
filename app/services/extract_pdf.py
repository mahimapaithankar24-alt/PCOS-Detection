# app/services/extract_pdf.py

import io
import pdfplumber
import re

def extract_from_pdf(pdf_bytes: bytes):
    data = {}

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            for line in text.split("\n"):
                # Example pattern
                if "Age" in line:
                    data["Age (yrs)"] = re.findall(r"\d+", line)
                if "BMI" in line:
                    data["BMI"] = re.findall(r"\d+\.?\d*", line)

    return data
