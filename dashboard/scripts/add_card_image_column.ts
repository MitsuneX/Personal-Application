import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("Adding cardImage column to GameCharacter table if not exists...");
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "GameCharacter" ADD COLUMN IF NOT EXISTS "cardImage" TEXT;'
  );
  console.log("Column cardImage added successfully!");
}

main()
  .catch((e) => {
    console.error("Error adding column:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
