"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { CoupleCard } from "@/components/cards/CoupleCard";
import { CoupleDossierModal } from "@/components/ui/CoupleDossierModal";
import { CoupleEditorModal } from "@/components/ui/CoupleEditorModal";
import { CoupleJsonEditorModal } from "@/components/ui/CoupleJsonEditorModal";
import { HofProfileModal } from "@/components/ui/HofProfileModal";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import type { ContextMenuItem } from "@/components/ui/ContextMenu";
import type { CoupleEntry } from "@/lib/data/coupleSchema";
import {
  COUPLE_MEDIA_TYPES,
  COUPLE_TIERS,
  RELATIONSHIP_STATUS_OPTIONS,
  CHEMISTRY_DIMENSIONS,
} from "@/lib/data/coupleSchema";

type SortOption = "tier" | "chemistry" | "name" | "year" | "likes" | "newest";

export default function CouplesPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    couples = [],
    addCouple,
    updateCouple,
    deleteCouple,
    hallOfFame = [],
    dossierCharacters = [],
  } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { confirm } = useConfirm();
  const { success: toastSuccess, warning: toastWarning } = useToast();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [dynamicFilter, setDynamicFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("tier");

  // Modals State
  const [selectedCouple, setSelectedCouple] = useState<CoupleEntry | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [editingCouple, setEditingCouple] = useState<CoupleEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [jsonCouple, setJsonCouple] = useState<CoupleEntry | null>(null);
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const [selectedHofEntry, setSelectedHofEntry] = useState<HallOfFameEntry | null>(null);

  // Extract all unique dynamics/tropes across existing couples
  const allDynamics = useMemo(() => {
    const set = new Set<string>();
    couples.forEach((c) => {
      (c.relationship?.dynamics || []).forEach((d) => set.add(d));
    });
    return Array.from(set).sort();
  }, [couples]);

  // Global Statistics Summary
  const stats = useMemo(() => {
    const total = couples.length;
    const favorites = couples.filter((c) => c.isFavorite).length;
    const canonCount = couples.filter(
      (c) => c.relationship?.status === "canon" || c.relationship?.status === "endgame"
    ).length;
    const canonPct = total > 0 ? Math.round((canonCount / total) * 100) : 0;

    // Tiers count
    const ssCount = couples.filter((c) => c.tier === "SS").length;
    const sCount = couples.filter((c) => c.tier === "S").length;
    const aCount = couples.filter((c) => c.tier === "A").length;

    // Average chemistry
    let chemSum = 0;
    let chemCount = 0;
    couples.forEach((c) => {
      if (c.chemistry) {
        const dims = CHEMISTRY_DIMENSIONS.map((d) => (c.chemistry as any)[d.key] ?? 8);
        const avg = dims.reduce((a, b) => a + b, 0) / dims.length;
        chemSum += avg;
        chemCount++;
      }
    });
    const avgChem = chemCount > 0 ? Math.round((chemSum / chemCount) * 10) / 10 : 0;

    return { total, favorites, canonPct, ssCount, sCount, aCount, avgChem };
  }, [couples]);

  // Filtered & Sorted Couples
  const filteredCouples = useMemo(() => {
    return couples
      .filter((couple) => {
        // Favorites filter
        if (favoritesOnly && !couple.isFavorite) return false;

        // Media Type filter
        if (
          mediaTypeFilter !== "all" &&
          couple.source?.mediaType?.toLowerCase() !== mediaTypeFilter.toLowerCase()
        ) {
          return false;
        }

        // Status filter
        if (
          statusFilter !== "all" &&
          couple.relationship?.status?.toLowerCase() !== statusFilter.toLowerCase()
        ) {
          return false;
        }

        // Tier filter
        if (tierFilter !== "all" && couple.tier !== tierFilter) {
          return false;
        }

        // Dynamic trope filter
        if (
          dynamicFilter !== "all" &&
          !(couple.relationship?.dynamics || []).some(
            (d) => d.toLowerCase() === dynamicFilter.toLowerCase()
          )
        ) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = couple.coupleName.toLowerCase().includes(q);
          const matchSource = couple.source?.title.toLowerCase().includes(q);
          const matchPartnerA = couple.partnerA?.name?.toLowerCase().includes(q);
          const matchPartnerB = couple.partnerB?.name?.toLowerCase().includes(q);
          const matchDynamics = (couple.relationship?.dynamics || []).some((d) =>
            d.toLowerCase().includes(q)
          );
          if (!matchName && !matchSource && !matchPartnerA && !matchPartnerB && !matchDynamics) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "tier") {
          const rankMap: Record<string, number> = { SS: 5, S: 4, A: 3, B: 2, C: 1 };
          const rankA = rankMap[a.tier] || 0;
          const rankB = rankMap[b.tier] || 0;
          if (rankA !== rankB) return rankB - rankA;
          return (b.likes || 0) - (a.likes || 0);
        }

        if (sortBy === "chemistry") {
          const dimsA = CHEMISTRY_DIMENSIONS.map((d) => (a.chemistry as any)[d.key] ?? 8);
          const avgA = dimsA.reduce((x, y) => x + y, 0) / dimsA.length;
          const dimsB = CHEMISTRY_DIMENSIONS.map((d) => (b.chemistry as any)[d.key] ?? 8);
          const avgB = dimsB.reduce((x, y) => x + y, 0) / dimsB.length;
          return avgB - avgA;
        }

        if (sortBy === "likes") {
          return (b.likes || 0) - (a.likes || 0);
        }

        if (sortBy === "name") {
          return a.coupleName.localeCompare(b.coupleName);
        }

        if (sortBy === "year") {
          return (b.source?.year || 0) - (a.source?.year || 0);
        }

        if (sortBy === "newest") {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }

        return 0;
      });
  }, [
    couples,
    favoritesOnly,
    mediaTypeFilter,
    statusFilter,
    tierFilter,
    dynamicFilter,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setMediaTypeFilter("all");
    setStatusFilter("all");
    setTierFilter("all");
    setDynamicFilter("all");
    setFavoritesOnly(false);
    setSortBy("tier");
  }, []);

  const handleSelectCouple = useCallback((c: CoupleEntry) => {
    setSelectedCouple(c);
    setIsDossierOpen(true);
  }, []);

  const handleEditCouple = useCallback((c: CoupleEntry) => {
    setEditingCouple(c);
    setIsEditorOpen(true);
  }, []);

  const handleOpenJson = useCallback((c: CoupleEntry) => {
    setJsonCouple(c);
    setIsJsonOpen(true);
  }, []);

  // Handle Character Dictionary link in dossier
  const handleOpenCharacter = useCallback(
    (entry: HallOfFameEntry) => {
      setSelectedHofEntry(entry);
    },
    []
  );

  const handleOpenCharacterById = useCallback(
    (charId: string) => {
      const found =
        hallOfFame.find((h) => h.id === charId) ||
        (dossierCharacters.find((d) => d.id === charId) as any) ||
        null;
      if (found) {
        setSelectedHofEntry(found);
      } else {
        toastWarning("Character profile not found in dictionary.");
      }
    },
    [hallOfFame, dossierCharacters, toastWarning]
  );

  const handleDeleteCouple = useCallback(
    (couple: CoupleEntry) => {
      confirm({
        title: "Delete Couple Profile",
        message: `Are you sure you want to delete "${couple.coupleName}" from your collection? This action cannot be undone.`,
        confirmText: "Delete",
        variant: "danger",
        onConfirm: async () => {
          try {
            await deleteCouple(couple.id);
            toastSuccess(`Deleted ${couple.coupleName}.`);
          } catch (err: any) {
            toastWarning(err?.message || "Failed to delete couple.");
          }
        },
      });
    },
    [confirm, deleteCouple, toastSuccess, toastWarning]
  );

  // Background context menu for quick archive actions
  const handlePageContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a, .group")) return;
    e.preventDefault();

    const items: ContextMenuItem[] = [
      {
        id: "new-couple",
        label: "Add New Couple",
        icon: "➕",
        onClick: () => {
          setEditingCouple(null);
          setIsEditorOpen(true);
        },
      },
      {
        id: "json-workspace",
        label: "JSON Import / Export",
        icon: "📂",
        onClick: () => {
          setJsonCouple(null);
          setIsJsonOpen(true);
        },
      },
      ...(hasActiveFilters
        ? [
            {
              id: "reset-filters",
              label: "Reset Active Filters",
              icon: "↺",
              onClick: handleResetFilters,
            },
          ]
        : []),
    ];

    openContextMenu(e, items, "Couples Archive");
  };

  // Handle Apply JSON from modal
  const handleApplyJson = useCallback(
    async (payload: Partial<CoupleEntry>, mode: "replace" | "merge") => {
      if (jsonCouple?.id) {
        if (mode === "replace") {
          await updateCouple(jsonCouple.id, payload);
        } else {
          // Merge non-empty fields
          await updateCouple(jsonCouple.id, {
            ...jsonCouple,
            ...payload,
            partnerA: { ...jsonCouple.partnerA, ...payload.partnerA },
            partnerB: { ...jsonCouple.partnerB, ...payload.partnerB },
            source: { ...jsonCouple.source, ...payload.source },
            relationship: { ...jsonCouple.relationship, ...payload.relationship },
            chemistry: { ...jsonCouple.chemistry, ...payload.chemistry },
            greenFlags: { ...jsonCouple.greenFlags, ...payload.greenFlags },
            personalNotes: { ...jsonCouple.personalNotes, ...payload.personalNotes },
            media: { ...jsonCouple.media, ...payload.media },
          });
        }
      } else {
        await addCouple(payload);
      }
    },
    [jsonCouple, updateCouple, addCouple]
  );

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    mediaTypeFilter !== "all" ||
    statusFilter !== "all" ||
    tierFilter !== "all" ||
    dynamicFilter !== "all" ||
    favoritesOnly;

  // Dual-theme styles
  const statCardClass = isCyber
    ? "p-4 rounded-xl border border-cyan-500/20 bg-[#070c1e]/80 backdrop-blur shadow-[0_0_15px_rgba(0,245,255,0.05)]"
    : "p-4 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";

  const filterSelectClass = isCyber
    ? "bg-[#0b1024] border border-cyan-500/25 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
    : "bg-white border-2 border-black text-slate-900 text-xs font-mono font-bold rounded-lg px-3 py-2 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer";

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-16">
        {/* Page Banner / Header */}
        <div
          className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border ${
            isCyber
              ? "border-rose-500/30 bg-gradient-to-br from-[#0c0a1e] via-[#110c24] to-[#180a20] shadow-[0_0_30px_rgba(244,63,94,0.1)]"
              : "border-2 border-black bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          {/* Ambient Cyber glow */}
          {isCyber && (
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl select-none">💑</span>
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    isCyber
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-rose-200 border-black text-black"
                  }`}
                >
                  Romance & Pairing Archive
                </span>
              </div>

              <h1
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isCyber ? "text-white" : "text-black"
                }`}
                style={{
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                {isCyber ? "// COUPLES_SYSTEM" : "Couples & Romance Archive"}
              </h1>

              <p
                className={`text-xs sm:text-sm font-mono max-w-2xl leading-relaxed ${
                  isCyber ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Curated collection of fictional couples, dynamic chemistry matrices, green flags,
                iconic scenes, and relationship progression timelines.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setJsonCouple(null);
                  setIsJsonOpen(true);
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                  isCyber
                    ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.15)]"
                    : "border-2 border-black bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {"{ }"} JSON Import / Export
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCouple(null);
                  setIsEditorOpen(true);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black font-mono cursor-pointer transition-all shadow-md ${
                  isCyber
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-rose-500/25"
                    : "bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
                }`}
              >
                + Add New Couple
              </button>
            </div>
          </div>
        </div>

        {/* Global Stats Overview Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className={statCardClass}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">
              Total Couples
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                isCyber ? "text-rose-400" : "text-black"
              }`}
            >
              {stats.total}
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1">Archived Pairings</div>
          </div>

          <div className={statCardClass}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">
              ⭐ Pinned Favorites
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                isCyber ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {stats.favorites}
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1">Personal Highlights</div>
          </div>

          <div className={statCardClass}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">
              💍 Canon & Endgame
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                isCyber ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {stats.canonPct}%
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1">Canon Relationship Rate</div>
          </div>

          <div className={statCardClass}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">
              👑 Elite Tiers
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span
                className={`text-2xl font-black ${isCyber ? "text-pink-400" : "text-pink-600"}`}
              >
                {stats.ssCount} <span className="text-xs font-bold">SS</span>
              </span>
              <span className="text-sm font-bold opacity-75">
                {stats.sCount} <span className="text-xs font-bold">S</span>
              </span>
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1">Top-Ranked Pairings</div>
          </div>

          <div className={statCardClass}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">
              ⚡ Avg Chemistry
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                isCyber ? "text-cyan-400" : "text-blue-600"
              }`}
            >
              {stats.avgChem.toFixed(1)} <span className="text-xs font-bold">/ 10</span>
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1">Multi-Dimension Score</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          className={`p-4 rounded-xl border space-y-3.5 ${
            isCyber
              ? "border-white/10 bg-[#080d1e]/70 backdrop-blur"
              : "border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-40 select-none">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search couples by name, ship, partner, work, or dynamic..."
                className={`w-full pl-9 pr-8 py-2 text-xs font-mono rounded-lg transition-all ${
                  isCyber
                    ? "bg-[#0b1024] border border-cyan-500/25 focus:border-cyan-400 text-slate-100 placeholder-slate-500"
                    : "bg-white border-2 border-black text-slate-900 placeholder-slate-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Media Type */}
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="all">All Media</option>
                {COUPLE_MEDIA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="all">All Statuses</option>
                {RELATIONSHIP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Tier */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className={filterSelectClass}
              >
                <option value="all">All Tiers</option>
                {COUPLE_TIERS.map((t) => (
                  <option key={t} value={t}>
                    Tier {t}
                  </option>
                ))}
              </select>

              {/* Favorites Toggle */}
              <button
                type="button"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  favoritesOnly
                    ? isCyber
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : isCyber
                    ? "bg-[#0b1024] text-slate-400 border border-white/10 hover:text-white"
                    : "bg-white text-slate-700 border-2 border-black/30 hover:border-black"
                }`}
              >
                ⭐ {favoritesOnly ? "Favorites Only ✓" : "Favorites"}
              </button>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={filterSelectClass}
              >
                <option value="tier">Sort: Highest Tier</option>
                <option value="chemistry">Sort: Highest Chemistry</option>
                <option value="likes">Sort: Most Liked</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="year">Sort: Release Year</option>
                <option value="newest">Sort: Recently Added</option>
              </select>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                    isCyber
                      ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>

          {/* Trope / Dynamic Tag Quick Filter Chips */}
          {allDynamics.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-thin">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-50 shrink-0 mr-1">
                Dynamics:
              </span>
              <button
                type="button"
                onClick={() => setDynamicFilter("all")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono shrink-0 cursor-pointer transition-all ${
                  dynamicFilter === "all"
                    ? isCyber
                      ? "bg-rose-500 text-white font-bold"
                      : "bg-rose-600 text-white font-bold border border-black"
                    : isCyber
                    ? "bg-white/5 text-slate-400 hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {allDynamics.map((dynamic) => {
                const isActive = dynamicFilter.toLowerCase() === dynamic.toLowerCase();
                return (
                  <button
                    key={dynamic}
                    type="button"
                    onClick={() => setDynamicFilter(isActive ? "all" : dynamic)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono shrink-0 cursor-pointer transition-all ${
                      isActive
                        ? isCyber
                          ? "bg-rose-500 text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                          : "bg-rose-600 text-white font-bold border border-black"
                        : isCyber
                        ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                  >
                    {dynamic}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono opacity-70">
            Showing <strong>{filteredCouples.length}</strong> of <strong>{couples.length}</strong>{" "}
            couples
            {hasActiveFilters && " (Filtered)"}
          </span>
        </div>

        {/* Couples Grid */}
        {filteredCouples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredCouples.map((couple) => (
                <CoupleCard
                  key={couple.id}
                  couple={couple}
                  onSelect={handleSelectCouple}
                  onEdit={handleEditCouple}
                  onDelete={handleDeleteCouple}
                  onOpenCharacterDictionary={handleOpenCharacterById}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <div
            className={`flex flex-col items-center justify-center p-12 rounded-2xl border text-center ${
              isCyber
                ? "border-white/10 bg-[#080d1e]/50 backdrop-blur"
                : "border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <div className="text-5xl mb-4 select-none">💔</div>
            <h3
              className={`text-lg font-black mb-2 ${isCyber ? "text-white" : "text-black"}`}
              style={{
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {hasActiveFilters ? "No Matching Couples Found" : "Your Romance Archive is Empty"}
            </h3>
            <p className="text-xs font-mono opacity-60 max-w-md mb-6 leading-relaxed">
              {hasActiveFilters
                ? "No couple profiles match your active filter and search criteria. Try clearing filters to see all entries."
                : "Start cataloging your favorite fictional pairings, chart their chemistry, and track unforgettable moments."}
            </p>

            <div className="flex items-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                    isCyber
                      ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                      : "border-2 border-black bg-black text-white font-black"
                  }`}
                >
                  ↺ Reset All Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCouple(null);
                    setIsEditorOpen(true);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black font-mono cursor-pointer transition-all shadow-md ${
                    isCyber
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      : "bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  + Add Your First Couple
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Full Relationship Dossier */}
      {isDossierOpen && selectedCouple && (
        <CoupleDossierModal
          key={`${selectedCouple.id}-${isDossierOpen}`}
          isOpen={isDossierOpen}
          couple={selectedCouple}
          onClose={() => {
            setIsDossierOpen(false);
            setSelectedCouple(null);
          }}
          onEdit={(couple) => {
            setIsDossierOpen(false);
            setEditingCouple(couple);
            setIsEditorOpen(true);
          }}
          onOpenCharacterDictionary={handleOpenCharacter}
        />
      )}

      {/* MODAL 2: Couple Editor (Create / Edit) */}
      <CoupleEditorModal
        isOpen={isEditorOpen}
        coupleToEdit={editingCouple}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCouple(null);
        }}
      />

      {/* MODAL 3: Couple JSON Workspace */}
      <CoupleJsonEditorModal
        isOpen={isJsonOpen}
        couple={jsonCouple}
        onClose={() => {
          setIsJsonOpen(false);
          setJsonCouple(null);
        }}
        onApply={handleApplyJson}
      />

      {/* MODAL 4: Character Dictionary Modal Router (if user clicks linked partner) */}
      {selectedHofEntry && (
        <HofProfileModal
          isOpen={!!selectedHofEntry}
          entry={selectedHofEntry}
          onClose={() => setSelectedHofEntry(null)}
        />
      )}
    </AppShell>
  );
}
