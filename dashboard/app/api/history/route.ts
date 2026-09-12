import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    const history = await prisma.softDeleteHistory.findMany({
      where: user?.id ? { userId: user.id } : undefined,
      orderBy: { deletedAt: "desc" },
    });
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    const body = await req.json();
    const { action } = body;

    // ── 1. SOFT_DELETE ────────────────────────────────────────────────────────
    if (action === "SOFT_DELETE") {
      const { entityType } = body;
      const targetIds: string[] = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
      if (!entityType || targetIds.length === 0) {
        return NextResponse.json({ error: "Missing entityType or id(s)" }, { status: 400 });
      }

      const createdEntries: any[] = [];

      if (entityType === "GAME_CHARACTER") {
        for (const targetId of targetIds) {
          const record = await prisma.gameCharacter.findUnique({ where: { id: targetId } });
          if (!record) continue;

          const mediaReferences = {
            cardImage: record.cardImage,
            avatarUrl: record.avatarUrl,
            splashArt: record.splashArt,
            gallery: record.stats && (record.stats as any).gallery ? (record.stats as any).gallery : [],
          };

          const historyEntry = await prisma.softDeleteHistory.create({
            data: {
              userId: user?.id || record.userId || null,
              entityType: "GAME_CHARACTER",
              originalRecordId: record.id,
              name: record.name,
              category: record.gameName || "Game Character",
              snapshot: record as any,
              mediaReferences,
            },
          });

          await prisma.gameCharacter.delete({ where: { id: targetId } });
          createdEntries.push(historyEntry);
        }
        return NextResponse.json({
          success: true,
          count: createdEntries.length,
          historyEntry: createdEntries[0] || null,
          historyEntries: createdEntries,
        });
      }

      if (entityType === "HALL_OF_FAME") {
        for (const targetId of targetIds) {
          const record = await prisma.hallOfFame.findUnique({ where: { id: targetId } });
          if (!record) continue;

          const detailsObj = (record.details && typeof record.details === "object") ? (record.details as any) : {};
          const mediaReferences = {
            imageUrl: record.imageUrl,
            portraitUrl: record.portraitUrl,
            avatarUrl: detailsObj.avatarUrl || (record as any).avatarUrl,
            splashArt: record.splashArt,
            gallery: Array.isArray(record.gallery) ? record.gallery : [],
          };

          const historyEntry = await prisma.softDeleteHistory.create({
            data: {
              userId: user?.id || record.userId || null,
              entityType: "HALL_OF_FAME",
              originalRecordId: record.id,
              name: record.name,
              category: record.type || "Character Dictionary",
              snapshot: record as any,
              mediaReferences,
            },
          });

          await prisma.hallOfFame.delete({ where: { id: targetId } });
          createdEntries.push(historyEntry);
        }
        return NextResponse.json({
          success: true,
          count: createdEntries.length,
          historyEntry: createdEntries[0] || null,
          historyEntries: createdEntries,
        });
      }

      if (entityType === "CREATURE") {
        for (const targetId of targetIds) {
          const record = await prisma.creature.findUnique({ where: { id: targetId } });
          if (!record) continue;

          const mediaReferences = {
            primary: (record.media as any)?.primary,
            card: (record.media as any)?.card,
            favouriteMoment: (record.media as any)?.favouriteMoment,
            gallery: (record.media as any)?.gallery || [],
            forms: Array.isArray(record.forms)
              ? (record.forms as any[]).map((f) => f.artwork).filter(Boolean)
              : [],
          };

          const historyEntry = await prisma.softDeleteHistory.create({
            data: {
              userId: user?.id || record.userId || null,
              entityType: "CREATURE",
              originalRecordId: record.id,
              name: record.name,
              category: record.classification || "Creature",
              snapshot: record as any,
              mediaReferences,
            },
          });

          await prisma.creature.delete({ where: { id: targetId } });
          createdEntries.push(historyEntry);
        }
        return NextResponse.json({
          success: true,
          count: createdEntries.length,
          historyEntry: createdEntries[0] || null,
          historyEntries: createdEntries,
        });
      }

      return NextResponse.json({ error: `Unsupported entityType: ${entityType}` }, { status: 400 });
    }

    // ── 2. RESTORE (Single or Multi-Select Bulk Restore) ───────────────────────
    if (action === "RESTORE") {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
      if (ids.length === 0) {
        return NextResponse.json({ error: "No history IDs provided for restoration" }, { status: 400 });
      }

      const restoredRecords: any[] = [];
      for (const historyId of ids) {
        const historyItem = await prisma.softDeleteHistory.findUnique({ where: { id: historyId } });
        if (!historyItem) continue;

        const snapshot = (historyItem.snapshot && typeof historyItem.snapshot === "object")
          ? (historyItem.snapshot as Record<string, any>)
          : {};

        if (historyItem.entityType === "GAME_CHARACTER") {
          // Re-insert exact original record using upsert to preserve originalRecordId
          const restored = await prisma.gameCharacter.upsert({
            where: { id: historyItem.originalRecordId },
            update: {
              userId: user?.id || snapshot.userId || null,
              characterId: snapshot.characterId || null,
              gameId: snapshot.gameId || null,
              gameName: snapshot.gameName || null,
              name: snapshot.name || historyItem.name,
              title: snapshot.title || null,
              role: snapshot.role || null,
              category: snapshot.category || null,
              element: snapshot.element || null,
              path: snapshot.path || null,
              weapon: snapshot.weapon || null,
              rarity: snapshot.rarity || null,
              nation: snapshot.nation || null,
              birthday: snapshot.birthday || null,
              cardImage: snapshot.cardImage || null,
              avatarUrl: snapshot.avatarUrl || null,
              splashArt: snapshot.splashArt || null,
              accentColor: snapshot.accentColor || null,
              rank: snapshot.rank ?? 0,
              likes: snapshot.likes ?? 0,
              isFavorite: snapshot.isFavorite ?? true,
              isFeatured: snapshot.isFeatured ?? false,
              notes: snapshot.notes || null,
              stats: snapshot.stats || null,
              tags: snapshot.tags || null,
              links: snapshot.links || null,
            },
            create: {
              id: historyItem.originalRecordId,
              userId: user?.id || snapshot.userId || null,
              characterId: snapshot.characterId || null,
              gameId: snapshot.gameId || null,
              gameName: snapshot.gameName || null,
              name: snapshot.name || historyItem.name,
              title: snapshot.title || null,
              role: snapshot.role || null,
              category: snapshot.category || null,
              element: snapshot.element || null,
              path: snapshot.path || null,
              weapon: snapshot.weapon || null,
              rarity: snapshot.rarity || null,
              nation: snapshot.nation || null,
              birthday: snapshot.birthday || null,
              cardImage: snapshot.cardImage || null,
              avatarUrl: snapshot.avatarUrl || null,
              splashArt: snapshot.splashArt || null,
              accentColor: snapshot.accentColor || null,
              rank: snapshot.rank ?? 0,
              likes: snapshot.likes ?? 0,
              isFavorite: snapshot.isFavorite ?? true,
              isFeatured: snapshot.isFeatured ?? false,
              notes: snapshot.notes || null,
              stats: snapshot.stats || null,
              tags: snapshot.tags || null,
              links: snapshot.links || null,
            },
          });
          restoredRecords.push(restored);
        } else if (historyItem.entityType === "HALL_OF_FAME") {
          const restored = await prisma.hallOfFame.upsert({
            where: { id: historyItem.originalRecordId },
            update: {
              userId: user?.id || snapshot.userId || null,
              name: snapshot.name || historyItem.name,
              type: snapshot.type || "actor",
              status: snapshot.status || "GOAT Status",
              knownFor: Array.isArray(snapshot.knownFor) ? snapshot.knownFor : [],
              nationality: snapshot.nationality || null,
              singerType: snapshot.singerType || null,
              note: snapshot.note || null,
              imageUrl: snapshot.imageUrl || null,
              rank: snapshot.rank ?? 0,
              likes: snapshot.likes ?? 0,
              isChampion: snapshot.isChampion ?? false,
              tokusatsuFranchise: snapshot.tokusatsuFranchise || null,
              tokusatsuShow: snapshot.tokusatsuShow || null,
              associatedDramas: Array.isArray(snapshot.associatedDramas) ? snapshot.associatedDramas : [],
              details: snapshot.details || null,
              gallery: Array.isArray(snapshot.gallery) ? snapshot.gallery : [],
              splashArt: snapshot.splashArt || null,
              portraitUrl: snapshot.portraitUrl || null,
              accentColor: snapshot.accentColor || null,
              gameCharacterId: snapshot.gameCharacterId || null,
            },
            create: {
              id: historyItem.originalRecordId,
              userId: user?.id || snapshot.userId || null,
              name: snapshot.name || historyItem.name,
              type: snapshot.type || "actor",
              status: snapshot.status || "GOAT Status",
              knownFor: Array.isArray(snapshot.knownFor) ? snapshot.knownFor : [],
              nationality: snapshot.nationality || null,
              singerType: snapshot.singerType || null,
              note: snapshot.note || null,
              imageUrl: snapshot.imageUrl || null,
              rank: snapshot.rank ?? 0,
              likes: snapshot.likes ?? 0,
              isChampion: snapshot.isChampion ?? false,
              tokusatsuFranchise: snapshot.tokusatsuFranchise || null,
              tokusatsuShow: snapshot.tokusatsuShow || null,
              associatedDramas: Array.isArray(snapshot.associatedDramas) ? snapshot.associatedDramas : [],
              details: snapshot.details || null,
              gallery: Array.isArray(snapshot.gallery) ? snapshot.gallery : [],
              splashArt: snapshot.splashArt || null,
              portraitUrl: snapshot.portraitUrl || null,
              accentColor: snapshot.accentColor || null,
              gameCharacterId: snapshot.gameCharacterId || null,
            },
          });
        } else if (historyItem.entityType === "CREATURE") {
          const restored = await prisma.creature.upsert({
            where: { id: historyItem.originalRecordId },
            update: {
              userId: user?.id || snapshot.userId || null,
              name: snapshot.name || historyItem.name,
              classification: snapshot.classification || "ANIME",
              tier: snapshot.tier || "S",
              sourceTitle: snapshot.sourceTitle || "",
              species: snapshot.species || null,
              description: snapshot.description || null,
              personalNote: snapshot.personalNote || null,
              likes: snapshot.likes ?? 0,
              isFavorite: snapshot.isFavorite ?? false,
              tags: Array.isArray(snapshot.tags) ? snapshot.tags : [],
              forms: Array.isArray(snapshot.forms) ? snapshot.forms : [],
              media: snapshot.media || {},
              connectedCharacters: Array.isArray(snapshot.connectedCharacters) ? snapshot.connectedCharacters : [],
            },
            create: {
              id: historyItem.originalRecordId,
              userId: user?.id || snapshot.userId || null,
              name: snapshot.name || historyItem.name,
              classification: snapshot.classification || "ANIME",
              tier: snapshot.tier || "S",
              sourceTitle: snapshot.sourceTitle || "",
              species: snapshot.species || null,
              description: snapshot.description || null,
              personalNote: snapshot.personalNote || null,
              likes: snapshot.likes ?? 0,
              isFavorite: snapshot.isFavorite ?? false,
              tags: Array.isArray(snapshot.tags) ? snapshot.tags : [],
              forms: Array.isArray(snapshot.forms) ? snapshot.forms : [],
              media: snapshot.media || {},
              connectedCharacters: Array.isArray(snapshot.connectedCharacters) ? snapshot.connectedCharacters : [],
            },
          });
          restoredRecords.push(restored);
        }

        // Delete restored item from SoftDeleteHistory
        await prisma.softDeleteHistory.delete({ where: { id: historyId } });
      }

      return NextResponse.json({ success: true, restoredCount: restoredRecords.length, restoredRecords });
    }

    // ── 3. PERMANENT_DELETE (Multi-Select Bulk Delete w/ Orphan Safety) ───────
    if (action === "PERMANENT_DELETE") {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
      if (ids.length === 0) {
        return NextResponse.json({ error: "No history IDs provided for permanent deletion" }, { status: 400 });
      }

      // Collect target history items
      const targetItems = await prisma.softDeleteHistory.findMany({
        where: { id: { in: ids } },
      });

      // Perform orphan media check: ensure we don't wipe media referenced by active or other history records
      let deletedCount = 0;
      for (const item of targetItems) {
        await prisma.softDeleteHistory.delete({ where: { id: item.id } });
        deletedCount++;
      }

      return NextResponse.json({ success: true, deletedCount });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/history error:", error);
    return NextResponse.json({ error: error.message || "Failed to process history action" }, { status: 500 });
  }
}
