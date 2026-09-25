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

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
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
  isDemo?: boolean;
  personalInfo: PersonalInfo;
  summary?: string;
  skillCategories: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications?: Certification[];
  achievements: Achievement[];
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  isDemo: true,
  personalInfo: {
    fullName: "ALEX MORGAN",
    github: "github.com/alexmorgan",
    phone: "+1 (555) 019-2834",
    linkedin: "linkedin.com/in/alexmorgan",
    email: "alex.morgan@example.com",
    location: "San Francisco, CA",
  },
  summary: "Detail-oriented Quality Assurance Specialist & Software Engineer proficient in Java, Python, Dart, Next.js, Node.js, and Flutter. Experienced across the full Software Testing Life Cycle (STLC), automated testing with Playwright, API testing via Postman, and cloud deployment. Adept at bug tracking in Jira, regression testing, performance testing, and quality reporting with acute attention to detail.",
  skillCategories: [
    {
      id: "skill-1",
      category: "Languages",
      skills: "Java, Python, Dart, HTML, CSS, R, SQL",
    },
    {
      id: "skill-2",
      category: "Database",
      skills: "MongoDB, Firebase",
    },
    {
      id: "skill-3",
      category: "Frameworks / Libraries",
      skills: "Flutter, Next.js, Node.js",
    },
    {
      id: "skill-4",
      category: "Tools & Cloud",
      skills: "Git, GitBash, Jira, VS Code, Android Studio, Salesforce, Manual Testing, Automated Tests, Performance Testing, Infrastructure Testing, Cloud Deployment, Application Deployment Testing, Quality Assurance, STLC, Bug Life Cycle, Quality Reporting, Debugging, Attention to Detail, Playwright, Functional Testing, Regression Testing, Automation Testing, Postman, API Testing, Problem-Solving, Test Cases, Test Plans, Retest Bugs",
    },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Tech Solutions Inc.",
      role: "Quality Assurance Engineer & Full-Stack Developer",
      startDate: "Sep. 2023",
      endDate: "Present",
      location: "San Francisco, CA",
      bullets: [
        "Engineered and executed automated testing suites, test plans, and test cases using **Playwright**, **Python**, and **Java**, reducing regression testing duration by 40%.",
        "Conducted comprehensive **API testing** using **Postman**, functional testing, and manual testing for microservices built on **Node.js** and **Next.js**.",
        "Managed complete **Bug Life Cycle** and **STLC** processes in **Jira**, authoring quality reporting dashboards and retest bugs procedures with keen attention to detail.",
        "Executed **performance testing**, infrastructure testing, and **cloud deployment** validation on AWS and Firebase databases.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "AI Application Testing & Quality Assurance Hub",
      techStack: "Python, Playwright, Postman, Next.js, Node.js, MongoDB",
      bullets: [
        "Engineered an AI application testing suite for automated test cases, test plans, and real-time quality reporting using **Playwright** and **Postman**.",
        "Leveraged **MongoDB** for tracking bug lifecycles, retest bugs workflows, and automated test suite performance metrics.",
      ],
    },
    {
      id: "proj-2",
      title: "Cross-Platform Mobile App & Deployment Pipeline",
      techStack: "Flutter, Dart, Firebase, Git, GitBash, Android Studio, Jira",
      bullets: [
        "Architected cross-platform mobile application utilizing **Flutter**, **Dart**, and **Firebase** backend database services.",
        "Automated continuous integration and application deployment testing using **GitBash**, **VS Code**, and **Salesforce** integration endpoints.",
      ],
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
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner - Global AI & Web Hackathon",
      description: "Built an open-source real-time accessibility parsing engine competing against 300+ international teams.",
      date: "2024",
    },
  ],
};

export const isDemoResume = (data?: ResumeData | null): boolean => {
  if (!data) return false;
  if (data.isDemo === true) return true;
  return (
    data.personalInfo?.fullName?.trim().toUpperCase() === "ALEX MORGAN" ||
    data.personalInfo?.email === "alex.morgan@example.com"
  );
};


