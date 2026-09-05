import { ResumeData } from "@/types/resume";

export interface AtsScoreResult {
  score: number;
  grade: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  color: string; // Tailwind color class or hex
  badgeBg: string;
  checks: {
    category: string;
    label: string;
    passed: boolean;
    points: number;
    maxPoints: number;
    tip?: string;
  }[];
}

export function calculateAtsScore(data: ResumeData): AtsScoreResult {
  const checks: AtsScoreResult["checks"] = [];

  // 1. Personal & Contact Info (20 pts)
  const hasName = Boolean(data.personalInfo.fullName?.trim());
  checks.push({
    category: "Contact Info",
    label: "Full Candidate Name",
    passed: hasName,
    points: hasName ? 5 : 0,
    maxPoints: 5,
    tip: "Add your full name clearly at the top.",
  });

  const hasEmail = Boolean(data.personalInfo.email?.trim());
  checks.push({
    category: "Contact Info",
    label: "Professional Email Address",
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
    label: "LinkedIn or GitHub Profile",
    passed: hasSocial,
    points: hasSocial ? 5 : 0,
    maxPoints: 5,
    tip: "Link your LinkedIn or GitHub profile.",
  });

  // 2. Experience Section (25 pts)
  const hasExp = Boolean(data.experiences && data.experiences.length > 0);
  checks.push({
    category: "Experience",
    label: "Work Experience Section Included",
    passed: hasExp,
    points: hasExp ? 5 : 0,
    maxPoints: 5,
    tip: "Add at least one relevant work experience.",
  });

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

  const hasGoodBullets = totalBullets >= 3;
  checks.push({
    category: "Experience",
    label: "Detailed Accomplishment Bullet Points (3+)",
    passed: hasGoodBullets,
    points: hasGoodBullets ? 10 : totalBullets > 0 ? 5 : 0,
    maxPoints: 10,
    tip: "Add 3 or more detailed bullet points detailing your work responsibilities.",
  });

  const hasQuantImpact = quantBullets >= 2;
  checks.push({
    category: "Experience",
    label: "Measurable Impact & Metrics (% or $ or key action verbs)",
    passed: hasQuantImpact,
    points: hasQuantImpact ? 10 : quantBullets > 0 ? 5 : 0,
    maxPoints: 10,
    tip: "Include quantifiable achievements (e.g. 'Improved speed by 35%').",
  });

  // 3. Projects Section (20 pts)
  const hasProjects = Boolean(data.projects && data.projects.length > 0);
  checks.push({
    category: "Projects",
    label: "Key Technical Projects Included",
    passed: hasProjects,
    points: hasProjects ? 10 : 0,
    maxPoints: 10,
    tip: "Add notable projects showcasing your technical execution.",
  });

  const hasTechStack = Boolean(
    hasProjects && data.projects.some((p) => p.techStack && p.techStack.trim().length > 0)
  );
  checks.push({
    category: "Projects",
    label: "Tech Stack Specified for Projects",
    passed: hasTechStack,
    points: hasTechStack ? 10 : 0,
    maxPoints: 10,
    tip: "Specify technologies used in each project (e.g. React, Node, PostgreSQL).",
  });

  // 4. Skills Categorization (20 pts)
  const hasSkills = Boolean(data.skillCategories && data.skillCategories.length > 0);
  checks.push({
    category: "Skills",
    label: "Categorized Technical Skills Section",
    passed: hasSkills,
    points: hasSkills ? 10 : 0,
    maxPoints: 10,
    tip: "Group skills into categories (e.g. Languages, Frameworks, Tools).",
  });

  let totalSkillsCount = 0;
  if (hasSkills) {
    data.skillCategories.forEach((cat) => {
      if (cat.skills) {
        totalSkillsCount += cat.skills.split(/[,;]/).filter((s) => s.trim().length > 0).length;
      }
    });
  }

  const hasEnoughSkills = totalSkillsCount >= 8;
  checks.push({
    category: "Skills",
    label: "Comprehensive Keyword Density (8+ skills)",
    passed: hasEnoughSkills,
    points: hasEnoughSkills ? 10 : totalSkillsCount >= 4 ? 5 : 0,
    maxPoints: 10,
    tip: "List at least 8 relevant technical skills or tools for ATS keyword parsing.",
  });

  // 5. Education & Achievements (15 pts)
  const hasEducation = Boolean(
    data.education &&
      data.education.length > 0 &&
      data.education.some((e) => e.degree || e.institution)
  );
  checks.push({
    category: "Education",
    label: "Education History & Degree",
    passed: hasEducation,
    points: hasEducation ? 10 : 0,
    maxPoints: 10,
    tip: "Include your degree and educational background.",
  });

  const hasAchievements = Boolean(data.achievements && data.achievements.length > 0);
  checks.push({
    category: "Achievements",
    label: "Certifications or Achievements",
    passed: hasAchievements,
    points: hasAchievements ? 5 : 0,
    maxPoints: 5,
    tip: "Add certifications, awards, or hackathon achievements.",
  });

  // Calculate Total
  const totalScore = checks.reduce((sum, item) => sum + item.points, 0);

  let grade: AtsScoreResult["grade"] = "Needs Improvement";
  let color = "text-amber-500";
  let badgeBg = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";

  if (totalScore >= 88) {
    grade = "Excellent";
    color = "text-emerald-500";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  } else if (totalScore >= 75) {
    grade = "Good";
    color = "text-blue-500";
    badgeBg = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
  } else if (totalScore < 50) {
    grade = "Poor";
    color = "text-rose-500";
    badgeBg = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
  }

  return {
    score: totalScore,
    grade,
    color,
    badgeBg,
    checks,
  };
}
