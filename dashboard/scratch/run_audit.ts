import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";

async function runAudit() {
  console.log("=============================================================");
  console.log("=== GFL2 UNLINKED CHARACTER DEEP AUDIT                    ===");
  console.log("=============================================================\n");

  // 1. Mandatory Data Backup
  const gcs = await prisma.gameCharacter.findMany();
  const hofs = await prisma.hallOfFame.findMany();
  const history = await prisma.softDeleteHistory.findMany();

  const backupPath = path.join(process.cwd(), "scratch", `gfl2_audit_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ timestamp: new Date().toISOString(), gameCharacters: gcs, hallOfFame: hofs, history }, null, 2));
  console.log(`✅ Backup saved to: ${backupPath}`);
  console.log(`   Active GameCharacters: ${gcs.length}`);
  console.log(`   Active HallOfFame:     ${hofs.length}`);
  console.log(`   SoftDeleteHistory:     ${history.length}\n`);

  // 2. Audit the 4 GFL2 target characters
  const targetNames = ["Tololo", "Daiyan", "Loreley", "Lainie"];
  console.log("--- Inspecting Target Characters (Tololo, Daiyan, Loreley, Lainie) ---");

  for (const name of targetNames) {
    const matches = gcs.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    console.log(`\n🔍 Matches for "${name}" (${matches.length} found in DB):`);
    matches.forEach(c => {
      console.log(`   - ID: ${c.id}`);
      console.log(`     Name: "${c.name}", Game: "${c.gameName}" (gameId: "${c.gameId}")`);
      console.log(`     characterId: "${c.characterId || "NULL"}"`);
      console.log(`     stats:`, JSON.stringify(c.stats));
    });
  }

  // 3. Inspect all GFL2 characters
  const gfl2Chars = gcs.filter(c => (c.gameName || "").toLowerCase().includes("frontline") || (c.gameId || "").toLowerCase().includes("gfl"));
  console.log(`\n--- Inspecting All GFL2 Characters in DB (${gfl2Chars.length} total) ---`);
  gfl2Chars.forEach(c => {
    const isUnlinked = !c.gameId || !c.characterId;
    console.log(`   [${isUnlinked ? "UNLINKED" : "LINKED"}] ID: ${c.id} | Name: "${c.name}" | gameId: "${c.gameId}" | characterId: "${c.characterId}"`);
  });
}

runAudit().finally(() => prisma.$disconnect());
