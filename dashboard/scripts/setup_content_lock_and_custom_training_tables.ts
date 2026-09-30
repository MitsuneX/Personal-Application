import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const prisma = (await import("../lib/prisma")).default;

  console.log("=== Creating ContentLockSettings and UserTrainingPlan tables if not exists ===");

  // 1. ContentLockSettings table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ContentLockSettings" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "enabled" BOOLEAN NOT NULL DEFAULT false,
      "method" TEXT NOT NULL DEFAULT 'PIN',
      "credentialHash" TEXT,
      "salt" TEXT,
      "hint" TEXT,
      "protectedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "failedAttempts" INTEGER NOT NULL DEFAULT 0,
      "lockedUntil" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ContentLockSettings_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ContentLockSettings_userId_key" 
    ON "ContentLockSettings"("userId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ContentLockSettings_userId_idx" 
    ON "ContentLockSettings"("userId");
  `);

  console.log("✅ ContentLockSettings table verified / created.");

  // 2. UserTrainingPlan table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserTrainingPlan" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "dayId" TEXT NOT NULL,
      "title" TEXT,
      "subtitle" TEXT,
      "estimatedDuration" TEXT,
      "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "blocks" JSONB NOT NULL DEFAULT '[]'::jsonb,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserTrainingPlan_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UserTrainingPlan_userId_dayId_key" 
    ON "UserTrainingPlan"("userId", "dayId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "UserTrainingPlan_userId_idx" 
    ON "UserTrainingPlan"("userId");
  `);

  console.log("✅ UserTrainingPlan table verified / created.");

  // 3. Add sessionSnapshot column to TrainingSession table if not exists
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "TrainingSession" 
    ADD COLUMN IF NOT EXISTS "sessionSnapshot" JSONB;
  `);

  console.log("✅ TrainingSession.sessionSnapshot column verified / added.");
  console.log("=== All database schemas successfully verified ===");
}

main()
  .catch((err) => {
    console.error("Database migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = (await import("../lib/prisma")).default;
    await prisma.$disconnect();
  });
