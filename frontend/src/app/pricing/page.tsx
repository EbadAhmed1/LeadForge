"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Check, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-[#F5F2EB] border border-[#E8E3D9] text-xs font-semibold text-[#57534E]">
            Simple & Transparent Pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1C1917]">
            Predictable Plans for Growing Outbound Teams
          </h1>
          <p className="text-base text-[#57534E]">
            Scale your B2B lead scraping, qualification scoring, and cold email outreach with zero hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1917]">Starter</h3>
                <p className="text-xs text-[#78716C] mt-1">Ideal for founders & early-stage sales</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-[#1C1917]">$49</span>
                <span className="text-xs text-[#78716C]">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57534E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> 500 Scraped Domains / mo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> 1 Custom ICP Criteria Set
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> AI Qualification Scoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Standard Email Drafts
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-colors text-center block"
            >
              Get Started with Starter
            </Link>
          </div>

          {/* Growth Plan (Highlighted) */}
          <div className="p-8 bg-[#FFFFFF] border-2 border-[#C2410C] rounded-2xl space-y-6 shadow-md relative flex flex-col justify-between">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C2410C] text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-2xs">
              Most Popular
            </span>
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1917]">Growth</h3>
                <p className="text-xs text-[#78716C] mt-1">For active outbound SDR teams</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-[#1C1917]">$149</span>
                <span className="text-xs text-[#78716C]">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57534E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> 2,500 Scraped Domains / mo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Unlimited ICP Rule Sets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Priority Arq Queue Processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Advanced Tone Workshop & Tokens
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Multi-Tenant Workspace Access
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors text-center block shadow-xs"
            >
              Start Growth Plan
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1917]">Enterprise</h3>
                <p className="text-xs text-[#78716C] mt-1">For large revenue organizations</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-bold text-[#1C1917]">Custom</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#57534E] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Custom Scraping Quotas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Dedicated Hetzner Infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> Custom CRM Integrations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047857]" /> SLA & Dedicated Support
                </li>
              </ul>
            </div>
            <Link
              href="mailto:sales@leadforge.studio"
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-colors text-center block"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
