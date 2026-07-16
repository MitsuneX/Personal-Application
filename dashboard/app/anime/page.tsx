"use client";

import React, { useState, useCallback, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants, listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";
import { AnimeSearchModal } from "@/components/ui/AnimeSearchModal";
import { ManualAnimeModal } from "@/components/ui/ManualAnimeModal";
import { MediaCard } from "@/components/cards/MediaCard";
import { FloatingFAB } from "@/components/ui/FloatingFAB";
import { useSearchParams } from "next/navigation";

const STATUS_TABS = [
  { id: "all",             label: "All",          icon: "◈" },
  { id: "Watching",        label: "Watching",      icon: "▶" },
  { id: "Completed",       label: "Completed",     icon: "✓" },
  { id: "On Hold",         label: "On Hold",       icon: "⏸" },
  { id: "Plan to Watch",   label: "Plan to Watch", icon: "🕐" },
];

function AnimePageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { animeList, favoriteCharacters, removeAnime, updateAnime } = useDashboardStore();
  const characters = favoriteCharacters.filter(c => c.isFavorite);

  const [activeTab, setActiveTab] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const filtered = activeTab === "all"
    ? animeList
    : animeList.filter(a => a.status === activeTab);

  // Stats
  const totalEps  = animeList.reduce((s, a) => s + a.episodesWatched, 0);
  const rateable  = animeList.filter(a => a.rating);
  const avgRating = rateable.length
    ? (rateable.reduce((s, a) => s + (a.rating ?? 0), 0) / rateable.length).toFixed(1)
    : "—";
  const completed = animeList.filter(a => a.status === "Completed").length;
  const watching  = animeList.filter(a => a.status === "Watching").length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback((id: string, status: string) => {
    updateAnime(id, { status: status as any });
  }, [updateAnime]);

  const handleEpisodeChange = useCallback((id: string, watched: number, newStatus: string) => {
    updateAnime(id, { episodesWatched: watched, status: newStatus as any });
  }, [updateAnime]);

  const handleDelete = useCallback((id: string) => {
    const anime = animeList.find(a => a.id === id);
    if (anime && confirm(`Remove "${anime.title}" from watchlist?`)) {
      removeAnime(id);
    }
  }, [animeList, removeAnime]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const targetId = searchParams?.get("id");
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(`media-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.outline = isCyber ? `3px solid #BF5FFF` : `3.5px solid #FF6B35`;
          el.style.outlineOffset = "4px";
          el.style.borderRadius = "12px";
          setTimeout(() => {
            el.style.outline = "none";
          }, 3000);
        }
      }, 600);
    }
  }, [searchParams, isCyber]);

  return (
    <>
      <AppShell>
        {/* ── Stats header ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Total Series", value: animeList.length, color: isCyber ? "#00F5FF" : "#FF6B35",  icon: "📚" },
            { label: "Completed",    value: completed,        color: isCyber ? "#39FF14" : "#06D6A0",  icon: "✅" },
            { label: "Watching",     value: watching,         color: isCyber ? "#BF5FFF" : "#FFD166",  icon: "▶️" },
            { label: "Eps Watched",  value: totalEps,         color: isCyber ? "#F472B6" : "#EF476F",  icon: "🎞️" },
          ].map(s => (
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

        {/* ── Filter tabs ── */}
        <div className="mb-5">
          <TabSwitcher
            tabs={STATUS_TABS.map(t => ({
              ...t,
              count: t.id === "all" ? animeList.length : animeList.filter(a => a.status === t.id).length,
            }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* ── Anime card grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {filtered.map((anime, i) => (
              <motion.div key={anime.id} variants={cardVariants} custom={i}>
                <MediaCard
                  id={anime.id}
                  title={anime.title}
                  category="anime"
                  status={anime.status}
                  episodesWatched={anime.episodesWatched}
                  totalEpisodes={anime.totalEpisodes}
                  rating={anime.rating ?? 0}
                  genre={anime.genre}
                  year={anime.year}
                  platform={anime.studio}
                  isEditable={true}
                  onStatusChange={handleStatusChange}
                  onEpisodeChange={handleEpisodeChange}
                  onDelete={handleDelete}
                  index={i}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-4xl mb-3">⛩️</p>
            <p className="font-bold text-sm theme-text-primary">
              {activeTab === "all" ? "No anime in your list yet" : `No anime with status "${activeTab}"`}
            </p>
          </div>
        )}

        {/* ── Favourite characters ── */}
        {characters.length > 0 && (
          <div className="mt-10">
            <motion.h2
              className="font-black text-lg mb-4 theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "♥ FAV.CHARACTERS" : "♥ Favourite Characters"}
            </motion.h2>
            <motion.div className="flex flex-wrap gap-3" variants={listContainerVariants} initial="hidden" animate="visible">
              {characters.map((c, i) => (
                <motion.div
                  key={c.id}
                  variants={listItemVariants}
                  custom={i}
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
        )}
      </AppShell>

      {/* Modals */}
      <AnimeSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ManualAnimeModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />

      {/* Consolidated FAB */}
      <FloatingFAB
        category="anime"
        onSearch={() => setSearchOpen(true)}
        onManualAdd={() => setManualOpen(true)}
      />
    </>
  );
}

export default function AnimePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-40">Loading workspace...</div>}>
      <AnimePageContent />
    </Suspense>
  );
}
