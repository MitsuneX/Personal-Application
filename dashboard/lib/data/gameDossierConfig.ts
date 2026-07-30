/**
 * Game-Aware Dossier Category Configuration Engine
 * Maps game titles and categories to custom role structures (MOBA Lanes, HSR Paths, Valorant Roles, Genshin Combat Roles, etc.)
 */

import { normalizeGameTitle } from "./gameIcons";

export interface DossierCategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface GameDossierConfig {
  gameType: string;
  categoryLabel: string; // e.g. "Lanes & Positions", "Paths of the Express", "Agent Roles"
  characterLabel: string; // e.g. "Hero", "Character", "Agent", "Operator"
  categories: DossierCategoryItem[];
}

/**
 * Predefined Game Dossier Configurations
 */
const SPECIFIC_GAME_CONFIGS: Record<string, GameDossierConfig> = {
  // Mobile Legends: Bang Bang
  mobilelegends: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Tactical Positions",
    characterLabel: "Hero",
    categories: [
      { id: "exp", name: "EXP Lane", icon: "⚔️", description: "Solo lane durability & team-fight initiation" },
      { id: "jungle", name: "Jungle", icon: "🌲", description: "Objective control, rotations & gank execution" },
      { id: "mid", name: "Mid Lane", icon: "🎯", description: "High magic burst, crowd control & fast wave clear" },
      { id: "gold", name: "Gold Lane", icon: "🏹", description: "Late-game physical DPS & hyper-carry scaling" },
      { id: "roam", name: "Roam", icon: "🛡️", description: "Vision control, peel & frontline protection" },
    ],
  },
  // Honkai: Star Rail
  honkaistarrail: {
    gameType: "Turn-Based RPG",
    categoryLabel: "Paths of the Astral Express",
    characterLabel: "Character",
    categories: [
      { id: "destruction", name: "Destruction", icon: "💥", description: "Heavy blast & survivability frontline DPS" },
      { id: "hunt", name: "Hunt", icon: "🎯", description: "Single-target high-speed assassin DPS" },
      { id: "erudition", name: "Erudition", icon: "⚡", description: "Multi-target AoE wave clear & burst" },
      { id: "harmony", name: "Harmony", icon: "🎶", description: "Team ATK/CRIT buffers & action manipulators" },
      { id: "nihility", name: "Nihility", icon: "🌀", description: "Enemy debuffers & Damage-over-Time (DoT)" },
      { id: "preservation", name: "Preservation", icon: "🛡️", description: "Shield generation & damage mitigation" },
      { id: "abundance", name: "Abundance", icon: "💚", description: "HP restoration & cleanse sustain" },
    ],
  },
  // Valorant
  valorant: {
    gameType: "Tactical Shooter",
    categoryLabel: "Protocol Agent Roles",
    characterLabel: "Agent",
    categories: [
      { id: "duelist", name: "Duelist", icon: "🔥", description: "Self-sufficient entry fraggers & duel takers" },
      { id: "controller", name: "Controller", icon: "☁️", description: "Sightline suppression & smoke executioners" },
      { id: "initiator", name: "Initiator", icon: "👁️", description: "Reconnaissance & site entry enablers" },
      { id: "sentinel", name: "Sentinel", icon: "🛡️", description: "Defensive anchors & site lockdown experts" },
    ],
  },
  // Genshin Impact
  genshinimpact: {
    gameType: "Action RPG",
    categoryLabel: "Combat Roles & Elements",
    characterLabel: "Character",
    categories: [
      { id: "maindps", name: "Main DPS", icon: "🗡️", description: "On-field elemental damage driver" },
      { id: "subdps", name: "Sub DPS", icon: "⚡", description: "Off-field elemental reaction enabler" },
      { id: "support", name: "Support", icon: "✨", description: "Elemental buffing & battery utility" },
      { id: "healer", name: "Healer / Shielder", icon: "💚", description: "Party HP restoration & shield sustain" },
    ],
  },
  // Zenless Zone Zero
  zenlesszonezero: {
    gameType: "Gacha Action",
    categoryLabel: "Agent Fighting Styles",
    characterLabel: "Agent",
    categories: [
      { id: "dps", name: "Attack / DPS", icon: "🗡️", description: "Primary damage output driver" },
      { id: "stun", name: "Stun", icon: "⚡", description: "Heavy daze meter buildup specialist" },
      { id: "support", name: "Support", icon: "🎶", description: "Team energy & damage buff utility" },
      { id: "anomaly", name: "Anomaly", icon: "🌀", description: "Attribute buildup & elemental anomaly" },
      { id: "defense", name: "Defense", icon: "🛡️", description: "Counter-attacks & guard mitigation" },
    ],
  },
};

/**
 * Fallback Game Category Configs (MOBA, FPS, RPG, Fighting, General)
 */
const GENERIC_CATEGORY_CONFIGS: Record<string, GameDossierConfig> = {
  moba: {
    gameType: "MOBA",
    categoryLabel: "Lanes & Positions",
    characterLabel: "Hero",
    categories: [
      { id: "exp", name: "EXP Lane", icon: "⚔️", description: "Solo fighters & tanks" },
      { id: "jungle", name: "Jungle", icon: "🌲", description: "Objective control & ganks" },
      { id: "mid", name: "Mid Lane", icon: "🎯", description: "Burst mages & assassins" },
      { id: "gold", name: "Gold Lane", icon: "🏹", description: "Marksmen & carries" },
      { id: "roam", name: "Roam", icon: "🛡️", description: "Support & vision" },
    ],
  },
  fps: {
    gameType: "FPS / Shooter",
    categoryLabel: "Tactical Roles",
    characterLabel: "Agent / Operator",
    categories: [
      { id: "duelist", name: "Offense / Duelist", icon: "🔥", description: "Entry fraggers & damage" },
      { id: "recon", name: "Recon / Intel", icon: "👁️", description: "Information & scanning" },
      { id: "support", name: "Support / Utility", icon: "☁️", description: "Smokes & healing utility" },
      { id: "anchor", name: "Defense / Anchor", icon: "🛡️", description: "Site hold & lockdown" },
    ],
  },
  gacharpg: {
    gameType: "Gacha RPG",
    categoryLabel: "Combat Roles",
    characterLabel: "Character",
    categories: [
      { id: "maindps", name: "Main DPS", icon: "💥", description: "Primary damage dealer" },
      { id: "subdps", name: "Sub DPS", icon: "⚡", description: "Secondary damage & burst" },
      { id: "buffer", name: "Buffer / Support", icon: "🎶", description: "Stat buffers & utility" },
      { id: "sustain", name: "Sustain / Healer", icon: "💚", description: "Shields & healing" },
    ],
  },
  fighting: {
    gameType: "Fighting",
    categoryLabel: "Fighter Roster",
    characterLabel: "Fighter",
    categories: [
      { id: "main", name: "Main Fighter", icon: "🥊", description: "Primary tournament main" },
      { id: "sec", name: "Secondary Main", icon: "⚡", description: "Secondary pocket pick" },
      { id: "flex", name: "Flex / Sub", icon: "🔄", description: "Situational counter-pick" },
    ],
  },
  default: {
    gameType: "General Game",
    categoryLabel: "Roster Breakdown",
    characterLabel: "Character",
    categories: [
      { id: "main", name: "Main Roster", icon: "👑", description: "Primary played characters" },
      { id: "secondary", name: "Secondary Pick", icon: "⚡", description: "Pocket picks" },
      { id: "flex", name: "Flex / Sub", icon: "🔄", description: "Situational flex choices" },
      { id: "utility", name: "Support / Utility", icon: "🛡️", description: "Utility & assistance" },
    ],
  },
};

/**
 * Resolves the game-aware dossier config for any game title and category
 */
export function getGameDossierConfig(
  gameTitle?: string,
  gameCategory?: string
): GameDossierConfig {
  if (gameTitle) {
    const normTitle = normalizeGameTitle(gameTitle);
    if (SPECIFIC_GAME_CONFIGS[normTitle]) {
      return SPECIFIC_GAME_CONFIGS[normTitle];
    }
  }

  if (gameCategory) {
    const normCategory = normalizeGameTitle(gameCategory);
    if (GENERIC_CATEGORY_CONFIGS[normCategory]) {
      return GENERIC_CATEGORY_CONFIGS[normCategory];
    }
    // Partial category matching
    if (normCategory.includes("moba")) return GENERIC_CATEGORY_CONFIGS.moba;
    if (normCategory.includes("fps") || normCategory.includes("shooter")) return GENERIC_CATEGORY_CONFIGS.fps;
    if (normCategory.includes("rpg") || normCategory.includes("gacha")) return GENERIC_CATEGORY_CONFIGS.gacharpg;
    if (normCategory.includes("fight")) return GENERIC_CATEGORY_CONFIGS.fighting;
  }

  return GENERIC_CATEGORY_CONFIGS.default;
}
