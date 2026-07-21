"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import Link from "next/link";
import {
  Bookmark,
  Search,
  Building2,
  Copy,
  Check,
  Trash2,
  ArrowUpRight,
  Plus,
  Target,
} from "lucide-react";

const initialSavedLeads = [
  {
    id: "saved-1",
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
  },
  {
    id: "saved-2",
    company_name: "CloudScale Systems",
    domain: "cloudscale.io",
    score: 96,
    reasoning: "High alignment with cloud infrastructure ICP. Scaling Kubernetes clusters and looking for automated observability tooling.",
    tech_stack: ["Kubernetes", "AWS", "Terraform", "Go"],
    pain_points: [
      "High Kubernetes cluster latency during peak traffic",
      "Manual multi-region cloud deployment overhead",
    ],
    decision_maker: "VP of Infrastructure / CTO",
    email_subject: "Observed Kubernetes cluster scaling challenges at CloudScale",
    email_body: "Hi Alex,\n\nI was reviewing CloudScale Systems' engineering blog and noticed your recent deployment of multi-region K8s clusters. As infrastructure complexity grows, latency spikes during peak load become a major bottleneck.\n\nWe built LeadForge to help engineering leaders streamline observability without adding agent overhead.\n\nWould you be open to a 10-minute brief next Tuesday?",
  },
  {
    id: "saved-3",
    company_name: "Stripe Infrastructure",
    domain: "stripe.com",
    score: 91,
    reasoning: "Matches Fintech & High-Concurrency Transaction Infrastructure profile.",
    tech_stack: ["Ruby", "Go", "PostgreSQL", "Kafka"],
    pain_points: [
      "Low-latency database synchronization across regional data centers",
      "Automating fraud monitoring trace log compression",
    ],
    decision_maker: "Chief Technology Officer / Head of Core Payments",
    email_subject: "Reducing database synchronization latency for Stripe Core",
    email_body: "Hi Patrick,\n\nManaging regional database sync latency during high payment volume spikes is a persistent challenge for payment infrastructure.\n\nWe've engineered a zero-overhead synchronization pipeline that cuts cross-region latency by 35%.\n\nLet's connect for 5 minutes next week.",
  },
];

export default function SavedLeadsPage() {
  const [savedLeads, setSavedLeads] = useState(initialSavedLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<typeof initialSavedLeads[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLeads = savedLeads.filter(
    (l) =>
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteLead = (id: string) => {
    setSavedLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCopyDraft = (id: string, subject: string, body: string) => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDrawer = (lead: typeof initialSavedLeads[0]) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

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
                <Bookmark className="w-5 h-5 text-[#C2410C]" />
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  My Saved Leads & Profile Dossiers
                </h1>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                View all target company dossiers, scraped pain points, and personalized email outreach drafts saved under your profile.
              </p>
            </div>

            <Link
              href="/"
              className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              Scrape New Domain
            </Link>
          </div>

          {/* Search Bar */}
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search saved leads by company or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
              />
            </div>

            <span className="text-xs text-[#78716C]">
              Showing <strong className="text-[#1C1917]">{filteredLeads.length}</strong> saved lead dossiers
            </span>
          </div>

          {/* Saved Leads Cards Grid */}
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4">
              <Building2 className="w-10 h-10 text-[#78716C] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">No Saved Leads Found</h3>
              <p className="text-xs text-[#57534E] max-w-sm mx-auto">
                You haven&apos;t saved any scraped lead dossiers to your profile yet. Enter a target domain in the Scraper Studio to analyze and save leads.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] text-white text-xs font-semibold rounded-xl"
              >
                Go to Scraper Studio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-[#E8E3D9] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-sm font-bold text-[#C2410C]">
                          {lead.company_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#1C1917]">
                            {lead.company_name}
                          </h3>
                          <p className="text-xs text-[#78716C]">{lead.domain}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shrink-0">
                        {lead.score}% FIT
                      </span>
                    </div>

                    {/* Decision Maker & Pain Points */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                          Decision Maker Persona
                        </span>
                        <p className="font-semibold text-[#1C1917] mt-0.5">{lead.decision_maker}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C]">
                          Detected Tech Stack
                        </span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {lead.tech_stack.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E8E3D9] rounded font-mono text-[#1C1917]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyDraft(lead.id, lead.email_subject, lead.email_body)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1"
                      >
                        {copiedId === lead.id ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === lead.id ? "Copied" : "Copy Draft"}
                      </button>

                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 text-[#78716C] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => openDrawer(lead)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#C2410C] bg-[#FAF7F2] hover:bg-[#F5F2EB] border border-[#E8E3D9] rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      Full Dossier & Email
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Split-pane Lead Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={selectedLead}
      />
    </div>
  );
}
