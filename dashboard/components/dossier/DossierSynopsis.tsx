"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { ChevronDown, ChevronUp, AlignLeft } from "lucide-react";

export interface DossierSynopsisProps {
  synopsis?: string;
  themeConfig: ThemeAccentConfig;
}

export function DossierSynopsis({ synopsis, themeConfig }: DossierSynopsisProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [expanded, setExpanded] = useState(false);

  const text = synopsis || "No synopsis available for this title.";
  const isLong = text.length > 280;

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlignLeft size={18} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// SYNOPSIS & PLOT" : "Official Synopsis"}
          </h2>
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
            style={{ color: themeConfig.primaryAccent }}
          >
            <span>{expanded ? "Show Less" : "Read Full Synopsis"}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      <motion.div
        animate={{ height: "auto" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative"
      >
        <p
          className={`text-sm leading-relaxed ${
            !expanded && isLong ? "line-clamp-3" : ""
          }`}
          style={{ color: isCyber ? "#94A3B8" : "#374151" }}
        >
          {text}
        </p>

        {!expanded && isLong && (
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: isCyber
                ? "linear-gradient(180deg, transparent, rgba(10,15,44,0.95))"
                : "linear-gradient(180deg, transparent, rgba(255,255,255,0.95))",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
