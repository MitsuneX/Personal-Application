/**
 * Game-Aware Dossier Capability & Visual Theme Engine
 * Drives: category labels, character labels, element systems, resource presets, visual tokens, theme identities
 */

import { normalizeGameTitle } from "./gameIcons";

// ─── Visual Tokens ────────────────────────────────────────────────────────────

export interface CategoryVisualTokens {
  accentColor: string;
  gradient: string;
  glow: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  progressColor: string;
  iconColor: string;
  hoverAccent: string;
}

// ─── Element System ────────────────────────────────────────────────────────────

export interface GameElement {
  id: string;
  name: string;
  icon: string;           // emoji or short symbol
  color: string;          // accent hex
  description?: string;
  visualTokens?: CategoryVisualTokens;
}

export interface ElementSystem {
  sectionLabel: string;   // e.g. "Elements", "Resonance Attributes", "Aura Types"
  elements: GameElement[];
}

// ─── Dossier Category ─────────────────────────────────────────────────────────

export interface DossierCategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  visualTokens?: CategoryVisualTokens;
}

// ─── Full Game Capability Config ──────────────────────────────────────────────

export interface GameCapabilityConfig {
  gameType: string;
  categoryLabel: string;
  characterLabel: string;
  categories: DossierCategoryItem[];
  elementSystem?: ElementSystem;   // undefined = no elements section
  resourcePresetsEnabled?: boolean; // whether presets exist for this game
}

// Keep backwards compat alias
export type GameDossierConfig = GameCapabilityConfig;

// Helper to construct token set from accent hex
export function createVisualTokens(hex: string, isCyber: boolean = false): CategoryVisualTokens {
  return {
    accentColor: hex,
    gradient: isCyber
      ? `linear-gradient(135deg, ${hex}33 0%, ${hex}08 100%)`
      : `linear-gradient(135deg, ${hex}1F 0%, ${hex}08 100%)`,
    glow: isCyber ? `0 0 20px ${hex}55, 0 0 40px ${hex}22` : `3px 3px 0px #000000`,
    border: isCyber ? `${hex}66` : "#000000",
    badgeBg: isCyber ? `${hex}26` : `${hex}1F`,
    badgeText: isCyber ? hex : "#1A1A1A",
    progressColor: hex,
    iconColor: hex,
    hoverAccent: `${hex}15`,
  };
}

// ─── Specific Game Configs ────────────────────────────────────────────────────

const SPECIFIC_GAME_CONFIGS: Record<string, GameCapabilityConfig> = {

  // ── Mobile Legends: Bang Bang ──────────────────────────────────────────────
  mobilelegends: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Tactical Positions",
    characterLabel: "Hero",
    resourcePresetsEnabled: true,
    categories: [
      { id: "exp",    name: "EXP Lane", icon: "⚔️",  description: "Solo lane durability & team-fight initiation", visualTokens: createVisualTokens("#22C55E") },
      { id: "jungle", name: "Jungle",   icon: "🌲",  description: "Objective control, rotations & gank execution", visualTokens: createVisualTokens("#EF4444") },
      { id: "mid",    name: "Mid Lane", icon: "🎯",  description: "High magic burst, crowd control & fast wave clear", visualTokens: createVisualTokens("#A855F7") },
      { id: "gold",   name: "Gold Lane",icon: "🏹",  description: "Late-game physical DPS & hyper-carry scaling", visualTokens: createVisualTokens("#FACC15") },
      { id: "roam",   name: "Roam",     icon: "🛡️",  description: "Vision control, peel & frontline protection", visualTokens: createVisualTokens("#3B82F6") },
    ],
  },

  // ── Honkai: Star Rail ──────────────────────────────────────────────────────
  honkaistarrail: {
    gameType: "Turn-Based RPG",
    categoryLabel: "Paths of the Astral Express",
    characterLabel: "Character",
    resourcePresetsEnabled: true,
    categories: [
      { id: "destruction",  name: "Destruction",  icon: "💥", description: "Heavy blast & survivability frontline DPS", visualTokens: createVisualTokens("#DC2626") },
      { id: "hunt",         name: "Hunt",          icon: "🎯", description: "Single-target high-speed assassin DPS", visualTokens: createVisualTokens("#059669") },
      { id: "erudition",    name: "Erudition",     icon: "⚡", description: "Multi-target AoE wave clear & burst", visualTokens: createVisualTokens("#2563EB") },
      { id: "harmony",      name: "Harmony",       icon: "🎶", description: "Team ATK/CRIT buffers & action manipulators", visualTokens: createVisualTokens("#D97706") },
      { id: "nihility",     name: "Nihility",      icon: "🌀", description: "Enemy debuffers & Damage-over-Time (DoT)", visualTokens: createVisualTokens("#7C3AED") },
      { id: "preservation", name: "Preservation",  icon: "🛡️", description: "Shield generation & damage mitigation", visualTokens: createVisualTokens("#F59E0B") },
      { id: "abundance",    name: "Abundance",     icon: "💚", description: "HP restoration & cleanse sustain", visualTokens: createVisualTokens("#16A34A") },
      { id: "remembrance",  name: "Remembrance",   icon: "❄️", description: "Memory & MoC specialized expansion path", visualTokens: createVisualTokens("#0EA5E9") },
      { id: "elation",      name: "Elation",       icon: "🌟", description: "Follow-up & collective synergy resonance", visualTokens: createVisualTokens("#EC4899") },
    ],
    elementSystem: {
      sectionLabel: "Combat Elements",
      elements: [
        { id: "fire",        name: "Fire",        icon: "🔥", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "ice",         name: "Ice",         icon: "❄️", color: "#60A5FA", visualTokens: createVisualTokens("#60A5FA") },
        { id: "wind",        name: "Wind",        icon: "💨", color: "#34D399", visualTokens: createVisualTokens("#34D399") },
        { id: "lightning",   name: "Lightning",   icon: "⚡", color: "#A78BFA", visualTokens: createVisualTokens("#A78BFA") },
        { id: "quantum",     name: "Quantum",     icon: "🌀", color: "#818CF8", visualTokens: createVisualTokens("#818CF8") },
        { id: "imaginary",   name: "Imaginary",   icon: "✨", color: "#FCD34D", visualTokens: createVisualTokens("#FCD34D") },
        { id: "physical",    name: "Physical",    icon: "💪", color: "#94A3B8", visualTokens: createVisualTokens("#94A3B8") },
      ],
    },
  },

  // ── Valorant ──────────────────────────────────────────────────────────────
  valorant: {
    gameType: "Tactical Shooter",
    categoryLabel: "Protocol Agent Roles",
    characterLabel: "Agent",
    resourcePresetsEnabled: true,
    categories: [
      { id: "duelist",    name: "Duelist",    icon: "🔥", description: "Self-sufficient entry fraggers & duel takers", visualTokens: createVisualTokens("#FF4655") },
      { id: "controller", name: "Controller", icon: "☁️", description: "Sightline suppression & smoke executioners", visualTokens: createVisualTokens("#00F5FF") },
      { id: "initiator",  name: "Initiator",  icon: "👁️", description: "Reconnaissance & site entry enablers", visualTokens: createVisualTokens("#EAB308") },
      { id: "sentinel",   name: "Sentinel",   icon: "🛡️", description: "Defensive anchors & site lockdown experts", visualTokens: createVisualTokens("#10B981") },
    ],
  },

  // ── Genshin Impact ────────────────────────────────────────────────────────
  genshinimpact: {
    gameType: "Action RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Character",
    resourcePresetsEnabled: true,
    categories: [
      { id: "maindps", name: "Main DPS",       icon: "🗡️", description: "On-field elemental damage driver", visualTokens: createVisualTokens("#EF4444") },
      { id: "subdps",  name: "Sub DPS",        icon: "⚡", description: "Off-field elemental reaction enabler", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "support", name: "Support",        icon: "✨", description: "Elemental buffing & battery utility", visualTokens: createVisualTokens("#F59E0B") },
      { id: "healer",  name: "Healer / Shield", icon: "💚", description: "Party HP restoration & shield sustain", visualTokens: createVisualTokens("#10B981") },
    ],
    elementSystem: {
      sectionLabel: "Elements",
      elements: [
        { id: "pyro",     name: "Pyro",     icon: "🔥", color: "#EF4444", description: "Fire reactions: Vaporize, Melt, Overloaded", visualTokens: createVisualTokens("#EF4444") },
        { id: "hydro",    name: "Hydro",    icon: "💧", color: "#3B82F6", description: "Water reactions: Vaporize, Frozen, Bloom", visualTokens: createVisualTokens("#3B82F6") },
        { id: "anemo",    name: "Anemo",    icon: "💨", color: "#10B981", description: "Wind reactions: Swirl spread", visualTokens: createVisualTokens("#10B981") },
        { id: "electro",  name: "Electro",  icon: "⚡", color: "#8B5CF6", description: "Lightning reactions: Overloaded, Superconduct, Quicken", visualTokens: createVisualTokens("#8B5CF6") },
        { id: "dendro",   name: "Dendro",   icon: "🌿", color: "#22C55E", description: "Nature reactions: Bloom, Quicken, Burgeon", visualTokens: createVisualTokens("#22C55E") },
        { id: "cryo",     name: "Cryo",     icon: "❄️", color: "#06B6D4", description: "Ice reactions: Frozen, Melt, Superconduct", visualTokens: createVisualTokens("#06B6D4") },
        { id: "geo",      name: "Geo",      icon: "🪨", color: "#D97706", description: "Earth reactions: Crystallize shield", visualTokens: createVisualTokens("#D97706") },
      ],
    },
  },

  // ── Wuthering Waves ────────────────────────────────────────────────────────
  wutheringwaves: {
    gameType: "Action RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Resonator",
    resourcePresetsEnabled: true,
    categories: [
      { id: "dps",     name: "DPS / Main",    icon: "🗡️", description: "Primary on-field damage resonator", visualTokens: createVisualTokens("#EF4444") },
      { id: "subdps",  name: "Sub DPS",       icon: "⚡", description: "Off-field concerto & coordinated atk", visualTokens: createVisualTokens("#A78BFA") },
      { id: "support", name: "Support",       icon: "🎶", description: "Concerto energy & team buffs", visualTokens: createVisualTokens("#FCD34D") },
      { id: "healer",  name: "Healer",        icon: "💚", description: "HP restoration & Forte sustain", visualTokens: createVisualTokens("#34D399") },
    ],
    elementSystem: {
      sectionLabel: "Resonance Attributes",
      elements: [
        { id: "glacio",    name: "Glacio",    icon: "❄️", color: "#38BDF8", description: "Ice attribute — Glacio Erosion", visualTokens: createVisualTokens("#38BDF8") },
        { id: "fusion",    name: "Fusion",    icon: "🔥", color: "#F97316", description: "Fire attribute — Fusion Erosion", visualTokens: createVisualTokens("#F97316") },
        { id: "electro",   name: "Electro",   icon: "⚡", color: "#A855F7", description: "Lightning attribute — Electro Erosion", visualTokens: createVisualTokens("#A855F7") },
        { id: "aero",      name: "Aero",      icon: "💨", color: "#10B981", description: "Wind attribute — Aero Erosion", visualTokens: createVisualTokens("#10B981") },
        { id: "spectro",   name: "Spectro",   icon: "✨", color: "#FACC15", description: "Light attribute — Spectro Erosion", visualTokens: createVisualTokens("#FACC15") },
        { id: "havoc",     name: "Havoc",     icon: "🌑", color: "#E11D48", description: "Dark/Chaos attribute — Havoc Erosion", visualTokens: createVisualTokens("#E11D48") },
      ],
    },
  },

  // ── Zenless Zone Zero ─────────────────────────────────────────────────────
  zenlesszonezero: {
    gameType: "Gacha Action",
    categoryLabel: "Agent Fighting Styles",
    characterLabel: "Agent",
    resourcePresetsEnabled: true,
    categories: [
      { id: "dps",     name: "Attack / DPS", icon: "🗡️", description: "Primary damage output driver", visualTokens: createVisualTokens("#EF4444") },
      { id: "stun",    name: "Stun",         icon: "⚡", description: "Heavy daze meter buildup specialist", visualTokens: createVisualTokens("#EAB308") },
      { id: "support", name: "Support",      icon: "🎶", description: "Team energy & damage buff utility", visualTokens: createVisualTokens("#06B6D4") },
      { id: "anomaly", name: "Anomaly",      icon: "🌀", description: "Attribute buildup & elemental anomaly", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "defense", name: "Defense",      icon: "🛡️", description: "Counter-attacks & guard mitigation", visualTokens: createVisualTokens("#64748B") },
    ],
    elementSystem: {
      sectionLabel: "Attributes",
      elements: [
        { id: "physical",   name: "Physical",   icon: "💪", color: "#94A3B8", visualTokens: createVisualTokens("#94A3B8") },
        { id: "fire",       name: "Fire",       icon: "🔥", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "ice",        name: "Ice",        icon: "❄️", color: "#60A5FA", visualTokens: createVisualTokens("#60A5FA") },
        { id: "electric",   name: "Electric",   icon: "⚡", color: "#A78BFA", visualTokens: createVisualTokens("#A78BFA") },
        { id: "ether",      name: "Ether",      icon: "✨", color: "#34D399", visualTokens: createVisualTokens("#34D399") },
      ],
    },
  },

  // ── Dragon Ball Legends ───────────────────────────────────────────────────
  dragonballlegends: {
    gameType: "Gacha Fighting",
    categoryLabel: "Fighter Types",
    characterLabel: "Fighter",
    resourcePresetsEnabled: false,
    categories: [
      { id: "melee",    name: "Melee",     icon: "👊", description: "Close-range physical striker", visualTokens: createVisualTokens("#EF4444") },
      { id: "ranged",   name: "Ranged",    icon: "💥", description: "Energy blast & long-range attacker", visualTokens: createVisualTokens("#EAB308") },
      { id: "support",  name: "Support",   icon: "🌟", description: "Team heal & buff booster", visualTokens: createVisualTokens("#F59E0B") },
      { id: "defense",  name: "Defense",   icon: "🛡️", description: "Tank & damage absorber", visualTokens: createVisualTokens("#10B981") },
    ],
    elementSystem: {
      sectionLabel: "Battle Attributes",
      elements: [
        { id: "red",    name: "RED",    icon: "🔴", color: "#EF4444", description: "Effective against PUR", visualTokens: createVisualTokens("#EF4444") },
        { id: "blue",   name: "BLU",    icon: "🔵", color: "#3B82F6", description: "Effective against RED", visualTokens: createVisualTokens("#3B82F6") },
        { id: "green",  name: "GRN",    icon: "🟢", color: "#22C55E", description: "Effective against BLU", visualTokens: createVisualTokens("#22C55E") },
        { id: "yellow", name: "YEL",    icon: "🟡", color: "#EAB308", description: "Effective against GRN", visualTokens: createVisualTokens("#EAB308") },
        { id: "purple", name: "PUR",    icon: "🟣", color: "#8B5CF6", description: "Effective against YEL", visualTokens: createVisualTokens("#8B5CF6") },
      ],
    },
  },

  // ── Arknights ─────────────────────────────────────────────────────────────
  arknights: {
    gameType: "Tower Defense",
    categoryLabel: "Operator Classes",
    characterLabel: "Operator",
    resourcePresetsEnabled: true,
    categories: [
      { id: "guard",     name: "Guard",     icon: "⚔️", description: "Frontline DPS & blocking operator", visualTokens: createVisualTokens("#EF4444") },
      { id: "defender",  name: "Defender",  icon: "🛡️", description: "High HP tanking & HP sustain", visualTokens: createVisualTokens("#F59E0B") },
      { id: "sniper",    name: "Sniper",    icon: "🎯", description: "Ranged physical/arts damage dealer", visualTokens: createVisualTokens("#06B6D4") },
      { id: "caster",    name: "Caster",    icon: "🌀", description: "Ranged arts damage dealer", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "medic",     name: "Medic",     icon: "💚", description: "HP restoration support", visualTokens: createVisualTokens("#10B981") },
      { id: "supporter", name: "Supporter", icon: "🎶", description: "Buff, debuff & utility", visualTokens: createVisualTokens("#EAB308") },
      { id: "specialist", name: "Specialist",icon: "⚡", description: "Unique mechanics & repositioning", visualTokens: createVisualTokens("#F43F5E") },
      { id: "vanguard",  name: "Vanguard",  icon: "🔮", description: "DP generation & early deployment", visualTokens: createVisualTokens("#6366F1") },
    ],
  },

  // ── Girls' Frontline 2: Exilium ───────────────────────────────────────────
  girlsfrontline2: {
    gameType: "Tactical RPG",
    categoryLabel: "Tactical Doll Classes",
    characterLabel: "Tactical Doll",
    resourcePresetsEnabled: true,
    categories: [
      { id: "vanguard", name: "Vanguard", icon: "⚔️", description: "High-mobility flanker & single-target strike", visualTokens: createVisualTokens("#EF4444") },
      { id: "sentinel", name: "Sentinel", icon: "🎯", description: "Long-range marksman & precision sniper", visualTokens: createVisualTokens("#06B6D4") },
      { id: "bulwark",  name: "Bulwark",  icon: "🛡️", description: "Heavy armor frontline & cover defender", visualTokens: createVisualTokens("#F59E0B") },
      { id: "support",  name: "Support",  icon: "🔧", description: "Tactical buffer, repair & debuffer utility", visualTokens: createVisualTokens("#10B981") },
    ],
    elementSystem: {
      sectionLabel: "Elemental Attributes",
      elements: [
        { id: "burn",      name: "Burn",      icon: "🔥", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "corrosion", name: "Corrosion", icon: "🧪", color: "#10B981", visualTokens: createVisualTokens("#10B981") },
        { id: "frost",     name: "Frost",     icon: "❄️", color: "#3B82F6", visualTokens: createVisualTokens("#3B82F6") },
        { id: "electric",  name: "Electric",  icon: "⚡", color: "#A855F7", visualTokens: createVisualTokens("#A855F7") },
        { id: "physical",  name: "Physical",  icon: "💥", color: "#94A3B8", visualTokens: createVisualTokens("#94A3B8") },
      ],
    },
  },

  // ── Stella Sora ────────────────────────────────────────────────────────────
  stellasora: {
    gameType: "Gacha RPG",
    categoryLabel: "Star Positions & Classes",
    characterLabel: "Stellaris",
    resourcePresetsEnabled: true,
    categories: [
      { id: "vanguard", name: "Star Vanguard", icon: "⚔️", description: "Frontline offensive striker", visualTokens: createVisualTokens("#6C5CE7") },
      { id: "weaver",   name: "Star Weaver",   icon: "🔮", description: "Magic burst & elemental caster", visualTokens: createVisualTokens("#A855F7") },
      { id: "sentinel", name: "Star Sentinel", icon: "🛡️", description: "Defensive shield & party protection", visualTokens: createVisualTokens("#3B82F6") },
      { id: "luminar",  name: "Star Luminar",  icon: "✨", description: "Radiant support & HP restoration", visualTokens: createVisualTokens("#FACC15") },
    ],
    elementSystem: {
      sectionLabel: "Astral Elements",
      elements: [
        { id: "starlight", name: "Starlight", icon: "✨", color: "#FACC15", visualTokens: createVisualTokens("#FACC15") },
        { id: "nebula",    name: "Nebula",    icon: "🌌", color: "#A855F7", visualTokens: createVisualTokens("#A855F7") },
        { id: "solar",     name: "Solar",     icon: "☀️", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "lunar",     name: "Lunar",     icon: "🌙", color: "#38BDF8", visualTokens: createVisualTokens("#38BDF8") },
        { id: "void",      name: "Void",      icon: "🕳️", color: "#64748B", visualTokens: createVisualTokens("#64748B") },
      ],
    },
  },

  // ── Reverse: 1999 ─────────────────────────────────────────────────────────
  reverse1999: {
    gameType: "Turn-Based Tactical RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Arcanist",
    resourcePresetsEnabled: true,
    categories: [
      { id: "dps",      name: "Damage Dealer", icon: "🗡️", description: "Main Arcanum burst & single/AoE strike", visualTokens: createVisualTokens("#EF4444") },
      { id: "support",  name: "Support",       icon: "🎶", description: "Incantation buff & Moxie accelerator", visualTokens: createVisualTokens("#F59E0B") },
      { id: "control",  name: "Control",       icon: "🔮", description: "Crowd control, Freeze, Disarm & Daze", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "debuffer", name: "Debuffer",      icon: "🌀", description: "Defense reduction & Damage Taken amplification", visualTokens: createVisualTokens("#06B6D4") },
      { id: "healer",   name: "Sustainer",     icon: "💚", description: "Party HP restoration & Shield protection", visualTokens: createVisualTokens("#10B981") },
    ],
    elementSystem: {
      sectionLabel: "Afflatus Types",
      elements: [
        { id: "mineral",   name: "Mineral",   icon: "🪨", color: "#D97706", description: "Earth Arcanum — Counters Star", visualTokens: createVisualTokens("#D97706") },
        { id: "beast",     name: "Beast",     icon: "🐾", color: "#EF4444", description: "Beast Arcanum — Counters Plant", visualTokens: createVisualTokens("#EF4444") },
        { id: "plant",     name: "Plant",     icon: "🌿", color: "#22C55E", description: "Nature Arcanum — Counters Mineral", visualTokens: createVisualTokens("#22C55E") },
        { id: "star",      name: "Star",      icon: "⭐", color: "#3B82F6", description: "Astral Arcanum — Counters Beast", visualTokens: createVisualTokens("#3B82F6") },
        { id: "spirit",    name: "Spirit",    icon: "👻", color: "#8B5CF6", description: "Mystic Arcanum — Neutral / Intellect counter", visualTokens: createVisualTokens("#8B5CF6") },
        { id: "intellect", name: "Intellect", icon: "🧠", color: "#06B6D4", description: "Knowledge Arcanum — Neutral / Spirit counter", visualTokens: createVisualTokens("#06B6D4") },
      ],
    },
  },

  // ── Umamusume: Pretty Derby ────────────────────────────────────────────────
  umamusumeprettyderby: {
    gameType: "Racing Simulation RPG",
    categoryLabel: "Running Styles (Tactics)",
    characterLabel: "Horse Girl (Uma Musume)",
    resourcePresetsEnabled: true,
    categories: [
      { id: "nige",    name: "Front-Runner (Nige)", icon: "🏃💨", description: "Lead from the start, high tempo pace", visualTokens: createVisualTokens("#EF4444") },
      { id: "senko",   name: "Pace-Setter (Senko)", icon: "🏇",   description: "Stays right behind the lead, strategic mid-race break", visualTokens: createVisualTokens("#F59E0B") },
      { id: "sashi",   name: "Late-Surger (Sashi)",  icon: "⚡",   description: "Positioned in the middle pack, powerful final corner burst", visualTokens: createVisualTokens("#10B981") },
      { id: "oikomi",  name: "End-Surger (Oikomi)",  icon: "🚀",   description: "Back of the pack, explosive final stretch overtaking", visualTokens: createVisualTokens("#3B82F6") },
    ],
    elementSystem: {
      sectionLabel: "Distance Aptitudes",
      elements: [
        { id: "short",  name: "Short (1000m - 1400m)",  icon: "⚡", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "mile",   name: "Mile (1600m - 1800m)",   icon: "🏃", color: "#F59E0B", visualTokens: createVisualTokens("#F59E0B") },
        { id: "medium", name: "Medium (2000m - 2400m)", icon: "🏆", color: "#10B981", visualTokens: createVisualTokens("#10B981") },
        { id: "long",   name: "Long (2500m+)",          icon: "🛣️", color: "#3B82F6", visualTokens: createVisualTokens("#3B82F6") },
      ],
    },
  },

  // ── Girls' Frontline 2: Exilium ───────────────────────────────────────────
  girlsfrontline2exilium: {
    gameType: "Gacha Tactical RPG",
    categoryLabel: "Doll Combat Roles",
    characterLabel: "Doll",
    resourcePresetsEnabled: true,
    categories: [
      { id: "assault",  name: "Assault",     icon: "🔫", description: "Primary DPS frontliner with high firepower", visualTokens: createVisualTokens("#E94560") },
      { id: "sentinel", name: "Sentinel",    icon: "🎯", description: "Long-range sniper & precision support", visualTokens: createVisualTokens("#06B6D4") },
      { id: "support",  name: "Support",     icon: "💊", description: "Healing, buffing & shield generation", visualTokens: createVisualTokens("#10B981") },
      { id: "vanguard", name: "Vanguard",    icon: "🛡️", description: "Frontline tank & aggro control", visualTokens: createVisualTokens("#F59E0B") },
      { id: "special",  name: "Special Ops", icon: "⚡", description: "Unique mechanics & area denial", visualTokens: createVisualTokens("#A78BFA") },
    ],
    elementSystem: {
      sectionLabel: "Elemental Attributes",
      elements: [
        { id: "burn",     name: "Burn",       icon: "🔥", color: "#EF4444", description: "Fire DoT damage over time", visualTokens: createVisualTokens("#EF4444") },
        { id: "freeze",   name: "Freeze",     icon: "❄️", color: "#60A5FA", description: "Ice control & movement slow", visualTokens: createVisualTokens("#60A5FA") },
        { id: "electric", name: "Electric",   icon: "⚡", color: "#A78BFA", description: "Shock & chain lightning", visualTokens: createVisualTokens("#A78BFA") },
        { id: "corrosion",name: "Corrosion",  icon: "☣️", color: "#22C55E", description: "Poison & defense reduction", visualTokens: createVisualTokens("#22C55E") },
        { id: "hydro",    name: "Hydro",      icon: "💧", color: "#3B82F6", description: "Wet status & combo enabler", visualTokens: createVisualTokens("#3B82F6") },
      ],
    },
  },

  // ── Outerplane ────────────────────────────────────────────────────────────
  outerplane: {
    gameType: "Gacha Turn-Based RPG",
    categoryLabel: "Hero Combat Classes",
    characterLabel: "Hero",
    resourcePresetsEnabled: true,
    categories: [
      { id: "warrior",  name: "Warrior",   icon: "⚔️", description: "Frontline melee DPS & tank", visualTokens: createVisualTokens("#EF4444") },
      { id: "ranger",   name: "Ranger",    icon: "🏹", description: "Ranged physical damage dealer", visualTokens: createVisualTokens("#22C55E") },
      { id: "mage",     name: "Mage",      icon: "🌀", description: "Burst magic damage & AoE", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "healer",   name: "Healer",    icon: "💚", description: "HP restoration & cleanse", visualTokens: createVisualTokens("#10B981") },
      { id: "support",  name: "Support",   icon: "🎶", description: "Team buffs, shields & utility", visualTokens: createVisualTokens("#F59E0B") },
    ],
    elementSystem: {
      sectionLabel: "Elements",
      elements: [
        { id: "fire",    name: "Fire",    icon: "🔥", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "water",   name: "Water",   icon: "💧", color: "#3B82F6", visualTokens: createVisualTokens("#3B82F6") },
        { id: "earth",   name: "Earth",   icon: "🪨", color: "#D97706", visualTokens: createVisualTokens("#D97706") },
        { id: "wind",    name: "Wind",    icon: "💨", color: "#10B981", visualTokens: createVisualTokens("#10B981") },
        { id: "light",   name: "Light",   icon: "✨", color: "#FCD34D", visualTokens: createVisualTokens("#FCD34D") },
        { id: "dark",    name: "Dark",    icon: "🌑", color: "#7C3AED", visualTokens: createVisualTokens("#7C3AED") },
      ],
    },
  },

  // ── Tower of Fantasy ──────────────────────────────────────────────────────
  toweroffantasy: {
    gameType: "Open-World Gacha RPG",
    categoryLabel: "Simulacra Team Roles",
    characterLabel: "Simulacrum",
    resourcePresetsEnabled: true,
    categories: [
      { id: "dps",     name: "DPS / Attacker",  icon: "🗡️", description: "Primary damage output simulacra", visualTokens: createVisualTokens("#EF4444") },
      { id: "support", name: "Support / Buffer", icon: "🎶", description: "Team buff & energy regen", visualTokens: createVisualTokens("#F59E0B") },
      { id: "healer",  name: "Healer",           icon: "💚", description: "HP restoration & resonance sustain", visualTokens: createVisualTokens("#10B981") },
      { id: "subdps",  name: "Sub DPS / Burst",  icon: "⚡", description: "Burst damage & elemental combo", visualTokens: createVisualTokens("#8B5CF6") },
    ],
    elementSystem: {
      sectionLabel: "Resonance Elements",
      elements: [
        { id: "flame",    name: "Flame",    icon: "🔥", color: "#EF4444", description: "Fire resonance", visualTokens: createVisualTokens("#EF4444") },
        { id: "frost",    name: "Frost",    icon: "❄️", color: "#60A5FA", description: "Ice resonance", visualTokens: createVisualTokens("#60A5FA") },
        { id: "volt",     name: "Volt",     icon: "⚡", color: "#A78BFA", description: "Electric resonance", visualTokens: createVisualTokens("#A78BFA") },
        { id: "altered",  name: "Altered",  icon: "🌀", color: "#EC4899", description: "Dark matter resonance", visualTokens: createVisualTokens("#EC4899") },
        { id: "physical", name: "Physical", icon: "💪", color: "#94A3B8", description: "Physical resonance", visualTokens: createVisualTokens("#94A3B8") },
      ],
    },
  },

  // ── Goddess of Victory: NIKKE ─────────────────────────────────────────────
  goddessofvictorynikke: {
    gameType: "Gacha Shooter RPG",
    categoryLabel: "Burst & Combat Roles",
    characterLabel: "NIKKE",
    resourcePresetsEnabled: true,
    categories: [
      { id: "burst1",  name: "Burst Stage I",   icon: "1️⃣", description: "Burst I activators — opener skills", visualTokens: createVisualTokens("#3B82F6") },
      { id: "burst2",  name: "Burst Stage II",  icon: "2️⃣", description: "Burst II bridge skills", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "burst3",  name: "Burst Stage III", icon: "3️⃣", description: "Burst III finishers — main damage", visualTokens: createVisualTokens("#EF4444") },
      { id: "support", name: "Support",          icon: "💚", description: "Healer, shielder & buff support", visualTokens: createVisualTokens("#10B981") },
    ],
    elementSystem: {
      sectionLabel: "Manufacturer Factions",
      elements: [
        { id: "elysion",   name: "Elysion",   icon: "🔵", color: "#3B82F6", description: "Holy & defensive NIKKE faction", visualTokens: createVisualTokens("#3B82F6") },
        { id: "missilis",  name: "Missilis",  icon: "🟣", color: "#8B5CF6", description: "High-tech military corporation", visualTokens: createVisualTokens("#8B5CF6") },
        { id: "tetra",     name: "Tetra",     icon: "🟡", color: "#EAB308", description: "Support & medical division", visualTokens: createVisualTokens("#EAB308") },
        { id: "pilgrim",   name: "Pilgrim",   icon: "⬛", color: "#1E293B", description: "Unique & independent NIKKEs", visualTokens: createVisualTokens("#1E293B") },
        { id: "abnormal",  name: "Abnormal",  icon: "🔴", color: "#EF4444", description: "Defective or rogue NIKKEs", visualTokens: createVisualTokens("#EF4444") },
      ],
    },
  },

  // ── Arknights: Endfield ───────────────────────────────────────────────────
  arknightsendfield: {
    gameType: "Action RPG",
    categoryLabel: "Operator Classes",
    characterLabel: "Operator",
    resourcePresetsEnabled: true,
    categories: [
      { id: "assault",   name: "Assault",    icon: "⚔️", description: "Primary DPS operator", visualTokens: createVisualTokens("#EF4444") },
      { id: "tank",      name: "Tank",       icon: "🛡️", description: "Frontline defense & HP", visualTokens: createVisualTokens("#F59E0B") },
      { id: "support",   name: "Support",    icon: "🎶", description: "Team buffs & utility", visualTokens: createVisualTokens("#06B6D4") },
      { id: "healer",    name: "Medic",      icon: "💚", description: "HP restoration operator", visualTokens: createVisualTokens("#10B981") },
      { id: "specialist",name: "Specialist", icon: "⚡", description: "Unique & mixed role operators", visualTokens: createVisualTokens("#A78BFA") },
    ],
    elementSystem: {
      sectionLabel: "Elements",
      elements: [
        { id: "physical",  name: "Physical",  icon: "💪", color: "#94A3B8", visualTokens: createVisualTokens("#94A3B8") },
        { id: "fire",      name: "Fire",      icon: "🔥", color: "#EF4444", visualTokens: createVisualTokens("#EF4444") },
        { id: "cryo",      name: "Cryo",      icon: "❄️", color: "#60A5FA", visualTokens: createVisualTokens("#60A5FA") },
        { id: "electro",   name: "Electro",   icon: "⚡", color: "#A78BFA", visualTokens: createVisualTokens("#A78BFA") },
        { id: "corrosion", name: "Corrosion", icon: "☣️", color: "#22C55E", visualTokens: createVisualTokens("#22C55E") },
      ],
    },
  },

  // ── Honkai Impact 3rd ─────────────────────────────────────────────────────
  honkaiimpact3rd: {
    gameType: "Gacha Action RPG",
    categoryLabel: "Valkyrie Battlesuit Types",
    characterLabel: "Battlesuit",
    resourcePresetsEnabled: true,
    categories: [
      { id: "dps",     name: "DPS / Carry",       icon: "🗡️", description: "Primary physical or elemental DPS", visualTokens: createVisualTokens("#EF4444") },
      { id: "support", name: "Support / Buffer",   icon: "✨", description: "Team damage amp & buffs", visualTokens: createVisualTokens("#F59E0B") },
      { id: "healer",  name: "Healer",             icon: "💚", description: "HP restoration & cleanse", visualTokens: createVisualTokens("#10B981") },
      { id: "subdps",  name: "Sub DPS",            icon: "⚡", description: "Off-field elemental rotation DPS", visualTokens: createVisualTokens("#8B5CF6") },
    ],
    elementSystem: {
      sectionLabel: "Elemental Types",
      elements: [
        { id: "bio",      name: "BIO",      icon: "🟢", color: "#22C55E", description: "Biological element — Paralyze & Poison", visualTokens: createVisualTokens("#22C55E") },
        { id: "mech",     name: "MECH",     icon: "⚙️", color: "#94A3B8", description: "Mechanical element — Stun", visualTokens: createVisualTokens("#94A3B8") },
        { id: "psy",      name: "PSY",      icon: "💜", color: "#A78BFA", description: "Psychic element — Weaken", visualTokens: createVisualTokens("#A78BFA") },
        { id: "quantum",  name: "QUA",      icon: "🌀", color: "#818CF8", description: "Quantum element — Impair", visualTokens: createVisualTokens("#818CF8") },
        { id: "fire",     name: "FIRE",     icon: "🔥", color: "#EF4444", description: "Fire element — Ignite", visualTokens: createVisualTokens("#EF4444") },
        { id: "ice",      name: "ICE",      icon: "❄️", color: "#60A5FA", description: "Frost element — Freeze", visualTokens: createVisualTokens("#60A5FA") },
        { id: "lightning",name: "LIGHTNING",icon: "⚡", color: "#FACC15", description: "Lightning element — Bleed", visualTokens: createVisualTokens("#FACC15") },
      ],
    },
  },
};

// ─── Generic Category Fallbacks ───────────────────────────────────────────────

const GENERIC_CATEGORY_CONFIGS: Record<string, GameCapabilityConfig> = {
  moba: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Positions",
    characterLabel: "Hero",
    categories: [
      { id: "exp",    name: "EXP Lane",  icon: "⚔️", description: "Solo fighters & tanks", visualTokens: createVisualTokens("#22C55E") },
      { id: "jungle", name: "Jungle",    icon: "🌲", description: "Objective control & ganks", visualTokens: createVisualTokens("#EF4444") },
      { id: "mid",    name: "Mid Lane",  icon: "🎯", description: "Burst mages & assassins", visualTokens: createVisualTokens("#A855F7") },
      { id: "gold",   name: "Gold Lane", icon: "🏹", description: "Marksmen & carries", visualTokens: createVisualTokens("#FACC15") },
      { id: "roam",   name: "Roam",      icon: "🛡️", description: "Support & vision", visualTokens: createVisualTokens("#3B82F6") },
    ],
  },
  fps: {
    gameType: "FPS / Shooter",
    categoryLabel: "Tactical Roles",
    characterLabel: "Agent / Operator",
    categories: [
      { id: "duelist",  name: "Offense / Duelist",  icon: "🔥", description: "Entry fraggers & damage", visualTokens: createVisualTokens("#FF4655") },
      { id: "recon",    name: "Recon / Intel",       icon: "👁️", description: "Information & scanning", visualTokens: createVisualTokens("#EAB308") },
      { id: "support",  name: "Support / Utility",   icon: "☁️", description: "Smokes & healing utility", visualTokens: createVisualTokens("#00F5FF") },
      { id: "anchor",   name: "Defense / Anchor",    icon: "🛡️", description: "Site hold & lockdown", visualTokens: createVisualTokens("#10B981") },
    ],
  },
  gacharpg: {
    gameType: "Gacha RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Character",
    categories: [
      { id: "maindps", name: "Main DPS",      icon: "💥", description: "Primary damage dealer", visualTokens: createVisualTokens("#EF4444") },
      { id: "subdps",  name: "Sub DPS",       icon: "⚡", description: "Secondary damage & burst", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "buffer",  name: "Buffer / Support", icon: "🎶", description: "Stat buffers & utility", visualTokens: createVisualTokens("#F59E0B") },
      { id: "sustain", name: "Sustain / Healer", icon: "💚", description: "Shields & healing", visualTokens: createVisualTokens("#10B981") },
    ],
  },
  fighting: {
    gameType: "Fighting",
    categoryLabel: "Fighter Roster",
    characterLabel: "Fighter",
    categories: [
      { id: "main", name: "Main Fighter",    icon: "🥊", description: "Primary tournament main", visualTokens: createVisualTokens("#EF4444") },
      { id: "sec",  name: "Secondary Main", icon: "⚡", description: "Secondary pocket pick", visualTokens: createVisualTokens("#3B82F6") },
      { id: "flex", name: "Flex / Sub",     icon: "🔄", description: "Situational counter-pick", visualTokens: createVisualTokens("#F59E0B") },
    ],
  },
  rpg: {
    gameType: "RPG",
    categoryLabel: "Character Classes",
    characterLabel: "Character",
    categories: [
      { id: "dps",     name: "DPS",      icon: "🗡️", description: "Primary damage dealer", visualTokens: createVisualTokens("#EF4444") },
      { id: "tank",    name: "Tank",     icon: "🛡️", description: "Frontline protector", visualTokens: createVisualTokens("#F59E0B") },
      { id: "healer",  name: "Healer",   icon: "💚", description: "HP restoration", visualTokens: createVisualTokens("#10B981") },
      { id: "support", name: "Support",  icon: "✨", description: "Utility & buffs", visualTokens: createVisualTokens("#3B82F6") },
    ],
  },
  default: {
    gameType: "General Game",
    categoryLabel: "Roster Breakdown",
    characterLabel: "Character",
    categories: [
      { id: "main",      name: "Main Roster",     icon: "👑", description: "Primary played characters", visualTokens: createVisualTokens("#F59E0B") },
      { id: "secondary", name: "Secondary Pick",  icon: "⚡", description: "Pocket picks", visualTokens: createVisualTokens("#3B82F6") },
      { id: "flex",      name: "Flex / Sub",      icon: "🔄", description: "Situational flex choices", visualTokens: createVisualTokens("#8B5CF6") },
      { id: "utility",   name: "Support / Utility",icon: "🛡️", description: "Utility & assistance", visualTokens: createVisualTokens("#10B981") },
    ],
  },
};

// ─── Alias normalizations ─────────────────────────────────────────────────────

const TITLE_ALIASES: Record<string, string> = {
  mlbb: "mobilelegends",
  ml: "mobilelegends",
  hsr: "honkaistarrail",
  hk: "honkaistarrail",
  gi: "genshinimpact",
  genshin: "genshinimpact",
  wuwa: "wutheringwaves",
  ww: "wutheringwaves",
  zzz: "zenlesszonezero",
  dbl: "dragonballlegends",
  dragonball: "dragonballlegends",
  arknights: "arknights",
  ak: "arknights",
  valo: "valorant",
  // New game aliases
  gfl2: "girlsfrontline2exilium",
  gf2: "girlsfrontline2exilium",
  exilium: "girlsfrontline2exilium",
  girlsfrontline2: "girlsfrontline2exilium",
  tof: "toweroffantasy",
  nikke: "goddessofvictorynikke",
  goddessofvictory: "goddessofvictorynikke",
  endfield: "arknightsendfield",
  akendfield: "arknightsendfield",
  hi3: "honkaiimpact3rd",
  honkaiimpact3: "honkaiimpact3rd",
  honkaiimpact: "honkaiimpact3rd",
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

export function getGameDossierConfig(
  gameTitle?: string,
  gameCategory?: string
): GameCapabilityConfig {
  if (gameTitle) {
    const normTitle = normalizeGameTitle(gameTitle);

    // Direct match
    if (SPECIFIC_GAME_CONFIGS[normTitle]) return SPECIFIC_GAME_CONFIGS[normTitle];

    // Alias match
    const aliased = TITLE_ALIASES[normTitle];
    if (aliased && SPECIFIC_GAME_CONFIGS[aliased]) return SPECIFIC_GAME_CONFIGS[aliased];
  }

  if (gameCategory) {
    const normCategory = normalizeGameTitle(gameCategory);
    if (GENERIC_CATEGORY_CONFIGS[normCategory]) return GENERIC_CATEGORY_CONFIGS[normCategory];
    if (normCategory.includes("moba"))                      return GENERIC_CATEGORY_CONFIGS.moba;
    if (normCategory.includes("fps") || normCategory.includes("shooter")) return GENERIC_CATEGORY_CONFIGS.fps;
    if (normCategory.includes("fight"))                     return GENERIC_CATEGORY_CONFIGS.fighting;
    if (normCategory.includes("rpg") || normCategory.includes("gacha"))   return GENERIC_CATEGORY_CONFIGS.gacharpg;
  }

  return GENERIC_CATEGORY_CONFIGS.default;
}

/**
 * Returns visual tokens for any category item, element, or custom string name.
 */
export function getCategoryVisualTokens(
  categoryItem: DossierCategoryItem | GameElement | string,
  isCyber: boolean = false
): CategoryVisualTokens {
  if (typeof categoryItem !== "string" && categoryItem.visualTokens) {
    return isCyber ? createVisualTokens(categoryItem.visualTokens.accentColor, true) : categoryItem.visualTokens;
  }

  const name = typeof categoryItem === "string" ? categoryItem : categoryItem.name;
  const lower = name.toLowerCase();

  // Color keyword heuristics
  if (lower.includes("pyro") || lower.includes("fire") || lower.includes("fusion") || lower.includes("red") || lower.includes("destruction") || lower.includes("jungle") || lower.includes("duelist") || lower.includes("guard")) {
    return createVisualTokens("#EF4444", isCyber);
  }
  if (lower.includes("hydro") || lower.includes("water") || lower.includes("blue") || lower.includes("erudition") || lower.includes("roam") || lower.includes("blu")) {
    return createVisualTokens("#3B82F6", isCyber);
  }
  if (lower.includes("anemo") || lower.includes("wind") || lower.includes("aero") || lower.includes("green") || lower.includes("hunt") || lower.includes("dendro") || lower.includes("exp") || lower.includes("grn") || lower.includes("medic")) {
    return createVisualTokens("#10B981", isCyber);
  }
  if (lower.includes("electro") || lower.includes("lightning") || lower.includes("purple") || lower.includes("nihility") || lower.includes("mid") || lower.includes("pur") || lower.includes("caster")) {
    return createVisualTokens("#8B5CF6", isCyber);
  }
  if (lower.includes("cryo") || lower.includes("ice") || lower.includes("glacio") || lower.includes("remembrance") || lower.includes("sniper")) {
    return createVisualTokens("#06B6D4", isCyber);
  }
  if (lower.includes("geo") || lower.includes("gold") || lower.includes("spectro") || lower.includes("harmony") || lower.includes("preservation") || lower.includes("yel") || lower.includes("supporter")) {
    return createVisualTokens("#F59E0B", isCyber);
  }
  if (lower.includes("havoc") || lower.includes("dark") || lower.includes("specialist")) {
    return createVisualTokens("#E11D48", isCyber);
  }

  return createVisualTokens("#3B82F6", isCyber);
}
