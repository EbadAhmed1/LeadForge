"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Building2,
  Users,
  Mail,
  Settings,
  Plus,
  Search,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview Stream", href: "/dashboard", icon: LayoutDashboard },
    { name: "ICP Criteria", href: "/icp-rules", icon: Target },
    { name: "Target Domains", href: "/dashboard#target-companies", icon: Building2 },
    { name: "Qualified Leads", href: "/dashboard#qualified-leads", icon: Users },
    { name: "Outreach Studio", href: "/dashboard#outreach-studio", icon: Mail },
    { name: "Pricing & Plans", href: "/pricing", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#E8E3D9] bg-[#FAF7F2] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Workspace Switcher */}
        <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-sm font-bold text-[#C2410C]">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1917]">SaaS Growth Studio</p>
              <p className="text-[10px] text-[#78716C]">Acme Enterprise</p>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
          <input
            type="text"
            placeholder="⌘K Search target domains..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C] transition-colors"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider font-semibold text-[#78716C] mb-2">
            WORKSPACE NAVIGATION
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
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

      {/* Footer / Account status */}
      <div className="pt-4 border-t border-[#E8E3D9]">
        <div className="p-3 bg-[#F5F2EB] rounded-xl border border-[#E8E3D9] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#57534E]">
            <span>Monthly Scrapes</span>
            <span className="font-semibold text-[#1C1917]">482 / 1,000</span>
          </div>
          <div className="w-full bg-[#E8E3D9] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#C2410C] h-full rounded-full" style={{ width: "48%" }} />
          </div>
          <p className="text-[10px] text-[#78716C]">Resets in 12 days</p>
        </div>
      </div>
    </aside>
  );
}
