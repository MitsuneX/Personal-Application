export interface MusicAchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function computeMusicAchievements(
  songsCount: number,
  playlistsCount: number,
  offlineCount: number,
  totalPlays: number,
  cachedLyricsCount: number
): MusicAchievementItem[] {
  return [
    {
      id: "first_song",
      title: "First Spark 🎵",
      description: "Saved your very first song to the Music Vault",
      icon: "🎧",
      unlocked: songsCount >= 1,
      progress: Math.min(songsCount, 1),
      maxProgress: 1,
    },
    {
      id: "collector_10",
      title: "Vibe Collector 💿",
      description: "Build a library of 10 tracks",
      icon: "📦",
      unlocked: songsCount >= 10,
      progress: Math.min(songsCount, 10),
      maxProgress: 10,
    },
    {
      id: "collector_50",
      title: "Vault Maestro 🎼",
      description: "Amass 50 tracks in your personal vault",
      icon: "👑",
      unlocked: songsCount >= 50,
      progress: Math.min(songsCount, 50),
      maxProgress: 50,
    },
    {
      id: "collector_100",
      title: "Music Curator 🏆",
      description: "Reach 100 tracks in your collection",
      icon: "🌟",
      unlocked: songsCount >= 100,
      progress: Math.min(songsCount, 100),
      maxProgress: 100,
    },
    {
      id: "first_playlist",
      title: "Playlist Architect 📁",
      description: "Create your first custom playlist",
      icon: "📂",
      unlocked: playlistsCount >= 1,
      progress: Math.min(playlistsCount, 1),
      maxProgress: 1,
    },
    {
      id: "offline_collector",
      title: "Offline Vault Guardian 💾",
      description: "Save 5 tracks offline for plane mode listening",
      icon: "📡",
      unlocked: offlineCount >= 5,
      progress: Math.min(offlineCount, 5),
      maxProgress: 5,
    },
    {
      id: "lyrics_hunter",
      title: "Lyrics Hunter 🎤",
      description: "Cache synchronized lyrics for 5 tracks",
      icon: "📜",
      unlocked: cachedLyricsCount >= 5,
      progress: Math.min(cachedLyricsCount, 5),
      maxProgress: 5,
    },
    {
      id: "listening_marathon",
      title: "Audio Marathoner ⏱️",
      description: "Stream at least 50 track sessions",
      icon: "🔥",
      unlocked: totalPlays >= 50,
      progress: Math.min(totalPlays, 50),
      maxProgress: 50,
    },
  ];
}
