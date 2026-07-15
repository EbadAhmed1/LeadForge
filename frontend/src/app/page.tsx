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
  AlertCircle
} from "lucide-react";

// API base URL - matching backend default configuration
const API_BASE_URL = "http://localhost:8000/api/v1";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

          {/* URL SUBMISSION FORM */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Globe className="h-5 w-5" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://company.com/about-us"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={discoverMutation.isPending || (jobStatus && jobStatus.status === "in_progress")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
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
