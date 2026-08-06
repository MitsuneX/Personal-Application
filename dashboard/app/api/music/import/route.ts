import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyBxIUvFzd_JFaz1Uh2pXivZCRSxgZ8RHoA";

export async function POST(req: Request) {
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

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // 1. Check if URL is YouTube link (videos, Shorts, YouTube Music, shorts, embed)
    const ytMatch = trimmedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|music\.youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/i);

    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(ytApiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const item = data.items?.[0];
          if (item) {
            const snippet = item.snippet || {};
            const durationIso = item.contentDetails?.duration || "";

            // Format ISO 8601 duration (PT3M45S -> 3:45)
            let formattedDuration = "3:30";
            const durMatch = durationIso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (durMatch) {
              const hrs = parseInt(durMatch[1] || "0", 10);
              const mins = parseInt(durMatch[2] || "0", 10);
              const secs = parseInt(durMatch[3] || "0", 10);
              if (hrs > 0) {
                formattedDuration = `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
              } else {
                formattedDuration = `${mins}:${secs.toString().padStart(2, "0")}`;
              }
            }

            return NextResponse.json({
              success: true,
              sourceType: "youtube",
              song: {
                id: "song-" + Date.now(),
                title: snippet.title || "Unknown Title",
                artist: snippet.channelTitle || "Unknown Artist",
                category: "All-Time Favorites",
                imageUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || null,
                youtubeId: videoId,
                duration: formattedDuration,
              },
            });
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("[MusicImport API] YouTube fetch error:", err);
      }

      // Fallback if YouTube API fails but videoId was parsed
      return NextResponse.json({
        success: true,
        sourceType: "youtube",
        song: {
          id: "song-" + Date.now(),
          title: "YouTube Video (" + videoId + ")",
          artist: "Unknown Channel",
          category: "All-Time Favorites",
          imageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          youtubeId: videoId,
          duration: "3:30",
        },
      });
    }

    // 2. Direct Audio File (.mp3, .m4a, .flac, .wav, .ogg)
    const isDirectAudio = /\.(mp3|m4a|flac|wav|ogg)(\?.*)?$/i.test(trimmedUrl);
    if (isDirectAudio) {
      const filename = trimmedUrl.split("/").pop()?.split("?")[0] || "Track";
      const cleanName = decodeURIComponent(filename.replace(/\.(mp3|m4a|flac|wav|ogg)$/i, ""));

      return NextResponse.json({
        success: true,
        sourceType: "audioUrl",
        song: {
          id: "song-" + Date.now(),
          title: cleanName,
          artist: "Uploaded Artist",
          category: "All-Time Favorites",
          audioUrl: trimmedUrl,
          duration: "3:30",
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported URL type. Please provide a valid YouTube link or direct audio file URL." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[MusicImport API Exception]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
