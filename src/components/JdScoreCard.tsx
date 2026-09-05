"use client";

import React, { useState } from "react";
import { JdAnalysisResult } from "@/components/JdAnalyzer";
import { Zap, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Sparkles, Briefcase } from "lucide-react";

interface JdScoreCardProps {
  analysis: JdAnalysisResult;
  className?: string;
}

export const JdScoreCard: React.FC<JdScoreCardProps> = ({ analysis, className = "" }) => {
  const [showDetails, setShowDetails] = useState(false);

  const score = analysis.matchPercentage || 0;
  let grade = "Needs Tailoring";
  let color = "text-amber-500";
  let badgeBg = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";

  if (score >= 85) {
    grade = "Strong JD Match";
    color = "text-emerald-500";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  } else if (score >= 70) {
    grade = "Moderate JD Match";
    color = "text-blue-500";
    badgeBg = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
  } else if (score < 50) {
    grade = "Low JD Match";
    color = "text-rose-500";
    badgeBg = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
  }

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm no-print ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Score Badge & Info */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {/* Circular Score Circle */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-zinc-200 dark:text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={138.2}
                strokeDashoffset={138.2 - (138.2 * score) / 100}
                strokeLinecap="round"
                className={`${color} transition-all duration-700 ease-out`}
                fill="transparent"
              />
            </svg>
            <span className="absolute font-bold text-sm font-mono text-zinc-900 dark:text-zinc-100">
              {score}%
            </span>
          </div>

          {/* Info & Grade */}
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Job Match ATS Score
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}
              >
                {grade}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl">
              {analysis.summary}
            </p>
          </div>
        </div>

        {/* Right: Details Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{showDetails ? "Hide Match Details" : "View Match Details"}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* EXPANDABLE DETAILS */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          {/* Matched Keywords */}
          {analysis.matchedKeywords && analysis.matchedKeywords.length > 0 && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                ✅ Matched Keywords in Resume:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                ⚠️ Keywords Missing from Targeted JD:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {analysis.suggestedChanges && analysis.suggestedChanges.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                💡 Targeted AI Optimization Recommendations:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.suggestedChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {change.title}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        {change.category}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11.5px]">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
