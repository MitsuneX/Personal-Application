"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { Activity, Trophy, Bot, Tv, Film, Heart, ArrowUpRight, History, X } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: "hof" | "ai" | "media" | "character" | "game" | "system";
  icon: string;
  color: string;
  linkHref?: string;
}

export function LiveActivityFeed() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    hallEvents,
    aiTools,
    animeList,
    dramas,
    gameCharacters,
    isGuest,
  } = useDashboardStore();

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isArchiveModalOpen) {
        setIsArchiveModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isArchiveModalOpen]);

  const activities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    // 1. Hall of Fame Events
    if (hallEvents && hallEvents.length > 0) {
      for (const ev of hallEvents) {
        list.push({
          id: `hof-${ev.id || Math.random()}`,
          title: `${ev.characterName} — ${ev.type}`,
          subtitle: ev.newRank ? `Rank updated to #${ev.newRank}` : "Prestige & event logged",
          timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
          type: "hof",
          icon: "🏆",
          color: isCyber ? "#FFD700" : "#D97706",
          linkHref: "/hall-of-fame",
        });
      }
    }

    // 2. AI Tool Activity
    if (aiTools && aiTools.length > 0) {
      const activeAi = [...aiTools]
        .filter((t) => (t.launchCount ?? 0) > 0)
        .sort((a, b) => (b.launchCount ?? 0) - (a.launchCount ?? 0));

      for (const ai of activeAi) {
        list.push({
          id: `ai-${ai.id}`,
          title: `Launched ${ai.name}`,
          subtitle: `${ai.launchCount} total sessions · ${ai.category}`,
          timestamp: "Active",
          type: "ai",
          icon: "🤖",
          color: isCyber ? "#00F5FF" : "#0284C7",
          linkHref: "/ai-library",
        });
      }
    }

    // 3. Recently Watched Anime
    const recentAnime = animeList
      .filter((a) => a.episodesWatched > 0)
      .slice(0, 6);

    for (const an of recentAnime) {
      list.push({
        id: `anime-${an.id}`,
        title: `Watched ${an.title}`,
        subtitle: `Progress: ${an.episodesWatched}/${an.totalEpisodes || "?"} eps (${an.status})`,
        timestamp: "Recent",
        type: "media",
        icon: "⛩️",
        color: isCyber ? "#BF5FFF" : "#7B2FBE",
        linkHref: "/anime",
      });
    }

    // 4. Recently Watched Drama
    const recentDramas = dramas
      .filter((d) => d.episodesWatched > 0)
      .slice(0, 6);

    for (const dr of recentDramas) {
      list.push({
        id: `drama-${dr.id}`,
        title: `Watched ${dr.title}`,
        subtitle: `Progress: ${dr.episodesWatched}/${dr.episodes || 16} eps (${dr.status})`,
        timestamp: "Recent",
        type: "media",
        icon: "🎬",
        color: isCyber ? "#FF7EB9" : "#EF476F",
        linkHref: "/drama",
      });
    }

    // 5. Featured Game Characters
    const topChars = gameCharacters.slice(0, 4);
    for (const gc of topChars) {
      list.push({
        id: `gc-${gc.id}`,
        title: `Roster: ${gc.name}`,
        subtitle: `${gc.tier || "S"}-Tier · ${gc.combat?.element || gc.element || "Specialized"}`,
        timestamp: "Active",
        type: "character",
        icon: "⚔️",
        color: isCyber ? "#39FF14" : "#06D6A0",
        linkHref: "/game-characters",
      });
    }

    // Fallback seed events if empty
    if (list.length === 0) {
      list.push({
        id: "sys-init-1",
        title: "Nexus Xenon Workspace Initialized",
        subtitle: "All 14 operational modules loaded and nominal",
        timestamp: "Online",
        type: "system",
        icon: "⚡",
        color: isCyber ? "#00F5FF" : "#000000",
      });
    }

    return list;
  }, [hallEvents, aiTools, animeList, dramas, gameCharacters, isCyber]);

  const visibleList = activities.slice(0, 5);

  return (
    <>
      <div
        className="rounded-2xl p-5 border flex flex-col justify-between h-full"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0, 245, 255, 0.2)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 20px rgba(0, 0, 0, 0.4)" : "4px 4px 0 #000",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity size={16} className={isCyber ? "text-cyan-400" : "text-black"} />
              <h3
                className="font-black text-sm uppercase tracking-wider"
                style={{
                  color: isCyber ? "#E0E8FF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                {isCyber ? "// LIVE SYSTEM ACTIVITY" : "Live System Activity"}
              </h3>
            </div>
            <span className="text-[10px] theme-text-muted font-mono">
              {isGuest ? "GUEST SANDBOX" : "REAL-TIME LOG"}
            </span>
          </div>

          {/* Activity Items List (Top 5) */}
          <div className="space-y-2.5">
            {visibleList.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border flex items-center justify-between gap-3 group transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0 p-1.5 rounded-lg bg-black/20">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs theme-text-primary truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] theme-text-muted truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: isCyber ? `${item.color}15` : "#E2E8F0",
                      color: item.color,
                    }}
                  >
                    {item.timestamp}
                  </span>
                  {item.linkHref && (
                    <Link
                      href={item.linkHref}
                      className="opacity-40 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View More Button -> Triggers Centered Modal */}
        <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="text-[11px] theme-text-muted">
            {activities.length} total events recorded
          </span>
          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer select-none"
          >
            <History size={13} />
            <span>View More ({activities.length}) →</span>
          </button>
        </div>
      </div>

      {/* ── Centered Activity Archive Modal Dialog ── */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setIsArchiveModalOpen(false)}
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
                borderColor: isCyber ? "#00F5FF" : "#000000",
                borderWidth: isCyber ? "1px" : "3px",
                boxShadow: isCyber ? "0 0 50px rgba(0, 245, 255, 0.2)" : "8px 8px 0 #000",
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <Activity size={20} className={isCyber ? "text-cyan-400" : "text-black"} />
                  <div>
                    <h3
                      className="font-black text-base uppercase tracking-wider"
                      style={{
                        color: isCyber ? "#E0E8FF" : "#1A1A1A",
                        fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                      }}
                    >
                      {isCyber ? "// SYSTEM ACTIVITY ARCHIVE" : "System Activity Archive"}
                    </h3>
                    <p className="text-xs theme-text-muted">
                      Full chronological stream of system events, launches, and media milestones (Newest → Oldest)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsArchiveModalOpen(false)}
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

              {/* Scrollable Events Archive List */}
              <div className="overflow-y-auto overscroll-contain flex-1 py-4 space-y-2.5 scrollbar-thin">
                {activities.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-3 rounded-xl border flex items-center justify-between gap-3 group transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0 p-2 rounded-lg bg-black/25">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-xs theme-text-primary truncate">
                          {item.title}
                        </p>
                        <p className="text-xs theme-text-muted truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className="text-[11px] font-mono px-2.5 py-1 rounded"
                        style={{
                          backgroundColor: isCyber ? `${item.color}15` : "#E2E8F0",
                          color: item.color,
                        }}
                      >
                        {item.timestamp}
                      </span>
                      {item.linkHref && (
                        <Link
                          href={item.linkHref}
                          onClick={() => setIsArchiveModalOpen(false)}
                          className="opacity-40 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
                <span className="theme-text-muted font-mono">
                  Press ESC or click outside to dismiss
                </span>
                <button
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#FFFFFF",
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
