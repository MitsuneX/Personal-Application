"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import {
  CLASSIFICATION_PRESETS,
  CREATURE_MEDIA_TYPES,
} from "@/lib/data/creatureSchema";

export type CreatureSortOption = "newest" | "likes" | "name" | "year";

interface CreatureFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  classificationFilter: string;
  onClassificationChange: (type: string) => void;
  mediaTypeFilter: string;
  onMediaTypeChange: (media: string) => void;
  sourceFilter: string;
  onSourceChange: (src: string) => void;
  availableSources: string[];
  availableClassifications: string[];
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
  sortBy: CreatureSortOption;
  onSortChange: (sort: CreatureSortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function CreatureFilterBar({
  searchQuery,
  onSearchChange,
  classificationFilter,
  onClassificationChange,
  mediaTypeFilter,
  onMediaTypeChange,
  sourceFilter,
  onSourceChange,
  availableSources,
  availableClassifications,
  favoritesOnly,
  onFavoritesToggle,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}: CreatureFilterBarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const selectStyle = `px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border outline-none cursor-pointer ${
    isCyber
      ? "bg-[#080c1a] border-cyan-500/30 text-slate-200 focus:border-cyan-400"
      : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000000] focus:bg-amber-50"
  }`;

  return (
    <div className="w-full space-y-3">
      {/* ── MAIN FILTER CONTROLS BAR ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-50">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, species, work, lore, tags..."
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-mono transition-all border outline-none ${
              isCyber
                ? "bg-[#080c1a] border-cyan-500/30 text-slate-200 placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,245,255,0.25)]"
                : "bg-white border-2 border-black text-black placeholder-slate-400 shadow-[2px_2px_0px_#000000] focus:bg-amber-50"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Classification Filter */}
        <select
          value={classificationFilter}
          onChange={(e) => onClassificationChange(e.target.value)}
          className={selectStyle}
        >
          <option value="all">All Types</option>
          {availableClassifications.map((c) => {
            const icon = CLASSIFICATION_PRESETS[c]?.icon || "🐾";
            return (
              <option key={c} value={c}>
                {icon} {c}
              </option>
            );
          })}
        </select>

        {/* Media Type Filter */}
        <select
          value={mediaTypeFilter}
          onChange={(e) => onMediaTypeChange(e.target.value)}
          className={selectStyle}
        >
          <option value="all">All Media</option>
          {CREATURE_MEDIA_TYPES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Source Work Filter */}
        {availableSources.length > 0 && (
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className={selectStyle}
          >
            <option value="all">All Sources</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as CreatureSortOption)}
          className={selectStyle}
        >
          <option value="newest">Recently Added ▼</option>
          <option value="likes">Most Bonded ❤️</option>
          <option value="name">Name (A-Z) 🔤</option>
          <option value="year">Release Year 📅</option>
        </select>

        {/* Favorites Only Toggle */}
        <button
          onClick={onFavoritesToggle}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
            favoritesOnly
              ? isCyber
                ? "bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
              : isCyber
              ? "bg-[#080c1a] border-cyan-500/30 text-slate-400 hover:text-amber-300 hover:border-amber-400/40"
              : "bg-white border-2 border-black text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
          }`}
        >
          <span>{favoritesOnly ? "★" : "☆"}</span>
          <span className="hidden sm:inline">Favorites</span>
        </button>

        {/* Reset Filters (Only shown when active) */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              isCyber
                ? "bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20"
                : "bg-red-100 text-red-800 border-2 border-black hover:bg-red-200 shadow-[2px_2px_0px_#000000]"
            }`}
          >
            Reset ✕
          </button>
        )}
      </div>
    </div>
  );
}
