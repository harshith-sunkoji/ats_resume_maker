import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ats-resume-maker-one.vercel.app"
  ),
  title: {
    default: "Resumint.yo | AI Powered ATS Resume Builder & Job Matcher",
    template: "%s | Resumint.yo",
  },
  description:
    "Build high-scoring ATS-friendly resumes, analyze job descriptions, get keyword recommendations, and export instant ATS resumes with Resumint.yo.",
  keywords: [
    "Resumint.yo",
    "Resumint",
    "ATS Resume Builder",
    "AI Resume Maker",
    "Job Description Matcher",
    "ATS Score Checker",
    "Resume Optimizer",
    "AI Resume Generator",
    "Tech Resume Template",
  ],
  authors: [{ name: "Resumint.yo Team" }],
  creator: "Resumint.yo",
  publisher: "Resumint.yo",
  icons: {
    icon: "/website_logo.png",
    shortcut: "/website_logo.png",
    apple: "/website_logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Resumint.yo",
    title: "Resumint.yo | AI Powered ATS Resume Builder & Job Matcher",
    description:
      "Create top-tier ATS friendly resumes tailored to any job description. AI keyword optimization, score analysis, and instant PDF download.",
    images: [
      {
        url: "/website_logo.png",
        width: 1200,
        height: 630,
        alt: "Resumint.yo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumint.yo | AI Powered ATS Resume Builder",
    description:
      "Build ATS-friendly resumes with AI job match scoring and keyword optimization.",
    images: ["/website_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "1280",
  initialScale: 0.35,
  maximumScale: 3,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Resumint.yo",
    description:
      "AI-Powered ATS Resume Builder, Job Description Analyzer & Resume Match Score Optimizer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    image: "/website_logo.png",
    offers: {
      "@type": "Offer",
      price: "9.00",
      priceCurrency: "INR",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="viewport"
          content="width=1280, initial-scale=0.35, maximum-scale=3.0, user-scalable=yes"
        />
        <link rel="icon" href="/website_logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/website_logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col min-w-[1280px]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
