"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { DramaSearchModal } from "@/components/ui/DramaSearchModal";
import type { MediaStatus } from "@/lib/store/dashboardStore";

const STATUS_STYLE: Record<
  MediaStatus,
  { bg: string; color: string; borderCyber: string; borderBrutal: string }
> = {
  "GOAT Status": {
    bg: "rgba(255,215,0,0.12)",
    color: "#FFD700",
    borderCyber: "rgba(255,215,0,0.5)",
    borderBrutal: "#CC9900",
  },
  "All-Star": {
    bg: "rgba(0,245,255,0.1)",
    color: "#00BFFF",
    borderCyber: "rgba(0,245,255,0.4)",
    borderBrutal: "#0077AA",
  },
  Rising: {
    bg: "rgba(57,255,20,0.08)",
    color: "#39FF14",
    borderCyber: "rgba(57,255,20,0.4)",
    borderBrutal: "#2E8B10",
  },
  Classic: {
    bg: "rgba(191,95,255,0.1)",
    color: "#BF5FFF",
    borderCyber: "rgba(191,95,255,0.4)",
    borderBrutal: "#7B3FA8",
  },
};

function StarRating({ rating, max = 10 }: { rating: number; max?: number }) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const filled = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          className="text-xs"
          animate={{
            color: i < filled
              ? isCyber ? "#00F5FF" : "#FF6B35"
              : isCyber ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
            filter: i < filled && isCyber
              ? "drop-shadow(0 0 4px rgba(0,245,255,0.9))"
              : "none",
          }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          ★
        </motion.span>
      ))}
      <span
        className="text-xs ml-1 font-mono font-bold"
        style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "rgba(0,0,0,0.5)" }}
      >
        {rating}/10
      </span>
    </div>
  );
}

// ─── Cinematic Slide Entry Variants ───────────────────────────────────────────

const cinematicContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cinematicSlideVariants = {
  hidden: { opacity: 0, x: -40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 22,
    },
  },
};

export function MediaLogCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const dramas = useDashboardStore((s) => s.dramas);
  const dramaLog = useDashboardStore((s) => s.dramaLog);
  const hallOfFame = useDashboardStore((s) => s.hallOfFame);
  const [searchOpen, setSearchOpen] = useState(false);

  // Map local + OMDb dramas to a unified dynamic structure
  const unifiedDramas = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      episodes: number;
      episodesWatched: number;
      status: "Watching" | "Completed" | "Plan to Watch" | "On Hold";
      rating: number;
      genre: string;
      year: number;
      platform: string;
      type: "Movie" | "Series";
    }> = [];

    if (Array.isArray(dramas)) {
      dramas.forEach((d) => {
        list.push({
          id: d.id,
          title: d.title,
          episodes: d.episodes || 16,
          episodesWatched: d.episodesWatched || 0,
          status: d.status || "Watching",
          rating: typeof d.rating === "number" ? d.rating : parseFloat(d.rating || "0") || 0,
          genre: d.genre || "Drama",
          year: d.year || 2026,
          platform: d.platform || "Drama Hub",
          type: "Series",
        });
      });
    }

    if (Array.isArray(dramaLog)) {
      dramaLog.forEach((d) => {
        const isCompleted = d.statusBadge === "Classic" || d.statusBadge === "GOAT Status";
        const episodes = d.totalEpisodes || (d.type === "Movie" ? 1 : 16);
        const watched = d.episodesWatched ?? (isCompleted ? episodes : 0);
        const parsedRating = d.rating ? parseFloat(d.rating) : 0;
        list.push({
          id: d.id,
          title: d.title,
          episodes: episodes,
          episodesWatched: watched,
          status: isCompleted ? "Completed" : "Watching",
          rating: isNaN(parsedRating) ? 0 : parsedRating,
          genre: d.type || "Series",
          year: d.releaseYear || 2026,
          platform: "OMDb Log",
          type: d.type || "Series",
        });
      });
    }

    return list;
  }, [dramas, dramaLog]);

  // Find active watching series (or null if none)
  const activeSeries = React.useMemo(() => {
    if (unifiedDramas.length === 0) return null;
    const watching = unifiedDramas.find((d) => d.status === "Watching" && d.type !== "Movie");
    if (watching) return watching;
    const watchingAny = unifiedDramas.find((d) => d.status === "Watching");
    if (watchingAny) return watchingAny;
    return null;
  }, [unifiedDramas]);

  // Find top-rated show/film (or null if empty)
  const activeTopFilm = React.useMemo(() => {
    if (unifiedDramas.length === 0) return null;
    const sorted = [...unifiedDramas].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted[0] || null;
  }, [unifiedDramas]);

  const seriesProgress = activeSeries
    ? activeSeries.status === "Completed"
      ? 100
      : Math.round(
          (activeSeries.episodesWatched / Math.max(1, activeSeries.episodes)) * 100
        )
    : 0;

  // Dynamic Hall of Fame Actors Sync (Strictly capped at top 4 max)
  const actorsList = React.useMemo(() => {
    if (!Array.isArray(hallOfFame)) return [];
    return hallOfFame
      .filter((h) => h.type === "actor")
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .slice(0, 4)
      .map((h) => ({
        id: h.id,
        name: h.name,
        status: (h.status || "GOAT Status") as MediaStatus,
        knownFor: Array.isArray(h.knownFor) ? h.knownFor.join(", ") : h.knownFor || "Drama Series",
        rank: h.rank,
      }));
  }, [hallOfFame]);

  // Dynamic Hall of Fame Actresses Sync (Strictly capped at top 4 max)
  const actressesList = React.useMemo(() => {
    if (!Array.isArray(hallOfFame)) return [];
    return hallOfFame
      .filter((h) => h.type === "actress")
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .slice(0, 4)
      .map((h) => ({
        id: h.id,
        name: h.name,
        status: (h.status || "GOAT Status") as MediaStatus,
        knownFor: Array.isArray(h.knownFor) ? h.knownFor.join(", ") : h.knownFor || "Drama Series",
        rank: h.rank,
      }));
  }, [hallOfFame]);

  return (
    <motion.div layout className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
      <BentoCard id="media-log-card">
        {/* Header */}
        <motion.div
          className="flex items-center gap-2 mb-4"
          variants={cinematicSlideVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className="text-2xl"
            animate={{ filter: isCyber ? "drop-shadow(0 0 8px rgba(191,95,255,0.8))" : "none" }}
            transition={{ duration: 0.4 }}
          >
            🎬
          </motion.span>
          <div>
            <motion.h2
              className="font-black text-base leading-tight theme-text-primary"
              animate={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "MEDIA.LOG" : "Media & Drama Log"}
            </motion.h2>
            <p className="theme-text-muted text-xs tracking-widest uppercase">
              Films · Series · Talent
            </p>
          </div>
        </motion.div>

        {/* Prioritized Drama List (Max 5-7 entries: Watching, Completed, Plan to Watch, Recommended) */}
        {(() => {
          const prioritized = [...unifiedDramas]
            .sort((a, b) => {
              // Prioritize Watching, then Completed, then Plan to Watch
              const statusOrder = { Watching: 1, Completed: 2, "Plan to Watch": 3, "On Hold": 4 };
              return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
            })
            .slice(0, 6);

          return (
            <motion.ul
              className="space-y-3 mb-4"
              variants={cinematicContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {prioritized.map((drama, i) => {
                const pct = drama.episodes > 0 ? Math.min((drama.episodesWatched / drama.episodes) * 100, 100) : 0;
                return (
                  <motion.li
                    key={drama.id}
                    variants={cinematicSlideVariants}
                    custom={i}
                    className="p-2.5 rounded-xl border flex flex-col gap-1.5"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="theme-text-primary text-xs font-black truncate">{drama.title}</p>
                        <p className="theme-text-muted text-[10px] truncate">{drama.genre} · {drama.year}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                        style={{
                          backgroundColor: drama.status === "Watching"
                            ? (isCyber ? "rgba(0,245,255,0.12)" : "#E0F7FA")
                            : (isCyber ? "rgba(57,255,20,0.12)" : "#E8F5E9"),
                          color: drama.status === "Watching"
                            ? (isCyber ? "#00F5FF" : "#006064")
                            : (isCyber ? "#39FF14" : "#2E7D32"),
                          border: `1px solid ${drama.status === "Watching" ? (isCyber ? "rgba(0,245,255,0.4)" : "#B2EBF2") : (isCyber ? "rgba(57,255,20,0.4)" : "#C8E6C9")}`,
                        }}
                      >
                        {drama.status}
                      </span>
                    </div>

                    {drama.status === "Watching" && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                              boxShadow: isCyber ? "0 0 8px #00F5FF" : "none",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                        <span className="text-[10px] font-mono theme-text-secondary shrink-0">
                          {drama.episodesWatched}/{drama.episodes}
                        </span>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          );
        })()}

        {/* View Full Drama Hub & Search Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <Link href="/drama" className="block">
            <motion.button
              className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase font-mono flex items-center justify-center gap-1.5 border cursor-pointer"
              style={{
                background: isCyber ? "rgba(0,245,255,0.06)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.1)" : "2.5px 2.5px 0px #000000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98, y: 1 }}
            >
              <span>🎬</span>
              <span>VIEW DRAMA HUB →</span>
            </motion.button>
          </Link>

          <motion.button
            className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase font-mono flex items-center justify-center gap-1.5 border cursor-pointer"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(191,95,255,0.08))"
                : "rgba(255,107,53,0.08)",
              borderColor: isCyber ? "rgba(0,245,255,0.25)" : "2px dashed rgba(255,107,53,0.4)",
              boxShadow: isCyber ? "none" : "2.5px 2.5px 0px #000000",
              color: isCyber ? "rgba(0,245,255,0.9)" : "#FF6B35",
            }}
            whileHover={{
              scale: 1.015,
              y: -1,
              backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "rgba(255,107,53,0.14)",
            }}
            whileTap={{ scale: 0.98, y: 1 }}
            onClick={() => setSearchOpen(true)}
          >
            <span>🔍</span>
            <span>{isCyber ? "SEARCH DRAMA.DB" : "Search & Log Drama"}</span>
          </motion.button>
        </div>

      </BentoCard>

      {/* Drama Search Modal */}
      <DramaSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </motion.div>
  );
}


