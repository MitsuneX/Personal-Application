import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GENIUS_HOST = "genius-song-lyrics1.p.rapidapi.com";
const GENIUS_KEY = "df9e0323d6msh568900fd5ed78d5p126d02jsn11cf11d83c9";

export interface LyricLine {
  id: number;
  time: number; // in seconds
  original: string;
  romanized?: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track");
    const artist = searchParams.get("artist");

    if (!track) {
      return NextResponse.json({ error: "Missing track name" }, { status: 400 });
    }

    const query = `${artist ? artist + " " : ""}${track}`;
    const headers = {
      "X-RapidAPI-Key": GENIUS_KEY,
      "X-RapidAPI-Host": GENIUS_HOST,
    };

    const searchUrl = `https://${GENIUS_HOST}/search/?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers });
    const data = await res.json();

    const hit = data.hits?.[0]?.result || {};
    const songId = hit.id;

    let cleanLyricsText = "";

    if (songId) {
      const lyricsUrl = `https://${GENIUS_HOST}/song/lyrics/?id=${songId}`;
      const lyricsRes = await fetch(lyricsUrl, { headers });
      const lyricsData = await lyricsRes.json();

      const rawLyrics = lyricsData?.lyrics?.lyrics?.body?.html || lyricsData?.lyrics?.lyrics?.body?.plain || "";
      if (rawLyrics) {
        cleanLyricsText = decodeHTMLEntities(
          rawLyrics
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .trim()
        );
      }
    }

    if (!cleanLyricsText) {
      cleanLyricsText = `[Verse 1]\nListening to ${track}...\nFeel the frequency in harmony.\n\n[Chorus]\nEchoes in the neon light\nGuiding us through the night\n\n[Outro]\nForever playing in the Music Vault.`;
    }

    // Split text into lines
    const rawLines = cleanLyricsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
    let hasLrcTimestamps = false;
    const parsedLines: { time: number; text: string }[] = [];

    rawLines.forEach((lineText) => {
      const match = lineText.match(lrcRegex);
      if (match) {
        hasLrcTimestamps = true;
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) / 1000 : 0;
        const timeInSeconds = mins * 60 + secs + ms;
        parsedLines.push({ time: timeInSeconds, text: match[4] || lineText });
      } else {
        parsedLines.push({ time: 0, text: lineText });
      }
    });

    const ESTIMATED_LINE_DURATION = 4.2; // average line duration

    const lines: LyricLine[] = parsedLines.map((item, idx) => {
      const lineText = item.text;
      const isHeader = lineText.startsWith("[") && lineText.endsWith("]");
      const isAsianText = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(lineText);

      let romanized: string | undefined = undefined;
      if (isAsianText && !isHeader) {
        romanized = `~ ${lineText} ~ (Romaji / Pinyin)`;
      }

      const calculatedTime = hasLrcTimestamps ? item.time : idx * ESTIMATED_LINE_DURATION;

      return {
        id: idx,
        time: calculatedTime,
        original: lineText,
        romanized: romanized,
      };
    });

    return NextResponse.json({
      title: hit.title || track,
      artist: hit.primary_artist?.name || artist || "Unknown Artist",
      headerImage: hit.header_image_url || hit.song_art_image_url,
      lines: lines,
    });
  } catch (error: any) {
    console.error("Lyrics API Exception:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch lyrics" }, { status: 500 });
  }
}
