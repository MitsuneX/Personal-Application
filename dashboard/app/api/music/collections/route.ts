import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const collections = await prisma.musicCollection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error("[MusicCollections API Exception]:", error);
    return NextResponse.json({ error: error.message || "Fetch collections failed" }, { status: 500 });
  }
}
