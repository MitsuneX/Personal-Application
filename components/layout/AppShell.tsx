"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { theme, isTransitioning } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <motion.div
      id="app-shell"
      className="h-screen overflow-hidden flex flex-col relative"
      animate={{
        backgroundColor: isCyber ? "#050816" : "#FFF5E4",
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cyber BG ambient orbs */}
      <AnimatePresence>
        {isCyber && <CyberAmbient />}
      </AnimatePresence>

      {/* Brutal BG grid pattern */}
      <AnimatePresence>
        {!isCyber && <BrutalGrid />}
      </AnimatePresence>

      {/* ── Header ── */}
      <Header />

      {/* ── Main Content ── */}
      <motion.main
        className="flex-1 overflow-y-auto relative z-10"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Theme transition overlay flash */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              key="transition-flash"
              className="fixed inset-0 z-[100] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: isCyber
                  ? "radial-gradient(ellipse at center, rgba(0,245,255,0.8) 0%, transparent 70%)"
                  : "radial-gradient(ellipse at center, rgba(255,107,53,0.8) 0%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Inner content with responsive padding */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8">
          {children}
        </div>
      </motion.main>

      {/* Mobile bottom safe area */}
      <div className="h-safe-bottom shrink-0" />
    </motion.div>
  );
}

// ─── Cyber Ambient Background ─────────────────────────────────────────────────

function CyberAmbient() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Top-left cyan orb */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, rgba(0,245,255,0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Bottom-right violet orb */}
      <motion.div
        className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          background:
            "radial-gradient(circle, rgba(191,95,255,0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Center subtle glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full"
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          background:
            "radial-gradient(circle, rgba(0,245,255,0.3) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,1) 2px, rgba(0,245,255,1) 3px)",
        }}
      />
    </motion.div>
  );
}

// ─── Brutal Grid Background ────────────────────────────────────────────────────

function BrutalGrid() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </motion.div>
  );
}
