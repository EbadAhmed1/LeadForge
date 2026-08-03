"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bookmark, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [scrapeCount, setScrapeCount] = useState<number>(0);
  const { user } = useAuth();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const userKey = user?.id ?? "guest";
    const loadScrapes = () => {
      try {
        const savedCount = localStorage.getItem(`leadforge_scrapes_${userKey}`);
        if (savedCount !== null) {
          setScrapeCount(parseInt(savedCount, 10) || 0);
        } else {
          localStorage.setItem(`leadforge_scrapes_${userKey}`, "0");
          setScrapeCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadScrapes();
    window.addEventListener("leadforge_scrape_updated", loadScrapes);
    return () => window.removeEventListener("leadforge_scrape_updated", loadScrapes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const navItems = [
    { name: "Lead Scraper Studio", href: "/studio", icon: Search },
    { name: "Saved Leads & Profile", href: "/saved-leads", icon: Bookmark },
    { name: "Pricing & Plans", href: "/pricing", icon: CreditCard },
  ];

  const MAX_SCRAPES = 500;
  const progressPercent = Math.min(100, Math.round((scrapeCount / MAX_SCRAPES) * 100));

  return (
    <aside className="w-64 border-r border-[#E8E3D9] bg-[#FAF7F2] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* User Profile Card matching Option 4 Avatar Badge */}
        <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#C2410C] to-[#F59E0B] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1C1917] truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-[#57534E] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse shrink-0" />
              Basic Workspace
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider font-semibold text-[#78716C] mb-2">
            MAIN WORKSPACE
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#FFFFFF] text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C2410C]" : "text-[#78716C]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Quota Summary */}
      <div className="pt-4 border-t border-[#E8E3D9]">
        <div className="p-3 bg-[#F5F2EB] rounded-xl border border-[#E8E3D9] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#57534E]">
            <span>Monthly Scrapes</span>
            <span className="font-semibold text-[#1C1917]">
              {scrapeCount} / {MAX_SCRAPES}
            </span>
          </div>
          <div className="w-full bg-[#E8E3D9] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C2410C] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 2)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
