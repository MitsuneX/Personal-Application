import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function seedPgrForOwner() {
  console.log("=== PERMANENT DATABASE INSERTION — PUNISHING: GRAY RAVEN ===\n");

  const prisma = (await import("../lib/prisma")).default;
  const targetEmail = "nelvin.claudius06@gmail.com";

  // Find user ID via Supabase Auth or Profile table
  let userId: string | null = null;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const ownerUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    if (ownerUser) {
      userId = ownerUser.id;
    }
  }

  if (!userId) {
    const profile = await prisma.profile.findFirst({
      where: {
        userId: { not: null },
      },
    });
    if (profile && profile.userId) {
      userId = profile.userId;
    }
  }

  if (!userId) {
    console.error(`❌ Target user ${targetEmail} not found!`);
    process.exit(1);
  }

  console.log(`✅ Target Owner User ID: ${userId} (${targetEmail})`);

  // 1. Check or Create Game Record
  let game = await prisma.game.findFirst({
    where: {
      userId,
      game: { equals: "Punishing: Gray Raven", mode: "insensitive" },
    },
  });

  if (!game) {
    console.log("➕ Creating real Game record for Punishing: Gray Raven in PostgreSQL...");
    game = await prisma.game.create({
      data: {
        userId,
        game: "Punishing: Gray Raven",
        handle: "@commandant",
        platform: "Multi",
        rank: "Commandant",
        mainCharacter: "Lucia: Crimson Weave",
        mainRole: "Attacker / Lightning",
        category: "Gacha Action",
        isActive: true,
        accentColor: "#00F5FF",
        profileLink: "https://pgr.kurogame.net",
        icon: "/game-icons/pgr.svg",
      },
    });
    console.log(`✔️ Game record created with ID: ${game.id}`);
  } else {
    console.log(`ℹ️ Game record already exists with ID: ${game.id}. Updating fields...`);
    game = await prisma.game.update({
      where: { id: game.id },
      data: {
        accentColor: "#00F5FF",
        icon: "/game-icons/pgr.svg",
        category: "Gacha Action",
        rank: "Commandant",
        mainCharacter: "Lucia: Crimson Weave",
        mainRole: "Attacker / Lightning",
      },
    });
  }

  const gameId = game.id;

  // 2. Insert / Update Characters
  const characters = [
    {
      name: "Lucia: Crimson Weave",
      category: "Omniframe",
      role: "Attacker / Lightning",
      levelRank: "Rank SS - Level 80",
      winRate: 94.0,
      matches: 380,
      notes: "Odachi slashes with rapid thunder blades & lightning domain.",
      accentColor: "#FACC15",
      isFavorite: true,
    },
    {
      name: "Bianca: Stigmata",
      category: "Omniframe",
      role: "Attacker / Physical",
      levelRank: "Rank SS - Level 80",
      winRate: 92.8,
      matches: 310,
      notes: "Greatsword & sword-formation physical armor shatter.",
      accentColor: "#E2E8F0",
      isFavorite: true,
    },
    {
      name: "Selena: Capriccio",
      category: "Omniframe",
      role: "Amplifier / Dark",
      levelRank: "Rank SSS - Level 80",
      winRate: 91.5,
      matches: 290,
      notes: "Harmonic dark symphony & team element boost.",
      accentColor: "#A855F7",
      isFavorite: true,
    },
    {
      name: "Alpha: Crimson Abyss",
      category: "Omniframe",
      role: "Attacker / Physical",
      levelRank: "Rank SSS - Level 80",
      winRate: 89.0,
      matches: 420,
      notes: "Sword wave bursts & classic Iaijutsu slash combo.",
      accentColor: "#EF4444",
      isFavorite: false,
    },
    {
      name: "Vera: Garnet",
      category: "Omniframe",
      role: "Tank / Lightning",
      levelRank: "Rank SS - Level 80",
      winRate: 88.5,
      matches: 240,
      notes: "Flagblade lightning pierce & resistance shred.",
      accentColor: "#FACC15",
      isFavorite: false,
    },
    {
      name: "Liv: Empyrea",
      category: "Omniframe",
      role: "Amplifier / Fire",
      levelRank: "Rank SS - Level 80",
      winRate: 93.2,
      matches: 330,
      notes: "Angelic fire domain, high healing & fire buffer.",
      accentColor: "#EF4444",
      isFavorite: true,
    },
  ];

  for (const c of characters) {
    const existingChar = await prisma.gameDossierCharacter.findFirst({
      where: {
        userId,
        gameId,
        name: c.name,
      },
    });

    if (!existingChar) {
      await prisma.gameDossierCharacter.create({
        data: {
          userId,
          gameId,
          name: c.name,
          category: c.category,
          role: c.role,
          levelRank: c.levelRank,
          winRate: c.winRate,
          matches: c.matches,
          notes: c.notes,
          accentColor: c.accentColor,
          isFavorite: c.isFavorite,
        },
      });
      console.log(`  ➕ Inserted character: ${c.name}`);
    } else {
      await prisma.gameDossierCharacter.update({
        where: { id: existingChar.id },
        data: {
          category: c.category,
          role: c.role,
          levelRank: c.levelRank,
          winRate: c.winRate,
          matches: c.matches,
          notes: c.notes,
          accentColor: c.accentColor,
          isFavorite: c.isFavorite,
        },
      });
      console.log(`  🔄 Updated character: ${c.name}`);
    }
  }

  // 3. Insert / Update External Resources
  const resources = [
    {
      name: "Official Website",
      url: "https://pgr.kurogame.net",
      icon: "🌐",
      category: "Official",
      description: "Official Kuro Games Announcements & News",
      enabled: true,
      sortOrder: 1,
    },
    {
      name: "Gray Ravens Wiki",
      url: "https://grayravens.com",
      icon: "📖",
      category: "Wiki",
      description: "Comprehensive Character Builds, Memories & Patch Info",
      enabled: true,
      sortOrder: 2,
    },
    {
      name: "Prydwen",
      url: "https://www.prydwen.gg/pgr/tier-list",
      icon: "🏆",
      category: "Tier List",
      description: "PGR Meta Constructs & Weapon Tier Ratings",
      enabled: true,
      sortOrder: 3,
    },
  ];

  for (const r of resources) {
    const existingRes = await prisma.gameExternalResource.findFirst({
      where: {
        userId,
        gameId,
        name: r.name,
      },
    });

    if (!existingRes) {
      await prisma.gameExternalResource.create({
        data: {
          userId,
          gameId,
          name: r.name,
          url: r.url,
          icon: r.icon,
          category: r.category,
          description: r.description,
          enabled: r.enabled,
          sortOrder: r.sortOrder,
        },
      });
      console.log(`  ➕ Inserted resource: ${r.name}`);
    } else {
      await prisma.gameExternalResource.update({
        where: { id: existingRes.id },
        data: {
          url: r.url,
          icon: r.icon,
          category: r.category,
          description: r.description,
          enabled: r.enabled,
          sortOrder: r.sortOrder,
        },
      });
      console.log(`  🔄 Updated resource: ${r.name}`);
    }
  }

  // 4. Insert / Update Showcase Items (Collection Vault)
  const showcaseItems = [
    {
      title: "Lucia: Crimson Weave — Nightblaze Signature Build",
      description: "Full Darwin + Heisen memory resonance setup with 6★ Nightblaze Odachi.",
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
      category: "Build / Stats",
      tags: ["Lucia", "Crimson Weave", "Lightning", "Build"],
      isFavorite: true,
    },
    {
      title: "Dark Team Symphony — Selena & Capriccio Domain",
      description: "SSS Selena Capriccio dark element amplifier combo.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      category: "Team / Squad",
      tags: ["Selena", "Dark", "Amplifier", "Squad"],
      isFavorite: true,
    },
  ];

  for (const s of showcaseItems) {
    const existingShowcase = await prisma.gameShowcaseItem.findFirst({
      where: {
        userId,
        gameId,
        title: s.title,
      },
    });

    if (!existingShowcase) {
      await prisma.gameShowcaseItem.create({
        data: {
          userId,
          gameId,
          title: s.title,
          description: s.description,
          imageUrl: s.imageUrl,
          category: s.category,
          tags: s.tags,
          isFavorite: s.isFavorite,
        },
      });
      console.log(`  ➕ Inserted showcase item: ${s.title}`);
    }
  }

  console.log("\n✅ PERMANENT DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  await prisma.$disconnect();
}

seedPgrForOwner().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
