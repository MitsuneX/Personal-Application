/**
 * Centralized Game Icon Recognition Registry & Normalization Engine
 */

export interface GameIconEntry {
  id: string;
  name: string;
  aliases: string[];
  icon: string; // Public asset path / SVG URL / image URL
}

/**
 * Normalizes a game title string for deterministic matching:
 * Converts to lowercase, trims whitespace, and strips all punctuation/special characters.
 */
export function normalizeGameTitle(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Centralized Game Icon Registry
 * Uses local static SVG assets located in `/game-icons/`
 */
export const GAME_ICON_REGISTRY: GameIconEntry[] = [
  {
    id: "hsr",
    name: "Honkai: Star Rail",
    aliases: ["honkai star rail", "hsr", "star rail", "honkaistarrail"],
    icon: "/game-icons/hsr.svg",
  },
  {
    id: "genshin",
    name: "Genshin Impact",
    aliases: ["genshin impact", "genshin", "gi", "genshinimpact"],
    icon: "/game-icons/genshin.svg",
  },
  {
    id: "mlbb",
    name: "Mobile Legends: Bang Bang",
    aliases: ["mobile legends", "mobile legends bang bang", "mlbb", "mobile legend", "ml", "mobilelegends"],
    icon: "/game-icons/mlbb.svg",
  },
  {
    id: "valorant",
    name: "Valorant",
    aliases: ["valorant", "val"],
    icon: "/game-icons/valorant.svg",
  },
  {
    id: "zzz",
    name: "Zenless Zone Zero",
    aliases: ["zenless zone zero", "zzz", "zenlesszonezero"],
    icon: "/game-icons/zzz.svg",
  },
  {
    id: "wuwa",
    name: "Wuthering Waves",
    aliases: ["wuthering waves", "wuwa", "ww", "wutheringwaves"],
    icon: "/game-icons/wuwa.svg",
  },
  {
    id: "lol",
    name: "League of Legends",
    aliases: ["league of legends", "lol", "league", "leagueoflegends"],
    icon: "/game-icons/lol.svg",
  },
  {
    id: "dbl",
    name: "Dragon Ball Legends",
    aliases: ["dragon ball legends", "dbl", "dragonball legends", "dragonballlegends"],
    icon: "/game-icons/dbl.svg",
  },
  {
    id: "arknights",
    name: "Arknights",
    aliases: ["arknights", "ak"],
    icon: "/game-icons/arknights.svg",
  },
  {
    id: "fgo",
    name: "Fate/Grand Order",
    aliases: ["fate grand order", "fgo", "fate/grand order", "fategrandorder"],
    icon: "/game-icons/fgo.svg",
  },
  {
    id: "gfl2",
    name: "Girls' Frontline 2: Exilium",
    aliases: ["girls frontline 2", "gfl2", "gf2", "gf2exilium", "girlsfrontline2", "frontline 2", "exilium"],
    icon: "/game-icons/gfl2.svg",
  },
  {
    id: "outerplane",
    name: "Outerplane",
    aliases: ["outerplane", "outer plane"],
    icon: "/game-icons/outerplane.svg",
  },
  {
    id: "tof",
    name: "Tower of Fantasy",
    aliases: ["tower of fantasy", "tof", "toweroffantasy"],
    icon: "/game-icons/tof.svg",
  },
  {
    id: "nikke",
    name: "Goddess of Victory: NIKKE",
    aliases: ["nikke", "goddess of victory", "nikke goddess", "goddessvictory", "goddessofvictory"],
    icon: "/game-icons/nikke.svg",
  },
  {
    id: "endfield",
    name: "Arknights: Endfield",
    aliases: ["arknights endfield", "endfield", "arknightsendfield", "ak endfield"],
    icon: "/game-icons/endfield.svg",
  },
  {
    id: "hi3",
    name: "Honkai Impact 3rd",
    aliases: ["honkai impact 3rd", "honkai impact 3", "hi3", "honkaiimpact3", "honkai impact", "hi3rd"],
    icon: "/game-icons/honkaiimpact3.svg",
  },
  {
    id: "stellasora",
    name: "Stella Sora",
    aliases: ["stella sora", "stella", "stellasora"],
    icon: "/game-icons/stellasora.svg",
  },
  {
    id: "r1999",
    name: "Reverse: 1999",
    aliases: ["reverse 1999", "reverse1999", "r1999", "1999", "reverse: 1999"],
    icon: "/game-icons/r1999.svg",
  },
  {
    id: "umamusume",
    name: "Umamusume: Pretty Derby",
    aliases: ["umamusume pretty derby", "umamusume", "pretty derby", "umamusumeprettyderby", "uma"],
    icon: "/game-icons/umamusume.svg",
  },
];

export interface ResolvedIconResult {
  iconUrl?: string;
  fallbackEmoji?: string;
  isImage: boolean;
  source: "custom" | "recognized" | "fallback";
  matchedName?: string;
}

/**
 * Resolves the game icon using strict priority:
 * 1. User-uploaded custom icon (`customIcon`)
 * 2. Exact Canonical Title Match (`gameName`)
 * 3. Exact Normalized Alias Match (`gameName`)
 * 4. Default Fallback Icon
 */
export function resolveGameIcon(
  gameName?: string,
  customIcon?: string
): ResolvedIconResult {
  // Priority 1: User-uploaded custom icon
  if (customIcon && customIcon.trim().length > 0) {
    const trimmed = customIcon.trim();
    if (
      trimmed.startsWith("http") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/") ||
      trimmed.includes(".")
    ) {
      return { iconUrl: trimmed, isImage: true, source: "custom" };
    }
    return { fallbackEmoji: trimmed, isImage: false, source: "custom" };
  }

  // Priority 2 & 3: Recognized game icon
  if (gameName && gameName.trim().length > 0) {
    const normInput = normalizeGameTitle(gameName);
    if (normInput) {
      // Step A: Exact canonical title match
      const canonicalMatch = GAME_ICON_REGISTRY.find(
        (entry) => normalizeGameTitle(entry.name) === normInput
      );
      if (canonicalMatch) {
        return {
          iconUrl: canonicalMatch.icon,
          isImage: true,
          source: "recognized",
          matchedName: canonicalMatch.name,
        };
      }

      // Step B: Explicit alias match
      const aliasMatch = GAME_ICON_REGISTRY.find((entry) =>
        entry.aliases.some((alias) => normalizeGameTitle(alias) === normInput)
      );
      if (aliasMatch) {
        return {
          iconUrl: aliasMatch.icon,
          isImage: true,
          source: "recognized",
          matchedName: aliasMatch.name,
        };
      }
    }
  }

  // Priority 4: Fallback
  return { isImage: false, source: "fallback" };
}
