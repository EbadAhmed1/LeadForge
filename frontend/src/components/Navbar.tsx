"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, Compass, Target, CreditCard, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isDashboardRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/icp-rules") || pathname?.startsWith("/studio");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E3D9] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#C2410C] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs group-hover:bg-[#9A3412] transition-colors">
            L
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
              LeadForge
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#F5F2EB] border border-[#E8E3D9] text-[#78716C]">
              B2B Studio
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#features"
            className="px-3.5 py-1.5 text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB] rounded-md transition-colors"
          >
            Features
          </Link>
          <Link
            href="/icp-rules"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              pathname === "/icp-rules"
                ? "bg-[#F5F2EB] text-[#1C1917] font-semibold"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <Target className="w-4 h-4 text-[#C2410C]" />
            ICP Rules
          </Link>
          <Link
            href="/pricing"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              pathname === "/pricing"
                ? "bg-[#F5F2EB] text-[#1C1917] font-semibold"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#57534E]" />
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              isDashboardRoute
                ? "bg-[#F5F2EB] text-[#1C1917] font-semibold"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#57534E]" />
            Workspace
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] px-3 py-1.5 rounded-md hover:bg-[#F5F2EB] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Open Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
