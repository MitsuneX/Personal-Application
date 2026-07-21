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
import { Modal } from "@/components/ui/modal";

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
  const { 
    animeList, 
    favoriteCharacters, 
    removeAnime, 
    updateAnime, 
    saveFavoriteCharacter, 
    deleteFavoriteCharacter,
    toggleFavoriteCharacter
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  // Favorite Character States
  const [charModalOpen, setCharModalOpen] = useState(false);
  const [charEditId, setCharEditId] = useState<string | null>(null);
  const [charName, setCharName] = useState("");
  const [charAnime, setCharAnime] = useState("");

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

  const handleTotalEpisodesChange = useCallback((id: string, total: number) => {
    updateAnime(id, { totalEpisodes: total });
  }, [updateAnime]);

  const handleDelete = useCallback((id: string) => {
    const anime = animeList.find(a => a.id === id);
    if (anime && confirm(`Remove "${anime.title}" from watchlist?`)) {
      removeAnime(id);
    }
  }, [animeList, removeAnime]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id");

  useEffect(() => {
    if (targetId) {
      const timer = setTimeout(() => {
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
      return () => clearTimeout(timer);
    }
  }, [targetId, isCyber]);


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
                  posterUrl={anime.posterUrl}
                  synopsis={anime.synopsis}
                  cast={anime.cast}
                  isEditable={true}
                  onStatusChange={handleStatusChange}
                  onEpisodeChange={handleEpisodeChange}
                  onTotalEpisodesChange={handleTotalEpisodesChange}
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
        <div className="mt-12 border-t pt-8" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}>
          <div className="flex justify-between items-center mb-6">
            <motion.h2
              className="font-black text-lg theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "♥ FAV.CHARACTERS" : "♥ Favorite Characters"}
            </motion.h2>
            <button
              onClick={() => {
                setCharEditId(null);
                setCharName("");
                setCharAnime("");
                setCharModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-black rounded-lg transition-transform active:scale-95 border-adaptive-unique cursor-pointer"
              style={{
                backgroundColor: isCyber ? "#BF5FFF" : "#FF6B35",
                color: "#fff",
              }}
            >
              ＋ Add Character
            </button>
          </div>

          {favoriteCharacters.length === 0 ? (
            <div className="text-center py-10 border-adaptive-unique rounded-2xl opacity-60 bg-black/5 dark:bg-white/5">
              <p className="text-2xl mb-2">♥</p>
              <p className="text-xs font-bold theme-text-muted">No characters saved yet. Add your favorite characters above!</p>
            </div>
          ) : (
            <motion.div className="flex flex-wrap gap-3" variants={listContainerVariants} initial="hidden" animate="visible">
              {favoriteCharacters.map((c, i) => (
                <motion.div
                  key={c.id}
                  variants={listItemVariants}
                  custom={i}
                  className="px-4 py-2.5 rounded-xl relative group flex items-center justify-between min-w-[200px]"
                  style={{
                    background: isCyber ? "rgba(191,95,255,0.08)" : "rgba(255,107,53,0.08)",
                    border: isCyber ? "1px solid rgba(191,95,255,0.3)" : "2.5px solid #000",
                    boxShadow: isCyber ? "none" : "4px 4px 0 #000",
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="pr-16">
                    <p className="font-bold text-sm theme-text-primary leading-tight">{c.name}</p>
                    <p className="text-[10px] theme-text-muted mt-1 truncate max-w-[140px]">{c.anime}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Favorite Heart Button */}
                    <button
                      onClick={() => toggleFavoriteCharacter(c.id)}
                      className="p-1 text-xs hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                      title={c.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      {c.isFavorite ? "❤️" : "🤍"}
                    </button>

                    {/* Edit/Delete controls */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCharEditId(c.id);
                          setCharName(c.name);
                          setCharAnime(c.anime);
                          setCharModalOpen(true);
                        }}
                        className="p-1 text-[10px] bg-cyan-600 text-white rounded hover:bg-cyan-700 cursor-pointer"
                        title="Edit Character"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${c.name}"?`)) {
                            deleteFavoriteCharacter(c.id);
                          }
                        }}
                        className="p-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        title="Delete Character"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </AppShell>

      {/* Modals */}
      <AnimeSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ManualAnimeModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />

      {/* Favorite Character Modal */}
      <Modal isOpen={charModalOpen} onClose={() => setCharModalOpen(false)} maxWidth="max-w-md">
        <div className="p-6 relative">
          {isCyber && <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#BF5FFF]" />}
          
          <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
            <h3 className="font-black text-base theme-text-primary">{charEditId ? "Edit Character" : "New Favorite Character"}</h3>
            <button onClick={() => setCharModalOpen(false)} className="text-xs opacity-60">✕</button>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!charName.trim() || !charAnime.trim()) return;
            const id = charEditId || "char-" + Math.random().toString(36).substr(2, 9);
            await saveFavoriteCharacter(id, charName.trim(), charAnime.trim());
            setCharModalOpen(false);
          }} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Character Name</label>
              <input
                type="text"
                required
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="e.g. Kurisu Makise"
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Anime Source</label>
              <input
                type="text"
                required
                value={charAnime}
                onChange={(e) => setCharAnime(e.target.value)}
                placeholder="e.g. Steins;Gate"
                list="anime-suggestions"
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
              />
              <datalist id="anime-suggestions">
                {animeList.map(a => (
                  <option key={a.id} value={a.title} />
                ))}
              </datalist>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCharModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent theme-text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-black rounded-lg transition-transform active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "#BF5FFF" : "#FF6B35",
                  color: "#fff",
                }}
              >
                {charEditId ? "Save Changes" : "Enshrine Character"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

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
