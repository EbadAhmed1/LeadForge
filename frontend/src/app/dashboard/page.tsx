"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import {
  Building2,
  Users,
  Mail,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Plus,
  RefreshCw,
} from "lucide-react";

// Mock/Default data representing LeadForge intelligence stream
const mockLeads = [
  {
    id: "lead-1",
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
    id: "lead-2",
    company_name: "Vercel Enterprise",
    domain: "vercel.com",
    score: 92,
    reasoning: "Strong match for frontend performance optimization and global CDN orchestration.",
    tech_stack: ["Next.js", "React", "TypeScript", "Edge Network"],
    pain_points: [
      "Optimizing Serverless Cold Start Latency",
      "Managing complex enterprise middleware rules",
    ],
    decision_maker: "Head of Developer Relations",
    email_subject: "Streamlining Edge deployment workflows for Vercel Enterprise",
    email_body: "Hi Sarah,\n\nI was following Vercel's latest Next.js release and saw the emphasis on edge middleware speed.\n\nOur team has developed an automated diagnostic workflow specifically for high-throughput Next.js architectures.\n\nLet's connect for 5 minutes if this aligns with your Q3 priorities.",
  },
  {
    id: "lead-3",
    company_name: "Datadog Security",
    domain: "datadoghq.com",
    score: 88,
    reasoning: "Good fit for enterprise log monitoring and real-time threat intelligence ingestion.",
    tech_stack: ["Python", "PostgreSQL", "Kafka", "Docker"],
    pain_points: ["Log ingestion spikes during DDoS attacks", "High storage cost for raw trace logs"],
    decision_maker: "Director of Cloud Security",
    email_subject: "Reducing log storage overhead for Datadog Security clusters",
    email_body: "Hi Mark,\n\nManaging Kafka log spikes during high-concurrency events is a persistent pain point for cloud security teams.\n\nWe've engineered a lightweight trace compression system that reduces raw storage costs by 40%.\n\nWorth a brief chat?",
  },
];

export default function DashboardPage() {
  const [selectedLead, setSelectedLead] = useState<typeof mockLeads[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = mockLeads.filter(
    (l) =>
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDrawer = (lead: typeof mockLeads[0]) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Workspace Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl overflow-y-auto">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3D9] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917]">
                  Lead Intelligence Workspace
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                Real-time target company scraping, ICP qualification scoring, and automated outreach.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3.5 py-2 text-xs font-medium text-[#57534E] bg-[#FFFFFF] border border-[#E8E3D9] hover:bg-[#F5F2EB] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Rescrape Queue
              </button>
              <button className="px-4 py-2 text-xs font-semibold bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                <Plus className="w-4 h-4" />
                Add Target Domains
              </button>
            </div>
          </div>

          {/* Metric Cards Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Scraped Domains</span>
                <Building2 className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-[#1C1917]">1,482</span>
                <span className="text-xs text-[#047857] font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">Active domain batch</p>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Qualified ICP Leads</span>
                <Users className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-[#1C1917]">348</span>
                <span className="text-xs text-[#047857] font-semibold">92.4% Rate</span>
              </div>
              <p className="text-[11px] text-[#78716C]">Score &gt; 80% threshold</p>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Outreach Messages</span>
                <Mail className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-[#1C1917]">294</span>
                <span className="text-xs text-[#047857] font-semibold">+38 today</span>
              </div>
              <p className="text-[11px] text-[#78716C]">Generated & queued</p>
            </div>

            <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Pipeline Conversion</span>
                <TrendingUp className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl font-bold text-[#1C1917]">18.4%</span>
                <span className="text-xs text-[#047857] font-semibold">Top Tier</span>
              </div>
              <p className="text-[11px] text-[#78716C]">Positive response rate</p>
            </div>
          </div>

          {/* Lead Table Section */}
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl overflow-hidden shadow-2xs space-y-4 p-5">
            {/* Table Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Search by company or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button className="px-3 py-2 text-xs font-medium text-[#57534E] bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg hover:bg-[#F5F2EB] flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#78716C]" />
                  Filter by Score (&gt; 90%)
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E3D9] bg-[#FAF7F2] text-[#78716C] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Target Company</th>
                    <th className="py-3 px-4">ICP Rating</th>
                    <th className="py-3 px-4">Tech Stack</th>
                    <th className="py-3 px-4">Decision Maker</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3D9]">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-sm font-bold text-[#C2410C]">
                            {lead.company_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C1917]">{lead.company_name}</p>
                            <p className="text-[11px] text-[#78716C]">{lead.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                          {lead.score}% MATCH
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.tech_stack.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 text-[10px] font-mono bg-[#FAF7F2] border border-[#E8E3D9] rounded text-[#1C1917]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#57534E]">
                        {lead.decision_maker}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openDrawer(lead)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#C2410C] bg-[#FAF7F2] hover:bg-[#F5F2EB] border border-[#E8E3D9] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          View Dossier & Draft
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Split-pane Detail Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={selectedLead}
      />
    </div>
  );
}
