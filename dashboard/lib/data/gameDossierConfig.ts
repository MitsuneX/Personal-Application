/**
 * Game-Aware Dossier Capability Configuration Engine
 * Drives: category labels, character labels, element systems, resource presets, game type
 */

import { normalizeGameTitle } from "./gameIcons";

// ─── Element System ────────────────────────────────────────────────────────────

export interface GameElement {
  id: string;
  name: string;
  icon: string;           // emoji or short symbol
  color: string;          // accent hex
  description?: string;
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

// ─── Specific Game Configs ────────────────────────────────────────────────────

const SPECIFIC_GAME_CONFIGS: Record<string, GameCapabilityConfig> = {

  // ── Mobile Legends: Bang Bang ──────────────────────────────────────────────
  mobilelegends: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Tactical Positions",
    characterLabel: "Hero",
    resourcePresetsEnabled: true,
    categories: [
      { id: "exp",    name: "EXP Lane", icon: "⚔️",  description: "Solo lane durability & team-fight initiation" },
      { id: "jungle", name: "Jungle",   icon: "🌲",  description: "Objective control, rotations & gank execution" },
      { id: "mid",    name: "Mid Lane", icon: "🎯",  description: "High magic burst, crowd control & fast wave clear" },
      { id: "gold",   name: "Gold Lane",icon: "🏹",  description: "Late-game physical DPS & hyper-carry scaling" },
      { id: "roam",   name: "Roam",     icon: "🛡️",  description: "Vision control, peel & frontline protection" },
    ],
    // No elements — MOBA mechanics do not use Genshin-style elemental systems
  },

  // ── Honkai: Star Rail ──────────────────────────────────────────────────────
  honkaistarrail: {
    gameType: "Turn-Based RPG",
    categoryLabel: "Paths of the Astral Express",
    characterLabel: "Character",
    resourcePresetsEnabled: true,
    categories: [
      { id: "destruction",  name: "Destruction",  icon: "💥", description: "Heavy blast & survivability frontline DPS" },
      { id: "hunt",         name: "Hunt",          icon: "🎯", description: "Single-target high-speed assassin DPS" },
      { id: "erudition",    name: "Erudition",     icon: "⚡", description: "Multi-target AoE wave clear & burst" },
      { id: "harmony",      name: "Harmony",       icon: "🎶", description: "Team ATK/CRIT buffers & action manipulators" },
      { id: "nihility",     name: "Nihility",      icon: "🌀", description: "Enemy debuffers & Damage-over-Time (DoT)" },
      { id: "preservation", name: "Preservation",  icon: "🛡️", description: "Shield generation & damage mitigation" },
      { id: "abundance",    name: "Abundance",     icon: "💚", description: "HP restoration & cleanse sustain" },
      { id: "remembrance",  name: "Remembrance",   icon: "❄️", description: "Memory & MoC specialized expansion path" },
      { id: "elation",      name: "Elation",       icon: "🌟", description: "Follow-up & collective synergy resonance" },
    ],
    // HSR uses "Elements" (fire/ice/wind/lightning/quantum/imaginary/physical)
    elementSystem: {
      sectionLabel: "Combat Elements",
      elements: [
        { id: "fire",        name: "Fire",        icon: "🔥", color: "#EF4444" },
        { id: "ice",         name: "Ice",         icon: "❄️", color: "#60A5FA" },
        { id: "wind",        name: "Wind",        icon: "💨", color: "#34D399" },
        { id: "lightning",   name: "Lightning",   icon: "⚡", color: "#A78BFA" },
        { id: "quantum",     name: "Quantum",     icon: "🌀", color: "#818CF8" },
        { id: "imaginary",   name: "Imaginary",   icon: "✨", color: "#FCD34D" },
        { id: "physical",    name: "Physical",    icon: "💪", color: "#94A3B8" },
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
      { id: "duelist",    name: "Duelist",    icon: "🔥", description: "Self-sufficient entry fraggers & duel takers" },
      { id: "controller", name: "Controller", icon: "☁️", description: "Sightline suppression & smoke executioners" },
      { id: "initiator",  name: "Initiator",  icon: "👁️", description: "Reconnaissance & site entry enablers" },
      { id: "sentinel",   name: "Sentinel",   icon: "🛡️", description: "Defensive anchors & site lockdown experts" },
    ],
    // No elemental system — Valorant abilities are not elemental
  },

  // ── Genshin Impact ────────────────────────────────────────────────────────
  genshinimpact: {
    gameType: "Action RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Character",
    resourcePresetsEnabled: true,
    categories: [
      { id: "maindps", name: "Main DPS",       icon: "🗡️", description: "On-field elemental damage driver" },
      { id: "subdps",  name: "Sub DPS",        icon: "⚡", description: "Off-field elemental reaction enabler" },
      { id: "support", name: "Support",        icon: "✨", description: "Elemental buffing & battery utility" },
      { id: "healer",  name: "Healer / Shield", icon: "💚", description: "Party HP restoration & shield sustain" },
    ],
    elementSystem: {
      sectionLabel: "Elements",
      elements: [
        { id: "pyro",     name: "Pyro",     icon: "🔥", color: "#EF4444", description: "Fire reactions: Vaporize, Melt, Overloaded" },
        { id: "hydro",    name: "Hydro",    icon: "💧", color: "#3B82F6", description: "Water reactions: Vaporize, Frozen, Bloom" },
        { id: "anemo",    name: "Anemo",    icon: "💨", color: "#34D399", description: "Wind reactions: Swirl spread" },
        { id: "electro",  name: "Electro",  icon: "⚡", color: "#8B5CF6", description: "Lightning reactions: Overloaded, Superconduct, Quicken" },
        { id: "dendro",   name: "Dendro",   icon: "🌿", color: "#22C55E", description: "Nature reactions: Bloom, Quicken, Burgeon" },
        { id: "cryo",     name: "Cryo",     icon: "❄️", color: "#67E8F9", description: "Ice reactions: Frozen, Melt, Superconduct" },
        { id: "geo",      name: "Geo",      icon: "🪨", color: "#D97706", description: "Earth reactions: Crystallize shield" },
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
      { id: "dps",     name: "DPS / Main",    icon: "🗡️", description: "Primary on-field damage resonator" },
      { id: "subdps",  name: "Sub DPS",       icon: "⚡", description: "Off-field concerto & coordinated atk" },
      { id: "support", name: "Support",       icon: "🎶", description: "Concerto energy & team buffs" },
      { id: "healer",  name: "Healer",        icon: "💚", description: "HP restoration & Forte sustain" },
    ],
    // Wuthering Waves uses its own Resonance Attribute system (not Genshin elements)
    elementSystem: {
      sectionLabel: "Resonance Attributes",
      elements: [
        { id: "glacio",    name: "Glacio",    icon: "❄️", color: "#67E8F9", description: "Ice attribute — Glacio Erosion" },
        { id: "fusion",    name: "Fusion",    icon: "🔥", color: "#EF4444", description: "Fire attribute — Fusion Erosion" },
        { id: "electro",   name: "Electro",   icon: "⚡", color: "#A78BFA", description: "Lightning attribute — Electro Erosion" },
        { id: "aero",      name: "Aero",      icon: "💨", color: "#34D399", description: "Wind attribute — Aero Erosion" },
        { id: "spectro",   name: "Spectro",   icon: "✨", color: "#FCD34D", description: "Light attribute — Spectro Erosion" },
        { id: "havoc",     name: "Havoc",     icon: "🌑", color: "#8B5CF6", description: "Dark/Chaos attribute — Havoc Erosion" },
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
      { id: "dps",     name: "Attack / DPS", icon: "🗡️", description: "Primary damage output driver" },
      { id: "stun",    name: "Stun",         icon: "⚡", description: "Heavy daze meter buildup specialist" },
      { id: "support", name: "Support",      icon: "🎶", description: "Team energy & damage buff utility" },
      { id: "anomaly", name: "Anomaly",      icon: "🌀", description: "Attribute buildup & elemental anomaly" },
      { id: "defense", name: "Defense",      icon: "🛡️", description: "Counter-attacks & guard mitigation" },
    ],
    // ZZZ uses Attributes (not "elements"), but they function similarly
    elementSystem: {
      sectionLabel: "Attributes",
      elements: [
        { id: "physical",   name: "Physical",   icon: "💪", color: "#94A3B8" },
        { id: "fire",       name: "Fire",       icon: "🔥", color: "#EF4444" },
        { id: "ice",        name: "Ice",        icon: "❄️", color: "#60A5FA" },
        { id: "electric",   name: "Electric",   icon: "⚡", color: "#A78BFA" },
        { id: "ether",      name: "Ether",      icon: "✨", color: "#34D399" },
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
      { id: "melee",    name: "Melee",     icon: "👊", description: "Close-range physical striker" },
      { id: "ranged",   name: "Ranged",    icon: "💥", description: "Energy blast & long-range attacker" },
      { id: "support",  name: "Support",   icon: "🌟", description: "Team heal & buff booster" },
      { id: "defense",  name: "Defense",   icon: "🛡️", description: "Tank & damage absorber" },
    ],
    // Dragon Ball has battle attributes (not elemental reactions like Genshin/WuWa)
    elementSystem: {
      sectionLabel: "Battle Attributes",
      elements: [
        { id: "red",    name: "RED",    icon: "🔴", color: "#EF4444", description: "Effective against PUR" },
        { id: "blue",   name: "BLU",    icon: "🔵", color: "#3B82F6", description: "Effective against RED" },
        { id: "green",  name: "GRN",    icon: "🟢", color: "#22C55E", description: "Effective against BLU" },
        { id: "yellow", name: "YEL",    icon: "🟡", color: "#EAB308", description: "Effective against GRN" },
        { id: "purple", name: "PUR",    icon: "🟣", color: "#8B5CF6", description: "Effective against YEL" },
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
      { id: "guard",     name: "Guard",     icon: "⚔️", description: "Frontline DPS & blocking operator" },
      { id: "defender",  name: "Defender",  icon: "🛡️", description: "High HP tanking & HP sustain" },
      { id: "sniper",    name: "Sniper",    icon: "🎯", description: "Ranged physical/arts damage dealer" },
      { id: "caster",    name: "Caster",    icon: "🌀", description: "Ranged arts damage dealer" },
      { id: "medic",     name: "Medic",     icon: "💚", description: "HP restoration support" },
      { id: "supporter", name: "Supporter", icon: "🎶", description: "Buff, debuff & utility" },
      { id: "specialist", name: "Specialist",icon: "⚡", description: "Unique mechanics & repositioning" },
      { id: "vanguard",  name: "Vanguard",  icon: "🔮", description: "DP generation & early deployment" },
    ],
    // Arknights has damage types (Physical / Arts / True) but not a true elemental system
  },
};

// ─── Generic Category Fallbacks ───────────────────────────────────────────────

const GENERIC_CATEGORY_CONFIGS: Record<string, GameCapabilityConfig> = {
  moba: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Positions",
    characterLabel: "Hero",
    categories: [
      { id: "exp",    name: "EXP Lane",  icon: "⚔️", description: "Solo fighters & tanks" },
      { id: "jungle", name: "Jungle",    icon: "🌲", description: "Objective control & ganks" },
      { id: "mid",    name: "Mid Lane",  icon: "🎯", description: "Burst mages & assassins" },
      { id: "gold",   name: "Gold Lane", icon: "🏹", description: "Marksmen & carries" },
      { id: "roam",   name: "Roam",      icon: "🛡️", description: "Support & vision" },
    ],
  },
  fps: {
    gameType: "FPS / Shooter",
    categoryLabel: "Tactical Roles",
    characterLabel: "Agent / Operator",
    categories: [
      { id: "duelist",  name: "Offense / Duelist",  icon: "🔥", description: "Entry fraggers & damage" },
      { id: "recon",    name: "Recon / Intel",       icon: "👁️", description: "Information & scanning" },
      { id: "support",  name: "Support / Utility",   icon: "☁️", description: "Smokes & healing utility" },
      { id: "anchor",   name: "Defense / Anchor",    icon: "🛡️", description: "Site hold & lockdown" },
    ],
  },
  gacharpg: {
    gameType: "Gacha RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Character",
    categories: [
      { id: "maindps", name: "Main DPS",      icon: "💥", description: "Primary damage dealer" },
      { id: "subdps",  name: "Sub DPS",       icon: "⚡", description: "Secondary damage & burst" },
      { id: "buffer",  name: "Buffer / Support", icon: "🎶", description: "Stat buffers & utility" },
      { id: "sustain", name: "Sustain / Healer", icon: "💚", description: "Shields & healing" },
    ],
  },
  fighting: {
    gameType: "Fighting",
    categoryLabel: "Fighter Roster",
    characterLabel: "Fighter",
    categories: [
      { id: "main", name: "Main Fighter",    icon: "🥊", description: "Primary tournament main" },
      { id: "sec",  name: "Secondary Main", icon: "⚡", description: "Secondary pocket pick" },
      { id: "flex", name: "Flex / Sub",     icon: "🔄", description: "Situational counter-pick" },
    ],
  },
  rpg: {
    gameType: "RPG",
    categoryLabel: "Character Classes",
    characterLabel: "Character",
    categories: [
      { id: "dps",     name: "DPS",      icon: "🗡️", description: "Primary damage dealer" },
      { id: "tank",    name: "Tank",     icon: "🛡️", description: "Frontline protector" },
      { id: "healer",  name: "Healer",   icon: "💚", description: "HP restoration" },
      { id: "support", name: "Support",  icon: "✨", description: "Utility & buffs" },
    ],
  },
  default: {
    gameType: "General Game",
    categoryLabel: "Roster Breakdown",
    characterLabel: "Character",
    categories: [
      { id: "main",      name: "Main Roster",     icon: "👑", description: "Primary played characters" },
      { id: "secondary", name: "Secondary Pick",  icon: "⚡", description: "Pocket picks" },
      { id: "flex",      name: "Flex / Sub",      icon: "🔄", description: "Situational flex choices" },
      { id: "utility",   name: "Support / Utility",icon: "🛡️", description: "Utility & assistance" },
    ],
  },
};

// ─── Alias normalizations ─────────────────────────────────────────────────────

/** Extra alias mappings that normalizeGameTitle may not cover */
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
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolves the game-aware capability config for any game title and category.
 * Priority: specific title → title alias → generic category → default fallback.
 */
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
