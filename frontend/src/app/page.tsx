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
  Users,
} from "lucide-react";

export default function LeadStudioPage() {
  // Saved User Profile / ICP State
  const [profile, setProfile] = useState({
    targetIndustries: ["B2B SaaS", "Cloud Infrastructure", "DevOps Tools"],
    minEmployees: 50,
    maxEmployees: 500,
    decisionMaker: "VP of Engineering / CTO",
    painPoints: "High cloud infrastructure spend, Kubernetes cluster scaling latency, CI/CD pipeline build delays",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Scraper Input State
  const [targetDomain, setTargetDomain] = useState("vercel.com");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState<number>(0); // 0: Idle, 1: Scraping, 2: Rating, 3: Drafting, 4: Complete

  // Scraped Lead Output Result State
  const [scrapedResult, setScrapedResult] = useState<{
    company_name: string;
    domain: string;
    score: number;
    reasoning: string;
    tech_stack: string[];
    pain_points: string[];
    decision_maker: string;
    email_subject: string;
    email_body: string;
  } | null>({
    company_name: "Vercel Inc.",
    domain: "vercel.com",
    score: 94,
    reasoning: "High alignment with Cloud & Frontend Infrastructure ICP. Active deployment of Next.js edge networks and serverless middleware.",
    tech_stack: ["Next.js", "React", "TypeScript", "Vercel Edge Network", "AWS"],
    pain_points: [
      "Optimizing Serverless Cold Start Latency during traffic spikes",
      "Managing complex enterprise middleware routing rules",
    ],
    decision_maker: "VP of Engineering / Head of Developer Experience",
    email_subject: "Streamlining Serverless Edge latency for Vercel Enterprise",
    email_body: "Hi Sarah,\n\nI was following Vercel's latest Next.js release and noticed your team's focus on Edge middleware performance.\n\nWe engineered LeadForge to automatically diagnose and optimize high-concurrency Next.js serverless execution workflows without adding overhead.\n\nWould you be open to a 5-minute brief next Tuesday?",
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
  const handleRunScrape = () => {
    if (!targetDomain.trim()) return;
    setIsScraping(true);
    setScrapeStep(1);

    // Simulate 3-step LangGraph execution
    setTimeout(() => setScrapeStep(2), 1000);
    setTimeout(() => setScrapeStep(3), 2000);
    setTimeout(() => {
      setScrapeStep(4);
      setIsScraping(false);

      // Generate dynamic output based on domain
      const cleanDomain = targetDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const companyName = cleanDomain.split(".")[0].toUpperCase() + " Technologies";

      setScrapedResult({
        company_name: companyName,
        domain: cleanDomain,
        score: Math.floor(Math.random() * 15) + 85, // 85 - 99 score
        reasoning: `Matches saved profile criteria for ${profile.targetIndustries[0] || "B2B SaaS"}. Active cloud scaling infrastructure detected.`,
        tech_stack: ["Kubernetes", "PostgreSQL", "React", "Docker", "Python"],
        pain_points: [
          `Addressing ${profile.painPoints.split(",")[0] || "cloud latency bottlenecks"}`,
          "Scaling high-throughput API endpoints",
        ],
        decision_maker: profile.decisionMaker || "VP of Engineering",
        email_subject: `Optimizing infrastructure workflows for ${companyName}`,
        email_body: `Hi Alex,\n\nI was reviewing ${cleanDomain}'s tech stack and saw your team's recent infrastructure expansion.\n\nBased on your work with Kubernetes and cloud performance, I wanted to share how LeadForge helps engineering leaders streamline deployment velocity.\n\nLet's connect for 5 minutes if this aligns with your Q3 roadmap.`,
      });
      setLeadSaved(false);
    }, 3000);
  };

  // Handle Save Lead to Profile
  const handleSaveLeadToProfile = () => {
    setLeadSaved(true);
  };

  // Copy Email Draft
  const handleCopyEmail = () => {
    if (!scrapedResult) return;
    navigator.clipboard.writeText(`Subject: ${scrapedResult.email_subject}\n\n${scrapedResult.email_body}`);
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
                  ACTIVE STUDIO
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                Configure your ICP profile, input target domains to scrape, get full AI intelligence dossiers, and save qualified leads directly to your profile.
              </p>
            </div>

            <Link
              href="/saved-leads"
              className="px-4 py-2 bg-[#FFFFFF] border border-[#E8E3D9] hover:bg-[#F5F2EB] text-xs font-semibold rounded-xl text-[#1C1917] transition-colors inline-flex items-center gap-2 shadow-2xs shrink-0"
            >
              <Bookmark className="w-4 h-4 text-[#C2410C]" />
              View Saved Leads Database
            </Link>
          </div>

          {/* Section 1: My Saved Profile & ICP Criteria */}
          <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C2410C]" />
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                  1. My Saved ICP Profile Criteria
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
              /* Profile Summary Cards */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    Target Industries
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {profile.targetIndustries.map((ind) => (
                      <span key={ind} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#1C1917]">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    Target Persona & Size
                  </span>
                  <p className="font-semibold text-[#1C1917] pt-1">{profile.decisionMaker}</p>
                  <p className="text-[11px] text-[#78716C]">{profile.minEmployees} - {profile.maxEmployees} Employees</p>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    Targeted Pain Points
                  </span>
                  <p className="text-[#57534E] line-clamp-2 pt-1">{profile.painPoints}</p>
                </div>
              </div>
            ) : (
              /* Profile Edit Form */
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Decision-Maker Job Title</label>
                    <input
                      type="text"
                      value={profile.decisionMaker}
                      onChange={(e) => setProfile({ ...profile, decisionMaker: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Targeted Pain Points</label>
                    <input
                      type="text"
                      value={profile.painPoints}
                      onChange={(e) => setProfile({ ...profile, painPoints: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Updated Profile
                </button>
              </form>
            )}

            {profileSaved && (
              <p className="text-xs text-[#047857] font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile criteria saved successfully!
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
                <Globe className="w-4 h-4 absolute left-3.5 top-3 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Enter target URL or domain (e.g. stripe.com, vercel.com, cloudscale.io)..."
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunScrape()}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              <button
                onClick={handleRunScrape}
                disabled={isScraping}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
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
                  <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-lg font-bold text-[#C2410C]">
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
                  <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
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
                    <div className="flex flex-wrap gap-1 pt-1">
                      {scrapedResult.tech_stack.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E8E3D9] rounded font-mono text-[#1C1917]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Generated Cold Outreach Draft */}
                <div className="space-y-4 p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                        Generated Outreach Message
                      </h4>
                      <button
                        onClick={handleCopyEmail}
                        className="text-[11px] font-semibold text-[#57534E] hover:text-[#1C1917] flex items-center gap-1"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedEmail ? "Copied!" : "Copy Text"}
                      </button>
                    </div>

                    <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg space-y-2">
                      <p className="font-semibold text-[#1C1917]">Subject: {scrapedResult.email_subject}</p>
                      <div className="border-t border-[#E8E3D9] pt-2 text-[#57534E] whitespace-pre-line leading-relaxed">
                        {scrapedResult.email_body}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#78716C]">Drafted automatically based on ICP profile</span>
                    <button
                      onClick={handleSaveLeadToProfile}
                      className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold rounded-lg transition-colors flex items-center gap-1"
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
