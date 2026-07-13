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

// ─── Helper: Entry Card ────────────────────────────────────────────────────────

interface CardProps {
  entry: HallOfFameEntry;
  idx: number;
  isCyber: boolean;
  group: typeof NATIONALITY_GROUPS[0] | typeof OTHER_GROUP;
  onEdit: (entry: HallOfFameEntry) => void;
  onDelete: (id: string, name: string) => void;
  showType?: boolean;
}

function EntryCard({ entry, idx, isCyber, group, onEdit, onDelete, showType = false }: CardProps) {
  const [imgError, setImgError] = React.useState(false);
  const cyberStyle  = STATUS_STYLE[entry.status]  || STATUS_STYLE["GOAT Status"];
  const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hasImage = !!entry.imageUrl && !imgError;

  return (
    <motion.div
      variants={cardVariants}
      custom={idx}
      className="group relative"
    >
      <div
        className="rounded-2xl overflow-hidden h-full flex flex-col relative transition-all"
        style={{
          background: isCyber
            ? `linear-gradient(160deg, rgba(10,15,44,0.98), rgba(10,15,44,0.9))`
            : "#FFFFFF",
          border: isCyber
            ? `1px solid ${group.accentBorder}`
            : `2.5px solid ${group.brutalBorder}`,
          boxShadow: isCyber
            ? `0 0 20px ${group.accentBg}, 0 4px 20px rgba(0,0,0,0.4)`
            : `4px 4px 0px 0px #000`,
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

          {/* Rank badge overlay */}
          <div
            className="absolute top-2 right-2 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
              color: isCyber ? group.accentColor : "#000",
              border: isCyber ? `1px solid ${group.accentBorder}` : "1.5px solid #000",
              backdropFilter: "blur(4px)",
            }}
          >
            🏆 #{entry.rank}
          </div>

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
          className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
    </motion.div>
  );
}

// ─── Helper: Grouped Section ───────────────────────────────────────────────────

interface GroupedSectionProps {
  items: HallOfFameEntry[];
  allItems: HallOfFameEntry[];
  isCyber: boolean;
  onEdit: (entry: HallOfFameEntry) => void;
  onDelete: (id: string, name: string) => void;
  showType?: boolean;
}

function GroupedSection({ items, isCyber, onEdit, onDelete, showType = false }: GroupedSectionProps) {
  // Build groups
  const knownCodes = new Set(NATIONALITY_GROUPS.map((g) => g.code.toLowerCase()));

  const grouped = NATIONALITY_GROUPS.map((g) => ({
    group: g,
    entries: items.filter((e) => e.nationality?.toLowerCase() === g.code.toLowerCase()),
  })).filter((g) => g.entries.length > 0);

  const others = items.filter(
    (e) => !e.nationality || !knownCodes.has(e.nationality.toLowerCase())
  );

  const sections = [
    ...grouped,
    ...(others.length > 0 ? [{ group: OTHER_GROUP, entries: others }] : []),
  ];

  if (sections.length === 0) {
    return (
      <div className="text-center py-16 theme-text-muted text-sm font-semibold">
        No entries found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      {sections.map(({ group, entries }) => (
        <div key={group.code} className="space-y-4">
          {/* Country header */}
          <div
            className="px-5 py-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            style={{
              background: isCyber ? "rgba(255,255,255,0.02)" : "#FFF",
              borderTop: isCyber ? `1px solid ${group.accentBorder}` : `2px solid ${group.brutalBorder}`,
              borderRight: isCyber ? `1px solid ${group.accentBorder}` : `2px solid ${group.brutalBorder}`,
              borderBottom: isCyber ? `1px solid ${group.accentBorder}` : `2px solid ${group.brutalBorder}`,
              borderLeft: `5px solid ${group.accentColor}`,
            }}
          >
            <div>
              <h3
                className="font-black text-base sm:text-lg"
                style={{
                  color: isCyber ? group.accentColor : "#111",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                {group.title}
              </h3>
              <p className="text-xs theme-text-muted mt-0.5">{group.description}</p>
            </div>
            <span
              className="text-[11px] font-black px-3 py-1 rounded-full self-start sm:self-auto shrink-0"
              style={{
                backgroundColor: isCyber ? group.accentBg : "rgba(0,0,0,0.06)",
                color: isCyber ? group.accentColor : "#333",
                border: isCyber ? `1px solid ${group.accentBorder}` : "1.5px solid #000",
              }}
            >
              {entries.length} Enshrined
            </span>
          </div>

          {/* Cards grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full"
            initial="hidden"
            animate="visible"
            variants={gridContainerVariants}
          >
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                idx={idx}
                isCyber={isCyber}
                group={group}
                onEdit={onEdit}
                onDelete={onDelete}
                showType={showType}
              />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // ── Derived lists ──
  const champion = hallOfFame.find((h) => h.isChampion) ?? hallOfFame.find((h) => h.rank === 1);

  const allSorted = [...hallOfFame].sort((a, b) => a.rank - b.rank);

  // For "All" tab — show everything except champion (shown separately at top)
  const allWithoutChampion = champion
    ? allSorted.filter((e) => e.id !== champion.id)
    : allSorted;

  // For "Actress" tab — only type === "actress", sorted
  const actressList = allSorted.filter((e) => e.type === "actress");

  // For "Actors" tab — only type === "actor"
  const actorList = allSorted.filter((e) => e.type === "actor");

  // For "Anime" tab — only type === "anime"
  const animeList = allSorted.filter((e) => e.type === "anime");

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

  const tabCounts = {
    all:     hallOfFame.length,
    actor:   hallOfFame.filter((e) => e.type === "actor").length,
    actress: hallOfFame.filter((e) => e.type === "actress").length,
    anime:   hallOfFame.filter((e) => e.type === "anime").length,
  };

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
      {champion && (
        <AnimatePresence>
          {activeTab === "all" && (
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
          )}
        </AnimatePresence>
      )}

      {/* ── Tabs ── */}
      <div className="mb-6">
        <TabSwitcher
          tabs={HOF_TABS.map((t) => ({ ...t, count: tabCounts[t.id as keyof typeof tabCounts] }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">

        {/* ALL TAB — categorized by nationality */}
        {activeTab === "all" && (
          <motion.div
            key="tab-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <GroupedSection
              items={allWithoutChampion}
              allItems={allWithoutChampion}
              isCyber={isCyber}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showType
            />
          </motion.div>
        )}

        {/* ACTORS TAB — categorized by nationality */}
        {activeTab === "actor" && (
          <motion.div
            key="tab-actor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <GroupedSection
              items={actorList}
              allItems={actorList}
              isCyber={isCyber}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </motion.div>
        )}

        {/* ACTRESS TAB — only female actors, categorized by nationality */}
        {activeTab === "actress" && (
          <motion.div
            key="tab-actress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <GroupedSection
              items={actressList}
              allItems={actressList}
              isCyber={isCyber}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </motion.div>
        )}

        {/* ANIME TAB — flat grid (anime doesn't have nationalities) */}
        {activeTab === "anime" && (
          <motion.div
            key="tab-anime"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {animeList.length === 0 ? (
              <p className="text-center py-16 theme-text-muted text-sm font-semibold">
                No anime enshrined yet.
              </p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full"
                initial="hidden"
                animate="visible"
                variants={gridContainerVariants}
              >
                {animeList.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    idx={i}
                    isCyber={isCyber}
                    group={OTHER_GROUP}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

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
