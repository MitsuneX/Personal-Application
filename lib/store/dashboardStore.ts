import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

  updateProfile: (data: Partial<ProfileData>) => void;
  addGame: (game: GameEntry) => void;
  updateGame: (id: string, data: Partial<GameEntry>) => void;
  removeGame: (id: string) => void;
  updateMedia: (data: Partial<MediaEntry>) => void;
  addAnime: (anime: AnimeEntry) => void;
  updateAnime: (id: string, data: Partial<AnimeEntry>) => void;
  removeAnime: (id: string) => void;
  toggleFavoriteCharacter: (id: string) => void;
  addDrama: (drama: DramaEntry) => void;
  updateDrama: (id: string, data: Partial<DramaEntry>) => void;
  removeDrama: (id: string) => void;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

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
    id: "g1", game: "Honkai: Star Rail", handle: "UID: ••••••••",
    platform: "Multi", rank: "ER 75", mainCharacter: "The Hero",
    mainRole: "Erudition", category: "Gacha RPG", isActive: true, accentColor: "#7C3AED",
  },
  {
    id: "g2", game: "Zenless Zone Zero", handle: "UID: ••••••••",
    platform: "Multi", rank: "AR 55", mainCharacter: "Anby",
    mainRole: "Electric DPS", category: "Gacha Action", isActive: true, accentColor: "#F59E0B",
  },
  {
    id: "g3", game: "Wuthering Waves", handle: "UID: ••••••••",
    platform: "Multi", rank: "AR 60", mainCharacter: "Yanfei",
    mainRole: "Pyro DPS", category: "Gacha RPG", isActive: true, accentColor: "#EF4444",
  },
  {
    id: "g4", game: "Genshin Impact", handle: "UID: ••••••••",
    platform: "Multi", rank: "AR 60", mainCharacter: "Xiao",
    mainRole: "Anemo DPS", category: "Gacha RPG", isActive: true, accentColor: "#10B981",
  },
  {
    id: "g5", game: "Mobile Legends", handle: "Ryukawa",
    platform: "Mobile", rank: "Mythic", mainCharacter: "Layla",
    mainRole: "Marksman", category: "MOBA", isActive: true, accentColor: "#3B82F6",
  },
  {
    id: "g6", game: "Valorant", handle: "Ryukawa#JP1",
    platform: "PC", rank: "Gold", mainCharacter: "Jett",
    mainRole: "Duelist", category: "FPS", isActive: true, accentColor: "#EF4444",
  },
  {
    id: "g7", game: "Solo Leveling: ARISE", handle: "Ryukawa",
    platform: "Mobile", rank: "Hero", mainCharacter: "Sung Jinwoo",
    mainRole: "Mage", category: "Action RPG", isActive: true, accentColor: "#6366F1",
  },
  {
    id: "g8", game: "Dragon Ball Legends", handle: "Ryukawa",
    platform: "Mobile", rank: "Saiyan", mainCharacter: "Goku",
    mainRole: "Strike", category: "Fighting", isActive: true, accentColor: "#F97316",
  },
];

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

const initialAnime: AnimeEntry[] = [
  { id: "an1", title: "Frieren: Beyond Journey's End", episodesWatched: 28, totalEpisodes: 28, status: "Completed", rating: 10, genre: "Fantasy", studio: "Madhouse", year: 2023 },
  { id: "an2", title: "Dandadan", episodesWatched: 8, totalEpisodes: 13, status: "Watching", rating: 9, genre: "Action / Romance", studio: "Science SARU", year: 2024 },
  { id: "an3", title: "Solo Leveling", episodesWatched: 13, totalEpisodes: 13, status: "Completed", rating: 9, genre: "Action RPG", studio: "A-1 Pictures", year: 2024 },
  { id: "an4", title: "Chainsaw Man", episodesWatched: 12, totalEpisodes: 12, status: "Completed", rating: 9, genre: "Dark Action", studio: "MAPPA", year: 2022 },
  { id: "an5", title: "Jujutsu Kaisen S3", episodesWatched: 2, totalEpisodes: 21, status: "Watching", rating: 9, genre: "Dark Fantasy", studio: "MAPPA", year: 2025 },
  { id: "an6", title: "Vinland Saga S2", episodesWatched: 24, totalEpisodes: 24, status: "Completed", rating: 10, genre: "Historical", studio: "MAPPA", year: 2023 },
  { id: "an7", title: "Dungeon Meshi", episodesWatched: 24, totalEpisodes: 24, status: "Completed", rating: 10, genre: "Fantasy Adventure", studio: "Trigger", year: 2024 },
];

const initialCharacters: FavoriteCharacter[] = [
  { id: "c1", name: "Frieren", anime: "Frieren: Beyond Journey's End", isFavorite: true },
  { id: "c2", name: "Denji", anime: "Chainsaw Man", isFavorite: true },
  { id: "c3", name: "Sung Jinwoo", anime: "Solo Leveling", isFavorite: true },
  { id: "c4", name: "Momo Ayase", anime: "Dandadan", isFavorite: true },
  { id: "c5", name: "Thorfinn", anime: "Vinland Saga", isFavorite: true },
  { id: "c6", name: "Laios", anime: "Dungeon Meshi", isFavorite: true },
];

const initialDramas: DramaEntry[] = [
  // Japanese
  { id: "d1", title: "Alice in Borderland", country: "japanese", episodes: 8, episodesWatched: 8, status: "Completed", rating: 9, genre: "Thriller / Survival", year: 2020, platform: "Netflix", cast: ["Kento Yamazaki", "Tao Tsuchiya"] },
  { id: "d2", title: "Midnight Diner", country: "japanese", episodes: 10, episodesWatched: 10, status: "Completed", rating: 10, genre: "Slice of Life", year: 2009, platform: "Netflix", cast: ["Kaoru Kobayashi"] },
  { id: "d3", title: "Sanctuary", country: "japanese", episodes: 8, episodesWatched: 5, status: "Watching", rating: 9, genre: "Sports / Drama", year: 2023, platform: "Netflix" },
  { id: "d4", title: "Good Doctor JP", country: "japanese", episodes: 11, episodesWatched: 11, status: "Completed", rating: 8, genre: "Medical / Drama", year: 2018, platform: "TBS" },
  // Korean
  { id: "d5", title: "Squid Game", country: "korean", episodes: 9, episodesWatched: 9, status: "Completed", rating: 10, genre: "Thriller / Survival", year: 2021, platform: "Netflix", cast: ["Lee Jung-jae", "Park Hae-soo"] },
  { id: "d6", title: "Crash Landing on You", country: "korean", episodes: 16, episodesWatched: 16, status: "Completed", rating: 9, genre: "Romance / Comedy", year: 2019, platform: "Netflix", cast: ["Hyun Bin", "Son Ye-jin"] },
  { id: "d7", title: "Extraordinary Attorney Woo", country: "korean", episodes: 16, episodesWatched: 10, status: "Watching", rating: 9, genre: "Legal / Drama", year: 2022, platform: "Netflix" },
  { id: "d8", title: "Moving", country: "korean", episodes: 20, episodesWatched: 20, status: "Completed", rating: 10, genre: "Superhero / Thriller", year: 2023, platform: "Disney+" },
  // Chinese
  { id: "d9", title: "The Untamed", country: "chinese", episodes: 50, episodesWatched: 50, status: "Completed", rating: 9, genre: "Wuxia / Romance", year: 2019, platform: "Youku", cast: ["Xiao Zhan", "Wang Yibo"] },
  { id: "d10", title: "Word of Honor", country: "chinese", episodes: 36, episodesWatched: 36, status: "Completed", rating: 9, genre: "Wuxia / Action", year: 2021, platform: "iQIYI" },
  { id: "d11", title: "Love O2O", country: "chinese", episodes: 30, episodesWatched: 15, status: "Watching", rating: 8, genre: "Romance / Gaming", year: 2016, platform: "iQIYI" },
  { id: "d12", title: "Nirvana in Fire", country: "chinese", episodes: 54, episodesWatched: 54, status: "Completed", rating: 10, genre: "Historical / Political", year: 2015, platform: "iQIYI" },
];

const initialHallOfFame: HallOfFameEntry[] = [
  // Actors
  { id: "h1", name: "Ryan Gosling", type: "actor", status: "GOAT Status", knownFor: ["Blade Runner 2049", "La La Land", "Drive"], nationality: "Canadian", note: "The definition of cool" },
  { id: "h2", name: "Keanu Reeves", type: "actor", status: "GOAT Status", knownFor: ["John Wick", "The Matrix", "Speed"], nationality: "American", note: "Real-life protagonist energy" },
  { id: "h3", name: "Adam Scott", type: "actor", status: "All-Star", knownFor: ["Severance", "Parks & Recreation", "Step Brothers"], nationality: "American" },
  { id: "h4", name: "Kento Yamazaki", type: "actor", status: "All-Star", knownFor: ["Alice in Borderland", "Death Note"], nationality: "Japanese" },
  { id: "h5", name: "Lee Jung-jae", type: "actor", status: "All-Star", knownFor: ["Squid Game", "The Aura"], nationality: "Korean" },
  // Actresses
  { id: "h6", name: "Ana de Armas", type: "actress", status: "All-Star", knownFor: ["Knives Out", "Blonde", "Blade Runner 2049"], nationality: "Cuban-Spanish" },
  { id: "h7", name: "Zendaya", type: "actress", status: "Rising", knownFor: ["Euphoria", "Dune", "Challengers"], nationality: "American", note: "Gen Z's greatest" },
  { id: "h8", name: "Patricia Arquette", type: "actress", status: "GOAT Status", knownFor: ["Severance", "True Romance", "Medium"], nationality: "American" },
  { id: "h9", name: "Son Ye-jin", type: "actress", status: "All-Star", knownFor: ["Crash Landing on You", "Something in the Rain"], nationality: "Korean" },
  { id: "h10", name: "Tao Tsuchiya", type: "actress", status: "Rising", knownFor: ["Alice in Borderland", "Orange"], nationality: "Japanese" },
  // Anime
  { id: "h11", name: "Frieren: Beyond Journey's End", type: "anime", status: "GOAT Status", knownFor: ["Emotional depth", "Beautiful world-building", "Sousou no Frieren OST"], note: "A masterpiece of the era" },
  { id: "h12", name: "Vinland Saga", type: "anime", status: "GOAT Status", knownFor: ["Character development", "Historical accuracy", "Thorfinn's arc"], note: "The greatest redemption arc" },
  { id: "h13", name: "Chainsaw Man", type: "anime", status: "All-Star", knownFor: ["Unique storytelling", "MAPPA animation", "Iconic OSTs"] },
  { id: "h14", name: "Dungeon Meshi", type: "anime", status: "All-Star", knownFor: ["World-building", "Creative cooking", "Trigger animation"] },
  { id: "h15", name: "Solo Leveling", type: "anime", status: "All-Star", knownFor: ["Power fantasy", "Incredible fights", "A-1 Pictures quality"] },
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
      dramas: initialDramas,
      hallOfFame: initialHallOfFame,

      updateProfile: (data) => set((s) => ({ profile: { ...s.profile, ...data } })),
      addGame: (game) => set((s) => ({ games: [...s.games, game] })),
      updateGame: (id, data) => set((s) => ({ games: s.games.map((g) => g.id === id ? { ...g, ...data } : g) })),
      removeGame: (id) => set((s) => ({ games: s.games.filter((g) => g.id !== id) })),
      updateMedia: (data) => set((s) => ({ media: { ...s.media, ...data } })),
      addAnime: (anime) => set((s) => ({ animeList: [...s.animeList, anime] })),
      updateAnime: (id, data) => set((s) => ({ animeList: s.animeList.map((a) => a.id === id ? { ...a, ...data } : a) })),
      removeAnime: (id) => set((s) => ({ animeList: s.animeList.filter((a) => a.id !== id) })),
      toggleFavoriteCharacter: (id) => set((s) => ({ favoriteCharacters: s.favoriteCharacters.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c) })),
      addDrama: (drama) => set((s) => ({ dramas: [...s.dramas, drama] })),
      updateDrama: (id, data) => set((s) => ({ dramas: s.dramas.map((d) => d.id === id ? { ...d, ...data } : d) })),
      removeDrama: (id) => set((s) => ({ dramas: s.dramas.filter((d) => d.id !== id) })),
    }),
    { name: "dashboard-store-v2", storage: createJSONStorage(() => localStorage) }
  )
);
