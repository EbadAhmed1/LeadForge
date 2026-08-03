"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, User } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth";
import LeadForgeLogo from "@/components/LeadForgeLogo";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://leadforge-saas.duckdns.org";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Registration failed.");
        return;
      }
      setVerifying(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Verification failed.");
        return;
      }
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatarUrl: data.user.avatar_url,
        tenantId: data.user.tenant_id,
      };
      setAuth(data.access_token, user);
      router.push("/studio");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAuth = () => {
    window.location.href = `${API_BASE}/api/v1/auth/oauth/github`;
  };

  // ── Email verification step ───────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => setVerifying(false)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <LeadForgeLogo size="sm" />
        </div>
        <div className="max-w-md w-full mx-auto my-8 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl p-8 shadow-lg space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Verify your email</h3>
            <p className="text-xs text-[#78716C] mt-1">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-[#1C1917]">{email}</span>. Enter it below to
              activate your account.
            </p>
          </div>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#57534E]">Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-[#78716C]" />
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E3D9] rounded-lg text-[#1C1917] focus:outline-none focus:border-[#C2410C] tracking-widest"
                />
              </div>
            </div>
            {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Verify & Activate Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        <div className="text-center text-xs text-[#78716C]">© 2026 LeadForge Inc. All rights reserved.</div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col justify-between p-4 sm:p-6">
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

      <div className="max-w-4xl w-full mx-auto my-8 grid grid-cols-1 md:grid-cols-2 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden shadow-lg">
        {/* Left Panel */}
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
        <div className="p-8 flex flex-col justify-center space-y-5">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Register Account</h3>
            <p className="text-xs text-[#78716C] mt-1">
              Create your account with email or use GitHub.
            </p>
          </div>

          {/* Email / Password / Name */}
          <form onSubmit={handleEmailSignUp} className="space-y-3">
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
            {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Create Workspace Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E3D9] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] text-[#78716C] uppercase tracking-wider absolute">
              or continue with
            </span>
          </div>

          {/* GitHub SSO */}
          <button
            type="button"
            onClick={handleGitHubAuth}
            disabled={loading}
            className="w-full py-2 px-3 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-[#181717] fill-current shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
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
