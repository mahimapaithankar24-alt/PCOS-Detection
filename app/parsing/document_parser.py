# app/parsing/document_parser.py

import io
import re
import os
import tempfile
import pdfplumber
import camelot
from typing import Dict, Any, List

from .field_registry import FIELD_REGISTRY
from .utils import clean_number, validate_range, normalize_bool

# ======================================================
# GLOBAL REGEX (DECIMAL SAFE)
# ======================================================
VALUE_REGEX = re.compile(r"(?<!\d)(\d+\.\d+|\d+)(?!\d)")

# ======================================================
# TEXT NORMALIZATION
# ======================================================
def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.replace(":", " : ")
    text = text.replace("-", " - ")
    text = re.sub(r"\s+", " ", text)
    return text


# ======================================================
# SAFE TABLE EXTRACTION (CAMEL0T)
# ======================================================
def extract_tables_safe(pdf_bytes: bytes) -> List:
    """
    Attempts Camelot extraction safely.
    Tries lattice first, then stream.
    Never crashes the pipeline.
    """
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name

        try:
            tables = camelot.read_pdf(
                tmp_path,
                pages="all",
                flavor="lattice",
                strip_text="\n"
            )
        except Exception:
            tables = camelot.read_pdf(
                tmp_path,
                pages="all",
                flavor="stream",
                strip_text="\n"
            )

        return [t.df for t in tables]

    except Exception as e:
        print("[WARN] Camelot extraction failed:", str(e))
        return []

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


# ======================================================
# TABLE PARSER (ROW-WISE, CONFIDENCE AWARE)
# ======================================================
def parse_tables(dfs: List):
    extracted = {}

    for df in dfs:
        for _, row in df.iterrows():
            cells = [
                str(c).strip().lower()
                for c in row
                if str(c).strip()
            ]

            if len(cells) < 2:
                continue

            for field, meta in FIELD_REGISTRY.items():
                aliases = meta.get("aliases", [])
                field_type = meta.get("type", "float")

                if not any(alias in cell for alias in aliases for cell in cells):
                    continue

                for cell in cells:
                    # BOOLEAN
                    if field_type == "bool":
                        val = normalize_bool(cell)
                        if val is not None:
                            extracted[field] = {
                                "value": val,
                                "confidence": 0.95
                            }
                            break

                    # STRING
                    elif field_type == "str":
                        extracted[field] = {
                            "value": cell,
                            "confidence": 0.9
                        }
                        break

                    # NUMERIC
                    else:
                        match = VALUE_REGEX.search(cell)
                        if match:
                            num = clean_number(match.group())
                            if num is None:
                                continue

                            conf = validate_range(
                                num,
                                *meta.get("range", (-1e9, 1e9))
                            )

                            prev = extracted.get(field)
                            if not prev or conf > prev["confidence"]:
                                extracted[field] = {
                                    "value": num,
                                    "confidence": conf
                                }
                            break

    return extracted


# ======================================================
# REGEX-DRIVEN SEMANTIC EXTRACTION (HIGH PRECISION)
# ======================================================
def parse_regex(text: str):
    extracted = {}

    for field, meta in FIELD_REGISTRY.items():
        aliases = meta.get("aliases", [])
        field_type = meta.get("type", "float")

        for alias in aliases:
            pattern = rf"{alias}.*?{VALUE_REGEX.pattern}"
            match = re.search(pattern, text)

            if not match:
                continue

            if field_type == "bool":
                val = normalize_bool(match.group())
                if val is not None:
                    extracted[field] = {
                        "value": val,
                        "confidence": 0.85
                    }

            elif field_type == "str":
                extracted[field] = {
                    "value": match.group().strip(),
                    "confidence": 0.85
                }

            else:
                num = clean_number(match.group(1))
                if num is None:
                    continue

                conf = validate_range(
                    num,
                    *meta.get("range", (-1e9, 1e9))
                )

                extracted[field] = {
                    "value": num,
                    "confidence": conf * 0.85
                }

    return extracted


# ======================================================
# TEXT FALLBACK (LINE-BASED)
# ======================================================
def parse_text(text: str):
    extracted = {}

    for line in text.split("\n"):
        line_l = line.lower().strip()
        if not line_l:
            continue

        for field, meta in FIELD_REGISTRY.items():
            aliases = meta.get("aliases", [])
            field_type = meta.get("type", "float")

            if not any(alias in line_l for alias in aliases):
                continue

            if field_type == "bool":
                val = normalize_bool(line)
                if val is not None:
                    extracted[field] = {
                        "value": val,
                        "confidence": 0.6
                    }

            elif field_type == "str":
                extracted[field] = {
                    "value": line.strip(),
                    "confidence": 0.6
                }

            else:
                match = VALUE_REGEX.search(line)
                if match:
                    num = clean_number(match.group())
                    if num is None:
                        continue

                    conf = validate_range(
                        num,
                        *meta.get("range", (-1e9, 1e9))
                    )

                    extracted[field] = {
                        "value": num,
                        "confidence": conf * 0.7
                    }

    return extracted


# ======================================================
# MAIN ENTRY POINT
# ======================================================
def parse_document(pdf_bytes: bytes) -> Dict[str, Any]:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        raw_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    text = normalize_text(raw_text)

    dfs = extract_tables_safe(pdf_bytes)
    table_data = parse_tables(dfs)
    regex_data = parse_regex(text)
    text_data = parse_text(text)

    final = {}

    for field in FIELD_REGISTRY:
        candidates = []

        if field in table_data:
            candidates.append(table_data[field])
        if field in regex_data:
            candidates.append(regex_data[field])
        if field in text_data:
            candidates.append(text_data[field])

        if candidates:
            best = max(candidates, key=lambda x: x["confidence"])
            final[field] = best
        else:
            final[field] = {
                "value": None,
                "confidence": 0.0
            }

    return final
