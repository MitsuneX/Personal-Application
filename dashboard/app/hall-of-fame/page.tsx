"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import type { MediaStatus, HallOfFameEntry } from "@/lib/store/dashboardStore";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const HOF_TABS = [
  { id: "all",     label: "All",     icon: "◈" },
  { id: "actor",   label: "Actors",  icon: "🎭" },
  { id: "actress", label: "Actress", icon: "💫" },
  { id: "anime",   label: "Anime",   icon: "⛩️" },
];

// ─── Category / Nationality Groups ────────────────────────────────────────────

const NATIONALITY_GROUPS = [
  {
    code: "Korea",
    title: "🇰🇷 Korean",
    description: "Hallyu superstars and K-drama absolute favorites",
    accentColor: "#FF7EB9",
    accentBg: "rgba(255,126,185,0.06)",
    accentBorder: "rgba(255,126,185,0.3)",
    brutalBorder: "#CC3377",
    brutalBg: "#FFF0F6",
  },
  {
    code: "China",
    title: "🇨🇳 Chinese",
    description: "C-drama elites and imperial-era screen icons",
    accentColor: "#FF4444",
    accentBg: "rgba(255,68,68,0.06)",
    accentBorder: "rgba(255,68,68,0.3)",
    brutalBorder: "#CC1111",
    brutalBg: "#FFF5F5",
  },
  {
    code: "Japan",
    title: "🇯🇵 Japanese",
    description: "J-drama royalty and cinematic masters",
    accentColor: "#FF8C69",
    accentBg: "rgba(255,140,105,0.06)",
    accentBorder: "rgba(255,140,105,0.3)",
    brutalBorder: "#CC4400",
    brutalBg: "#FFF8F5",
  },
  {
    code: "Hollywood",
    title: "🎬 Hollywood",
    description: "Western screen icons and marquee talent",
    accentColor: "#FFD700",
    accentBg: "rgba(255,215,0,0.06)",
    accentBorder: "rgba(255,215,0,0.3)",
    brutalBorder: "#B59300",
    brutalBg: "#FFFDF0",
  },
];

// Entries with no matching nationality group go here
const OTHER_GROUP = {
  code: "__other__",
  title: "🎤 Singer",
  description: "Vocal powerhouses and musical legends",
  accentColor: "#00F5FF",
  accentBg: "rgba(0,245,255,0.06)",
  accentBorder: "rgba(0,245,255,0.3)",
  brutalBorder: "#007A8A",
  brutalBg: "#F0FFFE",
};

// ─── Status Styles ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<MediaStatus, { bg: string; color: string; label: string; cyberGlow: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  color: "#FFD700", label: "👑 GOAT",     cyberGlow: "rgba(255,215,0,0.5)"   },
  "All-Star":    { bg: "rgba(0,245,255,0.1)",   color: "#00BFFF", label: "⭐ All-Star",  cyberGlow: "rgba(0,191,255,0.4)"   },
  "Rising":      { bg: "rgba(57,255,20,0.1)",   color: "#39FF14", label: "🚀 Rising",   cyberGlow: "rgba(57,255,20,0.35)"  },
  "Classic":     { bg: "rgba(191,95,255,0.1)",  color: "#BF5FFF", label: "💎 Classic",  cyberGlow: "rgba(191,95,255,0.35)" },
};

const BRUTAL_STATUS_STYLE: Record<MediaStatus, { bg: string; border: string; color: string }> = {
  "GOAT Status": { bg: "rgba(255,215,0,0.15)",  border: "#CC9900", color: "#8A6200" },
  "All-Star":    { bg: "rgba(0,150,200,0.1)",   border: "#0077AA", color: "#004A6E" },
  "Rising":      { bg: "rgba(6,214,160,0.1)",   border: "#2E8B10", color: "#1A5A08" },
  "Classic":     { bg: "rgba(157,78,221,0.1)",  border: "#7B3FA8", color: "#4A1A6E" },
};

// ─── Helper: Get Group details ─────────────────────────────────────────────────

const getGroupForEntry = (entry: HallOfFameEntry) => {
  const nat = entry.nationality;
  if (nat === "Korea") return "Korea";
  if (nat === "China") return "China";
  if (nat === "Japan") return "Japan";
  if (nat === "Hollywood" || nat === "American" || nat === "Canadian") return "Hollywood";
  return "__other__";
};

const getGroupDetails = (code: string) => {
  if (code === "Korea") return NATIONALITY_GROUPS[0];
  if (code === "China") return NATIONALITY_GROUPS[1];
  if (code === "Japan") return NATIONALITY_GROUPS[2];
  if (code === "Hollywood") return NATIONALITY_GROUPS[3];
  return OTHER_GROUP;
};

// Deterministic Trend indicator calculation
const getTrend = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mod = sum % 5;
  if (mod === 0) return { icon: "▲", label: "+1", color: "#39FF14", text: "text-green-400" };
  if (mod === 1) return { icon: "▼", label: "-1", color: "#FF4444", text: "text-red-400" };
  if (mod === 2) return { icon: "▲", label: "+2", color: "#39FF14", text: "text-green-400" };
  return { icon: "•", label: "stable", color: "#94A3B8", text: "text-slate-400" };
};

// ─── Helper: Entry Card ────────────────────────────────────────────────────────

interface CardProps {
  entry: HallOfFameEntry;
  idx: number;
  isCyber: boolean;
  group: typeof NATIONALITY_GROUPS[0] | typeof OTHER_GROUP;
  onEdit: (entry: HallOfFameEntry) => void;
  onDelete: (id: string, name: string) => void;
  showType?: boolean;
  podiumRank?: number | null;
}

function EntryCard({ entry, idx, isCyber, group, onEdit, onDelete, showType = false, podiumRank = null }: CardProps) {
  const [imgError, setImgError] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const { likeHof } = useDashboardStore();

  const cyberStyle  = STATUS_STYLE[entry.status]  || STATUS_STYLE["GOAT Status"];
  const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasImage = !!entry.imageUrl && !imgError;

  // Podium dynamic stylings
  let borderStyle = isCyber ? `1px solid ${group.accentBorder}` : `2.5px solid ${group.brutalBorder}`;
  let shadowStyle = isCyber ? `0 0 20px ${group.accentBg}, 0 4px 20px rgba(0,0,0,0.4)` : `4px 4px 0px 0px #000`;
  let bgStyle = isCyber ? "linear-gradient(160deg, rgba(10,15,44,0.98), rgba(10,15,44,0.9))" : "#FFFFFF";

  if (podiumRank === 1) {
    borderStyle = isCyber ? "2px solid #EAB308" : "4.5px solid #EAB308";
    shadowStyle = isCyber ? "0 0 28px rgba(234,179,8,0.7), 0 4px 20px rgba(0,0,0,0.5)" : "5px 5px 0px 0px #000";
    if (!isCyber) bgStyle = "#FFFDF0";
  } else if (podiumRank === 2) {
    borderStyle = isCyber ? "2px solid #94A3B8" : "4.5px solid #94A3B8";
    shadowStyle = isCyber ? "0 0 20px rgba(148,163,184,0.5), 0 4px 20px rgba(0,0,0,0.4)" : "5px 5px 0px 0px #000";
    if (!isCyber) bgStyle = "#F8FAFC";
  } else if (podiumRank === 3) {
    borderStyle = isCyber ? "2px solid #B45309" : "4.5px solid #B45309";
    shadowStyle = isCyber ? "0 0 20px rgba(180,83,9,0.45), 0 4px 20px rgba(0,0,0,0.4)" : "5px 5px 0px 0px #000";
    if (!isCyber) bgStyle = "#FFFDF5";
  }

  return (
    <motion.div
      variants={cardVariants}
      custom={idx}
      className={`group relative ${podiumRank === 1 && isCyber ? "animate-pulse" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="rounded-2xl overflow-hidden h-full flex flex-col relative transition-all"
        style={{
          background: bgStyle,
          border: borderStyle,
          boxShadow: shadowStyle,
        }}
      >
        {/* ── Photo / Avatar Section ── */}
        <div
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{
            height: "230px",
            background: hasImage
              ? "transparent"
              : isCyber
                ? `linear-gradient(135deg, rgba(10,15,44,0.9), ${group.accentBg})`
                : group.brutalBg ?? "#F5F5F5",
          }}
        >
          {hasImage ? (
            <img
              src={entry.imageUrl!}
              alt={entry.name}
              className="w-full h-full object-cover object-[center_30%]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-5xl font-black"
                style={{ color: isCyber ? group.accentColor : group.brutalBorder }}
              >
                {initials}
              </span>
              <span className="text-xs font-semibold opacity-40">No Photo</span>
            </div>
          )}

          {/* Gradient overlay at bottom of photo */}
          <div
            className="absolute inset-x-0 bottom-0 h-10"
            style={{
              background: isCyber
                ? "linear-gradient(to top, rgba(10,15,44,0.98), transparent)"
                : "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
            }}
          />

          {/* Dynamic podium overlays */}
          {podiumRank === 1 ? (
            isCyber ? (
              <div className="absolute top-2.5 right-2.5 text-2xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.95)] z-10 animate-bounce" title="Rank 1: Champion">👑</div>
            ) : (
              <div className="absolute top-0 right-0 bg-[#EAB308] text-black text-[10px] font-black px-3 py-1.5 border-b-2 border-l-2 border-black z-10 uppercase tracking-wider">RANK 1</div>
            )
          ) : podiumRank === 2 ? (
            isCyber ? (
              <div className="absolute top-2.5 right-2.5 text-2xl filter drop-shadow-[0_0_8px_rgba(148,163,184,0.8)] z-10" title="Rank 2: Contender">🥈</div>
            ) : (
              <div className="absolute top-0 right-0 bg-[#94A3B8] text-black text-[10px] font-black px-3 py-1.5 border-b-2 border-l-2 border-black z-10 uppercase tracking-wider">RANK 2</div>
            )
          ) : podiumRank === 3 ? (
            isCyber ? (
              <div className="absolute top-2.5 right-2.5 text-2xl filter drop-shadow-[0_0_8px_rgba(180,83,9,0.75)] z-10" title="Rank 3: Podium Finisher">🥉</div>
            ) : (
              <div className="absolute top-0 right-0 bg-[#B45309] text-white text-[10px] font-black px-3 py-1.5 border-b-2 border-l-2 border-black z-10 uppercase tracking-wider">RANK 3</div>
            )
          ) : entry.rank ? (
            <div
              className="absolute top-2 right-2 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md z-10"
              style={{
                backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
                color: isCyber ? group.accentColor : "#000",
                border: isCyber ? `1px solid ${group.accentBorder}` : "1.5px solid #000",
                backdropFilter: "blur(4px)",
              }}
            >
              🏆 #{entry.rank}
            </div>
          ) : null}

          {/* Status pill overlay (bottom left of photo) */}
          <div className="absolute bottom-2 left-3">
            <span
              className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isCyber ? `${cyberStyle.bg}` : "rgba(255,255,255,0.9)",
                color: isCyber ? cyberStyle.color : brutalStyle.color,
                border: isCyber ? `1px solid ${cyberStyle.color}40` : `1px solid ${brutalStyle.border}`,
                backdropFilter: "blur(4px)",
              }}
            >
              {entry.status}
            </span>
          </div>
        </div>

        {/* ── Info Section ── */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Type badge */}
          {showType && (
            <span
              className="self-start text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
                color: isCyber ? "#94A3B8" : "#555",
              }}
            >
              {entry.type === "actor" ? "🎭 Actor" : entry.type === "actress" ? "💫 Actress" : "⛩️ Anime"}
            </span>
          )}

          {/* Name */}
          <h3 className="font-black text-sm leading-tight theme-text-primary">
            {entry.name}
          </h3>

          {/* Likes score inline */}
          <div className="text-[10px] theme-text-secondary flex items-center gap-1 font-mono">
            <span>❤️</span>
            <span className="font-bold">{entry.likes || 0} Likes</span>
          </div>

          {/* Note */}
          {entry.note && (
            <p className="text-[10px] theme-text-muted italic leading-relaxed line-clamp-2">
              &quot;{entry.note}&quot;
            </p>
          )}

          {/* Known For tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {entry.knownFor.slice(0, 3).map((work) => (
              <span
                key={work}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8F8F8",
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                  color: isCyber ? "#94A3B8" : "#555",
                }}
              >
                {work}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hover Action Buttons ── */}
        <div
          className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-40"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            className="px-2 py-1 text-[10px] font-black rounded-lg backdrop-blur-sm transition-colors"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.9)",
              color: isCyber ? "#00F5FF" : "#333",
              border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "1.5px solid #000",
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id, entry.name); }}
            className="px-2 py-1 text-[10px] font-black rounded-lg backdrop-blur-sm transition-colors"
            style={{
              backgroundColor: "rgba(239,68,68,0.2)",
              color: "#EF4444",
              border: "1px solid rgba(239,68,68,0.4)",
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Framer Motion Hover details micro-card ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute inset-0 z-30 p-4 flex flex-col justify-between backdrop-blur-md rounded-2xl border"
            style={{
              backgroundColor: isCyber ? "rgba(10, 15, 30, 0.96)" : "rgba(255, 255, 255, 0.98)",
              borderColor: isCyber ? "#00F5FF" : "#000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
              boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.3)" : "none",
            }}
          >
            {/* Hover details content */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: isCyber ? "#94A3B8" : "#555",
                  }}
                >
                  {entry.nationality || "Unknown"}
                </span>
                <span className="text-[10px] font-black text-amber-500 font-mono">
                  {podiumRank ? `👑 Podium Rank #${podiumRank}` : (entry.rank ? `Rank #${entry.rank}` : "Unranked")}
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm theme-text-primary leading-tight">{entry.name}</h4>
                <p className="text-[8px] theme-text-muted mt-0.5 uppercase tracking-widest font-mono">
                  {entry.type === "actor" ? "🎭 Actor" : entry.type === "actress" ? "💫 Actress" : "⛩️ Anime"}
                </p>
              </div>

              {entry.note && (
                <p className="text-[10px] theme-text-secondary leading-relaxed italic max-h-[50px] overflow-y-auto pr-1">
                  &quot;{entry.note}&quot;
                </p>
              )}

              {entry.knownFor && entry.knownFor.length > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-wider theme-text-muted mb-1">Famous Works</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.knownFor.map((w) => (
                      <span key={w} className="text-[8px] px-1.5 py-0.5 rounded border border-adaptive-unique bg-black/5 dark:bg-white/5 theme-text-primary">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Like Counter & Endless Spammer Button */}
            <div className="pt-2 border-t border-adaptive-unique flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider theme-text-muted">Total Score</span>
                <span className="text-xs font-black theme-text-primary font-mono">{entry.likes || 0} Likes</span>
              </div>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  likeHof(entry.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.35 }}
                transition={{ type: "spring", stiffness: 500, damping: 8 }}
                className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all select-none border-adaptive-unique"
                style={{
                  backgroundColor: isCyber ? "rgba(255,20,147,0.2)" : "#FF4444",
                  color: isCyber ? "#FF1493" : "#FFF",
                  boxShadow: isCyber ? "0 0 10px rgba(255,20,147,0.3)" : "2px 2px 0 #000",
                }}
              >
                <span>❤️</span>
                <span>LIKE</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof, likeHof } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [subTab, setSubTab] = useState<"overall" | "korean" | "japanese" | "chinese" | "hollywood">("overall");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // ── Handlers ──
  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the Hall of Fame?`)) {
      await deleteHof(id);
    }
  }, [deleteHof]);

  // Algorithmic Sorting Resolution
  const sortHofEntries = (entriesList: HallOfFameEntry[]) => {
    return [...entriesList].sort((a, b) => {
      const aRank = a.rank === null || a.rank === undefined ? Infinity : a.rank;
      const bRank = b.rank === null || b.rank === undefined ? Infinity : b.rank;
      if (aRank !== bRank) return aRank - bRank;
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      if (aLikes !== bLikes) return bLikes - aLikes;
      return a.name.localeCompare(b.name);
    });
  };

  // Filter based on Tab
  const filterByActiveTab = (itemsList: HallOfFameEntry[]) => {
    if (activeTab === "all") return itemsList;
    return itemsList.filter((e) => e.type === activeTab);
  };

  // Filter based on subTab (Leaderboard)
  const filterBySubTab = (itemsList: HallOfFameEntry[]) => {
    if (subTab === "overall") return itemsList;
    if (subTab === "korean") return itemsList.filter((e) => getGroupForEntry(e) === "Korea");
    if (subTab === "japanese") return itemsList.filter((e) => getGroupForEntry(e) === "Japan");
    if (subTab === "chinese") return itemsList.filter((e) => getGroupForEntry(e) === "China");
    if (subTab === "hollywood") return itemsList.filter((e) => getGroupForEntry(e) === "Hollywood");
    return itemsList;
  };

  // Derived Sorted lists
  const currentFilteredList = sortHofEntries(filterBySubTab(filterByActiveTab(hallOfFame)));

  // Champion (highest overall rank resolved)
  const sortedGlobalList = sortHofEntries(hallOfFame);
  const champion = sortedGlobalList.find((h) => h.isChampion) ?? sortedGlobalList.find((h) => h.rank === 1);

  // Tab counts
  const tabCounts = {
    all:     hallOfFame.length,
    actor:   hallOfFame.filter((e) => e.type === "actor").length,
    actress: hallOfFame.filter((e) => e.type === "actress").length,
    anime:   hallOfFame.filter((e) => e.type === "anime").length,
  };

  // Leaderboard sub-tabs switcher details
  const subTabs = [
    { id: "overall", label: "Overall", flag: "🌐" },
    { id: "korean", label: "Korean", flag: "🇰🇷" },
    { id: "japanese", label: "Japanese", flag: "🇯🇵" },
    { id: "chinese", label: "Chinese", flag: "🇨🇳" },
    { id: "hollywood", label: "Hollywood", flag: "🎬" },
  ];

  return (
    <AppShell>
      {/* ── Banner ── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(255,215,0,0.08), rgba(0,245,255,0.05))"
            : "linear-gradient(135deg, #FFF9C4, #FFF5E4, #FFE4B5)",
          border: isCyber ? "1px solid rgba(255,215,0,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 60px rgba(255,215,0,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex gap-2 mb-2 items-center">
              {["🏆", "👑", "⭐"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5 + i * 0.2, repeat: Infinity }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <h1
              className="font-black text-3xl md:text-5xl mb-1"
              style={{
                color: isCyber ? "#FFD700" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                textShadow: isCyber ? "0 0 20px rgba(255,215,0,0.5)" : "none",
              }}
            >
              {isCyber ? "FAVORITE_ARTISTS" : "Mitsu's Favorite Artists"}
            </h1>
            <p className="theme-text-secondary text-xs font-semibold">
              Curate and rank Mitsu&apos;s absolute favorite actresses, actors, and anime masterworks.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedEntry(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border-adaptive-unique shrink-0"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#fff",
            }}
          >
            ➕ Enshrine Legend
          </button>
        </div>
      </motion.div>

      {/* ── Champion / Leader ── */}
      {champion && activeTab === "all" && subTab === "overall" && (
        <AnimatePresence>
          <motion.div
            key="champion-block"
            className="mb-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-xs font-black tracking-widest uppercase theme-text-secondary mb-3 flex items-center gap-1.5">
              <span>✨</span> Overall Champion / Leader
            </h3>
            <div
              className="rounded-2xl p-6 md:p-8 relative overflow-hidden border-adaptive-unique"
              style={{
                background: isCyber
                  ? "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(10,15,44,0.9))"
                  : "linear-gradient(135deg, #FFF9C4, #FFF)",
                border: isCyber ? "2px solid #FFD700" : "4px double #000000",
                boxShadow: isCyber ? "0 0 45px rgba(255,215,0,0.25)" : "6px 6px 0 rgba(0,0,0,1)",
              }}
            >
              {isCyber && (
                <>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FFD700]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FFD700]" />
                </>
              )}
              <span
                className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ backgroundColor: "rgba(255,215,0,0.15)", color: "#FFD700", borderColor: "#FFD700" }}
              >
                👑 CHAMPION
              </span>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
                      color: isCyber ? "#94A3B8" : "#6B7280",
                    }}
                  >
                    {champion.type === "actor" ? "🎭 Actor" : champion.type === "actress" ? "💫 Actress" : "⛩️ Anime"}
                  </span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black theme-text-primary leading-tight">
                      {champion.name}
                    </h2>
                    {champion.note && (
                      <p className="text-xs italic theme-text-secondary mt-1 max-w-xl">
                        &quot;{champion.note}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {champion.knownFor.map((work) => (
                      <span
                        key={work}
                        className="text-xs px-2.5 py-1 rounded-lg border font-bold"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,215,0,0.05)" : "#FFF",
                          borderColor: "#FFD700",
                          color: isCyber ? "#FFD700" : "#8A6200",
                        }}
                      >
                        🎬 {work}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 md:self-end">
                  <button
                    onClick={() => handleEdit(champion)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-adaptive-unique hover:bg-black/5"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(champion.id, champion.name)}
                    className="px-3 py-1.5 text-xs font-bold text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/10"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Leaderboard Dashboard: The Apex Charts ── */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden text-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, rgba(10,15,30,0.8), rgba(0,0,0,0.9))"
            : "#FFF",
          border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.12)" : "6px 6px 0 #000",
        }}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-dashed border-adaptive-unique">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5"
              style={{
                color: isCyber ? "#00F5FF" : "#FF6B35",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit"
              }}
            >
              📊 THE APEX CHARTS
            </h2>
            <p className="text-[10px] theme-text-muted mt-0.5">Real-time reactive leaderboard resolved by local rank & likes count</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black/10 dark:bg-white/5 border border-adaptive-unique rounded">
            Day Status: ACTIVE
          </span>
        </div>

        {currentFilteredList.filter(e => e.rank !== null).length === 0 ? (
          <p className="text-center py-6 text-xs font-bold theme-text-muted">
            No ranked legends in this category view yet. Edit items to assign ranks!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFilteredList.filter(e => e.rank !== null).slice(0, 6).map((entry, index) => {
              const trend = getTrend(entry.id);
              const rankVal = index + 1;
              return (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-adaptive-unique bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0"
                      style={{
                        backgroundColor: rankVal === 1 ? "rgba(234,179,8,0.2)" : rankVal === 2 ? "rgba(148,163,184,0.2)" : "rgba(180,83,9,0.2)",
                        color: rankVal === 1 ? "#EAB308" : rankVal === 2 ? "#94A3B8" : "#B45309",
                        border: `1px solid ${rankVal === 1 ? "#EAB308" : rankVal === 2 ? "#94A3B8" : "#B45309"}`
                      }}
                    >
                      {rankVal}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-adaptive-unique shrink-0 flex items-center justify-center bg-black/10 text-xs font-black">
                      {entry.imageUrl ? (
                        <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{entry.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black theme-text-primary leading-none truncate max-w-[120px]">{entry.name}</h4>
                      <p className="text-[9px] theme-text-muted mt-1 uppercase font-mono truncate">
                        {entry.nationality || "Other"} · {entry.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black flex items-center gap-0.5 ${trend.text}`}>
                        {trend.icon} {trend.label}
                      </span>
                      <span className="text-[8px] theme-text-muted uppercase font-mono">Trend</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black theme-text-primary font-mono">{entry.likes || 0} Likes</span>
                      <button 
                        onClick={() => likeHof(entry.id)} 
                        className="text-[9px] text-[#FF1493] font-bold hover:underline select-none"
                      >
                        +1 Like
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Regional Sub-Navigation Leaderboard Switcher ── */}
      <div 
        className="mb-8 p-1.5 rounded-xl border flex flex-wrap gap-1.5 text-xs font-bold"
        style={{
          backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
          boxShadow: isCyber ? "none" : "3px 3px 0 #000"
        }}
      >
        {subTabs.map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className="flex-1 min-w-[100px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              style={{
                backgroundColor: isActive
                  ? isCyber 
                    ? "rgba(0, 245, 255, 0.15)"
                    : "#FFD700"
                  : "transparent",
                color: isActive
                  ? isCyber ? "#00F5FF" : "#000"
                  : isCyber ? "#94A3B8" : "#555",
                border: isActive
                  ? isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000"
                  : "1px solid transparent",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit"
              }}
            >
              <span>{tab.flag}</span>
              <span className="uppercase tracking-wider text-[10px] font-black">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tabs (Categories) ── */}
      <div className="mb-6">
        <TabSwitcher
          tabs={HOF_TABS.map((t) => ({ ...t, count: tabCounts[t.id as keyof typeof tabCounts] }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* ── Content Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${subTab}-${hallOfFame.map(e => e.id + e.likes).join("-")}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {currentFilteredList.length === 0 ? (
            <div className="text-center py-16 theme-text-muted text-sm font-semibold">
              No entries found.
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full"
              initial="hidden"
              animate="visible"
              variants={gridContainerVariants}
            >
              {currentFilteredList.map((entry, idx) => {
                // Find local podium position among ranked items in the active view
                const rankedOnly = currentFilteredList.filter(e => e.rank !== null);
                const position = rankedOnly.findIndex(e => e.id === entry.id);
                const podiumRank = position >= 0 && position < 3 ? position + 1 : null;

                const groupCode = getGroupForEntry(entry);
                const group = getGroupDetails(groupCode);

                return (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    idx={idx}
                    isCyber={isCyber}
                    group={group}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showType
                    podiumRank={podiumRank}
                  />
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Modal ── */}
      <HofEditorModal
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setSelectedEntry(null);
        }}
        entryToEdit={selectedEntry}
      />
    </AppShell>
  );
}
