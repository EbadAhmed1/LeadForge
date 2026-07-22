"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, Bookmark, CreditCard, LogOut, UserCheck, Sparkles } from "lucide-react";
import LeadForgeLogo from "@/components/LeadForgeLogo";

interface UserState {
  email?: string;
  name?: string;
  signedIn?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("leadforge_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.signedIn) {
            setUser(parsed);
            return;
          }
        }
      } catch (err) {
        console.error("Error parsing user session:", err);
      }
      setUser(null);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("leadforge_user");
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E3D9] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <LeadForgeLogo size="md" showTag={true} />

        {/* Streamlined Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-[#FFFFFF] text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <Search className={`w-4 h-4 ${pathname === "/" ? "text-[#C2410C]" : "text-[#78716C]"}`} />
            Lead Scraper Studio
          </Link>

          <Link
            href="/saved-leads"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/saved-leads"
                ? "bg-[#FFFFFF] text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${pathname === "/saved-leads" ? "text-[#C2410C]" : "text-[#78716C]"}`} />
            Saved Leads & Profile
          </Link>

          <Link
            href="/pricing"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/pricing"
                ? "bg-[#FFFFFF] text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <CreditCard className={`w-4 h-4 ${pathname === "/pricing" ? "text-[#C2410C]" : "text-[#78716C]"}`} />
            Pricing & Plans
          </Link>
        </nav>

        {/* Action Buttons & Auth State */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            /* Signed In User Profile Badge */
            <div className="flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E8E3D9] p-1.5 pr-3 rounded-xl shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#1C1917] leading-tight">
                  {user.name || "Alex Mercer"}
                </p>
                <p className="text-[10px] text-[#047857] font-medium flex items-center gap-0.5">
                  <UserCheck className="w-2.5 h-2.5" /> Pro Workspace
                </p>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="ml-2 p-1 text-[#78716C] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Guest / Not Signed In */
            <>
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] px-3 py-2 rounded-lg hover:bg-[#F5F2EB] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
