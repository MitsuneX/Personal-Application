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
  banner?: string;
  nameplate?: string;
  customTag?: string;
  borderStyle?: string;
  status: "online" | "away" | "busy" | "offline";
  socials: SocialHandle[];
  skills: string[];
  location: string;
  phoneNumber?: string;
  mbti?: string;
  zodiac?: string;
}

export interface ProfileHistoryEntry {
  id: string;
  assetType: "avatar" | "banner" | "nameplate";
  url: string;
  createdAt: string;
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
  profileLink?: string;
  icon?: string;
  screenshot?: string;
}

export interface DossierCharacterEntry {
  id: string;
  gameId: string;
  name: string;
  category: string;
  role?: string;
  levelRank?: string;
  winRate?: number;
  matches?: number;
  notes?: string;
  avatarUrl?: string;
  accentColor?: string;
  isFavorite?: boolean;
}

export interface GameResourceEntry {
  id: string;
  gameId: string;
  name: string;
  url: string;
  icon?: string;
  category?: string;
  description?: string;
  enabled?: boolean;
  sortOrder?: number;
}

export interface GameShowcaseEntry {
  id: string;
  gameId: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt?: string;
}

// ─── Media Types ──────────────────────────────────────────────────────────────

export type MediaStatus = "GOAT Status" | "All-Star" | "Rising" | "Classic";
export type AnimeStatus = "Watching" | "Completed" | "On Hold" | "Plan to Watch" | "Dropped";
export type DramaCountry = "japanese" | "korean" | "chinese" | "hollywood";
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
  posterUrl?: string;
  synopsis?: string;
  cast?: string[];
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
  type: "actor" | "actress" | "anime" | "singer" | "tokusatsu" | "none";
  status: MediaStatus;
  knownFor: string[];
  nationality?: string;
  singerType?: string; // "Solo Artist" | "Band / Group" | "Idol" | "VTuber" | "Vocalist"
  note?: string;
  imageUrl?: string;
  rank: number | null;
  likes: number;
  isChampion: boolean;
  tokusatsuFranchise?: string | null;
  tokusatsuShow?: string | null;
  associatedDramas?: string[];
}

// ─── Misc Section Types ─────────────────────────────────────────────────────────

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  hobbyId?: string | null;
  isCuriosity?: boolean;
  updatedAt?: string;
}

export interface LinkEntry {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface GalleryEntry {
  id: string;
  title: string;
  url: string;
  caption?: string | null;
  tags?: string[] | null;
  category?: string;
  folder?: string;
}

export interface SavedPromptEntry {
  id: string;
  title: string;
  targetAI: string;
  promptText: string;
  createdAt?: string;
}

export interface SongEntry {
  id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  category: string;
  duration?: string;
  audioUrl?: string;
  youtubeId?: string;
  lyrics?: string;
  geniusId?: string;
  playlistId?: string;
}

export interface PlaylistEntry {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songs?: (SongEntry | string)[];
  createdAt?: string;
}

export type DramaLogStatus = "GOAT Status" | "All-Star" | "Rising" | "Classic";

export interface DramaLogEntry {
  id: string;
  title: string;
  type: "Movie" | "Series";
  releaseYear?: number | null;
  plotSummary?: string | null;
  posterUrl?: string | null;
  mainActors: string[];
  statusBadge: DramaLogStatus;
  omdbId?: string | null;
  country?: string | null;
  rating?: string | null;
  createdAt?: string;
  episodesWatched?: number;
  totalEpisodes?: number;
}

export interface HobbySkillEntry {
  id: string;
  name: string;
  category: string; // "Languages" | "Doctors" | "Martial Arts"
  priority: string; // "Priority" | "Haven't Started" | "Manifest"
  progress: number; // 0–100
  createdAt?: string;
}

export interface HobbyLogEntry {
  id: string;
  skillId: string;
  delta: number;
  wordCount: number;
  note?: string | null;
  createdAt: string;
}

// ─── State Interface ──────────────────────────────────────────────────────────

interface DashboardState {
  profile: ProfileData;
  games: GameEntry[];
  dossierCharacters: DossierCharacterEntry[];
  gameResources: GameResourceEntry[];
  gameShowcaseItems: GameShowcaseEntry[];
  media: MediaEntry;
  animeList: AnimeEntry[];
  favoriteCharacters: FavoriteCharacter[];
  dramas: DramaEntry[];
  hallOfFame: HallOfFameEntry[];
  notes: NoteEntry[];
  links: LinkEntry[];
  gallery: GalleryEntry[];
  savedPrompts: SavedPromptEntry[];
  isLoading: boolean;
  isHydrated: boolean;

  fetchDashboard: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  addGame: (game: GameEntry) => Promise<void>;
  updateGame: (id: string, data: Partial<GameEntry>) => Promise<void>;
  removeGame: (id: string) => Promise<void>;
  addDossierCharacter: (item: DossierCharacterEntry) => Promise<void>;
  updateDossierCharacter: (id: string, data: Partial<DossierCharacterEntry>) => Promise<void>;
  removeDossierCharacter: (id: string) => Promise<void>;
  addGameResource: (item: GameResourceEntry) => Promise<void>;
  updateGameResource: (id: string, data: Partial<GameResourceEntry>) => Promise<void>;
  removeGameResource: (id: string) => Promise<void>;
  addGameShowcaseItem: (item: GameShowcaseEntry) => Promise<void>;
  updateGameShowcaseItem: (id: string, data: Partial<GameShowcaseEntry>) => Promise<void>;
  removeGameShowcaseItem: (id: string) => Promise<void>;
  updateMedia: (data: Partial<MediaEntry>) => void;
  addAnime: (anime: AnimeEntry) => Promise<void>;
  updateAnime: (id: string, data: Partial<AnimeEntry>) => Promise<void>;
  removeAnime: (id: string) => Promise<void>;
  toggleFavoriteCharacter: (id: string) => Promise<void>;
  saveFavoriteCharacter: (id: string, name: string, anime: string, isFavorite?: boolean) => Promise<void>;
  deleteFavoriteCharacter: (id: string) => Promise<void>;
  addDrama: (drama: DramaEntry) => Promise<void>;
  updateDrama: (id: string, data: Partial<DramaEntry>) => Promise<void>;
  removeDrama: (id: string) => Promise<void>;

  // HOF Actions
  updateHof: (id: string, data: Partial<HallOfFameEntry>) => Promise<void>;
  likeHof: (id: string) => Promise<void>;
  rankHof: (id: string, rank: number) => Promise<void>;
  deleteHof: (id: string) => Promise<void>;

  // Notepad Actions
  saveNote: (id: string, title: string, content: string, hobbyId?: string | null, isCuriosity?: boolean) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Bookmark Link Actions
  saveLink: (id: string, title: string, url: string, category: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  // Gallery Actions
  addGalleryItem: (id: string, title: string, url: string, caption?: string, tags?: string[], category?: string, folder?: string) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // Music Actions
  songs: SongEntry[];
  playlists: PlaylistEntry[];
  activeTrack: SongEntry | null;
  isPlaying: boolean;
  playlistQueue: SongEntry[];
  isShuffle: boolean;
  loopMode: "off" | "one" | "all";
  saveSong: (id: string, data: Omit<SongEntry, "id">) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  playTrack: (track: SongEntry, queue?: SongEntry[]) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  toggleShuffle: () => void;
  cycleLoopMode: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  savePlaylist: (playlist: PlaylistEntry) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;

  // Drama Log Actions
  dramaLog: DramaLogEntry[];
  saveDramaLog: (entry: DramaLogEntry) => Promise<void>;
  updateDramaLog: (id: string, data: Partial<Pick<DramaLogEntry, "episodesWatched" | "totalEpisodes">>) => Promise<void>;
  deleteDramaLog: (id: string) => Promise<void>;

  // Saved Prompts Actions
  addSavedPrompt: (prompt: SavedPromptEntry) => Promise<void>;
  deleteSavedPrompt: (id: string) => Promise<void>;

  // Hobby Actions
  hobbySkills: HobbySkillEntry[];
  hobbyLogs: HobbyLogEntry[];
  logHobbyXP: (skillId: string, noteText: string) => Promise<void>;

  // Profile Aesthetics Actions
  profileHistory: ProfileHistoryEntry[];
  updateAesthetics: (data: {
    name?: string;
    customTag?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
    nameplate?: string;
    borderStyle?: string;
  }) => Promise<void>;
}

// ─── Seed Data (Fallback) ──────────────────────────────────────────────────────

const initialProfile: ProfileData = {
  name: "Alex Ryukawa",
  tagline: "Full-Stack Dev · Game Enthusiast · Weeb",
  bio: "Building next-gen web experiences by day, grinding ranked & watching anime by night. Fuelled by coffee and lo-fi beats.",
  avatar: "/avatar.png",
  borderStyle: "default",
  status: "online",
  location: "Jakarta, ID 🇮🇩",
  skills: ["Next.js", "TypeScript", "Supabase", "Framer Motion", "Rust"],
  socials: [
    { platform: "GitHub", handle: "@alexryukawa", url: "https://github.com" },
    { platform: "Twitter/X", handle: "@alexryukawa", url: "https://x.com" },
    { platform: "Discord", handle: "ryukawa#0001" },
  ],
  phoneNumber: "",
  mbti: "",
  zodiac: "",
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

const initialDossierCharacters: DossierCharacterEntry[] = [
  // Mobile Legends (game-2)
  { id: "dossier-ml-1", gameId: "game-2", name: "Chou", category: "EXP Lane", role: "Fighter / Heavy Kick", levelRank: "Mastery 7", winRate: 64.2, matches: 280, notes: "Best for blink kick initiation on gold lane carries.", accentColor: "#F59E0B", isFavorite: true },
  { id: "dossier-ml-2", gameId: "game-2", name: "Ling", category: "Jungle", role: "Assassin / Wall Walk", levelRank: "Mastery 7", winRate: 68.5, matches: 340, notes: "Fast purple buff rotation and high mobility execution.", accentColor: "#3B82F6", isFavorite: true },
  { id: "dossier-ml-3", gameId: "game-2", name: "Kagura", category: "Mid Lane", role: "Mage / Umbrella Burst", levelRank: "Mastery 6", winRate: 61.0, matches: 195, notes: "Seimei umbrella combo for mid lane wave control.", accentColor: "#EC4899", isFavorite: false },
  { id: "dossier-ml-4", gameId: "game-2", name: "Beatrix", category: "Gold Lane", role: "Marksman / Weapon Swap", levelRank: "Mastery 7", winRate: 65.8, matches: 260, notes: "Renner sniper for long range burst & Nibiru for teamfights.", accentColor: "#EF4444", isFavorite: true },
  { id: "dossier-ml-5", gameId: "game-2", name: "Kufra", category: "Roam", role: "Tank / Bouncing Ball", levelRank: "Mastery 6", winRate: 59.4, matches: 150, notes: "Bouncing ball anti-dash counter for assassins.", accentColor: "#10B981", isFavorite: false },

  // Honkai: Star Rail (game-1)
  { id: "dossier-hsr-1", gameId: "game-1", name: "Acheron", category: "Nihility", role: "Lightning / Ultimate Burst", levelRank: "E2S1 - Lvl 80", winRate: 88.0, matches: 140, notes: "Zero energy ultimate relying on debuff stacks.", accentColor: "#8B5CF6", isFavorite: true },
  { id: "dossier-hsr-2", gameId: "game-1", name: "Jingliu", category: "Destruction", role: "Ice / Transmigration", levelRank: "E1S1 - Lvl 80", winRate: 84.5, matches: 120, notes: "Spectral Transmute stance for high ice blast damage.", accentColor: "#06B6D4", isFavorite: true },
  { id: "dossier-hsr-3", gameId: "game-1", name: "Firefly", category: "Destruction", role: "Fire / Super Break", levelRank: "E2S1 - Lvl 80", winRate: 91.2, matches: 160, notes: "SAM armor complete domain break execution.", accentColor: "#10B981", isFavorite: true },
  { id: "dossier-hsr-4", gameId: "game-1", name: "Sparkle", category: "Harmony", role: "Quantum / Skill Point Buffer", levelRank: "E0S1 - Lvl 80", winRate: 86.0, matches: 130, notes: "Skill point recovery + action advance for hypercarries.", accentColor: "#EC4899", isFavorite: false },

  // Valorant (game-3)
  { id: "dossier-val-1", gameId: "game-3", name: "Jett", category: "Duelist", role: "Wind / Entry Fragger", levelRank: "Ascendant 3", winRate: 62.4, matches: 210, notes: "Updraft & Blade Storm eco round impact.", accentColor: "#EF4444", isFavorite: true },
  { id: "dossier-val-2", gameId: "game-3", name: "Omen", category: "Controller", role: "Shadow / Smoke Executor", levelRank: "Ascendant 2", winRate: 58.1, matches: 175, notes: "Paranoia blind for B-site split pushes.", accentColor: "#6366F1", isFavorite: false },
  { id: "dossier-val-3", gameId: "game-3", name: "Sova", category: "Initiator", role: "Recon / Intel Dart", levelRank: "Ascendant 3", winRate: 60.5, matches: 190, notes: "Recon dart lineups for A-Main control.", accentColor: "#3B82F6", isFavorite: true },

  // Genshin Impact (game-4)
  { id: "dossier-gi-1", gameId: "game-4", name: "Xiao", category: "Main DPS", role: "Anemo / Yaksha Plunge", levelRank: "Lvl 90 - C6", winRate: 92.0, matches: 310, notes: "Bane of All Evil continuous plunge attack loop.", accentColor: "#10B981", isFavorite: true },
  { id: "dossier-gi-2", gameId: "game-4", name: "Yelan", category: "Sub DPS", role: "Hydro / Exquisite Dice", levelRank: "Lvl 90 - C2S1", winRate: 95.0, matches: 450, notes: "High speed mobility & off-field hydro enabler.", accentColor: "#3B82F6", isFavorite: true },
  { id: "dossier-gi-3", gameId: "game-4", name: "Zhongli", category: "Healer / Shielder", role: "Geo / Jade Shield", levelRank: "Lvl 90 - C0", winRate: 98.0, matches: 520, notes: "Unbreakable Jade Shield & universal resistance shred.", accentColor: "#F59E0B", isFavorite: true },
];

const initialGameResources: GameResourceEntry[] = [
  // Mobile Legends (game-2)
  { id: "res-ml-1", gameId: "game-2", name: "Current Meta", url: "https://www.mobilelegends.com/rank", icon: "🔥", category: "Meta", description: "Official Win Rate & Ban Rate Rankings", enabled: true, sortOrder: 1 },
  { id: "res-ml-2", gameId: "game-2", name: "Hero Details", url: "https://www.mobilelegends.com/hero", icon: "🦸", category: "Heroes", description: "Official Skill Ratios & Equipment Guides", enabled: true, sortOrder: 2 },

  // Honkai: Star Rail (game-1)
  { id: "res-hsr-1", gameId: "game-1", name: "Prydwen HSR Tier List", url: "https://www.prydwen.gg/star-rail/tier-list", icon: "🏆", category: "Tier List", description: "Memory of Chaos & Pure Fiction Tier Ratings", enabled: true, sortOrder: 1 },

  // Valorant (game-3)
  { id: "res-val-1", gameId: "game-3", name: "Tracker Network", url: "https://tracker.gg/valorant", icon: "🎯", category: "Database", description: "Agent K/D & Winrate Global Leaderboards", enabled: true, sortOrder: 1 },

  // Genshin Impact (game-4)
  { id: "res-gi-1", gameId: "game-4", name: "Game8 Builds & Tier List", url: "https://game8.co/games/Genshin-Impact", icon: "🏆", category: "Builds", description: "Best Artifact Sets & Team Compositions", enabled: true, sortOrder: 1 },
];

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: initialProfile,
  games: [],
  dossierCharacters: initialDossierCharacters,
  gameResources: initialGameResources,
  gameShowcaseItems: [],
  media: initialMedia,
  animeList: [],
  favoriteCharacters: [],
  dramas: [],
  hallOfFame: [],
  notes: [],
  links: [],
  gallery: [],
  songs: [],
  playlists: [],
  activeTrack: null,
  isPlaying: false,
  playlistQueue: [],
  isShuffle: false,
  loopMode: "off",
  dramaLog: [],
  savedPrompts: [],
  hobbySkills: [],
  hobbyLogs: [],
  profileHistory: [],
  isLoading: false,
  isHydrated: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/dashboard?t=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      if (data && !data.error) {
        const currentProfile = get().profile;
        set({
          profile: data.profile
            ? {
                ...currentProfile,
                ...data.profile,
                avatar: data.profile.avatar || currentProfile.avatar || "/avatar.png",
                borderStyle: data.profile.borderStyle || currentProfile.borderStyle || "default",
              }
            : currentProfile,
          games: data.games || [],
          dossierCharacters: (data.dossierCharacters && data.dossierCharacters.length > 0)
            ? data.dossierCharacters
            : get().dossierCharacters,
          gameResources: (data.gameResources && data.gameResources.length > 0)
            ? data.gameResources
            : get().gameResources,
          gameShowcaseItems: data.gameShowcaseItems || [],
          animeList: data.animeList || [],
          favoriteCharacters: data.favoriteCharacters || [],
          dramas: data.dramas || [],
          hallOfFame: data.hallOfFame || [],
          notes: data.notes || [],
          links: data.links || [],
          gallery: data.gallery || [],
          songs: data.songs || [],
          playlists: data.playlists || [],
          dramaLog: (data.dramaLog || []).map((d: any) => ({
            ...d,
            mainActors: Array.isArray(d.mainActors) ? d.mainActors : [],
          })),
          savedPrompts: data.savedPrompts || [],
          hobbySkills: data.hobbySkills || [],
          hobbyLogs: (data.hobbyLogs || []).map((l: any) => ({
            ...l,
            createdAt: l.createdAt ?? new Date().toISOString(),
          })),
          profileHistory: (data.profileHistory || []).map((h: any) => ({
            ...h,
            createdAt: h.createdAt ?? new Date().toISOString(),
          })),
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
    set((s) => ({ profile: { ...s.profile, ...data } }));
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().profile),
      });
      const result = await res.json();
      if (result && !result.error) {
        if (result.success) {
          set({
            profile: result.data,
            profileHistory: (result.history || []).map((h: any) => ({
              ...h,
              createdAt: h.createdAt ?? new Date().toISOString(),
            })),
          });
        } else {
          set({ profile: result });
        }
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
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_GAME", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted game:", err);
    }
  },

  addDossierCharacter: async (item) => {
    set((s) => ({ dossierCharacters: [...s.dossierCharacters, item] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_DOSSIER_CHARACTER", payload: item }),
      });
    } catch (err) {
      console.error("Failed to sync added dossier character:", err);
    }
  },

  updateDossierCharacter: async (id, data) => {
    set((s) => ({
      dossierCharacters: s.dossierCharacters.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    try {
      const item = get().dossierCharacters.find((c) => c.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_DOSSIER_CHARACTER", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated dossier character:", err);
    }
  },

  removeDossierCharacter: async (id) => {
    set((s) => ({ dossierCharacters: s.dossierCharacters.filter((c) => c.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_DOSSIER_CHARACTER", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted dossier character:", err);
    }
  },

  addGameResource: async (item) => {
    set((s) => ({ gameResources: [...s.gameResources, item] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GAME_RESOURCE", payload: item }),
      });
    } catch (err) {
      console.error("Failed to sync added game resource:", err);
    }
  },

  updateGameResource: async (id, data) => {
    set((s) => ({
      gameResources: s.gameResources.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }));
    try {
      const item = get().gameResources.find((r) => r.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_GAME_RESOURCE", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated game resource:", err);
    }
  },

  removeGameResource: async (id) => {
    set((s) => ({ gameResources: s.gameResources.filter((r) => r.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_GAME_RESOURCE", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted game resource:", err);
    }
  },

  addGameShowcaseItem: async (item) => {
    set((s) => ({ gameShowcaseItems: [item, ...s.gameShowcaseItems] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GAME_SHOWCASE_ITEM", payload: item }),
      });
    } catch (err) {
      console.error("Failed to sync added showcase item:", err);
    }
  },

  updateGameShowcaseItem: async (id, data) => {
    set((s) => ({
      gameShowcaseItems: s.gameShowcaseItems.map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
    try {
      const item = get().gameShowcaseItems.find((i) => i.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_GAME_SHOWCASE_ITEM", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated showcase item:", err);
    }
  },

  removeGameShowcaseItem: async (id) => {
    set((s) => ({ gameShowcaseItems: s.gameShowcaseItems.filter((i) => i.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_GAME_SHOWCASE_ITEM", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted showcase item:", err);
    }
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
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_ANIME", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete anime:", err);
    }
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

  saveFavoriteCharacter: async (id, name, anime, isFavorite = true) => {
    const newChar = { id, name, anime, isFavorite, createdAt: new Date() };
    set((s) => {
      const exists = s.favoriteCharacters.some((c) => c.id === id);
      return {
        favoriteCharacters: exists
          ? s.favoriteCharacters.map((c) => (c.id === id ? { ...c, name, anime, isFavorite } : c))
          : [...s.favoriteCharacters, newChar],
      };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_CHARACTER",
          payload: { id, name, anime, isFavorite },
        }),
      });
    } catch (err) {
      console.error("Failed to save favorite character:", err);
    }
  },

  deleteFavoriteCharacter: async (id) => {
    set((s) => ({
      favoriteCharacters: s.favoriteCharacters.filter((c) => c.id !== id),
    }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_CHARACTER",
          payload: { id },
        }),
      });
    } catch (err) {
      console.error("Failed to delete favorite character:", err);
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
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_DRAMA", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete drama:", err);
    }
  },

  // ─── HOF Actions ───────────────────────────────────────────────────────────

  updateHof: async (id, data) => {
    set((s) => {
      const exists = s.hallOfFame.some((h) => h.id === id);
      const newHof = exists
        ? s.hallOfFame.map((h) => (h.id === id ? { ...h, ...data } as HallOfFameEntry : h))
        : [...s.hallOfFame, { id, ...data } as HallOfFameEntry];

      // Sort HOF: rank asc (Infinity if null), then likes desc
      const sorted = newHof.sort((a, b) => {
        const aRank = a.rank === null || a.rank === undefined ? Infinity : a.rank;
        const bRank = b.rank === null || b.rank === undefined ? Infinity : b.rank;
        if (aRank !== bRank) return aRank - bRank;
        return (b.likes || 0) - (a.likes || 0);
      });
      return { hallOfFame: sorted };
    });
    try {
      const item = get().hallOfFame.find((h) => h.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_HOF", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync HOF item:", err);
    }
  },

  likeHof: async (id) => {
    set((s) => {
      const newHof = s.hallOfFame.map((h) =>
        h.id === id ? { ...h, likes: (h.likes || 0) + 1 } : h
      );
      // Re-sort: rank asc, likes desc
      const sorted = newHof.sort((a, b) => {
        const aRank = a.rank === null || a.rank === undefined ? Infinity : a.rank;
        const bRank = b.rank === null || b.rank === undefined ? Infinity : b.rank;
        if (aRank !== bRank) return aRank - bRank;
        return (b.likes || 0) - (a.likes || 0);
      });
      return { hallOfFame: sorted };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LIKE_HOF", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to like HOF:", err);
    }
  },

  deleteHof: async (id) => {
    set((s) => ({ hallOfFame: s.hallOfFame.filter((h) => h.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_HOF", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete HOF item:", err);
    }
  },

  rankHof: async (id, rank) => {
    set((s) => ({
      hallOfFame: s.hallOfFame.map((h) =>
        h.id === id ? { ...h, rank } : h
      ),
    }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RANK_HOF", payload: { id, rank } }),
      });
    } catch (err) {
      console.error("Failed to rank HOF:", err);
    }
  },

  // ─── Notepad Actions ───────────────────────────────────────────────────────

  saveNote: async (id, title, content, hobbyId?, isCuriosity?) => {
    set((s) => {
      const exists = s.notes.some((n) => n.id === id);
      const newNote: NoteEntry = { id, title, content, hobbyId: hobbyId ?? null, isCuriosity: isCuriosity ?? false };
      const newNotes = exists
        ? s.notes.map((n) => (n.id === id ? newNote : n))
        : [newNote, ...s.notes];
      return { notes: newNotes };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_NOTE", payload: { id, title, content, hobbyId: hobbyId ?? null, isCuriosity: isCuriosity ?? false } }),
      });
    } catch (err) {
      console.error("Failed to sync note:", err);
    }
  },

  deleteNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_NOTE", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  },

  // ─── Link Actions ──────────────────────────────────────────────────────────

  saveLink: async (id, title, url, category) => {
    set((s) => {
      const exists = s.links.some((l) => l.id === id);
      const newLinks = exists
        ? s.links.map((l) => (l.id === id ? { id, title, url, category } : l))
        : [{ id, title, url, category }, ...s.links];
      return { links: newLinks };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_LINK", payload: { id, title, url, category } }),
      });
    } catch (err) {
      console.error("Failed to sync link:", err);
    }
  },

  deleteLink: async (id) => {
    set((s) => ({ links: s.links.filter((l) => l.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_LINK", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete link:", err);
    }
  },

  // ─── Gallery Actions ───────────────────────────────────────────────────────

  addGalleryItem: async (id, title, url, caption = undefined, tags = [], category = "General", folder = "Root") => {
    set((s) => ({ gallery: [{ id, title, url, caption, tags, category, folder }, ...s.gallery] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_GALLERY", payload: { id, title, url, caption, tags, category, folder } }),
      });
    } catch (err) {
      console.error("Failed to sync gallery item:", err);
    }
  },

  deleteGalleryItem: async (id) => {
    set((s) => ({ gallery: s.gallery.filter((g) => g.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_GALLERY", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
    }
  },

  // ─── Music Actions ─────────────────────────────────────────────────────────

  saveSong: async (id, data) => {
    set((s) => {
      const exists = s.songs.some((song) => song.id === id);
      const newSongs = exists
        ? s.songs.map((song) => (song.id === id ? { id, ...data } : song))
        : [{ id, ...data }, ...s.songs];
      return { songs: newSongs };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_SONG", payload: { id, ...data } }),
      });
    } catch (err) {
      console.error("Failed to sync song:", err);
    }
  },

  deleteSong: async (id) => {
    set((s) => ({ songs: s.songs.filter((song) => song.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_SONG", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete song:", err);
    }
  },

  playTrack: (track, queue) => {
    const q = queue && queue.length > 0 ? queue : get().songs;
    set({ activeTrack: track, isPlaying: true, playlistQueue: q });
  },

  togglePlay: () => {
    set((s) => ({ isPlaying: !s.isPlaying }));
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

  cycleLoopMode: () => set((s) => {
    const nextMode = s.loopMode === "off" ? "one" : s.loopMode === "one" ? "all" : "off";
    return { loopMode: nextMode };
  }),

  nextTrack: () => {
    const { activeTrack, playlistQueue, songs, isShuffle, loopMode } = get();
    const queue = playlistQueue.length > 0 ? playlistQueue : songs;
    if (!activeTrack || queue.length === 0) return;

    if (loopMode === "one") {
      set({ activeTrack: { ...activeTrack }, isPlaying: true });
      return;
    }

    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      set({ activeTrack: queue[randIdx], isPlaying: true });
      return;
    }

    let currIdx = queue.findIndex(
      (t) =>
        t.id === activeTrack.id ||
        (t.youtubeId && t.youtubeId === activeTrack.youtubeId) ||
        t.title === activeTrack.title
    );
    if (currIdx === -1) currIdx = 0;

    const isLast = currIdx === queue.length - 1;
    if (isLast && loopMode === "off") {
      set({ isPlaying: false });
      return;
    }

    const nextIdx = (currIdx + 1) % queue.length;
    set({ activeTrack: queue[nextIdx], isPlaying: true });
  },

  prevTrack: () => {
    const { activeTrack, playlistQueue, songs, isShuffle } = get();
    const queue = playlistQueue.length > 0 ? playlistQueue : songs;
    if (!activeTrack || queue.length === 0) return;

    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      set({ activeTrack: queue[randIdx], isPlaying: true });
      return;
    }

    let currIdx = queue.findIndex(
      (t) =>
        t.id === activeTrack.id ||
        (t.youtubeId && t.youtubeId === activeTrack.youtubeId) ||
        t.title === activeTrack.title
    );
    if (currIdx === -1) currIdx = 0;

    const prevIdx = (currIdx - 1 + queue.length) % queue.length;
    set({ activeTrack: queue[prevIdx], isPlaying: true });
  },

  savePlaylist: async (playlist) => {
    set((s) => {
      const exists = s.playlists.some((p) => p.id === playlist.id);
      const updated = exists
        ? s.playlists.map((p) => (p.id === playlist.id ? playlist : p))
        : [playlist, ...s.playlists];
      return { playlists: updated };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_PLAYLIST", payload: playlist }),
      });
    } catch (err) {
      console.error("Failed to sync playlist:", err);
    }
  },

  deletePlaylist: async (id) => {
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PLAYLIST", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  },

  // ─── Drama Log Actions ──────────────────────────────────────────────────────

  saveDramaLog: async (entry) => {
    set((s) => {
      const exists = s.dramaLog.some((d) => d.id === entry.id);
      const updated = exists
        ? s.dramaLog.map((d) => (d.id === entry.id ? entry : d))
        : [entry, ...s.dramaLog];
      return { dramaLog: updated };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_DRAMA_LOG", payload: entry }),
      });
    } catch (err) {
      console.error("Failed to save drama log:", err);
    }
  },

  deleteDramaLog: async (id) => {
    set((s) => ({ dramaLog: s.dramaLog.filter((d) => d.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_DRAMA_LOG", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete drama log:", err);
    }
  },

  updateDramaLog: async (id, data) => {
    set((s) => ({
      dramaLog: s.dramaLog.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
    try {
      const entry = get().dramaLog.find((d) => d.id === id);
      if (entry) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_DRAMA_LOG_EPISODES",
            payload: { id, episodesWatched: entry.episodesWatched ?? 0, totalEpisodes: entry.totalEpisodes ?? 0, ...data },
          }),
        });
      }
    } catch (err) {
      console.error("Failed to update drama log episodes:", err);
    }
  },

  // ─── Saved Prompt Actions ──────────────────────────────────────────────────

  addSavedPrompt: async (prompt) => {
    set((s) => {
      const exists = s.savedPrompts.some((p) => p.id === prompt.id);
      const updated = exists
        ? s.savedPrompts.map((p) => (p.id === prompt.id ? prompt : p))
        : [prompt, ...s.savedPrompts];
      return { savedPrompts: updated };
    });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_PROMPT", payload: prompt }),
      });
    } catch (err) {
      console.error("Failed to add prompt:", err);
    }
  },

  deleteSavedPrompt: async (id) => {
    set((s) => ({ savedPrompts: s.savedPrompts.filter((p) => p.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PROMPT", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete prompt:", err);
    }
  },

  // ─── Hobby Actions ──────────────────────────────────────────────────────────

  logHobbyXP: async (skillId, noteText) => {
    const words = noteText.trim().split(/\s+/).filter(Boolean).length;
    const delta = 0.1 + words * 0.001;

    // Optimistic update on skill progress
    set((s) => ({
      hobbySkills: s.hobbySkills.map((sk) =>
        sk.id === skillId
          ? { ...sk, progress: Math.min(100, sk.progress + delta) }
          : sk
      ),
      hobbyLogs: [
        ...s.hobbyLogs,
        {
          id: "local-" + Date.now(),
          skillId,
          delta,
          wordCount: words,
          note: noteText.slice(0, 120),
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_HOBBY_XP",
          payload: { skillId, wordCount: words, note: noteText.slice(0, 120) },
        }),
      });
      const result = await res.json();
      // Sync authoritative progress from server
      if (result.success && result.data) {
        set((s) => ({
          hobbySkills: s.hobbySkills.map((sk) =>
            sk.id === skillId ? { ...sk, progress: result.data.progress } : sk
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to log hobby XP:", err);
    }
  },

  // ─── Profile Aesthetics Actions ──────────────────────────────────────────────

  updateAesthetics: async (data) => {
    // Optimistic update
    set((s) => ({ profile: { ...s.profile, ...data } }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_AESTHETIC", payload: data }),
      });
      const result = await res.json();
      if (result.success) {
        // Sync server profile (covers updatedAt etc.)
        set((s) => ({
          profile: { ...s.profile, ...result.data },
          profileHistory: (result.history || []).map((h: any) => ({
            ...h,
            createdAt: h.createdAt ?? new Date().toISOString(),
          })),
        }));
      }
    } catch (err) {
      console.error("Failed to save aesthetics:", err);
    }
  },
}));
