"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HofMultiSelectGameFilterProps {
  isCyber: boolean;
  games: Array<{ id: string; game: string }>;
  gameCharacters?: Array<{ gameId?: string; gameName?: string }>;
  selectedGames: string[];
  onChangeSelectedGames: (selected: string[]) => void;
}

export function HofMultiSelectGameFilter({
  isCyber,
  games = [],
  gameCharacters = [],
  selectedGames = [],
  onChangeSelectedGames,
}: HofMultiSelectGameFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Character counts per game
  const countsByGame = useMemo(() => {
    const map: Record<string, number> = {};
    gameCharacters.forEach((c) => {
      const name = c.gameName;
      if (name) {
        map[name] = (map[name] || 0) + 1;
      }
    });
    return map;
  }, [gameCharacters]);

  // Filtered games list by search term
  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games;
    const q = searchTerm.toLowerCase().trim();
    return games.filter((g) => g.game.toLowerCase().includes(q));
  }, [games, searchTerm]);

  const allGameNames = useMemo(() => games.map((g) => g.game), [games]);

  const isAllSelected = selectedGames.length === 0 || selectedGames.length === games.length;

  const handleToggleGame = (gameName: string) => {
    if (selectedGames.includes(gameName)) {
      const updated = selectedGames.filter((g) => g !== gameName);
      onChangeSelectedGames(updated);
    } else {
      const updated = [...selectedGames, gameName];
      // If user selected all individually, clear to empty (means all)
      if (updated.length === games.length) {
        onChangeSelectedGames([]);
      } else {
        onChangeSelectedGames(updated);
      }
    }
  };

  const handleSelectAll = () => {
    onChangeSelectedGames([]);
  };

  const handleClearAll = () => {
    onChangeSelectedGames(["__NONE__"]);
  };

  // Button label summary
  const buttonLabel = useMemo(() => {
    if (selectedGames.includes("__NONE__")) return "No Games Selected";
    if (selectedGames.length === 0 || selectedGames.length === games.length) {
      return "🎮 All Games Selected";
    }
    if (selectedGames.length === 1) {
      return `🎮 ${selectedGames[0]}`;
    }
    return `🎮 ${selectedGames.length} Games Selected`;
  }, [selectedGames, games]);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase theme-text-muted block">🎮 Game Filter ▼</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-between gap-2 cursor-pointer transition-all"
        style={{
          backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#F8FAFC",
          color: isCyber ? "#00F5FF" : "#000000",
          borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
          borderWidth: isCyber ? "1.5px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.15)" : "3px 3px 0 #000000",
        }}
      >
        <span className="truncate">{buttonLabel}</span>
        <span className="text-[10px] opacity-70 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>

      {/* Dropdown Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 z-[100] rounded-2xl border p-3 shadow-2xl space-y-2 font-mono text-xs"
            style={{
              backgroundColor: isCyber ? "rgba(8,12,28,0.96)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.5)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber
                ? "0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(0,245,255,0.2)"
                : "6px 6px 0 #000000",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Search Bar */}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-40">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search game title..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-mono outline-none transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  color: isCyber ? "#FFFFFF" : "#000000",
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                }}
              />
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center justify-between border-b pb-2 pt-1" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
                  color: isCyber ? "#00F5FF" : "#0284C7",
                }}
              >
                ✓ Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(239,68,68,0.15)" : "#FEE2E2",
                  color: isCyber ? "#EF4444" : "#DC2626",
                }}
              >
                ✕ Clear All
              </button>
            </div>

            {/* Games Checkbox List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {filteredGames.length === 0 ? (
                <div className="py-4 text-center text-[11px] theme-text-muted italic">
                  No games found matching "{searchTerm}"
                </div>
              ) : (
                filteredGames.map((g) => {
                  const isChecked =
                    !selectedGames.includes("__NONE__") &&
                    (selectedGames.length === 0 || selectedGames.includes(g.game));
                  const count = countsByGame[g.game] || 0;

                  return (
                    <label
                      key={g.id}
                      onClick={() => handleToggleGame(g.game)}
                      className="flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none group"
                      style={{
                        backgroundColor: isChecked
                          ? isCyber
                            ? "rgba(0,245,255,0.12)"
                            : "#FEF08A"
                          : isCyber
                          ? "rgba(255,255,255,0.02)"
                          : "#F8FAFC",
                        borderColor: isChecked
                          ? isCyber
                            ? "#00F5FF"
                            : "#000000"
                          : isCyber
                          ? "rgba(255,255,255,0.08)"
                          : "#E2E8F0",
                        borderWidth: isCyber ? "1px" : "2px",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox box */}
                        <div
                          className="w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-black shrink-0 transition-colors"
                          style={{
                            backgroundColor: isChecked
                              ? isCyber
                                ? "#00F5FF"
                                : "#000000"
                              : "transparent",
                            borderColor: isChecked
                              ? isCyber
                                ? "#00F5FF"
                                : "#000000"
                              : isCyber
                              ? "rgba(255,255,255,0.3)"
                              : "#94A3B8",
                            color: isChecked ? (isCyber ? "#000000" : "#FFFFFF") : "transparent",
                          }}
                        >
                          ✓
                        </div>
                        <span
                          className={`text-xs font-bold truncate ${
                            isChecked
                              ? isCyber
                                ? "text-cyan-300"
                                : "text-black"
                              : isCyber
                              ? "text-slate-300"
                              : "text-gray-700"
                          }`}
                        >
                          {g.game}
                        </span>
                      </div>

                      {count > 0 && (
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold shrink-0"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                            color: isCyber ? "#94A3B8" : "#64748B",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
