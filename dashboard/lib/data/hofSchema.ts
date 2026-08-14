/**
 * hofSchema.ts
 *
 * Runtime validation of HallOfFameEntry (Artist / Character Dictionary) JSON
 * against the application's domain types (lib/store/dashboardStore.ts).
 */

import type { HallOfFameEntry } from "@/lib/store/dashboardStore";

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

const HOF_TYPES = new Set(["actor", "actress", "anime", "singer", "tokusatsu", "vtuber"]);

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

export function validateHofJson(input: unknown): ValidationResult {
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

  // Type enum
  if (obj.type !== undefined && obj.type !== null) {
    if (!isStr(obj.type) || !HOF_TYPES.has(obj.type)) {
      errors.push({
        path: "type",
        message: `Field "type" must be one of: actor, actress, anime, singer, tokusatsu, vtuber. Got: ${obj.type}`,
        severity: "error",
      });
    }
  }

  // String fields
  const stringFields: (keyof HallOfFameEntry)[] = [
    "status", "nationality", "singerType", "note", "imageUrl",
    "tokusatsuFranchise", "tokusatsuShow", "fullName", "officialName",
    "alias", "nickname", "originalLanguage", "nativeName", "pronunciation",
    "gender", "age", "species", "universe", "work", "series", "franchise",
    "country", "region", "creator", "firstAppearance", "personality",
    "archetype", "occupation", "role", "profession", "alignment",
    "motivation", "background", "bio", "characterDevelopment",
    "splashArt", "portraitUrl", "avatarUrl", "avatarSource", "accentColor",
    "gameCharacterId", "gameCharacterName",
    "agency", "group", "fanbaseName", "oshiMark", "birthday", "debutDate", "vtuberStatus",
  ];

  for (const field of stringFields) {
    assertStr(errors, field, obj[field]);
  }

  // Numbers
  assertNum(errors, "rank", obj.rank);
  assertNum(errors, "prevRank", obj.prevRank);
  assertNum(errors, "likes", obj.likes);

  // Booleans
  assertBool(errors, "isChampion", obj.isChampion);
  assertBool(errors, "isFavorite", obj.isFavorite);

  // String Arrays
  const stringArrayFields: (keyof HallOfFameEntry)[] = [
    "knownFor", "badges", "associatedDramas", "aliases", "traits",
    "mainSeries", "movies", "episodes", "spinOffs", "cameos", "works",
    "relatedWorks", "gallery",
  ];

  for (const field of stringArrayFields) {
    assertStrArr(errors, field, obj[field]);
  }

  // Social Links
  if (obj.socialLinks !== undefined && obj.socialLinks !== null) {
    if (!Array.isArray(obj.socialLinks)) {
      errors.push({
        path: "socialLinks",
        message: '"socialLinks" must be an array of objects with { platform, url }.',
        severity: "error",
      });
    } else {
      obj.socialLinks.forEach((item: unknown, i: number) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          errors.push({
            path: `socialLinks[${i}]`,
            message: `Social link item at index ${i} must be an object.`,
            severity: "error",
          });
        } else {
          const sl = item as Record<string, unknown>;
          assertStr(errors, `socialLinks[${i}].platform`, sl.platform, true);
          assertStr(errors, `socialLinks[${i}].url`, sl.url, true);
        }
      });
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

export function diffHofProfiles(
  current: Partial<HallOfFameEntry>,
  incoming: Partial<HallOfFameEntry>
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
