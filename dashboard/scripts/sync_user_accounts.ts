import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function syncUserAccounts() {
  console.log("=== SYNCING SUPABASE USERS TO PRISMA USERACCOUNT ===");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: usersData, error } = await supabase.auth.admin.listUsers();

  if (error || !usersData?.users) {
    console.error("Failed to list users from Supabase:", error);
    process.exit(1);
  }

  console.log(`Found ${usersData.users.length} users in Supabase Auth.`);

  for (const user of usersData.users) {
    if (!user.email) continue;
    const email = user.email.toLowerCase().trim();
    const rawUsername =
      (user.user_metadata?.username as string) ||
      (user.user_metadata?.full_name as string) ||
      email.split("@")[0];

    const username = rawUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

    console.log(`Syncing user: Email=${email}, Username=${username}, UserId=${user.id}`);

    await prisma.userAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email,
        username,
      },
      update: {
        email,
        username,
      },
    });
  }

  console.log("=== USER ACCOUNTS SYNC COMPLETE ===");
}

syncUserAccounts()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
