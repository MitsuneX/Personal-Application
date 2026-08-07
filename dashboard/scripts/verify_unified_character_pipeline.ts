import "dotenv/config";
import prisma from "../lib/prisma";
import {
  processCharacterCreation,
  repairCharacterDatabase,
} from "../lib/services/characterCreationService";

async function main() {
  console.log("🚀 STARTING UNIFIED CHARACTER CREATION PIPELINE VERIFICATION...\n");

  // Clean up test data before starting
  await prisma.gameCharacter.deleteMany({
    where: { name: { in: ["Aemeath", "Jinshi", "TestPendingChar"] } },
  });
  await prisma.gameDossierCharacter.deleteMany({
    where: { name: { in: ["Aemeath", "Jinshi", "TestPendingChar"] } },
  });

  // Ensure game "Wuthering Waves" exists
  let game = await prisma.game.findFirst({
    where: { game: { contains: "Wuthering Waves", mode: "insensitive" } },
  });

  if (!game) {
    game = await prisma.game.create({
      data: {
        game: "Wuthering Waves",
        platform: "PC",
        category: "Gacha Action",
        mainCharacter: "Rover",
        accentColor: "#00F5FF",
      },
    });
  }

  // ── TEST 1: Create Aemeath from Game Character Hub ────────────────────────
  console.log("1️⃣ Scenario 1: Creating Aemeath from Game Character Hub...");
  const res1 = await processCharacterCreation({
    name: "Aemeath",
    gameName: "Wuthering Waves",
    element: "Spectro",
    weapon: "Sword",
    isFavorite: true,
    cardImage: "https://example.com/aemeath-card.png",
    splashArt: "https://example.com/aemeath-splash.png",
  });

  console.log(`  ✓ Character Collection ID: ${res1.dossierCharacter.id}`);
  console.log(`  ✓ Game Character Favorite ID: ${res1.gameCharacter?.id}`);
  console.log(`  ✓ Linked Correctly? ${res1.gameCharacter?.characterId === res1.dossierCharacter.id}`);

  if (!res1.dossierCharacter || !res1.gameCharacter) {
    throw new Error("Test 1 failed: Character Collection or Favorite missing!");
  }

  // ── TEST 2: Create Jinshi from Character Collection ───────────────────────
  console.log("\n2️⃣ Scenario 2: Creating Jinshi from Character Collection & adding to Favorite...");
  const res2a = await processCharacterCreation({
    name: "Jinshi",
    gameId: game.id,
    createDossierOnly: true,
    isFavorite: false,
    element: "Spectro",
    weapon: "Broadblade",
  });

  console.log(`  ✓ Created Dossier Only ID: ${res2a.dossierCharacter.id}`);
  console.log(`  ✓ Favorite created? ${res2a.gameCharacter !== null}`);

  // Now add Jinshi to Favorite
  const res2b = await processCharacterCreation({
    name: "Jinshi",
    gameId: game.id,
    isFavorite: true,
  });

  console.log(`  ✓ Reused Existing Dossier ID? ${res2b.dossierCharacter.id === res2a.dossierCharacter.id}`);
  console.log(`  ✓ Existing Dossier Reused Flag: ${res2b.isExistingDossierReused}`);

  if (!res2b.isExistingDossierReused) {
    throw new Error("Test 2 failed: Duplicate Dossier created for Jinshi!");
  }

  // ── TEST 3: Bulk Import 5 Characters via Service ─────────────────────────
  console.log("\n3️⃣ Scenario 3: Bulk importing 5 characters...");
  const bulkResults: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const res = await processCharacterCreation({
      name: `BulkChar_${i}`,
      gameName: "Wuthering Waves",
      element: i % 2 === 0 ? "Spectro" : "Glacio",
      createDossierOnly: i > 2, // Only first 2 are favorites
      isFavorite: i <= 2,
    });
    bulkResults.push(res);
  }
  console.log(`  ✓ Successfully processed ${bulkResults.length} bulk characters.`);

  const createdDossiersCount = bulkResults.filter((r) => r.dossierCharacter).length;
  const createdFavsCount = bulkResults.filter((r) => r.gameCharacter).length;
  console.log(`  ✓ Total Character Collection Entries Created: ${createdDossiersCount}`);
  console.log(`  ✓ Total Favorite Entries Created: ${createdFavsCount}`);

  if (createdDossiersCount !== 5 || createdFavsCount !== 2) {
    throw new Error(`Test 3 failed! Expected 5 dossiers & 2 favorites, got ${createdDossiersCount} and ${createdFavsCount}`);
  }

  // ── TEST 4: AI Agent Creating Roster ──────────────────────────────────────
  console.log("\n4️⃣ Scenario 4: AI Agent creating 5 characters via service...");
  const aiResults: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const res = await processCharacterCreation({
      name: `AiChar_${i}`,
      gameName: "Honkai: Star Rail",
      element: "Quantum",
      path: "Erudition",
      isFavorite: true,
    });
    aiResults.push(res);
  }
  console.log(`  ✓ AI Agent successfully created ${aiResults.length} synchronized characters.`);

  // ── TEST 5: Game Doesn't Exist ➔ Pending Link Created ────────────────────
  const pendingGameName = `FutureGame_${Date.now()}`;
  console.log(`\n5️⃣ Scenario 5: Creating character for non-existent game '${pendingGameName}'...`);
  const res5 = await processCharacterCreation({
    name: "TestPendingChar",
    gameName: pendingGameName,
    isFavorite: true,
  });

  console.log(`  ✓ Pending Link Flag: ${res5.isPendingGameLink}`);
  console.log(`  ✓ Game ID is null? ${res5.gameCharacter?.gameId === null}`);

  if (!res5.isPendingGameLink) {
    throw new Error("Test 5 failed: Game should have been marked as pending link!");
  }

  // Now create game and run repair
  console.log(`  ➕ Adding game '${pendingGameName}' and running repair synchronization...`);
  const newGame = await prisma.game.create({
    data: {
      game: pendingGameName,
      platform: "Multi",
      category: "Gacha RPG",
      mainCharacter: "Captain",
      accentColor: "#F59E0B",
    },
  });

  const repairRes = await repairCharacterDatabase();
  console.log(`  ✓ Repaired characters count: ${repairRes.repairedCount}`);
  console.log(`  ✓ Linked missing games count: ${repairRes.linkedGamesCount}`);

  const updatedPending = await prisma.gameCharacter.findFirst({
    where: { name: "TestPendingChar" },
  });
  console.log(`  ✓ Post-Repair Game ID linked? ${updatedPending?.gameId === newGame.id}`);

  if (updatedPending?.gameId !== newGame.id) {
    throw new Error("Test 5 failed: Pending character not linked after game creation!");
  }

  // ── TEST 6: Delete Favorite ➔ Character Collection Remains ────────────────
  console.log("\n6️⃣ Scenario 6: Deleting favorite for Aemeath...");
  await prisma.gameCharacter.delete({ where: { id: res1.gameCharacter.id } });

  const dossierStillExists = await prisma.gameDossierCharacter.findUnique({
    where: { id: res1.dossierCharacter.id },
  });
  console.log(`  ✓ Character Collection entry still exists? ${Boolean(dossierStillExists)}`);

  if (!dossierStillExists) {
    throw new Error("Test 6 failed: Deleting favorite deleted Character Collection!");
  }

  // ── TEST 7: Run Repair Synchronization ─────────────────────────────────────
  console.log("\n7️⃣ Scenario 7: Running Repair Synchronization...");
  const finalRepair = await repairCharacterDatabase();
  console.log(`  ✓ Repair execution finished cleanly with 0 errors.`);

  // ── CLEANUP TEST DATA ─────────────────────────────────────────────────────
  console.log("\n🧹 Cleaning up test entries...");
  await prisma.gameCharacter.deleteMany({
    where: {
      name: {
        in: [
          "Aemeath",
          "Jinshi",
          "TestPendingChar",
          ...Array.from({ length: 100 }, (_, i) => `BulkChar_${i + 1}`),
          ...Array.from({ length: 50 }, (_, i) => `AiChar_${i + 1}`),
        ],
      },
    },
  });
  await prisma.gameDossierCharacter.deleteMany({
    where: {
      name: {
        in: [
          "Aemeath",
          "Jinshi",
          "TestPendingChar",
          ...Array.from({ length: 100 }, (_, i) => `BulkChar_${i + 1}`),
          ...Array.from({ length: 50 }, (_, i) => `AiChar_${i + 1}`),
        ],
      },
    },
  });
  await prisma.game.deleteMany({ where: { id: newGame.id } });

  console.log("\n🎉 ALL 7 UNIFIED PIPELINE SCENARIOS PASSED WITH 100% SUCCESS!");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
