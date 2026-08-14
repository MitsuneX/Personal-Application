import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function inspect() {
  const prisma = (await import("../lib/prisma")).default;

  try {
    console.log("=== INSPECTING SHALLET IN DATABASE ===");

    // 1. Check GameCharacter table
    const gameCharacters = await prisma.gameCharacter.findMany({
      where: {
        name: {
          contains: "Shallet",
          mode: "insensitive",
        },
      },
    });

    console.log(`\nFound ${gameCharacters.length} records in GameCharacter:`);
    gameCharacters.forEach((gc, idx) => {
      console.log(`\n--- GameCharacter #${idx + 1} ---`);
      console.log(`ID: ${gc.id}`);
      console.log(`userId: ${gc.userId}`);
      console.log(`characterId: ${gc.characterId}`);
      console.log(`gameId: ${gc.gameId}`);
      console.log(`gameName: ${gc.gameName}`);
      console.log(`name: ${gc.name}`);
      console.log(`title: ${gc.title}`);
      console.log(`avatarUrl: ${gc.avatarUrl}`);
      console.log(`cardImage: ${gc.cardImage}`);
      console.log(`splashArt: ${gc.splashArt}`);
      console.log(`createdAt: ${gc.createdAt}`);
      console.log(`updatedAt: ${gc.updatedAt}`);
      console.log(`stats: ${JSON.stringify(gc.stats)?.substring(0, 200)}`);
      console.log(`tags: ${JSON.stringify(gc.tags)}`);
    });

    // 2. Check GameDossierCharacter table
    const dossierCharacters = await prisma.gameDossierCharacter.findMany({
      where: {
        name: {
          contains: "Shallet",
          mode: "insensitive",
        },
      },
    });

    console.log(`\nFound ${dossierCharacters.length} records in GameDossierCharacter:`);
    dossierCharacters.forEach((dc, idx) => {
      console.log(`\n--- GameDossierCharacter #${idx + 1} ---`);
      console.log(`ID: ${dc.id}`);
      console.log(`userId: ${dc.userId}`);
      console.log(`gameId: ${dc.gameId}`);
      console.log(`name: ${dc.name}`);
      console.log(`avatarUrl: ${dc.avatarUrl}`);
      console.log(`splashArt: ${dc.splashArt}`);
      console.log(`isFavorite: ${dc.isFavorite}`);
      console.log(`createdAt: ${dc.createdAt}`);
    });

    // 3. Check HallOfFame table just in case
    const hofEntries = await prisma.hallOfFame.findMany({
      where: {
        name: {
          contains: "Shallet",
          mode: "insensitive",
        },
      },
    });
    console.log(`\nFound ${hofEntries.length} records in HallOfFame for Shallet.`);

    // 4. Check all duplicate names in GameCharacter
    const allGC = await prisma.gameCharacter.findMany();
    const nameMap = new Map<string, typeof allGC>();
    for (const gc of allGC) {
      const key = `${gc.gameName || gc.gameId || "nogame"}::${gc.name.trim().toLowerCase()}`;
      const list = nameMap.get(key) || [];
      list.push(gc);
      nameMap.set(key, list);
    }

    const duplicates = [...nameMap.entries()].filter(([_, list]) => list.length > 1);
    console.log(`\nTotal GameCharacter records: ${allGC.length}`);
    console.log(`Found ${duplicates.length} duplicate groups across all GameCharacters:`);
    duplicates.forEach(([key, list]) => {
      console.log(`\nDuplicate Key: ${key} (${list.length} instances):`);
      list.forEach((item) => {
        console.log(` - ID: ${item.id}, userId: ${item.userId}, cardImage: ${item.cardImage}, avatarUrl: ${item.avatarUrl}, createdAt: ${item.createdAt}, updatedAt: ${item.updatedAt}`);
      });
    });

  } catch (err) {
    console.error("Error during inspection:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
