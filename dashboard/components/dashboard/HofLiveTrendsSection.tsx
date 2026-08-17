"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowUpRight, Sparkles } from "lucide-react";

export type TrendStatus = "RISING" | "STEADY" | "COOLING";

interface TrendCardItem {
  id: string;
  name: string;
  identity: string;
  status: TrendStatus;
  movementText: string;
  movementType: "up" | "down" | "steady";
  imageUrl?: string;
  accentColor: string;
  categoryTag: string;
  linkHref: string;
  likes: number;
}

export function HofLiveTrendsSection() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, hallEvents } = useDashboardStore();

  // Dynamic national / universe accent resolver
  const getNationalAccent = (entry: HallOfFameEntry) => {
    const nat = (entry.nationality || entry.country || "").toLowerCase();
    const type = (entry.type || "").toLowerCase();

    if (nat.includes("korea") || nat.includes("korean") || nat.includes("kr")) {
      return {
        accent: "#FF2D55",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(255, 45, 85, 0.15), rgba(59, 130, 246, 0.08))"
          : "linear-gradient(135deg, rgba(255, 45, 85, 0.08), rgba(255, 255, 255, 1))",
        tag: "KOREA",
      };
    }
    if (nat.includes("china") || nat.includes("chinese") || nat.includes("cn")) {
      return {
        accent: "#E11D48",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(225, 29, 72, 0.18), rgba(245, 158, 11, 0.1))"
          : "linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(255, 255, 255, 1))",
        tag: "CHINA",
      };
    }
    if (nat.includes("japan") || nat.includes("japanese") || nat.includes("jp")) {
      return {
        accent: "#DC2626",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(220, 38, 38, 0.16), rgba(255, 255, 255, 0.02))"
          : "linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(255, 255, 255, 1))",
        tag: "JAPAN",
      };
    }
    if (type === "anime") {
      return {
        accent: "#EC4899",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(168, 85, 247, 0.1))"
          : "linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(255, 255, 255, 1))",
        tag: "ANIME",
      };
    }
    if (type === "vtuber") {
      return {
        accent: "#8B5CF6",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(6, 182, 212, 0.1))"
          : "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(255, 255, 255, 1))",
        tag: "VTUBER",
      };
    }
    if (type === "tokusatsu" || entry.gameCharacterId) {
      return {
        accent: "#06B6D4",
        gradient: isCyber
          ? "linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(16, 185, 129, 0.1))"
          : "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(255, 255, 255, 1))",
        tag: entry.gameCharacterId ? "GAME" : "TOKU",
      };
    }

    // Default / Custom Accent
    const fallbackColor = entry.accentColor || "#FFD700";
    return {
      accent: fallbackColor,
      gradient: isCyber
        ? `linear-gradient(135deg, ${fallbackColor}20, rgba(255, 255, 255, 0.02))`
        : `linear-gradient(135deg, ${fallbackColor}12, rgba(255, 255, 255, 1))`,
      tag: (entry.type || "HALL").toUpperCase(),
    };
  };

  // Derive Top 5 Movers based on real Hall of Fame data & events
  const trendItems = useMemo<TrendCardItem[]>(() => {
    if (!hallOfFame || hallOfFame.length === 0) return [];

    const scoredList = hallOfFame.map((entry) => {
      // Find matching recent events
      const matchingEvents = (hallEvents || []).filter(
        (ev) =>
          ev.characterName?.toLowerCase() === entry.name.toLowerCase() ||
          (ev.characterId && ev.characterId === entry.id)
      );

      const rankDelta =
        entry.prevRank != null && entry.rank != null ? entry.prevRank - entry.rank : 0;
      const eventCount = matchingEvents.length;

      // Determine classification & movement indicator
      let status: TrendStatus = "STEADY";
      let movementText = `→ Stable · ${entry.likes} likes`;
      let movementType: "up" | "down" | "steady" = "steady";

      if (rankDelta > 0) {
        status = "RISING";
        movementText = `↑ +${rankDelta} Rank Climb`;
        movementType = "up";
      } else if (rankDelta < 0) {
        status = "COOLING";
        movementText = `↓ -${Math.abs(rankDelta)} Rank Shift`;
        movementType = "down";
      } else if (eventCount > 0) {
        const topEvent = matchingEvents[0];
        const voteGain =
          topEvent.newVotes && topEvent.oldVotes
            ? topEvent.newVotes - topEvent.oldVotes
            : 1;
        status = "RISING";
        movementText = `↑ +${voteGain} engagement`;
        movementType = "up";
      } else if (entry.likes >= 10 || entry.isChampion) {
        status = "RISING";
        movementText = `★ ${entry.likes} total likes`;
        movementType = "up";
      }

      // Trend score prioritizing recent movement rather than lifetime rank
      const trendScore =
        eventCount * 30 +
        rankDelta * 25 +
        (entry.isFavorite ? 15 : 0) +
        (entry.isChampion ? 10 : 0) +
        entry.likes * 0.4;

      const identityStyle = getNationalAccent(entry);
      const identityLabel = `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} · ${entry.nationality || entry.country || identityStyle.tag}`;

      return {
        id: entry.id,
        name: entry.name,
        identity: identityLabel,
        status,
        movementText,
        movementType,
        imageUrl: entry.imageUrl || entry.portraitUrl || entry.avatarUrl,
        accentColor: identityStyle.accent,
        categoryTag: identityStyle.tag,
        linkHref: `/hall-of-fame`,
        likes: entry.likes,
        trendScore,
      };
    });

    // Sort by highest momentum / trend score and take strictly 5 cards
    scoredList.sort((a, b) => b.trendScore - a.trendScore);
    return scoredList.slice(0, 5);
  }, [hallOfFame, hallEvents, isCyber]);

  return (
    <div
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255, 215, 0, 0.3)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 25px rgba(255, 215, 0, 0.08)" : "4px 4px 0 #000",
      }}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg shrink-0 border"
            style={{
              backgroundColor: isCyber ? "rgba(255, 215, 0, 0.15)" : "#FEF3C7",
              borderColor: isCyber ? "#FFD700" : "#D97706",
              color: isCyber ? "#FFD700" : "#B45309",
            }}
          >
            <Trophy size={16} />
          </div>
          <div>
            <h3
              className="font-black text-sm uppercase tracking-wider flex items-center gap-2"
              style={{
                color: isCyber ? "#FFD700" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// HALL OF FAME · LIVE TRENDS" : "Hall of Fame · Live Trends"}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-yellow-400/30 text-yellow-400 bg-yellow-400/10">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] theme-text-muted">
              Real-time engagement velocity, prestige shifts, and active movers across universes
            </p>
          </div>
        </div>

        <Link
          href="/hall-of-fame"
          className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>View Full Hall</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* 5-Card Grid */}
      {trendItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {trendItems.map((item) => {
            const isRising = item.status === "RISING";
            const isCooling = item.status === "COOLING";

            return (
              <Link key={item.id} href={item.linkHref} className="block group">
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl p-3.5 border flex flex-col justify-between h-full relative overflow-hidden transition-all select-none"
                  style={{
                    backgroundColor: isCyber ? "rgba(15, 23, 42, 0.75)" : "#FFFDF9",
                    borderColor: isCyber
                      ? `${item.accentColor}40`
                      : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber
                      ? `0 0 15px ${item.accentColor}15`
                      : "3px 3px 0 #000",
                  }}
                >
                  {/* Top Status & Category Accent */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      {/* Trend Status Badge */}
                      <span
                        className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded border flex items-center gap-1"
                        style={{
                          backgroundColor: isRising
                            ? isCyber ? "rgba(57, 255, 20, 0.15)" : "#DCFCE7"
                            : isCooling
                            ? isCyber ? "rgba(239, 71, 111, 0.15)" : "#FEE2E2"
                            : isCyber ? "rgba(255, 215, 0, 0.15)" : "#FEF3C7",
                          borderColor: isRising
                            ? "#10B981"
                            : isCooling
                            ? "#EF4444"
                            : "#F59E0B",
                          color: isRising
                            ? isCyber ? "#39FF14" : "#15803D"
                            : isCooling
                            ? isCyber ? "#FF7EB9" : "#B91C1C"
                            : isCyber ? "#FFD700" : "#B45309",
                        }}
                      >
                        {isRising && <TrendingUp size={10} />}
                        {isCooling && <TrendingDown size={10} />}
                        {!isRising && !isCooling && <Minus size={10} />}
                        <span>{item.status}</span>
                      </span>

                      {/* Universe Tag */}
                      <span
                        className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: isCyber ? `${item.accentColor}20` : "#F1F5F9",
                          color: item.accentColor,
                        }}
                      >
                        {item.categoryTag}
                      </span>
                    </div>

                    {/* Character Thumbnail & Name */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center font-bold text-xs bg-black/40"
                        style={{ borderColor: `${item.accentColor}50` }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span style={{ color: item.accentColor }}>
                            {item.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs theme-text-primary truncate group-hover:text-yellow-400 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[10px] theme-text-muted truncate">
                          {item.identity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Movement Indicator */}
                  <div
                    className="pt-2 border-t mt-2 flex items-center justify-between"
                    style={{ borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0" }}
                  >
                    <span className="text-[10px] font-mono font-bold truncate theme-text-secondary">
                      {item.movementText}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-1"
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Compact Empty State */
        <div className="py-6 text-center">
          <p className="text-xs theme-text-muted italic">
            NO RECENT HALL MOVEMENT — Live trends will appear when engagement changes
          </p>
        </div>
      )}
    </div>
  );
}
