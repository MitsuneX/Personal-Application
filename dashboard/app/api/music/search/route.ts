import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyBxIUvFzd_JFaz1Uh2pXivZCRSxgZ8RHoA";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [], items: [] });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(
      query.trim()
    )}&type=video&key=${YOUTUBE_API_KEY}`;

    try {
      const res = await fetch(ytUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.error) {
        console.error("YouTube API error:", data.error);
        return NextResponse.json({ error: data.error.message || "YouTube search failed" }, { status: 400 });
      }

      const items = data.items || [];
      const results = items.map((item: any) => ({
        id: item.id?.videoId || Math.random().toString(),
        youtubeId: item.id?.videoId,
        title: item.snippet?.title || "Unknown Track",
        artist: item.snippet?.channelTitle || "Unknown Artist",
        imageUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
        description: item.snippet?.description || "",
        publishedAt: item.snippet?.publishedAt || "",
      }));

      return NextResponse.json({ results, items: results });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({ error: "YouTube search request timed out" }, { status: 504 });
      }
      throw fetchErr;
    }
  } catch (error: any) {
    console.error("YouTube search API exception:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

