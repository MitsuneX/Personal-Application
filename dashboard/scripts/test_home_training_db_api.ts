import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("=== Testing Database Persistence for TrainingSession ===");

  const testUserId = "test-system-verifier";
  const testDateKey = "2026-09-29";
  const testDayId = "monday";

  // Clean up any test records first
  await (prisma as any).trainingSession.deleteMany({
    where: { userId: testUserId, dateKey: testDateKey },
  });

  // 1. Create a session with PENDING / IN_PROGRESS state
  const session1 = await (prisma as any).trainingSession.create({
    data: {
      userId: testUserId,
      dayId: testDayId,
      dateKey: testDateKey,
      status: "IN_PROGRESS",
      completedBlocks: ["mon-warmup"],
      exhaustedBlocks: [],
      xpEarned: 10,
      note: "Initial warmup completed",
    },
  });
  console.log("✅ Created initial session:", session1.id, "status:", session1.status, "xp:", session1.xpEarned);

  // 2. Idempotent upsert: update session with exhausted block
  const session2 = await (prisma as any).trainingSession.upsert({
    where: {
      userId_dateKey: {
        userId: testUserId,
        dateKey: testDateKey,
      },
    },
    update: {
      status: "RECOVERY_COMPLETE",
      completedBlocks: ["mon-warmup", "mon-shadowboxing"],
      exhaustedBlocks: ["mon-strength"],
      xpEarned: 35, // 10 + 25
      note: "Strength was too intense today, logged recovery",
    },
    create: {
      userId: testUserId,
      dayId: testDayId,
      dateKey: testDateKey,
      status: "RECOVERY_COMPLETE",
      completedBlocks: ["mon-warmup", "mon-shadowboxing"],
      exhaustedBlocks: ["mon-strength"],
      xpEarned: 35,
    },
  });
  console.log("✅ Upserted session (idempotent):", session2.id, "status:", session2.status, "completed:", session2.completedBlocks.length, "exhausted:", session2.exhaustedBlocks.length);

  // Verify only 1 record exists for this user and date
  const count = await (prisma as any).trainingSession.count({
    where: { userId: testUserId, dateKey: testDateKey },
  });
  if (count !== 1) {
    throw new Error(`Expected exactly 1 record, got ${count}`);
  }
  console.log("✅ Idempotent constraint verified: Exactly 1 record per user+dateKey");

  // Clean up test data
  await (prisma as any).trainingSession.deleteMany({
    where: { userId: testUserId, dateKey: testDateKey },
  });
  console.log("✅ Test session cleaned up successfully");

  console.log("\n🎉 ALL DATABASE PERSISTENCE TESTS PASSED!");
}

testDatabase().catch((err) => {
  console.error("Database test error:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
