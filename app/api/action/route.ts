import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case "UPDATE_GAME": {
        const game = await prisma.game.upsert({
          where: { id: payload.id },
          update: {
            game: payload.game,
            handle: payload.handle,
            platform: payload.platform,
            rank: payload.rank,
            mainCharacter: payload.mainCharacter,
            mainRole: payload.mainRole,
            category: payload.category,
            isActive: payload.isActive,
            accentColor: payload.accentColor,
          },
          create: {
            id: payload.id,
            game: payload.game,
            handle: payload.handle || null,
            platform: payload.platform,
            rank: payload.rank || null,
            mainCharacter: payload.mainCharacter,
            mainRole: payload.mainRole || null,
            category: payload.category,
            isActive: payload.isActive !== undefined ? payload.isActive : true,
            accentColor: payload.accentColor,
          },
        });
        return NextResponse.json({ success: true, data: game });
      }

      case "UPDATE_ANIME": {
        const anime = await prisma.anime.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            episodesWatched: payload.episodesWatched,
            totalEpisodes: payload.totalEpisodes,
            status: payload.status,
            rating: payload.rating,
            genre: payload.genre,
            studio: payload.studio,
            year: payload.year,
          },
          create: {
            id: payload.id,
            title: payload.title,
            episodesWatched: payload.episodesWatched,
            totalEpisodes: payload.totalEpisodes,
            status: payload.status,
            rating: payload.rating || null,
            genre: payload.genre || null,
            studio: payload.studio || null,
            year: payload.year || null,
          },
        });
        return NextResponse.json({ success: true, data: anime });
      }

      case "UPDATE_DRAMA": {
        const drama = await prisma.drama.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            country: payload.country,
            episodes: payload.episodes,
            episodesWatched: payload.episodesWatched,
            status: payload.status,
            rating: payload.rating,
            genre: payload.genre,
            year: payload.year,
            platform: payload.platform,
            cast: payload.cast,
          },
          create: {
            id: payload.id,
            title: payload.title,
            country: payload.country,
            episodes: payload.episodes,
            episodesWatched: payload.episodesWatched,
            status: payload.status,
            rating: payload.rating,
            genre: payload.genre,
            year: payload.year,
            platform: payload.platform || null,
            cast: payload.cast || [],
          },
        });
        return NextResponse.json({ success: true, data: drama });
      }

      case "TOGGLE_CHARACTER": {
        const char = await prisma.favoriteCharacter.update({
          where: { id: payload.id },
          data: { isFavorite: payload.isFavorite },
        });
        return NextResponse.json({ success: true, data: char });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
