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
    version: "v5.5.0",
    date: "2026-08-06",
    title: "Emergency Hub Module & Shared AppShell Integration",
    badge: "EMERGENCY & LAYOUT INTEGRATION",
    type: "major",
    summary: "Launched the priority Emergency Hub module (/emergency) with 1-click calls, WhatsApp, email, maps, multi-format import/export (vCard, CSV, JSON), private emergency notes, right-click context menu engine, and full shared AppShell dashboard integration.",
    categories: [
      {
        name: "New Features",
        items: [
          "🚨 Emergency Hub Center (/emergency): Priority contact roster positioned directly under AI Library in the sidebar.",
          "📞 1-Click Communication Triggers: Direct actions for Call (tel:), WhatsApp (wa.me), Email (mailto:), Web, and Google Maps location navigation.",
          "📇 Multi-Format Import / Export Engine: Import & export contacts via vCard (.vcf), CSV spreadsheet, and JSON formats.",
          "📝 Private Emergency Notes: Modal viewer for emergency instructions, allergy alerts, gate passcodes, and preferred ER hospital details.",
          "🖱️ Context-Aware Right-Click Menu: Full right-click context menu engine for contact cards and empty canvas space.",
        ],
      },
      {
        name: "UI & Aesthetics",
        items: [
          "🖼️ Shared AppShell Layout Integration: Integrated Emergency Hub inside AppShell, maintaining Sidebar, Top Navbar, Global Music Player, and Theme controls.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "🗄️ Prisma Self-Healing Delegates: Updated lib/prisma.ts with auto-recovery for newly generated schema models in dev mode.",
          "💧 Hydration & Script Hygiene: Resolved date hydration mismatches with UTC date extractions and migrated inline scripts to Next.js <Script>.",
        ],
      },
    ],
  },
  {
    version: "v5.4.0",
    date: "2026-08-05",
    title: "Music Vault Phase 5 Expansion — Queue Panel, Analytics & Collections",
    badge: "MUSIC VAULT EXPANSION",
    type: "major",
    summary: "Expanded Music Vault with a dedicated Queue Panel, Music Analytics Dashboard, Collection Manager with full CRUD, Media Session API integration, and global hotkeys.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎵 Music Queue Manager (MusicQueuePanel.tsx): Reorder queue tracks, clear queue, play next, and remove single items.",
          "📊 Music Analytics Dashboard (MusicAnalyticsDashboard.tsx): Track top played artists, most played tracks, listening streaks, and category breakdowns.",
          "📁 Collection Manager (CollectionManager.tsx): Full CRUD for music collections with custom emoji pickers and play-as-queue functionality.",
          "🎧 Media Session & Hotkeys: Bound native browser Media Session API for lockscreen controls and global keyboard shortcuts (Space, Arrow keys).",
        ],
      },
    ],
  },
  {
    version: "v5.3.0",
    date: "2026-08-05",
    title: "Track Memories & Personal Music Journal",
    badge: "MUSIC MEMORIES ENGINE",
    type: "minor",
    summary: "Added a personal music journaling system allowing users to record memories, nostalgia logs, location tags, mood badges, and 5-star ratings for any track.",
    categories: [
      {
        name: "New Features",
        items: [
          "📖 Track Memory Modal (TrackMemoryModal.tsx): Capture track memories, nostalgia notes, mood tags, rating stars, and memory locations.",
          "💾 Database Persistence: Extended music store and API action handlers to persist track memories per user account.",
        ],
      },
    ],
  },
  {
    version: "v5.2.0",
    date: "2026-08-04",
    title: "Audio Extraction & Stream Resolver Polish",
    badge: "AUDIO STREAM ENGINE",
    type: "minor",
    summary: "Enhanced music player stream resolver with fallback audio proxies, cached stream URLs, direct stream importing, and polished vinyl disc animations.",
    categories: [
      {
        name: "UI & Aesthetics",
        items: [
          "🎧 Vinyl Disc Visuals: Rotating vinyl disc animations, tone arm movement, and ambient track color extraction.",
          "🔗 Import URL Modal: Direct audio URL importer with stream proxy caching.",
        ],
      },
    ],
  },
  {
    version: "v5.1.0",
    date: "2026-08-04",
    title: "Hobbies Progression Engine & UI Overhaul",
    badge: "HOBBIES PROGRESSION ENGINE",
    type: "major",
    summary: "Upgraded Hobbies Progression UI with SkillCard level badges (Lv.X), XP progress bars, Learn Today modal, Add Skill modal, and enhanced stats banner.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎯 SkillCard Level Badges & XP Bars: Displays level rank, XP amounts, and progress to next level.",
          "⏱️ Learn Today Modal: Preset minute selector, custom study duration input, notes, and session XP logging.",
          "➕ Add Custom Skill Modal: Create custom hobby skills with name, category, and priority.",
        ],
      },
    ],
  },
  {
    version: "v5.0.0",
    date: "2026-08-01",
    title: "Hall of Fame Evolution (Flagship v5) + Character Directory v2 + Universal Context Menu Engine",
    badge: "FLAGSHIP RELEASE v5",
    type: "major",
    summary: "Evolved the Hall of Fame into a premium digital museum celebrating legends with dynamic statistics dashboard, gold/silver/bronze podiums, achievement badge matrix, rich profile inspection modal, side-by-side comparison popup, records, analytics, and universal context menus.",
    categories: [
      {
        name: "New Features",
        items: [
          "🏆 Hall Statistics Overview: Header banner statistics computed dynamically (Total Legends, GOAT Status, Champions, Countries, Categories, Total Votes).",
          "👑 Champions Podium Upgrade: 1st Place Gold spotlight with crown 👑, ribbon, shine sweep, and gold particles; 2nd Place Silver 🥈; 3rd Place Bronze 🥉.",
          "💎 Dynamic Achievement Badges: Automatic badge matrix (GOAT Status, Champion, 100+ Votes Club, Tokusatsu Hero, Vocal Virtuoso, Multi-Talent) rendered across cards and modals.",
          "🔍 Rich Legend Inspection Modal (HofProfileModal.tsx): Deep profile viewer with Overview, Badges, Ranking History timelines, Filmography, and Note/Metric panels.",
          "⚔️ Side-by-Side Legend Comparison (HofCompareModal.tsx): Responsive comparison modal for comparing 2 to 4 legends.",
          "📊 Hall Records & Analytics: Dynamic record holders, country/category breakdown charts, and real-time activity feed.",
          "🎯 Universal Page Context Menus: Right-clicking whitespace on any route triggers page-level quick actions, navigation, search, and system controls.",
          "📱 Mobile Touch Long-Press Parity: 500ms touch long-press listener dispatches contextmenu events across cards and whitespace with 100% desktop feature parity.",
          "⚔️ Master Character Directory v2: Searchable master database with Hero Banner, Dynamic Quick Statistics, Category Pills, and Advanced Toolbar.",
          "🎬 Tokusatsu Filtered View: Zero-duplication /tokusatsu view for Ultraman, Kamen Rider, Super Sentai, Power Rangers, and Metal Heroes.",
        ],
      },
    ],
  },
  {
    version: "v4.9.0",
    date: "2026-08-01",
    title: "Global Dropdown & Modal Stacking Context Fix",
    badge: "UI INTERACTION REPAIR",
    type: "major",
    summary: "Audited and resolved global dropdown interaction bug where custom select menus (Type, Status Tier, Nationality, Category) rendered underneath modal dialog cards. Realigned Z-Index Stacking Hierarchy across ViewportBoundary, CustomSelect, FilterDropdown, and ContextMenu.",
    categories: [
      {
        name: "Bug Fixes & Engine",
        items: [
          "🎯 Stacking Context Alignment: Raised Z_INDEX.DROPDOWN from 1000 to 1500, POPOVER to 1600, and CONTEXT_MENU to 1700 in ViewportBoundary.ts, placing all portaled options panels cleanly above Z_INDEX.MODAL (1300).",
          "🔍 Modal Select Menu Interaction: Fixed pointer blockage across HofEditorModal, DossierCharacterEditorModal, GameEditorModal, GameScannerModal, AiToolEditorModal, ShowcaseEditorModal, ProjectEditorModal, and ProfileEditorModal.",
          "🖱️ Context Menu Stacking: Standardized ContextMenu.tsx zIndex to Z_INDEX.CONTEXT_MENU (1700), eliminating backdrop clipping inside open modals.",
          "⌨️ Keyboard Accessibility: Added Enter, Space, and ArrowDown keyboard trigger controls for CustomSelect.",
        ],
      },
    ],
  },
  {
    version: "v4.8.0",
    date: "2026-08-01",
    title: "Phase 2 — Universal Character Database Expansion",
    badge: "ROSTER & LINK SYSTEM",
    type: "major",
    summary: "Expanded playable rosters across all 20+ supported games, added an Editable External Navigation Link system with URL validation and reset capability, built a dedicated right-click/long-press context menu for link buttons, and extended character metadata inspection.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎮 Complete 20+ Game Rosters: Added playable roster entries & metadata for HSR, Genshin, HI3, ZZZ, WuWa, Arknights, Endfield, GFL2, ToF, NIKKE, PGR, Reverse: 1999, FGO, Umamusume, LoL, Valorant, MLBB, DB Legends, Outerplane, Stella Sora, and PUBG Tactical Equipment.",
          "🔗 Editable Link System: User-defined URL overrides with protocol validation (http/https), reset to default, and disable/enable controls.",
          "🎯 Dedicated Navigation Button Context Menu: Right-click, long-press (~500ms on touch), or Shift+F10 on link buttons triggers dedicated URL actions without interfering with card context menus.",
          "📜 Expanded Metadata Inspection: Displays Voice Actor, Illustrator, Birthday, Height, Affiliation, Region, Constellation, and Lore Tags with graceful fallback.",
          "🔍 Enhanced Universal Search: Search across name, alias, voice actor, affiliation, region, constellation, description, tags, and keywords.",
        ],
      },
    ],
  },
  {
    version: "v4.7.0",
    date: "2026-08-01",
    title: "Universal Character Database System (Production Architecture)",
    badge: "UNIVERSAL CHARACTER ENGINE",
    type: "major",
    summary: "Built a production-grade Universal Character Database System powering all 20+ supported games. Features extensible schema, automated Universal Link System (Wiki, Build, Official, Guide), Universal Entity Mode for non-hero games like PUBG, CharacterPreviewModal overlay, universal metadata search, and React hook order resolution.",
    categories: [
      {
        name: "New Features",
        items: [
          "👑 Universal Character Model: Schema extended with aliases, splashArt, rarity, weapon, classType, faction, nation, race, releaseVersion, tags, stats, and links.",
          "🌐 Universal Link System: Automated external link engine for Wiki (Fandom, LoL Wiki, Prydwen), Build (Prydwen, KeqingMains, U.GG, MLBB Ninja), Official (HoYoLab, Riot), and Guide (Tracker.gg).",
          "🎒 Universal Entity Mode: Non-hero games (PUBG) automatically switch entityType to equipment, adapting UI terminology to firearms, armor, ammo calibers, and tactical gear.",
          "🖼️ CharacterPreviewModal Overlay: Rich preview overlay displaying portrait/splash art, glowing element aura, attribute matrix, and external resource buttons.",
          "🔍 Universal Search Engine: Multi-field search across name, aliases, tags, faction, nation, weapon, release version, and search keywords.",
          "⚡ React Hook Order Fix: Moved all useMemo hooks above early return guards in GameDossierPage, enforcing strict hook ordering across all renders.",
        ],
      },
    ],
  },
  {
    version: "v4.6.0",
    date: "2026-08-01",
    title: "Interactive Category Filtering for Game Database",
    badge: "GAME DOSSIER ENGINE",
    type: "major",
    summary: "Implemented scalable, database-driven dual category filtering (Element & Path/Class) for all games in the Game Database. Features configuration adapters per game, memoized AND filtering logic, unified DossierCharacterCard component, Framer Motion layout animations, and polished empty states.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎯 Interactive Dual-Category Filtering: Integrated element cards and path cards as real-time interactive filter controls.",
          "🔄 Dynamic Game Configuration Adapters: Automatically adapts categories, elements, labels, and icons per game from gameDossierConfig.ts.",
          "🃏 DossierCharacterCard Component: Created a unified character card with portrait, element badge, path badge, level rank, winrate %, favorite starring, and context menu.",
          "✨ Framer Motion Layout Animations: Smooth roster layout transitions with AnimatePresence when filtering or mutating character data.",
          "🛡️ Polished Empty States: Displays interactive empty state cards with 1-click filter reset when zero characters match active filters.",
        ],
      },
    ],
  },
  {
    version: "v4.5.0",
    date: "2026-08-01",
    title: "Universal Desktop-Class Navigation Context Menu Expansion",
    badge: "GLOBAL NAVIGATION ENGINE",
    type: "major",
    summary: "Expanded context menu architecture into a 2-layer desktop-style navigation system. Preserves 100% of object-specific card menus while introducing a global fallback navigation menu on empty whitespace with search integration, dynamic route filtering, quick actions, theme toggle, and editable target protection.",
    categories: [
      {
        name: "New Features",
        items: [
          "🖥️ Multi-Layered Context Menu Priority: Layer 1 for object cards, Layer 2 for empty space / background layout fallback.",
          "🔍 Command Palette Search Integration: Mapped top search item directly to global Command Palette (Ctrl+K).",
          "🗺️ Dynamic Navigation Filtering: Automatically omits the current active page route from navigation destinations.",
          "⚡ Quick Action Shortcuts: Instant action items for creating Games, Anime, Dramas, Notes, and Uploading Images.",
          "🛡️ Editable Target Protection: Preserves native browser context menus on input, textarea, select, contenteditable, and code editors.",
          "⌨️ Desktop Accessibility & Parity: Keyboard navigation with section header isolation, ESC dismissal, collision detection, and mobile bottom sheet conversion.",
        ],
      },
    ],
  },
  {
    version: "v4.4.1",
    date: "2026-08-01",
    title: "Universal Desktop-Grade Context Menu System",
    badge: "UNIVERSAL CONTEXT MENU",
    type: "major",
    summary: "Implemented a universal, context-aware right-click menu system across all application modules (Games, Game Database, Anime, Drama, Gallery, Bookmarks, Hall of Fame, Notepad, Prompt Vault, and Dashboard Home).",
    categories: [
      {
        name: "New Features",
        items: [
          "🖱️ Context-Aware Right-Click Engine: Context menus dynamically change depending on what item or background space you right-click.",
          "📱 Mobile Bottom Sheet: Automatically transforms into a mobile bottom sheet modal on touch devices (< 640px).",
          "⌨️ Full Keyboard Navigation: Supports ArrowUp, ArrowDown, Enter, and Escape hotkeys.",
          "🌐 Universal Coverage: Integrated into Games, Anime, Drama, Gallery, Links, Hall of Fame, Notepad, Prompt Vault, and Dashboard Home.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "🛡️ Viewport Boundary Clamping: Smart positioning engine prevents context menus from overflowing screen edges.",
          "⚡ Instant Reactivity: Fully synchronized with Zustand store actions and Confirm dialogs.",
        ],
      },
    ],
  },
  {
    version: "v4.4.0",
    date: "2026-08-01",
    title: "Unified FloatingPopover System & Interactive UID Management",
    badge: "GLOBAL POPOVER & UID",
    type: "major",
    summary: "Rebuilt the floating overlay system into FloatingPopover.tsx with autoUpdate layoutShift and animationFrame tracking, safePolygon hover bridges, and fixed-strategy coordinate calculation. Added interactive UID copy and profile link options across Games and Game Database, and copyable Changelog entries.",
    categories: [
      {
        name: "New Features",
        items: [
          "🎯 Unified FloatingPopover Architecture: Single production-grade component powering Profile Popouts, Settings Dropdown, and menus.",
          "📋 Copyable Changelog Release Notes: Copy full release entries or individual updates with 1-click.",
          "🕹️ Interactive Game UID Options: Games with profile links feature dual options (Visit Profile ↗ + Copy UID 📋). Games without profile links allow direct 1-click UID copying.",
          "📊 Game Database UID Copying: Game dossiers in the Game Database Hub (/heroes) now include copyable UIDs.",
        ],
      },
      {
        name: "Bug Fixes & Engine",
        items: [
          "⚡ Fixed Transform Collision: Separated Floating UI position div from Framer Motion animation div to eliminate corner-stuck and scroll-frozen popovers.",
          "🛡️ Viewport Containment: Popovers dynamically shift, flip, and clamp to visible window bounds without clipping.",
        ],
      },
    ],
  },
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
