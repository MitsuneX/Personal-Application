import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function migrate() {
  console.log("=== Starting Data Migration to Primary Owner Account ===\n");

  let primaryUserId = "default-owner";

  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data: usersData, error } = await supabase.auth.admin.listUsers();
      if (!error && usersData?.users && usersData.users.length > 0) {
        primaryUserId = usersData.users[0].id;
        console.log(`Resolved Primary Owner Email: ${usersData.users[0].email} (${primaryUserId})`);
      }
    } catch (err: any) {
      console.warn("Notice: Failed to fetch Supabase user list, using default owner ID:", err.message);
    }
  }

  console.log(`Target Owner ID: ${primaryUserId}\n`);

  const modelsToMigrate = [
    "game",
    "gameShowcaseItem",
    "gameExternalResource",
    "gameDossierCharacter",
    "anime",
    "favoriteCharacter",
    "drama",
    "hallOfFame",
    "note",
    "link",
    "galleryItem",
    "song",
    "playlist",
    "dramaLog",
    "savedPrompt",
    "hobbySkill",
    "hobbyLog",
    "projectItem",
    "aiToolItem",
    "profileHistory",
  ];

  for (const modelKey of modelsToMigrate) {
    try {
      const delegate = (prisma as any)[modelKey];
      if (delegate && typeof delegate.updateMany === "function") {
        const result = await delegate.updateMany({
          where: { userId: null },
          data: { userId: primaryUserId },
        });
        console.log(`  ✅ Migrated ${modelKey}: ${result.count} records assigned to ${primaryUserId}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate model ${modelKey}:`, err.message);
    }
  }

  // Migrate Profile
  try {
    const profile = await prisma.profile.findFirst({ where: { userId: null } });
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { userId: primaryUserId },
      });
      console.log(`  ✅ Migrated Profile ${profile.id} to owner ${primaryUserId}`);
    }
  } catch (err: any) {
    console.warn("  Notice: Profile migration skipped or already set:", err.message);
  }

  console.log("\n=== MIGRATION COMPLETE ===");
}

migrate()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
