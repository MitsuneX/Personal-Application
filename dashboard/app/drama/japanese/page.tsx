"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";

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

const getDramaTokusatsuCategory = (drama: any, hofEntries: any[]) => {
  const title = drama.title.toLowerCase();
  if (title.includes("ultraman")) return "Ultraman";
  if (title.includes("kamen rider")) return "Kamen Rider";
  if (title.includes("power rangers") || title.includes("sentai")) return "Power Rangers";

  const genre = drama.genre?.toLowerCase() || "";
  if (genre.includes("tokusatsu") || genre.includes("toku")) {
    if (genre.includes("ultraman")) return "Ultraman";
    if (genre.includes("kamen rider") || genre.includes("rider")) return "Kamen Rider";
    if (genre.includes("power rangers") || genre.includes("sentai") || genre.includes("ranger")) return "Power Rangers";
    return "Tokusatsu";
  }

  const associatedActors = hofEntries.filter(actor => 
    actor.tokusatsuFranchise &&
    ((actor.associatedDramas && actor.associatedDramas.includes(drama.title)) ||
     (drama.cast && drama.cast.includes(actor.name)))
  );

  if (associatedActors.length > 0) {
    const franchise = associatedActors.find(a => a.tokusatsuFranchise)?.tokusatsuFranchise;
    return franchise || "Tokusatsu";
  }

  return "Actual Drama";
};

export default function JapaneseDramaPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, hallOfFame } = useDashboardStore();
  const [filterType, setFilterType] = useState<"all" | "actual" | "ultraman" | "kamen-rider" | "power-rangers" | "tokusatsu">("all");

  const dramas = [
    ...allDramas.filter((d) => d.country === "japanese"),
    ...dramaLog
      .filter((d) => d.country === "japanese")
      .map((d) => ({
        id: d.id,
        title: d.title,
        country: "japanese",
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

  const filteredDramas = dramas.filter((drama) => {
    const category = getDramaTokusatsuCategory(drama, hallOfFame);
    if (filterType === "all") return true;
    if (filterType === "actual") return category === "Actual Drama";
    if (filterType === "ultraman") return category === "Ultraman";
    if (filterType === "kamen-rider") return category === "Kamen Rider";
    if (filterType === "power-rangers") return category === "Power Rangers";
    if (filterType === "tokusatsu") return category !== "Actual Drama";
    return true;
  });

  const p = isCyber ? JP.cyber : JP.brutal;
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

      {/* Category Filter Toolbar */}
      <div 
        className="mb-6 p-1.5 rounded-xl flex flex-wrap gap-1.5 text-xs font-bold w-fit border"
        style={{
          backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(255,105,180,0.15)" : "#000000",
          borderWidth: isCyber ? "1.5px" : "3px",
          boxShadow: isCyber ? "none" : "4px 4px 0 #000"
        }}
      >
        {[
          { id: "all", label: "All Shows" },
          { id: "actual", label: "Actual Dramas" },
          { id: "ultraman", label: "🔴 Ultraman" },
          { id: "kamen-rider", label: "🟢 Kamen Rider" },
          { id: "power-rangers", label: "⚡ Power Rangers" },
          { id: "tokusatsu", label: "🦸 All Tokusatsu" }
        ].map((btn) => {
          const isActive = filterType === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className="py-1.5 px-3 rounded-lg transition-all uppercase tracking-wider text-[10px]"
              style={{
                backgroundColor: isActive
                  ? isCyber ? "rgba(255,105,180,0.2)" : "#FFB7C5"
                  : "transparent",
                color: isActive 
                  ? isCyber ? "#FF69B4" : "#000"
                  : isCyber ? "rgba(255,209,232,0.6)" : "#444",
                border: isActive && !isCyber ? "2px solid #000" : "2px solid transparent",
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Drama grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={gridContainerVariants} initial="hidden" animate="visible">
        {filteredDramas.map((drama, i) => {
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
                  <h3 className="font-black text-base leading-snug flex-1" style={{ color: p.text }}>{drama.title}</h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: isCompleted ? (isCyber ? "rgba(57,255,20,0.15)" : "rgba(6,214,160,0.15)") : (isCyber ? `${JP.cyber.accent}20` : `${JP.brutal.accent}15`), color: isCompleted ? (isCyber ? "#39FF14" : "#06D6A0") : (isCyber ? JP.cyber.accent : JP.brutal.accent) }}>
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
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.genre}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.year}</span>
                  {drama.platform && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: isCyber ? "#94A3B8" : "#6B7280" }}>{drama.platform}</span>}
                </div>

                {drama.cast && <p className="text-xs" style={{ color: isCyber ? "rgba(255,209,232,0.5)" : "rgba(45,27,36,0.5)" }}>✦ {drama.cast.join(" · ")}</p>}

                {(() => {
                  const associatedHofActors = hallOfFame.filter(actor => 
                    (actor.associatedDramas && actor.associatedDramas.includes(drama.title)) ||
                    (drama.cast && drama.cast.includes(actor.name))
                  );
                  if (associatedHofActors.length === 0) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 select-none">
                      <span className="text-[9px] uppercase tracking-wider font-black opacity-60" style={{ color: isCyber ? JP.cyber.accent : JP.brutal.accent }}>
                        HOF Stars:
                      </span>
                      {associatedHofActors.map(actor => (
                        <span 
                          key={actor.id}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 bg-black/10 dark:bg-white/5"
                          style={{ borderColor: isCyber ? JP.cyber.border : JP.brutal.border, color: p.text }}
                          title={actor.tokusatsuFranchise ? `${actor.name} (${actor.tokusatsuFranchise})` : actor.name}
                        >
                          {actor.tokusatsuFranchise && (
                            <span className="text-[10px]" title={actor.tokusatsuFranchise}>
                              {actor.tokusatsuFranchise === "Ultraman" ? "🔴" : actor.tokusatsuFranchise === "Kamen Rider" ? "🟢" : "⚡"}
                            </span>
                          )}
                          {actor.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}

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

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="japanese" />

      {/* Manual Drama Add Overlay */}
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="japanese" />

      <motion.button
        className="fixed bottom-[76px] right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
        style={{
          background: isCyber ? "linear-gradient(135deg, rgba(255,105,180,0.9), rgba(191,95,255,0.7))" : JP.brutal.accent,
          color: "#fff",
          border: isCyber ? "1px solid rgba(255,105,180,0.6)" : "2.5px solid #000",
          boxShadow: isCyber ? "0 0 24px rgba(255,105,180,0.4)" : "4px 4px 0 #000",
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
            : JP.brutal.accent2,
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
