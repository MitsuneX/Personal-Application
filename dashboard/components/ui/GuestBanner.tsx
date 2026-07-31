"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";

export function GuestBanner() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkGuest = () => {
      const isGuestCookie = document.cookie.includes("is_guest=true");
      const isGuestStorage = localStorage.getItem("is_guest") === "true";
      setIsGuest(isGuestCookie || isGuestStorage);
    };

    checkGuest();
    const interval = setInterval(checkGuest, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleExitGuest = () => {
    document.cookie = "is_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("is_guest");
    setIsGuest(false);
    router.push("/login");
  };

  if (!isGuest) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full shrink-0 relative z-30 overflow-hidden"
        style={{
          background: isCyber
            ? "linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,107,53,0.15) 100%)"
            : "#FFD700",
          borderBottom: isCyber ? "1px solid rgba(255,215,0,0.4)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 15px rgba(255,215,0,0.2)" : "none",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-between text-xs font-bold gap-3">
          <div className="flex items-center gap-2 text-black dark:text-[#FFD700]">
            <span className="text-base">🚀</span>
            <span className="uppercase tracking-widest font-black" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
              GUEST DEMO SESSION
            </span>
            <span className="hidden sm:inline opacity-80 font-normal">
              — Temporary Sandbox Mode. Changes are stored in-memory and will not persist to PostgreSQL.
            </span>
          </div>

          <button
            onClick={handleExitGuest}
            className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded transition-all shrink-0 cursor-pointer"
            style={{
              background: isCyber ? "#FFD700" : "#000",
              color: isCyber ? "#000" : "#FFF",
              border: isCyber ? "1px solid #FFD700" : "2px solid #000",
              fontFamily: isCyber ? "var(--font-jetbrains-mono)" : "inherit",
            }}
          >
            EXIT GUEST →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
