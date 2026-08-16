"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, DossierCharacterEntry, GameResourceEntry, GameShowcaseEntry } from "@/lib/store/dashboardStore";
import { resolveGameIcon } from "@/lib/data/gameIcons";
import { getGameDossierConfig, getCategoryVisualTokens } from "@/lib/data/gameDossierConfig";
import { DossierCharacterEditorModal } from "@/components/ui/DossierCharacterEditorModal";
import { GameEditorModal } from "@/components/ui/GameEditorModal";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { GameScannerModal } from "@/components/ui/GameScannerModal";
import { ShowcaseEditorModal } from "@/components/ui/ShowcaseEditorModal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { GameUidBadge } from "@/components/ui/GameUidBadge";
import { DossierCharacterCard } from "@/components/cards/DossierCharacterCard";
import { InteractiveCategoryFilter } from "@/components/ui/InteractiveCategoryFilter";
import { CharacterPreviewModal } from "@/components/ui/CharacterPreviewModal";
import { getCanonicalGameCharacterElement, matchGameElement } from "@/lib/utils/elementTheme";
import { useToast } from "@/components/ui/ToastProvider";

const RESOURCE_CATEGORIES = [
  "Meta", "Tier List", "Heroes", "Characters", "Builds",
  "Wiki", "Guides", "Official", "Database", "Other",
];

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Resource Editor Modal ─────────────────────────────────────────────────────
interface ResourceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  resourceToEdit?: GameResourceEntry | null;
}

function ResourceEditorModal({ isOpen, onClose, gameId, resourceToEdit }: ResourceEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addGameResource, updateGameResource } = useDashboardStore();

  const [name, setName] = useState(resourceToEdit?.name ?? "");
  const [url, setUrl] = useState(resourceToEdit?.url ?? "");
  const [icon, setIcon] = useState(resourceToEdit?.icon ?? "");
  const [category, setCategory] = useState(resourceToEdit?.category ?? "Other");
  const [description, setDescription] = useState(resourceToEdit?.description ?? "");
  const [enabled, setEnabled] = useState(resourceToEdit?.enabled ?? true);
  const [urlError, setUrlError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setName(resourceToEdit?.name ?? "");
      setUrl(resourceToEdit?.url ?? "");
      setIcon(resourceToEdit?.icon ?? "");
      setCategory(resourceToEdit?.category ?? "Other");
      setDescription(resourceToEdit?.description ?? "");
      setEnabled(resourceToEdit?.enabled ?? true);
      setUrlError("");
    }
  }, [isOpen, resourceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    if (!isValidUrl(url.trim())) {
      setUrlError("Must be a valid URL starting with http:// or https://");
      return;
    }

    const payload: GameResourceEntry = {
      id: resourceToEdit?.id || `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gameId,
      name: name.trim(),
      url: url.trim(),
      icon: icon.trim() || undefined,
      category,
      description: description.trim() || undefined,
      enabled,
    };

    if (resourceToEdit) {
      await updateGameResource(resourceToEdit.id, payload);
    } else {
      await addGameResource(payload);
    }
    onClose();
  };

  const inputStyle = {
    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
    color: isCyber ? "#F8FAFC" : "#0F172A",
    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
    borderWidth: isCyber ? "1px" : "2px",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    outline: "none",
    width: "100%",
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          paddingLeft: "calc(var(--sidebar-width, 0px) + 0.75rem)",
          transition: "padding-left 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl p-6 space-y-4 relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFFFFF",
            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "3px solid #000",
            boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "6px 6px 0 #000",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base theme-text-primary">
              {resourceToEdit ? "Edit Resource Link" : "Add External Resource"}
            </h3>
            <button onClick={onClose} className="text-xl theme-text-muted cursor-pointer hover:opacity-70">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold theme-text-muted mb-1 block uppercase tracking-wider">Resource Name *</label>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Prydwen Tier List" required />
            </div>

            <div>
              <label className="text-xs font-bold theme-text-muted mb-1 block uppercase tracking-wider">URL *</label>
              <input style={inputStyle} value={url} onChange={(e) => { setUrl(e.target.value); setUrlError(""); }} placeholder="https://" required />
              {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold theme-text-muted mb-1 block uppercase tracking-wider">Icon (Emoji)</label>
                <input style={inputStyle} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🔗" maxLength={4} />
              </div>
              <div>
                <label className="text-xs font-bold theme-text-muted mb-1 block uppercase tracking-wider">Category</label>
                <select
                  style={inputStyle}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="cursor-pointer"
                >
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold theme-text-muted mb-1 block uppercase tracking-wider">Description</label>
              <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Meta rankings & equipment guides" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="resourceEnabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <label htmlFor="resourceEnabled" className="text-xs font-bold theme-text-primary cursor-pointer">
                Enabled (visible on dossier)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold border theme-text-muted cursor-pointer"
                style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black cursor-pointer text-white"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFF",
                  border: isCyber ? "none" : "2px solid #000",
                  boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                }}
              >
                Save Resource
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GameDossierPage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { confirm } = useConfirm();
  const games = useDashboardStore((s) => s.games) || [];
  const dossierCharacters = useDashboardStore((s) => s.dossierCharacters) || [];
  const gameResources = useDashboardStore((s) => s.gameResources) || [];
  const gameShowcaseItems = useDashboardStore((s) => s.gameShowcaseItems) || [];
  const { removeGameResource, removeDossierCharacter, removeGameShowcaseItem, syncAllGameCharactersMetadata } = useDashboardStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const currentGame = games.find((g) => g.id === gameId) || games.find((g) => g.game.toLowerCase().replace(/[^a-z0-9]/g, "") === gameId.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const gameTitle = currentGame?.game || "Game";
  const accent = currentGame?.accentColor || "#FF6B35";
  const iconRes = resolveGameIcon(gameTitle, currentGame?.icon);
  const dossierConfig = getGameDossierConfig(gameTitle, currentGame?.category);
  const elementSystem = dossierConfig.elementSystem;

  const handleSyncAllData = async () => {
    if (!currentGame || isBulkSyncing) return;
    setIsBulkSyncing(true);
    try {
      const res = await syncAllGameCharactersMetadata(currentGame.id);
      if (res && res.summary) {
        const { processed, updated, current, created, errors } = res.summary;
        if (errors > 0) {
          toastError(`Sync Complete with errors: ${processed} processed, ${updated} updated, ${current} current, ${created} created, ${errors} error(s).`);
        } else if (updated > 0 || created > 0) {
          toastSuccess(`Sync Complete: ${processed} characters processed (${updated} updated, ${current} already current, ${created} created, 0 errors).`);
        } else {
          toastSuccess(`Sync Complete: All ${processed} character(s) already up-to-date (0 updated, 0 errors).`);
        }
      } else {
        toastError("Failed to sync character metadata.");
      }
    } catch (err: any) {
      toastError(`Sync failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleDeleteDossierChar = (char: DossierCharacterEntry) => {
    const gameCharacters = useDashboardStore.getState().gameCharacters || [];
    const isFav = gameCharacters.some(
      (gc) =>
        gc.characterId === char.id ||
        (gc.name.toLowerCase() === char.name.toLowerCase() &&
          (gc.gameId === char.gameId || (currentGame && gc.gameName?.toLowerCase() === currentGame.game.toLowerCase())))
    );

    confirm({
      title: `Delete ${char.name}?`,
      message: isFav
        ? `This character is favourited. Deleting this character will also unlink the favourite profile.`
        : `Are you sure you want to remove ${char.name} from this game's dossier?`,
      variant: "danger",
      itemPreview: {
        title: char.name,
        subtitle: char.category,
        description: `Win Rate: ${char.winRate}% • Matches: ${char.matches}`,
      },
      onConfirm: async () => {
        await removeDossierCharacter(char.id);
      },
      successToast: `Deleted ${char.name}`,
    });
  };

  const handleDeleteResource = (res: GameResourceEntry) => {
    confirm({
      title: `Delete Resource Link?`,
      message: `Are you sure you want to delete ${res.name}?`,
      variant: "danger",
      itemPreview: {
        title: res.name,
        subtitle: res.category,
        description: res.url,
      },
      onConfirm: async () => {
        await removeGameResource(res.id);
      },
      successToast: `Deleted ${res.name}`,
    });
  };

  const handleDeleteShowcase = (item: GameShowcaseEntry) => {
    confirm({
      title: `Delete Showcase Entry?`,
      message: `Are you sure you want to delete ${item.title}?`,
      variant: "danger",
      itemPreview: {
        title: item.title,
        subtitle: item.category,
        description: item.description,
      },
      onConfirm: async () => {
        await removeGameShowcaseItem(item.id);
      },
      successToast: `Deleted ${item.title}`,
    });
  };

  // Modal States
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DossierCharacterEntry | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<DossierCharacterEntry | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<GameResourceEntry | null>(null);
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
  const [editingShowcaseItem, setEditingShowcaseItem] = useState<GameShowcaseEntry | null>(null);

  // Active Filters
  const [selectedElement, setSelectedElement] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showcaseCategoryFilter, setShowcaseCategoryFilter] = useState<string>("ALL");
  const [showcaseTagFilter, setShowcaseTagFilter] = useState<string>("ALL");

  // Filter dossier characters for this specific game with combined dual category filters (Unconditional Hook Execution)
  const rawGameCharacters = useMemo(
    () => (currentGame ? dossierCharacters.filter((c) => c.gameId === currentGame.id) : []),
    [dossierCharacters, currentGame?.id]
  );

  const filteredCharacters = useMemo(() => {
    if (!currentGame) return [];
    return rawGameCharacters.filter((char) => {
      // 1. Element filter
      if (selectedElement !== "ALL") {
        const charElem = getCanonicalGameCharacterElement(char);
        const targetEl = elementSystem?.elements.find(
          (e) => e.name.toLowerCase() === selectedElement.toLowerCase() || e.id.toLowerCase() === selectedElement.toLowerCase()
        );
        if (targetEl) {
          if (!matchGameElement(charElem, targetEl)) {
            return false;
          }
        } else {
          if (!charElem || !charElem.toLowerCase().includes(selectedElement.toLowerCase())) {
            return false;
          }
        }
      }

      // 2. Category / Path filter
      if (selectedCategory !== "ALL") {
        const charCat = (char.category || "").toLowerCase();
        const charPath = (char.path || "").toLowerCase();
        const charRole = (char.role || "").toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        const matches =
          charCat === selCat ||
          charCat.includes(selCat) ||
          charPath === selCat ||
          charPath.includes(selCat) ||
          charRole === selCat ||
          charRole.includes(selCat);
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [rawGameCharacters, selectedElement, selectedCategory, currentGame, elementSystem]);

  if (!currentGame) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <div className="text-5xl">🎮</div>
          <h2 className="text-2xl font-black theme-text-primary">Game Dossier Not Found</h2>
          <p className="text-sm theme-text-muted max-w-md">
            The requested game may have been removed or does not exist in your Games Library.
          </p>
          <Link
            href="/heroes"
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all"
          >
            ← Back to Game Database
          </Link>
        </div>
      </AppShell>
    );
  }

  // Filter showcase gallery items for this specific game
  const rawShowcaseItems = gameShowcaseItems.filter((i) => i.gameId === currentGame.id);
  const filteredShowcaseItems = rawShowcaseItems.filter((item) => {
    if (showcaseCategoryFilter !== "ALL" && item.category !== showcaseCategoryFilter) return false;
    if (showcaseTagFilter !== "ALL" && (!item.tags || !item.tags.includes(showcaseTagFilter))) return false;
    return true;
  });

  // Extract unique tags for showcase filter pills
  const allShowcaseTags = Array.from(
    new Set(rawShowcaseItems.flatMap((i) => i.tags || []))
  ).filter(Boolean);

  // Game-specific resources
  const allGameResources = gameResources.filter((r) => r.gameId === currentGame.id);

  // Metrics
  const totalMatches = rawGameCharacters.reduce((sum, c) => sum + (c.matches || 0), 0);
  const avgWinrate = rawGameCharacters.length > 0
    ? Math.round(rawGameCharacters.reduce((sum, c) => sum + (c.winRate || 0), 0) / rawGameCharacters.length)
    : 0;

  // Element character counts
  const elementCharCounts: Record<string, number> = {};
  if (elementSystem) {
    for (const el of elementSystem.elements) {
      elementCharCounts[el.id] = rawGameCharacters.filter((c) =>
        matchGameElement(getCanonicalGameCharacterElement(c), el)
      ).length;
    }
  }

  const btnBase: React.CSSProperties = {
    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFFFFF",
    color: isCyber ? "#00F5FF" : "#1A1A1A",
    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
  };

  return (
    <AppShell>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/heroes"
            className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            style={btnBase}
          >
            <span>←</span> Back to Game Database
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                color: isCyber ? "#00F5FF" : "#854D0E",
                border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>📷</span> Scan Screenshot
            </button>
            <button
              onClick={() => {
                setEditingShowcaseItem(null);
                setIsShowcaseModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isCyber ? "rgba(191,95,255,0.15)" : "#E0F2FE",
                color: isCyber ? "#BF5FFF" : "#0369A1",
                border: isCyber ? "1px solid rgba(191,95,255,0.4)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>🖼️</span> Upload Showcase
            </button>
            <button
              onClick={() => setIsGameModalOpen(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                color: isCyber ? "#94A3B8" : "#475569",
                border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              <span>⚙️</span> Edit Game
            </button>
            <button
              onClick={() => {
                setEditingCharacter(null);
                setIsCharModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
              style={{
                background: isCyber ? `linear-gradient(135deg, ${accent}, #00F5FF)` : accent,
                color: "#FFFFFF",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? `0 0 15px ${accent}60` : "3px 3px 0 #000",
              }}
            >
              <span>✨</span> Add {dossierConfig.characterLabel}
            </button>
          </div>
        </div>

        {/* ── Executive Game Dossier Header Banner ── */}
        <motion.div variants={cardVariants} className="relative">
          <BentoCard id="game-dossier-header" className="relative overflow-hidden p-6 md:p-8">
            {isCyber && (
              <div
                className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-[90px] opacity-20 pointer-events-none"
                style={{ backgroundColor: accent }}
              />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Game Icon & Identity */}
              <div className="flex items-center gap-5 min-w-0">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 select-none shadow-md overflow-hidden relative"
                  style={{
                    backgroundColor: isCyber ? `${accent}25` : (iconRes.isImage ? "#0B0F19" : accent),
                    border: isCyber ? `1.5px solid ${accent}70` : "3px solid #000",
                    boxShadow: isCyber ? `0 0 20px ${accent}40` : "4px 4px 0 #000",
                  }}
                >
                  {iconRes.isImage ? (
                    <img src={iconRes.iconUrl} alt={gameTitle} className="w-full h-full object-cover p-1.5" />
                  ) : (
                    <span>{iconRes.fallbackEmoji || "🎮"}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${accent}20`,
                        color: isCyber ? accent : "#1A1A1A",
                        border: `1px solid ${accent}`,
                      }}
                    >
                      {dossierConfig.gameType}
                    </span>
                    {currentGame.rank && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/40">
                        🏆 {currentGame.rank}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-4xl font-black theme-text-primary tracking-tight leading-none mt-2">
                    {gameTitle}
                  </h1>

                  <div className="flex items-center gap-4 mt-2 text-xs font-mono theme-text-muted flex-wrap">
                    <span>Platform: <strong className="theme-text-primary">{currentGame.platform}</strong></span>
                    {currentGame.handle && (
                      <div className="flex items-center gap-1.5">
                        <span>IGN/UID:</span>
                        <GameUidBadge
                          handle={currentGame.handle}
                          profileLink={currentGame.profileLink}
                          isCyber={isCyber}
                          accentColor={accent}
                          size="sm"
                        />
                      </div>
                    )}
                    {currentGame.mainCharacter && (
                      <span>Primary Main: <strong style={{ color: accent }}>{currentGame.mainCharacter}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Quick Stats */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                {[
                  { label: "Roster", value: rawGameCharacters.length, color: undefined },
                  { label: "Avg Winrate", value: `${avgWinrate}%`, color: avgWinrate >= 60 ? "#10B981" : accent },
                  { label: "Matches", value: totalMatches, color: undefined },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-xl text-center border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                    }}
                  >
                    <p className="text-[10px] font-mono font-bold theme-text-muted uppercase">{stat.label}</p>
                    <p className="text-xl font-black mt-0.5" style={{ color: stat.color || undefined }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Landscape Screenshot */}
            {currentGame.screenshot && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold theme-text-secondary flex items-center gap-1.5">
                    <span>🖼️</span> LANDSCAPE PROFILE SCREENSHOT
                  </span>
                  <button
                    onClick={() => setLightboxImage(currentGame.screenshot || null)}
                    className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                  >
                    View Fullscreen 🔍
                  </button>
                </div>
                <div
                  onClick={() => setLightboxImage(currentGame.screenshot || null)}
                  className="relative rounded-2xl overflow-hidden aspect-video w-full max-h-72 border cursor-pointer group transition-all"
                  style={{
                    borderColor: isCyber ? `${accent}50` : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? `0 0 15px ${accent}25` : "4px 4px 0 #000",
                  }}
                >
                  <img
                    src={currentGame.screenshot}
                    alt={`${gameTitle} Profile Screenshot`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-xs gap-2">
                    <span>🔍 Click to View Fullscreen Lightbox</span>
                  </div>
                </div>
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* ── External Resources Section ── */}
        <motion.div variants={cardVariants} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-black theme-text-primary flex items-center gap-2">
              🔗 External Resources
            </h2>
            <button
              onClick={() => { setEditingResource(null); setIsResourceModalOpen(true); }}
              className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FEF08A",
                color: isCyber ? "#00F5FF" : "#854D0E",
                border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              + Add Resource
            </button>
          </div>

          {allGameResources.length === 0 ? (
            <div
              className="p-5 rounded-2xl border text-center"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,30,0.5)" : "#FAFAFA",
                borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
                borderWidth: isCyber ? "1px" : "2px",
                boxShadow: isCyber ? "none" : "3px 3px 0 #000",
              }}
            >
              <p className="text-xs theme-text-muted font-mono">
                No external resources configured. Use <strong>+ Add Resource</strong> to configure links for this game.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {allGameResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl p-4 border flex flex-col gap-2 relative group"
                  style={{
                    backgroundColor: isCyber
                      ? (res.enabled ? "rgba(10,15,30,0.8)" : "rgba(10,15,30,0.3)")
                      : (res.enabled ? "#FFFFFF" : "#F0F0F0"),
                    borderColor: isCyber
                      ? (res.enabled ? "rgba(0,245,255,0.25)" : "rgba(255,255,255,0.08)")
                      : "#000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber ? (res.enabled ? "0 0 10px rgba(0,245,255,0.1)" : "none") : "3px 3px 0 #000",
                    opacity: res.enabled ? 1 : 0.55,
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center text-lg">
                        {res.icon && (res.icon.startsWith("http") || res.icon.startsWith("data:") || res.icon.startsWith("/")) ? (
                          <img src={res.icon} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <span>{res.icon && res.icon.length <= 8 && !res.icon.includes("base64") ? res.icon : "🔗"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm theme-text-primary leading-tight truncate">{res.name}</p>
                        {res.category && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono mt-0.5 inline-block"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)",
                              color: isCyber ? "#00F5FF" : "#4A4A4A",
                            }}
                          >
                            {res.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit/Delete buttons */}
                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setEditingResource(res); setIsResourceModalOpen(true); }}
                        className="p-1.5 rounded-lg text-xs hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDeleteResource(res)}
                        className="p-1.5 rounded-lg text-xs hover:bg-red-500/20 cursor-pointer"
                        title="Delete"
                      >🗑️</button>
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-[11px] theme-text-muted leading-relaxed line-clamp-2">{res.description}</p>
                  )}

                  {/* Open button */}
                  {res.enabled && (
                    <a
                      href={isValidUrl(res.url) ? res.url : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 px-3 py-1.5 rounded-xl font-bold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : accent,
                        color: isCyber ? "#00F5FF" : "#FFF",
                        border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                        boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.2)" : "2px 2px 0 #000",
                      }}
                    >
                      Open ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Dynamic Category & Element Filtering Section ── */}
        <motion.div variants={cardVariants} className="pt-2">
          <BentoCard id="game-category-filter-panel" className="p-5 md:p-6">
            <InteractiveCategoryFilter
              gameTitle={gameTitle}
              gameCategory={currentGame.category}
              characters={rawGameCharacters}
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

        {/* ── Character Collection Section (Statistics Scanner Roster) ── */}
        <motion.div variants={cardVariants} className="space-y-4 pt-2">
          <BentoCard id="character-collection-roster" className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
                  <span>🗂️</span> Character Collection ({filteredCharacters.length})
                </h2>
                <p className="text-xs theme-text-muted font-mono mt-0.5">
                  Interactive character roster for {gameTitle} with real-time element and category filtering
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSyncAllData}
                  disabled={isBulkSyncing}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: isCyber ? "rgba(168,85,247,0.15)" : "#E9D5FF",
                    color: isCyber ? "#C084FC" : "#6B21A8",
                    border: isCyber ? "1px solid rgba(168,85,247,0.4)" : "2px solid #000",
                    boxShadow: isCyber ? "0 0 10px rgba(168,85,247,0.2)" : "2px 2px 0 #000",
                  }}
                  title="Synchronize all Character Collection metadata from authoritative Game Characters"
                >
                  <span>{isBulkSyncing ? "⏳" : "🔄"}</span>
                  <span>{isBulkSyncing ? "Syncing..." : "Sync All Data"}</span>
                </button>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <span>📷</span> Scan Screenshot
                </button>
                <button
                  onClick={() => {
                    setEditingCharacter(null);
                    setIsCharModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  + Add {dossierConfig.characterLabel}
                </button>
              </div>
            </div>

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
                <p className="text-xs theme-text-muted max-w-sm mx-auto">
                  Try selecting another Element or Class, or reset your active filters to view your roster.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedElement("ALL");
                      setSelectedCategory("ALL");
                    }}
                    className="px-4 py-2 rounded-xl font-extrabold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                  >
                    Reset All Filters ↺
                  </button>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2 rounded-xl font-bold text-xs"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
                      color: isCyber ? "#00F5FF" : "#0369A1",
                      border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                    }}
                  >
                    📷 Scan Screenshot
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <AnimatePresence mode="popLayout">
                  {filteredCharacters.map((char) => (
                    <DossierCharacterCard
                      key={char.id}
                      character={char}
                      gameTitle={gameTitle}
                      gameCategory={currentGame.category}
                      onSelect={(c) => setPreviewCharacter(c)}
                      onEdit={(c) => {
                        setEditingCharacter(c);
                        setIsCharModalOpen(true);
                      }}
                      onDelete={(c) => handleDeleteDossierChar(c)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* ── 2. NEW SECTION: 🖼 Showcase Gallery (Directly below Statistics Scanner) ── */}
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
                <span>🖼 Showcase Gallery</span>
              </h2>
              <p className="text-xs theme-text-muted font-mono mt-0.5">
                Personal showcase memories, lucky pulls, team builds, PvP moments, and achievements for {gameTitle}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setEditingShowcaseItem(null);
                  setIsShowcaseModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                style={{
                  backgroundColor: isCyber ? "rgba(191,95,255,0.15)" : "#E0F2FE",
                  color: isCyber ? "#BF5FFF" : "#0369A1",
                  border: isCyber ? "1px solid rgba(191,95,255,0.4)" : "2px solid #000",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                }}
              >
                <span>+</span> Add Showcase
              </button>
              <span className="text-xs font-mono theme-text-muted">
                {rawShowcaseItems.length} {rawShowcaseItems.length === 1 ? "memory" : "memories"}
              </span>
            </div>
          </div>

          {/* Category & Tag Filter Pills for Showcase Gallery */}
          {rawShowcaseItems.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="theme-text-muted font-bold">Filter:</span>
              <button
                onClick={() => { setShowcaseCategoryFilter("ALL"); setShowcaseTagFilter("ALL"); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  showcaseCategoryFilter === "ALL" && showcaseTagFilter === "ALL"
                    ? "bg-amber-500 text-black border-2 border-black font-extrabold"
                    : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                }`}
              >
                All Showcase ({rawShowcaseItems.length})
              </button>

              {/* Tag filters */}
              {allShowcaseTags.map((tag) => {
                const isSelected = showcaseTagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setShowcaseTagFilter(isSelected ? "ALL" : tag);
                      setShowcaseCategoryFilter("ALL");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500 text-black border-2 border-black font-extrabold"
                        : "theme-text-muted hover:theme-text-primary bg-black/10 dark:bg-white/5"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* Gallery Items Grid / Empty State */}
          {filteredShowcaseItems.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-3"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                borderWidth: isCyber ? "1px" : "2.5px",
                boxShadow: isCyber ? "none" : "4px 4px 0 #000",
              }}
            >
              <div className="text-4xl">🖼️</div>
              <h3 className="font-black text-base theme-text-primary">No memories have been added yet</h3>
              <p className="text-xs theme-text-muted max-w-sm mx-auto">
                Upload your first screenshot to start documenting your journey for {gameTitle}.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => { setEditingShowcaseItem(null); setIsShowcaseModalOpen(true); }}
                  className="px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  <span>🖼️</span> Upload Screenshot
                </button>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  <span>📷</span> Scan Screenshot
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredShowcaseItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  custom={index}
                  layout
                  className="rounded-2xl border overflow-hidden flex flex-col relative group transition-all"
                  style={{
                    backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
                    borderColor: isCyber ? (item.isFavorite ? "#FACC15" : "rgba(0,245,255,0.25)") : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber
                      ? (item.isFavorite ? "0 0 20px rgba(250,204,21,0.25)" : "0 0 12px rgba(0,245,255,0.12)")
                      : "4px 4px 0 #000000",
                  }}
                >
                  {/* Top Badges overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
                    {item.category ? (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm pointer-events-auto"
                        style={{
                          backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "rgba(255,255,255,0.9)",
                          color: isCyber ? "#00F5FF" : "#1A1A1A",
                          border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "1.5px solid #000",
                        }}
                      >
                        {item.category}
                      </span>
                    ) : <div />}

                    {item.isFavorite && (
                      <span className="text-xs bg-amber-500/90 text-black px-2 py-0.5 rounded-md font-bold shadow-sm pointer-events-auto">
                        ⭐ Pinned
                      </span>
                    )}
                  </div>

                  {/* Action Buttons (Edit + Delete) */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingShowcaseItem(item);
                        setIsShowcaseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-black/70 text-white backdrop-blur-md hover:bg-black transition-colors cursor-pointer text-xs"
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteShowcase(item);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/80 text-white backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer text-xs"
                      title="Delete Item"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Showcase Image container */}
                  <div
                    onClick={() => setLightboxImage(item.imageUrl)}
                    className="relative aspect-video w-full overflow-hidden bg-black/30 cursor-pointer group/img"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center font-bold text-white text-xs gap-1.5">
                      <span>🔍 Fullscreen View</span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="font-black text-sm theme-text-primary leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs theme-text-muted mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono theme-text-muted">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowcaseTagFilter(showcaseTagFilter === tag ? "ALL" : tag);
                              }}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))
                        ) : (
                          <span className="opacity-50">#showcase</span>
                        )}
                      </div>

                      {/* Date */}
                      {item.createdAt && (
                        <span className="text-[10px] opacity-70">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Modals & Lightbox ── */}
        <DossierCharacterEditorModal
          isOpen={isCharModalOpen}
          onClose={() => setIsCharModalOpen(false)}
          gameId={currentGame.id}
          gameTitle={gameTitle}
          gameCategory={currentGame.category}
          characterToEdit={editingCharacter}
        />

        <GameEditorModal
          isOpen={isGameModalOpen}
          onClose={() => setIsGameModalOpen(false)}
          gameToEdit={currentGame}
        />

        <GameScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          gameId={currentGame.id}
          gameTitle={gameTitle}
          gameCategory={currentGame.category}
        />

        <ShowcaseEditorModal
          isOpen={isShowcaseModalOpen}
          onClose={() => { setIsShowcaseModalOpen(false); setEditingShowcaseItem(null); }}
          gameId={currentGame.id}
          gameTitle={gameTitle}
          itemToEdit={editingShowcaseItem}
        />

        <ImageLightboxModal
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage || ""}
          title={`${gameTitle} Showcase`}
        />

        <ResourceEditorModal
          isOpen={isResourceModalOpen}
          onClose={() => { setIsResourceModalOpen(false); setEditingResource(null); }}
          gameId={currentGame.id}
          resourceToEdit={editingResource}
        />

        <CharacterPreviewModal
          isOpen={!!previewCharacter}
          onClose={() => setPreviewCharacter(null)}
          character={previewCharacter}
          onEdit={(c) => { setEditingCharacter(c); setIsCharModalOpen(true); }}
          onDelete={(c) => handleDeleteDossierChar(c)}
        />
      </motion.div>
    </AppShell>
  );
}
