/**
 * gameCharacterSchema.ts
 *
 * Runtime validation and bidirectional canonical mapping for GameCharacterEntry JSON
 * against the application's domain types (lib/store/dashboardStore.ts).
 */

import type { GameCharacterEntry } from "@/lib/store/dashboardStore";

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function isStr(v: unknown): v is string {
  return typeof v === "string";
}

function isNum(v: unknown): v is number {
  return typeof v === "number";
}

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStrArr(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function assertStr(
  errors: ValidationError[],
  path: string,
  value: unknown,
  required = false
): void {
  if (value === undefined || value === null) {
    if (required) {
      errors.push({ path, message: `Required string field "${path}" is missing.`, severity: "error" });
    }
    return;
  }
  if (!isStr(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be a string, got ${typeof value}.`,
      severity: "error",
    });
  }
}

function assertNum(
  errors: ValidationError[],
  path: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (!isNum(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be a number, got ${typeof value}.`,
      severity: "error",
    });
  }
}

function assertBool(
  errors: ValidationError[],
  path: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (!isBool(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be a boolean, got ${typeof value}.`,
      severity: "error",
    });
  }
}

function assertStrArr(
  errors: ValidationError[],
  path: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (!Array.isArray(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be an array of strings, got ${typeof value}.`,
      severity: "error",
    });
    return;
  }
  value.forEach((item, i) => {
    if (!isStr(item)) {
      errors.push({
        path: `${path}[${i}]`,
        message: `Array item "${path}[${i}]" must be a string, got ${typeof item}.`,
        severity: "error",
      });
    }
  });
}

function assertSubObject(
  errors: ValidationError[],
  path: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (!isObj(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be an object, got ${typeof value}.`,
      severity: "error",
    });
  }
}

/**
 * Validates raw JSON input against GameCharacter schemas (both nested canonical and flat structures).
 */
export function validateGameCharacterJson(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || !isObj(input)) {
    return {
      valid: false,
      errors: [{ path: "root", message: "Input must be a JSON object.", severity: "error" }],
    };
  }

  const obj = input;

  // Required field
  assertStr(errors, "name", obj.name, true);

  // Validate canonical nested objects if present
  assertSubObject(errors, "identity", obj.identity);
  assertSubObject(errors, "world", obj.world);
  assertSubObject(errors, "combat", obj.combat);
  assertSubObject(errors, "voice", obj.voice);
  assertSubObject(errors, "story", obj.story);
  assertSubObject(errors, "voiceActors", obj.voiceActors);

  // String fields check
  const stringFields = [
    "characterId", "gameId", "gameName", "title", "officialName", "alias",
    "nickname", "nativeName", "birthday", "age", "gender", "height", "weight",
    "species", "race", "nation", "region", "planet", "organization",
    "affiliation", "faction", "role", "category", "element", "attribute",
    "path", "weapon", "rarity", "damageType", "combatRole", "difficulty",
    "personality", "biography", "officialDescription", "favoriteQuote",
    "cardImage", "avatarUrl", "splashArt", "accentColor", "tier", "notes",
  ];

  for (const field of stringFields) {
    assertStr(errors, field, obj[field]);
  }

  // Number fields check
  const numFields = [
    "health", "damage", "pickRate", "banRate", "winRate", "rank", "likes",
  ];
  for (const field of numFields) {
    assertNum(errors, field, obj[field]);
  }

  // Boolean fields check
  assertBool(errors, "isFavorite", obj.isFavorite);
  assertBool(errors, "isFeatured", obj.isFeatured);

  // String Array fields check
  assertStrArr(errors, "gallery", obj.gallery);
  assertStrArr(errors, "tags", obj.tags);

  return { valid: errors.length === 0, errors };
}

/**
 * Normalizes raw input (canonical nested or flat JSON) into a full GameCharacterEntry,
 * ensuring BOTH canonical nested objects AND flat properties are populated.
 */
export function normalizeGameCharacterJson(raw: any): GameCharacterEntry {
  if (!raw || typeof raw !== "object") {
    return { id: `gc-${Date.now()}`, name: "New Game Character" };
  }

  const identity = isObj(raw.identity) ? { ...raw.identity } : {};
  const world = isObj(raw.world) ? { ...raw.world } : {};
  const combat = isObj(raw.combat) ? { ...raw.combat } : {};
  const voice = isObj(raw.voice) ? { ...raw.voice } : {};
  const story = isObj(raw.story) ? { ...raw.story } : {};
  const voiceActors = isObj(raw.voiceActors) ? { ...raw.voiceActors } : {};

  // Extract values with priority: nested object > top-level property
  const birthday = (identity.birthday ?? raw.birthday ?? "") as string;
  const age = (identity.age ?? raw.age ?? "") as string;
  const gender = (identity.gender ?? raw.gender ?? "") as string;
  const height = (identity.height ?? raw.height ?? "") as string;
  const weight = (identity.weight ?? raw.weight ?? "") as string;
  const species = (identity.species ?? raw.species ?? "") as string;
  const race = (identity.race ?? raw.race ?? "") as string;

  const nation = (world.nation ?? combat.nation ?? raw.nation ?? "") as string;
  const region = (world.region ?? raw.region ?? "") as string;
  const planet = (world.planet ?? raw.planet ?? "") as string;
  const organization = (world.organization ?? raw.organization ?? "") as string;
  const affiliation = (world.affiliation ?? raw.affiliation ?? "") as string;
  const faction = (world.faction ?? raw.faction ?? "") as string;

  const role = (combat.role ?? raw.role ?? "") as string;
  const attribute = (combat.attribute ?? raw.attribute ?? "") as string;
  const element = (combat.element ?? raw.element ?? "") as string;
  const path = (combat.path ?? raw.path ?? "") as string;
  const weapon = (combat.weaponType ?? combat.weapon ?? raw.weapon ?? "") as string;
  const rarity = (combat.rarity ?? raw.rarity ?? "") as string;
  const damageType = (combat.damageType ?? raw.damageType ?? "") as string;
  const combatRole = (combat.combatRole ?? raw.combatRole ?? "") as string;

  const jpVoice = (voice.japanese ?? voice.jp ?? voiceActors.jp ?? "") as string;
  const cnVoice = (voice.chinese ?? voice.cn ?? voiceActors.cn ?? "") as string;
  const krVoice = (voice.korean ?? voice.kr ?? voiceActors.kr ?? "") as string;
  const enVoice = (voice.english ?? voice.en ?? voiceActors.en ?? "") as string;

  const personality = (story.personality ?? raw.personality ?? "") as string;
  const biography = (story.biography ?? raw.biography ?? "") as string;
  const officialDescription = (story.officialDescription ?? raw.officialDescription ?? "") as string;
  const favoriteQuote = (story.favoriteQuote ?? raw.favoriteQuote ?? "") as string;

  // Build full voiceActors object
  const normVoiceActors = {
    ...(jpVoice ? { jp: jpVoice } : {}),
    ...(cnVoice ? { cn: cnVoice } : {}),
    ...(krVoice ? { kr: krVoice } : {}),
    ...(enVoice ? { en: enVoice } : {}),
    ...voiceActors,
  };

  // Build full canonical nested objects
  const normIdentity = {
    birthday, age, gender, height, weight, species, race,
    ...identity,
  };

  const normWorld = {
    nation, region, planet, organization, affiliation, faction,
    ...world,
  };

  const normCombat = {
    role, attribute, element, path, weaponType: weapon, weapon, rarity,
    nation, birthday, damageType, combatRole,
    ...combat,
  };

  const normVoice = {
    japanese: jpVoice, chinese: cnVoice, korean: krVoice, english: enVoice,
    jp: jpVoice, cn: cnVoice, kr: krVoice, en: enVoice,
    ...voice,
  };

  const normStory = {
    personality, biography, officialDescription, favoriteQuote,
    ...story,
  };

  const entry: GameCharacterEntry = {
    id: raw.id || `gc-${Date.now()}`,
    name: raw.name || "New Game Character",
    officialName: raw.officialName ?? identity.officialName ?? "",
    alias: raw.alias ?? identity.alias ?? "",
    nickname: raw.nickname ?? identity.nickname ?? "",
    nativeName: raw.nativeName ?? identity.nativeName ?? "",
    title: raw.title ?? identity.title ?? "",
    gameId: raw.gameId ?? "",
    gameName: raw.gameName ?? "",
    characterId: raw.characterId ?? "",
    tier: raw.tier ?? "S",
    rank: raw.rank !== undefined ? raw.rank : null,
    isFavorite: raw.isFavorite !== undefined ? Boolean(raw.isFavorite) : true,
    isFeatured: raw.isFeatured !== undefined ? Boolean(raw.isFeatured) : false,
    accentColor: raw.accentColor ?? "#00F5FF",

    // Flat properties for UI compatibility
    birthday, age, gender, height, weight, species, race,
    nation, region, planet, organization, affiliation, faction,
    role, attribute, element, path, weapon, rarity, damageType, combatRole,
    voiceActors: normVoiceActors,
    personality, biography, officialDescription, favoriteQuote,

    // Media & Meta
    cardImage: raw.cardImage,
    avatarUrl: raw.avatarUrl,
    splashArt: raw.splashArt,
    gallery: Array.isArray(raw.gallery) ? raw.gallery : [],
    notes: raw.notes,
    stats: raw.stats,
    tags: raw.tags,

    // Canonical nested objects
    identity: normIdentity,
    world: normWorld,
    combat: normCombat,
    voice: normVoice,
    story: normStory,
  };

  // Preserve any unknown/custom top-level keys
  for (const key of Object.keys(raw)) {
    if (!(key in entry)) {
      (entry as any)[key] = raw[key];
    }
  }

  return entry;
}

/**
 * Converts a GameCharacterEntry into the standardized canonical nested JSON structure.
 */
export function exportGameCharacterToJson(entry: Partial<GameCharacterEntry>): Record<string, any> {
  const norm = normalizeGameCharacterJson(entry);

  const result: Record<string, any> = {
    id: norm.id,
    name: norm.name,
    officialName: norm.officialName ?? "",
    alias: norm.alias ?? "",
    nickname: norm.nickname ?? "",
    nativeName: norm.nativeName ?? "",
    title: norm.title ?? "",
    gameId: norm.gameId ?? "",
    gameName: norm.gameName ?? "",
    tier: norm.tier ?? "S",
    rank: norm.rank ?? null,
    isFavorite: Boolean(norm.isFavorite),
    isFeatured: Boolean(norm.isFeatured),
    accentColor: norm.accentColor ?? "#00F5FF",

    identity: {
      birthday: norm.identity?.birthday ?? norm.birthday ?? "",
      age: norm.identity?.age ?? norm.age ?? "",
      gender: norm.identity?.gender ?? norm.gender ?? "",
      height: norm.identity?.height ?? norm.height ?? "",
      weight: norm.identity?.weight ?? norm.weight ?? "",
      species: norm.identity?.species ?? norm.species ?? "",
      race: norm.identity?.race ?? norm.race ?? "",
      ...(norm.identity || {}),
    },

    world: {
      nation: norm.world?.nation ?? norm.nation ?? "",
      region: norm.world?.region ?? norm.region ?? "",
      planet: norm.world?.planet ?? norm.planet ?? "",
      organization: norm.world?.organization ?? norm.organization ?? "",
      affiliation: norm.world?.affiliation ?? norm.affiliation ?? "",
      faction: norm.world?.faction ?? norm.faction ?? "",
      ...(norm.world || {}),
    },

    combat: {
      role: norm.combat?.role ?? norm.role ?? "",
      attribute: norm.combat?.attribute ?? norm.attribute ?? "",
      element: norm.combat?.element ?? norm.element ?? "",
      path: norm.combat?.path ?? norm.path ?? "",
      weaponType: norm.combat?.weaponType ?? norm.combat?.weapon ?? norm.weapon ?? "",
      rarity: norm.combat?.rarity ?? norm.rarity ?? "",
      nation: norm.combat?.nation ?? norm.world?.nation ?? norm.nation ?? "",
      birthday: norm.combat?.birthday ?? norm.identity?.birthday ?? norm.birthday ?? "",
      damageType: norm.combat?.damageType ?? norm.damageType ?? "",
      combatRole: norm.combat?.combatRole ?? norm.combatRole ?? "",
      ...(norm.combat || {}),
    },

    voice: {
      japanese: norm.voice?.japanese ?? norm.voice?.jp ?? norm.voiceActors?.jp ?? "",
      chinese: norm.voice?.chinese ?? norm.voice?.cn ?? norm.voiceActors?.cn ?? "",
      korean: norm.voice?.korean ?? norm.voice?.kr ?? norm.voiceActors?.kr ?? "",
      english: norm.voice?.english ?? norm.voice?.en ?? norm.voiceActors?.en ?? "",
      ...(norm.voice || {}),
    },

    story: {
      personality: norm.story?.personality ?? norm.personality ?? "",
      biography: norm.story?.biography ?? norm.biography ?? "",
      officialDescription: norm.story?.officialDescription ?? norm.officialDescription ?? "",
      favoriteQuote: norm.story?.favoriteQuote ?? norm.favoriteQuote ?? "",
      ...(norm.story || {}),
    },
  };

  // Include media and meta fields if present
  if (norm.cardImage) result.cardImage = norm.cardImage;
  if (norm.avatarUrl) result.avatarUrl = norm.avatarUrl;
  if (norm.splashArt) result.splashArt = norm.splashArt;
  if (norm.gallery && norm.gallery.length > 0) result.gallery = norm.gallery;
  if (norm.notes) result.notes = norm.notes;
  if (norm.stats && Object.keys(norm.stats).length > 0) result.stats = norm.stats;
  if (norm.tags && norm.tags.length > 0) result.tags = norm.tags;

  // Preserve any remaining custom top-level fields
  for (const key of Object.keys(entry)) {
    if (!(key in result) && (entry as any)[key] !== undefined) {
      result[key] = (entry as any)[key];
    }
  }

  return result;
}

/**
 * Deep merge helper for GameCharacterEntry objects, ensuring sub-objects are recursively merged
 * without overwriting or deleting unmentioned keys.
 */
export function deepMergeGameCharacter(
  current: Partial<GameCharacterEntry>,
  incoming: Partial<GameCharacterEntry>
): Partial<GameCharacterEntry> {
  const normCur = normalizeGameCharacterJson(current);
  const rawInc = incoming as Record<string, any>;

  const merged: Record<string, any> = { ...normCur };

  // Sub-object keys that require deep merging
  const subObjectKeys = ["identity", "world", "combat", "voice", "story", "voiceActors", "stats"];

  for (const key of Object.keys(rawInc)) {
    const incVal = rawInc[key];
    if (incVal === undefined) continue;

    if (subObjectKeys.includes(key) && isObj(incVal)) {
      const curVal = isObj(merged[key]) ? merged[key] : {};
      merged[key] = { ...curVal, ...incVal };
    } else {
      merged[key] = incVal;
    }
  }

  // Pass through normalizeGameCharacterJson to ensure both flat fields and nested objects stay 100% in sync
  return normalizeGameCharacterJson(merged);
}

export type ChangeKind = "added" | "modified" | "removed" | "unchanged";

export interface FieldDiff {
  field: string;
  kind: ChangeKind;
  oldValue?: unknown;
  newValue?: unknown;
}

export function diffGameCharacterProfiles(
  current: Partial<GameCharacterEntry>,
  incoming: Partial<GameCharacterEntry>
): FieldDiff[] {
  const expCur = exportGameCharacterToJson(current);
  const expInc = exportGameCharacterToJson(incoming);

  const diffs: FieldDiff[] = [];
  const allKeys = new Set([
    ...Object.keys(expCur),
    ...Object.keys(expInc),
  ]);

  for (const key of allKeys) {
    const cur = expCur[key];
    const inc = expInc[key];

    if (inc === undefined) {
      diffs.push({ field: key, kind: "unchanged", oldValue: cur, newValue: cur });
      continue;
    }

    if (cur === undefined || cur === null) {
      diffs.push({ field: key, kind: "added", oldValue: undefined, newValue: inc });
      continue;
    }

    const curSer = JSON.stringify(cur);
    const incSer = JSON.stringify(inc);

    if (curSer !== incSer) {
      diffs.push({ field: key, kind: "modified", oldValue: cur, newValue: inc });
    } else {
      diffs.push({ field: key, kind: "unchanged", oldValue: cur, newValue: inc });
    }
  }

  return diffs;
}

export function summarizeDiff(diffs: FieldDiff[]) {
  let added = 0, modified = 0, removed = 0, unchanged = 0;
  const notable: FieldDiff[] = [];

  for (const d of diffs) {
    if (d.kind === "added") { added++; notable.push(d); }
    else if (d.kind === "modified") { modified++; notable.push(d); }
    else if (d.kind === "removed") removed++;
    else unchanged++;
  }

  return { added, modified, removed, unchanged, notable: notable.slice(0, 15) };
}
