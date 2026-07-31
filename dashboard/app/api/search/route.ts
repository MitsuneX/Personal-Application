import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { searchAllRegistries } from "@/lib/search/searchRegistry";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({});
    }

    // Query databases in parallel
    const [
      dbLinks,
      dbNotes,
      dbGames,
      dbDossierCharacters,
      dbGameShowcaseItems,
      dbProjects,
      dbAnime,
      dbDramas,
      dbCharacters,
      dbTalent,
      dbGallery,
      dbSongs,
      dbPrompts,
      dbHobbies,
      dbProfiles,
    ] = await Promise.all([
      prisma.link.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.game.findMany({
        where: {
          OR: [
            { game: { contains: query, mode: "insensitive" } },
            { mainCharacter: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { handle: { contains: query, mode: "insensitive" } },
            { platform: { contains: query, mode: "insensitive" } },
            { rank: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.gameDossierCharacter.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.gameShowcaseItem.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.projectItem.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            { version: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genre: { contains: query, mode: "insensitive" } },
            { studio: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.drama.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genre: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
            { platform: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.favoriteCharacter.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { anime: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.hallOfFame.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tokusatsuShow: { contains: query, mode: "insensitive" } },
            { tokusatsuFranchise: { contains: query, mode: "insensitive" } },
            { note: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            { nationality: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.galleryItem.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { caption: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { folder: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { artist: { contains: query, mode: "insensitive" } },
            { album: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { lyrics: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.savedPrompt.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { targetAI: { contains: query, mode: "insensitive" } },
            { promptText: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
      prisma.hobbySkill.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { priority: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
      prisma.profile.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tagline: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { mbti: { contains: query, mode: "insensitive" } },
            { zodiac: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
    ]);

    const rawData = {
      links: dbLinks,
      notes: dbNotes,
      games: dbGames,
      dossierCharacters: dbDossierCharacters,
      gameShowcaseItems: dbGameShowcaseItems,
      projects: dbProjects,
      animeList: dbAnime,
      dramas: dbDramas,
      favoriteCharacters: dbCharacters,
      hallOfFame: dbTalent,
      gallery: dbGallery,
      songs: dbSongs,
      savedPrompts: dbPrompts,
      hobbies: dbHobbies,
      profiles: dbProfiles,
    };

    const results = searchAllRegistries(query, rawData);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Central search endpoint error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
