"use client";

import Link from "next/link";

interface LeadForgeLogoProps {
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
}

export default function LeadForgeLogo({ size = "md", showTag = true }: LeadForgeLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
      {/* Custom Vector Anvil & Ember Geometric Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#9A3412] p-2 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all group-hover:scale-105 border border-[#F97316]/30`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Anvil Base */}
          <path d="M4 17h16" />
          <path d="M6 17v-3l2-3h8l2 3v3" />
          <path d="M9 11V7h6v4" />
          {/* Ember Spark */}
          <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-baseline">
          <span className={`font-serif ${textSizes[size]} font-bold tracking-tight text-[#1C1917]`}>
            Lead
          </span>
          <span className={`font-serif ${textSizes[size]} font-bold tracking-tight text-[#C2410C]`}>
            Forge
          </span>
        </div>

        {showTag && (
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-[#F5F2EB] border border-[#E8E3D9] text-[#78716C] shadow-2xs">
            Studio
          </span>
        )}
      </div>
    </Link>
  );
}
