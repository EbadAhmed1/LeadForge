import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between p-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to LeadForge
        </Link>
        <div className="flex items-center gap-2 font-serif font-bold text-lg">
          <div className="w-7 h-7 rounded bg-[#C2410C] text-white flex items-center justify-center font-serif text-sm">
            L
          </div>
          LeadForge B2B Studio
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden shadow-lg">
        {/* Left Editorial Panel */}
        <div className="p-8 md:p-12 bg-[#F5F2EB] border-r border-[#E8E3D9] flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-[#FAF7F2] border border-[#E8E3D9] text-[#C2410C]">
              Get Started
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917] leading-snug">
              Create your LeadForge workspace and start scraping qualified B2B prospects today.
            </h2>
          </div>
          <div>
            <p className="font-semibold text-xs text-[#1C1917]">Free Trial Included</p>
            <p className="text-[11px] text-[#78716C]">50 free domain scrapes on signup</p>
          </div>
        </div>

        {/* Right Clerk Auth Form Panel */}
        <div className="p-8 flex items-center justify-center">
          <SignUp
            appearance={{
              elements: {
                card: "bg-[#FFFFFF] shadow-none p-0 border-none",
                headerTitle: "font-serif text-xl text-[#1C1917]",
                headerSubtitle: "text-xs text-[#78716C]",
                formButtonPrimary: "bg-[#C2410C] hover:bg-[#9A3412] text-xs font-semibold rounded-lg",
              },
            }}
          />
        </div>
      </div>

      <div className="text-center text-xs text-[#78716C]">
        © 2026 LeadForge Inc. All rights reserved.
      </div>
    </div>
  );
}
