/**
 * test_duplicate_and_delete_system.ts
 *
 * Automated test suite verifying the character identity, duplicate prevention,
 * deep-clone independence, and ID-based delete/update system.
 *
 * Run with: npx ts-node --project tsconfig.json scripts/test_duplicate_and_delete_system.ts
 */

import {
  deepClone,
  isGameCharacterDuplicate,
  isHofDuplicate,
  duplicateGameCharacter,
  duplicateHofEntry,
} from "../lib/data/duplicateHelper";
import type { GameCharacterEntry, HallOfFameEntry } from "../lib/store/dashboardStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function section(title: string): void {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`TEST: ${title}`);
  console.log("─".repeat(60));
}

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const xiaoPrimary: GameCharacterEntry = {
  id: "gc-xiao-original",
  name: "Xiao",
  officialName: "Xiao",
  nativeName: "魈",
  gameId: "game-genshin",
  gameName: "Genshin Impact",
  tier: "S",
  isFavorite: true,
  accentColor: "#76B9C8",
  identity: { birthday: "April 17", age: "", gender: "Male", species: "Adeptus" },
  world: { nation: "Liyue", region: "Mingjiao Cave", planet: "Teyvat" },
  combat: { role: "DPS", element: "Anemo", weapon: "Polearm", rarity: "5-Star" },
  voice: { jp: "Yoshitsugu Matsuoka", en: "Sean Chiplock" },
  story: { biography: "Xiao is an adeptus...", personality: "Cold and distant" },
  biography: "Xiao is an adeptus...",
  gallery: ["https://img1.jpg", "https://img2.jpg"],
  tags: ["Adeptus", "Anemo", "Liyue"],
};

const daringHeart: GameCharacterEntry = {
  id: "gc-daring-heart",
  name: "Daring Heart",
  officialName: "Daring Heart",
  nativeName: "ダーリングハート",
  gameId: "cc1cf0e6-4dad-41ab-9377-ec2f0e796372",
  gameName: "Umamusume: Pretty Derby",
  tier: "S",
  isFavorite: true,
  identity: { birthday: "March 24", gender: "Female", species: "Umamusume" },
  world: { nation: "Japan", organization: "Tracen Academy" },
};

const hofXiao: HallOfFameEntry = {
  id: "hof-xiao-original",
  name: "Xiao",
  type: "anime",
  status: "GOAT Status",
  knownFor: ["Adeptus", "Anemo DPS"],
  rank: 1,
  likes: 99,
  isChampion: true,
  series: "Genshin Impact",
  franchise: "Genshin Impact",
};

const hofActress: HallOfFameEntry = {
  id: "hof-actress-japanese",
  name: "Hana Tanaka",
  type: "actress",
  status: "All-Star",
  knownFor: ["Drama", "Film"],
  rank: 5,
  likes: 30,
  isChampion: false,
  nationality: "Japanese",
};

// ─── TEST A: Normal creation blocked when equivalent exists ──────────────────

section("TEST A — Normal creation blocked when equivalent exists");

{
  const existing: GameCharacterEntry[] = [xiaoPrimary];
  const newAttempt: Partial<GameCharacterEntry> = {
    name: "Xiao",
    gameId: "game-genshin",
    gameName: "Genshin Impact",
  };
  const dup = isGameCharacterDuplicate(newAttempt, existing);
  assert(dup !== null, "Creating 'Xiao' again should be detected as duplicate");
  assert(dup?.id === "gc-xiao-original", "Detected duplicate should reference the existing record's ID");
}

{
  const existing: HallOfFameEntry[] = [hofXiao];
  const newAttempt: Partial<HallOfFameEntry> = { name: "Xiao", type: "anime" };
  const dup = isHofDuplicate(newAttempt, existing);
  assert(dup !== null, "Creating HOF 'Xiao' again should be blocked");
}

// ─── TEST B: Context-menu Duplicate creates 2 independent records ────────────

section("TEST B — Context-menu Duplicate creates two independent records with different IDs");

const xiaoClone = duplicateGameCharacter(xiaoPrimary);

assert(xiaoClone.id !== xiaoPrimary.id, "Cloned ID must differ from original");
assert(xiaoClone.name === xiaoPrimary.name, "Cloned name must match original (no (Copy) suffix)");
assert(xiaoClone.id.startsWith("game-char-"), "Cloned ID must use game-char prefix");

const hofClone = duplicateHofEntry(hofXiao);
assert(hofClone.id !== hofXiao.id, "HOF cloned ID must differ from original");
assert(hofClone.name === hofXiao.name, "HOF cloned name must match original");
assert(hofClone.id.startsWith("hof-"), "HOF cloned ID must use hof prefix");

// ─── TEST C & D: Delete one, other remains (ID isolation simulation) ─────────

section("TEST C & D — Deleting one record does not affect the other");

{
  let records: GameCharacterEntry[] = [xiaoPrimary, xiaoClone];
  // Delete original by ID only
  records = records.filter((r) => r.id !== xiaoPrimary.id);
  assert(records.length === 1, "Only 1 record should remain after deleting original");
  assert(records[0].id === xiaoClone.id, "Remaining record should be the clone");

  // Delete clone by ID only
  records = records.filter((r) => r.id !== xiaoClone.id);
  assert(records.length === 0, "No records should remain after deleting clone");
}

{
  const hofClone2 = duplicateHofEntry(hofXiao);
  let hofRecords: HallOfFameEntry[] = [hofXiao, hofClone2];
  hofRecords = hofRecords.filter((r) => r.id !== hofXiao.id);
  assert(hofRecords.length === 1, "HOF: Only clone should remain after deleting original");
  assert(hofRecords[0].id === hofClone2.id, "HOF remaining record should be the clone");
}

// ─── TEST E: Editing original doesn't affect duplicate ───────────────────────

section("TEST E — Editing original biography does not affect duplicate");

{
  const original: GameCharacterEntry = { ...xiaoPrimary, story: { biography: "Original bio" } };
  const clone = duplicateGameCharacter(original);
  // Simulate editing original
  original.story!.biography = "EDITED biography";
  assert(clone.story?.biography === "Original bio", "Clone story.biography must be independent from original");
  // Test deep clone — modifying original's array shouldn't affect clone
  original.gallery?.push("https://new-image.jpg");
  const origLen = original.gallery?.length ?? 0;
  const cloneLen = clone.gallery?.length ?? 0;
  assert(origLen !== cloneLen, "Gallery arrays must be independent (different lengths after mutation)");
}

// ─── TEST F: Favoriting original doesn't affect duplicate ────────────────────

section("TEST F — Favoriting original does not affect clone's isFavorite");

{
  const original = duplicateGameCharacter({ ...xiaoPrimary, isFavorite: false });
  const clone = duplicateGameCharacter({ ...xiaoPrimary, isFavorite: false });
  // Simulate toggle on original only
  original.isFavorite = true;
  assert(clone.isFavorite === false, "Clone isFavorite must remain false after favoriting original");
  assert(original.isFavorite === true, "Original isFavorite must be true");
  assert(original.id !== clone.id, "Records have different IDs");
}

// ─── TEST G: JSON import duplicate prevention ────────────────────────────────

section("TEST G — JSON import duplicate prevention");

{
  // Simulates what the editor would do: check before addGameCharacter
  const existing: GameCharacterEntry[] = [daringHeart];
  const importedJson: Partial<GameCharacterEntry> = {
    name: "Daring Heart",
    officialName: "Daring Heart",
    gameId: "cc1cf0e6-4dad-41ab-9377-ec2f0e796372",
    gameName: "Umamusume: Pretty Derby",
  };
  const dup = isGameCharacterDuplicate(importedJson, existing);
  assert(dup !== null, "JSON import of existing character should be detected as duplicate");
}

// ─── TEST H: Game Character duplication deeply clones nested canonical JSON ──

section("TEST H — Game Character duplication deep clones all canonical nested objects");

{
  const clone = duplicateGameCharacter(xiaoPrimary);
  // Verify nested objects are independent
  assert(clone.identity !== xiaoPrimary.identity, "identity object must be a separate reference");
  assert(clone.world !== xiaoPrimary.world, "world object must be a separate reference");
  assert(clone.combat !== xiaoPrimary.combat, "combat object must be a separate reference");
  assert(clone.voice !== xiaoPrimary.voice, "voice object must be a separate reference");
  assert(clone.story !== xiaoPrimary.story, "story object must be a separate reference");
  assert(clone.gallery !== xiaoPrimary.gallery, "gallery array must be a separate reference");
  assert(clone.tags !== xiaoPrimary.tags, "tags array must be a separate reference");

  // Verify data integrity
  assert(clone.identity?.birthday === xiaoPrimary.identity?.birthday, "identity.birthday must be preserved");
  assert(clone.world?.nation === xiaoPrimary.world?.nation, "world.nation must be preserved");
  assert(clone.combat?.element === xiaoPrimary.combat?.element, "combat.element must be preserved");
  assert(clone.voice?.jp === xiaoPrimary.voice?.jp, "voice.jp must be preserved");
  assert(clone.story?.biography === xiaoPrimary.story?.biography, "story.biography must be preserved");
  assert(
    JSON.stringify(clone.gallery) === JSON.stringify(xiaoPrimary.gallery),
    "gallery contents must match"
  );
}

// ─── TEST I: Tokusatsu duplication retains Tokusatsu data ────────────────────

section("TEST I — Tokusatsu duplication retains Tokusatsu-specific data intact");

{
  const tokuEntry: HallOfFameEntry = {
    id: "hof-kamen-original",
    name: "Kamen Rider Kuuga",
    type: "tokusatsu",
    status: "GOAT Status",
    knownFor: ["Kamen Rider", "Kuuga"],
    rank: 1,
    likes: 55,
    isChampion: true,
    tokusatsuFranchise: "Kamen Rider",
    tokusatsuShow: "Kamen Rider Kuuga",
    details: { tokusatsuData: { forms: ["Mighty", "Dragon", "Pegasus", "Titan"] } },
    gallery: ["img1.jpg", "img2.jpg"],
  };

  const tokuClone = duplicateHofEntry(tokuEntry);
  assert(tokuClone.id !== tokuEntry.id, "Tokusatsu clone must have a different ID");
  assert(tokuClone.type === "tokusatsu", "Tokusatsu clone must retain type='tokusatsu'");
  assert(tokuClone.tokusatsuFranchise === "Kamen Rider", "Tokusatsu franchise must be preserved");
  assert(tokuClone.tokusatsuShow === "Kamen Rider Kuuga", "Tokusatsu show must be preserved");
  assert(tokuClone.details !== tokuEntry.details, "details object must be independent reference");
  assert(
    JSON.stringify(tokuClone.details?.tokusatsuData?.forms) ===
      JSON.stringify(tokuEntry.details?.tokusatsuData?.forms),
    "tokusatsuData.forms must be preserved"
  );
  assert(tokuClone.gallery !== tokuEntry.gallery, "gallery array must be independent reference");
}

// ─── TEST J: Japanese Actress stays Actress, not Tokusatsu ──────────────────

section("TEST J — Japanese Actress duplicate stays Actress (not classified as Tokusatsu)");

{
  const clone = duplicateHofEntry(hofActress);
  assert(clone.type === "actress", "Cloned actress must retain type='actress'");
  assert(clone.nationality === "Japanese", "Cloned actress must retain Japanese nationality");
  assert(clone.type !== "tokusatsu", "Japanese actress must NOT become tokusatsu");
  assert(clone.id !== hofActress.id, "Clone must have independent ID");

  // Verify isHofDuplicate doesn't cross-classify by nationality
  const existingList: HallOfFameEntry[] = [hofActress];
  const attemptedNewActress: Partial<HallOfFameEntry> = {
    name: "Hana Tanaka",
    type: "actress",
  };
  const dup = isHofDuplicate(attemptedNewActress, existingList);
  assert(dup !== null, "Creating same actress should be blocked regardless of nationality");
  assert(dup?.type === "actress", "Detected duplicate should be the actress type, not tokusatsu");
}

// ─── TEST K: Two records with identical data but different IDs — never collide

section("TEST K — Two records with identical info but different IDs never collide on delete");

{
  const recordA: GameCharacterEntry = { ...xiaoPrimary, id: "record-A" };
  const recordB: GameCharacterEntry = { ...xiaoPrimary, id: "record-B" };
  let roster = [recordA, recordB];

  // Delete A by ID only
  roster = roster.filter((r) => r.id !== "record-A");
  assert(roster.length === 1, "Only 1 record should remain after deleting A");
  assert(roster[0].id === "record-B", "Record B must survive deletion of A");

  // Delete B by ID only
  roster = roster.filter((r) => r.id !== "record-B");
  assert(roster.length === 0, "Roster should be empty after deleting both");
}

{
  // HOF version
  const hofA: HallOfFameEntry = { ...hofXiao, id: "hof-record-A" };
  const hofB: HallOfFameEntry = { ...hofXiao, id: "hof-record-B" };
  let hall = [hofA, hofB];

  hall = hall.filter((r) => r.id !== "hof-record-A");
  assert(hall.length === 1, "HOF: Only 1 record should remain after deleting A");
  assert(hall[0].id === "hof-record-B", "HOF: Record B must survive deletion of A");
}

// ─── TEST: excludeId prevents false-positive when editing existing record ────

section("TEST L — isGameCharacterDuplicate excludeId prevents false-positive on update");

{
  const existing: GameCharacterEntry[] = [xiaoPrimary];
  const editPayload: Partial<GameCharacterEntry> = {
    name: "Xiao",
    gameId: "game-genshin",
    gameName: "Genshin Impact",
  };
  // Without excludeId → finds duplicate (correct: creation would be blocked)
  const withoutExclude = isGameCharacterDuplicate(editPayload, existing);
  assert(withoutExclude !== null, "Without excludeId, 'Xiao' is detected as duplicate");

  // With excludeId === existing record's ID → no duplicate (correct: edit allowed)
  const withExclude = isGameCharacterDuplicate(editPayload, existing, xiaoPrimary.id);
  assert(withExclude === null, "With excludeId matching existing record, no duplicate should be returned");
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(60)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log("═".repeat(60));

if (failed > 0) {
  console.error("\n🚨 Some tests FAILED. Fix before proceeding.\n");
  process.exit(1);
} else {
  console.log("\n🎉 All tests PASSED.\n");
  process.exit(0);
}
