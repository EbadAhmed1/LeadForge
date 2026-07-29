"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import React, { useState, useEffect, useRef } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://leadforge-saas.duckdns.org";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * Syncs the authenticated Clerk user into the backend database.
 * Called once per session, immediately after the user signs in.
 * This ensures every user has a UserProfile row in PostgreSQL before
 * they interact with any other feature (scraping, saved leads, etc.).
 */
function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return;

    const syncUser = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        syncedRef.current = true;
      } catch {
        // Non-fatal — user can still use the app; sync will retry next session
      }
    };

    void syncUser();
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Only mount the sync component when Clerk is configured — same
          condition used in layout.tsx to wrap the app with ClerkProvider. */}
      {hasClerkKey ? (
        <UserSyncProvider>{children}</UserSyncProvider>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
