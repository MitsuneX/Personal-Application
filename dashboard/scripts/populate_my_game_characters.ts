import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runPopulation() {
  console.log("=== POPULATING USER PERSONAL GAME CHARACTERS COLLECTION ===\n");
  const prisma = (await import("../lib/prisma")).default;

  // Find the primary owner account — the one where userId = id (self-linked profile)
  // This is the main authenticated Nelvin account. We NEVER insert into orphan profiles.
  const ownerProfile = await prisma.profile.findFirst({
    where: {
      AND: [
        { userId: { not: null } },
        // userId === id means it was created by a real Supabase auth login
      ],
      // Pick the one that has games linked to it (the real owner)
      userId: "957c518a-0ebf-4526-92f0-b263565ba91d",
    },
  });

  if (!ownerProfile || !ownerProfile.userId) {
    // Fallback: find any profile where userId is set and games exist
    const allProfiles = await prisma.profile.findMany({
      where: { userId: { not: null } },
    });
    console.log("Available profiles with userId:");
    for (const p of allProfiles) {
      const gameCount = await prisma.game.count({ where: { userId: p.userId! } });
      console.log(`  Profile: ${p.id}, userId: ${p.userId}, name: ${p.name}, games: ${gameCount}`);
    }
    console.error("❌ Primary owner profile not found! Check the userId above and update the script.");
    process.exit(1);
  }

  const userId = ownerProfile.userId;
  console.log(`✅ Target Owner: ${ownerProfile.name} (userId: ${userId})\n`);

  console.log(`--------------------------------------------------`);
  console.log(`Processing User Account: ${userId}`);

    // Fetch existing games for this user
    const userGames = await prisma.game.findMany({ where: { userId } });
    console.log(`Found ${userGames.length} existing games for user.`);

    // Fetch existing dossier characters for this user
    const userDossiers = await prisma.gameDossierCharacter.findMany({ where: { userId } });

    // Helper to find matching gameId
    const findGameId = (gameTitle: string): { gameId: string | null; gameName: string } => {
      const match = userGames.find(
        (g) => g.game.toLowerCase() === gameTitle.toLowerCase() || g.game.toLowerCase().includes(gameTitle.toLowerCase()) || gameTitle.toLowerCase().includes(g.game.toLowerCase())
      );
      return { gameId: match ? match.id : null, gameName: match ? match.game : gameTitle };
    };

    // Helper to find matching dossier character
    const findDossierId = (charName: string, gameId: string | null, gameTitle: string): string | null => {
      const match = userDossiers.find(
        (d) =>
          d.name.toLowerCase() === charName.toLowerCase() &&
          ((gameId && d.gameId === gameId) || d.notes?.toLowerCase().includes(gameTitle.toLowerCase()))
      );
      return match ? match.id : null;
    };

    // Master Character Definitions loaded from standalone JSON file
    const characterGroups: Array<{ gameTitle: string; characters: any[] }> = require("../lib/data/game_characters_master.json");

    let insertedCount = 0;
    let updatedCount = 0;
    let rankCounter = 1;

    for (const group of characterGroups) {
      const { gameId, gameName } = findGameId(group.gameTitle);

      for (const charData of group.characters) {
        const dossierId = findDossierId(charData.name, gameId, gameName);

        // Check if character already exists for this user
        const existing = await prisma.gameCharacter.findFirst({
          where: {
            userId,
            name: { equals: charData.name, mode: "insensitive" },
            OR: [
              { gameName: { equals: gameName, mode: "insensitive" } },
              { gameId: gameId || undefined },
            ],
          },
        });

        if (existing) {
          await prisma.gameCharacter.update({
            where: { id: existing.id },
            data: {
              characterId: dossierId || existing.characterId,
              gameId: gameId || existing.gameId,
              gameName,
              title: charData.title || existing.title,
              role: charData.role || existing.role,
              category: charData.category || existing.category,
              element: charData.element || existing.element,
              path: charData.path || existing.path,
              weapon: charData.weapon || existing.weapon,
              rarity: charData.rarity || existing.rarity,
              nation: charData.nation || existing.nation,
              birthday: charData.birthday || existing.birthday,
              accentColor: charData.accentColor || existing.accentColor,
              rank: rankCounter++,
              isFavorite: true,
              notes: charData.notes || existing.notes,
              stats: charData.stats || existing.stats,
              tags: charData.tags || existing.tags,
            },
          });
          updatedCount++;
        } else {
          await prisma.gameCharacter.create({
            data: {
              userId,
              characterId: dossierId,
              gameId,
              gameName,
              name: charData.name,
              title: charData.title || null,
              role: charData.role || null,
              category: charData.category || null,
              element: charData.element || null,
              path: charData.path || null,
              weapon: charData.weapon || null,
              rarity: charData.rarity || null,
              nation: charData.nation || null,
              birthday: charData.birthday || null,
              accentColor: charData.accentColor || "#00F5FF",
              rank: rankCounter++,
              likes: 1,
              isFavorite: true,
              notes: charData.notes || null,
              stats: charData.stats || null,
              tags: charData.tags || null,
            },
          });
          insertedCount++;
        }
      }
  }

  console.log(`\n✅ User ${userId}: ${insertedCount} created, ${updatedCount} updated.`);
  console.log("\n=== DATABASE POPULATION COMPLETE ===");
}

runPopulation()
  .catch((err) => {
    console.error("❌ Error running population:", err);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = (await import("../lib/prisma")).default;
    await prisma.$disconnect();
  });
