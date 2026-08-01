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
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { buildMediaCardMenu } from "@/lib/context-menu/builders";

const JP = {
  brutal: { text: "#2D1B24", accent: "#C9184A", accent2: "#FF6B9D", bg: "#FFE4ED" },
  cyber:  { text: "#FFD1E8", accent: "#FF69B4", accent2: "#BF5FFF", bg: "#0D0616" },
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

const getDramaCategory = (drama: { title: string; genre?: string; cast?: string[] }, hofEntries: any[]) => {
  const t = drama.title.toLowerCase();
  if (t.includes("ultraman")) return "Ultraman";
  if (t.includes("kamen rider")) return "Kamen Rider";
  if (t.includes("power rangers") || t.includes("sentai")) return "Power Rangers";

  const g = drama.genre?.toLowerCase() ?? "";
  if (g.includes("tokusatsu") || g.includes("toku")) {
    if (g.includes("ultraman")) return "Ultraman";
    if (g.includes("kamen rider") || g.includes("rider")) return "Kamen Rider";
    if (g.includes("power rangers") || g.includes("sentai") || g.includes("ranger")) return "Power Rangers";
    return "Tokusatsu";
  }

  const linked = hofEntries.filter(a =>
    a.tokusatsuFranchise &&
    ((a.associatedDramas && a.associatedDramas.includes(drama.title)) ||
     (drama.cast && drama.cast.includes(a.name)))
  );
  if (linked.length > 0) return linked.find(a => a.tokusatsuFranchise)?.tokusatsuFranchise ?? "Tokusatsu";
  return "Actual Drama";
};

function JapaneseDramaPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dramas: allDramas, dramaLog, deleteDramaLog, removeDrama, updateDrama, updateDramaLog, hallOfFame } = useDashboardStore();
  const { confirm } = useConfirm();

  const [filterType, setFilterType] = useState<"all"|"actual"|"ultraman"|"kamen-rider"|"power-rangers"|"tokusatsu">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? JP.cyber : JP.brutal;

  const editableEntries = allDramas
    .filter(d => d.country === "japanese")
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
    .filter(d => d.country === "japanese")
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
      cast: d.mainActors, isEditable: false, isLogEntry: true,
      posterUrl: d.posterUrl ?? undefined,
      synopsis: d.plotSummary ?? undefined,
    }));

  const allMerged = [...editableEntries, ...logEntries];

  const filtered = allMerged.filter(d => {
    const cat = getDramaCategory(d, hallOfFame);
    if (filterType === "all") return true;
    if (filterType === "actual") return cat === "Actual Drama";
    if (filterType === "ultraman") return cat === "Ultraman";
    if (filterType === "kamen-rider") return cat === "Kamen Rider";
    if (filterType === "power-rangers") return cat === "Power Rangers";
    if (filterType === "tokusatsu") return cat !== "Actual Drama";
    return true;
  });

  const getHofStars = (drama: typeof allMerged[0]) =>
    hallOfFame.filter(a =>
      (a.associatedDramas && a.associatedDramas.includes(drama.title)) ||
      (drama.cast && drama.cast?.includes(a.name))
    );

  const completedCount = allMerged.filter(d => d.status === "Completed").length;
  const watchingCount  = allMerged.filter(d => d.status === "Watching").length;

  const handleStatusChange = useCallback((id: string, status: string) => { updateDrama(id, { status: status as any }); }, [updateDrama]);
  const handleEpisodeChange = useCallback((id: string, watched: number, newStatus: string) => { updateDrama(id, { episodesWatched: watched, status: newStatus as any }); }, [updateDrama]);
  const handleTotalEpisodesChange = useCallback((id: string, total: number) => { updateDrama(id, { episodes: total }); }, [updateDrama]);
  const handleDramaLogEpisodeChange = useCallback((id: string, watched: number, _: string) => { updateDramaLog(id, { episodesWatched: watched }); }, [updateDramaLog]);
  const handleDramaLogTotalChange = useCallback((id: string, total: number) => { updateDramaLog(id, { totalEpisodes: total }); }, [updateDramaLog]);

  const handleDelete = useCallback((id: string) => {
    const drama = allMerged.find(d => d.id === id);
    if (!drama) return;
    confirm({
      title: "Remove Japanese Drama",
      message: `Are you sure you want to remove "${drama.title}" from your watchlist?`,
      confirmText: "Remove Drama",
      variant: "danger",
      itemPreview: { title: drama.title, subtitle: `Japanese Drama · ${drama.status || "Watchlist"}`, imageUrl: (drama as any).posterUrl, icon: "🌸", category: drama.status },
      successToast: `✓ "${drama.title}" removed from watchlist.`,
      onConfirm: async () => { drama.isEditable ? await removeDrama(id) : await deleteDramaLog(id); },
    });
  }, [allMerged, confirm, deleteDramaLog, removeDrama]);

  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id");

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
    }, 600);
    return () => clearTimeout(timer);
  }, [targetId, p.accent]);

  return (
    <>
      <AppShell>
        {/* ── Premium Banner ── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #0D0616 0%, rgba(201,24,74,0.18) 50%, rgba(191,95,255,0.12) 100%)"
              : "linear-gradient(135deg, #FFE4ED 0%, #FDF0F3 50%, #FFB7C5 100%)",
            border: isCyber ? "1px solid rgba(255,105,180,0.35)" : "3px solid #2D1B24",
            boxShadow: isCyber
              ? "0 0 80px rgba(255,105,180,0.2), inset 0 1px 0 rgba(255,105,180,0.15)"
              : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          {/* Animated shimmer sweep */}
          {isCyber && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,105,180,0.08) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            />
          )}

          {/* Floating Sakura particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {["🌸", "🌸", "✨", "🌸", "🌸"].map((emoji, i) => (
              <motion.span key={i} className="absolute text-4xl select-none"
                style={{ left: `${8 + i * 18}%`, top: `${-10 + (i % 2) * 55}%`, opacity: isCyber ? 0.08 : 0.12 }}
                animate={{ y: [0, 10, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              >{emoji}</motion.span>
            ))}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                right: "-80px", top: "-80px", width: "280px", height: "280px",
                background: `radial-gradient(circle, ${isCyber ? "rgba(255,105,180,0.14)" : "rgba(201,24,74,0.12)"} 0%, transparent 70%)`,
                filter: "blur(20px)",
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.p className="text-xs font-black tracking-[0.3em] uppercase mb-2" style={{ color: p.accent }}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                {isCyber ? "// J-DRAMA.ARCHIVE" : "J-Drama Collection"}
              </motion.p>
              <motion.h1 className="font-black text-3xl md:text-5xl mb-1"
                style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  textShadow: isCyber ? `0 0 30px ${p.accent}, 0 0 80px ${p.accent2}55` : "none" }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 24 }}>
                {isCyber ? "日本 DRAMA" : "🇯🇵 Japanese Drama"}
              </motion.h1>
              <motion.p className="text-sm opacity-70" style={{ color: p.text }}
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.25 }}>
                Thrilling survival, quiet beauty, and tokusatsu legends from Japan
              </motion.p>

              {/* Glass stats row */}
              <motion.div
                className="flex gap-6 mt-4 p-3 rounded-xl w-fit"
                style={{
                  background: isCyber ? "rgba(255,105,180,0.06)" : "rgba(255,255,255,0.55)",
                  border: isCyber ? "1px solid rgba(255,105,180,0.15)" : "1.5px solid rgba(45,27,36,0.15)",
                  backdropFilter: "blur(8px)",
                }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              >
                <StatChip value={allMerged.length} label="Total" color={p.accent} text={p.text} />
                <div style={{ width: "1px", alignSelf: "stretch", background: isCyber ? "rgba(255,105,180,0.15)" : "rgba(45,27,36,0.12)" }} />
                <StatChip value={completedCount} label="Completed" color={isCyber ? "#39FF14" : "#06D6A0"} text={p.text} />
                <div style={{ width: "1px", alignSelf: "stretch", background: isCyber ? "rgba(255,105,180,0.15)" : "rgba(45,27,36,0.12)" }} />
                <StatChip value={watchingCount} label="Watching" color={p.accent2} text={p.text} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Category Filter Dropdown ── */}
        <div className="mb-6">
          <FilterDropdown
            label="Category Filter"
            icon="🌸"
            value={filterType}
            onChange={(val) => setFilterType(val as any)}
            options={[
              { id: "all", label: "All Shows", icon: "🌸" },
              { id: "actual", label: "Actual Dramas", icon: "📺" },
              { id: "ultraman", label: "Ultraman Series", icon: "🔴" },
              { id: "kamen-rider", label: "Kamen Rider Series", icon: "🟢" },
              { id: "power-rangers", label: "Power Rangers / Super Sentai", icon: "⚡" },
              { id: "tokusatsu", label: "All Tokusatsu Franchises", icon: "🦸" },
            ]}
          />
        </div>

        {/* ── Drama Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((drama, i) => (
              <motion.div key={drama.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: Math.min(i * 0.05, 0.4) }}
              >
                <MediaCard
                  id={drama.id} title={drama.title} category="japanese"
                  status={drama.status} episodesWatched={drama.episodesWatched}
                  totalEpisodes={drama.episodes} rating={drama.rating}
                  genre={drama.genre} year={drama.year} platform={drama.platform}
                  cast={drama.cast} synopsis={drama.synopsis} posterUrl={drama.posterUrl}
                  isEditable={drama.isEditable}
                  onStatusChange={drama.isEditable ? handleStatusChange : undefined}
                  onEpisodeChange={drama.isEditable ? handleEpisodeChange : handleDramaLogEpisodeChange}
                  onTotalEpisodesChange={drama.isEditable ? handleTotalEpisodesChange : handleDramaLogTotalChange}
                  onDelete={handleDelete} hofStars={getHofStars(drama)} index={i}
                  contextMenuItems={buildMediaCardMenu({
                    title: drama.title,
                    onAddProgress: () => (drama.isEditable ? handleEpisodeChange : handleDramaLogEpisodeChange)(drama.id, drama.episodesWatched + 1, drama.status),
                    onDelete: () => handleDelete(drama.id),
                  })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <p className="text-5xl mb-3">🎌</p>
            <p className="font-bold text-sm" style={{ color: p.text }}>No dramas in this category yet</p>
          </motion.div>
        )}
      </AppShell>

      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="japanese" />
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="japanese" />
      <FloatingFAB category="japanese" onSearch={() => setSearchOpen(true)} onManualAdd={() => setManualOpen(true)} />
    </>
  );
}

export default function JapaneseDramaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-40">Loading workspace...</div>}>
      <JapaneseDramaPageContent />
    </Suspense>
  );
}
