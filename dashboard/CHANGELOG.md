# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

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
