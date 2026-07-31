/**
 * Global Search Engine & Centralized Search Registry
 * Every module across the application registers its search provider into this registry.
 * Provides fuzzy, case-insensitive, multi-field matching with zero duplicate entries.
 */

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  module: string;
  category?: string;
  url: string;
  keywords?: string[];
  accentColor?: string;
}

export interface SearchProvider {
  id: string;
  name: string;
  module: string;
  icon: string;
  search: (query: string, rawData: any) => SearchResultItem[];
}

const registeredProviders: Map<string, SearchProvider> = new Map();

export function registerSearchProvider(provider: SearchProvider) {
  registeredProviders.set(provider.id, provider);
}

export function getSearchProviders(): SearchProvider[] {
  return Array.from(registeredProviders.values());
}

/** Utility helper for fuzzy & case-insensitive match check across multiple fields */
export function matchesQuery(query: string, fields: (string | undefined | null)[]): boolean {
  const normQuery = query.trim().toLowerCase();
  if (!normQuery) return false;

  const words = normQuery.split(/\s+/).filter(Boolean);

  return fields.some((field) => {
    if (!field) return false;
    const normField = field.toLowerCase();
    return words.every((word) => normField.includes(word));
  });
}

// ─── Default Core Search Providers ────────────────────────────────────────────

// 1. Visit Project Hub Provider
registerSearchProvider({
  id: "projects",
  name: "Visit Projects",
  module: "Visit Project Hub",
  icon: "🌐",
  search: (query, data) => {
    const projects: any[] = data.projects || [];
    return projects
      .filter((p) =>
        matchesQuery(query, [
          p.name,
          p.description,
          p.category,
          p.status,
          p.version,
          ...(Array.isArray(p.techStack) ? p.techStack : []),
          ...(Array.isArray(p.tags) ? p.tags : []),
        ])
      )
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `Project · ${p.category} · Status: ${p.status} · ${p.version || "v1.0.0"}`,
        icon: p.logo || "🌐",
        module: "Visit Project Hub",
        category: p.category,
        url: p.websiteUrl && p.websiteUrl.startsWith("/") ? p.websiteUrl : "/visit",
        accentColor: p.accentColor || "#00F5FF",
      }));
  },
});

// 2. Games HUD & Database Provider
registerSearchProvider({
  id: "games",
  name: "Game Database & Dossiers",
  module: "Game Database",
  icon: "🎮",
  search: (query, data) => {
    const games: any[] = data.games || [];
    return games
      .filter((g) =>
        matchesQuery(query, [
          g.game,
          g.mainCharacter,
          g.category,
          g.platform,
          g.rank,
          g.handle,
          g.mainRole,
        ])
      )
      .map((g) => ({
        id: g.id,
        title: g.game,
        subtitle: `Game Dossier · ${g.category} · Platform: ${g.platform} · Main: ${g.mainCharacter}`,
        icon: g.icon || "🎮",
        module: "Game Database",
        category: g.category,
        url: `/games/${g.id}`,
        accentColor: g.accentColor || "#FF6B35",
      }));
  },
});

// 3. Game Characters & Roster Provider
registerSearchProvider({
  id: "dossierCharacters",
  name: "Game Characters & Intelligence",
  module: "Statistics Scanner",
  icon: "📊",
  search: (query, data) => {
    const chars: any[] = data.dossierCharacters || [];
    return chars
      .filter((c) =>
        matchesQuery(query, [
          c.name,
          c.category,
          c.role,
          c.levelRank,
          c.notes,
        ])
      )
      .map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `Character · Role: ${c.category} ${c.role ? `(${c.role})` : ""} · Level: ${c.levelRank || "N/A"}`,
        icon: "📊",
        module: "Statistics Scanner",
        category: c.category,
        url: `/games/${c.gameId}`,
        accentColor: c.accentColor || "#10B981",
      }));
  },
});

// 4. Game Showcase Items Provider
registerSearchProvider({
  id: "gameShowcaseItems",
  name: "Showcase Gallery Memories",
  module: "Showcase Gallery",
  icon: "🖼️",
  search: (query, data) => {
    const showcase: any[] = data.gameShowcaseItems || [];
    return showcase
      .filter((item) =>
        matchesQuery(query, [
          item.title,
          item.description,
          item.category,
          ...(Array.isArray(item.tags) ? item.tags : []),
        ])
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `Showcase Memory · Category: ${item.category || "General"} · ${item.description || ""}`,
        icon: "🖼️",
        module: "Showcase Gallery",
        category: item.category,
        url: `/games/${item.gameId}`,
        accentColor: "#BF5FFF",
      }));
  },
});

// 5. Bookmarks & Links Provider
registerSearchProvider({
  id: "links",
  name: "Bookmarks & Links",
  module: "Bookmarks Directory",
  icon: "🔗",
  search: (query, data) => {
    const links: any[] = data.links || [];
    return links
      .filter((l) => matchesQuery(query, [l.title, l.category, l.url]))
      .map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: `Bookmark · Category: ${l.category} · URL: ${l.url}`,
        icon: "🔗",
        module: "Bookmarks Directory",
        category: l.category,
        url: "/links",
      }));
  },
});

// 6. Notepad Workspace Provider
registerSearchProvider({
  id: "notes",
  name: "Notepad Workspace & Memos",
  module: "Notepad Workspace",
  icon: "📝",
  search: (query, data) => {
    const notes: any[] = data.notes || [];
    return notes
      .filter((n) => matchesQuery(query, [n.title, n.content]))
      .map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: `Note Memo · ${n.content ? n.content.slice(0, 60) : ""}...`,
        icon: "📝",
        module: "Notepad Workspace",
        url: "/notepad",
      }));
  },
});

// 7. Anime Series Provider
registerSearchProvider({
  id: "anime",
  name: "Anime Zone & Series",
  module: "Anime Zone",
  icon: "⛩️",
  search: (query, data) => {
    const anime: any[] = data.animeList || [];
    return anime
      .filter((a) =>
        matchesQuery(query, [a.title, a.genre, a.studio, a.status, a.synopsis])
      )
      .map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: `Anime · ${a.genre || "General"} · ${a.episodesWatched}/${a.totalEpisodes} eps · ${a.status}`,
        icon: "⛩️",
        module: "Anime Zone",
        category: a.genre,
        url: "/anime",
      }));
  },
});

// 8. Drama Series Provider
registerSearchProvider({
  id: "dramas",
  name: "Drama Hub & Movies",
  module: "Drama Hub",
  icon: "🎬",
  search: (query, data) => {
    const dramas: any[] = data.dramas || [];
    return dramas
      .filter((d) =>
        matchesQuery(query, [d.title, d.genre, d.country, d.platform, d.status])
      )
      .map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: `Drama · ${d.country ? d.country.toUpperCase() : "INTL"} · ${d.genre} · ${d.episodesWatched}/${d.episodes} eps`,
        icon: "🎬",
        module: "Drama Hub",
        category: d.country,
        url: `/drama/${d.country || "all"}`,
      }));
  },
});

// 9. Music Vault & Songs Provider
registerSearchProvider({
  id: "songs",
  name: "Music Vault & Tracks",
  module: "Music Vault",
  icon: "🎵",
  search: (query, data) => {
    const songs: any[] = data.songs || [];
    return songs
      .filter((s) =>
        matchesQuery(query, [s.title, s.artist, s.album, s.category, s.lyrics])
      )
      .map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `Song Track · Artist: ${s.artist} · Category: ${s.category}`,
        icon: "🎵",
        module: "Music Vault",
        category: s.category,
        url: "/music",
      }));
  },
});

// 10. Hall of Fame Provider
registerSearchProvider({
  id: "hallOfFame",
  name: "Hall of Fame & Champions",
  module: "Hall of Fame",
  icon: "🏆",
  search: (query, data) => {
    const hof: any[] = data.hallOfFame || [];
    return hof
      .filter((t) =>
        matchesQuery(query, [
          t.name,
          t.type,
          t.status,
          t.nationality,
          t.note,
          t.tokusatsuShow,
          t.tokusatsuFranchise,
        ])
      )
      .map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: `Hall of Fame · ${t.type.toUpperCase()} · Status: ${t.status} · ${t.nationality || "Global"}`,
        icon: "🏆",
        module: "Hall of Fame",
        category: t.type,
        url: "/hall-of-fame",
      }));
  },
});

// 11. Favorite Characters Provider
registerSearchProvider({
  id: "favoriteCharacters",
  name: "Favorite Anime Characters",
  module: "Favorite Characters",
  icon: "📖",
  search: (query, data) => {
    const chars: any[] = data.favoriteCharacters || [];
    return chars
      .filter((c) => matchesQuery(query, [c.name, c.anime]))
      .map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: `Favorite Character · Anime: ${c.anime}`,
        icon: "📖",
        module: "Favorite Characters",
        url: "/characters",
      }));
  },
});

// 12. Media Gallery Provider
registerSearchProvider({
  id: "gallery",
  name: "Media Gallery & Folders",
  module: "Media Gallery",
  icon: "🖼️",
  search: (query, data) => {
    const items: any[] = data.gallery || [];
    return items
      .filter((g) => matchesQuery(query, [g.title, g.caption, g.category, g.folder]))
      .map((g) => ({
        id: g.id,
        title: g.title,
        subtitle: `Media Gallery · Category: ${g.category} · Folder: ${g.folder}`,
        icon: "🖼️",
        module: "Media Gallery",
        category: g.category,
        url: "/gallery",
      }));
  },
});

// 13. Saved AI Prompts Provider
registerSearchProvider({
  id: "savedPrompts",
  name: "Saved AI Prompt Vault",
  module: "Prompt Vault",
  icon: "⚡",
  search: (query, data) => {
    const prompts: any[] = data.savedPrompts || [];
    return prompts
      .filter((p) => matchesQuery(query, [p.title, p.targetAI, p.promptText]))
      .map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: `AI Prompt · Target: ${p.targetAI}`,
        icon: "⚡",
        module: "Prompt Vault",
        url: "/prompt-vault",
      }));
  },
});

/**
 * Execute search across all registered providers
 */
export function searchAllRegistries(query: string, rawData: any): Record<string, SearchResultItem[]> {
  const results: Record<string, SearchResultItem[]> = {};

  for (const provider of registeredProviders.values()) {
    try {
      const items = provider.search(query, rawData);
      if (items && items.length > 0) {
        results[provider.id] = items;
      }
    } catch (err) {
      console.error(`Search error in provider ${provider.id}:`, err);
    }
  }

  return results;
}
