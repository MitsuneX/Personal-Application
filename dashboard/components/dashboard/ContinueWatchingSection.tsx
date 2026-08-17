"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { Play, ArrowRight, CheckCircle2, X, ExternalLink, Film, Tv } from "lucide-react";

interface WatchItem {
  id: string;
  title: string;
  poster?: string;
  category: "anime" | "drama";
  episodesWatched: number;
  totalEpisodes: number;
  nextEpisode: number;
  href: string;
  tag: string;
  color: string;
  country?: string;
  status: string;
}

export function ContinueWatchingSection() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { animeList, dramas } = useDashboardStore();

  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isViewAllOpen) {
        setIsViewAllOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewAllOpen]);

  // Helper for drama category route resolution
  const getDramaCategoryHref = (country?: string, id?: string) => {
    const c = (country || "").toLowerCase();
    if (c === "chinese" || c === "china" || c === "cn") return `/drama/chinese`;
    if (c === "japanese" || c === "japan" || c === "jp") return `/drama/japanese`;
    if (c === "korean" || c === "korea" || c === "kr") return `/drama/korean`;
    if (c === "indonesia" || c === "indonesian" || c === "id") return `/drama/indonesia`;
    if (c === "hollywood" || c === "us" || c === "western") return `/drama/hollywood`;
    return id ? `/drama/${id}` : `/drama`;
  };

  // Active in-progress watching items
  const activeWatching = useMemo<WatchItem[]>(() => {
    const list: WatchItem[] = [];

    // In-progress anime
    for (const an of animeList.filter(
      (a) => a.status === "Watching" && a.episodesWatched < (a.totalEpisodes || 999)
    )) {
      list.push({
        id: an.id,
        title: an.title,
        poster: an.posterUrl,
        category: "anime",
        episodesWatched: an.episodesWatched,
        totalEpisodes: an.totalEpisodes || 12,
        nextEpisode: an.episodesWatched + 1,
        href: `/anime/${an.id}`,
        tag: an.studio || "Anime",
        color: isCyber ? "#BF5FFF" : "#7B2FBE",
        status: an.status,
      });
    }

    // In-progress drama
    for (const dr of dramas.filter(
      (d) => d.status === "Watching" && d.episodesWatched < (d.episodes || 16)
    )) {
      list.push({
        id: dr.id,
        title: dr.title,
        poster: (dr as any).posterUrl,
        category: "drama",
        episodesWatched: dr.episodesWatched,
        totalEpisodes: dr.episodes || 16,
        nextEpisode: dr.episodesWatched + 1,
        href: `/drama/${dr.id}`,
        tag: dr.country ? dr.country.toUpperCase() : "Drama",
        color: isCyber ? "#FF7EB9" : "#EF476F",
        country: dr.country,
        status: dr.status,
      });
    }

    return list;
  }, [animeList, dramas, isCyber]);

  // Grouped active items for modal
  const animeWatching = useMemo(
    () => activeWatching.filter((item) => item.category === "anime"),
    [activeWatching]
  );
  const dramaWatching = useMemo(
    () => activeWatching.filter((item) => item.category === "drama"),
    [activeWatching]
  );

  const displayList = activeWatching.slice(0, 4);

  return (
    <>
      <div
        className="rounded-2xl p-5 border flex flex-col justify-between"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(191, 95, 255, 0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 20px rgba(0, 0, 0, 0.4)" : "4px 4px 0 #000",
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Play size={16} className={isCyber ? "text-purple-400" : "text-black"} />
              <h3
                className="font-black text-sm uppercase tracking-wider"
                style={{
                  color: isCyber ? "#E0E8FF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                {isCyber ? "// CONTINUE WATCHING & NEXT UP" : "Continue Watching & Next Up"}
              </h3>
            </div>
            <span className="text-[10px] theme-text-muted font-mono">
              {activeWatching.length} IN-PROGRESS
            </span>
          </div>

          {/* Active Watching Cards (3-4 compact items) */}
          {displayList.length > 0 ? (
            <div className="space-y-3">
              {displayList.map((item) => {
                const pct = Math.round(
                  (item.episodesWatched / (item.totalEpisodes || 1)) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border flex items-center justify-between gap-3 group transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                    }}
                  >
                    {/* Poster / Fallback Icon */}
                    <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40 flex items-center justify-center font-bold text-xs">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{item.category === "anime" ? "⛩️" : "🎬"}</span>
                      )}
                    </div>

                    {/* Info & Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase"
                          style={{
                            backgroundColor: isCyber ? `${item.color}20` : "#E2E8F0",
                            color: item.color,
                          }}
                        >
                          {item.tag}
                        </span>
                        <span className="text-[10px] theme-text-muted font-mono">
                          {item.episodesWatched} / {item.totalEpisodes} eps ({pct}%)
                        </span>
                      </div>

                      <h4 className="font-bold text-xs theme-text-primary truncate">
                        {item.title}
                      </h4>

                      {/* Progress Bar & Next indicator */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 bg-white/10 h-1 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(5, pct))}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-purple-400 shrink-0 font-mono">
                          Next: EP {item.nextEpisode}
                        </span>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Link
                      href={item.href}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border select-none"
                      style={{
                        backgroundColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#000000",
                        borderColor: isCyber ? "#00F5FF" : "#000000",
                        color: isCyber ? "#00F5FF" : "#FFFFFF",
                      }}
                    >
                      <span>Ep {item.nextEpisode}</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Compact Informative Empty State */
            <div className="py-6 text-center">
              <p className="text-xs theme-text-muted italic">
                Nothing currently in progress. Your next watch will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="theme-text-muted text-[11px] flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Watch pace synced
          </span>
          {activeWatching.length > 0 && (
            <button
              onClick={() => setIsViewAllOpen(true)}
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer select-none"
            >
              <span>View All ({activeWatching.length}) →</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Centered View All Modal Dialog ── */}
      <AnimatePresence>
        {isViewAllOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setIsViewAllOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="p-6 rounded-2xl max-w-2xl w-full border relative overflow-hidden flex flex-col max-h-[85vh]"
              style={{
                backgroundColor: isCyber ? "#050816" : "#FFFFFF",
                borderColor: isCyber ? "#BF5FFF" : "#000000",
                borderWidth: isCyber ? "1px" : "3px",
                boxShadow: isCyber ? "0 0 50px rgba(191, 95, 255, 0.2)" : "8px 8px 0 #000",
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <Play size={20} className={isCyber ? "text-purple-400" : "text-black"} />
                  <div>
                    <h3
                      className="font-black text-base uppercase tracking-wider"
                      style={{
                        color: isCyber ? "#E0E8FF" : "#1A1A1A",
                        fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                      }}
                    >
                      {isCyber ? "// ACTIVE WATCH LIST & NEXT UP" : "Active Watch List & Next Up"}
                    </h3>
                    <p className="text-xs theme-text-muted">
                      Complete active Anime and Drama queue with category routing
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer opacity-70 hover:opacity-100 transition-opacity shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#CBD5E1",
                  }}
                  title="Close (Esc)"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Content — Grouped by Anime and Drama */}
              <div className="overflow-y-auto overscroll-contain flex-1 py-4 space-y-6 scrollbar-thin">
                {/* Anime Group */}
                {animeWatching.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tv size={15} className="text-purple-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">
                        ANIME ({animeWatching.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {animeWatching.map((item) => (
                        <div
                          key={`modal-anime-${item.id}`}
                          className="p-3 rounded-xl border flex items-center justify-between gap-3"
                          style={{
                            backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                            borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-12 rounded overflow-hidden shrink-0 bg-black/40 border border-white/10 flex items-center justify-center font-bold text-xs">
                              {item.poster ? (
                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <span>⛩️</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs theme-text-primary truncate">{item.title}</p>
                              <p className="text-[11px] theme-text-muted font-mono">
                                Progress: {item.episodesWatched} / {item.totalEpisodes} · Next: EP {item.nextEpisode}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={item.href}
                            onClick={() => setIsViewAllOpen(false)}
                            className="py-1 px-3 rounded-lg text-xs font-bold shrink-0 border flex items-center gap-1 cursor-pointer"
                            style={{
                              backgroundColor: isCyber ? "rgba(191, 95, 255, 0.15)" : "#000000",
                              borderColor: isCyber ? "#BF5FFF" : "#000000",
                              color: isCyber ? "#BF5FFF" : "#FFFFFF",
                            }}
                          >
                            <span>Resume</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drama Group */}
                {dramaWatching.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Film size={15} className="text-pink-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-pink-400">
                        DRAMA ({dramaWatching.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {dramaWatching.map((item) => (
                        <div
                          key={`modal-drama-${item.id}`}
                          className="p-3 rounded-xl border flex items-center justify-between gap-3"
                          style={{
                            backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                            borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-12 rounded overflow-hidden shrink-0 bg-black/40 border border-white/10 flex items-center justify-center font-bold text-xs">
                              {item.poster ? (
                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <span>🎬</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs theme-text-primary truncate">{item.title}</p>
                              <p className="text-[11px] theme-text-muted font-mono">
                                Progress: {item.episodesWatched} / {item.totalEpisodes} · Next: EP {item.nextEpisode} ({item.tag})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={getDramaCategoryHref(item.country, item.id)}
                              onClick={() => setIsViewAllOpen(false)}
                              className="text-[10px] font-bold text-cyan-400 hover:underline hidden sm:inline-block"
                            >
                              Hub
                            </Link>
                            <Link
                              href={item.href}
                              onClick={() => setIsViewAllOpen(false)}
                              className="py-1 px-3 rounded-lg text-xs font-bold border flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: isCyber ? "rgba(255, 126, 185, 0.15)" : "#000000",
                                borderColor: isCyber ? "#FF7EB9" : "#000000",
                                color: isCyber ? "#FF7EB9" : "#FFFFFF",
                              }}
                            >
                              <span>Resume</span>
                              <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
                <span className="theme-text-muted font-mono">
                  Press ESC or click outside to dismiss
                </span>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isCyber ? "rgba(191,95,255,0.15)" : "#000000",
                    borderColor: isCyber ? "#BF5FFF" : "#000000",
                    color: isCyber ? "#BF5FFF" : "#FFFFFF",
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
