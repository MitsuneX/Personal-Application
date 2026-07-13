import { create } from "zustand";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface SocialHandle {
  platform: string;
  handle: string;
  url?: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  socials: SocialHandle[];
  skills: string[];
  location: string;
}

// ─── Game Types ───────────────────────────────────────────────────────────────

export type GameCategory = "Gacha RPG" | "Gacha Action" | "MOBA" | "FPS" | "Action RPG" | "Fighting";
export type GameRank = "Iron" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master" | "Grandmaster" | "Challenger" | "Mythic" | "Hero" | "Saiyan" | "ER 75" | "AR 55" | "AR 60";

export interface GameEntry {
  id: string;
  game: string;
  handle?: string;
  platform: "PC" | "PSN" | "Xbox" | "Switch" | "Mobile" | "Multi";
  rank?: string;
  mainCharacter: string;
  mainRole?: string;
  category: GameCategory;
  isActive: boolean;
  accentColor: string;
}

// ─── Media Types ──────────────────────────────────────────────────────────────

export type MediaStatus = "GOAT Status" | "All-Star" | "Rising" | "Classic";
export type AnimeStatus = "Watching" | "Completed" | "On Hold" | "Plan to Watch" | "Dropped";
export type DramaCountry = "japanese" | "korean" | "chinese";
export type DramaStatus = "Watching" | "Completed" | "Plan to Watch" | "On Hold";

export interface ActorEntry {
  id: string;
  name: string;
  status: MediaStatus;
  knownFor: string;
}

export interface MediaEntry {
  topFilm: { title: string; year: number; rating: number; genre: string };
  currentSeries: { title: string; episode: number; totalEpisodes: number; platform: string };
  actors: ActorEntry[];
  actresses: ActorEntry[];
}

export interface AnimeEntry {
  id: string;
  title: string;
  episodesWatched: number;
  totalEpisodes: number;
  status: AnimeStatus;
  rating?: number;
  genre?: string;
  studio?: string;
  year?: number;
}

export interface FavoriteCharacter {
  id: string;
  name: string;
  anime: string;
  isFavorite: boolean;
}

export interface DramaEntry {
  id: string;
  title: string;
  country: DramaCountry;
  episodes: number;
  episodesWatched: number;
  status: DramaStatus;
  rating: number;
  genre: string;
  year: number;
  platform?: string;
  cast?: string[];
}

export interface HallOfFameEntry {
  id: string;
  name: string;
  type: "actor" | "actress" | "anime";
  status: MediaStatus;
  knownFor: string[];
  nationality?: string;
  note?: string;
}

// ─── State Interface ──────────────────────────────────────────────────────────

interface DashboardState {
  profile: ProfileData;
  games: GameEntry[];
  media: MediaEntry;
  animeList: AnimeEntry[];
  favoriteCharacters: FavoriteCharacter[];
  dramas: DramaEntry[];
  hallOfFame: HallOfFameEntry[];
  isLoading: boolean;
  isHydrated: boolean;

  fetchDashboard: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  addGame: (game: GameEntry) => Promise<void>;
  updateGame: (id: string, data: Partial<GameEntry>) => Promise<void>;
  removeGame: (id: string) => Promise<void>;
  updateMedia: (data: Partial<MediaEntry>) => void;
  addAnime: (anime: AnimeEntry) => Promise<void>;
  updateAnime: (id: string, data: Partial<AnimeEntry>) => Promise<void>;
  removeAnime: (id: string) => Promise<void>;
  toggleFavoriteCharacter: (id: string) => Promise<void>;
  addDrama: (drama: DramaEntry) => Promise<void>;
  updateDrama: (id: string, data: Partial<DramaEntry>) => Promise<void>;
  removeDrama: (id: string) => Promise<void>;
}

// ─── Seed Data (Fallback) ──────────────────────────────────────────────────────

const initialProfile: ProfileData = {
  name: "Alex Ryukawa",
  tagline: "Full-Stack Dev · Game Enthusiast · Weeb",
  bio: "Building next-gen web experiences by day, grinding ranked & watching anime by night. Fuelled by coffee and lo-fi beats.",
  avatar: "/avatar.png",
  status: "online",
  location: "Jakarta, ID 🇮🇩",
  skills: ["Next.js", "TypeScript", "Supabase", "Framer Motion", "Rust"],
  socials: [
    { platform: "GitHub", handle: "@alexryukawa", url: "https://github.com" },
    { platform: "Twitter/X", handle: "@alexryukawa", url: "https://x.com" },
    { platform: "Discord", handle: "ryukawa#0001" },
  ],
};

const initialMedia: MediaEntry = {
  topFilm: { title: "Blade Runner 2049", year: 2017, rating: 10, genre: "Sci-Fi / Neo-Noir" },
  currentSeries: { title: "Severance", episode: 5, totalEpisodes: 10, platform: "Apple TV+" },
  actors: [
    { id: "a1", name: "Ryan Gosling", status: "GOAT Status", knownFor: "Blade Runner 2049" },
    { id: "a2", name: "Keanu Reeves", status: "GOAT Status", knownFor: "John Wick" },
    { id: "a3", name: "Adam Scott", status: "All-Star", knownFor: "Severance" },
  ],
  actresses: [
    { id: "ac1", name: "Ana de Armas", status: "All-Star", knownFor: "Knives Out" },
    { id: "ac2", name: "Zendaya", status: "Rising", knownFor: "Euphoria" },
    { id: "ac3", name: "Patricia Arquette", status: "GOAT Status", knownFor: "Severance" },
  ],
};

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: initialProfile,
  games: [],
  media: initialMedia,
  animeList: [],
  favoriteCharacters: [],
  dramas: [],
  hallOfFame: [],
  isLoading: false,
  isHydrated: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data && !data.error) {
        set({
          profile: {
            ...data.profile,
            avatar: data.profile.avatar || "/avatar.png",
          },
          games: data.games,
          animeList: data.animeList,
          favoriteCharacters: data.favoriteCharacters,
          dramas: data.dramas,
          hallOfFame: data.hallOfFame,
          isHydrated: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    // Optimistic Update
    set((s) => ({ profile: { ...s.profile, ...data } }));
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().profile),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        set({ profile: updated });
      }
    } catch (err) {
      console.error("Failed to sync profile:", err);
    }
  },

  addGame: async (game) => {
    set((s) => ({ games: [...s.games, game] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GAME", payload: game }),
      });
    } catch (err) {
      console.error("Failed to sync added game:", err);
    }
  },

  updateGame: async (id, data) => {
    set((s) => ({
      games: s.games.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
    try {
      const game = get().games.find((g) => g.id === id);
      if (game) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_GAME", payload: game }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated game:", err);
    }
  },

  removeGame: async (id) => {
    set((s) => ({ games: s.games.filter((g) => g.id !== id) }));
    // Future sync if needed
  },

  updateMedia: (data) => set((s) => ({ media: { ...s.media, ...data } })),

  addAnime: async (anime) => {
    set((s) => ({ animeList: [...s.animeList, anime] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_ANIME", payload: anime }),
      });
    } catch (err) {
      console.error("Failed to sync added anime:", err);
    }
  },

  updateAnime: async (id, data) => {
    set((s) => ({
      animeList: s.animeList.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
    try {
      const anime = get().animeList.find((a) => a.id === id);
      if (anime) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_ANIME", payload: anime }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated anime:", err);
    }
  },

  removeAnime: async (id) => {
    set((s) => ({ animeList: s.animeList.filter((a) => a.id !== id) }));
  },

  toggleFavoriteCharacter: async (id) => {
    set((s) => ({
      favoriteCharacters: s.favoriteCharacters.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      ),
    }));
    try {
      const char = get().favoriteCharacters.find((c) => c.id === id);
      if (char) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "TOGGLE_CHARACTER", payload: char }),
        });
      }
    } catch (err) {
      console.error("Failed to sync toggled character:", err);
    }
  },

  addDrama: async (drama) => {
    set((s) => ({ dramas: [...s.dramas, drama] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_DRAMA", payload: drama }),
      });
    } catch (err) {
      console.error("Failed to sync added drama:", err);
    }
  },

  updateDrama: async (id, data) => {
    set((s) => ({
      dramas: s.dramas.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
    try {
      const drama = get().dramas.find((d) => d.id === id);
      if (drama) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_DRAMA", payload: drama }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated drama:", err);
    }
  },

  removeDrama: async (id) => {
    set((s) => ({ dramas: s.dramas.filter((d) => d.id !== id) }));
  },
}));
