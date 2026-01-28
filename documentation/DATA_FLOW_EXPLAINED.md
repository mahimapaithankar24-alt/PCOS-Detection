# 🔄 Data Flow: How Assessment Data Reaches Gemini AI

This document explains exactly how the form data from the assessment page flows through the system to generate personalized recommendations.

---

## 📋 Step-by-Step Data Journey

### Step 1: User Fills Assessment Form
**File:** `frontend/app/assess/page.tsx`

The user enters **40+ parameters** including:

```javascript
const tabularData = {
  // Demographics (5 fields)
  "Age (yrs)": 28,
  "Weight (Kg)": 78,
  "Height(Cm)": 165,
  "BMI": 28.5,
  "Blood Group": "A+",
  
  // Vitals (6 fields)
  "Pulse rate(bpm)": 78,
  "RR (breaths/min)": 16,
  "Hb(g/dl)": 12.5,
  "BP _Systolic (mmHg)": 120,
  "BP _Diastolic (mmHg)": 80,
  "RBS(mg/dl)": 108,
  
  // Cycle Info (2 fields)
  "Cycle(R/I)": "I",  // Irregular
  "Cycle length(days)": 45,
  
  // Reproductive History (3 fields)
  "Marraige Status (Yrs)": 3,
  "Pregnant(Y/N)": "N",
  "No. of aborptions": 0,
  
  // Hormones (9 fields)
  "FSH(mIU/mL)": 5.2,
  "LH(mIU/mL)": 12.5,
  "FSH/LH": 0.416,  // Calculated
  "AMH(ng/mL)": 8.4,
  "TSH (mIU/L)": 2.8,
  "PRL(ng/mL)": 15.2,
  "Vit D3 (ng/mL)": 22,
  "PRG(ng/mL)": 0.8,
  "I   beta-HCG(mIU/mL)": 0,
  "II    beta-HCG(mIU/mL)": 0,
  
  // Body Measurements (4 fields)
  "Hip(inch)": 42,
  "Waist(inch)": 36,
  "Waist:Hip Ratio": 0.857,  // Calculated
  
  // Ultrasound Findings (5 fields)
  "Follicle No. (L)": 14,
  "Follicle No. (R)": 12,
  "Avg. F size (L) (mm)": 6.2,
  "Avg. F size (R) (mm)": 5.8,
  "Endometrium (mm)": 8.5,
  
  // Symptoms (7 fields)
  "Weight gain(Y/N)": "Y",
  "hair growth(Y/N)": "Y",
  "Skin darkening (Y/N)": "N",
  "Hair loss(Y/N)": "N",
  "Pimples(Y/N)": "Y",
  "Fast food (Y/N)": "Y",
  "Reg.Exercise(Y/N)": "N"
}

// Plus: Ultrasound Image File
const ultrasoundImage = File
```

---

### Step 2: Frontend Sends to Backend
**File:** `frontend/app/assess/page.tsx` (handleSubmit function)

```javascript
async function handleSubmit(e: React.FormEvent) {
  // ... validation ...
  
  const fd = new FormData();
  fd.append("tabular_data", JSON.stringify(tabularData));  // ← All 40+ fields
  fd.append("ultrasound", ultrasound);  // ← Image file
  
  const response = await fetch("http://127.0.0.1:8000/api/pcos/predict", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd  // ← Sends complete assessment
  });
  
  const result = await response.json();
  // Result now includes personalized_recommendations!
}
```

---

### Step 3: Backend Receives & Processes
**File:** `app/api/pcos.py`

```python
@router.post("/predict")
async def predict(
    tabular_data: str = Form(...),  # ← Receives JSON string
    ultrasound: UploadFile = File(...),  # ← Receives image
    # ...
):
    # 1. Parse the JSON
    tabular_dict = json.loads(tabular_data)
    # tabular_dict now has all 40+ fields
    
    # 2. Read image bytes
    ultrasound_bytes = await ultrasound.read()
    
    # 3. Run PCOS prediction
    prediction_result = multimodal_service.predict_pcos(
        tabular_data=tabular_dict,
        ultrasound_bytes=ultrasound_bytes
    )
    
    # 4. ✨ NEW: Generate AI Recommendations
    ai_recommendations = recommendation_service.generate_personalized_recommendations(
        assessment_data=tabular_dict,  # ← ENTIRE form data passed here!
        prediction_result={
            "risk_level": prediction_result["risk_level"],
            "final_pcos_probability": prediction_result["final_pcos_probability"],
            "tabular_risk": prediction_result["tabular_risk"],
            "ultrasound_risk": prediction_result["ultrasound_risk"]
        },
        ultrasound_image=ultrasound_bytes  # ← Image also passed!
    )
    
    # 5. Add to response
    response = {
        # ... other fields ...
        "personalized_recommendations": ai_recommendations["recommendations"],
        "recommendations_source": "gemini-ai",
        "multimodal_analysis": True
    }
    
    return response
```

---

### Step 4: Recommendation Service Builds Prompt
**File:** `app/services/recommendation_service.py`

```python
def _build_comprehensive_prompt(self, assessment_data: Dict, result: Dict) -> str:
    # Extract EVERY field from assessment_data
    age = assessment_data.get("Age (yrs)", "N/A")
    bmi = assessment_data.get("BMI", "N/A")
    cycle_type = assessment_data.get("Cycle(R/I)", "N/A")
    lh = assessment_data.get("LH(mIU/mL)", "N/A")
    fsh = assessment_data.get("FSH(mIU/mL)", "N/A")
    amh = assessment_data.get("AMH(ng/mL)", "N/A")
    # ... extracts all 40+ fields ...
    
    # Build massive structured prompt
    prompt = f"""
    You are a specialized medical AI assistant for PCOS management.
    
    📊 AI DIAGNOSTIC RESULTS
    • Risk Level: {result["risk_level"]}
    • PCOS Probability: {result["final_pcos_probability"] * 100:.1f}%
    
    👤 PATIENT DEMOGRAPHICS
    • Age: {age} years
    • BMI: {bmi}
    
    🔬 HORMONAL PROFILE
    • LH: {lh} mIU/mL
    • FSH: {fsh} mIU/mL
    • AMH: {amh} ng/mL
    
    🔍 ULTRASOUND FINDINGS
    • Follicle Count (Left): {follicle_l}
    • Follicle Count (Right): {follicle_r}
    
    🏃 LIFESTYLE FACTORS
    • Exercise: {exercise}
    • Fast Food: {fast_food}
    
    ⚕️ SYMPTOMS
    • Weight Gain: {weight_gain}
    • Hirsutism: {hair_growth}
    • Acne: {pimples}
    
    ... [includes ALL 40+ parameters]
    
    Generate personalized recommendations in JSON format:
    {
      "recommendations": [
        {
          "category": "Medical Consultation",
          "title": "...",
          "description": "...",
          "priority": "high",
          "actionable_tips": ["...", "..."]
        }
      ]
    }
    """
    
    return prompt
```

---

### Step 5: Send to Gemini (Multimodal!)
**File:** `app/services/recommendation_service.py`

```python
def generate_personalized_recommendations(
    self, 
    assessment_data: Dict[str, Any],  # ← All 40+ fields
    prediction_result: Dict[str, Any],  # ← AI results
    ultrasound_image: Optional[bytes] = None  # ← Image bytes
):
    # Build prompt with ALL data
    prompt = self._build_comprehensive_prompt(assessment_data, prediction_result)
    
    # If image provided, use multimodal generation
    if ultrasound_image:
        image = Image.open(io.BytesIO(ultrasound_image))
        
        # 🔥 SEND BOTH TEXT AND IMAGE TO GEMINI
        response = self.model.generate_content([prompt, image])
    else:
        # Text-only
        response = self.model.generate_content(prompt)
    
    # Parse JSON response
    recommendations = self._parse_response(response.text)
    
    return {
        "status": "success",
        "recommendations": recommendations,
        "multimodal": ultrasound_image is not None
    }
```

---

### Step 6: Gemini Analyzes Everything

**What Gemini Sees:**

1. **All 40+ Clinical Parameters**
   - Demographics, vitals, hormones, symptoms, etc.
   
2. **AI Prediction Results**
   - Risk level, probability scores
   
3. **Ultrasound Image** (if provided)
   - Visual analysis of ovarian morphology
   - Follicle patterns
   - Polycystic appearance

**What Gemini Does:**

1. Correlates all data points
2. Identifies key risk factors
3. References specific values (LH:FSH ratio, BMI, etc.)
4. Generates actionable recommendations
5. Prioritizes by urgency
6. Formats as structured JSON

---

### Step 7: Response Returns to Frontend
**File:** `frontend/app/results/page.tsx`

```typescript
// Result object received from backend
type PCOSResult = {
  // ... other fields ...
  personalized_recommendations?: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable_tips: string[];
  }>;
  recommendations_source?: "gemini-ai" | "fallback";
  multimodal_analysis?: boolean;
}

// Display logic
const recommendations = result.personalized_recommendations?.length > 0
  ? formatAIRecommendations(result.personalized_recommendations)
  : getRecommendations(result.risk_level);  // Fallback

// Show AI badge if Gemini-generated
{result.recommendations_source === "gemini-ai" && (
  <div className="ai-badge">
    🤖 AI-Generated • Image Analysis
  </div>
)}
```

---

## 🎯 Key Takeaways

### ✅ **ALL Form Data is Used**

Every single field from the assessment form is:
1. Captured in frontend
2. Sent to backend as JSON
3. Extracted by recommendation service
4. Included in the Gemini prompt
5. Analyzed for personalized advice

**Nothing is wasted!**

---

### ✅ **Ultrasound Image is Analyzed**

The image isn't just stored—it's actively:
1. Sent to backend as bytes
2. Converted to PIL Image
3. Passed to Gemini alongside text
4. Visually analyzed by AI
5. Referenced in recommendations

**True multimodal AI!**

---

### ✅ **AI References Exact Values**

Generic: "Maintain healthy weight"  
AI: "Given your BMI of 28.5 and LH:FSH ratio of 2.4..."

The AI directly mentions:
- Patient's actual BMI
- Specific hormone levels
- Exact follicle counts
- Reported symptoms

**Maximum personalization!**

---

## 📊 Data Flow Diagram

```
┌──────────────────────────┐
│  User fills form         │
│  • 40+ parameters        │
│  • Uploads image         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Frontend (assess/page)  │
│  • Validates data        │
│  • Creates FormData      │
│  • JSON.stringify()      │
└──────────┬───────────────┘
           │
           │ POST /api/pcos/predict
           │ Body: { tabular_data, ultrasound }
           ▼
┌──────────────────────────┐
│  Backend API             │
│  • Parse JSON            │
│  • Run prediction        │
│  • Call AI service       │
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────────┐
│  Recommendation Service            │
│  • Extract all 40+ fields          │
│  • Build comprehensive prompt      │
│  • Include prediction results      │
│  • Load ultrasound image           │
└──────────┬─────────────────────────┘
           │
           │ API Call
           ▼
┌────────────────────────────────────┐
│  🤖 Gemini 1.5 Flash               │
│  • Analyzes complete profile       │
│  • Processes ultrasound image      │
│  • Generates recommendations       │
│  • Returns structured JSON         │
└──────────┬─────────────────────────┘
           │
           │ Response
           ▼
┌────────────────────────────────────┐
│  Parse & Return                    │
│  • Extract recommendations         │
│  • Add to API response             │
│  • Set source: "gemini-ai"         │
└──────────┬─────────────────────────┘
           │
           │ JSON Response
           ▼
┌────────────────────────────────────┐
│  Frontend (results/page)           │
│  • Display AI badge                │
│  • Show recommendations            │
│  • Fallback if needed              │
└────────────────────────────────────┘
```

---

## 🔍 Example: How One Value Flows

Let's trace **LH (Luteinizing Hormone)** through the system:

1. **Frontend Form:**
   ```jsx
   <Input name="lh" value="12.5" />
   ```

2. **Submitted:**
   ```javascript
   { "LH(mIU/mL)": 12.5 }
   ```

3. **Backend Receives:**
   ```python
   tabular_dict["LH(mIU/mL)"]  # = 12.5
   ```

4. **Prompt Builder:**
   ```python
   lh = assessment_data.get("LH(mIU/mL)", "N/A")  # = 12.5
   prompt = f"• LH Level: {lh} mIU/mL"
   ```

5. **Gemini Sees:**
   ```
   🔬 HORMONAL PROFILE
   • LH Level: 12.5 mIU/mL
   • FSH Level: 5.2 mIU/mL
   • FSH/LH Ratio: 0.42 (indicates PCOS)
   ```

6. **Gemini Responds:**
   ```json
   {
     "description": "Given your LH:FSH ratio of 2.4 (LH=12.5, FSH=5.2), 
                     which is significantly elevated above normal 1:1 ratio..."
   }
   ```

7. **User Sees:**
   > "Given your LH:FSH ratio of 2.4, immediate endocrinologist consultation recommended"

---

## ✨ Magic Moment

The user enters **40+ raw values** → AI returns **personalized medical insights** referencing their **exact numbers** and **visual ultrasound analysis**.

It feels like a **personal consultation** with a specialist who studied their complete file!

---

**Questions?** Check [`AI_RECOMMENDATIONS_SETUP.md`](./AI_RECOMMENDATIONS_SETUP.md) for detailed implementation guide.
