"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Heart,
  BarChart3,
  ArrowRight,
  Loader2,
  Info,
  RefreshCw,
  User,
  Stethoscope,
  ChevronRight
} from "lucide-react";

type AssessmentData = {
  id: number;
  date: string;
  risk_level: string;
  probability: number;
};

type HealthStats = {
  totalAssessments: number;
  lastAssessmentDate: string | null;
  currentRisk: string | null;
  currentProbability: number | null;
  trend: "up" | "down" | "stable" | null;
  riskChange: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [stats, setStats] = useState<HealthStats>({
    totalAssessments: 0,
    lastAssessmentDate: null,
    currentRisk: null,
    currentProbability: null,
    trend: null,
    riskChange: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const token = getCookie("pcos_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/assessments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: AssessmentData[] = await res.json();
        setAssessments(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data: AssessmentData[]) {
    if (data.length === 0) {
      setLoading(false);
      return;
    }

    const latest = data[0];
    const previous = data[1];

    let trend: "up" | "down" | "stable" | null = null;
    let riskChange = 0;

    if (previous) {
      const diff = latest.probability - previous.probability;
      riskChange = Math.abs(diff * 100);
      
      if (Math.abs(diff) < 0.05) {
        trend = "stable";
      } else if (diff > 0) {
        trend = "up";
      } else {
        trend = "down";
      }
    }

    setStats({
      totalAssessments: data.length,
      lastAssessmentDate: latest.date,
      currentRisk: latest.risk_level,
      currentProbability: latest.probability,
      trend,
      riskChange,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-purple-50/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const hasAssessments = assessments.length > 0;
  const riskTheme = getRiskTheme(stats.currentRisk || "");
  const recentAssessments = assessments.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-purple-50/30 py-8 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Health Dashboard</h1>
          <p className="text-slate-600">Your PCOS health overview and insights</p>
        </div>

        {!hasAssessments ? (
          /* Empty State */
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity size={40} className="text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to Your Health Journey</h2>
              <p className="text-slate-600 mb-6">
                Take your first PCOS assessment to start tracking your health and receive personalized insights.
              </p>
              <button
                onClick={() => router.push("/assess")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                <span>Start Your First Assessment</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Current Risk Card */}
              <div className={`${riskTheme.bg} border-2 ${riskTheme.border} rounded-2xl p-6 shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Current Risk</h3>
                  {riskTheme.icon}
                </div>
                <div className={`text-3xl font-bold ${riskTheme.color} mb-2`}>
                  {stats.currentRisk}
                </div>
                <p className="text-sm text-slate-600">
                  {(stats.currentProbability! * 100).toFixed(1)}% probability
                </p>
              </div>

              {/* Trend Card */}
              <div className="bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Trend</h3>
                  {stats.trend === "down" ? (
                    <TrendingDown className="text-emerald-600" size={24} />
                  ) : stats.trend === "up" ? (
                    <TrendingUp className="text-rose-600" size={24} />
                  ) : (
                    <Minus className="text-slate-600" size={24} />
                  )}
                </div>
                <div className={`text-3xl font-bold mb-2 ${
                  stats.trend === "down" ? "text-emerald-600" :
                  stats.trend === "up" ? "text-rose-600" :
                  "text-slate-600"
                }`}>
                  {stats.trend === "stable" ? "Stable" : 
                   stats.trend === "down" ? "Improving" :
                   stats.trend === "up" ? "Caution" : "N/A"}
                </div>
                <p className="text-sm text-slate-600">
                  {stats.trend && stats.trend !== "stable" ? `${stats.riskChange.toFixed(1)}% change` : "No significant change"}
                </p>
              </div>

              {/* Total Assessments Card */}
              <div className="bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Assessments</h3>
                  <FileText className="text-teal-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {stats.totalAssessments}
                </div>
                <p className="text-sm text-slate-600">
                  Total completed
                </p>
              </div>

              {/* Last Assessment Card */}
              <div className="bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Last Check</h3>
                  <Clock className="text-purple-600" size={24} />
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2">
                  {getDaysAgo(stats.lastAssessmentDate!)}
                </div>
                <p className="text-sm text-slate-600">
                  {new Date(stats.lastAssessmentDate!).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Risk Trend Chart */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-teal-600" />
                    Risk Trend Analysis
                  </h3>
                  
                  {assessments.length > 1 ? (
                    <div className="space-y-4">
                      {/* Simple trend visualization */}
                      <div className="h-64 flex items-end gap-2">
                        {assessments.slice(0, 10).reverse().map((assessment, idx) => {
                          const height = assessment.probability * 100;
                          const color = assessment.risk_level === "HIGH" ? "bg-rose-500" :
                                       assessment.risk_level === "MODERATE" ? "bg-amber-500" :
                                       "bg-emerald-500";
                          
                          return (
                            <div key={assessment.id} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${height}%`, minHeight: "20px" }}>
                                <div className={`absolute inset-0 ${color} rounded-t-lg transition-all hover:opacity-80`}></div>
                              </div>
                              <span className="text-xs text-slate-500 rotate-45 origin-left">
                                {new Date(assessment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                          <span className="text-sm text-slate-600">Low Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                          <span className="text-sm text-slate-600">Moderate Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-rose-500 rounded"></div>
                          <span className="text-sm text-slate-600">High Risk</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Take more assessments to see trend analysis</p>
                    </div>
                  )}
                </div>

                {/* Recent Assessments */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={20} className="text-teal-600" />
                      Recent Assessments
                    </h3>
                    <button
                      onClick={() => router.push("/history")}
                      className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentAssessments.map((assessment) => {
                      const theme = getRiskTheme(assessment.risk_level);
                      return (
                        <div
                          key={assessment.id}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                          onClick={() => router.push("/results")}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 ${theme.bg} rounded-lg`}>
                              {theme.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {new Date(assessment.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-slate-500">
                                {getDaysAgo(assessment.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${theme.bg} ${theme.color}`}>
                              {assessment.risk_level}
                            </span>
                            <p className="text-sm text-slate-500 mt-1">
                              {(assessment.probability * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Next Steps */}
                <div className="bg-gradient-to-br from-teal-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target size={20} />
                    Recommended Actions
                  </h3>
                  
                  <div className="space-y-3">
                    {getRecommendations(stats.currentRisk || "").map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                        <div className="p-1 bg-white/20 rounded">
                          {rec.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{rec.title}</p>
                          <p className="text-xs text-white/80 mt-1">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-teal-600" />
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/assess")}
                      className="w-full flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-teal-700 rounded-lg transition-all"
                    >
                      <RefreshCw size={18} />
                      <span className="font-semibold text-sm">New Assessment</span>
                    </button>
                    
                    <button
                      onClick={() => router.push("/results")}
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 rounded-lg transition-all"
                    >
                      <FileText size={18} />
                      <span className="font-semibold text-sm">View Latest Results</span>
                    </button>
                    
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-700 rounded-lg transition-all"
                    >
                      <User size={18} />
                      <span className="font-semibold text-sm">Update Profile</span>
                    </button>
                    
                    <button
                      onClick={() => router.push("/history")}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-700 rounded-lg transition-all"
                    >
                      <Clock size={18} />
                      <span className="font-semibold text-sm">View History</span>
                    </button>
                  </div>
                </div>

                {/* Health Tips */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Heart size={20} className="text-rose-600" />
                    Daily Health Tip
                  </h3>
                  
                  <div className="p-4 bg-gradient-to-br from-rose-50 to-purple-50 rounded-lg border border-rose-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      💧 <strong>Stay Hydrated:</strong> Drink at least 8 glasses of water daily. Proper hydration helps regulate hormones and supports metabolic health.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper Functions
function getRiskTheme(level: string) {
  switch (level) {
    case "HIGH":
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        icon: <AlertCircle size={24} className="text-rose-600" />,
      };
    case "MODERATE":
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: <Info size={24} className="text-amber-600" />,
      };
    default:
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <CheckCircle2 size={24} className="text-emerald-600" />,
      };
  }
}

function getDaysAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getRecommendations(riskLevel: string) {
  const baseRecs = [
    {
      icon: <Activity size={16} />,
      title: "Regular Monitoring",
      description: "Track symptoms and reassess every 3-6 months"
    },
    {
      icon: <Heart size={16} />,
      title: "Healthy Lifestyle",
      description: "Maintain balanced diet and regular exercise"
    }
  ];

  if (riskLevel === "HIGH") {
    return [
      {
        icon: <Stethoscope size={16} />,
        title: "Consult Specialist",
        description: "Schedule appointment with gynecologist/endocrinologist"
      },
      ...baseRecs
    ];
  }

  if (riskLevel === "MODERATE") {
    return [
      {
        icon: <Calendar size={16} />,
        title: "Track Symptoms",
        description: "Monitor menstrual cycle and symptom changes"
      },
      ...baseRecs
    ];
  }

  return baseRecs;
}
