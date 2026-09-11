import { ResumeData } from "@/types/resume";

export interface AtsScoreResult {
  score: number; // 0-100%
  readabilityScore: number; // 0-10 scale (e.g. 10/10)
  grade: "Excellent (10/10)" | "Good (8/10)" | "Needs Improvement (6/10)" | "Poor (4/10)";
  color: string;
  badgeBg: string;
  checks: {
    category: "Readability" | "Contact Info" | "Experience" | "Projects" | "Skills" | "Education" | "Achievements";
    label: string;
    passed: boolean;
    points: number;
    maxPoints: number;
    tip?: string;
  }[];
}

export function calculateAtsScore(data: ResumeData): AtsScoreResult {
  const checks: AtsScoreResult["checks"] = [];

  // 1. ATS Readability & Structural Compliance (30 pts -> converted to 10/10 Readability Scale)
  const isSingleColumn = true; // Template is single-column ATS compliant
  checks.push({
    category: "Readability",
    label: "Single-Column ATS Structural Layout",
    passed: isSingleColumn,
    points: 10,
    maxPoints: 10,
    tip: "Single-column layout ensures 100% ATS parser compatibility.",
  });

  const hasSummary = Boolean(data.summary?.trim() || data.personalInfo.fullName);
  checks.push({
    category: "Readability",
    label: "Professional Summary & Clear Profile Header",
    passed: hasSummary,
    points: hasSummary ? 10 : 0,
    maxPoints: 10,
    tip: "Add a 2-3 sentence Professional Summary at the top of your resume.",
  });

  const hasStandardHeadings = Boolean(
    (data.education && data.education.length > 0) ||
      (data.experiences && data.experiences.length > 0) ||
      (data.skillCategories && data.skillCategories.length > 0)
  );
  checks.push({
    category: "Readability",
    label: "Standard Machine-Readable Section Headings",
    passed: hasStandardHeadings,
    points: hasStandardHeadings ? 10 : 0,
    maxPoints: 10,
    tip: "Use standard headings like EDUCATION, SKILLS, WORK EXPERIENCE, PROJECTS.",
  });

  // 2. Personal & Contact Info (20 pts)
  const hasName = Boolean(data.personalInfo.fullName?.trim());
  checks.push({
    category: "Contact Info",
    label: "Full Candidate Name Header",
    passed: hasName,
    points: hasName ? 5 : 0,
    maxPoints: 5,
    tip: "Add your full name clearly at the top.",
  });

  const hasEmail = Boolean(data.personalInfo.email?.trim());
  checks.push({
    category: "Contact Info",
    label: "Direct Email Contact Address",
    passed: hasEmail,
    points: hasEmail ? 5 : 0,
    maxPoints: 5,
    tip: "Provide a valid email address.",
  });

  const hasPhone = Boolean(data.personalInfo.phone?.trim());
  checks.push({
    category: "Contact Info",
    label: "Phone Contact Number",
    passed: hasPhone,
    points: hasPhone ? 5 : 0,
    maxPoints: 5,
    tip: "Include a direct phone number.",
  });

  const hasSocial = Boolean(data.personalInfo.linkedin?.trim() || data.personalInfo.github?.trim());
  checks.push({
    category: "Contact Info",
    label: "LinkedIn or GitHub Profile Links",
    passed: hasSocial,
    points: hasSocial ? 5 : 0,
    maxPoints: 5,
    tip: "Link your LinkedIn or GitHub profile.",
  });

  // 3. Education Section (15 pts) - EDUCATION FIRST
  const hasEducation = Boolean(
    data.education &&
      data.education.length > 0 &&
      data.education.some((e) => e.degree || e.institution)
  );
  checks.push({
    category: "Education",
    label: "Education History & Academic Degree",
    passed: hasEducation,
    points: hasEducation ? 15 : 0,
    maxPoints: 15,
    tip: "Include your degree, institution, and educational background.",
  });

  // 4. Skills Categorization (15 pts)
  const hasSkills = Boolean(data.skillCategories && data.skillCategories.length > 0);
  checks.push({
    category: "Skills",
    label: "Categorized Technical Skills Section",
    passed: hasSkills,
    points: hasSkills ? 7 : 0,
    maxPoints: 7,
    tip: "Group skills into categories (e.g. Languages, Database, Frameworks, Tools).",
  });

  let totalSkillsCount = 0;
  if (hasSkills) {
    const uniqueSkillsSet = new Set<string>();
    data.skillCategories.forEach((cat) => {
      if (cat.skills) {
        cat.skills.split(/[,;]/).forEach((s) => {
          const trimmed = s.trim().toLowerCase();
          if (trimmed.length > 0) {
            uniqueSkillsSet.add(trimmed);
          }
        });
      }
    });
    totalSkillsCount = uniqueSkillsSet.size;
  }

  const hasEnoughSkills = totalSkillsCount >= 6;
  checks.push({
    category: "Skills",
    label: "High Keyword Density (6+ skills)",
    passed: hasEnoughSkills,
    points: hasEnoughSkills ? 8 : totalSkillsCount >= 3 ? 4 : 0,
    maxPoints: 8,
    tip: "List at least 6-8 technical skills or tools for ATS keyword matching.",
  });

  // 5. Work Experience (10 pts)
  const hasExp = Boolean(data.experiences && data.experiences.length > 0);
  let totalBullets = 0;
  let quantBullets = 0;
  if (hasExp) {
    data.experiences.forEach((exp) => {
      if (exp.bullets) {
        totalBullets += exp.bullets.length;
        exp.bullets.forEach((b) => {
          if (/\d+%|\$\d+|\d+\+|\b(increased|reduced|improved|built|developed|led|managed|optimized|achieved)\b/i.test(b)) {
            quantBullets++;
          }
        });
      }
    });
  }

  checks.push({
    category: "Experience",
    label: "Work Experience / Accomplishment Bullets",
    passed: hasExp && totalBullets >= 2,
    points: hasExp ? (quantBullets > 0 ? 10 : 5) : 0,
    maxPoints: 10,
    tip: "Add detailed bullet points with measurable impact (e.g. 'Improved speed by 35%').",
  });

  // 6. Projects & Certifications/Achievements (10 pts)
  const hasProjects = Boolean(data.projects && data.projects.length > 0);
  checks.push({
    category: "Projects",
    label: "Key Technical Projects or Accomplishments",
    passed: hasProjects,
    points: hasProjects ? 10 : 0,
    maxPoints: 10,
    tip: "Add technical projects highlighting technologies used.",
  });

  // Calculate Total Score (out of 100)
  const totalScore = checks.reduce((sum, item) => sum + item.points, 0);

  // Calculate Readability Score out of 10 (e.g. 10/10)
  const readabilityPoints = checks
    .filter((c) => c.category === "Readability" || c.category === "Contact Info" || c.category === "Education")
    .reduce((sum, item) => sum + item.points, 0);
  const maxReadabilityPoints = checks
    .filter((c) => c.category === "Readability" || c.category === "Contact Info" || c.category === "Education")
    .reduce((sum, item) => sum + item.maxPoints, 0);

  const readabilityScore = Math.min(10, Math.max(1, Math.round((readabilityPoints / maxReadabilityPoints) * 10)));

  let grade: AtsScoreResult["grade"] = "Needs Improvement (6/10)";
  let color = "text-amber-500";
  let badgeBg = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";

  if (totalScore >= 85 || readabilityScore >= 9) {
    grade = "Excellent (10/10)";
    color = "text-emerald-500";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  } else if (totalScore >= 70 || readabilityScore >= 7) {
    grade = "Good (8/10)";
    color = "text-blue-500";
    badgeBg = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
  } else if (totalScore < 50) {
    grade = "Poor (4/10)";
    color = "text-rose-500";
    badgeBg = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
  }

  return {
    score: totalScore,
    readabilityScore: totalScore >= 80 ? 10 : Math.max(8, readabilityScore),
    grade,
    color,
    badgeBg,
    checks,
  };
}
