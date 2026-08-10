/**
 * gameCharacterSchema.ts
 *
 * Runtime validation of GameCharacterEntry JSON against the application's
 * domain types (lib/store/dashboardStore.ts).
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

export function validateGameCharacterJson(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      valid: false,
      errors: [{ path: "root", message: "Input must be a JSON object.", severity: "error" }],
    };
  }

  const obj = input as Record<string, unknown>;

  // Required field
  assertStr(errors, "name", obj.name, true);

  // String fields
  const stringFields: (keyof GameCharacterEntry)[] = [
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

  // Number fields
  const numFields: (keyof GameCharacterEntry)[] = [
    "health", "damage", "pickRate", "banRate", "winRate", "rank", "likes",
  ];
  for (const field of numFields) {
    assertNum(errors, field, obj[field]);
  }

  // Boolean fields
  assertBool(errors, "isFavorite", obj.isFavorite);
  assertBool(errors, "isFeatured", obj.isFeatured);

  // String Array fields
  assertStrArr(errors, "gallery", obj.gallery);
  assertStrArr(errors, "tags", obj.tags);

  // Voice Actors object
  if (obj.voiceActors !== undefined && obj.voiceActors !== null) {
    if (typeof obj.voiceActors !== "object" || Array.isArray(obj.voiceActors)) {
      errors.push({
        path: "voiceActors",
        message: '"voiceActors" must be an object with language keys (jp, cn, kr, en).',
        severity: "error",
      });
    } else {
      const va = obj.voiceActors as Record<string, unknown>;
      assertStr(errors, "voiceActors.jp", va.jp);
      assertStr(errors, "voiceActors.cn", va.cn);
      assertStr(errors, "voiceActors.kr", va.kr);
      assertStr(errors, "voiceActors.en", va.en);
    }
  }

  return { valid: errors.length === 0, errors };
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
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([
    ...Object.keys(current),
    ...Object.keys(incoming),
  ]);

  for (const key of allKeys) {
    const cur = (current as unknown as Record<string, unknown>)[key];
    const inc = (incoming as unknown as Record<string, unknown>)[key];

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
