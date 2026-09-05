"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResumeData, DEFAULT_RESUME_DATA } from "@/types/resume";

interface PdfUploaderProps {
  onParsed: (data: ResumeData) => void;
  onResetSample: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onParsed,
  onResetSample,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setErrorMsg("Please select a valid PDF file.");
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setFileName(file.name);
    setStatusMessage("Uploading PDF and initializing AI...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatusMessage("Extracting text and analyzing resume with AI...");

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to process resume with AI.");
      }

      setStatusMessage("Successfully generated ATS Resume structure!");
      onParsed(result.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while parsing the resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Upload PDF Resume
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              AI extracts content directly into the ATS template
            </p>
          </div>
        </div>

        <button
          onClick={onResetSample}
          className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-blue-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load Reference Sample
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]"
            : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 bg-zinc-50/50 dark:bg-zinc-950/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {statusMessage}
            </p>
            {fileName && (
              <span className="text-[11px] text-zinc-500 font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {fileName}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Click to browse or drag & drop your PDF resume
              </p>
              <p className="text-[11px] text-zinc-500">
                Supports standard PDF resumes (up to 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-xs border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
