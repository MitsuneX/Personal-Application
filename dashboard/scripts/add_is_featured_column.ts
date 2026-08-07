import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("Adding isFeatured column to GameCharacter table if not exists...");
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "GameCharacter" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;'
  );
  console.log("Column isFeatured added successfully!");
}

main()
  .catch((e) => {
    console.error("Error adding isFeatured column:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
