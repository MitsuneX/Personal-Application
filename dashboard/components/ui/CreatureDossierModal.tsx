"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CreatureEntry, CreatureCharacterRef, getClassificationMeta, CREATURE_TIER_META } from "@/lib/data/creatureSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { RomanticLoveBurst, RomanticLoveBurstHandle } from "@/components/ui/RomanticLoveBurst";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";
import { CreatureFormCard } from "@/components/creatures/CreatureFormCard";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { Z_INDEX } from "@/components/ui/ViewportBoundary";

interface CreatureDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  creature: CreatureEntry | null;
  onEdit?: (creature: CreatureEntry) => void;
  /** Called when user clicks a derived/source creature to navigate to it */
  onOpenCreature?: (creature: CreatureEntry, formId?: string | null) => void;
  zIndex?: number;
  initialFormId?: string | null;
}

// ─── Helper: Grouped character type ───────────────────────────────────────────
interface GroupedCharacter {
  characterId: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  characterType: "character_dict" | "game_character";
  sourceTitle?: string;
  /** General (parent-creature) connection */
  generalRef?: CreatureCharacterRef;
  /** Form-specific connections belonging to this character */
  formRefs: Array<{ formName: string; formId: string; relationshipType?: string }>;
}

/** Groups flat connection arrays by characterId to prevent duplicate character cards. */
function groupCharacterConnections(
  generalConns: CreatureCharacterRef[],
  formConns: Array<CreatureCharacterRef & { formName: string; formId: string }>
): GroupedCharacter[] {
  const map = new Map<string, GroupedCharacter>();

  for (const c of generalConns) {
    const key = c.characterId;
    if (!map.has(key)) {
      map.set(key, {
        characterId: c.characterId,
        name: c.name,
        avatar: c.avatar,
        avatarUrl: c.avatarUrl,
        characterType: c.characterType,
        sourceTitle: c.sourceTitle,
        generalRef: c,
        formRefs: [],
      });
    } else {
      // Already grouped — just ensure generalRef is set
      map.get(key)!.generalRef = c;
    }
  }

  for (const c of formConns) {
    const key = c.characterId;
    if (!map.has(key)) {
      map.set(key, {
        characterId: c.characterId,
        name: c.name,
        avatar: c.avatar,
        avatarUrl: c.avatarUrl,
        characterType: c.characterType,
        sourceTitle: c.sourceTitle,
        formRefs: [{ formName: c.formName, formId: c.formId, relationshipType: c.relationshipType }],
      });
    } else {
      const entry = map.get(key)!;
      // Only add unique form refs
      if (!entry.formRefs.some((f) => f.formId === c.formId)) {
        entry.formRefs.push({ formName: c.formName, formId: c.formId, relationshipType: c.relationshipType });
      }
    }
  }

  return Array.from(map.values());
}

export function CreatureDossierModal({
  isOpen,
  onClose,
  creature,
  onEdit,
  onOpenCreature,
  zIndex = Z_INDEX.MODAL_NESTED,
  initialFormId = null,
}: CreatureDossierModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { toggleFavoriteCreature, bondCreature, creatures: allCreatures, hallOfFame, gameCharacters } = useDashboardStore();

  const loveBurstRef = useRef<RomanticLoveBurstHandle>(null);
  const favBurstRef = useRef<RomanticLoveBurstHandle>(null);

  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [highlightedFormId, setHighlightedFormId] = useState<string | null>(null);

  // ── Lineage: creatures derived FROM this creature (reverse lookup) ──────────
  const derivativeCreatures = useMemo(() => {
    if (!creature) return [];
    const creatureNameLower = creature.name.toLowerCase().trim();
    return allCreatures.flatMap((c) => {
      if (c.id === creature.id) return [];
      const matchingRefs = (c.derivedFrom || []).filter(
        (d) =>
          d.creatureId === creature.id ||
          (d.creatureName && d.creatureName.toLowerCase().trim() === creatureNameLower)
      );
      if (matchingRefs.length === 0) return [];
      return matchingRefs.map((ref) => ({
        creature: c,
        relationshipType: ref.relationshipType || "Derivative",
      }));
    });
  }, [allCreatures, creature]);

  // ── Lineage: source creatures this creature was derived FROM ────────────────
  const sourceCreatures = useMemo(() => {
    if (!creature || !creature.derivedFrom || creature.derivedFrom.length === 0) return [];
    return creature.derivedFrom
      .map((ref) => ({
        ref,
        entry:
          allCreatures.find(
            (c) =>
              c.id === ref.creatureId ||
              (ref.creatureName && c.name.toLowerCase().trim() === ref.creatureName.toLowerCase().trim())
          ) ?? null,
      }))
      .filter((x) => x.entry !== null) as Array<{ ref: (typeof creature.derivedFrom)[0]; entry: CreatureEntry }>;
  }, [allCreatures, creature]);

  // ── Main Creature Ownership: characters & game-chars that point to this creature ──
  const mainCreatureOwners = useMemo(() => {
    if (!creature) return { hofOwners: [], gcOwners: [] };
    const hofOwners = (hallOfFame || []).filter(
      (h) => h.mainCreatureId === creature.id ||
             ((h.details as any)?.mainCreatureId === creature.id)
    );
    const gcOwners = (gameCharacters || []).filter(
      (g) => g.mainCreatureId === creature.id ||
             (g.stats as any)?.mainCreatureId === creature.id
    );
    return { hofOwners, gcOwners };
  }, [hallOfFame, gameCharacters, creature]);

  // Scroll to and highlight targeted form if initialFormId is passed
  useEffect(() => {
    if (isOpen && initialFormId) {
      setHighlightedFormId(initialFormId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`creature-form-${initialFormId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
      const clearTimer = setTimeout(() => setHighlightedFormId(null), 4000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    } else {
      setHighlightedFormId(null);
    }
  }, [isOpen, initialFormId]);

  // Reset selected image on open
  useEffect(() => {
    if (creature) {
      setSelectedMediaUrl(
        creature.media.primary || creature.media.card || creature.media.gallery?.[0] || null
      );
    }
  }, [creature]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !creature) return null;

  const classificationMeta = getClassificationMeta(creature.classification);
  const tierMeta = CREATURE_TIER_META[creature.tier] || CREATURE_TIER_META.S;

  // Gallery strip
  const allMedia: { label: string; url: string }[] = [];
  if (creature.media.primary) allMedia.push({ label: "Primary Art", url: creature.media.primary });
  if (creature.media.card && creature.media.card !== creature.media.primary)
    allMedia.push({ label: "Card Poster", url: creature.media.card });
  if (creature.media.favouriteMoment)
    allMedia.push({ label: "Favourite Moment", url: creature.media.favouriteMoment });
  (creature.media.gallery || []).forEach((g, idx) => {
    if (g && !allMedia.some((m) => m.url === g))
      allMedia.push({ label: `Gallery ${idx + 1}`, url: g });
  });

  const activeDisplayUrl =
    selectedMediaUrl || creature.media.primary || creature.media.card || creature.media.gallery?.[0] || null;

  const handleBond = (e: React.MouseEvent) => {
    loveBurstRef.current?.trigger();
    triggerHeartEffect(e.clientX, e.clientY);
    bondCreature(creature.id);
  };

  const handleToggleFav = () => {
    favBurstRef.current?.trigger();
    toggleFavoriteCreature(creature.id);
  };

  // ── Build grouped character connections ────────────────────────────────────

  const generalDict = (creature.connectedCharacters || []).filter(
    (c) => c.characterType !== "game_character"
  );
  const formDict = (creature.forms || []).flatMap((f) =>
    (f.connectedCharacters || [])
      .filter((c) => c.characterType !== "game_character")
      .map((c) => ({ ...c, formName: f.displayName || f.name, formId: f.id }))
  );
  const groupedDictChars = groupCharacterConnections(generalDict, formDict);

  const generalGame = (creature.connectedCharacters || []).filter(
    (c) => c.characterType === "game_character"
  );
  const formGame = (creature.forms || []).flatMap((f) =>
    (f.connectedCharacters || [])
      .filter((c) => c.characterType === "game_character")
      .map((c) => ({ ...c, formName: f.displayName || f.name, formId: f.id }))
  );
  const groupedGameChars = groupCharacterConnections(generalGame, formGame);

  // ── Shared grouped character card renderer ─────────────────────────────────
  const renderGroupedCharCard = (group: GroupedCharacter, isGame: boolean) => {
    const accentClass = isGame
      ? isCyber ? "text-purple-300 bg-purple-500/20" : "bg-purple-100 text-purple-900 border border-purple-300"
      : isCyber ? "text-cyan-300 bg-cyan-500/20" : "bg-cyan-100 text-cyan-900 border border-cyan-300";

    return (
      <div
        key={group.characterId}
        className={`p-3 rounded-2xl border transition-all ${
          isCyber
            ? "bg-white/[0.04] border-white/10"
            : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
        }`}
      >
        {/* Character header row */}
        <div className="flex items-center gap-3">
          {group.avatar || group.avatarUrl ? (
            <img
              src={(group.avatar || group.avatarUrl)!}
              alt={group.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-xl">
              {isGame ? "🎮" : "👤"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-bold truncate">{group.name}</strong>
            <div className="flex items-center gap-1.5 text-[11px] opacity-75 mt-0.5 flex-wrap">
              {group.generalRef && (
                <span className={`px-1.5 rounded text-[10px] font-bold ${accentClass}`}>
                  {group.generalRef.relationshipType || "Companion"}
                </span>
              )}
              {group.sourceTitle && (
                <span className="truncate opacity-75">{group.sourceTitle}</span>
              )}
            </div>
          </div>
        </div>

        {/* Form-specific connection tree */}
        {group.formRefs.length > 0 && (
          <div className="mt-2.5 pl-3 space-y-1.5 border-l-2 border-violet-500/30">
            {group.formRefs.map((fr) => (
              <button
                key={fr.formId}
                type="button"
                onClick={() => {
                  setHighlightedFormId(fr.formId);
                  const el = document.getElementById(`creature-form-${fr.formId}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                  isCyber
                    ? "bg-violet-500/10 border-violet-500/20 hover:border-violet-400/50 text-slate-200"
                    : "bg-violet-50 border border-violet-300 hover:bg-violet-100 text-black"
                }`}
              >
                <span className="text-violet-400 text-[10px] shrink-0">✦</span>
                <span className="text-[11px] font-mono font-bold truncate">{fr.formName}</span>
                {fr.relationshipType && (
                  <span className={`text-[9px] font-mono px-1 rounded shrink-0 ${
                    isCyber ? "text-violet-300 bg-violet-500/20" : "text-violet-800 bg-violet-200"
                  }`}>
                    {fr.relationshipType}
                  </span>
                )}
                <span className="ml-auto text-[9px] font-mono opacity-50 shrink-0">↑ scroll</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Mini lineage art card renderer ─────────────────────────────────────────
  const renderLineageCard = (c: CreatureEntry, label: string) => {
    const art = c.media.primary || c.media.card || c.media.gallery?.[0] || null;
    const meta = getClassificationMeta(c.classification);
    const cTierMeta = CREATURE_TIER_META[c.tier] || CREATURE_TIER_META.S;
    return (
      <button
        key={`${c.id}-${label}`}
        type="button"
        onClick={() => onOpenCreature?.(c, null)}
        className={`group relative rounded-2xl overflow-hidden border cursor-pointer flex flex-col transition-all duration-300 text-left w-full ${
          isCyber
            ? "bg-[#060a18] border-white/10 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]"
            : "bg-white border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-[-2px]"
        }`}
        title={`Open dossier: ${c.name}`}
      >
        {/* Portrait artwork */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
          {art ? (
            <img
              src={art}
              alt={c.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {meta.icon}
            </div>
          )}
          {/* Tier badge */}
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border uppercase"
            style={{
              backgroundColor: isCyber ? "rgba(5,8,20,0.85)" : cTierMeta.bgNeo,
              borderColor: isCyber ? cTierMeta.borderCyber : "#000000",
              color: isCyber ? cTierMeta.color : "#000000",
            }}
          >
            {c.tier}
          </div>
          {/* Label badge */}
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-black border uppercase ${
            isCyber ? "bg-amber-500/20 border-amber-400/50 text-amber-300" : "bg-amber-200 border-black text-black"
          }`}>
            {label}
          </div>
          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 pt-6">
            <p className="text-white font-black font-mono text-sm truncate">{c.name}</p>
            <p className="text-white/70 text-[10px] font-mono truncate">{c.sourceTitle}</p>
          </div>
        </div>
        {/* Footer */}
        <div className={`px-3 py-2 flex items-center justify-between border-t ${
          isCyber ? "border-white/5" : "border-black/10"
        }`}>
          <span className={`text-[10px] font-mono ${isCyber ? "text-slate-400" : "text-slate-600"}`}>
            {meta.icon} {meta.label}
          </span>
          <span className={`text-[10px] font-mono font-bold ${
            isCyber ? "text-amber-400" : "text-black"
          }`}>
            View →
          </span>
        </div>
      </button>
    );
  };

  return (
    <OverlayPortal>
      <AnimatePresence>
        <div
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none"
          style={{ zIndex }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border z-10 ${
            isCyber
              ? "bg-[#050816] border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(0,245,255,0.2)]"
              : "bg-[#FFFBF5] border-3 border-black text-black shadow-[8px_8px_0px_0px_#000000]"
          }`}
        >
          {/* ── TOP APP BAR ── */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isCyber
                ? "bg-[#080c1a]/90 border-cyan-500/20"
                : "bg-white border-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🐾</span>
              <div>
                <h3 className="text-base font-black font-mono uppercase tracking-wider">
                  Creature Dossier
                </h3>
                <span className="text-[11px] font-mono opacity-60">
                  {creature.sourceTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Favorite Toggle */}
              <div className="relative">
                <RomanticLoveBurst ref={favBurstRef} />
                <button
                  onClick={handleToggleFav}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all border cursor-pointer ${
                    creature.isFavorite
                      ? isCyber
                        ? "bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                      : isCyber
                      ? "bg-white/5 text-slate-400 border-white/10 hover:text-amber-300"
                      : "bg-white text-slate-700 border-2 border-black hover:bg-amber-50"
                  }`}
                  aria-label="Toggle favorite"
                >
                  {creature.isFavorite ? "★" : "☆"}
                </button>
              </div>

              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(creature);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                      : "bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
                  }`}
                >
                  ✎ Edit
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all border cursor-pointer ${
                  isCyber
                    ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    : "bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
                }`}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── SCROLLABLE DOSSIER BODY ── */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* HERO MEDIA VIEWER */}
            <div className="space-y-3">
              <div
                className={`relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden border ${
                  isCyber
                    ? "bg-black/50 border-cyan-500/30 shadow-inner"
                    : "bg-amber-50 border-2 border-black shadow-[4px_4px_0px_#000000]"
                }`}
              >
                {activeDisplayUrl ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-30"
                      style={{ backgroundImage: `url(${activeDisplayUrl})` }}
                    />
                    <img
                      src={activeDisplayUrl}
                      alt={creature.name}
                      className="relative w-full h-full object-contain p-2"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-6xl">
                    {classificationMeta.icon}
                  </div>
                )}
              </div>

              {/* Media strip */}
              {allMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allMedia.map((m) => (
                    <button
                      key={m.url}
                      type="button"
                      onClick={() => setSelectedMediaUrl(m.url)}
                      title={m.label}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedMediaUrl === m.url
                          ? isCyber
                            ? "border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.4)]"
                            : "border-black shadow-[2px_2px_0px_#000]"
                          : isCyber
                          ? "border-white/10 hover:border-white/30"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CREATURE IDENTITY HEADER */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5 border-white/10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase border shadow-sm"
                    style={{
                      backgroundColor: isCyber ? classificationMeta.bgCyber : classificationMeta.bgNeo,
                      borderColor: isCyber ? classificationMeta.borderCyber : classificationMeta.borderNeo,
                      color: isCyber ? classificationMeta.color : "#000000",
                    }}
                  >
                    <span>{classificationMeta.icon}</span>
                    <span>{classificationMeta.label}</span>
                  </div>

                  <div
                    className="px-2.5 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase border shadow-sm"
                    style={{
                      backgroundColor: isCyber ? tierMeta.bgCyber : tierMeta.bgNeo,
                      borderColor: isCyber ? tierMeta.borderCyber : "#000000",
                      color: isCyber ? tierMeta.color : "#000000",
                    }}
                  >
                    {tierMeta.badgeLabel}
                  </div>

                  {creature.species && (
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        isCyber
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {creature.species}
                    </span>
                  )}

                  <span className="text-xs font-mono opacity-60">
                    {creature.mediaType}
                    {creature.sourceYear ? ` · ${creature.sourceYear}` : ""}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                  {creature.name}
                </h1>

                <p className="text-sm font-mono opacity-80">
                  Featured in <strong>{creature.sourceTitle}</strong>
                </p>
              </div>

              {/* Affection / Bond Action */}
              <div className="relative">
                <RomanticLoveBurst ref={loveBurstRef} />
                <button
                  onClick={handleBond}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-mono font-black text-sm transition-all border cursor-pointer ${
                    isCyber
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/50 hover:bg-pink-500/30 shadow-[0_0_18px_rgba(236,72,153,0.35)]"
                      : "bg-pink-100 text-pink-900 border-2 border-black hover:bg-pink-200 shadow-[3px_3px_0px_#000000]"
                  }`}
                >
                  <span className="text-base">❤️</span>
                  <span>{creature.likes || 0} Affection</span>
                  <span className="text-xs opacity-70">(+1 Bond)</span>
                </button>
              </div>
            </div>

            {/* LORE / ABOUT */}
            {creature.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black tracking-wider uppercase text-cyan-400">
                  About the Creature
                </h4>
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm font-mono leading-relaxed ${
                    isCyber
                      ? "bg-white/[0.03] border-white/10 text-slate-200"
                      : "bg-white border border-black/20 text-slate-800"
                  }`}
                >
                  {creature.description}
                </div>
              </div>
            )}

            {/* SCRAPBOOK: WHY I LOVE THIS CREATURE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💖</span>
                <h4 className="text-xs font-mono font-black tracking-wider uppercase text-pink-400">
                  Why I Love This Creature
                </h4>
                <span className="text-[10px] font-mono opacity-60">(Personal Favourite Note)</span>
              </div>
              <div
                className={`p-5 rounded-2xl border leading-relaxed text-xs sm:text-sm font-mono relative ${
                  isCyber
                    ? "bg-gradient-to-br from-pink-950/30 via-purple-950/20 to-black border-pink-500/30 text-pink-100"
                    : "bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 border-2 border-black shadow-[4px_4px_0px_#000000] text-pink-950"
                }`}
              >
                {creature.personalNote ? (
                  <p className="italic leading-relaxed whitespace-pre-wrap">
                    &ldquo;{creature.personalNote}&rdquo;
                  </p>
                ) : (
                  <p className="opacity-50 italic">
                    No personal note added yet. Click &ldquo;Edit&rdquo; above to write why you love this creature.
                  </p>
                )}
              </div>
            </div>

            {/* ── DERIVED FROM (shown on derived/fusion creatures) ── */}
            {sourceCreatures.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔗</span>
                  <h4 className="text-xs font-mono font-black tracking-wider uppercase text-amber-400">
                    Derived / Fused From
                  </h4>
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isCyber
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                      : "bg-amber-100 text-amber-900 border-amber-400 shadow-[1px_1px_0_#000]"
                  }`}>
                    {sourceCreatures.length} source{sourceCreatures.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-2xl border text-xs font-mono opacity-70 italic ${
                    isCyber ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-amber-50/50"
                  }`}
                >
                  This creature was created through a combination of the source creatures listed below.
                  These are separate, independent creatures — lineage does not create direct character connections.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sourceCreatures.map(({ ref, entry }) =>
                    renderLineageCard(entry, ref.relationshipType)
                  )}
                </div>
              </div>
            )}

            {/* ── DERIVATIVE LINEAGE (shown on source creatures) ── */}
            {derivativeCreatures.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <h4 className="text-xs font-mono font-black tracking-wider uppercase text-emerald-400">
                    Derivative / Fusion Forms
                  </h4>
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isCyber
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                      : "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-[1px_1px_0_#000]"
                  }`}>
                    {derivativeCreatures.length} derived
                  </span>
                </div>
                <div
                  className={`p-3 rounded-2xl border text-xs font-mono opacity-70 italic ${
                    isCyber ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-emerald-50/50"
                  }`}
                >
                  The following creatures list <strong>{creature.name}</strong> as a source component in their creation.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {derivativeCreatures.map((item) =>
                    renderLineageCard(item.creature, item.relationshipType)
                  )}
                </div>
              </div>
            )}

            {/* ── CONNECTED CHARACTERS (GROUPED — no duplicate character cards) ── */}
            {groupedDictChars.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <h4 className="text-xs font-mono font-black tracking-wider uppercase text-cyan-400">
                    Connected Characters ({groupedDictChars.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedDictChars.map((group) => renderGroupedCharCard(group, false))}
                </div>
              </div>
            )}

            {/* ── CONNECTED GAME CHARACTERS (GROUPED) ── */}
            {groupedGameChars.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎮</span>
                  <h4 className="text-xs font-mono font-black tracking-wider uppercase text-purple-400">
                    Connected Game Characters ({groupedGameChars.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedGameChars.map((group) => renderGroupedCharCard(group, true))}
                </div>
              </div>
            )}

            {/* ── MAIN CREATURE FOR (Ownership: bidirectional Main Creature lookup) ── */}
            {(mainCreatureOwners.hofOwners.length > 0 || mainCreatureOwners.gcOwners.length > 0) && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌟</span>
                  <h4 className="text-xs font-mono font-black tracking-wider uppercase text-amber-400">
                    Main Creature For
                  </h4>
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isCyber
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                      : "bg-amber-100 text-amber-900 border-amber-400 shadow-[1px_1px_0_#000]"
                  }`}>
                    {mainCreatureOwners.hofOwners.length + mainCreatureOwners.gcOwners.length} owner{(mainCreatureOwners.hofOwners.length + mainCreatureOwners.gcOwners.length) > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mainCreatureOwners.hofOwners.map((owner) => (
                    <div key={owner.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isCyber
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-amber-50 border border-amber-300 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-black/20 bg-slate-900">
                        {owner.avatarUrl || owner.imageUrl ? (
                          <img src={owner.avatarUrl || owner.imageUrl} alt={owner.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black font-mono truncate ${isCyber ? "text-white" : "text-black"}`}>{owner.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isCyber ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-900"}`}>📚 Character Dict</span>
                          {owner.type && <span className={`text-[9px] font-mono opacity-60 ${isCyber ? "text-slate-400" : "text-slate-600"}`}>{owner.type}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-bold ${isCyber ? "text-amber-300" : "text-amber-700"}`}>✓</span>
                    </div>
                  ))}

                  {mainCreatureOwners.gcOwners.map((owner) => (
                    <div key={owner.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isCyber
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-amber-50 border border-amber-300 shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-black/20 bg-slate-900">
                        {owner.avatarUrl || owner.cardImage ? (
                          <img src={(owner.avatarUrl || owner.cardImage)!} alt={owner.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black font-mono truncate ${isCyber ? "text-white" : "text-black"}`}>{owner.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isCyber ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-900"}`}>🎮 Game Char</span>
                          {owner.gameName && <span className={`text-[9px] font-mono opacity-60 truncate ${isCyber ? "text-slate-400" : "text-slate-600"}`}>{owner.gameName}</span>}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-bold ${isCyber ? "text-amber-300" : "text-amber-700"}`}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAGS */}
            {creature.tags && creature.tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-60">
                  Personal Tags
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {creature.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                        isCyber
                          ? "bg-white/5 border-white/10 text-slate-300"
                          : "bg-white border border-black text-black shadow-[1px_1px_0px_#000000]"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── FORMS & VARIANTS ── */}
            {creature.forms && creature.forms.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div
                  className="flex items-center gap-2 border-b pb-3"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}
                >
                  <span className="text-base text-violet-400">✦</span>
                  <h4
                    className="text-xs sm:text-sm font-mono font-black tracking-wider uppercase"
                    style={{ color: isCyber ? "#C084FC" : "#000000" }}
                  >
                    Forms &amp; Variants
                  </h4>
                  <span
                    className={`ml-auto text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
                      isCyber
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                        : "bg-violet-100 text-violet-900 border-violet-300 shadow-[1px_1px_0_#000]"
                    }`}
                  >
                    {creature.forms.length} {creature.forms.length === 1 ? "Form" : "Forms"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {[...creature.forms]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((form, idx) => (
                      <div
                        id={`creature-form-${form.id}`}
                        key={form.id || idx}
                        className="transition-all duration-300"
                      >
                        <CreatureFormCard
                          form={form}
                          isCyber={isCyber}
                          isHighlighted={form.id === highlightedFormId}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  </OverlayPortal>
);
}
