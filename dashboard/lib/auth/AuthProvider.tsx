"use client";

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isGuest: false,
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    const checkGuestState = () => {
      if (typeof window === "undefined") return false;
      const hasGuestCookie = document.cookie.includes("is_guest=true");
      const hasGuestStorage = localStorage.getItem("is_guest") === "true";
      return hasGuestCookie || hasGuestStorage;
    };

    setIsGuest(checkGuestState());

    // Get initial session — always resolves, even for anonymous users
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user ?? null);
        setIsGuest(checkGuestState());
        setIsLoading(false);
      })
      .catch(() => {
        // Network error or similar — don't block UI forever
        setIsGuest(checkGuestState());
        setIsLoading(false);
      });

    // Listen for auth state changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setIsGuest(checkGuestState());
      setIsLoading(false);
    });

    // Absolute safety timeout: never block the UI more than 3 seconds
    const timeout = setTimeout(() => {
      setIsGuest(checkGuestState());
      setIsLoading(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const isAuthenticated = Boolean(user) || isGuest;

  // ─── Synchronize Store Side Effects strictly after render commit ─────────────
  useEffect(() => {
    // Only execute store transitions once initial auth loading is complete
    if (isLoading) return;

    const currentUserId = user?.id ?? (isGuest ? "guest" : null);

    // Detect user transitions (login, logout, account switch)
    if (previousUserIdRef.current !== undefined && previousUserIdRef.current !== currentUserId) {
      useDashboardStore.getState().resetUserStore();
      if (isAuthenticated) {
        useDashboardStore.getState().fetchDashboard();
      }
    } else if (previousUserIdRef.current === undefined) {
      // Initial hydration upon auth resolution
      if (isAuthenticated && !useDashboardStore.getState().isHydrated) {
        useDashboardStore.getState().fetchDashboard();
      }
    }

    previousUserIdRef.current = currentUserId;
  }, [user, isGuest, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

