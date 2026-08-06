"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { SplashGuard } from "@/components/ui/SplashGuard";
import { ThemeProvider } from "@/lib/theme";
import { useRealtimeSync } from "@/lib/hooks/useRealtimeSync";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/lib/context/ConfirmContext";
import { GlobalConfirmModal } from "@/components/ui/GlobalConfirmModal";

import { OverlayProvider } from "@/components/ui/OverlayProvider";
import { ContextMenuProvider } from "@/components/ui/ContextMenuProvider";
import { MusicEngineProvider } from "@/lib/context/MusicEngineContext";

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

// ─── Root provider: composes context menu + overlay + toast + confirm + auth + theme + splash + music engine ────────────────────

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ContextMenuProvider>
        <OverlayProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                <MusicEngineProvider>
                  <AuthGateInner>
                    {children}
                    <GlobalConfirmModal />
                  </AuthGateInner>
                </MusicEngineProvider>
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </OverlayProvider>
      </ContextMenuProvider>
    </ThemeProvider>
  );
}

