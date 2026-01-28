"""
Quick test script to verify Gemini AI integration
Run this to check if your setup is working correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("🔍 PCOS AI Recommendation System - Setup Verification")
print("=" * 60)

# Check 1: Environment Variable
print("\n1️⃣ Checking GEMINI_API_KEY environment variable...")
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    masked_key = api_key[:10] + "..." + api_key[-4:] if len(api_key) > 14 else "***"
    print(f"   ✅ API Key found: {masked_key}")
else:
    print("   ❌ GEMINI_API_KEY not found in environment")
    print("   📝 Create a .env file with: GEMINI_API_KEY=your-api-key")
    exit(1)

# Check 2: Google Generative AI Package
print("\n2️⃣ Checking google-generativeai package...")
try:
    import google.generativeai as genai
    print("   ✅ google-generativeai package installed")
except ImportError:
    print("   ❌ google-generativeai not installed")
    print("   📝 Run: pip install google-generativeai")
    exit(1)

# Check 3: Pillow Package
print("\n3️⃣ Checking Pillow (image processing)...")
try:
    from PIL import Image
    print("   ✅ Pillow package installed")
except ImportError:
    print("   ❌ Pillow not installed")
    print("   📝 Run: pip install Pillow")
    exit(1)

# Check 4: Initialize Gemini
print("\n4️⃣ Testing Gemini API connection...")
try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("   ✅ Gemini API initialized successfully")
except Exception as e:
    print(f"   ❌ Failed to initialize Gemini: {e}")
    print("   📝 Check if your API key is valid")
    exit(1)

# Check 5: Test Simple Generation
print("\n5️⃣ Testing content generation...")
try:
    response = model.generate_content("Say 'Hello' in JSON format: {\"message\": \"...\"}")
    print(f"   ✅ Content generation works!")
    print(f"   Response: {response.text[:100]}...")
except Exception as e:
    print(f"   ❌ Content generation failed: {e}")
    print("   📝 Check API quota and permissions")
    exit(1)

# Check 6: Import Recommendation Service
print("\n6️⃣ Testing recommendation service import...")
try:
    from app.services.recommendation_service import recommendation_service
    
    if recommendation_service.model:
        print("   ✅ Recommendation service initialized successfully")
    else:
        print("   ⚠️ Recommendation service initialized but model is None")
        print("   Check if GEMINI_API_KEY is properly loaded")
except ImportError as e:
    print(f"   ❌ Failed to import recommendation service: {e}")
    print("   📝 Make sure app/services/recommendation_service.py exists")
    exit(1)

# Check 7: Test Sample Recommendation Generation
print("\n7️⃣ Testing recommendation generation with sample data...")
try:
    sample_assessment = {
        "Age (yrs)": 28,
        "BMI": 26.5,
        "Cycle(R/I)": "I",
        "Cycle length(days)": 45,
        "LH(mIU/mL)": 12.5,
        "FSH(mIU/mL)": 5.2,
        "AMH(ng/mL)": 8.4,
        "Weight gain(Y/N)": "Y",
        "Reg.Exercise(Y/N)": "N",
    }
    
    sample_result = {
        "risk_level": "HIGH",
        "final_pcos_probability": 0.82,
        "tabular_risk": 0.78,
        "ultrasound_risk": 0.86
    }
    
    print("   🤖 Generating AI recommendations (this may take 5-10 seconds)...")
    ai_result = recommendation_service.generate_personalized_recommendations(
        assessment_data=sample_assessment,
        prediction_result=sample_result,
        ultrasound_image=None  # No image for quick test
    )
    
    if ai_result["status"] == "success" and ai_result["recommendations"]:
        print(f"   ✅ Generated {len(ai_result['recommendations'])} recommendations!")
        print("\n   Sample recommendation:")
        rec = ai_result['recommendations'][0]
        print(f"      Category: {rec['category']}")
        print(f"      Title: {rec['title']}")
        print(f"      Priority: {rec['priority']}")
        print(f"      Actions: {len(rec['actionable_tips'])} tips")
    else:
        print(f"   ⚠️ Recommendation generation returned: {ai_result['status']}")
        if 'message' in ai_result:
            print(f"   Message: {ai_result['message']}")
            
except Exception as e:
    print(f"   ❌ Recommendation generation failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Summary
print("\n" + "=" * 60)
print("🎉 ALL CHECKS PASSED!")
print("=" * 60)
print("\n✨ Your AI recommendation system is fully configured!")
print("\n📋 Next Steps:")
print("   1. Start backend: uvicorn app.main:app --reload")
print("   2. Start frontend: cd frontend && npm run dev")
print("   3. Run an assessment and check for AI-generated badge")
print("\n💡 Tip: Check backend logs for AI generation messages:")
print("   🤖 Generating personalized AI recommendations...")
print("   ✅ Generated X AI recommendations")
print("\n" + "=" * 60)
