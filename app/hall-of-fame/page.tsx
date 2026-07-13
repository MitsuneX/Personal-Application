"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import type { MediaStatus, HallOfFameEntry } from "@/lib/store/dashboardStore";

const HOF_TABS = [
  { id: "all",     label: "All",       icon: "◈" },
  { id: "actor",   label: "Actors",    icon: "🎭" },
  { id: "actress", label: "Favorite Artists", icon: "💫" },
  { id: "anime",   label: "Anime",     icon: "⛩️"  },
];

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

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof } = useDashboardStore();

  const [activeTab, setActiveTab] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // Filter HOF list
  const filtered = activeTab === "all" ? hallOfFame : hallOfFame.filter((e) => e.type === activeTab);
  
  // Sort list by rank (Rank 1, 2, 3...)
  const sortedList = [...filtered].sort((a, b) => a.rank - b.rank);

  // Identify Champion (overall Leader)
  const champion = hallOfFame.find((h) => h.isChampion) || hallOfFame.find((h) => h.rank === 1);
  
  // Filter out the champion from standard list if we are in "All" view to prevent duplicate visual clutter
  const listWithoutChampion = activeTab === "all" && champion
    ? sortedList.filter((e) => e.id !== champion.id)
    : sortedList;

  const handleEdit = (entry: HallOfFameEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setEditorOpen(true);
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${name}" from Hall of Fame?`)) {
      await deleteHof(id);
    }
  };

  return (
    <AppShell>
      {/* Top Main Banner */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(255,215,0,0.08), rgba(0,245,255,0.05))"
            : "linear-gradient(135deg, #FFF9C4, #FFF5E4, #FFE4B5)",
          border: isCyber ? "1px solid rgba(255,215,0,0.3)" : "3px solid #00",
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
            <motion.h1
              className="font-black text-3xl md:text-5xl mb-1"
              style={{
                color: isCyber ? "#FFD700" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                textShadow: isCyber ? "0 0 20px rgba(255,215,0,0.5)" : "none",
              }}
            >
              {isCyber ? "FAVORITE_ARTISTS" : "Mitsu's Favorite Artists"}
            </motion.h1>
            <p className="theme-text-secondary text-xs font-semibold">
              Curate and rank Mitsu's absolute favorite actresses, actors, and anime masterworks.
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

      {/* 👑 Champion / Leader Section */}
      {champion && activeTab === "all" && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xs font-black tracking-widest uppercase theme-text-secondary mb-3 flex items-center gap-1.5">
            <span>✨</span> Overall Champion / Leader
          </h3>
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden border-adaptive-unique group"
            style={{
              background: isCyber 
                ? "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(10,15,44,0.9))" 
                : "linear-gradient(135deg, #FFF9C4, #FFF)",
              border: isCyber ? "2px solid #FFD700" : "4px double #000000",
              boxShadow: isCyber ? "0 0 45px rgba(255,215,0,0.25)" : "6px 6px 0 rgba(0,0,0,1)",
            }}
          >
            {/* Cyber Brackets in Gold */}
            {isCyber && (
              <>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FFD700]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FFD700]" />
              </>
            )}

            {/* Absolute champion badge */}
            <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                backgroundColor: "rgba(255,215,0,0.15)",
                color: "#FFD700",
                borderColor: "#FFD700",
              }}
            >
              👑 CHAMPION
            </span>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
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
                      "{champion.note}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {champion.knownFor.map((work) => (
                    <span
                      key={work}
                      className="text-xs px-2.5 py-1 rounded-lg border border-adaptive-unique font-bold"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,215,0,0.05)" : "#FFF",
                        borderColor: "#FFD700",
                      }}
                    >
                      🎬 {work}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 md:self-end">
                <button
                  onClick={(e) => handleEdit(champion, e)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-adaptive-unique hover:bg-black/5 dark:hover:bg-white/5"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => handleDelete(champion.id, champion.name, e)}
                  className="px-3 py-1.5 text-xs font-bold text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/10"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs list */}
      <div className="mb-6">
        <TabSwitcher
          tabs={HOF_TABS.map((t) => ({
            ...t,
            count: t.id === "all" ? hallOfFame.length : hallOfFame.filter((e) => e.type === t.id).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Grid of Standard Enshrinements */}
      <AnimatePresence mode="wait">
          {activeTab === "actress" ? (
            <div className="w-full space-y-12">
              {/* Group definition helper */}
              {[
                {
                  code: "China",
                  title: "🇨🇳 Chinese Artists",
                  description: "Elegant aesthetics, classic C-drama stars, and imperial red profiles",
                  accentColor: "#FF2A2A",
                  accentBg: "rgba(255,42,42,0.06)",
                  accentBorder: "rgba(255,42,42,0.3)",
                  brutalBorder: "#CC1111",
                },
                {
                  code: "Korea",
                  title: "🇰🇷 Korean Artists",
                  description: "Absolute favorites and hallyu superstars in premium styled layouts",
                  accentColor: "#FF7EB9",
                  accentBg: "rgba(255,126,185,0.06)",
                  accentBorder: "rgba(255,126,185,0.3)",
                  brutalBorder: "#CC3377",
                },
                {
                  code: "Hollywood",
                  title: "🎬 Hollywood Artists",
                  description: "VIP spotlight stars and marquee western screen talents",
                  accentColor: "#FFD700",
                  accentBg: "rgba(255,215,0,0.06)",
                  accentBorder: "rgba(255,215,0,0.3)",
                  brutalBorder: "#B59300",
                }
              ].map((group) => {
                const groupItems = listWithoutChampion.filter(
                  (item) => item.nationality?.toLowerCase() === group.code.toLowerCase()
                );

                if (groupItems.length === 0) return null;

                return (
                  <div key={group.code} className="space-y-4">
                    {/* Header bar for country */}
                    <div 
                      className="p-4 rounded-xl border-adaptive-unique flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      style={{
                        background: isCyber ? "rgba(255,255,255,0.02)" : "#FFF",
                        borderLeft: `6px solid ${group.accentColor}`,
                      }}
                    >
                      <div>
                        <h3 
                          className="font-black text-lg sm:text-xl flex items-center gap-2"
                          style={{
                            color: isCyber ? group.accentColor : "#000",
                            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                          }}
                        >
                          {group.title}
                        </h3>
                        <p className="text-xs theme-text-muted mt-0.5">
                          {group.description}
                        </p>
                      </div>
                      <span 
                        className="theme-badge text-xs px-2.5 py-1 self-start sm:self-auto"
                        style={{
                          backgroundColor: isCyber ? group.accentBg : "rgba(0,0,0,0.05)",
                          color: isCyber ? group.accentColor : "#000",
                          borderColor: isCyber ? group.accentBorder : "#000",
                        }}
                      >
                        {groupItems.length} Enshrined
                      </span>
                    </div>

                    {/* Group specific cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupItems.map((entry, idx) => {
                        const cyberStyle  = STATUS_STYLE[entry.status] || STATUS_STYLE["GOAT Status"];
                        const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

                        return (
                          <motion.div
                            key={entry.id}
                            variants={cardVariants}
                            custom={idx}
                            className="group relative cursor-pointer"
                            onClick={(e) => handleEdit(entry, e)}
                          >
                            <div
                              className="rounded-xl p-5 h-full flex flex-col gap-3 relative overflow-hidden transition-all border-adaptive-unique"
                              style={{
                                background: isCyber 
                                  ? `linear-gradient(135deg, rgba(10,15,44,0.9), ${group.accentBg})` 
                                  : "#FFFFFF",
                                border: isCyber 
                                  ? `1px solid ${group.accentBorder}` 
                                  : `2px solid ${group.brutalBorder}`,
                                boxShadow: isCyber 
                                  ? `0 0 25px ${group.accentBg}` 
                                  : `4px 4px 0px 0px #000`,
                              }}
                            >
                              {/* Rank flag */}
                              <div className="absolute top-3 right-3 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: isCyber ? group.accentBg : "#FFD166",
                                  color: isCyber ? group.accentColor : "#000",
                                  border: isCyber ? `1px solid ${group.accentBorder}` : "1.5px solid #000",
                                }}
                              >
                                🏆 Rank #{entry.rank}
                              </div>

                              {/* Status */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: isCyber ? cyberStyle.color : brutalStyle.color }}>
                                  {entry.status}
                                </span>
                              </div>

                              {/* Name */}
                              <div className="pt-1">
                                <h3 className="font-black text-base theme-text-primary leading-tight">
                                  {entry.name}
                                </h3>
                                {entry.note && (
                                  <p className="text-xs theme-text-muted mt-1 italic leading-relaxed">
                                    "{entry.note}"
                                  </p>
                                )}
                              </div>

                              {/* Known for */}
                              <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                                {entry.knownFor.map((work) => (
                                  <span key={work} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                                    style={{
                                      backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFF",
                                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                                      color: isCyber ? "#94A3B8" : "#6B7280",
                                    }}
                                  >
                                    {work}
                                  </span>
                                ))}
                              </div>

                              {/* Hover Quick Action Buttons */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-lg backdrop-blur-sm z-20">
                                <button
                                  onClick={(e) => handleEdit(entry, e)}
                                  className="p-1 text-xs hover:bg-white/10 rounded"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => handleDelete(entry.id, entry.name, e)}
                                  className="p-1 text-xs hover:bg-white/10 text-red-400 rounded"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listWithoutChampion.map((entry, i) => {
                const cyberStyle  = STATUS_STYLE[entry.status] || STATUS_STYLE["GOAT Status"];
                const brutalStyle = BRUTAL_STATUS_STYLE[entry.status] || BRUTAL_STATUS_STYLE["GOAT Status"];

                return (
                  <motion.div
                    key={entry.id}
                    variants={cardVariants}
                    custom={i}
                    className="group relative cursor-pointer"
                    onClick={(e) => handleEdit(entry, e)}
                  >
                    <div
                      className="rounded-xl p-5 h-full flex flex-col gap-3 relative overflow-hidden transition-transform border-adaptive-unique"
                      style={{
                        background: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                      }}
                    >
                      {/* Rank flag */}
                      <div className="absolute top-3 right-3 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFD166",
                          color: isCyber ? "#00F5FF" : "#000",
                          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                        }}
                      >
                        🏆 Rank #{entry.rank}
                      </div>

                      {/* Type and status */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
                            color: isCyber ? "#94A3B8" : "#4A4A4A",
                          }}
                        >
                          {entry.type === "actor" ? "🎭 Actor" : entry.type === "actress" ? "💫 Actress" : "⛩️ Anime"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: isCyber ? cyberStyle.color : brutalStyle.color }}>
                          {entry.status}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="pt-1">
                        <h3 className="font-black text-base theme-text-primary leading-tight">
                          {entry.name}
                        </h3>
                        {entry.note && (
                          <p className="text-xs theme-text-muted mt-1 italic leading-relaxed">
                            "{entry.note}"
                          </p>
                        )}
                      </div>

                      {/* Known for */}
                      <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                        {entry.knownFor.map((work) => (
                          <span key={work} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFF",
                              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
                              color: isCyber ? "#94A3B8" : "#6B7280",
                            }}
                          >
                            {work}
                          </span>
                        ))}
                      </div>

                      {/* Hover Quick Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-lg backdrop-blur-sm z-20">
                        <button
                          onClick={(e) => handleEdit(entry, e)}
                          className="p-1 text-xs hover:bg-white/10 rounded"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDelete(entry.id, entry.name, e)}
                          className="p-1 text-xs hover:bg-white/10 text-red-400 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
      </AnimatePresence>

      {/* Editor Modal Popup */}
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
