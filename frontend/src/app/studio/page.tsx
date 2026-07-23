"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  Search,
  Building2,
  Check,
  Globe,
  Sliders,
  Bookmark,
  Copy,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Briefcase,
  Users,
  Plus,
  X,
  MapPin,
  TrendingUp,
  Phone,
  Mail,
  Handshake,
  DollarSign,
  XCircle,
} from "lucide-react";

// ─── API base URL — set NEXT_PUBLIC_API_URL in your .env.local ────────────────
// Production default: same domain (Nginx proxies /api/ to FastAPI on port 8000)
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://leadforge-saas.duckdns.org";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessInsights {
  annual_turnover?: string | null;
  locations?: string | null;
  active_hiring?: string | null;
  dominated_sectors?: string | null;
  partnerships?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  expanding_teams?: string | null;
}

interface ScrapedResult {
  domain: string;
  company_display_name: string;
  is_qualified: boolean;
  qualification_reason: string;
  insights: BusinessInsights;
  drafted_email: string | null;
  scraper_error: string | null;
  pipeline_error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDomain(input: string): string {
  return input
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

function domainToDisplayName(domain: string): string {
  // e.g. "stripe.com" → "Stripe"
  //      "majid-al-futtaim.com" → "Majid Al Futtaim"
  const base = domain.split(".")[0];
  return base
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseDraftedEmail(raw: string): { subject: string; body: string } {
  if (!raw) return { subject: "", body: "" };
  const lines = raw.split("\n");
  const subjectLine = lines.find((l) => l.startsWith("Subject:")) ?? "";
  const subject = subjectLine.replace(/^Subject:\s*/, "").trim();
  const body = lines
    .filter((l) => !l.startsWith("Subject:") && !l.startsWith("Tone:"))
    .join("\n")
    .trim();
  return { subject, body };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadStudioPage() {
  const { getToken } = useAuth();

  // ── ICP Profile State ─────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    targetIndustries: ["B2B SaaS", "Cloud Infrastructure", "DevOps Tools"],
    minEmployees: 50,
    maxEmployees: 500,
    offering:
      "AI-powered cloud observability and automated performance monitoring platform that reduces latency and cloud infrastructure spend",
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

  // ── Scraper State ─────────────────────────────────────────────────────────
  const [targetDomain, setTargetDomain] = useState("stripe.com");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState<number>(0);
  const [scrapeStatus, setScrapeStatus] = useState<string>("");
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const sampleDomains = [
    { label: "stripe.com", domain: "stripe.com" },
    { label: "linear.app", domain: "linear.app" },
    { label: "notion.so", domain: "notion.so" },
    { label: "supabase.com", domain: "supabase.com" },
    { label: "datadoghq.com", domain: "datadoghq.com" },
  ];

  // ── Result State ───────────────────────────────────────────────────────────
  const [scrapedResult, setScrapedResult] = useState<ScrapedResult | null>(null);
  const [leadSaved, setLeadSaved] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedTone] = useState<string>("default");

  // ── Profile Save ───────────────────────────────────────────────────────────
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // ── Real Scrape via Backend API ────────────────────────────────────────────
  const handleRunScrape = async (customDomain?: string) => {
    const input = (customDomain || targetDomain).trim();
    if (!input) return;

    // Ensure https:// prefix
    const targetUrl = input.startsWith("http") ? input : `https://${input}`;
    const domain = extractDomain(targetUrl);
    setTargetDomain(input);
    setScrapedResult(null);
    setScrapeError(null);
    setIsScraping(true);
    setScrapeStep(1);
    setScrapeStatus("Connecting to Firecrawl...");

    try {
      // ── Step 1: Get Clerk auth token ──────────────────────────────────────
      const token = await getToken();
      if (!token) throw new Error("Not authenticated. Please sign in.");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ── Step 2: Submit the scrape job ─────────────────────────────────────
      setScrapeStatus("Submitting scrape job...");
      const discoverRes = await fetch(`${API_BASE}/api/v1/leads/discover`, {
        method: "POST",
        headers,
        body: JSON.stringify({ target_url: targetUrl }),
      });

      if (!discoverRes.ok) {
        const errBody = await discoverRes.json().catch(() => ({}));
        throw new Error(
          errBody?.detail ?? `Discover API error: ${discoverRes.status}`
        );
      }

      const { job_id } = await discoverRes.json();
      setScrapeStep(2);
      setScrapeStatus("Scraping website with Firecrawl...");

      // ── Step 3: Poll for job completion ───────────────────────────────────
      let attempts = 0;
      const MAX_ATTEMPTS = 30; // 60 seconds max

      while (attempts < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;

        const statusRes = await fetch(
          `${API_BASE}/api/v1/leads/status/${job_id}`,
          { headers }
        );

        if (!statusRes.ok) {
          throw new Error(`Status check failed: ${statusRes.status}`);
        }

        const jobStatus = await statusRes.json();

        if (jobStatus.status === "in_progress") {
          setScrapeStep(2);
          setScrapeStatus("AI qualifying the lead...");
        }

        if (
          jobStatus.status === "completed" ||
          jobStatus.status === "failed"
        ) {
          setScrapeStep(3);
          setScrapeStatus("Parsing results...");

          const data = JSON.parse(jobStatus.result_data || "{}");

          const insights: BusinessInsights = data.business_insights ?? {};
          const displayName = domainToDisplayName(domain);

          setScrapedResult({
            domain,
            company_display_name: displayName,
            is_qualified: Boolean(data.is_qualified),
            qualification_reason:
              data.qualification_reason ??
              (data.scraper_error
                ? `Scraper error: ${data.scraper_error}`
                : "No qualification reason returned."),
            insights,
            drafted_email: data.drafted_email ?? null,
            scraper_error: data.scraper_error ?? null,
            pipeline_error: data.pipeline_error ?? null,
          });
          setLeadSaved(false);
          break;
        }

        // Still pending — update status text
        if (attempts > 5) {
          setScrapeStatus("Running AI qualification & email drafting...");
        }
      }

      if (attempts >= MAX_ATTEMPTS) {
        throw new Error("Timed out waiting for scrape to complete (60s). Try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setScrapeError(msg);
    } finally {
      setIsScraping(false);
      setScrapeStep(0);
      setScrapeStatus("");
    }
  };

  const handleCopyEmail = () => {
    if (!scrapedResult?.drafted_email) return;
    navigator.clipboard.writeText(scrapedResult.drafted_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#E8E3D9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  Lead Scraper & Intelligence Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                Configure your ICP profile, scrape any company URL with real Firecrawl intelligence, and generate personalized outreach.
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

          {/* Process Stepper */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { n: 1, title: "Target ICP Criteria", sub: "Industries, Size & Offering" },
              { n: 2, title: "Scrape Domain", sub: "Real Firecrawl Intelligence" },
              { n: 3, title: "AI Dossier", sub: "Qualified Lead & Outreach" },
            ].map(({ n, title, sub }) => (
              <div
                key={n}
                className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl flex items-center gap-2.5 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#F5F2EB] text-[#C2410C] font-bold text-xs flex items-center justify-center border border-[#E8E3D9]">
                  {n}
                </div>
                <div>
                  <p className="font-semibold text-[#1C1917]">{title}</p>
                  <p className="text-[10px] text-[#78716C]">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section 1: ICP Profile */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                    <Building2 className="w-3.5 h-3.5 text-[#C2410C]" />
                    Target Industry Verticals
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {profile.targetIndustries.length > 0 ? (
                      profile.targetIndustries.map((ind) => (
                        <span
                          key={ind}
                          className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#1C1917] font-medium"
                        >
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
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs pt-2">
                {/* Industry verticals */}
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

                  {/* Custom industry chips already selected */}
                  {profile.targetIndustries
                    .filter((i) => !availableIndustries.includes(i))
                    .map((ind) => (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#C2410C] text-white"
                      >
                        {ind}
                        <button
                          type="button"
                          onClick={() => toggleIndustry(ind)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

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

                {/* Company size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Minimum Employees</label>
                    <input
                      type="number"
                      value={profile.minEmployees}
                      onChange={(e) =>
                        setProfile({ ...profile, minEmployees: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#57534E]">Maximum Employees</label>
                    <input
                      type="number"
                      value={profile.maxEmployees}
                      onChange={(e) =>
                        setProfile({ ...profile, maxEmployees: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917]"
                    />
                  </div>
                </div>

                {/* Offering */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#57534E]">
                    What We Are Offering (Your Product / Service Value Proposition)
                  </label>
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

          {/* Section 2: Scraper Input */}
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
                  placeholder="Enter target URL or domain (e.g. stripe.com, vercel.com)..."
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isScraping && handleRunScrape()}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              <button
                onClick={() => handleRunScrape()}
                disabled={isScraping}
                className="w-full sm:w-auto px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-2"
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

            {/* Quick sample domains */}
            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <span className="font-semibold text-[11px] text-[#57534E]">Quick Test:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleDomains.map((sample) => (
                  <button
                    key={sample.domain}
                    onClick={() => handleRunScrape(sample.domain)}
                    disabled={isScraping}
                    className="px-2.5 py-1 text-[11px] bg-[#FAF7F2] hover:bg-[#F5F2EB] disabled:opacity-50 border border-[#E8E3D9] rounded-md text-[#1C1917] font-mono transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live scraping stepper */}
            {isScraping && (
              <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#57534E] font-medium">
                  <span>AI Agent Execution Pipeline</span>
                  <span className="text-[#C2410C] font-semibold">{scrapeStatus}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    "1. Scrape via Firecrawl",
                    "2. AI ICP Qualification",
                    "3. Draft Outreach Email",
                  ].map((label, i) => (
                    <div
                      key={label}
                      className={`p-2 rounded border text-center ${
                        scrapeStep > i
                          ? "bg-[#FFFFFF] border-[#C2410C] text-[#C2410C] font-semibold"
                          : scrapeStep === i + 1
                          ? "bg-[#FFF7ED] border-[#C2410C] text-[#C2410C] font-semibold animate-pulse"
                          : "bg-[#FAF7F2] border-[#E8E3D9] text-[#78716C]"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scrape error */}
            {scrapeError && !isScraping && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Scrape Failed</p>
                  <p className="mt-0.5">{scrapeError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Real Scraped Intelligence Dossier */}
          {scrapedResult && !isScraping && (
            <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-6 shadow-md animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3D9] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5F2EB] to-[#E8E3D9] border border-[#E8E3D9] flex items-center justify-center font-serif text-lg font-bold text-[#C2410C]">
                    {scrapedResult.company_display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                      {scrapedResult.company_display_name}
                    </h3>
                    <p className="text-xs text-[#78716C]">{scrapedResult.domain}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {scrapedResult.is_qualified ? (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                      ✓ QUALIFIED LEAD
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                      ✗ NOT QUALIFIED
                    </span>
                  )}

                  {scrapedResult.is_qualified && (
                    <button
                      onClick={() => setLeadSaved(true)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                        leadSaved
                          ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                          : "bg-[#C2410C] hover:bg-[#9A3412] text-white"
                      }`}
                    >
                      {leadSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      {leadSaved ? "Saved to Profile!" : "Save Lead to Profile"}
                    </button>
                  )}
                </div>
              </div>

              {/* Scraper / pipeline error banners */}
              {scrapedResult.scraper_error && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Scraper Warning: </span>
                    {scrapedResult.scraper_error}
                  </div>
                </div>
              )}

              {/* ICP Qualification Reason */}
              <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#78716C] uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                  AI ICP Qualification Assessment
                </div>
                <p className="text-[#57534E] leading-relaxed pt-1">
                  {scrapedResult.qualification_reason}
                </p>
              </div>

              {/* Business Intelligence Grid */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Building2 className="w-4 h-4 text-[#C2410C]" />
                  Scraped Company Intelligence
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Locations */}
                  {scrapedResult.insights.locations && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                        Locations & HQ
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.locations}
                      </p>
                    </div>
                  )}

                  {/* Annual Turnover */}
                  {scrapedResult.insights.annual_turnover && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <DollarSign className="w-3.5 h-3.5 text-[#C2410C]" />
                        Annual Turnover / Revenue
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.annual_turnover}
                      </p>
                    </div>
                  )}

                  {/* Expanding Teams */}
                  {scrapedResult.insights.expanding_teams && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <TrendingUp className="w-3.5 h-3.5 text-[#C2410C]" />
                        Expanding Teams
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.expanding_teams}
                      </p>
                    </div>
                  )}

                  {/* Active Hiring */}
                  {scrapedResult.insights.active_hiring && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <Users className="w-3.5 h-3.5 text-[#C2410C]" />
                        Active Hiring
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.active_hiring}
                      </p>
                    </div>
                  )}

                  {/* Dominated Sectors */}
                  {scrapedResult.insights.dominated_sectors && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <Layers className="w-3.5 h-3.5 text-[#C2410C]" />
                        Dominated Sectors
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.dominated_sectors}
                      </p>
                    </div>
                  )}

                  {/* Partnerships */}
                  {scrapedResult.insights.partnerships && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <Handshake className="w-3.5 h-3.5 text-[#C2410C]" />
                        Key Partnerships
                      </div>
                      <p className="text-[#1C1917] font-medium leading-relaxed">
                        {scrapedResult.insights.partnerships}
                      </p>
                    </div>
                  )}

                  {/* Contact Email */}
                  {scrapedResult.insights.contact_email && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <Mail className="w-3.5 h-3.5 text-[#C2410C]" />
                        Contact Email
                      </div>
                      <p className="text-[#1C1917] font-medium">
                        {scrapedResult.insights.contact_email}
                      </p>
                    </div>
                  )}

                  {/* Contact Phone */}
                  {scrapedResult.insights.contact_phone && (
                    <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                        <Phone className="w-3.5 h-3.5 text-[#C2410C]" />
                        Contact Phone
                      </div>
                      <p className="text-[#1C1917] font-medium">
                        {scrapedResult.insights.contact_phone}
                      </p>
                    </div>
                  )}
                </div>

                {/* No insights fallback */}
                {Object.values(scrapedResult.insights).every((v) => !v) && (
                  <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs text-[#78716C] text-center">
                    No structured business insights could be extracted from this page.
                    The AI qualification is based on the raw scraped content.
                  </div>
                )}
              </div>

              {/* Drafted Email — only shown when qualified */}
              {scrapedResult.is_qualified && scrapedResult.drafted_email && (() => {
                const { subject, body } = parseDraftedEmail(scrapedResult.drafted_email);
                return (
                  <div className="space-y-3 p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                        AI-Drafted Cold Outreach Email
                      </h4>
                      <button
                        onClick={handleCopyEmail}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {copiedEmail ? (
                          <Check className="w-3.5 h-3.5 text-[#047857]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedEmail ? "Copied!" : "Copy Email"}
                      </button>
                    </div>

                    <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg space-y-2">
                      {subject && (
                        <p className="font-semibold text-[#1C1917]">Subject: {subject}</p>
                      )}
                      <div className="border-t border-[#E8E3D9] pt-2 text-[#57534E] whitespace-pre-line leading-relaxed">
                        {body}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Qualified but no email drafted */}
              {scrapedResult.is_qualified && !scrapedResult.drafted_email && (
                <div className="p-4 bg-[#FAF7F2] border border-[#E8E3D9] rounded-xl text-xs text-[#78716C] text-center">
                  Email drafting did not complete for this lead.
                  {scrapedResult.pipeline_error && (
                    <span className="block mt-1 text-amber-700">
                      {scrapedResult.pipeline_error}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
