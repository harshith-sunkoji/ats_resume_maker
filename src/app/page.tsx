"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResumeData, DEFAULT_RESUME_DATA } from "@/types/resume";
import { ResumePreview } from "@/components/ResumePreview";
import { ResumeEditor } from "@/components/ResumeEditor";
import { PdfUploader } from "@/components/PdfUploader";
import { JdAnalyzer } from "@/components/JdAnalyzer";
import { AtsScoreCard } from "@/components/AtsScoreCard";
import { PromptGenerator } from "@/components/PromptGenerator";
import {
  Download,
  Eye,
  FileEdit,
  Columns,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  FileCheck,
  ExternalLink,
  Undo2,
  Redo2,
} from "lucide-react";

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [history, setHistory] = useState<ResumeData[]>([]);
  const [future, setFuture] = useState<ResumeData[]>([]);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [scale, setScale] = useState<number>(0.85);
  const router = useRouter();

  // Sync resumeData with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("resume_data");
      if (saved) {
        setResumeData(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load resumeData from localStorage", e);
    }
  }, []);

  const handleUpdateResumeData = (newData: ResumeData) => {
    if (JSON.stringify(newData) !== JSON.stringify(resumeData)) {
      setHistory((prev) => [...prev.slice(-29), resumeData]);
      setFuture([]);
    }
    setResumeData(newData);
    try {
      localStorage.setItem("resume_data", JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save resumeData to localStorage", e);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    setFuture((prev) => [resumeData, ...prev]);
    setHistory(newHistory);
    setResumeData(previousState);
    try {
      localStorage.setItem("resume_data", JSON.stringify(previousState));
    } catch (e) {
      console.error("Failed to save resumeData to localStorage", e);
    }
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const nextState = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev, resumeData]);
    setFuture(newFuture);
    setResumeData(nextState);
    try {
      localStorage.setItem("resume_data", JSON.stringify(nextState));
    } catch (e) {
      console.error("Failed to save resumeData to localStorage", e);
    }
  };

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        const activeElem = document.activeElement;
        const isInputField = activeElem && (activeElem.tagName === "INPUT" || activeElem.tagName === "TEXTAREA");
        if (!isInputField) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        const activeElem = document.activeElement;
        const isInputField = activeElem && (activeElem.tagName === "INPUT" || activeElem.tagName === "TEXTAREA");
        if (!isInputField) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, future, resumeData]);

  const handleGoToPreviewPage = () => {
    try {
      localStorage.setItem("resume_data", JSON.stringify(resumeData));
    } catch (e) {
      console.error("Failed to save resumeData to localStorage", e);
    }
    router.push("/preview");
  };

  const handleZoomIn = () => setScale((prev) => Math.min(1.2, prev + 0.05));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.05));
  const handleResetZoom = () => setScale(0.85);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* TOP BAR / CONTROL HEADER */}
      <header className="app-header sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 no-print">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  ATS Resume Maker
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  AI
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Upload PDF • AI Prompt Generator • AI Job Matcher • Live ATS Template Preview
              </p>
            </div>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo & Redo Controls in Header */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Undo last change (Cmd+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border-l border-zinc-300 dark:border-zinc-700 pl-2.5"
                title="Redo change (Cmd+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Redo</span>
              </button>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Split Editor & Preview"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={() => setViewMode("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "editor"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Editor Only"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editor</span>
              </button>

              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "preview"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                title="Preview Only"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Zoom Controls for Preview */}
            {(viewMode === "split" || viewMode === "preview") && (
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 gap-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-10 text-center font-medium">
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
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Export Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToPreviewPage}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview & Download ATS Resume</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 space-y-6">
        {/* ATS READABILITY & OPTIMIZATION SCORE CARD */}
        {/* <AtsScoreCard data={resumeData} /> */}

        {/* AI PROMPT GENERATOR, PDF UPLOADER & JD ANALYZER GRID */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <PdfUploader
              onParsed={(extracted) => {
                handleUpdateResumeData(extracted);
              }}
              onResetSample={() => handleUpdateResumeData(DEFAULT_RESUME_DATA)}
            />
            <PromptGenerator
              resumeData={resumeData}
              onUpdateResumeData={(updated) => handleUpdateResumeData(updated)}
            />
          </div>

          <JdAnalyzer
            resumeData={resumeData}
            onUpdateResumeData={(updated) => handleUpdateResumeData(updated)}
          />
        </div>

        {/* WORKSPACE VIEW: EDITOR & PREVIEW */}
        <div
          className={`grid gap-6 ${
            viewMode === "split"
              ? "grid-cols-1 lg:grid-cols-12"
              : viewMode === "editor"
              ? "grid-cols-1"
              : "grid-cols-1"
          }`}
        >
          {/* EDITOR COLUMN */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              className={`${
                viewMode === "split" ? "lg:col-span-5" : "w-full max-w-3xl mx-auto"
              } no-print`}
            >
              <ResumeEditor
                data={resumeData}
                onChange={(newData) => handleUpdateResumeData(newData)}
              />
            </div>
          )}

          {/* PREVIEW COLUMN */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              className={`${
                viewMode === "split" ? "lg:col-span-7" : "w-full"
              } flex flex-col items-center overflow-x-auto`}
            >
              {/* Controls bar directly above resume document */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-zinc-500 dark:text-zinc-400 no-print px-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Standard ATS Resume Template
                </span>

                {/* Undo & Redo Action Bar Directly Above Resume */}
                <div className="flex items-center gap-1 bg-zinc-200/90 dark:bg-zinc-800/90 px-2 py-1 rounded-xl border border-zinc-300/80 dark:border-zinc-700/80 text-xs font-semibold">
                  <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                    title="Undo edit (Cmd+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Undo</span>
                  </button>

                  <button
                    onClick={handleRedo}
                    disabled={future.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border-l border-zinc-300 dark:border-zinc-700 pl-2.5"
                    title="Redo edit (Cmd+Shift+Z)"
                  >
                    <Redo2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Redo</span>
                  </button>
                </div>

                <span>Format: Standard A4 • Single-column ATS Compliant</span>
              </div>

              {/* Printable Wrapper */}
              <div className="w-full overflow-auto py-2 flex justify-center bg-zinc-200/60 dark:bg-zinc-900/60 rounded-xl border border-zinc-300 dark:border-zinc-800">
                <ResumePreview data={resumeData} scale={scale} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
