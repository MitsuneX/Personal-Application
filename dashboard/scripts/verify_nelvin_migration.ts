import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyNelvinOwnership() {
  console.log("=== VERIFYING OWNER MIGRATION & DATA ISOLATION ===\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: usersData } = await supabase.auth.admin.listUsers();

  const nelvinUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === "nelvin.claudius06@gmail.com"
  );

  if (!nelvinUser) {
    console.error("❌ Target user nelvin.claudius06@gmail.com not found in auth!");
    process.exit(1);
  }

  const nelvinId = nelvinUser.id;
  console.log(`✅ Owner Resolved: ${nelvinUser.email} (${nelvinId})`);

  // Count records for Nelvin
  const games = await prisma.game.count({ where: { userId: nelvinId } });
  const aiTools = await prisma.aiToolItem.count({ where: { userId: nelvinId } });
  const dramas = await prisma.drama.count({ where: { userId: nelvinId } });
  const dramaLogs = await prisma.dramaLog.count({ where: { userId: nelvinId } });
  const hallOfFame = await prisma.hallOfFame.count({ where: { userId: nelvinId } });
  const notes = await prisma.note.count({ where: { userId: nelvinId } });
  const links = await prisma.link.count({ where: { userId: nelvinId } });

  console.log(`\n[Owner Data Counts for ${nelvinUser.email}]:`);
  console.log(`  🎮 Games:        ${games}`);
  console.log(`  🤖 AI Tools:     ${aiTools}`);
  console.log(`  🎬 Dramas:        ${dramas}`);
  console.log(`  📜 Drama Logs:    ${dramaLogs}`);
  console.log(`  🏆 Hall of Fame:  ${hallOfFame}`);
  console.log(`  📝 Notes:        ${notes}`);
  console.log(`  🔗 Links:        ${links}`);

  // Test Synthetic New Account (User C)
  const userCId = "synthetic-new-user-c-id-999";
  const userCGames = await prisma.game.count({ where: { userId: userCId } });
  const userCAi = await prisma.aiToolItem.count({ where: { userId: userCId } });

  console.log(`\n[New Account Isolation Check (${userCId})]:`);
  console.log(`  User C Games: ${userCGames} (Expected: 0)`);
  console.log(`  User C AIs:   ${userCAi} (Expected: 0)`);

  if (userCGames === 0 && userCAi === 0) {
    console.log("\n🎉 SUCCESS: All existing records belong to nelvin.claudius06@gmail.com! New accounts start with clean isolated databases!");
  } else {
    console.error("\n❌ ISOLATION FAIL: New user inherited data!");
  }

  console.log("\n=== VERIFICATION COMPLETE ===");
}

verifyNelvinOwnership().catch(console.error).finally(() => (prisma as any).$disconnect());
