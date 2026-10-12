"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ResumeData, isDemoResume } from "@/types/resume";
import { calculateResumeDiff, ResumeDiff } from "@/utils/diffResume";
import { Sparkles, Check, EyeOff, Eye } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  originalData?: ResumeData | null;
  onClearHighlights?: () => void;
}

// Crisp Data-URI img icons for GitHub, LinkedIn, Mail, Phone
const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <img
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='black'><path fill-rule='evenodd' clip-rule='evenodd' d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'/></svg>"
    alt="GitHub"
    className={`${className} shrink-0 contact-icon block`}
    style={{ width: "13px", height: "13px" }}
  />
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <img
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='black'><path d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z'/></svg>"
    alt="LinkedIn"
    className={`${className} shrink-0 contact-icon block`}
    style={{ width: "13px", height: "13px" }}
  />
);

const PhoneIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <img
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/></svg>"
    alt="Phone"
    className={`${className} shrink-0 contact-icon block`}
    style={{ width: "13px", height: "13px" }}
  />
);

const MailIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <img
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='16' x='2' y='4' rx='2'/><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/></svg>"
    alt="Email"
    className={`${className} shrink-0 contact-icon block`}
    style={{ width: "13px", height: "13px" }}
  />
);

// Simple helper to render **bold text** inside bullet strings safely
const renderFormattedText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-black dark:text-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  scale = 1,
  originalData,
  onClearHighlights,
}) => {
  const {
    personalInfo,
    summary,
    experiences,
    projects,
    achievements,
    education,
    certifications,
    skillCategories,
  } = data;

  // AI Diff state & baseline detection
  const [baselineData, setBaselineData] = useState<ResumeData | null>(
    originalData !== undefined ? originalData : null
  );
  const [highlightsVisible, setHighlightsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (originalData !== undefined) {
      setBaselineData(originalData);
    } else {
      try {
        const saved = localStorage.getItem("ats_ai_original_resume");
        if (saved) {
          setBaselineData(JSON.parse(saved));
        } else {
          setBaselineData(null);
        }
      } catch (e) {
        setBaselineData(null);
      }
    }
  }, [originalData, data]);

  const diff: ResumeDiff = useMemo(
    () => calculateResumeDiff(baselineData, data),
    [baselineData, data]
  );

  const handleDismissHighlights = () => {
    try {
      localStorage.removeItem("ats_ai_original_resume");
    } catch (e) {
      console.error("Failed to remove baseline resume from storage", e);
    }
    setBaselineData(null);
    if (onClearHighlights) {
      onClearHighlights();
    }
  };

  // Separate certifications and non-certification achievements if stored together
  const explicitCerts =
    certifications && certifications.length > 0 ? certifications : [];

  const certsFromAchievements =
    explicitCerts.length === 0 && achievements
      ? achievements.filter(
          (ach) => /certif/i.test(ach.title) || /certif/i.test(ach.description)
        )
      : [];

  const nonCertAchievements =
    explicitCerts.length > 0
      ? achievements || []
      : (achievements || []).filter(
          (ach) => !/certif/i.test(ach.title) && !/certif/i.test(ach.description)
        );

  return (
    <div className="relative mx-auto">
      {/* ─── AI CHANGES HIGHLIGHT BANNER ─── */}
      {diff.hasChanges && (
        <div className="no-print max-w-[210mm] mx-auto mb-3.5 bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-indigo-500/15 border border-amber-300 dark:border-amber-700/70 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  AI Modifications Active
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  {diff.totalChanges} update{diff.totalChanges > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Newly tailored bullets and skills are highlighted below with tags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHighlightsVisible((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {highlightsVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Hide Highlights</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Show Highlights</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismissHighlights}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all cursor-pointer shadow-xs hover:shadow active:scale-95"
              title="Accept all AI updates and clear the highlighted state"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── RESUME DOCUMENT CONTAINER ─── */}
      <div
        id="ats-resume-document"
        className="bg-white text-black font-sans w-[210mm] min-h-[297mm] p-[10mm] md:p-[12mm] shadow-xl border border-gray-200 mx-auto transition-transform origin-top select-text relative"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          fontFamily: "'Inter', Arial, Helvetica, sans-serif",
        }}
      >
        {/* PRINT CSS: Ensure highlight backgrounds and badges never show on physical prints or PDFs */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              #ats-resume-document [class*="bg-amber-"],
              #ats-resume-document [class*="bg-emerald-"] {
                background-color: transparent !important;
                border-left: none !important;
                border: none !important;
                padding-left: 0 !important;
              }
            }
          `
        }} />

        {/* FLUTTER-STYLE RED DIAGONAL DEMO BANNER */}
        {isDemoResume(data) && (
          <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-20 no-print">
            <div className="absolute top-4 -right-8 w-32 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest text-center shadow-md rotate-45 py-0.5 border-y border-red-400/30">
              DEMO
            </div>
          </div>
        )}

        {/* 1. HEADER / CONTACT INFORMATION */}
        <div className="resume-header text-center mb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black uppercase mb-1">
            {personalInfo.fullName || "YOUR NAME"}
          </h1>

          {/* Contact Links Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] md:text-[12px] text-gray-800 font-medium leading-normal">
            {personalInfo.github && (
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <GithubIcon className="w-3.5 h-3.5 text-black" />
                <a
                  href={
                    personalInfo.github.startsWith("http")
                      ? personalInfo.github
                      : `https://${personalInfo.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-black"
                >
                  {personalInfo.github.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {personalInfo.phone && (
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <PhoneIcon className="w-3.5 h-3.5 text-black" />
                <span className="text-black">{personalInfo.phone}</span>
              </div>
            )}

            {personalInfo.linkedin && (
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <LinkedinIcon className="w-3.5 h-3.5 text-black" />
                <a
                  href={
                    personalInfo.linkedin.startsWith("http")
                      ? personalInfo.linkedin
                      : `https://${personalInfo.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-black"
                >
                  {personalInfo.linkedin.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {personalInfo.email && (
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <MailIcon className="w-3.5 h-3.5 text-black" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="hover:underline text-black"
                >
                  {personalInfo.email}
                </a>
              </div>
            )}

            {personalInfo.location && (
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-black">• {personalInfo.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. PROFESSIONAL SUMMARY */}
        {Boolean(summary?.trim()) && (
          <section className="mb-3.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-0.5 border-b border-gray-400">
                PROFESSIONAL SUMMARY
              </h2>
            </div>
            {highlightsVisible && diff.summaryChanged ? (
              <div className="relative group rounded p-1.5 -m-1.5 bg-amber-50/90 border-l-2 border-amber-500 transition-all">
                <span className="no-print absolute -top-2.5 right-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Updated
                </span>
                <p className="text-[12px] leading-relaxed text-gray-900 font-normal">
                  {renderFormattedText(summary!)}
                </p>
              </div>
            ) : (
              <p className="text-[12px] leading-relaxed text-gray-900 font-normal">
                {renderFormattedText(summary!)}
              </p>
            )}
          </section>
        )}

        {/* 3. EDUCATION */}
        {education && education.length > 0 && (
          <section className="mb-3.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-0.5 border-b border-gray-400">
                EDUCATION
              </h2>
            </div>
            <div className="space-y-1.5">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="text-[12px] leading-relaxed"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <div className="flex justify-between items-baseline font-bold text-black text-[13px]">
                    <span>{edu.institution}</span>
                    <span className="font-medium text-gray-700 text-[11.5px] shrink-0">
                      {edu.startDate} {edu.startDate && edu.endDate ? "–" : ""} {edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-gray-800">
                    <span>{edu.degree}</span>
                    {edu.gpa && (
                      <span className="not-italic font-medium text-gray-800 text-[11.5px] shrink-0">
                        {edu.gpa}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. SKILLS */}
        {skillCategories && skillCategories.length > 0 && (
          <section className="mb-3.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-0.5 border-b border-gray-400">
                SKILLS
              </h2>
            </div>
            <div className="space-y-1 text-[12px] leading-relaxed">
              {skillCategories.map((sk) => {
                const skillsList = sk.skills
                  ? Array.from(
                      new Set(
                        sk.skills
                          .split(/[,;]/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    )
                  : [];

                return (
                  <div key={sk.id} className="flex flex-wrap items-baseline gap-1">
                    <span className="font-bold text-black shrink-0">
                      {sk.category}:
                    </span>
                    <span className="text-gray-900">
                      {skillsList.map((skill, sIdx) => {
                        const isNew =
                          highlightsVisible &&
                          diff.newSkills.has(skill.toLowerCase().trim());

                        return (
                          <React.Fragment key={sIdx}>
                            {isNew ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-950 font-semibold px-1 py-0.5 rounded border border-emerald-300">
                                <span>{skill}</span>
                                <span className="no-print text-[8px] bg-emerald-600 text-white px-1 py-0 rounded font-bold uppercase tracking-wider">
                                  New
                                </span>
                              </span>
                            ) : (
                              <span>{skill}</span>
                            )}
                            {sIdx < skillsList.length - 1 && ", "}
                          </React.Fragment>
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. WORK EXPERIENCE */}
        {experiences && experiences.length > 0 && (
          <section className="mb-3.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-0.5 border-b border-gray-400">
                WORK EXPERIENCE
              </h2>
            </div>
            <div className="space-y-2.5">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="text-[12px] leading-relaxed"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <div className="flex justify-between items-baseline font-bold text-black text-[13px]">
                    <span>{exp.company}</span>
                    <span className="font-medium text-gray-700 text-[11.5px] shrink-0">
                      {exp.startDate} {exp.startDate && exp.endDate ? "–" : ""} {exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-gray-800 mb-1">
                    <span>{exp.role}</span>
                    {exp.location && (
                      <span className="not-italic text-gray-700 text-[11.5px] shrink-0">
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-1 text-gray-900 mt-1">
                      {exp.bullets.map((bullet, i) => {
                        const isModified =
                          highlightsVisible && diff.changedExpBullets.has(bullet);

                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-2 relative transition-all group ${
                              isModified
                                ? "bg-amber-50/90 border-l-2 border-amber-500 pl-1.5 py-0.5 rounded-r"
                                : ""
                            }`}
                          >
                            <span
                              className={`select-none font-bold text-[12px] leading-relaxed shrink-0 ${
                                isModified ? "text-amber-700" : "text-black"
                              }`}
                            >
                              •
                            </span>
                            <span className="flex-1 leading-relaxed">
                              {renderFormattedText(bullet)}
                            </span>
                            {isModified && (
                              <span className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-0.5 bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs flex items-center gap-0.5 pointer-events-none">
                                <Sparkles className="w-2.5 h-2.5" /> AI Updated
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. PROJECTS */}
        {projects && projects.length > 0 && (
          <section className="mb-4.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-1 border-b border-gray-400">
                PROJECTS
              </h2>
            </div>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="text-[12px] leading-relaxed"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <div className="font-bold text-black text-[13px] mb-0.5">
                    {proj.title}
                  </div>

                  <ul className="space-y-1 text-gray-900 mt-1">
                    {proj.techStack && (
                      <li className="flex items-start gap-2">
                        <span className="select-none font-bold text-[12px] leading-relaxed text-black shrink-0">
                          •
                        </span>
                        <span className="flex-1 leading-relaxed">
                          <strong className="font-semibold text-black">
                            Tech Stack:
                          </strong>{" "}
                          {proj.techStack.split(/[,;]/).map((item, tIdx, arr) => {
                            const trimmed = item.trim();
                            const isNew =
                              highlightsVisible &&
                              diff.newTechStacks.has(trimmed.toLowerCase());

                            return (
                              <React.Fragment key={tIdx}>
                                {isNew ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-950 font-semibold px-1 py-0.2 rounded border border-emerald-300">
                                    {trimmed}
                                    <span className="no-print text-[8px] bg-emerald-600 text-white px-1 rounded font-bold">
                                      New
                                    </span>
                                  </span>
                                ) : (
                                  <span>{trimmed}</span>
                                )}
                                {tIdx < arr.length - 1 && ", "}
                              </React.Fragment>
                            );
                          })}
                        </span>
                      </li>
                    )}

                    {proj.bullets &&
                      proj.bullets.map((bullet, i) => {
                        const isModified =
                          highlightsVisible && diff.changedProjBullets.has(bullet);

                        return (
                          <li
                            key={i}
                            className={`flex items-start gap-2 relative transition-all group ${
                              isModified
                                ? "bg-amber-50/90 border-l-2 border-amber-500 pl-1.5 py-0.5 rounded-r"
                                : ""
                            }`}
                          >
                            <span
                              className={`select-none font-bold text-[12px] leading-relaxed shrink-0 ${
                                isModified ? "text-amber-700" : "text-black"
                              }`}
                            >
                              •
                            </span>
                            <span className="flex-1 leading-relaxed">
                              {renderFormattedText(bullet)}
                            </span>
                            {isModified && (
                              <span className="no-print opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-0.5 bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs flex items-center gap-0.5 pointer-events-none">
                                <Sparkles className="w-2.5 h-2.5" /> AI Updated
                              </span>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. CERTIFICATIONS */}
        {((explicitCerts && explicitCerts.length > 0) ||
          certsFromAchievements.length > 0) && (
          <section className="mb-4.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-1 border-b border-gray-400">
                CERTIFICATIONS
              </h2>
            </div>
            <div className="space-y-1.5 text-[12px] leading-relaxed">
              {explicitCerts.length > 0
                ? explicitCerts.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-baseline font-bold text-black text-[12.5px]"
                    >
                      <span>
                        {cert.name}
                        {cert.issuer ? ` – ${cert.issuer}` : ""}
                      </span>
                      {cert.date && (
                        <span className="font-medium text-gray-700 text-[11.5px] shrink-0">
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))
                : certsFromAchievements.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-baseline font-bold text-black text-[12.5px]"
                    >
                      <span>{cert.title}</span>
                      {cert.date && (
                        <span className="font-medium text-gray-700 text-[11.5px] shrink-0">
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
            </div>
          </section>
        )}

        {/* 8. ACHIEVEMENTS */}
        {nonCertAchievements && nonCertAchievements.length > 0 && (
          <section className="mb-4.5" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <div className="mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-1 border-b border-gray-400">
                ACHIEVEMENTS
              </h2>
            </div>
            <div className="space-y-2 text-[12px] leading-relaxed">
              {nonCertAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="text-[12px] leading-relaxed"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <div className="flex justify-between items-baseline font-bold text-black text-[12.5px]">
                    <span>{ach.title}</span>
                    {ach.date && (
                      <span className="font-medium text-gray-700 text-[11.5px] shrink-0">
                        {ach.date}
                      </span>
                    )}
                  </div>
                  {ach.description && (
                    <div className="text-gray-800 text-[12px] mt-0.5">
                      {renderFormattedText(ach.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
