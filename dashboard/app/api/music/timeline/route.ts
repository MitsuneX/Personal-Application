import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isGuest = cookieStore.get("is_guest")?.value === "true";
    const userId = user?.id || "guest-user";

    if (!user && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const events = await prisma.musicTimeline.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem?.id || null;
    }

    return NextResponse.json({
      events,
      nextCursor,
    });
  } catch (error: any) {
    console.error("[MusicTimeline API Exception]:", error);
    return NextResponse.json({ error: error.message || "Timeline fetch failed" }, { status: 500 });
  }
}
