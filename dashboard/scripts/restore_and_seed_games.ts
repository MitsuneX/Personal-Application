import prisma from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { normalizeGameTitle } from "../lib/data/gameIcons";
import { DEFAULT_GAMES } from "../lib/data/initialGames";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function restoreAndSeedGames() {
  console.log("=== RESTORING & SEEDING MISSING GAMES ===\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: usersData } = await supabase.auth.admin.listUsers();

  const ownerUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === "nelvin.claudius06@gmail.com"
  );

  if (!ownerUser) {
    console.error("❌ Owner user nelvin.claudius06@gmail.com not found!");
    process.exit(1);
  }

  const userId = ownerUser.id;
  console.log(`Target Owner User ID: ${userId} (${ownerUser.email})`);

  // Fetch existing games for owner
  const existingGames = await prisma.game.findMany({ where: { userId } });
  console.log(`Current existing games count: ${existingGames.length}`);

  const targetGames = [
    {
      game: "Girls' Frontline 2: Exilium",
      platform: "Mobile",
      rank: "",
      mainCharacter: "Mosin-Nagant",
      mainRole: "Main DPS",
      category: "Gacha RPG",
      accentColor: "#E94560",
      profileLink: "https://gf2exilium.com",
      icon: "/game-icons/gfl2.svg",
    },
    {
      game: "Stella Sora",
      platform: "Mobile",
      rank: "SS",
      mainCharacter: "Sora",
      mainRole: "Star Vanguard",
      category: "Gacha RPG",
      accentColor: "#6C5CE7",
      profileLink: "https://stellasora.io",
      icon: "/game-icons/stellasora.svg",
    },
    {
      game: "Reverse: 1999",
      platform: "Multi",
      rank: "6★",
      mainCharacter: "Regulus",
      mainRole: "Star / Sub-DPS",
      category: "Gacha RPG",
      accentColor: "#D2DAE2",
      profileLink: "https://re1999.bluepoch.com",
      icon: "/game-icons/r1999.svg",
    },
    {
      game: "Umamusume: Pretty Derby",
      platform: "Mobile",
      rank: "UG8",
      mainCharacter: "Special Week",
      mainRole: "Pace-Setter / Turf",
      category: "Gacha RPG",
      accentColor: "#FF7675",
      profileLink: "https://umamusume.jp",
      icon: "/game-icons/umamusume.svg",
    },
    {
      game: "Punishing: Gray Raven",
      platform: "Multi",
      rank: "Commandant",
      mainCharacter: "Lucia: Crimson Weave",
      mainRole: "Attacker / Lightning",
      category: "Gacha Action",
      accentColor: "#00F5FF",
      profileLink: "https://pgr.kurogame.net",
      icon: "/game-icons/pgr.svg",
    },
  ];

  for (const target of targetGames) {
    const normTarget = normalizeGameTitle(target.game);
    const match = existingGames.find(
      (g) => normalizeGameTitle(g.game) === normTarget
    );

    if (!match) {
      console.log(`➕ Seeding missing game: ${target.game}`);
      await prisma.game.create({
        data: {
          userId,
          game: target.game,
          handle: "",
          platform: target.platform,
          rank: target.rank,
          mainCharacter: target.mainCharacter,
          mainRole: target.mainRole,
          category: target.category,
          isActive: true,
          accentColor: target.accentColor,
          profileLink: target.profileLink,
          icon: target.icon,
        },
      });
    } else {
      console.log(`✓ Game already exists (no duplicate): ${match.game}`);
    }
  }

  const finalGames = await prisma.game.findMany({ where: { userId } });
  console.log(`\nFinal total games count for ${ownerUser.email}: ${finalGames.length}`);
  console.log("=== RESTORE & SEED COMPLETE ===");
}

restoreAndSeedGames()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect());
