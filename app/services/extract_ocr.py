# app/services/extract_ocr.py

import pytesseract
import cv2
import numpy as np
import re

def extract_from_ocr(image_bytes: bytes):
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
    text = pytesseract.image_to_string(img)

    data = {}
    for line in text.split("\n"):
        if "AMH" in line:
            data["AMH(ng/mL)"] = re.findall(r"\d+\.?\d*", line)

    return data
