# Changelog

All notable changes to the Nexus Xenon Personal Dashboard project will be documented in this file.

## [3.5.1] - 2026-07-31

### 🐛 Bug Fixes & Engine Stability
- **Middleware Guest Routing (`proxy.ts`)**: Configured Next.js 16 proxy middleware to validate `is_guest=true` cookies alongside Supabase auth tokens, enabling seamless navigation across all protected routes without redirect loops.
- **Dev Schema Refresh (`lib/prisma.ts`)**: Implemented `getPrismaClient()` schema refresh for development hot-reloads to eliminate cached `PrismaClientValidationError` crashes (`Unknown argument userId`).
- **Neo-Brutalism Theme Parity (`app/login/page.tsx`)**: Added missing `🚀 CONTINUE AS GUEST` button with offset brutalist styling matching Cyberpunk mode parity.
- **Navigation Reliability**: Updated Guest login and Exit Guest button handlers to perform `window.location.href` redirection to ensure immediate middleware re-evaluation and clean state re-hydration.

## [3.5.0] - 2026-07-31

### 🔒 Enterprise Multi-User Architecture & Strict Data Isolation
- **Database Schema Audit & Scoping**: Added `userId` scoping with indexes (`@@index([userId])`) across all 21 user-editable Prisma models (`Game`, `AiToolItem`, `Drama`, `DramaLog`, `ProjectItem`, `Note`, `Song`, `Playlist`, `HobbySkill`, `HobbyLog`, `HallOfFame`, `Anime`, `GalleryItem`, `Link`, etc.).
- **Zero Cross-Account Data Leakage**: Guaranteed that newly registered accounts receive an isolated environment (`where: { userId: user.id }`). Accounts never see or mutate another user's personal records.
- **Automated Data Migration**: Executed `scripts/migrate_ownership.ts` to assign all pre-existing personal records to the primary owner account (`mikunakanox@gmail.com`), preserving 100% of existing ratings, screenshots, notes, and collections without data loss.

### 🎮 Non-Persisting Guest Sandbox Mode
- **One-Click Demo Access**: Added a prominent `🚀 CONTINUE AS GUEST` option to both Cyberpunk and Neo-Brutalism login screens.
- **Zero Database Pollution**: All Guest Mode operations (adding items, editing AI tools, deleting entries, uploading assets) exist strictly in-memory / client session state and **never write to PostgreSQL**.
- **Guest Banner & Exit**: Rendered a `GuestBanner` component indicating temporary sandbox mode with an `EXIT GUEST →` button to clear cookies and return to login.

### ⚡ Login UX & Navigation Improvements
- **Email Enter Focus Progression**: Hitting `Enter` in the email input field automatically shifts focus directly to the password input field for fast keyboard authentication.

### 🤖 AI Library & Games Database Expansion
- **35 Frontier AI Platforms**: Expanded AI Library to 35 fully configured entries across General AI, Coding AI, Research AI, and Search AI.
- **6 New Gaming Dossiers**: Added vector SVG icons, dossier configs, combat breakdowns, and elemental systems for GFL2, Outerplane, ToF, NIKKE, Endfield, and Honkai Impact 3rd.
