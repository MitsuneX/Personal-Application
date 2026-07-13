"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";

// ── Korean Palette ────────────────────────────────────────────────────────────
// Brutal: hanbok jewel tones — teal, crimson, gold on white
// Cyber:  holographic K-pop — cyan shimmer, holographic overlay

const KR = {
  brutal: { bg: "#F0FAFA", surface: "#E8F7F7", border: "#003366", accent: "#2EC4B6", accent2: "#E84855", text: "#003366", gold: "#F9B731" },
  cyber:  { bg: "#020D18", surface: "rgba(46,196,182,0.07)", border: "rgba(34,211,238,0.4)", accent: "#22D3EE", accent2: "#F472B6", text: "#E0F7FA", gold: "#FCD34D" },
};

export default function KoreanDramaPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const allDramas = useDashboardStore((s) => s.dramas);
  const dramas = allDramas.filter((d) => d.country === "korean");
  const p = isCyber ? KR.cyber : KR.brutal;

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
            ? "linear-gradient(135deg, #020D18 0%, rgba(22,211,238,0.12) 40%, rgba(244,114,182,0.08) 100%)"
            : "linear-gradient(135deg, #E8F7F7 0%, #F0FAFA 60%, #FFF9E6 100%)",
          border: isCyber ? `1px solid ${KR.cyber.border}` : `3px solid ${KR.brutal.border}`,
          boxShadow: isCyber ? `0 0 60px rgba(34,211,238,0.15), 0 0 120px rgba(244,114,182,0.08)` : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {/* Korean wave + mugunghwa decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["🌊","🌊","🌊"].map((w, i) => (
            <motion.span key={i} className="absolute text-5xl"
              style={{ right: `${5 + i * 15}%`, top: `${10 + i * 20}%` }}
              animate={{ x: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
            >
              {w}
            </motion.span>
          ))}
          {/* Holographic shimmer in cyber mode */}
          {isCyber && (
            <motion.div className="absolute inset-0"
              style={{ background: "linear-gradient(45deg, transparent 30%, rgba(34,211,238,0.05) 50%, transparent 70%)" }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </div>

        <div className="relative z-10">
          <motion.p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: isCyber ? KR.cyber.accent : KR.brutal.accent }}>
            {isCyber ? "// K-DRAMA.ARCHIVE" : "K-Drama Collection"}
          </motion.p>
          <h1 className="font-black text-3xl md:text-5xl mb-2"
            style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${KR.cyber.accent}, 0 0 60px ${KR.cyber.accent2}` : "none" }}
          >
            {isCyber ? "한국 DRAMA" : "🇰🇷 Korean Drama"}
          </h1>
          <p className="text-sm opacity-70" style={{ color: p.text }}>Romance, survival, and superhero sagas from the Korean Wave</p>

          <div className="flex gap-4 mt-4">
            <div><p className="font-black text-xl" style={{ color: isCyber ? KR.cyber.accent : KR.brutal.accent }}>{dramas.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{dramas.filter((d) => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? KR.cyber.accent2 : KR.brutal.accent2 }}>{dramas.filter((d) => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
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
                  background: isCyber ? KR.cyber.surface : KR.brutal.surface,
                  border: isCyber ? `1px solid ${KR.cyber.border}` : `2px solid ${KR.brutal.border}`,
                  boxShadow: isCyber ? `0 0 20px rgba(34,211,238,0.08)` : "4px 4px 0 rgba(0,0,0,1)",
                }}
                whileHover={{
                  boxShadow: isCyber ? `0 0 40px rgba(34,211,238,0.25), 0 0 80px rgba(244,114,182,0.1)` : "7px 7px 0 rgba(0,0,0,1)",
                  y: isCyber ? 0 : -3,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Holographic shimmer line */}
                {isCyber && <motion.div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${KR.cyber.accent}, ${KR.cyber.accent2}, transparent)` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />}
                {!isCyber && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${KR.brutal.accent}, ${KR.brutal.gold}, ${KR.brutal.accent2})` }} />}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-base leading-snug" style={{ color: p.text }}>{drama.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: isCompleted ? (isCyber ? "rgba(57,255,20,0.15)" : "rgba(6,214,160,0.12)") : (isCyber ? `${KR.cyber.accent}20` : `${KR.brutal.accent}15`), color: isCompleted ? (isCyber ? "#39FF14" : "#06D6A0") : (isCyber ? KR.cyber.accent : KR.brutal.accent) }}>
                    {drama.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[drama.genre, String(drama.year), drama.platform].filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{tag}</span>
                  ))}
                </div>

                {drama.cast && <p className="text-xs" style={{ color: isCyber ? "rgba(224,247,250,0.4)" : "rgba(0,51,102,0.45)" }}>✦ {drama.cast.join(" · ")}</p>}

                {/* Rating */}
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ color: j < Math.round(drama.rating / 2) ? (isCyber ? KR.cyber.gold : KR.brutal.gold) : "rgba(128,128,128,0.3)", fontSize: "11px" }}>★</span>
                  ))}
                  <span className="font-mono text-xs ml-1" style={{ color: isCyber ? KR.cyber.gold : KR.brutal.gold }}>{drama.rating}/10</span>
                </div>

                {/* Progress */}
                <div>
                  <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }}>
                    <motion.div className="h-full rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }}
                      transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.4 + i * 0.05 }}
                      style={{ transformOrigin: "left", background: isCyber ? `linear-gradient(90deg, ${KR.cyber.accent}, ${KR.cyber.accent2})` : `linear-gradient(90deg, ${KR.brutal.accent}, ${KR.brutal.accent2})`, boxShadow: isCyber ? `0 0 8px ${KR.cyber.accent}` : "none" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: isCyber ? "rgba(224,247,250,0.4)" : "rgba(0,51,102,0.4)" }}>{drama.episodesWatched}/{drama.episodes} eps</span>
                    <span className="text-xs font-mono font-bold" style={{ color: isCyber ? KR.cyber.accent : KR.brutal.accent }}>{pct}%</span>
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
