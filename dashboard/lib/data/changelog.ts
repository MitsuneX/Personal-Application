export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge: string;
  type: "major" | "minor" | "patch";
  summary: string;
  categories: {
    name: "New Features" | "Bug Fixes & Engine" | "UI & Aesthetics" | "PWA & Mobile";
    items: string[];
  }[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v2.5.0",
    date: "2026-07-22",
    title: "Synchronized Lyrics Engine & Native Android APK",
    badge: "MAJOR RELEASE",
    type: "major",
    summary: "Integrated YouTube API v3 & Genius API for karaoke synced lyrics, fixed audio player seeking/pause/mute bugs, and compiled production Android APK.",
    categories: [
      {
        name: "New Features",
        items: [
          "Real-time synchronized karaoke lyrics with line-by-line timing & Romaji/Pinyin transcription (Genius API).",
          "YouTube API v3 music search & background audio streaming engine.",
          "Top-bar Settings menu (⚙️) with Log Updates (Changelog) view.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Fixed YouTube player pause/resume timestamp retention — video no longer resets to 0:00 when paused.",
          "Fixed volume slider & mute button controls (sends postMessage setVolume/mute to YouTube iframe).",
          "Fixed timeline scrubbing and seek bar skipping issue.",
          "Fixed next & previous track queue cycling logic.",
          "Enforced multi-tenant account data isolation per Supabase session ID.",
        ],
      },
      {
        name: "PWA & Mobile",
        items: [
          "Packaged web app into native signed Android APK (com.nexusxenon.app) via Bubblewrap CLI.",
          "Configured Digital Asset Links (assetlinks.json) with SHA-256 fingerprint for standalone display.",
          "Integrated device-tier Lottie loading animations (Nexus-Xenon-Mobile & Neo-Brutalism-Mobile).",
        ],
      },
    ],
  },
  {
    version: "v2.4.0",
    date: "2026-07-21",
    title: "Indonesian Drama Hub & Profile Refinements",
    badge: "FEATURE UPDATE",
    type: "minor",
    summary: "Added Indonesian Drama hub with Merah Putih & Batik motifs, national filters in Hall of Fame, and account session controls.",
    categories: [
      {
        name: "New Features",
        items: [
          "New Indonesian Drama page (/drama/indonesia) featuring Merah Putih accents and Batik motifs.",
          "Added 🇮🇩 Indonesia nationality filter to Hall of Fame Group 1 rankings & Characters page.",
          "Integrated Account Session & Log Out panel in Profile Settings.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "Dynamic status indicators in top navigation bar (Online green, AFK yellow, Busy red).",
          "Enhanced profile cover & avatar customizer modal.",
        ],
      },
    ],
  },
  {
    version: "v2.3.0",
    date: "2026-07-19",
    title: "Dynamic Theme Engine & Zero-Flash Hydration",
    badge: "ENGINE UPDATE",
    type: "minor",
    summary: "Synchronous SSR theme injection to eliminate FOUC, dual Cyberpunk & Neo-Brutalism loading screens.",
    categories: [
      {
        name: "UI & Aesthetics",
        items: [
          "Implemented synchronous theme injection in HTML <head> to eliminate unstyled flash on hard refresh.",
          "Added Cyberpunk (Neon cyan/purple glassmorphism) & Neo-Brutalism (stark black borders, hard shadows) themes.",
          "Dual Lottie splash loading screens (Nexus-Xenon-Loading & Neo-Brutalism-Loading).",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Synchronous Zustand store hydration for theme preference.",
          "Optimized dynamic font loading for Orbitron, JetBrains Mono, and Space Grotesk.",
        ],
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "2026-07-15",
    title: "Music Vault & Command Center Launch",
    badge: "MILESTONE",
    type: "major",
    summary: "Initial launch of the Nexus Xenon Personal Command Center with tracking modules for Media, Anime, Games, and Music.",
    categories: [
      {
        name: "New Features",
        items: [
          "Music Vault with floating FAB options menu (Search, Upload, Playlists).",
          "Anime & Drama trackers with episode steppers and status badges.",
          "Hall of Fame ranking system with likes and champion badges.",
          "Notepad workspace, Bookmark directory, and Media Gallery.",
        ],
      },
    ],
  },
];
