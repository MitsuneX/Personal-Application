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
    version: "v4.3.0",
    date: "2026-08-01",
    title: "Profile Popout System — Production Rebuild (Root Cause Fix)",
    badge: "PROFILE 4.3 REBUILD",
    type: "major",
    summary: "Complete architectural rebuild of the profile popout system. Replaced hover-based triggering with click-only Floating UI positioning, rebuilt ProfilePopoutCard with sticky header + internal scroll zone, fixed the GIF banner corruption root cause (useEffect re-sync bug + null vs undefined chain), and enforced single source of truth across all profile consumers.",
    categories: [
      {
        name: "New Features",
        items: [
          "🖱️ Click-only trigger: Both Sidebar and Header now use click-to-open, click-outside-to-close. No more accidental hover openings.",
          "🎯 Floating UI (@floating-ui/react): Replaced broken custom CollisionDetector — proper viewport collision, auto-flip, shift, and scroll tracking.",
          "⌨️ ESC to close: Full keyboard dismissal via Floating UI useDismiss hook.",
          "📌 Sticky Banner+Avatar header: Never scrolls away when popout body is scrolled.",
          "📜 Internal scroll zone: overflow-y-auto overscroll-contain on body — page no longer scrolls behind the popout.",
          "📐 max-h-[calc(100vh-32px)]: Popout always fully contained within the visible viewport.",
          "🔒 ProfilePopoutCard reads exclusively from useDashboardStore(s => s.profile) — no local profile copy.",
          "📊 Live statistics (Games, Anime, Drama, Favorites) computed from live Zustand state — no hardcoded mock counts.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "🔧 useEffect sync fix: AestheticsModal now syncs local state only on modal open, preventing server responses from overwriting cleared fields.",
          "🗑️ Null semantics: Clearing banner/avatar/nameplate sends null through the full chain (Modal → Store → API → Prisma → DB NULL).",
          "🌐 API fix: SAVE_AESTHETIC accepts null to clear DB columns to NULL.",
          "📦 Store fix: updateAesthetics handles null in optimistic update and server sync correctly.",
          "🏠 Cache audit confirmed: No persist middleware on profile, DB row always wins.",
        ],
      },
    ],
  },
  {
    version: "v4.2.0",
    date: "2026-08-01",
    title: "Profile Popout System Architectural Rebuild (ProfilePopoutCard.tsx)",
    badge: "PROFILE SYSTEM 4.2",
    type: "major",
    summary: "Rebuilt the entire application profile popout system into a single source of truth component (ProfilePopoutCard.tsx) featuring unoptimized animated banner GIF rendering, live store data synchronization, mini-dashboard statistics, brand-matched social links, technology stack pills, and full Neo-Brutalism & Cyberpunk theme parity.",
    categories: [
      {
        name: "New Features",
        items: [
          "👤 Single Source of Truth Component (ProfilePopoutCard.tsx): Unified all profile popover previews into a single data-driven component, eliminating hardcoded fallback names and hardcoded avatars.",
          "🎞️ Animated GIF Banner Support: Implemented unoptimized image rendering for banner URLs so animated .gif files loop smoothly at native frame rates.",
          "🔄 Live Store Synchronization: Directly bound display name, tagline, bio, avatar, banner, MBTI, Zodiac, skills, and socials to live Zustand store state.",
          "📊 Mini Personal Dashboard Stats: Integrated live derived stat cards for Games Logged, Anime Tracked, Dramas Logged, Favorites, and Profile Completion %.",
          "🎨 Dual-Theme Parity: Complete theme-adaptive styling matching Cyberpunk neon glow and Neo-Brutalist 3px black offset shadow aesthetics.",
        ],
      },
    ],
  },
  {
    version: "v4.1.0",
    date: "2026-08-01",
    title: "Punishing: Gray Raven (PGR) Full Game & Database Addition",
    badge: "PGR GAME DOSSIER 4.1",
    type: "minor",
    summary: "Added full support for Punishing: Gray Raven (PGR) to the Games page, Game Database (/heroes & /games/pgr), character classifications (Omniframe, Uniframe, Transcendant, Attacker, Tank, Support, Amplifier), element system (Physical, Fire, Ice, Lightning, Dark), statistics scanner, collection vault, editable resources, and global search indexing.",
    categories: [
      {
        name: "New Features",
        items: [
          "⚙️ Punishing: Gray Raven (PGR) Integration: Added PGR game card, official logo (pgr.svg), artwork banner, status, personal progress, and quick actions to Games HUD and Game Database.",
          "🛡️ Character Classifications & Roles: Configured support for Omniframe, Uniframe, Transcendant, Attacker, Tank, Support, and Amplifier frame categories in gameDossierConfig.ts.",
          "⚡ Element Attribute System: Configured Physical (Silver #E2E8F0), Fire (Red #EF4444), Ice (Cyan #06B6D4), Lightning (Yellow #FACC15), and Dark (Purple #A855F7) element attributes with dynamic visual tokens.",
          "🤖 Character Rosters & Data Persistence: Added initial PGR roster (Lucia: Crimson Weave, Selena: Capriccio, Bianca: Stigmata, Alpha: Crimson Abyss, Vera: Garnet, Liv: Empyrea) to owner account nelvin.claudius06@gmail.com and DB seed script.",
          "🔍 Global Search Indexing: Updated Header.tsx and CommandPalette.tsx to index PGR, elements, roles, and frame classifications.",
          "📖 Editable Resources: Configured PGR Wiki, Prydwen Tier List, and Official site resource links.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "✨ Sci-Fi Cyber Aesthetics: Added futuristic neon lines, scan-line effects, and metallic element accents for PGR pages.",
        ],
      },
    ],
  },
  {
    version: "v4.0.0",
    date: "2026-08-01",
    title: "Flagship Upgrade — Premium Personal Cinematic Dossier (/drama/[id])",
    badge: "CINEMATIC DOSSIER 4.0",
    type: "major",
    summary: "Redesigned the View Details experience for every Drama, Anime, Movie, and TV Series into a flagship full-page Cinematic Dossier (/drama/[id]) combining official metadata, dynamic cultural/genre theme accents, animated stats, character spotlight, episode navigator with watching analytics, category rating radar, memory screenshot gallery, emotional reaction timeline, markdown review editor, OST tracks, awards, and external links.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎬 Dedicated Full-Page Route (/drama/[id]): Replaced popups with a dedicated route featuring breadcrumbs (Dashboard > Drama > Title), browser history support, and shared poster transitions.",
          "🖼️ Parallax Hero Banner (DossierHero.tsx): Large backdrop image with progressive blur gradient fade, poster, title, original title, release year, country flag, studio, runtime, status badges, rating, and favorite toggle.",
          "🎨 Dynamic Cultural & Genre Accents (DossierThemeAccent.tsx): Contextual color schemes & ambient particles for Korean Romance, Korean Thriller, Korean Historical, Chinese Xianxia, Chinese Wuxia, Japanese Anime, Hollywood, Fantasy, and Horror while strictly preserving Neo-Brutalism and Cyberpunk global themes.",
          "📊 Animated Quick Stats (DossierStatsBar.tsx): Animated count-up stat cards for Episodes Watched, Total, Completion %, Days Taken, Personal Score, and Rewatch Count.",
          "📝 Official Synopsis & Plot (DossierSynopsis.tsx): Expandable synopsis drawer with smooth height transition.",
          "🧭 My Personal Watch Journey (DossierMyJourney.tsx): Owner tracking hub for watch dates, favorite episode/character, emotional episode, mood, personal score, would-rewatch flag, and inline journey editor modal.",
          "👥 Character Spotlight & Cast (DossierCharacterSpotlight.tsx): Character cards with portraits, roles, favorite badges, and character drawer popover modal.",
          "📺 Episode Navigator & Analytics (DossierEpisodeNavigator.tsx): Interactive episode grid (✓ Completed, ▶ Current) and Recharts watching analytics (episodes/day, longest session, completion %, time remaining).",
          "🎯 Multi-Category Rating Breakdown (DossierRatingRadar.tsx): 9-category rating breakdown (Story, Characters, Ending, OST, Romance, Comedy, Action, Visuals, Rewatch Value) with Recharts Radar Chart and star bars.",
          "📸 Memory Gallery (DossierMemoryGallery.tsx): Screenshot attachments with captions, episode tags, character tags, and Lightbox previewer.",
          "❤️ Emotional Journey Timeline (DossierEmotionalTimeline.tsx): Milestone timeline with emoji reactions (😊 Ep 1, 😲 Ep 5, 😭 Ep 10, 🔥 Ep 16, ❤️ Finale), notes, and date tags.",
          "✍️ Markdown Review Editor (DossierReviewEditor.tsx): Markdown personal review editor with spoiler toggle support.",
          "🎵 External Resources & Soundtracks (DossierExternalLinks.tsx): OST tracks list, awards honors, and external links buttons (IMDb, MyDramaList, Wikipedia, Netflix, Disney+, YouTube Trailer).",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "✨ Cinematic Parallax & Ambient Particles: Floating particles and backdrop blur effects customized for each drama genre.",
        ],
      },
    ],
  },
  {
    version: "v3.9.0",
    date: "2026-07-31",
    title: "Application-Wide Floating UI Overlay System & Viewport Collision Engine",
    badge: "GLOBAL OVERLAY ENGINE 3.9",
    type: "major",
    summary: "Built a shared mathematical positioning solver for trigger-attached popovers, dropdowns, tooltips, and context menus with real-time edge collision detection and automatic direction flipping, rendering into React Portal root document.body to eliminate container clipping.",
    categories: [
      {
        name: "New Features",
        items: [
          "🌐 React Portal Root (OverlayPortal.tsx): All floating UI elements, modals, dropdowns, and overlays now render directly into document.body / #overlay-root, completely eliminating clipping caused by parent overflow: hidden, overflow: auto, or transform stacking contexts.",
          "📐 Viewport Collision Engine (CollisionDetector.ts): Math engine computing raw coords, checking edge collision, flipping placements (bottom <-> top, right <-> left), and clamping bounds.",
          "🛡️ Centralized Z-Index Hierarchy (ViewportBoundary.ts): Standardized arbitrary z-index values into centralized constants (BASE, SIDEBAR, HEADER, DROPDOWN, POPOVER, DRAWER, MODAL, TOAST, TOOLTIP).",
          "📱 Mobile Adaptive Sheets (FloatingLayer.tsx): Modals, dropdowns, and context menus automatically adapt into touch-friendly bottom sheets on mobile viewports (<640px).",
          "🔄 Component Refactor: Migrated Modal.tsx, FilterDropdown.tsx, CustomSelect.tsx, ContextMenu.tsx, SettingsDropdown.tsx, CommandPalette.tsx, ProfileHoverPopover.tsx, HobbyHoverPopup.tsx, BulkActionBar.tsx, TopbarMiniPlayer.tsx, and GlobalConfirmModal.tsx to the global positioning engine.",
        ],
      },
    ],
  },
  {
    version: "v3.8.0",
    date: "2026-07-31",
    title: "Gallery Masonry/Grid/Timeline Views & Links Favicon Bookmark Cards",
    badge: "GALLERY & LINKS 3.8",
    type: "minor",
    summary: "Added 3 view modes (Masonry, Grid, Timeline) to Media Gallery with right-click ContextMenu support, and redesigned Links bookmark cards with automatic Google Favicon integration, category badges, and hover lift effects.",
    categories: [
      {
        name: "New Features",
        items: [
          "🖼️ Gallery 3 View Modes: Added toggle between Masonry (Pinterest-style variable height), Grid (fixed video aspect), and Timeline (chronological date sections).",
          "🔗 Favicon Bookmark Cards: Links bookmark cards auto-fetch site favicons via Google favicon service displayed in styled avatar pills.",
          "ContextMenu Integration: Right-clicking gallery cards opens full preview and delete actions with theme-adaptive styling.",
        ],
      },
    ],
  },
  {
    version: "v3.7.0",
    date: "2026-07-31",
    title: "Game Database Expansion, Dual-Themed FilterDropdown & Global Card Delete Engine",
    badge: "CARD MANAGEMENT & FILTERS 3.7",
    type: "minor",
    summary: "Restored Girls' Frontline 2: Exilium and added Stella Sora, Reverse: 1999, and Umamusume: Pretty Derby to PostgreSQL DB with game-specific dossier structures, launched a shared reusable dual-themed FilterDropdown component with viewport collision detection, and added global card-level Delete actions with GlobalConfirmModal persistence.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎮 4 Restored & Seeded Games: Restored Girls' Frontline 2: Exilium and added Stella Sora, Reverse: 1999, and Umamusume: Pretty Derby into PostgreSQL database for owner account with zero duplication.",
          "🎨 Custom Vector SVG Icons: Added stellasora.svg, r1999.svg, and umamusume.svg in /public/game-icons/ with title & alias normalization in gameIcons.ts.",
          "📊 Game-Specific Dossier Capabilities: Configured custom gameplay classifications (Tactical Doll Classes, Star Positions, Afflatus Types, Running Styles & Distance Aptitudes) in gameDossierConfig.ts.",
          "🎛️ Dual-Themed FilterDropdown (FilterDropdown.tsx): Created a shared reusable popover component supporting option groups, active checkmarks, viewport bottom collision detection, click-outside and Escape key handlers for both Cyberpunk and Neo-Brutalist themes.",
          "🗑️ Global Card-Level Delete Action: Integrated consistent card-level Delete buttons (🗑️) with GlobalConfirmModal across AI Library, Visits/Projects, Games Library, Game Database, Drama, Characters Directory, and Prompt Vault.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "✨ Dual-Theme Aesthetic Parity: Ensured all FilterDropdown popovers and Delete confirm modals match Cyberpunk neon glow and Neo-Brutalism offset shadow themes.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "🔒 Database Deletion Sync: Card deletions optimistically filter client Zustand state and send persistent delete actions to PostgreSQL API endpoints.",
        ],
      },
    ],
  },
  {
    version: "v3.6.0",
    date: "2026-07-31",
    title: "Account Switching Synchronization & Theme-Adaptive Password Recovery",
    badge: "ACCOUNT SYNC & RECOVERY 3.6",
    type: "minor",
    summary: "Eliminated the hard-refresh requirement during account switching by introducing instant store resetting & sequence-aware API request handling, while launching full theme-adaptive Forgot Password & Reset Password flows.",
    categories: [
      {
        name: "New Features",
        items: [
          "🔑 Theme-Adaptive Forgot Password: Added 'Forgot Password?' recovery trigger to Sign In interfaces in both Cyberpunk and Neo-Brutalist themes with dedicated reset email dispatching.",
          "🔒 Password Reset Portal (/auth/reset-password): Launched standalone password reset page with full Cyberpunk neon HUD and Neo-Brutalist offset shadow UI themes.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "⚡ Instant Account Switching: Added resetUserStore() to Zustand store to invalidate and clear previous account state instantly upon logout or user change.",
          "🛡️ Race Condition Protection: Implemented requestSequenceId counter in fetchDashboard() so late API responses from previous sessions are automatically ignored.",
          "🔄 Auth State Synchronization (AuthProvider.tsx): Updated onAuthStateChange listener to trigger store reset and user-scoped data re-hydration on SIGNED_IN, SIGNED_OUT, and USER_CHANGED events.",
        ],
      },
    ],
  },
  {
    version: "v3.5.1",
    date: "2026-07-31",
    title: "Guest Mode Middleware Routing, Dual Theme UI Parity & Dev Schema Sync Fix",
    badge: "GUEST ROUTING & FIXES 3.5.1",
    type: "patch",
    summary: "Resolved proxy middleware Guest session routing, added missing Continue as Guest button to Neo-Brutalist login theme, and upgraded Prisma singleton instantiation to eliminate development schema validation crashes.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "🌐 Middleware Guest Authorization (proxy.ts): Configured proxy middleware to recognize is_guest cookie and allow seamless navigation across all protected routes without redirect loops.",
          "⚡ Dev Schema Refresh (lib/prisma.ts): Fixed cached Prisma singleton validation error (Unknown argument userId) by implementing getPrismaClient() schema refresh for local dev hot-reloads.",
          "🎨 Neo-Brutalism Theme Parity (app/login/page.tsx): Added the missing '🚀 CONTINUE AS GUEST' button with offset brutalist styling matching Cyberpunk mode parity.",
          "🔄 Navigation Reliability: Switched Guest login and Exit Guest actions to window.location.href to trigger full middleware re-evaluation and clean state re-hydration.",
        ],
      },
    ],
  },
  {
    version: "v3.5.0",
    date: "2026-07-31",
    title: "Multi-User Enterprise Architecture, Guest Sandbox Mode & Major AI/Games Expansion",
    badge: "MULTI-USER & GUEST MODE 3.5",
    type: "major",
    summary: "Architected a full multi-user SaaS platform with strict user data isolation, database-level userId scoping across 21 models, a zero-persistence Guest Sandbox Mode, keyboard input navigation enhancements, 35 frontier AI tools, and 6 new gaming dossiers.",
    categories: [
      {
        name: "New Features",
        items: [
          "🔒 Strict User Data Isolation: Added userId scoping and database indexing across all 21 Prisma models. Server-side API filtering guarantees new accounts start with clean, isolated personal environments.",
          "🚀 One-Click Guest Sandbox Mode: Added instant demo access on both Cyberpunk and Neo-Brutalist login screens with zero database persistence. All guest session modifications take place in-memory.",
          "🚩 Persistent Guest Banner: Displays active sandbox mode indicator with an 'EXIT GUEST →' button to clear guest cookies and return to login.",
          "⚡ Keyboard Navigation: Pressing Enter in the login email field automatically moves focus directly to the password input field.",
          "🎮 6 New Gaming Dossiers: Added Girls' Frontline 2: Exilium, Outerplane, Tower of Fantasy, Goddess of Victory: NIKKE, Arknights: Endfield, and Honkai Impact 3rd with custom SVG icons, combat role breakdowns, and elemental systems.",
          "🤖 35 Frontier AI Platforms: Expanded default AI collection to 35 well-known platforms across General AI, Coding AI, Research AI, and Search AI.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Prisma Schema & Database Ownership: Updated schema.prisma with userId columns and indexes across all models. Executed migration script to transfer pre-existing records to primary owner account.",
          "API & Security Audit: Updated /api/dashboard and /api/action with user ownership verification and guest mode short-circuiting.",
        ],
      },
    ],
  },
  {
    version: "v3.4.0",
    date: "2026-07-31",
    title: "AI Library Upgrade: Personal AI Collection & Knowledge Hub",
    badge: "AI KNOWLEDGE HUB 3.4",
    type: "minor",
    summary: "Transformed AI Library (/ai-library) into a personal AI collection & knowledge hub with star ratings, usage status tracking (Daily, Weekly, Occasional, Rarely), multi-tag workflow strengths, multi-line personal evaluations, automatic launch tracking, a dedicated detail view modal, and multi-criteria sorting & filtering.",
    categories: [
      {
        name: "New Features",
        items: [
          "🧠 Personal Knowledge Hub: Added star ratings (1-5★), editable usage statuses (Daily, Weekly, Occasional, Rarely, Experimental), AI strengths tag cloud (Coding, Reasoning, Frontend, Writing, Math), and multi-line workflow evaluations.",
          "👁️ AI Detail View Modal (AiToolDetailModal.tsx): Dedicated detail modal showing full AI evaluations, strengths tag cloud, usage analytics, relative last used time, and developer resources (Website, Docs, API, Pricing, GitHub, Discord, Forum, Blog, Roadmap, YouTube).",
          "⏱️ Automatic Launch Analytics: Clicking '🚀 Launch Platform' automatically updates the lastUsed timestamp and increments launchCount in the database.",
          "📊 Multi-Criteria Sorting & Filtering: Filter by Category, Usage Status, Star Rating, Strengths tags, and Pricing Model. Sort by Recently Used (Last Used), Highest Rated, Most Launched, Alphabetical, or Display Order.",
          "🔍 Search Indexing Upgrade: Extended searchRegistry.ts to index AI strengths tags, personal notes, company developer names, ratings, and usage statuses.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Prisma Schema Upgrade: Extended AiToolItem model with usageStatus, rating, strengths, notes, lastUsed, launchCount, blogUrl, roadmapUrl, and youtubeUrl.",
          "Backend & Store Synchronization: Added RECORD_AI_TOOL_LAUNCH action handler in /api/action alongside Zustand store sync.",
        ],
      },
    ],
  },
  {
    version: "v3.3.0",
    date: "2026-07-31",
    title: "AI Library Personal Directory, Fast Launcher & Search Integration",
    badge: "AI LIBRARY 3.3",
    type: "minor",
    summary: "Launched the AI Library (/ai-library) module directly below Visit in the MAIN sidebar navigation. Serves as a personal collection, launcher, and resource directory for external AI tools and models (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Cursor, etc.) with custom branding accents, configurable quick action buttons, and automatic global search indexing.",
    categories: [
      {
        name: "New Features",
        items: [
          "🤖 AI Library Portal (/ai-library): Added personal AI directory and fast launcher organizing external AI platforms, desktop tools, documentation, API keys, pricing, and developer community links.",
          "🤖 Sidebar Placement: Inserted 'AI Library' directly BELOW 'Visit' in the MAIN sidebar navigation section.",
          "🚀 Fast Launch Engine: Configurable primary '🚀 Launch Platform' button with brand-accented hover styling alongside resource action links (Website, Docs, API, Pricing, GitHub, Discord, Forum, Notes).",
          "🎨 Brand-Driven Accent System: Per-card configurable accent colors (ChatGPT green, Claude orange, Gemini blue, Perplexity teal, DeepSeek blue, Cursor cyan, Windsurf blue, Bolt purple, Lovable pink, Copilot gray).",
          "🔍 Dynamic Search Provider: Registered aiTools into searchRegistry.ts so AI entries automatically become searchable via Ctrl + K navbar search with direct launch navigation.",
          "🛠️ AI Tool Editor Modal: Full management modal for Add, Edit, Delete, Archive, Logo Upload, Branding Accent selection, Pricing Model, and Quick Resource Links.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Prisma Model Addition: Added AiToolItem model to schema.prisma with PostgreSQL database synchronization via npx prisma db push.",
          "API & Store Integration: Updated /api/dashboard and /api/action with UPDATE_AI_TOOL and DELETE_AI_TOOL action handlers alongside Zustand store persistence.",
        ],
      },
    ],
  },
  {
    version: "v3.2.0",
    date: "2026-07-31",
    title: "Global Search Engine Architecture, Visit Project Hub & Motion System Overhaul",
    badge: "GLOBAL SEARCH & VISIT HUB",
    type: "minor",
    summary: "Introduced a centralized Search Registry engine enabling modular indexing across all application modules, added Visit directly below Dashboard in the sidebar navigation, launched the Visit Project Hub portfolio showcase system with complete project management capabilities, and refined Framer Motion system transitions across all dialogs and navigation components.",
    categories: [
      {
        name: "New Features",
        items: [
          "🌐 Visit Project Hub (/visit): Launched a central project showcase hub displaying personal codebases, deployed services, tech stack pills, version tags, status indicators, and configurable action buttons.",
          "🌐 Sidebar Navigation Update: Added permanent 'Visit' navigation item directly below Dashboard in the MAIN sidebar section.",
          "🔍 Centralized Search Registry Engine (searchRegistry.ts): Created an expandable search provider registry architecture indexing Visit Projects, Game Database, Statistics Scanner, Showcase Gallery, Bookmarks, Notes, Anime, Dramas, Songs, Hall of Fame, Characters, Gallery, Prompts, Hobbies, and Profiles.",
          "🛠️ Project Editor Modal: Management interface supporting Add, Edit, Delete, Archive, Logo & Banner uploads, Tech Stack tagging, and customizable quick action link buttons (Website, GitHub, Docs, Figma, Admin, Staging, Download).",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "Motion System Overhaul: Refined spring easings, card entrance staggers, tab indicator motion, hover micro-interactions, and modal backdrop animations across both Neo-Brutalism and Cyberpunk themes.",
          "Dual Theme Excellence: Full responsive support for Neo-Brutalism offset shadow borders and Cyberpunk glowing neon HUD elements across viewports from 320px up to 1440px+.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Prisma Schema Addition: Added ProjectItem database model with PostgreSQL sync via npx prisma db push.",
          "API & Store Synchronization: Extended /api/dashboard and /api/action with UPDATE_PROJECT and DELETE_PROJECT handlers alongside Zustand dashboardStore sync.",
        ],
      },
    ],
  },
  {
    version: "v3.1.0",
    date: "2026-07-31",
    title: "Game Database Major Enhancement: Statistics Scanner & Showcase Gallery",
    badge: "GAME DOSSIER 3.1",
    type: "minor",
    summary: "Renamed Character Intelligence Roster to 📊 Statistics Scanner, introduced a brand new 🖼 Showcase Gallery section for archiving personal game achievements and pull screenshots, and upgraded game dossier category cards to a configuration-driven visual token architecture supporting authentic game identities across Neo-Brutalism and Cyberpunk themes.",
    categories: [
      {
        name: "New Features",
        items: [
          "📊 Statistics Scanner: Renamed section while keeping all AI screenshot OCR extraction, character level/winrate tracking, and auto-import features intact.",
          "🖼 Showcase Gallery: Added dedicated showcase memory section directly below Statistics Scanner supporting image uploads, titles, descriptions, categories, tags (#Luck, #Achievement, #Build, #PvP, #Boss), and ⭐ Pinned favorites.",
          "🖼️ Lightbox Modal Integration: Clicking any showcase image opens the existing fullscreen ImageLightboxModal with zoom and smooth backdrop dismiss.",
          "Showcase Editor Modal: Custom modal supporting image file uploads, image URL input, category dropdown, tag suggestions, and instant database synchronization.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "Config-Driven Category Themes: Upgraded Category Breakdown & Element System cards to use rich visual tokens (gradient, glow, border, badgeBg, badgeText, progressColor) defined per game in gameDossierConfig.ts.",
          "Authentic Game Identities: Tailored element/role identities for Genshin Impact, Wuthering Waves, Honkai: Star Rail, Mobile Legends, Valorant, Arknights, Dragon Ball Legends, and future games.",
          "Dual Theme Excellence: Full responsive support for both Neo-Brutalism offset shadow style and Cyberpunk glowing glassmorphism aesthetic across desktop, tablet, and mobile viewports.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "Prisma Schema Addition: Added GameShowcaseItem model linked with Game via onDelete: Cascade.",
          "API & Store Sync: Extended /api/dashboard and /api/action routes alongside Zustand dashboardStore with addGameShowcaseItem, updateGameShowcaseItem, and removeGameShowcaseItem actions.",
        ],
      },
    ],
  },
  {
    version: "v3.0.2",
    date: "2026-07-31",
    title: "Modal Main Content Area Horizontal Centering Engine Fix",
    badge: "MODAL LAYOUT FIX",
    type: "patch",
    summary: "Fixed a positioning calculation bug where viewport-fixed modals appeared visually shifted toward the left when the desktop sidebar was expanded. Modals now dynamically calculate padding-left from the AppShell CSS custom property var(--sidebar-width, 0px), placing all dialogs in the exact visual center of the usable main content area whether the sidebar is expanded (240px), collapsed (78px), transitioning, or on mobile (0px).",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Modal Horizontal Centering: Added dynamic paddingLeft using calc(var(--sidebar-width, 0px) + offset) to modal.tsx, ResourceEditorModal, ChangelogModal, and CommandPalette overlays.",
          "Sidebar Expansion Sync: Modals remain perfectly centered within the usable main content area whether sidebar is expanded (240px) or collapsed (78px).",
          "Sidebar Animation Transition: Added smooth CSS cubic-bezier padding-left transition in tandem with sidebar width spring animation to eliminate visual jump during sidebar toggle.",
          "Mobile & Tablet Continuity: Preserves zero-offset 100% viewport centering on mobile devices (<768px) where sidebar width is 0px.",
        ],
      },
    ],
  },

  {
    version: "v3.0.1",
    date: "2026-07-30",
    title: "Global Modal System Audit & Responsive Architecture Overhaul",
    badge: "MODAL RESPONSIVE ENGINE",
    type: "patch",
    summary: "Comprehensive audit and responsive bug-fix pass for all popup, modal, dialog, and overlay components. Upgraded base Modal architecture to a flex-column flex-1 structure with overscroll-contain, preventing double-scroll bars and dropdown clipping. Fixed mobile field grid layouts across Edit Game, Character Editor, Profile Editor, Manual Anime/Drama, HOF Editor, and Search modals across desktop, tablet, and mobile viewports down to 320px.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Modal Base Architecture: Upgraded modal.tsx card container to flex-col max-h-[92vh] flex-1 structure so child containers manage scrollable regions cleanly.",
          "Double-Scroll Nesting Fix: Eliminated redundant inner max-h-[82vh] overflow-y-auto wrappers in GameEditorModal, ManualAnimeModal, and ManualDramaModal.",
          "CustomSelect Dropdown Clipping: Raised CustomSelect dropdown z-index to z-[9999], ensuring select menus overflow cleanly above modal card boundaries.",
          "ProfileEditorModal Structure Fix: Removed duplicated code blocks and added proper flex-1 scrollable body wrapper.",
          "Anime & Drama Search Modals: Removed hardcoded max-h-[60vh] constraint so search results expand to fill available modal viewport height dynamically.",
          "Aesthetics & HOF Editor Modals: Converted rigid max-height wrappers to flex-1 overscroll-contain scrollable containers.",
          "Command Palette Mobile Layout: Adapted top padding (pt-6 sm:pt-[12vh]) for comfortable viewing on short mobile screens.",
        ],
      },
      {
        name: "PWA & Mobile",
        items: [
          "Mobile Input Grid Responsiveness: Replaced fixed grid-cols-2 in form modals with grid-cols-1 sm:grid-cols-2 to prevent input field cramping on 320px–480px viewports.",
          "Touch & Scroll Stability: Added overscroll-contain and scrollbar-thin to modal scroll bodies to prevent background page scroll bleed on mobile touch devices.",
          "Fullscreen Lightbox Preservation: Verified ImageLightboxModal profile screenshot viewer with 0 regressions.",
        ],
      },
    ],
  },

  {
    version: "v3.0.0",
    date: "2026-07-30",
    title: "Game Database Full System Upgrade",
    badge: "GAME DB 3.0",
    type: "major",
    summary: "Major Game Database overhaul: fixed sidebar active state routing for Game Database vs Games, fixed back button to return to Game Database Hub, added per-game Element/Attribute system (Genshin, WuWa, HSR, ZZZ, DBL), added configurable External Resource system with add/edit/delete/open per game, added GameExternalResource Prisma model, Zustand store integration, and API handlers. All features support both Neo-Brutalism and Cyberpunk themes with full mobile/tablet/desktop responsiveness.",
    categories: [
      {
        name: "New Features",
        items: [
          "Sidebar Active State Fix: /heroes and /heroes/[gameId] now correctly highlight 'Game Database' instead of 'Games'; /games uses exact matching.",
          "Back Button Fix: Individual Game Dossier now navigates back to Game Database Hub (/heroes) instead of /games.",
          "Game Element System: Per-game element/attribute config with sectionLabel, icon, color, and description per element.",
          "Genshin Impact Elements: Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo — each with color accent and reaction description.",
          "Wuthering Waves Resonance Attributes: Glacio, Fusion, Electro, Aero, Spectro, Havoc — distinct from Genshin.",
          "HSR Combat Elements: Fire, Ice, Wind, Lightning, Quantum, Imaginary, Physical.",
          "ZZZ Attributes: Physical, Fire, Ice, Electric, Ether.",
          "Dragon Ball Legends Battle Attributes: RED/BLU/GRN/YEL/PUR color triangle system.",
          "Games without element systems (Mobile Legends, Valorant, Arknights) do NOT show element section.",
          "External Resource System: Per-game configurable links with name, URL, icon, category, description, enabled/disabled state.",
          "Resource Add/Edit/Delete: Inline editor modal with URL validation, category selector, enabled toggle.",
          "Resource Open: External links open in new tab with rel=noopener noreferrer; malformed URLs are blocked.",
          "Game Capability Config: Unified GameCapabilityConfig replaces GameDossierConfig — element system, resource presets, all in one scalable config.",
          "Default Resource Presets: Mobile Legends (Current Meta, Hero Details), HSR (Prydwen Tier List), Valorant (Tracker Network), Genshin (Game8).",
          "GameExternalResource Prisma model: id, gameId, name, url, icon, category, description, enabled, sortOrder, onDelete Cascade.",
          "Zustand store: gameResources state, addGameResource, updateGameResource, removeGameResource actions.",
          "API: UPDATE_GAME_RESOURCE and DELETE_GAME_RESOURCE handlers in /api/action; gameResources in /api/dashboard payload.",
          "Wuthering Waves config added (Resonator, DPS/Sub DPS/Support/Healer categories).",
          "Dragon Ball Legends config added (Fighter types, Battle Attributes).",
          "Arknights config added (8 operator classes: Guard/Defender/Sniper/Caster/Medic/Supporter/Specialist/Vanguard).",
          "HSR Paths expanded: Remembrance and Elation paths added.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "External Resources section: compact grid (1→2→3→4 col) with icon, name, category badge, description, open button.",
          "Elements section: auto-scales from 2-col mobile to 7-col desktop with element color accents and character counts.",
          "Resource Editor Modal: dual-theme (Neo-Brutalism/Cyberpunk) with name, URL, icon, category, description, enabled toggle.",
          "Disabled resources show at reduced opacity; open button only shown for enabled resources.",
          "Edit/Delete buttons appear on hover (desktop) and always-on (mobile) per card.",
          "Empty resource state shows informative prompt instead of empty row.",
          "Back button label changed to 'Back to Game Database' on individual Dossier pages.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "NavLink activePrefixes prop: allows /heroes to activate Game Database nav item without polluting /games matching.",
          "NavLink exact prop for /games: prevents /games/[id] from activating Games nav item.",
          "Prisma schema: GameExternalResource model with onDelete Cascade on gameId.",
          "TypeScript: 0 errors after prisma generate and full tsc --noEmit check.",
          "URL validation (isValidUrl) prevents malformed link crashes in resource open button.",
        ],
      },
    ],
  },

  {
    version: "v2.9.1",
    date: "2026-07-30",
    title: "Direct Game Database Card Navigation Sync",
    badge: "GAME DB ROUTING",
    type: "patch",
    summary: "Updated all game cards in the Games Library container to link directly to their corresponding Game Database page (/games/[gameId]), allowing instant interaction with hero rosters, character editors, and AI screenshot scanners for that specific game.",
    categories: [
      {
        name: "UI & Aesthetics",
        items: [
          "Games Library Navigation Sync: Each game card button in /games now directly points to its dedicated Game Database (/games/[gameId]) page.",
          "Targeted Game Context: Directs users straight to the interacted game so they can add characters, edit details, or run AI screenshot scans immediately.",
        ],
      },
    ],
  },
  {
    version: "v2.9.0",
    date: "2026-07-30",
    title: "AI Screenshot Scanner & Game Data Import System",
    badge: "AI VISION ENGINE",
    type: "major",
    summary: "Implemented an AI/OCR screenshot scanning engine and review modal for the Game Database architecture. Supports Option B workflow (Screenshot -> AI Extraction -> User Review & Confirmation -> Database Persistence) with game-aware extraction rules for Mobile Legends, HSR, Valorant, Genshin, and generic titles.",
    categories: [
      {
        name: "New Features",
        items: [
          "Game-Aware Screenshot Scanner Engine (lib/data/gameScannerEngine.ts): Parses game statistics screenshots (PNG, JPG, WEBP) and maps extracted values into game-aware categories (MOBA lanes, HSR paths, Valorant roles, Genshin elements).",
          "Option B User Review Workflow (components/ui/GameScannerModal.tsx): Presents extracted values with clear status indicators (Detected, Needs Review, Not Found) allowing full manual editing prior to database persistence.",
          "Laser Beam Scan Animation: Added Framer Motion laser beam scan effect over preview images during analysis.",
          "Duplicate Import Protection: Detects existing character entries in the game's dossier and warns the user before updating.",
          "Dual Theme & Responsive Modal: Full Neo-Brutalism and Cyberpunk styling on Desktop, Tablet, and Mobile.",
        ],
      },
    ],
  },
  {
    version: "v2.8.0",
    date: "2026-07-30",
    title: "Reusable Game Database & Game Dossier System Architecture",
    badge: "GAME DOSSIER ENGINE",
    type: "major",
    summary: "Transformed the Heroes section into a game-aware Game Database & Game Dossier system. Every game in the Games Library automatically gains a rich, game-aware dossier (/games/[gameId]) driven by a reusable category engine (MOBA Lanes, HSR Paths, Valorant Roles, Genshin Combat Roles) and Prisma database persistence.",
    categories: [
      {
        name: "New Features",
        items: [
          "Game Dossier Dynamic Routing (/games/[gameId]): Clicking any game card in the Games Library opens its dedicated Game Dossier page displaying game identity, stats matrix, category breakdown, and hero/agent rosters.",
          "Game-Aware Category Configuration (lib/data/gameDossierConfig.ts): Dynamically adapts categories based on game type (MOBA EXP/Jungle/Mid/Gold/Roam, HSR Paths of Destruction/Hunt/Harmony, Valorant Duelist/Controller/Initiator/Sentinel, Genshin Combat Roles).",
          "Automatic Game Dossier Creation: Adding any game to the Games Library automatically activates its Game Dossier without needing new database tables, routes, or manual setup.",
          "GameDossierCharacter Schema & Persistence: Created GameDossierCharacter model in Prisma schema linked by gameId with full CRUD sync (/api/action) and Zustand state management.",
          "Game Database Overview Hub (/heroes): Reframed /heroes into a master Game Database Hub displaying game dossier cards and global roster search.",
        ],
      },
    ],
  },
  {
    version: "v2.7.3",
    date: "2026-07-30",
    title: "Automatic Game Icon Recognition System & Public Vector Asset Engine",
    badge: "GAMES HUD UPGRADE",
    type: "patch",
    summary: "Integrated a deterministic title normalization and alias matching engine (lib/data/gameIcons.ts) backed by project-local SVG assets in /game-icons/, automatically rendering official game logos while preserving custom icon overrides and Prisma DB persistence.",
    categories: [
      {
        name: "New Features",
        items: [
          "Automatic Title Recognition: Normalizes game names (handling colons, hyphens, capitalization, and whitespace) to match canonical titles and aliases for Honkai: Star Rail, Genshin Impact, MLBB, Valorant, ZZZ, Wuthering Waves, League of Legends, DBL, Arknights, FGO, etc.",
          "Project-Local SVG Assets: Stored stable static vector SVG assets in /public/game-icons/ for 100% offline reliability, instant rendering, and zero broken links.",
          "Strict 3-Tier Resolution Priority: Custom User Upload Override → Auto-Recognized Game Icon → Default Category Fallback.",
        ],
      },
    ],
  },
  {
    version: "v2.7.2",
    date: "2026-07-30",
    title: "Application-Wide Mobile & Tablet Responsive Audit Fix",
    badge: "RESPONSIVE PARITY",
    type: "patch",
    summary: "Audited and resolved responsive issues across all pages, ensuring action buttons, edit/delete controls, location metadata, lyrics, and mini-players remain 100% accessible on touch devices, mobile viewports (320px-480px), and tablets (600px-834px).",
    categories: [
      {
        name: "PWA & Mobile",
        items: [
          "Touch Device Action Visibility: Updated hover-dependent action containers (Games ⚙️, Hall of Fame ✏️/🗑️, Bookmarks ✏️/🗑️, Gallery ✕) to remain permanently visible on touch/mobile viewports (opacity-100 md:opacity-0 md:group-hover:opacity-100).",
          "Mobile Controls & Player Parity: Unhidden Lyrics button and volume controls in GlobalMusicPlayer and TopbarMiniPlayer on mobile screen widths.",
          "Profile Location Tag: Restored profile location tag visibility on mobile and tablet cards in ProfileCard.",
        ],
      },
    ],
  },
  {
    version: "v2.7.1",
    date: "2026-07-30",
    title: "Fullscreen Lightbox Viewport & Sidebar Alignment Fix",
    badge: "LAYOUT BUG FIX",
    type: "patch",
    summary: "Fixed fullscreen Lightbox modal viewport calculation by exporting dynamic --sidebar-width CSS variable from AppShell, perfectly centering lightbox content within the active viewport, and anchoring zoom controls inside the modal viewer frame.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "Sidebar-Aware Viewport Alignment: Lightbox modal now dynamically offsets its content viewport using --sidebar-width, aligning seamlessly across desktop expanded (240px), collapsed (78px), and mobile drawer (0px) states.",
          "Anchored Control Toolbar: Zoom controls ([-] 100% [+]) and close button (✕) are anchored to the modal viewer UI header and footer bars, preventing floating or misalignment during zoom and drag pan.",
        ],
      },
    ],
  },
  {
    version: "v2.7.0",
    date: "2026-07-30",
    title: "Optional Game Card Landscape Screenshot & Interactive Fullscreen Lightbox",
    badge: "GAMES LIBRARY UPGRADE",
    type: "minor",
    summary: "Added optional landscape screenshot support to Game Cards in the Games Library with a seamless upload workflow in Game Settings and a responsive fullscreen interactive Lightbox modal.",
    categories: [
      {
        name: "New Features",
        items: [
          "Optional Landscape Screenshot Insertion: Game cards optionally display a ~16:9 landscape profile screenshot between the HUD matrix blocks and bottom buttons without altering card width or compact layouts.",
          "Seamless Upload Workflow: Upload PNG, JPG, JPEG, or WEBP screenshot files or paste image URLs directly inside the existing Game Settings modal with live preview and instant removal.",
          "Fullscreen Responsive Image Lightbox: Clicking screenshots launches a smooth Framer Motion Lightbox modal with backdrop blur, ESC & backdrop close handlers, interactive zoom controls (wheel & pinch), and pan/drag while zoomed.",
          "Full Dual-Theme Aesthetics: Styled custom screenshot containers and Lightbox overlays tailored for both Neo-Brutalism (hard black borders, offset shadows) and Cyberpunk (cyan neon glow, backdrop blur, Orbitron font).",
        ],
      },
    ],
  },
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
