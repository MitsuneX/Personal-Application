"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingGraphic } from "@/components/ui/LoadingGraphic";
import themeConfig from "@/theme-config.json";

type Theme = "cyber" | "brutal";

// ─── Synchronous helpers (called before any render) ───────────────────────────

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("dashboard-theme") as Theme | null;
      if (stored === "brutal" || stored === "cyber") return stored;
    } catch { /* ignore */ }
  }
  return themeConfig.defaultTheme === "neo-brutalism" ? "brutal" : "brutal";
}

/** Returns true when the viewport is narrower than 768 px (phone/small tablet) */
function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SplashGuard({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  // Initialised deterministically to avoid SSR hydration mismatches
  const [theme, setTheme]       = useState<Theme>("brutal");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dots, setDots]         = useState("");

  // Sync after mount (handles SSR mismatch cleanly)
  useEffect(() => {
    setTheme(getInitialTheme());
    setIsMobile(getIsMobile());

    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Animated dots for status badge
  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(iv);
  }, [isLoading]);

  const isCyber = theme === "cyber";

  const preLoginConfig = isCyber
    ? themeConfig.loadingWorkflow.preLogin.cyberpunk
    : themeConfig.loadingWorkflow.preLogin["neo-brutalism"];

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="prelogin-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none w-screen h-screen"
            style={{ backgroundColor: isCyber ? "#050816" : "#FFF5E4" }}
          >
            {/* Background grid / scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: isCyber
                  ? "linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)"
                  : "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: isCyber ? "50px 50px" : "40px 40px",
              }}
            />

            {/* Inner modal card */}
            <div
              className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-xl relative z-10 border-solid"
              style={{
                ...preLoginConfig.containerStyle,
                borderWidth: isCyber ? "1px" : "3px",
              }}
            >
              {/* Pure Framer Motion Custom Theme Graphic */}
              <LoadingGraphic isCyber={isCyber} />

              {/* Status text */}
              <div className="flex flex-col items-center gap-2 text-center px-4 max-w-xs sm:max-w-sm">
                <motion.h1
                  className="font-black text-xl sm:text-2xl tracking-wider uppercase font-mono"
                  style={{
                    color: isCyber ? "#00F5FF" : "#1A1A1A",
                    textShadow: isCyber ? preLoginConfig.containerStyle.boxShadow : "none",
                  }}
                >
                  {preLoginConfig.title}
                </motion.h1>

                <div
                  className="px-3 py-1 rounded border text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1 mt-2"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFD700",
                    borderColor:  preLoginConfig.containerStyle.borderColor,
                    borderWidth:  isCyber ? "1px" : "2.5px",
                    boxShadow:    isCyber ? "none" : "3px 3px 0px #000000",
                    color:        isCyber ? "#00F5FF" : "#000000",
                  }}
                >
                  <span>{preLoginConfig.statusText.replace("...", "")}{dots}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}
