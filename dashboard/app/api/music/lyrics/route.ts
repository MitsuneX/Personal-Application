import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSearchPermutations, SearchPermutation } from "@/lib/music/lyricsNormalizer";

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

/**
 * ── PROVIDER 1: MUSIXMATCH API SERVICE (MULTI-PASS) ─────────────────────────
 */
async function fetchMusixmatchPermutations(permutations: SearchPermutation[]) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
  };

  // Limit to top 5 permutations for Musixmatch to preserve quota
  const passes = permutations.slice(0, 5);

  for (let idx = 0; idx < passes.length; idx++) {
    const { track, artist, reason } = passes[idx];
    console.log(
      `[Lyrics API] 🔍 [MUSIXMATCH Pass ${idx + 1}/${passes.length}] Trying "${track}" by "${artist || "(no artist)"}" (${reason})`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // 1. Matcher Endpoint (`matcher.lyrics.get`)
      const matcherUrl = `${MUSIXMATCH_BASE_URL}/matcher.lyrics.get?q_artist=${encodeURIComponent(
        artist
      )}&q_track=${encodeURIComponent(track)}&apikey=${MUSIXMATCH_API_KEY}`;
      const matcherRes = await fetch(matcherUrl, { headers, signal: controller.signal });

      if (matcherRes.ok) {
        const matcherData = await matcherRes.json();
        const statusCode = matcherData.message?.header?.status_code;
        const lyricsBody = matcherData.message?.body?.lyrics?.lyrics_body;

        if (statusCode === 200 && lyricsBody) {
          clearTimeout(timeoutId);
          console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ HIT via Matcher Endpoint on Pass ${idx + 1}!`);
          return {
            source: `Musixmatch (${reason})`,
            title: track,
            artist: artist || "Unknown Artist",
            rawLyrics: lyricsBody.replace(/\*+\s*This Lyrics is NOT for Commercial use\s*\*+/gi, "").trim(),
            hasSubtitles: false,
          };
        }
      }

      // 2. Track Search Endpoint (`track.search`)
      const searchUrl = `${MUSIXMATCH_BASE_URL}/track.search?q_artist=${encodeURIComponent(
        artist
      )}&q_track=${encodeURIComponent(track)}&page_size=3&s_track_rating=desc&apikey=${MUSIXMATCH_API_KEY}`;
      const searchRes = await fetch(searchUrl, { headers, signal: controller.signal });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const tracks = searchData.message?.body?.track_list || [];

        if (tracks.length > 0) {
          const topTrack = tracks[0].track;
          const trackId = topTrack.track_id;

          // Check if rich-sync subtitle LRC data exists
          if (topTrack.has_subtitles === 1) {
            const subUrl = `${MUSIXMATCH_BASE_URL}/track.subtitle.get?track_id=${trackId}&subtitle_format=lrc&apikey=${MUSIXMATCH_API_KEY}`;
            const subRes = await fetch(subUrl, { headers, signal: controller.signal });
            if (subRes.ok) {
              const subData = await subRes.json();
              const subtitleBody = subData.message?.body?.subtitle?.subtitle_body;
              if (subtitleBody) {
                clearTimeout(timeoutId);
                console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ HIT Subtitle/RichSync LRC on Pass ${idx + 1}!`);
                return {
                  source: `Musixmatch RichSync (${reason})`,
                  title: topTrack.track_name || track,
                  artist: topTrack.artist_name || artist,
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
              console.log(`[Lyrics API] 🎵 [MUSIXMATCH] ✅ HIT Track Search Lyrics on Pass ${idx + 1}!`);
              return {
                source: `Musixmatch Search (${reason})`,
                title: topTrack.track_name || track,
                artist: topTrack.artist_name || artist,
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
  }

  return null;
}

/**
 * ── PROVIDER 2: LRCLIB API SERVICE (MULTI-PASS) ───────────────────────────
 */
async function fetchLrcLibPermutations(permutations: SearchPermutation[]) {
  // Try up to 6 permutations for LRCLib
  const passes = permutations.slice(0, 6);

  for (let idx = 0; idx < passes.length; idx++) {
    const { track, artist, reason } = passes[idx];
    console.log(
      `[Lyrics API] 🔍 [LRCLIB Pass ${idx + 1}/${passes.length}] Trying "${track}" by "${artist || "(no artist)"}" (${reason})`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 1. Direct GET endpoint
    const lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(
      artist
    )}`;

    try {
      const res = await fetch(lrcUrl, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          clearTimeout(timeoutId);
          console.log(`[Lyrics API] 🎵 [LRCLIB] ✅ HIT Synced LRC on Pass ${idx + 1}!`);
          return {
            source: `LRCLib Synced (${reason})`,
            title: data.trackName || track,
            artist: data.artistName || artist,
            rawLyrics: data.syncedLyrics,
            hasSubtitles: true,
          };
        }
        if (data.plainLyrics) {
          clearTimeout(timeoutId);
          console.log(`[Lyrics API] 🎵 [LRCLIB] ✅ HIT Plain Lyrics on Pass ${idx + 1}!`);
          return {
            source: `LRCLib Plain (${reason})`,
            title: data.trackName || track,
            artist: data.artistName || artist,
            rawLyrics: data.plainLyrics,
            hasSubtitles: false,
          };
        }
      }

      // 2. Search Endpoint Fallback
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${artist}`.trim())}`;
      const searchRes = await fetch(searchUrl, { signal: controller.signal });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0) {
          const matchItem = searchData.find((item) => item.syncedLyrics || item.plainLyrics) || searchData[0];

          if (matchItem.syncedLyrics || matchItem.plainLyrics) {
            clearTimeout(timeoutId);
            console.log(`[Lyrics API] 🎵 [LRCLIB] ✅ HIT Search Endpoint on Pass ${idx + 1}!`);
            return {
              source: `LRCLib Search (${reason})`,
              title: matchItem.trackName || track,
              artist: matchItem.artistName || artist,
              rawLyrics: matchItem.syncedLyrics || matchItem.plainLyrics,
              hasSubtitles: !!matchItem.syncedLyrics,
            };
          }
        }
      }

      clearTimeout(timeoutId);
    } catch {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

/**
 * ── PROVIDER 3: GENIUS API SERVICE (MULTI-PASS) ────────────────────────────
 */
async function fetchGeniusPermutations(permutations: SearchPermutation[]) {
  const headers = {
    "X-RapidAPI-Key": GENIUS_KEY,
    "X-RapidAPI-Host": GENIUS_HOST,
  };

  const passes = permutations.slice(0, 5);

  for (let idx = 0; idx < passes.length; idx++) {
    const { track, artist, reason } = passes[idx];
    const query = `${track} ${artist}`.trim();
    console.log(
      `[Lyrics API] 🔍 [GENIUS Pass ${idx + 1}/${passes.length}] Querying "${query}" (${reason})`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const searchUrl = `https://${GENIUS_HOST}/search/?q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(searchUrl, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const hits = data.hits || [];
        if (hits.length > 0) {
          const hit = hits[0].result;
          if (hit) {
            console.log(`[Lyrics API] 🎵 [GENIUS] ✅ HIT on Pass ${idx + 1}! Song: "${hit.title}" by "${hit.primary_artist?.name}"`);
            return {
              source: `Genius API (${reason})`,
              title: hit.title || track,
              artist: hit.primary_artist?.name || artist,
              headerImage: hit.header_image_url || hit.song_art_image_url,
              rawLyrics: `[Track: ${hit.title}]\n[Artist: ${hit.primary_artist?.name || artist}]\n\nLyrics available on Genius.\nVisit: ${hit.url || "https://genius.com"}`,
              hasSubtitles: false,
            };
          }
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }
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

    // Generate normalized search permutations
    const permutations = generateSearchPermutations(trackParam, artistParam);
    console.log(`[Lyrics API] 🧠 Normalized into ${permutations.length} Search Permutations:`);
    permutations.forEach((p, i) => {
      console.log(`  └─ [${i + 1}] Track: "${p.track}" | Artist: "${p.artist}" (${p.reason})`);
    });

    // 0. DB-FIRST CACHE CHECK ACROSS PERMUTATIONS
    for (const p of permutations.slice(0, 3)) {
      try {
        const existingSong = await prisma.song.findFirst({
          where: songId
            ? { id: songId }
            : {
                title: { equals: p.track, mode: "insensitive" },
                ...(p.artist ? { artist: { equals: p.artist, mode: "insensitive" } } : {}),
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
            // Unparsed raw fallback
          }
        }
      } catch (err) {
        console.warn("[Lyrics API] DB cache lookup exception:", err);
      }
    }

    let lyricsPayload: any = null;

    // 1. PRIMARY PROVIDER: MUSIXMATCH MULTI-PASS
    console.log("[Lyrics API] 🚀 [PROVIDER 1] Starting Musixmatch Multi-Pass Search...");
    lyricsPayload = await fetchMusixmatchPermutations(permutations);

    // 2. SECONDARY PROVIDER: LRCLIB MULTI-PASS
    if (!lyricsPayload) {
      console.log("[Lyrics API] ℹ️ Musixmatch returned no hits across permutations. Starting LRCLib Multi-Pass Search...");
      lyricsPayload = await fetchLrcLibPermutations(permutations);
    }

    // 3. TERTIARY PROVIDER: GENIUS MULTI-PASS
    if (!lyricsPayload) {
      console.log("[Lyrics API] ℹ️ LRCLib returned no hits across permutations. Starting Genius Multi-Pass Search...");
      lyricsPayload = await fetchGeniusPermutations(permutations);
    }

    // 4. FINAL VALIDATION: ALL PROVIDERS & PERMUTATIONS EXHAUSTED
    if (!lyricsPayload || !lyricsPayload.rawLyrics) {
      console.log(`[Lyrics API] ❌ ALL ${permutations.length} PERMUTATIONS EXHAUSTED ON ALL PROVIDERS for track "${trackParam}"`);
      return NextResponse.json({
        isFallback: true,
        isSynced: false,
        title: trackParam,
        artist: artistParam || "Unknown Artist",
        message: "No lyrics found for this track after exhausting all normalized title/artist combinations.",
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
