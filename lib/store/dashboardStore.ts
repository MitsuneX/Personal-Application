import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type GameRank =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Grandmaster"
  | "Challenger";

export interface GameEntry {
  id: string;
  game: string;
  handle: string;
  platform: "PC" | "PSN" | "Xbox" | "Switch" | "Mobile";
  rank?: GameRank;
  mainRole?: string;
  isActive: boolean;
}

export type MediaStatus = "GOAT Status" | "All-Star" | "Rising" | "Classic";

export interface ActorEntry {
  id: string;
  name: string;
  status: MediaStatus;
  knownFor: string;
}

export interface MediaEntry {
  topFilm: {
    title: string;
    year: number;
    rating: number;
    genre: string;
  };
  currentSeries: {
    title: string;
    episode: number;
    totalEpisodes: number;
    platform: string;
  };
  actors: ActorEntry[];
  actresses: ActorEntry[];
}

export type AnimeStatus = "Watching" | "Completed" | "On Hold" | "Plan to Watch" | "Dropped";

export interface AnimeEntry {
  id: string;
  title: string;
  episodesWatched: number;
  totalEpisodes: number;
  status: AnimeStatus;
  rating?: number;
}

export interface FavoriteCharacter {
  id: string;
  name: string;
  anime: string;
  isFavorite: boolean;
}

// ─── State Interface ──────────────────────────────────────────────────────────

interface DashboardState {
  profile: ProfileData;
  games: GameEntry[];
  media: MediaEntry;
  animeList: AnimeEntry[];
  favoriteCharacters: FavoriteCharacter[];

  // Actions
  updateProfile: (data: Partial<ProfileData>) => void;
  addGame: (game: GameEntry) => void;
  updateGame: (id: string, data: Partial<GameEntry>) => void;
  removeGame: (id: string) => void;
  updateMedia: (data: Partial<MediaEntry>) => void;
  addAnime: (anime: AnimeEntry) => void;
  updateAnime: (id: string, data: Partial<AnimeEntry>) => void;
  removeAnime: (id: string) => void;
  toggleFavoriteCharacter: (id: string) => void;
}

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

const initialProfile: ProfileData = {
  name: "Alex Ryukawa",
  tagline: "Full-Stack Dev · Game Enthusiast · Weeb",
  bio: "Building next-gen web experiences by day, grinding ranked & watching anime by night. Fuelled by coffee and lo-fi beats.",
  status: "online",
  location: "Jakarta, ID 🇮🇩",
  skills: ["Next.js", "TypeScript", "Supabase", "Framer Motion", "Rust"],
  socials: [
    { platform: "GitHub", handle: "@alexryukawa", url: "https://github.com" },
    { platform: "Twitter/X", handle: "@alexryukawa", url: "https://x.com" },
    { platform: "Discord", handle: "ryukawa#0001" },
  ],
};

const initialGames: GameEntry[] = [
  {
    id: "g1",
    game: "Valorant",
    handle: "Ryukawa#JP1",
    platform: "PC",
    rank: "Diamond",
    mainRole: "Duelist",
    isActive: true,
  },
  {
    id: "g2",
    game: "Apex Legends",
    handle: "Ryukawa_JP",
    platform: "PC",
    rank: "Platinum",
    mainRole: "Skirmisher",
    isActive: true,
  },
  {
    id: "g3",
    game: "Elden Ring",
    handle: "TarnishedOne",
    platform: "PSN",
    mainRole: "Strength Build",
    isActive: false,
  },
  {
    id: "g4",
    game: "League of Legends",
    handle: "Ryukawa",
    platform: "PC",
    rank: "Gold",
    mainRole: "Jungle / ADC",
    isActive: false,
  },
];

const initialMedia: MediaEntry = {
  topFilm: {
    title: "Blade Runner 2049",
    year: 2017,
    rating: 10,
    genre: "Sci-Fi / Neo-Noir",
  },
  currentSeries: {
    title: "Severance",
    episode: 5,
    totalEpisodes: 10,
    platform: "Apple TV+",
  },
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

const initialAnime: AnimeEntry[] = [
  { id: "an1", title: "Frieren: Beyond Journey's End", episodesWatched: 28, totalEpisodes: 28, status: "Completed", rating: 10 },
  { id: "an2", title: "Dandadan", episodesWatched: 8, totalEpisodes: 13, status: "Watching", rating: 9 },
  { id: "an3", title: "Solo Leveling", episodesWatched: 13, totalEpisodes: 13, status: "Completed", rating: 9 },
  { id: "an4", title: "Chainsaw Man", episodesWatched: 12, totalEpisodes: 12, status: "Completed", rating: 9 },
  { id: "an5", title: "Jujutsu Kaisen S3", episodesWatched: 2, totalEpisodes: 21, status: "Watching", rating: 9 },
];

const initialCharacters: FavoriteCharacter[] = [
  { id: "c1", name: "Frieren", anime: "Frieren: Beyond Journey's End", isFavorite: true },
  { id: "c2", name: "Denji", anime: "Chainsaw Man", isFavorite: true },
  { id: "c3", name: "Sung Jinwoo", anime: "Solo Leveling", isFavorite: true },
  { id: "c4", name: "Momo Ayase", anime: "Dandadan", isFavorite: true },
];

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      games: initialGames,
      media: initialMedia,
      animeList: initialAnime,
      favoriteCharacters: initialCharacters,

      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      addGame: (game) =>
        set((state) => ({ games: [...state.games, game] })),

      updateGame: (id, data) =>
        set((state) => ({
          games: state.games.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      removeGame: (id) =>
        set((state) => ({ games: state.games.filter((g) => g.id !== id) })),

      updateMedia: (data) =>
        set((state) => ({ media: { ...state.media, ...data } })),

      addAnime: (anime) =>
        set((state) => ({ animeList: [...state.animeList, anime] })),

      updateAnime: (id, data) =>
        set((state) => ({
          animeList: state.animeList.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      removeAnime: (id) =>
        set((state) => ({ animeList: state.animeList.filter((a) => a.id !== id) })),

      toggleFavoriteCharacter: (id) =>
        set((state) => ({
          favoriteCharacters: state.favoriteCharacters.map((c) =>
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          ),
        })),
    }),
    {
      name: "dashboard-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
