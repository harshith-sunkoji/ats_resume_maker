"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  ResumeData,
  DEFAULT_RESUME_DATA,
} from "@/types/resume";

import { ResumePreview } from "@/components/ResumePreview";
import { JdScoreCard } from "@/components/JdScoreCard";
import { JdAnalysisResult } from "@/components/JdAnalyzer";

import {
  Download,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileCheck,
  Loader2,
  Sparkles,
  Printer,
} from "lucide-react";

export default function PreviewPage() {
  // ============================================================
  // STATE
  // ============================================================

  const [resumeData, setResumeData] =
    useState<ResumeData>(DEFAULT_RESUME_DATA);

  const [jdAnalysis, setJdAnalysis] =
    useState<JdAnalysisResult | null>(null);

  const [scale, setScale] =
    useState<number>(1);

  const [isGeneratingPdf, setIsGeneratingPdf] =
    useState(false);

  const [isLoaded, setIsLoaded] =
    useState(false);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    try {
      const savedResume =
        localStorage.getItem("resume_data");

      if (savedResume) {
        try {
          const parsedResume =
            JSON.parse(savedResume);

          setResumeData(parsedResume);
        } catch (error) {
          console.error(
            "Failed to parse resume data:",
            error
          );
        }
      }

      const savedAnalysis =
        localStorage.getItem("ats_jd_analysis");

      if (savedAnalysis) {
        try {
          const parsedAnalysis =
            JSON.parse(savedAnalysis);

          setJdAnalysis(parsedAnalysis);
        } catch (error) {
          console.error(
            "Failed to parse JD analysis:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load resume data:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ============================================================
  // DOWNLOAD PDF  (pure jsPDF text-based — no screenshot/PNG)
  // ============================================================

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const { generateResumePdf } = await import("@/utils/generateResumePdf");
      await generateResumePdf(resumeData);
    } catch (error) {
      console.error("Failed to generate ATS Resume PDF:", error);
      window.alert("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };





  // ============================================================
  // ZOOM IN
  // ============================================================

  const handleZoomIn = () => {
    setScale((previous) =>
      Math.min(
        1.3,
        previous + 0.05
      )
    );
  };

  // ============================================================
  // ZOOM OUT
  // ============================================================

  const handleZoomOut = () => {
    setScale((previous) =>
      Math.max(
        0.5,
        previous - 0.05
      )
    );
  };

  // ============================================================
  // RESET ZOOM
  // ============================================================

  const handleResetZoom = () => {
    setScale(1);
  };

  const handlePrint = () => {
    window.print();
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 no-print shadow-sm">

        <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

          {/* ==================================================
              LEFT
              ================================================== */}

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4" />

              <span>
                Back to Editor
              </span>
            </Link>

            <div className="flex items-center gap-2">

              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <FileCheck className="w-4 h-4" />
              </div>

              <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                ATS Resume Preview & Download
              </h1>

            </div>

          </div>

          {/* ==================================================
              RIGHT
              ================================================== */}

          <div className="flex flex-wrap items-center gap-3">

            {/* =================================================
                ZOOM
                ================================================= */}

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 gap-1">

              <button
                onClick={
                  handleZoomOut
                }
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="Zoom Out"
                type="button"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] w-12 text-center font-medium">
                {Math.round(
                  scale * 100
                )}
                %
              </span>

              <button
                onClick={
                  handleZoomIn
                }
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="Zoom In"
                type="button"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={
                  handleResetZoom
                }
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100 ml-1 border-l border-zinc-300 dark:border-zinc-700"
                title="Reset Zoom"
                type="button"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

            </div>

            {/* =================================================
                PRINT / SAVE VECTOR PDF & DOWNLOAD BUTTONS
                ================================================= */}

            <button
              onClick={
                handleDownloadPdf
              }
              disabled={
                isGeneratingPdf
              }
              type="button"
              className="
                relative
                flex
                items-center
                justify-center
                gap-2

                w-[222px]
                h-[38px]

                bg-gradient-to-r
                from-blue-600
                to-indigo-600

                hover:from-blue-700
                hover:to-indigo-700

                disabled:opacity-75

                text-white
                font-semibold
                text-xs

                px-4
                py-2

                rounded-xl
                shadow-md

                transition-colors

                cursor-pointer
                disabled:cursor-wait
              "
            >

              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Generating PDF...
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />

                  <span>
                    Download ATS Resume PDF
                  </span>
                </>
              )}

            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 flex flex-col items-center">

        {/* ====================================================
            INFO
            ==================================================== */}

        <div className="w-full flex items-center justify-between mb-4 text-xs text-zinc-500 dark:text-zinc-400 no-print px-2">

          <span className="font-semibold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">

            <Sparkles className="w-4 h-4 text-blue-500" />

            Full A4 Resume Document Preview

          </span>

          <span className="hidden sm:inline">
            100% Single Page ATS Standard • A4 Dimensions (210mm × 297mm)
          </span>

        </div>

        {/* ====================================================
            JD SCORE
            ==================================================== */}

        {jdAnalysis && (
          <div className="w-full mb-6 no-print">

            <JdScoreCard
              analysis={
                jdAnalysis
              }
            />

          </div>
        )}

        {/* ====================================================
            RESUME
            ==================================================== */}

        <div className="w-full flex justify-center py-6 px-2 bg-zinc-200/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-300 dark:border-zinc-800 shadow-inner overflow-x-auto">

          <ResumePreview
            data={resumeData}
            scale={scale}
          />

        </div>

      </main>

    </div>
  );
}