"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 400);
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
        <div className="flex items-center gap-2 font-serif font-bold text-lg">
          <div className="w-7 h-7 rounded bg-[#C2410C] text-white flex items-center justify-center font-serif text-sm">
            L
          </div>
          LeadForge B2B Studio
        </div>
      </div>

      {/* Main Auth Container */}
      <div className="max-w-4xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden shadow-lg">
        {/* Left Editorial Panel */}
        <div className="p-8 md:p-10 bg-[#F5F2EB] border-b md:border-b-0 md:border-r border-[#E8E3D9] flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded bg-[#FAF7F2] border border-[#E8E3D9] text-[#C2410C]">
              Customer Quote
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1917] leading-snug">
              &ldquo;LeadForge transformed how our SDR team qualifies engineering prospects. The output precision is unmatched.&rdquo;
            </h2>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-xs text-[#1C1917]">Alex Mercer</p>
            <p className="text-[11px] text-[#78716C]">VP of Outbound, CloudScale Systems</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Sign in to Workspace</h3>
            <p className="text-xs text-[#78716C] mt-1">
              Enter your work credentials to access your lead intelligence stream.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
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
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#57534E]">Password</label>
                <a href="#" className="text-[#C2410C] hover:underline text-[11px]">
                  Forgot password?
                </a>
              </div>
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
              {loading ? "Signing in..." : "Sign In to Workspace"}
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
            onClick={handleDemoSignIn}
            className="w-full py-2.5 bg-[#F5F2EB] hover:bg-[#E8E3D9] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#047857]" />
            Instant Demo Sign In (No Password Needed)
          </button>

          <p className="text-center text-xs text-[#78716C]">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#C2410C] font-semibold hover:underline">
              Register here
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
