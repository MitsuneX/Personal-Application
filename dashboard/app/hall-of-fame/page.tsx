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
} from "@/components/cards/HofEntryCard";
import { useRouter } from "next/navigation";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";
import {
  computeHallRecords,
  computeHallAnalytics,
  generateActivityFeed,
} from "@/lib/utils/hofEngine";

type RankingSubTab =
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
  | "korean_actor"
  | "korean_actress"
  | "japanese_actor"
  | "japanese_actress"
  | "chinese_actor"
  | "chinese_actress";

type SeasonTab = "overall" | "s2026" | "s2025" | "monthly" | "community";

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame = [], deleteHof, likeHof } = useDashboardStore();
  const router = useRouter();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  // Filter Bar State
  const [subTab, setSubTab] = useState<RankingSubTab>("overall");
  const [seasonTab, setSeasonTab] = useState<SeasonTab>("overall");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewLayoutMode, setViewLayoutMode] = useState<"podium_roster" | "full_grid">("podium_roster");
  const [activeViewSection, setActiveViewSection] = useState<"podium" | "records" | "analytics" | "feed">("podium");

  // Modals & Search State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);
  const [profileModalEntry, setProfileModalEntry] = useState<HallOfFameEntry | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedEntries, setComparedEntries] = useState<HallOfFameEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const lastTapRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const handleRecalc = () => {
      setSubTab("overall");
      setRegionFilter("all");
      setTypeFilter("all");
    };
    window.addEventListener("recalculate-goat-rankings", handleRecalc);
    return () => window.removeEventListener("recalculate-goat-rankings", handleRecalc);
  }, []);

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

  // Helper matching functions
  const matchRegion = (entry: HallOfFameEntry, targetRegion: string) => {
    if (targetRegion === "all") return true;
    const nat = (entry.nationality || "").toLowerCase();
    const group = getGroupForEntry(entry);

    if (targetRegion === "Korea" || targetRegion === "korean")
      return nat.includes("korea") || nat.includes("kr") || group === "Korea";
    if (targetRegion === "Japan" || targetRegion === "japanese")
      return nat.includes("japan") || nat.includes("jp") || group === "Japan";
    if (targetRegion === "China" || targetRegion === "chinese")
      return nat.includes("chin") || nat.includes("cn") || group === "China";
    if (targetRegion === "Indonesia" || targetRegion === "indonesia")
      return nat.includes("indo") || nat.includes("id") || group === "Indonesia";
    if (targetRegion === "Hollywood" || targetRegion === "hollywood")
      return nat.includes("holly") || nat.includes("american") || nat.includes("us") || group === "Hollywood";

    return true;
  };

  const matchType = (entry: HallOfFameEntry, targetType: string) => {
    if (targetType === "all") return true;
    if (targetType === "actor") return entry.type === "actor";
    if (targetType === "actress") return entry.type === "actress";
    if (targetType === "singer") return entry.type === "singer" || (entry.nationality || "").toLowerCase().includes("singer") || !!entry.singerType;
    if (targetType === "anime") return entry.type === "anime";
    if (targetType === "tokusatsu") return entry.type === "tokusatsu" || !!entry.tokusatsuFranchise;
    return true;
  };

  const filterBySubTab = (itemsList: HallOfFameEntry[]) => {
    let list = itemsList;

    // Apply primary subTab preset filters
    if (subTab === "korean") list = list.filter((e) => matchRegion(e, "Korea"));
    else if (subTab === "japanese") list = list.filter((e) => matchRegion(e, "Japan"));
    else if (subTab === "chinese") list = list.filter((e) => matchRegion(e, "China"));
    else if (subTab === "indonesia") list = list.filter((e) => matchRegion(e, "Indonesia"));
    else if (subTab === "hollywood") list = list.filter((e) => matchRegion(e, "Hollywood"));
    else if (subTab === "singer") list = list.filter((e) => matchType(e, "singer"));
    else if (subTab === "actor_only") list = list.filter((e) => e.type === "actor");
    else if (subTab === "actress_only") list = list.filter((e) => e.type === "actress");
    else if (subTab === "anime_ranked") list = list.filter((e) => e.type === "anime");
    else if (subTab === "toku_overall") list = list.filter((e) => e.type === "tokusatsu" || !!e.tokusatsuFranchise);
    
    // Explicit Compound Sub-Tabs
    else if (subTab === "korean_actor") list = list.filter((e) => matchRegion(e, "Korea") && e.type === "actor");
    else if (subTab === "korean_actress") list = list.filter((e) => matchRegion(e, "Korea") && e.type === "actress");
    else if (subTab === "japanese_actor") list = list.filter((e) => matchRegion(e, "Japan") && e.type === "actor");
    else if (subTab === "japanese_actress") list = list.filter((e) => matchRegion(e, "Japan") && e.type === "actress");
    else if (subTab === "chinese_actor") list = list.filter((e) => matchRegion(e, "China") && e.type === "actor");
    else if (subTab === "chinese_actress") list = list.filter((e) => matchRegion(e, "China") && e.type === "actress");

    // Apply Secondary Multi-Dimensional Controls
    if (regionFilter !== "all") {
      list = list.filter((e) => matchRegion(e, regionFilter));
    }
    if (typeFilter !== "all") {
      list = list.filter((e) => matchType(e, typeFilter));
    }

    return list;
  };

  const sortedList = useMemo(() => {
    let list = filterBySubTab(hallOfFame);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const matchName = (item.name || "").toLowerCase().includes(q);
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
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [hallOfFame, subTab, regionFilter, typeFilter, searchQuery]);

  // Derived Statistics & Records
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

  // Single Source Dataset Slicing
  const top1 = sortedList[0];
  const top2 = sortedList[1];
  const top3 = sortedList[2];
  const restOfList = sortedList.slice(3);

  // Context Menu Handler
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
          label: "Reset Leaderboard Filters",
          icon: "⚡",
          onClick: () => {
            setSubTab("overall");
            setRegionFilter("all");
            setTypeFilter("all");
          },
        },
      ],
      "Championship Podium"
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
              <span className="text-[9px] text-emerald-400 block">ACTIVE SEASON</span>
              <strong className="text-base font-black text-emerald-500">2026</strong>
            </div>
          </div>
        </motion.div>

        {/* ── FILTER & CATEGORY TOOLBAR ── */}
        <div
          className="p-5 rounded-3xl border space-y-4 font-mono text-xs shadow-lg"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
          }}
        >
          {/* Section 1: Pre-v5 Preset Sub-Tabs */}
          <div className="space-y-2 border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold theme-text-muted">PRESET CATEGORY TABS:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewLayoutMode(viewLayoutMode === "podium_roster" ? "full_grid" : "podium_roster")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-black/5 dark:bg-white/5 cursor-pointer hover:bg-amber-500/20"
                >
                  {viewLayoutMode === "podium_roster" ? "👁️ Mode: Podium + Roster" : "👁️ Mode: Full Grid (All)"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {[
                { id: "overall", label: "🌐 Overall Legacy" },
                { id: "korean", label: "🇰🇷 Korean" },
                { id: "japanese", label: "🇯🇵 Japanese" },
                { id: "chinese", label: "🇨🇳 Chinese" },
                { id: "indonesia", label: "🇮🇩 Indonesian" },
                { id: "hollywood", label: "🎬 Hollywood" },
                { id: "singer", label: "🎤 Singers" },
                { id: "actor_only", label: "🎭 Male Actors" },
                { id: "actress_only", label: "💫 Actresses" },
                { id: "anime_ranked", label: "⛩️ Anime Ranked" },
                { id: "toku_overall", label: "🦸 Tokusatsu" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSubTab(tab.id as RankingSubTab);
                    setRegionFilter("all");
                    setTypeFilter("all");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    subTab === tab.id && regionFilter === "all" && typeFilter === "all"
                      ? isCyber
                        ? "bg-amber-500 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        : "bg-black text-white font-black border border-black"
                      : "bg-black/5 dark:bg-white/5 theme-text-muted hover:bg-black/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Specialized Compound Filters (Japanese Actor Only, Korean Actress Only, etc.) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
              <span className="text-[10px] uppercase font-bold text-amber-500 shrink-0">SPECIAL COMPOUND FILTERS:</span>
              {[
                { id: "japanese_actor", label: "🇯🇵 Japanese Actor Only" },
                { id: "japanese_actress", label: "🇯🇵 Japanese Actress Only" },
                { id: "korean_actor", label: "🇰🇷 Korean Actor Only" },
                { id: "korean_actress", label: "🇰🇷 Korean Actress Only" },
                { id: "chinese_actor", label: "🇨🇳 Chinese Actor Only" },
                { id: "chinese_actress", label: "🇨🇳 Chinese Actress Only" },
              ].map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => {
                    setSubTab(cp.id as RankingSubTab);
                    setRegionFilter("all");
                    setTypeFilter("all");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                    subTab === cp.id
                      ? isCyber
                        ? "bg-[#00F5FF] text-black font-black"
                        : "bg-cyan-500 text-white font-black"
                      : "bg-black/5 dark:bg-white/5 theme-text-muted hover:bg-black/10"
                  }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Multi-Dimensional Controls (Region dropdown/chips + Type dropdown/chips + Search) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold theme-text-muted">REGION:</span>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                    color: isCyber ? "#FFF" : "#000",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  }}
                >
                  <option value="all">All Regions</option>
                  <option value="Korea">🇰🇷 Korea</option>
                  <option value="Japan">🇯🇵 Japan</option>
                  <option value="China">🇨🇳 China</option>
                  <option value="Hollywood">🎬 Hollywood</option>
                  <option value="Indonesia">🇮🇩 Indonesia</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold theme-text-muted">TYPE:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                    color: isCyber ? "#FFF" : "#000",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="actor">🎭 Actor</option>
                  <option value="actress">💫 Actress</option>
                  <option value="singer">🎤 Singer</option>
                  <option value="anime">⛩️ Anime</option>
                  <option value="tokusatsu">🦸 Tokusatsu</option>
                </select>
              </div>

              {(regionFilter !== "all" || typeFilter !== "all") && (
                <button
                  onClick={() => {
                    setRegionFilter("all");
                    setTypeFilter("all");
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 cursor-pointer"
                >
                  Clear Refinements ✕
                </button>
              )}
            </div>

            {/* Live Search */}
            <div className="w-full md:w-64 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legend name or works..."
                className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  color: isCyber ? "#FFF" : "#000",
                  borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── 1. CHAMPIONS PODIUM SECTION ── */}
        {(activeViewSection === "podium" || activeViewSection === "records") && viewLayoutMode === "podium_roster" && (
          <div onContextMenu={handlePodiumContextMenu} className="space-y-6">
            {sortedList.length === 0 ? (
              <div className="text-center py-16 p-6 rounded-3xl border border-dashed text-xs font-mono theme-text-muted space-y-3">
                <div className="text-4xl">👑</div>
                <h3 className="font-black text-base theme-text-primary">No legends found matching active filters.</h3>
                <p className="max-w-md mx-auto">
                  Try clearing search or switching sub-tabs above.
                </p>
                <button
                  onClick={() => {
                    setSubTab("overall");
                    setRegionFilter("all");
                    setTypeFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  Reset All Filters ↺
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-items-center max-w-5xl mx-auto pt-4 pb-2">
                {/* 🥈 Rank #2 Silver Podium */}
                {top2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full flex flex-col items-center order-2 md:order-1 max-w-[280px]"
                  >
                    <div className="relative w-full flex flex-col items-center">
                      <span className="mb-2 px-3 py-0.5 rounded-full text-xs font-black font-mono bg-slate-300 text-black border border-slate-400 z-10 shadow">
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
                ) : <div className="hidden md:block w-full max-w-[280px] order-2 md:order-1" />}

                {/* 👑 Rank #1 Gold Champion Podium */}
                {top1 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full flex flex-col items-center order-1 md:order-2 max-w-[280px] z-20"
                  >
                    <div className="relative w-full flex flex-col items-center">
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
                ) : <div className="hidden md:block w-full max-w-[280px] order-1 md:order-2" />}

                {/* 🥉 Rank #3 Bronze Podium */}
                {top3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full flex flex-col items-center order-3 max-w-[280px]"
                  >
                    <div className="relative w-full flex flex-col items-center">
                      <span className="mb-2 px-3 py-0.5 rounded-full text-xs font-black font-mono bg-amber-700 text-white border border-amber-800 z-10 shadow">
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
                ) : <div className="hidden md:block w-full max-w-[280px] order-3" />}
              </div>
            )}
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
          <div className="space-y-4">
            <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
              📊 Hall Analytics & Roster Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* ── FULL LEADERBOARD ROSTER GRID (ALWAYS VISIBLE & SEQUENTIAL) ── */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-black uppercase tracking-widest font-mono theme-text-primary flex items-center gap-2">
              <span>Top Contenders & Hall Roster</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400">
                {sortedList.length} Total
              </span>
            </h3>
            {sortedList.length > 0 && (
              <span className="text-xs font-mono theme-text-muted font-bold">
                {viewLayoutMode === "full_grid"
                  ? `Showing Ranks #1 – #${sortedList.length}`
                  : restOfList.length > 0
                  ? `Showing Ranks #4 – #${sortedList.length}`
                  : `All ${sortedList.length} Entries Featured on Podium Above`}
              </span>
            )}
          </div>

          {/* Grid Render Logic */}
          {(viewLayoutMode === "full_grid" ? sortedList : restOfList).length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed text-center font-mono text-xs theme-text-muted space-y-2">
              <div className="text-2xl">✨</div>
              {sortedList.length > 0 ? (
                <p className="font-bold">
                  All {sortedList.length} entries in this category are featured on the Champions Podium above! Switch to &quot;Full Grid&quot; mode to view all cards together.
                </p>
              ) : (
                <p className="font-bold">No legends found matching your current filter criteria.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {(viewLayoutMode === "full_grid" ? sortedList : restOfList).map((entry, idx) => {
                  const groupDetails = getGroupDetails(getGroupForEntry(entry));
                  const displayRank = viewLayoutMode === "full_grid" ? idx : idx + 3;
                  return (
                    <HofEntryCard
                      key={entry.id}
                      entry={entry}
                      idx={displayRank}
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
          )}
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