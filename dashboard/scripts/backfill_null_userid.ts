import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function backfillOrphanRecords() {
  console.log("=== Starting Idempotent Backfill for Orphan Records (userId IS NULL) ===");

  // Find the target active profile or first profile with a valid userId
  const activeProfile = await prisma.profile.findFirst({
    where: { userId: { not: null } },
  });

  if (!activeProfile || !activeProfile.userId) {
    console.error("No active user profile with a valid userId was found in PostgreSQL database. Aborting.");
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }

  const targetUserId = activeProfile.userId;
  console.log(`Target User ID for backfill: ${targetUserId}`);

  const updateCount = async (modelName: string, delegate: any) => {
    try {
      const res = await delegate.updateMany({
        where: { userId: null },
        data: { userId: targetUserId },
      });
      console.log(`✓ ${modelName}: Backfilled ${res.count} orphan rows.`);
    } catch (err: any) {
      console.warn(`! ${modelName}: Failed to backfill:`, err.message);
    }
  };

  await updateCount("Profile", prisma.profile);
  await updateCount("ProfileHistory", prisma.profileHistory);
  await updateCount("Game", prisma.game);
  await updateCount("GameShowcaseItem", prisma.gameShowcaseItem);
  await updateCount("GameExternalResource", prisma.gameExternalResource);
  await updateCount("GameDossierCharacter", prisma.gameDossierCharacter);
  await updateCount("Anime", prisma.anime);
  await updateCount("FavoriteCharacter", prisma.favoriteCharacter);
  await updateCount("Drama", prisma.drama);
  await updateCount("HallOfFame", prisma.hallOfFame);
  await updateCount("Note", prisma.note);
  await updateCount("Link", prisma.link);
  await updateCount("GalleryItem", prisma.galleryItem);
  await updateCount("Song", prisma.song);
  await updateCount("Playlist", prisma.playlist);
  await updateCount("DramaLog", prisma.dramaLog);
  await updateCount("SavedPrompt", prisma.savedPrompt);
  await updateCount("HobbySkill", prisma.hobbySkill);
  await updateCount("HobbyLog", prisma.hobbyLog);
  await updateCount("ProjectItem", prisma.projectItem);
  await updateCount("AiToolItem", prisma.aiToolItem);

  console.log("=== Backfill Complete ===");
  await prisma.$disconnect();
  await pool.end();
}

backfillOrphanRecords().catch((err) => {
  console.error("Fatal backfill error:", err);
  process.exit(1);
});
