"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "cyber" | "brutal";

// ─── Cyber Splash ─────────────────────────────────────────────────────────────

function CyberSplash() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 400);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #020817 0%, #050B1F 50%, #070E26 100%)" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Spinner ring */}
      <div className="relative mb-8">
        <motion.div
          className="w-20 h-20 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#00F5FF", borderRightColor: "#22C55E" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center text-2xl"
          style={{ textShadow: "0 0 20px rgba(0,245,255,0.8)" }}
        >
          ⚡
        </div>
      </div>

      <motion.h1
        className="font-black text-2xl mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          fontFamily: "var(--font-orbitron)",
          background: "linear-gradient(135deg, #00F5FF 0%, #22C55E 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        NEXUS XEON
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          color: "#00F5FF",
          opacity: 0.5,
        }}
      >
        {">"} AUTHENTICATING SESSION{dots}
      </motion.p>

      {/* Scanline */}
      <style>{`
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
      <div
        className="absolute left-0 right-0 h-px pointer-events-none opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, #00F5FF, transparent)",
          animation: "scan 3s linear infinite",
        }}
      />
    </div>
  );
}

// ─── Brutal Splash ────────────────────────────────────────────────────────────

function BrutalSplash() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#FFFEF0" }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="w-20 h-20 flex items-center justify-center text-4xl border-4 border-black"
          style={{ background: "#FFD700", boxShadow: "6px 6px 0px #000" }}
        >
          ⚡
        </div>

        <div className="text-center">
          <h1 className="font-black text-3xl uppercase tracking-tight text-black">
            NEXUS XEON
          </h1>
          <div className="flex items-center gap-1 justify-center mt-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">
              Loading
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-xs font-black"
            >
              •••
            </motion.span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-3 border-2 border-black overflow-hidden" style={{ background: "#fff" }}>
          <motion.div
            className="h-full"
            style={{ background: "#FFD700" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Splash Guard ─────────────────────────────────────────────────────────

export function SplashGuard({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("cyber");

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-theme");
    if (stored === "brutal" || stored === "cyber") setTheme(stored);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {theme === "cyber" ? <CyberSplash /> : <BrutalSplash />}
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
