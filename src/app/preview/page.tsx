"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ResumeData, DEFAULT_RESUME_DATA } from "@/types/resume";
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
} from "lucide-react";

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [jdAnalysis, setJdAnalysis] = useState<JdAnalysisResult | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ats_resume_data");
      if (saved) {
        setResumeData(JSON.parse(saved));
      }
      const savedAnalysis = localStorage.getItem("ats_jd_analysis");
      if (savedAnalysis) {
        setJdAnalysis(JSON.parse(savedAnalysis));
      }
    } catch (e) {
      console.error("Failed to load resume data from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    let container: HTMLDivElement | null = null;
    try {
      const element = document.getElementById("ats-resume-document");
      if (!element) {
        window.print();
        return;
      }

      // Clone element to remove any UI zoom scaling/transforms for 100% exact output
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = "ats-resume-document-clone"; // Avoid duplicate ID in document
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.width = "210mm";
      clone.style.minHeight = "auto"; // Auto height prevents trailing blank 2nd page overflow
      clone.style.height = "auto";
      clone.style.background = "#ffffff";
      clone.style.color = "#000000";

      // Append to hidden off-screen container for crisp canvas rendering
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "210mm";
      container.style.pointerEvents = "none";
      container.appendChild(clone);
      document.body.appendChild(container);

      // Ensure fonts are 100% loaded before capturing canvas to prevent baseline shifting
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const html2pdf = (await import("html2pdf.js")).default;
      const fileName = `${(resumeData.personalInfo.fullName || "Resume")
        .trim()
        .replace(/\s+/g, "_")}_ATS_Resume.pdf`;

      const opt = {
        margin: 0,
        filename: fileName,
        image: { type: "jpeg" as const, quality: 0.98 },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 1200,
          windowHeight: 1600,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            // Inline <link rel="stylesheet"> elements into <style> tags & sanitize modern color functions
            const links = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
            links.forEach((link) => {
              try {
                const sheet = (link as HTMLLinkElement).sheet;
                if (sheet) {
                  let cssText = "";
                  const rules = sheet.cssRules || sheet.rules;
                  for (let i = 0; i < rules.length; i++) {
                    cssText += rules[i].cssText + "\n";
                  }
                  const sanitized = cssText.replace(
                    /(?:lab|oklch|color-mix)\([^;}]+?\)/gi,
                    "#000000"
                  );

                  const styleEl = clonedDoc.createElement("style");
                  styleEl.textContent = sanitized;
                  if (link.parentNode) {
                    link.parentNode.replaceChild(styleEl, link);
                  }
                }
              } catch {
                link.remove();
              }
            });

            // Replace lab(), oklch(), color-mix() in all <style> tags
            clonedDoc.querySelectorAll("style").forEach((styleEl) => {
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent.replace(
                  /(?:lab|oklch|color-mix)\([^;}]+?\)/gi,
                  "#000000"
                );
              }
            });

            // Replace lab(), oklch(), color-mix() in inline styles
            clonedDoc.querySelectorAll("*").forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style && htmlEl.style.cssText) {
                if (htmlEl.style.cssText.match(/lab|oklch|color-mix/i)) {
                  htmlEl.style.cssText = htmlEl.style.cssText.replace(
                    /(?:lab|oklch|color-mix)\([^;}]+?\)/gi,
                    "#000000"
                  );
                }
              }
            });

            // Adjust contact icons down by 2.5px specifically for html2canvas canvas baseline alignment
            clonedDoc.querySelectorAll(".contact-icon").forEach((img) => {
              const htmlImg = img as HTMLElement;
              htmlImg.style.position = "relative";
              htmlImg.style.top = "2.5px";
            });
          },
        },
        jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.warn("Direct PDF download fallback to window.print():", err);
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
        container = null;
      }
      window.print();
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      document.querySelectorAll(".html2canvas-container").forEach((el) => el.remove());
      setIsGeneratingPdf(false);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(1.3, prev + 0.05));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.05));
  const handleResetZoom = () => setScale(1);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* PREVIEW TOP BAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 no-print shadow-sm">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Back & Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Editor</span>
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

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-12 text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100 ml-1 border-l border-zinc-300 dark:border-zinc-700"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>


            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-75 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ATS Resume PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* PREVIEW CONTAINER */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 flex flex-col items-center">
        {/* Banner */}
        <div className="w-full flex items-center justify-between mb-4 text-xs text-zinc-500 dark:text-zinc-400 no-print px-2">
          <span className="font-semibold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <Sparkles className="w-4 h-4 text-blue-500" /> Full A4 Resume Document Preview
          </span>
          <span className="hidden sm:inline">100% Single Page ATS Standard • A4 Dimensions (210mm × 297mm)</span>
        </div>

        {/* Targeted JD ATS Score Card (Only rendered when JD analysis is present) */}
        {jdAnalysis && (
          <div className="w-full mb-6 no-print">
            <JdScoreCard analysis={jdAnalysis} />
          </div>
        )}

        {/* Printable Preview Sheet */}
        <div className="w-full flex justify-center py-6 px-2 bg-zinc-200/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-300 dark:border-zinc-800 shadow-inner overflow-x-auto">
          <ResumePreview data={resumeData} scale={scale} />
        </div>
      </main>
    </div>
  );
}
