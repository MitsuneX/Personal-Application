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

// ── Japanese Palette (banner only) ───────────────────────────────────────────
const JP = {
  brutal: { text: "#2D1B24", accent: "#C9184A", accent2: "#FF6B9D" },
  cyber:  { text: "#FFD1E8", accent: "#FF69B4", accent2: "#BF5FFF" },
};

// ── Tokusatsu category detection ─────────────────────────────────────────────
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
  const { dramas: allDramas, dramaLog, deleteDramaLog, removeDrama, updateDrama, hallOfFame } = useDashboardStore();

  const [filterType, setFilterType] = useState<"all"|"actual"|"ultraman"|"kamen-rider"|"power-rangers"|"tokusatsu">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const p = isCyber ? JP.cyber : JP.brutal;

  // ── Merge allDramas + dramaLog (tagged) ──────────────────────────────────
  const editableEntries = allDramas
    .filter(d => d.country === "japanese")
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
    .filter(d => d.country === "japanese")
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

  // ── Filter by tokusatsu type ───────────────────────────────────────────────
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

  // ── HOF star lookup ───────────────────────────────────────────────────────
  const getHofStars = (drama: typeof allMerged[0]) =>
    hallOfFame.filter(a =>
      (a.associatedDramas && a.associatedDramas.includes(drama.title)) ||
      (drama.cast && drama.cast?.includes(a.name))
    );

  // ── Update handlers ───────────────────────────────────────────────────────
  const handleStatusChange = useCallback((id: string, status: string) => {
    updateDrama(id, { status: status as any });
  }, [updateDrama]);

  const handleEpisodeChange = useCallback((id: string, watched: number, newStatus: string) => {
    updateDrama(id, { episodesWatched: watched, status: newStatus as any });
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
              ? "linear-gradient(135deg, #0D0616 0%, rgba(201,24,74,0.15) 50%, #0D0616 100%)"
              : "linear-gradient(135deg, #FFE4ED 0%, #FDF0F3 50%, #FFB7C5 100%)",
            border: isCyber ? "1px solid rgba(255,105,180,0.35)" : "3px solid #2D1B24",
            boxShadow: isCyber ? "0 0 60px rgba(255,105,180,0.2)" : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          {/* Sakura decor */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {["🌸","🌸","🌸","🌸","🌸","🌸"].map((_, i) => (
              <motion.span key={i} className="absolute text-4xl"
                style={{ left: `${8 + i * 16}%`, top: `${-12 + (i % 2) * 55}%` }}
                animate={{ y: [0, 8, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
              >🌸</motion.span>
            ))}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: p.accent }}>
                {isCyber ? "// J-DRAMA.ARCHIVE" : "J-Drama Collection"}
              </p>
              <h1 className="font-black text-3xl md:text-5xl mb-1"
                style={{ color: p.text, fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", textShadow: isCyber ? `0 0 20px ${p.accent}` : "none" }}>
                {isCyber ? "日本 DRAMA" : "🇯🇵 Japanese Drama"}
              </h1>
              <p className="text-sm opacity-70" style={{ color: p.text }}>Thrilling survival, quiet beauty, and unforgettable stories from Japan</p>

              <div className="flex gap-4 mt-3">
                <div><p className="font-black text-xl" style={{ color: p.accent }}>{allMerged.length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Total</p></div>
                <div><p className="font-black text-xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0" }}>{allMerged.filter(d => d.status === "Completed").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Completed</p></div>
                <div><p className="font-black text-xl" style={{ color: p.accent2 }}>{allMerged.filter(d => d.status === "Watching").length}</p><p className="text-xs opacity-60" style={{ color: p.text }}>Watching</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Category Filter ── */}
        <div
          className="mb-6 p-1.5 rounded-xl flex flex-wrap gap-1.5 text-xs font-bold w-fit max-w-full border overflow-x-auto"
          style={{
            backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(255,105,180,0.15)" : "#00",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "none" : "4px 4px 0 #000",
          }}
        >
          {[
            { id: "all", label: "All Shows" },
            { id: "actual", label: "Actual Dramas" },
            { id: "ultraman", label: "🔴 Ultraman" },
            { id: "kamen-rider", label: "🟢 Kamen Rider" },
            { id: "power-rangers", label: "⚡ Power Rangers" },
            { id: "tokusatsu", label: "🦸 All Tokusatsu" },
          ].map(btn => {
            const isActive = filterType === btn.id;
            return (
              <button key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className="py-1.5 px-3 rounded-lg transition-all uppercase tracking-wider text-[10px] whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? (isCyber ? "rgba(255,105,180,0.2)" : "#FFB7C5") : "transparent",
                  color: isActive ? (isCyber ? "#FF69B4" : "#000") : (isCyber ? "rgba(255,209,232,0.6)" : "#444"),
                  border: isActive && !isCyber ? "2px solid #000" : "2px solid transparent",
                }}
              >{btn.label}</button>
            );
          })}
        </div>

        {/* ── Drama grid ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((drama, i) => (
            <motion.div key={drama.id} variants={cardVariants} custom={i}>
              <MediaCard
                id={drama.id}
                title={drama.title}
                category="japanese"
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
                onDelete={handleDelete}
                hofStars={getHofStars(drama)}
                index={i}
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-4xl mb-3">🎌</p>
            <p className="font-bold text-sm" style={{ color: p.text }}>No dramas in this category yet</p>
          </div>
        )}
      </AppShell>

      {/* Modals */}
      <DramaSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} defaultCountry="japanese" />
      <ManualDramaModal isOpen={manualOpen} onClose={() => setManualOpen(false)} defaultCountry="japanese" />

      {/* Consolidated FAB */}
      <FloatingFAB
        category="japanese"
        onSearch={() => setSearchOpen(true)}
        onManualAdd={() => setManualOpen(true)}
      />
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
