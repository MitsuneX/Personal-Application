"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofEntryCard, getGroupForEntry, getGroupDetails, getTrend } from "@/components/cards/HofEntryCard";
import type { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useRouter } from "next/navigation";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof, likeHof } = useDashboardStore();
  const router = useRouter();

  const [subTab, setSubTab] = useState<"overall" | "korean" | "japanese" | "chinese" | "hollywood">("overall");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // ── Handlers ──
  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the database?`)) {
      await deleteHof(id);
    }
  }, [deleteHof]);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    triggerHeartEffect(clientX, clientY);
  };

  const handleLeaderboardClick = (id: string) => {
    router.push(`/characters?id=${id}`);
  };

  // Sorting purely by Dynamic Like Counts Descending
  const sortedByLikes = [...hallOfFame].sort((a, b) => {
    const aLikes = a.likes || 0;
    const bLikes = b.likes || 0;
    if (aLikes !== bLikes) return bLikes - aLikes;
    return a.name.localeCompare(b.name);
  });

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
  const currentFilteredList = sortHofEntries(filterBySubTab(hallOfFame));

  function sortHofEntries(entriesList: HallOfFameEntry[]) {
    return [...entriesList].sort((a, b) => {
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      if (aLikes !== bLikes) return bLikes - aLikes;
      return a.name.localeCompare(b.name);
    });
  }

  // Top 3 Podium Selection
  const rank1 = currentFilteredList[0];
  const rank2 = currentFilteredList[1];
  const rank3 = currentFilteredList[2];

  // Contenders (Ranks 4+)
  const restOfList = currentFilteredList.slice(3);

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
              {isCyber ? "THE_APEX_CHARTS" : "The Apex Charts"}
            </h1>
            <p className="theme-text-secondary text-xs font-semibold">
              The ultimate gamified podium ranking for the elite Hall of Fame characters.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/characters")}
              className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border border-adaptive-unique shrink-0 hover:bg-black/5 dark:hover:bg-white/5"
            >
              📖 View Directory
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Regional Sub-Navigation Leaderboard Switcher ── */}
      <div 
        className="mb-8 p-1.5 rounded-xl flex flex-wrap gap-1.5 text-xs font-bold w-fit border-adaptive-unique"
        style={{
          backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
          borderWidth: isCyber ? "1px" : "3px",
          boxShadow: isCyber ? "none" : "4px 4px 0 #000"
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
                  ? isCyber 
                    ? "#00F5FF" 
                    : "#000"
                  : isCyber
                    ? "#94A3B8"
                    : "#666",
                border: isActive && !isCyber ? "2px solid #000" : "2px solid transparent",
                transform: isActive && !isCyber ? "translate(-2px, -2px)" : "none",
                boxShadow: isActive && !isCyber ? "2px 2px 0 #000" : "none",
              }}
            >
              <span>{tab.flag}</span>
              <span className="uppercase tracking-wider text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3-Position Podium Layout with physical pedestal blocks ── */}
      {currentFilteredList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="text-4xl mb-4 grayscale opacity-50">🏆</div>
          <h3 className="font-black text-lg theme-text-primary mb-2">No Legends Yet</h3>
          <p className="text-sm theme-text-muted">Use the directory page to enshrine your first entry!</p>
        </div>
      ) : (
        <div className="mb-16">
          <h2 
            className="text-center font-black text-lg md:text-2xl uppercase tracking-widest mb-10"
            style={{
              color: isCyber ? "#00F5FF" : "#000",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "👑 APEX_PODIUM_SLOTS" : "👑 The Championship Podium"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-end justify-items-center max-w-5xl mx-auto px-4">
            
            {/* Rank 2 (Left, Mid height Pedestal) */}
            <div className="order-2 md:order-1 flex flex-col items-center w-full max-w-[280px]">
              <div className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-[#94A3B8] flex items-center gap-1">
                🥈 2nd Place
              </div>
              {rank2 ? (
                <>
                  <HofEntryCard
                    entry={rank2}
                    idx={1}
                    isCyber={isCyber}
                    group={getGroupDetails(getGroupForEntry(rank2))}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    podiumRank={2}
                    onDoubleTap={handleDoubleTap}
                  />
                  {/* Pedestal block */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    className="w-full h-24 mt-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shrink-0 origin-bottom"
                    style={{
                      backgroundColor: isCyber ? "rgba(148, 163, 184, 0.15)" : "#E2E8F0",
                      border: isCyber ? "2px solid rgba(148, 163, 184, 0.4)" : "4px solid #000",
                      boxShadow: isCyber ? "0 0 20px rgba(148, 163, 184, 0.15)" : "6px 6px 0px #000",
                      backgroundImage: isCyber ? "radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)" : "none",
                      backgroundSize: isCyber ? "10px 10px" : "none",
                    }}
                  >
                    <span className="text-4xl font-black text-[#94A3B8] tracking-tighter">2</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Contender</span>
                  </motion.div>
                </>
              ) : (
                <div className="h-60 border-2 border-dashed border-adaptive-unique rounded-2xl w-full flex items-center justify-center text-xs theme-text-muted">
                  Vacancy
                </div>
              )}
            </div>

            {/* Rank 1 (Center, Elevated/Tallest Pedestal) */}
            <div className="order-1 md:order-2 flex flex-col items-center w-full max-w-[280px] md:-translate-y-6 relative">
              <div className="mb-2 text-center text-xs font-black uppercase tracking-widest text-[#EAB308] flex items-center gap-1.5 animate-pulse">
                🏆 Apex Champion 👑
              </div>
              {rank1 ? (
                <>
                  {/* Crown Icon above card */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-4xl absolute -top-10 z-20 pointer-events-none filter drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                  >
                    👑
                  </motion.div>

                  <div 
                    className="w-full flex justify-center relative"
                    style={{
                      filter: isCyber ? "drop-shadow(0 0 25px rgba(250, 204, 21, 0.35))" : "none"
                    }}
                  >
                    <HofEntryCard
                      entry={rank1}
                      idx={0}
                      isCyber={isCyber}
                      group={getGroupDetails(getGroupForEntry(rank1))}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      podiumRank={1}
                      onDoubleTap={handleDoubleTap}
                    />
                  </div>

                  {/* Pedestal block */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="w-full h-36 mt-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shrink-0 origin-bottom"
                    style={{
                      backgroundColor: isCyber ? "rgba(255, 215, 0, 0.15)" : "#FEF08A",
                      border: isCyber ? "3px solid #EAB308" : "4px solid #000",
                      boxShadow: isCyber ? "0 0 35px rgba(250, 204, 21, 0.4)" : "8px 8px 0px #000",
                      backgroundImage: isCyber 
                        ? "radial-gradient(rgba(250, 204, 21, 0.3) 1px, transparent 1px)"
                        : "repeating-linear-gradient(45deg, #FEF9C3, #FEF9C3 12px, #FEF08A 12px, #FEF08A 24px)",
                      backgroundSize: isCyber ? "12px 12px" : "auto",
                    }}
                  >
                    {/* Retro patterns */}
                    {!isCyber && (
                      <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none opacity-40 font-black text-xs select-none">
                        <span>★</span>
                        <span>CHAMPION</span>
                        <span>★</span>
                      </div>
                    )}
                    <span className="text-6xl font-black text-[#EAB308] dark:text-[#FBBF24] tracking-tighter">1</span>
                    <span className="text-[9px] uppercase tracking-widest font-black opacity-80 text-amber-700 dark:text-amber-400">THE APEX</span>
                  </motion.div>
                </>
              ) : (
                <div className="h-60 border-2 border-dashed border-adaptive-unique rounded-2xl w-full flex items-center justify-center text-xs theme-text-muted">
                  Vacancy
                </div>
              )}
            </div>

            {/* Rank 3 (Right, Shortest Pedestal) */}
            <div className="order-3 md:order-3 flex flex-col items-center w-full max-w-[280px]">
              <div className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-[#B45309] flex items-center gap-1">
                🥉 3rd Place
              </div>
              {rank3 ? (
                <>
                  <HofEntryCard
                    entry={rank3}
                    idx={2}
                    isCyber={isCyber}
                    group={getGroupDetails(getGroupForEntry(rank3))}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    podiumRank={3}
                    onDoubleTap={handleDoubleTap}
                  />
                  {/* Pedestal block */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="w-full h-16 mt-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shrink-0 origin-bottom"
                    style={{
                      backgroundColor: isCyber ? "rgba(180, 83, 9, 0.15)" : "#FFEDD5",
                      border: isCyber ? "2px solid rgba(180, 83, 9, 0.4)" : "4px solid #000",
                      boxShadow: isCyber ? "0 0 20px rgba(180, 83, 9, 0.15)" : "6px 6px 0px #000",
                      backgroundImage: isCyber ? "radial-gradient(rgba(180, 83, 9, 0.25) 1px, transparent 1px)" : "none",
                      backgroundSize: isCyber ? "10px 10px" : "none",
                    }}
                  >
                    <span className="text-3xl font-black text-[#B45309] tracking-tighter">3</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Finalist</span>
                  </motion.div>
                </>
              ) : (
                <div className="h-60 border-2 border-dashed border-adaptive-unique rounded-2xl w-full flex items-center justify-center text-xs theme-text-muted">
                  Vacancy
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Ranks 4+ Contenders Section ── */}
      {restOfList.length > 0 && (
        <motion.div
          className="p-6 rounded-2xl relative overflow-hidden mb-16"
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
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-dashed border-adaptive-unique pb-2 theme-text-primary">
            Top Contenders (Ranks 4+)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {restOfList.map((entry, idx) => {
              const trend = getTrend(entry.id);
              const groupDetails = getGroupDetails(getGroupForEntry(entry));

              return (
                <div 
                  key={entry.id} 
                  onClick={() => handleLeaderboardClick(entry.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); handleDoubleTap(e, entry.id); likeHof(entry.id); }}
                  className="flex items-center justify-between p-3 rounded-xl border border-adaptive-unique bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02] shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F0F0F0",
                        color: isCyber ? "#94A3B8" : "#555",
                        border: `1px solid ${isCyber ? "rgba(255,255,255,0.1)" : "#CCC"}`
                      }}
                    >
                      #{idx + 4}
                    </span>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-adaptive-unique shrink-0 flex items-center justify-center bg-black/10 text-xs font-black relative">
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: isCyber ? groupDetails.accentBorder : groupDetails.brutalBorder }} />
                      {entry.imageUrl ? (
                        <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{entry.name.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-xs font-black theme-text-primary leading-none truncate max-w-[100px]">{entry.name}</h4>
                      <p className="text-[9px] theme-text-muted mt-1 uppercase font-mono truncate">
                        {entry.nationality || "Other"} · {entry.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black flex items-center gap-0.5 ${trend.text}`}>
                        {trend.icon} {trend.label}
                      </span>
                    </div>

                    <div className="flex flex-col items-end bg-black/5 dark:bg-white/5 border border-adaptive-unique px-2 py-0.5 rounded">
                      <span className="text-xs font-black theme-text-primary font-mono">{entry.likes || 0} ❤️</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Editor Modal ── */}
      <AnimatePresence>
        {editorOpen && (
          <HofEditorModal
            isOpen={editorOpen}
            onClose={() => setEditorOpen(false)}
            entryToEdit={selectedEntry}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
