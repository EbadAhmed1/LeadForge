"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * SSO callback fallback page.
 *
 * With Clerk v7's signIn.sso() / signUp.sso(), the token exchange is handled
 * by Clerk internally and the user is redirected to the `redirectUrl` param
 * (e.g. /studio) directly.  This page exists only as a safety net — if a user
 * lands here for any reason, we redirect them to /studio.
 */
export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center space-y-3 p-6 bg-white border border-[#E8E3D9] rounded-2xl shadow-sm">
        <div className="w-8 h-8 border-4 border-[#C2410C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#1C1917]">Completing login&hellip;</p>
      </div>
    </div>
  );
}
