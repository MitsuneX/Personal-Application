import { NextResponse } from "next/server";
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
    if (!user && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const audioUrl = searchParams.get("url");

    if (!audioUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    if (audioUrl.includes("youtube.com") || audioUrl.includes("youtu.be")) {
      return NextResponse.json(
        { supported: false, reason: "YouTube direct audio download is restricted." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s stream timeout

    const res = await fetch(audioUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch audio stream" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const filename = audioUrl.split("/").pop()?.split("?")[0] || "audio.mp3";

    return new NextResponse(res.body as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[MusicDownload API Exception]:", error);
    return NextResponse.json({ error: error.message || "Download proxy failed" }, { status: 500 });
  }
}
