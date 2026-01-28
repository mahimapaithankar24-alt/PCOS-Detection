"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/lib/cookies";
import { saveResult } from "@/lib/storage";
import { predictPCOS } from "@/lib/api";
import {
  Activity,
  User,
  FileText,
  Droplet,
  Ruler,
  Stethoscope,
  History,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type YesNo = "Y" | "N";
type CycleType = "R" | "I";

export default function AssessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docStatus, setDocStatus] = useState<string | null>(null);

  useEffect(() => {
  async function checkProfile() {
    const token = getCookie("pcos_token");
    const res = await fetch("http://127.0.0.1:8000/api/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.phone || !data.blood_group) {
      router.push("/profile");
      return;
    }

    // Pre-fill form with profile data
    setForm((prev) => ({
      ...prev,
      age: data.age?.toString() || prev.age,
      height: data.height_cm?.toString() || prev.height,
      weight: data.weight_kg?.toString() || prev.weight,
      bloodGroup: data.blood_group || prev.bloodGroup,
      // Calculate BMI if height and weight are available
      bmi: data.height_cm && data.weight_kg 
        ? (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1)
        : prev.bmi,
    }));
  }

  checkProfile();
}, [router]);


  // ======================================================
  // FORM STATE (UNCHANGED)
  // ======================================================
  const [form, setForm] = useState({
    // Basic
    age: "",
    height: "",
    weight: "",
    bmi: "",
    bloodGroup: "",

    // Cycle
    cycle: "R" as CycleType,
    cycleLength: "",

    // Hormones
    lh: "",
    fsh: "",
    amh: "",
    tsh: "",
    prl: "",
    vitD: "",
    prg: "",
    hcg1: "",
    hcg2: "",

    // Vitals & Blood
    pulse: "",
    rr: "",
    hb: "",
    rbs: "",
    bpSys: "",
    bpDia: "",

    // Body measures
    hip: "",
    waist: "",

    // Ultrasound (tabular)
    follicleL: "",
    follicleR: "",
    avgFL: "",
    avgFR: "",
    endometrium: "",

    // History
    marriageYears: "",
    abortions: "",
    pregnant: "N" as YesNo,

    // Symptoms
    weightGain: "N" as YesNo,
    hairGrowth: "N" as YesNo,
    skinDarkening: "N" as YesNo,
    hairLoss: "N" as YesNo,
    pimples: "N" as YesNo,
    fastFood: "N" as YesNo,
    exercise: "Y" as YesNo,
  });

  const [ultrasound, setUltrasound] = useState<File | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setUltrasound(e.target.files[0]);
  }

  // Helper for toggling Yes/No fields directly
  function handleToggle(name: string, value: YesNo) {
    setForm({ ...form, [name]: value });
  }

  // ======================================================
  // DERIVED VALUES (READ-ONLY)
  // ======================================================
  const fshLhRatio =
    Number(form.lh) > 0 ? Number(form.fsh) / Number(form.lh) : 0;

  const waistHipRatio =
    Number(form.hip) > 0 ? Number(form.waist) / Number(form.hip) : 0;

  // ======================================================
  // MINIMUM CLINICAL REQUIREMENTS (Frontend mirror)
  // ======================================================

  const REQUIRED_CORE_FIELDS = ["age", "cycle", "cycleLength"];

  const HORMONAL_FIELDS = ["lh", "fsh", "amh"];

  const OVARIAN_FIELDS = [
    "follicleL",
    "follicleR",
    "avgFL",
    "avgFR",
    "endometrium",
  ];

  async function handleDocumentUpload(file: File) {
    setDocUploading(true);
    setDocStatus(null);

    try {
      const fd = new FormData();
      fd.append("document", file);

      const res = await fetch("http://127.0.0.1:8000/api/pcos/parse-document", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      // Autofill form using extracted values
      const updates: any = {};

      Object.entries(data.fields).forEach(([key, info]: any) => {
        const val = info.value;

        switch (key) {
          case "Age (yrs)":
            updates.age = val;
            break;
          case "Height(Cm)":
            updates.height = val;
            break;
          case "Weight (Kg)":
            updates.weight = val;
            break;
          case "BMI":
            updates.bmi = val;
            break;
          case "Blood Group":
            updates.bloodGroup = val;
            break;
          case "LH(mIU/mL)":
            updates.lh = val;
            break;
          case "FSH(mIU/mL)":
            updates.fsh = val;
            break;
          case "AMH(ng/mL)":
            updates.amh = val;
            break;
          case "TSH (mIU/L)":
            updates.tsh = val;
            break;
          case "PRL(ng/mL)":
            updates.prl = val;
            break;
          case "Vit D3 (ng/mL)":
            updates.vitD = val;
            break;
          case "PRG(ng/mL)":
            updates.prg = val;
            break;
          case "Hb(g/dl)":
            updates.hb = val;
            break;
          case "RBS(mg/dl)":
            updates.rbs = val;
            break;
          case "Pulse rate(bpm)":
            updates.pulse = val;
            break;
          case "RR (breaths/min)":
            updates.rr = val;
            break;
          case "Hip(inch)":
            updates.hip = val;
            break;
          case "Waist(inch)":
            updates.waist = val;
            break;
          case "Endometrium (mm)":
            updates.endometrium = val;
            break;
          case "FSH/LH":
            break; // derived
          default:
            break;
        }
      });

      setForm((prev) => ({ ...prev, ...updates }));
      setDocStatus("Document parsed successfully. Please review values.");
    } catch (err: any) {
      setDocStatus("Failed to parse document");
      console.error(err);
    } finally {
      setDocUploading(false);
    }
  }

  

  function checkFrontendSufficiency() {
    const missing: string[] = [];

    // Core fields
    REQUIRED_CORE_FIELDS.forEach((f) => {
      if (!form[f as keyof typeof form]) {
        missing.push(f);
      }
    });

    // Hormonal
    const hasHormonal = HORMONAL_FIELDS.some(
      (f) => Number(form[f as keyof typeof form]) > 0
    );

    if (!hasHormonal) {
      missing.push("At least one hormonal value (LH / FSH / AMH)");
    }

    // Ovarian
    const hasOvarian = OVARIAN_FIELDS.some(
      (f) => Number(form[f as keyof typeof form]) > 0
    );

    if (!hasOvarian) {
      missing.push("At least one ultrasound ovarian metric");
    }

    if (!ultrasound) {
      missing.push("Ultrasound image");
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  // ======================================================
  // SUBMIT (UNCHANGED LOGIC)
  // ======================================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const sufficiency = checkFrontendSufficiency();

    if (!sufficiency.valid) {
      setError(
        "Please complete required clinical inputs:\n• " +
          sufficiency.missing.join("\n• ")
      );
      return;
    }

    setLoading(true);

    try {
      const tabularData = {
        "Age (yrs)": Number(form.age),
        "Weight (Kg)": Number(form.weight),
        "Height(Cm)": Number(form.height),
        BMI: Number(form.bmi),

        "Blood Group": form.bloodGroup,
        "Pulse rate(bpm)": Number(form.pulse),
        "RR (breaths/min)": Number(form.rr),
        "Hb(g/dl)": Number(form.hb),

        "Cycle(R/I)": form.cycle,
        "Cycle length(days)": Number(form.cycleLength),

        "Marraige Status (Yrs)": Number(form.marriageYears),
        "Pregnant(Y/N)": form.pregnant,
        "No. of aborptions": Number(form.abortions),

        "I   beta-HCG(mIU/mL)": Number(form.hcg1),
        "II    beta-HCG(mIU/mL)": Number(form.hcg2),

        "FSH(mIU/mL)": Number(form.fsh),
        "LH(mIU/mL)": Number(form.lh),
        "FSH/LH": fshLhRatio,

        "Hip(inch)": Number(form.hip),
        "Waist(inch)": Number(form.waist),
        "Waist:Hip Ratio": waistHipRatio,

        "TSH (mIU/L)": Number(form.tsh),
        "AMH(ng/mL)": Number(form.amh),
        "PRL(ng/mL)": Number(form.prl),
        "Vit D3 (ng/mL)": Number(form.vitD),
        "PRG(ng/mL)": Number(form.prg),
        "RBS(mg/dl)": Number(form.rbs),

        "Weight gain(Y/N)": form.weightGain,
        "hair growth(Y/N)": form.hairGrowth,
        "Skin darkening (Y/N)": form.skinDarkening,
        "Hair loss(Y/N)": form.hairLoss,
        "Pimples(Y/N)": form.pimples,
        "Fast food (Y/N)": form.fastFood,
        "Reg.Exercise(Y/N)": form.exercise,

        "BP _Systolic (mmHg)": Number(form.bpSys),
        "BP _Diastolic (mmHg)": Number(form.bpDia),

        "Follicle No. (L)": Number(form.follicleL),
        "Follicle No. (R)": Number(form.follicleR),
        "Avg. F size (L) (mm)": Number(form.avgFL),
        "Avg. F size (R) (mm)": Number(form.avgFR),
        "Endometrium (mm)": Number(form.endometrium),
      };

      const fd = new FormData();
      fd.append("tabular_data", JSON.stringify(tabularData));
      if (ultrasound) {
        fd.append("ultrasound", ultrasound);
      }

      // ✅ Get token for authenticated requests
      const token = getCookie("pcos_token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // ✅ Direct fetch instead of predictPCOS wrapper
      const response = await fetch("http://127.0.0.1:8000/api/pcos/predict", {
        method: "POST",
        headers,
        body: fd,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction failed");
      }

      const result = await response.json();
      console.log("✅ Received prediction result:", result);

      // ✅ Validate result before saving
      if (!result.final_pcos_probability || !result.risk_level) {
        throw new Error("Invalid response from server");
      }

      // ✅ Save to sessionStorage (avoids cookie size limits)
      saveResult(result);
      
      console.log("✅ Result saved, navigating to results...");
      
      // ✅ Navigate to results
      router.push("/results");
      
    } catch (err: any) {
      console.error("❌ Prediction error:", err);
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // MODERN UI
  // ======================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 pb-20">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <div className="bg-teal-600 p-3 rounded-xl text-white shadow-md">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            PCOS Risk Assessment
          </h1>
          <p className="text-slate-500 text-sm">Clinical AI Diagnostic Suite</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
        {/* Mandatory Field Notice */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
          <p>
            <span className="font-semibold">Note:</span> Fields marked with{" "}
            <span className="text-red-600 font-bold">*</span> are mandatory for
            clinical analysis
          </p>
        </div>

        <Card
          title="Medical Report Upload (Optional)"
          icon={<UploadCloud size={18} />}
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Upload a lab report or ultrasound summary (PDF). Fields will be
              auto-filled and can be reviewed before submission.
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleDocumentUpload(e.target.files[0]);
                }
              }}
              className="block w-full text-sm"
            />

            {docUploading && (
              <p className="text-teal-600 text-sm flex items-center gap-2">
                <Activity className="animate-spin" size={16} />
                Parsing document...
              </p>
            )}

            {docStatus && (
              <p className="text-slate-600 text-sm font-medium">{docStatus}</p>
            )}
          </div>
        </Card>

        {/* ROW 1: Demographics & Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Details */}
          <Card
            title="Patient Demographics"
            icon={<User size={18} />}
            className="lg:col-span-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age (yrs)"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={10}
                max={55}
                required
              />
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  )
                )}
              </Select>
              <Input
                label="Marriage (Yrs)"
                name="marriageYears"
                value={form.marriageYears}
                onChange={handleChange}
              />
              <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
                  Pregnant?
                </label>
                <ToggleGroup
                  name="pregnant"
                  value={form.pregnant}
                  onChange={handleToggle}
                />
              </div>
              <Input
                label="Abortions"
                name="abortions"
                value={form.abortions}
                onChange={handleChange}
                className="col-span-2"
              />
            </div>
          </Card>

          {/* Body Composition */}
          <Card
            title="Body Composition"
            icon={<Ruler size={18} />}
            className="lg:col-span-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Height (cm)"
                name="height"
                value={form.height}
                onChange={handleChange}
                min={120}
                max={200}
              />
              <Input
                label="Weight (kg)"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min={30}
                max={150}
              />
              <Input
                label="Waist (in)"
                name="waist"
                value={form.waist}
                onChange={handleChange}
                step="0.1"
              />
              <Input
                label="Hip (in)"
                name="hip"
                value={form.hip}
                onChange={handleChange}
                step="0.1"
              />

              {/* Manual BMI Input + Calculated Display */}
              <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-4 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Input
                  label="Manual BMI Input"
                  name="bmi"
                  value={form.bmi}
                  onChange={handleChange}
                  step="0.1"
                />

                {/* Visual Ratio Indicators */}
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Calc. Waist/Hip
                  </span>
                  <span className="text-lg font-bold text-slate-700">
                    {waistHipRatio > 0 ? waistHipRatio.toFixed(2) : "--"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 2: Vitals & Hormones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vitals & Cycle */}
          <Card title="Vitals & Cycle" icon={<History size={18} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="BP Sys"
                  name="bpSys"
                  value={form.bpSys}
                  onChange={handleChange}
                />
                <Input
                  label="BP Dia"
                  name="bpDia"
                  value={form.bpDia}
                  onChange={handleChange}
                />
                <Input
                  label="Pulse"
                  name="pulse"
                  value={form.pulse}
                  onChange={handleChange}
                />
                <Input
                  label="Resp. Rate"
                  name="rr"
                  value={form.rr}
                  onChange={handleChange}
                />
              </div>
              <hr className="border-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Cycle Type"
                  name="cycle"
                  value={form.cycle}
                  onChange={handleChange}
                  required
                >
                  <option value="R">Regular</option>
                  <option value="I">Irregular</option>
                </Select>
                <Input
                  label="Cycle Length (d)"
                  name="cycleLength"
                  value={form.cycleLength}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Hormonal Panel */}
          <Card
            title="Hormonal Profile & Labs"
            icon={<Droplet size={18} />}
            className="lg:col-span-2"
          >
            <p className="text-xs text-slate-500 mb-3 bg-amber-50 border border-amber-200 p-2 rounded">
              <span className="text-red-600 font-bold">*</span> At least one hormonal value (LH / FSH / AMH) required
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="LH (mIU/mL)"
                name="lh"
                value={form.lh}
                onChange={handleChange}
                step="0.01"
              />
              <Input
                label="FSH (mIU/mL)"
                name="fsh"
                value={form.fsh}
                onChange={handleChange}
                step="0.01"
              />
              {/* Ratio Display */}
              <div className="col-span-2 md:col-span-2 flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-100 rounded text-teal-900">
                <span className="text-xs font-bold uppercase">
                  FSH/LH Ratio
                </span>
                <span className="font-mono font-bold text-lg">
                  {fshLhRatio > 0 ? fshLhRatio.toFixed(2) : "0.00"}
                </span>
              </div>
              <Input
                label="AMH (ng/mL)"
                name="amh"
                value={form.amh}
                onChange={handleChange}
                step="0.01"
              />
              <Input
                label="TSH (mIU/L)"
                name="tsh"
                value={form.tsh}
                onChange={handleChange}
                step="0.01"
              />
              <Input
                label="Prolactin"
                name="prl"
                value={form.prl}
                onChange={handleChange}
                step="0.01"
              />
              <Input
                label="Vit D3"
                name="vitD"
                value={form.vitD}
                onChange={handleChange}
                step="0.1"
              />
              <Input
                label="Hb (g/dL)"
                name="hb"
                value={form.hb}
                onChange={handleChange}
                step="0.1"
              />
              <Input
                label="RBS (mg/dL)"
                name="rbs"
                value={form.rbs}
                onChange={handleChange}
              />
              <Input
                label="Progesterone"
                name="prg"
                value={form.prg}
                onChange={handleChange}
                step="0.01"
              />
              <div className="hidden md:block"></div> {/* Spacer */}
              <Input
                label="β-HCG I"
                name="hcg1"
                value={form.hcg1}
                onChange={handleChange}
                step="0.01"
              />
              <Input
                label="β-HCG II"
                name="hcg2"
                value={form.hcg2}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </Card>
        </div>

        {/* ROW 3: Imaging & Symptoms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ultrasound Data */}
          <Card
            title="Ultrasound Findings"
            icon={<Stethoscope size={18} />}
            className="lg:col-span-5"
          >
            <p className="text-xs text-slate-500 mb-3 bg-amber-50 border border-amber-200 p-2 rounded">
              <span className="text-red-600 font-bold">*</span> At least one ovarian metric required
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Input
                label="Follicles (L)"
                name="follicleL"
                value={form.follicleL}
                onChange={handleChange}
              />
              <Input
                label="Follicles (R)"
                name="follicleR"
                value={form.follicleR}
                onChange={handleChange}
              />
              <Input
                label="Avg Size L (mm)"
                name="avgFL"
                value={form.avgFL}
                onChange={handleChange}
                step="0.1"
              />
              <Input
                label="Avg Size R (mm)"
                name="avgFR"
                value={form.avgFR}
                onChange={handleChange}
                step="0.1"
              />
              <Input
                label="Endometrium (mm)"
                name="endometrium"
                value={form.endometrium}
                onChange={handleChange}
                step="0.1"
                className="col-span-2"
              />
            </div>

            {/* Upload Area */}
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Upload USG Scan <span className="text-red-600">*</span>
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {ultrasound ? (
                  <div className="text-teal-600 flex flex-col items-center">
                    <CheckCircle2 className="mb-2" size={32} />
                    <span className="text-sm font-medium">
                      {ultrasound.name}
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 group-hover:text-slate-600 flex flex-col items-center">
                    <UploadCloud className="mb-2" size={32} />
                    <span className="text-sm font-medium">
                      Click or Drag scan image here
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Clinical Symptoms */}
          <Card
            title="Clinical Symptoms"
            icon={<FileText size={18} />}
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SymptomRow
                label="Weight Gain"
                name="weightGain"
                value={form.weightGain}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Excess Hair Growth"
                name="hairGrowth"
                value={form.hairGrowth}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Skin Darkening"
                name="skinDarkening"
                value={form.skinDarkening}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Hair Loss"
                name="hairLoss"
                value={form.hairLoss}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Acne / Pimples"
                name="pimples"
                value={form.pimples}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Fast Food Intake"
                name="fastFood"
                value={form.fastFood}
                onChange={handleToggle}
              />
              <SymptomRow
                label="Regular Exercise"
                name="exercise"
                value={form.exercise}
                onChange={handleToggle}
                inverse
              />
            </div>
          </Card>
        </div>

        {/* Error & Action */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Please complete required clinical inputs:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {error.split('\n•').slice(1).map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading || !checkFrontendSufficiency().valid}
            className="bg-slate-900 hover:bg-teal-600 text-white font-semibold py-4 px-8 rounded-lg transition-all min-w-[200px] flex justify-center items-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Activity className="animate-spin" size={20} /> Analyzing...
              </span>
            ) : (
              "Run Analysis"
            )}
          </button>
          {!checkFrontendSufficiency().valid && !loading && (
            <p className="text-xs text-slate-500 mt-2 italic">
              Complete minimum clinical inputs to enable analysis
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

/* ======================================================
   MODERN COMPONENT LIBRARY
====================================================== */

function Card({ title, icon, children, className = "" }: any) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    >
      <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="text-teal-600">{icon}</div>
        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Input({ label, name, className = "", value, required, ...props }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        name={name}
        type="number"
        value={value ?? ""}
        className="block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 border transition-colors"
        {...props}
      />
    </div>
  );
}

function Select({ label, name, children, className = "", required, ...props }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        name={name}
        className="block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 border transition-colors"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// A toggle switch component for Yes/No to replace dropdowns
function ToggleGroup({
  name,
  value,
  onChange,
  inverse = false,
}: {
  name: string;
  value: YesNo;
  onChange: (n: string, v: YesNo) => void;
  inverse?: boolean;
}) {
  const isYes = value === "Y";
  const activeClass = inverse
    ? "bg-teal-600 text-white border-teal-600" // Exercise (Yes is good)
    : "bg-rose-500 text-white border-rose-500"; // Symptoms (Yes is bad)

  return (
    <div className="flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={() => onChange(name, "N")}
        className={`px-3 py-1.5 text-xs font-medium border rounded-l-lg transition-colors flex-1 ${
          !isYes
            ? "bg-slate-700 text-white border-slate-700"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        }`}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => onChange(name, "Y")}
        className={`px-3 py-1.5 text-xs font-medium border rounded-r-lg transition-colors flex-1 ${
          isYes
            ? activeClass
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        }`}
      >
        Yes
      </button>
    </div>
  );
}

function SymptomRow({ label, name, value, onChange, inverse }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="w-24">
        <ToggleGroup
          name={name}
          value={value}
          onChange={onChange}
          inverse={inverse}
        />
      </div>
    </div>
  );
}
