import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { processCharacterCreation } from "@/lib/services/characterCreationService";
import { logHallEvent, captureHallRankingSnapshots, updateChampionshipHistoryOnRankChange } from "@/lib/utils/hofEventEngine";
import { calculateWritingXp, calculateSessionXp, getLevelDetailsFromXp } from "@/lib/utils/hobbyProgression";
import { mergeCharacterDictionaryMediaIntoGallery } from "@/lib/utils/mediaResolver";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuestCookie = cookieStore.get("is_guest")?.value === "true";

    const { action, payload } = await req.json();

    // ── GUEST MODE SHORT-CIRCUIT ──────────────────────────────────────────────
    // Guest modifications exist strictly in memory / client state. Never touch DB.
    if (isGuestCookie || !user) {
      return NextResponse.json({ success: true, isGuest: true, data: payload });
    }

    const userId = user.id;

    switch (action) {
      case "UPDATE_GAME": {
        const game = await prisma.game.upsert({
          where: { id: payload.id },
          update: {
            userId,
            game: payload.game,
            handle: payload.handle,
            platform: payload.platform,
            rank: payload.rank,
            mainCharacter: payload.mainCharacter,
            mainRole: payload.mainRole,
            category: payload.category,
            isActive: payload.isActive,
            accentColor: payload.accentColor,
            profileLink: payload.profileLink ?? null,
            icon: payload.icon ?? null,
            screenshot: payload.screenshot ?? null,
          },
          create: {
            id: payload.id,
            userId,
            game: payload.game,
            handle: payload.handle || null,
            platform: payload.platform,
            rank: payload.rank || null,
            mainCharacter: payload.mainCharacter,
            mainRole: payload.mainRole || null,
            category: payload.category,
            isActive: payload.isActive !== undefined ? payload.isActive : true,
            accentColor: payload.accentColor,
            profileLink: payload.profileLink || null,
            icon: payload.icon || null,
            screenshot: payload.screenshot || null,
          },
        });
        return NextResponse.json({ success: true, data: game });
      }

      case "DELETE_GAME": {
        await prisma.game.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_DOSSIER_CHARACTER": {
        const result = await processCharacterCreation({
          ...payload,
          userId,
          createDossierOnly: true,
          isFavorite: false,
        });
        return NextResponse.json({
          success: true,
          data: result.dossierCharacter,
          dossierCharacter: result.dossierCharacter,
        });
      }

      case "DELETE_DOSSIER_CHARACTER": {
        await prisma.gameDossierCharacter.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_GAME_CHARACTER": {
        const result = await processCharacterCreation({
          ...payload,
          userId,
          createFavorite: true,
          isFavorite: true,
        });
        return NextResponse.json({
          success: true,
          data: result.gameCharacter || result.dossierCharacter,
          dossierCharacter: result.dossierCharacter,
        });
      }

      case "DELETE_GAME_CHARACTER": {
        const record = await prisma.gameCharacter.findUnique({ where: { id: payload.id } });
        if (record) {
          const mediaReferences = {
            cardImage: record.cardImage,
            avatarUrl: record.avatarUrl,
            splashArt: record.splashArt,
            gallery: record.stats && (record.stats as any).gallery ? (record.stats as any).gallery : [],
          };
          const historyEntry = await prisma.softDeleteHistory.create({
            data: {
              userId: userId || record.userId || null,
              entityType: "GAME_CHARACTER",
              originalRecordId: record.id,
              name: record.name,
              category: record.gameName || "Game Character",
              snapshot: record as any,
              mediaReferences,
            },
          });
          if (historyEntry && historyEntry.id) {
            await prisma.gameCharacter.delete({ where: { id: payload.id } });
          }
        }
        return NextResponse.json({ success: true });
      }

      case "UPDATE_GAME_RESOURCE": {
        const item = await prisma.gameExternalResource.upsert({
          where: { id: payload.id },
          update: {
            userId,
            gameId: payload.gameId,
            name: payload.name,
            url: payload.url,
            icon: payload.icon ?? null,
            category: payload.category ?? null,
            description: payload.description ?? null,
            enabled: payload.enabled ?? true,
            sortOrder: payload.sortOrder ?? 0,
          },
          create: {
            id: payload.id,
            userId,
            gameId: payload.gameId,
            name: payload.name,
            url: payload.url,
            icon: payload.icon || null,
            category: payload.category || null,
            description: payload.description || null,
            enabled: payload.enabled ?? true,
            sortOrder: payload.sortOrder || 0,
          },
        });
        return NextResponse.json({ success: true, data: item });
      }

      case "DELETE_GAME_RESOURCE": {
        await prisma.gameExternalResource.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_GAME_SHOWCASE_ITEM": {
        const item = await prisma.gameShowcaseItem.upsert({
          where: { id: payload.id },
          update: {
            userId,
            gameId: payload.gameId,
            title: payload.title,
            description: payload.description ?? null,
            imageUrl: payload.imageUrl,
            category: payload.category ?? null,
            tags: payload.tags ?? [],
            isFavorite: payload.isFavorite ?? false,
          },
          create: {
            id: payload.id,
            userId,
            gameId: payload.gameId,
            title: payload.title,
            description: payload.description || null,
            imageUrl: payload.imageUrl,
            category: payload.category || null,
            tags: payload.tags || [],
            isFavorite: payload.isFavorite || false,
          },
        });
        return NextResponse.json({ success: true, data: item });
      }

      case "DELETE_GAME_SHOWCASE_ITEM": {
        await prisma.gameShowcaseItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_PROJECT": {
        const project = await prisma.projectItem.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            logo: payload.logo ?? null,
            heroBanner: payload.heroBanner ?? null,
            description: payload.description,
            category: payload.category,
            status: payload.status ?? "Live",
            version: payload.version ?? "v1.0.0",
            accentColor: payload.accentColor ?? "#00F5FF",
            websiteUrl: payload.websiteUrl ?? null,
            githubUrl: payload.githubUrl ?? null,
            docsUrl: payload.docsUrl ?? null,
            figmaUrl: payload.figmaUrl ?? null,
            apiDocsUrl: payload.apiDocsUrl ?? null,
            adminUrl: payload.adminUrl ?? null,
            stagingUrl: payload.stagingUrl ?? null,
            downloadUrl: payload.downloadUrl ?? null,
            techStack: payload.techStack ?? [],
            tags: payload.tags ?? [],
            sortOrder: payload.sortOrder ?? 0,
            isFeatured: payload.isFeatured ?? false,
            isArchived: payload.isArchived ?? false,
            stats: payload.stats ?? null,
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            logo: payload.logo || null,
            heroBanner: payload.heroBanner || null,
            description: payload.description,
            category: payload.category,
            status: payload.status || "Live",
            version: payload.version || "v1.0.0",
            accentColor: payload.accentColor || "#00F5FF",
            websiteUrl: payload.websiteUrl || null,
            githubUrl: payload.githubUrl || null,
            docsUrl: payload.docsUrl || null,
            figmaUrl: payload.figmaUrl || null,
            apiDocsUrl: payload.apiDocsUrl || null,
            adminUrl: payload.adminUrl || null,
            stagingUrl: payload.stagingUrl || null,
            downloadUrl: payload.downloadUrl || null,
            techStack: payload.techStack || [],
            tags: payload.tags || [],
            sortOrder: payload.sortOrder || 0,
            isFeatured: payload.isFeatured || false,
            isArchived: payload.isArchived || false,
            stats: payload.stats || null,
          },
        });
        return NextResponse.json({ success: true, data: project });
      }

      case "DELETE_PROJECT": {
        await prisma.projectItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_AI_TOOL": {
        const lastUsedDate = payload.lastUsed && !isNaN(new Date(payload.lastUsed).getTime())
          ? new Date(payload.lastUsed)
          : null;

        const item = await prisma.aiToolItem.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            company: payload.company ?? null,
            description: payload.description,
            logo: payload.logo ?? null,
            accentColor: payload.accentColor ?? "#10A37F",
            category: payload.category ?? "💬 General AI",
            usageStatus: payload.usageStatus ?? "Daily",
            pricingModel: payload.pricingModel ?? "Freemium",
            rating: payload.rating ?? 5,
            strengths: payload.strengths ?? [],
            notes: payload.notes ?? null,
            version: payload.version ?? null,
            lastUsed: lastUsedDate ?? undefined,
            launchCount: payload.launchCount ?? undefined,
            launchUrl: payload.launchUrl ?? null,
            websiteUrl: payload.websiteUrl ?? null,
            docsUrl: payload.docsUrl ?? null,
            apiUrl: payload.apiUrl ?? null,
            pricingUrl: payload.pricingUrl ?? null,
            githubUrl: payload.githubUrl ?? null,
            discordUrl: payload.discordUrl ?? null,
            communityUrl: payload.communityUrl ?? null,
            releaseNotesUrl: payload.releaseNotesUrl ?? null,
            blogUrl: payload.blogUrl ?? null,
            roadmapUrl: payload.roadmapUrl ?? null,
            youtubeUrl: payload.youtubeUrl ?? null,
            tags: payload.tags ?? [],
            sortOrder: payload.sortOrder ?? 0,
            isFavorite: payload.isFavorite ?? false,
            isPinned: payload.isPinned ?? false,
            isArchived: payload.isArchived ?? false,
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            company: payload.company || null,
            description: payload.description,
            logo: payload.logo || null,
            accentColor: payload.accentColor || "#10A37F",
            category: payload.category || "💬 General AI",
            usageStatus: payload.usageStatus || "Daily",
            pricingModel: payload.pricingModel || "Freemium",
            rating: payload.rating ?? 5,
            strengths: payload.strengths || [],
            notes: payload.notes || null,
            version: payload.version || null,
            lastUsed: lastUsedDate,
            launchCount: payload.launchCount || 0,
            launchUrl: payload.launchUrl || null,
            websiteUrl: payload.websiteUrl || null,
            docsUrl: payload.docsUrl || null,
            apiUrl: payload.apiUrl || null,
            pricingUrl: payload.pricingUrl || null,
            githubUrl: payload.githubUrl || null,
            discordUrl: payload.discordUrl || null,
            communityUrl: payload.communityUrl || null,
            releaseNotesUrl: payload.releaseNotesUrl || null,
            blogUrl: payload.blogUrl || null,
            roadmapUrl: payload.roadmapUrl || null,
            youtubeUrl: payload.youtubeUrl || null,
            tags: payload.tags || [],
            sortOrder: payload.sortOrder || 0,
            isFavorite: payload.isFavorite || false,
            isPinned: payload.isPinned || false,
            isArchived: payload.isArchived || false,
          },
        });
        return NextResponse.json({ success: true, data: item });
      }

      case "RECORD_AI_TOOL_LAUNCH": {
        const item = await prisma.aiToolItem.update({
          where: { id: payload.id },
          data: {
            lastUsed: new Date(),
            launchCount: { increment: 1 },
          },
        });
        return NextResponse.json({ success: true, data: item });
      }

      case "DELETE_AI_TOOL": {
        await prisma.aiToolItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_ANIME": {
        const anime = await prisma.anime.upsert({
          where: { id: payload.id },
          update: {
            userId,
            title: payload.title,
            episodesWatched: payload.episodesWatched,
            totalEpisodes: payload.totalEpisodes,
            status: payload.status,
            rating: payload.rating,
            genre: payload.genre,
            studio: payload.studio,
            year: payload.year,
            posterUrl: payload.posterUrl,
            synopsis: payload.synopsis,
            cast: payload.cast,
          },
          create: {
            id: payload.id,
            userId,
            title: payload.title,
            episodesWatched: payload.episodesWatched,
            totalEpisodes: payload.totalEpisodes,
            status: payload.status,
            rating: payload.rating || null,
            genre: payload.genre || null,
            studio: payload.studio || null,
            year: payload.year || null,
            posterUrl: payload.posterUrl || null,
            synopsis: payload.synopsis || null,
            cast: payload.cast || [],
          },
        });
        return NextResponse.json({ success: true, data: anime });
      }

      case "UPDATE_DRAMA": {
        const drama = await prisma.drama.upsert({
          where: { id: payload.id },
          update: {
            userId,
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
            userId,
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

      case "SAVE_CHARACTER": {
        const char = await prisma.favoriteCharacter.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            anime: payload.anime,
            isFavorite: payload.isFavorite ?? true,
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            anime: payload.anime,
            isFavorite: payload.isFavorite ?? true,
          },
        });
        return NextResponse.json({ success: true, data: char });
      }

      case "DELETE_CHARACTER": {
        await prisma.favoriteCharacter.delete({
          where: { id: payload.id },
        });
        return NextResponse.json({ success: true });
      }

      // ─── Hall Of Fame Actions ──────────────────────────────────────────────────
      case "UPDATE_HOF": {
        // Find existing record to detect changes
        const existing = await prisma.hallOfFame.findUnique({ where: { id: payload.id } });

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

        const existingGallery = payload.gallery !== undefined ? payload.gallery : (existing?.gallery || []);
        const avatarCandidate = payload.avatarUrl || payload.details?.avatarUrl || (existing?.details as any)?.avatarUrl;
        const resolvedGallery = mergeCharacterDictionaryMediaIntoGallery(existingGallery, {
          imageUrl: payload.imageUrl !== undefined ? payload.imageUrl : existing?.imageUrl,
          portraitUrl: payload.portraitUrl !== undefined ? payload.portraitUrl : existing?.portraitUrl,
          avatarUrl: avatarCandidate,
          splashArt: payload.splashArt !== undefined ? payload.splashArt : existing?.splashArt,
        });

        const hof = await prisma.hallOfFame.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            type: payload.type,
            status: payload.status,
            knownFor: payload.knownFor,
            nationality: payload.nationality ?? null,
            singerType: payload.singerType ?? null,
            note: payload.note ?? null,
            imageUrl: payload.imageUrl ?? null,
            rank: resolvedRank,
            isChampion: payload.isChampion ?? false,
            tokusatsuFranchise: payload.tokusatsuFranchise ?? null,
            tokusatsuShow: payload.tokusatsuShow ?? null,
            associatedDramas: payload.associatedDramas ?? [],
            details: payload.details ?? null,
            gallery: resolvedGallery,
            splashArt: payload.splashArt ?? null,
            portraitUrl: payload.portraitUrl ?? null,
            accentColor: payload.accentColor ?? null,
            gameCharacterId: payload.gameCharacterId ?? null,
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            type: payload.type,
            status: payload.status,
            knownFor: payload.knownFor,
            nationality: payload.nationality || null,
            singerType: payload.singerType || null,
            note: payload.note || null,
            imageUrl: payload.imageUrl || null,
            rank: resolvedRank,
            isChampion: payload.isChampion || false,
            tokusatsuFranchise: payload.tokusatsuFranchise || null,
            tokusatsuShow: payload.tokusatsuShow || null,
            associatedDramas: payload.associatedDramas || [],
            details: payload.details || null,
            gallery: resolvedGallery,
            splashArt: payload.splashArt || null,
            portraitUrl: payload.portraitUrl || null,
            accentColor: payload.accentColor || null,
            gameCharacterId: payload.gameCharacterId || null,
          },
        });

        // Event Logging
        if (!existing) {
          await logHallEvent(prisma, {
            userId,
            type: "ADD_CHARACTER",
            characterId: hof.id,
            characterName: hof.name,
            newRank: hof.rank,
            newVotes: hof.likes,
            metadata: { type: hof.type, status: hof.status, nationality: hof.nationality },
          });
        } else {
          await logHallEvent(prisma, {
            userId,
            type: "UPDATE_CHARACTER",
            characterId: hof.id,
            characterName: hof.name,
            oldRank: existing.rank,
            newRank: hof.rank,
            oldVotes: existing.likes,
            newVotes: hof.likes,
            metadata: { type: hof.type, status: hof.status, nationality: hof.nationality },
          });
        }

        if (hof.isChampion || resolvedRank === 1) {
          await updateChampionshipHistoryOnRankChange(prisma, userId, hof);
        }

        await captureHallRankingSnapshots(prisma, userId);

        return NextResponse.json({ success: true, data: hof });
      }

      case "LIKE_HOF": {
        let targetId = payload.id;
        if (typeof targetId === "string" && targetId.startsWith("gc-")) {
          targetId = targetId.replace(/^gc-/, "");
        }

        // 1. Try HallOfFame record
        const existingHof = await prisma.hallOfFame.findUnique({ where: { id: payload.id } });
        if (existingHof) {
          const entry = await prisma.hallOfFame.update({
            where: { id: payload.id },
            data: { likes: { increment: 1 } },
          });

          await logHallEvent(prisma, {
            userId,
            type: "LIKES_CHANGED",
            characterId: entry.id,
            characterName: entry.name,
            oldVotes: existingHof.likes ?? 0,
            newVotes: entry.likes,
            metadata: { increment: 1 },
          });

          // Check if top rank shifted due to votes
          const topEntry = await prisma.hallOfFame.findFirst({
            where: { userId },
            orderBy: { likes: "desc" },
          });

          if (topEntry && topEntry.id === entry.id) {
            await updateChampionshipHistoryOnRankChange(prisma, userId, topEntry);
          }

          await captureHallRankingSnapshots(prisma, userId);

          return NextResponse.json({ success: true, data: entry });
        }

        // 2. Try GameCharacter record
        const existingGameChar = await prisma.gameCharacter.findUnique({ where: { id: targetId } });
        if (existingGameChar) {
          const newLikes = (existingGameChar.likes || 0) + 1;
          const updatedChar = await prisma.gameCharacter.update({
            where: { id: targetId },
            data: { likes: newLikes },
          });

          if (userId) {
            try {
              if ((prisma as any).gameCharacterLike) {
                await (prisma as any).gameCharacterLike.create({
                  data: { userId, gameCharacterId: targetId },
                });
              } else {
                await prisma.$executeRawUnsafe(
                  'INSERT INTO "GameCharacterLike" ("id", "userId", "gameCharacterId", "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING;',
                  `gcl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  userId,
                  targetId
                );
              }
            } catch {
              // ignore duplicate like insert errors
            }
          }

          return NextResponse.json({ success: true, data: updatedChar });
        }

        return NextResponse.json({ error: "Item not found in HallOfFame or GameCharacter" }, { status: 404 });
      }

      case "RANK_HOF": {
        const existing = await prisma.hallOfFame.findUnique({ where: { id: payload.id } });
        const ranked = await prisma.hallOfFame.update({
          where: { id: payload.id },
          data: { rank: payload.rank },
        });

        await logHallEvent(prisma, {
          userId,
          type: "RANK_CHANGED",
          characterId: ranked.id,
          characterName: ranked.name,
          oldRank: existing?.rank ?? null,
          newRank: ranked.rank,
        });

        if (ranked.rank === 1) {
          await updateChampionshipHistoryOnRankChange(prisma, userId, ranked);
        }

        await captureHallRankingSnapshots(prisma, userId);

        return NextResponse.json({ success: true, data: ranked });
      }

      case "DELETE_HOF": {
        const existing = await prisma.hallOfFame.findUnique({ where: { id: payload.id } });
        if (existing) {
          await logHallEvent(prisma, {
            userId,
            type: "DELETE_CHARACTER",
            characterId: existing.id,
            characterName: existing.name,
            oldRank: existing.rank,
            oldVotes: existing.likes,
          });
          const detailsObj = (existing.details && typeof existing.details === "object") ? (existing.details as any) : {};
          const mediaReferences = {
            imageUrl: existing.imageUrl,
            portraitUrl: existing.portraitUrl,
            avatarUrl: detailsObj.avatarUrl || (existing as any).avatarUrl,
            splashArt: existing.splashArt,
            gallery: Array.isArray(existing.gallery) ? existing.gallery : [],
          };
          const historyEntry = await prisma.softDeleteHistory.create({
            data: {
              userId: userId || existing.userId || null,
              entityType: "HALL_OF_FAME",
              originalRecordId: existing.id,
              name: existing.name,
              category: existing.type || "Character Dictionary",
              snapshot: existing as any,
              mediaReferences,
            },
          });
          if (historyEntry && historyEntry.id) {
            await prisma.hallOfFame.delete({ where: { id: payload.id } });
          }
        }
        await captureHallRankingSnapshots(prisma, userId);
        return NextResponse.json({ success: true });
      }

      // ─── Note Actions ──────────────────────────────────────────────────────────
      case "UPDATE_NOTE": {
        const note = await prisma.note.upsert({
          where: { id: payload.id },
          update: {
            userId,
            title: payload.title,
            content: payload.content,
            hobbyId: payload.hobbyId ?? null,
            isCuriosity: payload.isCuriosity ?? false,
          },
          create: {
            id: payload.id,
            userId,
            title: payload.title,
            content: payload.content,
            hobbyId: payload.hobbyId ?? null,
            isCuriosity: payload.isCuriosity ?? false,
          },
        });

        // Notebook Integration: If note is linked to a hobby, automatically award writing XP
        if (payload.hobbyId && payload.content && payload.content.trim().length > 0) {
          const wordCount = payload.content.trim().split(/\s+/).filter(Boolean).length;
          const writingXp = calculateWritingXp(wordCount);

          if (writingXp > 0) {
            await prisma.hobbyLog.create({
              data: {
                userId,
                skillId: payload.hobbyId,
                delta: writingXp,
                wordCount,
                note: `Note linked: ${payload.title || "Untitled Note"}`,
              },
            });

            const currentSkill = await prisma.hobbySkill.findUnique({ where: { id: payload.hobbyId } });
            if (currentSkill) {
              const newXp = (currentSkill.xp || 0) + writingXp;
              const { level, progressPercent } = getLevelDetailsFromXp(newXp);
              const mostWordsWritten = Math.max(currentSkill.mostWordsWritten || 0, wordCount);

              await prisma.hobbySkill.update({
                where: { id: payload.hobbyId },
                data: {
                  xp: newXp,
                  level,
                  progress: progressPercent,
                  mostWordsWritten,
                  lastLearnedAt: new Date(),
                },
              });
            }
          }
        }

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
            userId,
            title: payload.title,
            url: payload.url,
            category: payload.category,
          },
          create: {
            id: payload.id,
            userId,
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
            userId,
            title: payload.title,
            url: payload.url,
            caption: payload.caption ?? null,
            tags: payload.tags ?? [],
            category: payload.category ?? "General",
            folder: payload.folder ?? "Root",
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
        const isNew = !(await prisma.song.findUnique({ where: { id: payload.id } }));
        const song = await prisma.song.upsert({
          where: { id: payload.id },
          update: {
            userId,
            title: payload.title,
            artist: payload.artist,
            album: payload.album || null,
            imageUrl: payload.imageUrl || null,
            category: payload.category,
            duration: payload.duration || null,
            audioUrl: payload.audioUrl || null,
            youtubeId: payload.youtubeId || null,
            lyrics: payload.lyrics || null,
            geniusId: payload.geniusId || null,
            playlistId: payload.playlistId || null,
            ...(payload.isFavorite !== undefined ? { isFavorite: payload.isFavorite } : {}),
          },
          create: {
            id: payload.id,
            userId,
            title: payload.title,
            artist: payload.artist,
            album: payload.album || null,
            imageUrl: payload.imageUrl || null,
            category: payload.category,
            duration: payload.duration || null,
            audioUrl: payload.audioUrl || null,
            youtubeId: payload.youtubeId || null,
            lyrics: payload.lyrics || null,
            geniusId: payload.geniusId || null,
            playlistId: payload.playlistId || null,
            isFavorite: Boolean(payload.isFavorite),
          },
        });

        if (isNew) {
          try {
            await prisma.musicTimeline.create({
              data: {
                userId,
                type: "SONG_ADDED",
                entityId: song.id,
                entityTitle: song.title,
                metadata: { artist: song.artist, category: song.category },
              },
            });
          } catch (tlErr) {
            console.warn("[Action Route] Failed to log SONG_ADDED timeline:", tlErr);
          }
        }

        return NextResponse.json({ success: true, data: song });
      }

      case "TOGGLE_SONG_FAVORITE": {
        const existing = await prisma.song.findUnique({ where: { id: payload.id } });
        if (existing) {
          const updated = await prisma.song.update({
            where: { id: payload.id },
            data: { isFavorite: !existing.isFavorite },
          });
          return NextResponse.json({ success: true, data: updated });
        }
        return NextResponse.json({ error: "Song not found" }, { status: 404 });
      }

      case "DELETE_SONG": {
        const songToDelete = await prisma.song.findUnique({ where: { id: payload.id } });
        await prisma.song.deleteMany({ where: { id: payload.id, userId } });

        if (songToDelete) {
          try {
            await prisma.musicTimeline.create({
              data: {
                userId,
                type: "DELETED",
                entityId: payload.id,
                entityTitle: songToDelete.title,
                metadata: { artist: songToDelete.artist },
              },
            });
          } catch (tlErr) {
            console.warn("[Action Route] Failed to log DELETED timeline:", tlErr);
          }
        }

        return NextResponse.json({ success: true });
      }

      case "UPDATE_PLAYLIST": {
        const isNew = !(await prisma.playlist.findUnique({ where: { id: payload.id } }));
        const playlist = await prisma.playlist.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            description: payload.description || null,
            coverUrl: payload.coverUrl || null,
            songs: payload.songs ?? [],
            isAuto: payload.isAuto ?? false,
            autoType: payload.autoType || null,
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            description: payload.description || null,
            coverUrl: payload.coverUrl || null,
            songs: payload.songs ?? [],
            isAuto: payload.isAuto ?? false,
            autoType: payload.autoType || null,
          },
        });

        if (isNew) {
          try {
            await prisma.musicTimeline.create({
              data: {
                userId,
                type: "PLAYLIST_CREATED",
                entityId: playlist.id,
                entityTitle: playlist.name,
              },
            });
          } catch (tlErr) {
            console.warn("[Action Route] Failed to log PLAYLIST_CREATED timeline:", tlErr);
          }
        }

        return NextResponse.json({ success: true, data: playlist });
      }

      case "DELETE_PLAYLIST": {
        await prisma.playlist.deleteMany({ where: { id: payload.id, userId } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_COLLECTION": {
        const collection = await prisma.musicCollection.upsert({
          where: { id: payload.id },
          update: {
            userId,
            name: payload.name,
            description: payload.description || null,
            coverUrl: payload.coverUrl || null,
            songIds: payload.songIds ?? [],
          },
          create: {
            id: payload.id,
            userId,
            name: payload.name,
            description: payload.description || null,
            coverUrl: payload.coverUrl || null,
            songIds: payload.songIds ?? [],
          },
        });
        return NextResponse.json({ success: true, data: collection });
      }

      case "DELETE_COLLECTION": {
        await prisma.musicCollection.deleteMany({ where: { id: payload.id, userId } });
        return NextResponse.json({ success: true });
      }

      case "SAVE_DRAMA_LOG": {
        const entry = await prisma.dramaLog.upsert({
          where: { id: payload.id ?? "___new___" },
          update: {
            userId,
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
            episodesWatched: payload.episodesWatched ?? 0,
            totalEpisodes: payload.totalEpisodes ?? 0,
          },
          create: {
            id: payload.id,
            userId,
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
            episodesWatched: payload.episodesWatched ?? 0,
            totalEpisodes: payload.totalEpisodes ?? 0,
          },
        });
        return NextResponse.json({ success: true, data: entry });
      }

      case "DELETE_ANIME": {
        await prisma.anime.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "DELETE_DRAMA": {
        await prisma.drama.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_DRAMA_LOG_EPISODES": {
        const logEntry = await prisma.dramaLog.update({
          where: { id: payload.id },
          data: {
            userId,
            episodesWatched: payload.episodesWatched ?? 0,
            totalEpisodes: payload.totalEpisodes ?? 0,
          },
        });
        return NextResponse.json({ success: true, data: logEntry });
      }

      case "DELETE_DRAMA_LOG": {
        await prisma.dramaLog.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "UPDATE_PROMPT": {
        const entry = await prisma.savedPrompt.upsert({
          where: { id: payload.id },
          update: {
            userId,
            title: payload.title,
            targetAI: payload.targetAI,
            promptText: payload.promptText,
          },
          create: {
            id: payload.id,
            userId,
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
        const existing = await prisma.hobbySkill.count({ where: { userId } });
        if (existing === 0) {
          const seeds = [
            { name: "Chinese",          category: "Languages",   priority: "Priority", userId },
            { name: "English",          category: "Languages",   priority: "Priority", userId },
            { name: "Japanese",         category: "Languages",   priority: "Haven't Started", userId },
            { name: "Korean",           category: "Languages",   priority: "Haven't Started", userId },
            { name: "German",           category: "Languages",   priority: "Manifest", userId },
            { name: "Russian",          category: "Languages",   priority: "Manifest", userId },
            { name: "Spanish",          category: "Languages",   priority: "Manifest", userId },
            { name: "Neuroscience",     category: "Doctors",     priority: "Priority", userId },
            { name: "Patofisiologi",    category: "Doctors",     priority: "Priority", userId },
            { name: "MMA",              category: "Martial Arts", priority: "Priority", userId },
            { name: "Judo",             category: "Martial Arts", priority: "Manifest", userId },
            { name: "Taekwondo",        category: "Martial Arts", priority: "Manifest", userId },
            { name: "Karate",           category: "Martial Arts", priority: "Manifest", userId },
            { name: "Silat",            category: "Martial Arts", priority: "Priority", userId },
          ];
          await prisma.hobbySkill.createMany({ data: seeds });
        }
        const skills = await prisma.hobbySkill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
        return NextResponse.json({ success: true, data: skills });
      }

      case "ADD_HOBBY_SKILL": {
        const skill = await prisma.hobbySkill.create({
          data: {
            id: payload.id ?? undefined,
            userId,
            name: payload.name,
            category: payload.category,
            priority: payload.priority ?? "Priority",
            progress: 0,
            level: 1,
            xp: 0,
          },
        });
        return NextResponse.json({ success: true, data: skill });
      }

      case "LOG_HOBBY_SESSION": {
        const minutes = Number(payload.minutesLearned) || 0;
        const note = payload.note ? String(payload.note).trim() : null;
        const sessionXp = calculateSessionXp(minutes);

        const currentSkill = await prisma.hobbySkill.findUnique({ where: { id: payload.skillId } });
        if (!currentSkill) {
          return NextResponse.json({ error: "Skill not found" }, { status: 404 });
        }

        // Create HobbySession log
        const session = await prisma.hobbySession.create({
          data: {
            userId,
            skillId: payload.skillId,
            minutesLearned: minutes,
            sessionXp,
            note,
          },
        });

        // Also record a HobbyLog for chart history
        await prisma.hobbyLog.create({
          data: {
            userId,
            skillId: payload.skillId,
            delta: sessionXp,
            wordCount: note ? note.split(/\s+/).filter(Boolean).length : 0,
            note: note || `Learned for ${minutes} mins`,
          },
        });

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        let newStreak = currentSkill.streak || 0;
        const lastStreakDate = currentSkill.lastStreakDate;

        if (lastStreakDate === todayStr) {
          // Already logged today — keep current streak
        } else if (lastStreakDate === yesterdayStr) {
          // Logged yesterday — increment streak
          newStreak += 1;
        } else {
          // Missed a day or first time — start at 1
          newStreak = 1;
        }

        const newXp = (currentSkill.xp || 0) + sessionXp;
        const { level, progressPercent } = getLevelDetailsFromXp(newXp);
        const totalMinutes = (currentSkill.totalMinutes || 0) + minutes;
        const longestSessionMin = Math.max(currentSkill.longestSessionMin || 0, minutes);
        const longestStreak = Math.max(currentSkill.longestStreak || 0, newStreak);
        const highestXpSingleDay = Math.max(currentSkill.highestXpSingleDay || 0, sessionXp);

        const updatedSkill = await prisma.hobbySkill.update({
          where: { id: payload.skillId },
          data: {
            xp: newXp,
            level,
            progress: progressPercent,
            totalMinutes,
            longestSessionMin,
            streak: newStreak,
            longestStreak,
            lastStreakDate: todayStr,
            lastLearnedAt: now,
            highestXpSingleDay,
          },
        });

        // Create milestone notifications if streak / level milestone hit
        if (newStreak === 7 || newStreak === 14 || newStreak === 30 || newStreak === 50 || newStreak === 100) {
          await prisma.notification.create({
            data: {
              userId,
              title: "🔥 Streak Milestone!",
              message: `${currentSkill.name} streak reached ${newStreak} days! Keep up the momentum.`,
              type: "streak",
            },
          });
        }

        if (level > (currentSkill.level || 1)) {
          await prisma.notification.create({
            data: {
              userId,
              title: "⚡ Level Up!",
              message: `${currentSkill.name} reached Level ${level}!`,
              type: "milestone",
            },
          });
        }

        return NextResponse.json({ success: true, data: updatedSkill, session });
      }

      case "LOG_HOBBY_XP": {
        const words = payload.wordCount ?? 0;
        const writingXp = calculateWritingXp(words);

        await prisma.hobbyLog.create({
          data: {
            userId,
            skillId: payload.skillId,
            delta: writingXp,
            wordCount: words,
            note: payload.note ?? null,
          },
        });

        const currentSkill = await prisma.hobbySkill.findUnique({ where: { id: payload.skillId } });
        if (!currentSkill) {
          return NextResponse.json({ error: "Skill not found" }, { status: 404 });
        }

        const newXp = (currentSkill.xp || 0) + writingXp;
        const { level, progressPercent } = getLevelDetailsFromXp(newXp);
        const mostWords = Math.max(currentSkill.mostWordsWritten || 0, words);

        const updated = await prisma.hobbySkill.update({
          where: { id: payload.skillId },
          data: {
            xp: newXp,
            level,
            progress: progressPercent,
            mostWordsWritten: mostWords,
            lastLearnedAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, data: updated, delta: writingXp });
      }

      case "UPDATE_HOBBY_REMINDER": {
        const updated = await prisma.hobbySkill.update({
          where: { id: payload.skillId },
          data: {
            reminderEnabled: payload.reminderEnabled ?? false,
            reminderTime: payload.reminderTime ?? "20:00",
            reminderInterval: payload.reminderInterval ?? "Every day",
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "RESET_HOBBY_STREAK": {
        const updated = await prisma.hobbySkill.update({
          where: { id: payload.skillId },
          data: { streak: 0, lastStreakDate: null },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "DELETE_HOBBY_SKILL": {
        await prisma.hobbySkill.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "DISMISS_NOTIFICATION": {
        await prisma.notification.update({
          where: { id: payload.id },
          data: { isDismissed: true, isRead: true },
        });
        return NextResponse.json({ success: true });
      }

      case "CLEAR_NOTIFICATIONS": {
        await prisma.notification.updateMany({
          where: { userId },
          data: { isDismissed: true, isRead: true },
        });
        return NextResponse.json({ success: true });
      }


      // ─── Profile Aesthetics Actions ───────────────────────────────────────────
      case "SAVE_AESTHETIC": {
        // Fetch existing profile to compare and log history
        let existing = await prisma.profile.findFirst({ where: { OR: [{ userId }, { id: userId }] } });

        if (existing) {
          // Push old avatar to history if it's changing
          if (payload.avatar !== undefined && payload.avatar !== existing.avatar && existing.avatar) {
            await prisma.profileHistory.create({
              data: { userId, assetType: "avatar", url: existing.avatar },
            });
          }
          // Push old banner to history if it's changing
          if (payload.banner !== undefined && payload.banner !== existing.banner && existing.banner) {
            await prisma.profileHistory.create({
              data: { userId, assetType: "banner", url: existing.banner },
            });
          }
          // Push old nameplate to history if it's changing
          if (payload.nameplate !== undefined && payload.nameplate !== existing.nameplate && existing.nameplate) {
            await prisma.profileHistory.create({
              data: { userId, assetType: "nameplate", url: existing.nameplate },
            });
          }
        }

        const updatedProfile = await prisma.profile.update({
          where: { id: existing?.id || userId },
          data: {
            userId,
            ...(payload.name !== undefined && { name: payload.name }),
            // null explicitly clears the column; undefined skips the update
            ...(payload.customTag  !== undefined && { customTag:  payload.customTag  ?? null }),
            ...(payload.bio        !== undefined && { bio:        payload.bio }),
            ...(payload.avatar     !== undefined && { avatar:     payload.avatar     ?? null }),
            ...(payload.banner     !== undefined && { banner:     payload.banner     ?? null }),
            ...(payload.nameplate  !== undefined && { nameplate:  payload.nameplate  ?? null }),
            ...(payload.borderStyle !== undefined && { borderStyle: payload.borderStyle }),
          },
        });

        // Return updated profile + fresh history (last 10)
        const history = await prisma.profileHistory.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        return NextResponse.json({ success: true, data: updatedProfile, history });
      }

      case "GET_PROFILE_HISTORY": {
        const history = await prisma.profileHistory.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        return NextResponse.json({ success: true, data: history });
      }

      case "UPDATE_COLLECTION": {
        const { id, name, description, emoji, coverUrl, songIds } = payload;
        // Check ownership if updating existing
        if (id && !id.startsWith("collection-")) {
          const existing = await prisma.musicCollection.findUnique({ where: { id } });
          if (existing && existing.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        const col = await prisma.musicCollection.upsert({
          where: { id: id || "new" },
          update: {
            name,
            description: description ?? null,
            emoji: emoji ?? null,
            coverUrl: coverUrl ?? null,
            songIds: songIds ?? [],
            updatedAt: new Date(),
          },
          create: {
            id,
            userId,
            name,
            description: description ?? null,
            emoji: emoji ?? null,
            coverUrl: coverUrl ?? null,
            songIds: songIds ?? [],
          },
        });
        return NextResponse.json({ success: true, data: col });
      }

      case "DELETE_COLLECTION": {
        const existing = await prisma.musicCollection.findUnique({ where: { id: payload.id } });
        if (!existing || existing.userId !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        await prisma.musicCollection.delete({ where: { id: payload.id } });
        return NextResponse.json({ success: true });
      }

      case "TOGGLE_SONG_FAVORITE": {
        const song = await prisma.song.findUnique({ where: { id: payload.id } });
        if (!song || song.userId !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const updated = await prisma.song.update({
          where: { id: payload.id },
          data: { isFavorite: !song.isFavorite },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
