"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { GameCharacterCard } from "@/components/cards/GameCharacterCard";
import { GameCharacterEditorModal } from "@/components/ui/GameCharacterEditorModal";
import { CharacterProfileModal } from "@/components/game/CharacterProfileModal";
import { AppShell } from "@/components/layout/AppShell";

// ─── Helper ───────────────────────────────────────────────────────────────────
const elColor = (el?: string) => {
  if (!el) return "#A855F7";
  const map: Record<string, string> = {
    pyro:"#FF4A4A", hydro:"#1E90FF", anemo:"#4DC9A9", geo:"#CFA827",
    electro:"#A855F7", cryo:"#8FBCD4", dendro:"#5CB85C", fire:"#FF4A4A",
    quantum:"#A855F7", imaginary:"#D4A017", physical:"#94A3B8",
    glacio:"#8FBCD4", fusion:"#FF6B35", havoc:"#DC2626", spectro:"#F4C430",
  };
  return map[el.toLowerCase().replace(/[^a-z]/g, "")] || "#A855F7";
};

// ─── Page content ──────────────────────────────────────────────────────────────
function GameCharactersContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { gameCharacters, games, removeGameCharacter, syncOrphanedGameCharacters } = useDashboardStore();

  // ── Filter / Sort state ──
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [gameCategoryFilter, setGameCategoryFilter] = useState("all");
  const [elementFilter, setElementFilter] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "name" | "winRate" | "rarity">("rank");

  // ── Modal state (Single active modal manager to prevent modal stacking) ──
  const [activeModal, setActiveModal] = useState<"none" | "profile" | "editor">("none");
  const [selectedChar, setSelectedChar] = useState<GameCharacterEntry | null>(null);

  const orphanCount = gameCharacters.filter(
    (c) => !c.gameId || !games.some((g) => g.id === c.gameId)
  ).length;

  // Unique elements for filter
  const elements = useMemo(() => {
    const s = new Set<string>();
    gameCharacters.forEach((c) => { if (c.element) s.add(c.element); });
    return Array.from(s).sort();
  }, [gameCharacters]);

  // Category matcher helper
  const matchCategory = (gCat?: string | null, filter?: string) => {
    if (!filter || filter === "all") return true;
    if (!gCat) return false;
    const cat = gCat.toLowerCase();
    const f = filter.toLowerCase();
    if (cat === f) return true;
    if (f === "gacha") return cat.includes("gacha");
    if (f === "action rpg") return cat.includes("action");
    if (f === "turn-based rpg") return cat.includes("turn");
    if (f === "tactical rpg") return cat.includes("tactical") || cat.includes("strategy");
    if (f === "gacha action rpg") return cat.includes("gacha") && cat.includes("action");
    return cat.includes(f);
  };

  // Filtered & sorted characters
  const filtered = useMemo(() => {
    return gameCharacters
      .filter((c) => {
        if (favOnly && !c.isFavorite) return false;
        if (featuredOnly && !c.isFeatured) return false;
        if (gameFilter === "orphaned") {
          if (c.gameId && games.some((g) => g.id === c.gameId)) return false;
        } else if (gameFilter !== "all") {
          if (c.gameId !== gameFilter && c.gameName !== gameFilter) return false;
        }

        if (gameCategoryFilter !== "all") {
          const parentGame = games.find((g) => g.id === c.gameId || g.game.toLowerCase() === (c.gameName || "").toLowerCase());
          const cat = parentGame?.category || c.category;
          if (!matchCategory(cat, gameCategoryFilter)) return false;
        }

        if (elementFilter !== "all" && (c.element || "").toLowerCase() !== elementFilter.toLowerCase()) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            (c.gameName || "").toLowerCase().includes(q) ||
            (c.role || "").toLowerCase().includes(q) ||
            (c.element || "").toLowerCase().includes(q) ||
            (c.faction || "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Featured priority
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        if (sortBy === "rank") {
          const ra = a.rank && a.rank > 0 ? a.rank : 9999;
          const rb = b.rank && b.rank > 0 ? b.rank : 9999;
          return ra - rb;
        }
        if (sortBy === "winRate") return (b.winRate || 0) - (a.winRate || 0);
        if (sortBy === "rarity") {
          const getNum = (r?: string) => { const m = (r || "").match(/(\d)/); return m ? parseInt(m[1]) : 0; };
          return getNum(b.rarity) - getNum(a.rarity);
        }
        return a.name.localeCompare(b.name);
      });
  }, [gameCharacters, games, favOnly, featuredOnly, gameFilter, gameCategoryFilter, elementFilter, search, sortBy]);

  // Stats
  const totalFavs = gameCharacters.filter((c) => c.isFavorite).length;
  const gameCount = new Set(gameCharacters.map((c) => c.gameId || c.gameName).filter(Boolean)).size;

  // ── Handlers ──
  const handleOpenProfile = (char: GameCharacterEntry) => {
    setSelectedChar(char);
    setActiveModal("profile");
  };

  const handleEditCharacter = (char: GameCharacterEntry) => {
    setSelectedChar(char);
    setActiveModal("editor");
  };

  const handleAddNew = () => {
    setSelectedChar(null);
    setActiveModal("editor");
  };

  const handleCloseModal = () => {
    setActiveModal("none");
  };

  const handleDeleteFromProfile = async (char: GameCharacterEntry) => {
    await removeGameCharacter(char.id);
    setActiveModal("none");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Cinematic Header ─────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden border"
        style={{
          borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
          borderWidth: isCyber ? "1.5px" : "2.5px",
          boxShadow: isCyber ? "0 10px 40px rgba(0,245,255,0.1)" : "6px 6px 0 #000",
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #060a1a 0%, #0d1035 50%, #060a1a 100%)"
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          }}
        />
        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: isCyber ? "#00F5FF" : "#A855F7" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: isCyber ? "#BF5FFF" : "#3B82F6" }} />
        </div>

        <div className="relative z-10 px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Left: Title + stats */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: isCyber ? "rgba(0,245,255,0.15)" : "rgba(168,85,247,0.2)",
                    border: `1.5px solid ${isCyber ? "rgba(0,245,255,0.3)" : "rgba(168,85,247,0.4)"}`,
                  }}>
                  ⚔️
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    Character Encyclopedia
                  </h1>
                  <p className="text-sm text-white/40 font-mono mt-0.5">
                    Your personal character archive
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                {[
                  { label: "Characters", value: gameCharacters.length, icon: "👥" },
                  { label: "Favorites",  value: totalFavs,              icon: "⭐" },
                  { label: "Games",      value: gameCount,              icon: "🎮" },
                  ...(orphanCount > 0 ? [{ label: "Unlinked", value: orphanCount, icon: "⚠️" }] : []),
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div>
                      <div className="text-xl font-black text-white leading-tight">{value}</div>
                      <div className="text-[9px] font-mono text-white/35 uppercase tracking-wider">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {orphanCount > 0 && (
                <button
                  onClick={() => syncOrphanedGameCharacters()}
                  className="px-4 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: "rgba(251,191,36,0.1)",
                    borderColor: "rgba(251,191,36,0.4)",
                    color: "#FBB724",
                  }}
                >
                  🔄 Sync {orphanCount} Unlinked
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddNew}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer"
                style={{
                  background: isCyber
                    ? "linear-gradient(135deg, rgba(0,245,255,0.8), rgba(191,95,255,0.8))"
                    : "linear-gradient(135deg, #7C3AED, #A855F7)",
                  boxShadow: isCyber ? "0 4px 20px rgba(0,245,255,0.3)" : "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                <span className="text-base">+</span>
                <span>Add Character</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 flex flex-col sm:flex-row items-center gap-3 flex-wrap"
        style={{
          backgroundColor: isCyber ? "rgba(9,13,28,0.8)" : "#F9FAFB",
          borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB",
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, game, element, role…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 border"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
            }}
          />
        </div>

        {/* Game Category filter */}
        <select
          value={gameCategoryFilter}
          onChange={(e) => setGameCategoryFilter(e.target.value)}
          className="py-2 px-3 rounded-xl text-xs font-mono theme-text-primary focus:outline-none border cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
            borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
          }}
        >
          <option value="all">All Game Categories</option>
          <option value="Gacha">🎰 Gacha</option>
          <option value="Action RPG">⚔️ Action RPG</option>
          <option value="Gacha Action RPG">🔥 Gacha Action RPG</option>
          <option value="Turn-Based RPG">⏳ Turn-Based RPG</option>
          <option value="Tactical RPG">🎯 Tactical RPG</option>
          <option value="MOBA">🛡️ MOBA</option>
          <option value="Fighting">👊 Fighting</option>
          <option value="Shooter">🔫 Shooter</option>
          <option value="MMORPG">🌍 MMORPG</option>
          <option value="Strategy">♟️ Strategy</option>
          <option value="Simulation">🛸 Simulation</option>
          <option value="Rhythm">🎵 Rhythm</option>
          <option value="Sandbox">🧱 Sandbox</option>
          <option value="Survival">🏕️ Survival</option>
          <option value="Other">🎲 Other</option>
        </select>

        {/* Game filter */}
        <select
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
          className="py-2 px-3 rounded-xl text-xs font-mono theme-text-primary focus:outline-none border cursor-pointer"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
            borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
          }}
        >
          <option value="all">All Games</option>
          {orphanCount > 0 && <option value="orphaned">⚠️ Unlinked ({orphanCount})</option>}
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.game}</option>
          ))}
        </select>

        {/* Element filter */}
        {elements.length > 0 && (
          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value)}
            className="py-2 px-3 rounded-xl text-xs font-mono theme-text-primary focus:outline-none border cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
            }}
          >
            <option value="all">All Elements</option>
            {elements.map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        )}

        {/* Featured Only toggle */}
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className="px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5"
          style={{
            backgroundColor: featuredOnly ? (isCyber ? "rgba(255,215,0,0.2)" : "#FEF08A") : (isCyber ? "rgba(255,255,255,0.05)" : "#FFF"),
            borderColor: featuredOnly ? (isCyber ? "#FFD700" : "#EAB308") : (isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB"),
            color: featuredOnly ? (isCyber ? "#FFD700" : "#854D0E") : (isCyber ? "rgba(255,255,255,0.5)" : "#6B7280"),
          }}
        >
          <span>⭐</span>
          <span>{featuredOnly ? "Featured Only" : "Featured"}</span>
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="py-2 px-3 rounded-xl text-xs font-mono theme-text-primary focus:outline-none border"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
            borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
          }}
        >
          <option value="rank">Sort: Rank</option>
          <option value="name">Sort: Name</option>
          <option value="rarity">Sort: Rarity</option>
          <option value="winRate">Sort: Win Rate</option>
        </select>

        {/* Favorites toggle */}
        <button
          onClick={() => setFavOnly(!favOnly)}
          className="px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5"
          style={{
            backgroundColor: favOnly ? "rgba(251,191,36,0.15)" : isCyber ? "rgba(255,255,255,0.05)" : "#FFF",
            borderColor: favOnly ? "rgba(251,191,36,0.5)" : isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB",
            color: favOnly ? "#FBB724" : isCyber ? "rgba(255,255,255,0.5)" : "#6B7280",
          }}
        >
          {favOnly ? "⭐" : "☆"}
          <span>{favOnly ? "Favorites" : "All"}</span>
        </button>
      </div>

      {/* ── Results label ────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono theme-text-muted">
            Showing <span className="font-bold theme-text-primary">{filtered.length}</span> of {gameCharacters.length} characters
          </span>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-3xl border border-dashed"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB" }}
        >
          <div className="text-5xl mb-4">⚔️</div>
          <h3 className="text-xl font-black theme-text-primary">
            {gameCharacters.length === 0 ? "Your encyclopedia is empty" : "No characters match"}
          </h3>
          <p className="text-sm theme-text-muted font-mono mt-1">
            {gameCharacters.length === 0
              ? "Start building your collection."
              : "Try adjusting your search or filters."}
          </p>
          {gameCharacters.length === 0 && (
            <button
              onClick={handleAddNew}
              className="mt-5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer"
              style={{
                background: isCyber ? "rgba(0,245,255,0.8)" : "#7C3AED",
              }}
            >
              + Add Your First Character
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {filtered.map((char) => (
              <GameCharacterCard
                key={char.id}
                character={char}
                onClick={handleOpenProfile}
                onEdit={handleEditCharacter}
                onDelete={handleDeleteFromProfile}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Character Profile Modal ───────────────────────────────────── */}
      <CharacterProfileModal
        isOpen={activeModal === "profile"}
        character={selectedChar}
        onClose={handleCloseModal}
        onEdit={handleEditCharacter}
        onDelete={handleDeleteFromProfile}
      />

      {/* ── Editor Modal ──────────────────────────────────────────────── */}
      <GameCharacterEditorModal
        isOpen={activeModal === "editor"}
        onClose={handleCloseModal}
        characterToEdit={selectedChar}
      />
    </div>
  );
}

export default function GameCharactersPage() {
  return (
    <AppShell>
      <GameCharactersContent />
    </AppShell>
  );
}
