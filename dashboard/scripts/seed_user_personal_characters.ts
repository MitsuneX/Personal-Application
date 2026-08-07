import prisma from "../lib/prisma";
import { ensureUserPersonalCharacters } from "../lib/services/characterCreationService";

async function main() {
  console.log("🌸 Seeding user personal Game Characters...");

  // Find primary user or active account
  const profile = await prisma.profile.findFirst({
    orderBy: { updatedAt: "asc" },
  });

  if (!profile) {
    console.error("❌ No user profile found.");
    return;
  }

  const userId = profile.userId || profile.id;
  console.log(`👤 Found user account: ${profile.name} (${userId})`);

  await ensureUserPersonalCharacters(userId);

  console.log("✅ Successfully populated personal Game Characters for user!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
