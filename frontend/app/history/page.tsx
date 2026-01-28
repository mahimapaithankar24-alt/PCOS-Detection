"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import {
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Info,
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Download,
  Clock,
  Search,
  X
} from "lucide-react";

type AssessmentData = {
  id: number;
  date: string;
  risk_level: string;
  probability: number;
};

type FilterOption = "all" | "high" | "moderate" | "low";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentData[]>([]);
  const [filterType, setFilterType] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterType, searchQuery, assessments]);

  async function loadHistory() {
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
        setFilteredAssessments(data);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...assessments];

    // Filter by risk level
    if (filterType !== "all") {
      filtered = filtered.filter((a) =>
        a.risk_level.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Filter by search (date search)
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        new Date(a.date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAssessments(filtered);
  }

  function calculateTrend(current: AssessmentData, previous: AssessmentData | undefined) {
    if (!previous) return null;
    
    const diff = current.probability - previous.probability;
    
    if (Math.abs(diff) < 0.05) return "stable";
    if (diff > 0) return "up";
    return "down";
  }

  function groupByMonth(assessments: AssessmentData[]) {
    const grouped: { [key: string]: AssessmentData[] } = {};

    assessments.forEach((assessment) => {
      const date = new Date(assessment.date);
      const monthYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(assessment);
    });

    return grouped;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-purple-50/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading assessment history...</p>
        </div>
      </div>
    );
  }

  const groupedAssessments = groupByMonth(filteredAssessments);
  const riskCounts = {
    high: assessments.filter((a) => a.risk_level === "HIGH").length,
    moderate: assessments.filter((a) => a.risk_level === "MODERATE").length,
    low: assessments.filter((a) => a.risk_level === "LOW").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-purple-50/30 py-8 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment History</h1>
            <p className="text-slate-600">
              Track your PCOS health journey over time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-teal-600" size={24} />
              <h3 className="font-semibold text-slate-600">Total</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{assessments.length}</p>
          </div>

          <div className="bg-rose-50 rounded-2xl shadow-lg border-2 border-rose-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-rose-600" size={24} />
              <h3 className="font-semibold text-rose-700">High Risk</h3>
            </div>
            <p className="text-3xl font-bold text-rose-700">{riskCounts.high}</p>
          </div>

          <div className="bg-amber-50 rounded-2xl shadow-lg border-2 border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Info className="text-amber-600" size={24} />
              <h3 className="font-semibold text-amber-700">Moderate</h3>
            </div>
            <p className="text-3xl font-bold text-amber-700">{riskCounts.moderate}</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <h3 className="font-semibold text-emerald-700">Low Risk</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{riskCounts.low}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="text-slate-600" size={20} />
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === "all"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("high")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === "high"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilterType("moderate")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === "moderate"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => setFilterType("low")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === "low"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Low Risk
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {(filterType !== "all" || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <span>Active filters:</span>
              {filterType !== "all" && (
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full">
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)} Risk
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => {
                  setFilterType("all");
                  setSearchQuery("");
                }}
                className="ml-2 text-teal-600 hover:text-teal-700 font-semibold"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Timeline View */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
            <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No assessments found</h3>
            <p className="text-slate-600">
              {filterType !== "all" || searchQuery
                ? "Try adjusting your filters"
                : "Start taking assessments to see your history"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAssessments).map(([monthYear, monthAssessments]) => (
              <div key={monthYear}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-teal-600" size={20} />
                  <h2 className="text-xl font-bold text-slate-900">{monthYear}</h2>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="space-y-3">
                  {monthAssessments.map((assessment, index) => {
                    const theme = getRiskTheme(assessment.risk_level);
                    const previousAssessment = monthAssessments[index + 1];
                    const trend = calculateTrend(assessment, previousAssessment);
                    const isSelected = selectedAssessment?.id === assessment.id;

                    return (
                      <div
                        key={assessment.id}
                        className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-teal-500 shadow-xl"
                            : "border-slate-200 hover:border-teal-300 hover:shadow-xl"
                        }`}
                        onClick={() => setSelectedAssessment(isSelected ? null : assessment)}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            {/* Left Section */}
                            <div className="flex items-center gap-4">
                              <div className={`p-3 ${theme.bg} rounded-xl`}>
                                {theme.icon}
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-bold text-slate-900">
                                    {new Date(assessment.date).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                  {trend && (
                                    <div className="flex items-center gap-1 text-sm">
                                      {trend === "up" && (
                                        <>
                                          <TrendingUp size={16} className="text-rose-600" />
                                          <span className="text-rose-600 font-semibold">Increased</span>
                                        </>
                                      )}
                                      {trend === "down" && (
                                        <>
                                          <TrendingDown size={16} className="text-emerald-600" />
                                          <span className="text-emerald-600 font-semibold">Improved</span>
                                        </>
                                      )}
                                      {trend === "stable" && (
                                        <>
                                          <Minus size={16} className="text-slate-600" />
                                          <span className="text-slate-600 font-semibold">Stable</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">
                                  {new Date(assessment.date).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span
                                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${theme.bg} ${theme.color}`}
                                >
                                  {assessment.risk_level}
                                </span>
                                <p className="text-sm text-slate-500 mt-2">
                                  {(assessment.probability * 100).toFixed(1)}% probability
                                </p>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/results");
                                }}
                                className="p-2 hover:bg-teal-50 rounded-lg transition-colors group"
                              >
                                <ChevronRight
                                  size={24}
                                  className="text-slate-400 group-hover:text-teal-600"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isSelected && (
                            <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-semibold text-slate-600 mb-1">Risk Score</p>
                                <p className="text-2xl font-bold text-slate-900">
                                  {(assessment.probability * 100).toFixed(1)}%
                                </p>
                              </div>
                              
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-semibold text-slate-600 mb-1">Assessment ID</p>
                                <p className="text-lg font-mono text-slate-900">#{assessment.id}</p>
                              </div>
                              
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm font-semibold text-slate-600 mb-1">Time Ago</p>
                                <p className="text-lg text-slate-900">{getDaysAgo(assessment.date)}</p>
                              </div>
                              
                              <div className="col-span-full flex gap-3">
                                <button
                                  onClick={() => router.push("/results")}
                                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all"
                                >
                                  <FileText size={18} />
                                  View Full Report
                                </button>
                                
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                                  <Download size={18} />
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
