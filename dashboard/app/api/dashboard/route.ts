import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbProfile = await prisma.profile.findUnique({ where: { id: "profile" } });
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
