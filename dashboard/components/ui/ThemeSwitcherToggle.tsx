"use client";

import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  toggleTrackBrutal,
  toggleTrackCyber,
  toggleThumbBrutal,
  toggleThumbCyber,
  springConfig,
} from "@/lib/theme/motionVariants";

export function ThemeSwitcherToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <motion.button
      id="theme-switcher-toggle"
      role="switch"
      aria-checked={isCyber}
      aria-label={`Switch to ${isCyber ? "Brutal" : "Cyber"} theme`}
      onClick={toggleTheme}
      disabled={isTransitioning}
      className="relative flex items-center gap-3 cursor-pointer select-none outline-none group"
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.92, y: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Label left */}
      <motion.span
        className="text-xs font-bold tracking-widest uppercase font-mono hidden sm:block"
        animate={{
          color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)",
          opacity: isCyber ? 0.5 : 1,
        }}
        transition={{ duration: 0.4 }}
      >
        BRT
      </motion.span>

      {/* Track */}
      <motion.div
        suppressHydrationWarning
        className="relative w-16 h-8 rounded-full border-2 overflow-hidden"
        style={{
          boxShadow: isCyber
            ? "0 0 15px rgba(0,245,255,0.3)"
            : "3px 3px 0px #000000",
        }}
        animate={isCyber ? toggleTrackCyber : toggleTrackBrutal}
        transition={{ type: "spring", stiffness: 220, damping: 22, duration: 0.6 }}
      >
        {/* Cyber scanline overlay */}
        {isCyber && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,0.06) 3px, rgba(0,245,255,0.06) 4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Thumb */}
        <motion.div
          layoutId="toggle-thumb"
          className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md"
          animate={isCyber ? toggleThumbCyber : toggleThumbBrutal}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <motion.span
            key={theme}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-xs leading-none"
          >
            {isCyber ? "⚡" : "☀️"}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Label right */}
      <motion.span
        className="text-xs font-bold tracking-widest uppercase font-mono hidden sm:block"
        animate={{
          color: isCyber ? "rgba(0,245,255,1)" : "rgba(0,0,0,0.4)",
          opacity: isCyber ? 1 : 0.5,
        }}
        transition={{ duration: 0.4 }}
      >
        CYB
      </motion.span>
    </motion.button>
  );
}
