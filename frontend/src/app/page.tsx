"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Globe,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  Settings,
  Save,
  MapPin,
  TrendingUp,
  Handshake,
  Briefcase,
  Phone
} from "lucide-react";

// API base URL - uses env var in production, falls back to localhost for dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface DiscoverResponse {
  job_id: string;
  status: string;
  message: string;
}

interface JobStatus {
  id: string;
  task_name: string;
  status: string;
  target_url: string;
  result_data: string | null;
  error_detail: string | null;
  retry_count: number;
  enqueued_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeadDiscoveryDashboard() {
  const { getToken, isLoaded, userId } = useAuth();
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [offering, setOffering] = useState("");
  const [targetCriteria, setTargetCriteria] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch current tenant profile
  const { data: tenant, refetch: refetchTenant } = useQuery({
    queryKey: ["currentTenant"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/tenants/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch tenant profile");
      }
      return res.json();
    },
    enabled: !!userId,
  });

  // Mutation to update tenant metadata
  const updateTenantMutation = useMutation({
    mutationFn: async (updatedData: { name?: string; metadata?: string }) => {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/tenants/current`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error("Failed to update settings");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchTenant();
      setSettingsSaved(true);
    },
  });

  useEffect(() => {
    if (tenant?.metadata) {
      try {
        const meta = JSON.parse(tenant.metadata);
        setOffering(meta.offering || "");
        setTargetCriteria(meta.target_criteria || "");
      } catch (e) {
        console.error("Failed to parse metadata", e);
      }
    }
  }, [tenant]);

  useEffect(() => {
    if (settingsSaved) {
      const timer = setTimeout(() => setSettingsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [settingsSaved]);

  // Submit target URL to discover leads
  const discoverMutation = useMutation<DiscoverResponse, Error, string>({
    mutationFn: async (targetUrl: string) => {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/leads/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_url: targetUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to start lead discovery job");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setJobId(data.job_id);
    },
  });

  // Poll job status every 3 seconds until completed or failed
  const { data: jobStatus, error: pollError } = useQuery<JobStatus, Error>({
    queryKey: ["jobStatus", jobId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/leads/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch job status");
      }
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 3000;
    },
  });

  // Handle Clipboard Copy
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Decode result payload from database
  let parsedResult = null;
  if (jobStatus?.result_data) {
    try {
      parsedResult = JSON.parse(jobStatus.result_data);
    } catch (e) {
      console.error("Failed to parse result payload", e);
    }
  }

  // Parse subject and body from the formatted email draft
  let emailSubject = "";
  let emailBody = "";
  if (parsedResult?.drafted_email) {
    const rawEmail = parsedResult.drafted_email;
    const subjectMatch = rawEmail.match(/^Subject:\s*(.*)/i);
    if (subjectMatch) {
      emailSubject = subjectMatch[1];
      // strip Subject and Tone prefix lines to get the body
      emailBody = rawEmail
        .replace(/^Subject:.*\n?/i, "")
        .replace(/^Tone:.*\n?/i, "")
        .trim();
    } else {
      emailBody = rawEmail;
    }
  }

  const hasConfiguredSettings = !!offering.trim() && !!targetCriteria.trim();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const metadataStr = JSON.stringify({
      offering: offering.trim(),
      target_criteria: targetCriteria.trim(),
    });
    updateTenantMutation.mutate({
      metadata: metadataStr,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfiguredSettings) return;
    if (!url.trim()) return;
    setJobId(null);
    discoverMutation.mutate(url.trim());
  };

  // Wait until Clerk auth state resolves
  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* HEADER NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Aegis AI
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Next-Gen Outreach
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition rounded-lg text-white shadow-lg shadow-indigo-600/30">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* LANDING PAGE (SIGNED OUT) */}
      {!userId ? (
        <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-sm mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" /> B2B Outreach Autopilot
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
            Scrape, Qualify, and Draft Cold Emails in{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              One Flow
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
            Stop spending hours manually searching websites. Aegis AI uses verified multi-agent LangGraph workflows to qualify target companies and draft personalized cold emails instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-2 group transition shadow-xl shadow-indigo-600/20 cursor-pointer">
                Launch Application
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </button>
            </SignInButton>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
          {/* DASHBOARD HERO */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Lead Discovery</h1>
            <p className="text-slate-400">Submit target domains to scan, verify ICP compliance, and construct campaign outreach drafts.</p>
          </div>

          {/* CAMPAIGN SETTINGS */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className={`h-5 w-5 ${hasConfiguredSettings ? 'text-indigo-400 animate-pulse' : 'text-amber-500 animate-bounce'}`} />
                <div>
                  <h3 className="font-semibold text-white">Campaign Profile & ICP Target</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {hasConfiguredSettings
                      ? "Custom offering & ICP target configured. Click to adjust."
                      : "🚨 Action Required: Set up your product/service offering and ICP criteria."}
                  </p>
                </div>
              </div>
              <span className="text-slate-400 text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">
                {isSettingsOpen ? "Collapse" : "Expand"}
              </span>
            </button>

            {isSettingsOpen && (
              <form onSubmit={handleSaveSettings} className="px-6 pb-6 pt-2 border-t border-slate-800/80 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="offering" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    What are you offering? (Your Product / Service)
                  </label>
                  <textarea
                    id="offering"
                    required
                    rows={3}
                    placeholder="Describe your product, service, or value proposition. (e.g. 'We offer custom luxury catering services for corporate events and private offices.')"
                    value={offering}
                    onChange={(e) => setOffering(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 outline-none transition resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="targetCriteria" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ideal Customer Profile (ICP) Target Criteria
                  </label>
                  <textarea
                    id="targetCriteria"
                    required
                    rows={3}
                    placeholder="Define who qualifies as a good lead. (e.g. 'Law firms, financial services, tech startups, size >50 employees, looking for high-end hospitality services.')"
                    value={targetCriteria}
                    onChange={(e) => setTargetCriteria(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 outline-none transition resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="text-xs text-slate-500">
                    * AI uses this profile to scrape and automatically qualify domains.
                  </div>
                  <button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed text-sm"
                  >
                    {updateTenantMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : settingsSaved ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" /> Saved successfully!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* URL SUBMISSION FORM */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            {!hasConfiguredSettings && (
              <div className="mb-5 flex items-start gap-3 text-amber-400 bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl text-sm leading-relaxed animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Campaign Profile Missing</span>
                  To start lead discovery, please expand the <strong className="text-amber-300">Campaign Profile & ICP Target</strong> panel above, describe what you offer, and save your target customer criteria.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Globe className="h-5 w-5" />
                </div>
                <input
                  type="url"
                  required
                  disabled={!hasConfiguredSettings}
                  placeholder="https://company.com/about-us"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 outline-none transition disabled:bg-slate-950/40 disabled:border-slate-900 disabled:text-slate-700 disabled:placeholder-slate-800 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={!hasConfiguredSettings || discoverMutation.isPending || (jobStatus && jobStatus.status === "in_progress")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800/80 disabled:text-slate-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
              >
                {discoverMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> Enqueuing...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" /> Scan Target
                  </>
                )}
              </button>
            </form>

            {discoverMutation.error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{discoverMutation.error.message}</span>
              </div>
            )}
          </section>

          {/* PIPELINE POLLING & STATUS */}
          {jobStatus && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-white">Pipeline Execution</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Job ID: {jobStatus.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {jobStatus.status === "pending" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Pending in Queue
                    </span>
                  )}
                  {jobStatus.status === "in_progress" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Running AI Analysis
                    </span>
                  )}
                  {jobStatus.status === "completed" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Job Completed
                    </span>
                  )}
                  {jobStatus.status === "failed" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="h-3 w-3" /> Job Failed
                    </span>
                  )}
                </div>
              </div>

              {/* PROGRESS WORKFLOW TRACKER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 1 */}
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${
                    jobStatus.status !== "pending" 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" 
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-200">1. Target Scraping</h4>
                    <p className="text-xs text-slate-500 mt-1">Executing Firecrawl extraction & prompt guardrails.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${
                    jobStatus.status === "completed" || (jobStatus.status === "in_progress" && parsedResult?.is_qualified !== undefined)
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-200">2. ICP Qualification</h4>
                    <p className="text-xs text-slate-500 mt-1">AI assessment against profile and target metadata.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${
                    jobStatus.status === "completed" && parsedResult?.drafted_email
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-200">3. Email Drafting</h4>
                    <p className="text-xs text-slate-500 mt-1">Personalized structured cold outreach drafting.</p>
                  </div>
                </div>
              </div>

              {jobStatus.status === "failed" && (
                <div className="mt-6 flex items-start gap-3 bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-sm text-red-400">
                  <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Pipeline Error</h5>
                    <p className="mt-1 text-slate-300 font-mono text-xs">{jobStatus.error_detail || "An unexpected error occurred during execution."}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* FINAL RESULTS CARD COMPONENTS */}
          {jobStatus?.status === "completed" && parsedResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: ICP & LEADS META */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                {/* ICP Verdict */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Building2 className="h-5 w-5 text-indigo-400" /> Qualification Verdict
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    {parsedResult.is_qualified ? (
                      <>
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2 rounded-xl">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-emerald-400 text-lg">ICP Qualified</p>
                          <p className="text-xs text-slate-500">The prospect matches the Ideal Customer Profile.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-2 rounded-xl">
                          <XCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-red-400 text-lg">Disqualified</p>
                          <p className="text-xs text-slate-500">The company does not meet target criteria.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {parsedResult.qualification_reason && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mt-2">
                      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Analysis Details</span>
                      <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">{parsedResult.qualification_reason}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800 pt-3 mt-1">
                    <span>Retries Consumed: {jobStatus.retry_count}</span>
                    {jobStatus.completed_at && (
                      <span>Time: {new Date(jobStatus.completed_at).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                 {/* Business Insights Card */}
                {parsedResult.business_insights && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Sparkles className="h-5 w-5 text-indigo-400" /> Target Business Insights
                    </h3>

                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {/* Turnover */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-emerald-400 font-extrabold text-base shrink-0 select-none">$</span>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Annual Turnover / Revenue</span>
                          <span className="text-slate-200 mt-0.5 block">{parsedResult.business_insights.annual_turnover || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Locations */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <MapPin className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Locations & Headquarters</span>
                          <span className="text-slate-200 mt-0.5 block">{parsedResult.business_insights.locations || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Dominated Sectors */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <TrendingUp className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Market Sectors</span>
                          <span className="text-slate-200 mt-0.5 block">{parsedResult.business_insights.dominated_sectors || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Partnerships */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <Handshake className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Key Partnerships / Clients</span>
                          <span className="text-slate-200 mt-0.5 block">{parsedResult.business_insights.partnerships || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Expanding Teams */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <Building2 className="h-4 w-4 text-fuchsia-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Expanding Teams</span>
                          <span className="text-slate-200 mt-0.5 block">{parsedResult.business_insights.expanding_teams || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Active Hiring */}
                      <div className="flex gap-3 items-start bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                        <Briefcase className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Active Hiring</span>
                          <span className="text-slate-200 mt-0.5 block whitespace-pre-line text-xs">{parsedResult.business_insights.active_hiring || "Not found on page"}</span>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        <div className="flex gap-2 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                          <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Email</span>
                            <span className="text-slate-200 text-xs mt-0.5 block truncate" title={parsedResult.business_insights.contact_email}>
                              {parsedResult.business_insights.contact_email || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                          <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Phone</span>
                            <span className="text-slate-200 text-xs mt-0.5 block truncate" title={parsedResult.business_insights.contact_phone}>
                              {parsedResult.business_insights.contact_phone || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scraped Leads Detail Card */}
                {parsedResult.mock_leads_found !== undefined && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <FileText className="h-5 w-5 text-indigo-400" /> Scraping Summary
                    </h3>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                      <span className="text-slate-400 text-sm">Source Target</span>
                      <a 
                        href={parsedResult.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-400 text-sm hover:underline flex items-center gap-1 font-medium"
                      >
                        Visit Target <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                      <span className="text-slate-400 text-sm">Leads Identified</span>
                      <span className="font-bold text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-sm">
                        {parsedResult.mock_leads_found} contacts
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 text-sm">Scraped Timestamp</span>
                      <span className="text-slate-300 text-sm font-mono">
                        {parsedResult.scraped_at ? new Date(parsedResult.scraped_at).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: EMAIL DRAFT */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <Mail className="h-5 w-5 text-indigo-400" /> Outreach Campaign Draft
                    </h3>
                    {emailBody && (
                      <button
                        onClick={() => copyToClipboard(parsedResult.drafted_email || "")}
                        className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {parsedResult.is_qualified ? (
                    emailBody ? (
                      <div className="flex-1 flex flex-col gap-4 mt-2">
                        {emailSubject && (
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block">Subject</span>
                            <span className="text-slate-200 font-medium text-sm mt-1 block">{emailSubject}</span>
                          </div>
                        )}
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex-1 whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed min-h-[220px]">
                          {emailBody}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 rounded-xl border border-slate-800/80">
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                        <p className="text-sm font-semibold text-slate-300">Draft Processing...</p>
                        <p className="text-xs text-slate-500 mt-1">Qualification complete, compiling personalized email body.</p>
                      </div>
                    )
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-950 rounded-xl border border-slate-850/80">
                      <Mail className="h-10 w-10 text-slate-600 mb-4" />
                      <p className="text-slate-400 font-medium">Outreach draft skipped.</p>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">Emails are only compiled for prospects that qualify according to the target ICP criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
