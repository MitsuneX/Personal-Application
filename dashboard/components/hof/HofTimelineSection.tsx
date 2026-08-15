"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ChampionshipTimelineItem, computeChampionshipHistory } from "@/lib/utils/hofEngine";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofTimelineSectionProps {
  timeline?: ChampionshipTimelineItem[];
  hallList?: HallOfFameEntry[];
  championshipHistory?: any[];
  gameCharacters?: any[];
  isCyber: boolean;
  /** The raw category key from the master Museum Showcase filter (e.g. "all", "game", "actor") */
  activeCategoryFilter?: string;
  activeCategoryLabel?: string;
}

export function HofTimelineSection({
  timeline: initialTimeline,
  hallList = [],
  championshipHistory = [],
  gameCharacters = [],
  isCyber,
  activeCategoryFilter = "all",
  activeCategoryLabel = "Overall Showcase",
}: HofTimelineSectionProps) {
  const { openContextMenu } = useContextMenu();

  // Prepare combined list including game characters for the 'game' category
  const combinedList = useMemo(() => {
    if (hallList.length === 0 && gameCharacters.length === 0) return [];
    const gameEntries: HallOfFameEntry[] = gameCharacters.map((gc) => ({
      ...gc,
      id: `gc-${gc.id}`,
      name: gc.name,
      type: "game character" as any,
      status: "Completed" as any,
      knownFor: [gc.gameName || "Game Character", gc.role || "", gc.element || ""].filter(Boolean),
      nationality: gc.nation || gc.gameName || "Game",
      singerType: gc.gameName || undefined,
      note: gc.notes || undefined,
      avatarUrl: gc.avatarUrl || (gc as any).portraitUrl || undefined,
      imageUrl: gc.cardImage || gc.avatarUrl || gc.splashArt || undefined,
      portraitUrl: (gc as any).portraitUrl || undefined,
      rank: gc.rank || null,
      likes: gc.likes || 0,
      isChampion: false,
      isFavorite: gc.isFavorite,
      badges: gc.isFeatured ? ["⭐ FEATURED"] : [],
      gameName: gc.gameName,
      isFeatured: gc.isFeatured,
      isGameCharacterEntry: true,
      stats: gc.stats,
      cropData: (gc.stats as any)?.cropData || (gc as any).cropData,
      videoFraming: (gc.stats as any)?.videoFraming || (gc as any).videoFraming,
      posterFraming: (gc.stats as any)?.cropData?.posterFraming || (gc as any).posterFraming,
      details: (gc as any).details || gc.stats,
    }));

    const normalizedHall = hallList.map((h) => ({
      ...h,
      avatarUrl:
        h.avatarUrl ||
        (h.details as any)?.avatarUrl ||
        (h.details as any)?.profileAvatarUrl ||
        (h.details as any)?.avatar ||
        (h as any).stats?.avatarUrl ||
        undefined,
    }));

    return [...normalizedHall, ...gameEntries];
  }, [hallList, gameCharacters]);

  // Dynamically compute timeline using the master page-level category filter
  const computedTimeline = useMemo(() => {
    if (combinedList.length > 0) {
      return computeChampionshipHistory(
        combinedList,
        championshipHistory,
        activeCategoryFilter
      );
    }
    return initialTimeline || [];
  }, [combinedList, championshipHistory, activeCategoryFilter, initialTimeline]);

  const handleTimelineContextMenu = (e: React.MouseEvent, item: ChampionshipTimelineItem) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "tl-inspect",
          label: `Inspect ${item.year} Season: ${item.championName}`,
          icon: "👑",
          onClick: () => {},
        },
        {
          id: "tl-copy",
          label: `Copy Champion Record`,
          icon: "📋",
          onClick: () => {
            navigator.clipboard.writeText(`${item.year} Champion: ${item.championName} (${item.votes} votes)`);
          },
        },
      ],
      `${item.year} Champion: ${item.championName}`
    );
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Meta */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3"
        style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight">
            Championship History &amp; Season Legacy Archive
          </h3>
        </div>
        <span className="text-xs theme-text-muted font-bold">
          2026 Active Season Archive • {activeCategoryLabel}
        </span>
      </div>

      {/* Timeline List */}
      <div
        className="relative pl-6 sm:pl-8 space-y-6 border-l-2"
        style={{ borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000000" }}
      >
        {computedTimeline.length === 0 ? (
          <div
            className="p-6 rounded-2xl border text-center text-xs theme-text-muted"
            style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
          >
            No championship archives found for the current filter selection.
          </div>
        ) : (
          computedTimeline.map((item, idx) => {
            const rank = item.rank || idx + 1;
            const isGold = rank === 1;
            const isSilver = rank === 2;
            const isBronze = rank === 3;

            const medalBadge = isGold
              ? { icon: "🥇", label: "GOLD CHAMPION", bg: "bg-amber-500/20 text-amber-400 border-amber-500/40" }
              : isSilver
              ? { icon: "🥈", label: "SILVER RUNNER-UP", bg: "bg-slate-300/20 text-slate-300 border-slate-400/40" }
              : { icon: "🥉", label: "BRONZE PODIUM", bg: "bg-amber-800/20 text-amber-500 border-amber-700/40" };

            const borderColor = isGold
              ? isCyber
                ? "#FFD700"
                : "#D97706"
              : isSilver
              ? isCyber
                ? "rgba(226,232,240,0.4)"
                : "#64748B"
              : isCyber
              ? "rgba(217,119,6,0.4)"
              : "#B45309";

            return (
              <div
                key={`${item.year}-${rank}-${item.championName}`}
                onContextMenu={(e) => handleTimelineContextMenu(e, item)}
                className="relative p-5 rounded-3xl border space-y-3 cursor-pointer transition-all hover:translate-x-1"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
                  borderColor,
                  borderWidth: isGold ? (isCyber ? "2px" : "3px") : isCyber ? "1.5px" : "2px",
                  boxShadow: isGold
                    ? isCyber
                      ? "0 0 25px rgba(255,215,0,0.2)"
                      : "5px 5px 0 #000000"
                    : isCyber
                    ? "0 0 15px rgba(0,0,0,0.3)"
                    : "3px 3px 0 rgba(0,0,0,0.1)",
                }}
              >
                {/* Timeline node marker dot */}
                <div
                  className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black"
                  style={{
                    backgroundColor: isGold ? "#FFD700" : isCyber ? "#050816" : "#FFFFFF",
                    borderColor: isGold ? "#FFD700" : isCyber ? "#00F5FF" : "#000000",
                    color: isGold ? "#000" : isCyber ? "#00F5FF" : "#000",
                  }}
                >
                  {isGold ? "👑" : isSilver ? "🥈" : "🥉"}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* 1:1 Avatar / Thumbnail */}
                    {item.championImage && (
                      <div
                        className="w-10 h-10 rounded-xl border-2 overflow-hidden relative shrink-0 bg-slate-800 aspect-square"
                        style={{ borderColor }}
                      >
                        <Image
                          src={item.championImage}
                          alt={item.championName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black flex items-center gap-1 ${medalBadge.bg}`}
                        >
                          <span>{medalBadge.icon}</span>
                          <span>{medalBadge.label}</span>
                        </span>
                        <span className="text-xs font-bold opacity-60">SEASON {item.year}</span>
                      </div>
                      <strong className="text-base font-black theme-text-primary block mt-0.5">
                        {item.championName}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-black/10 dark:bg-white/10 theme-text-muted">
                      {item.category}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-pink-500/10 text-pink-500 border border-pink-500/30">
                      ❤️ {item.votes} Votes
                    </span>
                  </div>
                </div>

                <p className="text-xs theme-text-muted leading-relaxed pl-1 border-l-2 border-slate-500/20">
                  &quot;{item.note}&quot;
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
