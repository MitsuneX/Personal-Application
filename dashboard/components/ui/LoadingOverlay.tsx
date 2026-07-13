"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none loading-scanline"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFF5E4",
          }}
        >
          {/* Cyber scanlines grid background */}
          {isCyber && (
            <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
              <div className="absolute inset-0"
                style={{ backgroundImage: "linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
              />
            </div>
          )}

          {/* Loader Graphic: combination of Cyber & Neubrutal */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            {/* Cyber Neon ring */}
            <motion.div
              className="absolute w-24 h-24 rounded-full border-t-2 border-b-2 border-l-2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              style={{
                borderColor: isCyber ? "#00F5FF" : "#FF6B35",
                boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.6)" : "none",
              }}
            />

            {/* Cyber Outer Ring (reverse) */}
            <motion.div
              className="absolute w-28 h-28 rounded-full border-r-2 border-dashed"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              style={{
                borderColor: isCyber ? "#BF5FFF" : "#FFD166",
                boxShadow: isCyber ? "0 0 15px rgba(191,95,255,0.4)" : "none",
              }}
            />

            {/* Neubrutal Square center */}
            <motion.div
              className="w-12 h-12 flex items-center justify-center font-black text-lg border-3 border-black bg-white"
              animate={{
                rotate: [0, 90, 180, 270, 360],
                borderRadius: isCyber ? ["8px", "50%", "8px", "50%", "8px"] : ["4px", "4px", "4px", "4px", "4px"],
                boxShadow: isCyber 
                  ? ["0 0 10px rgba(0,245,255,0.5)", "0 0 10px rgba(191,95,255,0.5)", "0 0 10px rgba(0,245,255,0.5)", "0 0 10px rgba(191,95,255,0.5)", "0 0 10px rgba(0,245,255,0.5)"]
                  : ["3px 3px 0 #000", "3px -3px 0 #000", "-3px -3px 0 #000", "-3px 3px 0 #000", "3px 3px 0 #000"],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{
                color: "#1a1a1a",
              }}
            >
              {isCyber ? "◈" : "✦"}
            </motion.div>
          </div>

          {/* Telemetry/Loading message */}
          <div className="flex flex-col items-center gap-1.5 text-center px-4 max-w-sm relative z-10">
            <motion.h2
              className="font-black text-sm tracking-[0.25em] uppercase font-mono"
              animate={{
                color: isCyber ? "#00F5FF" : "#1A1A1A",
                textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.5)" : "none",
              }}
            >
              {isCyber ? `LOAD_NEXUS${dots}` : `Loading Hub${dots}`}
            </motion.h2>

            <p className="text-xs font-mono opacity-50 select-text font-medium text-center" style={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}>
              {isCyber ? "SYS::SYNCING_SUPABASE_POSTGRES" : "Connecting to database..."}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
