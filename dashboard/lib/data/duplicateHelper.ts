/**
 * duplicateHelper.ts
 *
 * Centralized engine for:
 * 1. Deep cloning character entries without shared object/array references.
 * 2. Canonical duplicate detection for normal creation (Game Characters & Hall of Fame).
 * 3. Safe duplication generators for explicit context-menu Duplicate actions.
 */

import type { GameCharacterEntry, HallOfFameEntry } from "@/lib/store/dashboardStore";

/**
 * Universal safe deep cloning implementation to guarantee 0 shared references.
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const copy: Record<string, any> = {};
  for (const key of Object.keys(obj as Record<string, any>)) {
    copy[key] = deepClone((obj as Record<string, any>)[key]);
  }
  return copy as T;
}

/**
 * Normalizes string for canonical identity comparison (trimmed, lowercased).
 */
function normStr(str?: string | null): string {
  return (str || "").trim().toLowerCase();
}

/**
 * Detects if a Game Character being created normally is an equivalent duplicate of an existing character.
 * Canonical identity: (gameId or gameName) + (name or officialName or nativeName)
 */
export function isGameCharacterDuplicate(
  newEntry: Partial<GameCharacterEntry>,
  existingList: GameCharacterEntry[],
  excludeId?: string
): GameCharacterEntry | null {
  const newName = normStr(newEntry.name);
  const newOfficial = normStr(newEntry.officialName);
  const newNative = normStr(newEntry.nativeName);
  const newGameId = normStr(newEntry.gameId);
  const newGameName = normStr(newEntry.gameName);

  if (!newName && !newOfficial && !newNative) {
    return null;
  }

  for (const existing of existingList) {
    if (excludeId && existing.id === excludeId) {
      continue;
    }

    const exGameId = normStr(existing.gameId);
    const exGameName = normStr(existing.gameName);

    // Game match check
    const sameGame =
      (newGameId && exGameId && newGameId === exGameId) ||
      (newGameName && exGameName && newGameName === exGameName) ||
      (!newGameId && !exGameId && !newGameName && !exGameName);

    if (!sameGame) {
      continue;
    }

    // Name match check across name, officialName, nativeName
    const exName = normStr(existing.name);
    const exOfficial = normStr(existing.officialName);
    const exNative = normStr(existing.nativeName);

    const nameMatch =
      (newName && (newName === exName || newName === exOfficial || newName === exNative)) ||
      (newOfficial && (newOfficial === exName || newOfficial === exOfficial || newOfficial === exNative)) ||
      (newNative && (newNative === exName || newNative === exOfficial || newNative === exNative));

    if (nameMatch) {
      return existing;
    }
  }

  return null;
}

/**
 * Detects if a Hall of Fame / Character Dictionary entry being created normally is an equivalent duplicate.
 * Canonical identity: type/category + name/officialName (+ series/franchise if present)
 */
export function isHofDuplicate(
  newEntry: Partial<HallOfFameEntry>,
  existingList: HallOfFameEntry[],
  excludeId?: string
): HallOfFameEntry | null {
  const newName = normStr(newEntry.name);
  const newType = normStr(newEntry.type);
  const newSeries = normStr(newEntry.tokusatsuFranchise || newEntry.tokusatsuShow || newEntry.series || newEntry.franchise);

  if (!newName) {
    return null;
  }

  for (const existing of existingList) {
    if (excludeId && existing.id === excludeId) {
      continue;
    }

    const exName = normStr(existing.name);
    const exType = normStr(existing.type);

    // Name match
    const nameMatch = newName === exName;
    if (!nameMatch) {
      continue;
    }

    // Type match
    const typeMatch = newType === exType || !newType || !exType;
    if (!typeMatch) {
      continue;
    }

    // Series/Franchise match if both present
    const exSeries = normStr(existing.tokusatsuFranchise || existing.tokusatsuShow || existing.series || existing.franchise);
    if (newSeries && exSeries && newSeries !== exSeries) {
      continue;
    }

    return existing;
  }

  return null;
}

/**
 * Duplicates a GameCharacterEntry by performing a deep clone and generating a brand new unique record ID.
 * Preserves the exact name, nested objects (identity, world, combat, voice, story, stats, gallery, etc.).
 */
export function duplicateGameCharacter(original: GameCharacterEntry): GameCharacterEntry {
  const clone = deepClone(original);
  clone.id = `game-char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();
  return clone;
}

/**
 * Duplicates a HallOfFameEntry by performing a deep clone and generating a brand new unique record ID.
 * Preserves the exact name, type, tokusatsuData, details, badges, gallery, and all specialized properties.
 */
export function duplicateHofEntry(original: HallOfFameEntry): HallOfFameEntry {
  const clone = deepClone(original);
  clone.id = `hof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return clone;
}
