"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { theme, isTransitioning } = useTheme();
  const isCyber = theme === "cyber";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.div
      className="h-screen overflow-hidden flex flex-row"
      animate={{ backgroundColor: isCyber ? "#050816" : "#FFF5E4" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-col w-[72px] lg:w-60 shrink-0 h-full z-40 relative">
        <Sidebar collapsed={false} />
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 md:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              className="fixed top-0 left-0 z-[60] h-full md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar isMobileDrawer onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Cyber ambient orbs */}
        <AnimatePresence>
          {isCyber && <CyberAmbient />}
        </AnimatePresence>
        {/* Brutal grid */}
        <AnimatePresence>
          {!isCyber && <BrutalGrid />}
        </AnimatePresence>

        {/* Header topbar */}
        <Header onMenuToggle={() => setMobileOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: "thin" }}>
          {/* Theme flash */}
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                key="flash"
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

          {/* Content with padding */}
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </motion.div>
  );
}

// ── Cyber Ambient BG ──────────────────────────────────────────────────────────

function CyberAmbient() {
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
    >
      <motion.div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(circle, rgba(0,245,255,0.4) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <motion.div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ background: "radial-gradient(circle, rgba(191,95,255,0.4) 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,1) 2px, rgba(0,245,255,1) 3px)" }}
      />
    </motion.div>
  );
}

function BrutalGrid() {
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
    </motion.div>
  );
}
