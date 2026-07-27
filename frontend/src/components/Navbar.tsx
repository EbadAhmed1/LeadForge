"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, Bookmark, CreditCard, Power, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
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
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E3D9] bg-[#FAF7F2]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="shrink-0 min-w-0">
          <LeadForgeLogo size="md" showTag={true} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            href="/studio"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              pathname === "/studio"
                ? "bg-[#FFFFFF] text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
            }`}
          >
            <Search className={`w-4 h-4 ${pathname === "/studio" ? "text-[#84CC16]" : "text-[#78716C]"}`} />
            Studio
          </Link>

          <Link
            href="/#method"
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F2EB]"
          >
            Method
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
            Saved Leads
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
            Pricing
          </Link>
        </nav>

        {/* Desktop Action Buttons & Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E8E3D9] p-1.5 pl-1.5 pr-2 rounded-full shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#C2410C] to-[#F59E0B] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "E"}
              </div>

              <span className="text-xs font-semibold text-[#1C1917] max-w-[140px] truncate">
                {user.name || user.email?.split("@")[0] || "ebadahmed200005"}
              </span>

              <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-pulse shrink-0" title="Active Basic Workspace" />

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 bg-[#FAF7F2] hover:bg-red-50 text-[#78716C] hover:text-red-600 border border-[#E8E3D9] rounded-full transition-colors ml-0.5 shrink-0"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] px-3 py-2 rounded-lg hover:bg-[#F5F2EB] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1C1917] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Start finding leads
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white border border-[#E8E3D9] text-[#1C1917] shadow-2xs hover:bg-[#F5F2EB] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E3D9] bg-[#FAF7F2] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/studio"
              className={`px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2.5 ${
                pathname === "/studio"
                  ? "bg-white text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                  : "text-[#57534E] hover:bg-[#F5F2EB]"
              }`}
            >
              <Search className="w-4 h-4 text-[#84CC16]" />
              Studio (AI Scraper)
            </Link>

            <Link
              href="/#method"
              className="px-3 py-2.5 text-sm font-medium text-[#57534E] hover:bg-[#F5F2EB] rounded-xl"
            >
              Method
            </Link>

            <Link
              href="/saved-leads"
              className={`px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2.5 ${
                pathname === "/saved-leads"
                  ? "bg-white text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                  : "text-[#57534E] hover:bg-[#F5F2EB]"
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#C2410C]" />
              Saved Leads Database
            </Link>

            <Link
              href="/pricing"
              className={`px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-2.5 ${
                pathname === "/pricing"
                  ? "bg-white text-[#1C1917] font-semibold border border-[#E8E3D9] shadow-2xs"
                  : "text-[#57534E] hover:bg-[#F5F2EB]"
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#C2410C]" />
              Pricing & Plans
            </Link>
          </nav>

          {/* Mobile User Profile / Auth Action */}
          <div className="pt-3 border-t border-[#E8E3D9]">
            {user ? (
              <div className="flex items-center justify-between p-3 bg-white border border-[#E8E3D9] rounded-xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#C2410C] to-[#F59E0B] text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "E"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1C1917] truncate max-w-[160px]">
                      {user.name || user.email?.split("@")[0] || "ebadahmed200005"}
                    </p>
                    <p className="text-[10px] text-[#57534E] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse" />
                      Basic Workspace
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/studio"
                  className="w-full text-center bg-[#84CC16] hover:bg-[#65A30D] text-[#1C1917] text-sm font-bold py-3 rounded-xl shadow-xs"
                >
                  Start finding leads
                </Link>
                <Link
                  href="/sign-in"
                  className="w-full text-center bg-white border border-[#E8E3D9] text-[#1C1917] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#F5F2EB]"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
