import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");

    const memories = await prisma.musicMemory.findMany({
      where: {
        userId,
        ...(songId ? { songId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ memories });
  } catch (error: any) {
    console.error("[MusicMemories API GET Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { songId, note } = await req.json();
    if (!songId || !note || typeof note !== "string" || !note.trim()) {
      return NextResponse.json({ error: "Song ID and note content are required" }, { status: 400 });
    }

    const memory = await prisma.musicMemory.create({
      data: {
        userId,
        songId,
        note: note.trim(),
      },
    });

    // Optionally log to Timeline
    try {
      await prisma.musicTimeline.create({
        data: {
          userId,
          type: "ADDED_MEMORY",
          entityId: songId,
          metadata: { noteSnippet: note.trim().slice(0, 40) },
        },
      });
    } catch {}

    return NextResponse.json({ success: true, memory });
  } catch (error: any) {
    console.error("[MusicMemories API POST Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const isGuest = cookieStore.get("is_guest")?.value === "true";

    const userId = user?.id || (isGuest ? "guest-demo-user-id" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    await prisma.musicMemory.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MusicMemories API DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
