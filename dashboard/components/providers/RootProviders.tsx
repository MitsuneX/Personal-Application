"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { SplashGuard } from "@/components/ui/SplashGuard";
import { ThemeProvider } from "@/lib/theme";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";

// Public routes that don't need the splash auth guard
const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

// ─── Inner: reads auth state and wraps with splash ────────────────────────────

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Activate realtime sync globally
  useRealtimeSync();

  // Skip splash guard on public/auth routes — show them immediately
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  if (isPublic) {
    return <>{children}</>;
  }

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
