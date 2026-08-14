# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

## [12.1.0] - 2026-08-14

### 🚀 Targeted Dashboard Performance & Hydration Enhancements

**1. API Performance Optimization (`/api/dashboard`)**
- Removed blocking sequential repair routines (`repairCharacterDatabase`) from the main GET request read-path.
- Parallelized all 28 canonical dashboard entity queries using a unified `Promise.all` execution block.
- Result: Reduced API response latency from **~7.9s** to **~118ms** (98% performance gain).

**2. Deterministic SSR Hydration Fix (`app/page.tsx`)**
- Fixed hydration mismatch warnings caused by direct rendering of browser-dependent localized dates (`new Date().toLocaleDateString(...)`) during Server-Side Rendering.
- Integrated a `mounted` state boundary to ensure stable, deterministic fallback text during SSR and hydration, falling back to local date format securely post-hydration.

**3. PWA Manifest Redirect Loop Resolution (`proxy.ts`)**
- Fixed Next.js Proxy middleware auth routing which incorrectly intercepted unauthenticated background requests for PWA manifests and service workers.
- Explicitly added `.webmanifest`, `manifest.json`, `robots.txt`, and `sw.js` into both `PUBLIC_ROUTES` inclusion and the matcher exclusion pattern.

**4. MP4 Card Video Framing Standardization (`mediaResolver.ts`)**
- Consolidated video object-fit mapping across all interactive media cards (`LazyCardVideo`, `HofEntryCard`, `VideoCropModal`).
- Applied unified `getVideoFramingStyle` helper ensuring square/horizontal source videos render correctly in 3:4 portrait borders without edge stretching or cropping misalignment.

## [12.0.0] - 2026-08-13

### 🔄 Persistent Game Character Sync Engine & Soft-Delete History System

**1. Persistent Idempotent Game Synchronization Engine (`GameSyncMetadata` & `app/api/game-characters/sync/route.ts`)**
- Resolved recurring game synchronization prompt issues across sessions (specifically for *Girls' Frontline 2: Exilium* and all supported games).
- Added `GameSyncMetadata` PostgreSQL model to store `lastSuccessfulSyncAt`, `remoteRecordCount`, and `syncStatus` (`UP_TO_DATE`, `CHANGES_AVAILABLE`, `SYNCING`, `ERROR`).
- Synchronization is fully idempotent: running Sync a second time against unchanged remote data returns 0 changes (`✓ Up to date`) without creating duplicate records or re-syncing.

**2. Database-Backed Soft-Delete History System (`SoftDeleteHistory` & `HistoryModal.tsx`)**
- Replaced destructive deletes for Game Characters and Character Dictionary entries with a soft-delete flow that preserves complete JSON snapshots, media references, gallery URLs, and exact original record IDs.
- **Top-Bar Settings Integration (`SettingsDropdown.tsx` & `Header.tsx`)**: Added `History` to the top-bar quick settings dropdown menu between `Profile Settings` and `Log Out`.
- **Multi-Select Bulk Restore**: Supports selecting single or multiple items to restore simultaneously. Restored items retain their exact original database IDs, media, and gallery without generating new random IDs.
- **Multi-Select Bulk Permanent Delete w/ Orphan Safety**: Supports permanently removing selected items from History after confirmation. Performs orphan media checks across active database tables and remaining History snapshots to ensure media referenced elsewhere is **never** deleted.

## [11.9.0] - 2026-08-13

### 🖼️ Character Dictionary Media Persistence & Universal Game Element Visual Engine

**1. Square Avatar Resolution Priority Fix (`TokusatsuProfileModal.tsx` & `CharacterDictProfileModal.tsx`)**
- Corrected 1:1 square avatar containers across Tokusatsu and general Character Dictionary profile modals to prioritize dedicated custom Square Avatars (`avatarUrl`), falling back to Profile Portrait (`portraitUrl`), Card Image (`imageUrl`), and Initials without overwriting database fields.

**2. Additive Gallery Union Merging Engine (`lib/utils/mediaResolver.ts` & `app/api/action/route.ts`)**
- Centralized `mergeCharacterDictionaryMediaIntoGallery` helper ensuring Card Images, Profile Portraits, and Square Avatars auto-persist into character galleries across saves and reloads without deleting existing items or creating duplicate entries.

**3. Universal Game Element Visual System (`elementTheme.ts` & `ElementParticles.tsx`)**
- Standardized elemental visual effects across all 19 supported game titles (Honkai: Star Rail, Zenless Zone Zero, Genshin Impact, Reverse: 1999, DB Legends, Wuthering Waves, NIKKE, etc.) into 12 core visual categories with dual-theme Cyberpunk luminous particle layers and Neo-Brutalism solid SVG corner motifs.

## [11.8.0] - 2026-08-12

### 🎥 Game Character Media Isolation & MP4 Card Preview Engine

**1. Removal of Image/Media Storage from Game Character JSON (`gameCharacterSchema.ts`)**
- **Clean Metadata Exports**: Updated `exportGameCharacterToJson` to strip all media storage fields (`cardImage`, `avatarUrl`, `splashArt`, `gallery`, `portraitUrl`, `bannerUrl`, `videoUrl`, `thumbnail`, `previewVideo`, `cardVideo`) from exported JSON documents.
- **Canonical Structure Intact**: All 30+ canonical nested and flat character metadata fields (`identity.*`, `world.*`, `combat.*`, `voice.*`, `story.*`, `id`, `name`, `officialName`, `alias`, `nickname`, `nativeName`, `title`, `gameId`, `gameName`, `tier`, `rank`, `isFavorite`, `isFeatured`, `accentColor`) are preserved exactly.

**2. Database Media Preservation During JSON Import (`deepMergeGameCharacter`)**
- Updated `deepMergeGameCharacter` so JSON imports and partial metadata updates NEVER erase existing database/store media (`cardImage`, `avatarUrl`, `splashArt`, `gallery`, `cardVideo`, `previewVideo`, etc.).
- Existing database media remains intact when metadata is updated via JSON file imports.

**3. MP4 Video Card Preview Support (`HofEntryCard.tsx` & `GameCharacterCard.tsx`)**
- **Character Dictionary Cards (`HofEntryCard.tsx`)**: Added support for `.mp4` and `.webm` video card previews playing seamlessly inside the 3:4 aspect ratio preview layer.
- **Game Character Cards (`GameCharacterCard.tsx`)**: Integrated shared `getCardVideoUrl` and `getCardImageUrl` media resolution helpers.
- **Playback & Hygiene**: Video elements render with `autoPlay`, `muted`, `loop`, `playsInline`, `preload="metadata"`, `pointer-events-none`, `object-cover object-top` formatting, and zero player controls.
- **Automatic Error Fallback**: Built `onError={() => setVideoError(true)}` handlers on `<video>` elements. If an MP4 fails to load, card preview automatically falls back to image artwork (`cardImg` / `avatarUrl`), and ultimately to default initials/gradient containers.
- **Preserved Aesthetics**: All card dimensions, borders, badges, favorite stars, rank badges, hover scale effects, Cyberpunk & Neo-Brutalism themes, and responsive layouts remain untouched.

**4. Shared Media Resolution Module (`lib/utils/mediaResolver.ts`)**
- Centralized `isVideoUrl`, `getCardVideoUrl`, `getCardImageUrl`, and `MEDIA_KEYS` stripping definitions.

**5. Automated Test Coverage**
- `scripts/test_json_import_preservation.ts`: Verified canonical nested JSON import/export, data preservation, media exclusion on export, media preservation on import, and MP4 video resolution (8/8 tests PASSED).
- `scripts/test_duplicate_and_delete_system.ts`: Verified ID-strict record identity, deep cloning, duplicate prevention, and deletion isolation (53/53 assertions PASSED).

---



## [11.7.0] - 2026-08-11

### 🔐 Character Identity, Duplicate & Delete System

**Problem Solved**: Previously, deleting one of two identical Game Character records would accidentally use name/content matching, affecting both records instead of only the target. The duplicate creation flow also lacked any prevention, allowing unlimited accidental duplicates.

**ID-Strict Record Identity (All Character Systems)**
- Every stored character entry is now mutated (delete, update, favorite, rank, like) **exclusively by its unique `id`**. Name matching, content matching, and multi-field matching are never used to identify an existing record.
- Audited: `dashboardStore.ts`, `/api/action/route.ts` — all Prisma operations use `where: { id: payload.id }`, all Zustand filters use `.filter(r => r.id !== targetId)`.
- Result: Two records with 100% identical data but different IDs are permanently independent.

**Context-Menu Duplicate Action (Game Characters & Character Dictionary)**
- Right-clicking any Game Character card or Character Dictionary entry now shows a **"Duplicate Entry"** option.
- Duplicate deep-clones the entire record using the new `deepClone<T>()` recursive engine — zero shared object or array references for `identity`, `world`, `combat`, `voice`, `story`, `details`, `gallery`, `stats`, `tags`, `tokusatsuData`, `forms`, `weapons`, etc.
- A fresh unique ID is generated. The original name is preserved exactly (no `(Copy)` suffix).

**Duplicate Prevention on Normal Creation**
- Creating a new Game Character is blocked if an equivalent already exists (match: `gameId`/`gameName` + `name`/`officialName`/`nativeName`).
- Creating a new Character Dictionary entry is blocked if an equivalent exists (match: `type` + `name` ± `series`/`franchise`).
- Both editors show a contextual warning toast explaining how to use the right-click Duplicate action for intentional independent copies.
- JSON import of Game Characters is also subject to duplicate prevention.

**New File: `lib/data/duplicateHelper.ts`**
- `deepClone<T>(obj)`: Universal recursive deep-clone with Date support, zero reference sharing.
- `isGameCharacterDuplicate(newEntry, existingList, excludeId?)`: Canonical identity check using game + name fields.
- `isHofDuplicate(newEntry, existingList, excludeId?)`: Canonical identity check for Character Dictionary entries. `excludeId` prevents false-positive during edit of existing records.
- `duplicateGameCharacter(original)`: Returns a deep-cloned `GameCharacterEntry` with new unique ID.
- `duplicateHofEntry(original)`: Returns a deep-cloned `HallOfFameEntry` with new unique ID.

**Automated Test Suite (`scripts/test_duplicate_and_delete_system.ts`)**: 53 assertions, all passing:
- Test A: Normal creation blocked when equivalent exists
- Test B: Context-menu Duplicate creates two independent records with different IDs
- Test C & D: Deleting one record never affects the other
- Test E: Editing original biography leaves clone unchanged
- Test F: Favoriting original leaves clone's isFavorite unchanged
- Test G: JSON import duplicate prevention
- Test H: Deep-clone independence for all canonical nested objects
- Test I: Tokusatsu duplication retains all Tokusatsu-specific data
- Test J: Japanese Actress stays Actress (not classified as Tokusatsu)
- Test K: Two records with identical data but different IDs never collide
- Test L: excludeId prevents false-positive during update of existing record

---



## [11.6.1] - 2026-08-11

### 💾 Game Character Canonical JSON Import Engine & Data Loss Fix

**Root Cause Identified & Fixed (`gameCharacterSchema.ts`)**
- **Data Loss Root Cause**: The JSON parser, visual editor, and import handlers only searched for flat top-level properties (e.g. `obj.birthday`, `obj.nation`). When importing standardized canonical JSON containing nested objects (`identity.*`, `world.*`, `combat.*`, `voice.*`, `story.*`), those nested fields were ignored and dropped. Shallow merge operations (`{ ...profile, ...parsed }`) further wiped unmentioned nested keys.
- **Bidirectional Mapping Engine**: Implemented `normalizeGameCharacterJson(raw)` and `exportGameCharacterToJson(entry)` to translate between canonical nested JSON and internal `GameCharacterEntry` store records. Populates BOTH canonical nested objects (`identity`, `world`, `combat`, `voice`, `story`) AND flat fallback properties.
- **Recursive Deep Merge Engine (`deepMergeGameCharacter`)**: Implemented recursive deep merging for nested objects (`identity`, `world`, `combat`, `voice`, `story`, `voiceActors`, `stats`), ensuring partial JSON updates update specified keys without erasing existing properties.
- **Editor & Exporter Wiring (`GameCharacterEditorModal.tsx` & `GameCharacterJsonEditor.tsx`)**:
  - `useEffect`: Form state initializes from both flat and canonical nested properties.
  - `getLivePayload` & `handleSubmit`: Generates complete payloads containing both canonical nested objects and flat fallback fields.
  - `handleExportJson`: Uses `exportGameCharacterToJson` to download canonical nested JSON files matching the user's standardized format.
- **Profile View Modal (`CharacterProfileModal.tsx`)**: `resolveField` and `InfoRow` renderers updated to check both canonical sub-objects and flat properties, ensuring all 30+ identity, world, combat, voice, and story fields render in the UI.
- **Automated Data Preservation Suite (`scripts/test_json_import_preservation.ts`)**: Programmatic test suite validating exact Daring Heart (Umamusume) and Xiao (Genshin Impact) JSON import/export, deep merge, and data retention fidelity.

---

## [11.6.0] - 2026-08-11


### 🎭 New Character Type-Selection Flow & Tokusatsu Classification Engine Overhaul

**New Character Creation Dialog (`NewCharacterTypeSelector.tsx`)**
- **Two-Step Creation Flow**: The `＋ Add New Entry` button in Character Dictionary now opens a clean type-selection dialog instead of immediately opening the generic editor.
- **Artist / Anime Option**: Routes to `HofEditorModal` (standard editor) for actresses, actors, anime characters, singers, VTubers, and other normal collectibles.
- **Tokusatsu Option**: Routes directly to `TokusatsuEditorModal` (dedicated Tokusatsu Hero & Armor System editor) for Ultraman, Kamen Rider, Power Rangers, Super Sentai entries.
- **Franchise Tags**: The Tokusatsu option displays all four franchise chips (⚡ Ultraman, 🏍️ Kamen Rider, 🔴 Power Rangers, 🛡️ Super Sentai) as visual hints.
- **Dual-Theme Support**: Full Cyberpunk (neon cyan/red glow, dark glass) and Neo-Brutalism (bold black border, box-shadow) fidelity via `useTheme()`.
- **Animated**: Framer Motion spring animation on dialog enter/exit.

**Characters Page Wiring (`app/characters/page.tsx`)**
- Added `typeSelectorOpen` and `tokusatsuEditorOpen` state variables.
- `Add New Entry` button now sets `typeSelectorOpen=true` instead of directly opening an editor.
- `NewCharacterTypeSelector`, `TokusatsuEditorModal` (new creation instance), and `HofEditorModal` are all mounted in the modal section.
- Existing `handleEditHof` edit path is completely unchanged — still routes through `HofEditorModal` which delegates to `TokusatsuEditorModal` for existing Tokusatsu entries.

---

**Critical Bug Fix — Japan ≠ Tokusatsu (`lib/data/tokusatsuDataHelper.ts`)**
- **Root Cause**: `isTokusatsuEntry()` was building a `combinedText` string from `entry.name`, `entry.universe`, `entry.knownFor`, then matching Tokusatsu keywords across it. Japanese actresses/actors with names written in Japanese characters, or entries with "Japan" in their universe/knownFor, were incorrectly flagged as Tokusatsu.
- **Fix**: Completely rewrote `isTokusatsuEntry()` — `combinedText` scan removed entirely. Detection now uses strict explicit-data-first hierarchy:

  1. `entry.type === "tokusatsu"` (authoritative stored type)
  2. Type field keyword: `toku`, `kamen`, `ultraman`, `sentai`, `power ranger` — **only the `type` field**, not the name
  3. Explicit structured data: `details.tokusatsuData`, `details.kamenRider`, `details.ultraman`, `details.powerRangers`, `details.superSentai`
  4. Explicit metadata: `tokusatsuFranchise`, `tokusatsuShow`
  5. Keyword match in `entry.franchise` and `entry.series` **only** — not `entry.name`, `entry.nationality`, `entry.country`, or `entry.universe`

- **Guaranteed Non-Tokusatsu**: `nationality`, `country`, `origin`, `name`, `universe`, `knownFor` are permanently excluded as Tokusatsu classification signals. A Japanese actress with `country="Japan"` will never be misclassified.

---

## [11.5.0] - 2026-08-11


### 🦸 Tokusatsu Navigation Centralization, Dynamic Subtype Filtering & Franchise Badging

**Sidebar & Navigation Refactoring**
- **Standalone Tokusatsu Item Removed (`Sidebar.tsx`)**: Removed the `Tokusatsu` accordion menu item and its sub-navigation entries (`Ultraman`, `Kamen Rider`, `Power Rangers`) from the left sidebar. Character Dictionary (`/characters`) is now the single entry point for all collectible character categories.

**Character Dictionary Tokusatsu Subtype Filtering (`app/characters/page.tsx`)**
- **Dynamic Franchise Subtype Filter Bar**: A secondary subtype filter row (`All Tokusatsu`, `Ultraman`, `Kamen Rider`, `Power Rangers`, `Super Sentai`) dynamically appears below the main category pills when the `Tokusatsu` category is selected. Hidden for all other categories.
- **Live Entry Counts**: Each franchise subtype button displays a live count badge derived from `resolveFranchiseType()` applied to the full Tokusatsu dataset.
- **Multi-Filter Integration**: Subtype filtering fully composes with search, origin, popularity/A-Z/Z-A sorting, favorites, and GOAT filters.
- **URL Search Param Support**: State reads `?category=tokusatsu&subtype=ultraman` etc. on initial mount for deep-link compatibility.

**Character Card Franchise Badges (`HofEntryCard.tsx`)**
- **Semantic Franchise Badges**: Updated `getTypeLabel()` to display specific franchise badges (⚡ Ultraman, 🏍️ Kamen Rider, 🔴 Power Rangers, 🛡️ Super Sentai) instead of the generic `🦸 Tokusatsu` label.

**Legacy Route Redirects**
- `/tokusatsu` → `/characters?category=tokusatsu`
- `/tokusatsu/ultraman` → `/characters?category=tokusatsu&subtype=ultraman`
- `/tokusatsu/kamen-rider` → `/characters?category=tokusatsu&subtype=kamen-rider`
- `/tokusatsu/power-rangers` → `/characters?category=tokusatsu&subtype=power-rangers`

---

## [11.4.1] - 2026-08-11

### 🐛 Tokusatsu Runtime Profile Modal Routing Fix & Detection Engine

**Root Cause Identified & Fixed**
- **Character Dictionary Click Path Bypassed HofProfileModal**: `app/characters/page.tsx` invoked `<CharacterDictProfileModal>` directly via `onOpenProfile` handler, bypassing `HofProfileModal` entirely. Tokusatsu entries clicked from `/characters` therefore rendered the generic 4-tab view rather than the dedicated 9-tab Tokusatsu modal.

**Character Dictionary Modal Delegation (`CharacterDictProfileModal.tsx`)**
- **Early-Return Tokusatsu Routing**: Added `if (entry && isTokusatsuEntry(entry)) return <TokusatsuProfileModal .../>` at the top of `CharacterDictProfileModal`, ensuring every click path through the Character Dictionary that resolves to a Tokusatsu entry delegates immediately to `TokusatsuProfileModal`.

**Hall of Fame Profile Routing (`HofProfileModal.tsx`)**
- **`isTokusatsuEntry()` Integration**: Integrated detection check so `/hall-of-fame` and `/tokusatsu` paths also route Tokusatsu entries to `TokusatsuProfileModal`.

**Tokusatsu Detection Engine (`lib/data/tokusatsuDataHelper.ts`)**
- **Enhanced `isTokusatsuEntry()`**: Extended detection to inspect `details.tokusatsuData`, `details.ultraman`, `details.kamenRider`, `details.powerRangers`, `details.superSentai`, `tokusatsuFranchise`, `tokusatsuShow`, plus textual keyword matching across `name`, `series`, `franchise`, and `universe` fields (`ultraman`, `kamen rider`, `super sentai`, `power ranger`, `tokusatsu`).

---

## [11.4.0] - 2026-08-11

### 🏯 Dedicated Tokusatsu Profile View System, Visual Editor & JSON Import/Export Pipeline

**Dedicated Tokusatsu Profile Modal (`TokusatsuProfileModal.tsx`)**
- **9 Specialized Navigation Tabs**: Overview, Gallery, Lore, Appearances, Forms, Weapons, Vehicles, Powers, Franchise.
- **Data Source**: Consumes `normalizeTokusatsuProfile(entry.details?.tokusatsuData, entry)` for a consistent, backward-compatible rendering pipeline.
- **Dual-Theme Support**: Full Cyberpunk and Neo-Brutalism fidelity via `useTheme()` and `isCyber` style branching.
- **Gallery Lightbox**: Image gallery with `ImageLightboxModal` integration.
- **Empty-State Safeguards**: Clean placeholders for any optional collection that is empty, with no blank tabs.

**Franchise-Specific Contextual Renderers (Franchise Tab)**
- **Ultraman**: Color Timer, Host (human form), Beam Attacks, Defense Team, Planet/Home Origin.
- **Kamen Rider**: Rider System, Belt Device, Rider Kick, Rival Riders, Allied Riders.
- **Power Rangers**: Ranger Color, Morphing Call, Zords, Megazords, Team Name.
- **Super Sentai**: Gattai Name, Mecha, Team Position, Series Era, Villain Faction.

**Dedicated Tokusatsu Visual Editor (`TokusatsuEditorModal.tsx`)**
- Built a full-featured visual editor with form sections for every Tokusatsu field: Identity, Franchise, Forms & Transformations, Weapons, Vehicles, Powers & Finishers, Appearances, Franchise-Specific fields, Cast & Production.
- Integrated schema-aware normalization (`normalizeTokusatsuProfile`) and 3:4 portrait crop modal.

**Raw JSON Import/Export Editors**
- **`TokusatsuJsonEditor.tsx`**: Schema-validated JSON editor for Tokusatsu entries (paste, validate, import to data store, export to clipboard).
- **`HofJsonEditor.tsx`**: JSON editor for Hall of Fame entries.
- **`GameCharacterJsonEditor.tsx`**: JSON editor for Game Character entries.

**Schema & Normalization Pipeline**
- **`lib/types/tokusatsu.ts`**: Full TypeScript interface definitions for `TokusatsuProfile`, `TokusatsuForm`, `TokusatsuWeapon`, `TokusatsuVehicle`, `TokusatsuAbility`, `TokusatsuAppearance`, and franchise-specific blocks.
- **`lib/data/tokusatsuDataHelper.ts`**: Normalization helpers (`normalizeTokusatsuProfile`, `resolveFranchiseType`, `isTokusatsuEntry`) ensuring consistent data-store-to-UI rendering.
- **`lib/data/tokusatsuSchema.ts`**: Runtime schema definition and validation for import validation.
- **`lib/data/hofSchema.ts`**: Schema definition for Hall of Fame entry JSON validation.
- **`lib/data/gameCharacterSchema.ts`**: Schema definition for Game Character JSON validation.

**Build Fix**
- **`app/tokusatsu/page.tsx` Suspense Boundary (commit 2a7aa0b)**: Wrapped `useSearchParams()` in a `<Suspense>` boundary to resolve Next.js 16 static generation build error.

---

## [11.3.4] - 2026-08-10


### ↔️ Refined Intelligent Horizontal Tab Auto-Scrolling in HofEditorModal

- **Intelligent Boundary Inspection**: Re-architected `scrollToTab` in `HofEditorModal.tsx` to inspect `container.getBoundingClientRect()` vs `tabEl.getBoundingClientRect()` backed by `requestAnimationFrame`.
- **Direction-Aware 16px Safety Padding**: Smoothly auto-scrolls the horizontal tab container right or left with 16px safety padding when tabs are clipped on the right or left edge.
- **Container-Scoped**: Scrolling is strictly scoped to `tabListRef.current`, preserving outer modal and window scroll stability.
- **All Tabs Preserved**: All 7 tabs (`Basic`, `Identity & Origin`, `Profile & Lore`, `Appearances`, `Gallery & Images`, `Links & Social`, `Artist Preset / Auto-Fill`) remain in single-row horizontal format.

## [11.3.3] - 2026-08-10

### 🏛️ Character Dictionary Profile Header Revert & Tab Auto-Scroll Retention

- **Profile Header Reverted (`CharacterDictProfileModal.tsx`)**: Reverted profile modal header strictly to its clean compact layout per user command.
- **Tab Auto-Scroll Retained (`HofEditorModal.tsx`)**: Retained direction-aware horizontal tab auto-scrolling in the editor modal without window scroll jumps.

## [11.3.2] - 2026-08-10

### 📊 Data-Driven Quick Profile Rail & Direction-Aware Tab Auto-Scroll

- **Data-Driven Quick Profile Rail (`CharacterDictProfileModal.tsx`)**: Added a compact statistics block on the right side of the compact header utilizing real stored values (`ROSTER #`, `LIKES`, `WORKS`, `GALLERY`). Gracefully omits rows when underlying data is absent.
- **Intelligent Direction-Aware Tab Auto-Scroll (`HofEditorModal.tsx`)**: Re-architected `scrollToTab` to measure container and tab bounding rectangles. Smoothly auto-scrolls horizontally when tabs are clipped on left or right, while remaining stationary when tabs are already fully visible. Zero window scroll jumps.

## [11.3.1] - 2026-08-10

### 🏛️ Compact Premium Character Dictionary Profile Header Layout

- **Compact Header (~200–230px Desktop Height)**: Redesigned `CharacterDictProfileModal.tsx` header layout from an oversized hero into a sleek, compact profile header with controlled padding (`py-3.5 sm:py-4`) and capped avatar proportions (capped at max ~155px).
- **Identity Metadata Row**: Added a dedicated inline metadata row (Occupation, Country, Age, Type/Species) to fill horizontal space beside avatar without inflating vertical modal height.
- **Preserved Systems & Responsive Integrity**: Kept all existing image settings (Card Image 3:4, Portrait 3:4, Personal Gallery, Profile Avatar 1:1), read-only Hall of Fame routing rules, tab navigation bar, and dark futuristic theme styling across desktop, tablet, and mobile.

## [11.3.0] - 2026-08-10

### 🏛️ Character Dictionary Identity Hero Header, Customizable 1:1 Avatar, Gallery Persistence & Live Activity Feed

**Identity Hero Profile Header & Customizable 1:1 Avatar**
- **Identity Hero Header (`CharacterDictProfileModal.tsx`)**: Re-architected the Character Dictionary profile modal header with a 1:1 aspect ratio Avatar container (constrained to max ~160px on desktop with responsive mobile scaling), significantly larger name typography, and vibrant colorful semantic badges (Gold Status, Cyan Profession, Purple Country, Rose Favorite, Emerald Series).
- **Customizable 1:1 Profile Avatar (`HofEditorModal.tsx`)**: Added a dedicated `Profile Avatar (1:1 Square)` section under Gallery & Images supporting Card Image fallback and custom image link/upload syncing without affecting existing Card Image or 3:4 Portrait settings.

**Prisma Database Persistence & Real-Time Event Pipeline**
- **Prisma Upsert Mutation Fix (`app/api/action/route.ts`)**: Added `details`, `gallery`, `splashArt`, `portraitUrl`, `accentColor`, and `gameCharacterId` to the Prisma `UPDATE_HOF` upsert mutation. Fixes the issue where gallery images and extended character details disappeared after page reloads.
- **Live Activity Feed Stream (`lib/utils/hofEngine.ts` & `dashboardStore.ts`)**: Connected live `hallEvents` to `generateActivityFeed` and Zustand store actions, automatically streaming real-time event cards when entries are added, updated, or hearted.

**Artist Data Inventory & Preset Audit**
- **Artist Presets Expansion (`ArtistData.json`)**: Audited existing Character Dictionary entries and added complete presets for Tao Tsuchiya, Song Joong-ki, and YOASOBI to `ArtistData.json`.

## [11.2.3] - 2026-08-09

### 🔒 Read-Only Hall of Fame Profile Context Enforcement

**Context-Aware Read-Only Profile Modals**
- **Read-Only Hall of Fame Context (`HofProfileModal.tsx`)**: Enforced `onEdit={undefined}` for profile views opened from Hall of Fame context. Hides the Edit button on Game Character, Character Dictionary, Drama, Anime, Movie, and Tokusatsu rank profile modals.
- **Primary Owner Section Editing Integrity**: Maintained full edit capability in primary owner sections (`/game-characters` and `/characters`) by rendering the Edit button conditionally only when `onEdit` callback is provided.

## [11.2.2] - 2026-08-09

### 🧭 Hall of Fame Category-Specific Modal Routing Fix

**Category-Specific Modal Routing Engine**
- **Game Character Profile Modal Routing (`HofProfileModal.tsx`)**: Re-routed Game Character rank entries in Hall of Fame to open the existing `CharacterProfileModal.tsx` experience, matching the exact modal presentation when clicking from the Game Character section.
- **Character Dictionary & Entertainment Categories Routing**: Character Dictionary, Drama, Anime, Movie, and Tokusatsu rank entries continue opening the `CharacterDictProfileModal.tsx` encyclopedia dossier.
- **Reference Tracking (`app/hall-of-fame/page.tsx`)**: Attached explicit `gameCharacterId` and `isGameCharacterEntry` flags onto `gameHofEntries` to guarantee 100% reliable modal resolution without data structure ambiguity.
- **Category Switch Hygiene**: Automatically clears active modal state (`setProfileModalEntry(null)`) when switching category filters to prevent stale modal transitions.

## [11.2.1] - 2026-08-09

### 🖼️ Immersive Full-Canvas Character Dictionary Roster Cards

**Immersive Artwork Presentation & Overlay Architecture**
- **Full-Canvas Background Artwork (`HofEntryCard.tsx`)**: Re-architected Character Dictionary roster cards from split opaque boxes into full `3:4` aspect-ratio background artwork cards matching `GameCharacterCard`'s visual presentation.
- **Layered Bottom Gradient Overlay**: Applied a smooth transparent-to-dark gradient overlay (`rgba(0,0,0,0.05)` to `rgba(0,0,0,0.95)`), ensuring white character names, profession badges, and quote notes maintain strong contrast.
- **Top Bar Control Rail**: Integrated top-left status tier / rank badges and top-right interactive heart counter buttons (`❤️ Likes`) with hover scaling.
- **Dual-Theme Support**: Preserved Cyberpunk glowing cyan borders and Neo-Brutalism heavy 3px borders with drop shadow (`shadow-[5px_5px_0_#000]`).

## [11.2.0] - 2026-08-09

### 📖 Character Dictionary Dossier Modal, Reusable Artist Dataset & Social Links Engine

**Character Dictionary Dossier Modal & Navigation**
- **Character Information Pop-Out Dossier (`CharacterDictProfileModal.tsx`)**: Created a dedicated encyclopedia pop-out modal for fictional/entertainment characters featuring hero headers, identity metadata, lore tabs, appearances, personal image collection, and dual-theme (Cyberpunk & Neo-Brutalism) support.
- **Card Click Navigation Fix (`HofEntryCard.tsx`)**: Corrected card click action in Character Dictionary section to launch the dedicated Character Dictionary Dossier modal instead of navigating to the Hall of Fame roster.

**Reusable Artist Dataset & Social Links Engine**
- **Offline Artist Dataset (`ArtistData.json` & `artistDataHelper.ts`)**: Integrated a pre-configured artist metadata dataset containing Japanese & international creator metadata, aliases, pronunciations, biographies, works, and social links with search and non-destructive form field auto-filling.
- **Dedicated Auto-Fill Tab (`HofEditorModal.tsx`)**: Centralized preset autofill operations into a dedicated `⚡ Artist Preset / Auto-Fill` tab with header shortcut button navigation. Removed redundant duplicate preset search panels from the Gallery tab.
- **Links & Social Profiles Engine**: Added external link profile support (`socialLinks`) across store models, Prisma `details` JSON payload, a dedicated editor form tab, and dossier view rendering with clickable platform badges (`target="_blank"`).

**Editor Image Architecture & Responsive UX**
- **Re-Architected Gallery & Images Tab**: Adapted `CharacterImageUploader` and `GalleryUploader` primitives for side-by-side Card Image (3:4 thumbnail) and Portrait (3:4 modal image) columns, 3 portrait sync modes, and personal gallery collection management.
- **Active Tab Auto-Scrolling (`scrollToTab`)**: Added horizontal auto-scrolling for the 7-tab editor navigation bar, smoothly centering active tab buttons when clicked without moving the modal form body.
- **Compact Centered Modal Sizing (`modal.tsx`)**: Standardized `HofEditorModal` as a centered, responsive ~720px editor dialog with fixed outer border sizing rules.
- **Prisma Database Schema Restoration (`schema.prisma`)**: Fixed `HallOfFame` schema field mismatch (P2022) by restoring `details`, `gallery`, `splashArt`, `portraitUrl`, `accentColor`, and `gameCharacterId` columns.

## [11.1.0] - 2026-08-08

### 🛡️ Official Logo System, Mobile Intro Startup Flow & Workspace Loading Gate

**Official Application Branding & Logo System**
- **Master Application Identity Logo (Picture 1: NX Nexus Xenon)**: Integrated primary application identity asset (`/branding/master-logo.jpg`) into Login page, Auth screens, Landing page header, and PWA branding.
- **Cyberpunk Theme Logo (Picture 2: N Nexus)**: Integrated theme-specific logo (`/branding/cyber-logo.jpg`) into Sidebar, mobile Header bar, and Cyberpunk workspace loading screen.
- **Neo-Brutalism Theme Logo (Picture 3: X Xenon)**: Integrated theme-specific logo (`/branding/brutal-logo.jpg`) into Sidebar, mobile Header bar, and Neo-Brutalism workspace loading screen.

**Mobile Intro Startup & Workspace Loading Gate**
- **Mobile Intro Startup Flow (`MobileIntroHandler.tsx`)**: Directs mobile viewport access (`< 768px`) or standalone PWA launches on root `/` to the cinematic `/welcome` intro route. Preserves authenticated `Continue as [Name] →` shortcut without auth redirect loops.
- **Global Workspace Data Loading Gate (`GlobalWorkspaceLoader.tsx`)**: Full-viewport theme-aware loading screen covering the screen while authenticated workspace data is fetched. Completely prevents seed data or old cached user data from flashing on screen.
- **Cross-Account Data Protection**: `resetUserStore()` automatically resets `isHydrated: false` and `fetchError: null` upon logout or account switch, ensuring previous account data is invalidated immediately.

## [11.0.1] - 2026-08-08

### 🛠️ Prisma Client Proxy Delegation & React Script Hydration Fix

**Database & Server Instance Hygiene**
- **Dynamic Prisma Proxy Delegation**: Upgraded `lib/prisma.ts` with an ES Proxy wrapper delegating to `getPrismaClient()` on every property access. Guarantees hot-reloaded API routes dynamically access updated PrismaClient models (`profile` fields & `userAccount` delegate) without dev-server caching issues.
- **Payload Mapping**: Verified explicit server-side upsert mapping for all landing customization fields in `app/api/profile/route.ts`.

**React Hydration & Component Cleanup**
- **React Script Hydration Fix**: Moved Next.js `<Script id="theme-script">` component out of `<head>` and into root layout level in `app/layout.tsx`, resolving `Encountered a script tag while rendering React component` warnings.

## [11.0.0] - 2026-08-08

### 🌐 Cinematic Public Landing Page & Configurable World Branding Platform

**Public Landing Page Route (`/welcome`)**
- **Cinematic Hero Section**: Configurable world name, tagline, background animation intensity (`cinematic`, `ambient`, `minimal`, `custom`), avatar presentation, and smart CTAs.
- **Authenticated Shortcut**: Renders **`Continue as [Name] →`** for logged-in users, routing directly to the dashboard without re-authenticating.
- **Digital Sanctuary World Status**: Non-SaaS summary bar (*"This world contains Games · Music · Memories · Media · Characters · Life"*).
- **Feature Showcase**: Strict ID allowlist mapping (`game-database`, `game-characters`, `hall-of-fame`, `music`, `media`, `ai-library`, `hobbies`, `emergency`).

**Profile Customization & World Identity**
- **Dynamic Fallback Naming**: `dashboardName: null` default resolves dynamically to `${displayName}'s World` (e.g. *"Mitsu's World"*, *"Alex's World"*) or custom names (*"Elysium"*).
- **Opt-In Privacy Controls**: `showPublicStats`, `showAboutSection`, `showSocialLinks` default to `OFF`, keeping statistics and profile links private until explicitly enabled.
- **Live Draft Preview Modal**: Real-time modal in Profile Customization rendering unsaved form state in Cyberpunk and Neo-Brutalism modes.

## [10.0.0] - 2026-08-08

### 📱 Comprehensive Application-Wide Mobile & UX Overhaul

**Mobile Architecture & Navigation**
- **Responsive Drawer & Header**: Transformed sidebar navigation into a slide-out drawer on mobile screens (< 768px) while compacting top header controls without dropping any desktop navigation items.
- **Mobile Long-Press Engine**: Added touch long-press detection (500ms) to trigger contextual options for touch-based devices without a right-click button.

**Responsive Layouts & Viewport Audits**
- **Grid Reflowing**: Responsive cards & filters across `/game-characters`, `/heroes`, `/hall-of-fame`, `/drama`, `/anime`, `/tokusatsu`, `/music`, `/profile`, `/login`, and `/ai-library`.
- **Viewport-Bound Modals**: Applied `max-h-[85vh]` and `overflow-y-auto` across all character preview, edit, image crop, and detail modals.
- **Global Music Player Reflow**: Added multi-line flex-wrapping for mini-player elements on narrow screens.

## [9.6.0] - 2026-08-08

### 🔐 Dual-Identifier Authentication & 2-Step Email Relinking System

**Email or Username Authentication Engine**
- **Dual-Identifier Login Input**: Updated the login page (`/login`) input to accept either an account **Email Address** or **Username** in a single unified field without changing the visual design system.
- **Case-Insensitive Resolution**: Implemented backend username-to-email resolution (`/api/auth/login`) that maps usernames to canonical verified account emails automatically before authenticating against Supabase Auth.
- **Account & Credential Security**: Preserved single-account identity, rate-limiting, session tokens, and generic invalid credential responses to prevent user enumeration.

**Profile Customization & Account Email Relinking**
- **Account & Security Subsection**: Introduced a dedicated **🔒 Account & Security** setting panel at the top of Profile Customization (`/profile`) displaying verified email, account username, and relink status.
- **2-Step Verification Relink Workflow**:
  - Requires current password reauthentication before requesting email changes.
  - Enforces email format validation and uniqueness checks against existing accounts.
  - Generates 6-digit OTP verification codes with 15-minute expiration (`/api/auth/relink-email/request`).
  - Verifies code (`/api/auth/relink-email/verify`) and atomically updates Supabase Auth and Prisma `UserAccount` records.
  - Allows canceling pending relink requests at any time without disrupting current sessions or account-owned data.
- **Dual-Theme Visual Parity**: Polished in both Cyberpunk and Neo-Brutalism design languages across mobile, tablet, and desktop views.

## [9.5.2] - 2026-08-08

### 📊 Category Normalization Engine & Chart Separation Refactor

**Analytics Data Hygiene & Category Normalization**
- **Eliminated "None" Category**: Completely removed the "None" / uncategorized label from public analytics statistics.
- **Automatic Category Normalization**: Added `normalizeHallEntry()` to infer missing categories from roles, knownFor entries, notes, and associated drama titles without manual data intervention.
- **Developer Validation Report**: Invalid or unclassifiable entries are automatically excluded from public analytics charts and surfaced in an internal `DeveloperValidationReport` with diagnostic reasons.
- **Chart Separation (Media vs Profession)**: Separated mixed category charts into two distinct visual analytics widgets:
  - **🎬 Media Category Distribution**: `Drama`, `Anime`, `Movie`, `Game Character`, `Tokusatsu`.
  - **🎭 Profession Distribution**: `Actor`, `Actress`, `Voice Actor`, `Singer`, `Character`.

## [9.5.1] - 2026-08-07

### 🐛 Custom Select Dropdown & Floating Layer Positioning Fix

**Floating Layer Anchor & Transform Collision Fix**
- **Floating Viewport Anchor Positioning**: Fixed an unanchored top-left corner (`0, 0`) rendering bug in custom select dropdowns (`GameDropdown` inside `GameCharacterEditorModal` and `CustomSelect`).
- **Framer Motion Transform Isolation**: Separated outer Floating UI container (`position: fixed`, `transform`, `visibility: isPositioned ? 'visible' : 'hidden'`) from inner Framer Motion animation container (`opacity`, `scale`) to eliminate property collisions where Framer Motion overwrote `@floating-ui`'s position coordinates.
- **Viewport-Relative Fixed Coordinates**: Corrected `CollisionDetector` calculation for fixed position overlays by eliminating duplicate document `scrollTop` additions on `getBoundingClientRect()` coordinates.
- **Auto Width Matching**: Set dropdown panel minimum width to match the exact trigger element's width seamlessly across all devices and themes.

## [9.5.0] - 2026-08-07

### 🏛️ Real-Time Hall of Fame System & Personal Game Character Expansion

**Real-Time Hall Engine Enhancements**
- **Dynamic Achievements & Records**: All Hall Achievements and Historical Records are now computed dynamically from real database records (e.g. first character, games completed, dramas finished, music track milestones, starred favorites, GOAT counts). Zero placeholder values.
- **Season Legacy & Championship Archive**: Championship history timelines dynamically aggregate top entries, vote leaders, and reign lengths directly from live database history.
- **Museum Visual Analytics Dashboard**: Visual graphs, category mix, country breakdowns, and vote growth charts now consume 100% live database data.
- **Top-5 Live Activity Feed & Centered Modal**: Refactored the live activity feed to display ONLY the latest 5 entries. Added a prominent `View More →` trigger opening a centered `HofActivityModal` with full search, type filters (`Additions`, `Ranks`, `Votes`, `Favorites`, `Milestones`), and infinite pagination.

**Personal Game Character Collection Expansion**
- **16 New Personal Game Characters**: Added official verified character records for Nikke (`Scarlet`), Genshin Impact (`Chiori`, `Columbina`, `Keqing`, `Skirk`, `Diluc`), Wuthering Waves (`Rover`), Tower of Fantasy (`Roslyn`, `Yan Miao`, `Fei Se`, `Fiona`, `Lin`), and Girls' Frontline 2 (`Daiyan`, `Loreley`, `Lainie`, `Tololo`).
- **Account Isolation**: Injected ONLY into the active user's personal account without modifying global seed scripts or affecting other accounts.
- **Automatic Character Collection Sync**: Integrated with `processCharacterCreation` service to ensure automatic game linking, Character Collection syncing, and independent editing support.

## [9.4.0] - 2026-08-07

### ❤️ Game Character Permanent Like System & Multi-Select Checkbox Fixes

**New Feature & Database Migration**
- **Permanent Like Persistence**: Added `likes` count on `GameCharacter` model and `GameCharacterLike` database table with `@unique([userId, gameCharacterId])` constraint for strict 1-like-per-user enforcement.
- **Like API & Store Actions**: Created `/api/game-characters/like` endpoint and `likeGameCharacter` store action with instant optimistic UI updates and guest sandbox 403 protection ("Sign in to like this character.").
- **Interactive UI Integration**: Added animated compact Like button (`❤️ 1,254 Likes`) to `GameCharacterCard` and `CharacterProfileModal` header with Cyberpunk neon glow / Neo-Brutalism pop effects.
- **Hall of Fame "❤️ Most Liked" Ranking**: Added "❤️ Most Liked" sorting to Hall of Fame, fully integrated with game filter stacking, search, and featured filters.

**UI & Filter Repairs**
- **Refactored Multi-Select Checkbox Interactions**: Replaced `<label>` traps in `HofMultiSelectGameFilter.tsx` with dedicated interactive row button components, ensuring instant selection toggling on row/checkbox click with native accessibility.
- **Removable Active Game Chips**: Added removable selection chips below the game filter trigger button for instant visual feedback.

## [9.3.0] - 2026-08-07

### 🎮 Hall of Fame Dynamic Multi-Select Game Filter Architecture

**Feature Expansion & Architecture Refactor**
- **Removed Standalone Game Category Filter**: Cleaned up the redundant `Game Category` filter dropdown, state, and matching logic from Hall of Fame.
- **Added "Game" Option to Category Filter**: Expanded the main Category dropdown options (`Drama`, `Anime`, `Movie`, `Tokusatsu`, `Character`, `AI`, `Music`, `Game`).
- **Dynamic Multi-Select Game Filter (`HofMultiSelectGameFilter`)**: Built an interactive multi-select checkbox dropdown populated dynamically from the Game Database (`games`).
  - **Real-Time Game Search**: Integrated internal search bar to filter game list items instantly.
  - **Selection Controls**: Added `Select All` and `Clear All` action triggers.
  - **Dynamic Character Counts**: Displays live character counts per game.
  - **Click-Outside Guard & Animations**: Smooth Framer Motion popover transition and click-outside popover dismissal.
- **Dynamic Ranking Integration**: Hall of Fame rankings, podiums, records, and analytics now dynamically evaluate and filter single game, multi-game, and all-game selections seamlessly.
- **Dual-Theme Support**: Styled for both Cyberpunk (cyan neon checkboxes, purple glow, glassmorphism) and Neo-Brutalism (thick 3px black borders, high-contrast checkbox styling).

## [9.2.1] - 2026-08-07

### 🖼️ Character Profile Detail Modal Avatar Scaling & UI Polish

**UI & Aesthetics**
- **Profile Header Avatar Scaling**: Increased character avatar portrait size in `CharacterProfileModal` header from 64px x 64px thumbnail to a responsive 176px x 176px profile portrait (`w-28 h-28` mobile -> `sm:w-36 sm:h-36` tablet -> `md:w-44 md:h-44` desktop).
- **Artwork Fallback & Lightbox**: Updated avatar display to use `cardImage` as primary portrait source with `avatarUrl` fallback, interactive hover scale motion, and click-to-zoom lightbox preview.
- **Header Layout Balance**: Expanded hero banner height to `clamp(360px, 50vh, 460px)` to balance character name, rarity stars, element chips, and tags seamlessly beside the scaled profile portrait.

## [9.2.0] - 2026-08-07

### 🎮 Game Category Filtering, Dynamic Game Selector & Featured Character System

**New Features**
- **Game Category Filter**: Added a dedicated Game Category filter supporting 16 genres (Gacha, Action RPG, Turn-Based RPG, Tactical RPG, MOBA, Fighting, Shooter, MMORPG, Strategy, Simulation, Rhythm, Sandbox, Survival, etc.) with automatic genre substring matching.
- **Dynamic Game Filter**: Created a live Game selector dynamically populated from the Game Database — adding a new game to the DB automatically displays it in the filter controls without hardcoded lists.
- **⭐ Featured Game Character System**: Added `isFeatured` flag to `GameCharacter` schema & database table, allowing characters to be marked as Featured. Featured characters display a glowing ⭐ badge, a gold/cyan border highlight, and priority sorting.
- **⭐ Featured Only Filter**: Added a Featured Only filter toggle allowing users to isolate featured characters across all roster grids and Hall of Fame views.
- **Stacking Filters**: All filters (Category, Game, Featured, Element, Search, Sort) stack seamlessly for multi-dimensional roster exploration.

## [9.1.0] - 2026-08-07

### 🎭 Guest Showcase Mode, Global Theme Dropdown Fix & Editor Cleanup

**New Features**
- Guest Mode now serves a fully curated, read-only showcase instead of an empty dashboard. Guests see 3 AI tools (ChatGPT, Gemini, Claude), 3 demo songs, 3 dramas, 3 animes, 3 movies, 3 games, 3 Game Characters, 3 Character Collection entries, 3 Hall of Fame legends, and 3 public emergency cards (Police/Ambulance/Fire).
- All guest data lives in `lib/data/guestSeedData.ts` — a dedicated seed module completely isolated from the real database.
- All write operations (POST/PUT/DELETE) in `/api/emergency/contacts` now return HTTP 403 for guests, preventing any database writes.

**UI Improvements**
- Fixed Cyber Theme native `<select>` and `<option>` popup rendering: options are now readable (dark background + cyan text) in Cyber mode and white/black in Neo-Brutalism — applied globally via `app/globals.css`.
- Fixed `input[type="date"]`, `input[type="color"]`, `input[type="time"]` color-scheme to match active theme.
- Fixed `-webkit-autofill` box-shadow and text-fill-color to respect Cyber/Brutal themes across all inputs and selects.

**Bug Fixes & Cleanup**
- Removed "Choose From Dossier" selector, `handleDossierSelect` handler, and `dossierCharacters` store selector from `GameCharacterEditorModal` — the editor is now fully self-contained.

## [9.0.1] - 2026-08-07

### 🐛 Game Character Card Image Persistence & Schema Synchronization Fix

**Bug Fixes**
- Fixed `cardImage` not persisting after page refresh by adding a dedicated `cardImage` column to `GameCharacter` Prisma schema and PostgreSQL database.
- Fixed `characterCreationService` payload mapping so `cardImage` (3:4 ratio roster grid card) and `avatarUrl` (1:1 official icon) remain 100% independent and never overwrite each other.
- Ensured existing character card images are preserved cleanly during edit modal updates.

## [9.0.0] - 2026-08-07

### 🖼️ Global Image Crop System V2 & Image Persistence Architecture

**Global Image Crop Engine & Positioning Controls**
- Reusable `ImageCropModal` shared across all upload components (`CharacterImageUploader`, `GalleryUploader`, `HofEditorModal`, etc.).
- Complete position & alignment toolbar: Zoom In/Out slider, Zoom +/- buttons, Fit, Fill, Center, Rotate Left/Right (90° steps), Reset position, Touch Pinch/Drag, Mouse Wheel Zoom, and Double-Click Reset.

**Persistent Crop Data**
- Saved `cropData` structure (`zoom`, `x`, `y`, `rotation`, `aspect`, `cropArea`) alongside image URLs in stats/metadata.
- Refreshing the page or re-opening image editors restores the exact crop position and zoom level.

**Full Bleed Splash Art Banner**
- Fixed splash art container in `CharacterProfileModal` to be a true edge-to-edge full bleed header.
- Eliminated all white side gutters and gaps by switching banner render mode to `object-cover object-top`.

**Permanent Image Persistence Architecture**
- Enhanced `/api/upload` endpoint with local disk storage fallback (`public/uploads/`) and in-memory WebP fallback when external CDN/Supabase keys are unconfigured.
- Eliminated disappearing character card images after page refresh — all uploaded character images are stored permanently on server disk/DB.

**Premium Fullscreen Image Viewer (Lightbox V2)**
- Upgraded `ImageLightboxModal` with support for gallery image navigation (`images` array, Left/Right arrow key shortcuts, previous/next on-screen buttons).
- Built-in "Save / Download Image" and "Open Original in New Tab" action buttons.
- High-blur backdrop filter, spring-animated transitions, mouse wheel zoom, and drag-to-pan when scaled.

## [8.0.0] - 2026-08-07

### 🎬 Unified Media Details Engine V2

**Architecture: Single Details Engine for Drama, Anime & Movies**
- Created `components/media/MediaDetailsView.tsx` — a single unified component powering all three media types (Drama, Anime, Movie) with media-specific metadata sections.
- `app/anime/[id]/page.tsx` now exists and renders the same flagship Dossier experience as Drama, powered by the unified engine.
- `app/drama/[id]/page.tsx` simplified to a 5-line wrapper delegating to `MediaDetailsView`.
- `MediaCard` "View Details" button now correctly routes to `/anime/[id]` for anime and `/drama/[id]` for dramas.

**Metadata Confidence Scoring System**
- New `/api/media/metadata/route.ts` unified endpoint replacing the drama-only route.
- Confidence algorithm scores every candidate: 100% for direct external ID match (IMDb/TMDb/TVMaze/MAL), 70–95% for title+year matches, 45% for partial/sequel matches (e.g., "Taken" vs "Taken 2"), with year-mismatch penalties.
- If confidence < 90% with multiple candidates, API returns `requiresConfirmation: true` instead of silently using wrong metadata.
- `MetadataConfirmationModal` shown to user with all candidates and confidence scores — user selects exact entry and external ID is saved for instant future lookups.

**Anime Metadata via Jikan/MyAnimeList API**
- Full Anime details: Japanese title, English title, studios, source material, episode count, genres, synopsis, score, air year.
- Real voice actor cast grids: Character name, JP voice actor, EN voice actor, roles (Main / Supporting), actor photos.
- OP/ED theme songs with YouTube and Spotify search links.

**Episode Navigator Virtualization & Season Navigation**
- Rewritten `DossierEpisodeNavigator.tsx` with paginated season blocks (24 eps/block) — renders only active season at a time.
- Season selector tabs for multi-season / long-running series (One Piece, Naruto, Detective Conan).
- Episode search bar + "Jump to Episode #" input form for instant navigation.
- "▶ Continue Ep X" shortcut button for one-click resume.
- Auto-selects the season containing the last watched episode on mount.

## [7.0.0] - 2026-08-07

### 🎬 Drama Details V2 — Complete Elimination of Seed & Mock Data

**Dynamic Live Metadata Pipeline (`/api/drama/metadata`)**
- **Single Source of Truth**: Replaced every piece of hardcoded placeholder/seed data across all 11 Drama Dossier sections with real database records, user watch logs, and live external metadata.
- **Multi-Source Pipeline**: Integrates TMDb, OMDb, TVMaze API, Wikipedia API, and iTunes Search API with in-memory 24-hour LRU caching to automatically retrieve drama synopses, backdrops, real cast grids, full episode guides, OST tracks, awards, and streaming links.

**11 Fully Dynamic Media Intelligence Sections**
- **Section 1: Overview & Quick Stats**: Real episode progress, metadata total episodes, calculated completion %, exact days taken (`startDate` to `finishDate`), personal score, and rewatch count.
- **Section 2: Character Spotlight & Cast**: Dynamic cast grid from TVMaze/OMDb featuring real character names, actor names, actor pictures, character pictures, and main/supporting roles. Hides gracefully if unavailable.
- **Section 3: Episode Navigator & Watch Analytics**: Dynamic episode list with real watched progress indicators, dynamic pace chart, average daily watching rate, total hours watched, and estimated time remaining.
- **Section 4: Multi-Category Rating Radar**: Expanded rating breakdown across all 14 categories (*Story*, *Characters*, *Romance*, *Comedy*, *Action*, *Drama*, *Soundtrack*, *Ending*, *Visuals*, *Cinematography*, *World Building*, *Emotion*, *Chemistry*, *Pacing*) with interactive sliders and calculated overall score.
- **Section 5: Memory Gallery**: Renders user-uploaded screenshots and wallpapers. Features clean attach dropzone without unsplash defaults.
- **Section 6: Emotional Journey Timeline**: Chronological user milestone timeline tracking start/finish events, episode milestones, and custom emotional reactions.
- **Section 7: Personal Review & Critique**: Live Markdown review editor with spoiler toggle, pros/cons, favorite quote, favorite scene, and last edited timestamp.
- **Section 8: Original Soundtracks (OST)**: Real OST songs retrieved via iTunes API with album art, artist details, audio previews, Spotify links, YouTube links, and Apple Music links.
- **Section 9: Awards & Recognition**: Displays real awards and honors from OMDb/Wikipedia. Hides gracefully if unawarded.
- **Section 10: External Resources**: Dynamic links to IMDb, TMDb, TVMaze, MyDramaList, Wikipedia, Official Site, YouTube Trailer, Netflix, Disney+, Viki, and Prime Video.
- **Section 11: Personal Watch Journey**: Custom watch journey parameters (`favoriteEpisode`, `favoriteCharacter`, `emotionalEpisode`, `mood`, `wouldRewatch`) tied directly to user state.

## [6.1.0] - 2026-08-07

### 🛡️ Duplicate Character Collection Elimination & Database Uniqueness Protection

**Root Cause Fix & Centralized Pipeline**
- **Eliminated Duplicate Creation Paths**: Removed secondary client-side `addDossierCharacter` invocations inside `addGameCharacter()` in `lib/store/dashboardStore.ts`. All character creations now flow exclusively through `processCharacterCreation()`.
- **Database Uniqueness Constraint (`@@unique([gameId, name])`)**: Enforced a database-level unique constraint on `GameDossierCharacter` in `prisma/schema.prisma` preventing duplicate dossier insertions at the database engine level.
- **P2002 Safe Fallback Handling**: Handled Prisma unique constraint violation `P2002` in `processCharacterCreation()`, automatically recovering and reusing existing dossiers on concurrent creation attempts.
- **Case-Insensitive Whitespace Normalization**: Normalizes all character names (`trim()` + collapse interior whitespace + `mode: "insensitive"` matching) to ensure `Jinshi`, `jinshi`, ` JINSHI ` resolve to the exact same dossier entry.

**One-Time Duplicate Repair Utility (`repairDuplicateDossierCharacters`)**
- **Automatic Merging & Cleaning**: Scans for existing duplicate Character Collection rows, merges them, re-links all associated `GameCharacter` favorite references to canonical dossier IDs, and batch-deletes duplicate rows.
- **8-Scenario Automated Verification Suite**: Verified 8 test scenarios in `scripts/verify_unified_character_pipeline.ts` across 9 games (*Wuthering Waves*, *Honkai: Star Rail*, *Nikke*, *Zenless Zone Zero*, *Arknights*, *Honkai Impact 3rd*, *Reverse: 1999*, *Punishing: Gray Raven*, *Solo Leveling: Arise*).

## [6.0.0] - 2026-08-07

### 🏛️ Centralized Character Creation Service & Self-Healing Pipeline (Single Source of Truth)

**Architecture Refactor (`lib/services/characterCreationService.ts`)**
- **Single Source of Truth Service (`processCharacterCreation`)**: Centralized ALL character creation logic into a single pipeline service. Regardless of whether a character originates from Game Characters Hub UI, Character Collection UI, AI Agents, JSON/CSV Imports, API endpoints, or Bulk Imports, all creations pass through `processCharacterCreation()`.
- **Automatic Game Normalization & Pending Links**: Normalizes game names (e.g. `wuwa`, `wuthering waves`, `hsr`, `honkai: star rail`) and creates `pending_link` entries when parent games do not exist yet without losing data.
- **Character Collection UPSERT & Duplicate Prevention**: Automatically searches for existing `GameDossierCharacter` entries by `gameId + characterName`, updating official metadata without creating duplicate entries.
- **AI Agent Compatibility**: Provides zero-overhead bulk creation for AI Agents and import tools while guaranteeing database relationship integrity and image initialization.

**Self-Healing Synchronization (`repairCharacterDatabase`)**
- **Automatic Auto-Healing Utility**: Utility scans for orphaned favorites or missing Character Collection entries and automatically creates/links them.
- **Background Auto-Validation**: Triggers silent repair on `/api/dashboard` load, guaranteeing zero broken links or orphaned entries.

## [5.8.1] - 2026-08-07

### 🎭 Modal Stacking Prevention & Seamless Character Editor Transition

**Single Active Modal Manager (`activeModal`)**
- **Eliminated Modal Stacking**: Refactored modal state in `/game-characters` to use a single active modal manager (`activeModal: "none" | "profile" | "editor"`).
- **Seamless Profile-to-Editor Transition**: Clicking **Edit** inside the Character Detail Profile modal unmounts the profile view and seamlessly opens the Character Editor modal without requiring the user to manually close the profile modal first.
- **State & Data Preservation**: Passes character data directly to the editor modal without refetching or resetting state.
- **Background Scroll Locking & Z-Index Audit**: Maintained continuous scroll locking (`document.body.style.overflow = "hidden"`) during modal transitions and aligned backdrop/modal z-indexes (`z-[900]` / `z-[901]`).

## [5.8.0] - 2026-08-07

### 🔄 Game Character ↔ Character Collection Synchronization & Architecture Refactor

**Database & Data Architecture Fix (`schema.prisma` & `app/api/action/route.ts`)**
- **Root Cause Resolution**: Added missing `UPDATE_GAME_CHARACTER`, `DELETE_GAME_CHARACTER`, `UPDATE_DOSSIER_CHARACTER`, and `DELETE_DOSSIER_CHARACTER` action handlers to `/api/action/route.ts` with full field mapping for Prisma upserts.
- **Relational Integrity**: Enforced proper hierarchy where `Game Database └── Character Collection (GameDossierCharacter)` is the master repository, and `Game Characters (GameCharacter)` represents personal favorites linking to `Character Collection` via `characterId`.
- **Automatic Character Collection Creation**: Creating or updating a Game Character automatically upserts the corresponding `GameDossierCharacter` in the Game Database, eliminating "Character Collection (0)" empty states.

**Artwork Independence & Auto-Sync**
- **Independent Personal vs. Official Artwork**: Official artwork (`avatarUrl`, `splashArt` on `GameDossierCharacter`) remains independent from personal artwork (`cardImage`, `splashArt` on `GameCharacter`). Personal edits never overwrite official collection artwork.
- **Sync Official Artwork**: Added explicit "Sync Official Artwork" action allowing users to selectively sync official artwork with personal cards upon confirmation.

**Bidirectional Navigation & UX Badging**
- **★ Favourite Badge**: Rendered a prominent `★ Favourite` badge on Character Collection cards inside Game Database (`/games/[gameId]`) if linked to a favorite.
- **Bidirectional Navigation**: Added "🎮 Open Character Collection" button on Game Character profiles and "👁️ Open Favourite Profile" on Character Collection cards.
- **Delete Guardrails**: Added confirmation warnings when deleting a favorited character from Character Collection (`"This character is favourited. Deleting this character will also unlink the favourite profile."`). Deleting a favorite profile leaves the Character Collection entry intact.

## [5.7.0] - 2026-08-07

### ⚔️ Game Characters Complete Overhaul & Flagship Character Profile

**Flagship Character Profile Modal (`CharacterProfileModal.tsx`)**
- **Centered Cinematic Codex**: Transformed the Game Characters profile view into a 1150px centered modal featuring scale + spring entrance animations and blurred backdrop (`backdrop-filter: blur(12px)`).
- **Single Continuous Scroll Container**: Converted the modal body into a single smooth scrollable container where the splash art banner naturally scrolls away together with tab navigation and content.
- **Simplified 3-Tab Architecture**: Re-architected tab layout into **Overview** (merged Identity, World, Combat, Voice, Story & Lore), **Gallery** (all artwork with click-to-fullscreen lightbox), and **Personal** (Favorite, Rating 1-10, Pull Status, Investment Level, Custom Tags, Notes).

**Dual-Theme Consistency & Rendering Polish**
- **Neo-Brutalism & Cyberpunk Contrast Fix**: Resolved text/input white-on-white contrast issues by implementing dynamic theme tokens across all tabs, buttons, labels, and textareas.
- **Neo-Brutalism Theme**: Styled with bold 3px black borders, offset drop shadows (`6px 6px 0 #000`), yellow/cyan chunky buttons, and high-contrast gaming energy.
- **Cyberpunk Theme**: Styled with sleek dark backgrounds (`#06080f`), neon ambient lighting, and glowing accent borders.

**Independent Image Management & Database Synchronization**
- **Dedicated Card Image & Splash Art**: Added independent `cardImage` (3:4 ratio for roster cards) and `splashArt` (16:9 for profile banner) properties with dedicated upload, drag & drop, crop, zoom, and rotate handlers.
- **Automatic Game Database Linking**: Automatically links or creates `dossierCharacters` entries in the Game Database when adding characters, keeping shared official metadata synchronized while preserving personal fields.
- **Context Menu & Controls**: Added 14+ right-click context menu actions on character cards (Profile, Edit, Database, Sync, Upload/Crop, Duplicate, Rank, Copy, Export JSON, Delete) with internal scroll safety (`max-height: 70vh`).

## [5.6.0] - 2026-08-06

### 🎵 Unified Single Source of Truth Audio Engine (Phase 6)

**Global Audio Context Architecture**
- **Single Source of Truth (`MusicEngineContext.tsx`)**: Refactored the entire audio playback system into a unified `MusicEngineProvider`. This guarantees exactly ONE `HTMLAudioElement` and ONE hidden YouTube `<iframe>` exist simultaneously across the entire application, eliminating all duplicated playback synchronization issues.
- **Hook Integration (`useMusicEngine`)**: Abstracted `currentTime`, `duration`, `volume`, `isMuted`, `seekTo`, `setVolume`, and `toggleMute` directly into a custom hook. 
- **Centralized Event Handling**: Migrated Media Session API bindings (lockscreen controls), local storage persistence (`music_playback_session`), global keyboard shortcuts (Space, Arrows, Alt modifiers), and YouTube tracking intervals out of UI components and into the engine.

**Player UI Simplification**
- **`GlobalMusicPlayer` & `TopbarMiniPlayer`**: Ripped out all independent `<audio>`, `<iframe>`, duplicate timers, and local `useState` bindings. Both components now flawlessly reflect the true global state, enabling perfect instant-sync seeking and playback continuity regardless of where the user interacts.
- **Provider Injection**: Ensured the engine wraps the `AuthGateInner` inside `RootProviders.tsx` for global app accessibility.
- **Bug Fixes**: Resolved Next.js `<Script>` tag hydration errors in `layout.tsx` and suppressed stale Turbopack dev-server chunks by unregistering development service workers dynamically.

## [5.5.0] - 2026-08-06

### 🚨 Emergency Hub Module & AppShell Dashboard Integration

**Emergency Hub Priority Center (`/emergency`)**
- **Priority Quick-Access Roster**: Launched the Emergency Hub position directly under AI Library in the sidebar, providing instant access to family, medical, police, roadside assistance, and emergency contact channels.
- **1-Click Communication Triggers**: Built direct action triggers for 📞 Call (`tel:`), 💬 WhatsApp (`https://wa.me`), ✉ Email (`mailto:`), 🌐 Website, and 📍 Google Maps location navigation.
- **Multi-Format Import / Export Engine**: Created `emergencyImportExport.ts` supporting standard vCard (`.vcf`), CSV spreadsheet, and JSON import & export functionality.
- **Private Emergency Notes & Medical Instructions**: Modal viewer for critical medical notes, penicillin/allergy alerts, apartment numbers, gate passcodes, and preferred ER hospital instructions.
- **Context-Aware Right-Click Menu**: Implemented `EmergencyContextMenu.tsx` with contact actions (Call, WhatsApp, Email, Web, Maps, Favorite, Edit, Duplicate, Copy Number, Notes, Delete) and canvas actions (Add, Import, Export, Refresh).

**AppShell Layout & Shared Infrastructure Integration**
- **Seamless AppShell Hierarchy**: Integrated `/emergency` inside `AppShell`, preserving the global Sidebar, Top Navbar, Global Music Player, Search, Notifications, Profile Menu, and Theme Controls without page remounting.
- **Prisma Schema & Client Hardening**: Added `EmergencyContact` model to `schema.prisma`, pushed Supabase PostgreSQL database tables, and updated `lib/prisma.ts` with self-healing delegate resolution for newly added schema models.
- **Hydration & Script Hygiene**: Resolved hydration date string mismatches using deterministic UTC date extractions and migrated inline script tags to Next.js `<Script>` components.

## [5.4.0] - 2026-08-05

### 🎵 Music Vault Phase 5 Expansion — Queue Panel, Analytics & Collections

**Queue Panel & Play-Next Management**
- **`MusicQueuePanel`**: Created queue manager allowing users to reorder queue tracks, clear queue, play next, and remove single items.
- **`MusicAnalyticsDashboard`**: Added listening analytics dashboard tracking top played artists, most played tracks, listening streaks, and category breakdowns.
- **`CollectionManager`**: Full CRUD for music collections with custom emoji pickers, song additions/removals, and 1-click play-as-queue functionality.

**Media Session & Hotkeys**
- **Media Session API**: Bound native browser Media Session API to the Global Music Player for OS lockscreen and hardware media key control.
- **Global Music Shortcuts**: Bound global keyboard shortcuts (`Space` for play/pause, `ArrowRight`/`ArrowLeft` for next/prev).

## [5.3.0] - 2026-08-05

### 📖 Track Memories & Personal Music Journal

**Music Memories System**
- **`TrackMemoryModal`**: Integrated personal music journaling system allowing users to record memories, nostalgia logs, location tags, mood badges, and 5-star ratings for any track.
- **Database Persistence**: Extended music store & API handlers to save track memory logs per user account.

## [5.2.0] - 2026-08-04

### 🎧 Audio Extraction & Stream Resolver

**Stream Caching & UI Polish**
- **SoundCloud & Direct Stream Engine**: Enhanced music player stream resolver with fallback audio proxies and cached stream URLs.
- **Vinyl Audio Player Visuals**: Polished rotating vinyl disc animations, tone arm movement, and ambient track color extraction.

## [5.1.0] - 2026-08-04

### 🎯 Hobbies Progression Engine & UI Overhaul

**Hobbies Progression UI**
- **SkillCard Enhancements**: Cards now display Level badges (`Lv.X`), XP amounts, XP-within-level progress bars, "X / Y XP → Lv.N+1" labels, last-learned dates, streak 🔥 badges, and pulsing green indicators for today's learning.
- **Learn Today Modal**: Added a `[ LEARN_TODAY ]` button on each card that opens a modal with minute presets, custom input, optional notes, XP preview, and session logging functionality.
- **Add Custom Skill**: Added an `+ ADD_SKILL` button to the page header, opening a modal for creating new skills with custom name, category, and priority.
- **Enhanced Stats Strip**: Upgraded the top metrics banner to display Total Skills, Total XP, Active Streaks, Minutes Studied, and Words Written.
- **Chart Resilience**: Added `NaN%` protection to the `HobbyRadialChart` average computations and center label to elegantly handle empty progress states for new skills.

**System Integrity & Core Repairs**
- **JSX Structure Fix**: Repaired a broken JSX structure in `Header.tsx` where the `NotificationBell` component was improperly defined inside the parent's return block.
- **Store State Syntax Fix**: Resolved major TypeScript errors in `dashboardStore.ts` caused by an orphaned `createdAt` assignment during `fetchDashboard`.

## [5.0.0] - 2026-08-01

### 👑 Hall of Fame Evolution (Flagship v5) + Character Directory v2 + Tokusatsu Architecture

**Flagship v5 Digital Museum Evolution**
- **Hall Statistics Overview Dashboard**: Dynamic header banner displaying total legends, GOAT status count, champions, countries represented, categories, total votes, and update status.
- **Premium Champions Podium**: 1st Place Gold Champion spotlight styling with crown 👑, ribbon, shine sweep, and gold particle aura, 2nd Place Silver 🥈, and 3rd Place Bronze 🥉.
- **Dynamic Achievement Badge System**: Auto-awarded badge matrix (*GOAT Status, Champion, 100+ Votes Club, Community Favorite, Tokusatsu Hero, Vocal Virtuoso, Multi-Talent*) rendered across cards, profile modals, and hover.
- **Rich Legend Inspection Modal (`HofProfileModal.tsx`)**: Deep profile modal featuring Overview & Badges, Ranking History timelines, Filmography/Catalog, and Note/Metric panels.
- **Side-by-Side Comparison Engine (`HofCompareModal.tsx`)**: Compare 2 to 4 legends side-by-side on portrait, status, votes, badges, and masterpieces.
- **Hall Records & Analytics Panels**: Dynamically calculated record holders (*Highest Voted Legend, Reigning Champion, Most Works Listed, GOAT Total Roster, Top Represented Nation*) and country/category breakdown charts.
- **Activity Feed Panel**: Real-time recent activity feed logging champion reigns, podium surges, and GOAT promotions.
- **Universal Context Menu Integration**: Extended contextual actions for Legend Cards (*Open Profile, Compare Legend, Heart/Vote, Favorite, Edit, Copy Link, Delete*), Podium (*Inspect Champion, Compare Top 3, Recalculate*), and Analytics.

**Universal Page-Level Context Menu Rule**
- **Permanent Project Architecture Rule**: Mandatory page context menu support across every route (`/`, `/characters`, `/hall-of-fame`, `/tokusatsu`, `/games`, `/anime`, `/drama`, `/music`, `/ai-library`, `/gallery`, `/notepad`, `/links`, `/profile`).
- **Touch Long-Press Parity Engine**: 500ms touch long-press listener for 100% desktop/mobile feature parity.

**Master Character Directory v2**
- **Master Database Experience**: Transformed `/characters` into a searchable, filterable master database across Actresses, Actors, Anime, Games, Tokusatsu, Singers, and VTubers.
- **Hero Banner & Dynamic Quick Statistics**: Displays total entries, actresses, actors, anime, game roster, Tokusatsu heroes, singers, and favorite counters calculated dynamically.
- **Advanced Category Pills & Toolbar**: Instant filtering via Category Pills, Nationality dropdown, GOAT toggle, Favorites filter, and A-Z/Popularity sorting.

**Tokusatsu Architecture**
- **Filtered View Engine**: Created `/tokusatsu` as a zero-duplication filtered view over the master database supporting subcategories for *Ultraman*, *Kamen Rider*, *Super Sentai*, *Power Rangers*, and *Metal Heroes*.

**Living Hall of Fame v2**
- **Living Ranking System**: Upgraded `/hall-of-fame` with Champions Podium, GOAT score matrix, Top 10 leaderboards, category groups, and page-level context action support.

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
