# 🩺 PCOS Detect - Multimodal AI Risk Assessment System

PCOS Detect is an end-to-end **AI-powered clinical decision support system** designed to assess **Polycystic Ovary Syndrome (PCOS) risk** using a combination of:

* Structured clinical (tabular) data
* Pelvic ultrasound imaging
* Automatic medical report (PDF) parsing

The system integrates **machine learning, deep learning, document intelligence, and full-stack engineering** into a single modular pipeline focused on **robustness, explainability, and real-world usability**.

> ⚠️ This system is intended for screening and decision-support purposes only and must not be used as a medical diagnostic tool.

---

## ✨ Key Features

* Multimodal PCOS risk prediction (Tabular + Ultrasound)
* Domain-specific expert ensemble for clinical features
* Adaptive meta-learning–based fusion
* Explainable AI with Grad-CAM for ultrasound interpretation
* Automatic medical report (PDF) parsing
* Secure FastAPI backend with Next.js frontend
* ROC-AUC–driven evaluation metrics

---

## 🧠 System Architecture

```
Medical PDF ──┐
├──▶ Document Parser ──▶ Auto-filled Form (Editable)
Manual Input ─┘

Tabular Data ─────────▶ Clinical Experts (3 Models)
│
Ultrasound Image ─▶ CNN + Texture Features ─▶ Ultrasound Model
│
Meta Learner (Stacking)
│
Adaptive Multimodal Fusion
│
Final PCOS Risk (Low / Moderate / High)
```

---

## 🧩 Core Components

### Backend

* FastAPI-based REST services
* Secure, modular inference pipeline
* Models loaded once at application startup
* Stateless, auditable prediction endpoints

### Frontend

* Next.js (App Router) with TypeScript
* Guided clinical data entry workflow
* PDF upload with editable auto-filled fields
* Ultrasound image upload
* Explainable results dashboard

### Models

* CatBoost classifiers for tabular and ultrasound data
* EfficientNet-B0 for ultrasound feature extraction (transfer learning)
* ResNet50 for Grad-CAM explainability
* Meta learner for expert fusion

---

## 📁 Project Structure

```
PCOS/
├── app/                  # FastAPI backend
│   ├── api/              # Route handlers
│   ├── core/             # Configuration
│   ├── models/           # Pydantic schemas
│   └── main.py           # App entry point
│
├── data/
│   ├── tabular/           # Clinical datasets
│   ├── features/          # Ultrasound texture features
│   └── ultrasound/        # Raw & processed images
│
├── frontend/              # Next.js frontend
│   ├── app/               # App Router pages
│   ├── lib/               # API utilities
│   └── public/            # Static assets
│
├── models/                # Trained ML models
│   ├── expert_hormonal.cbm
│   ├── expert_metabolic.cbm
│   ├── expert_symptom.cbm
│   ├── ultrasound_catboost.cbm
│   └── resnet50_gradcam.pth
│
├── scripts/               # Data preprocessing & training scripts
├── notebooks/             # Experiments & evaluation
├── requirements.txt
└── README.md
```

---

## 🧪 Datasets

### Tabular Clinical Data

Includes:

* Demographics (Age, Height, Weight, BMI)
* Hormonal markers (FSH, LH, AMH, TSH, PRL, Progesterone)
* Metabolic indicators (RBS, Weight Gain)
* Symptoms and lifestyle factors

**Target Variable:** `PCOS (0 / 1)`

---

### Ultrasound Imaging Data

* Ovarian ultrasound scans
* Feature extraction using:

  * EfficientNet-B0 embeddings
  * Local Binary Pattern (LBP) texture descriptors

---

### Medical Report PDFs

* Blood test reports
* Ultrasound summaries

Used **only for automatic data extraction**, not for model training.

---

## 🧠 Modeling Strategy

### Tabular Expert Models

Instead of one monolithic model, clinical features are split into domain-specific experts:

| Expert    | Feature Focus               |
| --------- | --------------------------- |
| Hormonal  | FSH, LH, AMH, TSH, PRL      |
| Metabolic | BMI, RBS, Weight Gain       |
| Symptom   | Acne, Hair Growth, Exercise |

* Model: CatBoostClassifier
* Metric: ROC-AUC
* Native handling of missing and categorical values

---

### Meta Learner (Stacking)

Outputs of all experts are combined using a meta learner.

**Meta Features**

* Expert probabilities
* Mean and maximum confidence
* Standard deviation
* Pairwise disagreement

**Goal**

* Improve calibration
* Reduce individual expert bias
* Increase robustness

---

### Ultrasound Modeling

* Backbone: EfficientNet-B0 (ImageNet pretrained)
* Texture features: LBP
* Final classifier: CatBoost

---

### Adaptive Multimodal Fusion

Final PCOS risk is computed dynamically:

* High tabular confidence → tabular weighted more
* High ultrasound confidence → ultrasound weighted more
* Otherwise → balanced fusion

---

## 🔍 Explainable AI (Grad-CAM)

* Dedicated ResNet50 CNN trained for visualization
* Grad-CAM heatmaps highlight ovarian regions
* Exposed via backend API
* Displayed in frontend alongside predictions

**Validation Accuracy:** ~81%

---

## 📄 Medical Document Parsing

**Supported Inputs**

* PDF lab reports
* Tables and free text

**Parsing Stack**

* Camelot (table extraction)
* pdfplumber (text extraction)
* Regex-based numeric parsing
* Unit normalization and validation
* Confidence scoring per extracted field

**Sample Output**

```json
{
  "FSH": { "value": 5.8, "confidence": 0.95 },
  "AMH": { "value": 8.4, "confidence": 0.93 }
}
```

---

## 📊 Model Performance (Summary)

| Component                 | Metric   | Score |
| ------------------------- | -------- | ----- |
| Hormonal Expert           | ROC-AUC  | ~0.71 |
| Metabolic Expert          | ROC-AUC  | ~0.63 |
| Symptom Expert            | ROC-AUC  | ~0.75 |
| Meta Learner              | ROC-AUC  | ~0.80 |
| Ultrasound (Grad-CAM CNN) | Accuracy | ~81%  |

---

## 🌐 API Endpoints

### Predict PCOS

```
POST /api/pcos/predict
```

**FormData**

```
tabular_data → JSON
ultrasound   → Image (optional)
```

---

### Parse Medical Report

```
POST /api/pcos/parse-document
```

**FormData**

```
document → PDF
```

---

## ⚙️ Installation & Setup

### Backend

```bash
conda create -n pcos python=3.10
conda activate pcos
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Disclaimer

This system is **not a medical diagnostic tool**.

It is intended for **educational, research, and decision-support purposes only**. Final diagnosis must always be made by a licensed healthcare professional.
