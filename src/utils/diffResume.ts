import { ResumeData } from "@/types/resume";

export interface ResumeDiff {
  hasChanges: boolean;
  totalChanges: number;
  summaryChanged: boolean;
  newSkills: Set<string>; // Lowercase trimmed skills that are new
  newTechStacks: Set<string>; // Lowercase trimmed tech stack words that are new
  changedExpBullets: Set<string>; // Exact bullet text that changed or is new
  changedProjBullets: Set<string>; // Exact bullet text that changed or is new
}

/**
 * Normalizes text for comparison by trimming and collapsing multiple whitespace.
 */
function normalize(str: string | undefined | null): string {
  return (str || "").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Extracts individual skills from a comma or semicolon separated string.
 */
function extractSkillTokens(skillsString: string): string[] {
  return skillsString
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Compares an original baseline ResumeData with the current ResumeData
 * to detect elements added or modified by AI.
 */
export function calculateResumeDiff(
  original: ResumeData | null | undefined,
  current: ResumeData | null | undefined
): ResumeDiff {
  const diff: ResumeDiff = {
    hasChanges: false,
    totalChanges: 0,
    summaryChanged: false,
    newSkills: new Set<string>(),
    newTechStacks: new Set<string>(),
    changedExpBullets: new Set<string>(),
    changedProjBullets: new Set<string>(),
  };

  if (!original || !current) {
    return diff;
  }

  // 1. Compare Summary
  if (
    current.summary &&
    normalize(current.summary) !== normalize(original.summary)
  ) {
    diff.summaryChanged = true;
    diff.totalChanges += 1;
  }

  // 2. Compare Skills
  const originalSkillTokens = new Set<string>();
  (original.skillCategories || []).forEach((cat) => {
    extractSkillTokens(cat.skills || "").forEach((s) => originalSkillTokens.add(s));
  });

  (current.skillCategories || []).forEach((cat) => {
    extractSkillTokens(cat.skills || "").forEach((s) => {
      if (!originalSkillTokens.has(s)) {
        diff.newSkills.add(s);
        diff.totalChanges += 1;
      }
    });
  });

  // 3. Compare Experience Bullets
  const originalExpBullets = new Set<string>();
  (original.experiences || []).forEach((exp) => {
    (exp.bullets || []).forEach((b) => originalExpBullets.add(normalize(b)));
  });

  (current.experiences || []).forEach((exp) => {
    (exp.bullets || []).forEach((b) => {
      const normB = normalize(b);
      if (normB && !originalExpBullets.has(normB)) {
        diff.changedExpBullets.add(b);
        diff.totalChanges += 1;
      }
    });
  });

  // 4. Compare Projects (Bullets & Tech Stack)
  const originalProjBullets = new Set<string>();
  const originalProjTechTokens = new Set<string>();
  (original.projects || []).forEach((proj) => {
    extractSkillTokens(proj.techStack || "").forEach((t) =>
      originalProjTechTokens.add(t)
    );
    (proj.bullets || []).forEach((b) => originalProjBullets.add(normalize(b)));
  });

  (current.projects || []).forEach((proj) => {
    extractSkillTokens(proj.techStack || "").forEach((t) => {
      if (!originalProjTechTokens.has(t)) {
        diff.newTechStacks.add(t);
        diff.totalChanges += 1;
      }
    });
    (proj.bullets || []).forEach((b) => {
      const normB = normalize(b);
      if (normB && !originalProjBullets.has(normB)) {
        diff.changedProjBullets.add(b);
        diff.totalChanges += 1;
      }
    });
  });

  diff.hasChanges = diff.totalChanges > 0;
  return diff;
}
