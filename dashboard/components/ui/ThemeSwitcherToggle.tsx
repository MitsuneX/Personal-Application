"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export function ThemeSwitcherToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <div className="flex items-center h-10 shrink-0">
      <motion.button
        id="theme-switcher-toggle"
        role="switch"
        aria-checked={isCyber}
        aria-label={`Switch to ${isCyber ? "Brutal" : "Cyber"} theme`}
        onClick={toggleTheme}
        disabled={isTransitioning}
        className="relative flex items-center gap-2 cursor-pointer select-none outline-none h-10 px-2 rounded-xl border focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all"
        style={{
          backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "2px",
          boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
        }}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Label left */}
        <span
          className="text-[10px] font-black tracking-wider uppercase font-mono hidden xl:block"
          style={{
            color: isCyber ? "rgba(0,245,255,0.5)" : "#000000",
            opacity: isCyber ? 0.5 : 0.9,
          }}
        >
          NEO
        </span>

        {/* Track */}
        <div
          className="relative w-12 h-6 rounded-full border border-solid overflow-hidden flex items-center px-0.5 transition-all"
          style={{
            backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
            borderWidth: isCyber ? "1px" : "1.5px",
          }}
        >
          {/* Cyber scanline overlay */}
          {isCyber && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.1) 2px, rgba(0,245,255,0.1) 3px)",
              }}
            />
          )}

          {/* Thumb */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm z-10 ${
              isCyber ? "ml-auto" : "mr-auto"
            }`}
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FFE600",
              color: isCyber ? "#000000" : "#000000",
              border: isCyber ? "1px solid #FFFFFF" : "1.5px solid #000000",
              boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.8)" : "1px 1px 0 #000000",
            }}
          >
            <span>{isCyber ? "⚡" : "☀️"}</span>
          </motion.div>
        </div>

        {/* Label right */}
        <span
          className="text-[10px] font-black tracking-wider uppercase font-mono hidden xl:block"
          style={{
            color: isCyber ? "#00F5FF" : "rgba(0,0,0,0.4)",
            opacity: isCyber ? 1 : 0.5,
          }}
        >
          CYB
        </span>
      </motion.button>
    </div>
  );
}
