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

const KR = {
  brutal: { text: "#003366", accent: "#2EC4B6", accent2: "#E84855" },
  cyber:  { text: "#E0F7FA", accent: "#22D3EE", accent2: "#F472B6" },
};

function KoreanDramaPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, updateDrama } = useDashboardStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? KR.cyber : KR.brutal;

  const editableEntries = allDramas
    .filter(d => d.country === "korean")
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
    .filter(d => d.country === "korean")
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

  const handleDelete = useCallback((id: string) => {
    const drama = logEntries.find(d => d.id === id);
    if (drama && confirm(`Remove "${drama.title}" from watchlist?`)) {
      deleteDramaLog(id);
    }
  }, [logEntries, deleteDramaLog]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const targetId = searchParams?.get("id");
    if (targetId) {
      setTimeout(() => {
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
    }
  }, [searchParams, isCyber, p.accent]);

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
              ? "linear-gradient(135deg, #020D18 0%, rgba(34,211,238,0.12) 40%, rgba(244,114,182,0.08) 100%)"
              : "linear-gradient(135deg, #E8F7F7 0%, #F0FAFA 60%, #FFF9E6 100%)",
            border: isCyber ? "1px solid rgba(34,211,238,0.3)" : "3px solid #003366",
            boxShadow: isCyber ? "0 0 60px rgba(34,211,238,0.15), 0 0 120px rgba(244,114,182,0.08)" : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          {/* Wave decor */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {["🌊","🌊","🌊"].map((_, i) => (
              <motion.span key={i} className="absolute text-5xl"
                style={{ right: `${5 + i * 15}%`, top: `${10 + i * 20}%` }}
                animate={{ x: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              >🌊</motion.span>
            ))}
            {isCyber && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(45deg, transparent 30%, rgba(34,211,238,0.04) 50%, transparent 70%)" }}
                animate={{ backgroundPosition: ["0% 0%","100% 100%","0% 0%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: p.accent }}>
                {isCyber ? "// K-DRAMA.ARCHIVE" : "K-Drama Collection"}
              </p>
              <h1 className="font-black text-3xl md:text-5xl mb-1"
                style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${p.accent}, 0 0 60px ${p.accent2}` : "none" }}>
                {isCyber ? "한국 DRAMA" : "🇰🇷 Korean Drama"}
              </h1>
              <p className="text-sm opacity-70" style={{ color: p.text }}>Romance, survival, and superhero sagas from the Korean Wave</p>

              <div className="flex gap-4 mt-3">
                <div><p className="font-black text-xl" style={{ color: p.accent }}>{allMerged.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
                <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{allMerged.filter(d => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
                <div><p className="font-black text-xl" style={{ color: p.accent2 }}>{allMerged.filter(d => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Drama Grid ── */}
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
                category="korean"
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
                onDelete={!drama.isEditable ? handleDelete : undefined}
                index={i}
              />
            </motion.div>
          ))}
        </motion.div>

        {allMerged.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-4xl mb-3">🇰🇷</p>
            <p className="font-bold text-sm" style={{ color: p.text }}>No K-Dramas logged yet</p>
          </div>
        )}
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="korean" />
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="korean" />
      <FloatingFAB category="korean" onSearch={() => setSearchOpen(true)} onManualAdd={() => setManualOpen(true)} />
    </>
  );
}

export default function KoreanDramaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-40">Loading workspace...</div>}>
      <KoreanDramaPageContent />
    </Suspense>
  );
}
