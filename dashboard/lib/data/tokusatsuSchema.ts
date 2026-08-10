/**
 * tokusatsuSchema.ts
 *
 * Runtime validation of TokusatsuProfile JSON against the application's
 * domain types (lib/types/tokusatsu.ts). No Zod required.
 *
 * All validation is strictly aligned with TokusatsuProfile so visual editor
 * and JSON editor share the exact same source of truth.
 */

import type { TokusatsuProfile } from "@/lib/types/tokusatsu";

// ─── Validation types ─────────────────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ─── Enum sets ────────────────────────────────────────────────────────────────

const FRANCHISE_TYPES = new Set([
  "KAMEN_RIDER",
  "ULTRAMAN",
  "POWER_RANGERS",
  "SUPER_SENTAI",
  "OTHER",
]);

const APPEARANCE_TYPES = new Set([
  "Main Series",
  "Movie",
  "Special",
  "Crossover",
  "Spin-off",
  "Cameo",
  "Guest",
]);

const KR_SERIES_ERAS = new Set(["Showa", "Heisei Phase 1", "Heisei Phase 2", "Reiwa", ""]);
const ULTRA_SERIES_ERAS = new Set(["Showa", "Heisei", "New Generation", "Reiwa", ""]);
const PR_SERIES_ERAS = new Set(["Saban Era", "Disney Era", "Neo-Saban Era", "Hasbro Era", ""]);
const SS_SERIES_ERAS = new Set(["Showa", "Heisei", "Reiwa", ""]);

// ─── Helper validators ────────────────────────────────────────────────────────

function isStr(v: unknown): v is string {
  return typeof v === "string";
}

function isStrOrUndefined(v: unknown): v is string | undefined {
  return v === undefined || typeof v === "string";
}

function isStrArr(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
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

function assertEnum(
  errors: ValidationError[],
  path: string,
  value: unknown,
  allowed: Set<string>,
  required = false
): void {
  if (value === undefined || value === null) {
    if (required) {
      errors.push({
        path,
        message: `Required enum field "${path}" is missing. Allowed: ${[...allowed].join(", ")}.`,
        severity: "error",
      });
    }
    return;
  }
  if (!isStr(value) || !allowed.has(value)) {
    errors.push({
      path,
      message: `Invalid value "${value}" for "${path}". Allowed values: ${[...allowed].join(", ")}.`,
      severity: "error",
    });
  }
}

function assertBool(errors: ValidationError[], path: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (!isBool(value)) {
    errors.push({
      path,
      message: `Field "${path}" must be a boolean, got ${typeof value}.`,
      severity: "error",
    });
  }
}

// ─── Sub-collection validators ────────────────────────────────────────────────

function validateForm(errors: ValidationError[], form: unknown, idx: number): void {
  const p = `forms[${idx}]`;
  if (!form || typeof form !== "object" || Array.isArray(form)) {
    errors.push({ path: p, message: `Form at index ${idx} must be an object.`, severity: "error" });
    return;
  }
  const f = form as Record<string, unknown>;
  assertStr(errors, `${p}.name`, f.name, true);
  assertStr(errors, `${p}.formType`, f.formType);
  assertStr(errors, `${p}.appearance`, f.appearance);
  assertStr(errors, `${p}.transformationDevice`, f.transformationDevice);
  assertStr(errors, `${p}.transformationItem`, f.transformationItem);
  assertStr(errors, `${p}.transformationSequence`, f.transformationSequence);
  assertStr(errors, `${p}.transformationPhrase`, f.transformationPhrase);
  assertStrArr(errors, `${p}.abilities`, f.abilities);
  assertStrArr(errors, `${p}.weapons`, f.weapons);
  assertStr(errors, `${p}.finisher`, f.finisher);
  assertStr(errors, `${p}.powerLevelNotes`, f.powerLevelNotes);
  assertStr(errors, `${p}.debutEpisode`, f.debutEpisode);
  assertStr(errors, `${p}.imageUrl`, f.imageUrl);
}

function validateWeapon(errors: ValidationError[], weapon: unknown, idx: number): void {
  const p = `weapons[${idx}]`;
  if (!weapon || typeof weapon !== "object" || Array.isArray(weapon)) {
    errors.push({ path: p, message: `Weapon at index ${idx} must be an object.`, severity: "error" });
    return;
  }
  const w = weapon as Record<string, unknown>;
  assertStr(errors, `${p}.name`, w.name, true);
  assertStr(errors, `${p}.type`, w.type);
  assertStr(errors, `${p}.description`, w.description);
  assertStrArr(errors, `${p}.abilities`, w.abilities);
  assertStr(errors, `${p}.specialAttack`, w.specialAttack);
  assertStr(errors, `${p}.firstAppearance`, w.firstAppearance);
  assertStr(errors, `${p}.associatedForm`, w.associatedForm);
  assertStr(errors, `${p}.imageUrl`, w.imageUrl);
}

function validateVehicle(errors: ValidationError[], vehicle: unknown, idx: number): void {
  const p = `vehicles[${idx}]`;
  if (!vehicle || typeof vehicle !== "object" || Array.isArray(vehicle)) {
    errors.push({ path: p, message: `Vehicle at index ${idx} must be an object.`, severity: "error" });
    return;
  }
  const v = vehicle as Record<string, unknown>;
  assertStr(errors, `${p}.name`, v.name, true);
  assertStr(errors, `${p}.type`, v.type);
  assertStr(errors, `${p}.description`, v.description);
  assertStr(errors, `${p}.abilities`, v.abilities);
  assertStr(errors, `${p}.associatedHeroForm`, v.associatedHeroForm);
  assertStr(errors, `${p}.debut`, v.debut);
  assertStr(errors, `${p}.imageUrl`, v.imageUrl);
}

function validateAbility(errors: ValidationError[], ability: unknown, idx: number): void {
  const p = `abilities[${idx}]`;
  if (!ability || typeof ability !== "object" || Array.isArray(ability)) {
    errors.push({ path: p, message: `Ability at index ${idx} must be an object.`, severity: "error" });
    return;
  }
  const a = ability as Record<string, unknown>;
  assertStr(errors, `${p}.name`, a.name, true);
  assertStr(errors, `${p}.category`, a.category);
  assertStr(errors, `${p}.description`, a.description);
  assertStr(errors, `${p}.activationMethod`, a.activationMethod);
  assertStr(errors, `${p}.associatedForm`, a.associatedForm);
  assertStr(errors, `${p}.visualEffect`, a.visualEffect);
  assertBool(errors, `${p}.isFinisher`, a.isFinisher);
  assertStr(errors, `${p}.debut`, a.debut);
}

function validateAppearance(errors: ValidationError[], appearance: unknown, idx: number): void {
  const p = `appearances[${idx}]`;
  if (!appearance || typeof appearance !== "object" || Array.isArray(appearance)) {
    errors.push({ path: p, message: `Appearance at index ${idx} must be an object.`, severity: "error" });
    return;
  }
  const a = appearance as Record<string, unknown>;
  assertStr(errors, `${p}.title`, a.title, true);
  assertEnum(errors, `${p}.appearanceType`, a.appearanceType, APPEARANCE_TYPES);
  assertStr(errors, `${p}.episodeFilmNumber`, a.episodeFilmNumber);
  assertStr(errors, `${p}.releaseYear`, a.releaseYear);
  assertStr(errors, `${p}.role`, a.role);
  assertStr(errors, `${p}.notes`, a.notes);
}

function validateKamenRider(errors: ValidationError[], kr: unknown): void {
  if (!kr || typeof kr !== "object" || Array.isArray(kr)) {
    errors.push({ path: "kamenRider", message: "kamenRider must be an object.", severity: "error" });
    return;
  }
  const k = kr as Record<string, unknown>;
  assertStr(errors, "kamenRider.riderName", k.riderName);
  assertStr(errors, "kamenRider.riderSystem", k.riderSystem);
  assertStr(errors, "kamenRider.transformationBelt", k.transformationBelt);
  assertStr(errors, "kamenRider.transformationDevice", k.transformationDevice);
  assertStr(errors, "kamenRider.transformationItem", k.transformationItem);
  assertStr(errors, "kamenRider.transformationSequence", k.transformationSequence);
  assertStrArr(errors, "kamenRider.riderForms", k.riderForms);
  assertStr(errors, "kamenRider.riderKick", k.riderKick);
  assertStrArr(errors, "kamenRider.riderWeapons", k.riderWeapons);
  assertStr(errors, "kamenRider.riderMachine", k.riderMachine);
  assertStr(errors, "kamenRider.riderOrganization", k.riderOrganization);
  assertStr(errors, "kamenRider.mainHost", k.mainHost);
  assertStrArr(errors, "kamenRider.upgradeForms", k.upgradeForms);
  assertStr(errors, "kamenRider.finalForm", k.finalForm);
  assertStr(errors, "kamenRider.berserkForm", k.berserkForm);
  assertStrArr(errors, "kamenRider.movieExclusiveForms", k.movieExclusiveForms);
  assertStrArr(errors, "kamenRider.rivalRiders", k.rivalRiders);
  assertStrArr(errors, "kamenRider.alliedRiders", k.alliedRiders);
  assertStrArr(errors, "kamenRider.mainVillains", k.mainVillains);
  assertStr(errors, "kamenRider.monsterEnemyFaction", k.monsterEnemyFaction);
  assertEnum(errors, "kamenRider.seriesEra", k.seriesEra, KR_SERIES_ERAS);
}

function validateUltraman(errors: ValidationError[], ultra: unknown): void {
  if (!ultra || typeof ultra !== "object" || Array.isArray(ultra)) {
    errors.push({ path: "ultraman", message: "ultraman must be an object.", severity: "error" });
    return;
  }
  const u = ultra as Record<string, unknown>;
  assertStr(errors, "ultraman.ultraName", u.ultraName);
  assertStr(errors, "ultraman.humanHost", u.humanHost);
  assertStr(errors, "ultraman.transformationItem", u.transformationItem);
  assertStr(errors, "ultraman.transformationDevice", u.transformationDevice);
  assertStr(errors, "ultraman.transformationMethod", u.transformationMethod);
  assertStr(errors, "ultraman.transformationSequence", u.transformationSequence);
  assertStr(errors, "ultraman.colorTimer", u.colorTimer);
  assertStr(errors, "ultraman.height", u.height);
  assertStr(errors, "ultraman.weight", u.weight);
  assertStr(errors, "ultraman.flightSpeed", u.flightSpeed);
  assertStr(errors, "ultraman.planetOrigin", u.planetOrigin);
  assertStr(errors, "ultraman.ultraUniverse", u.ultraUniverse);
  assertStr(errors, "ultraman.defenseTeam", u.defenseTeam);
  assertStrArr(errors, "ultraman.beamAttacks", u.beamAttacks);
  assertStrArr(errors, "ultraman.finishingAttacks", u.finishingAttacks);
  assertStrArr(errors, "ultraman.ultraBrothersAllies", u.ultraBrothersAllies);
  assertStrArr(errors, "ultraman.kaijuEnemies", u.kaijuEnemies);
  assertEnum(errors, "ultraman.seriesEra", u.seriesEra, ULTRA_SERIES_ERAS);
}

function validatePowerRangers(errors: ValidationError[], pr: unknown): void {
  if (!pr || typeof pr !== "object" || Array.isArray(pr)) {
    errors.push({ path: "powerRangers", message: "powerRangers must be an object.", severity: "error" });
    return;
  }
  const p = pr as Record<string, unknown>;
  assertStr(errors, "powerRangers.rangerName", p.rangerName);
  assertStr(errors, "powerRangers.civilianIdentity", p.civilianIdentity);
  assertStr(errors, "powerRangers.rangerColor", p.rangerColor);
  assertStr(errors, "powerRangers.rangerTeam", p.rangerTeam);
  assertStr(errors, "powerRangers.morphingDevice", p.morphingDevice);
  assertStr(errors, "powerRangers.morphingCall", p.morphingCall);
  assertStr(errors, "powerRangers.personalZord", p.personalZord);
  assertStr(errors, "powerRangers.megazord", p.megazord);
  assertStr(errors, "powerRangers.mentor", p.mentor);
  assertStrArr(errors, "powerRangers.mainVillains", p.mainVillains);
  assertStrArr(errors, "powerRangers.rangerAllies", p.rangerAllies);
  assertEnum(errors, "powerRangers.seriesEra", p.seriesEra, PR_SERIES_ERAS);
}

function validateSuperSentai(errors: ValidationError[], ss: unknown): void {
  if (!ss || typeof ss !== "object" || Array.isArray(ss)) {
    errors.push({ path: "superSentai", message: "superSentai must be an object.", severity: "error" });
    return;
  }
  const s = ss as Record<string, unknown>;
  assertStr(errors, "superSentai.sentaiName", s.sentaiName);
  assertStr(errors, "superSentai.rangerColor", s.rangerColor);
  assertStr(errors, "superSentai.teamPosition", s.teamPosition);
  assertStr(errors, "superSentai.transformationDevice", s.transformationDevice);
  assertStr(errors, "superSentai.individualMecha", s.individualMecha);
  assertStr(errors, "superSentai.combinationGattai", s.combinationGattai);
  assertStr(errors, "superSentai.mentor", s.mentor);
  assertStrArr(errors, "superSentai.monsters", s.monsters);
  assertStrArr(errors, "superSentai.additionalRangers", s.additionalRangers);
  assertEnum(errors, "superSentai.seriesEra", s.seriesEra, SS_SERIES_ERAS);
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateTokusatsuJson(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      valid: false,
      errors: [{ path: "root", message: "Input must be a JSON object, not an array or primitive.", severity: "error" }],
    };
  }

  const obj = input as Record<string, unknown>;

  // Required identity fields
  assertStr(errors, "heroName", obj.heroName, true);
  assertEnum(errors, "franchiseType", obj.franchiseType, FRANCHISE_TYPES, true);

  // Optional base string fields
  const strFields: (keyof TokusatsuProfile)[] = [
    "civilianName", "series", "universe", "country", "debutYear",
    "firstAppearance", "status", "alignment", "organization",
    "heroType", "transformationSystem", "transformationDevice",
    "transformationMethod", "transformationPhrase", "baseForm",
    "primaryColor", "secondaryColor", "suitDescription", "powerSource",
    "signatureAbility", "weaknesses",
    "imageUrl", "portraitUrl", "avatarUrl", "accentColor",
    "mainActor", "suitActor", "voiceActor", "stuntPerformer",
    "director", "writer", "productionStudio", "networkBroadcaster",
    "broadcastPeriod", "productionNotes",
  ];
  for (const field of strFields) {
    assertStr(errors, field, obj[field]);
  }

  // Array of string fields
  assertStrArr(errors, "specialAbilities", obj.specialAbilities);
  assertStrArr(errors, "galleryUrls", obj.galleryUrls);

  // Collections
  if (obj.forms !== undefined) {
    if (!Array.isArray(obj.forms)) {
      errors.push({ path: "forms", message: '"forms" must be an array of form objects.', severity: "error" });
    } else {
      (obj.forms as unknown[]).forEach((f, i) => validateForm(errors, f, i));
    }
  }

  if (obj.weapons !== undefined) {
    if (!Array.isArray(obj.weapons)) {
      errors.push({ path: "weapons", message: '"weapons" must be an array of weapon objects.', severity: "error" });
    } else {
      (obj.weapons as unknown[]).forEach((w, i) => validateWeapon(errors, w, i));
    }
  }

  if (obj.vehicles !== undefined) {
    if (!Array.isArray(obj.vehicles)) {
      errors.push({ path: "vehicles", message: '"vehicles" must be an array of vehicle objects.', severity: "error" });
    } else {
      (obj.vehicles as unknown[]).forEach((v, i) => validateVehicle(errors, v, i));
    }
  }

  if (obj.abilities !== undefined) {
    if (!Array.isArray(obj.abilities)) {
      errors.push({ path: "abilities", message: '"abilities" must be an array of ability objects.', severity: "error" });
    } else {
      (obj.abilities as unknown[]).forEach((a, i) => validateAbility(errors, a, i));
    }
  }

  if (obj.appearances !== undefined) {
    if (!Array.isArray(obj.appearances)) {
      errors.push({ path: "appearances", message: '"appearances" must be an array of appearance objects.', severity: "error" });
    } else {
      (obj.appearances as unknown[]).forEach((a, i) => validateAppearance(errors, a, i));
    }
  }

  // Franchise-specific blocks (optional but validated if present)
  if (obj.kamenRider !== undefined) validateKamenRider(errors, obj.kamenRider);
  if (obj.ultraman !== undefined) validateUltraman(errors, obj.ultraman);
  if (obj.powerRangers !== undefined) validatePowerRangers(errors, obj.powerRangers);
  if (obj.superSentai !== undefined) validateSuperSentai(errors, obj.superSentai);

  return { valid: errors.length === 0, errors };
}

// ─── Change diff preview ──────────────────────────────────────────────────────

export type ChangeKind = "added" | "modified" | "removed" | "unchanged";

export interface FieldDiff {
  field: string;
  kind: ChangeKind;
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * Shallow diff of two plain objects (top-level profile fields only).
 * Collections are summarised as a whole (count changed).
 */
export function diffTokusatsuProfiles(
  current: TokusatsuProfile,
  incoming: Partial<TokusatsuProfile>
): FieldDiff[] {
  const diffs: FieldDiff[] = [];

  const allKeys = new Set([
    ...Object.keys(current),
    ...Object.keys(incoming),
  ]) as Set<keyof TokusatsuProfile>;

  for (const key of allKeys) {
    const cur = (current as unknown as Record<string, unknown>)[key as string];
    const inc = (incoming as unknown as Record<string, unknown>)[key as string];

    if (inc === undefined) {
      // Not in incoming — only relevant for Replace mode
      diffs.push({ field: key as string, kind: "unchanged", oldValue: cur, newValue: cur });
      continue;
    }

    if (cur === undefined || cur === null) {
      diffs.push({ field: key as string, kind: "added", oldValue: undefined, newValue: inc });
      continue;
    }

    // Arrays — compare by JSON stringify for deep equality check
    const curSer = JSON.stringify(cur);
    const incSer = JSON.stringify(inc);

    if (curSer !== incSer) {
      diffs.push({ field: key as string, kind: "modified", oldValue: cur, newValue: inc });
    } else {
      diffs.push({ field: key as string, kind: "unchanged", oldValue: cur, newValue: inc });
    }
  }

  return diffs;
}

/**
 * Returns a concise summary for the diff preview UI.
 */
export function summarizeDiff(diffs: FieldDiff[]): {
  added: number;
  modified: number;
  removed: number;
  unchanged: number;
  notable: FieldDiff[];
} {
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
