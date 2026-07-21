"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, CheckCircle2, Building2, Target, Mail, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EB] border border-[#E8E3D9] text-xs font-semibold text-[#57534E] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
          LeadForge B2B Studio 2.0 Released
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1917] max-w-5xl mx-auto leading-[1.15]">
          Precision B2B Lead Intelligence & Automated Outreach Generation
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#57534E] max-w-3xl mx-auto leading-relaxed">
          LeadForge automatically scrapes target company domains, evaluates ICP fit against custom criteria, and drafts highly targeted outreach emails—zero fluffy AI gimmicks.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-base font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            Launch B2B Studio
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/icp-rules"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-base font-semibold rounded-xl transition-colors flex items-center justify-center"
          >
            Configure ICP Rules
          </Link>
        </div>

        {/* Product Preview Frame */}
        <div className="mt-16 md:mt-24 relative max-w-6xl mx-auto p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl shadow-xl">
          <div className="bg-[#FAF7F2] rounded-xl border border-[#E8E3D9] p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                </div>
                <span className="text-xs font-mono text-[#78716C]">leadforge.studio/dashboard</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-[#ECFDF5] text-[#047857] font-semibold border border-[#A7F3D0]">
                96% ICP Match Stream
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">Scraped Companies</p>
                <p className="font-serif text-2xl font-bold text-[#1C1917]">1,482</p>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">Qualified Leads</p>
                <p className="font-serif text-2xl font-bold text-[#C2410C]">348</p>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">Outreach Drafts</p>
                <p className="font-serif text-2xl font-bold text-[#1C1917]">294</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-[#F5F2EB] border-t border-b border-[#E8E3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              Built for Serious B2B Sales & Outbound Teams
            </h2>
            <p className="mt-4 text-[#57534E]">
              Every step of the lead discovery and qualification process is engineered for clarity and high conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                Automated Domain Scraping
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Extract tech stacks, company positioning, product offerings, and pain points directly from target websites.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                Custom ICP Fit Scoring
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Rank prospects with transparent 0–100 match ratings based on your target company size, stack, and buying signals.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                Personalized Cold Email Generator
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Generate tailored outreach drafts referencing real company pain points and decision-maker profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#FAF7F2] border-t border-[#E8E3D9] text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#C2410C] text-white flex items-center justify-center font-serif font-bold text-xs">
              L
            </div>
            <span className="font-serif font-bold text-sm text-[#1C1917]">LeadForge</span>
            <span>© 2026 LeadForge Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#1C1917]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1C1917]">Terms</Link>
            <Link href="/pricing" className="hover:text-[#1C1917]">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
