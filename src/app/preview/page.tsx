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
        localStorage.getItem("ats_resume_data");

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
  // DOWNLOAD PDF
  // ============================================================

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) {
      return;
    }

    const original =
      document.getElementById(
        "ats-resume-document"
      );

    if (!original) {
      console.error(
        "Could not find #ats-resume-document"
      );

      window.alert(
        "Unable to find the resume document."
      );

      return;
    }

    let container:
      | HTMLDivElement
      | null = null;

    try {
      setIsGeneratingPdf(true);

      // ========================================================
      // WAIT FOR FONTS
      // ========================================================

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

      // ========================================================
      // WAIT FOR IMAGES
      // ========================================================

      const images =
        Array.from(
          original.querySelectorAll("img")
        );

      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }

              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      // ========================================================
      // READ ORIGINAL SIZE
      // ========================================================

      /*
       * offsetWidth gives us the layout width without
       * the visual zoom transform.
       */

      const originalWidth =
        original.offsetWidth ||
        794;

      const originalHeight =
        original.scrollHeight ||
        original.offsetHeight ||
        1123;

      // ========================================================
      // CLONE
      // ========================================================

      const clone =
        original.cloneNode(
          true
        ) as HTMLElement;

      clone.id =
        "ats-resume-document-pdf";

      // ========================================================
      // OFF-SCREEN CONTAINER
      // ========================================================

      container =
        document.createElement(
          "div"
        );

      container.id =
        "ats-pdf-render-container";

      container.style.position =
        "absolute";

      container.style.left =
        "-100000px";

      container.style.top =
        "0";

      container.style.width =
        `${originalWidth}px`;

      container.style.margin =
        "0";

      container.style.padding =
        "0";

      container.style.background =
        "#ffffff";

      container.style.overflow =
        "visible";

      container.style.pointerEvents =
        "none";

      container.style.zIndex =
        "-999999";

      // ========================================================
      // CLONE ROOT
      // ========================================================

      /*
       * IMPORTANT:
       *
       * We preserve all original ResumePreview
       * margin and padding values.
       *
       * We only remove the visible zoom transform.
       */

      clone.style.width =
        `${originalWidth}px`;

      clone.style.minWidth =
        `${originalWidth}px`;

      clone.style.maxWidth =
        `${originalWidth}px`;

      clone.style.transform =
        "none";

      clone.style.zoom =
        "1";

      clone.style.boxSizing =
        "border-box";

      clone.style.border =
        "none";

      clone.style.boxShadow =
        "none";

      clone.style.margin =
        "0";

      clone.style.overflow =
        "visible";

      // ========================================================
      // HIDE NON-PRINT ELEMENTS
      // ========================================================

      clone
        .querySelectorAll(
          ".no-print"
        )
        .forEach((node) => {
          const element =
            node as HTMLElement;

          element.style.setProperty(
            "display",
            "none",
            "important"
          );
        });

      // ========================================================
      // STOP ANIMATIONS
      // ========================================================

      clone
        .querySelectorAll("*")
        .forEach((node) => {
          const element =
            node as HTMLElement;

          element.style.setProperty(
            "animation",
            "none",
            "important"
          );

          element.style.setProperty(
            "transition",
            "none",
            "important"
          );
        });

      // ========================================================
      // SVG ICONS
      // ========================================================

      clone
        .querySelectorAll("svg")
        .forEach((node) => {
          const svg =
            node as SVGElement;

          svg.style.setProperty(
            "vertical-align",
            "middle",
            "important"
          );

          svg.style.setProperty(
            "transform",
            "none",
            "important"
          );
        });

      // ========================================================
      // CONTACT ICONS
      // ========================================================

      clone
        .querySelectorAll(
          ".contact-icon, .contact-icon svg, .contact-icon img"
        )
        .forEach((node) => {
          const icon =
            node as HTMLElement;

          icon.style.setProperty(
            "vertical-align",
            "middle",
            "important"
          );

          icon.style.setProperty(
            "transform",
            "none",
            "important"
          );
        });

      // ========================================================
      // PDF STYLE
      // ========================================================

      const pdfStyle =
        document.createElement(
          "style"
        );

      pdfStyle.setAttribute(
        "data-pdf-style",
        "true"
      );

      pdfStyle.textContent = `
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        #ats-resume-document-pdf {
          box-sizing: border-box !important;

          transform: none !important;
          zoom: 1 !important;

          background: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;

          overflow: visible !important;
        }

        #ats-resume-document-pdf .no-print {
          display: none !important;
        }

        #ats-resume-document-pdf,
        #ats-resume-document-pdf * {
          animation: none !important;
          transition: none !important;
        }

        #ats-resume-document-pdf svg {
          vertical-align: middle !important;
        }
      `;

      clone.prepend(
        pdfStyle
      );

      // ========================================================
      // ADD CLONE TO PAGE
      // ========================================================

      container.appendChild(
        clone
      );

      document.body.appendChild(
        container
      );

      // ========================================================
      // FORCE LAYOUT
      // ========================================================

      void clone.offsetHeight;

      await new Promise<void>(
        (resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }
      );

      // ========================================================
      // CAPTURE CLICKABLE LINK COORDINATES
      // ========================================================

      const rootRect =
        clone.getBoundingClientRect();

      const linkElements =
        Array.from(
          clone.querySelectorAll<HTMLAnchorElement>(
            "a[href]"
          )
        );

      const linksData =
        linkElements
          .map((anchor) => {
            const rect =
              anchor.getBoundingClientRect();

            const rawHref = (
              anchor.getAttribute(
                "href"
              ) || ""
            ).trim();

            let url = rawHref;

            if (
              url &&
              !url.startsWith(
                "http://"
              ) &&
              !url.startsWith(
                "https://"
              ) &&
              !url.startsWith(
                "mailto:"
              ) &&
              !url.startsWith(
                "tel:"
              )
            ) {
              url = `https://${url}`;
            }

            return {
              url,
              relX:
                (rect.left -
                  rootRect.left) /
                rootRect.width,
              relY:
                (rect.top -
                  rootRect.top) /
                rootRect.height,
              relW:
                rect.width /
                rootRect.width,
              relH:
                rect.height /
                rootRect.height,
            };
          })
          .filter(
            (item) =>
              item.url &&
              item.relW > 0 &&
              item.relH > 0
          );

      // ========================================================
      // IMPORT LIBRARIES
      // ========================================================

      /*
       * html2canvas-pro is used instead of html2canvas.
       *
       * This avoids errors caused by modern CSS colors:
       *
       * lab()
       * lch()
       * oklab()
       * oklch()
       */

      const html2canvas =
        (
          await import(
            "html2canvas-pro"
          )
        ).default;

      const { jsPDF } =
        await import(
          "jspdf"
        );

      // ========================================================
      // GET ACTUAL CLONE DIMENSIONS
      // ========================================================

      const renderWidth =
        clone.scrollWidth ||
        clone.offsetWidth ||
        originalWidth;

      const renderHeight =
        Math.max(
          clone.scrollHeight,
          originalHeight
        );

      console.log(
        "Resume PDF render size:",
        {
          width: renderWidth,
          height: renderHeight,
        }
      );

      // ========================================================
      // RENDER RESUME TO CANVAS
      // ========================================================

      const canvas =
        await html2canvas(
          clone,
          {
            scale: 2,

            width: renderWidth,

            height: renderHeight,

            windowWidth:
              renderWidth,

            windowHeight:
              renderHeight,

            backgroundColor:
              "#ffffff",

            useCORS: true,

            allowTaint: false,

            logging: false,

            imageTimeout: 0,

            scrollX: 0,

            scrollY: 0,

            onclone: (
              clonedDocument
            ) => {
              // ==================================================
              // GET PDF ROOT
              // ==================================================

              const pdfRoot =
                clonedDocument.getElementById(
                  "ats-resume-document-pdf"
                );

              if (!pdfRoot) {
                return;
              }

              // ==================================================
              // REMOVE PREVIEW SCALING & BORDERS
              // ==================================================

              pdfRoot.style.setProperty(
                "transform",
                "none",
                "important"
              );

              pdfRoot.style.setProperty(
                "zoom",
                "1",
                "important"
              );

              pdfRoot.style.setProperty(
                "background",
                "#ffffff",
                "important"
              );

              pdfRoot.style.setProperty(
                "border",
                "none",
                "important"
              );

              pdfRoot.style.setProperty(
                "box-shadow",
                "none",
                "important"
              );

              pdfRoot.style.setProperty(
                "margin",
                "0",
                "important"
              );

              pdfRoot.style.setProperty(
                "overflow",
                "visible",
                "important"
              );

              // ==================================================
              // HIDE UI
              // ==================================================

              clonedDocument
                .querySelectorAll(
                  ".no-print"
                )
                .forEach((node) => {
                  const element =
                    node as HTMLElement;

                  element.style.setProperty(
                    "display",
                    "none",
                    "important"
                  );
                });

              // ==================================================
              // STOP ANIMATIONS
              // ==================================================

              clonedDocument
                .querySelectorAll("*")
                .forEach((node) => {
                  const element =
                    node as HTMLElement;

                  element.style.setProperty(
                    "animation",
                    "none",
                    "important"
                  );

                  element.style.setProperty(
                    "transition",
                    "none",
                    "important"
                  );
                });

              // ==================================================
              // SVG
              // ==================================================

              clonedDocument
                .querySelectorAll("svg")
                .forEach((node) => {
                  const svg =
                    node as SVGElement;

                  svg.style.setProperty(
                    "vertical-align",
                    "middle",
                    "important"
                  );

                  svg.style.setProperty(
                    "transform",
                    "none",
                    "important"
                  );
                });

              // ==================================================
              // CONTACT ICONS
              // ==================================================

              clonedDocument
                .querySelectorAll(
                  ".contact-icon, .contact-icon svg, .contact-icon img"
                )
                .forEach((node) => {
                  const icon =
                    node as HTMLElement;

                  icon.style.setProperty(
                    "vertical-align",
                    "middle",
                    "important"
                  );

                  icon.style.setProperty(
                    "transform",
                    "none",
                    "important"
                  );
                });
            },
          }
        );

      // ========================================================
      // CREATE A4 PDF
      // ========================================================

      const pdf =
        new jsPDF({
          orientation:
            "portrait",

          unit:
            "mm",

          format:
            "a4",

          compress:
            true,
        });

      // ========================================================
      // A4 PAGE SIZE
      // ========================================================

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      // ========================================================
      // ADD FULL-PAGE RESUME IMAGE (EDGE-TO-EDGE, NO OFFSET)
      // ========================================================

      pdf.addImage(
        canvas,
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
      );

      // ========================================================
      // ATTACH CLICKABLE HYPERLINKS (LINKEDIN, GITHUB, EMAIL)
      // ========================================================

      linksData.forEach((link) => {
        const linkX =
          link.relX * pageWidth;

        const linkY =
          link.relY * pageHeight;

        const linkW =
          link.relW * pageWidth;

        const linkH =
          link.relH * pageHeight;

        pdf.link(
          linkX,
          linkY,
          linkW,
          linkH,
          {
            url: link.url,
          }
        );
      });

      // ========================================================
      // FILE NAME
      // ========================================================

      const fullName =
        resumeData.personalInfo
          ?.fullName ||
        "Resume";

      const safeName =
        fullName
          .trim()
          .replace(
            /[^a-zA-Z0-9_-]+/g,
            "_"
          );

      const fileName =
        `${safeName}_ATS_Resume.pdf`;

      // ========================================================
      // DOWNLOAD
      // ========================================================

      pdf.save(
        fileName
      );

      console.log(
        "ATS Resume PDF downloaded successfully with clickable links."
      );
    } catch (error) {
      console.error(
        "Failed to generate ATS Resume PDF:",
        error
      );

      window.alert(
        "PDF generation failed. Please try again."
      );
    } finally {
      // ========================================================
      // CLEANUP
      // ========================================================

      if (
        container &&
        document.body.contains(
          container
        )
      ) {
        document.body.removeChild(
          container
        );
      }

      document
        .querySelectorAll(
          ".html2canvas-container"
        )
        .forEach((node) => {
          node.remove();
        });

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
                DOWNLOAD
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