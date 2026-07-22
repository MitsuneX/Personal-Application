"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import type { MediaCategory } from "@/components/cards/MediaCard";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FloatingFABProps {
  category?: MediaCategory | "music";
  onSearch?: () => void;
  onManualAdd?: () => void;
  customActions?: Array<{ icon: string; label: string; onClick: () => void }>;
}

// ─── Cultural accent map ──────────────────────────────────────────────────────────

const ACCENTS: Record<MediaCategory | "music", { cyber: string; brutal: string; label: string }> = {
  japanese:  { cyber: "#FF69B4", brutal: "#C9184A", label: "J-Drama" },
  korean:    { cyber: "#22D3EE", brutal: "#2EC4B6", label: "K-Drama" },
  chinese:   { cyber: "#FFD700", brutal: "#C8102E", label: "C-Drama" },
  hollywood: { cyber: "#A78BFA", brutal: "#7C3AED", label: "Hollywood" },
  indonesia: { cyber: "#FF2A2A", brutal: "#E60000", label: "Indonesian" },
  anime:     { cyber: "#BF5FFF", brutal: "#FF6B35", label: "Anime" },
  music:     { cyber: "#00F5FF", brutal: "#FF6B35", label: "Music Vault" },
};

// ─── Sub-action item ──────────────────────────────────────────────────────────────

function FABAction({
  icon, label, onClick, accent, isCyber, index,
}: {
  icon: string; label: string; onClick: () => void;
  accent: string; isCyber: boolean; index: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      variants={{
        closed: { opacity: 0, y: 14, scale: 0.88, filter: "blur(4px)" },
        open: {
          opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
          transition: { delay: index * 0.06, type: "spring", stiffness: 420, damping: 28 },
        },
      }}
      whileHover={{ x: -4, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap"
      style={{
        background: isCyber
          ? `${accent}14`
          : "#FFFFFF",
        color: isCyber ? accent : "#111",
        border: isCyber ? `1px solid ${accent}45` : "2.5px solid #000",
        boxShadow: isCyber ? `0 0 20px ${accent}20, 0 4px 16px rgba(0,0,0,0.4)` : "3px 3px 0 #000",
        backdropFilter: isCyber ? "blur(16px)" : "none",
      }}
    >
      <span className="text-base leading-none">{icon}</span>
      <span style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", letterSpacing: isCyber ? "0.04em" : undefined }}>
        {label}
      </span>
    </motion.button>
  );
}

// ─── Main FAB ───────────────────────────────────────────────────────────────────

export function FloatingFAB({ category = "music", onSearch, onManualAdd, customActions }: FloatingFABProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const acc = ACCENTS[category];
  const accent = isCyber ? acc.cyber : acc.brutal;

  // Close on outside click
  const handleOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, handleOutside]);

  const actions = customActions
    ? customActions.map((act) => ({
        ...act,
        onClick: () => {
          act.onClick();
          setOpen(false);
        },
      }))
    : [
        { icon: "🔍", label: `Search ${acc.label} DB`, onClick: () => { onSearch?.(); setOpen(false); } },
        { icon: "＋", label: "Add Manual Log",          onClick: () => { onManualAdd?.(); setOpen(false); } },
      ];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2.5"
    >
      {/* ── Drop-up menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col items-end gap-2"
          >
            {[...actions].reverse().map((action, i) => (
              <FABAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                accent={accent}
                isCyber={isCyber}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main trigger button ── */}
      <div className="relative">
        {/* Pulsing glow ring — cyber only */}
        {isCyber && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 0 0px ${accent}70`,
                `0 0 0 10px ${accent}00`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.91 }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 26 }}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
          style={{
            background: isCyber
              ? `linear-gradient(135deg, ${accent}EE, ${accent}99)`
              : accent,
            border: isCyber ? `1px solid ${accent}` : "3px solid #000",
            boxShadow: isCyber
              ? `0 0 32px ${accent}55, 0 0 64px ${accent}22, 0 4px 20px rgba(0,0,0,0.5)`
              : "5px 5px 0 #000",
          }}
        >
          ✦
        </motion.button>
      </div>
    </div>
  );
}
