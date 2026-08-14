import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function diagnose() {
  const prisma = (await import("../lib/prisma")).default;

  try {
    const allGC = await prisma.gameCharacter.findMany({
      orderBy: { createdAt: "asc" },
    });

    console.log(`=== TOTAL GAME CHARACTERS: ${allGC.length} ===`);

    const byUserId = new Map<string, number>();
    for (const gc of allGC) {
      const u = gc.userId || "null";
      byUserId.set(u, (byUserId.get(u) || 0) + 1);
    }
    console.log("\nCounts by userId:");
    for (const [u, count] of byUserId.entries()) {
      console.log(`  ${u}: ${count}`);
    }

    // Group by name + gameName
    const grouped = new Map<string, typeof allGC>();
    for (const gc of allGC) {
      const key = `${gc.gameName || "Unknown"}::${gc.name.trim().toLowerCase()}`;
      const list = grouped.get(key) || [];
      list.push(gc);
      grouped.set(key, list);
    }

    const dupGroups = [...grouped.entries()].filter(([_, list]) => list.length > 1);
    console.log(`\nFound ${dupGroups.length} duplicate groups.`);

    const userDups: typeof dupGroups = [];
    const profileDups: typeof dupGroups = [];

    for (const group of dupGroups) {
      const [key, list] = group;
      const userIds = new Set(list.map((c) => c.userId));
      if (userIds.size === 1 && list[0].userId === "957c518a-0ebf-4526-92f0-b263565ba91d") {
        userDups.push(group);
      } else {
        profileDups.push(group);
      }
    }

    console.log(`\n--- GROUPS WITH DUPLICATES IN SAME AUTH USER (Nelvin) (${userDups.length}) ---`);
    for (const [key, list] of userDups) {
      console.log(`\nKey: ${key}`);
      list.forEach((c, idx) => {
        console.log(`  [#${idx + 1}] ID: ${c.id}`);
        console.log(`       characterId: ${c.characterId}`);
        console.log(`       cardImage: ${c.cardImage}`);
        console.log(`       avatarUrl: ${c.avatarUrl}`);
        console.log(`       splashArt: ${c.splashArt}`);
        console.log(`       createdAt: ${c.createdAt.toISOString()}`);
        console.log(`       updatedAt: ${c.updatedAt.toISOString()}`);
        console.log(`       cropData: ${JSON.stringify((c.stats as any)?.cropData)}`);
      });
    }

    console.log(`\n--- GROUPS WITH MIXED (profile vs user) (${profileDups.length}) ---`);
    for (const [key, list] of profileDups) {
      console.log(`\nKey: ${key}`);
      list.forEach((c, idx) => {
        console.log(`  [#${idx + 1}] ID: ${c.id}, userId: ${c.userId}, cardImage: ${c.cardImage ? "has_image" : "null"}, createdAt: ${c.createdAt.toISOString()}, updatedAt: ${c.updatedAt.toISOString()}`);
      });
    }

  } catch (err) {
    console.error("Diagnosis error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
