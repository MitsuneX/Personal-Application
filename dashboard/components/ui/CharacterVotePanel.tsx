"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { HallOfFameEntry } from "@/lib/store/dashboardStore";

interface CharacterVotePanelProps {
  entries: HallOfFameEntry[];
  franchise: string;
  accentColor: string;
}

const MEDAL_ICONS = ["👑", "🥈", "🥉"];

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  isCyber,
  accentColor,
}: {
  value: number;
  onChange: (v: number) => void;
  isCyber: boolean;
  accentColor: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => {
        const filled = i < (hover || value);
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            className="text-[13px] transition-colors cursor-pointer select-none"
            style={{ color: filled ? accentColor : isCyber ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  position,
  isCyber,
  accentColor,
  onLike,
  onRank,
}: {
  entry: HallOfFameEntry;
  position: number;
  isCyber: boolean;
  accentColor: string;
  onLike: (id: string) => void;
  onRank: (id: string, rank: number) => void;
}) {
  const medal = position <= 3 ? MEDAL_ICONS[position - 1] : null;
  const avatar = entry.imageUrl;
  const [imgError, setImgError] = useState(false);
  const initials = entry.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: isCyber
          ? position === 1 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)"
          : position === 1 ? "rgba(255,215,0,0.08)" : "rgba(0,0,0,0.02)",
        border: isCyber
          ? `1px solid ${position <= 3 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)"}`
          : `2px solid ${position <= 3 ? "rgba(255,215,0,0.3)" : "rgba(0,0,0,0.06)"}`,
        boxShadow: !isCyber && position === 1 ? "3px 3px 0 #000" : "none",
      }}
    >
      {/* Rank Badge */}
      <div className="w-8 text-center shrink-0">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className="text-xs font-black font-mono opacity-40">#{position}</span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2 text-sm font-black"
        style={{
          borderColor: position <= 3 ? "#FFD700" : (isCyber ? "rgba(255,255,255,0.12)" : "#000"),
          background: avatar && !imgError ? "transparent" : (isCyber ? "rgba(255,255,255,0.05)" : "#F5F5F5"),
          color: isCyber ? accentColor : "#555",
        }}
      >
        {avatar && !imgError ? (
          <img src={avatar} alt={entry.name} className="w-full h-full object-cover object-[center_20%]" onError={() => setImgError(true)} />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black truncate" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
          {entry.name}
        </p>
        <StarRating
          value={entry.rank ?? 0}
          onChange={(v) => onRank(entry.id, v)}
          isCyber={isCyber}
          accentColor={accentColor}
        />
      </div>

      {/* Likes + Vote */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.3 }}
          onClick={() => onLike(entry.id)}
          className="text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 select-none"
          style={{
            background: isCyber ? "rgba(255,20,147,0.15)" : "#FF4444",
            color: isCyber ? "#FF1493" : "#FFF",
            border: isCyber ? "1px solid rgba(255,20,147,0.3)" : "2px solid #000",
            boxShadow: !isCyber ? "2px 2px 0 #000" : "none",
          }}
        >
          <span>❤️</span>
          <span>{entry.likes || 0}</span>
        </motion.button>
        <span className="text-[9px] font-mono opacity-40">{entry.rank ? `★ ${entry.rank}/10` : "unrated"}</span>
      </div>
    </motion.div>
  );
}

// ─── Main Vote Panel ──────────────────────────────────────────────────────────

export function CharacterVotePanel({ entries, franchise, accentColor }: CharacterVotePanelProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { likeHof, rankHof } = useDashboardStore();

  // Sort by likes desc, then rank asc
  const sorted = [...entries].sort((a, b) => {
    const rankA = a.rank ?? 999;
    const rankB = b.rank ?? 999;
    const likesDiff = (b.likes || 0) - (a.likes || 0);
    if (likesDiff !== 0) return likesDiff;
    return rankA - rankB;
  });

  const totalLikes = entries.reduce((s, e) => s + (e.likes || 0), 0);
  const topRated = [...entries].filter((e) => e.rank).sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))[0];

  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.3 }}
      className="mt-10 rounded-2xl overflow-hidden"
      style={{
        background: isCyber
          ? "rgba(5,8,22,0.9)"
          : "#FFFCDE",
        border: isCyber
          ? `1px solid ${accentColor}40`
          : "3px solid #000",
        boxShadow: isCyber
          ? `0 0 40px ${accentColor}15`
          : "6px 6px 0 #000",
      }}
    >
      {/* Header */}
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{
          borderBottom: isCyber ? `1px solid ${accentColor}20` : "2px solid rgba(0,0,0,0.1)",
          background: isCyber ? `${accentColor}08` : `${accentColor}10`,
        }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>
            {isCyber ? `// ${franchise.toUpperCase()}.LEADERBOARD` : `${franchise} Rankings`}
          </p>
          <h2 className="text-xl font-black" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
            {isCyber ? "VOTE_RANKINGS" : "Character Rankings"}
          </h2>
          <p className="text-xs opacity-60 mt-1" style={{ color: isCyber ? "#94A3B8" : "#555" }}>
            Double-tap a card or ❤️ to vote · ★ stars set character rating
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-black font-mono" style={{ color: accentColor }}>{totalLikes}</p>
            <p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: isCyber ? "#94A3B8" : "#555" }}>Total Votes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black font-mono" style={{ color: accentColor }}>{entries.length}</p>
            <p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: isCyber ? "#94A3B8" : "#555" }}>Characters</p>
          </div>
          {topRated && (
            <div className="text-center">
              <p className="text-sm font-black truncate max-w-[90px]" style={{ color: accentColor }}>★ {topRated.rank}/10</p>
              <p className="text-[9px] uppercase tracking-wider opacity-50 truncate max-w-[90px]" style={{ color: isCyber ? "#94A3B8" : "#555" }}>{topRated.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="p-4 space-y-2 max-h-[520px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sorted.map((entry, idx) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              position={idx + 1}
              isCyber={isCyber}
              accentColor={accentColor}
              onLike={likeHof}
              onRank={rankHof}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
