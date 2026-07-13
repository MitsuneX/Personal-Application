"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, { title: string; icon: string }> = {
  "/":                  { title: "Dashboard",    icon: "🏠" },
  "/anime":             { title: "Anime Zone",   icon: "⛩️" },
  "/drama":             { title: "Drama",        icon: "🎬" },
  "/drama/japanese":    { title: "Japanese Drama", icon: "🇯🇵" },
  "/drama/korean":      { title: "Korean Drama", icon: "🇰🇷" },
  "/drama/chinese":     { title: "Chinese Drama", icon: "🇨🇳" },
  "/hall-of-fame":      { title: "Hall of Fame", icon: "🏆" },
  "/games":             { title: "Games",        icon: "🎮" },
};

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();

  const pageInfo = PAGE_TITLES[pathname] ?? { title: "Dashboard", icon: "🏠" };

  return (
    <motion.header
      className="flex items-center justify-between px-4 md:px-6 h-14 shrink-0 relative z-30"
      animate={{
        backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "rgba(255,245,228,0.9)",
        borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.15)",
        backdropFilter: isCyber ? "blur(20px)" : "blur(0px)",
      }}
      transition={{ duration: 0.4 }}
      style={{ borderBottomWidth: "1px", borderBottomStyle: "solid" }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <motion.button
          className="md:hidden p-2 rounded-lg"
          onClick={onMenuToggle}
          whileTap={{ scale: 0.9 }}
          animate={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect y="2" width="18" height="2" rx="1" />
            <rect y="8" width="18" height="2" rx="1" />
            <rect y="14" width="18" height="2" rx="1" />
          </svg>
        </motion.button>

        {/* Page title */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="flex items-center gap-2"
        >
          <span className="text-lg">{pageInfo.icon}</span>
          <motion.h1
            className="font-black text-base md:text-lg"
            animate={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              letterSpacing: isCyber ? "0.06em" : "0em",
            }}
            transition={{ duration: 0.4 }}
          >
            {isCyber ? pageInfo.title.toUpperCase() : pageInfo.title}
          </motion.h1>
        </motion.div>
      </div>

      {/* Right: cyber clock */}
      <div className="flex items-center gap-3">
        {isCyber && <CyberClock />}

        {/* Status dot */}
        <motion.div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          animate={{
            backgroundColor: isCyber ? "rgba(34,197,94,0.1)" : "rgba(6,214,160,0.1)",
            borderColor: isCyber ? "rgba(34,197,94,0.3)" : "#06D6A0",
          }}
          style={{ border: "1px solid" }}
          transition={{ duration: 0.4 }}
        >
          <span className="status-dot status-online !w-1.5 !h-1.5" />
          <span className="text-xs font-bold" style={{ color: "#22C55E" }}>Online</span>
        </motion.div>
      </div>
    </motion.header>
  );
}

function CyberClock() {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold tracking-widest"
      style={{ color: "#00F5FF", border: "1px solid rgba(0,245,255,0.25)", background: "rgba(0,245,255,0.05)", letterSpacing: "0.12em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
      {time}
    </motion.div>
  );
}
