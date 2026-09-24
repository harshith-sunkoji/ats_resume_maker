"use client";

import React from "react";
import { Mail, Sparkles } from "lucide-react";

export const MarqueeNotice: React.FC = () => {
  return (
    <div className="no-print w-full bg-gradient-to-r from-zinc-950 via-blue-950 to-zinc-950 text-blue-100 text-xs py-1.5 px-4 border-b border-zinc-800/80 overflow-hidden relative shadow-inner">
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track {
          display: inline-flex;
          white-space: nowrap;
          animation: scrollMarquee 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="w-full max-w-[1920px] mx-auto overflow-hidden relative">
        <div className="marquee-track flex items-center text-[11px] md:text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 mx-8">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>For any queries contact:</span>
            <a
              href="mailto:resumeint.yo@gmail.com"
              className="font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 transition-colors"
            >
              resumeint.yo@gmail.com
            </a>
          </span>
          <span className="inline-flex items-center gap-1.5 mx-8 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Day Offer — Get your ATS Optimized Resume PDF for only ₹9</span>
          </span>
          <span className="inline-flex items-center gap-1.5 mx-8">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>For any queries contact:</span>
            <a
              href="mailto:resumeint.yo@gmail.com"
              className="font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200 transition-colors"
            >
              resumeint.yo@gmail.com
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
