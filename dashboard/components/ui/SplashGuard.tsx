"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import themeConfig from "@/theme-config.json";

// Desktop loading animations
import neoBrutalismLoading from "@/Neo-Brutalism-Loading.json";
import nexusXenonLoading   from "@/Nexus-Xenon-Loading.json";

// Mobile-optimised loading animations
import neoBrutalismMobile  from "@/Neo-Brutalism-Mobile.json";
import nexusXenonMobile    from "@/Nexus-Xenon-Mobile.json";

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
  // Both states initialised synchronously to avoid a re-render flash
  const [theme, setTheme]       = useState<Theme>(getInitialTheme);
  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile);
  const [dots, setDots]         = useState("");

  // Sync after mount (handles SSR mismatch)
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

  // ── Pick the correct Lottie for this device × theme combination ──────────
  const lottieData = isCyber
    ? (isMobile ? nexusXenonMobile   : nexusXenonLoading)
    : (isMobile ? neoBrutalismMobile : neoBrutalismLoading);

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
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
            style={{ backgroundColor: preLoginConfig.containerStyle.backgroundColor }}
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

            {/* Lottie — smaller on mobile, larger on desktop */}
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center mb-4">
              <Lottie
                animationData={lottieData}
                loop={true}
                autoplay={true}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Status text */}
            <div className="flex flex-col items-center gap-2 text-center px-4 max-w-xs sm:max-w-sm relative z-10">
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
                className="px-3 py-1 rounded border text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1"
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
