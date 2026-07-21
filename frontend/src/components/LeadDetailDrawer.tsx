"use client";

import { useState } from "react";
import { X, Check, Copy, Send, Sparkles, Building2, Cpu, AlertCircle, ArrowUpRight } from "lucide-react";

interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    company_name: string;
    domain: string;
    score: number;
    reasoning: string;
    tech_stack: string[];
    pain_points: string[];
    decision_maker: string;
    email_subject: string;
    email_body: string;
  } | null;
}

export default function LeadDetailDrawer({ isOpen, onClose, lead }: LeadDetailDrawerProps) {
  const [tone, setTone] = useState<"Executive" | "Solution-First" | "Challenger">("Solution-First");
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState(lead?.email_subject || "");
  const [body, setBody] = useState(lead?.email_body || "");

  if (!isOpen || !lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1917]/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-4xl bg-[#FAF7F2] h-full shadow-2xl flex flex-col border-l border-[#E8E3D9] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E8E3D9] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] border border-[#E8E3D9] flex items-center justify-center font-serif text-lg font-bold text-[#C2410C]">
              {lead.company_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">{lead.company_name}</h3>
                <a
                  href={`https://${lead.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#78716C] hover:text-[#C2410C] flex items-center gap-0.5"
                >
                  {lead.domain} <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#78716C]">Scraped Dossier & Outreach Generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F2EB] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Split Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E3D9]">
          {/* Left Column: Scraped Intelligence Dossier */}
          <div className="p-6 space-y-6 bg-[#FAF7F2]">
            {/* Match Score Badge */}
            <div className="p-4 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  ICP Fit Rating
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  {lead.score}% MATCH
                </span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">{lead.reasoning}</p>
            </div>

            {/* Target Persona */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                Target Decision-Maker
              </label>
              <div className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg text-xs font-medium text-[#1C1917] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C2410C]" />
                {lead.decision_maker}
              </div>
            </div>

            {/* Scraped Pain Points */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                Identified Pain Points
              </label>
              <div className="space-y-2">
                {lead.pain_points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg text-xs text-[#57534E] flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Tech Stack */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                Detected Tech Stack
              </label>
              <div className="flex flex-wrap gap-1.5">
                {lead.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-xs bg-[#FFFFFF] border border-[#E8E3D9] rounded-md text-[#1C1917] font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Outreach Workshop */}
          <div className="p-6 space-y-6 bg-[#FFFFFF] flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-[#1C1917]">
                  Outreach Message Composer
                </h4>
                <div className="flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-lg border border-[#E8E3D9]">
                  {(["Executive", "Solution-First", "Challenger"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        tone === t
                          ? "bg-[#FFFFFF] text-[#1C1917] font-semibold shadow-2xs"
                          : "text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#78716C]">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] font-medium focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              {/* Body Rich Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#78716C]">Message Body</label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] leading-relaxed focus:outline-none focus:border-[#C2410C]"
                />
              </div>

              {/* Merge Variable Tags */}
              <div className="p-3 bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-xs space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">
                  Personalization Tokens Used
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#C2410C]">
                    [Company Name]
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#C2410C]">
                    [Primary Tech]
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FFFFFF] border border-[#E8E3D9] rounded text-[#C2410C]">
                    [Decision Maker Title]
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-between gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F5F2EB] hover:bg-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-[#047857]" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard" : "Copy Draft"}
              </button>
              <button className="px-5 py-2 text-xs font-medium bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                <Send className="w-4 h-4" />
                Queue Outreach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
