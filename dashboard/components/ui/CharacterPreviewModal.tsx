"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { DossierCharacterEntry, useDashboardStore, CharacterLinkValue } from "@/lib/store/dashboardStore";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { resolveLinkDetails } from "@/lib/data/initialDossierCharacters";
import { useContextMenu } from "@/hooks/useContextMenu";
import { isImageUrl } from "@/lib/utils/mediaResolver";

interface CharacterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: DossierCharacterEntry | null;
  onEdit?: (character: DossierCharacterEntry) => void;
  onDelete?: (character: DossierCharacterEntry) => void;
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export function CharacterPreviewModal({
  isOpen,
  onClose,
  character,
  onEdit,
  onDelete,
}: CharacterPreviewModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { games, updateDossierCharacter } = useDashboardStore();
  const { openContextMenu } = useContextMenu();

  // Inline Link Editing Dialog State
  const [editingLinkKey, setEditingLinkKey] = useState<string | null>(null);
  const [editingLinkUrl, setEditingLinkUrl] = useState<string>("");
  const [linkError, setLinkError] = useState<string>("");

  if (!character) return null;

  const parentGame = games.find((g) => g.id === character.gameId);
  const resolvedGameTitle = parentGame?.game || "Game";
  const config = getGameDossierConfig(resolvedGameTitle, parentGame?.category);

  // Find element system info if available
  const elementSystem = config.elementSystem;
  const elementItem = elementSystem?.elements.find(
    (el) =>
      el.name.toLowerCase() === character.role?.toLowerCase() ||
      el.id.toLowerCase() === character.role?.toLowerCase()
  );

  // Find category info
  const categoryItem = config.categories.find(
    (c) =>
      c.name.toLowerCase() === character.category?.toLowerCase() ||
      c.id.toLowerCase() === character.category?.toLowerCase()
  );

  const accent = character.accentColor || elementItem?.color || parentGame?.accentColor || "#00F5FF";

  // Generate fallback external links if missing
  const charNameSlug = encodeURIComponent(character.name);
  const gameLower = resolvedGameTitle.toLowerCase();

  const defaultFallbackLinks: Record<string, string> = {
    wiki: gameLower.includes("star rail")
      ? `https://honkai-star-rail.fandom.com/wiki/${charNameSlug}`
      : gameLower.includes("genshin")
      ? `https://genshin-impact.fandom.com/wiki/${charNameSlug}`
      : gameLower.includes("wuthering")
      ? `https://wutheringwaves.fandom.com/wiki/${charNameSlug}`
      : gameLower.includes("league")
      ? `https://leagueoflegends.fandom.com/wiki/${charNameSlug}`
      : gameLower.includes("valorant")
      ? `https://valorant.fandom.com/wiki/${charNameSlug}`
      : gameLower.includes("mobile legends")
      ? `https://mobile-legends.fandom.com/wiki/${charNameSlug}`
      : `https://google.com/search?q=${charNameSlug}+${encodeURIComponent(resolvedGameTitle)}+wiki`,

    build: gameLower.includes("star rail") || gameLower.includes("zenless")
      ? `https://www.prydwen.gg/star-rail/characters/${character.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
      : gameLower.includes("genshin")
      ? `https://keqingmains.com/?s=${charNameSlug}`
      : gameLower.includes("league")
      ? `https://u.gg/lol/champions/${character.name.toLowerCase().replace(/[^a-z0-9]/g, "")}/build`
      : gameLower.includes("mobile legends")
      ? `https://mlbb.ninja/`
      : `https://google.com/search?q=${charNameSlug}+${encodeURIComponent(resolvedGameTitle)}+best+build`,

    official: gameLower.includes("honkai") || gameLower.includes("genshin") || gameLower.includes("zenless")
      ? "https://www.hoyolab.com/"
      : parentGame?.profileLink || `https://google.com/search?q=${encodeURIComponent(resolvedGameTitle)}+official`,

    guide: `https://www.youtube.com/results?search_query=${charNameSlug}+${encodeURIComponent(resolvedGameTitle)}+guide`,
    gallery: `https://google.com/search?tbm=isch&q=${charNameSlug}+${encodeURIComponent(resolvedGameTitle)}+wallpaper`,
    youtube: `https://www.youtube.com/results?search_query=${charNameSlug}+${encodeURIComponent(resolvedGameTitle)}`,
  };

  const handleToggleFavorite = async () => {
    await updateDossierCharacter(character.id, {
      isFavorite: !character.isFavorite,
    });
  };

  // Dedicated Link Button Context Menu Handler
  const handleLinkContextMenu = (
    e: React.MouseEvent,
    key: string,
    label: string,
    defaultFallback: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const linkVal = character.links?.[key];
    const { activeUrl, defaultUrl, customUrl, isDisabled } = resolveLinkDetails(linkVal, defaultFallback);

    openContextMenu(
      e,
      [
        {
          id: "open-tab",
          label: `Open in New Tab`,
          icon: "↗",
          disabled: isDisabled,
          onClick: () => window.open(activeUrl, "_blank"),
        },
        {
          id: "copy-url",
          label: `Copy URL`,
          icon: "📋",
          onClick: () => {
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(activeUrl).catch(() => {});
            }
          },
        },
        {
          id: "edit-url",
          label: `Edit URL`,
          icon: "✏️",
          onClick: () => {
            setEditingLinkKey(key);
            setEditingLinkUrl(customUrl || defaultUrl);
            setLinkError("");
          },
        },
        {
          id: "reset-url",
          label: `Reset to Default`,
          icon: "↺",
          disabled: !customUrl,
          onClick: async () => {
            const updatedLinks = { ...(character.links || {}) };
            const currentVal = updatedLinks[key];
            if (typeof currentVal === "object" && currentVal !== null) {
              delete (currentVal as any).customUrl;
            } else {
              delete updatedLinks[key];
            }
            await updateDossierCharacter(character.id, { links: updatedLinks });
          },
        },
        {
          id: "toggle-disable",
          label: isDisabled ? `Enable Link` : `Disable Link`,
          icon: isDisabled ? "✅" : "🚫",
          divider: true,
          onClick: async () => {
            const updatedLinks = { ...(character.links || {}) };
            const currentVal = updatedLinks[key];
            if (typeof currentVal === "object" && currentVal !== null) {
              updatedLinks[key] = {
                ...currentVal,
                isDisabled: !isDisabled,
              };
            } else {
              updatedLinks[key] = {
                defaultUrl,
                customUrl: typeof currentVal === "string" ? currentVal : undefined,
                isDisabled: !isDisabled,
              };
            }
            await updateDossierCharacter(character.id, { links: updatedLinks });
          },
        },
      ],
      `${character.name} — ${label}`
    );
  };

  const handleSaveEditedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLinkKey) return;

    const trimmedUrl = editingLinkUrl.trim();
    if (trimmedUrl && !isValidHttpUrl(trimmedUrl)) {
      setLinkError("URL must start with http:// or https://");
      return;
    }

    const defaultFallback = defaultFallbackLinks[editingLinkKey] || "";
    const updatedLinks = { ...(character.links || {}) };
    const currentVal = updatedLinks[editingLinkKey];

    if (typeof currentVal === "object" && currentVal !== null) {
      updatedLinks[editingLinkKey] = {
        ...currentVal,
        customUrl: trimmedUrl || undefined,
        lastEdited: new Date().toISOString(),
      };
    } else {
      updatedLinks[editingLinkKey] = {
        defaultUrl: typeof currentVal === "string" ? currentVal : defaultFallback,
        customUrl: trimmedUrl || undefined,
        lastEdited: new Date().toISOString(),
      };
    }

    await updateDossierCharacter(character.id, { links: updatedLinks });
    setEditingLinkKey(null);
    setEditingLinkUrl("");
    setLinkError("");
  };

  const renderLinkButton = (key: string, label: string, icon: string, defaultFallback: string) => {
    const linkVal = character.links?.[key];
    const { activeUrl, customUrl, isDisabled } = resolveLinkDetails(linkVal, defaultFallback);

    return (
      <div key={key} className="relative group">
        <a
          href={isDisabled ? undefined : activeUrl}
          target={isDisabled ? undefined : "_blank"}
          rel="noopener noreferrer"
          onContextMenu={(e) => handleLinkContextMenu(e, key, label, defaultFallback)}
          className={`p-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-between transition-all select-none ${
            isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer hover:scale-[1.02] active:scale-95"
          }`}
          style={{
            backgroundColor: isCyber
              ? customUrl
                ? "rgba(191,95,255,0.12)"
                : "rgba(0,245,255,0.08)"
              : customUrl
              ? "#FEF08A"
              : "#FFFFFF",
            color: isCyber
              ? customUrl
                ? "#BF5FFF"
                : "#00F5FF"
              : customUrl
              ? "#854D0E"
              : "#1A1A1A",
            borderColor: isCyber
              ? customUrl
                ? "rgba(191,95,255,0.4)"
                : "rgba(0,245,255,0.3)"
              : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? "none" : customUrl ? "2px 2px 0 #854D0E" : "2px 2px 0 #000000",
          }}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span>{icon}</span>
            <span className="truncate">{label}</span>
            {customUrl && <span className="text-[9px] px-1 bg-purple-500/20 rounded">EDITED</span>}
          </span>
          <span className="text-[10px] shrink-0 opacity-70">↗</span>
        </a>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl z-10 my-auto"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,30,0.95)" : "#FFFFFF",
              borderColor: isCyber ? `${accent}60` : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber ? `0 0 35px ${accent}30` : "6px 6px 0 #000000",
            }}
          >
            {/* Header Ambient Banner */}
            <div
              className="relative h-44 sm:h-52 w-full p-6 flex flex-col justify-end overflow-hidden"
              style={{
                background: isCyber
                  ? `linear-gradient(180deg, ${accent}30 0%, rgba(10,15,30,0.95) 100%)`
                  : `linear-gradient(180deg, ${accent}40 0%, #FFFFFF 100%)`,
              }}
            >
              {character.splashArt || character.avatarUrl ? (
                <img
                  src={character.splashArt || character.avatarUrl}
                  alt={character.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[2px] pointer-events-none"
                />
              ) : (
                <div
                  className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
                  style={{ backgroundColor: accent }}
                />
              )}

              {/* Close & Actions Bar */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-xl text-sm transition-transform active:scale-90 cursor-pointer backdrop-blur-md"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFFFFF",
                    border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
                  }}
                  title={character.isFavorite ? "Unstar Favorite" : "Star Favorite"}
                >
                  {character.isFavorite ? "⭐" : "☆"}
                </button>

                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(character);
                    }}
                    className="p-2 rounded-xl text-sm cursor-pointer backdrop-blur-md transition-transform active:scale-90"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFFFFF",
                      border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
                    }}
                    title="Edit Character"
                  >
                    ✏️
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-sm font-bold cursor-pointer transition-transform active:scale-90"
                  style={{
                    backgroundColor: isCyber ? "rgba(239,68,68,0.2)" : "#FEE2E2",
                    color: isCyber ? "#EF4444" : "#991B1B",
                    border: isCyber ? "1px solid rgba(239,68,68,0.4)" : "2px solid #000",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Title & Avatar Info */}
              <div className="flex items-end gap-4 relative z-10">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 font-black overflow-hidden border shadow-lg"
                  style={{
                    backgroundColor: `${accent}30`,
                    color: accent,
                    borderColor: isCyber ? accent : "#000000",
                    borderWidth: isCyber ? "2px" : "3px",
                  }}
                >
                  {character.avatarUrl ? (
                    <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{character.name.charAt(0)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: isCyber ? `${accent}25` : "#FEF08A",
                        color: isCyber ? accent : "#854D0E",
                        border: `1px solid ${accent}`,
                      }}
                    >
                      {resolvedGameTitle}
                    </span>
                    {character.rarity && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: isCyber ? "rgba(250,204,21,0.2)" : "#FEF08A",
                          color: isCyber ? "#FACC15" : "#854D0E",
                          border: isCyber ? "1px solid #FACC15" : "1px solid #000",
                        }}
                      >
                        {character.rarity}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black theme-text-primary truncate leading-tight mt-0.5">
                    {character.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Badges Grid */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                {character.role && (
                  <span
                    className="px-3 py-1 rounded-xl font-bold flex items-center gap-1.5"
                    style={{
                      backgroundColor: isCyber ? `${elementItem?.color || accent}20` : `${elementItem?.color || accent}1F`,
                      color: isCyber ? (elementItem?.color || accent) : "#1A1A1A",
                      border: `1.5px solid ${elementItem?.color || accent}`,
                    }}
                  >
                    {elementItem?.icon && isImageUrl(elementItem.icon) ? (
                      <img src={elementItem.icon} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <span>{elementItem?.icon && elementItem.icon.length <= 8 && !elementItem.icon.includes(";") ? elementItem.icon : "✦"}</span>
                    )}
                    <span>{character.role}</span>
                  </span>
                )}

                {character.category && (
                  <span
                    className="px-3 py-1 rounded-xl font-bold flex items-center gap-1.5"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                      color: isCyber ? "#94A3B8" : "#475569",
                      border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "1.5px solid #CBD5E1",
                    }}
                  >
                    {categoryItem?.icon && isImageUrl(categoryItem.icon) ? (
                      <img src={categoryItem.icon} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <span>{categoryItem?.icon && categoryItem.icon.length <= 8 && !categoryItem.icon.includes(";") ? categoryItem.icon : "📁"}</span>
                    )}
                    <span>{character.category}</span>
                  </span>
                )}

                {character.faction && (
                  <span className="px-3 py-1 rounded-xl font-bold bg-purple-500/15 text-purple-400 border border-purple-500/40">
                    🏛️ {character.faction}
                  </span>
                )}

                {character.nation && (
                  <span className="px-3 py-1 rounded-xl font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/40">
                    🌍 {character.nation}
                  </span>
                )}

                {character.weapon && (
                  <span className="px-3 py-1 rounded-xl font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40">
                    🗡️ {character.weapon}
                  </span>
                )}

                {character.releaseVersion && (
                  <span className="px-3 py-1 rounded-xl font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                    🚀 v{character.releaseVersion}
                  </span>
                )}
              </div>

              {/* Rich Metadata Inspection (Voice Actor, Birthday, Height, Affiliation, Illustrator) */}
              {(character.voiceActor || character.birthday || character.height || character.affiliation || character.illustrator || character.constellation) && (
                <div
                  className="p-4 rounded-2xl border text-xs grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  {character.voiceActor && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">🎙️ VOICE ACTOR</span>
                      <strong className="theme-text-primary">{character.voiceActor}</strong>
                    </div>
                  )}
                  {character.birthday && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">🎂 BIRTHDAY</span>
                      <strong className="theme-text-primary">{character.birthday}</strong>
                    </div>
                  )}
                  {character.height && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">📏 HEIGHT</span>
                      <strong className="theme-text-primary">{character.height}</strong>
                    </div>
                  )}
                  {character.affiliation && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">🏛️ AFFILIATION</span>
                      <strong className="theme-text-primary">{character.affiliation}</strong>
                    </div>
                  )}
                  {character.illustrator && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">🎨 ILLUSTRATOR</span>
                      <strong className="theme-text-primary">{character.illustrator}</strong>
                    </div>
                  )}
                  {character.constellation && (
                    <div>
                      <span className="theme-text-muted block text-[10px]">🌌 CONSTELLATION</span>
                      <strong className="theme-text-primary">{character.constellation}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Description / Lore */}
              {(character.description || character.notes) && (
                <div
                  className="p-4 rounded-2xl border text-xs leading-relaxed space-y-1"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <p className="font-bold theme-text-primary">Intelligence & Tactical Notes</p>
                  <p className="theme-text-muted">{character.description || character.notes}</p>
                </div>
              )}

              {/* Stats & Performance Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div
                  className="p-3 rounded-2xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  <span className="text-[10px] font-mono theme-text-muted block">WINRATE</span>
                  <strong className="text-base font-black text-emerald-400">
                    {character.winRate ?? 0}%
                  </strong>
                </div>

                <div
                  className="p-3 rounded-2xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  <span className="text-[10px] font-mono theme-text-muted block">MATCHES</span>
                  <strong className="text-base font-black theme-text-primary">
                    {character.matches ?? 0}
                  </strong>
                </div>

                <div
                  className="p-3 rounded-2xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                  }}
                >
                  <span className="text-[10px] font-mono theme-text-muted block">RANK / LEVEL</span>
                  <strong className="text-base font-black text-amber-400">
                    {character.levelRank || "N/A"}
                  </strong>
                </div>

                <div
                  className="p-3 rounded-2xl border"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                  }}
                >
                  <span className="text-[10px] font-mono theme-text-muted block">STARRED</span>
                  <strong className="text-base font-black text-amber-400">
                    {character.isFavorite ? "⭐ Starred" : "Standard"}
                  </strong>
                </div>
              </div>

              {/* Tags Array */}
              {character.tags && character.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {character.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono theme-text-muted border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Universal External Links System */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono theme-text-primary flex items-center gap-1.5">
                    <span>🌐</span> External Navigation Links
                  </h4>
                  <span className="text-[10px] font-mono theme-text-muted">
                    Right-click / Long press to edit link
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {renderLinkButton("wiki", "Wiki", "📖", defaultFallbackLinks.wiki)}
                  {renderLinkButton("build", "Build & Tier", "📊", defaultFallbackLinks.build)}
                  {renderLinkButton("official", "Official", "🏆", defaultFallbackLinks.official)}
                  {renderLinkButton("guide", "Guides", "🎥", defaultFallbackLinks.guide)}
                  {renderLinkButton("gallery", "Gallery", "🖼️", defaultFallbackLinks.gallery)}
                  {renderLinkButton("youtube", "YouTube", "▶️", defaultFallbackLinks.youtube)}
                </div>
              </div>
            </div>

            {/* Inline Link Edit Modal Overlay */}
            {editingLinkKey && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-6 flex items-center justify-center">
                <motion.form
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleSaveEditedLink}
                  className="w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl"
                  style={{
                    backgroundColor: isCyber ? "#0A0F1E" : "#FFFFFF",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "4px 4px 0 #000",
                  }}
                >
                  <div>
                    <h3 className="font-black text-base theme-text-primary flex items-center gap-2">
                      <span>✏️</span> Edit {editingLinkKey.toUpperCase()} Link URL
                    </h3>
                    <p className="text-xs theme-text-muted font-mono mt-1">
                      Provide a custom URL for {character.name}. Original default URL is preserved.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editingLinkUrl}
                      onChange={(e) => {
                        setEditingLinkUrl(e.target.value);
                        setLinkError("");
                      }}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                        color: isCyber ? "#F8FAFC" : "#0F172A",
                        borderColor: linkError
                          ? "#EF4444"
                          : isCyber
                          ? "rgba(0,245,255,0.3)"
                          : "#000000",
                      }}
                    />
                    {linkError && <p className="text-[11px] text-red-500 font-mono">{linkError}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingLinkKey(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border theme-text-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                    >
                      Save Custom URL
                    </button>
                  </div>
                </motion.form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
