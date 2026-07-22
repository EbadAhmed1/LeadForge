"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Target, Check, Sliders, Building2, Users, Briefcase, Save } from "lucide-react";

export default function IcpRulesPage() {
  const [selectedIndustries, setSelectedIndustries] = useState([
    "B2B SaaS",
    "Cloud Infrastructure",
    "DevOps Tools",
  ]);
  const [minEmployees, setMinEmployees] = useState(50);
  const [maxEmployees, setMaxEmployees] = useState(500);
  const [offering, setOffering] = useState(
    "AI-powered cloud observability and automated performance monitoring platform that reduces latency and cloud infrastructure spend"
  );
  const [saved, setSaved] = useState(false);

  const availableIndustries = [
    "B2B SaaS",
    "Cloud Infrastructure",
    "DevOps Tools",
    "FinTech",
    "Cybersecurity",
    "AI Infrastructure",
    "Data Engineering",
    "E-commerce Logistics",
  ];

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#E8E3D9] pb-6 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917]">
                Ideal Customer Profile (ICP) & Offering
              </h1>
              <p className="text-xs text-[#57534E] mt-1">
                Configure your target industries, company size range, and product offering value proposition for AI lead scraping.
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              {saved ? <Check className="w-4 h-4 text-[#A7F3D0]" /> : <Save className="w-4 h-4" />}
              {saved ? "Rules Saved!" : "Save Profile Criteria"}
            </button>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Section 1: Target Industry Verticals */}
            <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C2410C]" />
                <h3 className="font-serif text-base font-bold text-[#1C1917]">
                  1. Target Industry Verticals
                </h3>
              </div>
              <p className="text-xs text-[#78716C]">
                Select target industries to filter scraped company evaluation:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableIndustries.map((ind) => {
                  const isSelected = selectedIndustries.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => toggleIndustry(ind)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#C2410C] text-white font-semibold"
                          : "bg-[#FAF7F2] text-[#57534E] border border-[#E8E3D9] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Company Size Range */}
            <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C2410C]" />
                <h3 className="font-serif text-base font-bold text-[#1C1917]">
                  2. Target Company Size Range
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#78716C]">Minimum Employees</label>
                  <input
                    type="number"
                    value={minEmployees}
                    onChange={(e) => setMinEmployees(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] font-medium focus:outline-none focus:border-[#C2410C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#78716C]">Maximum Employees</label>
                  <input
                    type="number"
                    value={maxEmployees}
                    onChange={(e) => setMaxEmployees(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] font-medium focus:outline-none focus:border-[#C2410C]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: What We Are Offering */}
            <div className="p-6 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C2410C]" />
                <h3 className="font-serif text-base font-bold text-[#1C1917]">
                  3. What We Are Offering
                </h3>
              </div>
              <p className="text-xs text-[#78716C]">
                Describe your product or service offering. The AI uses this to evaluate fit and write cold outreach emails:
              </p>
              <textarea
                rows={4}
                value={offering}
                onChange={(e) => setOffering(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] leading-relaxed focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
