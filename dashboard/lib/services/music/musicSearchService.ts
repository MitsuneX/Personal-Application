import { SongEntry } from "@/lib/store/dashboardStore";

export type AudioSourceType = "vault" | "youtube" | "direct" | "soundcloud";

export interface MusicSearchResult {
  id: string;
  youtubeId?: string;
  soundcloudId?: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  duration?: string;
  audioUrl?: string;
  source: AudioSourceType;
}

export interface IAudioSourceResolver {
  name: AudioSourceType;
  canResolve: (urlOrId: string) => boolean;
  resolveMetadata: (urlOrId: string, signal?: AbortSignal) => Promise<Partial<MusicSearchResult> | null>;
}

export async function searchMusic(
  query: string,
  localSongs: SongEntry[] = [],
  signal?: AbortSignal
): Promise<MusicSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const q = query.trim().toLowerCase();

  // 1. Filter local vault songs
  const localMatches: MusicSearchResult[] = localSongs
    .filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.album && s.album.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
    )
    .map((s) => ({
      id: s.id,
      youtubeId: s.youtubeId,
      title: s.title,
      artist: s.artist,
      album: s.album,
      imageUrl: s.imageUrl,
      duration: s.duration,
      audioUrl: s.audioUrl,
      source: "vault" as const,
    }));

  // 2. Fetch online YouTube search results
  let onlineResults: MusicSearchResult[] = [];
  try {
    const res = await fetch(`/api/music/search?q=${encodeURIComponent(query.trim())}`, {
      signal,
    });
    if (res.ok) {
      const data = await res.json();
      const items = data.results || data.items || [];
      onlineResults = items.map((item: any) => ({
        id: item.id || item.youtubeId,
        youtubeId: item.youtubeId,
        title: item.title,
        artist: item.artist,
        imageUrl: item.imageUrl,
        source: "youtube" as const,
      }));
    }
  } catch (err) {
    console.warn("[MusicSearchService] Online search error:", err);
  }

  // 3. Deduplicate (vault takes priority over online results with same youtubeId)
  const vaultYtIds = new Set(localMatches.map((m) => m.youtubeId).filter(Boolean));
  const filteredOnline = onlineResults.filter(
    (item) => !item.youtubeId || !vaultYtIds.has(item.youtubeId)
  );

  return [...localMatches, ...filteredOnline];
}
