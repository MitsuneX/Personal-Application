"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofProfileModal } from "@/components/ui/HofProfileModal";
import { HofCompareModal } from "@/components/ui/HofCompareModal";
import { HofPodiumSection } from "@/components/hof/HofPodiumSection";
import { HofFilterToolbar } from "@/components/hof/HofFilterToolbar";
import { HofRecordsSection } from "@/components/hof/HofRecordsSection";
import { HofTimelineSection } from "@/components/hof/HofTimelineSection";
import { HofAnalyticsDashboard } from "@/components/hof/HofAnalyticsDashboard";
import { HofActivityFeed } from "@/components/hof/HofActivityFeed";
import { HofLiveLeaderboard } from "@/components/hof/HofLiveLeaderboard";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";
import {
  computeHallRecords,
  computeHallAnalytics,
  generateActivityFeed,
  getChampionshipTimeline,
  getPrestigeTier,
} from "@/lib/utils/hofEngine";

export default function HallOfFamePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame = [], games = [], gameCharacters = [], hallEvents = [], championshipHistory = [], deleteHof, likeHof } = useDashboardStore();
  const router = useRouter();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  // Dropdown Filter Toolbar State
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [professionFilter, setProfessionFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [prestigeFilter, setPrestigeFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("likes");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);
  const [profileModalEntry, setProfileModalEntry] = useState<HallOfFameEntry | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedEntries, setComparedEntries] = useState<HallOfFameEntry[]>([]);

  const handleResetFilters = useCallback(() => {
    setCategoryFilter("all");
    setSelectedGames([]);
    setFeaturedOnly(false);
    setCountryFilter("all");
    setProfessionFilter("all");
    setSeasonFilter("all");
    setPrestigeFilter("all");
    setSortFilter("likes");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const handleRecalc = () => {
      handleResetFilters();
    };
    window.addEventListener("recalculate-goat-rankings", handleRecalc);
    return () => window.removeEventListener("recalculate-goat-rankings", handleRecalc);
  }, [handleResetFilters]);

  // Handlers
  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      const entry = hallOfFame.find((h) => h.id === id);
      confirm({
        title: `Move "${name}" to History?`,
        message: `Moving "${name}" to History removes them from the main Hall of Fame list. You can view or restore them anytime from top-bar History.`,
        variant: "warning",
        confirmText: "Move to History",
        itemPreview: {
          title: name,
          subtitle: `${entry?.type || "Media"} · ${entry?.nationality || "Global"}`,
          description: Array.isArray(entry?.knownFor) ? entry.knownFor.join(", ") : entry?.knownFor,
          imageUrl: entry?.imageUrl,
          icon: "📜",
          category: entry?.type,
        },
        successToast: `✓ Moved "${name}" to History.`,
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

  // Map Game Characters to HallOfFameEntry interface for Game category rankings
  const gameHofEntries = useMemo(() => {
    return gameCharacters.map((gc) => ({
      id: `gc-${gc.id}`,
      gameCharacterId: gc.id,
      name: gc.name,
      type: "none" as const,
      status: "Completed" as any,
      knownFor: [gc.gameName || "Game Character", gc.role || "", gc.element || ""].filter(Boolean),
      nationality: gc.nation || gc.gameName || "Game",
      singerType: gc.gameName || undefined,
      note: gc.notes || undefined,
      imageUrl: gc.cardImage || gc.avatarUrl || gc.splashArt || undefined,
      rank: gc.rank || null,
      likes: gc.likes || 0,
      isChampion: false,
      isFavorite: gc.isFavorite,
      badges: gc.isFeatured ? ["⭐ FEATURED"] : [],
      gameName: gc.gameName,
      isFeatured: gc.isFeatured,
      isGameCharacterEntry: true,
    }));
  }, [gameCharacters]);

  // Helper filters
  const sortedList = useMemo(() => {
    let list: any[] = [...hallOfFame];

    // Category filter
    if (categoryFilter === "game") {
      // Combine game characters with game-related hall of fame entries
      list = [
        ...gameHofEntries,
        ...hallOfFame.filter(
          (e) =>
            (e as any).gameName ||
            (Array.isArray(e.knownFor) && e.knownFor.some((k: string) => games.some((g) => k.toLowerCase().includes(g.game.toLowerCase()))))
        ),
      ];

      // Multi-Select Game Filtering
      if (selectedGames.includes("__NONE__")) {
        list = [];
      } else if (selectedGames.length > 0 && selectedGames.length < games.length) {
        const lowerSelected = selectedGames.map((g) => g.toLowerCase());
        list = list.filter((e) => {
          const gName = (e.gameName || e.nationality || "").toLowerCase();
          const matchGameName = lowerSelected.some((sg) => gName.includes(sg));
          const matchKnownFor =
            Array.isArray(e.knownFor) &&
            e.knownFor.some((k: string) => lowerSelected.some((sg) => k.toLowerCase().includes(sg)));
          return matchGameName || matchKnownFor;
        });
      }
    } else if (categoryFilter !== "all") {
      if (categoryFilter === "drama")
        list = list.filter((e) => e.type !== "anime" && e.type !== "tokusatsu" && e.type !== "singer");
      else if (categoryFilter === "anime") list = list.filter((e) => e.type === "anime");
      else if (categoryFilter === "tokusatsu")
        list = list.filter((e) => e.type === "tokusatsu" || !!e.tokusatsuFranchise);
      else if (categoryFilter === "music")
        list = list.filter((e) => e.type === "singer" || (e.nationality || "").toLowerCase().includes("singer"));
      else if (categoryFilter === "movie")
        list = list.filter(
          (e) =>
            (e.nationality || "").toLowerCase().includes("movie") ||
            (Array.isArray(e.knownFor) && e.knownFor.some((k: string) => k.toLowerCase().includes("movie")))
        );
    }

    // Country filter
    if (countryFilter !== "all") {
      list = list.filter((e) => (e.nationality || "").toLowerCase().includes(countryFilter.toLowerCase()));
    }

    // Profession filter
    if (professionFilter !== "all") {
      if (professionFilter === "actor") list = list.filter((e) => e.type === "actor");
      else if (professionFilter === "actress") list = list.filter((e) => e.type === "actress");
      else if (professionFilter === "singer") list = list.filter((e) => e.type === "singer");
      else if (professionFilter === "anime") list = list.filter((e) => e.type === "anime");
      else if (professionFilter === "tokusatsu")
        list = list.filter((e) => e.type === "tokusatsu" || !!e.tokusatsuFranchise);
    }

    // Prestige filter
    if (prestigeFilter !== "all") {
      list = list.filter((e, idx) => getPrestigeTier(e, idx).name === prestigeFilter);
    }

    // Featured Only filter
    if (featuredOnly) {
      list = list.filter((e) => e.isFeatured || e.isFavorite);
    }

    // Search query
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

    // Sorting
    return list.sort((a, b) => {
      if (sortFilter === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortFilter === "works")
        return (
          (Array.isArray(b.knownFor) ? b.knownFor.length : 0) -
          (Array.isArray(a.knownFor) ? a.knownFor.length : 0)
        );
      return (b.likes || 0) - (a.likes || 0);
    });
  }, [
    hallOfFame,
    gameHofEntries,
    games,
    categoryFilter,
    selectedGames,
    countryFilter,
    professionFilter,
    prestigeFilter,
    featuredOnly,
    sortFilter,
    searchQuery,
  ]);

  // Derived Statistics & Records (100% Live & Reactive)
  const statsOverview = useMemo(() => {
    const total = hallOfFame.length;
    const goat = hallOfFame.filter((h) => h.status === "GOAT Status").length;
    const champions = hallOfFame.filter((h) => h.isChampion || h.rank === 1).length || 1;
    const nations = new Set(hallOfFame.map((h) => h.nationality || "Global")).size;
    const categories = new Set(hallOfFame.map((h) => h.type)).size;
    const totalVotes = hallOfFame.reduce((acc, h) => acc + (h.likes || 0), 0);

    return { total, goat, champions, nations, categories, totalVotes };
  }, [hallOfFame]);

  const hallRecords = useMemo(
    () => computeHallRecords(hallOfFame, championshipHistory, hallEvents),
    [hallOfFame, championshipHistory, hallEvents]
  );
  const hallAnalytics = useMemo(() => computeHallAnalytics(hallOfFame), [hallOfFame]);
  const activityFeed = useMemo(
    () => generateActivityFeed(hallOfFame, hallEvents),
    [hallOfFame, hallEvents]
  );
  const championshipTimeline = useMemo(
    () => getChampionshipTimeline(hallOfFame, championshipHistory),
    [hallOfFame, championshipHistory]
  );

  // Top 3 Podium
  const top1 = sortedList[0];
  const top2 = sortedList[1];
  const top3 = sortedList[2];

  // Ranks #4 to #N
  const restOfList = sortedList.slice(3);

  // Context Menu Handlers (Read-Only Hall of Fame Page)
  const handlePageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "museum-compare",
          label: "Compare Top Champions",
          icon: "⚔️",
          onClick: () => {
            setComparedEntries(sortedList.slice(0, 3));
            setIsCompareOpen(true);
          },
        },
        {
          id: "museum-reset",
          label: "Reset Museum Filters",
          icon: "↺",
          onClick: handleResetFilters,
        },
        {
          id: "museum-directory",
          label: "Open Full Character Directory",
          icon: "📚",
          onClick: () => router.push("/characters"),
        },
      ],
      "Hall of Fame Museum"
    );
  };

  return (
    <AppShell>
      <div onContextMenu={handlePageContextMenu} className="space-y-10 max-w-7xl mx-auto pb-16">
        {/* ── 1. MUSEUM HEADER & DASHBOARD STATISTICS ── */}
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
                  🏆 Digital Museum & Trophy Room
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Live Leaderboard V5.1
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
                Hall of Fame & Live Leaderboard
              </h1>
              <p className="text-sm theme-text-muted max-w-2xl font-mono leading-relaxed">
                Celebrating the greatest legends, champions, and live standings in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => router.push("/characters")}
                className="px-5 py-2.5 rounded-xl font-black text-xs bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>📚</span>
                <span>Open Character Directory →</span>
              </button>
            </div>
          </div>

          {/* Dynamic Statistics Bar (100% Live Reactive) */}
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

        {/* ── 2. SCALABLE DROPDOWN FILTER TOOLBAR ── */}
        <HofFilterToolbar
          isCyber={isCyber}
          categoryFilter={categoryFilter}
          setCategoryFilter={(cat) => {
            setProfileModalEntry(null);
            setCategoryFilter(cat);
          }}
          selectedGames={selectedGames}
          setSelectedGames={setSelectedGames}
          featuredOnly={featuredOnly}
          setFeaturedOnly={setFeaturedOnly}
          games={games}
          gameCharacters={gameCharacters}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          professionFilter={professionFilter}
          setProfessionFilter={setProfessionFilter}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
          prestigeFilter={prestigeFilter}
          setPrestigeFilter={setPrestigeFilter}
          sortFilter={sortFilter}
          setSortFilter={setSortFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onReset={handleResetFilters}
        />

        {/* ── 3. CHAMPIONSHIP PODIUM (FEATURED CENTERPIECE) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h2 className="text-lg font-black theme-text-primary tracking-tight font-mono">
                Championship Podium & Top Legends
              </h2>
            </div>
            <span className="text-xs font-mono theme-text-muted font-bold">Gold · Silver · Bronze Podium</span>
          </div>

          <HofPodiumSection
            top1={top1}
            top2={top2}
            top3={top3}
            isCyber={isCyber}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenProfile={(e) => setProfileModalEntry(e)}
            onCompare={(e) => handleAddToCompare(e)}
            onContextMenu={handlePageContextMenu}
          />
        </div>

        {/* ── 4. HALL ACHIEVEMENTS & RECORDS SHOWCASE ── */}
        <HofRecordsSection records={hallRecords} isCyber={isCyber} />

        {/* ── 5. CHAMPIONSHIP HISTORY TIMELINE ── */}
        <HofTimelineSection timeline={championshipTimeline} isCyber={isCyber} />

        {/* ── 6. VISUAL MUSEUM ANALYTICS DASHBOARD ── */}
        <HofAnalyticsDashboard analytics={hallAnalytics} isCyber={isCyber} />

        {/* ── 7. LIVE MUSEUM ACTIVITY FEED ── */}
        <HofActivityFeed activityFeed={activityFeed} isCyber={isCyber} />

        {/* ── 8. LIVE HALL LEADERBOARD RANKINGS (#4 TO #N) ── */}
        <HofLiveLeaderboard
          entries={restOfList}
          isCyber={isCyber}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenProfile={(e) => setProfileModalEntry(e)}
          onCompare={(e) => handleAddToCompare(e)}
        />

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