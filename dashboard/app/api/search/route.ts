import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        links: [],
        notes: [],
        games: [],
        anime: [],
        dramas: [],
        characters: [],
        talent: [],
        gallery: [],
        songs: [],
        prompts: [],
        hobbies: [],
        profile: [],
      });
    }

    // Parallel queries across ALL application models and categories
    const [
      dbLinks,
      dbNotes,
      dbGames,
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
      // Bookmarks & Links (Comprehensive indexing for links, database links, categories)
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
      // Notepad Workspace & Notes
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      // Games HUD
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
      // Anime
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
      // Dramas
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
      // Favorite Characters
      prisma.favoriteCharacter.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { anime: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),
      // Hall of Fame
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
      // Gallery Items
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
      // Music Vault Songs
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
      // Saved AI Prompts
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
      // Hobby Skills
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
      // Profiles
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

    // Format & map results with matching types and direct navigation targets
    return NextResponse.json({
      links: dbLinks.map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: `Bookmark · Category: ${l.category} · URL: ${l.url}`,
        url: "/links",
      })),
      notes: dbNotes.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: `Notepad Workspace · ${n.content.slice(0, 60)}...`,
        url: "/notepad",
      })),
      games: dbGames.map((g) => ({
        id: g.id,
        title: g.game,
        subtitle: `Games HUD · Category: ${g.category} · Platform: ${g.platform} · Main: ${g.mainCharacter}`,
        url: "/games",
      })),
      anime: dbAnime.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: `Anime Zone · ${a.genre || "No Genre"} · ${a.episodesWatched}/${a.totalEpisodes} eps · ${a.status}`,
        url: "/anime",
      })),
      dramas: dbDramas.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: `Drama Hub · ${d.country.toUpperCase()} · ${d.genre} · ${d.episodesWatched}/${d.episodes} eps`,
        url: `/drama/${d.country}`,
      })),
      characters: dbCharacters.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `Favorite Character · Anime: ${c.anime}`,
        url: "/characters",
      })),
      talent: dbTalent.map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: `Hall of Fame · ${t.type.toUpperCase()} · Status: ${t.status} · ${t.nationality || "Global"}`,
        url: "/hall-of-fame",
      })),
      gallery: dbGallery.map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: `Media Gallery · Category: ${g.category} · Folder: ${g.folder}`,
        url: "/gallery",
      })),
      songs: dbSongs.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `Music Vault · Artist: ${s.artist} · Category: ${s.category}`,
        url: "/music",
      })),
      prompts: dbPrompts.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: `AI Prompt · Target AI: ${p.targetAI}`,
        url: "/notepad",
      })),
      hobbies: dbHobbies.map((h) => ({
        id: h.id,
        title: h.name,
        subtitle: `Hobby Skill · ${h.category} · Priority: ${h.priority}`,
        url: "/profile",
      })),
      profile: dbProfiles.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `User Profile · Location: ${p.location} · MBTI: ${p.mbti || "N/A"}`,
        url: "/profile",
      })),
    });
  } catch (error: any) {
    console.error("Central search endpoint error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
