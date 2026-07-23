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
    version: "v2.6.2",
    date: "2026-07-23",
    title: "Media & Drama Log Live Store Binding & Overflow Capping",
    badge: "WIDGET DATA SYNC",
    type: "patch",
    summary: "Completely purged static mock fallbacks from MediaLogCard, bound Top Show, Now Streaming, Actors, and Actresses directly to live Zustand store state, capped visible talent to top 4 max, and added a direct link to the Hall of Fame.",
    categories: [
      {
        name: "New Features",
        items: [
          "Complete Purge of Static Mock Data: Removed all hardcoded fallback objects from MediaLogCard so it relies exclusively on active user store records with graceful empty state UIs.",
          "Live Drama & Hall of Fame Store Sync: Now Streaming and Top Show pull real-time watch status, ratings, and episode progress, while Actors and Actresses sync directly with Hall of Fame rankings.",
          "Strict Overflow Control & Navigation: Capped visible actors and actresses lists to top 4 max and added a styled 'VIEW HALL OF FAME' button routing directly to /hall-of-fame.",
        ],
      },
    ],
  },
  {
    version: "v2.6.0",
    date: "2026-07-23",
    title: "Dynamic Media Sync, Hall of Fame Integration & Production Lyrics Engine",
    badge: "FEATURE & MUSIC UPGRADE",
    type: "minor",
    summary: "Connected Media Log widget to dynamic Zustand drama and Hall of Fame stores with compact layout navigation, integrated LRCLib for free production synced lyrics, and added a regex sanitizer to purge scraped text clutter.",
    categories: [
      {
        name: "New Features",
        items: [
          "Dynamic Media & Drama Log Sync: Now Streaming and Top Show cards pull live watch progress, episode counts, platforms, and ratings directly from actual dramas & dramaLog store records.",
          "Real-Time Hall of Fame Talent Sync: Actors and Actresses sections dynamically filter real-time Hall of Fame rankings (#1, #2 rank badges and GOAT/All-Star status) with auto-updating reactive state.",
          "LRCLib Synced Lyrics Backup: Added free open-source LrcLib API provider for instant time-synced LRC lyrics playback without API key quotas.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "Compact Widget View & Navigation: Capped Actors and Actresses widget lists to top 4 items max and added a styled 'View Full Hall of Fame' button linking directly to /hall-of-fame.",
          "Clean Lyrics Sanitizer: Added sanitizeLyricText regex filtering in app/api/music/lyrics/route.ts to strip out Genius scraper headers (Contributors, Translations, language lists, Embed counts, and boilerplate links).",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Production Lyrics Request Robustness: Injected full browser User-Agent and Accept headers across Musixmatch, LRCLib, and Genius API requests to prevent HTTP 403/401 blocks in hosted production environments.",
        ],
      },
    ],
  },
  {
    version: "v2.5.9",
    date: "2026-07-23",
    title: "Pure Framer Motion Loading Engine & Interactive Physics Overhaul",
    badge: "UI & ENGINE OVERHAUL",
    type: "patch",
    summary: "Replaced external Lottie JSON files with pure code-based Framer Motion loading animations, overhauled interactive buttons with tactile physics and theme shadow shifts, and resolved Next.js SSR hydration/style warnings.",
    categories: [
      {
        name: "New Features",
        items: [
          "Pure Framer Motion Loading Engine: Created LoadingGraphic.tsx featuring custom theme-specific loading graphics (rotating hard-shadow geometric blocks for Neo-Brutalism, dual-ring sci-fi HUD spinners with radar sweep for Cyberpunk).",
          "Zero External Lottie Dependencies: Removed all Lottie JSON files and lottie-react package overhead for faster client bundle performance.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "App-Wide Interactive Micro-Interactions: Added Framer Motion spring physics (whileHover, whileTap) across ThemeSwitcherToggle, TabSwitcher, CustomSelect, NavLink, FloatingFAB, and Header controls.",
          "Neo-Brutalism Shadow Physics: Directional drop-shadow shifts on hover (-2px, -2px shift to 5px 5px 0 #000) and tactile press compression (1px 1px 0 #000).",
          "Cyberpunk Neon Halo & Glassmorphism: Multi-layer cyan/magenta neon glow shadows (0 0 20px rgba(0,245,255,0.4)), backdrop blurs, and hover lift physics.",
          "Global CSS Utility System: Introduced .btn-interactive and .theme-card-interactive in globals.css for application-wide visual consistency.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Resolved Next.js Turbopack React script tag warning in layout.tsx by utilizing native inline HTML script tags.",
          "Fixed Framer Motion tabindex='0' hydration mismatch on navigation links, search bar triggers, and select controls using suppressHydrationWarning.",
          "Fixed React style shorthand property warning (borderBottom vs borderBottomColor) in Header.tsx.",
        ],
      },
    ],
  },
  {
    version: "v2.5.8",
    date: "2026-07-23",
    title: "Loading Screen Modal Refactor",
    badge: "UI FIX",
    type: "patch",
    summary: "Refactored SplashGuard and LoadingOverlay to use full-screen outer wrappers with cleanly centered modal cards.",
    categories: [
      {
        name: "UI & Aesthetics",
        items: [
          "Updated loading components to apply the JSON containerStyle directly to an inner modal box rather than the fullscreen background.",
          "Added full-screen backdrop using the theme's core background color to properly frame the loading modal.",
        ],
      },
    ],
  },
  {
    version: "v2.5.7",
    date: "2026-07-23",
    title: "Global Command Palette & Links Indexing Engine",
    badge: "SEARCH UPGRADE",
    type: "patch",
    summary: "Upgraded global CTRL+K search modal with dynamic cross-model indexing (Bookmarks, Notes, Games, Anime, Dramas, Songs, Gallery, Prompts, Hobbies, Profiles) and instant route navigation.",
    categories: [
      {
        name: "New Features",
        items: [
          "Dynamic Comprehensive Indexing: Global search automatically scans 12 application data models in parallel (including Bookmarks/Links, Notepad, Music Vault, Media Gallery, AI Prompts, and Hobbies).",
          "Flexible Fuzzy Keyword Matching: Case-insensitive search across titles, categories, tags, URLs, platforms, genres, and metadata.",
          "Direct Navigation: Clicking any search result instantly routes to its specific application page or view (/links, /games, /notepad, /gallery, etc.).",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Resolved missing Bookmarks/Links indexer in backend search API route (/api/search/route.ts).",
          "Fixed property key mismatches and empty result list edge cases in CommandPalette.tsx.",
        ],
      },
    ],
  },
  {
    version: "v2.5.6",
    date: "2026-07-23",
    title: "Gamenized HUD & Arcade Games Page Overhaul",
    badge: "UI OVERHAUL",
    type: "patch",
    summary: "Cranked up the gamenized aesthetic on GamesPage & GameCard with sci-fi HUD crosshairs, active LED pulses, arcade coin slots, and inventory slot item containers.",
    categories: [
      {
        name: "UI & Aesthetics",
        items: [
          "Cyber Theme: Animated sci-fi corner brackets (crosshair L-corners), cyan scanline overlays, active green LED pulse dots, and monospace terminal tags.",
          "Neo-Brutalism Theme: 3px solid black borders, hard offset 5px/8px drop shadows, retro coin-slot tags (SYS // GACHA_DECK), and punchy arcade header bars.",
          "Inventory slot item container styling for category icons with inset depth and energetic arcade-cabinet hover pop (scale 1.015, y: -6).",
        ],
      },
    ],
  },
  {
    version: "v2.5.5",
    date: "2026-07-23",
    title: "Clean HTML Web Scraper & Frontend Lyrics Cache",
    badge: "PERFORMANCE FIX",
    type: "patch",
    summary: "Fixed web scraper HTML tag leakage bug and added in-memory lyrics caching to prevent duplicate API requests and save API quota.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Updated public Genius web scraper in app/api/music/lyrics/route.ts to extract inner container HTML and strip all tags and <br> elements cleanly.",
          "Implemented in-memory Map caching in LyricsModal.tsx — reopening lyrics for the active track displays instantly with 0 network calls.",
          "Bypasses cache on manual 'Retry Search' button click for fresh API fetch.",
        ],
      },
    ],
  },
  {
    version: "v2.5.4",
    date: "2026-07-23",
    title: "Lyrics Search Short-Circuit & Web Scrape Fallback",
    badge: "BUG FIX",
    type: "patch",
    summary: "Fixed search loop overwrite bug by adding early short-circuit exit on valid Genius/Musixmatch song IDs and public web page scraping for empty API bodies.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Implemented short-circuit early exit in candidate search loop so valid song matches are returned immediately without being overwritten by subsequent passes.",
          "Added public Genius web page HTML scraper fallback for song IDs where RapidAPI returns an empty body payload.",
          "Strict final validation ensuring error states only trigger when every provider pass returns zero hits.",
        ],
      },
    ],
  },
  {
    version: "v2.5.3",
    date: "2026-07-23",
    title: "Musixmatch Primary Provider & Subtitles/RichSync Integration",
    badge: "PROVIDER UPGRADE",
    type: "patch",
    summary: "Integrated Musixmatch API (Matcher, Track Search & Subtitles/RichSync LRC format) as primary lyrics provider, backed by Genius API fallback.",
    categories: [
      {
        name: "New Features",
        items: [
          "Primary Musixmatch API integration with matcher.lyrics.get and track.search endpoints for global foreign script matching.",
          "ID-based time-synced LRC subtitle parsing (track.subtitle.get) enabling native karaoke auto-scrolling.",
          "Multi-provider fallback architecture querying Musixmatch first, then Genius candidate queries if needed.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Enhanced diagnostic logging specifying active provider hit (Musixmatch vs Genius).",
          "Graceful dual-provider fallback UI when both Musixmatch and Genius return zero hits.",
        ],
      },
    ],
  },
  {
    version: "v2.5.2",
    date: "2026-07-23",
    title: "Fuzzy Multi-Search & Mixed-Script Query Isolator",
    badge: "API UPGRADE",
    type: "patch",
    summary: "Integrated Genius multi-search fuzzy endpoint and candidate query isolation for Korean, Mandarin, and Japanese tracks with complex brackets.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Switched backend lyrics API to use Genius fuzzy multi-search lookup for high matching accuracy on foreign scripts.",
          "Implemented intelligent candidate query generator splitting mixed artist/title strings (e.g., '이희상 (LEEHEESANG) - 예일 (Love Shine)').",
          "Enhanced diagnostic logging printing raw input track, raw artist, and exact URL query strings for each search pass.",
        ],
      },
    ],
  },
  {
    version: "v2.5.1",
    date: "2026-07-23",
    title: "Multi-Pass Lyrics Search & Real-Time Karaoke Sync",
    badge: "FEATURE ENHANCEMENT",
    type: "patch",
    summary: "Upgraded backend lyrics lookup with 3-pass search strategy (retaining CJK scripts), time-synced auto-scroll highlighting, and graceful error fallback UI.",
    categories: [
      {
        name: "New Features",
        items: [
          "Intelligent 3-pass backend lyrics search algorithm stripping streaming noise while preserving Chinese, Japanese, and Korean text.",
          "Real-time synchronized karaoke line tracking with automatic centering scroll as music plays.",
          "Graceful fallback UI for missing lyrics with direct Retry and Genius search buttons.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Eliminated static template freezes when lyrics API searches return 0 hits.",
          "Added detailed multi-pass console logging for API diagnostic tracking.",
          "Full-screen centered overlay layout for Log Updates (Changelog) modal.",
        ],
      },
    ],
  },
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
