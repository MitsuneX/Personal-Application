"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import themeConfig from "@/theme-config.json";
import neoBrutalismLoading from "@/Neo-Brutalism-Loading.json";
import nexusXenonLoading from "@/Nexus-Xenon-Loading.json";

type Theme = "cyber" | "brutal";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("dashboard-theme") as Theme | null;
      if (stored === "brutal" || stored === "cyber") {
        return stored;
      }
    } catch {
      // Fallback if localStorage access fails
    }
  }
  return themeConfig.defaultTheme === "neo-brutalism" ? "brutal" : "brutal";
}

export function SplashGuard({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  // Synchronous theme evaluation to prevent flash of wrong loader animation on page refresh
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stored = getInitialTheme();
    setTheme(stored);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(iv);
  }, [isLoading]);

  const isCyber = theme === "cyber";
  const preLoginConfig = isCyber
    ? themeConfig.loadingWorkflow.preLogin.cyberpunk
    : themeConfig.loadingWorkflow.preLogin["neo-brutalism"];

  const lottieData = isCyber ? nexusXenonLoading : neoBrutalismLoading;

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
            style={{
              backgroundColor: preLoginConfig.containerStyle.backgroundColor,
            }}
          >
            {/* Cyber scanline / Neo-brutal grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: isCyber
                  ? "linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)"
                  : "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: isCyber ? "50px 50px" : "40px 40px",
              }}
            />

            {/* Lottie Animation Display */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mb-4">
              <Lottie
                animationData={lottieData}
                loop={true}
                autoplay={true}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Pre-Login Status & Branding */}
            <div className="flex flex-col items-center gap-2 text-center px-4 max-w-sm relative z-10">
              <motion.h1
                className="font-black text-2xl tracking-wider uppercase font-mono"
                style={{
                  color: isCyber ? "#00F5FF" : "#1A1A1A",
                  textShadow: isCyber ? preLoginConfig.containerStyle.boxShadow : "none",
                }}
              >
                {preLoginConfig.title}
              </motion.h1>

              <div
                className="px-3 py-1 rounded border text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFD700",
                  borderColor: preLoginConfig.containerStyle.borderColor,
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
                  color: isCyber ? "#00F5FF" : "#000000",
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
