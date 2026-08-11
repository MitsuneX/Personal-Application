"use client";

import React, { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry, DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { TokusatsuEditorModal } from "@/components/ui/TokusatsuEditorModal";
import { NewCharacterTypeSelector } from "@/components/ui/NewCharacterTypeSelector";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import { DossierCharacterCard } from "@/components/cards/DossierCharacterCard";
import { CharacterPreviewModal } from "@/components/ui/CharacterPreviewModal";
import { CharacterDictProfileModal } from "@/components/ui/CharacterDictProfileModal";
import { useSearchParams } from "next/navigation";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { BentoCard } from "@/components/cards/BentoCard";
import { isTokusatsuEntry, resolveFranchiseType } from "@/lib/data/tokusatsuDataHelper";

const CATEGORY_PILLS = [
  { id: "all", label: "All Entities", icon: "🌐" },
  { id: "actress", label: "Actresses", icon: "💫" },
  { id: "actor", label: "Actors", icon: "🎭" },
  { id: "anime", label: "Anime", icon: "⛩️" },
  { id: "game", label: "Game Roster", icon: "🎮" },
  { id: "tokusatsu", label: "Tokusatsu", icon: "🎬" },
  { id: "vtuber", label: "VTubers", icon: "👾" },
  { id: "singer", label: "Singers", icon: "🎤" },
  { id: "other", label: "Other Collectibles", icon: "🌟" },
];

const TOKUSATSU_SUBTYPES = [
  { id: "all", label: "All Tokusatsu", icon: "🎬" },
  { id: "ultraman", label: "Ultraman", icon: "⚡" },
  { id: "kamen-rider", label: "Kamen Rider", icon: "🏍️" },
  { id: "power-rangers", label: "Power Rangers", icon: "🔴" },
  { id: "super-sentai", label: "Super Sentai", icon: "🛡️" },
];

const NATIONALITY_OPTIONS = [
  { id: "all", label: "All Origins" },
  { id: "Korea", label: "🇰🇷 Korea" },
  { id: "Japan", label: "🇯🇵 Japan" },
  { id: "China", label: "🇨🇳 China" },
  { id: "Indonesia", label: "🇮🇩 Indonesia" },
  { id: "Hollywood", label: "🎬 Hollywood" },
  { id: "American", label: "🇺🇸 American" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular / Likes" },
  { id: "az", label: "Name (A-Z)" },
  { id: "za", label: "Name (Z-A)" },
  { id: "newest", label: "Recently Added" },
];

function CharactersContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame = [], dossierCharacters = [], deleteHof } = useDashboardStore();
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTokusatsuSubtype, setSelectedTokusatsuSubtype] = useState("all");
  const [selectedNationality, setSelectedNationality] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [goatOnly, setGoatOnly] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedHofEntry, setSelectedHofEntry] = useState<HallOfFameEntry | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<DossierCharacterEntry | null>(null);
  const [dictProfileEntry, setDictProfileEntry] = useState<HallOfFameEntry | null>(null);

  // New Character type-selector state
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [tokusatsuEditorOpen, setTokusatsuEditorOpen] = useState(false);

  const targetCategory = searchParams?.get("category") || searchParams?.get("type") || null;
  const targetSubtype = searchParams?.get("subtype") || searchParams?.get("sub") || null;
  const targetSearch = searchParams?.get("search") || null;
  const targetId = searchParams?.get("id") || null;

  useEffect(() => {
    if (targetCategory) {
      setSelectedCategory(targetCategory);
    }
  }, [targetCategory]);

  useEffect(() => {
    if (targetSubtype) {
      setSelectedTokusatsuSubtype(targetSubtype);
    }
  }, [targetSubtype]);

  useEffect(() => {
    if (targetSearch) {
      setSearchQuery(targetSearch);
    }
  }, [targetSearch]);

  useEffect(() => {
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`entry-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.animate(
            [
              { filter: "brightness(1.5)", transform: "scale(1.05)" },
              { filter: "brightness(1)", transform: "scale(1)" },
            ],
            { duration: 800, easing: "ease-out" }
          );
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [targetId]);

  // Combined Master Dynamic Statistics
  const stats = useMemo(() => {
    const totalEntries = hallOfFame.length + dossierCharacters.length;
    const actresses = hallOfFame.filter((h) => h.type === "actress").length;
    const actors = hallOfFame.filter((h) => h.type === "actor").length;
    const anime = hallOfFame.filter((h) => h.type === "anime").length;
    const games = dossierCharacters.length;
    const tokusatsu = hallOfFame.filter((h) => isTokusatsuEntry(h)).length;
    const singers = hallOfFame.filter(
      (h) => h.type === "singer" || h.nationality === "Singer"
    ).length;
    const favorites =
      hallOfFame.filter((h) => h.isFavorite).length +
      dossierCharacters.filter((c) => c.isFavorite).length;
    const goatMembers = hallOfFame.filter((h) => h.status === "GOAT Status").length;

    return {
      totalEntries,
      actresses,
      actors,
      anime,
      games,
      tokusatsu,
      singers,
      favorites,
      goatMembers,
    };
  }, [hallOfFame, dossierCharacters]);

  // Dynamic Subtype Counts for Tokusatsu
  const tokusatsuCounts = useMemo(() => {
    const tokusatsuEntries = hallOfFame.filter((h) => isTokusatsuEntry(h));

    let ultraman = 0;
    let kamenRider = 0;
    let powerRangers = 0;
    let superSentai = 0;

    tokusatsuEntries.forEach((h) => {
      const rawFranchise = h.tokusatsuFranchise || h.franchise || h.series;
      const res = resolveFranchiseType(rawFranchise, h.type, h.name);
      if (res === "ULTRAMAN") ultraman++;
      else if (res === "KAMEN_RIDER") kamenRider++;
      else if (res === "POWER_RANGERS") powerRangers++;
      else if (res === "SUPER_SENTAI") superSentai++;
    });

    return {
      all: tokusatsuEntries.length,
      ultraman,
      "kamen-rider": kamenRider,
      "power-rangers": powerRangers,
      "super-sentai": superSentai,
    };
  }, [hallOfFame]);

  // Filtered Roster
  const filteredHofList = useMemo(() => {
    let list = [...hallOfFame];

    // Category Filter
    if (selectedCategory !== "all") {
      list = list.filter((item) => {
        if (selectedCategory === "tokusatsu") {
          if (!isTokusatsuEntry(item)) return false;
          if (selectedTokusatsuSubtype === "all") return true;

          const rawFranchise = item.tokusatsuFranchise || item.franchise || item.series;
          const res = resolveFranchiseType(rawFranchise, item.type, item.name);

          if (selectedTokusatsuSubtype === "ultraman")
            return res === "ULTRAMAN" || !!item.details?.ultraman;
          if (selectedTokusatsuSubtype === "kamen-rider")
            return res === "KAMEN_RIDER" || !!item.details?.kamenRider;
          if (selectedTokusatsuSubtype === "power-rangers")
            return res === "POWER_RANGERS" || !!item.details?.powerRangers;
          if (selectedTokusatsuSubtype === "super-sentai")
            return res === "SUPER_SENTAI" || !!item.details?.superSentai;
          return true;
        }
        if (selectedCategory === "singer") {
          return item.type === "singer" || item.nationality === "Singer";
        }
        return item.type === selectedCategory;
      });
    }

    // Nationality Filter
    if (selectedNationality !== "all") {
      list = list.filter(
        (item) => (item.nationality || "").toLowerCase() === selectedNationality.toLowerCase()
      );
    }

    // Favorite Filter
    if (favoriteOnly) {
      list = list.filter((item) => item.isFavorite);
    }

    // GOAT Filter
    if (goatOnly) {
      list = list.filter((item) => item.status === "GOAT Status");
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchKnown = (Array.isArray(item.knownFor) ? item.knownFor.join(" ") : item.knownFor || "")
          .toLowerCase()
          .includes(q);
        const matchNote = (item.note || "").toLowerCase().includes(q);
        return matchName || matchKnown || matchNote;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (selectedSort === "popular") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (selectedSort === "az") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (selectedSort === "za") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return list;
  }, [
    hallOfFame,
    selectedCategory,
    selectedTokusatsuSubtype,
    selectedNationality,
    favoriteOnly,
    goatOnly,
    searchQuery,
    selectedSort,
  ]);

  const handleEditHof = useCallback((entry: HallOfFameEntry) => {
    setSelectedHofEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDeleteHof = useCallback(
    (id: string, name: string) => {
      confirm({
        title: "Delete Entry",
        message: `Are you sure you want to delete "${name}" from the Master Directory?`,
        variant: "danger",
        onConfirm: async () => {
          await deleteHof(id);
        },
      });
    },
    [confirm, deleteHof]
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Master Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
            borderColor: isCyber ? "#00F5FF50" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.15)" : "6px 6px 0 #000000",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  ⚔️ Master Collectible Directory v2
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {stats.totalEntries} Total Roster Entries
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
                Character & Collectible Database
              </h1>
              <p className="text-sm theme-text-muted max-w-2xl font-mono leading-relaxed">
                Centralized database for actresses, actors, anime heroes, game roster agents, Tokusatsu legends, and singers.
              </p>
            </div>

            <button
              onClick={() => {
                setTypeSelectorOpen(true);
              }}
              className="px-5 py-3 text-xs font-black rounded-xl bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all cursor-pointer shrink-0"
            >
              ┼ Add New Entry
            </button>
          </div>
        </motion.div>

        {/* Dynamic Quick Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] theme-text-muted block">TOTAL ENTRIES</span>
            <strong className="text-base font-black theme-text-primary">{stats.totalEntries}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(236,72,153,0.05)" : "#FDF2F8", borderColor: isCyber ? "rgba(236,72,153,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-pink-400 block">ACTRESSES</span>
            <strong className="text-base font-black text-pink-500">{stats.actresses}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(59,130,246,0.05)" : "#EFF6FF", borderColor: isCyber ? "rgba(59,130,246,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-blue-400 block">ACTORS</span>
            <strong className="text-base font-black text-blue-500">{stats.actors}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(168,85,247,0.05)" : "#F3E8FF", borderColor: isCyber ? "rgba(168,85,247,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-purple-400 block">ANIME</span>
            <strong className="text-base font-black text-purple-500">{stats.anime}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(16,185,129,0.05)" : "#ECFDF5", borderColor: isCyber ? "rgba(16,185,129,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-emerald-400 block">GAME ROSTER</span>
            <strong className="text-base font-black text-emerald-500">{stats.games}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(239,68,68,0.05)" : "#FEF2F2", borderColor: isCyber ? "rgba(239,68,68,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-red-400 block">TOKUSATSU</span>
            <strong className="text-base font-black text-red-500">{stats.tokusatsu}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(245,158,11,0.05)" : "#FFFBEB", borderColor: isCyber ? "rgba(245,158,11,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-amber-400 block">GOAT MEMBERS</span>
            <strong className="text-base font-black text-amber-500">{stats.goatMembers}</strong>
          </div>
          <div className="p-3 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#E0F2FE", borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
            <span className="text-[9px] text-cyan-400 block">FAVORITES</span>
            <strong className="text-base font-black text-cyan-500">{stats.favorites}</strong>
          </div>
        </div>

        {/* Category Pills & Advanced Toolbar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_PILLS.map((pill) => {
              const isActive = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setSelectedCategory(pill.id);
                    if (pill.id !== "tokusatsu") {
                      setSelectedTokusatsuSubtype("all");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  style={{
                    backgroundColor: isActive
                      ? isCyber ? "#00F5FF" : "#FEF08A"
                      : isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    color: isActive
                      ? isCyber ? "#0A0F1E" : "#854D0E"
                      : isCyber ? "#94A3B8" : "#475569",
                    border: isActive
                      ? isCyber ? "1px solid #00F5FF" : "2px solid #000000"
                      : isCyber ? "1px solid rgba(255,255,255,0.1)" : "1.5px solid #CBD5E1",
                    boxShadow: !isCyber && isActive ? "2px 2px 0 #000" : "none",
                  }}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Subtype Filter Bar (Only shown when Tokusatsu category is selected) */}
          <AnimatePresence>
            {selectedCategory === "tokusatsu" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 shrink-0 px-1">
                  Franchise Subtype:
                </span>
                {TOKUSATSU_SUBTYPES.map((sub) => {
                  const isActive = selectedTokusatsuSubtype === sub.id;
                  const count = tokusatsuCounts[sub.id as keyof typeof tokusatsuCounts] || 0;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedTokusatsuSubtype(sub.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 border"
                      style={{
                        backgroundColor: isActive
                          ? isCyber ? "#EF4444" : "#FF6B35"
                          : isCyber ? "rgba(239,68,68,0.1)" : "#FFF1F2",
                        color: isActive
                          ? "#FFFFFF"
                          : isCyber ? "#FCA5A5" : "#991B1B",
                        borderColor: isActive
                          ? isCyber ? "#EF4444" : "#000000"
                          : isCyber ? "rgba(239,68,68,0.25)" : "#FECDD3",
                        borderWidth: isCyber ? "1px" : "2px",
                        boxShadow: !isCyber && isActive ? "2px 2px 0 #000" : "none",
                      }}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                          isActive
                            ? "bg-black/30 text-white"
                            : isCyber
                            ? "bg-red-500/20 text-red-300"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search character name, works, aliases, notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  color: isCyber ? "#F8FAFC" : "#0F172A",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FilterDropdown
                label="Origin"
                icon="🌍"
                value={selectedNationality}
                onChange={(val) => setSelectedNationality(val)}
                options={NATIONALITY_OPTIONS}
              />

              <FilterDropdown
                label="Sort By"
                icon="📊"
                value={selectedSort}
                onChange={(val) => setSelectedSort(val)}
                options={SORT_OPTIONS}
              />

              <button
                onClick={() => setFavoriteOnly(!favoriteOnly)}
                className="px-3 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer border transition-all"
                style={{
                  backgroundColor: favoriteOnly
                    ? isCyber ? "rgba(250,204,21,0.2)" : "#FEF08A"
                    : isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  color: favoriteOnly ? "#FACC15" : isCyber ? "#94A3B8" : "#475569",
                  borderColor: favoriteOnly ? "#FACC15" : isCyber ? "rgba(255,255,255,0.1)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                ⭐ Favorites
              </button>

              <button
                onClick={() => setGoatOnly(!goatOnly)}
                className="px-3 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer border transition-all"
                style={{
                  backgroundColor: goatOnly
                    ? isCyber ? "rgba(168,85,247,0.2)" : "#F3E8FF"
                    : isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  color: goatOnly ? "#A855F7" : isCyber ? "#94A3B8" : "#475569",
                  borderColor: goatOnly ? "#A855F7" : isCyber ? "rgba(255,255,255,0.1)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                👑 GOAT Only
              </button>
            </div>
          </div>
        </div>

        {/* Master Directory Grid */}
        <BentoCard>
          {filteredHofList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-black text-base theme-text-primary">No character entries match your query.</h3>
              <p className="text-xs theme-text-muted max-w-md mx-auto">
                Try selecting another Category Pill or reset your active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTokusatsuSubtype("all");
                  setSelectedNationality("all");
                  setSearchQuery("");
                  setFavoriteOnly(false);
                  setGoatOnly(false);
                }}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
              >
                Reset All Filters ↺
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredHofList.map((entry, idx) => {
                  const groupCode = getGroupForEntry(entry);
                  const groupDetails = getGroupDetails(groupCode);
                  return (
                    <HofEntryCard
                      key={entry.id || idx}
                      entry={entry}
                      idx={idx}
                      isCyber={isCyber}
                      group={groupDetails}
                      onEdit={handleEditHof}
                      onDelete={(id, name) => handleDeleteHof(id, name)}
                      onOpenProfile={(item) => setDictProfileEntry(item)}
                      showType={selectedCategory === "all"}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </BentoCard>

        {/* Modals */}

        {/* Type selector: shown when creating a NEW entry */}
        <NewCharacterTypeSelector
          isOpen={typeSelectorOpen}
          onClose={() => setTypeSelectorOpen(false)}
          onSelectArtist={() => {
            setTypeSelectorOpen(false);
            setSelectedHofEntry(null);
            setEditorOpen(true);
          }}
          onSelectTokusatsu={() => {
            setTypeSelectorOpen(false);
            setTokusatsuEditorOpen(true);
          }}
        />

        {/* Standard Artist/Anime editor (also used for editing existing non-Tokusatsu entries) */}
        <HofEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          entryToEdit={selectedHofEntry}
        />

        {/* Dedicated Tokusatsu editor: for new Tokusatsu entries from the type selector */}
        <TokusatsuEditorModal
          isOpen={tokusatsuEditorOpen}
          onClose={() => setTokusatsuEditorOpen(false)}
          entryToEdit={null}
        />

        <CharacterDictProfileModal
          isOpen={!!dictProfileEntry}
          entry={dictProfileEntry}
          onClose={() => setDictProfileEntry(null)}
          onEdit={handleEditHof}
        />

        <CharacterPreviewModal
          isOpen={!!previewCharacter}
          onClose={() => setPreviewCharacter(null)}
          character={previewCharacter}
        />
      </div>
    </AppShell>
  );
}

export default function CharactersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono theme-text-muted">Loading Directory...</div>}>
      <CharactersContent />
    </Suspense>
  );
}