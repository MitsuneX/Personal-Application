# AI Website Context — Personal Application Command Center

> **Target Audience:** AI Coding Assistants (ChatGPT, Gemini, Claude, DeepSeek, GLM, Copilot, Cursor, etc.)  
> **Purpose:** Authoritative high-level architectural, functional, and operational context for inspecting, debugging, refactoring, or extending this application without breaking existing systems or aesthetics.

---

## 1. What This Website Is

* **Overview:** A high-performance, dual-themed personal command center and multi-entertainment tracking dashboard built for a single power user ("Nelvin") with multi-tenant guest account support.
* **Primary Purpose:** Centralizes media consumption tracking (Anime, Asian/Western Dramas, Movies, Tokusatsu), gaming library HUD, Hall of Fame celebrity/character registries, personal notepad, link bookmark directory, media gallery vault, music engine with synced lyrics, hobby XP gamification system, and customizable user profile state.
* **Target Users:** Primary owner (Nelvin) and authenticated guest users managing personal tracker profiles.
* **Core Concept:** Blends responsive data management with two distinct, curated visual aesthetic paradigms (**Neo-Brutalism** and **Cyberpunk**) that dynamically transform layout borders, typography, drop shadows, glow effects, audio engines, and micro-animations application-wide.

---

## 2. Main Features

| Feature Module | What the User Can Do | Triggered Action & Systems Involved |
| :--- | :--- | :--- |
| **Personal Profile Customizer** | Edit name, bio, tagline, location, social links, status tiers, custom borders, avatar, banner, and nameplate assets. | Updates Zustand store + triggers `/api/profile` Prisma update + logs profile asset history. (`app/profile/page.tsx`, `ProfileCard.tsx`) |
| **Games HUD & Library** | Track active games across PC, PSN, Xbox, Switch, Mobile; filter by category/rank; edit main characters/roles; upload 16:9 landscape screenshots. | Triggers `/api/action` (`UPDATE_GAME`, `DELETE_GAME`). Screenshot preview launches fullscreen `ImageLightboxModal.tsx`. (`app/games/page.tsx`) |
| **Anime Zone & Character Vault** | Track anime episodes watched/total, status (Watching, Completed, On Hold, etc.), star ratings, genres, and favorite characters list with double-tap like counters. | Direct Zustand state mutation + Prisma sync via `/api/action` (`UPDATE_ANIME`, `TOGGLE_CHARACTER_FAVORITE`). (`app/anime/page.tsx`) |
| **Drama Hub & Regional Logs** | Manage Asian & Western dramas categorized by region (Japanese 🇯🇵, Korean 🇰🇷, Chinese 🇨🇳, Indonesian 🇮🇩, Hollywood 🎬) and log watch progress. | Routes to `/drama/[country]` pages; syncs with global media stats and top show widgets on Dashboard (`MediaLogCard.tsx`). |
| **Hall of Fame (HOF) Registry** | Rank actors, actresses, anime figures, singers, and tokusatsu legends into tiers (GOAT Status, All-Star, Rising, Classic); double-tap cards to increment likes. View live analytics: achievements, championship timeline, charts, and activity feed — all 100% derived from live data. | Triggers `/api/action` (`UPDATE_HOF`, `LIKE_HOF`). Analytics computed by `lib/utils/hofEngine.ts` engine. All sections auto-update on any CRUD action. Leaderboard portrait images use taller responsive containers (`h-48 sm:h-52 md:h-56` + `object-[center_15%]`). (`HofEntryCard.tsx`, `HofEditorModal.tsx`, `components/hof/*`) |
| **Music Vault & Global Engine** | Stream online YouTube tracks, upload/play audio streams, build custom playlists, cycle shuffle/loop modes, save offline tracks, and view synced lyrics. | Persistent audio player (`GlobalMusicPlayer.tsx`, `TopbarMiniPlayer.tsx`) + `LyricsModal.tsx` + YouTube PostMessage API integration. (`app/music/page.tsx`) |
| **Notepad & Curiosity Workspace** | Draft notes, store technical memos, tag curiosity ideas, and link entries to hobby skills for automatic XP logging. | Mutates Zustand `notes` state + `/api/action` (`UPDATE_NOTE`). Calculates and awards XP via `logHobbyXP`. (`app/notepad/page.tsx`) |
| **Hobby XP & Gamification** | Create hobby skills, log practice hours/XP, track levels, view leveling progress bars, and analyze activity heatmaps. | Calculates level progression (`XP = level * 100`) + updates `hobbySkills` and `hobbyLogs` in database. (`app/hobbies/page.tsx`) |
| **Media Vault Gallery** | Upload images, crop assets via `react-easy-crop`, organize virtual folders/categories, add tags, and view images in interactive zoomable lightboxes. | File upload via `/api/upload` (disk/Supabase storage) + folder tree navigation component (`FolderTreeNavigation`). (`app/gallery/page.tsx`) |
| **Bookmark Directory** | Organize web links by category (Watch, Entertainment, Book, Productivity, Misc, Custom), search bookmarks, and launch external URLs. | Stores bookmark entries + triggers `/api/action` (`UPDATE_LINK`, `DELETE_LINK`). (`app/links/page.tsx`) |
| **Global Command Palette & Search** | Press `Ctrl + K` or click topbar search to execute fuzzy search across Games, Anime, Dramas, Hall of Fame, Memos, and Bookmarks. | Launches `CommandPalette.tsx` overlay modal with direct route navigation on item selection. |
| **Theme & Aesthetic Switcher** | Toggle between **Neo-Brutalism** (hard black borders, offset shadows, warm palette) and **Cyberpunk** (cyan neon glow, backdrop blur, Orbitron font). | Updates `ThemeContext.tsx`, sets `dashboard-theme` in `localStorage`, and updates dynamic root CSS variables. |

---

## 3. User Journey

```
User Accesses App (/login or /)
       │
       ├──► Unauthenticated ──► Supabase Auth Login (/login) ──► Authenticated Session
       │
       ▼
Dashboard Homepage (/)
  ├── Top Navigation Bar (Header) ──► Command Palette (Ctrl+K), Theme Switcher, Topbar Mini Player, Profile Menu
  ├── Persistent Left Sidebar ─────► Quick Navigation to Feature Modules & Collapse Toggle (240px ◄► 78px)
  ├── Main Grid Content
  │     ├── Profile Summary & Status Card
  │     ├── Live Currently Playing Music Player Widget
  │     ├── Gamified Stats & Hobby XP Bar
  │     ├── Media & Drama Log Widget (Top Shows, Now Streaming, HOF Stars)
  │     ├── Quick Actions & Active Games Preview
  │     └── Recent Memos & Link Bookmarks
  │
  ▼
Navigates to Specific Feature Page (e.g. /games, /anime, /hall-of-fame, /music, /gallery, /notepad)
  ├── Performs Action (Add/Edit Entry, Change Status, Increment Episode, Play Music, Upload Asset)
  ├── UI Instantly Updates (Zustand Optimistic Update)
  └── Backend Persists Changes (/api/action or /api/profile via Prisma ORM)
```

---

## 4. Page and Navigation Flow

```
/ (Dashboard Home)
├── /login (Supabase OAuth & Email Authentication)
├── /profile (Personal Profile Customizer & Account Session Manager)
├── /games (Games Library HUD & Screenshot Viewer)
├── /anime (Anime Tracker & Favorite Characters Vault)
├── /drama (Drama Hub Landing)
│   ├── /drama/japanese (Japanese Drama Collection 🇯🇵)
│   ├── /drama/korean (Korean Drama Collection 🇰🇷)
│   ├── /drama/chinese (Chinese Drama Collection 🇨🇳)
│   └── /drama/indonesia (Indonesian Drama Collection 🇮🇩)
├── /hall-of-fame (Celebrity, Character & Singer Hall of Fame Tiers)
├── /heroes (Tokusatsu & Hero Registry)
├── /tokusatsu (Tokusatsu Franchise Showcase)
├── /music (Music Player Console, Playlists & Synced Lyrics)
├── /notepad (Notepad Workspace & Curiosity Memos)
├── /hobbies (Hobby Skill XP Tracker & Gamified Leveling)
├── /links (Bookmark Directory & Resource Manager)
├── /gallery (Media Vault, Folder Navigation & Image Cropper)
├── /prompt-vault (AI Prompt Repository & Management)
└── /changelog (Application Version History & System Updates)
```

---

## 5. How the Website Works

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT FRONTEND                                 │
│  Next.js 16 (React 19, App Router, TailwindCSS v4, Framer Motion)              │
│                                                                                 │
│  ┌───────────────────────────────┐     ┌─────────────────────────────────────┐  │
│  │   UI Components & Pages      │ ◄──► │ Zustand Global Store                │  │
│  │   (AppShell, Header, Sidebar, │     │ (dashboardStore.ts)                 │  │
│  │    ThemeContext, Modals)      │     │ - Offline LocalStorage Cache        │  │
│  └───────────────────────────────┘     │ - Optimistic State Updates          │  │
│                                        └──────────────────┬──────────────────┘  │
└───────────────────────────────────────────────────────────┼─────────────────────┘
                                                            │ HTTP REST Requests
                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                SERVER BACKEND                                  │
│  Next.js Serverless Route Handlers (/api/*)                                    │
│                                                                                 │
│  ┌───────────────────────────────┐     ┌─────────────────────────────────────┐  │
│  │ Supabase Auth Middleware      │ ◄──► │ Prisma ORM (@prisma/client v7)      │  │
│  │ (@supabase/ssr)               │     │ Database Query Engine               │  │
│  └───────────────────────────────┘     └──────────────────┬──────────────────┘  │
└───────────────────────────────────────────────────────────┼─────────────────────┘
                                                            │ SQL Connection Pool
                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE & STORAGE                                │
│  PostgreSQL Database (Supabase / Postgres Connection) + Local File Storage       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

* **Frontend:** Built with Next.js 16 (App Router), React 19, TailwindCSS v4, and Framer Motion for desktop & touch-responsive micro-animations.
* **State Management:** Centralized in `dashboardStore.ts` using Zustand. Automatically fetches `/api/dashboard` on initial load (`fetchDashboard`), caches data in client memory, and provides fallback offline capability via `localStorage`.
* **Theme System:** Managed by `ThemeContext.tsx`. Dynamically switches CSS classes, root CSS variables (`--sidebar-width`), and theme configs (`theme-config.json`).
* **Backend API:** Built as Next.js serverless route handlers (`/api/dashboard`, `/api/action`, `/api/profile`, `/api/upload`, `/api/search`).
* **Database & Persistence:** Schema defined in `prisma/schema.prisma` using Prisma ORM connected to PostgreSQL. Supports user profile isolation while sharing data fallbacks.

---

## 6. Main Data Flow

```
User Action (e.g. Edits Game Rank / Updates Anime Episode / Uploads Image)
       │
       ▼
React Component Trigger
       │
       ▼
Zustand Store Action (e.g. updateGame, updateAnime, saveNote)
       │
       ├──► 1. Immediate UI Rerender (Optimistic Update)
       │
       ▼
Fetch API Handler Request (/api/action or /api/profile)
       │
       ▼
Server-Side Authorization & Prisma Database Query (Prisma Upsert / Update)
       │
       ▼
PostgreSQL Database Updated
       │
       ▼
API Response Returned ──► Store State Verified / Synced
```

---

## 7. Feature Relationships

```
┌─────────────────┐       links to       ┌──────────────────┐
│  Hall of Fame   │ ───────────────────► │  Drama / Anime   │
│  (Actors/Stars) │                      │  Listings        │
└────────┬────────┘                      └────────┬─────────┘
         │                                        │
         │ display top rank & streaming           │
         ▼                                        ▼
┌───────────────────────────────────────────────────────────┐
│                  Dashboard Summary Widget                  │
│                     (MediaLogCard.tsx)                    │
└───────────────────────────────────────────────────────────┘
                                ▲
                                │ logs XP automatically
┌─────────────────┐             │
│ Notepad Memos   │ ────────────┘
│ (Hobby Tagged)  │
└─────────────────┘
```

* **Hall of Fame ↔ Drama/Anime:** HOF cards link associated titles directly to their respective Drama (`/drama/[country]?id=...`) or Anime pages (`/anime?id=...`).
* **Notepad ↔ Hobby Tracker:** When a note linked to a `hobbyId` is saved or updated, `logHobbyXP` is automatically invoked, adding XP to the associated hobby skill and leveling up the user profile.
* **Dashboard Summary ↔ Live Stores:** `MediaLogCard.tsx` on the Dashboard directly subscribes to `dramas`, `dramaLog`, and `hallOfFame` Zustand store arrays. It dynamically computes Top Rated Shows, Currently Streaming, and HOF Rank #1 Stars without static mock fallbacks.

---

## 8. Important Business Logic

1. **User Isolation & Nelvin Main Profile Logic (`/api/dashboard`):**
   * If an authenticated user ID has an existing `Profile` record, that record is returned.
   * If a new user logs in whose email/name includes `"nelvin"`, the default system profile (`id: "profile"`) is duplicated into their user ID record.
   * Other new users receive a clean default profile structure (`name: "New User"`).
   * Unauthenticated visitors fallback to reading the primary showcase profile (`id: "profile"`).
2. **Hobby XP Level Progression:**
   * Level formula: `XP Required = Level * 100`. When accumulated XP reaches the threshold, `level` increments and leftover XP carries forward.
3. **Responsive Sidebar Layout Variable (`--sidebar-width`):**
   * Handled by `AppShell.tsx`. Dynamically computes and updates `--sidebar-width` on the document root (`240px` expanded desktop, `78px` collapsed desktop, `0px` mobile/tablet).
4. **Touch vs. Desktop Action Visibility:**
   * Interactive hover controls on cards (Edit `✏️`, Delete `🗑️`, Settings `⚙️`, Close `✕`) use `opacity-100 md:opacity-0 md:group-hover:opacity-100`. On touch/mobile devices (`< md`), buttons remain **permanently visible and accessible**. On desktop (`md:`), buttons display on hover.

---

## 9. Tech Stack

* **Core Framework:** Next.js 16.2 (React 19, App Router)
* **Language:** TypeScript 5
* **Styling & Design:** Vanilla CSS + TailwindCSS v4 + Custom Theme Design Tokens
* **Animations:** Framer Motion v12 + Lottie React
* **State Management:** Zustand v5 (with client hydration & LocalStorage persistence)
* **Database & ORM:** PostgreSQL + Prisma ORM v7 (`@prisma/client`, `@prisma/adapter-pg`)
* **Authentication:** Supabase SSR Auth (`@supabase/ssr`, `@supabase/supabase-js`)
* **Media & Utility Libraries:** `react-easy-crop` (Image Cropping), `recharts` (Analytics Charts), `lucide-react` (Iconography)

---

## 10. Important Project Structure

```
dashboard/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── page.tsx                # Main Dashboard Entry Page
│   ├── layout.tsx              # Root Layout, Metadata, PWA Manifest
│   ├── api/                    # Serverless API Endpoints (/api/dashboard, /api/action, /api/profile, etc.)
│   ├── games/page.tsx          # Games HUD Page
│   ├── anime/page.tsx          # Anime Zone Page
│   ├── drama/                  # Regional Drama Pages (japanese, korean, chinese, indonesia, hollywood)
│   ├── hall-of-fame/page.tsx   # Hall of Fame Tiers Page
│   ├── music/page.tsx          # Music Engine & Synced Lyrics Page
│   ├── notepad/page.tsx        # Notepad & Curiosity Workspace Page
│   ├── gallery/page.tsx        # Media Vault & Folder Tree Page
│   └── profile/page.tsx        # Personal Profile Customizer Page
├── components/                 # React UI Components
│   ├── layout/                 # Main App Shell, Header, Sidebar
│   │   ├── AppShell.tsx        # Responsive Layout Wrapper & --sidebar-width Calculation
│   │   ├── Header.tsx          # Top Bar, Search Trigger, Mini Player Container
│   │   └── Sidebar.tsx         # Left Navigation Bar (Collapsible 240px/78px & Mobile Drawer)
│   ├── cards/                  # Domain Data Cards (ProfileCard, HofEntryCard, MediaCard, GameDBCard)
│   └── ui/                     # Reusable UI Widgets (ImageLightboxModal, GlobalMusicPlayer, TopbarMiniPlayer, CommandPalette)
├── lib/                        # Core Application Libraries & Engine
│   ├── store/
│   │   └── dashboardStore.ts   # Central Zustand Application Store & Types
│   ├── theme/
│   │   └── ThemeContext.tsx    # Dual Theme Engine (Neo-Brutalism ◄► Cyberpunk)
│   ├── auth/
│   │   └── AuthProvider.tsx    # Supabase Client Auth Context Provider
│   └── prisma.ts               # Prisma Client Singleton Instance
├── prisma/
│   └── schema.prisma           # Complete PostgreSQL Database Schema Definitions
├── utils/
│   ├── cropImage.ts            # Canvas Image Crop Utility
│   └── supabase/               # Supabase SSR Browser, Server & Middleware Clients
└── theme-config.json           # Theme Palette Configuration Tokens
```

---

## 11. Critical Things AI Must Not Break

1. **Dual Theme Identity (Neo-Brutalism vs. Cyberpunk):**
   * **Why:** The entire visual appeal relies on strict adherence to theme styling. Neo-Brutalism requires hard black borders (`2.5px solid #000`), sharp offset shadows (`4px 4px 0 #000`), and high-contrast surfaces. Cyberpunk requires neon cyan (`#00F5FF`) / purple (`#BF5FFF`) glowing borders, backdrop blur (`backdrop-blur-md`), dark translucent backgrounds (`#0a0f1e`), and Orbitron typography.
   * **Rule:** Never hardcode single-theme colors. Always check `isCyber` or use theme-adaptive classes (`border-adaptive-unique`, `theme-text-primary`).
2. **`--sidebar-width` CSS Layout Variable:**
   * **Why:** Fullscreen modals (e.g. `ImageLightboxModal.tsx`) rely on `--sidebar-width` exported by `AppShell.tsx` to center viewports correctly over the active main content area across desktop expanded (`240px`), desktop collapsed (`78px`), and mobile drawer (`0px`) states.
   * **Rule:** Do not hardcode `width: 100vw` or fixed left positioning on full-screen modals.
3. **Zustand Optimistic Store Sync:**
   * **Why:** The UI updates instantaneously before API calls complete.
   * **Rule:** When modifying store handlers in `dashboardStore.ts`, preserve state mutation logic alongside `/api/action` async backend sync calls.
4. **Touch Device Button Accessibility:**
   * **Why:** Mobile and tablet users cannot hover.
   * **Rule:** Never use standalone `opacity-0 group-hover:opacity-100` on interactive card buttons. Always include touch-visible fallback classes (e.g. `opacity-100 md:opacity-0 md:group-hover:opacity-100`).

---

## 12. Known Limitations

* **YouTube Embedded Audio Constraints:** Web browser security policies prevent automatic audio playback without prior user interaction on initial page load.
* **Offline Storage Limits:** `localStorage` fallback caching in `dashboardStore.ts` is capped by browser storage limits (~5MB-10MB). Image assets should be hosted via URLs or server uploads rather than base64 strings in local storage.

---

## 13. AI Quick Understanding

### What is this website?
A dual-themed personal command center and multi-media tracking dashboard for managing games, anime, dramas, Hall of Fame entries, notepad memos, bookmarks, media gallery, music, and gamified hobby XP.

### How does it work?
Next.js 16 App Router renders client pages backed by a Zustand global store (`dashboardStore.ts`). Client mutations trigger serverless Next.js API routes (`/api/action`, `/api/profile`), which persist data to a PostgreSQL database via Prisma ORM v7 and Supabase Auth.

### What are its major systems?
1. **Zustand Application Store (`dashboardStore.ts`):** Single source of truth for app state, persistence, and optimistic updates.
2. **Dual Theme Engine (`ThemeContext.tsx`):** Seamlessly toggles between Neo-Brutalism and Cyberpunk visual designs.
3. **Layout & Viewport Shell (`AppShell.tsx`):** Manages responsive sidebar state, mobile drawers, global overlay providers, and exports the `--sidebar-width` layout variable.
4. **Universal Desktop-Grade Context Menu System (`ContextMenuProvider.tsx`, `ContextMenu.tsx`):** Global overlay-portal right-click context menu engine supporting keyboard navigation, auto-flipping, and mobile bottom sheet conversion.
5. **Prisma & Supabase Backend (`/api/*`, `prisma/schema.prisma`):** Serverless persistence layer handling data queries and file uploads.

### How does the main data flow?
`User Interaction` ──► `Zustand Store Mutation (Optimistic UI Update)` ──► `HTTP POST to /api/action` ──► `Prisma ORM` ──► `PostgreSQL Database`.

### What should an AI understand before modifying it?
* Respect both **Neo-Brutalism** and **Cyberpunk** styling rules in every UI edit.
* Preserve touch-friendly action button visibility (`opacity-100 md:opacity-0 md:group-hover:opacity-100`).
* Use `--sidebar-width` for layout offsets instead of hardcoded pixel assumptions or raw `100vw`.
* Do not remove features or replace the existing design system when making responsive adjustments.

---

## 14. Changelog

### 2026-08-04 — Persistence Fix + HOF Analytics Refactor

**Persistence Bug Fix**
- Fixed `userId` missing from Prisma `create`/`update` in 17+ action handlers in `app/api/action/route.ts`.
- Fixed `userId` not linked to `user.id` in `app/api/profile/route.ts` profile upsert.
- Replaced stale-hydration length-check fallbacks in `lib/store/dashboardStore.ts` with direct DB authority (`data.x || []`).
- Backfill script `dashboard/scripts/backfill_null_userid.ts` assigned 10 orphan rows (NULL userId) to the active user.

**HOF Leaderboard Portrait Crop Fix**
- `components/hof/HofLiveLeaderboard.tsx`: Replaced `h-36` with `h-48 sm:h-52 md:h-56` for taller portrait-friendly card images.
- Added `object-[center_15%]` to bias image crop toward top of portrait (face/forehead visibility).

**Hall of Fame Live Analytics Engine Refactor**
- `lib/utils/hofEngine.ts`: Completely rewrote all four analytics functions — zero hardcoded data remaining.
  - `getChampionshipTimeline()`: Dynamically generates season timeline from live `hallList` sorted by likes. Season labels use `currentYear - i` relative to real system date.
  - `computeHallRecords()`: Computes 16+ trophy records (Highest Voted, Most Works, GOAT Count, Biggest Climber, Vote Gap, Most Decorated, per-category holders, etc.) all from live data.
  - `computeHallAnalytics()`: Derives `votesBySeason` via 5-year decay curve anchored to real `totalLikes`; derives `monthlyGrowth` via 6-month weighted distribution — no static numbers.
  - `generateActivityFeed()`: Generates 10 event types (champion, GOAT, podium surge, rank climb, drop, favorite, works milestone, 50+ votes, hall size) from live list state. Timestamps use rank-distance relative labels.
- `components/hof/HofRecordsSection.tsx`: Record count in subtitle now reads `{records.length}` dynamically.
- `components/hof/HofTimelineSection.tsx`: Year range header and "current champion" highlight now derived from timeline data — `item.year === timeline[0]?.year` instead of hardcoded `=== 2026`.

### 2026-08-04 — Hall of Fame Phase 2: True Historical Archive & Event Engine

**Prisma Schema Additions (`prisma/schema.prisma`)**
- Created `model HallEvent` storing immutable audit events (`ADD_CHARACTER`, `DELETE_CHARACTER`, `UPDATE_CHARACTER`, `RANK_CHANGED`, `CHAMPION_CHANGED`, `LIKES_CHANGED`, `PRESTIGE_CHANGED`, `FAVORITE_CHANGED`, etc.).
- Created `model ChampionshipHistory` storing title reigns (`startDate`, `endDate`, `durationDays`, `highestVotes`, `timesDefended`, `championshipNumber`, `reasonEnded`).
- Created `model HallRankingSnapshot` storing point-in-time rank/vote/prestige state.

**Action Router Event Engine (`app/api/action/route.ts` & `lib/utils/hofEventEngine.ts`)**
- `UPDATE_HOF`, `LIKE_HOF`, `RANK_HOF`, and `DELETE_HOF` now emit `HallEvent` records to PostgreSQL on every mutation.
- Automatic champion dethrone/crown transition: when Rank #1 shifts, concludes previous reign (`endDate = now()`, computes `durationDays`) and initializes new reign (`endDate = null`).
- Captures `HallRankingSnapshot`s on every rank/vote shift.
- Idempotent auto-seed (`ensureInitialHallHistory`) populates baseline event/reign/snapshot history on dashboard load if missing.

**Unified Analytics Engine (`lib/utils/hofEngine.ts` & `app/hall-of-fame/page.tsx`)**
- `getChampionshipTimeline()`, `generateActivityFeed()`, and `computeHallRecords()` now prioritize real database history records (`championshipHistory`, `hallEvents`, `snapshots`) over synthetic estimations.

