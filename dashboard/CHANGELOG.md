# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

## [4.9.0] - 2026-08-01

### 🛠️ Global Dropdown & Modal Stacking Context Audit & Fix

**Z-Index Stacking Hierarchy Architecture**
- **Layering Hierarchy Alignment**: Raised `Z_INDEX.DROPDOWN` from `1000` to `1500`, `POPOVER` to `1600`, and `CONTEXT_MENU` to `1700` in `ViewportBoundary.ts`, ensuring portaled dropdowns, custom select menus, and context menus cleanly float **ABOVE** `Z_INDEX.MODAL` (`1300`).
- **Modal Dropdown Pointer Interaction**: Resolved interaction blockage where `<CustomSelect>` and `<FilterDropdown>` options panels inside modals (`HofEditorModal`, `DossierCharacterEditorModal`, `GameEditorModal`, `AiToolEditorModal`, `ProfileEditorModal`, etc.) were rendered underneath the modal card and backdrop.
- **Context Menu Stacking**: Standardized `ContextMenu.tsx` to use `Z_INDEX.CONTEXT_MENU` (`1700`) and backdrop at `1699`, preventing hidden context menus during active modal sessions.
- **Keyboard Navigation & Diagnostics**: Added `Enter`, `Space`, and `ArrowDown` keyboard trigger listeners for `<CustomSelect>` with development diagnostic logs.

## [4.8.0] - 2026-08-01

### 🚀 Phase 2 — Universal Character Database Expansion (Production)

**Extensible Playable Rosters Across 20+ Games**
- **Comprehensive Roster Population**: Added authentic playable character rosters and metadata across all 20+ supported games (*Honkai: Star Rail, Genshin Impact, Honkai Impact 3rd, ZZZ, Wuthering Waves, Arknights, Endfield, GFL2, Tower of Fantasy, NIKKE, PGR, Reverse: 1999, FGO, Umamusume, LoL, Valorant, MLBB, DB Legends, Outerplane, Stella Sora, and PUBG Equipment*).
- **Expanded Metadata Inspection**: Preview modal now displays Voice Actor, Illustrator, Birthday, Height, Affiliation, Region, Constellation, Profession, and Lore Tags with automatic graceful hiding when metadata is omitted.

**Editable External Navigation System**
- **`EditableLinkItem` Engine**: Supports default URLs, user custom URL overrides (`customUrl`), link disable toggling (`isDisabled`), and timestamping without mutating original defaults.
- **URL Validation Engine**: Validates `http://` or `https://` protocol compliance, rejecting malformed links with user-friendly feedback.
- **Dedicated Link Button Context Menu**: Right-click, long-press, or Shift+F10 on any navigation button opens a dedicated context menu (`Open`, `Open in New Tab`, `Copy URL`, `Edit URL`, `Reset to Default`, `Disable/Enable Link`).

## [4.7.0] - 2026-08-01

### 👑 Universal Character Database System (Production Architecture)

**Core Architecture & Extensible Schema**
- **Universal Character Model**: Extended `DossierCharacterEntry` schema with `aliases`, `splashArt`, `rarity`, `weapon`, `classType`, `faction`, `nation`, `race`, `releaseVersion`, `description`, `tags`, `stats`, `links`, and `entityType`.
- **Universal Link System**: Implemented automated external link generators mapping Wiki (Fandom, LoL Wiki, Prydwen), Build (Prydwen, KeqingMains, U.GG, MLBB Ninja), Official (HoYoLab, Riot), and Guide (Tracker.gg, YouTube) links.
- **Universal Entity Mode**: Non-hero games (such as PUBG) automatically switch `entityType` to `"equipment"`, adapting UI headers ("Tactical Arsenal & Equipment Breakdown"), entity labels ("Equipment / Item"), and ammo caliber filters.

**UI Components & Hook Ordering Fix**
- **`CharacterPreviewModal`**: Built a rich preview overlay with high-res portrait/splash art, ambient glowing element aura, detailed attribute matrix, winrate/matches stats, and external link buttons.
- **Universal Search Engine**: Extended search to match character name, aliases, tags, faction, nation, weapon, release version, and search keywords.
- **React Hook Order Fix**: Resolved hook count mismatch error (`35 vs 36 hooks`) in `GameDossierPage` by moving all `useMemo` hooks above early return guards.

## [4.6.0] - 2026-08-01

### 🎯 Interactive Category Filtering for Game Database (Production Architecture)

**Configuration-Driven Architecture**
- **Dynamic Game Adapters**: Built `InteractiveCategoryFilter.tsx` that reads game configurations from `gameDossierConfig.ts` to automatically render game-specific primary categories (Elements / Resonance Attributes / Battle Attributes / Colors) and secondary categories (Paths / Operator Classes / Lanes / Weapon Types).
- **Dual Combined Filtering**: Implemented memoized `AND` filtering logic (`character.element === selectedElement AND character.category === selectedCategory`) with instant toggle & reset capabilities.

**Components & User Experience**
- **`DossierCharacterCard`**: Designed a unified character card with portrait rendering, element badges, path badges, level rank, winrate %, favorite starring (⭐), and context menu support.
- **Framer Motion Layout Animations**: Smooth character roster transitions with `<AnimatePresence>` during filtering, adding, or deleting characters.
- **Polished Empty State**: Added interactive empty state cards with 1-click filter reset when zero characters match current filter combinations.

## [4.5.0] - 2026-08-01

### 🖥️ Universal Desktop-Class Navigation Context Menu Expansion

**Multi-Layered Priority System**
- **Layer 1 (Object-Specific Menus)**: Preserved 100% of existing object context menus (Game Cards, Character Dossiers, Anime, Dramas, Music, Gallery Items, Notes, Bookmarks, Prompt Vault).
- **Layer 2 (Global Navigation Fallback)**: Automatically activates when right-clicking layout whitespace, container background, page background, or empty grid areas.

**System Capabilities**
- **Search Integration**: Added `🔍 Search Everything...` top item mapped to global Command Palette (`⌘K`).
- **Dynamic Navigation Filtering**: Automatically suppresses the current active page route from the Navigation section.
- **Quick Action Triggers**: Instant shortcut items for `Add Game`, `Add Anime`, `Add Drama`, `New Note`, and `Upload Image`.
- **Editable Protection**: Automatically preserves native browser context menus on `input`, `textarea`, `select`, `[contenteditable="true"]`, and code editors.
- **Theme & Keyboard Parity**: Full Arrow key navigation, Enter execution, ESC dismissal, section header dividers, and dual Cyberpunk / Neo-Brutalism visual styling.

## [4.4.0] - 2026-08-01

### 🖱️ Universal Context Menu System (Desktop-Grade Right-Click Engine)

**Core System Architecture**
- **`ContextMenuProvider` & `ContextMenu`**: Built a global overlay-portal context menu engine (`components/ui/ContextMenuProvider.tsx`, `components/ui/ContextMenu.tsx`).
- **Context-Aware Menu Builders**: Created `lib/context-menu/builders.ts` with helper generators (`buildGameCardMenu`, `buildMediaCardMenu`, `buildGalleryMenu`, `buildBookmarkMenu`).
- **Viewport Safe Boundaries**: Menu dynamically shifts and clamps inside safe viewport bounds, supporting auto-flip and collision avoidance.
- **Full Mobile Support**: Automatically converts into a sleek bottom sheet on mobile screens (`< 640px`) with touch backdrop and smooth spring physics.
- **Keyboard Navigation**: Full support for ArrowUp / ArrowDown navigation, Enter selection, and Escape dismissal.

**Module Integration Across Workspace**
- **Games Vault (`/games`)**: Integrated context menu on game cards (Open Game, Edit Config, Copy UID, Manage Roster, Delete).
- **Game Database Hub (`/heroes`)**: Integrated right-click dossier context menu on game dossiers.
- **Anime & Drama Vaults (`/anime`, `/drama/*`)**: Added right-click context menus to `MediaCard` instances (+1 Episode progress, Status cycle, Delete).
- **Media Gallery (`/gallery`)**: Migrated gallery items from local context menu state to global context menu system (Open Lightbox, Delete Image).
- **Bookmarks & Quick Links (`/links`)**: Integrated right-click context menu (Visit Link, Copy URL, Edit Bookmark, Delete).
- **Hall of Fame (`/hall-of-fame`)**: Added context menu to `HofEntryCard` (Heart Entry, Edit Details, Remove Entry).
- **Notepad & Notes (`/notepad`)**: Added context menu to note list items (Open Note, Copy Text, Delete Note).
- **Prompt Vault (`/prompt-vault`)**: Added context menu to AI prompt cards (Copy Prompt Text, Edit Prompt, Delete).
- **Dashboard Workspace (`/`)**: Added background right-click quick navigation menu to switch pages and toggle themes.

**UID Dual-Action Interaction Refactor**
- Refactored `GameUidBadge`: Clicking UIDs with profile links opens a dual-action trigger (Explore Link or Copy UID); UIDs without profile links offer instant 1-click copy with feedbackToast.

## [4.3.0] - 2026-08-01

### 👤 Profile Popout System — Production Rebuild (Root Cause Fix)

**Trigger System**
- **Click-only trigger**: Replaced hover-based `ProfileHoverPopover` with click-to-open/click-outside-to-close behavior for both Sidebar and Header. No more accidental popout openings.
- **Floating UI integration**: Replaced broken custom `CollisionDetector.ts` with `@floating-ui/react` — eliminates scroll-offset vs fixed-positioning coordinate system mismatch. Provides automatic viewport collision, flipping, shifting, and scroll tracking.
- **New `ProfilePopoutTrigger.tsx`**: Dedicated click-only trigger component using `@floating-ui/react` `useClick`, `useDismiss`, and `autoUpdate`.
- **ESC to close**: Full keyboard dismissal via Floating UI's `useDismiss` hook.

**Card Architecture**
- **Internal scroll zone**: `ProfilePopoutCard.tsx` rebuilt with sticky Banner+Avatar header (never scrolls away) and `overflow-y-auto overscroll-contain` body — the page no longer scrolls when the popout is open.
- **`max-h-[calc(100vh-32px)]`**: Popout is fully constrained inside the visible viewport.

**Banner Rendering**
- **Smart `isAnimatedMedia()` helper**: GIF, animated WebP, and AVIF use native `<img>` (preserves animation frames). Static JPG/PNG use Next.js `<Image>` (keeps optimization + lazy loading).

**Banner Corruption Fix (Root Cause)**
- **`useEffect` sync fix**: `AestheticsModal.tsx` now syncs local form state only when the modal *opens* (`isOpen: false → true`), not on every store change — prevents server response from overwriting locally-cleared fields.
- **Null semantics**: Cleared fields now send `null` (not `undefined`/`""`) through the entire chain — `AestheticsModal → updateAesthetics → /api/action → Prisma`. `null` explicitly clears the DB column.
- **API fix**: `SAVE_AESTHETIC` handler in `action/route.ts` now accepts `null` to set DB columns to `NULL`.
- **Store fix**: `updateAesthetics` in `dashboardStore.ts` handles `null` correctly in both optimistic update and server response sync (null DB values map to `undefined` in `ProfileData`).

**Single Source of Truth**
- `ProfilePopoutCard` reads exclusively from `useDashboardStore(s => s.profile)` — no local profile copy.
- Live statistics (Games, Anime, Drama, Favorites, Profile Completion %) computed from live Zustand store — zero hardcoded mock counts.

**Cache Audit**
- Confirmed: No Zustand `persist` middleware on profile fields. Store is pure in-memory.
- Confirmed: Dashboard API always serves the DB `profile` row. `user_metadata` is only used as a creation fallback for new users.

## [4.2.0] - 2026-08-01

### 👤 Profile Popout System Architectural Rebuild (`ProfilePopoutCard.tsx`)
- **Single Source of Truth (`ProfilePopoutCard.tsx`)**: Unified all profile popovers across Sidebar, Header, Friend cards, Mentions, and Chat into a single data-driven component.
- **Unoptimized Animated Banner GIF Support**: Configured native unoptimized media rendering for banner URLs so animated `.gif` banners loop smoothly without freezing.
- **Live Store Synchronization**: Connected avatar, banner, display name, tagline, bio, location, MBTI, Zodiac, contact info, skills, and socials directly to live `useDashboardStore().profile`.
- **Mini Personal Dashboard Statistics**: Integrated live derived stat cards for Games count, Anime count, Drama count, Favorites count, and Profile Completion %.
- **Dual-Theme Parity**: Complete visual parity for both **Neo-Brutalism** (thick 3px black borders, offset shadow, high contrast) and **Cyberpunk** (neon cyan/purple glow, dark glassmorphism `rgba(5,8,22,0.98)`, Orbitron font headings).

## [4.1.0] - 2026-08-01

### ⚙️ Punishing: Gray Raven (PGR) Integration — Game HUD & Dedicated Database
- **Full PGR Integration**: Added Punishing: Gray Raven (PGR) game card, logo (`/game-icons/pgr.svg`), artwork banner, personal progress, and quick actions to Games HUD and Game Database (`/heroes` & `/games/pgr`).
- **Character Classifications & Roles**: Configured Omniframe, Uniframe, Transcendant, Attacker, Tank, Support, and Amplifier frame classifications in `lib/data/gameDossierConfig.ts`.
- **Element Attribute System**: Visual tokens for Physical (Silver `#E2E8F0`), Fire (Red `#EF4444`), Ice (Cyan `#06B6D4`), Lightning (Yellow `#FACC15`), and Dark (Purple `#A855F7`) elements.
- **Roster & Data Persistence**: Added initial PGR roster (`Lucia: Crimson Weave`, `Selena: Capriccio`, `Bianca: Stigmata`, `Alpha: Crimson Abyss`, `Vera: Garnet`, `Liv: Empyrea`) for account `nelvin.claudius06@gmail.com` and database seed script.
- **Global Search Indexing**: Updated `Header.tsx` and `CommandPalette.tsx` to search PGR, elements, roles, and frame classifications.
- **Web Log Updates Sync**: Synchronized release notes with `lib/data/changelog.ts` for the web Settings Log Updates modal.

## [4.0.0] - 2026-08-01

### 🎬 Flagship Upgrade — Premium Personal Cinematic Dossier (`/drama/[id]`)
- **Dedicated Route & Navigation**: Replaced popups with full-page dedicated route `/drama/[id]` featuring breadcrumb navigation (`Dashboard > Drama > Title (Year)`), shared element poster transitions, and full browser history support.
- **Cinematic Hero Banner (`DossierHero.tsx`)**: High-res backdrop with progressive blur gradient fade, poster, title, original title, release year, country, studio, runtime, status badges, favorite button, and parallax scroll effect.
- **Dynamic Cultural & Genre Theme Accents (`DossierThemeAccent.tsx`)**: Contextual color palettes & ambient particles for *Korean Romance* (soft pink), *Korean Thriller* (crimson rain), *Korean Historical* (imperial gold), *Chinese Xianxia* (jade clouds), *Chinese Wuxia* (ink bamboo), *Japanese Anime* (sakura purple), *Hollywood* (silver sci-fi), *Fantasy* (magical glow), and *Horror* (dark fog) while strictly preserving **Neo-Brutalism** & **Cyberpunk** global themes.
- **Animated Quick Stats (`DossierStatsBar.tsx`)**: Statistic cards with animated count-up numbers (Watched, Total, Completion %, Days Taken, Personal Score, Rewatch Count).
- **Official Synopsis (`DossierSynopsis.tsx`)**: Expandable plot synopsis with smooth height transition.
- **My Personal Watch Journey (`DossierMyJourney.tsx`)**: Personal tracking for watch dates, favorite episode/character, emotional episode, mood, personal score, would-rewatch flag, and inline journey editor modal.
- **Character Spotlight & Cast (`DossierCharacterSpotlight.tsx`)**: Character grid cards with portraits, roles, favorite badges, and character drawer popover modal.
- **Episode Navigator & Analytics (`DossierEpisodeNavigator.tsx`)**: Interactive episode grid (`✓ Completed`, `▶ Current`) and Recharts watching analytics (episodes/day, longest session, completion %, time remaining).
- **Multi-Category Rating Breakdown (`DossierRatingRadar.tsx`)**: 9-category rating breakdown (Story, Characters, Ending, OST, Romance, Comedy, Action, Visuals, Rewatch Value) with Recharts Radar Chart and star bars.
- **Memory Gallery (`DossierMemoryGallery.tsx`)**: Screenshot attachments with captions, episode tags, character tags, and Lightbox previewer.
- **Emotional Journey Timeline (`DossierEmotionalTimeline.tsx`)**: Interactive milestone timeline with emoji reactions (`😊 Ep 1`, `😲 Ep 5`, `😭 Ep 10`, `🔥 Ep 16`, `❤️ Finale`), notes, and date tags.
- **Markdown Review Editor (`DossierReviewEditor.tsx`)**: Rich Markdown personal review editor with spoiler toggle support.
- **External Resources & Soundtracks (`DossierExternalLinks.tsx`)**: OST tracks list, awards honors, and external links buttons (IMDb, MyDramaList, Wikipedia, Netflix, Disney+, YouTube Trailer).

## [3.9.0] - 2026-07-31

### 🚀 Application-Wide Floating UI Overlay System & Viewport Collision Engine
- **Global Positioning Engine (`ViewportBoundary.ts`, `CollisionDetector.ts`, `FloatingPosition.ts`)**: Built a shared mathematical positioning solver for trigger-attached popovers, dropdowns, tooltips, and context menus with real-time edge collision detection and automatic direction flipping (`bottom` <-> `top`, `left` <-> `right`).
- **React Portal Root (`OverlayPortal.tsx`)**: All floating UI elements, modals, dropdowns, and overlays now render directly into `document.body` / `#overlay-root`, completely eliminating clipping caused by parent `overflow: hidden`, `overflow: auto`, or `transform` stacking contexts.
- **Centralized Z-Index Hierarchy**: Standardized arbitrary `z-index` values into centralized constants (`Z_INDEX.BASE`, `Z_INDEX.SIDEBAR`, `Z_INDEX.HEADER`, `Z_INDEX.DROPDOWN`, `Z_INDEX.POPOVER`, `Z_INDEX.DRAWER`, `Z_INDEX.MODAL`, `Z_INDEX.TOAST`, `Z_INDEX.TOOLTIP`).
- **Global Overlay Stack Manager (`OverlayProvider.tsx`)**: Created top-level overlay manager for managing open modal state, focus trapping, ESC key listener stack, and backdrop blur transitions.
- **Component Migration**: Migrated `Modal.tsx`, `FilterDropdown.tsx`, `CustomSelect.tsx`, `ContextMenu.tsx`, `SettingsDropdown.tsx`, `CommandPalette.tsx`, `ProfileHoverPopover.tsx`, `HobbyHoverPopup.tsx`, `BulkActionBar.tsx`, `TopbarMiniPlayer.tsx`, and `GlobalConfirmModal.tsx` to the global positioning engine.
- **Mobile Adaptive Layouts**: Modals, dropdowns, and context menus automatically adapt into touch-friendly bottom sheets / action sheets on mobile viewports (`<640px`).

## [3.8.0] - 2026-07-31

### 🖼️ Gallery Premium Upgrade — Masonry / Grid / Timeline Views
- **Three View Modes**: Added toggle between **Masonry** (Pinterest-style variable height), **Grid** (fixed aspect-video), and **Timeline** (grouped by date) layouts via an icon toggle bar in the toolbar.
- **Masonry Layout**: Uses CSS `columnCount` for true Pinterest-style variable height image tiling with `break-inside-avoid` and smooth staggered `framer-motion` enter animations.
- **Timeline View**: Groups images chronologically into date-labeled sections with thin separator lines and compact 4-column thumbnail grids.
- **Right-click Context Menu**: Added `ContextMenu` integration — right-clicking any image card reveals "Open Full Preview" and "Delete Image" actions with theme-adaptive styling.
- **Lazy Loading**: All image renders now use `loading="lazy"` for performance.
- **Hover Overlays**: Each masonry card shows gradient title/tag overlays on hover with smooth opacity transitions.

### 🔗 Links Page — Premium Bookmark Cards
- **Favicon Integration**: Each bookmark card auto-fetches the site favicon via Google's favicon service (`s2/favicons?domain=...`) displayed in a styled pill avatar.
- **Card Redesign**: Replaced flat `BentoCard` wrappers with standalone `motion.div` cards featuring `whileHover` lift animation, thick `boxShadow`, category badge, and external link indicator arrow.
- **Section Headers**: Added item count badges and horizontal divider lines to each category section header.
- **Animated Entries**: Cards now stagger-animate on load with `initial={{ opacity: 0, y: 12 }}`.
- **Action Button Polish**: Edit/delete buttons redesigned as themed icon-only square buttons with colored backgrounds and border styles.

### ⚡ Prompt Vault — Search & Expand/Collapse
- **Full-Text Search Bar**: Added a dedicated search input that filters prompts by title, prompt body text, and target AI — with a clear (✕) button.
- **Expand/Collapse Toggle**: Long prompts (>200 chars) now show a "▼ Expand / ▲ Collapse" toggle to reveal full text without cluttering the grid.
- **Character Count Badge**: Each prompt card displays a subtle character count (e.g. `1234c`) in the top-right corner of the text box.
- **Combined Filter**: Search and Target AI filter work together for precise lookups.

### 🧩 New Global Components
- **`ContextMenu.tsx`**: Universal right-click popover with theme-adaptive styles, `framer-motion` entrance animation, keyboard `Escape` dismiss, and click-outside handling.
- **`BulkActionBar.tsx`**: Multi-select batch action bar with count badge, bulk action buttons, and animated slide-in from bottom.

### 🧠 Dashboard Widgets
- **`FocusWidget.tsx`**: New 3-panel dashboard widget showing Today's Focus checklist (tick to complete), quick stat metrics, and Most-Launched AI tool shortcut.
- **`GameDBCard`**: Capped at 7 entries with "View All Games →" navigation link.
- **`Games Page Toolbar`**: Removed redundant `All Game Registries` category filter dropdown in favor of category tabs.
- **`AnimeZoneCard`**: Capped at 7 prioritized entries with "View Anime Zone →" navigation link.
- **`MediaLogCard`**: Displays drama watch statuses in priority order with "Drama Hub →" navigation link.

### 🔧 React State Synchronization & Build Audit
- **Render-Phase Side Effect Elimination (`AuthProvider.tsx`)**: Refactored `onAuthStateChange` to perform pure state setters only (`setUser(newUser)`). Store reset and hydration side effects (`resetUserStore()`, `fetchDashboard()`) now execute strictly inside a dedicated `useEffect([user, isLoading])` with `previousUserIdRef` tracking, completely eliminating `Cannot update a component (AuthGateInner) while rendering a different component (AuthProvider)` warnings.
- **Decoupled Realtime Notifications (`useRealtimeSync.ts`)**: Separated `useDashboardStore.setState` producers from `ToastProvider` dispatches so notifications trigger cleanly after state update resolution.
- **Idempotent Dashboard Hydration (`dashboardStore.ts`)**: Added `if (get().isLoading) return;` guard to `fetchDashboard()` to prevent duplicate concurrent network requests during auth state changes.
- All TypeScript errors resolved (0 errors on `npx tsc --noEmit`).
- Fixed `AiToolItemEntry.launchUrl` reference (was incorrectly using `.url`).
- Fixed `launchCount` optional number sort with `?? 0` nullish coalescing.
- Added missing `next/link` import to `GameDBCard.tsx`.
- Fixed IIFE ternary JSX nesting issue in gallery page that caused extra `</div>` errors.

## [3.7.0] - 2026-07-31

### 🎮 Game Database Restoration & New Game Dossiers
- **Restored & Seeded Games**: Restored `Girls' Frontline 2: Exilium` and added `Stella Sora`, `Reverse: 1999`, and `Umamusume: Pretty Derby` to PostgreSQL database with complete data persistence.
- **Game-Specific Dossier Structures**: Defined custom gameplay classifications in `lib/data/gameDossierConfig.ts` (GFL2 Tactical Dolls & Elements, Stella Sora Star Positions & Astral Elements, Reverse: 1999 Combat Roles & Afflatus, Umamusume Running Styles & Distance Aptitudes).
- **Custom Local Game SVG Icons**: Created vector SVG icons (`stellasora.svg`, `r1999.svg`, `umamusume.svg`) in `/public/game-icons/` and registered canonical names/aliases in `lib/data/gameIcons.ts`.

### 🎛️ Dual-Themed Reusable FilterDropdown Component
- **Filter Popover Engine (`components/ui/FilterDropdown.tsx`)**: Developed a shared reusable popover component supporting option groups, checkmarks, viewport bottom collision detection (auto-flipping upwards), click-outside and Escape key handlers.
- **Dual-Theme Aesthetic Parity**: Styled for both Cyberpunk (glowing neon borders, dark glassmorphic backdrop) and Neo-Brutalism (thick 2.5px/3px black borders, high-contrast badges, offset drop shadows).
- **Global Page Integration**: Replaced flat inline selectors with `FilterDropdown` across AI Library, Games Library, Game Database, Drama Hub, Characters Directory, and Prompt Vault.

### 🗑️ Global Card-Level Delete Action & Confirmation System
- **Unified Deletion Flow**: Added card-level Delete buttons (`🗑️`) across all manageable cards (`AI Library`, `Visits / Projects`, `Games Library`, `Dossier Characters`, `Resource Links`, `Showcase Items`, `Drama`, `Characters`, `Prompt Vault`).
- **Global Confirmation Dialog**: Integrated with `GlobalConfirmModal` & `useConfirm()` hook to display preview cards, require explicit confirmation, stop event propagation, and persist deletions to PostgreSQL.

## [3.6.0] - 2026-07-31

### ⚡ Account Switching & Session Synchronization (Zero Hard Refresh)
- **Instant Store Reset (`lib/store/dashboardStore.ts`)**: Implemented `resetUserStore()` method to immediately invalidate `isHydrated` status and clear previous account data (`profile`, `games`, `dossierCharacters`, `animeList`, `dramas`, `hallOfFame`, `notes`, `links`, etc.) upon logout or account switch.
- **Race Condition Protection**: Added `requestSequenceId` counter in `fetchDashboard()` to discard stale API responses from previous sessions if a new user logs in or switches accounts while a fetch is pending.
- **Auth State Synchronization (`lib/auth/AuthProvider.tsx`)**: Updated `onAuthStateChange` listener to detect user ID changes and automatically trigger `resetUserStore()` and fresh user-scoped dashboard re-hydration.
- **Clean Redirection**: Updated logout handlers in `SettingsDropdown.tsx`, `app/profile/page.tsx`, and `app/login/page.tsx` to execute store reset and perform clean location redirection.

### 🔑 Theme-Adaptive Forgot Password & Reset Flow
- **Sign In Recovery Button**: Added a visible `Forgot Password?` link to both Cyberpunk and Neo-Brutalist Sign In forms.
- **Cyberpunk Recovery UI**: Futuristic translucent modal view with glowing cyan borders, JetBrains Mono typography, and reset link email dispatch via Supabase Auth (`supabase.auth.resetPasswordForEmail`).
- **Neo-Brutalist Recovery UI**: High-contrast brutalist view with 3px black borders, offset shadow buttons (`boxShadow: "4px 4px 0px #000"`), and bold uppercase typography.
- **Password Reset Portal (`/auth/reset-password`)**: Launched dedicated password reset route (`app/auth/reset-password/page.tsx`) with password confirmation validation and direct Supabase auth password update (`supabase.auth.updateUser`).

## [3.5.1] - 2026-07-31
- Middleware Guest routing, dev Prisma schema validation fix, and Neo-Brutalist Guest button theme parity.

## [3.5.0] - 2026-07-31
- Enterprise Multi-User Architecture & Strict Data Isolation across 21 models. Original data assigned to `nelvin.claudius06@gmail.com`.
