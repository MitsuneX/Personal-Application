import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function inspectDetailed() {
  const prisma = (await import("../lib/prisma")).default;

  try {
    const records = await prisma.gameCharacter.findMany({
      where: { name: { contains: "Shallet", mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
    });

    console.log(`=== DETAILED INSPECTION OF SHALLET RECORDS (${records.length}) ===\n`);
    for (const r of records) {
      console.log(JSON.stringify(r, null, 2));
      console.log("\n--------------------------------------------------\n");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDetailed();
