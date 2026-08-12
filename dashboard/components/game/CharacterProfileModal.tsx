"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { useToast } from "@/components/ui/ToastProvider";
import { getElementTheme, ElementTheme } from "@/lib/utils/elementTheme";
import { ElementParticles } from "@/components/game/ElementParticles";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  character: GameCharacterEntry | null;
  onClose: () => void;
  onEdit?: (character: GameCharacterEntry) => void;
  onDelete?: (character: GameCharacterEntry) => void;
}

const TABS = [
  { id: "overview", label: "Overview", icon: "📋" },
  { id: "gallery",  label: "Gallery",  icon: "🖼️" },
  { id: "personal", label: "Personal", icon: "💜" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function rarityStars(r?: string) {
  if (!r) return null;
  const m = r.match(/(\d)/);
  if (!m) return null;
  const n = Math.min(parseInt(m[1]), 6);
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

// ─── Game-specific combat config (Extensible System) ─────────────────────────
export interface CombatFieldDef {
  key: string;
  label: string;
  icon?: string;
}

export interface GameCombatConfig {
  label: string;
  fields: CombatFieldDef[];
}

export function getCombatConfig(gameName?: string, gameCategory?: string): GameCombatConfig {
  const n = (gameName || "").toLowerCase();
  const c = (gameCategory || "").toLowerCase();

  if (n.includes("wuthering waves")) return { label: "Wuthering Waves Combat", fields: [
    { key: "element", label: "Attribute", icon: "🌀" },
    { key: "weapon", label: "Weapon Type", icon: "⚔️" },
    { key: "role", label: "Role", icon: "🛡️" },
    { key: "combatRole", label: "Combat Specialty", icon: "🎯" },
    { key: "stats.signatureWeapon", label: "Signature Weapon", icon: "🗡️" },
    { key: "stats.resonanceChain", label: "Resonance Chain", icon: "⛓️" },
    { key: "stats.echoRecommendation", label: "Echo Set", icon: "👾" },
  ]};

  if (n.includes("star rail") || n.includes("honkai: star rail")) return { label: "Honkai: Star Rail Combat", fields: [
    { key: "path", label: "Path", icon: "🛣️" },
    { key: "element", label: "Combat Type", icon: "🔮" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "combatRole", label: "Role", icon: "⚔️" },
    { key: "stats.lightCone", label: "Light Cone", icon: "🃏" },
    { key: "stats.eidolon", label: "Eidolon Level", icon: "✨" },
  ]};

  if (n.includes("genshin")) return { label: "Genshin Impact Combat", fields: [
    { key: "element", label: "Vision", icon: "👁️" },
    { key: "weapon", label: "Weapon", icon: "⚔️" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "nation", label: "Nation", icon: "🏛️" },
    { key: "stats.constellation", label: "Constellation", icon: "⭐" },
    { key: "stats.ascension", label: "Ascension Phase", icon: "📈" },
  ]};

  if (n.includes("zenless zone zero") || n.includes("zzz")) return { label: "Zenless Zone Zero Combat", fields: [
    { key: "element", label: "Attribute", icon: "⚡" },
    { key: "path", label: "Specialty", icon: "🎯" },
    { key: "faction", label: "Faction", icon: "🏢" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "weapon", label: "W-Engine", icon: "⚙️" },
  ]};

  if (n.includes("nikke") || n.includes("goddess of victory")) return { label: "NIKKE Combat", fields: [
    { key: "stats.manufacturer", label: "Manufacturer", icon: "🏭" },
    { key: "element", label: "Code", icon: "🧬" },
    { key: "stats.burstType", label: "Burst Type", icon: "💥" },
    { key: "weapon", label: "Weapon", icon: "🔫" },
    { key: "rarity", label: "Rarity", icon: "✦" },
  ]};

  if (n.includes("arknights")) return { label: "Arknights Combat", fields: [
    { key: "path", label: "Class", icon: "🛡️" },
    { key: "stats.branch", label: "Branch", icon: "🌿" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "faction", label: "Faction", icon: "🚩" },
  ]};

  if (n.includes("punishing") || n.includes("gray raven")) return { label: "Punishing: Gray Raven Combat", fields: [
    { key: "path", label: "Class", icon: "⚔️" },
    { key: "element", label: "Element", icon: "🔥" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "combatRole", label: "Role", icon: "🛡️" },
  ]};

  if (n.includes("reverse: 1999") || n.includes("reverse1999")) return { label: "Reverse: 1999 Combat", fields: [
    { key: "element", label: "Afflatus", icon: "⏳" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "combatRole", label: "Role", icon: "🎭" },
    { key: "path", label: "Class", icon: "📜" },
  ]};

  if (c.includes("moba") || c.includes("fps") || c.includes("competitive") ||
      n.includes("league") || n.includes("valorant") || n.includes("overwatch") ||
      n.includes("mobile legends") || n.includes("wild rift")) return { label: "Competitive Metrics", fields: [
    { key: "role", label: "Role", icon: "⚔️" },
    { key: "stats.lane", label: "Lane", icon: "🛣️" },
    { key: "stats.specialty", label: "Specialty", icon: "🎯" },
    { key: "winRate", label: "Win Rate %", icon: "📊" },
    { key: "pickRate", label: "Pick Rate %", icon: "📈" },
    { key: "banRate", label: "Ban Rate %", icon: "🚫" },
  ]};

  return { label: "Combat Details", fields: [
    { key: "element", label: "Element", icon: "🔮" },
    { key: "weapon", label: "Weapon", icon: "⚔️" },
    { key: "path", label: "Class / Path", icon: "🛡️" },
    { key: "rarity", label: "Rarity", icon: "✦" },
    { key: "role", label: "Role", icon: "🎯" },
    { key: "combatRole", label: "Combat Role", icon: "⚡" },
    { key: "damageType", label: "Damage Type", icon: "💥" },
  ]};
}

export function resolveField(char: GameCharacterEntry, key: string): string | null {
  if (key.startsWith("stats.")) {
    const val = (char.stats as any)?.[key.replace("stats.", "")];
    return val !== undefined && val !== null && val !== "" ? String(val) : null;
  }
  let val = (char as any)[key];
  if (val === undefined || val === null || val === "") {
    val = (char.combat as any)?.[key] ?? (char.identity as any)?.[key] ?? (char.world as any)?.[key] ?? (char.story as any)?.[key];
  }
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return `${val}`;
  return String(val);
}

// ─── Theme-Aware Visual Information Components ─────────────────────────────────
function SectionHeader({
  title,
  icon,
  isCyber,
  elemTheme,
}: {
  title: string;
  icon?: string;
  isCyber: boolean;
  elemTheme: ElementTheme;
}) {
  return (
    <div className="flex items-center gap-3 mb-3.5 mt-7 first:mt-0 select-none">
      <div
        className="w-2 h-4 rounded-full shrink-0"
        style={{
          backgroundColor: elemTheme.primaryColor,
          boxShadow: isCyber ? `0 0 10px ${elemTheme.primaryColor}` : "none",
        }}
      />
      <h4
        className={`text-xs font-mono font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
          isCyber ? "text-white/80" : "text-gray-900"
        }`}
      >
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </h4>
      <div
        className={`flex-1 h-px ${
          isCyber ? "bg-white/[0.08]" : "bg-black/15"
        }`}
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  isCyber,
  elemTheme,
}: {
  label: string;
  value?: string | number | null;
  icon?: string;
  isCyber: boolean;
  elemTheme: ElementTheme;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all group ${
        isCyber
          ? "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.2] hover:bg-white/[0.05]"
          : "border-black bg-gray-50/90 hover:bg-white shadow-[2.5px_2.5px_0_#000]"
      }`}
      style={{
        boxShadow: isCyber ? undefined : undefined,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1 select-none">
        {icon && <span className="text-xs opacity-75">{icon}</span>}
        <span
          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider ${
            isCyber ? "text-white/45" : "text-gray-500"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-xs sm:text-sm font-bold break-words ${
          isCyber ? "text-white/95" : "text-gray-900"
        }`}
      >
        {String(value)}
      </div>
    </div>
  );
}

// ─── Game Combat Section Extension Point Component ─────────────────────────────
function GameCombatSection({
  character,
  combatConfig,
  elemTheme,
  isCyber,
}: {
  character: GameCharacterEntry;
  combatConfig: GameCombatConfig;
  elemTheme: ElementTheme;
  isCyber: boolean;
}) {
  const filledCombat = combatConfig.fields.filter((f) => resolveField(character, f.key));

  return (
    <div>
      <SectionHeader title={combatConfig.label} icon="⚔️" isCyber={isCyber} elemTheme={elemTheme} />
      {filledCombat.length === 0 ? (
        <p className={`text-xs font-mono italic py-2 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
          No combat metrics configured.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-2">
          {filledCombat.map(({ key, label, icon }) => {
            const val = resolveField(character, key);
            if (!val) return null;
            const isElementField = key === "element";

            return (
              <div
                key={key}
                className={`p-3.5 rounded-2xl border space-y-1 transition-all ${
                  isCyber
                    ? "border-white/10 bg-white/[0.04] hover:border-white/20"
                    : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
                }`}
                style={{
                  boxShadow: isCyber && isElementField ? `0 0 16px ${elemTheme.glowColorRgba}` : undefined,
                }}
              >
                <div className={`text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isCyber ? "text-white/40" : "text-gray-500"
                }`}>
                  {icon && <span className="text-[10px]">{icon}</span>}
                  <span>{label}</span>
                </div>
                <div className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate ${
                  isCyber ? "text-white/95" : "text-gray-900"
                }`}>
                  {isElementField && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: elemTheme.primaryColor,
                        boxShadow: isCyber ? `0 0 8px ${elemTheme.primaryColor}` : "none",
                      }}
                    />
                  )}
                  <span className="truncate">{val}</span>
                  {(key.includes("Rate") || key.includes("rate")) && !val.includes("%") ? "%" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function CharacterProfileModal({ isOpen, character, onClose, onEdit, onDelete }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { success: toastSuccess, error: toastError } = useToast();
  const {
    games,
    dossierCharacters,
    userLikedGameCharacterIds = [],
    likeGameCharacter,
    updateGameCharacter,
    syncGameCharacterCardImage,
    syncGameCharacterSplashArt,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Personal fields
  const [personalRating, setPersonalRating] = useState(0);
  const [pullStatus, setPullStatus] = useState("");
  const [investment, setInvestment] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const initPersonal = useCallback(() => {
    if (!character) return;
    const s = character.stats || {};
    setPersonalRating(s.personalRating || 0);
    setPullStatus(s.pullStatus || "");
    setInvestment(s.investment || "");
    setPersonalNotes(s.personalNotes || "");
    setCustomTags(s.customTags || []);
    setTagInput("");
  }, [character]);

  useEffect(() => {
    if (isOpen) { setActiveTab("overview"); initPersonal(); }
  }, [isOpen, initPersonal]);

  if (!character) return null;

  const parentGame = games.find((g) => g.id === character.gameId);
  const linkedDossierChar = dossierCharacters.find(
    (dc) =>
      (character.characterId && dc.id === character.characterId) ||
      (dc.name.toLowerCase() === character.name.toLowerCase() &&
        (dc.gameId === character.gameId ||
          dc.gameTitle?.toLowerCase() === (character.gameName || "").toLowerCase()))
  );

  const gameName = character.gameName || parentGame?.game || "";
  const accent = character.accentColor || parentGame?.accentColor || "#A855F7";
  const elemTheme = getElementTheme(character.element, accent);
  const splash = character.splashArt;
  const cardImg = character.cardImage;
  const avatar = character.avatarUrl;
  const stars = rarityStars(character.rarity);
  const combatConfig = getCombatConfig(gameName, parentGame?.category);
  const isLinked = Boolean(character.gameId && parentGame);

  // Gallery items (Splash, Card Image, Avatar, skins, extra gallery)
  const galleryImages: { src: string; label: string }[] = [];
  if (splash) galleryImages.push({ src: splash, label: "Splash Art (Profile)" });
  if (cardImg && cardImg !== splash) galleryImages.push({ src: cardImg, label: "Card Image (Roster)" });
  if (avatar && avatar !== splash && avatar !== cardImg) galleryImages.push({ src: avatar, label: "Avatar Icon" });
  (character.gallery || character.stats?.gallery || []).forEach((img: string, i: number) =>
    galleryImages.push({ src: img, label: `Gallery Image ${i + 1}` }));

  const hasImg = (u?: string) => Boolean(u && (u.startsWith("http") || u.startsWith("data:") || u.startsWith("/")));

  const handleToggleFav = () => updateGameCharacter(character.id, { isFavorite: !character.isFavorite });
  const handleSavePersonal = async () => {
    await updateGameCharacter(character.id, {
      stats: {
        ...(character.stats || {}),
        personalRating,
        pullStatus: pullStatus || undefined,
        investment: investment || undefined,
        personalNotes: personalNotes || undefined,
        customTags: customTags.length > 0 ? customTags : undefined,
      },
    });
    toastSuccess("Saved personal notes & preferences! 💾");
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !customTags.includes(t)) setCustomTags([...customTags, t]);
    setTagInput("");
  };

  // Image Sync Handlers
  const handleSyncCardImage = async () => {
    if (!linkedDossierChar) return;
    if (confirm(`Sync Card Image with Game Database entry "${linkedDossierChar.name}"?`)) {
      await syncGameCharacterCardImage(character.id, linkedDossierChar.id, "to_game_character");
    }
  };
  const handleSyncSplashArt = async () => {
    if (!linkedDossierChar) return;
    if (confirm(`Sync Splash Art with Game Database entry "${linkedDossierChar.name}"?`)) {
      await syncGameCharacterSplashArt(character.id, linkedDossierChar.id, "to_game_character");
    }
  };

  // ── Tab contents ────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        const va = character.voiceActors || character.voice || character.stats?.voiceActors || {};
        const vaEntries = [
          { lang: "Japanese", flag: "🇯🇵", val: va.jp || va.japanese },
          { lang: "Chinese",  flag: "🇨🇳", val: va.cn || va.chinese },
          { lang: "Korean",   flag: "🇰🇷", val: va.kr || va.korean },
          { lang: "English",  flag: "🇺🇸", val: va.en || va.english },
        ].filter(e => e.val);

        const bio = character.biography || character.story?.biography || character.stats?.biography;
        const personality = character.personality || character.story?.personality || character.stats?.personality;
        const officialDesc = character.officialDescription || character.story?.officialDescription || character.stats?.officialDescription;
        const quote = character.favoriteQuote || character.story?.favoriteQuote || character.stats?.favoriteQuote;

        return (
          <div className="space-y-3">
            {/* Quote Banner */}
            {quote && (
              <blockquote
                className={`p-4 mb-4 rounded-2xl border text-base italic font-medium leading-relaxed ${
                  isCyber ? "border-white/10 bg-white/[0.03] text-white/90" : "border-black/20 bg-amber-50 text-gray-900 shadow-[3px_3px_0_#000]"
                }`}
                style={{
                  borderLeft: `4px solid ${elemTheme.primaryColor}`,
                  boxShadow: isCyber ? `0 0 20px ${elemTheme.glowColorRgba}` : undefined,
                }}
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}

            {/* Section 1: Identity & Profile */}
            <SectionHeader title="Identity & Profile" icon="👤" isCyber={isCyber} elemTheme={elemTheme} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <InfoCard label="Official Name" value={character.officialName || character.identity?.officialName || character.stats?.officialName} icon="🪪" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Native Name" value={character.nativeName || character.identity?.nativeName || character.stats?.nativeName} icon="⛩️" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Alias" value={character.alias || character.identity?.alias || character.stats?.alias} icon="🕵️" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Nickname" value={character.nickname || character.identity?.nickname || character.stats?.nickname} icon="💬" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Title" value={character.title || character.identity?.title} icon="👑" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Gender" value={character.gender || character.identity?.gender || character.stats?.gender} icon="🚻" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Birthday" value={character.birthday || character.identity?.birthday || character.combat?.birthday} icon="🎂" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Age" value={character.age || character.identity?.age || character.stats?.age} icon="⏳" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Height" value={character.height || character.identity?.height || character.stats?.height} icon="📏" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Weight" value={character.weight || character.identity?.weight || character.stats?.weight} icon="⚖️" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Species" value={character.species || character.identity?.species || character.stats?.species} icon="🧬" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Race" value={character.race || character.identity?.race || character.stats?.race} icon="🌐" isCyber={isCyber} elemTheme={elemTheme} />
            </div>

            {/* Section 2: World & Faction */}
            <SectionHeader title="World & Faction" icon="🌍" isCyber={isCyber} elemTheme={elemTheme} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <InfoCard label="Nation" value={character.nation || character.world?.nation || character.combat?.nation} icon="🏛️" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Region" value={character.region || character.world?.region || character.stats?.region} icon="🗺️" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Planet" value={character.planet || character.world?.planet || character.stats?.planet} icon="🪐" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Organization" value={character.organization || character.world?.organization || character.stats?.organization} icon="🏢" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Affiliation" value={character.affiliation || character.world?.affiliation || character.stats?.affiliation} icon="🤝" isCyber={isCyber} elemTheme={elemTheme} />
              <InfoCard label="Faction" value={character.faction || character.world?.faction || character.stats?.faction} icon="🚩" isCyber={isCyber} elemTheme={elemTheme} />
            </div>

            {/* Section 3: Game & Combat (Extensible Component) */}
            <GameCombatSection character={character} combatConfig={combatConfig} elemTheme={elemTheme} isCyber={isCyber} />

            {/* Section 4: Voice Actors */}
            <SectionHeader title="Voice Actors" icon="🎙️" isCyber={isCyber} elemTheme={elemTheme} />
            {vaEntries.length === 0 ? (
              <p className={`text-xs font-mono italic py-2 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                No voice actor credits registered.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                {vaEntries.map(({ lang, flag, val }) => (
                  <div
                    key={lang}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      isCyber
                        ? "border-white/10 bg-white/[0.03] hover:border-white/20"
                        : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
                    }`}
                  >
                    <span className="text-2xl shrink-0 select-none">{flag}</span>
                    <div className="min-w-0">
                      <div className={`text-[9px] font-mono font-bold uppercase tracking-wider truncate ${
                        isCyber ? "text-white/40" : "text-gray-500"
                      }`}>{lang}</div>
                      <div className={`text-xs sm:text-sm font-bold truncate ${
                        isCyber ? "text-white/95" : "text-gray-900"
                      }`}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 5: Story & Lore */}
            <SectionHeader title="Story & Lore" icon="📖" isCyber={isCyber} elemTheme={elemTheme} />
            <div className="space-y-4">
              {officialDesc && (
                <div className={`p-4 rounded-2xl border ${
                  isCyber ? "border-white/10 bg-white/[0.03]" : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
                }`}>
                  <h5 className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isCyber ? "text-white/45" : "text-gray-600"
                  }`}>
                    Official Overview
                  </h5>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isCyber ? "text-white/85" : "text-gray-800"}`}>{officialDesc}</p>
                </div>
              )}
              {personality && (
                <div className={`p-4 rounded-2xl border ${
                  isCyber ? "border-white/10 bg-white/[0.03]" : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
                }`}>
                  <h5 className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isCyber ? "text-white/45" : "text-gray-600"
                  }`}>
                    Personality Traits
                  </h5>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isCyber ? "text-white/85" : "text-gray-800"}`}>{personality}</p>
                </div>
              )}
              {bio && (
                <div className={`p-4 rounded-2xl border ${
                  isCyber ? "border-white/10 bg-white/[0.03]" : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
                }`}>
                  <h5 className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                    isCyber ? "text-white/45" : "text-gray-600"
                  }`}>
                    Biography
                  </h5>
                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/85" : "text-gray-800"}`}>{bio}</p>
                </div>
              )}
              {!bio && !officialDesc && !personality && (
                <p className={`text-xs font-mono italic py-2 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                  No official lore bio registered yet.
                </p>
              )}
            </div>
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            {/* Gallery Control Bar */}
            <div className={`flex items-center justify-between gap-2 p-3.5 rounded-2xl border flex-wrap ${
              isCyber ? "border-white/10 bg-white/[0.04]" : "border-black bg-gray-50 shadow-[2.5px_2.5px_0_#000]"
            }`}>
              <span className={`text-xs font-mono font-bold ${isCyber ? "text-white/70" : "text-gray-800"}`}>
                🖼️ Gallery ({galleryImages.length} items)
              </span>

              {linkedDossierChar && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncCardImage}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      isCyber
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                        : "border-black bg-cyan-200 text-black hover:bg-cyan-300 shadow-[2px_2px_0_#000]"
                    }`}
                    title="Sync Card Image with Game Database"
                  >
                    🔄 Sync Card Image
                  </button>
                  <button
                    onClick={handleSyncSplashArt}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      isCyber
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                        : "border-black bg-purple-200 text-black hover:bg-purple-300 shadow-[2px_2px_0_#000]"
                    }`}
                    title="Sync Splash Art with Game Database"
                  >
                    🔄 Sync Splash Art
                  </button>
                </div>
              )}
            </div>

            {galleryImages.length === 0 ? (
              <div className={`text-center py-20 font-mono text-sm space-y-3 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                <div className="text-4xl opacity-50">🖼️</div>
                <p>No images uploaded yet.</p>
                <button onClick={() => onEdit?.(character)} className="text-xs underline opacity-70 hover:opacity-100 cursor-pointer">
                  Upload images in Editor →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {galleryImages.map(({ src, label }, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => { setLightboxSrc(src); setLightboxTitle(label); setLightboxIndex(i); }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in border group ${
                      isCyber ? "border-white/10 bg-black/40" : "border-black bg-gray-100 shadow-[3px_3px_0_#000]"
                    }`}
                  >
                    {src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("data:video/") || /\.(mp4|webm|mov)(?:[?#]|$)/i.test(src) ? (
                      <video
                        src={src}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src={src}
                        alt={label}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[10px] font-mono text-white font-bold">{label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case "personal":
        return (
          <div className="space-y-6 max-w-xl">
            {/* Rating */}
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-bold mb-3 ${
                isCyber ? "text-white/50" : "text-gray-700"
              }`}>
                Personal Rating (1-10)
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPersonalRating(personalRating === n ? 0 : n)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      n <= personalRating
                        ? isCyber
                          ? "bg-purple-500/25 border-purple-500 text-purple-300"
                          : "bg-amber-400 border-black text-black shadow-[2px_2px_0_#000]"
                        : isCyber
                          ? "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Pull Status */}
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-bold mb-3 ${
                isCyber ? "text-white/50" : "text-gray-700"
              }`}>
                Pull / Collection Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "pulled",     l: "✅ Pulled",     c: "#22C55E" },
                  { v: "wishlisted", l: "⭐ Wishlisted", c: "#EAB308" },
                  { v: "saving",     l: "💎 Saving For", c: "#3B82F6" },
                  { v: "skipped",    l: "⏭ Skipped",    c: "#6B7280" },
                ].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setPullStatus(pullStatus === o.v ? "" : o.v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      pullStatus === o.v
                        ? isCyber
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-emerald-300 border-black text-black shadow-[2px_2px_0_#000]"
                        : isCyber
                          ? "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Investment */}
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-bold mb-3 ${
                isCyber ? "text-white/50" : "text-gray-700"
              }`}>
                Investment Level
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "low",    l: "🌱 Minimal"   },
                  { v: "medium", l: "⚡ Moderate"  },
                  { v: "high",   l: "🔥 Heavy"     },
                  { v: "max",    l: "💯 Max Built"  },
                ].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setInvestment(investment === o.v ? "" : o.v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      investment === o.v
                        ? isCyber
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-cyan-300 border-black text-black shadow-[2px_2px_0_#000]"
                        : isCyber
                          ? "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-bold mb-3 ${
                isCyber ? "text-white/50" : "text-gray-700"
              }`}>
                Custom Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {customTags.map(tag => (
                  <span
                    key={tag}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-mono border ${
                      isCyber ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-black bg-cyan-100 text-black shadow-[1.5px_1.5px_0_#000]"
                    }`}
                  >
                    #{tag}
                    <button type="button" onClick={() => setCustomTags(customTags.filter(t => t !== tag))}
                      className="opacity-60 hover:opacity-100 ml-1 cursor-pointer">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add custom tag…"
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                    isCyber
                      ? "border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-cyan-500"
                      : "border-black bg-white text-gray-900 placeholder-gray-400 focus:ring-black shadow-[2px_2px_0_#000]"
                  }`}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isCyber
                      ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                      : "border-black bg-yellow-400 text-black hover:bg-yellow-300 shadow-[2px_2px_0_#000]"
                  }`}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-bold mb-3 ${
                isCyber ? "text-white/50" : "text-gray-700"
              }`}>
                Personal Notes & Build Thoughts
              </label>
              <textarea
                value={personalNotes}
                onChange={e => setPersonalNotes(e.target.value)}
                placeholder="Your personal build notes, combo guides, team compositions…"
                className={`w-full p-3 rounded-2xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                  isCyber
                    ? "border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-cyan-500"
                    : "border-black bg-white text-gray-900 placeholder-gray-400 focus:ring-black shadow-[2px_2px_0_#000]"
                }`}
                style={{ resize: "none", minHeight: "120px" }}
              />
            </div>

            <button
              type="button"
              onClick={handleSavePersonal}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${
                isCyber
                  ? "text-white shadow-[0_4px_24px_rgba(0,245,255,0.3)]"
                  : "text-black border-2 border-black bg-yellow-400 hover:bg-yellow-300 shadow-[4px_4px_0_#000]"
              }`}
              style={{
                background: isCyber ? `linear-gradient(135deg, ${elemTheme.primaryColor}CC, #BF5FFF99)` : undefined,
              }}
            >
              💾 Save Personal Data
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Backdrop ────────────────────────────────────────────────── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[900]"
              style={{ backgroundColor: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }}
              onClick={onClose}
            />

            {/* ── Modal Container ────────────────────────────────────────── */}
            <div data-modal-open="true" className="fixed inset-0 z-[901] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  boxShadow: isCyber
                    ? [
                        `0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px ${elemTheme.primaryColor}35, 0 0 45px ${elemTheme.glowColorRgba}`,
                        `0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px ${elemTheme.primaryColor}65, 0 0 85px ${elemTheme.glowColorRgba}`,
                        `0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px ${elemTheme.primaryColor}35, 0 0 45px ${elemTheme.glowColorRgba}`,
                      ]
                    : "10px 10px 0 #000000",
                }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{
                  scale: { type: "spring", stiffness: 360, damping: 32 },
                  opacity: { duration: 0.2 },
                  boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="pointer-events-auto flex flex-col overflow-hidden relative shadow-2xl w-full"
                style={{
                  maxWidth: "1240px",
                  width: "clamp(320px, 88vw, 1240px)",
                  height: "clamp(520px, 92vh, 940px)",
                  borderRadius: isCyber ? "26px" : "20px",
                  backgroundColor: isCyber ? "#05070e" : "#FFFFFF",
                  borderColor: isCyber ? `${elemTheme.primaryColor}40` : "#000000",
                  borderWidth: isCyber ? "1.5px" : "3.5px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Ambient Top Glow Layer */}
                {isCyber && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-48 pointer-events-none opacity-90 z-0 transition-all duration-700"
                    style={{
                      background: elemTheme.headerAuraGradientCyber,
                    }}
                  />
                )}

                {/* ── Floating Controls Top-Right ──────────────────────────── */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                  {onEdit && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit?.(character)}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer select-none"
                      style={{
                        backgroundColor: isCyber ? `${elemTheme.primaryColor}25` : "#FFE600",
                        borderColor: isCyber ? `${elemTheme.primaryColor}60` : "#000000",
                        borderWidth: isCyber ? "1.5px" : "2px",
                        color: isCyber ? "#FFF" : "#000",
                        boxShadow: isCyber ? `0 0 16px ${elemTheme.primaryColor}40` : "3px 3px 0 #000",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      ✏️ Edit
                    </motion.button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer font-bold select-none"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "#FFFFFF",
                      color: isCyber ? "rgba(255,255,255,0.8)" : "#000000",
                      backdropFilter: "blur(12px)",
                      borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: isCyber ? undefined : "2px 2px 0 #000",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* ── Continuous Scroll Area (Splash Art + Sticky Tabs + Body) ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain relative custom-scrollbar">
                  {/* ── Splash Art Hero Banner (Full Bleed Edge-to-Edge Header) ───── */}
                  <div className="relative overflow-hidden w-full shrink-0" style={{ height: "clamp(360px, 50vh, 460px)" }}>
                    {/* Element Particles */}
                    <ElementParticles theme={elemTheme} isCyber={isCyber} />

                    {/* Background Hero Image */}
                    {hasImg(splash) ? (
                      <motion.img
                        src={splash!}
                        alt={character.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ filter: isCyber ? "saturate(1.15)" : "none" }}
                        draggable={false}
                      />
                    ) : hasImg(cardImg) || hasImg(avatar) ? (
                      <img
                        src={(cardImg || avatar)!}
                        alt={character.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        style={{ filter: "brightness(0.85)" }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: isCyber
                            ? `radial-gradient(ellipse at 50% 30%, ${elemTheme.primaryColor}35 0%, transparent 70%), #080c1e`
                            : `radial-gradient(ellipse at 50% 30%, ${elemTheme.primaryColor}25 0%, transparent 70%), #FFF8F0`,
                        }}
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: isCyber
                          ? "linear-gradient(to bottom, rgba(5,7,14,0.15) 0%, rgba(5,7,14,0.65) 75%, rgba(5,7,14,1) 100%)"
                          : "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.7) 75%, rgba(255,255,255,1) 100%)",
                      }}
                    />

                    {/* Hero content bottom */}
                    <div className="absolute bottom-0 left-0 right-0 px-7 pb-5 z-10">
                      {stars && (
                        <div
                          className="text-base tracking-widest mb-1 font-bold"
                          style={{
                            color: isCyber ? "#FFD700" : "#D97706",
                            textShadow: isCyber ? "0 0 12px rgba(255,215,0,0.6)" : undefined,
                          }}
                        >
                          {stars}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                        {/* Character Profile Portrait (Avatar / Card Image / Fallback) */}
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => {
                            const portraitSrc = avatar || cardImg;
                            if (portraitSrc) {
                              setLightboxSrc(portraitSrc);
                              setLightboxTitle(`${character.name} Avatar`);
                            }
                          }}
                          className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl md:rounded-3xl overflow-hidden border-2 shadow-2xl relative group flex items-center justify-center font-black text-4xl ${
                            hasImg(avatar) || hasImg(cardImg) ? "cursor-zoom-in" : ""
                          }`}
                          style={{
                            borderColor: isCyber ? `${elemTheme.primaryColor}` : "#000000",
                            borderWidth: isCyber ? "2.5px" : "3.5px",
                            boxShadow: isCyber
                              ? `0 0 32px ${elemTheme.primaryColor}65, 0 10px 30px rgba(0,0,0,0.85)`
                              : "6px 6px 0 #000000",
                            backgroundColor: isCyber ? "rgba(5,7,14,0.9)" : "#FFFFFF",
                            color: elemTheme.primaryColor,
                          }}
                        >
                          {hasImg(avatar) || hasImg(cardImg) ? (
                            <img
                              src={(hasImg(avatar) ? avatar : cardImg)!}
                              alt={character.name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="select-none drop-shadow-md">{character.name.charAt(0)}</span>
                          )}
                        </motion.div>

                        <div className="flex-1">
                          <h2
                            className="text-4xl md:text-5xl font-black leading-none tracking-tight"
                            style={{
                              color: isCyber ? "#FFFFFF" : "#000000",
                              textShadow: isCyber ? `0 2px 24px rgba(0,0,0,0.9), 0 0 30px ${elemTheme.primaryColor}40` : undefined,
                            }}
                          >
                            {character.name}
                            {character.isFavorite && (
                              <motion.span
                                className="ml-3 text-2xl"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                              >
                                ⭐
                              </motion.span>
                            )}
                          </h2>
                          {gameName && (
                            <p className="text-sm font-mono opacity-70 mt-1.5 flex items-center gap-2" style={{ color: isCyber ? "#94A3B8" : "#4B5563" }}>
                              <span>🎮 {gameName}</span>
                            </p>
                          )}

                          {/* Badges & Action Controls */}
                          <div className="flex items-center gap-2 flex-wrap mt-3">
                            {character.element && (
                              <span
                                className="px-3.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm"
                                style={{
                                  backgroundColor: isCyber ? elemTheme.badgeBgCyber : elemTheme.badgeBgBrutal,
                                  borderColor: isCyber ? elemTheme.badgeBorderCyber : elemTheme.badgeBorderBrutal,
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? elemTheme.badgeTextCyber : elemTheme.badgeTextBrutal,
                                }}
                              >
                                <span>{elemTheme.icon}</span>
                                <span>{character.element}</span>
                              </span>
                            )}
                            {character.role && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold border"
                                style={{
                                  backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "#F3F4F6",
                                  borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? "#FFFFFF" : "#000000",
                                }}
                              >
                                {character.role}
                              </span>
                            )}
                            {character.rarity && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold border"
                                style={{
                                  backgroundColor: isCyber ? "rgba(234,179,8,0.15)" : "#FEF3C7",
                                  borderColor: isCyber ? "rgba(234,179,8,0.4)" : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? "#FDE047" : "#000000",
                                }}
                              >
                                ✦ {character.rarity}
                              </span>
                            )}

                            {/* Like Button */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={async () => {
                                try {
                                  const res = await likeGameCharacter(character.id);
                                  if (res.liked) {
                                    toastSuccess(`Liked ${character.name}! ❤️`);
                                  }
                                } catch (err: any) {
                                  toastError(err.message || "Sign in to like this character.");
                                }
                              }}
                              className="px-3.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border shadow-sm select-none"
                              style={{
                                backgroundColor: userLikedGameCharacterIds.includes(character.id)
                                  ? isCyber
                                    ? "rgba(255,20,147,0.25)"
                                    : "#FFE4E6"
                                  : isCyber
                                  ? "rgba(255,255,255,0.08)"
                                  : "#F8FAFC",
                                color: userLikedGameCharacterIds.includes(character.id)
                                  ? isCyber
                                    ? "#FF1493"
                                    : "#E11D48"
                                  : isCyber
                                  ? "#E2E8F0"
                                  : "#000000",
                                borderColor: userLikedGameCharacterIds.includes(character.id)
                                  ? isCyber
                                    ? "#FF1493"
                                    : "#E11D48"
                                  : isCyber
                                  ? "rgba(255,255,255,0.2)"
                                  : "#000000",
                                borderWidth: isCyber ? "1px" : "2px",
                                boxShadow: userLikedGameCharacterIds.includes(character.id)
                                  ? isCyber
                                    ? "0 0 14px rgba(255,20,147,0.4)"
                                    : "2px 2px 0 #000000"
                                  : "none",
                              }}
                            >
                              <span className={userLikedGameCharacterIds.includes(character.id) ? "animate-pulse text-sm" : "text-sm opacity-80"}>❤️</span>
                              <span>{character.likes ? `${character.likes.toLocaleString()} Likes` : "Like"}</span>
                            </motion.button>

                            {isLinked ? (
                              <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border"
                                style={{
                                  backgroundColor: isCyber ? "rgba(34,197,94,0.15)" : "#DCFCE7",
                                  borderColor: isCyber ? "rgba(34,197,94,0.3)" : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? "#4ADE80" : "#15803D",
                                }}
                              >
                                ✓ Linked DB
                              </span>
                            ) : (
                              <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border"
                                style={{
                                  backgroundColor: isCyber ? "rgba(245,158,11,0.15)" : "#FEF3C7",
                                  borderColor: isCyber ? "rgba(245,158,11,0.3)" : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? "#FBBF24" : "#B45309",
                                }}
                              >
                                ⚠️ Unlinked
                              </span>
                            )}

                            {character.gameId && (
                              <button
                                onClick={() => {
                                  window.location.href = `/games/${character.gameId}`;
                                }}
                                className="px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 select-none"
                                style={{
                                  backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
                                  borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? "#00F5FF" : "#0369A1",
                                }}
                                title="Open Character Collection in Game Database"
                              >
                                🎮 Open Character Collection
                              </button>
                            )}

                            <button
                              onClick={handleToggleFav}
                              className="px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer select-none"
                              style={{
                                backgroundColor: character.isFavorite
                                  ? isCyber ? "rgba(251,191,36,0.18)" : "#FEF08A"
                                  : isCyber ? "rgba(255,255,255,0.07)" : "#FFFFFF",
                                borderColor: character.isFavorite
                                  ? isCyber ? "rgba(251,191,36,0.6)" : "#000000"
                                  : isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                                borderWidth: isCyber ? "1px" : "1.5px",
                                color: character.isFavorite ? (isCyber ? "#FBB724" : "#000000") : (isCyber ? "rgba(255,255,255,0.45)" : "#6B7280"),
                              }}
                            >
                              {character.isFavorite ? "❤ Favorited" : "♡ Favorite"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Sticky Tab Bar (Overview, Gallery, Personal) ──────────── */}
                  <div
                    className="sticky top-0 z-20 flex items-center px-6 border-b select-none"
                    style={{
                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                      borderBottomWidth: isCyber ? "1px" : "2px",
                      backgroundColor: isCyber ? "rgba(5,7,14,0.96)" : "#FFFFFF",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="relative flex items-center gap-2 px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer"
                          style={{
                            color: isActive
                              ? isCyber ? elemTheme.primaryColor : "#000000"
                              : isCyber ? "rgba(255,255,255,0.35)" : "#6B7280",
                          }}
                        >
                          <span className="text-base">{tab.icon}</span>
                          <span>{tab.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="profile-tab-line"
                              className="absolute bottom-0 left-0 right-0"
                              style={{
                                height: isCyber ? "2px" : "3px",
                                backgroundColor: isCyber ? elemTheme.primaryColor : "#000000",
                                boxShadow: isCyber ? `0 0 10px ${elemTheme.primaryColor}` : "none",
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Scrollable Body Content ───────────────────────────────── */}
                  <div className="px-7 py-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                      >
                        {renderTab()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────────────── */}
                <div
                  className="px-7 py-3.5 border-t shrink-0 flex items-center justify-between z-20 select-none"
                  style={{
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                    borderTopWidth: isCyber ? "1px" : "2px",
                    backgroundColor: isCyber ? "#05070e" : "#F9FAFB",
                  }}
                >
                  <span className={`text-xs font-mono font-medium ${isCyber ? "text-white/40" : "text-gray-600"}`}>
                    {character.rank && character.rank > 0 ? `Ranked #${character.rank} in personal roster` : "Character Inspection Viewport"}
                  </span>
                  <button
                    onClick={() => { if (confirm(`Remove ${character.name} from your roster?`)) { onDelete?.(character); onClose(); } }}
                    className={`text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                      isCyber ? "text-red-400/70 hover:text-red-400" : "text-red-600 hover:text-red-700"
                    }`}
                  >
                    🗑️ Remove Character
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ImageLightboxModal
        isOpen={Boolean(lightboxSrc)}
        imageUrl={lightboxSrc || ""}
        images={galleryImages.map(g => ({ src: g.src, label: g.label }))}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
        onClose={() => setLightboxSrc(null)}
      />
    </>
  );
}
