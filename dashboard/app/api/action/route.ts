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

        const resolvedRank = (payload.rank === null || payload.rank === undefined || payload.rank === "") 
          ? null 
          : Number(payload.rank);

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
            rank: resolvedRank,
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
            rank: resolvedRank,
            isChampion: payload.isChampion || false,
          },
        });
        return NextResponse.json({ success: true, data: hof });
      }

      case "LIKE_HOF": {
        const entry = await prisma.hallOfFame.update({
          where: { id: payload.id },
          data: { likes: { increment: 1 } },
        });
        return NextResponse.json({ success: true, data: entry });
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
            hobbyId: payload.hobbyId ?? null,
            isCuriosity: payload.isCuriosity ?? false,
          },
          create: {
            id: payload.id,
            title: payload.title,
            content: payload.content,
            hobbyId: payload.hobbyId ?? null,
            isCuriosity: payload.isCuriosity ?? false,
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
            caption: payload.caption ?? null,
            tags: payload.tags ?? [],
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

      case "SAVE_DRAMA_LOG": {
        const entry = await prisma.dramaLog.upsert({
          where: { id: payload.id ?? "___new___" },
          update: {
            title: payload.title,
            type: payload.type,
            releaseYear: payload.releaseYear ?? null,
            plotSummary: payload.plotSummary ?? null,
            posterUrl: payload.posterUrl ?? null,
            mainActors: payload.mainActors ?? [],
            statusBadge: payload.statusBadge ?? "All-Star",
            omdbId: payload.omdbId ?? null,
            country: payload.country ?? null,
            rating: payload.rating ?? null,
          },
          create: {
            id: payload.id,
            title: payload.title,
            type: payload.type,
            releaseYear: payload.releaseYear ?? null,
            plotSummary: payload.plotSummary ?? null,
            posterUrl: payload.posterUrl ?? null,
            mainActors: payload.mainActors ?? [],
            statusBadge: payload.statusBadge ?? "All-Star",
            omdbId: payload.omdbId ?? null,
            country: payload.country ?? null,
            rating: payload.rating ?? null,
          },
        });
        return NextResponse.json({ success: true, data: entry });
      }

      case "DELETE_ANIME": {
        await prisma.anime.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "DELETE_DRAMA_LOG": {
        await prisma.dramaLog.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_PROMPT": {
        const entry = await prisma.savedPrompt.upsert({
          where: { id: payload.id },
          update: {
            title: payload.title,
            targetAI: payload.targetAI,
            promptText: payload.promptText,
          },
          create: {
            id: payload.id,
            title: payload.title,
            targetAI: payload.targetAI,
            promptText: payload.promptText,
          },
        });
        return NextResponse.json({ success: true, data: entry });
      }

      case "DELETE_PROMPT": {
        await prisma.savedPrompt.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      // ─── Hobby Actions ─────────────────────────────────────────────────────────
      case "SEED_HOBBIES": {
        const existing = await prisma.hobbySkill.count();
        if (existing === 0) {
          const seeds = [
            { name: "Chinese",          category: "Languages",   priority: "Priority" },
            { name: "English",          category: "Languages",   priority: "Priority" },
            { name: "Japanese",         category: "Languages",   priority: "Haven't Started" },
            { name: "Korean",           category: "Languages",   priority: "Haven't Started" },
            { name: "German",           category: "Languages",   priority: "Manifest" },
            { name: "Russian",          category: "Languages",   priority: "Manifest" },
            { name: "Spanish",          category: "Languages",   priority: "Manifest" },
            { name: "Neuroscience",     category: "Doctors",     priority: "Priority" },
            { name: "Patofisiologi",    category: "Doctors",     priority: "Priority" },
            { name: "MMA",              category: "Martial Arts", priority: "Priority" },
            { name: "Judo",             category: "Martial Arts", priority: "Manifest" },
            { name: "Taekwondo",        category: "Martial Arts", priority: "Manifest" },
            { name: "Karate",           category: "Martial Arts", priority: "Manifest" },
            { name: "Silat",            category: "Martial Arts", priority: "Priority" },
          ];
          await prisma.hobbySkill.createMany({ data: seeds });
        }
        const skills = await prisma.hobbySkill.findMany({ orderBy: { createdAt: "asc" } });
        return NextResponse.json({ success: true, data: skills });
      }

      case "LOG_HOBBY_XP": {
        // XP formula: +0.1% baseline + +0.001% per word
        const words = payload.wordCount ?? 0;
        const delta = 0.1 + words * 0.001;

        // Create log entry
        await prisma.hobbyLog.create({
          data: {
            skillId: payload.skillId,
            delta,
            wordCount: words,
            note: payload.note ?? null,
          },
        });

        // Sum all deltas for this skill and cap at 100
        const aggResult = await prisma.hobbyLog.aggregate({
          where: { skillId: payload.skillId },
          _sum: { delta: true },
        });
        const totalProgress = Math.min(100, aggResult._sum.delta ?? 0);

        // Update skill progress
        const updated = await prisma.hobbySkill.update({
          where: { id: payload.skillId },
          data: { progress: totalProgress },
        });
        return NextResponse.json({ success: true, data: updated, delta });
      }

      case "FETCH_HOBBY_DATA": {
        const skills = await prisma.hobbySkill.findMany({ orderBy: { category: "asc" } });
        const logs = await prisma.hobbyLog.findMany({
          orderBy: { createdAt: "asc" },
          select: { id: true, skillId: true, delta: true, wordCount: true, note: true, createdAt: true },
        });
        return NextResponse.json({ success: true, skills, logs });
      }


      // ─── Profile Aesthetics Actions ───────────────────────────────────────────
      case "SAVE_AESTHETIC": {
        // Fetch existing profile to compare and log history
        const existing = await prisma.profile.findUnique({ where: { id: "profile" } });

        if (existing) {
          // Push old avatar to history if it's changing
          if (payload.avatar !== undefined && payload.avatar !== existing.avatar && existing.avatar) {
            await prisma.profileHistory.create({
              data: { assetType: "avatar", url: existing.avatar },
            });
          }
          // Push old banner to history if it's changing
          if (payload.banner !== undefined && payload.banner !== existing.banner && existing.banner) {
            await prisma.profileHistory.create({
              data: { assetType: "banner", url: existing.banner },
            });
          }
          // Push old nameplate to history if it's changing
          if (payload.nameplate !== undefined && payload.nameplate !== existing.nameplate && existing.nameplate) {
            await prisma.profileHistory.create({
              data: { assetType: "nameplate", url: existing.nameplate },
            });
          }
        }

        const updatedProfile = await prisma.profile.update({
          where: { id: "profile" },
          data: {
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.customTag !== undefined && { customTag: payload.customTag }),
            ...(payload.bio !== undefined && { bio: payload.bio }),
            ...(payload.avatar !== undefined && { avatar: payload.avatar }),
            ...(payload.banner !== undefined && { banner: payload.banner }),
            ...(payload.nameplate !== undefined && { nameplate: payload.nameplate }),
            ...(payload.borderStyle !== undefined && { borderStyle: payload.borderStyle }),
          },
        });

        // Return updated profile + fresh history (last 10)
        const history = await prisma.profileHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        return NextResponse.json({ success: true, data: updatedProfile, history });
      }

      case "GET_PROFILE_HISTORY": {
        const history = await prisma.profileHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        return NextResponse.json({ success: true, data: history });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
