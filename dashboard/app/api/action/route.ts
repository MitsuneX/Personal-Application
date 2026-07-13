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

      // ─── Hall Of Fame Actions ──────────────────────────────────────────────────
      case "UPDATE_HOF": {
        // If this entry is being set as champion, clear all other champions first
        if (payload.isChampion) {
          await prisma.hallOfFame.updateMany({
            where: { isChampion: true, NOT: { id: payload.id } },
            data: { isChampion: false },
          });
        }

        const hof = await prisma.hallOfFame.upsert({
          where: { id: payload.id },
          update: {
            name: payload.name,
            type: payload.type,
            status: payload.status,
            knownFor: payload.knownFor,
            nationality: payload.nationality ?? null,
            note: payload.note ?? null,
            imageUrl: payload.imageUrl ?? null,
            rank: payload.rank,
            isChampion: payload.isChampion ?? false,
          },
          create: {
            id: payload.id,
            name: payload.name,
            type: payload.type,
            status: payload.status,
            knownFor: payload.knownFor,
            nationality: payload.nationality || null,
            note: payload.note || null,
            imageUrl: payload.imageUrl || null,
            rank: payload.rank || 0,
            isChampion: payload.isChampion || false,
          },
        });
        return NextResponse.json({ success: true, data: hof });
      }

      case "DELETE_HOF": {
        await prisma.hallOfFame.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      // ─── Note Actions ──────────────────────────────────────────────────────────
      case "UPDATE_NOTE": {
        const note = await prisma.note.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            content: payload.content,
          },
          create: {
            id: payload.id,
            title: payload.title,
            content: payload.content,
          },
        });
        return NextResponse.json({ success: true, data: note });
      }

      case "DELETE_NOTE": {
        await prisma.note.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      // ─── Link Actions ──────────────────────────────────────────────────────────
      case "UPDATE_LINK": {
        const link = await prisma.link.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            url: payload.url,
            category: payload.category,
          },
          create: {
            id: payload.id,
            title: payload.title,
            url: payload.url,
            category: payload.category,
          },
        });
        return NextResponse.json({ success: true, data: link });
      }

      case "DELETE_LINK": {
        await prisma.link.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      // ─── Gallery Actions ───────────────────────────────────────────────────────
      case "ADD_GALLERY": {
        const item = await prisma.galleryItem.create({
          data: {
            id: payload.id,
            title: payload.title,
            url: payload.url,
          },
        });
        return NextResponse.json({ success: true, data: item });
      }

      case "DELETE_GALLERY": {
        await prisma.galleryItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      // ─── Music Actions ─────────────────────────────────────────────────────────
      case "UPDATE_SONG": {
        const song = await prisma.song.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            artist: payload.artist,
            album: payload.album ?? null,
            imageUrl: payload.imageUrl ?? null,
            category: payload.category,
            duration: payload.duration ?? null,
          },
          create: {
            id: payload.id,
            title: payload.title,
            artist: payload.artist,
            album: payload.album || null,
            imageUrl: payload.imageUrl || null,
            category: payload.category,
            duration: payload.duration || null,
          },
        });
        return NextResponse.json({ success: true, data: song });
      }

      case "DELETE_SONG": {
        await prisma.song.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
