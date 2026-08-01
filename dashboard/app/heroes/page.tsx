"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { resolveGameIcon } from "@/lib/data/gameIcons";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { DossierCharacterEditorModal } from "@/components/ui/DossierCharacterEditorModal";
import { GameScannerModal } from "@/components/ui/GameScannerModal";
import { GameUidBadge } from "@/components/ui/GameUidBadge";
import { useContextMenu } from "@/hooks/useContextMenu";
import { buildGameCardMenu } from "@/lib/context-menu/builders";

function GameDatabaseOverviewPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const games = useDashboardStore((s) => s.games) || [];
  const dossierCharacters = useDashboardStore((s) => s.dossierCharacters) || [];
  const { openContextMenu } = useContextMenu();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DossierCharacterEntry | null>(null);
  const [targetGameId, setTargetGameId] = useState<string>(games[0]?.id || "");

  // Filtered Characters List
  const filteredCharacters = (dossierCharacters || []).filter((c) => {
    if (selectedGameFilter !== "ALL" && c.gameId !== selectedGameFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      const matchRole = c.role?.toLowerCase().includes(q) || false;
      return matchName || matchCat || matchRole;
    }
    return true;
  });

  return (
    <>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black theme-text-primary flex items-center gap-2.5 tracking-tight">
              <span>📊</span> {isCyber ? "GAME_DOSSIER_DATABASE" : "Game Database Hub"}
            </h1>
            <p className="text-xs theme-text-muted font-mono mt-1">
              Select any game to inspect its intelligence dossier, hero rosters, and tactical performance.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setTargetGameId(games[0]?.id || "");
                setIsScannerOpen(true);
              }}
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                color: isCyber ? "#00F5FF" : "#854D0E",
                border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>📷</span> Scan Screenshot
            </button>
            <Link
              href="/games"
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFFFFF",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
                border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>🎮</span> Manage Games
            </Link>
          </div>
        </div>

        {/* ── Games Library Dossier Cards Overview Grid ── */}
        <motion.div variants={cardVariants} className="space-y-3">
          <h2 className="text-base font-black theme-text-primary flex items-center gap-2">
            <span>🕹️</span> Games Library Dossiers ({games.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.map((game, idx) => {
              const iconRes = resolveGameIcon(game.game, game.icon);
              const config = getGameDossierConfig(game.game, game.category);
              const gameChars = dossierCharacters.filter((c) => c.gameId === game.id);
              const avgWin = gameChars.length > 0
                ? Math.round(gameChars.reduce((acc, c) => acc + (c.winRate || 0), 0) / gameChars.length)
                : 0;

              const handleDossierContextMenu = (e: React.MouseEvent) => {
                e.preventDefault();
                openContextMenu(
                  e,
                  [
                    {
                      id: "view",
                      label: `View ${game.game} Dossier`,
                      icon: "📊",
                      onClick: () => {
                        if (typeof window !== "undefined") window.location.href = `/games/${game.id}`;
                      },
                    },
                    {
                      id: "roster",
                      label: "Manage Roster & Characters",
                      icon: "👥",
                      onClick: () => {
                        if (typeof window !== "undefined") window.location.href = `/games/${game.id}?tab=roster`;
                      },
                    },
                    {
                      id: "copy-uid",
                      label: `Copy UID (${game.handle || "N/A"})`,
                      icon: "📋",
                      disabled: !game.handle,
                      onClick: () => {
                        if (game.handle && typeof window !== "undefined") {
                          navigator.clipboard.writeText(game.handle).catch(() => {});
                        }
                      },
                    },
                  ],
                  game.game
                );
              };

              return (
                <motion.div
                  key={game.id}
                  variants={cardVariants}
                  custom={idx}
                  layout
                  onContextMenu={handleDossierContextMenu}
                  className="rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden group transition-all cursor-context-menu"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
                    borderColor: isCyber ? `${game.accentColor || "#00F5FF"}40` : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? `0 0 15px ${game.accentColor || "#00F5FF"}20` : "4px 4px 0 #000",
                  }}
                >
                  <div>
                    {/* Header Game Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border overflow-hidden relative shadow-sm"
                        style={{
                          backgroundColor: isCyber ? `${game.accentColor}25` : (iconRes.isImage ? "#0B0F19" : game.accentColor),
                          borderColor: isCyber ? `${game.accentColor}60` : "#000",
                          borderWidth: isCyber ? "1px" : "2px",
                        }}
                      >
                        {iconRes.isImage ? (
                          <img src={iconRes.iconUrl} alt={game.game} className="w-full h-full object-cover p-1" />
                        ) : (
                          <span>{iconRes.fallbackEmoji || "🎮"}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${game.accentColor}20`,
                            color: isCyber ? game.accentColor : "#1A1A1A",
                            border: `1px solid ${game.accentColor}`,
                          }}
                        >
                          {config.gameType}
                        </span>
                        <h3 className="font-black text-base theme-text-primary leading-tight truncate mt-0.5">
                          {game.game}
                        </h3>
                      </div>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-white/10 text-xs font-mono">
                      <div>
                        <span className="theme-text-muted block text-[10px]">ROSTER</span>
                        <strong className="theme-text-primary">{gameChars.length} {config.characterLabel}s</strong>
                      </div>
                      <div>
                        <span className="theme-text-muted block text-[10px]">AVG WINRATE</span>
                        <strong className="text-emerald-400">{avgWin}%</strong>
                      </div>
                    </div>

                    {game.mainCharacter && (
                      <p className="text-xs font-mono theme-text-muted truncate mb-2">
                        Main: <strong className="theme-text-primary">{game.mainCharacter}</strong>
                      </p>
                    )}

                    {game.handle && (
                      <div className="mb-3">
                        <GameUidBadge
                          handle={game.handle}
                          profileLink={null}
                          isCyber={isCyber}
                          accentColor={game.accentColor || "#00F5FF"}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Open Game Database Link */}
                  <Link
                    href={`/games/${game.id}`}
                    className="w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.14)" : "#FEF08A",
                      color: isCyber ? "#00F5FF" : "#854D0E",
                      border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000",
                    }}
                  >
                    <span>📊</span> Open {game.game} Database
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Global Character Search & Master Roster ── */}
        <motion.div variants={cardVariants} className="space-y-4 pt-2">
          <BentoCard id="master-dossier-roster" className="p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
                  <span>🗂️</span> Master Roster Index ({filteredCharacters.length})
                </h2>
                <p className="text-xs theme-text-muted font-mono mt-0.5">
                  Browse and filter all tracked character dossiers across your entire game collection
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search characters or roles..."
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none flex-1 md:w-64"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
                    color: isCyber ? "#F8FAFC" : "#0F172A",
                    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                  }}
                />

                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
                    color: isCyber ? "#F8FAFC" : "#0F172A",
                    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                  }}
                >
                  <option value="ALL">All Games</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.game}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Characters Master Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {filteredCharacters.map((char) => {
                const parentGame = games.find((g) => g.id === char.gameId);
                const charAccent = char.accentColor || parentGame?.accentColor || "#3B82F6";

                return (
                  <div
                    key={char.id}
                    className="p-4 rounded-xl border relative overflow-hidden group transition-all"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.03)" : "rgba(0,0,0,0.02)",
                      borderColor: isCyber ? `${charAccent}30` : "#000",
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: !isCyber ? "2px 2px 0 #000" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border overflow-hidden font-bold"
                          style={{
                            backgroundColor: `${charAccent}20`,
                            color: charAccent,
                            borderColor: isCyber ? charAccent : "#000",
                          }}
                        >
                          {char.avatarUrl ? (
                            char.avatarUrl.startsWith("http") || char.avatarUrl.startsWith("data:") || char.avatarUrl.startsWith("/") ? (
                              <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{char.avatarUrl}</span>
                            )
                          ) : (
                            <span>{char.name.charAt(0)}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-black text-sm theme-text-primary truncate leading-tight">
                            {char.name}
                          </h4>
                          <p className="text-[10px] font-mono text-amber-500 font-bold truncate">
                            {parentGame?.game || "Unknown Game"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/games/${char.gameId}`}
                          className="text-[10px] px-2 py-1 rounded font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                        >
                          View Dossier ↗
                        </Link>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="theme-text-muted">{char.category} {char.role ? `• ${char.role}` : ""}</span>
                      <span className="font-bold text-emerald-400">{char.winRate}% WR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </motion.div>

        {/* Character Modal */}
        {targetGameId && (
          <>
            <DossierCharacterEditorModal
              isOpen={isCharModalOpen}
              onClose={() => setIsCharModalOpen(false)}
              gameId={targetGameId}
              gameTitle={games.find((g) => g.id === targetGameId)?.game}
              gameCategory={games.find((g) => g.id === targetGameId)?.category}
              characterToEdit={editingCharacter}
            />

            <GameScannerModal
              isOpen={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              gameId={targetGameId}
              gameTitle={games.find((g) => g.id === targetGameId)?.game}
              gameCategory={games.find((g) => g.id === targetGameId)?.category}
            />
          </>
        )}
      </motion.div>
    </>
  );
}

export default function GameDatabaseOverviewPage() {
  return (
    <AppShell>
      <GameDatabaseOverviewPageContent />
    </AppShell>
  );
}
