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

const ID_THEME = {
  brutal: { text: "#1F2937", accent: "#E60000", accent2: "#FFFFFF", border: "#000000" },
  cyber:  { text: "#FFF8E7", accent: "#FF2A2A", accent2: "#FFFFFF", border: "rgba(255, 42, 42, 0.4)" },
};

function BatikPattern({ isCyber }: { isCyber: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, ${isCyber ? "#FF2A2A" : "#E60000"} 2px, transparent 0),
            linear-gradient(45deg, transparent 48%, ${isCyber ? "#FF2A2A" : "#E60000"} 49%, ${isCyber ? "#FF2A2A" : "#E60000"} 51%, transparent 52%)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

function IndonesianDramaContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, removeDrama, updateDrama, updateDramaLog } = useDashboardStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? ID_THEME.cyber : ID_THEME.brutal;

  const editableEntries = allDramas
    .filter(d => d.country?.toLowerCase() === "indonesia" || d.country?.toLowerCase() === "indonesian")
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
    .filter(d => d.country?.toLowerCase() === "indonesia" || d.country?.toLowerCase() === "indonesian")
    .map(d => ({
      id: d.id, title: d.title,
      episodes: d.totalEpisodes && d.totalEpisodes > 0 ? d.totalEpisodes : (d.type === "Movie" ? 1 : 16),
      episodesWatched: d.episodesWatched ?? (d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? (d.type === "Movie" ? 1 : 16) : 0),
      status: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? "Completed" : "Watching",
      rating: d.rating ? Math.round(parseFloat(d.rating)) : 8,
      genre: d.type ?? "Series", year: d.releaseYear ?? 2026, platform: "OMDb Log",
      cast: d.mainActors,
      isEditable: false,
      posterUrl: d.posterUrl ?? undefined,
      synopsis: d.plotSummary ?? undefined,
    }));

  const items = [...editableEntries, ...logEntries];

  const searchParams = useSearchParams();
  const targetSearch = searchParams?.get("search") || null;
  const targetId = searchParams?.get("id") || null;

  useEffect(() => {
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`media-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [targetId]);

  const fabActions = [
    { label: "🔍 Search Online Drama", icon: "🔍", onClick: () => setSearchOpen(true) },
    { label: "➕ Manual Add Drama", icon: "➕", onClick: () => setManualOpen(true) },
  ];

  return (
    <AppShell>
      <div className="relative">
        <BatikPattern isCyber={isCyber} />

        {/* Header Banner */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #0A0204 0%, #1F0509 50%, #050816 100%)"
              : "linear-gradient(135deg, #FFF0F0 0%, #FFE6E6 50%, #FFF5E4 100%)",
            border: isCyber ? "1px solid rgba(255, 42, 42, 0.4)" : "3px solid #000000",
            boxShadow: isCyber ? "0 0 35px rgba(255, 42, 42, 0.2)" : "5px 5px 0px #000000",
          }}
        >
          {/* Merah Putih Flag Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/2 h-full bg-[#E60000]" />
            <div className="w-1/2 h-full bg-[#FFFFFF]" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🇮🇩</span>
                <span className="text-xs font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255, 42, 42, 0.15)" : "#E60000",
                    borderColor: isCyber ? "rgba(255, 42, 42, 0.4)" : "#000000",
                    color: isCyber ? "#FF2A2A" : "#FFFFFF",
                  }}
                >
                  Indonesian Sinema Vault
                </span>
              </div>
              <h1
                className="font-black text-2xl md:text-4xl"
                style={{
                  color: isCyber ? "#FFFFFF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                Indonesian Drama & Movies
              </h1>
              <p className="text-xs font-semibold theme-text-secondary mt-1 max-w-xl">
                Explore iconic Indonesian serials, web series, and blockbuster cinema with full progress tracking.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        {items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="text-5xl mb-4 opacity-50">🇮🇩</div>
            <h3 className="font-black text-lg theme-text-primary mb-2">No Indonesian Dramas Saved</h3>
            <p className="text-xs theme-text-muted mb-4 max-w-sm">
              Start building your Indonesian drama collection using the floating action button at the bottom-right corner!
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={gridContainerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={cardVariants} id={`media-card-${item.id}`}>
                <MediaCard
                  id={item.id}
                  title={item.title}
                  category="indonesia"
                  status={item.status}
                  genre={item.genre}
                  posterUrl={item.posterUrl}
                  rating={item.rating}
                  year={item.year}
                  episodesWatched={item.episodesWatched}
                  totalEpisodes={item.episodes}
                  synopsis={item.synopsis}
                  cast={item.cast}
                  onEpisodeChange={(id: string, newEp: number) => {
                    if (item.isEditable) {
                      updateDrama(item.id, { episodesWatched: newEp });
                    } else {
                      updateDramaLog(item.id, { episodesWatched: newEp });
                    }
                  }}
                  onDelete={async () => {
                    if (confirm(`Delete "${item.title}"?`)) {
                      if (item.isEditable) {
                        await removeDrama(item.id);
                      } else {
                        await deleteDramaLog(item.id);
                      }
                    }
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modals & FAB */}
        <DramaSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          defaultCountry="indonesia"
        />

        <ManualDramaModal
          isOpen={manualOpen}
          onClose={() => setManualOpen(false)}
          defaultCountry="indonesia"
        />

        <FloatingFAB category="indonesia" customActions={fabActions} />
      </div>
    </AppShell>
  );
}

export default function IndonesianDramaPage() {
  return (
    <Suspense fallback={<div className="p-8 font-bold animate-pulse text-xs">Loading Indonesian Drama Vault...</div>}>
      <IndonesianDramaContent />
    </Suspense>
  );
}
