import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function verify() {
  const prisma = (await import("../lib/prisma")).default;
  const userId = "957c518a-0ebf-4526-92f0-b263565ba91d";

  const chars = await prisma.gameCharacter.findMany({
    where: { userId },
    orderBy: { rank: "asc" },
  });

  console.log("=== GAME CHARACTER VERIFICATION ===\n");
  console.log(`Total game characters: ${chars.length}`);

  const byGame = chars.reduce((acc, c) => {
    const k = c.gameName || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\nBy Game:");
  for (const [game, count] of Object.entries(byGame)) {
    console.log(`  ${game}: ${count}`);
  }

  const orphaned = chars.filter((c) => !c.gameId).length;
  const linked = chars.filter((c) => c.gameId).length;
  console.log(`\nLinked to game: ${linked}`);
  console.log(`Orphaned (no gameId): ${orphaned}`);

  console.log("\nFirst 5 characters:");
  chars.slice(0, 5).forEach((c) => {
    console.log(`  [${c.rank}] ${c.name} (${c.gameName}) - ${c.element || c.role || "N/A"}`);
  });

  await prisma.$disconnect();
}

verify().catch(console.error);
