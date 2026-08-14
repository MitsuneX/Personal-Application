/**
 * Targeted Automated Verification Test — GFL2 Sync Identity & Persistence Gate
 * Tests normalization, identity preservation on edit, history suppression, duplicate isolation, and double sync idempotency.
 */
import prisma from "../lib/prisma";
import {
  normalizeGameName,
  repairCharacterDatabase,
  ensureUserPersonalCharacters,
  processCharacterCreation,
} from "../lib/services/characterCreationService";

async function runSyncIdentityTests() {
  console.log("=============================================================");
  console.log("=== GFL2 SYNC IDENTITY & PERSISTENCE VERIFICATION GATE    ===");
  console.log("=============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.log(`  ❌ FAILED ASSERTION: ${message}`);
      failed++;
    }
  }

  // ─── 1. GAME NAME NORMALIZATION ALIASES ───────────────────────────────────
  console.log("--- 1. Game Name Alias Normalization ---");
  assert(
    normalizeGameName("Girls' Frontline 2") === "Girls' Frontline 2: Exilium",
    "Normalizes 'Girls\\' Frontline 2' to 'Girls\\' Frontline 2: Exilium'"
  );
  assert(
    normalizeGameName("gfl2") === "Girls' Frontline 2: Exilium",
    "Normalizes 'gfl2' to 'Girls\\' Frontline 2: Exilium'"
  );
  assert(
    normalizeGameName("GFL 2") === "Girls' Frontline 2: Exilium",
    "Normalizes 'GFL 2' to 'Girls\\' Frontline 2: Exilium'"
  );

  // ─── 2. GFL2 LINKED RECORDS IN DATABASE ────────────────────────────────────
  console.log("\n--- 2. GFL2 Target Records Linkage Check ---");
  const targetGame = await prisma.game.findFirst({
    where: { game: { contains: "Girls' Frontline 2", mode: "insensitive" } },
  });

  assert(targetGame !== null, "Found Girls' Frontline 2: Exilium in Game table");
  const gameId = targetGame?.id || "";

  const targetNames = ["Tololo", "Daiyan", "Loreley", "Lainie"];
  for (const name of targetNames) {
    const records = await prisma.gameCharacter.findMany({
      where: {
        gameId,
        name: { equals: name, mode: "insensitive" },
      },
    });
    assert(
      records.length === 1,
      `Exactly 1 linked record exists for "${name}" (gameId: ${gameId})`
    );
    assert(
      records[0]?.gameId === gameId,
      `Record "${name}" has gameId === "${gameId}" (not null)`
    );
    assert(
      Boolean(records[0]?.characterId),
      `Record "${name}" is linked to Character Collection (characterId: ${records[0]?.characterId})`
    );
  }

  // ─── 3. TEST EDIT UNRELATED FIELD DOES NOT DETACH SYNC IDENTITY ────────────
  console.log("\n--- 3. Edit Unrelated Field Identity Preservation ---");
  const tololoBefore = await prisma.gameCharacter.findFirst({
    where: { gameId, name: "Tololo" },
  });
  assert(tololoBefore !== null, "Found Tololo record for edit test");

  if (tololoBefore) {
    const originalGameId = tololoBefore.gameId;
    const originalCharacterId = tololoBefore.characterId;

    // Simulate editing an unrelated field (e.g. notes & winRate)
    const updated = await prisma.gameCharacter.update({
      where: { id: tololoBefore.id },
      data: {
        notes: "Updated astrophysics notes for unit test verification",
        winRate: 88.5,
        updatedAt: new Date(),
      },
    });

    assert(
      updated.gameId === originalGameId,
      "gameId remains unchanged after editing unrelated fields"
    );
    assert(
      updated.characterId === originalCharacterId,
      "characterId remains unchanged after editing unrelated fields"
    );

    // Trigger repair database & ensure it stays linked
    await repairCharacterDatabase();

    const tololoAfterRepair = await prisma.gameCharacter.findUnique({
      where: { id: tololoBefore.id },
    });
    assert(
      tololoAfterRepair?.gameId === originalGameId,
      "Tololo remains 100% linked after repair scan"
    );
  }

  // ─── 4. TEST DELETED RECORD HISTORY SUPPRESSION (NO RESURRECTION) ──────────
  console.log("\n--- 4. History Suppression (Deleted Character Does Not Resurrect) ---");
  const testCharName = "TestSuppressedDoll";
  const dummyChar = await processCharacterCreation({
    name: testCharName,
    gameName: "Girls' Frontline 2: Exilium",
    role: "Support",
  });

  const createdId = dummyChar.gameCharacter?.id || dummyChar.dossierCharacter?.id;
  assert(createdId !== undefined, "Created dummy character for suppression test");

  if (dummyChar.gameCharacter) {
    // Soft-delete to History
    await prisma.softDeleteHistory.create({
      data: {
        entityType: "GAME_CHARACTER",
        originalRecordId: dummyChar.gameCharacter.id,
        name: testCharName,
        snapshot: dummyChar.gameCharacter as any,
      },
    });
    await prisma.gameCharacter.delete({ where: { id: dummyChar.gameCharacter.id } });
    if (dummyChar.dossierCharacter) {
      await prisma.gameDossierCharacter.deleteMany({ where: { id: dummyChar.dossierCharacter.id } });
    }

    // Run ensureUserPersonalCharacters
    await ensureUserPersonalCharacters("test-user-id");

    const reCreated = await prisma.gameCharacter.findFirst({
      where: { name: testCharName },
    });

    assert(
      reCreated === null,
      "Deleted character present in SoftDeleteHistory is NOT resurrected by auto-seed/repair"
    );

    // Cleanup history record
    await prisma.softDeleteHistory.deleteMany({ where: { name: testCharName } });
  }

  // ─── 5. DOUBLE SYNC IDEMPOTENCY ───────────────────────────────────────────
  console.log("\n--- 5. Double Sync Idempotency Check ---");
  const activeBefore = await prisma.gameCharacter.count({ where: { gameId } });

  await repairCharacterDatabase();
  await repairCharacterDatabase();

  const activeAfter = await prisma.gameCharacter.count({ where: { gameId } });
  assert(
    activeBefore === activeAfter,
    `Running repair scan twice produces 0 duplicate records (${activeBefore} === ${activeAfter})`
  );

  // ─── 6. OTHER GAME SANITY CHECK (Zenless Zone Zero) ───────────────────────
  console.log("\n--- 6. Generic Multi-Game Sanity Check (ZZZ & Genshin) ---");
  const zzzGame = await prisma.game.findFirst({
    where: { game: { contains: "Zenless Zone Zero", mode: "insensitive" } },
  });
  if (zzzGame) {
    const zzzChars = await prisma.gameCharacter.findMany({ where: { gameId: zzzGame.id } });
    assert(
      zzzChars.length >= 1,
      `Zenless Zone Zero characters linked properly (${zzzChars.length} records)`
    );
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n=============================================================");
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} GFL2 SYNC IDENTITY TESTS PASSED!`);
  } else {
    console.log(`❌ ${failed} TESTS FAILED.`);
    process.exit(1);
  }
  console.log("=============================================================");
}

runSyncIdentityTests().finally(() => prisma.$disconnect());
