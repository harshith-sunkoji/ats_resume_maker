import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ResumeData } from "@/types/resume";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

const GENERATE_RESUME_SYSTEM_PROMPT = `
You are an expert AI Resume Writer, Technical Recruiter, and ATS Optimization Specialist.
Your job is to update and customize a candidate's Resume JSON object according to the user's specific prompt or instruction.

Follow these rules carefully:
1. Parse the user's prompt (e.g. "Tailor for Senior QA Engineer role", "Add Flutter and Playwright skills", "Rewrite summary to highlight cloud architecture", "Add metrics to work experience").
2. Update the candidate's Resume JSON according to the prompt while keeping standard ATS best practices:
   - personalInfo: Preserve candidate name, email, phone, location, linkedin, github unless explicitly requested to change.
   - summary: Write a concise 2-sentence professional summary. Must be under 30 words per sentence.
   - skillCategories: Add, update, or reorganize skill categories to include technologies requested.
   - experiences: Rewrite or append bullet points to incorporate relevant tools, methodologies, and quantitative metrics (% or $ or speed gains). Each bullet must be under 25 words.
   - projects: Update project titles, tech stacks, and bullet highlights to align with the prompt.
   - education, certifications, achievements: Preserve or update if specified.
3. Ensure high ATS keyword density, strong action verbs (e.g. Engineered, Architected, Developed, Optimized, Integrated), and clean categorization.
4. Output ONLY valid JSON matching the Resume JSON structure with NO markdown code block wrappers (no \`\`\`json).

CRITICAL CONTENT RULES — violating these causes automatic ATS rejection:
A. NO personal pronouns anywhere: never use I, me, my, we, our, myself. Write in third-person implicit style (e.g. "Developed..." not "I developed...").
B. NO AI buzzwords or clichés: never use highly effective, proven track record, adept at, expertise in, passionate about, results-driven, dynamic, innovative, leverage, seamless, robust, cutting-edge, synergy, game-changer, spearheaded, revolutionized, transformative, detail-oriented, team player, go-getter, think outside the box, value-added, proactive.
C. NO long or complex sentences: every sentence in summary and every bullet point must be clear, direct, and under 25 words. Split long thoughts into two bullets instead.
D. Use natural human language. Write as a professional would speak, not as an AI would generate.
E. DATE FORMATTING — always use ATS-preferred date formats for startDate and endDate fields:
   - Preferred: "Mar 2019", "March 2019", "03/2019", or "03/19"
   - For current positions: use "Present" (not "Till Date", "Current", "Ongoing", "Now")
   - Never use dots after month abbreviations: "Sep 2023" not "Sep. 2023"
   - Never use only a year when a month is known: "Sep 2023" not "2023"
   - Ensure startDate always comes before endDate chronologically.
`;


// ─── Date normalizer ────────────────────────────────────────────────────────
// Converts messy date strings into ATS-preferred "Mon YYYY" or "Present".
function normalizeDate(raw: string | undefined): string {
  if (!raw) return "";
  let d = raw.trim();

  // Normalise synonyms for "current position"
  if (/^(present|current|ongoing|now|till\s*date|to\s*date|today)$/i.test(d)) {
    return "Present";
  }

  // Remove trailing dots from 3-letter month abbreviations: "Sep. 2023" → "Sep 2023"
  d = d.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\./gi, "$1");

  return d;
}

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, resumeData } = (await req.json()) as {
      userPrompt: string;
      resumeData: ResumeData;
    };

    if (!userPrompt || !userPrompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a prompt describing how to update your resume." },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { success: false, error: "No resume data provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const contentsText = `
User Instruction / Prompt:
"""
${userPrompt.trim()}
"""

Current Resume JSON:
"""
${JSON.stringify(resumeData, null, 2)}
"""

Please modify the Resume JSON to satisfy the user's instruction and output the updated JSON.
`;

    let jsonText = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: GENERATE_RESUME_SYSTEM_PROMPT },
              { text: contentsText },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      jsonText = response.text || "";
    } catch (genAiError: any) {
      console.warn("Gemini 2.5 Flash call failed, calling fallback gemini-1.5-flash...", genAiError);

      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${GENERATE_RESUME_SYSTEM_PROMPT}\n\n${contentsText}` },
                ],
              },
            ],
          }),
        }
      );

      const restData = await restRes.json();
      jsonText = restData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    const updatedResumeData: ResumeData = JSON.parse(cleanJson);

    // Guarantee basic structure and fallback IDs
    updatedResumeData.experiences = (updatedResumeData.experiences || []).map((exp, idx) => ({
      ...exp,
      id: exp?.id || `exp-${idx + 1}`,
      bullets: exp?.bullets || [],
    }));

    updatedResumeData.projects = (updatedResumeData.projects || []).map((proj, idx) => ({
      ...proj,
      id: proj?.id || `proj-${idx + 1}`,
      bullets: proj?.bullets || [],
    }));

    updatedResumeData.skillCategories = (updatedResumeData.skillCategories || []).map((sk, idx) => ({
      ...sk,
      id: sk?.id || `skill-${idx + 1}`,
    }));

    // Normalise all date fields to ATS-preferred format
    updatedResumeData.experiences = updatedResumeData.experiences.map(exp => ({
      ...exp,
      startDate: normalizeDate(exp.startDate),
      endDate:   normalizeDate(exp.endDate),
    }));
    updatedResumeData.education = (updatedResumeData.education || []).map(edu => ({
      ...edu,
      startDate: normalizeDate(edu.startDate),
      endDate:   normalizeDate(edu.endDate),
    }));
    updatedResumeData.certifications = (updatedResumeData.certifications || []).map(cert => ({
      ...cert,
      date: normalizeDate(cert.date),
    }));
    updatedResumeData.achievements = (updatedResumeData.achievements || []).map(ach => ({
      ...ach,
      date: normalizeDate(ach.date),
    }));

    return NextResponse.json({
      success: true,
      updatedResumeData,
    });
  } catch (error: any) {
    console.error("Error generating resume from prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error while generating resume from prompt.",
      },
      { status: 500 }
    );
  }
}
