"use client";

import React, { useState } from "react";
import { ResumeData, Experience, Project, Achievement, Education, SkillCategory } from "@/types/resume";
import { Plus, Trash2, User, Briefcase, FolderGit2, Trophy, GraduationCap, Wrench, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "projects" | "achievements" | "education" | "skills">("personal");

  // Helper updates
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // Experience handlers
  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...data.experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experiences: updated });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "Company Name",
      role: "Software Developer",
      startDate: "Jan 2024",
      endDate: "Present",
      location: "City, Country",
      bullets: ["Developed core features using modern frameworks."],
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const removeExperience = (index: number) => {
    const updated = data.experiences.filter((_, i) => i !== index);
    onChange({ ...data, experiences: updated });
  };

  const addExperienceBullet = (expIndex: number) => {
    const updated = [...data.experiences];
    updated[expIndex].bullets.push("New achievement or key metric statement");
    onChange({ ...data, experiences: updated });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const updated = [...data.experiences];
    updated[expIndex].bullets[bulletIndex] = val;
    onChange({ ...data, experiences: updated });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...data.experiences];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange({ ...data, experiences: updated });
  };

  // Projects handlers
  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "New Project Title",
      techStack: "Next.js, TypeScript, Tailwind CSS",
      bullets: ["Designed and implemented full-stack web application."],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const removeProject = (index: number) => {
    const updated = data.projects.filter((_, i) => i !== index);
    onChange({ ...data, projects: updated });
  };

  const addProjectBullet = (projIndex: number) => {
    const updated = [...data.projects];
    updated[projIndex].bullets.push("Key feature detail or technical milestone");
    onChange({ ...data, projects: updated });
  };

  const updateProjectBullet = (projIndex: number, bulletIndex: number, val: string) => {
    const updated = [...data.projects];
    updated[projIndex].bullets[bulletIndex] = val;
    onChange({ ...data, projects: updated });
  };

  const removeProjectBullet = (projIndex: number, bulletIndex: number) => {
    const updated = [...data.projects];
    updated[projIndex].bullets = updated[projIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange({ ...data, projects: updated });
  };

  // Achievements handlers
  const updateAchievement = (index: number, field: keyof Achievement, value: any) => {
    const updated = [...(data.achievements || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, achievements: updated });
  };

  const addAchievement = () => {
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: "Title of Award or Certification",
      description: "Details regarding the achievement, competition rank, or credential.",
      date: "2024",
    };
    onChange({ ...data, achievements: [...(data.achievements || []), newAch] });
  };

  const removeAchievement = (index: number) => {
    const updated = (data.achievements || []).filter((_, i) => i !== index);
    onChange({ ...data, achievements: updated });
  };

  // Education handlers
  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, education: updated });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: "University Name",
      degree: "B.Tech Computer Science",
      startDate: "2020",
      endDate: "2024",
      gpa: "CGPA: 8.5",
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    const updated = data.education.filter((_, i) => i !== index);
    onChange({ ...data, education: updated });
  };

  // Skills handlers
  const updateSkillCategory = (index: number, field: keyof SkillCategory, value: string) => {
    const updated = [...data.skillCategories];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, skillCategories: updated });
  };

  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: "Tools & Cloud",
      skills: "Docker, AWS, Git",
    };
    onChange({ ...data, skillCategories: [...data.skillCategories, newCat] });
  };

  const removeSkillCategory = (index: number) => {
    const updated = data.skillCategories.filter((_, i) => i !== index);
    onChange({ ...data, skillCategories: updated });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Editor Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "personal"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Personal Info
        </button>

        <button
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "experience"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Experience ({(data.experiences || []).length})
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "projects"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          Projects ({(data.projects || []).length})
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "achievements"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Achievements ({(data.achievements || []).length})
        </button>

        <button
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "education"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Education ({(data.education || []).length})
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "skills"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Skills ({(data.skillCategories || []).length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {/* PERSONAL INFO TAB */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Header & Contact Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Full Name (Centered Bold Title)
                </label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. ALEX MORGAN"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.github || ""}
                  onChange={(e) => updatePersonalInfo("github", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="github.com/username"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={data.personalInfo.phone || ""}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin || ""}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={data.personalInfo.email || ""}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={data.personalInfo.location || ""}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Pune"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Work Experience
              </h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {(!data.experiences || data.experiences.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Work experience is optional. If you are a fresher or student, you can leave this empty.
                </p>
                <button
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>
            ) : (
              data.experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Experience #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeExperience(idx)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                      title="Remove experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Role / Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, "role", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="Sep. 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="Present"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(idx, "location", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="Pune"
                      />
                    </div>
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Bullet Points (Use **text** for bold keywords)
                      </label>
                      <button
                        onClick={() => addExperienceBullet(idx)}
                        className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet
                      </button>
                    </div>

                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-start text-xs">
                        <span className="mt-2 text-zinc-400 font-bold">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => removeExperienceBullet(idx, bIdx)}
                          className="text-zinc-400 hover:text-red-500 mt-2"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-600" /> Projects
              </h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(!data.projects || data.projects.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Projects and achievements are optional. You can leave this empty or add projects as needed.
                </p>
                <button
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>
            ) : (
              data.projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Project #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeProject(idx)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Tech Stack (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="Flutter, Next.js, Firebase, Razorpay"
                      />
                    </div>
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Project Highlights (Use **text** for bold keywords)
                      </label>
                      <button
                        onClick={() => addProjectBullet(idx)}
                        className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet
                      </button>
                    </div>

                    {(proj.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-start text-xs">
                        <span className="mt-2 text-zinc-400 font-bold">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateProjectBullet(idx, bIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => removeProjectBullet(idx, bIdx)}
                          className="text-zinc-400 hover:text-red-500 mt-2"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" /> Achievements & Certifications
              </h3>
              <button
                onClick={addAchievement}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Achievement
              </button>
            </div>

            {(!data.achievements || data.achievements.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Achievements & Certifications are optional. Click below to add an entry.
                </p>
                <button
                  onClick={addAchievement}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Achievement
                </button>
              </div>
            ) : (
              data.achievements.map((ach, idx) => (
                <div
                  key={ach.id}
                  className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Achievement #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeAchievement(idx)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                      title="Remove achievement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Title / Honor / Certification
                      </label>
                      <input
                        type="text"
                        value={ach.title}
                        onChange={(e) => updateAchievement(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                        placeholder="e.g. 1st Place Winner - National Hackathon"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Year / Date (Optional)
                      </label>
                      <input
                        type="text"
                        value={ach.date || ""}
                        onChange={(e) => updateAchievement(idx, "date", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        placeholder="2024"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Description / Key Details
                      </label>
                      <textarea
                        rows={2}
                        value={ach.description}
                        onChange={(e) => updateAchievement(idx, "description", e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Awarded top prize among 300+ participants for building a real-time parsing engine."
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Education
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {data.education.map((edu, idx) => (
              <div
                key={edu.id}
                className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Education #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeEducation(idx)}
                    className="text-red-500 hover:text-red-700 text-xs p-1"
                    title="Remove education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                      Institution / University Name
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                      Degree / Qualification
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      placeholder="Aug. 2020"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      placeholder="May 2025"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                      CGPA / Grade / Honor
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      placeholder="CGPA: 8.98"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" /> Categorized Skills
              </h3>
              <button
                onClick={addSkillCategory}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {data.skillCategories.map((sk, idx) => (
              <div
                key={sk.id}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={sk.category}
                    onChange={(e) => updateSkillCategory(idx, "category", e.target.value)}
                    className="font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-blue-500 px-1 py-0.5"
                    placeholder="Category Name (e.g. Languages)"
                  />
                  <button
                    onClick={() => removeSkillCategory(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove skill category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={sk.skills}
                    onChange={(e) => updateSkillCategory(idx, "skills", e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Java, Python, Dart, HTML, CSS, SQL"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
