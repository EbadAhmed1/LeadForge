"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import LeadForgeLogo from "@/components/LeadForgeLogo";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await signIn.password({ emailAddress: email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      // Activate the session and redirect
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(finalizeError.message);
        return;
      }
      router.push("/studio");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      setError(clerkErr.errors?.[0]?.message ?? "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);
    if (!signIn) {
      setLoading(false);
      setError("Authentication is still initializing. Please try again.");
      return;
    }
    const strategy = provider === "google" ? "oauth_google" : "oauth_github";
    try {
      await signIn.sso({ strategy, redirectUrl: "/studio", redirectCallbackUrl: "/sign-in" });
    } catch (err) {
      console.error("Clerk OAuth redirect failed:", err);
      setError("Unable to start social login. Please try again.");
      setLoading(false);
    }
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
        <div className="p-8 flex flex-col justify-center space-y-5">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Sign in to Workspace</h3>
            <p className="text-xs text-[#78716C] mt-1">
              Enter your credentials or continue with a social account.
            </p>
          </div>

          {/* Email / Password */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
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
              {loading ? "Signing in..." : "Sign In to Workspace"}
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

          {/* Social SSO */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialAuth("google")}
              disabled={loading || fetchStatus === "fetching"}
              className="w-full py-2 px-3 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth("github")}
              disabled={loading || fetchStatus === "fetching"}
              className="w-full py-2 px-3 bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#1C1917] border border-[#E8E3D9] text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#181717] fill-current shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>

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
