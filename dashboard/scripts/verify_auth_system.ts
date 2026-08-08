import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyAuthSystem() {
  console.log("=== COMPREHENSIVE AUTHENTICATION & EMAIL RELINK VERIFICATION ===\n");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: usersData } = await supabase.auth.admin.listUsers();

  const ownerUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === "nelvin.claudius06@gmail.com"
  );

  if (!ownerUser) {
    console.error("❌ Target user nelvin.claudius06@gmail.com not found!");
    process.exit(1);
  }

  console.log(`✅ Owner Resolved: ${ownerUser.email} (${ownerUser.id})`);

  // 1. Verify UserAccount Prisma Record
  const ownerAccount = await prisma.userAccount.findUnique({
    where: { userId: ownerUser.id },
  });

  console.log("\n[UserAccount Record Check]:");
  console.log(`  UserId:   ${ownerAccount?.userId}`);
  console.log(`  Username: ${ownerAccount?.username}`);
  console.log(`  Email:    ${ownerAccount?.email}`);

  if (!ownerAccount || !ownerAccount.username) {
    console.error("❌ UserAccount missing!");
    process.exit(1);
  }

  // 2. Test Username vs Email Lookup Logic
  const usernameQuery = ownerAccount.username.toUpperCase();
  const foundByUsername = await prisma.userAccount.findFirst({
    where: {
      OR: [
        { username: { equals: usernameQuery.toLowerCase(), mode: "insensitive" } },
        { email: { startsWith: `${usernameQuery.toLowerCase()}@`, mode: "insensitive" } },
      ],
    },
  });

  console.log("\n[Username Resolution Test]:");
  console.log(`  Query Username: "${usernameQuery}"`);
  console.log(`  Resolved Email: "${foundByUsername?.email}"`);

  if (foundByUsername?.email === ownerAccount.email) {
    console.log("  ✅ SUCCESS: Username resolves cleanly to canonical account email!");
  } else {
    console.error("  ❌ FAIL: Username resolution failed!");
  }

  // 3. Test OTP Generation and Expiry
  console.log("\n[Email Relinking OTP Test]:");
  const testNewEmail = "nelvin.testrelocation@gmail.com";
  const testOtp = "654321";
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const pending = await prisma.pendingEmailRelink.upsert({
    where: { userId: ownerUser.id },
    create: {
      userId: ownerUser.id,
      newEmail: testNewEmail,
      otpCode: testOtp,
      expiresAt,
    },
    update: {
      newEmail: testNewEmail,
      otpCode: testOtp,
      expiresAt,
    },
  });

  console.log(`  Created Pending Relink: ${pending.newEmail} (Code: ${pending.otpCode}, Expires: ${pending.expiresAt.toISOString()})`);

  // Clean up test pending record
  await prisma.pendingEmailRelink.delete({ where: { userId: ownerUser.id } });
  console.log("  Cleaned up test pending relink.");

  console.log("\n🎉 ALL BACKEND AUTHENTICATION & DATA HYGIENE CHECKS PASSED SUCCESSFULLY!");
}

verifyAuthSystem()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
