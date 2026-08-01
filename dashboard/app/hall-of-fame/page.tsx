"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofProfileModal } from "@/components/ui/HofProfileModal";
import { HofCompareModal } from "@/components/ui/HofCompareModal";
import {
  HofEntryCard,
  getGroupForEntry,
  getGroupDetails,
  getTrend,
} from "@/components/cards/HofEntryCard";
import { useRouter } from "next/navigation";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";
import {
  getBadgesForEntry,
  computeHallRecords,
  computeHallAnalytics,
  generateActivityFeed,
} from "@/lib/utils/hofEngine";

type RankingTab =
  | "overall"
  | "korean"
  | "japanese"
  | "chinese"
  | "indonesia"
  | "hollywood"
  | "singer"
  | "actor_only"
  | "actress_only"
  | "anime_ranked"
  | "toku_overall"
  | "ultraman"
  | "kamen_rider"
  | "power_rangers";

type SeasonTab = "overall" | "s2026" | "s2025" | "monthly" | "weekly" | "community";

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame = [], deleteHof, likeHof } = useDashboardStore();
  const router = useRouter();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  const [subTab, setSubTab] = useState<RankingTab>("overall");
  const [seasonTab, setSeasonTab] = useState<SeasonTab>("overall");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // Modals & Comparison State
  const [profileModalEntry, setProfileModalEntry] = useState<HallOfFameEntry | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedEntries, setComparedEntries] = useState<HallOfFameEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeViewSection, setActiveViewSection] = useState<"podium" | "analytics" | "records" | "feed">("podium");

  // Ref tracking system for precise double tap detection on mobile
  const lastTapRef = useRef<{ [key: string]: number }>({});

  // ── Handlers ──
  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      const entry = hallOfFame.find((h) => h.id === id);
      confirm({
        title: "Remove Hall of Fame Entry",
        message: `Are you sure you want to remove "${name}" from Hall of Fame?`,
        confirmText: "Remove Entry",
        variant: "danger",
        itemPreview: {
          title: name,
          subtitle: `${entry?.type || "Media"} · ${entry?.nationality || "Global"}`,
          description: Array.isArray(entry?.knownFor) ? entry.knownFor.join(", ") : entry?.knownFor,
          imageUrl: entry?.imageUrl,
          icon: "👑",
          category: entry?.type,
        },
        successToast: `✓ "${name}" removed from Hall of Fame.`,
        onConfirm: async () => {
          await deleteHof(id);
        },
      });
    },
    [confirm, deleteHof, hallOfFame]
  );

  const handleInteractionTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      const lastTap = lastTapRef.current[id] || 0;

      if (now - lastTap < DOUBLE_TAP_DELAY) {
        let clientX = 0,
          clientY = 0;
        if ("touches" in e && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ("clientX" in e) {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
        }

        triggerHeartEffect(clientX, clientY);
        likeHof(id);
        delete lastTapRef.current[id];
      } else {
        lastTapRef.current[id] = now;
      }
    },
    [likeHof]
  );

  const handleLeaderboardClick = (id: string) => {
    router.push(`/characters?id=${id}`);
  };

  const handleAddToCompare = (entry: HallOfFameEntry) => {
    if (!comparedEntries.some((c) => c.id === entry.id)) {
      if (comparedEntries.length >= 4) {
        setComparedEntries([...comparedEntries.slice(1), entry]);
      } else {
        setComparedEntries([...comparedEntries, entry]);
      }
    }
    setIsCompareOpen(true);
  };

  // Helper functions to identify HOF entries
  const isSingerEntry = (entry: HallOfFameEntry) => {
    const group = getGroupForEntry(entry);
    return group === "__other__" || entry.nationality?.toLowerCase() === "singer";
  };

  const isAnimeEntry = (entry: HallOfFameEntry) => entry.type === "anime";
  const isTokusatsuEntry = (entry: HallOfFameEntry) => !!entry.tokusatsuFranchise;

  const filterBySubTab = (itemsList: HallOfFameEntry[]) => {
    if (["overall", "korean", "japanese", "chinese", "indonesia", "hollywood"].includes(subTab)) {
      const dramaBase = itemsList.filter(
        (e) => !isSingerEntry(e) && !isTokusatsuEntry(e) && !isAnimeEntry(e)
      );
      if (subTab === "overall") return dramaBase;
      if (subTab === "korean") return dramaBase.filter((e) => getGroupForEntry(e) === "Korea");
      if (subTab === "japanese") return dramaBase.filter((e) => getGroupForEntry(e) === "Japan");
      if (subTab === "chinese") return dramaBase.filter((e) => getGroupForEntry(e) === "China");
      if (subTab === "indonesia") return dramaBase.filter((e) => getGroupForEntry(e) === "Indonesia");
      if (subTab === "hollywood") return dramaBase.filter((e) => getGroupForEntry(e) === "Hollywood");
    }

    if (subTab === "singer") return itemsList.filter((e) => isSingerEntry(e));
    if (subTab === "actor_only") return itemsList.filter((e) => e.type === "actor");
    if (subTab === "actress_only") return itemsList.filter((e) => e.type === "actress");
    if (subTab === "anime_ranked") return itemsList.filter((e) => isAnimeEntry(e));

    if (["toku_overall", "ultraman", "kamen_rider", "power_rangers"].includes(subTab)) {
      const tokuBase = itemsList.filter((e) => isTokusatsuEntry(e));
      if (subTab === "toku_overall") return tokuBase;
      if (subTab === "ultraman") return tokuBase.filter((e) => e.tokusatsuFranchise === "Ultraman");
      if (subTab === "kamen_rider") return tokuBase.filter((e) => e.tokusatsuFranchise === "Kamen Rider");
      if (subTab === "power_rangers") return tokuBase.filter((e) => e.tokusatsuFranchise === "Power Rangers");
    }

    return itemsList;
  };

  const sortedList = useMemo(() => {
    let list = filterBySubTab(hallOfFame);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const matchName = item.name.toLowerCase().includes(q);
        const matchKnown = (Array.isArray(item.knownFor) ? item.knownFor.join(" ") : item.knownFor || "")
          .toLowerCase()
          .includes(q);
        return matchName || matchKnown;
      });
    }

    return list.sort((a, b) => {
      const aLikes = a.likes || 0;
      const bLikes = b.likes || 0;
      if (aLikes !== bLikes) return bLikes - aLikes;
      return a.name.localeCompare(b.name);
    });
  }, [hallOfFame, subTab, searchQuery]);

  // Derived Statistics
  const statsOverview = useMemo(() => {
    const total = hallOfFame.length;
    const goat = hallOfFame.filter((h) => h.status === "GOAT Status").length;
    const champions = hallOfFame.filter((h) => h.isChampion || h.rank === 1).length || 1;
    const nations = new Set(hallOfFame.map((h) => h.nationality || "Global")).size;
    const categories = new Set(hallOfFame.map((h) => h.type)).size;
    const totalVotes = hallOfFame.reduce((acc, h) => acc + (h.likes || 0), 0);

    return { total, goat, champions, nations, categories, totalVotes };
  }, [hallOfFame]);

  const hallRecords = useMemo(() => computeHallRecords(hallOfFame), [hallOfFame]);
  const hallAnalytics = useMemo(() => computeHallAnalytics(hallOfFame), [hallOfFame]);
  const activityFeed = useMemo(() => generateActivityFeed(hallOfFame), [hallOfFame]);

  // Top 3 Podium
  const top1 = sortedList[0];
  const top2 = sortedList[1];
  const top3 = sortedList[2];
  const restOfList = sortedList.slice(3);

  // Context Menu Handlers for Sections
  const handlePodiumContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "podium-top1",
          label: `Inspect Champion: ${top1 ? top1.name : "Champion"}`,
          icon: "👑",
          onClick: () => top1 && setProfileModalEntry(top1),
        },
        {
          id: "podium-compare",
          label: "Compare Top 3 Legends",
          icon: "⚔️",
          onClick: () => {
            setComparedEntries(sortedList.slice(0, 3));
            setIsCompareOpen(true);
          },
        },
        {
          id: "podium-recalc",
          label: "Recalculate Leaderboard",
          icon: "⚡",
          onClick: () => setSubTab("overall"),
        },
      ],
      "Championship Podium"
    );
  };

  const handleAnalyticsContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "an-recalc",
          label: "Refresh Analytics Summary",
          icon: "📊",
          onClick: () => {},
        },
        {
          id: "an-chars",
          label: "Open Master Character Directory",
          icon: "📚",
          onClick: () => router.push("/characters"),
        },
      ],
      "Hall Analytics"
    );
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* ── Title & Statistics Overview Dashboard ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
            borderColor: isCyber ? "#FFD70050" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 45px rgba(255,215,0,0.15)" : "6px 6px 0 #000000",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  🏆 Flagship Digital Museum v5
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Living Ranking Engine
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
                Hall of Fame & Museum
              </h1>
              <p className="text-sm theme-text-muted max-w-2xl font-mono leading-relaxed">
                Celebrating the greatest icons across drama, music, anime, tokusatsu, and digital media.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedEntry(null);
                  setEditorOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-black text-xs bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all cursor-pointer"
              >
                ┼ Add New Legend
              </button>
              <button
                onClick={() => router.push("/characters")}
                className="px-4 py-2.5 rounded-xl font-black text-xs border"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
                  color: isCyber ? "#00F5FF" : "#0369A1",
                  borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                📚 Open Directory
              </button>
            </div>
          </div>

          {/* Dynamic Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 mt-6 pt-6 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] theme-text-muted block">TOTAL LEGENDS</span>
              <strong className="text-base font-black theme-text-primary">{statsOverview.total}</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(255,215,0,0.05)" : "#FEFCE8", borderColor: isCyber ? "rgba(255,215,0,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-amber-400 block">GOAT STATUS</span>
              <strong className="text-base font-black text-amber-500">{statsOverview.goat}</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(245,158,11,0.05)" : "#FEF3C7", borderColor: isCyber ? "rgba(245,158,11,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-amber-500 block">CHAMPIONS</span>
              <strong className="text-base font-black text-amber-600">{statsOverview.champions}</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(59,130,246,0.05)" : "#EFF6FF", borderColor: isCyber ? "rgba(59,130,246,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-blue-400 block">NATIONS</span>
              <strong className="text-base font-black text-blue-500">{statsOverview.nations}</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(168,85,247,0.05)" : "#F3E8FF", borderColor: isCyber ? "rgba(168,85,247,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-purple-400 block">CATEGORIES</span>
              <strong className="text-base font-black text-purple-500">{statsOverview.categories}</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(236,72,153,0.05)" : "#FDF2F8", borderColor: isCyber ? "rgba(236,72,153,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-pink-400 block">TOTAL VOTES</span>
              <strong className="text-base font-black text-pink-500">{statsOverview.totalVotes} ❤️</strong>
            </div>
            <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(16,185,129,0.05)" : "#ECFDF5", borderColor: isCyber ? "rgba(16,185,129,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[9px] text-emerald-400 block">LAST UPDATED</span>
              <strong className="text-base font-black text-emerald-500">2026 Season</strong>
            </div>
          </div>
        </motion.div>

        {/* ── Sub-Tab Navigation & Seasonal Engine ── */}
        <div className="space-y-4">
          {/* Seasonal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "overall", label: "Overall Legacy", icon: "🌐" },
              { id: "s2026", label: "2026 Season", icon: "⚡" },
              { id: "s2025", label: "2025 Season", icon: "🏛️" },
              { id: "monthly", label: "Monthly Top", icon: "📅" },
              { id: "community", label: "Community Choice", icon: "💖" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSeasonTab(st.id as SeasonTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
                  seasonTab === st.id
                    ? isCyber
                      ? "bg-amber-500 text-black border border-amber-400"
                      : "bg-[#FEF08A] text-black border-2 border-black shadow-[2px_2px_0_#000]"
                    : "theme-text-muted opacity-70 hover:opacity-100"
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-Category Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overall", label: "Drama All", group: "Dramas" },
              { id: "korean", label: "🇰🇷 Korean", group: "Dramas" },
              { id: "japanese", label: "🇯🇵 Japanese", group: "Dramas" },
              { id: "chinese", label: "🇨🇳 Chinese", group: "Dramas" },
              { id: "singer", label: "🎤 Singers", group: "Music" },
              { id: "actor_only", label: "🎭 Actors", group: "Talent" },
              { id: "actress_only", label: "💫 Actresses", group: "Talent" },
              { id: "anime_ranked", label: "⛩️ Anime", group: "Anime" },
              { id: "toku_overall", label: "🦸 Tokusatsu", group: "Tokusatsu" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as RankingTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  subTab === tab.id
                    ? isCyber
                      ? "bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]"
                      : "bg-black text-white border-2 border-black shadow-[2px_2px_0_#000]"
                    : "bg-black/5 dark:bg-white/5 theme-text-muted hover:bg-black/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section Selector ── */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewSection("podium")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                activeViewSection === "podium" ? "bg-amber-500 text-black" : "theme-text-muted"
              }`}
            >
              👑 Champions Podium
            </button>
            <button
              onClick={() => setActiveViewSection("records")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                activeViewSection === "records" ? "bg-amber-500 text-black" : "theme-text-muted"
              }`}
            >
              🏆 Hall Records
            </button>
            <button
              onClick={() => setActiveViewSection("analytics")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                activeViewSection === "analytics" ? "bg-amber-500 text-black" : "theme-text-muted"
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveViewSection("feed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer ${
                activeViewSection === "feed" ? "bg-amber-500 text-black" : "theme-text-muted"
              }`}
            >
              ⚡ Activity Feed
            </button>
          </div>

          <div className="w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legend..."
              className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                color: isCyber ? "#FFF" : "#000",
                borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000",
              }}
            />
          </div>
        </div>

        {/* ── 1. CHAMPIONS PODIUM SECTION ── */}
        {(activeViewSection === "podium" || activeViewSection === "records") && (
          <div onContextMenu={handlePodiumContextMenu} className="space-y-6">
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-8 pb-4">
              {/* 🥈 Rank #2 Silver Podium */}
              {top2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full md:w-72 order-2 md:order-1 flex flex-col items-center"
                >
                  <div className="relative mb-3">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-slate-300 text-black border border-slate-400 z-10 shadow">
                      🥈 RANK #2
                    </span>
                    <HofEntryCard
                      entry={top2}
                      idx={1}
                      isCyber={isCyber}
                      group={getGroupDetails(getGroupForEntry(top2))}
                      podiumRank={2}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onOpenProfile={(e) => setProfileModalEntry(e)}
                      onCompare={(e) => handleAddToCompare(e)}
                    />
                  </div>
                </motion.div>
              )}

              {/* 👑 Rank #1 Gold Champion Podium */}
              {top1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full md:w-80 order-1 md:order-2 flex flex-col items-center z-20"
                >
                  <div className="relative mb-3 w-full flex flex-col items-center">
                    {/* Champion Crown Ribbon */}
                    <div className="mb-2 px-4 py-1 rounded-full text-xs font-black font-mono bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border-2 border-black shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse flex items-center gap-1.5">
                      <span>👑</span>
                      <span>REIGNING CHAMPION</span>
                      <span>👑</span>
                    </div>

                    <HofEntryCard
                      entry={top1}
                      idx={0}
                      isCyber={isCyber}
                      group={getGroupDetails(getGroupForEntry(top1))}
                      podiumRank={1}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onOpenProfile={(e) => setProfileModalEntry(e)}
                      onCompare={(e) => handleAddToCompare(e)}
                    />
                  </div>
                </motion.div>
              )}

              {/* 🥉 Rank #3 Bronze Podium */}
              {top3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full md:w-72 order-3 flex flex-col items-center"
                >
                  <div className="relative mb-3">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-amber-700 text-white border border-amber-800 z-10 shadow">
                      🥉 RANK #3
                    </span>
                    <HofEntryCard
                      entry={top3}
                      idx={2}
                      isCyber={isCyber}
                      group={getGroupDetails(getGroupForEntry(top3))}
                      podiumRank={3}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onOpenProfile={(e) => setProfileModalEntry(e)}
                      onCompare={(e) => handleAddToCompare(e)}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ── 2. HALL RECORDS SECTION ── */}
        {activeViewSection === "records" && (
          <div className="space-y-4">
            <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
              🏆 Hall Records & Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {hallRecords.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border font-mono space-y-1 text-center"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,215,0,0.03)" : "#FEFCE8",
                    borderColor: isCyber ? "rgba(255,215,0,0.2)" : "#000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  <span className="text-2xl block">{rec.icon}</span>
                  <span className="text-[10px] theme-text-muted uppercase block">{rec.title}</span>
                  <strong className="text-sm font-black theme-text-primary block">{rec.holderName}</strong>
                  <span className="text-xs text-amber-500 font-bold block">{rec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. HALL ANALYTICS SECTION ── */}
        {activeViewSection === "analytics" && (
          <div onContextMenu={handleAnalyticsContextMenu} className="space-y-4">
            <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
              📊 Hall Analytics & Roster Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country Distribution */}
              <div
                className="p-5 rounded-3xl border font-mono space-y-3"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                <h4 className="text-xs font-black uppercase tracking-wider theme-text-muted">
                  🌍 Country Distribution
                </h4>
                <div className="space-y-2">
                  {hallAnalytics.countryDistribution.map((item) => (
                    <div key={item.country} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{item.country}</span>
                        <span>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div
                className="p-5 rounded-3xl border font-mono space-y-3"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                <h4 className="text-xs font-black uppercase tracking-wider theme-text-muted">
                  🎬 Category Breakdown
                </h4>
                <div className="space-y-2">
                  {hallAnalytics.categoryDistribution.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="uppercase">{item.category}</span>
                        <span>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. ACTIVITY FEED SECTION ── */}
        {activeViewSection === "feed" && (
          <div className="space-y-4">
            <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
              ⚡ Recent Hall Activity Feed
            </h3>
            <div className="space-y-2">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border font-mono text-xs flex items-center justify-between gap-4"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚡</span>
                    <div>
                      <strong className="theme-text-primary block font-bold">{item.title}</strong>
                      <span className="theme-text-muted block text-[11px]">{item.description}</span>
                    </div>
                  </div>
                  <span className="text-[10px] theme-text-muted shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEADERBOARD GRID (Ranks 4+) ── */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-black uppercase tracking-widest font-mono theme-text-muted border-b pb-2">
            Top Contenders & Hall Roster
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {restOfList.map((entry, idx) => {
                const groupDetails = getGroupDetails(getGroupForEntry(entry));
                return (
                  <HofEntryCard
                    key={entry.id}
                    entry={entry}
                    idx={idx + 3}
                    isCyber={isCyber}
                    group={groupDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenProfile={(e) => setProfileModalEntry(e)}
                    onCompare={(e) => handleAddToCompare(e)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Modals ── */}
        <HofEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          entryToEdit={selectedEntry}
        />

        <HofProfileModal
          isOpen={!!profileModalEntry}
          onClose={() => setProfileModalEntry(null)}
          entry={profileModalEntry}
          onEdit={handleEdit}
          onLike={(id) => likeHof(id)}
        />

        <HofCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          legends={comparedEntries}
        />
      </div>
    </AppShell>
  );
}