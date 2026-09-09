import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ResumeData } from "@/types/resume";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

const RESUME_PROMPT_SYSTEM = `
You are an expert ATS (Applicant Tracking System) Resume Analyzer and Parser.
Your task is to analyze the uploaded resume document or text and extract structured JSON matching exact professional resume formatting.

Format the output strictly as JSON following this schema:
{
  "personalInfo": {
    "fullName": "Full Name",
    "github": "github.com/username or full URL",
    "phone": "+1 ...",
    "linkedin": "linkedin.com/in/username or full URL",
    "email": "user@example.com",
    "location": "City, Country or State"
  },
  "summary": "2-3 sentence professional summary highlighting technical experience, core competencies, and career focus.",
  "skillCategories": [
    {
      "id": "skill-1",
      "category": "Languages",
      "skills": "Java, Python, Dart, HTML, CSS, SQL"
    },
    {
      "id": "skill-2",
      "category": "Database",
      "skills": "MongoDB, Firebase"
    },
    {
      "id": "skill-3",
      "category": "Frameworks / Libraries",
      "skills": "Flutter, Next.js, Node.js"
    },
    {
      "id": "skill-4",
      "category": "Tools & Cloud",
      "skills": "Git, Docker, AWS, VS Code"
    }
  ],
  "experiences": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Sep. 2024",
      "endDate": "Present",
      "location": "City, State/Country",
      "bullets": [
        "Action verb statement with metrics or key achievements...",
        "Implemented key features..."
      ]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "Project Name",
      "techStack": "Flutter, Next.js, Firebase",
      "bullets": [
        "Key highlight describing the project...",
        "Backend / architecture details..."
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "University / Institute Name",
      "degree": "Degree / Field of study",
      "startDate": "Aug. 2020",
      "endDate": "May 2025",
      "gpa": "CGPA: 8.98 or GPA string"
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "2023"
    }
  ],
  "achievements": [
    {
      "id": "ach-1",
      "title": "Hackathon Winner / Academic Award Title",
      "description": "Details regarding the honor, rank, or award distinction",
      "date": "2024"
    }
  ]
}

Instructions:
1. Always generate a clear, compelling 2-3 sentence "summary" capturing technical strengths, core stack, and career background.
2. Group technical skills into clear categories like "Languages", "Database", "Frameworks / Libraries", "Tools & Cloud" with high keyword density (8+ skills total).
3. Ensure all work experience and project bullets start with strong ATS action verbs (e.g. Architected, Engineered, Developed, Optimized, Integrated) and include quantifiable metrics (% or $ or speed gains) where applicable.
4. Preserve exact dates, degrees, institution names, certifications, and candidate contact details.
5. Work Experience, Achievements, and Projects are DISTINCT sections. If a candidate has achievements/certifications/awards, place them in "certifications" or "achievements".
6. Output ONLY valid raw JSON with NO markdown code block wrappers (no \`\`\`json).
`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    let pdfText = "";
    let base64Pdf = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No PDF file uploaded." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      base64Pdf = buffer.toString("base64");

      // Polyfill DOMMatrix for Node.js pdf-parse if needed
      if (typeof globalThis.DOMMatrix === "undefined") {
        (globalThis as any).DOMMatrix = class DOMMatrix {};
      }

      // Extract text from PDF buffer if pdf-parse is available
      try {
        const pdfParseModule = require("pdf-parse");
        const parsedPdf = await pdfParseModule(buffer);
        pdfText = parsedPdf.text || "";
      } catch (err) {
        // Quiet non-critical warning; Gemini Flash processes base64 PDF directly
      }
    } else {
      const body = await req.json();
      pdfText = body.text || "";
    }

    if (!pdfText && !base64Pdf) {
      return NextResponse.json(
        { error: "Unable to read content from the uploaded resume file." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let jsonText = "";

    // Call Gemini API with PDF inline data or extracted text
    try {
      const contents: any[] = [];
      if (base64Pdf) {
        contents.push({
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf,
          },
        });
      }
      if (pdfText) {
        contents.push({
          text: `Resume Text:\n\n${pdfText}`,
        });
      }
      contents.push({
        text: RESUME_PROMPT_SYSTEM,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
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
                  ...(base64Pdf
                    ? [{ inline_data: { mime_type: "application/pdf", data: base64Pdf } }]
                    : []),
                  { text: pdfText ? `Resume Content:\n${pdfText}\n\n${RESUME_PROMPT_SYSTEM}` : RESUME_PROMPT_SYSTEM },
                ],
              },
            ],
          }),
        }
      );

      const restData = await restRes.json();
      jsonText = restData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Clean up JSON response
    let cleanJson = jsonText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    let parsedData: Partial<ResumeData>;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("JSON parse error from Gemini output:", cleanJson);
      return NextResponse.json(
        { error: "Failed to parse structured resume data from Gemini AI output." },
        { status: 500 }
      );
    }

    // Generate fallback IDs and guarantee arrays exist (experience/projects/achievements are optional)
    parsedData.experiences = (parsedData.experiences || []).map((exp, idx) => ({
      ...exp,
      id: exp?.id || `exp-${idx + 1}`,
      bullets: exp?.bullets || [],
    }));
    parsedData.projects = (parsedData.projects || []).map((proj, idx) => ({
      ...proj,
      id: proj?.id || `proj-${idx + 1}`,
      bullets: proj?.bullets || [],
    }));
    parsedData.achievements = (parsedData.achievements || []).map((ach, idx) => ({
      ...ach,
      id: ach?.id || `ach-${idx + 1}`,
      title: ach?.title || "",
      description: ach?.description || "",
    }));
    parsedData.education = (parsedData.education || []).map((edu, idx) => ({
      ...edu,
      id: edu?.id || `edu-${idx + 1}`,
    }));
    parsedData.certifications = (parsedData.certifications || []).map((cert, idx) => ({
      ...cert,
      id: cert?.id || `cert-${idx + 1}`,
      name: cert?.name || "",
    }));
    parsedData.skillCategories = (parsedData.skillCategories || []).map((sk, idx) => ({
      ...sk,
      id: sk?.id || `skill-${idx + 1}`,
    }));

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("API Route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error while processing resume." },
      { status: 500 }
    );
  }
}
