"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { GameCharacterCard } from "@/components/cards/GameCharacterCard";
import { GameCharacterEditorModal } from "@/components/ui/GameCharacterEditorModal";
import { AppShell } from "@/components/layout/AppShell";

function GameCharactersContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    gameCharacters,
    games,
    removeGameCharacter,
    syncOrphanedGameCharacters,
  } = useDashboardStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameFilter, setSelectedGameFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "winRate" | "name">("rank");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<GameCharacterEntry | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<GameCharacterEntry | null>(null);

  const orphanedCount = gameCharacters.filter(
    (c) => !c.gameId || !games.some((g) => g.id === c.gameId)
  ).length;

  const filteredCharacters = gameCharacters
    .filter((char) => {
      if (favoritesOnly && !char.isFavorite) return false;
      if (selectedGameFilter !== "all") {
        if (selectedGameFilter === "orphaned") {
          if (char.gameId && games.some((g) => g.id === char.gameId)) return false;
        } else {
          if (char.gameId !== selectedGameFilter && char.gameName !== selectedGameFilter) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = char.name.toLowerCase().includes(q);
        const matchGame = (char.gameName || "").toLowerCase().includes(q);
        const matchRole = (char.role || "").toLowerCase().includes(q);
        return matchName || matchGame || matchRole;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rank") {
        const rankA = a.rank && a.rank > 0 ? a.rank : 999;
        const rankB = b.rank && b.rank > 0 ? b.rank : 999;
        return rankA - rankB;
      }
      if (sortBy === "winRate") {
        return (b.winRate || 0) - (a.winRate || 0);
      }
      return a.name.localeCompare(b.name);
    });

  const handleOpenAddModal = () => {
    setEditingCharacter(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (character: GameCharacterEntry) => {
    setEditingCharacter(character);
    setIsEditorOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCharacter) {
      await removeGameCharacter(deletingCharacter.id);
      setDeletingCharacter(null);
    }
  };

  const handleBatchSyncOrphans = async () => {
    await syncOrphanedGameCharacters();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div
        className="p-6 md:p-8 rounded-3xl border relative overflow-hidden shadow-xl"
        style={{
          backgroundColor: isCyber ? "rgba(12,18,36,0.9)" : "#FFFFFF",
          borderColor: isCyber ? "#00F5FF40" : "#000000",
          borderWidth: isCyber ? "1.5px" : "2.5px",
          boxShadow: isCyber ? "0 10px 30px rgba(0,245,255,0.15)" : "6px 6px 0 #000000",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <h1 className="text-3xl md:text-4xl font-black theme-text-primary tracking-tight">
                Game Characters Hub
              </h1>
            </div>
            <p className="mt-2 text-sm theme-text-muted max-w-xl font-mono">
              Your personal roster of main champions, favorite agents, and elite units linked to your Game Database.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {orphanedCount > 0 && (
              <button
                onClick={handleBatchSyncOrphans}
                className="px-4 py-2.5 rounded-2xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                title="Sync all unlinked characters with Game Database"
              >
                <span>🔄</span>
                <span>Sync {orphanedCount} Unlinked</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/30 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>+ Add Character</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          backgroundColor: isCyber ? "rgba(12,18,36,0.7)" : "#F9FAFB",
          borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
        }}
      >
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search characters or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <span className="absolute left-3 top-2.5 text-xs opacity-50">🔍</span>
          </div>

          {/* Filter by Game */}
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="py-2 px-3 rounded-xl text-xs bg-white/5 border border-white/10 theme-text-primary font-mono focus:outline-none"
          >
            <option value="all">All Games</option>
            {orphanedCount > 0 && <option value="orphaned">⚠️ Unlinked Only ({orphanedCount})</option>}
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.game}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rank" | "winRate" | "name")}
            className="py-2 px-3 rounded-xl text-xs bg-white/5 border border-white/10 theme-text-primary font-mono focus:outline-none"
          >
            <option value="rank">Sort by Rank</option>
            <option value="winRate">Sort by Win Rate</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              favoritesOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 theme-text-muted border-white/10 hover:bg-white/10"
            }`}
          >
            {favoritesOnly ? "⭐ Favorites Only" : "☆ All Characters"}
          </button>
        </div>
      </div>

      {/* Grid of Characters */}
      {filteredCharacters.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/20 theme-text-muted">
          <div className="text-4xl mb-3">🎮</div>
          <h3 className="text-lg font-bold theme-text-primary">No Characters Found</h3>
          <p className="text-xs font-mono mt-1">
            {gameCharacters.length === 0
              ? "You haven't added any favorite characters yet."
              : "No characters match your search filters."}
          </p>
          {gameCharacters.length === 0 && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all cursor-pointer"
            >
              + Add First Character
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredCharacters.map((char) => (
              <GameCharacterCard
                key={char.id}
                character={char}
                onEdit={handleEdit}
                onDelete={(c) => setDeletingCharacter(c)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor Modal */}
      <GameCharacterEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        characterToEdit={editingCharacter}
      />

      {/* Delete Confirmation Modal */}
      {deletingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: isCyber ? "#0C1224" : "#FFFFFF",
              borderColor: isCyber ? "#FF005570" : "#000000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
            }}
          >
            <h3 className="text-lg font-black theme-text-primary">Delete Character</h3>
            <p className="text-sm theme-text-muted font-mono">
              Are you sure you want to remove <span className="font-bold text-red-400">{deletingCharacter.name}</span> from your roster?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCharacter(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition-all shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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

