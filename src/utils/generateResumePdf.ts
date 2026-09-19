/**
 * generateResumePdf.ts
 *
 * Dynamic ATS-friendly PDF generator using jsPDF.
 * - Two-pass layout: measures total height → adjusts spacing to fit cleanly
 * - Selectable real text (no PNG/image rendering)
 * - Fixes skill-line wrapping, bullet indentation, section breathing room
 */

import { jsPDF } from "jspdf";
import { ResumeData } from "@/types/resume";

// ─── SVG icon definitions (same as ResumePreview.tsx) ────────────────────────
const SVG_GITHUB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`;
const SVG_LINKEDIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/></svg>`;
const SVG_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const SVG_EMAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const SVG_LOCATION = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

// Convert an SVG string → PNG data URL using browser Canvas API.
// Falls back to empty string on error (icon simply omitted).
function svgToPng(svgStr: string, sizePx = 26): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width  = sizePx;
          canvas.height = sizePx;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(""); return; }
          ctx.drawImage(img, 0, 0, sizePx, sizePx);
          resolve(canvas.toDataURL("image/png"));
        } catch { resolve(""); }
      };
      img.onerror = () => resolve("");
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
    } catch { resolve(""); }
  });
}

interface Icons { github: string; linkedin: string; phone: string; email: string; location: string; }

async function preloadIcons(): Promise<Icons> {
  const [github, linkedin, phone, email, location] = await Promise.all([
    svgToPng(SVG_GITHUB),
    svgToPng(SVG_LINKEDIN),
    svgToPng(SVG_PHONE),
    svgToPng(SVG_EMAIL),
    svgToPng(SVG_LOCATION),
  ]);
  return { github, linkedin, phone, email, location };
}

// ─── A4 constants ────────────────────────────────────────────────────────────
const PAGE_W  = 210;
const PAGE_H  = 297;

// ─── Strip **bold** markdown ─────────────────────────────────────────────────
const plain = (s: string) => s.replace(/\*\*(.*?)\*\*/g, "$1");

// ─── Deduplicate comma-separated skill string ─────────────────────────────────
const dedupeSkills = (skills: string) =>
  Array.from(new Set(skills.split(/[,;]/).map(s => s.trim()).filter(Boolean))).join(", ");

// ─── Cert / achievement split ─────────────────────────────────────────────────
function splitCerts(data: ResumeData) {
  const explicitCerts = data.certifications?.length ? data.certifications : [];
  const certsFromAch  = !explicitCerts.length && data.achievements
    ? data.achievements.filter(a => /certif/i.test(a.title) || /certif/i.test(a.description))
    : [];
  const nonCertAch = explicitCerts.length
    ? (data.achievements || [])
    : (data.achievements || []).filter(a => !/certif/i.test(a.title) && !/certif/i.test(a.description));
  return { explicitCerts, certsFromAch, nonCertAch };
}

// ─── Layout configuration (adjusted in two-pass) ─────────────────────────────
interface Layout {
  marginX:      number;   // mm left/right
  marginTop:    number;   // mm
  marginBot:    number;   // mm
  fsName:       number;   // pt
  fsContact:    number;   // pt
  fsSection:    number;   // pt
  fsBody:       number;   // pt
  fsSmall:      number;   // pt
  lhName:       number;   // mm
  lhContact:    number;   // mm
  lhSection:    number;   // mm  (heading + rule)
  lhBody:       number;   // mm
  lhSmall:      number;   // mm
  gapSection:   number;   // mm between sections
  gapEntry:     number;   // mm between entries within a section
  bulletIndent: number;   // mm
}

function defaultLayout(): Layout {
  return {
    marginX:      14,
    marginTop:    13,
    marginBot:    13,
    fsName:       18,
    fsContact:    8.5,
    fsSection:    8.5,
    fsBody:       9,
    fsSmall:      8.5,
    lhName:       8,
    lhContact:    5,
    lhSection:    6,   // text + rule combined
    lhBody:       5.2,
    lhSmall:      4.8,
    gapSection:   3.5,
    gapEntry:     2,
    bulletIndent: 3.5,
  };
}

// ─── Content-width helper ────────────────────────────────────────────────────
function cw(l: Layout) { return PAGE_W - l.marginX * 2; }

// ─── Text wrap helper ────────────────────────────────────────────────────────
function wrap(pdf: jsPDF, text: string, maxW: number): string[] {
  return pdf.splitTextToSize(text, maxW);
}

// ─── HEIGHT ESTIMATOR ────────────────────────────────────────────────────────
// Estimates total rendered height so we can scale layout to fit.
function estimateHeight(pdf: jsPDF, data: ResumeData, l: Layout): number {
  const { explicitCerts, certsFromAch, nonCertAch } = splitCerts(data);
  const pi = data.personalInfo;
  let h = l.marginTop + l.marginBot;

  // Name
  h += l.lhName;

  // Contact bar
  pdf.setFontSize(l.fsContact);
  const contactStr = [pi.github, pi.phone, pi.linkedin, pi.email, pi.location]
    .filter(Boolean).map(s => s!.replace(/^https?:\/\//, "")).join("  |  ");
  h += wrap(pdf, contactStr, cw(l)).length * l.lhContact + 2;

  // Summary
  if (data.summary?.trim()) {
    h += l.lhSection + l.gapSection;
    pdf.setFontSize(l.fsBody);
    h += wrap(pdf, plain(data.summary), cw(l)).length * l.lhBody + l.gapSection;
  }

  // Education
  if (data.education?.length) {
    h += l.lhSection;
    data.education.forEach((edu, i) => {
      h += l.lhBody + l.lhSmall;
      if (i < data.education.length - 1) h += l.gapEntry;
    });
    h += l.gapSection;
  }

  // Skills
  if (data.skillCategories?.length) {
    h += l.lhSection;
    data.skillCategories.forEach(sk => {
      const deduped = dedupeSkills(sk.skills || "");
      if (!deduped) return;
      pdf.setFontSize(l.fsBody);
      const label = `${sk.category}: `;
      const labelW = pdf.getTextWidth(label);
      // First line: label + first wrap chunk
      const firstW = cw(l) - labelW;
      const allWords = deduped.split(" ");
      // rough estimate: 1 line per (firstW / 5) words, then full-width wraps
      const fullLines = wrap(pdf, deduped, cw(l));
      h += fullLines.length * l.lhBody;
    });
    h += l.gapSection;
  }

  // Work Experience
  if (data.experiences?.length) {
    h += l.lhSection;
    data.experiences.forEach((exp, i) => {
      h += l.lhBody + l.lhSmall + 1;
      exp.bullets?.forEach(b => {
        pdf.setFontSize(l.fsBody);
        const lines = wrap(pdf, plain(b), cw(l) - l.bulletIndent);
        h += lines.length * l.lhBody;
      });
      if (i < data.experiences.length - 1) h += l.gapEntry;
    });
    h += l.gapSection;
  }

  // Projects
  if (data.projects?.length) {
    h += l.lhSection;
    data.projects.forEach((proj, i) => {
      h += l.lhBody;
      if (proj.techStack) {
        const tsLines = wrap(pdf, plain(`Tech Stack: ${proj.techStack}`), cw(l) - l.bulletIndent);
        h += tsLines.length * l.lhBody;
      }
      proj.bullets?.forEach(b => {
        const lines = wrap(pdf, plain(b), cw(l) - l.bulletIndent);
        h += lines.length * l.lhBody;
      });
      if (i < data.projects.length - 1) h += l.gapEntry;
    });
    h += l.gapSection;
  }

  // Certifications
  const certsToRender = explicitCerts.length ? explicitCerts : certsFromAch;
  if (certsToRender.length) {
    h += l.lhSection;
    h += certsToRender.length * l.lhBody + l.gapSection;
  }

  // Achievements
  if (nonCertAch.length) {
    h += l.lhSection;
    nonCertAch.forEach(ach => {
      h += l.lhBody;
      if (ach.description) {
        pdf.setFontSize(l.fsSmall);
        h += wrap(pdf, plain(ach.description), cw(l)).length * l.lhSmall;
      }
    });
  }

  return h;
}

// ─── Scale layout to fit content ─────────────────────────────────────────────
function fitLayout(pdf: jsPDF, data: ResumeData): Layout {
  const l = defaultLayout();
  const estimated = estimateHeight(pdf, data, l);
  const available = PAGE_H; // full page

  if (estimated <= available) {
    // Content fits — add extra breathing room proportionally
    const extra = (available - estimated) * 0.4;
    l.gapSection   += Math.min(extra / 8, 2);
    l.gapEntry     += Math.min(extra / 12, 1);
    l.lhBody       += Math.min(extra / 20, 0.5);
    return l;
  }

  // Content is taller than page — reduce spacing first, then font
  const ratio = available / estimated;

  if (ratio >= 0.88) {
    // Mild: reduce spacing only
    l.gapSection  *= ratio;
    l.gapEntry    *= ratio;
    l.lhBody      *= Math.max(ratio, 0.92);
    l.lhSmall     *= Math.max(ratio, 0.92);
    l.lhSection   *= Math.max(ratio, 0.95);
  } else if (ratio >= 0.78) {
    // Moderate: reduce spacing + slightly reduce margins
    l.gapSection  *= 0.80;
    l.gapEntry    *= 0.75;
    l.lhBody      *= 0.93;
    l.lhSmall     *= 0.93;
    l.marginX      = Math.max(10, l.marginX * 0.92);
    l.marginTop    = Math.max(9,  l.marginTop * 0.88);
    l.marginBot    = Math.max(9,  l.marginBot * 0.88);
  } else {
    // Heavy: also reduce font size (never below 8.5pt body)
    l.gapSection   = 2;
    l.gapEntry     = 1.2;
    l.lhBody       = 4.6;
    l.lhSmall      = 4.2;
    l.lhSection    = 5;
    l.marginX      = 10;
    l.marginTop    = 9;
    l.marginBot    = 9;
    l.fsBody       = Math.max(8.5, l.fsBody * ratio);
    l.fsSmall      = Math.max(8,   l.fsSmall * ratio);
    l.fsContact    = Math.max(7.5, l.fsContact * ratio);
  }

  return l;
}

// ─── CURSOR ──────────────────────────────────────────────────────────────────
class Cursor {
  y: number;
  constructor(public pdf: jsPDF, public l: Layout) {
    this.y = l.marginTop;
  }
  need(h: number) {
    if (this.y + h > PAGE_H - this.l.marginBot) {
      this.pdf.addPage();
      this.y = this.l.marginTop;
    }
  }
}

// ─── DRAW HELPERS ─────────────────────────────────────────────────────────────

function drawSectionHead(cur: Cursor, title: string) {
  const { pdf, l } = cur;
  cur.need(l.lhSection + 2);
  pdf.setFont("times", "bold");
  pdf.setFontSize(l.fsSection);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title.toUpperCase(), l.marginX, cur.y);
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.25);
  pdf.line(l.marginX, cur.y + 1.2, PAGE_W - l.marginX, cur.y + 1.2);
  cur.y += l.lhSection;
}

function drawTwoCol(
  cur: Cursor,
  left: string, right: string,
  leftBold: boolean,
  fs: number,
  leftGray = false,
) {
  const { pdf, l } = cur;
  cur.need(l.lhBody + 1);
  pdf.setFontSize(fs);
  pdf.setFont("times", leftBold ? "bold" : "normal");
  pdf.setTextColor(leftGray ? 70 : 0, leftGray ? 70 : 0, leftGray ? 70 : 0);
  // Truncate left if too long to avoid overlap
  const rightW  = pdf.getTextWidth(right);
  const maxLeft = cw(l) - rightW - 4;
  let leftText  = left;
  while (leftText.length > 4 && pdf.getTextWidth(leftText) > maxLeft) {
    leftText = leftText.slice(0, -1);
  }
  pdf.text(leftText, l.marginX, cur.y);
  pdf.setFont("times", "normal");
  pdf.setTextColor(80, 80, 80);
  pdf.text(right, PAGE_W - l.marginX, cur.y, { align: "right" });
  cur.y += l.lhBody;
}

// Draw "Label: value" where label is bold and value wraps naturally
function drawSkillLine(cur: Cursor, label: string, value: string) {
  const { pdf, l } = cur;
  pdf.setFont("times", "bold");
  pdf.setFontSize(l.fsBody);
  const labelW = pdf.getTextWidth(label);

  pdf.setFont("times", "normal");
  // Wrap the value across available width. First line is shorter (label takes some space).
  const firstLineW = cw(l) - labelW;
  const allLines   = pdf.splitTextToSize(value, cw(l)) as string[];

  // Reflow: first line gets firstLineW, rest get full cw
  // Simple approach: split by first line that fits in firstLineW, rest wrap to full cw
  const words = value.split(" ");
  let firstLine = "";
  let rest = "";
  for (let i = 0; i < words.length; i++) {
    const test = firstLine ? firstLine + " " + words[i] : words[i];
    if (pdf.getTextWidth(test) <= firstLineW) {
      firstLine = test;
    } else {
      rest = words.slice(i).join(" ");
      break;
    }
  }
  if (!rest && firstLine === "") firstLine = value; // all fits

  const restLines = rest ? (pdf.splitTextToSize(rest, cw(l)) as string[]) : [];
  const totalLines = 1 + restLines.length;

  cur.need(l.lhBody * totalLines);

  // Draw label
  pdf.setFont("times", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(label, l.marginX, cur.y);

  // Draw first value segment on same line
  pdf.setFont("times", "normal");
  pdf.text(firstLine, l.marginX + labelW, cur.y);
  cur.y += l.lhBody;

  // Draw continuation lines (full width, no label indent)
  restLines.forEach(line => {
    cur.need(l.lhBody);
    pdf.text(line, l.marginX, cur.y);
    cur.y += l.lhBody;
  });
}

// Draw bullet with inline **bold** support and proper wrapping
function drawBullet(cur: Cursor, text: string) {
  const { pdf, l } = cur;
  const bullet    = "\u2022 ";
  const bx        = l.marginX + l.bulletIndent;
  const textW     = cw(l) - l.bulletIndent - pdf.getTextWidth(bullet);

  pdf.setFont("times", "normal");
  pdf.setFontSize(l.fsBody);
  const cleanText = plain(text);
  const lines     = pdf.splitTextToSize(cleanText, textW) as string[];

  cur.need(l.lhBody * lines.length);

  // Bullet character on first line only
  pdf.setTextColor(0, 0, 0);
  pdf.text(bullet, l.marginX + l.bulletIndent - pdf.getTextWidth(bullet), cur.y);

  lines.forEach((line, idx) => {
    if (idx > 0) cur.need(l.lhBody);
    // Re-apply inline bold for the line
    drawInlineBold(cur, line, bx);
    cur.y += l.lhBody;
  });
}

function drawInlineBold(cur: Cursor, text: string, startX: number) {
  const { pdf, l } = cur;
  // Check if the original text had **bold** — if not, just draw plain
  // (We already stripped bold for wrapping; here we just draw plain)
  pdf.setFont("times", "normal");
  pdf.setFontSize(l.fsBody);
  pdf.setTextColor(0, 0, 0);
  pdf.text(text, startX, cur.y);
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function generateResumePdf(resumeData: ResumeData): Promise<void> {
  // Pre-load icons before PDF construction
  const icons = await preloadIcons();
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Two-pass: fit layout to content
  const l   = fitLayout(pdf, resumeData);
  const cur = new Cursor(pdf, l);

  const { personalInfo: pi, summary, experiences, projects,
          education, skillCategories } = resumeData;
  const { explicitCerts, certsFromAch, nonCertAch } = splitCerts(resumeData);

  // ── NAME ──────────────────────────────────────────────────────────────────
  pdf.setFont("times", "bold");
  pdf.setFontSize(l.fsName);
  pdf.setTextColor(0, 0, 0);
  pdf.text((pi.fullName || "YOUR NAME").toUpperCase(), PAGE_W / 2, cur.y, { align: "center" });
  cur.y += l.lhName;

  // ── CONTACT BAR (with icons) ──────────────────────────────────────────────
  pdf.setFont("times", "normal");
  pdf.setFontSize(l.fsContact);
  pdf.setTextColor(30, 30, 30);

  // Icon size in mm (matches 13px in HTML at A4 scale)
  const ICON_MM   = 3.0;
  const ICON_GAP  = 1.0;   // mm between icon and its text
  const ITEM_SEP  = 3.5;   // mm between items

  // Build ordered contact items: { icon png, display text, url }
  interface ContactItem { png: string; text: string; url?: string; }
  const contactItems: ContactItem[] = [];
  if (pi.github) {
    const text = pi.github.replace(/^https?:\/\//, "");
    contactItems.push({ png: icons.github, text, url: pi.github.startsWith("http") ? pi.github : `https://${pi.github}` });
  }
  if (pi.phone)    contactItems.push({ png: icons.phone,    text: pi.phone });
  if (pi.linkedin) {
    const text = pi.linkedin.replace(/^https?:\/\//, "");
    contactItems.push({ png: icons.linkedin, text, url: pi.linkedin.startsWith("http") ? pi.linkedin : `https://${pi.linkedin}` });
  }
  if (pi.email)    contactItems.push({ png: icons.email,    text: pi.email,    url: `mailto:${pi.email}` });
  if (pi.location) contactItems.push({ png: icons.location, text: pi.location });

  // Measure total width of one contact row
  const itemWidths = contactItems.map(item => {
    pdf.setFontSize(l.fsContact);
    return ICON_MM + ICON_GAP + pdf.getTextWidth(item.text);
  });
  const totalContactW = itemWidths.reduce((s, w, i) =>
    s + w + (i < itemWidths.length - 1 ? ITEM_SEP : 0), 0);

  // If everything fits on one line → single centred row;
  // otherwise split into two rows (first 3 items, then rest)
  const rows: ContactItem[][] =
    totalContactW <= cw(l)
      ? [contactItems]
      : [contactItems.slice(0, Math.ceil(contactItems.length / 2)),
         contactItems.slice(Math.ceil(contactItems.length / 2))];

  rows.forEach(row => {
    // Measure row width
    const rowItemWidths = row.map(item => {
      pdf.setFontSize(l.fsContact);
      return ICON_MM + ICON_GAP + pdf.getTextWidth(item.text);
    });
    const rowW = rowItemWidths.reduce((s, w, i) =>
      s + w + (i < rowItemWidths.length - 1 ? ITEM_SEP : 0), 0);

    let cx = PAGE_W / 2 - rowW / 2;
    const rowY = cur.y;

    row.forEach((item, idx) => {
      const textW = pdf.getTextWidth(item.text);
      // Draw icon (vertically centred with the text cap-height)
      const iconTop = rowY - ICON_MM * 0.85;
      if (item.png) {
        try {
          pdf.addImage(item.png, "PNG", cx, iconTop, ICON_MM, ICON_MM);
        } catch { /* icon failed — skip silently */ }
      }
      // Draw text
      pdf.setFont("times", "normal");
      pdf.setFontSize(l.fsContact);
      pdf.setTextColor(30, 30, 30);
      pdf.text(item.text, cx + ICON_MM + ICON_GAP, rowY);
      // Clickable link
      if (item.url) {
        pdf.link(cx, iconTop, ICON_MM + ICON_GAP + textW, ICON_MM + 1, { url: item.url });
      }
      cx += rowItemWidths[idx] + ITEM_SEP;
    });

    cur.y += l.lhContact;
  });

  cur.y += l.gapSection * 0.5;

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (summary?.trim()) {
    drawSectionHead(cur, "PROFESSIONAL SUMMARY");
    pdf.setFont("times", "normal");
    pdf.setFontSize(l.fsBody);
    pdf.setTextColor(0, 0, 0);
    const lines = pdf.splitTextToSize(plain(summary), cw(l)) as string[];
    lines.forEach(line => {
      cur.need(l.lhBody);
      pdf.text(line, l.marginX, cur.y);
      cur.y += l.lhBody;
    });
    cur.y += l.gapSection;
  }

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  if (education?.length) {
    drawSectionHead(cur, "EDUCATION");
    education.forEach((edu, i) => {
      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" \u2013 ");
      drawTwoCol(cur, edu.institution, dateStr, true, l.fsBody);
      // Degree row
      cur.need(l.lhSmall);
      pdf.setFont("times", "italic");
      pdf.setFontSize(l.fsSmall);
      pdf.setTextColor(70, 70, 70);
      pdf.text(edu.degree, l.marginX, cur.y);
      if (edu.gpa) {
        pdf.setFont("times", "normal");
        pdf.text(edu.gpa, PAGE_W - l.marginX, cur.y, { align: "right" });
      }
      cur.y += l.lhSmall;
      if (i < education.length - 1) cur.y += l.gapEntry;
    });
    cur.y += l.gapSection;
  }

  // ── SKILLS ────────────────────────────────────────────────────────────────
  if (skillCategories?.length) {
    drawSectionHead(cur, "SKILLS");
    skillCategories.forEach(sk => {
      const deduped = dedupeSkills(sk.skills || "");
      if (deduped) drawSkillLine(cur, `${sk.category}: `, deduped);
    });
    cur.y += l.gapSection;
  }

  // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
  if (experiences?.length) {
    drawSectionHead(cur, "WORK EXPERIENCE");
    experiences.forEach((exp, i) => {
      const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" \u2013 ");
      drawTwoCol(cur, exp.company, dateStr, true, l.fsBody);
      // Role + location
      cur.need(l.lhSmall);
      pdf.setFont("times", "italic");
      pdf.setFontSize(l.fsSmall);
      pdf.setTextColor(70, 70, 70);
      pdf.text(exp.role, l.marginX, cur.y);
      if (exp.location) {
        pdf.setFont("times", "normal");
        pdf.text(exp.location, PAGE_W - l.marginX, cur.y, { align: "right" });
      }
      cur.y += l.lhSmall + 1;
      exp.bullets?.forEach(b => drawBullet(cur, b));
      if (i < experiences.length - 1) cur.y += l.gapEntry;
    });
    cur.y += l.gapSection;
  }

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  if (projects?.length) {
    drawSectionHead(cur, "PROJECTS");
    projects.forEach((proj, i) => {
      cur.need(l.lhBody + l.lhBody);
      pdf.setFont("times", "bold");
      pdf.setFontSize(l.fsBody);
      pdf.setTextColor(0, 0, 0);
      pdf.text(proj.title, l.marginX, cur.y);
      cur.y += l.lhBody;

      if (proj.techStack) {
        const { pdf: p, l: ly } = cur;
        const label = "Tech Stack: ";
        const value = proj.techStack;
        p.setFont("times", "bold");
        p.setFontSize(ly.fsBody);
        const lw = p.getTextWidth(label);
        const bullet = "\u2022 ";
        const bx = ly.marginX + ly.bulletIndent;
        p.text(bullet, ly.marginX + ly.bulletIndent - p.getTextWidth(bullet), cur.y);
        p.text(label, bx, cur.y);
        p.setFont("times", "normal");
        const tsLines = p.splitTextToSize(value, cw(ly) - ly.bulletIndent - lw) as string[];
        p.text(tsLines[0] || "", bx + lw, cur.y);
        cur.y += ly.lhBody;
        for (let j = 1; j < tsLines.length; j++) {
          cur.need(ly.lhBody);
          p.text(tsLines[j], bx, cur.y);
          cur.y += ly.lhBody;
        }
      }

      proj.bullets?.forEach(b => drawBullet(cur, b));
      if (i < projects.length - 1) cur.y += l.gapEntry;
    });
    cur.y += l.gapSection;
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  const certsToRender = explicitCerts.length ? explicitCerts : certsFromAch;
  if (certsToRender.length) {
    drawSectionHead(cur, "CERTIFICATIONS");
    certsToRender.forEach(cert => {
      const name   = "name" in cert ? (cert as any).name : (cert as any).title;
      const issuer = (cert as any).issuer;
      const label  = issuer ? `${name} \u2013 ${issuer}` : name;
      drawTwoCol(cur, label, cert.date || "", true, l.fsBody);
    });
    cur.y += l.gapSection;
  }

  // ── ACHIEVEMENTS ──────────────────────────────────────────────────────────
  if (nonCertAch.length) {
    drawSectionHead(cur, "ACHIEVEMENTS");
    nonCertAch.forEach((ach, i) => {
      drawTwoCol(cur, ach.title, ach.date || "", true, l.fsBody);
      if (ach.description) {
        pdf.setFont("times", "normal");
        pdf.setFontSize(l.fsSmall);
        pdf.setTextColor(70, 70, 70);
        const dlines = pdf.splitTextToSize(plain(ach.description), cw(l)) as string[];
        dlines.forEach(dl => {
          cur.need(l.lhSmall);
          pdf.text(dl, l.marginX, cur.y);
          cur.y += l.lhSmall;
        });
      }
      if (i < nonCertAch.length - 1) cur.y += l.gapEntry / 2;
    });
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const safeName = (pi.fullName || "Resume").trim().replace(/[^a-zA-Z0-9_-]+/g, "_");
  pdf.save(`${safeName}_Resume.pdf`);
}
