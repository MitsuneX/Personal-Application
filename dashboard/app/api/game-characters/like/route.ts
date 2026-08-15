import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthContext() {
  try {
    const cookieStore = await cookies();
    const isGuest = cookieStore.get("is_guest")?.value === "true";
    if (isGuest) return { isGuest: true, user: null };

    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return { isGuest: false, user };
  } catch {
    return { isGuest: false, user: null };
  }
}

export async function GET() {
  try {
    const { isGuest, user } = await getAuthContext();
    if (isGuest || !user) {
      return NextResponse.json({ likedCharacterIds: [] });
    }

    let likedCharacterIds: string[] = [];
    if ((prisma as any).gameCharacterLike) {
      const likes = await (prisma as any).gameCharacterLike.findMany({
        where: { userId: user.id },
        select: { gameCharacterId: true },
      });
      likedCharacterIds = likes.map((l: any) => l.gameCharacterId);
    } else {
      const rawLikes: any[] = await prisma.$queryRawUnsafe(
        'SELECT "gameCharacterId" FROM "GameCharacterLike" WHERE "userId" = $1;',
        user.id
      );
      likedCharacterIds = (rawLikes || []).map((l: any) => l.gameCharacterId);
    }

    return NextResponse.json({ likedCharacterIds });
  } catch (error: any) {
    console.error("GET /api/game-characters/like error:", error);
    return NextResponse.json({ likedCharacterIds: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { isGuest, user } = await getAuthContext();

    if (isGuest || !user) {
      return NextResponse.json(
        { error: "Sign in to like this character." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { characterId } = body;

    if (!characterId) {
      return NextResponse.json({ error: "characterId is required" }, { status: 400 });
    }

    // Check if character exists
    const character = await prisma.gameCharacter.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // ── Continuous Increment (never toggle off) ──────────────────────────────
    // Each POST call is an atomic +1 vote. Repeat clicks always add more votes.
    // This intentionally replaces the old toggle-on/toggle-off behaviour.

    const newLikesCount = (character.likes || 0) + 1;

    await prisma.gameCharacter.update({
      where: { id: characterId },
      data: { likes: newLikesCount },
    });

    return NextResponse.json({
      characterId,
      liked: true,
      likesCount: newLikesCount,
    });
  } catch (error: any) {
    console.error("POST /api/game-characters/like error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update character like" },
      { status: 500 }
    );
  }
}
