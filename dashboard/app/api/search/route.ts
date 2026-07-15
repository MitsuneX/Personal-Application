import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        games: [],
        anime: [],
        dramas: [],
        characters: [],
        talent: [],
        profile: [],
      });
    }

    // Parallel queries across all collections
    const [dbGames, dbAnime, dbDramas, dbCharacters, dbTalent, dbProfiles] = await Promise.all([
      prisma.game.findMany({
        where: {
          OR: [
            { game: { contains: query, mode: "insensitive" } },
            { mainCharacter: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { handle: { contains: query, mode: "insensitive" } },
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
            { note: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            { nationality: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
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

    // Format & map results with matching types
    return NextResponse.json({
      games: dbGames.map((g) => ({
        id: g.id,
        title: g.game,
        subtitle: `${g.category} · Platform: ${g.platform} · Main: ${g.mainCharacter}`,
        url: "/games",
      })),
      anime: dbAnime.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: `${a.genre || "No Genre"} · ${a.episodesWatched}/${a.totalEpisodes} eps · ${a.status}`,
        url: "/anime",
      })),
      dramas: dbDramas.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: `${d.genre} (${d.country.toUpperCase()}) · ${d.episodesWatched}/${d.episodes} eps`,
        url: `/drama/${d.country}`,
      })),
      characters: dbCharacters.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `Anime: ${c.anime}`,
        url: "/characters",
      })),
      talent: dbTalent.map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: `${t.type.toUpperCase()} · status: ${t.status} · nationality: ${t.nationality || "N/A"}`,
        url: "/hall-of-fame",
      })),
      profile: dbProfiles.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `Profile Card Configuration · mbti: ${p.mbti || "N/A"} · zodiac: ${p.zodiac || "N/A"}`,
        url: "/profile",
      })),
    });
  } catch (error: any) {
    console.error("Central search endpoint error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
