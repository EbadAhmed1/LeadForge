"use client";

import Link from "next/link";

interface LeadForgeLogoProps {
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
}

export default function LeadForgeLogo({ size = "md", showTag = true }: LeadForgeLogoProps) {
  const tileSizes = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="flex items-center gap-3 group shrink-0 select-none">
      {/* Option 3: Soft Ivory Tile with Cursive 'L' & Molten Flame SVG */}
      <div
        className={`${tileSizes[size]} rounded-2xl bg-[#FFFDF9] border border-[#E8E3D9] flex items-center justify-center shadow-xs group-hover:shadow-md transition-all group-hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#C2410C]"
        >
          <defs>
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
          </defs>
          {/* Cursive Stylized 'L' Loop */}
          <path
            d="M 10 20 C 8 16 12 10 18 12 C 24 14 18 28 14 34 C 10 40 18 42 24 38 C 28 35 22 28 18 30"
            stroke="url(#flameGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Molten Flame Element */}
          <path
            d="M 28 36 C 26 30 29 24 32 20 C 33 24 35 22 36 18 C 41 24 42 32 37 36 C 34 39 30 38 28 36 Z"
            fill="url(#flameGrad)"
          />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-serif ${titleSizes[size]} font-bold tracking-tight text-[#1C1917] group-hover:text-[#C2410C] transition-colors`}>
            LeadForge
          </span>
          {showTag && (
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#1C1917] text-white shadow-2xs">
              STUDIO
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#78716C] font-medium tracking-wide leading-tight mt-0.5">
          B2B SaaS Platform
        </span>
      </div>
    </Link>
  );
}
