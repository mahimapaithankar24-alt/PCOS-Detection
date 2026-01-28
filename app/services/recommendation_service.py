"""
PCOS AI Recommendation Service
Generates personalized health recommendations using Google Gemini AI
Supports multimodal analysis (clinical data + ultrasound images)
"""

import google.generativeai as genai
from typing import Dict, Any, List, Optional
import os
import json
import re
from PIL import Image
import io

class RecommendationService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ GEMINI_API_KEY not found in environment variables")
            self.model = None
            return
        
        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash for multimodal support (faster and cheaper)
        # or gemini-1.5-pro for more advanced analysis
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Gemini AI initialized successfully")
    
    def generate_personalized_recommendations(
        self, 
        assessment_data: Dict[str, Any], 
        prediction_result: Dict[str, Any],
        ultrasound_image: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized PCOS recommendations using Gemini AI
        
        Args:
            assessment_data: Complete form data from assessment
            prediction_result: AI model prediction results
            ultrasound_image: Optional ultrasound image bytes for visual analysis
            
        Returns:
            Dictionary with recommendations or fallback
        """
        
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured",
                "recommendations": None
            }
        
        try:
            prompt = self._build_comprehensive_prompt(assessment_data, prediction_result)
            
            # Multimodal: Include ultrasound image if provided
            if ultrasound_image:
                try:
                    image = Image.open(io.BytesIO(ultrasound_image))
                    # Resize if too large (Gemini has size limits)
                    if image.width > 1024 or image.height > 1024:
                        image.thumbnail((1024, 1024), Image.Lanczos)
                    
                    # Generate with both text and image
                    response = self.model.generate_content([prompt, image])
                    print("✅ Generated recommendations with ultrasound image analysis")
                except Exception as img_err:
                    print(f"⚠️ Image processing failed, using text-only: {img_err}")
                    response = self.model.generate_content(prompt)
            else:
                response = self.model.generate_content(prompt)
            
            recommendations = self._parse_response(response.text)
            
            return {
                "status": "success",
                "recommendations": recommendations,
                "generated_by": "gemini-ai",
                "multimodal": ultrasound_image is not None
            }
            
        except Exception as e:
            print(f"❌ Gemini API Error: {e}")
            return {
                "status": "error",
                "message": str(e),
                "recommendations": None
            }
    
    def _build_comprehensive_prompt(self, assessment_data: Dict, result: Dict) -> str:
        """Build detailed prompt with all clinical parameters"""
        
        risk_level = result.get("risk_level", "MODERATE")
        probability = result.get("final_pcos_probability", 0.5) * 100
        tabular_risk = result.get("tabular_risk", 0) * 100
        ultrasound_risk = result.get("ultrasound_risk", 0) * 100
        
        # Extract all clinical parameters
        age = assessment_data.get("Age (yrs)", "N/A")
        bmi = assessment_data.get("BMI", "N/A")
        weight = assessment_data.get("Weight (Kg)", "N/A")
        height = assessment_data.get("Height(Cm)", "N/A")
        
        # Cycle information
        cycle_type = assessment_data.get("Cycle(R/I)", "N/A")
        cycle_length = assessment_data.get("Cycle length(days)", "N/A")
        
        # Hormonal profile
        lh = assessment_data.get("LH(mIU/mL)", "N/A")
        fsh = assessment_data.get("FSH(mIU/mL)", "N/A")
        fsh_lh_ratio = assessment_data.get("FSH/LH", "N/A")
        amh = assessment_data.get("AMH(ng/mL)", "N/A")
        tsh = assessment_data.get("TSH (mIU/L)", "N/A")
        prl = assessment_data.get("PRL(ng/mL)", "N/A")
        vit_d = assessment_data.get("Vit D3 (ng/mL)", "N/A")
        
        # Metabolic markers
        rbs = assessment_data.get("RBS(mg/dl)", "N/A")
        hb = assessment_data.get("Hb(g/dl)", "N/A")
        bp_sys = assessment_data.get("BP _Systolic (mmHg)", "N/A")
        bp_dia = assessment_data.get("BP _Diastolic (mmHg)", "N/A")
        
        # Body measurements
        waist = assessment_data.get("Waist(inch)", "N/A")
        hip = assessment_data.get("Hip(inch)", "N/A")
        waist_hip_ratio = assessment_data.get("Waist:Hip Ratio", "N/A")
        
        # Ultrasound findings
        follicle_l = assessment_data.get("Follicle No. (L)", "N/A")
        follicle_r = assessment_data.get("Follicle No. (R)", "N/A")
        avg_size_l = assessment_data.get("Avg. F size (L) (mm)", "N/A")
        avg_size_r = assessment_data.get("Avg. F size (R) (mm)", "N/A")
        endometrium = assessment_data.get("Endometrium (mm)", "N/A")
        
        # Lifestyle factors
        exercise = assessment_data.get("Reg.Exercise(Y/N)", "N/A")
        fast_food = assessment_data.get("Fast food (Y/N)", "N/A")
        
        # Clinical symptoms
        weight_gain = assessment_data.get("Weight gain(Y/N)", "N/A")
        hair_growth = assessment_data.get("hair growth(Y/N)", "N/A")
        skin_darkening = assessment_data.get("Skin darkening (Y/N)", "N/A")
        hair_loss = assessment_data.get("Hair loss(Y/N)", "N/A")
        pimples = assessment_data.get("Pimples(Y/N)", "N/A")
        
        # Reproductive history
        marriage_years = assessment_data.get("Marraige Status (Yrs)", "N/A")
        pregnant = assessment_data.get("Pregnant(Y/N)", "N/A")
        abortions = assessment_data.get("No. of aborptions", "N/A")
        
        prompt = f"""You are a specialized medical AI assistant for PCOS (Polycystic Ovary Syndrome) management and women's reproductive health. 
Analyze the complete clinical assessment below and generate **personalized, evidence-based, actionable recommendations**.

═══════════════════════════════════════════════════════════════
📊 AI DIAGNOSTIC RESULTS
═══════════════════════════════════════════════════════════════
• Overall Risk Level: {risk_level}
• PCOS Probability: {probability:.1f}%
• Clinical Data Risk Score: {tabular_risk:.1f}%
• Ultrasound Risk Score: {ultrasound_risk:.1f}%

═══════════════════════════════════════════════════════════════
👤 PATIENT DEMOGRAPHICS
═══════════════════════════════════════════════════════════════
• Age: {age} years
• Height: {height} cm
• Weight: {weight} kg
• BMI: {bmi}
• Marriage Status: {marriage_years} years
• Currently Pregnant: {pregnant}
• Previous Abortions: {abortions}

═══════════════════════════════════════════════════════════════
🩺 MENSTRUAL CYCLE CHARACTERISTICS
═══════════════════════════════════════════════════════════════
• Cycle Regularity: {cycle_type} (R=Regular, I=Irregular)
• Average Cycle Length: {cycle_length} days

═══════════════════════════════════════════════════════════════
🔬 HORMONAL PROFILE
═══════════════════════════════════════════════════════════════
• LH Level: {lh} mIU/mL
• FSH Level: {fsh} mIU/mL
• FSH/LH Ratio: {fsh_lh_ratio}
• AMH Level: {amh} ng/mL (key PCOS marker)
• TSH: {tsh} mIU/L
• Prolactin: {prl} ng/mL
• Vitamin D3: {vit_d} ng/mL

═══════════════════════════════════════════════════════════════
💉 METABOLIC MARKERS & VITALS
═══════════════════════════════════════════════════════════════
• Random Blood Sugar: {rbs} mg/dL
• Hemoglobin: {hb} g/dL
• Blood Pressure: {bp_sys}/{bp_dia} mmHg

═══════════════════════════════════════════════════════════════
📏 BODY COMPOSITION
═══════════════════════════════════════════════════════════════
• Waist Circumference: {waist} inches
• Hip Circumference: {hip} inches
• Waist-to-Hip Ratio: {waist_hip_ratio} (android obesity indicator)

═══════════════════════════════════════════════════════════════
🔍 ULTRASOUND FINDINGS (Ovarian Morphology)
═══════════════════════════════════════════════════════════════
• Follicle Count - Left Ovary: {follicle_l}
• Follicle Count - Right Ovary: {follicle_r}
• Average Follicle Size (Left): {avg_size_l} mm
• Average Follicle Size (Right): {avg_size_r} mm
• Endometrial Thickness: {endometrium} mm

Note: An ultrasound image has been provided for additional visual analysis.
Please incorporate any visible ovarian morphology patterns (polycystic appearance, follicle distribution, ovarian volume) into your recommendations.

═══════════════════════════════════════════════════════════════
🏃 LIFESTYLE & BEHAVIORAL FACTORS
═══════════════════════════════════════════════════════════════
• Regular Exercise: {exercise}
• Fast Food Consumption: {fast_food}

═══════════════════════════════════════════════════════════════
⚕️ CLINICAL SYMPTOMS & MANIFESTATIONS
═══════════════════════════════════════════════════════════════
• Recent Weight Gain: {weight_gain}
• Excess Hair Growth (Hirsutism): {hair_growth}
• Skin Darkening (Acanthosis Nigricans): {skin_darkening}
• Scalp Hair Loss: {hair_loss}
• Acne/Pimples: {pimples}

═══════════════════════════════════════════════════════════════
🎯 YOUR TASK
═══════════════════════════════════════════════════════════════
Generate 4-6 personalized recommendations covering:

1. **Medical Consultation** (if risk is MODERATE or HIGH)
   - Specialist referrals based on risk level
   - Specific tests to request
   - Timeline for follow-up

2. **Nutrition & Diet** (tailored to BMI, metabolic markers, symptoms)
   - Specific dietary patterns (Mediterranean, low-GI, anti-inflammatory)
   - Foods to emphasize and avoid
   - Meal timing and frequency
   - Supplement recommendations if deficiencies noted

3. **Physical Activity** (customized to current exercise habits)
   - Type, intensity, duration of exercise
   - Specific activities for insulin sensitivity
   - Realistic progression plan

4. **Hormonal & Metabolic Management** (based on lab values)
   - Strategies for hormonal balance
   - Insulin resistance management if indicated
   - Vitamin D supplementation if low
   - Sleep and stress management

5. **Symptom-Specific Care** (address hirsutism, acne, hair loss if present)
   - Cosmetic and medical management options
   - When to consider dermatology referral

6. **Reproductive Health** (if relevant to patient's profile)
   - Fertility considerations
   - Contraceptive options
   - Pregnancy planning if desired

═══════════════════════════════════════════════════════════════
📋 RESPONSE FORMAT (STRICT JSON)
═══════════════════════════════════════════════════════════════
{{
  "recommendations": [
    {{
      "category": "Medical Consultation",
      "title": "Clear, Actionable Title",
      "description": "1-2 sentence summary explaining WHY this matters for THIS patient",
      "priority": "high|medium|low",
      "actionable_tips": [
        "Specific action 1 with timeline (e.g., 'Schedule endocrinologist within 2 weeks')",
        "Specific action 2 with measurable goal",
        "Specific action 3 tailored to patient's values",
        "Specific action 4 if needed"
      ]
    }},
    ...
  ]
}}

═══════════════════════════════════════════════════════════════
📜 CRITICAL GUIDELINES
═══════════════════════════════════════════════════════════════
✅ DO:
• Provide SPECIFIC numbers, timelines, and metrics
• Tailor advice to the patient's actual lab values and symptoms
• Use empathetic, encouraging, non-judgmental language
• Reference evidence-based PCOS management guidelines
• Adjust urgency based on risk level (HIGH = immediate, MODERATE = 2-4 weeks, LOW = routine)
• Consider cultural and practical feasibility
• Include why each recommendation matters for THIS patient

❌ DON'T:
• Give generic advice that could apply to anyone
• Use fear-mongering or alarmist language
• Recommend specific medications (suggest discussing with doctor)
• Ignore the patient's current lifestyle habits
• Provide conflicting advice
• Exceed 6 recommendations (focus on highest impact)

═══════════════════════════════════════════════════════════════
Generate the JSON response now:"""

        return prompt
    
    def _parse_response(self, response_text: str) -> List[Dict]:
        """Parse Gemini response into structured recommendations"""
        
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        else:
            # Try to find JSON object in the text
            json_match = re.search(r'\{.*"recommendations".*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
        
        try:
            parsed = json.loads(response_text.strip())
            recommendations = parsed.get("recommendations", [])
            
            # Validate structure
            for rec in recommendations:
                if not all(key in rec for key in ["category", "title", "description", "priority", "actionable_tips"]):
                    print(f"⚠️ Invalid recommendation structure: {rec}")
                    return []
            
            print(f"✅ Successfully parsed {len(recommendations)} recommendations")
            return recommendations
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"Response text: {response_text[:500]}...")
            return []

# Singleton instance
recommendation_service = RecommendationService()
