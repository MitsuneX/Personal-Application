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

const CN = {
  brutal: { text: "#3D0000", accent: "#C8102E", accent2: "#D4AF37" },
  cyber:  { text: "#FFF8E7", accent: "#FFD700", accent2: "#C8102E" },
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

function ChineseDramaPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, removeDrama, updateDrama } = useDashboardStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? CN.cyber : CN.brutal;

  const editableEntries = allDramas
    .filter(d => d.country === "chinese")
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
    .filter(d => d.country === "chinese")
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
              ? "linear-gradient(135deg, #030A1A 0%, rgba(200,16,46,0.12) 40%, rgba(212,175,55,0.1) 100%)"
              : "linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 60%, #FFE8C0 100%)",
            border: isCyber ? "1px solid rgba(212,175,55,0.3)" : "3px solid #7A0000",
            boxShadow: isCyber ? "0 0 60px rgba(255,215,0,0.1), 0 0 120px rgba(200,16,46,0.08)" : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          <CloudPattern isCyber={isCyber} color={isCyber ? "#FFD700" : "#C8102E"} />

          {/* Decorative dragon / seal */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {["🐉","🏮","🐉"].map((e, i) => (
              <motion.span key={i} className="absolute text-4xl"
                style={{ left: `${12 + i * 35}%`, top: `${5 + (i % 2) * 45}%` }}
                animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              >{e}</motion.span>
            ))}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: p.accent }}>
                {isCyber ? "// C-DRAMA.ARCHIVE" : "C-Drama Collection"}
              </p>
              <h1 className="font-black text-3xl md:text-5xl mb-1"
                style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${p.accent}` : "none" }}>
                {isCyber ? "中国 DRAMA" : "🇨🇳 Chinese Drama"}
              </h1>
              <p className="text-sm opacity-70" style={{ color: p.text }}>Epic wuxia, ancient palace intrigue, and modern romance from China</p>

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
                category="chinese"
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

        {allMerged.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-4xl mb-3">🐉</p>
            <p className="font-bold text-sm" style={{ color: p.text }}>No C-Dramas logged yet</p>
          </div>
        )}
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="chinese" />
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="chinese" />
      <FloatingFAB category="chinese" onSearch={() => setSearchOpen(true)} onManualAdd={() => setManualOpen(true)} />
    </>
  );
}

export default function ChineseDramaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-40">Loading workspace...</div>}>
      <ChineseDramaPageContent />
    </Suspense>
  );
}
