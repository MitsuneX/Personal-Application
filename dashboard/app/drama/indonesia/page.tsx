"use client";

import React, { useState, useCallback, Suspense, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";
import { MediaCard } from "@/components/cards/MediaCard";
import { FloatingFAB } from "@/components/ui/FloatingFAB";
import { useSearchParams } from "next/navigation";
import { useConfirm } from "@/lib/context/ConfirmContext";

const ID_THEME = {
  brutal: { text: "#1F2937", accent: "#E60000", accent2: "#FFFFFF", border: "#000000", bg: "#FFE6E6" },
  cyber:  { text: "#FFF8E7", accent: "#FF2A2A", accent2: "#FFFFFF", border: "rgba(255, 42, 42, 0.4)", bg: "#120404" },
};

function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatChip({ value, label, color, text }: { value: number; label: string; color: string; text: string }) {
  const count = useCounter(value);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="flex flex-col items-start">
      <p className="font-black text-2xl tabular-nums" style={{ color }}>{count}</p>
      <p className="text-xs opacity-60 font-medium" style={{ color: text }}>{label}</p>
    </motion.div>
  );
}

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
  const { confirm } = useConfirm();

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
      cast: d.cast, isEditable: true,
      posterUrl: undefined as string | undefined,
      synopsis: undefined as string | undefined,
    }));

  const logEntries = dramaLog
    .filter(d => d.country?.toLowerCase() === "indonesia" || d.country?.toLowerCase() === "indonesian")
    .map(d => ({
      id: d.id, title: d.title,
      episodes: d.type === "Movie" ? 1 : (d.totalEpisodes && d.totalEpisodes > 0 ? d.totalEpisodes : null),
      episodesWatched: (() => {
        if (d.episodesWatched != null) return d.episodesWatched;
        const isComplete = d.statusBadge === "Classic" || d.statusBadge === "GOAT Status";
        if (!isComplete) return 0;
        if (d.type === "Movie") return 1;
        return d.totalEpisodes && d.totalEpisodes > 0 ? d.totalEpisodes : 0;
      })(),
      status: d.statusBadge === "Classic" || d.statusBadge === "GOAT Status" ? "Completed" : "Watching",
      rating: d.rating ? Math.round(parseFloat(d.rating)) : 8,
      genre: d.type ?? "Series", year: d.releaseYear ?? 2026, platform: "OMDb Log",
      cast: d.mainActors, isEditable: false,
      posterUrl: d.posterUrl ?? undefined,
      synopsis: d.plotSummary ?? undefined,
    }));

  const items = [...editableEntries, ...logEntries];
  const completedCount = items.filter(d => d.status === "Completed").length;
  const watchingCount  = items.filter(d => d.status === "Watching").length;

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id") || null;

  useEffect(() => {
    if (!targetId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`media-card-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.outline = `3px solid ${p.accent}`;
        el.style.outlineOffset = "4px";
        el.style.borderRadius = "12px";
        setTimeout(() => { el.style.outline = "none"; }, 3000);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [targetId, p.accent]);

  const fabActions = [
    { label: "🔍 Search Online Drama", icon: "🔍", onClick: () => setSearchOpen(true) },
    { label: "➕ Manual Add Drama", icon: "➕", onClick: () => setManualOpen(true) },
  ];

  return (
    <AppShell>
      <div className="relative">
        <BatikPattern isCyber={isCyber} />

        {/* ── Premium Banner ── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #0A0204 0%, #1F0509 50%, #050816 100%)"
              : "linear-gradient(135deg, #FFF0F0 0%, #FFE6E6 50%, #FFF5E4 100%)",
            border: isCyber ? "1px solid rgba(255, 42, 42, 0.4)" : "3px solid #000000",
            boxShadow: isCyber ? "0 0 45px rgba(255, 42, 42, 0.25)" : "6px 6px 0px #000000",
          }}
        >
          {/* Merah Putih Flag Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/2 h-full bg-[#E60000]" />
            <div className="w-1/2 h-full bg-[#FFFFFF]" />
          </div>

          {/* Shimmer line */}
          {isCyber && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,42,42,0.08) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            />
          )}

          <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4">
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
                className="font-black text-2xl md:text-5xl"
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

              {/* Glass stats row */}
              <motion.div
                className="flex gap-6 mt-4 p-3 rounded-xl w-fit"
                style={{
                  background: isCyber ? "rgba(255,42,42,0.06)" : "rgba(255,255,255,0.65)",
                  border: isCyber ? "1px solid rgba(255,42,42,0.2)" : "1.5px solid rgba(0,0,0,0.15)",
                  backdropFilter: "blur(8px)",
                }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              >
                <StatChip value={items.length} label="Total" color={p.accent} text={isCyber ? p.text : "#111"} />
                <div style={{ width: "1px", alignSelf: "stretch", background: isCyber ? "rgba(255,42,42,0.15)" : "rgba(0,0,0,0.12)" }} />
                <StatChip value={completedCount} label="Completed" color={isCyber ? "#39FF14" : "#06D6A0"} text={isCyber ? p.text : "#111"} />
                <div style={{ width: "1px", alignSelf: "stretch", background: isCyber ? "rgba(255,42,42,0.15)" : "rgba(0,0,0,0.12)" }} />
                <StatChip value={watchingCount} label="Watching" color={p.accent} text={isCyber ? p.text : "#111"} />
              </motion.div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24, delay: Math.min(i * 0.05, 0.4) }}
                  id={`media-card-${item.id}`}
                >
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
                    onDelete={() => {
                      confirm({
                        title: "Remove Indonesian Drama",
                        message: `Are you sure you want to remove "${item.title}" from your watchlist?`,
                        confirmText: "Remove Drama",
                        variant: "danger",
                        itemPreview: {
                          title: item.title,
                          subtitle: `Indonesian Drama · ${item.status || "Watchlist"}`,
                          imageUrl: item.posterUrl,
                          icon: "🇮🇩",
                          category: item.status,
                        },
                        successToast: `✓ "${item.title}" removed from watchlist.`,
                        onConfirm: async () => {
                          if (item.isEditable) {
                            await removeDrama(item.id);
                          } else {
                            await deleteDramaLog(item.id);
                          }
                        },
                      });
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
