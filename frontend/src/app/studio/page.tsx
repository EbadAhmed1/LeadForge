"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  Search,
  Building2,
  Check,
  Globe,
  Sliders,
  Send,
  Bookmark,
  Copy,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Target,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Briefcase,
  Users,
  Plus,
  X,
} from "lucide-react";

export default function LeadStudioPage() {
  // Saved User Profile / ICP State (Target Industries, Company Size Range, What We Are Offering)
  const [profile, setProfile] = useState({
    targetIndustries: ["B2B SaaS", "Cloud Infrastructure", "DevOps Tools"],
    minEmployees: 50,
    maxEmployees: 500,
    offering: "AI-powered cloud observability and automated performance monitoring platform that reduces latency and cloud infrastructure spend",
  });

  const [customIndustryInput, setCustomIndustryInput] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const availableIndustries = [
    "B2B SaaS",
    "Cloud Infrastructure",
    "DevOps Tools",
    "FinTech",
    "Cybersecurity",
    "AI Infrastructure",
    "Data Engineering",
    "E-commerce Logistics",
    "Healthcare Tech",
  ];

  const toggleIndustry = (ind: string) => {
    setProfile((prev) => {
      const exists = prev.targetIndustries.includes(ind);
      return {
        ...prev,
        targetIndustries: exists
          ? prev.targetIndustries.filter((i) => i !== ind)
          : [...prev.targetIndustries, ind],
      };
    });
  };

  const handleAddCustomIndustry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customIndustryInput.trim();
    if (trimmed && !profile.targetIndustries.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        targetIndustries: [...prev.targetIndustries, trimmed],
      }));
      setCustomIndustryInput("");
    }
  };

  // Scraper Input State
  const [targetDomain, setTargetDomain] = useState("vercel.com");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState<number>(0);
  const [selectedTone, setSelectedTone] = useState<"Executive" | "Solution-First" | "Challenger">("Solution-First");

  // Sample Domains for Quick 1-Click Testing
  const sampleDomains = [
    { label: "vercel.com", domain: "vercel.com" },
    { label: "stripe.com", domain: "stripe.com" },
    { label: "linear.app", domain: "linear.app" },
    { label: "supabase.com", domain: "supabase.com" },
    { label: "datadoghq.com", domain: "datadoghq.com" },
  ];

  // Scraped Lead Output Result State
  const [scrapedResult, setScrapedResult] = useState<{
    company_name: string;
    domain: string;
    score: number;
    reasoning: string;
    tech_stack: string[];
    pain_points: string[];
    decision_maker: string;
    email_subjects: Record<string, string>;
    email_bodies: Record<string, string>;
  } | null>({
    company_name: "Vercel Inc.",
    domain: "vercel.com",
    score: 96,
    reasoning: "High alignment with Cloud & Frontend Infrastructure ICP. Active deployment of Next.js edge networks and serverless middleware.",
    tech_stack: ["Next.js", "React", "TypeScript", "Vercel Edge Network", "AWS"],
    pain_points: [
      "Optimizing Serverless Cold Start Latency during traffic spikes",
      "Managing complex enterprise middleware routing rules",
    ],
    decision_maker: "VP of Engineering / Head of Developer Experience",
    email_subjects: {
      "Executive": "Executive Brief: Edge latency optimization for Vercel Enterprise",
      "Solution-First": "Streamlining Serverless Edge latency for Vercel Enterprise",
      "Challenger": "Are serverless cold starts bottlenecking Vercel's enterprise traffic?",
    },
    email_bodies: {
      "Executive": "Hi Sarah,\n\nI was following Vercel's latest Next.js release and noticed your team's focus on Edge middleware performance.\n\nOur solution helps teams diagnose and optimize high-concurrency Next.js serverless execution workflows without adding agent overhead.\n\nWould you be open to a 5-minute brief next Tuesday?",
      "Solution-First": "Hi Sarah,\n\nNoticed Vercel's recent push into enterprise edge deployment. Cold start latency during peak concurrency remains a key challenge for Next.js architectures.\n\nOur platform is specifically designed to compress cold starts by 40%.\n\nLet's connect for 5 minutes if this aligns with your Q3 priorities.",
      "Challenger": "Hi Sarah,\n\nMost cloud infrastructure teams lose up to 18% of peak conversions due to unoptimized serverless middleware latency.\n\nWe created a zero-overhead execution pipeline that guarantees low-latency edge routing.\n\nWorth a brief 5-minute chat?",
    },
  });

  const [leadSaved, setLeadSaved] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Handle Target Scrape Execution
  const handleRunScrape = (customDomain?: string) => {
    const domainToScrape = customDomain || targetDomain;
    if (!domainToScrape.trim()) return;

    setTargetDomain(domainToScrape);
    setIsScraping(true);
    setScrapeStep(1);

    setTimeout(() => setScrapeStep(2), 900);
    setTimeout(() => setScrapeStep(3), 1800);
    setTimeout(() => {
      setScrapeStep(4);
      setIsScraping(false);

      const cleanDomain = domainToScrape.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const brandName = cleanDomain.split(".")[0];
      const companyName = brandName.charAt(0).toUpperCase() + brandName.slice(1) + " Inc.";

      setScrapedResult({
        company_name: companyName,
        domain: cleanDomain,
        score: Math.floor(Math.random() * 12) + 87,
        reasoning: `Matches target industry vertical (${profile.targetIndustries[0] || "B2B SaaS"}) and company size range (${profile.minEmployees}–${profile.maxEmployees} employees).`,
        tech_stack: ["Kubernetes", "PostgreSQL", "React", "Docker", "Python", "TypeScript"],
        pain_points: [
          "Addressing cloud latency bottlenecks during peak traffic spikes",
          "Scaling high-throughput API endpoints across multi-region clusters",
        ],
        decision_maker: "VP of Engineering / CTO",
        email_subjects: {
          "Executive": `Executive Brief: Value alignment for ${companyName}`,
          "Solution-First": `Optimizing deployment latency for ${companyName}`,
          "Challenger": `Is infrastructure complexity delaying ${companyName}'s release cycles?`,
        },
        email_bodies: {
          "Executive": `Hi Alex,\n\nI was reviewing ${cleanDomain}'s engineering stack and saw your team's recent cloud expansion.\n\nBased on your work with Kubernetes and cloud performance, I wanted to share how our offering (${profile.offering}) helps engineering teams streamline deployment velocity.\n\nLet's connect for 5 minutes if this aligns with your Q3 roadmap.`,
          "Solution-First": `Hi Alex,\n\nNoticed ${companyName}'s focus on high-throughput backend scaling.\n\nOur platform (${profile.offering}) is specifically designed to reduce cluster latency during peak load spikes.\n\nWould you be open to a brief chat next week?`,
          "Challenger": `Hi Alex,\n\nEngineering leaders at scaling B2B SaaS companies often spend 25% of sprint capacity managing cloud deployment overhead.\n\nOur offering (${profile.offering}) automates multi-region cluster optimization without agent overhead.\n\nWorth a 5-minute brief?`,
        },
      });
      setLeadSaved(false);
    }, 2700);
  };

  // Handle Save Lead to Profile
  const handleSaveLeadToProfile = () => {
    setLeadSaved(true);
  };

  // Copy Email Draft
  const handleCopyEmail = () => {
    if (!scrapedResult) return;
    const subj = scrapedResult.email_subjects[selectedTone] || scrapedResult.email_subjects["Solution-First"];
    const body = scrapedResult.email_bodies[selectedTone] || scrapedResult.email_bodies["Solution-First"];
    navigator.clipboard.writeText(`Subject: ${subj}\n\n${body}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#E8E3D9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  Lead Scraper & Intelligence Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  LIVE WORKSPACE
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                Configure your saved ICP profile & offering, input target domains to scrape, analyze AI dossiers, and save qualified leads directly.
              </p>
            </div>

            <Link
              href="/saved-leads"
              className="px-4 py-2.5 bg-[#FFFFFF] border border-[#E8E3D9] hover:bg-[#F5F2EB] text-xs font-semibold rounded-xl text-[#1C1917] transition-colors inline-flex items-center gap-2 shadow-2xs shrink-0"
            >
              <Bookmark className="w-4 h-4 text-[#C2410C]" />
              View Saved Leads Database
            </Link>
          </div>

          {/* Process Stepper Header */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-2.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#F5F2EB] text-[#C2410C] font-bold text-xs flex items-center justify-center border border-[#E8E3D9]">
                1
              </div>
              <div>
                <p className="font-semibold text-[#1C1917]">Target ICP Criteria</p>
                <p className="text-[10px] text-[#78716C]">Industries, Size & Offering</p>
              </div>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-2.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#F5F2EB] text-[#C2410C] font-bold text-xs flex items-center justify-center border border-[#E8E3D9]">
                2
              </div>
              <div>
                <p className="font-semibold text-[#1C1917]">Scrape Domain</p>
                <p className="text-[10px] text-[#78716C]">Web Signals Extraction</p>
              </div>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-2.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#F5F2EB] text-[#C2410C] font-bold text-xs flex items-center justify-center border border-[#E8E3D9]">
                3
              </div>
              <div>
                <p className="font-semibold text-[#1C1917]">Scraped Dossier</p>
                <p className="text-[10px] text-[#78716C]">Qualified Lead & Outreach</p>
              </div>
            </div>
          </div>

          {/* Section 1: My Saved Profile & ICP Criteria */}
          <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C2410C]" />
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                  1. My Saved ICP Profile & Offering
                </h2>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-[#C2410C] hover:underline"
              >
                {isEditingProfile ? "Cancel" : "Edit Saved Profile"}
              </button>
            </div>

            {!isEditingProfile ? (
              /* Profile Summary Cards (Industries, Company Size, What We Are Offering) */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                    Target Industry Verticals
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {profile.targetIndustries.length > 0 ? (
                      profile.targetIndustries.map((ind) => (
                        <span key={ind} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#1C1917] font-medium">
                          {ind}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#78716C] italic">No industries selected</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    <Users className="w-3.5 h-3.5 text-[#C2410C]" />
                    Target Company Size Range
                  </div>
                  <p className="font-semibold text-[#1C1917] pt-1">
                    {profile.minEmployees} – {profile.maxEmployees} Employees
                  </p>
                  <p className="text-[11px] text-[#78716C]">Ideal growth tier focus</p>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    <Briefcase className="w-3.5 h-3.5 text-[#C2410C]" />
                    What We Are Offering
                  </div>
                  <p className="text-[#57534E] line-clamp-3 pt-1 font-medium leading-relaxed">
                    {profile.offering}
                  </p>
                </div>
              </div>
            ) : (
              /* Profile Edit Form with Full Industry Selection */
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs pt-2">
                {/* 1. Target Industry Verticals Selection & Custom Add */}
                <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                      Target Industry Verticals (Select or Add Custom)
                    </label>
                    <span className="text-[11px] text-[#78716C]">
                      {profile.targetIndustries.length} Selected
                    </span>
                  </div>

                  {/* Preset Industry Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {availableIndustries.map((ind) => {
                      const isSelected = profile.targetIndustries.includes(ind);
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => toggleIndustry(ind)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#C2410C] text-white font-semibold shadow-2xs"
                              : "bg-[#FFFFFF] text-[#57534E] border border-[#E8E3D9] hover:bg-[#F5F2EB]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          {ind}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Industry Input Bar */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add custom industry vertical (e.g. CleanTech, EdTech)..."
                      value={customIndustryInput}
                      onChange={(e) => setCustomIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomIndustry(e)}
                      className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomIndustry()}
                      className="px-3.5 py-2 bg-[#1C1917] hover:bg-[#333] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Industry
                    </button>
                  </div>
                </div>

                {/* 2. Company Size Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Minimum Employees</label>
                    <input
                      type="number"
                      value={profile.minEmployees}
                      onChange={(e) => setProfile({ ...profile, minEmployees: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Maximum Employees</label>
                    <input
                      type="number"
                      value={profile.maxEmployees}
                      onChange={(e) => setProfile({ ...profile, maxEmployees: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                </div>

                {/* 3. Offering Value Proposition */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#57534E]">What We Are Offering (Your Product / Service Value Proposition)</label>
                  <textarea
                    rows={3}
                    value={profile.offering}
                    onChange={(e) => setProfile({ ...profile, offering: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    Save Updated ICP & Offering
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 bg-[#FFFFFF] border border-[#E8E3D9] text-[#57534E] hover:text-[#1C1917] font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {profileSaved && (
              <p className="text-xs text-[#047857] font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile & offering saved successfully!
              </p>
            )}
          </div>

          {/* Section 2: Target Domain Scraper Input Bar */}
          <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C2410C]" />
              <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                2. Input Target Domain to Scrape & Analyze
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Enter target URL or domain (e.g. stripe.com, vercel.com, linear.app)..."
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunScrape()}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              <button
                onClick={() => handleRunScrape()}
                disabled={isScraping}
                className="w-full sm:w-auto px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
              >
                {isScraping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running AI Scraper...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Run Lead Intelligence Scrape
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Domain Chips */}
            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <span className="font-semibold text-[11px] text-[#57534E]">Quick Test:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleDomains.map((sample) => (
                  <button
                    key={sample.domain}
                    onClick={() => handleRunScrape(sample.domain)}
                    className="px-2.5 py-1 text-[11px] bg-[#FAF7F2] hover:bg-[#F5F2EB] border border-[#E8E3D9] rounded-md text-[#1C1917] font-mono transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Scraping Execution Stepper */}
            {isScraping && (
              <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#57534E] font-medium">
                  <span>AI Agent Execution Pipeline</span>
                  <span className="text-[#C2410C] font-semibold">Step {scrapeStep} of 3</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className={`p-2 rounded border text-center ${scrapeStep >= 1 ? "bg-[#FFFFFF] border-[#C2410C] text-[#C2410C] font-semibold" : "bg-[#FAF7F2] border-[#E8E3D9] text-[#78716C]"}`}>
                    1. Scrape Domain Website
                  </div>
                  <div className={`p-2 rounded border text-center ${scrapeStep >= 2 ? "bg-[#FFFFFF] border-[#C2410C] text-[#C2410C] font-semibold" : "bg-[#FAF7F2] border-[#E8E3D9] text-[#78716C]"}`}>
                    2. Evaluate ICP Fit Rating
                  </div>
                  <div className={`p-2 rounded border text-center ${scrapeStep >= 3 ? "bg-[#FFFFFF] border-[#C2410C] text-[#C2410C] font-semibold" : "bg-[#FAF7F2] border-[#E8E3D9] text-[#78716C]"}`}>
                    3. Draft Outreach Message
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Scraped Intelligence Dossier & Generated Email Output */}
          {scrapedResult && !isScraping && (
            <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-6 shadow-md animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3D9] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5F2EB] to-[#E8E3D9] border border-[#E8E3D9] flex items-center justify-center font-serif text-lg font-bold text-[#C2410C]">
                    {scrapedResult.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1C1917]">{scrapedResult.company_name}</h3>
                    <p className="text-xs text-[#78716C]">{scrapedResult.domain}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                    {scrapedResult.score}% ICP FIT SCORE
                  </span>

                  {/* Save to Profile Action Button */}
                  <button
                    onClick={handleSaveLeadToProfile}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                      leadSaved
                        ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                        : "bg-[#C2410C] hover:bg-[#9A3412] text-white"
                    }`}
                  >
                    {leadSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {leadSaved ? "Saved to My Profile!" : "Save Lead to My Profile"}
                  </button>
                </div>
              </div>

              {/* Dossier Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Intelligence Dossier */}
                <div className="space-y-4 p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs">
                  <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#C2410C]" />
                    Scraped Intelligence Dossier
                  </h4>

                  <div className="space-y-1">
                    <span className="font-semibold text-[#78716C]">ICP Qualification Assessment</span>
                    <p className="text-[#57534E] leading-relaxed">{scrapedResult.reasoning}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-[#78716C]">Target Buyer Persona</span>
                    <p className="font-semibold text-[#1C1917]">{scrapedResult.decision_maker}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-[#78716C]">Scraped Pain Points</span>
                    <ul className="space-y-1 pt-1">
                      {scrapedResult.pain_points.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[#57534E]">
                          <AlertCircle className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-[#78716C]">Detected Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scrapedResult.tech_stack.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-[#FFFFFF] border border-[#E8E3D9] rounded-md font-mono text-[#1C1917] shadow-2xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Generated Cold Outreach Draft Studio */}
                <div className="space-y-4 p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                        Outreach Message Workshop
                      </h4>
                      <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-lg border border-[#E8E3D9]">
                        {(["Executive", "Solution-First", "Challenger"] as const).map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setSelectedTone(tone)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                              selectedTone === tone
                                ? "bg-[#C2410C] text-white font-semibold"
                                : "text-[#78716C] hover:text-[#1C1917]"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg space-y-2">
                      <p className="font-semibold text-[#1C1917]">
                        Subject: {scrapedResult.email_subjects[selectedTone] || scrapedResult.email_subjects["Solution-First"]}
                      </p>
                      <div className="border-t border-[#E8E3D9] pt-2 text-[#57534E] whitespace-pre-line leading-relaxed">
                        {scrapedResult.email_bodies[selectedTone] || scrapedResult.email_bodies["Solution-First"]}
                      </div>
                    </div>

                    {/* Personalization Variable Chips */}
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg space-y-1">
                      <span className="text-[10px] font-semibold text-[#78716C] uppercase tracking-wider">
                        Personalization Tokens
                      </span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FAF7F2] border border-[#E8E3D9] rounded text-[#C2410C]">
                          [Company: {scrapedResult.company_name}]
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FAF7F2] border border-[#E8E3D9] rounded text-[#C2410C]">
                          [Offering: {profile.offering.slice(0, 30)}...]
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={handleCopyEmail}
                      className="px-3.5 py-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEmail ? "Copied!" : "Copy Text"}
                    </button>

                    <button
                      onClick={handleSaveLeadToProfile}
                      className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Save to Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
