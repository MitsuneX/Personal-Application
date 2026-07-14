"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";

// ── Chinese Palette ───────────────────────────────────────────────────────────
// Brutal: imperial red + jade + gold on cream
// Cyber:  celestial blue + gold neon + deep cosmos

const CN = {
  brutal: { bg: "#FFF8F0", surface: "#FFF0E0", border: "#7A0000", accent: "#C8102E", accent2: "#00A86B", gold: "#D4AF37", text: "#3D0000" },
  cyber:  { bg: "#030A1A", surface: "rgba(200,16,46,0.07)", border: "rgba(212,175,55,0.4)", accent: "#FFD700", accent2: "#C8102E", text: "#FFF8E7", jade: "#22C55E" },
};

function CloudPattern({ isCyber, color }: { isCyber: boolean; color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          className="absolute"
          style={{ left: `${(i * 18) % 100}%`, top: `${(i * 23) % 80}%`, width: "60px", height: "30px", borderRadius: "50%", backgroundColor: color, filter: "blur(8px)" }}
          animate={{ x: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}
    </div>
  );
}

export default function ChineseDramaPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog } = useDashboardStore();
  const dramas = [
    ...allDramas.filter((d) => d.country === "chinese"),
    ...dramaLog
      .filter((d) => d.country === "chinese")
      .map((d) => ({
        id: d.id,
        title: d.title,
        country: "chinese",
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
  const p = isCyber ? CN.cyber : CN.brutal;
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
            ? "linear-gradient(135deg, #030A1A 0%, rgba(200,16,46,0.12) 40%, rgba(212,175,55,0.08) 100%)"
            : "linear-gradient(135deg, #FFF0E0 0%, #FFF8F0 60%, #FFFDE7 100%)",
          border: isCyber ? `1px solid ${CN.cyber.border}` : `3px solid ${CN.brutal.border}`,
          boxShadow: isCyber ? `0 0 60px rgba(200,16,46,0.15), 0 0 120px rgba(212,175,55,0.08)` : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        <CloudPattern isCyber={isCyber} color={isCyber ? CN.cyber.accent : CN.brutal.gold} />

        {/* Dragon decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["🐉","⚔️","🏮"].map((e, i) => (
            <motion.span key={i} className="absolute text-4xl"
              style={{ right: `${8 + i * 12}%`, top: `${15 + i * 25}%` }}
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10">
          <motion.p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: isCyber ? CN.cyber.accent : CN.brutal.accent }}>
            {isCyber ? "// C-DRAMA.ARCHIVE" : "C-Drama Collection"}
          </motion.p>
          <h1 className="font-black text-3xl md:text-5xl mb-2"
            style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${CN.cyber.accent}, 0 0 60px ${CN.cyber.accent2}` : "none" }}
          >
            {isCyber ? "中国 DRAMA" : "🇨🇳 Chinese Drama"}
          </h1>
          <p className="text-sm opacity-70" style={{ color: p.text }}>Wuxia epics, historical intrigue, and celestial romance from China</p>
          <div className="flex gap-4 mt-4">
            <div><p className="font-black text-xl" style={{ color: isCyber ? CN.cyber.accent : CN.brutal.accent }}>{dramas.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{dramas.filter((d) => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
            <div><p className="font-black text-xl" style={{ color: isCyber ? CN.cyber.jade : CN.brutal.accent2 }}>{dramas.filter((d) => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
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
                  background: isCyber ? CN.cyber.surface : CN.brutal.surface,
                  border: isCyber ? `1px solid ${CN.cyber.border}` : `2px solid ${CN.brutal.border}`,
                  boxShadow: isCyber ? `0 0 20px rgba(200,16,46,0.08)` : "4px 4px 0 rgba(0,0,0,1)",
                }}
                whileHover={{
                  boxShadow: isCyber ? `0 0 40px rgba(212,175,55,0.3), 0 0 80px rgba(200,16,46,0.12)` : "7px 7px 0 rgba(0,0,0,1)",
                  y: isCyber ? 0 : -3,
                  transition: { duration: 0.2 },
                }}
              >
                {isCyber && <motion.div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${CN.cyber.accent}, ${CN.cyber.accent2}, transparent)` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />}
                {!isCyber && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${CN.brutal.accent}, ${CN.brutal.gold}, ${CN.brutal.accent2})` }} />}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-base leading-snug flex-1" style={{ color: p.text }}>{drama.title}</h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: isCompleted ? (isCyber ? "rgba(57,255,20,0.15)" : "rgba(6,214,160,0.12)") : (isCyber ? `${CN.cyber.accent}20` : `${CN.brutal.accent}15`), color: isCompleted ? (isCyber ? "#39FF14" : "#06D6A0") : (isCyber ? CN.cyber.accent : CN.brutal.accent) }}>
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

                <div className="flex flex-wrap gap-1.5">
                  {[drama.genre, String(drama.year), drama.platform].filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{tag}</span>
                  ))}
                </div>

                {drama.cast && <p className="text-xs" style={{ color: isCyber ? "rgba(255,248,231,0.4)" : "rgba(61,0,0,0.45)" }}>✦ {drama.cast.join(" · ")}</p>}

                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ color: j < Math.round(drama.rating / 2) ? (isCyber ? CN.cyber.accent : CN.brutal.gold) : "rgba(128,128,128,0.3)", fontSize: "11px" }}>★</span>
                  ))}
                  <span className="font-mono text-xs ml-1" style={{ color: isCyber ? CN.cyber.accent : CN.brutal.gold }}>{drama.rating}/10</span>
                </div>

                <div>
                  <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }}>
                    <motion.div className="h-full rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }}
                      transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.4 + i * 0.05 }}
                      style={{ transformOrigin: "left", background: isCyber ? `linear-gradient(90deg, ${CN.cyber.accent2}, ${CN.cyber.accent})` : `linear-gradient(90deg, ${CN.brutal.accent}, ${CN.brutal.gold})`, boxShadow: isCyber ? `0 0 8px ${CN.cyber.accent}` : "none" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: isCyber ? "rgba(255,248,231,0.4)" : "rgba(61,0,0,0.4)" }}>{drama.episodesWatched}/{drama.episodes} 集</span>
                    <span className="text-xs font-mono font-bold" style={{ color: isCyber ? CN.cyber.accent : CN.brutal.accent }}>{pct}%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="chinese" />

      {/* Manual Drama Add Overlay */}
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="chinese" />

      <motion.button
        className="fixed bottom-[76px] right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
        style={{
          background: isCyber ? "linear-gradient(135deg, rgba(255,215,0,0.9), rgba(200,16,46,0.7))" : CN.brutal.accent,
          color: "#fff",
          border: isCyber ? "1px solid rgba(255,215,0,0.6)" : "2.5px solid #000",
          boxShadow: isCyber ? "0 0 24px rgba(255,215,0,0.3)" : "4px 4px 0 #000",
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
            : CN.brutal.accent2,
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
