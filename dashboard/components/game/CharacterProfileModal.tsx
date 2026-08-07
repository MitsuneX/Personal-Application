"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { GameCharacterEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  character: GameCharacterEntry | null;
  onClose: () => void;
  onEdit: (character: GameCharacterEntry) => void;
  onDelete: (character: GameCharacterEntry) => void;
}

const TABS = [
  { id: "overview", label: "Overview", icon: "📋" },
  { id: "gallery",  label: "Gallery",  icon: "🖼️" },
  { id: "personal", label: "Personal", icon: "💜" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Element colours ──────────────────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
  pyro:"#FF4A4A", hydro:"#1E90FF", anemo:"#4DC9A9", geo:"#CFA827",
  electro:"#A855F7", cryo:"#8FBCD4", dendro:"#5CB85C", fire:"#FF4A4A",
  water:"#1E90FF", ice:"#8FBCD4", wind:"#4DC9A9", lightning:"#A855F7",
  rock:"#CFA827", quantum:"#A855F7", imaginary:"#D4A017", physical:"#94A3B8",
  glacio:"#8FBCD4", fusion:"#FF6B35", havoc:"#DC2626", aero:"#4DC9A9",
  spectro:"#F4C430", cyber:"#00F5FF", digital:"#22D3EE", bio:"#5CB85C",
  dark:"#7C3AED", light:"#FCD34D",
};
function elColor(el?: string) {
  if (!el) return "#A855F7";
  return ELEMENT_COLORS[el.toLowerCase().replace(/[^a-z]/g, "")] || "#A855F7";
}
function rarityStars(r?: string) {
  if (!r) return null;
  const m = r.match(/(\d)/);
  if (!m) return null;
  const n = Math.min(parseInt(m[1]), 6);
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

// ─── Game-specific combat config ──────────────────────────────────────────────
function getCombatConfig(gameName?: string, gameCategory?: string) {
  const n = (gameName || "").toLowerCase();
  const c = (gameCategory || "").toLowerCase();
  if (n.includes("wuthering waves")) return { label: "Wuthering Waves Combat", fields: [
    { key: "element", label: "Element" }, { key: "weapon", label: "Weapon" },
    { key: "role", label: "Role" }, { key: "combatRole", label: "Combat Role" },
    { key: "stats.signatureWeapon", label: "Signature Weapon" },
    { key: "stats.resonanceChain", label: "Resonance Chain" },
    { key: "stats.echoRecommendation", label: "Echo Recommendation" },
  ]};
  if (n.includes("star rail") || n.includes("honkai: star rail")) return { label: "Honkai: Star Rail Combat", fields: [
    { key: "path", label: "Path" }, { key: "element", label: "Element" },
    { key: "rarity", label: "Rarity" }, { key: "combatRole", label: "Role" },
    { key: "stats.lightCone", label: "Light Cone" }, { key: "stats.eidolon", label: "Eidolon" },
  ]};
  if (n.includes("genshin")) return { label: "Genshin Impact Combat", fields: [
    { key: "element", label: "Vision" }, { key: "weapon", label: "Weapon" },
    { key: "rarity", label: "Rarity" }, { key: "nation", label: "Nation" },
    { key: "stats.constellation", label: "Constellation" }, { key: "stats.ascension", label: "Ascension" },
  ]};
  if (n.includes("zenless zone zero") || n.includes("zzz")) return { label: "Zenless Zone Zero Combat", fields: [
    { key: "element", label: "Attribute" }, { key: "path", label: "Specialty" },
    { key: "faction", label: "Faction" }, { key: "rarity", label: "Rarity" },
    { key: "weapon", label: "W-Engine / Weapon" },
  ]};
  if (n.includes("nikke") || n.includes("goddess of victory")) return { label: "NIKKE Combat", fields: [
    { key: "stats.manufacturer", label: "Manufacturer" }, { key: "element", label: "Code" },
    { key: "stats.burstType", label: "Burst Type" }, { key: "weapon", label: "Weapon" },
    { key: "rarity", label: "Rarity" },
  ]};
  if (n.includes("arknights")) return { label: "Arknights Combat", fields: [
    { key: "path", label: "Class" }, { key: "stats.branch", label: "Branch" },
    { key: "rarity", label: "Rarity" }, { key: "faction", label: "Faction" },
  ]};
  if (n.includes("punishing") || n.includes("gray raven")) return { label: "Punishing: Gray Raven Combat", fields: [
    { key: "path", label: "Class" }, { key: "element", label: "Element" },
    { key: "rarity", label: "Rarity" }, { key: "combatRole", label: "Role" },
  ]};
  if (n.includes("reverse: 1999") || n.includes("reverse1999")) return { label: "Reverse: 1999 Combat", fields: [
    { key: "element", label: "Afflatus" }, { key: "rarity", label: "Rarity" },
    { key: "combatRole", label: "Role" }, { key: "path", label: "Class" },
  ]};
  if (c.includes("moba") || c.includes("fps") || c.includes("competitive") ||
      n.includes("league") || n.includes("valorant") || n.includes("overwatch") ||
      n.includes("mobile legends") || n.includes("wild rift")) return { label: "Competitive Stats", fields: [
    { key: "role", label: "Role" }, { key: "stats.lane", label: "Lane" },
    { key: "stats.specialty", label: "Specialty" }, { key: "winRate", label: "Win Rate %" },
    { key: "pickRate", label: "Pick Rate %" }, { key: "banRate", label: "Ban Rate %" },
  ]};
  return { label: "Combat Details", fields: [
    { key: "element", label: "Element" }, { key: "weapon", label: "Weapon" },
    { key: "path", label: "Class / Path" }, { key: "rarity", label: "Rarity" },
    { key: "role", label: "Role" }, { key: "combatRole", label: "Combat Role" },
    { key: "damageType", label: "Damage Type" },
  ]};
}
function resolveField(char: GameCharacterEntry, key: string): string | null {
  if (key.startsWith("stats.")) {
    const val = (char.stats as any)?.[key.replace("stats.", "")];
    return val ? String(val) : null;
  }
  const val = (char as any)[key];
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return `${val}`;
  return String(val);
}

// ─── Theme-Aware Sub-components ────────────────────────────────────────────────
function InfoRow({ label, value, isCyber }: { label: string; value?: string | null; isCyber: boolean }) {
  if (!value) return null;
  return (
    <div
      className={`flex items-start gap-3 py-2.5 border-b last:border-0 ${
        isCyber ? "border-white/[0.06]" : "border-black/10"
      }`}
    >
      <span
        className={`text-[10px] font-mono font-bold uppercase tracking-widest w-32 shrink-0 pt-0.5 ${
          isCyber ? "text-white/40" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <span className={`text-sm break-words flex-1 font-medium ${isCyber ? "text-white/90" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children, isCyber }: { children: React.ReactNode; isCyber: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7 first:mt-0">
      <span className={`flex-1 h-px ${isCyber ? "bg-white/[0.1]" : "bg-black/20"}`} />
      <span
        className={`text-[10px] font-mono font-black uppercase tracking-[0.2em] ${
          isCyber ? "text-white/40" : "text-gray-700"
        }`}
      >
        {children}
      </span>
      <span className={`flex-1 h-px ${isCyber ? "bg-white/[0.1]" : "bg-black/20"}`} />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function CharacterProfileModal({ isOpen, character, onClose, onEdit, onDelete }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    games,
    dossierCharacters,
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
  const ec = elColor(character.element);
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
        const filledCombat = combatConfig.fields.filter(f => resolveField(character, f.key));
        const va = character.voiceActors || character.stats?.voiceActors || {};
        const vaEntries = [
          { lang: "Japanese", flag: "🇯🇵", val: va.jp },
          { lang: "Chinese",  flag: "🇨🇳", val: va.cn },
          { lang: "Korean",   flag: "🇰🇷", val: va.kr },
          { lang: "English",  flag: "🇺🇸", val: va.en },
        ].filter(e => e.val);

        const bio = character.biography || character.stats?.biography;
        const personality = character.personality || character.stats?.personality;
        const officialDesc = character.officialDescription || character.stats?.officialDescription;
        const quote = character.favoriteQuote || character.stats?.favoriteQuote;

        return (
          <div className="space-y-2">
            {/* Quote Banner */}
            {quote && (
              <blockquote
                className={`p-4 mb-4 rounded-2xl border text-base italic font-medium leading-relaxed ${
                  isCyber ? "border-white/10 bg-white/[0.03] text-white/80" : "border-black/20 bg-amber-50 text-gray-900"
                }`}
                style={{ borderLeft: `4px solid ${accent}` }}
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}

            {/* Section 1: Identity */}
            <SectionTitle isCyber={isCyber}>Identity & Profile</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoRow label="Official Name" value={character.officialName || character.stats?.officialName} isCyber={isCyber} />
              <InfoRow label="Native Name" value={character.nativeName || character.stats?.nativeName} isCyber={isCyber} />
              <InfoRow label="Alias" value={character.alias || character.stats?.alias} isCyber={isCyber} />
              <InfoRow label="Nickname" value={character.nickname || character.stats?.nickname} isCyber={isCyber} />
              <InfoRow label="Title" value={character.title} isCyber={isCyber} />
              <InfoRow label="Gender" value={character.gender || character.stats?.gender} isCyber={isCyber} />
              <InfoRow label="Birthday" value={character.birthday} isCyber={isCyber} />
              <InfoRow label="Age" value={character.age || character.stats?.age} isCyber={isCyber} />
              <InfoRow label="Height" value={character.height || character.stats?.height} isCyber={isCyber} />
              <InfoRow label="Weight" value={character.weight || character.stats?.weight} isCyber={isCyber} />
              <InfoRow label="Species" value={character.species || character.stats?.species} isCyber={isCyber} />
              <InfoRow label="Race" value={character.race || character.stats?.race} isCyber={isCyber} />
            </div>

            {/* Section 2: World */}
            <SectionTitle isCyber={isCyber}>World & Faction</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoRow label="Nation" value={character.nation} isCyber={isCyber} />
              <InfoRow label="Region" value={character.region || character.stats?.region} isCyber={isCyber} />
              <InfoRow label="Planet" value={character.planet || character.stats?.planet} isCyber={isCyber} />
              <InfoRow label="Organization" value={character.organization || character.stats?.organization} isCyber={isCyber} />
              <InfoRow label="Affiliation" value={character.affiliation || character.stats?.affiliation} isCyber={isCyber} />
              <InfoRow label="Faction" value={character.faction || character.stats?.faction} isCyber={isCyber} />
            </div>

            {/* Section 3: Combat */}
            <SectionTitle isCyber={isCyber}>{combatConfig.label}</SectionTitle>
            {filledCombat.length === 0 ? (
              <p className={`text-xs font-mono italic py-2 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                No combat metrics configured.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-2">
                {filledCombat.map(({ key, label }) => {
                  const val = resolveField(character, key);
                  if (!val) return null;
                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-2xl border space-y-1 ${
                        isCyber
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-black/15 bg-gray-50 shadow-[2px_2px_0_#000]"
                      }`}
                    >
                      <div className={`text-[9px] font-mono uppercase tracking-wider ${isCyber ? "text-white/35" : "text-gray-500"}`}>
                        {label}
                      </div>
                      <div className={`text-sm font-bold flex items-center gap-1.5 truncate ${isCyber ? "text-white/90" : "text-gray-900"}`}>
                        {key === "element" && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ec }} />}
                        {val}{(key.includes("Rate") || key.includes("rate")) && !val.includes("%") ? "%" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section 4: Voice Actors */}
            <SectionTitle isCyber={isCyber}>Voice Actors</SectionTitle>
            {vaEntries.length === 0 ? (
              <p className={`text-xs font-mono italic py-2 ${isCyber ? "text-white/30" : "text-gray-400"}`}>
                No voice actor credits registered.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                {vaEntries.map(({ lang, flag, val }) => (
                  <div
                    key={lang}
                    className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      isCyber
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-black/15 bg-gray-50 shadow-[2px_2px_0_#000]"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{flag}</span>
                    <div className="min-w-0">
                      <div className={`text-[9px] font-mono uppercase truncate ${isCyber ? "text-white/35" : "text-gray-500"}`}>{lang}</div>
                      <div className={`text-xs font-bold truncate ${isCyber ? "text-white/90" : "text-gray-900"}`}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 5: Story & Lore */}
            <SectionTitle isCyber={isCyber}>Story & Lore</SectionTitle>
            <div className="space-y-4">
              {officialDesc && (
                <div>
                  <h5 className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${isCyber ? "text-white/40" : "text-gray-600"}`}>
                    Official Overview
                  </h5>
                  <p className={`text-xs leading-relaxed ${isCyber ? "text-white/75" : "text-gray-800"}`}>{officialDesc}</p>
                </div>
              )}
              {personality && (
                <div>
                  <h5 className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${isCyber ? "text-white/40" : "text-gray-600"}`}>
                    Personality Traits
                  </h5>
                  <p className={`text-xs leading-relaxed ${isCyber ? "text-white/75" : "text-gray-800"}`}>{personality}</p>
                </div>
              )}
              {bio && (
                <div>
                  <h5 className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${isCyber ? "text-white/40" : "text-gray-600"}`}>
                    Biography
                  </h5>
                  <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isCyber ? "text-white/75" : "text-gray-800"}`}>{bio}</p>
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
            <div className={`flex items-center justify-between gap-2 p-3 rounded-2xl border flex-wrap ${
              isCyber ? "border-white/10 bg-white/[0.03]" : "border-black/15 bg-gray-50 shadow-[2px_2px_0_#000]"
            }`}>
              <span className={`text-xs font-mono font-bold ${isCyber ? "text-white/60" : "text-gray-700"}`}>
                🖼️ Gallery ({galleryImages.length} images)
              </span>

              {linkedDossierChar && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncCardImage}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
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
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
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
                <button onClick={() => onEdit(character)} className="text-xs underline opacity-70 hover:opacity-100 cursor-pointer">
                  Upload images in Editor →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {galleryImages.map(({ src, label }, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => { setLightboxSrc(src); setLightboxTitle(label); setLightboxIndex(i); }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-zoom-in border group ${
                      isCyber ? "border-white/10 bg-black/40" : "border-black bg-gray-100 shadow-[3px_3px_0_#000]"
                    }`}
                  >
                    <img
                      src={src}
                      alt={label}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
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
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${
                isCyber
                  ? "text-white shadow-[0_4px_24px_rgba(0,245,255,0.3)]"
                  : "text-black border-2 border-black bg-yellow-400 hover:bg-yellow-300 shadow-[4px_4px_0_#000]"
              }`}
              style={{
                background: isCyber ? `linear-gradient(135deg, ${accent}CC, #BF5FFF99)` : undefined,
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
              style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(12px)" }}
              onClick={onClose}
            />

            {/* ── Modal Container ────────────────────────────────────────── */}
            <div data-modal-open="true" className="fixed inset-0 z-[901] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className="pointer-events-auto flex flex-col overflow-hidden relative shadow-2xl w-full"
                style={{
                  maxWidth: "1150px",
                  width: "clamp(320px, 85vw, 1150px)",
                  height: "clamp(500px, 90vh, 900px)",
                  borderRadius: isCyber ? "24px" : "20px",
                  backgroundColor: isCyber ? "#06080f" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                  borderWidth: isCyber ? "1px" : "3px",
                  boxShadow: isCyber
                    ? `0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px ${accent}18`
                    : "8px 8px 0 #000000",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── Floating Controls Top-Right ──────────────────────────── */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(character)}
                    className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? `${accent}30` : "#FFE600",
                      borderColor: isCyber ? `${accent}70` : "#000000",
                      borderWidth: isCyber ? "1.5px" : "2px",
                      color: isCyber ? "#FFF" : "#000",
                      boxShadow: isCyber ? `0 0 16px ${accent}40` : "3px 3px 0 #000",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    ✏️ Edit
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer font-bold"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,0,0,0.5)" : "#FFFFFF",
                      color: isCyber ? "rgba(255,255,255,0.7)" : "#000000",
                      backdropFilter: "blur(12px)",
                      borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
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
                            ? `radial-gradient(ellipse at 50% 30%, ${accent}35 0%, transparent 70%), #080c1e`
                            : `radial-gradient(ellipse at 50% 30%, ${accent}25 0%, transparent 70%), #FFF8F0`,
                        }}
                      />
                    )}

                    {/* Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: isCyber
                          ? "linear-gradient(to bottom, rgba(6,8,15,0.1) 0%, rgba(6,8,15,0.6) 75%, rgba(6,8,15,1) 100%)"
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
                        {/* Character Profile Portrait (Card Image / Avatar / Fallback) */}
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => {
                            const portraitSrc = cardImg || avatar;
                            if (portraitSrc) {
                              setLightboxSrc(portraitSrc);
                              setLightboxTitle(`${character.name} Portrait`);
                            }
                          }}
                          className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl md:rounded-3xl overflow-hidden border-2 shadow-2xl relative group flex items-center justify-center font-black text-4xl ${
                            hasImg(cardImg) || hasImg(avatar) ? "cursor-zoom-in" : ""
                          }`}
                          style={{
                            borderColor: isCyber ? `${accent}` : "#000000",
                            borderWidth: isCyber ? "2.5px" : "3.5px",
                            boxShadow: isCyber
                              ? `0 0 30px ${accent}60, 0 10px 30px rgba(0,0,0,0.85)`
                              : "6px 6px 0 #000000",
                            backgroundColor: isCyber ? "rgba(6,8,15,0.9)" : "#FFFFFF",
                            color: accent,
                          }}
                        >
                          {hasImg(cardImg) || hasImg(avatar) ? (
                            <img
                              src={(cardImg || avatar)!}
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
                              textShadow: isCyber ? "0 2px 24px rgba(0,0,0,0.9)" : undefined,
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
                            <p className="text-sm font-mono opacity-60 mt-1" style={{ color: isCyber ? "#94A3B8" : "#4B5563" }}>
                              {gameName}
                            </p>
                          )}

                          {/* Chips */}
                          <div className="flex items-center gap-2 flex-wrap mt-2.5">
                            {character.element && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold border"
                                style={{
                                  backgroundColor: `${ec}22`,
                                  borderColor: isCyber ? `${ec}55` : "#000000",
                                  borderWidth: isCyber ? "1px" : "1.5px",
                                  color: isCyber ? ec : "#000000",
                                }}
                              >
                                {character.element}
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
                                className="px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1"
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
                              className="px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer"
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
                    className="sticky top-0 z-20 flex items-center px-4 border-b"
                    style={{
                      borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                      borderBottomWidth: isCyber ? "1px" : "2px",
                      backgroundColor: isCyber ? "rgba(6,8,15,0.96)" : "#FFFFFF",
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
                              ? isCyber ? accent : "#000000"
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
                                backgroundColor: isCyber ? accent : "#000000",
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
                  className="px-7 py-3.5 border-t shrink-0 flex items-center justify-between z-20"
                  style={{
                    borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000000",
                    borderTopWidth: isCyber ? "1px" : "2px",
                    backgroundColor: isCyber ? "#06080f" : "#F9FAFB",
                  }}
                >
                  <span className={`text-xs font-mono font-medium ${isCyber ? "text-white/40" : "text-gray-600"}`}>
                    {character.rank && character.rank > 0 ? `Ranked #${character.rank} in personal roster` : "Character Encyclopedia"}
                  </span>
                  <button
                    onClick={() => { if (confirm(`Remove ${character.name} from your roster?`)) { onDelete(character); onClose(); } }}
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
