import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY || "2d348a4752c00222a0756a642871b56a";
const MUSIXMATCH_BASE_URL = "https://api.musixmatch.com/ws/1.1";

const GENIUS_HOST = process.env.RAPIDAPI_GENIUS_HOST || "genius-song-lyrics1.p.rapidapi.com";
const GENIUS_KEY = process.env.RAPIDAPI_GENIUS_KEY || "df9e0323d6msh568900fd5ed78d5p126d02jsn11cf11d83c9";

export interface LyricLine {
  id: number;
  time: number; // timestamp in seconds
  original: string;
  romanized?: string;
  translation?: string;
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

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

function sanitizeLyricText(text: string): string {
  if (!text) return "";

  const decoded = decodeHTMLEntities(text);

  return decoded
    .replace(/^\d*\s*Contributors\s*/gi, "")
    .replace(/Contributors\s*Translations[^\n]*/gi, "")
    .replace(/^Translations[^\n]*/gm, "")
    .replace(/(?:English|Español|Türkçe|Svenska|Polski|Français|Deutsch|Português|Italiano|Русский|한국어|日本語|中文|Tiếng Việt)+/gi, "")
    .replace(/\b\d+K?\s*Embed\b/gi, "")
    .replace(/\bYou might also like\b/gi, "")
    .replace(/\bHow to Format Lyrics\b/gi, "")
    .replace(/\bSee [^\n]* Live\b/gi, "")
    .replace(/\bGet tickets for [^\n]*\b/gi, "")
    .replace(/URLCopyEmbedCopy/gi, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^\d*\s*Contributors/i.test(line)) return false;
      if (/^Translations/i.test(line)) return false;
      if (/^Embed$/i.test(line)) return false;
      if (/^You might also like$/i.test(line)) return false;
      if (/^URLCopyEmbedCopy$/i.test(line)) return false;
      return true;
    })
    .join("\n");
}

function cleanTrackTitle(title: string): string {
  return title
    .replace(/\b(official\s+music\s+video|official\s+video|official\s+audio|lyric\s+video|lyrics|official\s+mv|mv|hd|4k|audio|visualizer)\b/gi, "")
    .replace(/\b(ft\.|feat\.|featuring)\s+.*$/gi, "")
    .trim() || title;
}

/**
 * ── PROVIDER 1: MUSIXMATCH API SERVICE ──────────────────────────────────────
 */
async function fetchMusixmatchLyrics(track: string, artist: string) {
  try {
    const cleanT = cleanTrackTitle(track);
    const cleanA = artist.toLowerCase() === "unknown artist" ? "" : artist.trim();

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // 1. Matcher Endpoint (`matcher.lyrics.get`)
    console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Step 1: Trying Matcher Endpoint for track="${cleanT}", artist="${cleanA}"`);
    const matcherUrl = `${MUSIXMATCH_BASE_URL}/matcher.lyrics.get?q_artist=${encodeURIComponent(cleanA)}&q_track=${encodeURIComponent(cleanT)}&apikey=${MUSIXMATCH_API_KEY}`;
    
    try {
      const matcherRes = await fetch(matcherUrl, { headers, signal: controller.signal });
      if (matcherRes.ok) {
        const matcherData = await matcherRes.json();
        const statusCode = matcherData.message?.header?.status_code;
        const lyricsBody = matcherData.message?.body?.lyrics?.lyrics_body;

        if (statusCode === 200 && lyricsBody) {
          clearTimeout(timeoutId);
          console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Matcher Endpoint HIT!`);
          return {
            source: "Musixmatch Matcher",
            title: cleanT,
            artist: cleanA || "Unknown Artist",
            rawLyrics: lyricsBody.replace(/\*+\s*This Lyrics is NOT for Commercial use\s*\*+/gi, "").trim(),
            hasSubtitles: false,
          };
        }
      }

      // 2. Track Search Endpoint (`track.search`) & Subtitles / RichSync (`track.subtitle.get`)
      console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Step 2: Trying Track Search Endpoint...`);
      const searchUrl = `${MUSIXMATCH_BASE_URL}/track.search?q_artist=${encodeURIComponent(cleanA)}&q_track=${encodeURIComponent(cleanT)}&page_size=3&s_track_rating=desc&apikey=${MUSIXMATCH_API_KEY}`;
      const searchRes = await fetch(searchUrl, { headers, signal: controller.signal });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const tracks = searchData.message?.body?.track_list || [];
        if (tracks.length > 0) {
          const topTrack = tracks[0].track;
          const trackId = topTrack.track_id;
          console.log(`[Lyrics API] 🎵 [MUSIXMATCH] Track Search HIT! Track ID: ${trackId} ("${topTrack.track_name}" by "${topTrack.artist_name}")`);

          // Check if rich-sync subtitle LRC data exists
          if (topTrack.has_subtitles === 1) {
            const subUrl = `${MUSIXMATCH_BASE_URL}/track.subtitle.get?track_id=${trackId}&subtitle_format=lrc&apikey=${MUSIXMATCH_API_KEY}`;
            const subRes = await fetch(subUrl, { headers, signal: controller.signal });
            if (subRes.ok) {
              const subData = await subRes.json();
              const subtitleBody = subData.message?.body?.subtitle?.subtitle_body;
              if (subtitleBody) {
                clearTimeout(timeoutId);
                console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Subtitle/RichSync LRC Data HIT!`);
                return {
                  source: "Musixmatch Subtitles (RichSync)",
                  title: topTrack.track_name || cleanT,
                  artist: topTrack.artist_name || cleanA,
                  rawLyrics: subtitleBody,
                  hasSubtitles: true,
                  trackId: trackId,
                };
              }
            }
          }

          // Fallback to track lyrics get (`track.lyrics.get`)
          const lyricsGetUrl = `${MUSIXMATCH_BASE_URL}/track.lyrics.get?track_id=${trackId}&apikey=${MUSIXMATCH_API_KEY}`;
          const lyricsGetRes = await fetch(lyricsGetUrl, { headers, signal: controller.signal });
          if (lyricsGetRes.ok) {
            const lyricsGetData = await lyricsGetRes.json();
            const lyricsBody = lyricsGetData.message?.body?.lyrics?.lyrics_body;
            if (lyricsBody) {
              clearTimeout(timeoutId);
              console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ Track Lyrics Get HIT!`);
              return {
                source: "Musixmatch Track Search",
                title: topTrack.track_name || cleanT,
                artist: topTrack.artist_name || cleanA,
                rawLyrics: lyricsBody.replace(/\*+\s*This Lyrics is NOT for Commercial use\s*\*+/gi, "").trim(),
                hasSubtitles: false,
                trackId: trackId,
              };
            }
          }
        }
      }
      clearTimeout(timeoutId);
    } catch {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    console.warn("[Lyrics API] Musixmatch Provider Exception:", e);
  }

  return null;
}

/**
 * ── PROVIDER 2: LRCLIB API SERVICE ─────────────────────────────────────────
 */
async function fetchLrcLibLyrics(track: string, artist: string) {
  try {
    const cleanT = cleanTrackTitle(track);
    const cleanA = artist.toLowerCase() === "unknown artist" ? "" : artist.trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanT)}&artist_name=${encodeURIComponent(cleanA)}`;
    try {
      const res = await fetch(lrcUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          return {
            source: "LRCLib (Synced)",
            title: data.trackName || cleanT,
            artist: data.artistName || cleanA,
            rawLyrics: data.syncedLyrics,
            hasSubtitles: true,
          };
        }
        if (data.plainLyrics) {
          return {
            source: "LRCLib (Plain)",
            title: data.trackName || cleanT,
            artist: data.artistName || cleanA,
            rawLyrics: data.plainLyrics,
            hasSubtitles: false,
          };
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    console.warn("[Lyrics API] LRCLib Exception:", e);
  }
  return null;
}

/**
 * ── PROVIDER 3: GENIUS API SERVICE ──────────────────────────────────────────
 */
async function fetchGeniusLyrics(track: string, artist: string) {
  try {
    const cleanT = cleanTrackTitle(track);
    const cleanA = artist.toLowerCase() === "unknown artist" ? "" : artist.trim();

    const headers = {
      "X-RapidAPI-Key": GENIUS_KEY,
      "X-RapidAPI-Host": GENIUS_HOST,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const searchUrl = `https://${GENIUS_HOST}/search/?q=${encodeURIComponent(`${cleanT} ${cleanA}`)}`;
    try {
      const res = await fetch(searchUrl, { headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const hits = data.hits || [];
        if (hits.length > 0) {
          const hit = hits[0].result;
          if (hit) {
            return {
              source: "Genius API",
              title: hit.title || cleanT,
              artist: hit.primary_artist?.name || cleanA,
              headerImage: hit.header_image_url || hit.song_art_image_url,
              rawLyrics: `[Track: ${hit.title}]\n[Artist: ${hit.primary_artist?.name || cleanA}]\n\nLyrics available on Genius.\nVisit: ${hit.url || "https://genius.com"}`,
              hasSubtitles: false,
            };
          }
        }
      }
      clearTimeout(timeoutId);
    } catch {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    console.warn("[Lyrics API] Genius Exception:", e);
  }
  return null;
}



// ── MAIN ROUTE HANDLER ────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackParam = searchParams.get("track") || "";
    const artistParam = searchParams.get("artist") || "";
    const songId = searchParams.get("songId") || "";

    if (!trackParam && !songId) {
      return NextResponse.json({ error: "Missing track name or songId" }, { status: 400 });
    }

    console.log("==================================================");
    console.log("[Lyrics API] RAW REQUEST -> Track:", JSON.stringify(trackParam), "Artist:", JSON.stringify(artistParam));

    // 0. DB-FIRST CACHE CHECK
    if (songId || (trackParam && artistParam)) {
      try {
        const existingSong = await prisma.song.findFirst({
          where: songId
            ? { id: songId }
            : {
                title: { equals: trackParam, mode: "insensitive" },
                artist: { equals: artistParam, mode: "insensitive" },
              },
        });

        if (existingSong && existingSong.lyrics) {
          try {
            const cachedLines: LyricLine[] = JSON.parse(existingSong.lyrics);
            if (Array.isArray(cachedLines) && cachedLines.length > 0) {
              console.log("[Lyrics API] ⚡ DB CACHE HIT for track:", existingSong.title);
              return NextResponse.json({
                isFallback: false,
                isSynced: cachedLines.some((l) => l.time > 0),
                provider: "Database Cache",
                title: existingSong.title,
                artist: existingSong.artist,
                lines: cachedLines,
              });
            }
          } catch {
            // Raw text fallback if stored unparsed
          }
        }
      } catch (err) {
        console.warn("[Lyrics API] DB cache lookup exception:", err);
      }
    }

    let lyricsPayload: any = null;

    // 1. PRIMARY PROVIDER: MUSIXMATCH
    lyricsPayload = await fetchMusixmatchLyrics(trackParam, artistParam);

    // 2. SECONDARY PROVIDER: LRCLIB (FREE SYNCED LRC REPOSITORY)
    if (!lyricsPayload) {
      console.log("[Lyrics API] ℹ️ Musixmatch returned no hits. Trying LRCLib API...");
      lyricsPayload = await fetchLrcLibLyrics(trackParam, artistParam);
    }

    // 3. TERTIARY PROVIDER: GENIUS
    if (!lyricsPayload) {
      console.log("[Lyrics API] ℹ️ LRCLib returned no hits. Trying Genius API...");
      lyricsPayload = await fetchGeniusLyrics(trackParam, artistParam);
    }

    // 4. FINAL VALIDATION: ALL PROVIDERS FAILED
    if (!lyricsPayload || !lyricsPayload.rawLyrics) {
      console.log(`[Lyrics API] ❌ ALL PROVIDERS FAILED for track "${trackParam}"`);
      return NextResponse.json({
        isFallback: true,
        isSynced: false,
        title: trackParam,
        artist: artistParam || "Unknown Artist",
        message: "No lyrics found for this track. Try searching manually or check back later.",
        lines: [],
      });
    }

    console.log(`[Lyrics API] ✅ FINAL SUCCESS Payload Ready (Provider: ${lyricsPayload.source})`);

    const sanitizedLyrics = sanitizeLyricText(lyricsPayload.rawLyrics);

    // Parse lyrics text into LyricLine[]
    const rawLines = sanitizedLyrics
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const lrcRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
    let hasLrcTimestamps = false;
    const parsedLines: { time: number; text: string }[] = [];

    rawLines.forEach((lineText: string) => {
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

    const ESTIMATED_LINE_DURATION = 4.2;

    const lines: LyricLine[] = parsedLines.map((item, idx) => {
      const lineText = item.text;
      const calculatedTime = hasLrcTimestamps ? item.time : idx * ESTIMATED_LINE_DURATION;

      return {
        id: idx,
        time: calculatedTime,
        original: lineText,
      };
    });

    // AUTO-SAVE CACHED LYRICS TO DB
    if (trackParam && lines.length > 0) {
      try {
        await prisma.song.updateMany({
          where: {
            title: { equals: trackParam, mode: "insensitive" },
            ...(artistParam ? { artist: { equals: artistParam, mode: "insensitive" } } : {}),
          },
          data: { lyrics: JSON.stringify(lines) },
        });
        console.log(`[Lyrics API] 💾 Auto-cached lyrics to DB for "${trackParam}"`);
      } catch (err) {
        console.warn("[Lyrics API] Failed to auto-cache lyrics to DB:", err);
      }
    }

    console.log(`[Lyrics API] Returning ${lines.length} lines for "${lyricsPayload.title}" (Provider: ${lyricsPayload.source})`);

    return NextResponse.json({
      isFallback: false,
      isSynced: hasLrcTimestamps,
      provider: lyricsPayload.source,
      title: lyricsPayload.title || trackParam,
      artist: lyricsPayload.artist || artistParam || "Unknown Artist",
      headerImage: lyricsPayload.headerImage,
      lines: lines,
    });
  } catch (error: any) {
    console.error("[Lyrics API Exception]:", error);
    return NextResponse.json(
      {
        isFallback: true,
        isSynced: false,
        title: "Error",
        artist: "",
        message: "No lyrics found for this track. Try searching manually or check back later.",
        lines: [],
      },
      { status: 500 }
    );
  }
}
