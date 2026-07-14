"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";

// ── Hollywood Palette ──────────────────────────────────────────────────────────
// Brutal: prestige purple, cream gold, deep navy on lavender
// Cyber:  neon violet, electric purple, spotlight gold grid

const HW = {
  brutal: {
    bg: "#F3E8FF",
    surface: "#EDE0FF",
    border: "#4C1D95",
    accent: "#7C3AED",
    accent2: "#F59E0B",
    text: "#1E1B4B",
    gold: "#D97706",
  },
  cyber: {
    bg: "#0A0618",
    surface: "rgba(124,58,237,0.08)",
    border: "rgba(167,139,250,0.4)",
    accent: "#A78BFA",
    accent2: "#FCD34D",
    text: "#EDE9FE",
    gold: "#FCD34D",
  },
};

export default function HollywoodDramaPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog } = useDashboardStore();
  const dramas = [
    ...allDramas.filter((d) => d.country === "hollywood"),
    ...dramaLog
      .filter((d) => d.country === "hollywood")
      .map((d) => ({
        id: d.id,
        title: d.title,
        country: "hollywood",
        episodes: d.type === "Movie" ? 1 : 16,
        episodesWatched: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? (d.type === "Movie" ? 1 : 16) : 0,
        status: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? "Completed" : "Watching",
        rating: d.rating ? Math.round(parseFloat(d.rating)) : 8,
        genre: d.type || "Series",
        year: d.releaseYear || 2026,
        platform: "OMDb Log",
        cast: d.mainActors,
      })),
  ];
  const p = isCyber ? HW.cyber : HW.brutal;
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <>
      <AppShell>
      {/* Page hero */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #0A0618 0%, rgba(124,58,237,0.15) 40%, rgba(252,211,77,0.06) 100%)"
            : "linear-gradient(135deg, #EDE0FF 0%, #F3E8FF 60%, #FEF3C7 100%)",
          border: isCyber ? `1px solid ${HW.cyber.border}` : `3px solid ${HW.brutal.border}`,
          boxShadow: isCyber
            ? `0 0 60px rgba(167,139,250,0.15), 0 0 120px rgba(252,211,77,0.05)`
            : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        {/* Spotlight / star field decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["⭐", "✨", "🌟", "⭐", "✨"].map((s, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl"
              style={{ right: `${8 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            >
              {s}
            </motion.span>
          ))}
          {/* Cyber clapperboard grid */}
          {isCyber && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(167,139,250,0.04) 40px, rgba(167,139,250,0.04) 41px)",
              }}
            />
          )}
        </div>

        <div className="relative z-10">
          <motion.p
            className="text-xs font-bold tracking-[0.25em] uppercase mb-2"
            style={{ color: isCyber ? HW.cyber.accent : HW.brutal.accent }}
          >
            {isCyber ? "// HOLLYWOOD.ARCHIVE" : "Hollywood Collection"}
          </motion.p>
          <h1
            className="font-black text-3xl md:text-5xl mb-2"
            style={{
              color: p.text,
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              textShadow: isCyber
                ? `0 0 20px ${HW.cyber.accent}, 0 0 60px ${HW.cyber.accent2}`
                : "none",
            }}
          >
            {isCyber ? "HOLLYWOOD_DRAMA" : "🎬 Hollywood Drama"}
          </h1>
          <p className="text-sm opacity-70" style={{ color: p.text }}>
            Blockbuster series, prestige TV, and cinematic universes from the West
          </p>

          <div className="flex gap-4 mt-4">
            <div>
              <p className="font-black text-xl" style={{ color: isCyber ? HW.cyber.accent : HW.brutal.accent }}>
                {dramas.length}
              </p>
              <p className="text-xs opacity-60" style={{ color: p.text }}>Total</p>
            </div>
            <div>
              <p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>
                {dramas.filter((d) => d.status === "Completed").length}
              </p>
              <p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p>
            </div>
            <div>
              <p className="font-black text-xl" style={{ color: isCyber ? HW.cyber.accent2 : HW.brutal.accent2 }}>
                {dramas.filter((d) => d.status === "Watching").length}
              </p>
              <p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Drama grid */}
      {dramas.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-24 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-6xl">🎬</span>
          <p className="font-black text-xl" style={{ color: p.text }}>No Hollywood dramas yet</p>
          <p className="text-sm opacity-60 text-center max-w-sm" style={{ color: p.text }}>
            Your Hollywood watch list is empty. Add shows via the Supabase dashboard or the editor.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {dramas.map((drama, i) => {
            const pct = Math.round((drama.episodesWatched / drama.episodes) * 100);
            const isCompleted = drama.status === "Completed";

            return (
              <motion.div key={drama.id} variants={cardVariants} custom={i}>
                <motion.div
                  className="rounded-xl p-5 h-full flex flex-col gap-3 relative overflow-hidden"
                  style={{
                    background: isCyber ? HW.cyber.surface : HW.brutal.surface,
                    border: isCyber ? `1px solid ${HW.cyber.border}` : `2px solid ${HW.brutal.border}`,
                    boxShadow: isCyber ? `0 0 20px rgba(167,139,250,0.08)` : "4px 4px 0 rgba(0,0,0,1)",
                  }}
                  whileHover={{
                    boxShadow: isCyber
                      ? `0 0 40px rgba(167,139,250,0.3), 0 0 80px rgba(252,211,77,0.08)`
                      : "7px 7px 0 rgba(0,0,0,1)",
                    y: isCyber ? 0 : -3,
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Spotlight beam in cyber / gold stripe in brutal */}
                  {isCyber && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${HW.cyber.accent}, ${HW.cyber.accent2}, transparent)`,
                      }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  )}
                  {!isCyber && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                      style={{
                        background: `linear-gradient(90deg, ${HW.brutal.accent}, ${HW.brutal.gold}, ${HW.brutal.accent})`,
                      }}
                    />
                  )}

                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base leading-snug flex-1" style={{ color: p.text }}>
                      {drama.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isCompleted
                            ? isCyber ? "rgba(57,255,20,0.15)" : "rgba(6,214,160,0.12)"
                            : isCyber ? `${HW.cyber.accent}20` : `${HW.brutal.accent}15`,
                          color: isCompleted
                            ? isCyber ? "#39FF14" : "#06D6A0"
                            : isCyber ? HW.cyber.accent : HW.brutal.accent,
                        }}
                      >
                        {drama.status}
                      </span>
                      {drama.id.startsWith("drama-") && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${drama.title}" from watchlist?`)) {
                              deleteDramaLog(drama.id);
                            }
                          }}
                          className="text-xs opacity-40 hover:opacity-100 hover:text-red-500 transition-all p-0.5 rounded"
                          title="Delete Drama"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {[drama.genre, String(drama.year), drama.platform].filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
                          color: isCyber ? "#94A3B8" : "#6B7280",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {drama.cast && drama.cast.length > 0 && (
                    <p className="text-xs" style={{ color: isCyber ? "rgba(237,233,254,0.4)" : "rgba(76,29,149,0.45)" }}>
                      ✦ {drama.cast.join(" · ")}
                    </p>
                  )}

                  {/* Star rating */}
                  <div className="flex gap-0.5 items-center">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span
                        key={j}
                        style={{
                          color: j < Math.round(drama.rating / 2)
                            ? isCyber ? HW.cyber.gold : HW.brutal.gold
                            : "rgba(128,128,128,0.3)",
                          fontSize: "11px",
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <span
                      className="font-mono text-xs ml-1"
                      style={{ color: isCyber ? HW.cyber.gold : HW.brutal.gold }}
                    >
                      {drama.rating}/10
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div
                      className="h-2 rounded-full overflow-hidden mb-1"
                      style={{ background: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: pct / 100 }}
                        transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.4 + i * 0.05 }}
                        style={{
                          transformOrigin: "left",
                          background: isCyber
                            ? `linear-gradient(90deg, ${HW.cyber.accent}, ${HW.cyber.accent2})`
                            : `linear-gradient(90deg, ${HW.brutal.accent}, ${HW.brutal.accent2})`,
                          boxShadow: isCyber ? `0 0 8px ${HW.cyber.accent}` : "none",
                        }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="text-xs"
                        style={{ color: isCyber ? "rgba(237,233,254,0.4)" : "rgba(76,29,149,0.4)" }}
                      >
                        {drama.episodesWatched}/{drama.episodes} eps
                      </span>
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: isCyber ? HW.cyber.accent : HW.brutal.accent }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="hollywood" />

      {/* Manual Drama Add Overlay */}
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="hollywood" />

      <motion.button
        className="fixed bottom-[76px] right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
        style={{
          background: isCyber ? "linear-gradient(135deg, rgba(167,139,250,0.9), rgba(252,211,77,0.6))" : HW.brutal.accent,
          color: "#fff",
          border: isCyber ? "1px solid rgba(167,139,250,0.6)" : "2.5px solid #000",
          boxShadow: isCyber ? "0 0 24px rgba(167,139,250,0.4)" : "4px 4px 0 #000",
          fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
        }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSearchOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring" as const, stiffness: 300, damping: 22 }}
      >
        <span>🔍</span>
        <span>{isCyber ? "SEARCH" : "Search Drama"}</span>
      </motion.button>

      {/* Floating Manual Add FAB */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #00F5FF, #bf5fff)"
            : HW.brutal.accent2,
          color: "#fff",
          border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2.5px solid #000",
          boxShadow: isCyber ? "0 0 24px rgba(0,245,255,0.3)" : "4px 4px 0 #000",
          fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
        }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setManualOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring" as const, stiffness: 300, damping: 22 }}
      >
        <span>＋</span>
        <span>{isCyber ? "MANUAL.ADD" : "Add Manually"}</span>
      </motion.button>
    </>
  );
}
