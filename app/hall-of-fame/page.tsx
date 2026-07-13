"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import type { MediaStatus, HallOfFameEntry } from "@/lib/store/dashboardStore";

const HOF_TABS = [
  { id: "all",     label: "All",       icon: "◈" },
  { id: "actor",   label: "Actors",    icon: "🎭" },
  { id: "actress", label: "Actresses", icon: "💫" },
  { id: "anime",   label: "Anime",     icon: "⛩️"  },
];

const STATUS_STYLE: Record<MediaStatus, { bg: string; color: string; label: string; cyberGlow: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  color: "#FFD700", label: "👑 GOAT",     cyberGlow: "rgba(255,215,0,0.5)"   },
  "All-Star":    { bg: "rgba(0,245,255,0.1)",   color: "#00BFFF", label: "⭐ All-Star",  cyberGlow: "rgba(0,191,255,0.4)"   },
  "Rising":      { bg: "rgba(57,255,20,0.1)",   color: "#39FF14", label: "🚀 Rising",   cyberGlow: "rgba(57,255,20,0.35)"  },
  "Classic":     { bg: "rgba(191,95,255,0.1)",  color: "#BF5FFF", label: "💎 Classic",  cyberGlow: "rgba(191,95,255,0.35)" },
};

const BRUTAL_STATUS_STYLE: Record<MediaStatus, { bg: string; border: string; color: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  border: "#CC9900", color: "#8A6200" },
  "All-Star":    { bg: "rgba(0,150,200,0.1)",   border: "#0077AA", color: "#004A6E" },
  "Rising":      { bg: "rgba(6,214,160,0.1)",   border: "#2E8B10", color: "#1A5A08" },
  "Classic":     { bg: "rgba(157,78,221,0.1)",  border: "#7B3FA8", color: "#4A1A6E" },
};

function HOFCard({ entry, isCyber, index }: { entry: HallOfFameEntry; isCyber: boolean; index: number }) {
  const cyberStyle  = STATUS_STYLE[entry.status];
  const brutalStyle = BRUTAL_STATUS_STYLE[entry.status];
  const isGOAT      = entry.status === "GOAT Status";

  return (
    <motion.div variants={cardVariants} custom={index}>
      <motion.div
        className="rounded-xl p-5 h-full flex flex-col gap-3 relative overflow-hidden"
        style={{
          background: isCyber ? cyberStyle.bg : brutalStyle.bg,
          border: isCyber ? `1px solid ${cyberStyle.color}35` : `2px solid ${brutalStyle.border}`,
          boxShadow: isCyber ? `0 0 20px ${cyberStyle.cyberGlow}` : "4px 4px 0 rgba(0,0,0,1)",
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: isCyber ? `0 0 40px ${cyberStyle.cyberGlow}` : "7px 7px 0 rgba(0,0,0,1)",
          y: isCyber ? 0 : -3,
          transition: { duration: 0.2 },
        }}
      >
        {/* GOAT crown animation */}
        {isGOAT && (
          <motion.div
            className="absolute -top-1 -right-1 text-2xl"
            animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            👑
          </motion.div>
        )}

        {/* Cyber corner */}
        {isCyber && (
          <motion.div className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
            style={{ borderTop: `2px solid ${cyberStyle.color}`, borderLeft: `2px solid ${cyberStyle.color}` }}
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Type badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", color: isCyber ? "#94A3B8" : "#6B7280" }}>
            {entry.type === "actor" ? "🎭 Actor" : entry.type === "actress" ? "💫 Actress" : "⛩️ Anime"}
          </span>
          {entry.nationality && (
            <span className="text-xs" style={{ color: isCyber ? "#475569" : "#9CA3AF" }}>{entry.nationality}</span>
          )}
        </div>

        {/* Name */}
        <div>
          <h3 className="font-black text-lg leading-tight" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", textShadow: isCyber && isGOAT ? `0 0 12px ${cyberStyle.color}` : "none" }}>
            {entry.name}
          </h3>
          {entry.note && (
            <p className="text-xs mt-0.5 italic" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
              "{entry.note}"
            </p>
          )}
        </div>

        {/* Status badge */}
        <motion.span
          className="inline-block px-3 py-1 rounded-full text-xs font-black w-fit"
          style={{ backgroundColor: isCyber ? cyberStyle.bg : brutalStyle.bg, color: isCyber ? cyberStyle.color : brutalStyle.color, border: isCyber ? `1px solid ${cyberStyle.color}50` : `2px solid ${brutalStyle.border}` }}
          animate={isCyber ? { boxShadow: [`0 0 6px ${cyberStyle.cyberGlow}`, `0 0 14px ${cyberStyle.cyberGlow}`, `0 0 6px ${cyberStyle.cyberGlow}`] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {cyberStyle.label}
        </motion.span>

        {/* Known for */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {entry.knownFor.map((work) => (
            <span key={work} className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: isCyber ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", color: isCyber ? "#94A3B8" : "#6B7280", border: isCyber ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.1)" }}>
              {work}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const hallOfFame = useDashboardStore((s) => s.hallOfFame);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? hallOfFame : hallOfFame.filter((e) => e.type === activeTab);
  const goatCount = hallOfFame.filter((e) => e.status === "GOAT Status").length;

  return (
    <AppShell>
      {/* Hero banner */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(255,215,0,0.08), rgba(0,245,255,0.05))"
            : "linear-gradient(135deg, #FFF9C4, #FFF5E4, #FFE4B5)",
          border: isCyber ? "1px solid rgba(255,215,0,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 60px rgba(255,215,0,0.15)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {/* Trophy animations */}
        <motion.div className="flex justify-center gap-4 mb-4">
          {["🏆","👑","⭐","🏆"].map((e, i) => (
            <motion.span key={i} className="text-3xl" animate={{ y: [0, -8, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>{e}</motion.span>
          ))}
        </motion.div>

        <motion.h1 className="font-black text-3xl md:text-5xl mb-2"
          animate={{ color: isCyber ? "#FFD700" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? "0 0 20px rgba(255,215,0,0.8)" : "none" }}
          transition={{ duration: 0.4 }}>
          {isCyber ? "HALL OF FAME" : "Hall of Fame"}
        </motion.h1>
        <p className="theme-text-secondary text-sm">{goatCount} GOATs · {hallOfFame.length} legends enshrined</p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <TabSwitcher
          tabs={HOF_TABS.map((t) => ({
            ...t,
            count: t.id === "all" ? hallOfFame.length : hallOfFame.filter((e) => e.type === t.id).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {filtered.map((entry, i) => (
            <HOFCard key={entry.id} entry={entry} isCyber={isCyber} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
