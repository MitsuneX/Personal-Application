"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { SplashGuard } from "@/components/ui/SplashGuard";
import { ThemeProvider } from "@/lib/theme";

// ─── Inner: reads auth state and wraps with splash ────────────────────────────

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  return (
    <SplashGuard isLoading={isLoading}>
      {children}
    </SplashGuard>
  );
}

// ─── Root provider: composes auth + theme + splash ────────────────────────────

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthGateInner>
          {children}
        </AuthGateInner>
      </ThemeProvider>
    </AuthProvider>
  );
}
