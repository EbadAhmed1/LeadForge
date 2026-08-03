"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, type AuthUser } from "@/lib/auth";

function SSOCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.replace(`/sign-in?error=${error}`);
      return;
    }

    if (token) {
      try {
        const [, payloadB64] = token.split(".");
        const pad = payloadB64.length % 4 ? "=".repeat(4 - (payloadB64.length % 4)) : "";
        const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/") + pad));
        const user: AuthUser = {
          id: payload.sub,
          email: payload.email ?? "",
          name: payload.name ?? "",
          tenantId: payload.tenant_id ?? "",
        };
        setAuth(token, user);
        router.replace("/studio");
      } catch {
        router.replace("/sign-in?error=invalid_token");
      }
    } else {
      router.replace("/studio");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center space-y-3 p-6 bg-white border border-[#E8E3D9] rounded-2xl shadow-sm">
        <div className="w-8 h-8 border-4 border-[#C2410C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#1C1917]">Completing login&hellip;</p>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <div className="w-8 h-8 border-4 border-[#C2410C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SSOCallbackInner />
    </Suspense>
  );
}
