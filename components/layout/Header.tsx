"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeSwitcherToggle } from "@/components/ui/ThemeSwitcherToggle";
import { logoVariants } from "@/lib/theme/motionVariants";

export function Header() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <motion.header
      className="relative z-50 flex items-center justify-between px-4 md:px-8 h-16 shrink-0"
      animate={{
        backgroundColor: isCyber
          ? "rgba(5, 8, 22, 0.85)"
          : "rgba(255, 245, 228, 0.95)",
        borderBottomColor: isCyber
          ? "rgba(0, 245, 255, 0.3)"
          : "rgba(0,0,0,1)",
        backdropFilter: isCyber ? "blur(20px)" : "blur(0px)",
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        borderBottomWidth: "2px",
        borderBottomStyle: "solid",
      }}
    >
      {/* Logo / Wordmark */}
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-3"
      >
        {/* Animated logo icon */}
        <motion.div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg relative overflow-hidden"
          animate={{
            backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
            boxShadow: isCyber
              ? "0 0 16px rgba(0,245,255,0.7), 0 0 40px rgba(0,245,255,0.3)"
              : "3px 3px 0px 0px rgba(0,0,0,1)",
            borderRadius: isCyber ? "8px" : "4px",
            color: isCyber ? "#050816" : "#fff",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.08, rotate: isCyber ? 5 : 0 }}
        >
          {isCyber ? "◈" : "✦"}
        </motion.div>

        {/* Wordmark */}
        <div className="flex flex-col leading-tight">
          <motion.span
            className="font-black text-sm md:text-base tracking-tight"
            animate={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber
                ? "'Orbitron', sans-serif"
                : "'Space Grotesk', sans-serif",
              letterSpacing: isCyber ? "0.1em" : "0.02em",
            }}
            transition={{ duration: 0.4 }}
          >
            {isCyber ? "NEXUS" : "Dashboard"}
          </motion.span>
          <motion.span
            className="text-xs tracking-widest uppercase hidden md:block"
            animate={{
              color: isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.45)",
            }}
            transition={{ duration: 0.4 }}
          >
            {isCyber ? "v2.0.1 // ONLINE" : "Personal Hub"}
          </motion.span>
        </div>
      </motion.div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Live clock — Cyber mode only */}
        {isCyber && <CyberClock />}

        {/* Theme switcher */}
        <ThemeSwitcherToggle />
      </div>
    </motion.header>
  );
}

// ─── Cyber Clock ──────────────────────────────────────────────────────────────

function CyberClock() {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold tracking-widest"
      style={{
        color: "#00F5FF",
        border: "1px solid rgba(0,245,255,0.3)",
        background: "rgba(0,245,255,0.05)",
        letterSpacing: "0.15em",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
      {time}
    </motion.div>
  );
}
