import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GENIUS_HOST = "genius-song-lyrics1.p.rapidapi.com";
const GENIUS_KEY = "df9e0323d6msh568900fd5ed78d5p126d02jsn11cf11d83c9";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artist = searchParams.get("artist");
    const songId = searchParams.get("songId");

    const headers = {
      "X-RapidAPI-Key": GENIUS_KEY,
      "X-RapidAPI-Host": GENIUS_HOST,
    };

    if (songId) {
      const recUrl = `https://${GENIUS_HOST}/song/recommendations/?id=${songId}`;
      const res = await fetch(recUrl, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (artist) {
      const searchUrl = `https://${GENIUS_HOST}/search/?q=${encodeURIComponent(artist)}`;
      const res = await fetch(searchUrl, { headers });
      const data = await res.json();

      const hits = data.hits || [];
      const topHits = hits.slice(0, 8).map((h: any) => ({
        id: h.result?.id,
        title: h.result?.title,
        artist: h.result?.primary_artist?.name,
        artistImageUrl: h.result?.primary_artist?.header_image_url || h.result?.primary_artist?.image_url,
        songImageUrl: h.result?.song_art_image_url || h.result?.header_image_url,
        url: h.result?.url,
      }));

      const firstArtist = hits[0]?.result?.primary_artist || {};

      return NextResponse.json({
        artistName: firstArtist.name || artist,
        artistImageUrl: firstArtist.header_image_url || firstArtist.image_url || null,
        artistUrl: firstArtist.url || null,
        topSongs: topHits,
      });
    }

    return NextResponse.json({ error: "Missing artist or songId param" }, { status: 400 });
  } catch (error: any) {
    console.error("Genius API exception:", error);
    return NextResponse.json({ error: error.message || "Internal Genius API error" }, { status: 500 });
  }
}
