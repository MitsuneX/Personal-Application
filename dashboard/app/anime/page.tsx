"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants, listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";
import type { AnimeStatus } from "@/lib/store/dashboardStore";
import { AnimeSearchModal } from "@/components/ui/AnimeSearchModal";
import { ManualAnimeModal } from "@/components/ui/ManualAnimeModal";

const STATUS_TABS = [
  { id: "all",       label: "All",        icon: "◈" },
  { id: "Watching",  label: "Watching",   icon: "▶", },
  { id: "Completed", label: "Completed",  icon: "✓" },
  { id: "On Hold",   label: "On Hold",    icon: "⏸" },
];

const STATUS_COLORS: Record<string, string> = {
  Watching:        "#00F5FF",
  Completed:       "#39FF14",
  "On Hold":       "#FFD166",
  "Plan to Watch": "#BF5FFF",
  Dropped:         "#FF073A",
};
const BRUTAL_STATUS_COLORS: Record<string, string> = {
  Watching:        "#06D6A0",
  Completed:       "#155A8A",
  "On Hold":       "#8A6200",
  "Plan to Watch": "#5A1A8A",
  Dropped:         "#8A1A1A",
};

export default function AnimePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { animeList, favoriteCharacters, removeAnime } = useDashboardStore();
  const characters = favoriteCharacters.filter((c) => c.isFavorite);

  const [activeTab, setActiveTab] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const filtered = activeTab === "all"
    ? animeList
    : animeList.filter((a) => a.status === activeTab);

  // Stats
  const totalEps   = animeList.reduce((s, a) => s + a.episodesWatched, 0);
  const avgRating  = (animeList.filter((a) => a.rating).reduce((s, a) => s + (a.rating ?? 0), 0) / animeList.filter((a) => a.rating).length).toFixed(1);
  const completed  = animeList.filter((a) => a.status === "Completed").length;
  const watching   = animeList.filter((a) => a.status === "Watching").length;

  return (
    <>
      <AppShell>
      {/* Stats header */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: "Total Series", value: animeList.length,   color: isCyber ? "#00F5FF" : "#FF6B35", icon: "📚" },
          { label: "Completed",    value: completed,           color: isCyber ? "#39FF14" : "#06D6A0", icon: "✅" },
          { label: "Watching",     value: watching,            color: isCyber ? "#BF5FFF" : "#FFD166", icon: "▶️" },
          { label: "Eps Watched",  value: totalEps,            color: isCyber ? "#F472B6" : "#EF476F", icon: "🎞️" },
        ].map((s) => (
          <motion.div key={s.label} variants={cardVariants}>
            <div
              className="rounded-xl p-4"
              style={{
                background: isCyber ? `${s.color}0D` : `${s.color}12`,
                border: isCyber ? `1px solid ${s.color}30` : `2px solid ${s.color}`,
                boxShadow: isCyber ? `0 0 20px ${s.color}15` : "3px 3px 0 rgba(0,0,0,1)",
              }}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="font-black text-2xl mt-1" style={{ color: s.color, textShadow: isCyber ? `0 0 10px ${s.color}` : "none" }}>{s.value}</p>
              <p className="text-xs theme-text-muted font-semibold">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <div className="mb-5">
        <TabSwitcher
          tabs={STATUS_TABS.map((t) => ({
            ...t,
            count: t.id === "all" ? animeList.length : animeList.filter((a) => a.status === t.id).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Anime list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {filtered.map((anime, i) => {
            const pct = Math.round((anime.episodesWatched / anime.totalEpisodes) * 100);
            const color = isCyber ? STATUS_COLORS[anime.status] : BRUTAL_STATUS_COLORS[anime.status];

            return (
              <motion.div key={anime.id} variants={cardVariants} custom={i}>
                <BentoCard>
                  {/* Title + rating */}
                  <div className="flex items-start justify-between gap-2 mb-2 relative pr-6">
                    <h3 className="font-black text-sm theme-text-primary leading-snug flex-1">{anime.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {anime.rating && (
                        <motion.span className="font-mono font-black text-sm" animate={{ color: isCyber ? "#FFD700" : "#FF6B35", textShadow: isCyber ? "0 0 8px rgba(255,215,0,0.7)" : "none" }} transition={{ duration: 0.4 }}>
                          ★{anime.rating}
                        </motion.span>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${anime.title}" from watchlist?`)) {
                            removeAnime(anime.id);
                          }
                        }}
                        className="text-xs opacity-40 hover:opacity-100 hover:text-red-500 transition-all p-0.5 rounded"
                        title="Delete Anime"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {anime.genre && <span className="theme-badge" style={{ color: isCyber ? "#94A3B8" : "#6B7280", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}>{anime.genre}</span>}
                    {anime.year && <span className="theme-badge" style={{ color: isCyber ? "#94A3B8" : "#6B7280", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}>{anime.year}</span>}
                    {anime.studio && <span className="theme-badge" style={{ color: isCyber ? "#94A3B8" : "#6B7280", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}>{anime.studio}</span>}
                  </div>

                  {/* Status badge */}
                  <motion.span className="theme-badge mb-3 inline-block" style={{ color, backgroundColor: `${color}15`, borderColor: isCyber ? `${color}50` : color }}
                    animate={isCyber ? { boxShadow: [`0 0 4px ${color}40`, `0 0 10px ${color}60`, `0 0 4px ${color}40`] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {anime.status}
                  </motion.span>

                  {/* Progress */}
                  <div className="progress-track mb-1">
                    <motion.div className="progress-fill" initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }}
                      transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.3 + i * 0.04 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs theme-text-muted font-mono">{anime.episodesWatched}/{anime.totalEpisodes} eps</span>
                    <span className="text-xs font-mono font-bold" style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "#FF6B35" }}>{pct}%</span>
                  </div>
                </BentoCard>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Favorite characters */}
      <div className="mt-8">
        <motion.h2 className="font-black text-lg mb-4 theme-text-primary" animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }} transition={{ duration: 0.4 }}>
          {isCyber ? "♥ FAV.CHARACTERS" : "♥ Favourite Characters"}
        </motion.h2>
        <motion.div className="flex flex-wrap gap-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {characters.map((c, i) => (
            <motion.div key={c.id} variants={listItemVariants} custom={i}
              className="px-4 py-2.5 rounded-xl"
              style={{
                background: isCyber ? "rgba(191,95,255,0.08)" : "rgba(255,107,53,0.08)",
                border: isCyber ? "1px solid rgba(191,95,255,0.3)" : "2px solid rgba(0,0,0,0.2)",
              }}
              whileHover={{ scale: 1.04, boxShadow: isCyber ? "0 0 14px rgba(191,95,255,0.5)" : "3px 3px 0 rgba(0,0,0,1)" }}
            >
              <p className="font-bold text-sm theme-text-primary">{c.name}</p>
              <p className="text-xs theme-text-muted">{c.anime}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppShell>

    {/* Anime Database Search Overlay */}
    <AnimeSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

    {/* Manual Anime Add Overlay */}
    <ManualAnimeModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />

    {/* Floating Search Action Button */}
    <motion.button
      className="fixed bottom-[76px] right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
      style={{
        background: isCyber
          ? "linear-gradient(135deg, rgba(0,245,255,0.9), rgba(191,95,255,0.7))"
          : "#FF6B35",
        color: "#fff",
        border: isCyber ? "1px solid rgba(0,245,255,0.6)" : "2.5px solid #000",
        boxShadow: isCyber ? "0 0 24px rgba(0,245,255,0.4)" : "4px 4px 0 #000",
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
      <span>{isCyber ? "SEARCH.ANIME" : "Search Anime"}</span>
    </motion.button>

    {/* Floating Manual Add Button */}
    <motion.button
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl"
      style={{
        background: isCyber
          ? "linear-gradient(135deg, #00F5FF, #bf5fff)"
          : "#2EC4B6",
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
