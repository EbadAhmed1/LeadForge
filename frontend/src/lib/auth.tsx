"use client";

/**
 * src/lib/auth.tsx
 * ─────────────────
 * Custom auth context that replaces Clerk.
 * Stores the JWT in localStorage (for API calls) and a cookie (for middleware).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  tenantId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Store JWT + user info after a successful login / verify-email / OAuth */
  setAuth: (token: string, user: AuthUser) => void;
  /** Clear auth state and redirect to /sign-in */
  signOut: () => void;
  /** Returns the stored JWT (compatible with both sync and async call patterns) */
  getToken: () => Promise<string | null>;
}

const TOKEN_KEY = "leadforge_token";
const USER_KEY = "leadforge_user";

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function persistToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set as a cookie so the Edge middleware can read it
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      // Corrupted storage — start fresh
      clearToken();
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setAuth = useCallback((newToken: string, newUser: AuthUser) => {
    persistToken(newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    window.location.href = "/sign-in";
  }, []);

  const getToken = useCallback((): Promise<string | null> => {
    return Promise.resolve(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoaded,
        isSignedIn: !!token && !!user,
        setAuth,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
