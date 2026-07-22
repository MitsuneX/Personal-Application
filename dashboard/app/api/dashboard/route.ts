import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    let dbProfile = null;

    // 1. Check if profile exists for this authenticated user ID
    if (user?.id) {
      dbProfile = await prisma.profile.findUnique({ where: { id: user.id } });
    }

    // 2. If no profile exists for this user yet
    if (!dbProfile && user) {
      const userMeta = user.user_metadata || {};
      const mainProfile = await prisma.profile.findUnique({ where: { id: "profile" } });
      const isNelvin = user.email?.toLowerCase().includes("nelvin") || userMeta.full_name?.toLowerCase().includes("nelvin");

      if (isNelvin && mainProfile) {
        // Copy main Nelvin profile onto user session record
        const { id, updatedAt, ...rest } = mainProfile;
        dbProfile = await prisma.profile.create({
          data: {
            id: user.id,
            ...(rest as any),
          },
        });
      } else {
        // Clean isolated default profile for any NEW account (zero data contamination)
        dbProfile = await prisma.profile.create({
          data: {
            id: user.id,
            name: userMeta.full_name || user.email?.split("@")[0] || "New User",
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
    }

    // 3. Fallback to main profile ("profile") if unauthenticated
    if (!dbProfile) {
      dbProfile = await prisma.profile.findUnique({ where: { id: "profile" } });
    }

    const dbGames = await prisma.game.findMany({ orderBy: { createdAt: "asc" } });
    const dbAnime = await prisma.anime.findMany({ orderBy: { createdAt: "asc" } });
    const dbCharacters = await prisma.favoriteCharacter.findMany({ orderBy: { createdAt: "asc" } });
    const dbDramas = await prisma.drama.findMany({ orderBy: { createdAt: "asc" } });
    const dbHOF = await prisma.hallOfFame.findMany({ orderBy: { rank: "asc" } });
    const dbNotes = await prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
    const dbLinks = await prisma.link.findMany({ orderBy: { createdAt: "desc" } });
    const dbGallery = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
    const dbSongs = await prisma.song.findMany({ orderBy: { createdAt: "desc" } });
    const dbDramaLog = await prisma.dramaLog.findMany({ orderBy: { createdAt: "desc" } });
    const dbPrompts = await prisma.savedPrompt.findMany({ orderBy: { createdAt: "desc" } });
    const dbHobbySkills = await prisma.hobbySkill.findMany({ orderBy: { createdAt: "asc" } });
    const dbHobbyLogs = await prisma.hobbyLog.findMany({ orderBy: { createdAt: "asc" } });
    const dbProfileHistory = await prisma.profileHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      profile: dbProfile,
      games: dbGames,
      animeList: dbAnime,
      favoriteCharacters: dbCharacters,
      dramas: dbDramas,
      hallOfFame: dbHOF,
      notes: dbNotes,
      links: dbLinks,
      gallery: dbGallery,
      songs: dbSongs,
      dramaLog: dbDramaLog,
      savedPrompts: dbPrompts,
      hobbySkills: dbHobbySkills,
      hobbyLogs: dbHobbyLogs,
      profileHistory: dbProfileHistory,
    });
  } catch (error: any) {
    console.error("API GET Dashboard Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
