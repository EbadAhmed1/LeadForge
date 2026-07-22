"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, Play, CheckCircle2, Globe, Target, Mail, Building2, Zap, Shield, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left w-full">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EB] border border-[#E8E3D9] text-xs font-semibold text-[#57534E] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
          NOW FINDING LEADS FOR 1,200+ TEAMS
        </div>

        {/* Main Headline */}
        <div className="space-y-3 max-w-5xl">
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#1C1917]/90 leading-[1.05]">
            Stop guessing who to call next.
          </h1>
          <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-italic italic font-normal tracking-tight text-[#84CC16] leading-[1.05]">
            LeadForge finds them first.
          </h2>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-lg sm:text-xl text-[#57534E] max-w-2xl leading-relaxed font-normal">
          LeadForge reads intent signals across the web — hiring pages, funding news, tech-stack changes — and delivers a ranked list of who to reach out to this week.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 max-w-md">
          <Link
            href="/studio"
            className="w-full sm:w-auto px-7 py-4 bg-[#84CC16] hover:bg-[#65A30D] text-[#1C1917] text-base font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0"
          >
            Start finding leads
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/pricing"
            className="w-full sm:w-auto px-7 py-4 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-base font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-2xs"
          >
            <Play className="w-4 h-4 text-[#78716C]" />
            Watch 2-min demo
          </Link>
        </div>

        {/* Interactive Product Preview Mockup */}
        <div className="mt-16 md:mt-24 relative max-w-6xl mx-auto p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl shadow-xl">
          <div className="bg-[#FAF7F2] rounded-2xl border border-[#E8E3D9] p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                  <div className="w-3 h-3 rounded-full bg-[#E8E3D9]" />
                </div>
                <span className="text-xs font-mono text-[#78716C]">leadforge.studio/intent-stream</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#ECFDF5] text-[#047857] font-semibold border border-[#A7F3D0] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                Scraping Web Intent Signals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">Intent Signals Processed</p>
                <p className="font-serif text-3xl font-bold text-[#1C1917]">148,200+</p>
                <p className="text-[11px] text-[#047857] font-medium">+14.2% this week</p>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">ICP Matched Prospects</p>
                <p className="font-serif text-3xl font-bold text-[#C2410C]">348</p>
                <p className="text-[11px] text-[#78716C]">Filtered by your offering</p>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-1">
                <p className="text-xs text-[#78716C]">Outreach Drafts Generated</p>
                <p className="font-serif text-3xl font-bold text-[#1C1917]">294</p>
                <p className="text-[11px] text-[#78716C]">Ready for review & send</p>
              </div>
            </div>

            {/* Target Sample Lead Card */}
            <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-base font-bold text-[#C2410C]">
                  V
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-[#1C1917]">Vercel Inc.</h4>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                      96% ICP FIT
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C]">Detected Signals: Next.js Edge Network expansion, hiring VP of Engineering</p>
                </div>
              </div>

              <Link
                href="/studio"
                className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1C1917] text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1 shrink-0"
              >
                Inspect Lead in Studio
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Method Section */}
      <section id="method" className="py-20 bg-[#F5F2EB] border-t border-b border-[#E8E3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E3D9] text-xs font-semibold text-[#57534E]">
              The Method
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917]">
              How LeadForge Finds High-Intent Accounts
            </h2>
            <p className="text-[#57534E] text-base">
              Instead of buying static contact lists, LeadForge continuously monitors real web signals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                1. Web Intent Signal Scraping
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Scrapes target websites for tech stack changes, hiring signals, and architectural pain points.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                2. Offering & ICP Fit Scoring
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Scores prospects against your saved target industries, employee count range, and exact product offering.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E3D9] flex items-center justify-center text-[#C2410C]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                3. Automated Outreach Generation
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Drafts personalized cold emails referencing real company signals across Executive, Solution-First, and Challenger tones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#FAF7F2] text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1917]">
          Ready to stop guessing who to call next?
        </h2>
        <p className="text-base text-[#57534E]">
          Start finding high-intent B2B leads and generating outreach messages in minutes.
        </p>
        <div className="pt-4 flex justify-center">
          <Link
            href="/studio"
            className="px-8 py-4 bg-[#84CC16] hover:bg-[#65A30D] text-[#1C1917] text-base font-bold rounded-2xl shadow-md flex items-center gap-2"
          >
            Start finding leads now
            <ArrowRight className="w-5 h-5" />
          </Link>
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
