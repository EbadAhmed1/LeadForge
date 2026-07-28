"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerkKey) {
    if (typeof window !== "undefined") {
      window.location.href = "/studio";
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center space-y-3 p-6 bg-white border border-[#E8E3D9] rounded-2xl shadow-sm">
        <div className="w-8 h-8 border-4 border-[#C2410C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#1C1917]">Completing Social SSO Login...</p>
        <AuthenticateWithRedirectCallback signInForceRedirectUrl="/studio" signUpForceRedirectUrl="/studio" />
      </div>
    </div>
  );
}
