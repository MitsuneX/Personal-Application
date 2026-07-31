# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

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
