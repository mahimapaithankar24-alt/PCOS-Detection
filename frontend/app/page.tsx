"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Stethoscope,
  BrainCircuit,
  User,
  BarChart3,
  Eye,
  Layers,
  ClipboardList,
} from "lucide-react";

type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const token = getCookie("pcos_token");
    const userData = getCookie("pcos_user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.warn("Invalid user cookie");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-900 font-sans">
      {/* ================= HERO ================= */}
      <section className="relative pt-32 pb-28 overflow-hidden">
        {/* Background accents (subtle & clean) */}
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Zap size={14} />
            Multimodal Clinical Decision Support
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            AI-Driven PCOS <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Risk Assessment Platform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
            A research-grade platform combining structured clinical data and
            pelvic ultrasound imaging with{" "}
            <span className="font-semibold text-emerald-600">
              explainable AI
            </span>{" "}
            to estimate PCOS risk and support early screening.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/assess")}
              className="group px-9 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-xl flex items-center gap-3"
            >
              Start Assessment
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-9 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:border-emerald-300 hover:bg-slate-50 transition-all"
            >
              View Dashboard
            </button>
          </div>

          {/* Trust row */}
          <div className="mt-16 flex flex-wrap justify-center gap-10 text-sm text-slate-500">
            <Trust icon={<ShieldCheck />} text="Ethical & Safe AI" />
            <Trust icon={<Eye />} text="Explainable Results" />
            <Trust icon={<Activity />} text="Clinically Evaluated Models" />
          </div>
        </div>
      </section>

      {/* ================= PERFORMANCE ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              Validated Model Performance
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Evaluation results from held-out validation datasets using
              ResNet50 and Grad-CAM-enabled models.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Stat value="86%" label="Ultrasound + Catboost Model Accuracy" />
            <Stat value="88.76%" label="Tabular CatBoost Model Accuracy" />
            <Stat value="81%" label="ResNet50 Grad-CAM Model Accuracy" />
            <Stat value="85%" label="Ultrasound EfficientNetB0 Model Accuracy" />
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            High recall prioritizes safer screening and reduces false negatives.
          </p>
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">How the System Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A carefully designed multimodal AI pipeline for PCOS risk
              estimation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Step
              number="01"
              icon={<ClipboardList />}
              title="Clinical Feature Analysis"
              desc="CatBoost ensemble models evaluate hormonal, metabolic, anthropometric, and cycle-related parameters."
            />
            <Step
              number="02"
              icon={<Stethoscope />}
              title="Ultrasound Image Analysis"
              desc="A ResNet50 CNN learns ovarian morphology patterns from pelvic ultrasound images."
            />
            <Step
              number="03"
              icon={<Eye />}
              title="Explainable AI Output"
              desc="Grad-CAM heatmaps highlight ovarian regions contributing to the final prediction."
            />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-28 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Platform Capabilities</h2>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              Designed as a full-stack AI decision support system — not just a
              prediction model.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={<Layers />}
              title="Multimodal AI Fusion"
              desc="Tabular CatBoost models and CNN predictions combined via a meta-learning strategy."
            />
            <Feature
              icon={<Eye />}
              title="Grad-CAM Heatmaps"
              desc="Visual explanations for ultrasound-based predictions."
            />
            <Feature
              icon={<BrainCircuit />}
              title="Personalized AI Insights"
              desc="Recommendations adapt to patient-specific inputs and confidence levels."
            />
            <Feature
              icon={<BarChart3 />}
              title="Assessment History"
              desc="Longitudinal tracking of PCOS risk across multiple assessments."
            />
            <Feature
              icon={<User />}
              title="User Profiles"
              desc="Reusable clinical details to improve consistency and reduce friction."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Ethical AI Design"
              desc="Built strictly as a decision support tool, not a diagnostic authority."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24  bg-slate-50 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Begin Your PCOS Risk Assessment
        </h2>
        <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
          Obtain probabilistic risk estimates with transparent AI explanations
          to support early screening.
        </p>
        <button
          onClick={() => router.push("/assess")}
          className="px-10 py-4 bg-white text-slate-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl cursor-pointer"
        >
          Start Assessment
        </button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="PCOS AI Logo"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
                <span className="text-xl font-black text-white mb-4">PCOS AI</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Multimodal AI platform for PCOS risk assessment with explainable
                insights.
              </p>
              <div className="flex gap-3 mt-6">
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-slate-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/assess"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Start Assessment
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Model Performance
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Research Paper
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    About PCOS
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Medical Disclaimer
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="text-amber-400 shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h5 className="text-amber-200 font-bold text-sm mb-1">
                    Medical Disclaimer
                  </h5>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    This AI system is designed for educational and research
                    purposes only. It is a clinical decision support tool and{" "}
                    <strong className="text-white">
                      does not replace professional medical diagnosis,
                      treatment, or consultation
                    </strong>
                    . Always consult a qualified healthcare provider for medical
                    advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
              <p>© 2025 PCOS AI Platform. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Research Grade AI
                </span>
                <span>Built with PyTorch & TensorFlow</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Trust({ icon, text }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-emerald-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center bg-white rounded-2xl p-7 shadow-md border hover:border-emerald-300 transition-all">
      <div className="text-4xl font-black text-emerald-600 mb-2">{value}</div>
      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Step({ icon, title, desc, number }: any) {
  return (
    <div className="relative bg-white rounded-2xl p-8 shadow-lg border hover:border-emerald-300 transition-all">
      <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black">
        {number}
      </div>
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <div className="bg-white/5 rounded-2xl p-7 border border-white/10 hover:border-emerald-400/40 transition-all">
      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <p className="text-emerald-100/80">{desc}</p>
    </div>
  );
}
