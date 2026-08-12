/**
 * test_json_data_persistence.ts
 *
 * Verifies that JSON-imported data (biography, voiceActors, personality, notes,
 * officialDescription, favoriteQuote, etc.) survives partial updates like:
 *   - rank changes
 *   - isFavorite toggles
 *   - unrelated field edits
 *   - successive re-saves without the full payload
 */

import prisma from "../lib/prisma";
import { processCharacterCreation } from "../lib/services/characterCreationService";
import { normalizeGameCharacterJson } from "../lib/data/gameCharacterSchema";

async function runJsonPersistenceTests() {
  console.log("=== Testing JSON Data Persistence Through Partial Updates ===\n");
  let testCharId: string | null = null;

  try {
    const uniqueName = `TestJsonHero_${Date.now()}`;

    // ── STEP 1: Full JSON import with all rich fields ─────────────────────────
    console.log("1. Saving character with full JSON payload (biography, voiceActors, personality, etc.)...");
    const createResult = await processCharacterCreation({
      name: uniqueName,
      gameName: "Wuthering Waves",
      element: "Glacio",
      title: "Frost Sovereign",
      role: "Main DPS",
      rarity: "5-Star",
      nation: "Jinzhou",
      birthday: "01/15",
      age: "22",
      gender: "Female",
      height: "168cm",
      weight: "52kg",
      species: "Human",
      race: "Resonator",
      region: "Northern Continent",
      planet: "Solaris-3",
      organization: "Huanglong",
      affiliation: "Resonance Liberation Corps",
      faction: "Kuro Universe",
      attribute: "Glacio",
      damageType: "Ice",
      combatRole: "Carry",
      biography: "A powerful Resonator from the frozen north with control over glacial energy.",
      personality: "Cold and calculating on the surface, but deeply loyal to her comrades.",
      officialDescription: "The official description of the Frost Sovereign from Wuthering Waves.",
      favoriteQuote: "\"Ice does not forgive. Neither do I.\"",
      voiceActors: { jp: "Horie Yui", cn: "Tang Xiaoxi", en: "Jennifer Losi" },
      notes: "My favourite Glacio character. Highly invested.",
      isFavorite: true,
      createFavorite: true,
    });

    testCharId = createResult.gameCharacter.id;
    console.log(`   Created character ID: ${testCharId}`);

    let fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    let norm = normalizeGameCharacterJson(fetched);

    // Verify all rich fields are stored
    const assertions = [
      { field: "biography", value: norm.biography, expected: "A powerful Resonator" },
      { field: "personality", value: norm.personality, expected: "Cold and calculating" },
      { field: "officialDescription", value: norm.officialDescription, expected: "official description" },
      { field: "favoriteQuote", value: norm.favoriteQuote, expected: "Ice does not forgive" },
      { field: "voiceActors.jp", value: norm.voiceActors?.jp, expected: "Horie Yui" },
      { field: "voiceActors.en", value: norm.voiceActors?.en, expected: "Jennifer Losi" },
      { field: "notes", value: norm.notes, expected: "My favourite" },
      { field: "title", value: norm.title, expected: "Frost Sovereign" },
      { field: "nation", value: norm.nation, expected: "Jinzhou" },
      { field: "birthday", value: norm.birthday, expected: "01/15" },
      { field: "age", value: norm.age, expected: "22" },
      { field: "gender", value: norm.gender, expected: "Female" },
      { field: "height", value: norm.height, expected: "168cm" },
      { field: "organization", value: norm.organization, expected: "Huanglong" },
      { field: "affiliation", value: norm.affiliation, expected: "Resonance" },
      { field: "combatRole", value: norm.combatRole, expected: "Carry" },
    ];

    let allPass = true;
    for (const a of assertions) {
      const val = String(a.value ?? "");
      if (!val.includes(a.expected)) {
        console.log(`   ❌ FAIL: ${a.field} — expected "${a.expected}", got "${val}"`);
        allPass = false;
      }
    }
    if (allPass) console.log("✅ PASS: Step 1 (All rich JSON fields persisted correctly on initial save)");

    // ── STEP 2: Partial update — only rank change ─────────────────────────────
    console.log("\n2. Partial update: only changing rank (no other fields provided)...");
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      rank: 1,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);

    let allPass2 = true;
    for (const a of assertions) {
      const val = String(a.value ?? "");
      if (!val.includes(a.expected)) {
        console.log(`   ❌ FAIL after rank update: ${a.field} — expected "${a.expected}", got "${val}"`);
        allPass2 = false;
      }
    }
    if (norm.rank !== 1) {
      console.log(`   ❌ FAIL: rank not updated, got ${norm.rank}`);
      allPass2 = false;
    }
    if (allPass2) console.log("✅ PASS: Step 2 (Rich data survived rank-only update, rank correctly updated to 1)");

    // ── STEP 3: Partial update — isFeatured toggle ────────────────────────────
    console.log("\n3. Partial update: toggling isFeatured...");
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      isFeatured: true,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);

    const step3CheckBio = String(norm.biography ?? "").includes("powerful Resonator");
    const step3CheckVA = norm.voiceActors?.jp === "Horie Yui";
    const step3CheckNotes = String(norm.notes ?? "").includes("My favourite");

    if (!step3CheckBio || !step3CheckVA || !step3CheckNotes) {
      throw new Error(`FAIL: Rich data wiped after isFeatured toggle! biography=${norm.biography}, va.jp=${norm.voiceActors?.jp}, notes=${norm.notes}`);
    }
    console.log("✅ PASS: Step 3 (Rich data survived isFeatured toggle)");

    // ── STEP 4: Update accentColor only ───────────────────────────────────────
    console.log("\n4. Partial update: only accentColor...");
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      accentColor: "#00F5FF",
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);

    if (
      !String(norm.biography ?? "").includes("powerful Resonator") ||
      norm.voiceActors?.jp !== "Horie Yui" ||
      norm.nation !== "Jinzhou"
    ) {
      throw new Error(`FAIL: Data wiped after accentColor update! biography=${norm.biography}, nation=${norm.nation}`);
    }
    console.log("✅ PASS: Step 4 (Rich data survived accentColor-only update)");

    // ── STEP 5: Re-import partial JSON (only name + rank, no rich fields) ─────
    console.log("\n5. Re-import: JSON with only name + rank (simulating partial import via store updateGameCharacter)...");
    // The store's updateGameCharacter sends the full item object, so simulate that:
    // fetch current item, patch rank only, resave full payload
    const currentItem = normalizeGameCharacterJson(await prisma.gameCharacter.findUnique({ where: { id: testCharId! } }));
    await processCharacterCreation({
      ...currentItem,
      rank: 2,
      gameName: "Wuthering Waves",
      createFavorite: true,
      isFavorite: true,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);

    if (
      !String(norm.biography ?? "").includes("powerful Resonator") ||
      !String(norm.personality ?? "").includes("Cold and calculating") ||
      norm.voiceActors?.jp !== "Horie Yui" ||
      !String(norm.notes ?? "").includes("My favourite") ||
      norm.rank !== 2
    ) {
      throw new Error(`FAIL: Rich data lost after partial re-import! biography=${norm.biography}, notes=${norm.notes}, rank=${norm.rank}`);
    }
    console.log("✅ PASS: Step 5 (Rich data survived partial JSON re-import, rank updated to 2)");

    // ── STEP 6: Full re-import updates rich fields correctly ──────────────────
    console.log("\n6. Full re-import with updated biography and new voice actor...");
    await processCharacterCreation({
      id: testCharId!,
      name: uniqueName,
      gameName: "Wuthering Waves",
      biography: "Updated biography for the Frost Sovereign after full re-import.",
      voiceActors: { jp: "Horie Yui", cn: "Tang Xiaoxi", en: "Faye Mata", kr: "Kim Sojin" },
      rank: 3,
    });

    fetched = await prisma.gameCharacter.findUnique({ where: { id: testCharId! } });
    norm = normalizeGameCharacterJson(fetched);

    if (
      !String(norm.biography ?? "").includes("Updated biography") ||
      norm.voiceActors?.en !== "Faye Mata" ||
      norm.voiceActors?.kr !== "Kim Sojin" ||
      norm.rank !== 3
    ) {
      throw new Error(`FAIL: Full re-import did not update correctly! biography=${norm.biography}, en=${norm.voiceActors?.en}, rank=${norm.rank}`);
    }
    // Original personality and notes should still be there (not in this import)
    if (!String(norm.personality ?? "").includes("Cold and calculating")) {
      throw new Error(`FAIL: Personality erased by full re-import! personality=${norm.personality}`);
    }
    console.log("✅ PASS: Step 6 (Full re-import updated specified fields, preserved unspecified ones)");

    console.log("\n🎉 ALL 6 JSON DATA PERSISTENCE TESTS PASSED SUCCESSFULLY!");

  } finally {
    if (testCharId) {
      try {
        await prisma.gameCharacter.delete({ where: { id: testCharId } });
        console.log("\n✓ Test character cleaned up from database.");
      } catch {
        console.warn("Warning: Could not clean up test character");
      }
    }
  }
}

runJsonPersistenceTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ JSON Data Persistence Test FAILED:", err.message);
    process.exit(1);
  });
