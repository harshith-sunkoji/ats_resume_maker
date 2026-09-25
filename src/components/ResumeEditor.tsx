"use client";

import React, { useState } from "react";
import { ResumeData, Experience, Project, Achievement, Education, SkillCategory, Certification, isDemoResume } from "@/types/resume";
import { Plus, Trash2, User, Briefcase, FolderGit2, Trophy, GraduationCap, Wrench, Award, FileText } from "lucide-react";

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<
    "personal" | "education" | "skills" | "experience" | "projects" | "certifications" | "achievements"
  >("personal");

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

  const updateSummary = (value: string) => {
    onChange({
      ...data,
      summary: value,
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

  // Certifications handlers
  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const updated = [...(data.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, certifications: updated });
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
    };
    onChange({ ...data, certifications: [...(data.certifications || []), newCert] });
  };

  const removeCertification = (index: number) => {
    const updated = (data.certifications || []).filter((_, i) => i !== index);
    onChange({ ...data, certifications: updated });
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
      title: "Title of Award or Achievement",
      description: "Details regarding the achievement or competition rank.",
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
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "personal"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          1. Header & Summary
        </button>

        <button
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "education"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          2. Education ({(data.education || []).length})
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "skills"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          3. Skills ({(data.skillCategories || []).length})
        </button>

        <button
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "experience"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          4. Experience ({(data.experiences || []).length})
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "projects"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          5. Projects ({(data.projects || []).length})
        </button>

        <button
          onClick={() => setActiveTab("certifications")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "certifications"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          6. Certifications ({(data.certifications || []).length})
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "achievements"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          7. Achievements ({(data.achievements || []).length})
        </button>
        </div>

        {isDemoResume(data) && (
          <div className="px-3 shrink-0">
            <span className="bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              DEMO
            </span>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {/* 1. PERSONAL INFO & SUMMARY TAB */}
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
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {/* Professional Summary Section */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Professional Summary
              </h3>
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  A concise 2-3 sentence overview of your technical background, years of experience, and key accomplishments.
                </label>
                <textarea
                  value={data.summary || ""}
                  onChange={(e) => updateSummary(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans"
                  placeholder="e.g. Results-driven Software Engineer with 4+ years of experience engineering scalable web applications..."
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. EDUCATION TAB */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Education
              </h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Education
              </button>
            </div>

            <div className="space-y-4">
              {(data.education || []).map((edu, index) => (
                <div
                  key={edu.id || index}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative"
                >
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Institution / University
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Degree & Major
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Aug. 2019"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="May 2023"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        GPA / Grade
                      </label>
                      <input
                        type="text"
                        value={edu.gpa || ""}
                        onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="GPA: 3.8 / 4.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" /> Technical Skills
              </h3>
              <button
                onClick={addSkillCategory}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>

            <div className="space-y-3">
              {(data.skillCategories || []).map((sk, index) => (
                <div
                  key={sk.id || index}
                  className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative group"
                >
                  <button
                    onClick={() => removeSkillCategory(index)}
                    className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={sk.category}
                        onChange={(e) => updateSkillCategory(index, "category", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. Languages / Databases"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Skills (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={sk.skills}
                        onChange={(e) => updateSkillCategory(index, "skills", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. Python, Java, TypeScript, SQL"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. WORK EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Work Experience
              </h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {(data.experiences || []).map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative"
                >
                  <button
                    onClick={() => removeExperience(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Job Title / Role
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(index, "role", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Sep. 2023"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Bullet Points & Accomplishments
                      </label>
                      <button
                        onClick={() => addExperienceBullet(index)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet
                      </button>
                    </div>

                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-zinc-400 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(index, bIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => removeExperienceBullet(index, bIdx)}
                          className="text-zinc-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-600" /> Key Projects
              </h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </button>
            </div>

            <div className="space-y-4">
              {(data.projects || []).map((proj, index) => (
                <div
                  key={proj.id || index}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative"
                >
                  <button
                    onClick={() => removeProject(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Tech Stack Used
                      </label>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => updateProject(index, "techStack", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Project Highlights & Details
                      </label>
                      <button
                        onClick={() => addProjectBullet(index)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Bullet
                      </button>
                    </div>

                    {proj.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-zinc-400 font-bold">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateProjectBullet(index, bIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => removeProjectBullet(index, bIdx)}
                          className="text-zinc-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CERTIFICATIONS TAB */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" /> Certifications
              </h3>
              <button
                onClick={addCertification}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Certification
              </button>
            </div>

            <div className="space-y-4">
              {(data.certifications || []).map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative"
                >
                  <button
                    onClick={() => removeCertification(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Certification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Certification Name
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. AWS Certified Solutions Architect"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Date / Year
                      </label>
                      <input
                        type="text"
                        value={cert.date || ""}
                        onChange={(e) => updateCertification(index, "date", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="2023"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Issuing Organization
                      </label>
                      <input
                        type="text"
                        value={cert.issuer || ""}
                        onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. Amazon Web Services"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. ACHIEVEMENTS TAB */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" /> Key Achievements & Honors
              </h3>
              <button
                onClick={addAchievement}
                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Achievement
              </button>
            </div>

            <div className="space-y-4">
              {(data.achievements || []).map((ach, index) => (
                <div
                  key={ach.id || index}
                  className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative"
                >
                  <button
                    onClick={() => removeAchievement(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Achievement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Achievement Title
                      </label>
                      <input
                        type="text"
                        value={ach.title}
                        onChange={(e) => updateAchievement(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Date / Year
                      </label>
                      <input
                        type="text"
                        value={ach.date || ""}
                        onChange={(e) => updateAchievement(index, "date", e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="2024"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                        Description / Details
                      </label>
                      <textarea
                        value={ach.description}
                        onChange={(e) => updateAchievement(index, "description", e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
