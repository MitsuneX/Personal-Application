"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
} from "@floating-ui/react";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";
import {
  detectGameType,
  GachaFields,
  CompetitiveFields,
  GachaFieldValues,
  CompetitiveFieldValues,
} from "@/components/game/DynamicGameFields";
import { useToast } from "@/components/ui/ToastProvider";
import { GameCharacterJsonEditor } from "@/components/ui/GameCharacterJsonEditor";
import { normalizeGameCharacterJson, exportGameCharacterToJson } from "@/lib/data/gameCharacterSchema";
import { isGameCharacterDuplicate } from "@/lib/data/duplicateHelper";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: "basic",    label: "Basic",    icon: "🪪" },
  { id: "identity", label: "Identity", icon: "👤" },
  { id: "world",    label: "World",    icon: "🌍" },
  { id: "combat",   label: "Combat",   icon: "⚔️" },
  { id: "voice",    label: "Voice",    icon: "🎙️" },
  { id: "story",    label: "Story",    icon: "📖" },
  { id: "images",   label: "Images",   icon: "🖼️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  characterToEdit?: GameCharacterEntry | null;
}

// ─── Floating Game Dropdown ───────────────────────────────────────────────────
function GameDropdown({
  games,
  value,
  onChange,
  isCyber,
}: {
  games: { id: string; game: string; category?: string; accentColor?: string }[];
  value: string;
  onChange: (id: string) => void;
  isCyber: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight - 16, 320)}px`,
            width: `${Math.max(rects.reference.width, 220)}px`,
          });
        },
        padding: 12,
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const selectedGame = games.find((g) => g.id === value);
  const filtered = games.filter((g) =>
    g.game.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const accent = isCyber ? "#00F5FF" : "#000000";

  return (
    <div className="w-full">
      <label
        className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
        style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}
      >
        Game Database
      </label>

      {/* Trigger */}
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer"
        style={{
          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
          borderColor: open ? accent : isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
          color: isCyber ? "#E0E8FF" : "#111827",
        }}
      >
        <span className="truncate">
          {selectedGame ? selectedGame.game : "— Select Game —"}
        </span>
        <span
          className="shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {/* Floating dropdown */}
      <FloatingPortal>
        <AnimatePresence>
          {open && (
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                ...floatingStyles,
                zIndex: 9999,
                visibility: isPositioned ? "visible" : "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                className="rounded-xl border shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0"
                style={{
                  width: "100%",
                  maxHeight: "100%",
                  backgroundColor: isCyber ? "rgba(8,12,28,0.98)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                  backdropFilter: "blur(16px)",
                  boxShadow: isCyber
                    ? "0 16px 48px rgba(0,0,0,0.8), 0 0 30px rgba(0,245,255,0.2)"
                    : "6px 6px 0 #000000",
                }}
              >
                {/* Search */}
                <div
                  className="p-2 border-b shrink-0"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search games…"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "#F3F4F6",
                      color: isCyber ? "#E0E8FF" : "#111827",
                    }}
                  />
                </div>

                {/* Options */}
                <div className="overflow-y-auto flex-1 min-h-0 py-1 scrollbar-thin">
                {/* Clear option */}
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="w-full px-3 py-2 text-xs font-mono text-left transition-colors hover:bg-white/5"
                  style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "#9CA3AF" }}
                >
                  — None / Unlinked —
                </button>

                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs font-mono opacity-40"
                       style={{ color: isCyber ? "#94A3B8" : "#9CA3AF" }}>
                    No games found
                  </div>
                )}

                {filtered.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { onChange(g.id); setOpen(false); }}
                    className="w-full px-3 py-2 text-xs font-mono text-left flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor:
                        g.id === value
                          ? isCyber ? "rgba(0,245,255,0.12)" : "#EFF6FF"
                          : "transparent",
                      color:
                        g.id === value
                          ? isCyber ? "#00F5FF" : "#2563EB"
                          : isCyber ? "#E0E8FF" : "#111827",
                    }}
                    onMouseEnter={(e) => {
                      if (g.id !== value)
                        (e.currentTarget as HTMLElement).style.backgroundColor = isCyber
                          ? "rgba(255,255,255,0.06)"
                          : "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      if (g.id !== value)
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {g.accentColor && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: g.accentColor }}
                      />
                    )}
                    <span className="truncate">{g.game}</span>
                    {g.category && (
                      <span className="ml-auto text-[10px] opacity-40 shrink-0">
                        {g.category}
                      </span>
                    )}
                    {g.id === value && <span className="ml-1 shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FloatingPortal>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isCyber,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  isCyber: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
        style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-xl border text-xs font-mono theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        style={{
          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
          borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
        }}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  isCyber,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  isCyber: boolean;
}) {
  return (
    <div>
      <label
        className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
        style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}
      >
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-xl border text-xs font-mono theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-y"
        style={{
          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
          borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
        }}
      />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function GameCharacterEditorModal({ isOpen, onClose, characterToEdit }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { games, gameCharacters, addGameCharacter, updateGameCharacter } = useDashboardStore();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // ── Basic ──
  const [name, setName] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [alias, setAlias] = useState("");
  const [nickname, setNickname] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [title, setTitle] = useState("");
  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [tier, setTier] = useState("S");
  const [rank, setRank] = useState<number | "">("");
  const [isFavorite, setIsFavorite] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [accentColor, setAccentColor] = useState("#00F5FF");

  // ── Identity ──
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [species, setSpecies] = useState("");
  const [race, setRace] = useState("");

  // ── World ──
  const [nation, setNation] = useState("");
  const [region, setRegion] = useState("");
  const [planet, setPlanet] = useState("");
  const [organization, setOrganization] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [faction, setFaction] = useState("");

  // ── Combat ──
  const [role, setRole] = useState("");
  const [element, setElement] = useState("");
  const [path, setPath] = useState("");
  const [weapon, setWeapon] = useState("");
  const [rarity, setRarity] = useState("");
  const [attribute, setAttribute] = useState("");
  const [damageType, setDamageType] = useState("");
  const [combatRole, setCombatRole] = useState("");
  const [winRate, setWinRate] = useState("");
  const [pickRate, setPickRate] = useState("");
  const [banRate, setBanRate] = useState("");

  // ── Voice ──
  const [voiceJP, setVoiceJP] = useState("");
  const [voiceCN, setVoiceCN] = useState("");
  const [voiceKR, setVoiceKR] = useState("");
  const [voiceEN, setVoiceEN] = useState("");

  // ── Story ──
  const [personality, setPersonality] = useState("");
  const [biography, setBiography] = useState("");
  const [officialDescription, setOfficialDescription] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [notes, setNotes] = useState("");

  // ── Images ──
  const [cardImage, setCardImage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [splashArt, setSplashArt] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  // ── Persistent Crop Metadata ──
  const [cardImageCrop, setCardImageCrop] = useState<any>(null);
  const [avatarCrop, setAvatarCrop] = useState<any>(null);
  const [splashArtCrop, setSplashArtCrop] = useState<any>(null);

  // ── Reset on open ──
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("basic");
    if (characterToEdit) {
      const c = normalizeGameCharacterJson(characterToEdit);
      setName(c.name || "");
      setOfficialName(c.officialName || "");
      setAlias(c.alias || "");
      setNickname(c.nickname || "");
      setNativeName(c.nativeName || "");
      setTitle(c.title || "");
      setGameId(c.gameId || "");
      setGameName(c.gameName || "");
      setCharacterId(c.characterId || "");
      setTier(c.tier || "S");
      setRank(c.rank ?? "");
      setIsFavorite(c.isFavorite ?? true);
      setIsFeatured(c.isFeatured ?? false);
      setAccentColor(c.accentColor || "#00F5FF");
      // Identity
      setBirthday(c.birthday || "");
      setAge(c.age || "");
      setGender(c.gender || "");
      setHeight(c.height || "");
      setWeight(c.weight || "");
      setSpecies(c.species || "");
      setRace(c.race || "");
      // World
      setNation(c.nation || "");
      setRegion(c.region || "");
      setPlanet(c.planet || "");
      setOrganization(c.organization || "");
      setAffiliation(c.affiliation || "");
      setFaction(c.faction || "");
      // Combat
      setRole(c.role || "");
      setElement(c.element || "");
      setPath(c.path || "");
      setWeapon(c.weapon || "");
      setRarity(c.rarity || "");
      setAttribute(c.attribute || "");
      setDamageType(c.damageType || "");
      setCombatRole(c.combatRole || "");
      setWinRate(c.winRate?.toString() || "");
      setPickRate(c.pickRate?.toString() || "");
      setBanRate(c.banRate?.toString() || "");
      // Voice
      setVoiceJP(c.voiceActors?.jp || c.voice?.japanese || "");
      setVoiceCN(c.voiceActors?.cn || c.voice?.chinese || "");
      setVoiceKR(c.voiceActors?.kr || c.voice?.korean || "");
      setVoiceEN(c.voiceActors?.en || c.voice?.english || "");
      // Story
      setPersonality(c.personality || "");
      setBiography(c.biography || "");
      setOfficialDescription(c.officialDescription || "");
      setFavoriteQuote(c.favoriteQuote || "");
      setNotes(c.notes || "");
      // Images
      setCardImage(c.cardImage || "");
      setAvatarUrl(c.avatarUrl || "");
      setSplashArt(c.splashArt || "");
      setGallery(c.gallery || []);
      // Persistent Crop Data
      const existingCrop = c.stats?.cropData || {};
      setCardImageCrop(existingCrop.cardImageCrop || null);
      setAvatarCrop(existingCrop.avatarCrop || null);
      setSplashArtCrop(existingCrop.splashArtCrop || null);
    } else {
      // Reset all
      setName(""); setOfficialName(""); setAlias(""); setNickname(""); setNativeName(""); setTitle("");
      setGameId(""); setGameName(""); setCharacterId(""); setTier("S"); setRank(""); setIsFavorite(true); setIsFeatured(false); setAccentColor("#00F5FF");
      setBirthday(""); setAge(""); setGender(""); setHeight(""); setWeight(""); setSpecies(""); setRace("");
      setNation(""); setRegion(""); setPlanet(""); setOrganization(""); setAffiliation(""); setFaction("");
      setRole(""); setElement(""); setPath(""); setWeapon(""); setRarity(""); setAttribute(""); setDamageType(""); setCombatRole("");
      setWinRate(""); setPickRate(""); setBanRate("");
      setVoiceJP(""); setVoiceCN(""); setVoiceKR(""); setVoiceEN("");
      setPersonality(""); setBiography(""); setOfficialDescription(""); setFavoriteQuote(""); setNotes("");
      setCardImage(""); setAvatarUrl(""); setSplashArt(""); setGallery([]);
      setCardImageCrop(null); setAvatarCrop(null); setSplashArtCrop(null);
    }
  }, [characterToEdit, isOpen]);

  // ── When game is picked, auto-fill game name + accent ──
  const handleGameSelect = useCallback((gId: string) => {
    setGameId(gId);
    const g = games.find((g) => g.id === gId);
    if (g) {
      setGameName(g.game);
      if (g.accentColor) setAccentColor(g.accentColor);
    } else {
      setGameName("");
    }
  }, [games]);

  // ── Auto-fetch metadata from wiki ──
  const handleAutoFill = async () => {
    if (!name.trim()) { toastError("Enter a character name first."); return; }
    setIsFetchingMeta(true);
    try {
      const params = new URLSearchParams({ name: name.trim(), game: gameName });
      const res = await fetch(`/api/game-characters/metadata?${params.toString()}`);
      const json = await res.json();

      if (!json.success || !json.data || Object.keys(json.data).length === 0) {
        toastError(json.message || "No metadata found. Fields marked as Metadata Pending.");
        return;
      }

      const d = json.data;
      if (d.birthday && !birthday) setBirthday(d.birthday);
      if (d.gender && !gender) setGender(d.gender);
      if (d.height && !height) setHeight(d.height);
      if (d.weight && !weight) setWeight(d.weight);
      if (d.nation && !nation) setNation(d.nation);
      if (d.element && !element) setElement(d.element);
      if (d.weapon && !weapon) setWeapon(d.weapon);
      if (d.rarity && !rarity) setRarity(d.rarity);
      if (d.path && !path) setPath(d.path);
      if (d.faction && !faction) setFaction(d.faction);
      if (d.species && !species) setSpecies(d.species);
      if (d.title && !title) setTitle(d.title);
      if (d.officialDescription && !officialDescription) setOfficialDescription(d.officialDescription);
      if (d.voiceActors) {
        if (d.voiceActors.jp && !voiceJP) setVoiceJP(d.voiceActors.jp);
        if (d.voiceActors.en && !voiceEN) setVoiceEN(d.voiceActors.en);
        if (d.voiceActors.cn && !voiceCN) setVoiceCN(d.voiceActors.cn);
        if (d.voiceActors.kr && !voiceKR) setVoiceKR(d.voiceActors.kr);
      }

      const filled = Object.keys(d).length;
      const missing = json.missing?.length || 0;
      toastSuccess(
        json.metadataStatus === "partial"
          ? `Auto-filled ${filled} fields. ${missing} fields not found on wiki.`
          : `Auto-filled ${filled} fields from ${json.wikiSource?.replace("https://", "").split(".")[0]} wiki!`
      );
    } catch {
      toastError("Failed to fetch metadata.");
    } finally {
      setIsFetchingMeta(false);
    }
  };

  // ── JSON live payload helper ──
  const getLivePayload = (): Partial<GameCharacterEntry> => {
    const raw: any = {
      id: characterToEdit?.id || `gc-${Date.now()}`,
      name: name.trim() || "New Game Character",
      officialName: officialName || "",
      alias: alias || "",
      nickname: nickname || "",
      nativeName: nativeName || "",
      title: title || "",
      gameId: gameId || "",
      gameName: gameName || "",
      characterId: characterId || "",
      tier: tier || "S",
      rank: rank === "" ? null : Number(rank),
      isFavorite,
      isFeatured,
      accentColor,
      identity: {
        birthday, age, gender, height, weight, species, race,
        ...(characterToEdit?.identity || {}),
      },
      world: {
        nation, region, planet, organization, affiliation, faction,
        ...(characterToEdit?.world || {}),
      },
      combat: {
        role, attribute, element, path, weaponType: weapon, weapon, rarity,
        nation, birthday, damageType, combatRole,
        ...(characterToEdit?.combat || {}),
      },
      voice: {
        japanese: voiceJP, chinese: voiceCN, korean: voiceKR, english: voiceEN,
        jp: voiceJP, cn: voiceCN, kr: voiceKR, en: voiceEN,
        ...(characterToEdit?.voice || {}),
      },
      story: {
        personality, biography, officialDescription, favoriteQuote,
        ...(characterToEdit?.story || {}),
      },
      cardImage: cardImage || undefined,
      avatarUrl: avatarUrl || undefined,
      splashArt: splashArt || undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      notes: notes || undefined,
    };

    return normalizeGameCharacterJson(raw);
  };

  // ── JSON Apply handler ──
  const handleJsonApply = (updated: Partial<GameCharacterEntry>, mode: "replace" | "merge") => {
    const norm = normalizeGameCharacterJson(updated);
    if (norm.name !== undefined) setName(norm.name);
    if (norm.officialName !== undefined) setOfficialName(norm.officialName || "");
    if (norm.alias !== undefined) setAlias(norm.alias || "");
    if (norm.nickname !== undefined) setNickname(norm.nickname || "");
    if (norm.nativeName !== undefined) setNativeName(norm.nativeName || "");
    if (norm.title !== undefined) setTitle(norm.title || "");
    if (norm.gameId !== undefined) setGameId(norm.gameId || "");
    if (norm.gameName !== undefined) setGameName(norm.gameName || "");
    if (norm.tier !== undefined) setTier(norm.tier || "S");
    if (norm.rank !== undefined) setRank(typeof norm.rank === "number" ? norm.rank : "");
    if (norm.isFavorite !== undefined) setIsFavorite(Boolean(norm.isFavorite));
    if (norm.isFeatured !== undefined) setIsFeatured(Boolean(norm.isFeatured));
    if (norm.accentColor !== undefined) setAccentColor(norm.accentColor || "#00F5FF");
    if (norm.birthday !== undefined) setBirthday(norm.birthday || "");
    if (norm.age !== undefined) setAge(norm.age || "");
    if (norm.gender !== undefined) setGender(norm.gender || "");
    if (norm.height !== undefined) setHeight(norm.height || "");
    if (norm.weight !== undefined) setWeight(norm.weight || "");
    if (norm.species !== undefined) setSpecies(norm.species || "");
    if (norm.race !== undefined) setRace(norm.race || "");
    if (norm.nation !== undefined) setNation(norm.nation || "");
    if (norm.region !== undefined) setRegion(norm.region || "");
    if (norm.planet !== undefined) setPlanet(norm.planet || "");
    if (norm.organization !== undefined) setOrganization(norm.organization || "");
    if (norm.affiliation !== undefined) setAffiliation(norm.affiliation || "");
    if (norm.faction !== undefined) setFaction(norm.faction || "");
    if (norm.role !== undefined) setRole(norm.role || "");
    if (norm.element !== undefined) setElement(norm.element || "");
    if (norm.attribute !== undefined) setAttribute(norm.attribute || "");
    if (norm.path !== undefined) setPath(norm.path || "");
    if (norm.weapon !== undefined) setWeapon(norm.weapon || "");
    if (norm.rarity !== undefined) setRarity(norm.rarity || "");
    if (norm.damageType !== undefined) setDamageType(norm.damageType || "");
    if (norm.combatRole !== undefined) setCombatRole(norm.combatRole || "");
    if (norm.voiceActors) {
      if (norm.voiceActors.jp !== undefined) setVoiceJP(norm.voiceActors.jp || "");
      if (norm.voiceActors.cn !== undefined) setVoiceCN(norm.voiceActors.cn || "");
      if (norm.voiceActors.kr !== undefined) setVoiceKR(norm.voiceActors.kr || "");
      if (norm.voiceActors.en !== undefined) setVoiceEN(norm.voiceActors.en || "");
    }
    if (norm.personality !== undefined) setPersonality(norm.personality || "");
    if (norm.biography !== undefined) setBiography(norm.biography || "");
    if (norm.officialDescription !== undefined) setOfficialDescription(norm.officialDescription || "");
    if (norm.favoriteQuote !== undefined) setFavoriteQuote(norm.favoriteQuote || "");
    if (norm.cardImage !== undefined) setCardImage(norm.cardImage || "");
    if (norm.avatarUrl !== undefined) setAvatarUrl(norm.avatarUrl || "");
    if (norm.splashArt !== undefined) setSplashArt(norm.splashArt || "");
    if (norm.gallery !== undefined) setGallery(Array.isArray(norm.gallery) ? norm.gallery : []);
    setEditorMode("visual");
    toastSuccess(`✓ Applied JSON data (${mode} mode).`);
  };

  // ── Export JSON handler ──
  const handleExportJson = () => {
    try {
      const payload = getLivePayload();
      const canonical = exportGameCharacterToJson(payload);
      const json = JSON.stringify(canonical, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "game-character").replace(/\s+/g, "_").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess(`✓ Exported ${name || "game-character"}.json`);
    } catch {
      toastError("Failed to export JSON.");
    }
  };

  // ── Detect game type for dynamic fields ──
  const selectedGame = games.find((g) => g.id === gameId);
  const gameType = detectGameType(gameName || selectedGame?.game, selectedGame?.category);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    const live = getLivePayload();
    const payload: Partial<GameCharacterEntry> = {
      ...live,
      winRate: winRate !== "" ? Number(winRate) : undefined,
      pickRate: pickRate !== "" ? Number(pickRate) : undefined,
      banRate: banRate !== "" ? Number(banRate) : undefined,
      notes: notes || undefined,
      stats: {
        ...(characterToEdit?.stats || {}),
        cropData: {
          cardImageCrop,
          avatarCrop,
          splashArtCrop,
        },
      },
    };

    try {
      if (characterToEdit) {
        // ── UPDATE: strictly by unique record ID ──
        await updateGameCharacter(characterToEdit.id, payload);
        toastSuccess(`${name} updated!`);
      } else {
        // ── CREATE: check canonical duplicate first ──
        const duplicate = isGameCharacterDuplicate(payload, gameCharacters);
        if (duplicate) {
          toastWarning(
            `“${duplicate.name}” already exists in your roster (${duplicate.gameName || "this game"}). ` +
            `Right-click the existing card and choose “Duplicate Entry” if you intentionally want an independent copy.`
          );
          setIsSubmitting(false);
          return;
        }
        await addGameCharacter(payload);
        toastSuccess(`${name} added to your roster!`);
      }
      onClose();
    } catch {
      toastError("Failed to save character.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const accent = accentColor || "#00F5FF";

  // ── Tab content ──
  const renderTab = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Character Name" value={name} onChange={setName} placeholder="e.g. Acheron" required isCyber={isCyber} />
              <FormField label="Official Name" value={officialName} onChange={setOfficialName} placeholder="Full official name" isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Alias" value={alias} onChange={setAlias} placeholder="Alternate name / code name" isCyber={isCyber} />
              <FormField label="Nickname" value={nickname} onChange={setNickname} placeholder="Common nickname" isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Native Name" value={nativeName} onChange={setNativeName} placeholder="Japanese / Chinese name" isCyber={isCyber} />
              <FormField label="Title / Epithet" value={title} onChange={setTitle} placeholder="e.g. Herrscher of Finality" isCyber={isCyber} />
            </div>

            {/* Game selector */}
            <GameDropdown games={games} value={gameId} onChange={handleGameSelect} isCyber={isCyber} />

            {/* Featured Character Toggle */}
            <div
              className="flex items-center justify-between p-3 rounded-2xl border transition-all"
              style={{
                backgroundColor: isCyber ? (isFeatured ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)") : (isFeatured ? "#FEF9C3" : "#F9FAFB"),
                borderColor: isCyber ? (isFeatured ? "#FFD700" : "rgba(255,255,255,0.12)") : (isFeatured ? "#EAB308" : "#E5E7EB"),
                borderWidth: isCyber ? "1px" : "2px",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider theme-text-primary">
                    Featured Game Character
                  </div>
                  <div className="text-[10px] theme-text-muted">
                    Highlight character across roster grids & Hall of Fame rankings
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? (isCyber ? "bg-amber-400" : "bg-yellow-500") : "bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Tier */}
              <div>
                <label className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
                  style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}>Tier</label>
                <select value={tier} onChange={(e) => setTier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs font-mono theme-text-primary focus:outline-none"
                  style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB" }}>
                  <option value="S+">S+ Tier</option>
                  <option value="S">S Tier</option>
                  <option value="A">A Tier</option>
                  <option value="B">B Tier</option>
                  <option value="C">C Tier</option>
                </select>
              </div>
              {/* Rank */}
              <FormField label="Rank #" value={rank.toString()} onChange={(v) => setRank(v === "" ? "" : Number(v))} placeholder="1" type="number" isCyber={isCyber} />
              {/* Accent Color */}
              <div>
                <label className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
                  style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent shrink-0" />
                  <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs font-mono theme-text-primary focus:outline-none"
                    style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB" }} />
                </div>
              </div>
            </div>

            {/* Favorite toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
              <span className="text-sm font-bold theme-text-primary">⭐ Star as Favorite</span>
            </label>
          </div>
        );

      case "identity":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Birthday" value={birthday} onChange={setBirthday} placeholder="e.g. March 7" isCyber={isCyber} />
              <FormField label="Age" value={age} onChange={setAge} placeholder="e.g. 25, Unknown" isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Gender" value={gender} onChange={setGender} placeholder="e.g. Female, Male, Unknown" isCyber={isCyber} />
              <FormField label="Height" value={height} onChange={setHeight} placeholder={"e.g. 168cm / 5'6\""} isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Weight" value={weight} onChange={setWeight} placeholder="e.g. 52kg" isCyber={isCyber} />
              <FormField label="Species" value={species} onChange={setSpecies} placeholder="e.g. Human, Stellaron Hunter" isCyber={isCyber} />
            </div>
            <FormField label="Race" value={race} onChange={setRace} placeholder="e.g. Elven, Android, Resonator" isCyber={isCyber} />
          </div>
        );

      case "world":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nation" value={nation} onChange={setNation} placeholder="e.g. Liyue, Belobog" isCyber={isCyber} />
              <FormField label="Region" value={region} onChange={setRegion} placeholder="Sub-region / area" isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Planet" value={planet} onChange={setPlanet} placeholder="e.g. Jarilo-VI, Amphoreus" isCyber={isCyber} />
              <FormField label="Organization" value={organization} onChange={setOrganization} placeholder="e.g. Astral Express, Fatui" isCyber={isCyber} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Affiliation" value={affiliation} onChange={setAffiliation} placeholder="e.g. Herta Space Station" isCyber={isCyber} />
              <FormField label="Faction" value={faction} onChange={setFaction} placeholder="e.g. Nameless, Erudition" isCyber={isCyber} />
            </div>
          </div>
        );

      case "combat":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Role" value={role} onChange={setRole} placeholder="e.g. Main DPS, Support" isCyber={isCyber} />
              <FormField label="Attribute" value={attribute} onChange={setAttribute} placeholder="e.g. Physical, Quantum" isCyber={isCyber} />
            </div>

            {gameType === "gacha" && (
              <GachaFields
                values={{ element, path, weapon, rarity, nation, birthday, damageType, combatRole }}
                onChange={(field, val) => {
                  if (field === "element") setElement(val);
                  else if (field === "path") setPath(val);
                  else if (field === "weapon") setWeapon(val);
                  else if (field === "rarity") setRarity(val);
                  else if (field === "nation") setNation(val);
                  else if (field === "birthday") setBirthday(val);
                  else if (field === "damageType") setDamageType(val);
                  else if (field === "combatRole") setCombatRole(val);
                }}
              />
            )}

            {gameType === "competitive" && (
              <CompetitiveFields
                values={{ winRate, pickRate, banRate }}
                onChange={(field, val) => {
                  if (field === "winRate") setWinRate(val);
                  else if (field === "pickRate") setPickRate(val);
                  else if (field === "banRate") setBanRate(val);
                }}
              />
            )}

            {gameType === "general" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Element" value={element} onChange={setElement} placeholder="e.g. Fire, Ice" isCyber={isCyber} />
                  <FormField label="Weapon" value={weapon} onChange={setWeapon} placeholder="e.g. Sword, Bow" isCyber={isCyber} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Class / Path" value={path} onChange={setPath} placeholder="e.g. Warrior, Mage" isCyber={isCyber} />
                  <FormField label="Rarity" value={rarity} onChange={setRarity} placeholder="e.g. 5-Star, SSR" isCyber={isCyber} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Win Rate %" value={winRate} onChange={setWinRate} placeholder="54.5" type="number" isCyber={isCyber} />
                  <FormField label="Pick Rate %" value={pickRate} onChange={setPickRate} placeholder="12.3" type="number" isCyber={isCyber} />
                  <FormField label="Ban Rate %" value={banRate} onChange={setBanRate} placeholder="8.1" type="number" isCyber={isCyber} />
                </div>
              </div>
            )}
          </div>
        );

      case "voice":
        return (
          <div className="space-y-4">
            <div
              className="p-3 rounded-xl text-xs font-mono border"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#EFF6FF",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#BFDBFE",
                color: isCyber ? "#94A3B8" : "#3B82F6",
              }}
            >
              🎙️ Enter official voice actor names from the game's credits or wiki.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Japanese (JP)" value={voiceJP} onChange={setVoiceJP} placeholder="e.g. Aoi Koga" isCyber={isCyber} />
              <FormField label="Chinese (CN)" value={voiceCN} onChange={setVoiceCN} placeholder="e.g. 小刚" isCyber={isCyber} />
              <FormField label="Korean (KR)" value={voiceKR} onChange={setVoiceKR} placeholder="e.g. 김민주" isCyber={isCyber} />
              <FormField label="English (EN)" value={voiceEN} onChange={setVoiceEN} placeholder="e.g. Felecia Angelle" isCyber={isCyber} />
            </div>
          </div>
        );

      case "story":
        return (
          <div className="space-y-4">
            <TextareaField label="Personality" value={personality} onChange={setPersonality} placeholder="Describe their personality traits…" rows={2} isCyber={isCyber} />
            <TextareaField label="Biography" value={biography} onChange={setBiography} placeholder="Character backstory and lore…" rows={4} isCyber={isCyber} />
            <TextareaField label="Official Description" value={officialDescription} onChange={setOfficialDescription} placeholder="Paste the official in-game description…" rows={3} isCyber={isCyber} />
            <FormField label="Favorite Quote" value={favoriteQuote} onChange={setFavoriteQuote} placeholder={`"Their most iconic line…"`} isCyber={isCyber} />
            <TextareaField label="Personal Notes" value={notes} onChange={setNotes} placeholder="Your personal thoughts, build notes, combos…" rows={2} isCyber={isCyber} />
          </div>
        );

      case "images":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <CharacterImageUploader
                  label="Card Image (3:4)"
                  value={cardImage}
                  cropData={cardImageCrop}
                  allowVideo={true}
                  onChange={(url, crop) => {
                    setCardImage(url);
                    if (crop) setCardImageCrop(crop);
                  }}
                  onClear={() => { setCardImage(""); setCardImageCrop(null); }}
                  aspect={3 / 4}
                  hint="Used ONLY on grid cards. Supports MP4."
                  previewClass="h-40 w-full"
                />
                <input
                  type="text"
                  value={cardImage.startsWith("data:") ? "" : cardImage}
                  onChange={(e) => setCardImage(e.target.value)}
                  placeholder="Or paste image URL…"
                  className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                  style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB" }}
                />
              </div>

              <div className="space-y-2">
                <CharacterImageUploader
                  label="Avatar (1:1)"
                  value={avatarUrl}
                  cropData={avatarCrop}
                  onChange={(url, crop) => {
                    setAvatarUrl(url);
                    if (crop) setAvatarCrop(crop);
                  }}
                  onClear={() => { setAvatarUrl(""); setAvatarCrop(null); }}
                  aspect={1}
                  hint="Square icon ratio."
                  previewClass="h-40 w-40 mx-auto"
                />
                <input
                  type="text"
                  value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or paste image URL…"
                  className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                  style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB" }}
                />
              </div>

              <div className="space-y-2">
                <CharacterImageUploader
                  label="Splash Art (16:9)"
                  value={splashArt}
                  cropData={splashArtCrop}
                  onChange={(url, crop) => {
                    setSplashArt(url);
                    if (crop) setSplashArtCrop(crop);
                  }}
                  onClear={() => { setSplashArt(""); setSplashArtCrop(null); }}
                  aspect={16 / 9}
                  hint="Used ONLY for Profile hero banner."
                  previewClass="h-40 w-full"
                />
                <input
                  type="text"
                  value={splashArt.startsWith("data:") ? "" : splashArt}
                  onChange={(e) => setSplashArt(e.target.value)}
                  placeholder="Or paste image URL…"
                  className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                  style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB" }}
                />
              </div>
            </div>

            <GalleryUploader images={gallery} onChange={setGallery} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-modal-open="true" className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-2xl flex flex-col rounded-2xl border shadow-2xl relative"
            style={{
              backgroundColor: isCyber ? "#0C1224" : "#FFFFFF",
              borderColor: isCyber ? `${accent}60` : "#000000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
              boxShadow: isCyber
                ? `0 0 60px ${accent}25, 0 20px 60px rgba(0,0,0,0.7)`
                : "8px 8px 0 #000000",
              maxHeight: "90vh",
            }}
          >
            {/* Cyber ambient glow */}
            {isCyber && (
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none z-0"
                style={{ backgroundColor: accent }} />
            )}

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0 relative z-10"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold shrink-0"
                  style={{ backgroundColor: `${accent}20`, color: accent }}
                >
                  {characterToEdit ? "✏️" : "⭐"}
                </div>
                <div>
                  <h3 className="text-base font-black theme-text-primary leading-tight">
                    {characterToEdit ? `Edit · ${characterToEdit.name}` : "New Game Character"}
                  </h3>
                  {gameName && (
                    <p className="text-[10px] font-mono opacity-50 theme-text-muted">{gameName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Visual / JSON Mode Switch */}
                <div
                  className="flex items-center rounded-lg border overflow-hidden shrink-0"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
                >
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all cursor-pointer"
                    style={{
                      backgroundColor: editorMode === "visual"
                        ? isCyber ? accent : "#1E293B"
                        : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                      color: editorMode === "visual"
                        ? isCyber ? "#000" : "#FFF"
                        : isCyber ? "#94A3B8" : "#64748B",
                    }}
                  >
                    🖊 Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("json")}
                    className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all cursor-pointer"
                    style={{
                      backgroundColor: editorMode === "json"
                        ? isCyber ? accent : "#1E293B"
                        : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                      color: editorMode === "json"
                        ? isCyber ? "#000" : "#FFF"
                        : isCyber ? "#94A3B8" : "#64748B",
                    }}
                  >
                    {"{ }"} JSON
                  </button>
                </div>

                {/* Export JSON Button */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                    color: isCyber ? "#94A3B8" : "#475569",
                  }}
                  title="Export character data as JSON"
                >
                  ⬇ Export
                </button>

                {/* Auto-fill metadata button */}
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isFetchingMeta || !name.trim()}
                  className="px-3 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all disabled:opacity-40 flex items-center gap-1.5"
                  style={{
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#D1D5DB",
                    color: isCyber ? "#00F5FF" : "#6B7280",
                    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#F9FAFB",
                  }}
                  title="Auto-fill from official wiki"
                >
                  {isFetchingMeta ? (
                    <span className="animate-spin text-xs">⟳</span>
                  ) : (
                    "✨"
                  )}
                  <span>{isFetchingMeta ? "Fetching…" : "Auto-Fill"}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-lg opacity-50 hover:opacity-100 hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mode Content Switch */}
            {editorMode === "json" ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <GameCharacterJsonEditor
                  profile={getLivePayload()}
                  onApply={handleJsonApply}
                />
              </div>
            ) : (
              <>
                {/* Tab bar */}
                <div
                  className="flex items-center gap-0.5 px-4 py-2 overflow-x-auto shrink-0 border-b"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.06)" : "#F3F4F6" }}
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono whitespace-nowrap transition-all"
                        style={{
                          backgroundColor: isActive
                            ? isCyber ? `${accent}18` : "#F0F9FF"
                            : "transparent",
                          color: isActive
                            ? isCyber ? accent : "#2563EB"
                            : isCyber ? "rgba(255,255,255,0.4)" : "#9CA3AF",
                          borderBottom: isActive
                            ? `2px solid ${isCyber ? accent : "#2563EB"}`
                            : "2px solid transparent",
                          borderRadius: "8px 8px 0 0",
                        }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.14 }}
                      >
                        {renderTab()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between px-6 py-4 border-t shrink-0"
                    style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}
                  >
                    {/* Tab navigation arrows */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const idx = TABS.findIndex((t) => t.id === activeTab);
                          if (idx > 0) setActiveTab(TABS[idx - 1].id);
                        }}
                        disabled={activeTab === TABS[0].id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border opacity-60 hover:opacity-100 disabled:opacity-20 transition-all"
                        style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
                      >
                        ← Prev
                      </button>
                      <span className="text-[10px] font-mono opacity-40 theme-text-muted">
                        {TABS.findIndex((t) => t.id === activeTab) + 1} / {TABS.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = TABS.findIndex((t) => t.id === activeTab);
                          if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                        }}
                        disabled={activeTab === TABS[TABS.length - 1].id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border opacity-60 hover:opacity-100 disabled:opacity-20 transition-all"
                        style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
                      >
                        Next →
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-bold opacity-60 hover:opacity-100 border transition-all"
                        style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        style={{
                          background: isCyber
                            ? `linear-gradient(135deg, ${accent}CC, #BF5FFF99)`
                            : "#7C3AED",
                          boxShadow: isCyber ? `0 4px 20px ${accent}40` : undefined,
                        }}
                      >
                        {isSubmitting
                          ? "Saving…"
                          : characterToEdit
                          ? "Save Changes"
                          : "Create Character"}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
