import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
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

    // Update orphaned characters that match this game's name or are unlinked
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

    const updatedCharacters = await prisma.gameCharacter.findMany({
      where: { gameId: targetGame.id },
    });

    return NextResponse.json({
      success: true,
      syncedCount: updatedResult.count,
      game: targetGame,
      characters: updatedCharacters,
    });
  } catch (error: any) {
    console.error("POST /api/game-characters/sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync orphaned game characters" }, { status: 500 });
  }
}
