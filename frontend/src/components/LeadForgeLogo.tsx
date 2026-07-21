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
    <Link href="/" className="flex items-center gap-3 group shrink-0">
      {/* Custom Vector Anvil / Forge Flame Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#9A3412] p-2 flex items-center justify-center shadow-xs group-hover:shadow-md transition-all group-hover:scale-105`}
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
          {/* Anvil Base & Forge Flame */}
          <path d="M7 10h10l-1.5 8h-7z" fill="currentColor" fillOpacity="0.2" />
          <path d="M4 14h16v2H4z" />
          <path d="M8 14v4M16 14v4" />
          <path d="M12 4c-1.5 2-2.5 3.5-1 6 1.5 2.5 1 4-1 4" />
          <path d="M12 4c2 1.5 3 3.5 1.5 6C12 11.5 13 13 15 14" />
        </svg>
      </div>

      <div className="flex items-center">
        <span className={`font-serif ${textSizes[size]} font-bold tracking-tight text-[#1C1917] group-hover:text-[#C2410C] transition-colors`}>
          LeadForge
        </span>
        {showTag && (
          <span className="ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#F5F2EB] border border-[#E8E3D9] text-[#C2410C] shadow-2xs">
            B2B Studio
          </span>
        )}
      </div>
    </Link>
  );
}
