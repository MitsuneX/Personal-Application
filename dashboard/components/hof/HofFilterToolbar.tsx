"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HofMultiSelectGameFilter } from "./HofMultiSelectGameFilter";

interface HofFilterToolbarProps {
  isCyber: boolean;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  selectedGames?: string[];
  setSelectedGames?: (selected: string[]) => void;
  featuredOnly?: boolean;
  setFeaturedOnly?: (v: boolean) => void;
  games?: Array<{ id: string; game: string }>;
  gameCharacters?: Array<{ gameId?: string; gameName?: string }>;
  countryFilter: string;
  setCountryFilter: (v: string) => void;
  professionFilter: string;
  setProfessionFilter: (v: string) => void;
  seasonFilter: string;
  setSeasonFilter: (v: string) => void;
  prestigeFilter: string;
  setPrestigeFilter: (v: string) => void;
  sortFilter: string;
  setSortFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onReset: () => void;
}

export function HofFilterToolbar({
  isCyber,
  categoryFilter,
  setCategoryFilter,
  selectedGames = [],
  setSelectedGames,
  featuredOnly = false,
  setFeaturedOnly,
  games = [],
  gameCharacters = [],
  countryFilter,
  setCountryFilter,
  professionFilter,
  setProfessionFilter,
  seasonFilter,
  setSeasonFilter,
  prestigeFilter,
  setPrestigeFilter,
  sortFilter,
  setSortFilter,
  searchQuery,
  setSearchQuery,
  onReset,
}: HofFilterToolbarProps) {
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);

  // ── Compute Active Secondary Filters Count ───────────────────────────────────
  const secondaryActiveCount = useMemo(() => {
    let count = 0;
    if (countryFilter !== "all") count++;
    if (professionFilter !== "all" && categoryFilter !== "game" && categoryFilter !== "couples" && categoryFilter !== "creatures") count++;
    if (seasonFilter !== "all") count++;
    if (prestigeFilter !== "all") count++;
    if (featuredOnly) count++;
    if (categoryFilter === "game" && selectedGames.length > 0 && selectedGames.length < games.length) count++;
    return count;
  }, [countryFilter, professionFilter, categoryFilter, seasonFilter, prestigeFilter, featuredOnly, selectedGames, games]);

  // ── Total Filter Active Flag ─────────────────────────────────────────────────
  const isFiltered =
    categoryFilter !== "all" ||
    selectedGames.length > 0 ||
    featuredOnly ||
    countryFilter !== "all" ||
    professionFilter !== "all" ||
    seasonFilter !== "all" ||
    prestigeFilter !== "all" ||
    sortFilter !== "likes" ||
    searchQuery.trim() !== "";

  // ── Total Active Count for Clear Pill ─────────────────────────────────────────
  const totalActiveCount = useMemo(() => {
    let count = secondaryActiveCount;
    if (categoryFilter !== "all") count++;
    if (sortFilter !== "likes") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [secondaryActiveCount, categoryFilter, sortFilter, searchQuery]);

  return (
    <div
      className="p-4 sm:p-5 rounded-3xl border space-y-3.5 font-mono text-xs shadow-xl transition-all"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,36,0.75)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        boxShadow: isCyber ? "0 0 25px rgba(255,215,0,0.08)" : "5px 5px 0 #000000",
      }}
    >
      {/* ── Toolbar Header ── */}
      <div
        className="flex items-center justify-between border-b pb-2.5"
        style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🏛️</span>
          <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider theme-text-primary">
            Museum Showcase Controls
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={onReset}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isCyber
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                  : "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
              }`}
              title="Reset all filters to default"
            >
              <span>↺</span>
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Secondary Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSecondaryFilters((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showSecondaryFilters || secondaryActiveCount > 0
                ? isCyber
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-amber-100 text-amber-900 border-black shadow-[1.5px_1.5px_0_#000]"
                : isCyber
                ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <span>⚙️</span>
            <span>Filters</span>
            {secondaryActiveCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isCyber ? "bg-amber-400 text-black" : "bg-black text-white"
                }`}
              >
                {secondaryActiveCount}
              </span>
            )}
            <span className="text-[10px] opacity-70">{showSecondaryFilters ? "▲" : "▼"}</span>
          </button>
        </div>
      </div>

      {/* ── PRIMARY CONTROLS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Live Search Input */}
        <div className="md:col-span-6 relative">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm pointer-events-none opacity-60">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                categoryFilter === "couples"
                  ? "Search couples by name, partners, or source work..."
                  : categoryFilter === "creatures"
                  ? "Search creatures by name, classification, species, work..."
                  : "Search museum archives for legend or masterpiece..."
              }
              className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-all"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "#FFFFFF",
                color: isCyber ? "#FFF" : "#000",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-white cursor-pointer px-1 py-0.5 rounded"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Dropdown (Primary) */}
        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,215,0,0.4)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "2px",
            }}
          >
            <option value="all">🌟 All Categories</option>
            <option value="couples">💞 Couples</option>
            <option value="creatures">🐾 Creatures</option>
            <option value="drama">🎭 Drama</option>
            <option value="anime">⛩️ Anime</option>
            <option value="movie">🎬 Movie</option>
            <option value="tokusatsu">🦸 Tokusatsu</option>
            <option value="vtuber">👾 VTuber</option>
            <option value="music">🎵 Music</option>
            <option value="game">🎮 Game</option>
          </select>
        </div>

        {/* Sort Dropdown (Primary) */}
        <div className="md:col-span-3">
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
            }}
          >
            <option value="likes">
              {categoryFilter === "couples"
                ? "❤️ Most Loves"
                : categoryFilter === "creatures"
                ? "❤️ Most Bonds"
                : "❤️ Most Liked"}
            </option>
            <option value="name">
              {categoryFilter === "couples"
                ? "🔤 Couple Name (A-Z)"
                : categoryFilter === "creatures"
                ? "🔤 Creature Name (A-Z)"
                : "🔤 Name (A-Z)"}
            </option>
            {categoryFilter !== "couples" && categoryFilter !== "creatures" && <option value="works">🎬 Most Works</option>}
          </select>
        </div>
      </div>

      {/* ── EXPANDABLE SECONDARY FILTERS DRAWER ── */}
      <AnimatePresence>
        {showSecondaryFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t pt-3 space-y-3"
            style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* 1. Country / Classification Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase theme-text-muted block">
                  {categoryFilter === "creatures" ? "Classification ▼" : "Country ▼"}
                </label>
                {categoryFilter === "creatures" ? (
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                      color: isCyber ? "#FFF" : "#000",
                      borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                    }}
                  >
                    <option value="all">All Classifications</option>
                    <option value="dragon">🐉 Dragon</option>
                    <option value="familiar">✨ Familiar</option>
                    <option value="beast">🐾 Beast</option>
                    <option value="spirit">👻 Spirit</option>
                    <option value="mount">🐎 Mount</option>
                    <option value="monster">👾 Monster</option>
                    <option value="construct">🤖 Construct</option>
                    <option value="alien">🛸 Alien</option>
                    <option value="mythical">🌟 Mythical</option>
                    <option value="undead">💀 Undead</option>
                    <option value="other">🔮 Other</option>
                  </select>
                ) : (
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                      color: isCyber ? "#FFF" : "#000",
                      borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                    }}
                  >
                    <option value="all">All Countries</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="Korea">🇰🇷 Korea</option>
                    <option value="China">🇨🇳 China</option>
                    <option value="Hollywood">🎬 Hollywood</option>
                    <option value="Indonesia">🇮🇩 Indonesia</option>
                  </select>
                )}
              </div>

              {/* 2. Profession (Hidden in Game, Couples, and Creatures mode) */}
              {categoryFilter !== "game" && categoryFilter !== "couples" && categoryFilter !== "creatures" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase theme-text-muted block">Profession ▼</label>
                  <select
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                      color: isCyber ? "#FFF" : "#000",
                      borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                    }}
                  >
                    <option value="all">All Professions</option>
                    <option value="actor">🎭 Actor</option>
                    <option value="actress">💫 Actress</option>
                    <option value="singer">🎤 Singer</option>
                    <option value="vtuber">👾 VTuber</option>
                    <option value="anime">⛩️ Anime Character</option>
                    <option value="tokusatsu">🦸 Suit Actor</option>
                  </select>
                </div>
              )}

              {/* 3. Season Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase theme-text-muted block">Season ▼</label>
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                    color: isCyber ? "#FFF" : "#000",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  }}
                >
                  <option value="all">Overall Legacy</option>
                  <option value="s2026">2026 Season</option>
                  <option value="s2025">2025 Season</option>
                  <option value="monthly">Monthly Peak</option>
                  <option value="community">Community Choice</option>
                </select>
              </div>

              {/* 4. Prestige / Tier Dropdown (Contextual: Couple Tiers vs Creature Tiers vs Hall Prestige) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase theme-text-muted block">
                  {categoryFilter === "couples"
                    ? "Couple Tier ▼"
                    : categoryFilter === "creatures"
                    ? "Creature Tier ▼"
                    : "Prestige ▼"}
                </label>
                <select
                  value={prestigeFilter}
                  onChange={(e) => setPrestigeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
                    color: isCyber ? "#FFF" : "#000",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
                  }}
                >
                  {categoryFilter === "couples" ? (
                    <>
                      <option value="all">All Couple Tiers</option>
                      <option value="SS">💎 SS Tier</option>
                      <option value="S">👑 S Tier</option>
                      <option value="A">✨ A Tier</option>
                      <option value="B">🌸 B Tier</option>
                      <option value="C">🌱 C Tier</option>
                    </>
                  ) : categoryFilter === "creatures" ? (
                    <>
                      <option value="all">All Creature Tiers</option>
                      <option value="SS">💎 SS Tier</option>
                      <option value="S">👑 S Tier</option>
                      <option value="A">✨ A Tier</option>
                      <option value="B">🌸 B Tier</option>
                      <option value="C">🌱 C Tier</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Prestige Tiers</option>
                      <option value="Eternal Legend">👑 Eternal Legend</option>
                      <option value="Mythic Legend">🔮 Mythic Legend</option>
                      <option value="Diamond Legend">💎 Diamond Legend</option>
                      <option value="Gold Legend">🥇 Gold Legend</option>
                      <option value="Silver Legend">🥈 Silver Legend</option>
                      <option value="Bronze Legend">🥉 Bronze Legend</option>
                    </>
                  )}
                </select>
              </div>

              {/* 5. Featured Toggle Button */}
              {setFeaturedOnly && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase theme-text-muted block">Featured ⭐</label>
                  <button
                    type="button"
                    onClick={() => setFeaturedOnly(!featuredOnly)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      featuredOnly
                        ? isCyber
                          ? "bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                          : "bg-yellow-300 text-black border-black shadow-[2px_2px_0_#000]"
                        : isCyber
                        ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    <span>⭐</span>
                    <span>{featuredOnly ? "Featured Only" : "All Items"}</span>
                  </button>
                </div>
              )}

              {/* 6. Game Filter (Contextual: only shown when Category is Game) */}
              {categoryFilter === "game" && setSelectedGames && (
                <div className="col-span-2 sm:col-span-3">
                  <HofMultiSelectGameFilter
                    isCyber={isCyber}
                    games={games}
                    gameCharacters={gameCharacters}
                    selectedGames={selectedGames}
                    onChangeSelectedGames={setSelectedGames}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE FILTERS CHIPS BAR ── */}
      {isFiltered && (
        <div
          className="flex flex-wrap items-center gap-1.5 pt-1 border-t"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Active:</span>

          {/* Category Chip */}
          {categoryFilter !== "all" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}
            >
              <span>
                {categoryFilter === "couples"
                  ? "💞 Couples"
                  : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear category"
              >
                ✕
              </button>
            </span>
          )}

          {/* Search Query Chip */}
          {searchQuery.trim() && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  : "bg-cyan-100 text-cyan-900 border-cyan-300"
              }`}
            >
              <span>🔍 "{searchQuery.trim()}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear search"
              >
                ✕
              </button>
            </span>
          )}

          {/* Country Chip */}
          {countryFilter !== "all" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                  : "bg-blue-100 text-blue-900 border-blue-300"
              }`}
            >
              <span>🌍 {countryFilter}</span>
              <button
                type="button"
                onClick={() => setCountryFilter("all")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear country"
              >
                ✕
              </button>
            </span>
          )}

          {/* Profession Chip */}
          {professionFilter !== "all" && categoryFilter !== "game" && categoryFilter !== "couples" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                  : "bg-purple-100 text-purple-900 border-purple-300"
              }`}
            >
              <span>🎭 {professionFilter}</span>
              <button
                type="button"
                onClick={() => setProfessionFilter("all")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear profession"
              >
                ✕
              </button>
            </span>
          )}

          {/* Prestige / Tier Chip */}
          {prestigeFilter !== "all" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-emerald-100 text-emerald-900 border-emerald-300"
              }`}
            >
              <span>{categoryFilter === "couples" ? `💎 ${prestigeFilter} Tier` : `👑 ${prestigeFilter}`}</span>
              <button
                type="button"
                onClick={() => setPrestigeFilter("all")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear prestige"
              >
                ✕
              </button>
            </span>
          )}

          {/* Season Chip */}
          {seasonFilter !== "all" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
                  : "bg-slate-200 text-slate-800 border-slate-300"
              }`}
            >
              <span>⏳ {seasonFilter}</span>
              <button
                type="button"
                onClick={() => setSeasonFilter("all")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear season"
              >
                ✕
              </button>
            </span>
          )}

          {/* Featured Chip */}
          {featuredOnly && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              }`}
            >
              <span>⭐ Featured Only</span>
              <button
                type="button"
                onClick={() => setFeaturedOnly && setFeaturedOnly(false)}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Clear featured"
              >
                ✕
              </button>
            </span>
          )}

          {/* Sort Chip (if not likes default) */}
          {sortFilter !== "likes" && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isCyber
                  ? "bg-slate-500/15 text-slate-300 border-slate-500/30"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              <span>🔤 Sorted: {sortFilter}</span>
              <button
                type="button"
                onClick={() => setSortFilter("likes")}
                className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5"
                title="Reset sort to most liked"
              >
                ✕
              </button>
            </span>
          )}

          {/* Clear All Action */}
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] font-bold underline opacity-70 hover:opacity-100 transition-opacity cursor-pointer ml-1 text-rose-400"
          >
            Clear All ({totalActiveCount})
          </button>
        </div>
      )}
    </div>
  );
}
