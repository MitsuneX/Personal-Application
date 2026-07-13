"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";

// ── Japanese Palette ──────────────────────────────────────────────────────────
// Brutal: sakura pink + ink black + cream
// Cyber:  digital neon cherry + deep indigo

const JP = {
  brutal: { bg: "#FDF0F3", surface: "#FFE4ED", border: "#2D1B24", accent: "#C9184A", accent2: "#FF6B9D", text: "#2D1B24" },
  cyber:  { bg: "#0D0616", surface: "rgba(201,24,74,0.08)", border: "rgba(255,105,180,0.4)", accent: "#FF69B4", accent2: "#BF5FFF", text: "#FFD1E8" },
};

function StarRow({ rating }: { rating: number }) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const col = isCyber ? JP.cyber.accent : JP.brutal.accent;
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating / 2) ? col : "rgba(128,128,128,0.3)", fontSize: "11px" }}>★</span>
      ))}
      <span className="font-mono text-xs ml-1" style={{ color: isCyber ? JP.cyber.accent : JP.brutal.accent }}>{rating}/10</span>
    </div>
  );
}

export default function JapaneseDramaPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const allDramas = useDashboardStore((s) => s.dramas);
  const dramas = allDramas.filter((d) => d.country === "japanese");
  const p = isCyber ? JP.cyber : JP.brutal;

  return (
    <AppShell>
      {/* Page hero */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #0D0616 0%, rgba(201,24,74,0.15) 50%, #0D0616 100%)"
            : "linear-gradient(135deg, #FFE4ED 0%, #FDF0F3 50%, #FFB7C5 100%)",
          border: isCyber ? `1px solid ${JP.cyber.border}` : `3px solid ${JP.brutal.border}`,
          boxShadow: isCyber ? `0 0 60px rgba(255,105,180,0.2)` : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {/* Decorative sakura petal pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["🌸","🌸","🌸","🌸","🌸","🌸"].map((p, i) => (
            <motion.span key={i} className="absolute text-4xl"
              style={{ left: `${10 + i * 16}%`, top: `${-10 + (i % 2) * 50}%` }}
              animate={{ y: [0, 8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            >
              🌸
            </motion.span>
          ))}
        </div>

        <div className="relative z-10">
          <motion.p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: isCyber ? JP.cyber.accent : JP.brutal.accent }}>
            {isCyber ? "// J-DRAMA.ARCHIVE" : "J-Drama Collection"}
          </motion.p>
          <h1 className="font-black text-3xl md:text-5xl mb-2" style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${JP.cyber.accent}` : "none" }}>
            {isCyber ? "日本 DRAMA" : "🇯🇵 Japanese Drama"}
          </h1>
          <p className="text-sm opacity-70" style={{ color: p.text }}>Thrilling survival, quiet beauty, and unforgettable stories from Japan</p>

          <div className="flex gap-4 mt-4">
            <div><p className="font-black text-xl" style={{ color: isCyber ? JP.cyber.accent : JP.brutal.accent }}>{dramas.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{dramas.filter((d) => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? JP.cyber.accent2 : "#FF6B9D" }}>{dramas.filter((d) => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
          </div>
        </div>
      </motion.div>

      {/* Drama grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={gridContainerVariants} initial="hidden" animate="visible">
        {dramas.map((drama, i) => {
          const pct = Math.round((drama.episodesWatched / drama.episodes) * 100);
          const isCompleted = drama.status === "Completed";

          return (
            <motion.div key={drama.id} variants={cardVariants} custom={i}>
              <motion.div
                className="rounded-xl p-5 h-full flex flex-col gap-3 relative overflow-hidden"
                style={{
                  background: isCyber ? JP.cyber.surface : JP.brutal.surface,
                  border: isCyber ? `1px solid ${JP.cyber.border}` : `2px solid ${JP.brutal.border}`,
                  boxShadow: isCyber ? `0 0 20px rgba(255,105,180,0.1)` : "4px 4px 0 rgba(0,0,0,1)",
                }}
                whileHover={{
                  boxShadow: isCyber ? `0 0 40px rgba(255,105,180,0.3)` : "7px 7px 0 rgba(0,0,0,1)",
                  y: isCyber ? 0 : -3,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Ink brush top accent */}
                {!isCyber && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${JP.brutal.accent}, ${JP.brutal.accent2}, transparent)` }} />}
                {isCyber && <motion.div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${JP.cyber.accent}, transparent)` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-base leading-snug" style={{ color: p.text }}>{drama.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: isCompleted ? (isCyber ? "rgba(57,255,20,0.15)" : "rgba(6,214,160,0.15)") : (isCyber ? `${JP.cyber.accent}20` : `${JP.brutal.accent}15`), color: isCompleted ? (isCyber ? "#39FF14" : "#06D6A0") : (isCyber ? JP.cyber.accent : JP.brutal.accent) }}>
                    {drama.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.genre}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.year}</span>
                  {drama.platform && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.platform}</span>}
                </div>

                {drama.cast && <p className="text-xs" style={{ color: isCyber ? "rgba(255,209,232,0.5)" : "rgba(45,27,36,0.5)" }}>✦ {drama.cast.join(" · ")}</p>}

                <StarRow rating={drama.rating} />

                {/* Progress */}
                <div>
                  <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }}>
                    <motion.div className="h-full rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }}
                      transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.4 + i * 0.05 }}
                      style={{ transformOrigin: "left", background: isCyber ? `linear-gradient(90deg, ${JP.cyber.accent}, ${JP.cyber.accent2})` : `linear-gradient(90deg, ${JP.brutal.accent}, ${JP.brutal.accent2})`, boxShadow: isCyber ? `0 0 8px ${JP.cyber.accent}` : "none" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: isCyber ? "rgba(255,209,232,0.5)" : "rgba(45,27,36,0.4)" }}>{drama.episodesWatched}/{drama.episodes} 話</span>
                    <span className="text-xs font-mono font-bold" style={{ color: isCyber ? JP.cyber.accent : JP.brutal.accent }}>{pct}%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </AppShell>
  );
}
