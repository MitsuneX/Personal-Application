"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { getBadgesForEntry } from "@/lib/utils/hofEngine";

interface HofProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: HallOfFameEntry | null;
  rankIndex?: number;
  onEdit?: (entry: HallOfFameEntry) => void;
  onLike?: (id: string) => void;
}

export function HofProfileModal({
  isOpen,
  onClose,
  entry,
  rankIndex,
  onEdit,
  onLike,
}: HofProfileModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "timeline">("overview");

  if (!isOpen || !entry) return null;

  const badges = getBadgesForEntry(entry, rankIndex);
  const likes = entry.likes || 0;
  const knownForList = Array.isArray(entry.knownFor) ? entry.knownFor : [entry.knownFor].filter(Boolean);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-3xl rounded-3xl border overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          style={{
            backgroundColor: isCyber ? "#080C1C" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 45px rgba(0, 245, 255, 0.25)" : "8px 8px 0 #000000",
          }}
        >
          {/* Header Bar with Cover styling */}
          <div
            className="p-6 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(255,20,147,0.1) 100%)"
                : "linear-gradient(135deg, #FEF08A 0%, #FEF3C7 100%)",
              borderBottom: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid #000000",
            }}
          >
            <div className="flex items-center gap-4 z-10">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 flex items-center justify-center font-black text-2xl"
                style={{
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  backgroundColor: isCyber ? "#050816" : "#E2E8F0",
                }}
              >
                {entry.imageUrl ? (
                  <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{entry.name.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-black/20 text-black dark:text-cyan-400 border border-black/30 dark:border-cyan-400/40">
                    {entry.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                    {entry.status}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight mt-1">
                  {entry.name}
                </h2>
                <p className="text-xs theme-text-muted font-mono">
                  {entry.nationality || "Global"} · {entry.singerType || entry.tokusatsuFranchise || "Legend Roster"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 z-10 self-end sm:self-center">
              {onLike && (
                <button
                  onClick={() => onLike(entry.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-pink-500/20 text-pink-400 border border-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>❤️</span>
                  <span>{likes} Votes</span>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(entry);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500 text-black border border-black shadow-[2px_2px_0_#000] hover:scale-105 cursor-pointer"
                >
                  ✏️ Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-black/10 dark:bg-white/10 theme-text-primary hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            className="flex items-center gap-2 px-6 py-3 border-b text-xs font-mono font-bold"
            style={{
              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
              backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
            }}
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === "overview"
                  ? isCyber
                    ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                    : "bg-[#FEF08A] text-black border border-black"
                  : "theme-text-muted"
              }`}
            >
              👑 Overview & Badges
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === "history"
                  ? isCyber
                    ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                    : "bg-[#FEF08A] text-black border border-black"
                  : "theme-text-muted"
              }`}
            >
              📊 Ranking History
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === "timeline"
                  ? isCyber
                    ? "bg-[#00F5FF]/20 text-[#00F5FF]"
                    : "bg-[#FEF08A] text-black border border-black"
                  : "theme-text-muted"
              }`}
            >
              🎬 Filmography / Catalog
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === "overview" && (
              <>
                {/* Badges Matrix */}
                <div>
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider theme-text-muted mb-3">
                    Awarded Badges & Milestones ({badges.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-transform hover:scale-105"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          borderColor: `${badge.color}60`,
                        }}
                        title={badge.description}
                      >
                        <span>{badge.icon}</span>
                        <span className="font-bold">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biography & Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-2xl border font-mono text-xs space-y-2"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2px",
                    }}
                  >
                    <span className="text-[10px] theme-text-muted uppercase font-bold block">MEMO & NOTES</span>
                    <p className="theme-text-primary leading-relaxed">
                      {entry.note || "No custom biography or note recorded yet for this legend entry."}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-2xl border font-mono text-xs space-y-2"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2px",
                    }}
                  >
                    <span className="text-[10px] theme-text-muted uppercase font-bold block">HALL METRICS</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Total Community Votes:</span>
                        <strong className="theme-text-primary">{likes} ❤️</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Status Tier:</span>
                        <strong className="theme-text-primary">{entry.status}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Current Leaderboard Rank:</span>
                        <strong className="theme-text-primary">
                          {rankIndex !== undefined ? `#${rankIndex + 1}` : entry.rank ? `#${entry.rank}` : "Unranked"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <div className="space-y-3 font-mono text-xs">
                <h4 className="font-black uppercase tracking-wider theme-text-muted">Ranking History Log</h4>
                <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC", borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000" }}>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <span>2026 Season Rank</span>
                    <strong className="text-amber-400">#{rankIndex !== undefined ? rankIndex + 1 : 1} (Current)</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <span>2025 Season Rank</span>
                    <strong className="theme-text-muted">#4 (Recorded)</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <span>2024 Season Rank</span>
                    <strong className="theme-text-muted">#8 (Founding Roster)</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-3 font-mono text-xs">
                <h4 className="font-black uppercase tracking-wider theme-text-muted">Famous Masterpieces & Works</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {knownForList.map((work, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border flex items-center gap-2"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#EFF6FF",
                        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                      }}
                    >
                      <span>🎬</span>
                      <span className="font-bold theme-text-primary">{work}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
