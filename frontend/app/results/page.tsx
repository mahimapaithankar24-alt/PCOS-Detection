"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import { getResult } from "@/lib/storage";
import { 
  Activity, 
  FileText, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  Heart,
  Zap,
  Brain,
  Clock,
  User,
  Stethoscope,
  BookOpen,
  Printer,
  ChevronLeft,
  Lightbulb,
  Target,
  Apple,
  Dumbbell,
  Moon,
  Pill,
  AlertCircle,
  ExternalLink,
  ImageIcon,
  Eye,
  Layers,
  Sparkles,
  Droplet
} from "lucide-react";

type PCOSResult = {
  status?: string;                  
  tabular_risk: number;
  ultrasound_risk: number;
  final_pcos_probability: number;
  risk_level: "LOW" | "MODERATE" | "HIGH";
  prediction?: string;                
  confidence?: number;                
  assessment_id?: number;             
  input_data?: any;
  assessment_date?: string;
  recommendations_source?: "gemini-ai" | "fallback";
  multimodal_analysis?: boolean;
  personalized_recommendations?: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable_tips: string[];
  }>;
  gradcam_visualization?: {
    heatmap_overlay: string;
    heatmap_only: string;
    predicted_class: string;
    pcos_probability: number;
    non_pcos_probability: number;
    confidence: number;
    class_index: number;
  };
};
type AssessmentHistory = {
  id: number;
  date: string;
  risk_level: string;
  probability: number;
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<PCOSResult | null>(null);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showGradCAM, setShowGradCAM] = useState(true);
  const [heatmapView, setHeatmapView] = useState<'overlay' | 'only'>('overlay');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
    loadHistory();
  }, []);

  function loadResults() {
    console.log("🔍 Loading result from sessionStorage...");
    
    const data = getResult();
    console.log("📊 Retrieved result data:", data);

    if (!data) {
      console.error("❌ No result data found!");
      router.push("/assess");
      return;
    }

    // Validate required fields
    if (!data.final_pcos_probability || !data.risk_level) {
      console.error("❌ Invalid result data structure:", data);
      router.push("/assess");
      return;
    }
    
    console.log("✅ Result loaded successfully");
    setResult({
      ...data,
      assessment_date: data.assessment_date || new Date().toISOString()
    });
    setLoading(false);
  }

  async function loadHistory() {
    try {
      const token = getCookie("pcos_token");
      if (!token) return;

      const res = await fetch("http://127.0.0.1:8000/api/assessments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }

  async function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    window.print();
  }

  if (loading || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Activity className="text-indigo-600 animate-pulse" size={36} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Analyzing Your Assessment</h3>
          <p className="text-slate-600 text-lg">Generating comprehensive diagnostic report...</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const theme = getTheme(result.risk_level);
  
  // Use AI recommendations if available, fallback to generic
  const recommendations = result.personalized_recommendations && result.personalized_recommendations.length > 0
    ? formatAIRecommendations(result.personalized_recommendations)
    : getRecommendations(result.risk_level);
  
  const educationalContent = getEducationalContent(result.risk_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 print:bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -z-10 print:hidden"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-10 print:hidden"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-400/5 to-blue-400/5 rounded-full blur-3xl -z-10 print:hidden"></div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-indigo-700 bg-white/80 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all print:hidden group shadow-sm hover:shadow-md"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Home</span>
        </button>

        {/* HEADER CARD */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
                  <FileText className="text-white" size={36} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-3 tracking-tight">PCOS Diagnostic Report</h1>
                  <p className="text-slate-300 text-sm flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(result.assessment_date || Date.now()).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} />
                    AI-Powered Multimodal Analysis
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <Printer size={20} />
                  <span className="hidden sm:inline font-semibold">Print</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-indigo-700 rounded-xl transition-all hover:scale-105 shadow-xl font-semibold"
                >
                  <Download size={20} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* RISK ASSESSMENT CARD - SIMPLIFIED */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden hover:shadow-3xl transition-shadow">
              <div className={`${theme.bg} border-b ${theme.border} p-8`}>
                <div className="text-center">
                  {/* Main Icon */}
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
                    {theme.icon}
                  </div>
                  
                  {/* Risk Level */}
                  <p className={`text-sm font-bold uppercase tracking-wider ${theme.color} opacity-70 mb-2`}>
                    PCOS Risk Assessment
                  </p>
                  <h2 className={`text-5xl font-bold ${theme.color} mb-4`}>
                    {result.risk_level}
                  </h2>
                  
                  {/* Large Probability Display */}
                  <div className="relative inline-block">
                    <div className="text-7xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {(result.final_pcos_probability * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-slate-600 mt-1">PCOS Probability</p>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border-2 border-white/50">
                      <div 
                        className={`h-full ${theme.bar} transition-all duration-1000 ease-out relative`} 
                        style={{ width: `${result.final_pcos_probability * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Interpretation */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Stethoscope size={22} className="text-indigo-600" />
                  </div>
                  Clinical Interpretation
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 leading-relaxed text-base">
                    {getInterpretation(result.risk_level, result.final_pcos_probability)}
                  </p>
                </div>
              </div>
            </div>

            {/* 🔥 GRAD-CAM VISUALIZATION - SIMPLIFIED */}
            {result.gradcam_visualization && (
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden hover:shadow-3xl transition-all">
                <button
                  onClick={() => setShowGradCAM(!showGradCAM)}
                  className="w-full p-7 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all print:bg-transparent group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain size={20} className="text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800">
                        AI Explainability Visualization
                      </h3>
                      <p className="text-xs text-slate-500">See what the AI model focused on in your ultrasound</p>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`transform transition-transform print:hidden ${showGradCAM ? 'rotate-180' : ''}`} />
                </button>
                
                {showGradCAM && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* Description */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg shrink-0">
                          <Eye size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 mb-2">Understanding the Heatmap</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            This visualization shows which regions of your ultrasound image the deep learning model considered most important 
                            when analyzing for PCOS indicators. <span className="font-semibold text-rose-600">Red/yellow areas</span> indicate 
                            high attention zones, while <span className="font-semibold text-blue-600">blue/green areas</span> received less focus.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setHeatmapView('overlay')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                          heatmapView === 'overlay' 
                            ? 'bg-white text-purple-700 shadow-sm' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Layers size={18} />
                        <span>Overlay</span>
                      </button>
                      <button
                        onClick={() => setHeatmapView('only')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                          heatmapView === 'only' 
                            ? 'bg-white text-purple-700 shadow-sm' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon size={18} />
                        <span>Heatmap</span>
                      </button>
                    </div>

                    {/* Heatmap Display */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200">
                        {/* Heatmap Image */}
                        <img 
                          src={heatmapView === 'overlay' 
                            ? result.gradcam_visualization.heatmap_overlay 
                            : result.gradcam_visualization.heatmap_only
                          } 
                          alt={`Grad-CAM ${heatmapView === 'overlay' ? 'Overlay' : 'Heatmap'}`}
                          className="w-full h-auto"
                        />

                        {/* Color Scale Legend */}
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Attention Scale</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500"></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>Low</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simplified Model Info - NO PERCENTAGES */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-slate-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-slate-600 leading-relaxed">
                          <p className="font-semibold text-slate-800 mb-1">About this visualization</p>
                          <p>
                            This Grad-CAM (Gradient-weighted Class Activation Mapping) heatmap is generated by a ResNet50 deep learning model 
                            trained on {(result.gradcam_visualization.class_index === 1 ? '6,591' : '6,591')} ultrasound images. 
                            The model predicted: <span className="font-semibold text-purple-700">{result.gradcam_visualization.predicted_class}</span>.
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Note: This visualization is for educational purposes. The final diagnosis uses an ensemble of multiple models including CatBoost for maximum accuracy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COMPONENT ANALYSIS - NOW EXPANDABLE */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden hover:shadow-3xl transition-all">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-7 flex items-center justify-between hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all group"
              >
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Activity size={22} className="text-teal-600" />
                  </div>
                  Component Analysis
                  <span className="text-sm font-normal text-slate-500 ml-2">(View breakdown)</span>
                </h3>
                <ChevronDown size={22} className={`transform transition-transform text-slate-400 ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              
              {showDetails && (
                <div className="px-8 pb-8 border-t border-slate-100">
                  <p className="text-base text-slate-700 mb-6 mt-6 leading-relaxed">
                    The final prediction combines multiple AI models analyzing different aspects of your health data:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScoreCard 
                      title="Clinical & Lab Data" 
                      score={result.tabular_risk}
                      icon={<Heart size={20} />}
                      desc="Analysis of hormones, BMI, cycle history & symptoms."
                    />
                    
                    <ScoreCard 
                      title="Ultrasound Analysis" 
                      score={result.ultrasound_risk}
                      icon={<Zap size={20} />}
                      desc="Evaluation of ovarian morphology and follicle patterns."
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-slate-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">How it works:</span> The final {(result.final_pcos_probability * 100).toFixed(0)}% 
                        probability is calculated by combining tabular ({(result.tabular_risk * 100).toFixed(0)}%) and 
                        ultrasound ({(result.ultrasound_risk * 100).toFixed(0)}%) predictions using an ensemble approach 
                        for maximum accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DETAILED PARAMETERS (Expandable) - REMOVED FROM MAIN VIEW */}

            {/* PERSONALIZED RECOMMENDATIONS */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden hover:shadow-3xl transition-all">
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="w-full p-7 flex items-center justify-between hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-yellow-50/50 transition-all print:bg-transparent group"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <Lightbulb size={22} className="text-amber-600" />
                    </div>
                    Personalized Recommendations
                  </h3>
                  {/* AI Badge */}
                  {result.recommendations_source === "gemini-ai" && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-semibold">
                      <Sparkles size={12} />
                      AI-Generated
                      {result.multimodal_analysis && (
                        <span className="ml-1 opacity-80">• Image Analysis</span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronDown size={22} className={`transform transition-transform print:hidden text-slate-400 ${showRecommendations ? 'rotate-180' : ''}`} />
              </button>
              
              {showRecommendations && (
                <div className="px-8 pb-8 space-y-5">
                  {/* Show AI info if recommendations are AI-generated */}
                  {result.recommendations_source === "gemini-ai" && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-600 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-semibold text-purple-900 mb-1">
                            Personalized by AI
                          </p>
                          <p className="text-xs text-purple-700 leading-relaxed">
                            These recommendations were specifically generated for you by analyzing your complete clinical profile, 
                            lab results, symptoms, and {result.multimodal_analysis ? "ultrasound images" : "health data"} using 
                            advanced AI. They are tailored to your unique health situation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-5 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all">
                      <div className={`p-2 ${rec.color} rounded-lg h-fit`}>
                        {rec.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-1">{rec.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                        {rec.tips && (
                          <ul className="mt-2 space-y-1">
                            {rec.tips.map((tip: any, i: any) => (
                              <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                                <ChevronRight size={14} className="text-teal-600 mt-0.5 shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* QUICK ACTIONS */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 p-7 print:hidden">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target size={22} className="text-indigo-600" />
                </div>
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push("/assess")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-[1.03] font-semibold text-base"
                >
                  <RefreshCw size={20} />
                  <span>New Assessment</span>
                </button>
                
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md font-semibold"
                >
                  <User size={20} />
                  <span>Update Profile</span>
                </button>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-300 hover:border-purple-500 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl transition-all shadow-sm hover:shadow-md font-semibold"
                >
                  <Clock size={20} />
                  <span>View History</span>
                </button>
              </div>
            </div>

            {/* ASSESSMENT HISTORY */}
            {showHistory && history.length > 0 && (
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 p-7 print:hidden animate-in slide-in-from-right">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock size={22} className="text-purple-600" />
                  </div>
                  Assessment History
                </h3>
                
                <div className="space-y-3">
                  {history.map((item, idx) => {
                    const isLatest = idx === 0;
                    const trend = idx > 0 ? 
                      (item.probability > history[idx - 1].probability ? 'up' : 
                       item.probability < history[idx - 1].probability ? 'down' : 'same') 
                      : 'same';
                    
                    return (
                      <div key={item.id} className={`p-3 rounded-lg border hover:shadow-md transition-all ${isLatest ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          {trend !== 'same' && (
                            <span className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            item.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                            item.risk_level === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.risk_level}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {(item.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EDUCATIONAL CONTENT */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden hover:shadow-3xl transition-all">
              <button
                onClick={() => setShowEducation(!showEducation)}
                className="w-full p-7 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all print:bg-transparent group"
              >
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookOpen size={22} className="text-blue-600" />
                  </div>
                  Learn More
                </h3>
                <ChevronDown size={22} className={`transform transition-transform print:hidden text-slate-400 ${showEducation ? 'rotate-180' : ''}`} />
              </button>
              
              {showEducation && (
                <div className="px-6 pb-6 space-y-4">
                  {educationalContent.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        {item.icon}
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {item.content}
                      </p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
                          Read more <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NEXT STEPS */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all hover:scale-[1.02] border border-white/10">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertCircle size={24} />
                </div>
                Next Steps
              </h3>
              <ul className="space-y-3 text-base">
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 shrink-0" />
                  <span>Consult with a healthcare professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 shrink-0" />
                  <span>Schedule follow-up tests if recommended</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 shrink-0" />
                  <span>Monitor symptoms and lifestyle changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="mt-0.5 shrink-0" />
                  <span>Reassess in 3-6 months or as advised</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 flex gap-5 hover:shadow-xl transition-all">
          <div className="p-3 bg-amber-100 rounded-xl h-fit">
            <AlertTriangle className="text-amber-700 shrink-0" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-3 text-lg">Medical Disclaimer</h4>
            <p className="text-base text-amber-900 leading-relaxed">
              This AI-generated report is a decision support tool and should not be considered a definitive medical diagnosis. 
              The results are based on the information provided and algorithmic analysis. Please consult a certified healthcare provider 
              (gynecologist or endocrinologist) for official diagnosis, interpretation, and treatment planning. Individual medical conditions 
              may vary and require professional evaluation.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-sm text-slate-600 pb-6 font-medium">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={14} className="text-indigo-600" />
              Generated by PCOS AI Assessment Platform
            </span>
            <span className="text-slate-400">•</span>
            <span>{new Date().toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function for theme
function getTheme(level: string) {
  switch (level) {
    case "HIGH":
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        bar: "bg-rose-500",
        icon: <AlertTriangle size={32} className="text-rose-600" />,
      };
    case "MODERATE":
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        bar: "bg-amber-500",
        icon: <Info size={32} className="text-amber-600" />,
      };
    default:
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        bar: "bg-emerald-500",
        icon: <CheckCircle2 size={32} className="text-emerald-600" />,
      };
  }
}

// Helper function for interpretation
function getInterpretation(level: string, probability: number): string {
  const percentage = (probability * 100).toFixed(1);
  
  switch (level) {
    case "HIGH":
      return `The comprehensive AI analysis indicates a ${percentage}% probability of Polycystic Ovary Syndrome (PCOS). This assessment suggests significant markers consistent with PCOS pathophysiology. Key hormonal, metabolic, or morphological indicators show patterns commonly associated with this condition. We strongly recommend scheduling a consultation with a board-certified gynecologist or endocrinologist for clinical correlation, confirmatory testing (including comprehensive hormone panels and transvaginal ultrasound), and development of an appropriate treatment plan.`;
    
    case "MODERATE":
      return `The assessment reveals a ${percentage}% probability of PCOS, indicating moderate risk factors. While not definitive, several parameters suggest patterns that warrant clinical attention. Some hormonal imbalances, irregular menstrual patterns, or morphological features may be present. We recommend monitoring your symptoms closely (menstrual regularity, hirsutism, weight changes, acne) and consulting with a healthcare provider for further evaluation. Additional diagnostic tests may be beneficial to confirm or rule out PCOS.`;
    
    default:
      return `The analysis suggests a ${percentage}% probability of PCOS, which falls within the low-risk category. The assessed parameters do not strongly indicate PCOS at this time. However, continue to maintain healthy lifestyle practices including balanced nutrition, regular physical activity, and stress management. Annual wellness checkups with your healthcare provider are recommended to monitor your reproductive and metabolic health. If you experience changes in menstrual patterns, unexplained weight gain, or other concerning symptoms, consult with a medical professional.`;
  }
}

// Helper function for recommendations
function getRecommendations(level: string) {
  const commonRecs = [
    {
      icon: <Apple className="text-white" size={20} />,
      color: "bg-emerald-600",
      title: "Nutrition & Diet",
      description: "Adopt a balanced, anti-inflammatory diet to support hormonal balance.",
      tips: [
        "Focus on whole foods: vegetables, fruits, lean proteins, whole grains",
        "Limit refined carbohydrates and sugary foods",
        "Include omega-3 rich foods (fish, flaxseeds, walnuts)",
        "Consider a low glycemic index (GI) diet"
      ]
    },
    {
      icon: <Dumbbell className="text-white" size={20} />,
      color: "bg-blue-600",
      title: "Physical Activity",
      description: "Regular exercise improves insulin sensitivity and hormonal balance.",
      tips: [
        "Aim for 150 minutes of moderate exercise weekly",
        "Combine cardio with strength training",
        "Try yoga or pilates for stress reduction",
        "Stay consistent with physical activity"
      ]
    },
    {
      icon: <Moon className="text-white" size={20} />,
      color: "bg-indigo-600",
      title: "Stress & Sleep",
      description: "Quality sleep and stress management are crucial for hormone regulation.",
      tips: [
        "Maintain 7-9 hours of sleep per night",
        "Practice stress-reduction techniques (meditation, deep breathing)",
        "Establish consistent sleep schedule",
        "Limit screen time before bed"
      ]
    }
  ];

  if (level === "HIGH") {
    return [
      {
        icon: <Stethoscope className="text-white" size={20} />,
        color: "bg-rose-600",
        title: "Immediate Medical Consultation",
        description: "Schedule an appointment with a gynecologist or endocrinologist within 2-4 weeks.",
        tips: [
          "Bring this report and any previous medical records",
          "Prepare a list of symptoms and their duration",
          "Discuss family history of PCOS, diabetes, or hormonal disorders",
          "Ask about comprehensive hormone panel and ultrasound"
        ]
      },
      ...commonRecs,
      {
        icon: <Pill className="text-white" size={20} />,
        color: "bg-purple-600",
        title: "Potential Treatments",
        description: "Discuss treatment options with your healthcare provider (this is informational only).",
        tips: [
          "Birth control pills for menstrual regulation",
          "Metformin for insulin resistance",
          "Anti-androgen medications for hirsutism/acne",
          "Fertility treatments if planning pregnancy"
        ]
      }
    ];
  } else if (level === "MODERATE") {
    return [
      {
        icon: <Brain className="text-white" size={20} />,
        color: "bg-amber-600",
        title: "Medical Follow-up",
        description: "Consult with a healthcare provider for further evaluation and monitoring.",
        tips: [
          "Schedule appointment within 4-6 weeks",
          "Track menstrual cycles and symptoms",
          "Consider hormone level testing",
          "Discuss preventive strategies"
        ]
      },
      ...commonRecs
    ];
  }

  return commonRecs;
}

// Helper function for educational content
function getEducationalContent(level: string) {
  return [
    {
      icon: <Brain size={16} className="text-teal-600" />,
      title: "What is PCOS?",
      content: "Polycystic Ovary Syndrome is a hormonal disorder affecting reproductive-aged women, characterized by irregular periods, excess androgen levels, and polycystic ovaries.",
      link: "https://www.mayoclinic.org/diseases-conditions/pcos/symptoms-causes/syc-20353439"
    },
    {
      icon: <Heart size={16} className="text-rose-600" />,
      title: "Common Symptoms",
      content: "Irregular periods, excessive hair growth, acne, weight gain, hair thinning, and darkening of skin are common PCOS symptoms. Not all women experience all symptoms.",
      link: "https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome"
    },
    {
      icon: <Zap size={16} className="text-amber-600" />,
      title: "Long-term Health",
      content: "PCOS can increase risk of type 2 diabetes, heart disease, and endometrial cancer. Early diagnosis and management significantly reduce these risks.",
      link: "https://www.nichd.nih.gov/health/topics/pcos"
    }
  ];
}

// Helper function to format AI recommendations to match UI structure
function formatAIRecommendations(aiRecs: any[]) {
  const iconMap: { [key: string]: React.ReactNode } = {
    "Medical Consultation": <Stethoscope className="text-white" size={20} />,
    "Nutrition & Diet": <Apple className="text-white" size={20} />,
    "Physical Activity": <Dumbbell className="text-white" size={20} />,
    "Lifestyle Modifications": <Moon className="text-white" size={20} />,
    "Lifestyle & Behavioral Factors": <Moon className="text-white" size={20} />,
    "Hormonal & Metabolic Management": <Droplet className="text-white" size={20} />,
    "Symptom-Specific Care": <AlertCircle className="text-white" size={20} />,
    "Reproductive Health": <Heart className="text-white" size={20} />,
    "Monitoring & Follow-up": <Clock className="text-white" size={20} />,
    "Stress & Sleep": <Moon className="text-white" size={20} />,
  };
  
  const colorMap: { [key: string]: string } = {
    high: "bg-rose-600",
    medium: "bg-amber-600",
    low: "bg-emerald-600"
  };
  
  return aiRecs.map(rec => ({
    icon: iconMap[rec.category] || <Lightbulb className="text-white" size={20} />,
    color: colorMap[rec.priority] || "bg-indigo-600",
    title: rec.title,
    description: rec.description,
    tips: rec.actionable_tips || []
  }));
}

// Score Card Component
function ScoreCard({ title, score, icon, desc }: { title: string, score: number, icon: React.ReactNode, desc: string }) {
  const percentage = (score * 100).toFixed(1);
  const barColor = score > 0.6 ? "bg-rose-500" : score > 0.3 ? "bg-amber-500" : "bg-emerald-500";
  const textColor = score > 0.6 ? "text-rose-700" : score > 0.3 ? "text-amber-700" : "text-emerald-700";
  const bgColor = score > 0.6 ? "bg-rose-50" : score > 0.3 ? "bg-amber-50" : "bg-emerald-50";

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-6 hover:shadow-2xl transition-all hover:scale-[1.03] hover:border-indigo-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-xl shadow-sm`}>
          <div className={textColor}>
            {icon}
          </div>
        </div>
        <span className={`text-3xl font-bold ${textColor}`}>{percentage}%</span>
      </div>
      
      <h4 className="font-bold text-slate-900 mb-3 text-base">{title}</h4>
      
      <div className="w-full bg-slate-200 rounded-full h-3 mb-4 shadow-inner">
        <div 
          className={`h-3 rounded-full ${barColor} transition-all duration-1000 shadow-sm`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className="text-sm text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
