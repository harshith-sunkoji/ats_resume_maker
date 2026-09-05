export interface PersonalInfo {
  fullName: string;
  github?: string;
  phone?: string;
  linkedin?: string;
  email?: string;
  location?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface Project {
  id: string;
  title: string;
  techStack: string;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface SkillCategory {
  id: string;
  category: string; // e.g. "Languages", "Database", "Frameworks / Libraries", "Tools"
  skills: string; // comma separated string e.g. "Java, Python, Dart, HTML, CSS, R, SQL"
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
  skillCategories: SkillCategory[];
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "ALEX MORGAN",
    github: "github.com/alexmorgan",
    phone: "+1 (555) 019-2834",
    linkedin: "linkedin.com/in/alexmorgan",
    email: "alex.morgan@example.com",
    location: "San Francisco, CA",
  },
  experiences: [
    {
      id: "exp-1",
      company: "Tech Solutions Inc.",
      role: "Software Engineer",
      startDate: "Sep. 2023",
      endDate: "Present",
      location: "San Francisco, CA",
      bullets: [
        "Architected and maintained scalable web applications using React, Next.js, and Node.js.",
        "Integrated payment gateways and third-party APIs for automated workflow processing.",
        "Improved application loading performance by 35% through bundle optimization and efficient state management.",
        "Collaborated with cross-functional product teams to design modern, responsive user interfaces.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "E-Commerce & Inventory Management Platform",
      techStack: "Next.js, TypeScript, PostgreSQL, Tailwind CSS, Stripe",
      bullets: [
        "Engineered a full-stack e-commerce web platform featuring real-time inventory tracking and dynamic checkout flows.",
        "Built secure user authentication, order processing, and administrative dashboard management.",
      ],
    },
    {
      id: "proj-2",
      title: "AI-Powered Document Assistant",
      techStack: "Python, FastAPI, React, LLM API, Docker",
      bullets: [
        "Developed an intelligent document analysis tool leveraging LLMs for automated information extraction.",
        "Designed REST APIs and background task processors to handle document parsing efficiently.",
      ],
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner - Global AI & Web Hackathon",
      description: "Built an open-source real-time accessibility parsing engine competing against 300+ international teams.",
      date: "2024",
    },
    {
      id: "ach-2",
      title: "AWS Certified Solutions Architect",
      description: "Achieved professional cloud architecture certification with high honors.",
      date: "2023",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University of Technology",
      degree: "B.S. in Computer Science",
      startDate: "Aug. 2019",
      endDate: "May 2023",
      gpa: "GPA: 3.8 / 4.0",
    },
  ],
  skillCategories: [
    {
      id: "skill-1",
      category: "Languages",
      skills: "TypeScript, JavaScript, Python, Java, SQL, HTML/CSS",
    },
    {
      id: "skill-2",
      category: "Database",
      skills: "PostgreSQL, MongoDB, Redis",
    },
    {
      id: "skill-3",
      category: "Frameworks / Libraries",
      skills: "React, Next.js, Node.js, Express, Tailwind CSS",
    },
    {
      id: "skill-4",
      category: "Tools & Cloud",
      skills: "Git, Docker, AWS, VS Code, Vercel",
    },
  ],
};
