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

    const likes = await prisma.gameCharacterLike.findMany({
      where: { userId: user.id },
      select: { gameCharacterId: true },
    });

    const likedCharacterIds = likes.map((l) => l.gameCharacterId);
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

    // Check existing like
    const existingLike = await prisma.gameCharacterLike.findUnique({
      where: {
        userId_gameCharacterId: {
          userId: user.id,
          gameCharacterId: characterId,
        },
      },
    });

    let liked = false;
    let newLikesCount = character.likes || 0;

    if (existingLike) {
      // Toggle OFF: Unlike
      await prisma.gameCharacterLike.delete({
        where: { id: existingLike.id },
      });
      newLikesCount = Math.max(0, newLikesCount - 1);
      await prisma.gameCharacter.update({
        where: { id: characterId },
        data: { likes: newLikesCount },
      });
      liked = false;
    } else {
      // Toggle ON: Like
      await prisma.gameCharacterLike.create({
        data: {
          userId: user.id,
          gameCharacterId: characterId,
        },
      });
      newLikesCount = newLikesCount + 1;
      await prisma.gameCharacter.update({
        where: { id: characterId },
        data: { likes: newLikesCount },
      });
      liked = true;
    }

    return NextResponse.json({
      characterId,
      liked,
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
