"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { SplashGuard } from "@/components/ui/SplashGuard";
import { ThemeProvider } from "@/lib/theme";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Public routes that don't need the splash auth guard
const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

// ─── Inner: reads auth state and wraps with splash ────────────────────────────

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Register service worker for PWA support without blocking the main thread
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered with scope:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

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

// ─── Root provider: composes toast + auth + theme + splash ────────────────────

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <AuthGateInner>
            {children}
          </AuthGateInner>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
