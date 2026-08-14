import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { normalizeGameName } from "@/lib/services/characterCreationService";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      const allMetadata = await prisma.gameSyncMetadata.findMany();
      return NextResponse.json(allMetadata);
    }

    const metadata = await prisma.gameSyncMetadata.findFirst({
      where: { gameId },
    });

    return NextResponse.json(metadata || {
      gameId,
      syncStatus: "NOT_SYNCED",
      lastSuccessfulSyncAt: null,
      remoteRecordCount: 0,
    });
  } catch (error: any) {
    console.error("GET /api/game-characters/sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sync metadata" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    const { gameId, gameName } = await req.json();

    if (!gameId && !gameName) {
      return NextResponse.json({ error: "Missing gameId or gameName parameter" }, { status: 400 });
    }

    let targetGame = null;
    if (gameId) {
      targetGame = await prisma.game.findUnique({ where: { id: gameId } });
    }

    if (!targetGame && gameName) {
      const normInputName = normalizeGameName(gameName).toLowerCase();
      const allGames = await prisma.game.findMany();
      targetGame = allGames.find(
        (g) => normalizeGameName(g.game).toLowerCase() === normInputName
      ) || null;
    }

    if (!targetGame) {
      return NextResponse.json({ error: "Target game database not found" }, { status: 404 });
    }

    // 1. Relink orphaned characters matching normalized target game name or ID
    const normalizedTargetName = normalizeGameName(targetGame.game).toLowerCase();
    const candidateChars = await prisma.gameCharacter.findMany({
      where: {
        OR: [
          { gameId: null },
          { gameId: "pending-game" },
          { gameId: targetGame.id },
        ],
      },
    });

    const idsToRelink = candidateChars
      .filter((c) => {
        if (c.gameId === targetGame.id) return true;
        const cNorm = normalizeGameName(c.gameName).toLowerCase();
        return cNorm === normalizedTargetName;
      })
      .map((c) => c.id);

    let updatedCount = 0;
    if (idsToRelink.length > 0) {
      const updatedResult = await prisma.gameCharacter.updateMany({
        where: { id: { in: idsToRelink } },
        data: {
          gameId: targetGame.id,
          gameName: targetGame.game,
        },
      });
      updatedCount = updatedResult.count;
    }

    // 2. Fetch all linked characters for target game
    const updatedCharacters = await prisma.gameCharacter.findMany({
      where: { gameId: targetGame.id },
    });

    // 3. Upsert persistent GameSyncMetadata in DB
    const now = new Date();
    const syncMeta = await prisma.gameSyncMetadata.upsert({
      where: {
        userId_gameId: {
          userId: user?.id || "guest",
          gameId: targetGame.id,
        },
      },
      update: {
        gameName: targetGame.game,
        lastSuccessfulSyncAt: now,
        remoteRecordCount: updatedCharacters.length,
        syncStatus: "UP_TO_DATE",
      },
      create: {
        userId: user?.id || "guest",
        gameId: targetGame.id,
        gameName: targetGame.game,
        lastSuccessfulSyncAt: now,
        remoteRecordCount: updatedCharacters.length,
        syncStatus: "UP_TO_DATE",
      },
    });

    return NextResponse.json({
      success: true,
      isAlreadyUpToDate: updatedCount === 0,
      syncedCount: updatedCount,
      game: targetGame,
      metadata: syncMeta,
      characters: updatedCharacters,
    });
  } catch (error: any) {
    console.error("POST /api/game-characters/sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync orphaned game characters" }, { status: 500 });
  }
}
