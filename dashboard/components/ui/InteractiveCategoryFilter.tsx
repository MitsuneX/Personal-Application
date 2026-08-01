"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { getGameDossierConfig, getCategoryVisualTokens } from "@/lib/data/gameDossierConfig";

interface InteractiveCategoryFilterProps {
  gameTitle: string;
  gameCategory?: string;
  characters: DossierCharacterEntry[];
  selectedElement: string;
  onSelectElement: (element: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onResetFilters: () => void;
}

export function InteractiveCategoryFilter({
  gameTitle,
  gameCategory,
  characters,
  selectedElement,
  onSelectElement,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
}: InteractiveCategoryFilterProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const config = getGameDossierConfig(gameTitle, gameCategory);
  const elementSystem = config.elementSystem;

  const hasActiveFilter = selectedElement !== "ALL" || selectedCategory !== "ALL";

  return (
    <div className="space-y-6">
      {/* ── Active Filter Bar ── */}
      {hasActiveFilter && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-3 rounded-xl border flex-wrap"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#FEF08A",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
            <span className="theme-text-muted">Active Filters:</span>

            {selectedElement !== "ALL" && (
              <button
                onClick={() => onSelectElement("ALL")}
                className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.2)" : "#FFFFFF",
                  color: isCyber ? "#00F5FF" : "#000000",
                  border: isCyber ? "1px solid #00F5FF" : "1.5px solid #000",
                }}
              >
                <span>Element: {selectedElement}</span>
                <span className="text-[10px]">✕</span>
              </button>
            )}

            {selectedCategory !== "ALL" && (
              <button
                onClick={() => onSelectCategory("ALL")}
                className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(191,95,255,0.2)" : "#FFFFFF",
                  color: isCyber ? "#BF5FFF" : "#000000",
                  border: isCyber ? "1px solid #BF5FFF" : "1.5px solid #000",
                }}
              >
                <span>Category: {selectedCategory}</span>
                <span className="text-[10px]">✕</span>
              </button>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="text-xs font-mono font-black uppercase tracking-wider px-3 py-1 rounded-lg cursor-pointer transition-transform active:scale-95"
            style={{
              backgroundColor: isCyber ? "rgba(239,68,68,0.2)" : "#FEE2E2",
              color: isCyber ? "#EF4444" : "#991B1B",
              border: isCyber ? "1px solid rgba(239,68,68,0.4)" : "1.5px solid #000",
            }}
          >
            Clear All Filters ↺
          </button>
        </motion.div>
      )}

      {/* ── Primary Category / Combat Elements Section ── */}
      {elementSystem && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black theme-text-primary flex items-center gap-1.5">
                <span>✦</span> {elementSystem.sectionLabel}
              </h3>
              <span className="text-xs font-mono theme-text-muted">
                ({elementSystem.elements.length} types)
              </span>
            </div>

            <button
              onClick={() => onSelectElement("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedElement === "ALL"
                  ? "bg-amber-500 text-black border-2 border-black font-extrabold shadow-sm"
                  : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
              }`}
            >
              All Elements ({characters.length})
            </button>
          </div>

          {/* Element Filter Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {elementSystem.elements.map((el) => {
              const matchesCount = characters.filter((c) =>
                c.role?.toLowerCase() === el.name.toLowerCase() ||
                c.role?.toLowerCase().includes(el.name.toLowerCase())
              ).length;

              const isSelected = selectedElement.toLowerCase() === el.name.toLowerCase();
              const tokens = getCategoryVisualTokens(el, isCyber);

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(isSelected ? "ALL" : el.name)}
                  className="rounded-2xl p-3.5 border text-center relative overflow-hidden transition-all cursor-pointer select-none group hover:scale-[1.03]"
                  style={{
                    backgroundColor: isCyber
                      ? isSelected
                        ? tokens.gradient
                        : "rgba(10,15,30,0.6)"
                      : isSelected
                      ? "#FEF08A"
                      : "#FFFFFF",
                    borderColor: isCyber
                      ? isSelected
                        ? tokens.accentColor
                        : tokens.border
                      : "#000000",
                    borderWidth: isCyber ? (isSelected ? "2px" : "1px") : "2.5px",
                    boxShadow: !isCyber
                      ? isSelected
                        ? "4px 4px 0 #000000"
                        : "3px 3px 0 #000000"
                      : isSelected
                      ? tokens.glow
                      : "none",
                  }}
                >
                  {isCyber && isSelected && (
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-50"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${tokens.accentColor}44, transparent 70%)` }}
                    />
                  )}

                  <div className="relative z-10">
                    <div className="text-2xl mb-1">{el.icon}</div>
                    <p
                      className="font-black text-xs leading-tight"
                      style={{ color: isCyber ? (isSelected ? tokens.accentColor : "#E0E8FF") : "#1A1A1A" }}
                    >
                      {el.name}
                    </p>

                    <span
                      className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: isSelected ? tokens.badgeBg : (isCyber ? "rgba(255,255,255,0.06)" : "#F1F5F9"),
                        color: isSelected ? tokens.badgeText : (isCyber ? "#94A3B8" : "#475569"),
                        border: isCyber ? `1px solid ${isSelected ? tokens.accentColor : "rgba(255,255,255,0.1)"}` : "1px solid #000",
                      }}
                    >
                      {matchesCount} {config.characterLabel}{matchesCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Secondary Category / Paths & Classes Section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black theme-text-primary flex items-center gap-1.5">
              <span>📁</span> {config.categoryLabel}
            </h3>
            <span className="text-xs font-mono theme-text-muted">
              ({config.categories.length} categories)
            </span>
          </div>

          <button
            onClick={() => onSelectCategory("ALL")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-amber-500 text-black border-2 border-black font-extrabold shadow-sm"
                : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
            }`}
          >
            All {config.categoryLabel} ({characters.length})
          </button>
        </div>

        {/* Category Cards Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {config.categories.map((cat) => {
            const matchesCount = characters.filter((c) =>
              c.category?.toLowerCase() === cat.name.toLowerCase() ||
              c.category?.toLowerCase().includes(cat.name.toLowerCase())
            ).length;

            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const tokens = getCategoryVisualTokens(cat, isCyber);

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? "ALL" : cat.name)}
                className="rounded-2xl p-4 border transition-all cursor-pointer select-none relative overflow-hidden group hover:scale-[1.02]"
                style={{
                  backgroundColor: isCyber
                    ? isSelected
                      ? tokens.gradient
                      : "rgba(10,15,30,0.6)"
                    : isSelected
                    ? "#FEF08A"
                    : "#FFFFFF",
                  borderColor: isCyber
                    ? isSelected
                      ? tokens.accentColor
                      : tokens.border
                    : "#000000",
                  borderWidth: isCyber ? (isSelected ? "2px" : "1px") : "2.5px",
                  boxShadow: !isCyber
                    ? isSelected
                      ? "4px 4px 0 #000000"
                      : "3px 3px 0 #000000"
                    : isSelected
                    ? tokens.glow
                    : "none",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: isSelected ? tokens.badgeBg : (isCyber ? "rgba(255,255,255,0.06)" : "#F1F5F9"),
                      color: isSelected ? tokens.badgeText : (isCyber ? "#94A3B8" : "#475569"),
                      border: isCyber ? `1px solid ${isSelected ? tokens.accentColor : "rgba(255,255,255,0.1)"}` : "1.5px solid #000",
                    }}
                  >
                    {matchesCount} {matchesCount === 1 ? config.characterLabel : `${config.characterLabel}s`}
                  </span>
                </div>

                <h4
                  className="font-black text-sm leading-tight truncate"
                  style={{ color: isCyber ? (isSelected ? tokens.accentColor : "#E0E8FF") : "#1A1A1A" }}
                >
                  {cat.name}
                </h4>

                {cat.description && (
                  <p className="text-[11px] theme-text-muted mt-1 line-clamp-2 leading-relaxed opacity-90">
                    {cat.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
