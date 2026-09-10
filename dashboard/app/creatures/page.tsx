"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { CreatureEntry, getClassificationMeta, CLASSIFICATION_PRESETS } from "@/lib/data/creatureSchema";
import { CreatureCard } from "@/components/cards/CreatureCard";
import { CreatureSpotlight } from "@/components/creatures/CreatureSpotlight";
import { CreatureFilterBar, CreatureSortOption } from "@/components/creatures/CreatureFilterBar";
import { CreatureDossierModal } from "@/components/ui/CreatureDossierModal";
import { CreatureEditorModal } from "@/components/ui/CreatureEditorModal";

export default function CreaturesPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { creatures = [] } = useDashboardStore();

  // ── Filters & Search State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<CreatureSortOption>("newest");

  // ── Modals State ──
  const [selectedCreature, setSelectedCreature] = useState<CreatureEntry | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [editingCreature, setEditingCreature] = useState<CreatureEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // ── Dynamic Sources & Classifications from actual records ──
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    creatures.forEach((c) => {
      if (c.sourceTitle) set.add(c.sourceTitle.trim());
    });
    return Array.from(set).sort();
  }, [creatures]);

  const availableClassifications = useMemo(() => {
    const set = new Set<string>();
    // Include known presets that exist or all presets + custom
    Object.keys(CLASSIFICATION_PRESETS).forEach((p) => set.add(p));
    creatures.forEach((c) => {
      if (c.classification) set.add(c.classification.trim());
    });
    return Array.from(set);
  }, [creatures]);

  // ── Dynamic Collection Counters ──
  const dynamicCounters = useMemo(() => {
    const total = creatures.length;
    const classificationCounts: Record<string, number> = {};

    creatures.forEach((c) => {
      const cls = c.classification?.trim() || "Other";
      classificationCounts[cls] = (classificationCounts[cls] || 0) + 1;
    });

    // Sort by count descending
    const sortedCounts = Object.entries(classificationCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cls, count]) => {
        const meta = getClassificationMeta(cls);
        return {
          classification: cls,
          count,
          icon: meta.icon,
          color: meta.color,
        };
      });

    return { total, breakdowns: sortedCounts };
  }, [creatures]);

  // ── Filtered & Sorted Creatures ──
  const filteredCreatures = useMemo(() => {
    return creatures
      .filter((c) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesCls = c.classification.toLowerCase().includes(q);
          const matchesSpecies = (c.species || "").toLowerCase().includes(q);
          const matchesSource = c.sourceTitle.toLowerCase().includes(q);
          const matchesDesc = (c.description || "").toLowerCase().includes(q);
          const matchesNote = (c.personalNote || "").toLowerCase().includes(q);
          const matchesTags = (c.tags || []).some((t) => t.toLowerCase().includes(q));

          if (
            !matchesName &&
            !matchesCls &&
            !matchesSpecies &&
            !matchesSource &&
            !matchesDesc &&
            !matchesNote &&
            !matchesTags
          ) {
            return false;
          }
        }

        // Classification
        if (classificationFilter !== "all") {
          if (c.classification.toLowerCase() !== classificationFilter.toLowerCase()) {
            return false;
          }
        }

        // Media Type
        if (mediaTypeFilter !== "all") {
          if (c.mediaType.toLowerCase() !== mediaTypeFilter.toLowerCase()) {
            return false;
          }
        }

        // Source
        if (sourceFilter !== "all") {
          if (c.sourceTitle.toLowerCase() !== sourceFilter.toLowerCase()) {
            return false;
          }
        }

        // Favorites only
        if (favoritesOnly && !c.isFavorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "likes") {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "year") {
          return (b.sourceYear || 0) - (a.sourceYear || 0);
        }
        // "newest" default: favorites first, then createdAt/id
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
  }, [
    creatures,
    searchQuery,
    classificationFilter,
    mediaTypeFilter,
    sourceFilter,
    favoritesOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    classificationFilter !== "all" ||
    mediaTypeFilter !== "all" ||
    sourceFilter !== "all" ||
    favoritesOnly;

  const handleResetFilters = () => {
    setSearchQuery("");
    setClassificationFilter("all");
    setMediaTypeFilter("all");
    setSourceFilter("all");
    setFavoritesOnly(false);
    setSortBy("newest");
  };

  const handleOpenDossier = (creature: CreatureEntry) => {
    setSelectedCreature(creature);
    setIsDossierOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCreature(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (creature: CreatureEntry) => {
    setEditingCreature(creature);
    setIsEditorOpen(true);
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── 1. PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
              🐾
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight uppercase">
                Creature Archive
              </h1>
              <p className="text-xs sm:text-sm font-mono opacity-70">
                A personal collection of beloved pets, dragons, familiars, beasts, companions, mascots, and more.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleOpenAdd}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                isCyber
                  ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                  : "bg-black text-white hover:bg-slate-800 border-2 border-black shadow-[3px_3px_0px_#000000]"
              }`}
            >
              <span>+</span>
              <span>Add Creature</span>
            </button>
          </div>
        </div>

        {/* ── 2. DYNAMIC CREATURE COUNTERS ── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Total Counter */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all ${
              isCyber
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-white border-2 border-black shadow-[2px_2px_0px_#000000] text-black"
            }`}
          >
            <span>🐾</span>
            <span>{dynamicCounters.total} CREATURES</span>
          </div>

          {/* Individual classification breakdown */}
          {dynamicCounters.breakdowns.map((b) => (
            <button
              key={b.classification}
              onClick={() => {
                setClassificationFilter(
                  classificationFilter === b.classification ? "all" : b.classification
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                classificationFilter === b.classification
                  ? isCyber
                    ? "bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,245,255,0.4)]"
                    : "bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000000]"
                  : isCyber
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-white border border-black/20 text-slate-800 hover:bg-amber-50"
              }`}
            >
              <span>{b.icon}</span>
              <span>
                {b.count} {b.classification.toUpperCase()}S
              </span>
            </button>
          ))}
        </div>

        {/* ── 3. CREATURE SPOTLIGHT ── */}
        <CreatureSpotlight
          creatures={creatures}
          onSelect={handleOpenDossier}
          onAddCreature={handleOpenAdd}
        />

        {/* ── 4. SEARCH AND FILTERS BAR ── */}
        <div className="pt-2">
          <CreatureFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            classificationFilter={classificationFilter}
            onClassificationChange={setClassificationFilter}
            mediaTypeFilter={mediaTypeFilter}
            onMediaTypeChange={setMediaTypeFilter}
            sourceFilter={sourceFilter}
            onSourceChange={setSourceFilter}
            availableSources={availableSources}
            availableClassifications={availableClassifications}
            favoritesOnly={favoritesOnly}
            onFavoritesToggle={() => setFavoritesOnly(!favoritesOnly)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* ── 5. CREATURE COLLECTION CARDS GRID ── */}
        {filteredCreatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCreatures.map((creature) => (
              <CreatureCard
                key={creature.id}
                creature={creature}
                onSelect={handleOpenDossier}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        ) : (
          /* Empty / No Matches State */
          <div
            className={`p-12 text-center rounded-3xl border ${
              isCyber
                ? "bg-[#080c1a]/50 border-cyan-500/20 text-slate-400"
                : "bg-white border-2 border-black shadow-[4px_4px_0px_#000000] text-slate-700"
            }`}
          >
            <span className="text-4xl block mb-2">🔍</span>
            <h3 className="text-base font-mono font-bold uppercase mb-1">
              No Creatures Match Your Filter
            </h3>
            <p className="text-xs font-mono opacity-70 mb-4">
              Try adjusting your search query, classification, or media filters.
            </p>
            <button
              onClick={handleResetFilters}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                isCyber
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000000]"
              }`}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── 6. MODALS ── */}
        <CreatureDossierModal
          isOpen={isDossierOpen}
          onClose={() => {
            setIsDossierOpen(false);
            setSelectedCreature(null);
          }}
          creature={selectedCreature}
          onEdit={handleOpenEdit}
        />

        <CreatureEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCreature(null);
          }}
          creatureToEdit={editingCreature}
        />
      </div>
    </AppShell>
  );
}
