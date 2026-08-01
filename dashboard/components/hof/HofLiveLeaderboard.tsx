"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HallOfFameEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { getGroupForEntry, getGroupDetails, getTypeLabel } from "@/components/cards/HofEntryCard";
import { getPrestigeTier, getRankMovement } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HofLiveLeaderboardProps {
  entries: HallOfFameEntry[]; // Ranks #4 to #N
  isCyber: boolean;
  onEdit: (entry: HallOfFameEntry) => void;
  onDelete: (id: string, name: string) => void;
  onOpenProfile: (entry: HallOfFameEntry) => void;
  onCompare: (entry: HallOfFameEntry) => void;
}

export function HofLiveLeaderboard({
  entries,
  isCyber,
  onEdit,
  onDelete,
  onOpenProfile,
  onCompare,
}: HofLiveLeaderboardProps) {
  const { likeHof } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const router = useRouter();
  const [viewStyle, setViewStyle] = useState<"table" | "grid">("table");

  if (!entries || entries.length === 0) {
    return (
      <div className="p-8 rounded-3xl border border-dashed text-center font-mono text-xs theme-text-muted space-y-2">
        <div className="text-2xl">🏆</div>
        <p className="font-bold">All active legends in this category are featured on the Champions Podium above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 font-mono">
      {/* Leaderboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏆</span>
          <div>
            <h2 className="text-lg font-black theme-text-primary tracking-tight">
              Live Hall Leaderboard Rankings
            </h2>
            <span className="text-xs theme-text-muted">
              Ranks #4 to #{entries.length + 3} · Real-time Store Derived
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold theme-text-muted">Layout:</span>
          <button
            onClick={() => setViewStyle("table")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewStyle === "table"
                ? isCyber
                  ? "bg-amber-500 text-black font-black"
                  : "bg-black text-white font-black"
                : "bg-black/5 dark:bg-white/5 theme-text-muted hover:bg-black/10"
            }`}
          >
            ☰ Rows
          </button>
          <button
            onClick={() => setViewStyle("grid")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewStyle === "grid"
                ? isCyber
                  ? "bg-amber-500 text-black font-black"
                  : "bg-black text-white font-black"
                : "bg-black/5 dark:bg-white/5 theme-text-muted hover:bg-black/10"
            }`}
          >
            :: Cards
          </button>
        </div>
      </div>

      {/* Rows View */}
      {viewStyle === "table" ? (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, idx) => {
              const actualRank = idx + 4;
              const prestige = getPrestigeTier(entry, actualRank - 1);
              const movement = getRankMovement(entry, actualRank);
              const group = getGroupDetails(getGroupForEntry(entry));

              // Rank highlights
              let rankBadgeStyle = "bg-black/10 dark:bg-white/10 text-slate-400 border-slate-500/20";
              let rowHighlightBorder = isCyber ? "rgba(255,255,255,0.08)" : "#000000";
              let rowHighlightBg = isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF";

              if (actualRank <= 10) {
                rankBadgeStyle = "bg-amber-500/20 text-amber-400 border-amber-500/40";
                rowHighlightBorder = isCyber ? "rgba(255,215,0,0.3)" : "#D97706";
                rowHighlightBg = isCyber ? "rgba(255,215,0,0.03)" : "#FEFCE8";
              } else if (actualRank <= 25) {
                rankBadgeStyle = "bg-slate-400/20 text-slate-300 border-slate-400/40";
                rowHighlightBorder = isCyber ? "rgba(148,163,184,0.3)" : "#64748B";
                rowHighlightBg = isCyber ? "rgba(148,163,184,0.03)" : "#F8FAFC";
              } else if (actualRank <= 50) {
                rankBadgeStyle = "bg-amber-800/20 text-amber-500 border-amber-800/40";
                rowHighlightBorder = isCyber ? "rgba(180,83,9,0.3)" : "#B45309";
              }

              const handleContextMenu = (e: React.MouseEvent) => {
                e.preventDefault();
                openContextMenu(
                  e,
                  [
                    {
                      id: "row-profile",
                      label: `Open ${entry.name} Profile`,
                      icon: "👑",
                      onClick: () => onOpenProfile(entry),
                    },
                    {
                      id: "row-compare",
                      label: "Compare Legend",
                      icon: "⚔️",
                      onClick: () => onCompare(entry),
                    },
                    {
                      id: "row-like",
                      label: `Heart ${entry.name}`,
                      icon: "❤️",
                      onClick: () => likeHof(entry.id),
                    },
                    {
                      id: "row-edit",
                      label: "Edit Entry Details",
                      icon: "✏️",
                      onClick: () => onEdit(entry),
                    },
                    {
                      id: "row-chars",
                      label: "Open Character Directory",
                      icon: "📚",
                      onClick: () => router.push(`/characters?id=${entry.id}`),
                    },
                    {
                      id: "row-delete",
                      label: "Remove from Hall of Fame",
                      icon: "🗑️",
                      danger: true,
                      divider: true,
                      onClick: () => onDelete(entry.id, entry.name),
                    },
                  ],
                  entry.name
                );
              };

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onContextMenu={handleContextMenu}
                  className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-1 shadow-md"
                  style={{
                    backgroundColor: rowHighlightBg,
                    borderColor: rowHighlightBorder,
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  {/* Left Column: Rank + Movement + Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${rankBadgeStyle}`}
                    >
                      #{actualRank}
                    </span>

                    {/* Movement Badge */}
                    <span
                      className={`px-2 py-1 rounded-lg border text-[10px] font-black shrink-0 flex items-center gap-1 ${movement.badgeBg}`}
                    >
                      <span>{movement.icon}</span>
                      <span>{movement.label}</span>
                    </span>

                    {/* Avatar */}
                    <div
                      onClick={() => onOpenProfile(entry)}
                      className="w-11 h-11 rounded-xl border-2 overflow-hidden relative shrink-0 bg-slate-800 flex items-center justify-center hover:scale-105 transition-transform"
                      style={{ borderColor: group.accentColor }}
                    >
                      {entry.imageUrl ? (
                        <Image
                          src={entry.imageUrl}
                          alt={entry.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs font-black text-white">
                          {entry.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong
                          onClick={() => onOpenProfile(entry)}
                          className="text-sm font-black theme-text-primary hover:underline truncate"
                        >
                          {entry.name}
                        </strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 theme-text-muted">
                          {group.title.split(" ")[0]} {entry.nationality || "Global"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] theme-text-muted truncate mt-0.5">
                        <span>{getTypeLabel(entry)}</span>
                        <span>·</span>
                        <span className="truncate">
                          {Array.isArray(entry.knownFor) ? entry.knownFor.join(", ") : entry.knownFor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Prestige Badge + Votes + Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}>
                    {/* Prestige Badge */}
                    <span className={`px-2.5 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 ${prestige.badgeBg}`}>
                      <span>{prestige.icon}</span>
                      <span className="hidden md:inline">{prestige.name}</span>
                    </span>

                    {/* Votes Badge */}
                    <button
                      onClick={() => likeHof(entry.id)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-black bg-pink-500/10 text-pink-500 border-pink-500/30 hover:bg-pink-500/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>❤️</span>
                      <span>{entry.likes || 0}</span>
                    </button>

                    {/* Quick Profile Icon */}
                    <button
                      onClick={() => onOpenProfile(entry)}
                      className="w-8 h-8 rounded-xl border bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs hover:bg-black/10 transition-all cursor-pointer"
                      title="Inspect Legend Profile"
                    >
                      👑
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Cards View (Grid) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {entries.map((entry, idx) => {
            const actualRank = idx + 4;
            const prestige = getPrestigeTier(entry, actualRank - 1);
            const movement = getRankMovement(entry, actualRank);

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-3xl border space-y-3 relative font-mono cursor-pointer shadow-md transition-all hover:translate-y-[-2px]"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(255,215,0,0.2)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg border text-xs font-black bg-amber-500/20 text-amber-400 border-amber-500/40">
                    #{actualRank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${movement.badgeBg}`}>
                    {movement.icon} {movement.label}
                  </span>
                </div>

                <div
                  onClick={() => onOpenProfile(entry)}
                  className="w-full h-36 rounded-2xl relative overflow-hidden bg-slate-800 flex items-center justify-center"
                >
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xl font-black text-white">
                      {entry.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <strong className="text-sm font-black theme-text-primary block truncate">{entry.name}</strong>
                  <span className="text-[10px] theme-text-muted block truncate">
                    {Array.isArray(entry.knownFor) ? entry.knownFor.join(", ") : entry.knownFor}
                  </span>
                </div>

                <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${prestige.badgeBg}`}>
                    {prestige.icon} {prestige.name}
                  </span>
                  <button
                    onClick={() => likeHof(entry.id)}
                    className="text-xs font-black text-pink-500 flex items-center gap-1 cursor-pointer"
                  >
                    ❤️ {entry.likes || 0}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
