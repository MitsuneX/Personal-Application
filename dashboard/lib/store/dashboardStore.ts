import { create } from "zustand";
import { DEFAULT_AI_TOOLS } from "@/lib/data/initialAiTools";
import { INITIAL_DOSSIER_CHARACTERS } from "@/lib/data/initialDossierCharacters";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface SocialHandle {
  platform: string;
  handle: string;
  url?: string;
}

export interface ProfileData {
  id?: string;
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

export interface EditableLinkItem {
  defaultUrl: string;
  customUrl?: string;
  isDisabled?: boolean;
  lastEdited?: string;
}

export type CharacterLinkValue = string | EditableLinkItem;

export interface CharacterLinks {
  wiki?: CharacterLinkValue;
  official?: CharacterLinkValue;
  build?: CharacterLinkValue;
  guide?: CharacterLinkValue;
  video?: CharacterLinkValue;
  voice?: CharacterLinkValue;
  gallery?: CharacterLinkValue;
  reddit?: CharacterLinkValue;
  community?: CharacterLinkValue;
  tracker?: CharacterLinkValue;
  youtube?: CharacterLinkValue;
  [key: string]: CharacterLinkValue | undefined;
}

export interface CharacterStats {
  hp?: number;
  atk?: number;
  def?: number;
  spd?: number;
  critRate?: string | number;
  critDmg?: string | number;
  winRate?: number;
  matches?: number;
  damage?: number;
  mobility?: number;
  range?: number;
  difficulty?: number;
  [key: string]: string | number | undefined;
}

export interface DossierCharacterEntry {
  id: string;
  gameId: string;
  gameTitle?: string;
  name: string;
  aliases?: string[];
  category: string;
  role?: string;
  element?: string;
  rarity?: string;
  weapon?: string;
  classType?: string;
  faction?: string;
  nation?: string;
  race?: string;
  releaseVersion?: string;
  releaseDate?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  levelRank?: string;
  winRate?: number;
  matches?: number;
  avatarUrl?: string;
  splashArt?: string;
  accentColor?: string;
  isFavorite?: boolean;
  isHidden?: boolean;
  searchKeywords?: string[];
  stats?: CharacterStats;
  links?: CharacterLinks;
  entityType?: "character" | "equipment" | "weapon" | "map";

  // Phase 2 Metadata Expansion
  voiceActor?: string;
  illustrator?: string;
  birthday?: string;
  height?: string;
  affiliation?: string;
  region?: string;
  constellation?: string;
  profession?: string;
  organization?: string;
  releasePatch?: string;
  loreTags?: string[];
}

export interface GameCharacterEntry {
  id: string;
  characterId?: string;
  gameId?: string;
  gameName?: string;
  name: string;
  // Basic
  title?: string;
  officialName?: string;
  alias?: string;
  nickname?: string;
  nativeName?: string;
  // Identity
  birthday?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  species?: string;
  race?: string;
  // World
  nation?: string;
  region?: string;
  planet?: string;
  organization?: string;
  affiliation?: string;
  faction?: string;
  // Combat
  role?: string;
  category?: string;
  element?: string;
  attribute?: string;
  path?: string;
  weapon?: string;
  rarity?: string;
  damageType?: string;
  combatRole?: string;
  // Competitive stats
  health?: number;
  damage?: number;
  difficulty?: string;
  pickRate?: number;
  banRate?: number;
  winRate?: number;
  // Voice Actors
  voiceActors?: { jp?: string; cn?: string; kr?: string; en?: string };
  // Story
  personality?: string;
  biography?: string;
  officialDescription?: string;
  favoriteQuote?: string;
  // Media
  avatarUrl?: string;
  splashArt?: string;
  gallery?: string[];
  accentColor?: string;
  // Meta
  rank?: number;
  likes?: number;
  isFavorite?: boolean;
  notes?: string;
  metadataStatus?: "complete" | "pending" | "partial";
  stats?: any;
  tags?: string[];
  links?: any;
  tier?: string;
  createdAt?: string;
  updatedAt?: string;
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

export type ProjectStatus = "Live" | "Development" | "Beta" | "Maintenance" | "Archived" | "Experimental" | "Upcoming";

export interface ProjectItemEntry {
  id: string;
  name: string;
  logo?: string;
  heroBanner?: string;
  description: string;
  category: string;
  status: ProjectStatus;
  version?: string;
  accentColor: string;
  websiteUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  figmaUrl?: string;
  apiDocsUrl?: string;
  adminUrl?: string;
  stagingUrl?: string;
  downloadUrl?: string;
  techStack?: string[];
  tags?: string[];
  sortOrder?: number;
  isFeatured?: boolean;
  isArchived?: boolean;
  stats?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export type AiPricingModel = "Free" | "Freemium" | "Paid" | "Open Source" | "Enterprise";
export type AiUsageStatus = "Daily" | "Weekly" | "Occasionally" | "Rarely" | "Experimental" | "Inactive" | "Archived";

export interface AiToolItemEntry {
  id: string;
  name: string;
  company?: string;
  description: string;
  logo?: string;
  accentColor: string;
  category: string;
  usageStatus?: AiUsageStatus;
  pricingModel?: AiPricingModel;
  rating?: number;
  strengths?: string[];
  notes?: string;
  version?: string;
  lastUsed?: string;
  launchCount?: number;
  launchUrl?: string;
  websiteUrl?: string;
  docsUrl?: string;
  apiUrl?: string;
  pricingUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
  communityUrl?: string;
  releaseNotesUrl?: string;
  blogUrl?: string;
  roadmapUrl?: string;
  youtubeUrl?: string;
  tags?: string[];
  sortOrder?: number;
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface DossierCharacter {
  id: string;
  name: string;
  actor: string;
  role: string;
  portraitUrl?: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface DossierCastMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  nationality?: string;
}

export interface DossierEpisode {
  number: number;
  title: string;
  runtime: string;
  airDate?: string;
  isWatched: boolean;
  rating?: number;
}

export interface DossierEmotionMilestone {
  episode: string;
  emotion: string;
  note: string;
  date?: string;
  image?: string;
}

export interface DossierOstTrack {
  title: string;
  artist: string;
  type: "OP" | "ED" | "OST";
  url?: string;
}

export interface CategoryRatings {
  story: number;
  characters: number;
  ending: number;
  ost: number;
  romance: number;
  comedy: number;
  action: number;
  visuals: number;
  rewatchValue: number;
}

export interface ExternalLinks {
  imdb?: string;
  mydramalist?: string;
  wikipedia?: string;
  netflix?: string;
  disney?: string;
  viki?: string;
  trailerUrl?: string;
}

export interface CinematicDossierFields {
  originalTitle?: string;
  studio?: string;
  runtime?: string;
  backdropUrl?: string;
  posterUrl?: string;
  synopsis?: string;
  isFavorite?: boolean;
  startDate?: string;
  finishDate?: string;
  rewatchCount?: number;
  favoriteEpisode?: string;
  favoriteCharacter?: string;
  emotionalEpisode?: string;
  mood?: string;
  wouldRewatch?: boolean;
  categoryRatings?: CategoryRatings;
  characters?: DossierCharacter[];
  castGrid?: DossierCastMember[];
  episodeLog?: DossierEpisode[];
  emotionalTimeline?: DossierEmotionMilestone[];
  ostTracks?: DossierOstTrack[];
  externalLinks?: ExternalLinks;
  reviewMarkdown?: string;
  awards?: string[];
}

export interface AnimeEntry extends CinematicDossierFields {
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

export interface DramaEntry extends CinematicDossierFields {
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
  prevRank?: number | null;
  likes: number;
  isChampion: boolean;
  isFavorite?: boolean;
  badges?: string[];
  tokusatsuFranchise?: string | null;
  tokusatsuShow?: string | null;
  associatedDramas?: string[];
}

export interface HallEventEntry {
  id: string;
  userId?: string;
  type: string;
  characterId?: string | null;
  characterName: string;
  oldRank?: number | null;
  newRank?: number | null;
  oldVotes?: number | null;
  newVotes?: number | null;
  timestamp: string;
  metadata?: any;
}

export interface ChampionshipHistoryEntry {
  id: string;
  userId?: string;
  characterId: string;
  championName: string;
  startDate: string;
  endDate?: string | null;
  durationDays: number;
  highestVotes: number;
  timesDefended: number;
  championshipNumber: number;
  reasonEnded?: string | null;
  category?: string | null;
  nationality?: string | null;
  imageUrl?: string | null;
}

export interface HallRankingSnapshotEntry {
  id: string;
  userId?: string;
  characterId: string;
  characterName: string;
  rank: number;
  votes: number;
  prestigeScore: number;
  timestamp: string;
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
  playCount?: number;
  isFavorite?: boolean;
  lastPlayedAt?: string;
}

export interface PlaylistEntry {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songs?: (SongEntry | string)[];
  isAuto?: boolean;
  autoType?: string;
  createdAt?: string;
}

export interface CollectionEntry {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  coverUrl?: string;
  songIds?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  category: string; // "Languages" | "Doctors" | "Martial Arts" | Custom
  priority: string; // "Priority" | "Haven't Started" | "Manifest"
  progress: number; // 0–100
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  totalMinutes: number;
  longestSessionMin: number;
  lastLearnedAt?: string | null;
  lastStreakDate?: string | null;
  highestXpSingleDay?: number;
  mostWordsWritten?: number;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  reminderInterval?: string | null;
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

export interface HobbySessionEntry {
  id: string;
  skillId: string;
  minutesLearned: number;
  sessionXp: number;
  note?: string | null;
  createdAt: string;
}

export interface NotificationEntry {
  id: string;
  title: string;
  message: string;
  type: string; // "reminder" | "milestone" | "streak" | "info"
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

// ─── State Interface ──────────────────────────────────────────────────────────

interface DashboardState {
  profile: ProfileData;
  games: GameEntry[];
  dossierCharacters: DossierCharacterEntry[];
  gameCharacters: GameCharacterEntry[];
  gameResources: GameResourceEntry[];
  gameShowcaseItems: GameShowcaseEntry[];
  projects: ProjectItemEntry[];
  aiTools: AiToolItemEntry[];
  media: MediaEntry;
  animeList: AnimeEntry[];
  favoriteCharacters: FavoriteCharacter[];
  dramas: DramaEntry[];
  hallOfFame: HallOfFameEntry[];
  hallEvents: HallEventEntry[];
  championshipHistory: ChampionshipHistoryEntry[];
  hallRankingSnapshots: HallRankingSnapshotEntry[];
  notes: NoteEntry[];
  links: LinkEntry[];
  gallery: GalleryEntry[];
  savedPrompts: SavedPromptEntry[];
  requestSequenceId: number;
  isLoading: boolean;
  isHydrated: boolean;

  resetUserStore: () => void;
  fetchDashboard: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  addGame: (game: GameEntry) => Promise<void>;
  updateGame: (id: string, data: Partial<GameEntry>) => Promise<void>;
  removeGame: (id: string) => Promise<void>;
  addDossierCharacter: (item: DossierCharacterEntry) => Promise<void>;
  updateDossierCharacter: (id: string, data: Partial<DossierCharacterEntry>) => Promise<void>;
  removeDossierCharacter: (id: string) => Promise<void>;
  addGameCharacter: (item: Partial<GameCharacterEntry>) => Promise<GameCharacterEntry | null>;
  updateGameCharacter: (id: string, data: Partial<GameCharacterEntry>) => Promise<void>;
  removeGameCharacter: (id: string) => Promise<void>;
  syncGameCharacterArtwork: (gameCharId: string, dossierCharId: string, direction: "to_game_character" | "to_dossier_character") => Promise<void>;
  syncOrphanedGameCharacters: (gameId?: string, gameName?: string) => Promise<void>;
  addGameResource: (item: GameResourceEntry) => Promise<void>;
  updateGameResource: (id: string, data: Partial<GameResourceEntry>) => Promise<void>;
  removeGameResource: (id: string) => Promise<void>;
  addGameShowcaseItem: (item: GameShowcaseEntry) => Promise<void>;
  updateGameShowcaseItem: (id: string, data: Partial<GameShowcaseEntry>) => Promise<void>;
  removeGameShowcaseItem: (id: string) => Promise<void>;
  addProject: (item: ProjectItemEntry) => Promise<void>;
  updateProject: (id: string, data: Partial<ProjectItemEntry>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addAiTool: (item: AiToolItemEntry) => Promise<void>;
  updateAiTool: (id: string, data: Partial<AiToolItemEntry>) => Promise<void>;
  removeAiTool: (id: string) => Promise<void>;
  recordAiToolLaunch: (id: string) => Promise<void>;
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
  collections: CollectionEntry[];
  recentlyPlayed: SongEntry[];
  activeTrack: SongEntry | null;
  isPlaying: boolean;
  playlistQueue: SongEntry[];
  isShuffle: boolean;
  loopMode: "off" | "one" | "all";
  saveSong: (id: string, data: Omit<SongEntry, "id">) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  toggleFavoriteSong: (id: string) => Promise<void>;
  playTrack: (track: SongEntry, queue?: SongEntry[]) => void;
  recordPlay: (songId: string, songTitle: string, artist: string, duration?: number) => Promise<void>;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  toggleShuffle: () => void;
  cycleLoopMode: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  savePlaylist: (playlist: PlaylistEntry) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  saveCollection: (collection: CollectionEntry) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  setPlaylistQueue: (queue: SongEntry[]) => void;

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
  hobbySessions: HobbySessionEntry[];
  notifications: NotificationEntry[];
  logHobbyXP: (skillId: string, noteText: string) => Promise<void>;
  logLearningSession: (skillId: string, minutes: number, note?: string) => Promise<void>;
  addCustomSkill: (name: string, category: string, priority?: string) => Promise<void>;
  updateHobbyReminder: (skillId: string, enabled: boolean, time: string, interval: string) => Promise<void>;
  resetHobbyStreak: (skillId: string) => Promise<void>;
  deleteHobbySkill: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Profile Aesthetics Actions
  profileHistory: ProfileHistoryEntry[];
  updateAesthetics: (data: {
    name?: string;
    customTag?: string | null;
    bio?: string;
    avatar?: string | null;
    banner?: string | null;
    nameplate?: string | null;
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

const initialDossierCharacters: DossierCharacterEntry[] = INITIAL_DOSSIER_CHARACTERS;

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

const initialProjects: ProjectItemEntry[] = [
  {
    id: "proj-nexus-xenon",
    name: "Nexus Xenon - Personal Command Center",
    logo: "⚡",
    description: "Next-gen full-stack command center, interactive HUD, gaming database, and AI statistics suite built with React 19 & Next.js 16.",
    category: "Full-Stack Web",
    status: "Live",
    version: "v3.1.0",
    accentColor: "#00F5FF",
    websiteUrl: "https://github.com",
    githubUrl: "https://github.com",
    docsUrl: "https://github.com",
    techStack: ["Next.js 16", "React 19", "TypeScript", "Prisma", "Supabase", "TailwindCSS", "Framer Motion"],
    tags: ["Personal Dashboard", "HUD", "Gaming", "AI Scanner", "Open Source"],
    sortOrder: 1,
    isFeatured: true,
    isArchived: false,
    stats: { stars: 42, users: "1.2k", uptime: "99.9%" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-anime-vault",
    name: "Aura Anime & Drama Hub",
    logo: "⛩️",
    description: "High performance streaming index, drama tracking vault, character roster, and Japanese/Korean/Chinese media database.",
    category: "Media Platform",
    status: "Live",
    version: "v2.4.0",
    accentColor: "#FF6B35",
    websiteUrl: "/anime",
    githubUrl: "https://github.com",
    techStack: ["React 19", "Zustand", "PostgreSQL", "Prisma"],
    tags: ["Anime", "Drama", "Streaming", "Otaku"],
    sortOrder: 2,
    isFeatured: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-game-dossier-scanner",
    name: "Game Statistics Scanner Engine",
    logo: "📊",
    description: "Automated OCR & Vision AI analysis tool extracting gaming statistics directly from screenshots into structured dossiers.",
    category: "AI & ML",
    status: "Development",
    version: "v1.2.0-beta",
    accentColor: "#F59E0B",
    websiteUrl: "/heroes",
    techStack: ["TypeScript", "Canvas API", "OCR Engine", "Prisma"],
    tags: ["OCR", "Vision AI", "Genshin", "HSR", "WuWa", "MLBB"],
    sortOrder: 3,
    isFeatured: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
  },
];

const initialAiTools: AiToolItemEntry[] = DEFAULT_AI_TOOLS;

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>((set, get) => ({
  profile: initialProfile,
  games: [],
  dossierCharacters: initialDossierCharacters,
  gameCharacters: [],
  gameResources: initialGameResources,
  gameShowcaseItems: [],
  projects: initialProjects,
  aiTools: initialAiTools,
  media: initialMedia,
  animeList: [],
  favoriteCharacters: [],
  dramas: [],
  hallOfFame: [],
  hallEvents: [],
  championshipHistory: [],
  hallRankingSnapshots: [],
  notes: [],
  links: [],
  gallery: [],
  songs: [],
  playlists: [],
  collections: [],
  recentlyPlayed: [],
  activeTrack: null,
  isPlaying: false,
  playlistQueue: [],
  isShuffle: false,
  loopMode: "off",
  dramaLog: [],
  savedPrompts: [],
  hobbySkills: [],
  hobbyLogs: [],
  hobbySessions: [],
  notifications: [],
  profileHistory: [],
  requestSequenceId: 0,
  isLoading: false,
  isHydrated: false,

  resetUserStore: () => {
    set((s) => ({
      requestSequenceId: s.requestSequenceId + 1,
      isHydrated: false,
      isLoading: false,
      profile: initialProfile,
      games: [],
      dossierCharacters: initialDossierCharacters,
      gameCharacters: [],
      gameResources: initialGameResources,
      gameShowcaseItems: [],
      projects: initialProjects,
      aiTools: initialAiTools,
      media: initialMedia,
      animeList: [],
      favoriteCharacters: [],
      dramas: [],
      hallOfFame: [],
      hallEvents: [],
      championshipHistory: [],
      hallRankingSnapshots: [],
      notes: [],
      links: [],
      gallery: [],
      songs: [],
      playlists: [],
      collections: [],
      recentlyPlayed: [],
      activeTrack: null,
      isPlaying: false,
      playlistQueue: [],
      dramaLog: [],
      savedPrompts: [],
      hobbySkills: [],
      hobbyLogs: [],
      hobbySessions: [],
      notifications: [],
      profileHistory: [],
    }));
  },

  fetchDashboard: async () => {
    if (get().isLoading) return;
    const seq = get().requestSequenceId + 1;
    set({ isLoading: true, requestSequenceId: seq });
    try {
      const res = await fetch("/api/dashboard?t=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      
      // Prevent race conditions: if account switched or reset happened during fetch, discard
      if (get().requestSequenceId !== seq) {
        return;
      }

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
          dossierCharacters: data.dossierCharacters || [],
          gameCharacters: data.gameCharacters || [],
          gameResources: data.gameResources || [],
          gameShowcaseItems: data.gameShowcaseItems || [],
          projects: data.projects || [],
          aiTools: data.aiTools || [],

          animeList: data.animeList || [],
          favoriteCharacters: data.favoriteCharacters || [],
          dramas: data.dramas || [],
          hallOfFame: data.hallOfFame || [],
          hallEvents: data.hallEvents || [],
          championshipHistory: data.championshipHistory || [],
          hallRankingSnapshots: data.hallRankingSnapshots || [],
          notes: data.notes || [],
          links: data.links || [],
          gallery: data.gallery || [],
          songs: data.songs || [],
          playlists: data.playlists || [],
          collections: data.collections || [],
          dramaLog: (data.dramaLog || []).map((d: any) => ({
            ...d,
            mainActors: Array.isArray(d.mainActors) ? d.mainActors : [],
          })),
          savedPrompts: data.savedPrompts || [],
          hobbySkills: (data.hobbySkills || []).map((s: any) => ({
            ...s,
            level: s.level ?? 1,
            xp: s.xp ?? 0,
            streak: s.streak ?? 0,
            longestStreak: s.longestStreak ?? 0,
            totalMinutes: s.totalMinutes ?? 0,
            longestSessionMin: s.longestSessionMin ?? 0,
          })),
          hobbyLogs: (data.hobbyLogs || []).map((l: any) => ({
            ...l,
            createdAt: l.createdAt ?? new Date().toISOString(),
          })),
          hobbySessions: (data.hobbySessions || []).map((s: any) => ({
            ...s,
            createdAt: s.createdAt ?? new Date().toISOString(),
          })),
          notifications: (data.notifications || []).map((n: any) => ({
            ...n,
            createdAt: n.createdAt ?? new Date().toISOString(),
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
      if (get().requestSequenceId === seq) {
        set({ isLoading: false });
      }
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

  addGameCharacter: async (itemData) => {
    const newItem: GameCharacterEntry = {
      id: itemData.id || `game-char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: itemData.name || "Unnamed Character",
      gameId: itemData.gameId || "",
      gameName: itemData.gameName || "",
      // Basic
      title: itemData.title,
      officialName: itemData.officialName,
      alias: itemData.alias,
      nickname: itemData.nickname,
      nativeName: itemData.nativeName,
      // Identity
      birthday: itemData.birthday,
      age: itemData.age,
      gender: itemData.gender,
      height: itemData.height,
      weight: itemData.weight,
      species: itemData.species,
      race: itemData.race,
      // World
      nation: itemData.nation,
      region: itemData.region,
      planet: itemData.planet,
      organization: itemData.organization,
      affiliation: itemData.affiliation,
      faction: itemData.faction,
      // Combat
      role: itemData.role,
      category: itemData.category,
      element: itemData.element,
      attribute: itemData.attribute,
      path: itemData.path,
      weapon: itemData.weapon,
      rarity: itemData.rarity,
      damageType: itemData.damageType,
      combatRole: itemData.combatRole,
      // Competitive stats
      winRate: itemData.winRate,
      pickRate: itemData.pickRate,
      banRate: itemData.banRate,
      // Voice Actors
      voiceActors: itemData.voiceActors,
      // Story
      personality: itemData.personality,
      biography: itemData.biography,
      officialDescription: itemData.officialDescription,
      favoriteQuote: itemData.favoriteQuote,
      // Media
      avatarUrl: itemData.avatarUrl,
      splashArt: itemData.splashArt,
      gallery: itemData.gallery,
      accentColor: itemData.accentColor || "#3B82F6",
      // Meta
      characterId: itemData.characterId,
      isFavorite: itemData.isFavorite ?? false,
      notes: itemData.notes,
      metadataStatus: itemData.metadataStatus,
      stats: itemData.stats,
      tags: itemData.tags,
      tier: itemData.tier,
      rank: itemData.rank,
      createdAt: itemData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ gameCharacters: [...s.gameCharacters, newItem] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GAME_CHARACTER", payload: newItem }),
      });
    } catch (err) {
      console.error("Failed to sync added game character:", err);
    }
    return newItem;
  },

  updateGameCharacter: async (id, data) => {
    const updatedAt = new Date().toISOString();
    set((s) => ({
      gameCharacters: s.gameCharacters.map((gc) => (gc.id === id ? { ...gc, ...data, updatedAt } : gc)),
    }));
    try {
      const item = get().gameCharacters.find((gc) => gc.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_GAME_CHARACTER", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated game character:", err);
    }
  },

  removeGameCharacter: async (id) => {
    set((s) => ({ gameCharacters: s.gameCharacters.filter((gc) => gc.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_GAME_CHARACTER", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted game character:", err);
    }
  },

  syncGameCharacterArtwork: async (gameCharId, dossierCharId, direction) => {
    const gameChar = get().gameCharacters.find((gc) => gc.id === gameCharId);
    const dossierChar = get().dossierCharacters.find((dc) => dc.id === dossierCharId);
    if (!gameChar || !dossierChar) return;

    if (direction === "to_game_character") {
      await get().updateGameCharacter(gameCharId, {
        avatarUrl: dossierChar.avatarUrl || gameChar.avatarUrl,
        splashArt: dossierChar.splashArt || gameChar.splashArt,
        accentColor: dossierChar.accentColor || gameChar.accentColor,
      });
    } else {
      await get().updateDossierCharacter(dossierCharId, {
        avatarUrl: gameChar.avatarUrl || dossierChar.avatarUrl,
        splashArt: gameChar.splashArt || dossierChar.splashArt,
        accentColor: gameChar.accentColor || dossierChar.accentColor,
      });
    }
  },

  syncOrphanedGameCharacters: async (gameId, gameName) => {
    const state = get();
    const relevantDossierChars = state.dossierCharacters.filter((dc) => {
      if (gameId && dc.gameId !== gameId) return false;
      if (gameName && dc.gameId !== gameId) {
        const game = state.games.find((g) => g.id === dc.gameId);
        if (!game || game.game.toLowerCase() !== gameName.toLowerCase()) return false;
      }
      return true;
    });

    for (const dc of relevantDossierChars) {
      const exists = state.gameCharacters.some(
        (gc) =>
          gc.characterId === dc.id ||
          (gc.name.toLowerCase() === dc.name.toLowerCase() && gc.gameId === dc.gameId)
      );
      if (!exists) {
        const game = state.games.find((g) => g.id === dc.gameId);
        await get().addGameCharacter({
          characterId: dc.id,
          gameId: dc.gameId,
          gameName: game?.game || gameName || "Game",
          name: dc.name,
          role: dc.role,
          category: dc.category,
          avatarUrl: dc.avatarUrl,
          splashArt: dc.splashArt,
          accentColor: dc.accentColor,
          isFavorite: dc.isFavorite,
          winRate: dc.winRate,
          notes: dc.notes,
        });
      }
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

  addProject: async (item) => {
    set((s) => ({ projects: [item, ...s.projects] }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_PROJECT", payload: item }),
      });
    } catch (err) {
      console.error("Failed to sync added project:", err);
    }
  },

  updateProject: async (id, data) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
    try {
      const item = get().projects.find((p) => p.id === id);
      if (item) {
        await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPDATE_PROJECT", payload: item }),
        });
      }
    } catch (err) {
      console.error("Failed to sync updated project:", err);
    }
  },

  removeProject: async (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PROJECT", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to sync deleted project:", err);
    }
  },

  addAiTool: async (item) => {
    // Optimistic update
    set((s) => ({ aiTools: [item, ...s.aiTools] }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_AI_TOOL", payload: item }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[AI Library] addAiTool HTTP ${res.status}:`, body);
        // Rollback optimistic update on failure
        set((s) => ({ aiTools: s.aiTools.filter((t) => t.id !== item.id) }));
        return;
      }
      const result = await res.json();
      if (result?.data) {
        // Sync store with DB-authoritative record
        set((s) => ({
          aiTools: s.aiTools.map((t) =>
            t.id === item.id
              ? { ...t, ...result.data, createdAt: result.data.createdAt ?? t.createdAt, updatedAt: result.data.updatedAt ?? t.updatedAt }
              : t
          ),
        }));
      }
    } catch (err) {
      console.error("[AI Library] addAiTool network error:", err);
      set((s) => ({ aiTools: s.aiTools.filter((t) => t.id !== item.id) }));
    }
  },

  updateAiTool: async (id, data) => {
    // Optimistic update
    set((s) => ({
      aiTools: s.aiTools.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
    try {
      const item = get().aiTools.find((t) => t.id === id);
      if (!item) return;
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_AI_TOOL", payload: item }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[AI Library] updateAiTool HTTP ${res.status}:`, body);
        return;
      }
      const result = await res.json();
      if (result?.data) {
        set((s) => ({
          aiTools: s.aiTools.map((t) =>
            t.id === id
              ? { ...t, ...result.data, createdAt: result.data.createdAt ?? t.createdAt }
              : t
          ),
        }));
      }
    } catch (err) {
      console.error("[AI Library] updateAiTool network error:", err);
    }
  },

  removeAiTool: async (id) => {
    // Optimistic update
    const removed = get().aiTools.find((t) => t.id === id);
    set((s) => ({ aiTools: s.aiTools.filter((t) => t.id !== id) }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_AI_TOOL", payload: { id } }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[AI Library] removeAiTool HTTP ${res.status}:`, body);
        // Rollback: restore item
        if (removed) {
          set((s) => ({ aiTools: [...s.aiTools, removed] }));
        }
      }
    } catch (err) {
      console.error("[AI Library] removeAiTool network error:", err);
      if (removed) {
        set((s) => ({ aiTools: [...s.aiTools, removed] }));
      }
    }
  },

  recordAiToolLaunch: async (id) => {
    const now = new Date().toISOString();
    // Optimistic update
    set((s) => ({
      aiTools: s.aiTools.map((t) =>
        t.id === id
          ? { ...t, lastUsed: now, launchCount: (t.launchCount || 0) + 1 }
          : t
      ),
    }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RECORD_AI_TOOL_LAUNCH", payload: { id } }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[AI Library] recordAiToolLaunch HTTP ${res.status}:`, body);
      }
    } catch (err) {
      console.error("[AI Library] recordAiToolLaunch network error:", err);
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
    const previousSongs = get().songs;
    set((s) => {
      const exists = s.songs.some((song) => song.id === id);
      const newSongs = exists
        ? s.songs.map((song) => (song.id === id ? { id, ...data } : song))
        : [{ id, ...data }, ...s.songs];
      return { songs: newSongs };
    });
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_SONG", payload: { id, ...data } }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to sync song, rolling back:", err);
      set({ songs: previousSongs });
    }
  },

  deleteSong: async (id) => {
    const previousSongs = get().songs;
    set((s) => ({ songs: s.songs.filter((song) => song.id !== id) }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_SONG", payload: { id } }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to delete song, rolling back:", err);
      set({ songs: previousSongs });
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
        (t.youtubeId && activeTrack.youtubeId && t.youtubeId === activeTrack.youtubeId)
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
        (t.youtubeId && activeTrack.youtubeId && t.youtubeId === activeTrack.youtubeId)
    );
    if (currIdx === -1) currIdx = 0;

    if (currIdx === 0 && loopMode === "off") {
      set({ activeTrack: queue[0], isPlaying: true });
      return;
    }

    const prevIdx = (currIdx - 1 + queue.length) % queue.length;
    set({ activeTrack: queue[prevIdx], isPlaying: true });
  },

  savePlaylist: async (playlist) => {
    const previousPlaylists = get().playlists;
    set((s) => {
      const exists = s.playlists.some((p) => p.id === playlist.id);
      const updated = exists
        ? s.playlists.map((p) => (p.id === playlist.id ? playlist : p))
        : [playlist, ...s.playlists];
      return { playlists: updated };
    });
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_PLAYLIST", payload: playlist }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to sync playlist, rolling back:", err);
      set({ playlists: previousPlaylists });
    }
  },

  deletePlaylist: async (id) => {
    const previousPlaylists = get().playlists;
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PLAYLIST", payload: { id } }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to delete playlist, rolling back:", err);
      set({ playlists: previousPlaylists });
    }
  },

  setPlaylistQueue: (queue) => {
    set({ playlistQueue: queue });
  },

  toggleFavoriteSong: async (id) => {
    // Optimistic update
    set((s) => ({
      songs: s.songs.map((song) =>
        song.id === id ? { ...song, isFavorite: !song.isFavorite } : song
      ),
    }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_SONG_FAVORITE", payload: { id } }),
      });
      if (!res.ok) {
        // Revert on failure
        set((s) => ({
          songs: s.songs.map((song) =>
            song.id === id ? { ...song, isFavorite: !song.isFavorite } : song
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle favorite, reverting:", err);
      set((s) => ({
        songs: s.songs.map((song) =>
          song.id === id ? { ...song, isFavorite: !song.isFavorite } : song
        ),
      }));
    }
  },

  recordPlay: async (songId, songTitle, artist, duration) => {
    // Update recentlyPlayed in-memory immediately
    const songEntry = get().songs.find((s) => s.id === songId);
    if (songEntry) {
      set((s) => {
        const filtered = s.recentlyPlayed.filter((r) => r.id !== songId);
        return { recentlyPlayed: [songEntry, ...filtered].slice(0, 50) };
      });
    }
    // Increment local playCount
    set((s) => ({
      songs: s.songs.map((song) =>
        song.id === songId
          ? { ...song, playCount: (song.playCount || 0) + 1, lastPlayedAt: new Date().toISOString() }
          : song
      ),
    }));
    // Fire-and-forget server call
    try {
      await fetch("/api/music/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, songTitle, artist, duration }),
      });
    } catch (err) {
      console.warn("Failed to record play:", err);
    }
  },

  saveCollection: async (collection) => {
    const previousCollections = get().collections;
    set((s) => {
      const exists = s.collections.some((c) => c.id === collection.id);
      const updated = exists
        ? s.collections.map((c) => (c.id === collection.id ? collection : c))
        : [collection, ...s.collections];
      return { collections: updated };
    });
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_COLLECTION", payload: collection }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to sync collection, rolling back:", err);
      set({ collections: previousCollections });
    }
  },

  deleteCollection: async (id) => {
    const previousCollections = get().collections;
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_COLLECTION", payload: { id } }),
      });
      if (!res.ok) throw new Error("Server responded with error");
    } catch (err) {
      console.error("Failed to delete collection, rolling back:", err);
      set({ collections: previousCollections });
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
      if (result.success && result.data) {
        set((s) => ({
          hobbySkills: s.hobbySkills.map((sk) => (sk.id === skillId ? { ...sk, ...result.data } : sk)),
          hobbyLogs: [
            ...s.hobbyLogs,
            {
              id: "log-" + Date.now(),
              skillId,
              delta: result.delta ?? 0,
              wordCount: words,
              note: noteText.slice(0, 120),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }
    } catch (err) {
      console.error("Failed to log hobby XP:", err);
    }
  },

  logLearningSession: async (skillId, minutesLearned, noteText?) => {
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_HOBBY_SESSION",
          payload: { skillId, minutesLearned, note: noteText },
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        set((s) => ({
          hobbySkills: s.hobbySkills.map((sk) => (sk.id === skillId ? { ...sk, ...result.data } : sk)),
          hobbySessions: [result.session, ...s.hobbySessions],
        }));
        // Re-fetch dashboard silently to receive any new notifications generated
        get().fetchDashboard();
      }
    } catch (err) {
      console.error("Failed to log learning session:", err);
    }
  },

  addCustomSkill: async (name, category, priority = "Priority") => {
    const newId = "skill-" + Math.random().toString(36).substring(2, 9);
    const optimistic: HobbySkillEntry = {
      id: newId,
      name,
      category,
      priority,
      progress: 0,
      level: 1,
      xp: 0,
      streak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      longestSessionMin: 0,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({ hobbySkills: [...s.hobbySkills, optimistic] }));

    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_HOBBY_SKILL",
          payload: { id: newId, name, category, priority },
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        set((s) => ({
          hobbySkills: s.hobbySkills.map((sk) => (sk.id === newId ? result.data : sk)),
        }));
      }
    } catch (err) {
      console.error("Failed to add custom skill:", err);
    }
  },

  updateHobbyReminder: async (skillId, enabled, time, interval) => {
    set((s) => ({
      hobbySkills: s.hobbySkills.map((sk) =>
        sk.id === skillId
          ? { ...sk, reminderEnabled: enabled, reminderTime: time, reminderInterval: interval }
          : sk
      ),
    }));

    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_HOBBY_REMINDER",
          payload: { skillId, reminderEnabled: enabled, reminderTime: time, reminderInterval: interval },
        }),
      });
    } catch (err) {
      console.error("Failed to update hobby reminder:", err);
    }
  },

  resetHobbyStreak: async (skillId) => {
    set((s) => ({
      hobbySkills: s.hobbySkills.map((sk) =>
        sk.id === skillId ? { ...sk, streak: 0, lastStreakDate: null } : sk
      ),
    }));

    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_HOBBY_STREAK",
          payload: { skillId },
        }),
      });
    } catch (err) {
      console.error("Failed to reset hobby streak:", err);
    }
  },

  deleteHobbySkill: async (id) => {
    set((s) => ({ hobbySkills: s.hobbySkills.filter((sk) => sk.id !== id) }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_HOBBY_SKILL", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to delete hobby skill:", err);
    }
  },

  dismissNotification: async (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DISMISS_NOTIFICATION", payload: { id } }),
      });
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  },

  clearNotifications: async () => {
    set({ notifications: [] });
    try {
      await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLEAR_NOTIFICATIONS", payload: {} }),
      });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  },

  // ─── Profile Aesthetics Actions ──────────────────────────────────────────────

  updateAesthetics: async (data) => {
    // Optimistic update: null means "cleared" — store as undefined so ProfileData
    // optional fields stay valid (ProfileData doesn't accept null).
    set((s) => ({
      profile: {
        ...s.profile,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.borderStyle !== undefined && { borderStyle: data.borderStyle }),
        customTag: data.customTag === null ? undefined : data.customTag !== undefined ? data.customTag : s.profile.customTag,
        avatar:    data.avatar    === null ? undefined : data.avatar    !== undefined ? data.avatar    : s.profile.avatar,
        banner:    data.banner    === null ? undefined : data.banner    !== undefined ? data.banner    : s.profile.banner,
        nameplate: data.nameplate === null ? undefined : data.nameplate !== undefined ? data.nameplate : s.profile.nameplate,
      },
    }));
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_AESTHETIC", payload: data }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        // Merge server response — convert null DB values back to undefined for ProfileData
        const srv = result.data;
        set((s) => ({
          profile: {
            ...s.profile,
            ...(srv.name     !== undefined && { name:       srv.name }),
            ...(srv.bio      !== undefined && { bio:        srv.bio }),
            ...(srv.borderStyle !== undefined && { borderStyle: srv.borderStyle }),
            customTag: srv.customTag  ?? undefined,
            avatar:    srv.avatar     ?? undefined,
            banner:    srv.banner     ?? undefined,
            nameplate: srv.nameplate  ?? undefined,
          },
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
