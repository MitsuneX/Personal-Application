import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  GUEST_PROFILE,
  GUEST_AI_TOOLS,
  GUEST_SONGS,
  GUEST_DRAMAS,
  GUEST_ANIMES,
  GUEST_MOVIES,
  GUEST_GAMES,
  GUEST_GAME_CHARACTERS,
  GUEST_DOSSIER_CHARACTERS,
  GUEST_HALL_OF_FAME,
} from "@/lib/data/guestSeedData";
import { DEFAULT_AI_TOOLS } from "@/lib/data/initialAiTools";
import { DEFAULT_GAMES } from "@/lib/data/initialGames";
import { ensureInitialHallHistory } from "@/lib/utils/hofEventEngine";
import { repairCharacterDatabase } from "@/lib/services/characterCreationService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";

    // ── GUEST MODE DEMO RESPONSE ──────────────────────────────────────────────
    if (isGuestCookie || !user) {
      return NextResponse.json({
        isGuest: true,
        profile: GUEST_PROFILE,
        games: GUEST_GAMES,
        dossierCharacters: GUEST_DOSSIER_CHARACTERS,
        gameCharacters: GUEST_GAME_CHARACTERS,
        gameResources: [],
        gameShowcaseItems: [],
        projects: [],
        aiTools: GUEST_AI_TOOLS,
        animeList: GUEST_ANIMES,
        favoriteCharacters: [],
        dramas: GUEST_DRAMAS,
        hallOfFame: GUEST_HALL_OF_FAME,
        notes: [],
        links: [],
        gallery: [],
        songs: GUEST_SONGS,
        dramaLog: GUEST_MOVIES,
        savedPrompts: [],
        hobbySkills: [],
        hobbyLogs: [],
        profileHistory: [],
      });
    }

    const userId = user.id;

    // 1. Fetch Profile for authenticated user
    let dbProfile = await prisma.profile.findFirst({ where: { OR: [{ userId }, { id: userId }] } });

    if (!dbProfile) {
      const userMeta = user.user_metadata || {};
      dbProfile = await prisma.profile.create({
        data: {
          id: userId,
          userId: userId,
          name: userMeta.full_name || user.email?.split("@")[0] || "Command Operator",
          tagline: "Personal Command Center",
          bio: "Welcome to Nexus Xenon",
          status: "online",
          location: "Earth",
          skills: [],
          socials: [],
          avatar: userMeta.avatar_url || "/avatar.png",
          borderStyle: "default",
        },
      });
    }

    const safeQuery = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        console.warn("[Dashboard API] Query fallback:", err);
        return fallback;
      }
    };

    // 2. Fetch User-Scoped AI Tools
    let dbAiTools: any[] = await safeQuery(
      () => prisma.aiToolItem.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
      []
    );

    // Auto-seed AI tools for NEW registered user
    if (dbAiTools.length === 0) {
      try {
        console.log(`[AI Library] Seeding default AI collection for user ${userId}...`);
        for (const t of DEFAULT_AI_TOOLS) {
          await prisma.aiToolItem.create({
            data: {
              userId,
              name: t.name,
              company: t.company || null,
              description: t.description,
              logo: t.logo || null,
              accentColor: t.accentColor || "#10A37F",
              category: t.category || "💬 General AI",
              usageStatus: t.usageStatus || "Daily",
              pricingModel: t.pricingModel || "Freemium",
              rating: t.rating ?? 5,
              strengths: t.strengths || [],
              notes: t.notes || null,
              version: t.version || null,
              lastUsed: t.lastUsed ? new Date(t.lastUsed) : null,
              launchCount: t.launchCount || 0,
              launchUrl: t.launchUrl || null,
              websiteUrl: t.websiteUrl || null,
              docsUrl: t.docsUrl || null,
              apiUrl: t.apiUrl || null,
              pricingUrl: t.pricingUrl || null,
              githubUrl: (t as any).githubUrl || null,
              tags: t.tags || [],
              sortOrder: t.sortOrder || 0,
              isFavorite: t.isFavorite || false,
              isPinned: t.isPinned || false,
              isArchived: t.isArchived || false,
            },
          });
        }
        dbAiTools = await prisma.aiToolItem.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
      } catch (seedErr) {
        console.error("[AI Library] User auto-seed error:", seedErr);
      }
    }

    // 3. Fetch User-Scoped Games
    let dbGames: any[] = await safeQuery(
      () => prisma.game.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      []
    );

    // Auto-seed Games for NEW registered user
    if (dbGames.length === 0) {
      try {
        console.log(`[Games Library] Seeding default games for user ${userId}...`);
        for (const g of DEFAULT_GAMES) {
          await prisma.game.create({
            data: {
              userId,
              game: g.game,
              handle: g.handle || null,
              platform: g.platform,
              rank: g.rank || null,
              mainCharacter: g.mainCharacter,
              mainRole: g.mainRole || null,
              category: g.category,
              isActive: g.isActive !== undefined ? g.isActive : true,
              accentColor: g.accentColor,
              profileLink: g.profileLink || null,
              icon: g.icon || null,
              screenshot: null,
            },
          });
        }
        dbGames = await prisma.game.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
      } catch (gameSeedErr) {
        console.error("[Games Library] User auto-seed error:", gameSeedErr);
      }
    }

    // 4. Fetch all other User-Scoped entities in parallel
    const [
      dbDossierCharacters,
      dbGameResources,
      dbGameShowcaseItems,
      dbProjects,
      dbAnime,
      dbCharacters,
      dbDramas,
      dbHOF,
      dbNotes,
      dbLinks,
      dbGallery,
      dbSongs,
      dbPlaylists,
      dbCollections,
      dbDramaLog,
      dbPrompts,
      dbHobbySkills,
      dbHobbyLogs,
      dbProfileHistory,
      dbHallEvents,
      dbChampionshipHistory,
      dbHallRankingSnapshots,
      dbHobbySessions,
      dbNotifications,
      dbGameCharacters,
    ] = await Promise.all([
      safeQuery(() => prisma.gameDossierCharacter.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.gameExternalResource.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }), []),
      safeQuery(() => prisma.gameShowcaseItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.projectItem.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }), []),
      safeQuery(() => prisma.anime.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.favoriteCharacter.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.drama.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.hallOfFame.findMany({ where: { userId }, orderBy: { rank: "asc" } }), []),
      safeQuery(() => prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }), []),
      safeQuery(() => prisma.link.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.galleryItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.song.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.playlist.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.musicCollection.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.dramaLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.savedPrompt.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.hobbySkill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.hobbyLog.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }), []),
      safeQuery(() => prisma.profileHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }), []),
      safeQuery(() => prisma.hallEvent.findMany({ where: { userId }, orderBy: { timestamp: "desc" }, take: 50 }), []),
      safeQuery(() => prisma.championshipHistory.findMany({ where: { userId }, orderBy: { startDate: "desc" } }), []),
      safeQuery(() => prisma.hallRankingSnapshot.findMany({ where: { userId }, orderBy: { timestamp: "desc" } }), []),
      safeQuery(() => prisma.hobbySession.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }), []),
      safeQuery(() => prisma.notification.findMany({ where: { userId, isDismissed: false }, orderBy: { createdAt: "desc" }, take: 20 }), []),
      safeQuery(() => prisma.gameCharacter.findMany({ where: { userId }, orderBy: { rank: "asc" } }), []),
    ]);

    // Ensure initial event history & baseline championship records exist for existing HOF items
    if (dbHOF.length > 0 && dbHallEvents.length === 0) {
      await ensureInitialHallHistory(prisma, userId, dbHOF);
    }

    // Auto-repair missing Character Collection links or pending games in background
    repairCharacterDatabase(userId).catch((err) =>
      console.error("Auto-repair character database error:", err)
    );

    return NextResponse.json({
      isGuest: false,
      profile: dbProfile,
      games: dbGames,
      dossierCharacters: dbDossierCharacters,
      gameCharacters: dbGameCharacters,
      gameResources: dbGameResources,
      gameShowcaseItems: dbGameShowcaseItems,
      projects: dbProjects,
      aiTools: dbAiTools,
      animeList: dbAnime,
      favoriteCharacters: dbCharacters,
      dramas: dbDramas,
      hallOfFame: dbHOF,
      hallEvents: dbHallEvents,
      championshipHistory: dbChampionshipHistory,
      hallRankingSnapshots: dbHallRankingSnapshots,
      notes: dbNotes,
      links: dbLinks,
      gallery: dbGallery,
      songs: dbSongs,
      playlists: dbPlaylists,
      collections: dbCollections,
      dramaLog: dbDramaLog,
      savedPrompts: dbPrompts,
      hobbySkills: dbHobbySkills,
      hobbyLogs: dbHobbyLogs,
      hobbySessions: dbHobbySessions,
      notifications: dbNotifications,
      profileHistory: dbProfileHistory,
    });
  } catch (error: any) {
    console.error("API GET Dashboard Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
