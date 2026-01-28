# 🤖 AI-Powered Personalized Recommendations Setup

This guide will help you set up the Gemini AI integration for generating personalized PCOS recommendations based on patient assessment data and ultrasound images.

---

## 📋 Overview

The system now uses **Google Gemini 1.5 Flash** to generate personalized health recommendations by analyzing:

✅ **Complete clinical assessment data** (40+ parameters)  
✅ **Hormonal profiles** (LH, FSH, AMH, TSH, etc.)  
✅ **Metabolic markers** (BMI, blood sugar, blood pressure)  
✅ **Ultrasound findings** (follicle counts, sizes, endometrium)  
✅ **Lifestyle factors** (exercise, diet, symptoms)  
✅ **Ultrasound images** (multimodal visual analysis) 🔥

**Result:** Instead of generic advice, users get recommendations tailored to their exact health profile!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Gemini API Key

1. Go to **Google AI Studio**: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

**💰 Pricing:**
- **Free Tier:** 60 requests/minute (plenty for testing!)
- **Paid Tier:** $0.00025 per request (extremely affordable)
- More info: https://ai.google.dev/pricing

---

### Step 2: Configure Backend Environment

Create/update your `.env` file in the **project root**:

```bash
# Backend (.env file at project root)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Important:**
- Never commit your `.env` file to Git
- Add `.env` to `.gitignore` if not already there
- Keep your API key secret

---

### Step 3: Install Dependencies

```bash
# Backend
cd d:\Projects\PCOS
pip install google-generativeai==0.8.3 Pillow==11.2.0

# Or install from requirements.txt
pip install -r requirements.txt
```

---

## ✅ Verification

### Test Backend Service

```python
# Run this in Python console or create test_gemini.py
from app.services.recommendation_service import recommendation_service

# Check if initialized
if recommendation_service.model:
    print("✅ Gemini AI is ready!")
else:
    print("❌ Gemini API key not configured")
```

### Test Full Flow

1. **Start backend:**
   ```bash
   cd d:\Projects\PCOS
   uvicorn app.main:app --reload
   ```

2. **Start frontend:**
   ```bash
   cd d:\Projects\PCOS\frontend
   npm run dev
   ```

3. **Run an assessment:**
   - Fill out the assessment form
   - Upload an ultrasound image
   - Submit and view results

4. **Check for AI badge:**
   - In the results page, look for the purple **"AI-Generated"** badge
   - If present, recommendations are from Gemini AI
   - If not, check backend logs for errors

---

## 🔧 How It Works

### Architecture Flow

```
┌─────────────────┐
│  User submits   │
│   assessment    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Frontend (assess/page.tsx)             │
│  - Collects 40+ clinical parameters     │
│  - Uploads ultrasound image             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Backend API (api/pcos.py)              │
│  1. Run PCOS prediction models          │
│  2. Generate Grad-CAM visualization     │
│  3. Call recommendation_service         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Recommendation Service                 │
│  (services/recommendation_service.py)   │
│                                         │
│  1. Build comprehensive prompt with:    │
│     • All 40+ assessment parameters     │
│     • AI prediction results             │
│     • Risk level analysis               │
│                                         │
│  2. Send to Gemini 1.5 Flash with:      │
│     • Structured prompt                 │
│     • Ultrasound image (multimodal!)    │
│                                         │
│  3. Parse JSON response                 │
│  4. Return personalized recommendations │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Response sent back to frontend         │
│  {                                      │
│    recommendations: [...],              │
│    recommendations_source: "gemini-ai", │
│    multimodal_analysis: true            │
│  }                                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Results Page (results/page.tsx)        │
│  - Shows AI badge if Gemini-generated   │
│  - Displays personalized recommendations│
│  - Falls back to generic if AI fails    │
└─────────────────────────────────────────┘
```

---

## 🎨 What Users See

### Before (Generic):
```
✓ Nutrition & Diet
  - Maintain balanced diet
  - Exercise regularly
  - Reduce stress
```

### After (AI-Personalized):
```
🤖 AI-Generated • Image Analysis

✓ Medical Consultation (HIGH PRIORITY)
  Title: Schedule Endocrinologist Appointment Within 2 Weeks
  
  Description: Given your LH:FSH ratio of 2.8 and elevated AMH (8.4 ng/mL), 
  immediate specialist evaluation is recommended.
  
  Actions:
  • Book appointment with reproductive endocrinologist within 14 days
  • Request comprehensive metabolic panel (fasting glucose, insulin, HbA1c)
  • Bring this AI report and ultrasound images
  • Discuss metformin therapy given your BMI of 28.5

✓ Nutrition Strategy (HIGH PRIORITY)
  Title: Low-GI Mediterranean Diet with 300-500 Calorie Deficit
  
  Description: Your BMI (28.5) and irregular cycles suggest insulin resistance. 
  Focus on blood sugar control through strategic nutrition.
  
  Actions:
  • Switch to low-glycemic index foods (GI < 55)
  • Target 1600-1800 calories/day for gradual weight loss
  • Meal timing: 3 meals + 2 snacks, no late-night eating
  • Increase omega-3 intake: fatty fish 2x/week, flaxseeds daily
```

**Impact:** User satisfaction ⬆️⬆️⬆️

---

## 📊 Prompt Engineering Details

The system builds a comprehensive prompt including:

### Demographics & Body Composition
- Age, height, weight, BMI
- Waist-hip ratio (android obesity indicator)
- Marriage status, pregnancy history

### Hormonal Profile (14 markers)
- LH, FSH, FSH/LH ratio
- AMH (key PCOS marker)
- TSH, Prolactin, Vitamin D3
- Progesterone, β-HCG levels
- Hemoglobin, Random Blood Sugar

### Ultrasound Findings
- Follicle counts (left/right ovary)
- Average follicle sizes
- Endometrial thickness
- **Plus visual analysis of image!**

### Lifestyle & Symptoms
- Exercise habits, diet quality
- Weight gain, hirsutism, acne
- Skin darkening, hair loss

### AI Diagnostic Results
- Risk level (LOW/MODERATE/HIGH)
- Overall PCOS probability
- Component risk scores

---

## 🛡️ Fallback System

The system is designed to **never break**:

1. **If Gemini API fails** → Uses generic recommendations
2. **If image processing fails** → Uses text-only analysis
3. **If JSON parsing fails** → Falls back gracefully
4. **If API key missing** → Warns but continues

Users always see recommendations (just less personalized if AI fails).

---

## 🔍 Troubleshooting

### Issue: "⚠️ GEMINI_API_KEY not found"

**Solution:**
```bash
# Check .env file exists
ls .env

# Check content
cat .env | grep GEMINI

# Make sure it's in project root, not /app/
```

---

### Issue: AI recommendations not showing

**Check backend logs:**
```bash
# Look for these messages:
✅ Gemini AI initialized successfully
🤖 Generating personalized AI recommendations...
✅ Generated 5 AI recommendations
```

**If you see errors:**
```bash
❌ Gemini API Error: ...
```

Check:
1. API key is valid (test at https://makersuite.google.com/)
2. API key has no spaces/newlines
3. You haven't exceeded free tier limits (60/min)

---

### Issue: "Invalid JSON response"

This means Gemini returned text instead of structured JSON.

**Solution:** The service auto-retries and logs the issue. If persistent:
1. Check prompt in `recommendation_service.py`
2. Gemini may need clearer formatting instructions
3. Try gemini-1.5-pro (more reliable but slower)

---

### Issue: Rate limit exceeded

**Free tier:** 60 requests/minute

**Solutions:**
- Wait 1 minute between assessments
- Upgrade to paid tier (very cheap)
- Add caching (advanced)

---

## 💡 Advanced Configuration

### Use Gemini Pro (More Advanced)

In `app/services/recommendation_service.py`:
```python
# Change line 20:
self.model = genai.GenerativeModel('gemini-1.5-pro')  # Instead of 'flash'
```

**Trade-off:**
- Pro: Better medical reasoning, more detailed recommendations
- Con: Slower, more expensive

---

### Add Caching (Avoid Redundant Calls)

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def get_cached_recommendations(data_hash: str, result_hash: str):
    # Implementation here
```

This prevents regenerating recommendations for identical assessments.

---

## 📈 Monitoring & Analytics

Track AI performance:

```python
# Add to recommendation_service.py
import time

start = time.time()
response = self.model.generate_content(...)
duration = time.time() - start

print(f"⏱️ Gemini response time: {duration:.2f}s")
```

**Typical times:**
- Text-only: 2-4 seconds
- With image: 4-8 seconds

---

## 🔒 Security Best Practices

1. **Never expose API key to frontend**
   - ✅ Keep in backend `.env`
   - ❌ Don't use `NEXT_PUBLIC_GEMINI_API_KEY`

2. **Add rate limiting** (prevents abuse)
   ```python
   from slowapi import Limiter
   limiter.limit("10/minute")
   ```

3. **Sanitize prompts** (prevent injection)
   - Already done in `_build_comprehensive_prompt()`

4. **Log monitoring** (detect anomalies)
   - Check for unusual API usage spikes

---

## 🎯 Next Steps

✅ **You're all set!** The AI recommendation system is ready.

**Optional Enhancements:**
1. Add user feedback ("Was this helpful?")
2. Store AI recommendations in database
3. A/B test AI vs generic recommendations
4. Add more recommendation categories
5. Multi-language support

---

## 📞 Support

**Issues?** Check:
1. Backend logs: `uvicorn app.main:app --reload`
2. Frontend console: Browser DevTools
3. Gemini API status: https://status.cloud.google.com/

**Questions about the implementation?**
- Review code comments in `recommendation_service.py`
- Check API integration in `pcos.py`
- Frontend handling in `results/page.tsx`

---

## 📚 Resources

- **Gemini Docs:** https://ai.google.dev/docs
- **API Reference:** https://ai.google.dev/api/python/google/generativeai
- **Pricing:** https://ai.google.dev/pricing
- **Examples:** https://ai.google.dev/examples

---

**Happy coding! 🚀**
