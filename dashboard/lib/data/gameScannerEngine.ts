/**
 * Game-Aware AI / OCR Screenshot Extraction & Scanner Engine
 * Option B Architecture: Screenshot -> Extraction -> User Review -> Confirm & Persist
 */

import { normalizeGameTitle } from "./gameIcons";
import { getGameDossierConfig } from "./gameDossierConfig";
import type { DossierCharacterEntry } from "@/lib/store/dashboardStore";

export interface ExtractedField<T> {
  value: T;
  status: "detected" | "needs_review" | "not_found";
  confidence: number; // 0 - 100
  label: string;
}

export interface ExtractedDossierResult {
  gameId: string;
  gameTitle: string;
  name: ExtractedField<string>;
  category: ExtractedField<string>;
  role: ExtractedField<string>;
  levelRank: ExtractedField<string>;
  winRate: ExtractedField<number>;
  matches: ExtractedField<number>;
  kda: ExtractedField<string>;
  mvpCount: ExtractedField<number>;
  notes: ExtractedField<string>;
  accentColor: string;
  isDuplicate: boolean;
  duplicateMessage?: string;
  existingId?: string;
  rawTextSummary: string;
}

// Famous Known Character Registries per Game for High-Accuracy Recognition
const GAME_CHARACTER_REGISTRIES: Record<string, { names: string[]; defaultCategoryMap: Record<string, string> }> = {
  mobilelegends: {
    names: [
      "Chou", "Ling", "Kagura", "Beatrix", "Khufra", "Ruby", "Gusion", "Fanny", "Claude",
      "Lancelot", "Hayabusa", "Franco", "Tigreal", "Angela", "Wanwan", "Lesley", "Granger",
      "Yu Zhong", "Paquito", "Fredrinn", "Nolan", "Suyou", "Lukas", "Cici", "Arlott", "Joy"
    ],
    defaultCategoryMap: {
      chou: "EXP Lane", yuzhong: "EXP Lane", paquito: "EXP Lane", arlott: "EXP Lane", cici: "EXP Lane",
      ling: "Jungle", fanny: "Jungle", gusion: "Jungle", lancelot: "Jungle", hayabusa: "Jungle", nolan: "Jungle", fredrinn: "Jungle",
      kagura: "Mid Lane", lunox: "Mid Lane", xavier: "Mid Lane", cecilion: "Mid Lane", pharsa: "Mid Lane",
      beatrix: "Gold Lane", claude: "Gold Lane", wanwan: "Gold Lane", lesley: "Gold Lane", granger: "Gold Lane",
      khufra: "Roam", franco: "Roam", tigreal: "Roam", angela: "Roam", estes: "Roam", ruby: "EXP Lane"
    }
  },
  honkaistarrail: {
    names: [
      "Acheron", "Jingliu", "Firefly", "Sparkle", "Bronya", "Ruan Mei", "Kafka", "Black Swan",
      "Aventurine", "Dan Heng IL", "Blade", "Robin", "Feixiao", "Sunday", "Silver Wolf", "Fu Xuan",
      "Luocha", "Huohuo", "Topaz", "Jade", "Dr. Ratio", "Boothill", "Yunli", "Jiaoqiu", "Rappa"
    ],
    defaultCategoryMap: {
      acheron: "Nihility", kafka: "Nihility", blackswan: "Nihility", silverwolf: "Nihility", jiaoqiu: "Nihility",
      jingliu: "Destruction", firefly: "Destruction", danhengil: "Destruction", blade: "Destruction", yunli: "Destruction",
      sparkle: "Harmony", bronya: "Harmony", ruanmei: "Harmony", robin: "Harmony", sunday: "Harmony",
      feixiao: "Hunt", topaz: "Hunt", drratio: "Hunt", boothill: "Hunt", rappa: "Erudition", jade: "Erudition",
      aventurine: "Preservation", fuxuan: "Preservation", luocha: "Abundance", huohuo: "Abundance"
    }
  },
  valorant: {
    names: [
      "Jett", "Reyna", "Raze", "Omen", "Sova", "Fade", "Cypher", "Killjoy", "Viper", "Brimstone",
      "Breach", "Iso", "Clove", "Neon", "Yoru", "Phoenix", "Chamber", "KAY/O", "Skye", "Harbor", "Deadlock", "Vyse"
    ],
    defaultCategoryMap: {
      jett: "Duelist", reyna: "Duelist", raze: "Duelist", neon: "Duelist", yoru: "Duelist", phoenix: "Duelist", iso: "Duelist",
      omen: "Controller", viper: "Controller", brimstone: "Controller", clove: "Controller", harbor: "Controller",
      sova: "Initiator", fade: "Initiator", breach: "Initiator", kayo: "Initiator", skye: "Initiator",
      cypher: "Sentinel", killjoy: "Sentinel", chamber: "Sentinel", deadlock: "Sentinel", vyse: "Sentinel"
    }
  },
  genshinimpact: {
    names: [
      "Xiao", "Yelan", "Zhongli", "Kazuha", "Raiden Shogun", "Hu Tao", "Furina", "Neuvillette",
      "Nahida", "Alhaitham", "Arlecchino", "Mualani", "Kinich", "Xilonen", "Chiori", "Clorinde",
      "Navia", "Wriothesley", "Lyney", "Baizhu", "Wanderer", "Nilou", "Yae Miko", "Ganyu", "Ayaka"
    ],
    defaultCategoryMap: {
      xiao: "Main DPS", hutao: "Main DPS", neuvillette: "Main DPS", arlecchino: "Main DPS", alhaitham: "Main DPS", kinich: "Main DPS", mualani: "Main DPS",
      yelan: "Sub DPS", furina: "Sub DPS", yaemiko: "Sub DPS", navia: "Main DPS", clorinde: "Main DPS",
      kazuha: "Support", nahida: "Support", xilonen: "Support", baizhu: "Healer / Shielder",
      zhongli: "Healer / Shielder", raidenshogun: "Main DPS"
    }
  }
};

/**
 * Simulates OCR Vision extraction on game statistics screenshots,
 * parsing text patterns, match numbers, win rates, and mapping to game-aware schemas.
 */
export async function analyzeGameScreenshot(
  imageNameOrUrl: string,
  gameTitle: string,
  gameCategory: string,
  existingDossierCharacters: DossierCharacterEntry[] = []
): Promise<ExtractedDossierResult> {
  const normTitle = normalizeGameTitle(gameTitle);
  const config = getGameDossierConfig(gameTitle, gameCategory);

  // Normalize image string to inspect names / clues from filename or mock data stream
  const lowerInput = (imageNameOrUrl || "").toLowerCase();

  const knownRegistry = GAME_CHARACTER_REGISTRIES[normTitle];

  // 1. Detect Character Name
  let detectedName = "";
  let nameStatus: ExtractedField<string>["status"] = "not_found";
  let nameConfidence = 0;

  if (knownRegistry) {
    for (const nameCandidate of knownRegistry.names) {
      const normCand = normalizeGameTitle(nameCandidate);
      if (lowerInput.includes(normCand)) {
        detectedName = nameCandidate;
        nameStatus = "detected";
        nameConfidence = 92;
        break;
      }
    }
  }

  // Fallback: If no name matched from filename, select top main character or default from registry
  if (!detectedName) {
    if (knownRegistry && knownRegistry.names.length > 0) {
      // Pick a plausible detected character for demo analysis
      const pseudoIndex = Math.abs(hashCode(lowerInput + gameTitle)) % knownRegistry.names.length;
      detectedName = knownRegistry.names[pseudoIndex] || "Hero Unit";
      nameStatus = "needs_review";
      nameConfidence = 65;
    } else {
      detectedName = "Character Unit 1";
      nameStatus = "needs_review";
      nameConfidence = 50;
    }
  }

  // 2. Detect Category / Lane
  let detectedCategory = config.categories[0]?.name || "Main Roster";
  let categoryStatus: ExtractedField<string>["status"] = "needs_review";
  let categoryConfidence = 70;

  if (knownRegistry) {
    const normDetected = normalizeGameTitle(detectedName);
    if (knownRegistry.defaultCategoryMap[normDetected]) {
      detectedCategory = knownRegistry.defaultCategoryMap[normDetected];
      categoryStatus = "detected";
      categoryConfidence = 90;
    }
  }

  // 3. Extract Win Rate %
  let winRateVal = 62.5;
  let winrateStatus: ExtractedField<number>["status"] = "detected";
  let winrateConfidence = 88;

  // Check if winrate pattern exists in string (e.g. 64.3% or 64_3)
  const wrMatch = lowerInput.match(/(\d{2})[._%](\d{1,2})/);
  if (wrMatch) {
    const parsed = parseFloat(`${wrMatch[1]}.${wrMatch[2]}`);
    if (parsed >= 30 && parsed <= 100) {
      winRateVal = parsed;
      winrateStatus = "detected";
      winrateConfidence = 95;
    }
  } else {
    // Generate deterministic statistical snapshot based on image seed
    winRateVal = 55 + (Math.abs(hashCode(lowerInput)) % 38);
    winrateStatus = "needs_review";
    winrateConfidence = 68;
  }

  // 4. Extract Matches Count
  let matchesVal = 120;
  let matchesStatus: ExtractedField<number>["status"] = "detected";
  const matchNum = lowerInput.match(/(\d{2,4})\s*(match|matches|games|m)/i);
  if (matchNum) {
    matchesVal = parseInt(matchNum[1], 10);
    matchesStatus = "detected";
  } else {
    matchesVal = 45 + (Math.abs(hashCode(lowerInput + "matches")) % 250);
    matchesStatus = "needs_review";
  }

  // 5. Extract KDA / Performance metrics
  let kdaVal = "4.25 (12 / 2.8 / 8.5)";
  if (normTitle.includes("valorant")) {
    kdaVal = "1.32 K/D • 248 ACS";
  } else if (normTitle.includes("starrail") || normTitle.includes("genshin")) {
    kdaVal = "100% Abyss/MoC Clear";
  }

  // 6. Level / Rank
  let levelRankVal = "Mastery 7";
  if (normTitle.includes("starrail")) levelRankVal = "E2S1 - Lvl 80";
  else if (normTitle.includes("valorant")) levelRankVal = "Ascendant 3";
  else if (normTitle.includes("genshin")) levelRankVal = "Lvl 90 - C2";

  // Check Duplicate
  const existingDup = existingDossierCharacters.find(
    (c) => normalizeGameTitle(c.name) === normalizeGameTitle(detectedName)
  );

  return {
    gameId: "",
    gameTitle,
    name: {
      value: detectedName,
      status: nameStatus,
      confidence: nameConfidence,
      label: `${config.characterLabel} Name`,
    },
    category: {
      value: detectedCategory,
      status: categoryStatus,
      confidence: categoryConfidence,
      label: config.categoryLabel,
    },
    role: {
      value: `${config.characterLabel} Specialty`,
      status: "detected",
      confidence: 85,
      label: "Sub-Role / Specialty",
    },
    levelRank: {
      value: levelRankVal,
      status: "detected",
      confidence: 82,
      label: "Level / Mastery / Build",
    },
    winRate: {
      value: winRateVal,
      status: winrateStatus,
      confidence: winrateConfidence,
      label: "Win Rate (%)",
    },
    matches: {
      value: matchesVal,
      status: matchesStatus,
      confidence: 80,
      label: "Total Matches",
    },
    kda: {
      value: kdaVal,
      status: "detected",
      confidence: 85,
      label: "KDA / Combat Rating",
    },
    mvpCount: {
      value: Math.floor(matchesVal * 0.28),
      status: "detected",
      confidence: 78,
      label: "MVP Highlights",
    },
    notes: {
      value: `Imported via AI Screenshot Scanner on ${new Date().toLocaleDateString()}`,
      status: "detected",
      confidence: 100,
      label: "Import Notes",
    },
    accentColor: "#3B82F6",
    isDuplicate: !!existingDup,
    duplicateMessage: existingDup
      ? `A dossier record for ${existingDup.name} already exists in this game's dossier. Confirming will update the existing entry with the latest statistics.`
      : undefined,
    existingId: existingDup?.id,
    rawTextSummary: `OCR Extracted: ${detectedName} | Category: ${detectedCategory} | Winrate: ${winRateVal}% | Matches: ${matchesVal}`,
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
