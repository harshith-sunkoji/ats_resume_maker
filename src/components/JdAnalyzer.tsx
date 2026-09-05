"use client";

import React, { useState, useEffect } from "react";
import { ResumeData } from "@/types/resume";
import {
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface JdAnalyzerProps {
  resumeData: ResumeData;
  onUpdateResumeData: (updated: ResumeData) => void;
}

export interface JdAnalysisResult {
  matchPercentage: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedChanges: {
    category: string;
    title: string;
    description: string;
    actionableKeyword?: string;
  }[];
}

const SAMPLE_JD = `Senior Software Engineer - Full Stack (React / Node / Cloud)

Responsibilities:
- Design and scale responsive web applications using React, Next.js, and TypeScript.
- Build RESTful APIs and microservices using Node.js, Express, and PostgreSQL.
- Implement containerized deployments using Docker, Kubernetes, and AWS CI/CD pipelines.
- Collaborate with cross-functional product teams in an Agile environment.

Requirements:
- 3+ years experience with React, TypeScript, and Node.js.
- Strong knowledge of PostgreSQL, Redis, and GraphQL.
- Hands-on experience with Docker, CI/CD, and AWS deployment.
- Bachelor's degree in Computer Science or equivalent.`;

export const JdAnalyzer: React.FC<JdAnalyzerProps> = ({
  resumeData,
  onUpdateResumeData,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JdAnalysisResult | null>(null);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [showFullAnalysis, setShowFullAnalysis] = useState(true);

  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem("ats_jd_analysis");
      if (savedAnalysis) {
        setAnalysis(JSON.parse(savedAnalysis));
      }
      const savedJdText = localStorage.getItem("ats_jd_text");
      if (savedJdText) {
        setJobDescription(savedJdText);
      }
    } catch (e) {
      console.error("Failed to load saved JD analysis", e);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description to analyze.");
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze Job Description.");
      }

      setAnalysis(data.analysis);
      setShowFullAnalysis(true);
      try {
        localStorage.setItem("ats_jd_analysis", JSON.stringify(data.analysis));
        localStorage.setItem("ats_jd_text", jobDescription);
      } catch (e) {
        console.error("Failed to save JD analysis to localStorage", e);
      }
    } catch (err: any) {
      console.error("JD Analysis error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isKeywordInSkills = (keyword: string) => {
    return (
      addedKeywords.some((k) => k.toLowerCase() === keyword.toLowerCase()) ||
      resumeData.skillCategories.some((cat) =>
        (cat.skills || "")
          .split(/[,;]/)
          .map((s) => s.trim().toLowerCase())
          .includes(keyword.toLowerCase())
      )
    );
  };

  const getTargetCategoryIndex = (
    keyword: string,
    categories: { category: string; skills: string }[]
  ): number => {
    if (categories.length === 0) return -1;
    const kw = keyword.toLowerCase().trim();

    // 1. Explicit Programming / Markup Languages
    const isExplicitLanguage =
      /^(typescript|javascript|js|ts|python|java|dart|c\+\+|cpp|c#|c|golang|go|swift|kotlin|ruby|php|html|css|sql|r|shell|bash)$/i.test(
        kw
      );
    if (isExplicitLanguage) {
      const langIdx = categories.findIndex((c) =>
        /language|languages/i.test(c.category)
      );
      if (langIdx !== -1) return langIdx;
    }

    // 2. Databases & Data Stores
    if (
      /database|db|postgres|sql|mongo|redis|firebase|oracle|dynamodb|sqlite|cassandra/i.test(
        kw
      )
    ) {
      const dbIdx = categories.findIndex((c) =>
        /database|db|storage/i.test(c.category)
      );
      if (dbIdx !== -1) return dbIdx;
    }

    // 3. Frameworks & Libraries
    if (
      /framework|library|libraries|react|next|flutter|vue|angular|express|node|django|flask|spring|bloc|provider|riverpod|redux|tailwind|bootstrap|expo|hermes/i.test(
        kw
      )
    ) {
      const fwIdx = categories.findIndex((c) =>
        /framework|library|libraries/i.test(c.category)
      );
      if (fwIdx !== -1) return fwIdx;
    }

    // 4. Tools, Platforms, Version Control, Testing & Development Methodologies
    if (
      /tool|devops|cloud|docker|kubernetes|aws|git|version|jira|ci\/cd|ble|bluetooth|sensor|websocket|rest|api|vscode|studio|salesforce|dora|agile|problem|solving|ui\/ux|mobile|app|web|design|testing|architecture/i.test(
        kw
      )
    ) {
      const toolIdx = categories.findIndex((c) =>
        /tool|tools|devops|cloud|platform|infrastructure|methodology|process|competencies/i.test(
          c.category
        )
      );
      if (toolIdx !== -1) return toolIdx;
    }

    // 5. Fallback: Find first non-Language category if available
    const nonLangIdx = categories.findIndex(
      (c) => !/language|languages/i.test(c.category)
    );
    if (nonLangIdx !== -1) {
      return nonLangIdx;
    }

    return 0;
  };

  const updateAnalysisForKeywordToggle = (
    keyword: string,
    isAdding: boolean,
    currentAnalysis: JdAnalysisResult
  ): JdAnalysisResult => {
    let matched = [...(currentAnalysis.matchedKeywords || [])];
    let missing = [...(currentAnalysis.missingKeywords || [])];

    if (isAdding) {
      // Remove from missing, add to matched
      missing = missing.filter((k) => k.toLowerCase() !== keyword.toLowerCase());
      if (!matched.some((k) => k.toLowerCase() === keyword.toLowerCase())) {
        matched.push(keyword);
      }
    } else {
      // Remove from matched, add to missing
      matched = matched.filter((k) => k.toLowerCase() !== keyword.toLowerCase());
      if (!missing.some((k) => k.toLowerCase() === keyword.toLowerCase())) {
        missing.push(keyword);
      }
    }

    const totalKeywords = matched.length + missing.length;
    const matchPercentage =
      totalKeywords > 0
        ? Math.min(
            100,
            Math.max(10, Math.round((matched.length / totalKeywords) * 100))
          )
        : currentAnalysis.matchPercentage;

    return {
      ...currentAnalysis,
      matchPercentage,
      matchedKeywords: matched,
      missingKeywords: missing,
    };
  };

  const handleToggleMissingKeywordInSkills = (keyword: string) => {
    if (!keyword) return;

    const isCurrentlyAdded = isKeywordInSkills(keyword);
    let updatedCategories = [...resumeData.skillCategories];

    if (isCurrentlyAdded) {
      // Remove keyword from all skill categories
      updatedCategories = updatedCategories.map((cat) => {
        const skillsArray = (cat.skills || "")
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter((s) => s.toLowerCase() !== keyword.toLowerCase());
        return {
          ...cat,
          skills: skillsArray.join(", "),
        };
      });
      setAddedKeywords((prev) =>
        prev.filter((k) => k.toLowerCase() !== keyword.toLowerCase())
      );
    } else {
      // Add keyword to matching skill category
      if (updatedCategories.length > 0) {
        const targetIdx = getTargetCategoryIndex(keyword, updatedCategories);
        const activeIdx = targetIdx >= 0 ? targetIdx : 0;
        const targetCat = { ...updatedCategories[activeIdx] };

        const currentSkills = (targetCat.skills || "")
          .split(/[,;]/)
          .map((s) => s.trim());
        if (
          !currentSkills.some((s) => s.toLowerCase() === keyword.toLowerCase())
        ) {
          targetCat.skills = targetCat.skills
            ? `${targetCat.skills}, ${keyword}`
            : keyword;
          updatedCategories[activeIdx] = targetCat;
        }
      } else {
        updatedCategories.push({
          id: `skill-${Date.now()}`,
          category: "Technical Skills",
          skills: keyword,
        });
      }
      setAddedKeywords((prev) => [...prev, keyword]);
    }

    // Dynamic ATS Score recalculation
    if (analysis) {
      const updatedAnalysis = updateAnalysisForKeywordToggle(
        keyword,
        !isCurrentlyAdded,
        analysis
      );
      setAnalysis(updatedAnalysis);
      try {
        localStorage.setItem("ats_jd_analysis", JSON.stringify(updatedAnalysis));
      } catch (e) {
        console.error("Failed to update localStorage for JD analysis", e);
      }
    }

    onUpdateResumeData({
      ...resumeData,
      skillCategories: updatedCategories,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              AI Job Description Matcher
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste target JD to calculate match & get tailored suggestions
            </p>
          </div>
        </div>

        <button
          onClick={() => setJobDescription(SAMPLE_JD)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Insert Sample JD
        </button>
      </div>

      {/* Input Textarea & Submit */}
      <div className="space-y-2">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description requirements or posting details here..."
          rows={3}
          className="w-[100%] p-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-zinc-900 dark:text-zinc-100 resize-none font-sans"
        />

        <div className="flex items-center justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing JD with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Analyze JD & Match Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-xs border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ANALYSIS RESULTS CARD */}
      {analysis && (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          {/* Match Score Bar */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {analysis.matchPercentage}%
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Job Alignment Score
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {analysis.summary}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFullAnalysis(!showFullAnalysis)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1"
            >
              {showFullAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFullAnalysis && (
            <div className="space-y-3 text-xs">
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
                    ⚠️ Important Keywords Missing from Resume: (Click to add/remove)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords.map((kw, i) => {
                      const isAdded = isKeywordInSkills(kw);
                      return (
                        <button
                          key={i}
                          onClick={() => handleToggleMissingKeywordInSkills(kw)}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            isAdded
                              ? "bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs"
                              : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200"
                          }`}
                          title={isAdded ? "Added to skills (Click to remove)" : `Click to add ${kw} to skills`}
                        >
                          {isAdded ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : (
                            <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>{kw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggested Changes */}
              {analysis.suggestedChanges && analysis.suggestedChanges.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                    💡 AI Suggested Changes for Highest ATS Ranking:
                  </span>
                  <div className="space-y-2">
                    {analysis.suggestedChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800"
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
      )}
    </div>
  );
};
