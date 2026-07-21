"use client";

import React, { useState, useCallback, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";
import { MediaCard } from "@/components/cards/MediaCard";
import { FloatingFAB } from "@/components/ui/FloatingFAB";
import { useSearchParams } from "next/navigation";

const HW = {
  brutal: { text: "#1E1B4B", accent: "#7C3AED", accent2: "#D97706" },
  cyber:  { text: "#EDE9FE", accent: "#A78BFA", accent2: "#FCD34D" },
};

function HollywoodDramaPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, removeDrama, updateDrama } = useDashboardStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? HW.cyber : HW.brutal;

  const editableEntries = allDramas
    .filter(d => d.country === "hollywood")
    .map(d => ({
      id: d.id, title: d.title,
      episodes: d.episodes, episodesWatched: d.episodesWatched,
      status: d.status, rating: d.rating ?? 8,
      genre: d.genre, year: d.year, platform: d.platform,
      cast: d.cast,
      isEditable: true,
      posterUrl: undefined as string | undefined,
      synopsis: undefined as string | undefined,
    }));

  const logEntries = dramaLog
    .filter(d => d.country === "hollywood")
    .map(d => ({
      id: d.id, title: d.title,
      episodes: d.type === "Movie" ? 1 : 16,
      episodesWatched: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? (d.type === "Movie" ? 1 : 16) : 0,
      status: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? "Completed" : "Watching",
      rating: d.rating ? Math.round(parseFloat(d.rating)) : 8,
      genre: d.type ?? "Series", year: d.releaseYear ?? 2026, platform: "OMDb Log",
      cast: d.mainActors,
      isEditable: false,
      posterUrl: d.posterUrl ?? undefined,
      synopsis: d.plotSummary ?? undefined,
    }));

  const allMerged = [...editableEntries, ...logEntries];

  const handleStatusChange = useCallback((id: string, status: string) => {
    updateDrama(id, { status: status as any });
  }, [updateDrama]);

  const handleEpisodeChange = useCallback((id: string, watched: number, newStatus: string) => {
    updateDrama(id, { episodesWatched: watched, status: newStatus as any });
  }, [updateDrama]);

  const handleTotalEpisodesChange = useCallback((id: string, total: number) => {
    updateDrama(id, { episodes: total });
  }, [updateDrama]);

  const handleDelete = useCallback((id: string) => {
    const drama = allMerged.find(d => d.id === id);
    if (drama && confirm(`Remove "${drama.title}" from watchlist?`)) {
      if (drama.isEditable) {
        removeDrama(id);
      } else {
        deleteDramaLog(id);
      }
    }
  }, [allMerged, removeDrama, deleteDramaLog]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id");

  useEffect(() => {
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`media-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.outline = isCyber ? `3px solid ${p.accent}` : `3.5px solid ${p.accent}`;
          el.style.outlineOffset = "4px";
          el.style.borderRadius = "12px";
          setTimeout(() => {
            el.style.outline = "none";
          }, 3000);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [targetId, isCyber, p.accent]);

  return (
    <>
      <AppShell>
        {/* ── Banner ── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #0A0618 0%, rgba(124,58,237,0.15) 40%, rgba(252,211,77,0.06) 100%)"
              : "linear-gradient(135deg, #EDE0FF 0%, #F3E8FF 60%, #FEF3C7 100%)",
            border: isCyber ? "1px solid rgba(167,139,250,0.3)" : "3px solid #4C1D95",
            boxShadow: isCyber ? "0 0 60px rgba(167,139,250,0.15), 0 0 120px rgba(252,211,77,0.05)" : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          {/* Star / spotlight decor */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {["⭐","✨","🌟","⭐","✨"].map((s, i) => (
              <motion.span key={i} className="absolute text-4xl"
                style={{ right: `${8 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              >{s}</motion.span>
            ))}
            {isCyber && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(167,139,250,0.04) 40px, rgba(167,139,250,0.04) 41px)" }}
              />
            )}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: p.accent }}>
                {isCyber ? "// HOLLYWOOD.ARCHIVE" : "Hollywood Collection"}
              </p>
              <h1 className="font-black text-3xl md:text-5xl mb-1"
                style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${p.accent}, 0 0 60px ${p.accent2}` : "none" }}>
                {isCyber ? "HOLLYWOOD_DRAMA" : "🎬 Hollywood Drama"}
              </h1>
              <p className="text-sm opacity-70" style={{ color: p.text }}>Blockbuster series, prestige TV, and cinematic universes from the West</p>

              <div className="flex gap-4 mt-3">
                <div><p className="font-black text-xl" style={{ color: p.accent }}>{allMerged.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
                <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{allMerged.filter(d => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
                <div><p className="font-black text-xl" style={{ color: p.accent2 }}>{allMerged.filter(d => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Drama Grid ── */}
        {allMerged.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-6xl">🎬</span>
            <p className="font-black text-xl" style={{ color: p.text }}>No Hollywood dramas yet</p>
            <p className="text-sm opacity-60 text-center max-w-sm" style={{ color: p.text }}>
              Add shows via the search or manual add button below.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {allMerged.map((drama, i) => (
              <motion.div key={drama.id} variants={cardVariants} custom={i}>
                <MediaCard
                  id={drama.id}
                  title={drama.title}
                  category="hollywood"
                  status={drama.status}
                  episodesWatched={drama.episodesWatched}
                  totalEpisodes={drama.episodes}
                  rating={drama.rating}
                  genre={drama.genre}
                  year={drama.year}
                  platform={drama.platform}
                  cast={drama.cast}
                  synopsis={drama.synopsis}
                  posterUrl={drama.posterUrl}
                  isEditable={drama.isEditable}
                  onStatusChange={drama.isEditable ? handleStatusChange : undefined}
                  onEpisodeChange={drama.isEditable ? handleEpisodeChange : undefined}
                  onTotalEpisodesChange={drama.isEditable ? handleTotalEpisodesChange : undefined}
                  onDelete={handleDelete}
                  index={i}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="hollywood" />
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="hollywood" />
      <FloatingFAB category="hollywood" onSearch={() => setSearchOpen(true)} onManualAdd={() => setManualOpen(true)} />
    </>
  );
}

export default function HollywoodDramaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-40">Loading workspace...</div>}>
      <HollywoodDramaPageContent />
    </Suspense>
  );
}
