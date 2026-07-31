# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

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
