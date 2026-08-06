import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { searchAllRegistries } from "@/lib/search/searchRegistry";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({});
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";
    const userId = user?.id;

    if (isGuestCookie || !userId) {
      return NextResponse.json(
        searchAllRegistries(query, {
          links: [],
          notes: [],
          games: [],
          dossierCharacters: [],
          gameShowcaseItems: [],
          projects: [],
          aiTools: [],
          animeList: [],
          dramas: [],
          favoriteCharacters: [],
          hallOfFame: [],
          gallery: [],
          songs: [],
          savedPrompts: [],
          hobbies: [],
          profiles: [],
        })
      );
    }

    // Query user-scoped databases in parallel
    const [
      dbLinks,
      dbNotes,
      dbGames,
      dbDossierCharacters,
      dbGameShowcaseItems,
      dbProjects,
      dbAiTools,
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
          userId,
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
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.game.findMany({
        where: {
          userId,
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
          userId,
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
          userId,
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
          userId,
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
      prisma.aiToolItem.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { pricingModel: { contains: query, mode: "insensitive" } },
            { version: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.anime.findMany({
        where: {
          userId,
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
          userId,
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
          userId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { anime: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      prisma.hallOfFame.findMany({
        where: {
          userId,
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
          userId,
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
          userId,
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
          userId,
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
          userId,
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
          OR: [{ userId }, { id: userId }],
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
      aiTools: dbAiTools,
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

