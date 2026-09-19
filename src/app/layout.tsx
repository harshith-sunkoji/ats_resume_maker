import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ATS Resume Maker",
  description: "AI-Powered ATS Resume Builder & Job Matcher",
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
      </head>
      <body className="min-h-full flex flex-col min-w-[1280px]">{children}</body>
    </html>
  );
}

