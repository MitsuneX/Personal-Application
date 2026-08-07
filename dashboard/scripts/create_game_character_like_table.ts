import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("Creating GameCharacterLike table if not exists...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GameCharacterLike" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "gameCharacterId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GameCharacterLike_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "GameCharacterLike_userId_gameCharacterId_key" 
    ON "GameCharacterLike"("userId", "gameCharacterId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GameCharacterLike_userId_idx" ON "GameCharacterLike"("userId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GameCharacterLike_gameCharacterId_idx" ON "GameCharacterLike"("gameCharacterId");
  `);
  console.log("Table GameCharacterLike created successfully!");
}

main()
  .catch((e) => {
    console.error("Error creating GameCharacterLike table:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
