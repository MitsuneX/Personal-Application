"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { DossierCharacterCard } from "@/components/cards/DossierCharacterCard";
import { InteractiveCategoryFilter } from "@/components/ui/InteractiveCategoryFilter";
import { CharacterPreviewModal } from "@/components/ui/CharacterPreviewModal";
import { useConfirm } from "@/lib/context/ConfirmContext";

function GameDatabaseOverviewPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const games = useDashboardStore((s) => s.games) || [];
  const dossierCharacters = useDashboardStore((s) => s.dossierCharacters) || [];
  const { removeDossierCharacter } = useDashboardStore();
  const { openContextMenu } = useContextMenu();
  const { confirm } = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [selectedElement, setSelectedElement] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DossierCharacterEntry | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<DossierCharacterEntry | null>(null);
  const [targetGameId, setTargetGameId] = useState<string>(games[0]?.id || "");

  const activeGameObj = games.find((g) => g.id === selectedGameFilter);

  // Reset category and element filters when game selection changes
  const handleGameFilterChange = (newGameId: string) => {
    setSelectedGameFilter(newGameId);
    setSelectedElement("ALL");
    setSelectedCategory("ALL");
  };

  // Combined Memoized Filtering Logic
  const filteredCharacters = useMemo(() => {
    return (dossierCharacters || []).filter((c) => {
      // 1. Game filter
      if (selectedGameFilter !== "ALL" && c.gameId !== selectedGameFilter) {
        return false;
      }

      // 2. Element filter (Primary)
      if (selectedElement !== "ALL") {
        const charRole = (c.role || "").toLowerCase();
        const selEl = selectedElement.toLowerCase();
        if (charRole !== selEl && !charRole.includes(selEl)) {
          return false;
        }
      }

      // 3. Category / Path filter (Secondary)
      if (selectedCategory !== "ALL") {
        const charCat = (c.category || "").toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (charCat !== selCat && !charCat.includes(selCat)) {
          return false;
        }
      }

      // 4. Universal Search Query across all metadata
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchAlias = (c.aliases || []).some((a) => a.toLowerCase().includes(q));
        const matchCat = (c.category || "").toLowerCase().includes(q);
        const matchRole = (c.role || "").toLowerCase().includes(q);
        const matchFaction = (c.faction || "").toLowerCase().includes(q);
        const matchNation = (c.nation || "").toLowerCase().includes(q);
        const matchWeapon = (c.weapon || "").toLowerCase().includes(q);
        const matchVer = (c.releaseVersion || "").toLowerCase().includes(q);
        const matchRank = (c.levelRank || "").toLowerCase().includes(q);
        const matchVA = (c.voiceActor || "").toLowerCase().includes(q);
        const matchAff = (c.affiliation || "").toLowerCase().includes(q);
        const matchRegion = (c.region || "").toLowerCase().includes(q);
        const matchConst = (c.constellation || "").toLowerCase().includes(q);
        const matchDesc = (c.description || "").toLowerCase().includes(q) || (c.notes || "").toLowerCase().includes(q);
        const matchTags = (c.tags || []).some((t) => t.toLowerCase().includes(q)) || (c.loreTags || []).some((t) => t.toLowerCase().includes(q));
        const matchKw = (c.searchKeywords || []).some((k) => k.toLowerCase().includes(q));

        if (!matchName && !matchAlias && !matchCat && !matchRole && !matchFaction && !matchNation && !matchWeapon && !matchVer && !matchRank && !matchVA && !matchAff && !matchRegion && !matchConst && !matchDesc && !matchTags && !matchKw) {
          return false;
        }
      }

      return true;
    });
  }, [dossierCharacters, selectedGameFilter, selectedElement, selectedCategory, searchQuery]);

  const handleDeleteCharacter = (char: DossierCharacterEntry) => {
    confirm({
      title: "Delete Character Dossier",
      message: `Are you sure you want to delete ${char.name}? This action cannot be undone.`,
      confirmText: "Delete Character",
      variant: "danger",
      itemPreview: {
        title: char.name,
        subtitle: `${char.category || "Character"} • ${char.role || "Roster"}`,
        icon: "🗑️",
      },
      successToast: `✓ Character "${char.name}" deleted.`,
      onConfirm: async () => {
        await removeDossierCharacter(char.id);
      },
    });
  };

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
              Inspect intelligence dossiers, filter character rosters by element and path, and track tactical performance.
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
              const avgWin =
                gameChars.length > 0
                  ? Math.round(gameChars.reduce((acc, c) => acc + (c.winRate || 0), 0) / gameChars.length)
                  : 0;

              const isSelectedGame = selectedGameFilter === game.id;

              const handleDossierContextMenu = (e: React.MouseEvent) => {
                e.preventDefault();
                openContextMenu(
                  e,
                  [
                    {
                      id: "filter",
                      label: `Filter by ${game.game}`,
                      icon: "🎯",
                      onClick: () => handleGameFilterChange(game.id),
                    },
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
                  onClick={() => handleGameFilterChange(isSelectedGame ? "ALL" : game.id)}
                  onContextMenu={handleDossierContextMenu}
                  className="rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden group transition-all cursor-pointer select-none hover:scale-[1.02]"
                  style={{
                    backgroundColor: isCyber
                      ? isSelectedGame
                        ? `rgba(0,245,255,0.15)`
                        : "rgba(10,15,30,0.85)"
                      : isSelectedGame
                      ? "#FEF08A"
                      : "#FFFFFF",
                    borderColor: isCyber
                      ? isSelectedGame
                        ? game.accentColor || "#00F5FF"
                        : `${game.accentColor || "#00F5FF"}40`
                      : "#000000",
                    borderWidth: isCyber ? (isSelectedGame ? "2px" : "1px") : "2.5px",
                    boxShadow: isCyber
                      ? isSelectedGame
                        ? `0 0 25px ${game.accentColor || "#00F5FF"}50`
                        : `0 0 15px ${game.accentColor || "#00F5FF"}20`
                      : isSelectedGame
                      ? "5px 5px 0 #000000"
                      : "4px 4px 0 #000000",
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
                        <strong className="theme-text-primary">
                          {gameChars.length} {config.characterLabel}s
                        </strong>
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
                    onClick={(e) => e.stopPropagation()}
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

        {/* ── Dynamic Category & Element Filtering Section ── */}
        {activeGameObj && (
          <motion.div variants={cardVariants} className="pt-2">
            <BentoCard id="game-category-filter-panel" className="p-5 md:p-6">
              <InteractiveCategoryFilter
                gameTitle={activeGameObj.game}
                gameCategory={activeGameObj.category}
                characters={dossierCharacters.filter((c) => c.gameId === activeGameObj.id)}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onResetFilters={() => {
                  setSelectedElement("ALL");
                  setSelectedCategory("ALL");
                }}
              />
            </BentoCard>
          </motion.div>
        )}

        {/* ── Character Collection Section (Master Roster Index) ── */}
        <motion.div variants={cardVariants} className="space-y-4 pt-2">
          <BentoCard id="master-dossier-roster" className="p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
                  <span>🗂️</span> Character Collection ({filteredCharacters.length})
                </h2>
                <p className="text-xs theme-text-muted font-mono mt-0.5">
                  Browse, filter, and manage characters across your game collection with live element & path combination filters.
                </p>
              </div>

              {/* Filter Controls Header */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search character name or rank..."
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none flex-1 md:w-64"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
                    color: isCyber ? "#F8FAFC" : "#0F172A",
                    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                />

                <select
                  value={selectedGameFilter}
                  onChange={(e) => handleGameFilterChange(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
                    color: isCyber ? "#F8FAFC" : "#0F172A",
                    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
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
            {filteredCharacters.length === 0 ? (
              <div
                className="p-8 rounded-2xl border text-center space-y-3"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber ? "none" : "4px 4px 0 #000000",
                }}
              >
                <div className="text-4xl">🔍</div>
                <h3 className="font-black text-base theme-text-primary">
                  No characters match the selected filters.
                </h3>
                <p className="text-xs theme-text-muted max-w-md mx-auto">
                  Try selecting another Element or Class, or clear active search parameters to view your character roster.
                </p>
                <button
                  onClick={() => {
                    setSelectedElement("ALL");
                    setSelectedCategory("ALL");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl font-extrabold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  Reset All Filters ↺
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <AnimatePresence mode="popLayout">
                  {filteredCharacters.map((char) => (
                    <DossierCharacterCard
                      key={char.id}
                      character={char}
                      onSelect={(c) => setPreviewCharacter(c)}
                      onEdit={(c) => {
                        setEditingCharacter(c);
                        setTargetGameId(c.gameId);
                        setIsCharModalOpen(true);
                      }}
                      onDelete={handleDeleteCharacter}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* Character Preview Overlay Modal */}
        <CharacterPreviewModal
          isOpen={!!previewCharacter}
          onClose={() => setPreviewCharacter(null)}
          character={previewCharacter}
          onEdit={(c) => {
            setEditingCharacter(c);
            setTargetGameId(c.gameId);
            setIsCharModalOpen(true);
          }}
          onDelete={handleDeleteCharacter}
        />

        {/* Character Editor Modal */}
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
