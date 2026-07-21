"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bookmark, CreditCard, UserCheck, Shield } from "lucide-react";

interface UserState {
  email?: string;
  name?: string;
  signedIn?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("leadforge_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.signedIn) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [pathname]);

  const navItems = [
    { name: "Lead Scraper Studio", href: "/", icon: Search },
    { name: "Saved Leads & Profile", href: "/saved-leads", icon: Bookmark },
    { name: "Pricing & Plans", href: "/pricing", icon: CreditCard },
  ];

  return (
    <aside className="w-64 border-r border-[#E8E3D9] bg-[#FAF7F2] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "L"}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1C1917]">
              {user?.name || "My Lead Profile"}
            </p>
            <p className="text-[10px] text-[#047857] font-medium flex items-center gap-0.5">
              <UserCheck className="w-2.5 h-2.5" /> Pro ICP Active
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
                    ? "bg-[#F5F2EB] text-[#1C1917] font-semibold border border-[#E8E3D9]"
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
            <span className="font-semibold text-[#1C1917]">48 / 500</span>
          </div>
          <div className="w-full bg-[#E8E3D9] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#C2410C] h-full rounded-full" style={{ width: "10%" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
