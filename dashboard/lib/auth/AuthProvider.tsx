"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    const supabase = createClient();

    // Get initial session — always resolves, even for anonymous users
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setIsLoading(false);
    }).catch(() => {
      // Network error or similar — don't block UI forever
      setIsLoading(false);
    });

    // Listen for auth state changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      setUser((prevUser) => {
        if (prevUser?.id !== newUser?.id) {
          useDashboardStore.getState().resetUserStore();
          if (newUser) {
            useDashboardStore.getState().fetchDashboard();
          }
        }
        return newUser;
      });
      setIsLoading(false);
    });

    // Absolute safety timeout: never block the UI more than 3 seconds
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
