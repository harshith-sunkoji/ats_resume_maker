"use client";

import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { calculateAtsScore } from "@/utils/atsScore";
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface AtsScoreCardProps {
  data: ResumeData;
  className?: string;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ data, className = "" }) => {
  const [showDetails, setShowDetails] = useState(false);
  const result = calculateAtsScore(data);

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm no-print ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Score Badge & Grade */}
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
                strokeDashoffset={138.2 - (138.2 * result.score) / 100}
                strokeLinecap="round"
                className={`${result.color} transition-all duration-700 ease-out`}
                fill="transparent"
              />
            </svg>
            <span className="absolute font-bold text-sm font-mono text-zinc-900 dark:text-zinc-100">
              {result.score}%
            </span>
          </div>

          {/* Info & Grade */}
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ATS Optimization Score
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${result.badgeBg}`}
              >
                {result.grade}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Based on ATS resume parser guidelines & keyword formatting standards.
            </p>
          </div>
        </div>

        {/* Right: Details Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{showDetails ? "Hide Breakdown" : "View Score Breakdown"}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* EXPANDABLE BREAKDOWN */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
            ATS Checklist Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {result.checks.map((item, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                  item.passed
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                    : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </span>
                    {!item.passed && item.tip && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Tip: {item.tip}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
                  {item.points}/{item.maxPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
