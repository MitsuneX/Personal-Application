import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");
    const characterId = searchParams.get("characterId");

    const where: any = {};
    if (gameId) where.gameId = gameId;
    if (characterId) where.characterId = characterId;

    const characters = await prisma.gameCharacter.findMany({
      where,
      orderBy: { rank: "asc" },
    });

    return NextResponse.json(characters);
  } catch (error: any) {
    console.error("GET /api/game-characters error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch game characters" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    const body = await req.json();

    const {
      characterId,
      gameId,
      gameName,
      name,
      title,
      role,
      category,
      element,
      path,
      weapon,
      rarity,
      nation,
      birthday,
      health,
      damage,
      difficulty,
      pickRate,
      banRate,
      winRate,
      avatarUrl,
      splashArt,
      accentColor,
      rank,
      likes,
      isFavorite,
      notes,
      stats,
      tags,
      links,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Character name is required" }, { status: 400 });
    }

    const newChar = await prisma.gameCharacter.create({
      data: {
        userId: user?.id || null,
        characterId: characterId || null,
        gameId: gameId || null,
        gameName: gameName || null,
        name,
        title: title || null,
        role: role || null,
        category: category || null,
        element: element || null,
        path: path || null,
        weapon: weapon || null,
        rarity: rarity || null,
        nation: nation || null,
        birthday: birthday || null,
        health: health ? Number(health) : null,
        damage: damage ? Number(damage) : null,
        difficulty: difficulty || null,
        pickRate: pickRate ? Number(pickRate) : null,
        banRate: banRate ? Number(banRate) : null,
        winRate: winRate ? Number(winRate) : null,
        avatarUrl: avatarUrl || null,
        splashArt: splashArt || null,
        accentColor: accentColor || "#00F5FF",
        rank: rank !== undefined ? Number(rank) : 0,
        likes: likes !== undefined ? Number(likes) : 0,
        isFavorite: isFavorite !== undefined ? Boolean(isFavorite) : true,
        notes: notes || null,
        stats: stats || null,
        tags: tags || null,
        links: links || null,
      },
    });

    return NextResponse.json(newChar);
  } catch (error: any) {
    console.error("POST /api/game-characters error:", error);
    return NextResponse.json({ error: error.message || "Failed to create game character" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing character ID" }, { status: 400 });
    }

    const updatedChar = await prisma.gameCharacter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedChar);
  } catch (error: any) {
    console.error("PUT /api/game-characters error:", error);
    return NextResponse.json({ error: error.message || "Failed to update game character" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing character ID" }, { status: 400 });
    }

    await prisma.gameCharacter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/game-characters error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete game character" }, { status: 500 });
  }
}
