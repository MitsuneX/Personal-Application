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
    } else if (gameName) {
      targetGame = await prisma.game.findFirst({
        where: { game: { equals: gameName, mode: "insensitive" } },
      });
    }

    if (!targetGame) {
      return NextResponse.json({ error: "Target game database not found" }, { status: 404 });
    }

    // 1. Relink orphaned characters matching target game name or ID
    const updatedResult = await prisma.gameCharacter.updateMany({
      where: {
        OR: [
          { gameId: null, gameName: { equals: targetGame.game, mode: "insensitive" } },
          { gameId: targetGame.id },
        ],
      },
      data: {
        gameId: targetGame.id,
        gameName: targetGame.game,
      },
    });

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
      isAlreadyUpToDate: updatedResult.count === 0,
      syncedCount: updatedResult.count,
      game: targetGame,
      metadata: syncMeta,
      characters: updatedCharacters,
    });
  } catch (error: any) {
    console.error("POST /api/game-characters/sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync orphaned game characters" }, { status: 500 });
  }
}
