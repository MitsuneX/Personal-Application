# Nexus Xenon Workspace (Full Stack Personal Application)

Welcome to the **Nexus Xenon Workspace**, a fully dynamic, database-driven personal dashboard built with **Next.js 16 (App Router)**, **React 19**, **Prisma**, **Supabase (PostgreSQL)**, and **Zustand**. 

This application serves as a comprehensive hub for tracking games, anime, dramas, hobbies, notes, and music, wrapped in an extremely premium "Cyber Brutalism" dynamic UI/UX design.

---

## 📂 Project Structure & Code Navigation Guide

This guide will help you find exactly where everything is located, rendered, and managed in the codebase.

### 1. 🗂️ Core App Routes (`/app`)
The `app/` directory contains all the pages. Each feature has its own folder.

- **`app/page.tsx`** - The root redirect or landing page.
- **`app/games/page.tsx`** - **Game Registry**. 
  - *Games Grid Rendering:* Look around **Line 180-200** (`<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">`).
  - Uses the `GameDBCard` component for each item.
- **`app/anime/page.tsx`** - **Anime Zone**. Tracks watched anime and favorite characters.
- **`app/drama/...`** - **Drama Vault**. Separated into sub-routes (`/chinese`, `/korean`, `/japanese`, `/hollywood`).
- **`app/hall-of-fame/page.tsx`** - **Hall of Fame**. Grid for favorite actors, actresses, and top-tier anime.
- **`app/hobbies/page.tsx`** - **Skill Tree / Hobbies**. Uses Recharts to render progression charts.
- **`app/prompt-vault/page.tsx`** - **Prompt Vault**. A grid system for saving and copying AI prompts.
- **`app/gallery/page.tsx`** - **Gallery**. Displays uploaded images using a dynamic masonry-style layout.
- **`app/music/page.tsx`** - **Music Player**.
- **`app/notepad/page.tsx`** - **Notepad / Workspace**.
- **`app/links/page.tsx`** - **Quick Links**.

### 2. 🧩 UI Components (`/components`)
All reusable visual pieces are stored here, split into logical categories.

#### `/components/cards/` (Individual Grid Items)
- **`GameDBCard.tsx`** - The card UI used in the Games Grid. Handles the hover neon effects and rank badges.
- **`AnimeZoneCard.tsx`** - Card UI for Anime lists.
- **`MediaLogCard.tsx`** - Card UI for Dramas/Movies.
- **`ProfileCard.tsx`** - The main user profile card (Avatar, bio, skills).

#### `/components/ui/` (Modals, Popovers, & Shared Elements)
- **`GameEditorModal.tsx`** - The modal form that pops up when you click "+ Add New Title" or "Edit" on a Game card.
- **`HofEditorModal.tsx`** - Modal for editing Hall of Fame entries (includes image cropping logic).
- **`AestheticsModal.tsx`** - The global theme/profile customization modal (Avatar upload, GIF banner search, Accent Color picker).
- **`ProfileHoverPopover.tsx`** - The tiny popup that appears when hovering the "Online" status dot in the Topbar.
- **`AnimeSearchModal.tsx` & `DramaSearchModal.tsx`** - Modals connected to external APIs (Jikan/OMDb) to search and add media.
- **`TopLoader.tsx`** - The thin progress bar at the top of the page when navigating between routes.

#### `/components/layout/` (Structure)
- **`AppShell.tsx`** - The master layout wrapper containing the Sidebar, Header, and Page Content.
- **`Sidebar.tsx`** - The left-side navigation menu.
- **`Header.tsx`** - The top bar containing the route title, stats (counts), and the Online status dot.
- **`PageWrapper.tsx`** & **`PageTransition.tsx`** - Handles Framer Motion enter/exit page animations.

#### `/components/charts/` (Data Visualization)
- **`HobbyRadialChart.tsx`**, **`HobbyAreaChart.tsx`**, **`SparklineChart.tsx`** - Recharts configurations used in the Hobbies/Skill Tree page.

### 3. ⚙️ State Management & Data Fetching
- **`lib/store/dashboardStore.ts`** - The **Zustand** global state. It holds all the data (games, anime, profile, theme). Look here for the `updateProfile`, `addGame`, or `setTheme` functions.
- **`app/api/dashboard/route.ts`** - The main initialization API. When the app loads, it fetches *everything* from PostgreSQL and sends it to the Zustand store.
- **`app/api/action/route.ts`** - The generic POST/PUT/DELETE API route handling all CRUD database operations (e.g., adding a game, deleting a note).
- **`app/api/upload/route.ts`** - Handles local file uploads (avatars, banners, cropped images) and saves them to `/public/uploads`.
- **`app/api/gif/search/route.ts`** - Proxy API for searching Tenor GIFs.

### 4. 🗃️ Database (Prisma + Supabase)
- **`prisma/schema.prisma`** - Contains the database blueprint. If you want to see what fields a `Game` or `Profile` has, look here.
- **`lib/prisma.ts`** - The instantiated Prisma Client using the `@prisma/adapter-pg` edge-compatible driver.

---

## 🚀 How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure you have `.env` and `.env.local` configured with your Supabase `DATABASE_URL` and `DIRECT_URL`.

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🎨 Theme System (Cyber vs Brutal)
The app relies heavily on a dynamic styling approach. Throughout the components, you will often see ternary operators like:
`isCyber ? "cyber-style" : "brutal-style"`
- **Cyber**: Glassmorphism, neon shadows, gradients (`#00F5FF`, `#FF00FF`).
- **Brutal**: Solid black borders (`2px solid #000`), hard shadows (`3px 3px 0 #000`), flat colors. 

This state is globally managed in `dashboardStore.ts` via the `theme` variable.
