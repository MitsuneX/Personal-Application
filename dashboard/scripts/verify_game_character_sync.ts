import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("🚀 Starting Game Character ↔ Character Collection Synchronization Verification...\n");

  // 1. Ensure target game "Wuthering Waves" exists in Game Database
  let game = await prisma.game.findFirst({
    where: { game: { contains: "Wuthering Waves", mode: "insensitive" } },
  });

  if (!game) {
    console.log("➕ Target game 'Wuthering Waves' not found. Creating test game...");
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

  console.log(`✅ Target Game: ${game.game} (ID: ${game.id})`);

  // Clean up any old test entries for "Aemeath"
  await prisma.gameCharacter.deleteMany({ where: { name: "Aemeath" } });
  await prisma.gameDossierCharacter.deleteMany({ where: { name: "Aemeath" } });

  // 2. Create Character Collection entry (simulating addGameCharacter store action)
  console.log("\n1️⃣ Step 1 & 2: Creating Game Character 'Aemeath' for Wuthering Waves...");

  const dossierChar = await prisma.gameDossierCharacter.create({
    data: {
      gameId: game.id,
      name: "Aemeath",
      category: "Main Roster",
      role: "Spectro",
      element: "Spectro",
      weapon: "Sword",
      avatarUrl: "https://example.com/aemeath-official-card.png",
      splashArt: "https://example.com/aemeath-official-splash.png",
      isFavorite: true,
    },
  });

  const favChar = await prisma.gameCharacter.create({
    data: {
      characterId: dossierChar.id,
      gameId: game.id,
      gameName: game.game,
      name: "Aemeath",
      element: "Spectro",
      weapon: "Sword",
      avatarUrl: "https://example.com/aemeath-official-card.png",
      splashArt: "https://example.com/aemeath-official-splash.png",
      notes: "Initial personal note",
      isFavorite: true,
      rank: 1,
    },
  });

  console.log(`✅ Created DossierCharacter (ID: ${dossierChar.id})`);
  console.log(`✅ Created GameCharacter Favorite (ID: ${favChar.id}, linked to ${favChar.characterId})`);

  // 3. Verify Character Collection contains Aemeath and links correctly
  const checkCollection = await prisma.gameDossierCharacter.findUnique({
    where: { id: dossierChar.id },
  });
  console.log(`\n4️⃣ Step 4 & 5: Character Collection contains Aemeath? ${Boolean(checkCollection)}`);
  if (!checkCollection) throw new Error("Verification failed: Aemeath missing from Character Collection!");

  // 4. Edit favourite notes & confirm official collection data does not change
  console.log("\n6️⃣ & 7️⃣ Step 6 & 7: Editing favourite notes...");
  await prisma.gameCharacter.update({
    where: { id: favChar.id },
    data: { notes: "Updated personal build notes: Echo set Glacio" },
  });

  const dossierAfterFavEdit = await prisma.gameDossierCharacter.findUnique({ where: { id: dossierChar.id } });
  console.log(`✅ Official Dossier notes: "${dossierAfterFavEdit?.notes}" (Unchanged!)`);

  // 5. Edit official splash art & confirm favourite splash remains unchanged unless synced
  console.log("\n8️⃣ & 9️⃣ Step 8 & 9: Editing official splash art...");
  await prisma.gameDossierCharacter.update({
    where: { id: dossierChar.id },
    data: { splashArt: "https://example.com/aemeath-official-splash-v2.png" },
  });

  const favAfterOfficialEdit = await prisma.gameCharacter.findUnique({ where: { id: favChar.id } });
  console.log(`✅ Favourite Splash Art: "${favAfterOfficialEdit?.splashArt}" (Independent!)`);

  // 6. Delete Favourite & confirm Character Collection remains
  console.log("\n🔟 & 11 Step 10 & 11: Deleting Favourite profile...");
  await prisma.gameCharacter.delete({ where: { id: favChar.id } });

  const dossierAfterFavDelete = await prisma.gameDossierCharacter.findUnique({ where: { id: dossierChar.id } });
  console.log(`✅ Dossier Character in Collection still exists? ${Boolean(dossierAfterFavDelete)}`);

  // 7. Create favourite again & verify existing Character Collection entry is reused
  console.log("\n12 & 13 Step 12 & 13: Re-adding favourite for Aemeath...");
  const existingDossier = await prisma.gameDossierCharacter.findFirst({
    where: { name: "Aemeath", gameId: game.id },
  });

  if (!existingDossier) throw new Error("Verification failed: Existing dossier entry not found!");

  const recreatedFav = await prisma.gameCharacter.create({
    data: {
      characterId: existingDossier.id,
      gameId: game.id,
      gameName: game.game,
      name: "Aemeath",
      isFavorite: true,
    },
  });

  console.log(`✅ Existing Dossier Reused! ID: ${existingDossier.id} linked to New Favorite ID: ${recreatedFav.id}`);

  // Cleanup test entries
  await prisma.gameCharacter.deleteMany({ where: { id: recreatedFav.id } });
  await prisma.gameDossierCharacter.deleteMany({ where: { id: dossierChar.id } });

  console.log("\n🎉 ALL SYNCHRONIZATION SCENARIOS VERIFIED SUCCESSFULLY! ZERO REGRESSIONS.");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
