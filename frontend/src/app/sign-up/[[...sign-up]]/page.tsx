"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, User } from "lucide-react";
import LeadForgeLogo from "@/components/LeadForgeLogo";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const userObj = {
      email: email || "alex@company.com",
      name: name || "Alex Mercer",
      signedIn: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("leadforge_user", JSON.stringify(userObj));
    }
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 400);
  };

  const handleDemoSignUp = () => {
    setLoading(true);
    const userObj = {
      email: "alex@cloudscale.io",
      name: "Alex Mercer",
      signedIn: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("leadforge_user", JSON.stringify(userObj));
    }
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to LeadForge
        </Link>
        <LeadForgeLogo size="sm" />
      </div>

      {/* Main Auth Container */}
      <div className="max-w-4xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden shadow-lg">
        {/* Left Editorial Panel */}
        <div className="p-8 md:p-10 bg-[#F5F2EB] border-b md:border-b-0 md:border-r border-[#E8E3D9] flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-[#FAF7F2] border border-[#E8E3D9] text-[#C2410C]">
              Create Workspace
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917] leading-snug">
              Create your LeadForge workspace and start scraping qualified B2B prospects today.
            </h2>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-xs text-[#1C1917]">Free Trial Included</p>
            <p className="text-[11px] text-[#78716C]">50 free domain scrapes on signup</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Register Account</h3>
            <p className="text-xs text-[#78716C] mt-1">
              Set up your account to start generating B2B lead intelligence.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#57534E]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#57534E]">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#57534E]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Create Workspace Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E3D9] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] text-[#78716C] uppercase tracking-wider absolute">
              OR QUICK ACCESS
            </span>
          </div>

          <button
            onClick={handleDemoSignUp}
            className="w-full py-2.5 bg-[#F5F2EB] hover:bg-[#E8E3D9] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#047857]" />
            Instant Demo Registration
          </button>

          <p className="text-center text-xs text-[#78716C]">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#C2410C] font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-[#78716C]">
        © 2026 LeadForge Inc. All rights reserved.
      </div>
    </div>
  );
}
