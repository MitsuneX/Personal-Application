import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TARGET_EMAIL = "nelvin.claudius06@gmail.com";

async function runMigration() {
  console.log(`=== MIGRATION AUDIT: Re-assigning Data to ${TARGET_EMAIL} ===\n`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: usersData, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching Supabase auth users:", error);
    process.exit(1);
  }

  let targetUser = usersData.users.find(
    (u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase()
  );

  if (!targetUser) {
    console.log(`User ${TARGET_EMAIL} not found in Supabase Auth. Creating account...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: TARGET_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: "Nelvin Claudius" },
    });

    if (createError || !newUser.user) {
      console.error("Failed to create target owner account:", createError);
      process.exit(1);
    }
    targetUser = newUser.user;
    console.log(`Created account for ${TARGET_EMAIL} (ID: ${targetUser.id})`);
  } else {
    console.log(`Found existing account for ${TARGET_EMAIL} (ID: ${targetUser.id})`);
  }

  const targetUserId = targetUser.id;

  // List of all user-owned Prisma models
  const modelsToMigrate = [
    "game",
    "gameShowcaseItem",
    "gameExternalResource",
    "gameDossierCharacter",
    "anime",
    "favoriteCharacter",
    "drama",
    "hallOfFame",
    "note",
    "link",
    "galleryItem",
    "song",
    "playlist",
    "dramaLog",
    "savedPrompt",
    "hobbySkill",
    "hobbyLog",
    "projectItem",
    "aiToolItem",
    "profileHistory",
  ];

  for (const modelKey of modelsToMigrate) {
    try {
      const delegate = (prisma as any)[modelKey];
      if (delegate && typeof delegate.updateMany === "function") {
        const result = await delegate.updateMany({
          data: { userId: targetUserId },
        });
        console.log(`  ✅ Reassigned ${modelKey}: ${result.count} records linked to ${targetUserId}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error reassigning ${modelKey}:`, err.message);
    }
  }

  // Ensure Profile belongs to targetUserId
  try {
    const existingProfile = await prisma.profile.findFirst({
      where: { OR: [{ userId: targetUserId }, { id: targetUserId }, { id: "profile" }] },
    });

    if (existingProfile) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          id: targetUserId,
          userId: targetUserId,
          name: "Nelvin Claudius",
          tagline: "Full-Stack Architect & Personal Command Center Owner",
        },
      });
      console.log(`  ✅ Profile updated for ${TARGET_EMAIL} (${targetUserId})`);
    } else {
      await prisma.profile.create({
        data: {
          id: targetUserId,
          userId: targetUserId,
          name: "Nelvin Claudius",
          tagline: "Full-Stack Architect",
          bio: "Nexus Xenon Command Center Owner",
          status: "online",
          location: "Tokyo / Jakarta",
          skills: ["Next.js 16", "React 19", "TypeScript", "Prisma", "Supabase"],
          socials: [],
          avatar: "/avatar.png",
        },
      });
      console.log(`  ✅ Profile created for ${TARGET_EMAIL} (${targetUserId})`);
    }
  } catch (err: any) {
    console.warn("  Notice: Profile update step log:", err.message);
  }

  console.log(`\n=== MIGRATION COMPLETE: All existing data belongs to ${TARGET_EMAIL} (${targetUserId}) ===`);
}

runMigration()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
