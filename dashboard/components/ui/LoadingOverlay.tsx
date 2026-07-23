"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { LoadingGraphic } from "@/components/ui/LoadingGraphic";
import themeConfig from "@/theme-config.json";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [dots, setDots]         = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile once on mount and track resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Animated dots
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const postLoginConfig = isCyber
    ? themeConfig.loadingWorkflow.postLogin.cyberpunk
    : themeConfig.loadingWorkflow.postLogin["neo-brutalism"];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none w-screen h-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ backgroundColor: isCyber ? "#050816" : "#FFF5E4" }}
        >
          {/* Cyber scanlines grid background */}
          {isCyber && (
            <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
          )}

          {/* Inner modal card */}
          <div
            className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-xl relative z-10 border-solid"
            style={{
              ...postLoginConfig.containerStyle,
              borderWidth: isCyber ? "1px" : "3px",
            }}
          >
            {/* Pure Framer Motion Custom Theme Graphic */}
            <LoadingGraphic isCyber={isCyber} />

            {/* Post-login telemetry */}
            <div className="flex flex-col items-center gap-2 text-center px-4 max-w-xs sm:max-w-sm">
              <motion.h2
                className="font-black text-xs sm:text-sm tracking-[0.25em] uppercase font-mono"
                animate={{
                  color:      isCyber ? "#00F5FF" : "#1A1A1A",
                  textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.5)" : "none",
                }}
              >
                {postLoginConfig.title}{dots}
              </motion.h2>

              <p
                className="text-[10px] sm:text-xs font-mono font-medium text-center opacity-70 mt-1"
                style={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}
              >
                {postLoginConfig.statusText}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
