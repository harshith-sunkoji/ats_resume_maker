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
   - summary: Update 2-3 sentence professional summary to reflect the target role/skills specified in prompt.
   - skillCategories: Add, update, or reorganize skill categories to include technologies requested.
   - experiences: Rewrite or append bullet points to incorporate relevant tools, methodologies, and quantitative metrics (% or $ or speed gains).
   - projects: Update project titles, tech stacks, and bullet highlights to align with the prompt.
   - education, certifications, achievements: Preserve or update if specified.
3. Ensure high ATS keyword density, strong action verbs (e.g. Engineered, Architected, Developed, Optimized, Integrated), and clean categorization.
4. Output ONLY valid JSON matching the Resume JSON structure with NO markdown code block wrappers (no \`\`\`json).
`;

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
