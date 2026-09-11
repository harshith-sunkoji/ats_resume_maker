"use client";

import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { Sparkles, Wand2, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface PromptGeneratorProps {
  resumeData: ResumeData;
  onUpdateResumeData: (updated: ResumeData) => void;
}

const PRESET_PROMPTS = [
  "Tailor resume for Senior QA Automation Engineer role",
  "Add Java, Python, Playwright, Postman, and STLC keywords",
  "Rewrite summary to highlight cloud architecture & testing",
  "Make experience bullet points more metric-driven with % gains",
];

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  resumeData,
  onUpdateResumeData,
}) => {
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      setErrorMsg("Please enter a prompt instruction before clicking Generate.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: promptText,
          resumeData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate resume from prompt.");
      }

      onUpdateResumeData(data.updatedResumeData);
      setSuccessMsg("✨ Resume updated successfully as per your prompt!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Generate error:", err);
      setErrorMsg(err.message || "An error occurred while generating resume.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg text-white shadow-sm">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              AI Custom Resume Generator
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Prompt Mode
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Type custom prompt instructions to dynamically rewrite or tailor your resume
            </p>
          </div>
        </div>
      </div>


      {/* Text Area & Generate Button */}
      <div className="space-y-2">
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g. Change resume as per QA Lead requirements, add Playwright, Postman, Java, Python, and highlight automated testing accomplishments..."
          rows={3}
          className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-zinc-900 dark:text-zinc-100 resize-none font-sans"
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
            Describe any role, skill addition, or section rewrite.
          </span>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !promptText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-xs border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
    </div>
  );
};
