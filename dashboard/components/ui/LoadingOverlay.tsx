"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { useTheme } from "@/lib/theme";
import themeConfig from "@/theme-config.json";

// Desktop loading animations
import neoBrutalismLoading from "@/Neo-Brutalism-Loading.json";
import nexusXenonLoading   from "@/Nexus-Xenon-Loading.json";

// Mobile-optimised loading animations
import neoBrutalismMobile  from "@/Neo-Brutalism-Mobile.json";
import nexusXenonMobile    from "@/Nexus-Xenon-Mobile.json";

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

  // ── Pick the correct Lottie for this device × theme combination ──────────
  const lottieData = isCyber
    ? (isMobile ? nexusXenonMobile   : nexusXenonLoading)
    : (isMobile ? neoBrutalismMobile : neoBrutalismLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ backgroundColor: postLoginConfig.containerStyle.backgroundColor }}
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

          {/* Lottie — smaller on mobile, larger on desktop */}
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 flex items-center justify-center mb-4">
            <Lottie
              animationData={lottieData}
              loop={true}
              autoplay={true}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Post-login telemetry */}
          <div className="flex flex-col items-center gap-2 text-center px-4 max-w-xs sm:max-w-sm relative z-10">
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
              className="text-[10px] sm:text-xs font-mono font-medium text-center opacity-70"
              style={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}
            >
              {postLoginConfig.statusText}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
