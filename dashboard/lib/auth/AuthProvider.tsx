"use client";

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session — always resolves, even for anonymous users
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        // Network error or similar — don't block UI forever
        setIsLoading(false);
      });

    // Listen for auth state changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setIsLoading(false);
    });

    // Absolute safety timeout: never block the UI more than 3 seconds
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // ─── Synchronize Store Side Effects strictly after render commit ─────────────
  useEffect(() => {
    // Only execute store transitions once initial auth loading is complete
    if (isLoading) return;

    const currentUserId = user?.id ?? null;

    // Detect user transitions (login, logout, account switch)
    if (previousUserIdRef.current !== undefined && previousUserIdRef.current !== currentUserId) {
      useDashboardStore.getState().resetUserStore();
      if (user) {
        useDashboardStore.getState().fetchDashboard();
      }
    } else if (previousUserIdRef.current === undefined) {
      // Initial hydration upon auth resolution
      if (user && !useDashboardStore.getState().isHydrated) {
        useDashboardStore.getState().fetchDashboard();
      }
    }

    previousUserIdRef.current = currentUserId;
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

