import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Seed data constants
const initialProfile = {
  id: "profile",
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

const initialGames = [
  { game: "Honkai: Star Rail", handle: "UID: ••••••••", platform: "Multi", rank: "ER 75", mainCharacter: "The Hero", mainRole: "Erudition", category: "Gacha RPG", isActive: true, accentColor: "#7C3AED" },
  { game: "Zenless Zone Zero", handle: "UID: ••••••••", platform: "Multi", rank: "AR 55", mainCharacter: "Anby", mainRole: "Electric DPS", category: "Gacha Action", isActive: true, accentColor: "#F59E0B" },
  { game: "Wuthering Waves", handle: "UID: ••••••••", platform: "Multi", rank: "AR 60", mainCharacter: "Yanfei", mainRole: "Pyro DPS", category: "Gacha RPG", isActive: true, accentColor: "#EF4444" },
  { game: "Genshin Impact", handle: "UID: ••••••••", platform: "Multi", rank: "AR 60", mainCharacter: "Xiao", mainRole: "Anemo DPS", category: "Gacha RPG", isActive: true, accentColor: "#10B981" },
  { game: "Mobile Legends", handle: "Ryukawa", platform: "Mobile", rank: "Mythic", mainCharacter: "Layla", mainRole: "Marksman", category: "MOBA", isActive: true, accentColor: "#3B82F6" },
  { game: "Valorant", handle: "Ryukawa#JP1", platform: "PC", rank: "Gold", mainCharacter: "Jett", mainRole: "Duelist", category: "FPS", isActive: true, accentColor: "#EF4444" },
  { game: "Solo Leveling: ARISE", handle: "Ryukawa", platform: "Mobile", rank: "Hero", mainCharacter: "Sung Jinwoo", mainRole: "Mage", category: "Action RPG", isActive: true, accentColor: "#6366F1" },
  { game: "Dragon Ball Legends", handle: "Ryukawa", platform: "Mobile", rank: "Saiyan", mainCharacter: "Goku", mainRole: "Strike", category: "Fighting", isActive: true, accentColor: "#F97316" },
];

const initialAnime = [
  { title: "Frieren: Beyond Journey's End", episodesWatched: 28, totalEpisodes: 28, status: "Completed", rating: 10, genre: "Fantasy", studio: "Madhouse", year: 2023 },
  { title: "Dandadan", episodesWatched: 8, totalEpisodes: 13, status: "Watching", rating: 9, genre: "Action / Romance", studio: "Science SARU", year: 2024 },
  { title: "Solo Leveling", episodesWatched: 13, totalEpisodes: 13, status: "Completed", rating: 9, genre: "Action RPG", studio: "A-1 Pictures", year: 2024 },
  { title: "Chainsaw Man", episodesWatched: 12, totalEpisodes: 12, status: "Completed", rating: 9, genre: "Dark Action", studio: "MAPPA", year: 2022 },
  { title: "Jujutsu Kaisen S3", episodesWatched: 2, totalEpisodes: 21, status: "Watching", rating: 9, genre: "Dark Fantasy", studio: "MAPPA", year: 2025 },
  { title: "Vinland Saga S2", episodesWatched: 24, totalEpisodes: 24, status: "Completed", rating: 10, genre: "Historical", studio: "MAPPA", year: 2023 },
  { title: "Dungeon Meshi", episodesWatched: 24, totalEpisodes: 24, status: "Completed", rating: 10, genre: "Fantasy Adventure", studio: "Trigger", year: 2024 },
];

const initialCharacters = [
  { name: "Frieren", anime: "Frieren: Beyond Journey's End", isFavorite: true },
  { name: "Denji", anime: "Chainsaw Man", isFavorite: true },
  { name: "Sung Jinwoo", anime: "Solo Leveling", isFavorite: true },
  { name: "Momo Ayase", anime: "Dandadan", isFavorite: true },
  { name: "Thorfinn", anime: "Vinland Saga", isFavorite: true },
  { name: "Laios", anime: "Dungeon Meshi", isFavorite: true },
];

const initialDramas = [
  // Japanese
  { title: "Alice in Borderland", country: "japanese", episodes: 8, episodesWatched: 8, status: "Completed", rating: 9, genre: "Thriller / Survival", year: 2020, platform: "Netflix", cast: ["Kento Yamazaki", "Tao Tsuchiya"] },
  { title: "Midnight Diner", country: "japanese", episodes: 10, episodesWatched: 10, status: "Completed", rating: 10, genre: "Slice of Life", year: 2009, platform: "Netflix", cast: ["Kaoru Kobayashi"] },
  { title: "Sanctuary", country: "japanese", episodes: 8, episodesWatched: 5, status: "Watching", rating: 9, genre: "Sports / Drama", year: 2023, platform: "Netflix" },
  { title: "Good Doctor JP", country: "japanese", episodes: 11, episodesWatched: 11, status: "Completed", rating: 8, genre: "Medical / Drama", year: 2018, platform: "TBS" },
  // Korean
  { title: "Squid Game", country: "korean", episodes: 9, episodesWatched: 9, status: "Completed", rating: 10, genre: "Thriller / Survival", year: 2021, platform: "Netflix", cast: ["Lee Jung-jae", "Park Hae-soo"] },
  { title: "Crash Landing on You", country: "korean", episodes: 16, episodesWatched: 16, status: "Completed", rating: 9, genre: "Romance / Comedy", year: 2019, platform: "Netflix", cast: ["Hyun Bin", "Son Ye-jin"] },
  { title: "Extraordinary Attorney Woo", country: "korean", episodes: 16, episodesWatched: 10, status: "Watching", rating: 9, genre: "Legal / Drama", year: 2022, platform: "Netflix" },
  { title: "Moving", country: "korean", episodes: 20, episodesWatched: 20, status: "Completed", rating: 10, genre: "Superhero / Thriller", year: 2023, platform: "Disney+" },
  // Chinese
  { title: "The Untamed", country: "chinese", episodes: 50, episodesWatched: 50, status: "Completed", rating: 9, genre: "Wuxia / Romance", year: 2019, platform: "Youku", cast: ["Xiao Zhan", "Wang Yibo"] },
  { title: "Word of Honor", country: "chinese", episodes: 36, episodesWatched: 36, status: "Completed", rating: 9, genre: "Wuxia / Action", year: 2021, platform: "iQIYI" },
  { title: "Love O2O", country: "chinese", episodes: 30, episodesWatched: 15, status: "Watching", rating: 8, genre: "Romance / Gaming", year: 2016, platform: "iQIYI" },
  { title: "Nirvana in Fire", country: "chinese", episodes: 54, episodesWatched: 54, status: "Completed", rating: 10, genre: "Historical / Political", year: 2015, platform: "iQIYI" },
];

const initialHallOfFame = [
  // Actors
  { name: "Ryan Gosling", type: "actor", status: "GOAT Status", knownFor: ["Blade Runner 2049", "La La Land", "Drive"], nationality: "Canadian", note: "The definition of cool" },
  { name: "Keanu Reeves", type: "actor", status: "GOAT Status", knownFor: ["John Wick", "The Matrix", "Speed"], nationality: "American", note: "Real-life protagonist energy" },
  { name: "Adam Scott", type: "actor", status: "All-Star", knownFor: ["Severance", "Parks & Recreation", "Step Brothers"], nationality: "American" },
  { name: "Kento Yamazaki", type: "actor", status: "All-Star", knownFor: ["Alice in Borderland", "Death Note"], nationality: "Japanese" },
  { name: "Lee Jung-jae", type: "actor", status: "All-Star", knownFor: ["Squid Game", "The Aura"], nationality: "Korean" },
  // Actresses
  { name: "Ana de Armas", type: "actress", status: "All-Star", knownFor: ["Knives Out", "Blonde", "Blade Runner 2049"], nationality: "Cuban-Spanish" },
  { name: "Zendaya", type: "actress", status: "Rising", knownFor: ["Euphoria", "Dune", "Challengers"], nationality: "American", note: "Gen Z's greatest" },
  { name: "Patricia Arquette", type: "actress", status: "GOAT Status", knownFor: ["Severance", "True Romance", "Medium"], nationality: "American" },
  { name: "Son Ye-jin", type: "actress", status: "All-Star", knownFor: ["Crash Landing on You", "Something in the Rain"], nationality: "Korean" },
  { name: "Tao Tsuchiya", type: "actress", status: "Rising", knownFor: ["Alice in Borderland", "Orange"], nationality: "Japanese" },
  // Anime
  { name: "Frieren: Beyond Journey's End", type: "anime", status: "GOAT Status", knownFor: ["Emotional depth", "Beautiful world-building", "Sousou no Frieren OST"], note: "A masterpiece of the era" },
  { name: "Vinland Saga", type: "anime", status: "GOAT Status", knownFor: ["Character development", "Historical accuracy", "Thorfinn's arc"], note: "The greatest redemption arc" },
  { name: "Chainsaw Man", type: "anime", status: "All-Star", knownFor: ["Unique storytelling", "MAPPA animation", "Iconic OSTs"] },
  { name: "Dungeon Meshi", type: "anime", status: "All-Star", knownFor: ["World-building", "Creative cooking", "Trigger animation"] },
  { name: "Solo Leveling", type: "anime", status: "All-Star", knownFor: ["Power fantasy", "Incredible fights", "A-1 Pictures quality"] },
];

export async function GET() {
  try {
    // 1. Fetch or Seed Profile
    let dbProfile = await prisma.profile.findUnique({ where: { id: "profile" } });
    if (!dbProfile) {
      dbProfile = await prisma.profile.create({
        data: {
          id: initialProfile.id,
          name: initialProfile.name,
          tagline: initialProfile.tagline,
          bio: initialProfile.bio,
          status: initialProfile.status,
          location: initialProfile.location,
          skills: initialProfile.skills,
          socials: initialProfile.socials as any,
        },
      });
    }

    // 2. Fetch or Seed Games
    let dbGames = await prisma.game.findMany({ orderBy: { createdAt: "asc" } });
    if (dbGames.length === 0) {
      await prisma.game.createMany({ data: initialGames });
      dbGames = await prisma.game.findMany({ orderBy: { createdAt: "asc" } });
    }

    // 3. Fetch or Seed Anime
    let dbAnime = await prisma.anime.findMany({ orderBy: { createdAt: "asc" } });
    if (dbAnime.length === 0) {
      await prisma.anime.createMany({ data: initialAnime });
      dbAnime = await prisma.anime.findMany({ orderBy: { createdAt: "asc" } });
    }

    // 4. Fetch or Seed Favorite Characters
    let dbCharacters = await prisma.favoriteCharacter.findMany({ orderBy: { createdAt: "asc" } });
    if (dbCharacters.length === 0) {
      await prisma.favoriteCharacter.createMany({ data: initialCharacters });
      dbCharacters = await prisma.favoriteCharacter.findMany({ orderBy: { createdAt: "asc" } });
    }

    // 5. Fetch or Seed Dramas
    let dbDramas = await prisma.drama.findMany({ orderBy: { createdAt: "asc" } });
    if (dbDramas.length === 0) {
      await prisma.drama.createMany({ data: initialDramas });
      dbDramas = await prisma.drama.findMany({ orderBy: { createdAt: "asc" } });
    }

    // 6. Fetch or Seed Hall of Fame
    let dbHOF = await prisma.hallOfFame.findMany({ orderBy: { createdAt: "asc" } });
    if (dbHOF.length === 0) {
      await prisma.hallOfFame.createMany({ data: initialHallOfFame });
      dbHOF = await prisma.hallOfFame.findMany({ orderBy: { createdAt: "asc" } });
    }

    return NextResponse.json({
      profile: dbProfile,
      games: dbGames,
      animeList: dbAnime,
      favoriteCharacters: dbCharacters,
      dramas: dbDramas,
      hallOfFame: dbHOF,
    });
  } catch (error: any) {
    console.error("API GET Dashboard Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
