import { ContextMenuItem } from "./menuDefinitions";

export interface GameMenuParams {
  game: any;
  onOpen?: () => void;
  onEdit?: () => void;
  onToggleFavorite?: () => void;
  onCopyUid?: () => void;
  onManageCharacters?: () => void;
  onDelete?: () => void;
}

export function buildGameCardMenu({
  game,
  onOpen,
  onEdit,
  onToggleFavorite,
  onCopyUid,
  onManageCharacters,
  onDelete,
}: GameMenuParams): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (onOpen) {
    items.push({
      id: "open",
      label: `Open ${game.game}`,
      icon: "🕹️",
      onClick: onOpen,
    });
  }

  if (onEdit) {
    items.push({
      id: "edit",
      label: "Edit Game Configuration",
      icon: "⚙️",
      shortcut: "⌘E",
      onClick: onEdit,
    });
  }

  if (onToggleFavorite) {
    items.push({
      id: "favorite",
      label: game.isFavorite ? "Unpin Favorite" : "Pin to Favorites",
      icon: "⭐",
      checked: game.isFavorite,
      onClick: onToggleFavorite,
    });
  }

  if (game.handle && onCopyUid) {
    items.push({
      id: "copy-uid",
      label: `Copy UID (${game.handle})`,
      icon: "📋",
      onClick: onCopyUid,
    });
  }

  if (onManageCharacters) {
    items.push({
      id: "characters",
      label: "Manage Roster & Characters",
      icon: "👥",
      onClick: onManageCharacters,
    });
  }

  if (onDelete) {
    items.push({
      id: "delete",
      label: "Delete Game",
      icon: "🗑️",
      danger: true,
      divider: true,
      shortcut: "Del",
      onClick: onDelete,
    });
  }

  return items;
}

export interface MediaMenuParams {
  title: string;
  isFavorite?: boolean;
  currentProgress?: number;
  totalProgress?: number;
  onContinue?: () => void;
  onAddProgress?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function buildMediaCardMenu({
  title,
  isFavorite,
  onContinue,
  onAddProgress,
  onToggleFavorite,
  onEdit,
  onDelete,
}: MediaMenuParams): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (onContinue) {
    items.push({
      id: "continue",
      label: `Continue ${title}`,
      icon: "▶️",
      onClick: onContinue,
    });
  }

  if (onAddProgress) {
    items.push({
      id: "add-episode",
      label: "+1 Episode Progress",
      icon: "⚡",
      shortcut: "+1",
      onClick: onAddProgress,
    });
  }

  if (onToggleFavorite) {
    items.push({
      id: "favorite",
      label: isFavorite ? "Remove Favorite" : "Mark as Favorite",
      icon: "⭐",
      checked: isFavorite,
      onClick: onToggleFavorite,
    });
  }

  if (onEdit) {
    items.push({
      id: "edit",
      label: "Edit Entry Details",
      icon: "✏️",
      shortcut: "⌘E",
      onClick: onEdit,
    });
  }

  if (onDelete) {
    items.push({
      id: "delete",
      label: "Delete Entry",
      icon: "🗑️",
      danger: true,
      divider: true,
      shortcut: "Del",
      onClick: onDelete,
    });
  }

  return items;
}

export interface GalleryMenuParams {
  item: any;
  onPreview?: () => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
  onDelete?: () => void;
}

export function buildGalleryMenu({
  item,
  onPreview,
  onDownload,
  onCopyLink,
  onDelete,
}: GalleryMenuParams): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (onPreview) {
    items.push({
      id: "preview",
      label: "Open Full Lightbox",
      icon: "🔍",
      onClick: onPreview,
    });
  }

  if (onDownload) {
    items.push({
      id: "download",
      label: "Download Media File",
      icon: "📥",
      onClick: onDownload,
    });
  }

  if (onCopyLink) {
    items.push({
      id: "copy-link",
      label: "Copy Image URL",
      icon: "🔗",
      onClick: onCopyLink,
    });
  }

  if (onDelete) {
    items.push({
      id: "delete",
      label: "Delete Media Item",
      icon: "🗑️",
      danger: true,
      divider: true,
      onClick: onDelete,
    });
  }

  return items;
}

export interface BookmarkMenuParams {
  bookmark: any;
  onOpenLink?: () => void;
  onCopyUrl?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function buildBookmarkMenu({
  bookmark,
  onOpenLink,
  onCopyUrl,
  onToggleFavorite,
  onEdit,
  onDelete,
}: BookmarkMenuParams): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (onOpenLink) {
    items.push({
      id: "open-link",
      label: `Visit ${bookmark.title || "Link"}`,
      icon: "🌐",
      onClick: onOpenLink,
    });
  }

  if (onCopyUrl) {
    items.push({
      id: "copy-url",
      label: "Copy Link Address",
      icon: "📋",
      onClick: onCopyUrl,
    });
  }

  if (onToggleFavorite) {
    items.push({
      id: "favorite",
      label: bookmark.isFavorite ? "Unstar Bookmark" : "Star Bookmark",
      icon: "⭐",
      checked: bookmark.isFavorite,
      onClick: onToggleFavorite,
    });
  }

  if (onEdit) {
    items.push({
      id: "edit",
      label: "Edit Bookmark",
      icon: "✏️",
      onClick: onEdit,
    });
  }

  if (onDelete) {
    items.push({
      id: "delete",
      label: "Delete Bookmark",
      icon: "🗑️",
      danger: true,
      divider: true,
      onClick: onDelete,
    });
  }

  return items;
}

export interface CharacterCardMenuParams {
  character: any;
  onPreview?: () => void;
  onToggleFavorite?: () => void;
  onToggleHof?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCopyLink?: () => void;
}

export function buildCharacterCardMenu({
  character,
  onPreview,
  onToggleFavorite,
  onToggleHof,
  onEdit,
  onDuplicate,
  onDelete,
  onCopyLink,
}: CharacterCardMenuParams): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  if (onPreview) {
    items.push({
      id: "preview",
      label: `Preview ${character.name}`,
      icon: "👁️",
      onClick: onPreview,
    });
  }

  if (onToggleFavorite) {
    items.push({
      id: "favorite",
      label: character.isFavorite ? "Unstar Favorite" : "Star Favorite",
      icon: "⭐",
      checked: character.isFavorite,
      onClick: onToggleFavorite,
    });
  }

  if (onToggleHof) {
    items.push({
      id: "hof",
      label: character.isHof ? "Remove from Hall of Fame" : "Add to Hall of Fame",
      icon: "👑",
      checked: character.isHof,
      onClick: onToggleHof,
    });
  }

  if (onEdit) {
    items.push({
      id: "edit",
      label: "Edit Character",
      icon: "✏️",
      shortcut: "⌘E",
      onClick: onEdit,
    });
  }

  if (onCopyLink) {
    items.push({
      id: "copy-link",
      label: "Copy Character Link",
      icon: "📋",
      onClick: onCopyLink,
    });
  }

  if (onDuplicate) {
    items.push({
      id: "duplicate",
      label: "Duplicate Entry",
      icon: "📋",
      divider: true,
      onClick: onDuplicate,
    });
  }

  if (onDelete) {
    items.push({
      id: "delete",
      label: `Delete ${character.name}`,
      icon: "🗑️",
      danger: true,
      shortcut: "Del",
      onClick: onDelete,
    });
  }

  return items;
}

export interface GlobalNavigationMenuParams {
  pathname: string;
  theme: string;
  setTheme: (theme: "cyber" | "brutal") => void;
  router: { push: (path: string) => void };
  logout: () => void;
  openCommandPalette: () => void;
}

export function buildGlobalNavigationMenu({
  pathname,
  theme,
  setTheme,
  router,
  logout,
  openCommandPalette,
}: GlobalNavigationMenuParams): ContextMenuItem[] {
  const isCyber = theme === "cyber";
  const normPath = (pathname || "/").replace(/\/$/, "") || "/";

  const items: ContextMenuItem[] = [];

  // ── 0. Route-Specific Page Actions Section (Highest Priority) ───────────
  if (normPath.startsWith("/characters") || normPath.startsWith("/heroes")) {
    items.push({
      id: "hdr-page-action",
      label: "Character Directory Actions",
      isHeader: true,
      onClick: () => {},
    });
    items.push({
      id: "pa-add-char",
      label: "Add New Character Entry",
      icon: "✨",
      onClick: () => router.push("/characters?action=new"),
    });
    items.push({
      id: "pa-random-char",
      label: "View Random Character",
      icon: "🎲",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("trigger-random-character"));
        }
      },
    });
    items.push({
      id: "pa-open-hof",
      label: "Open Hall of Fame",
      icon: "🏆",
      onClick: () => router.push("/hall-of-fame"),
    });
    items.push({
      id: "pa-open-toku",
      label: "Open Tokusatsu Roster",
      icon: "🎬",
      onClick: () => router.push("/tokusatsu"),
    });
  } else if (normPath.startsWith("/hall-of-fame")) {
    items.push({
      id: "hdr-page-action",
      label: "Hall of Fame Actions",
      isHeader: true,
      onClick: () => {},
    });
    items.push({
      id: "pa-add-hof",
      label: "Add Legend to Hall of Fame",
      icon: "👑",
      onClick: () => router.push("/hall-of-fame?action=new"),
    });
    items.push({
      id: "pa-recalc-goat",
      label: "Recalculate GOAT Rankings",
      icon: "⚡",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("recalculate-goat-rankings"));
        }
      },
    });
    items.push({
      id: "pa-open-chars",
      label: "Master Character Directory",
      icon: "⚔️",
      onClick: () => router.push("/characters"),
    });
  } else if (normPath.startsWith("/tokusatsu")) {
    items.push({
      id: "hdr-page-action",
      label: "Tokusatsu Roster Actions",
      isHeader: true,
      onClick: () => {},
    });
    items.push({
      id: "pa-add-toku",
      label: "Add Tokusatsu Hero Entry",
      icon: "🦸",
      onClick: () => router.push("/tokusatsu?action=new"),
    });
    items.push({
      id: "pa-filter-kamen",
      label: "Filter Kamen Rider",
      icon: "🏍️",
      onClick: () => router.push("/tokusatsu?sub=kamen-rider"),
    });
    items.push({
      id: "pa-filter-ultra",
      label: "Filter Ultraman",
      icon: "⚡",
      onClick: () => router.push("/tokusatsu?sub=ultraman"),
    });
    items.push({
      id: "pa-open-chars",
      label: "Open All Characters",
      icon: "📚",
      onClick: () => router.push("/characters"),
    });
  } else if (normPath.startsWith("/games")) {
    items.push({
      id: "hdr-page-action",
      label: "Games Library Actions",
      isHeader: true,
      onClick: () => {},
    });
    items.push({
      id: "pa-add-game",
      label: "Add Game Entry",
      icon: "🎮",
      onClick: () => router.push("/games?action=new"),
    });
    items.push({
      id: "pa-manage-roster",
      label: "Manage Game Rosters",
      icon: "👥",
      onClick: () => router.push("/heroes"),
    });
  } else if (normPath.startsWith("/anime") || normPath.startsWith("/drama") || normPath.startsWith("/music")) {
    items.push({
      id: "hdr-page-action",
      label: "Media Library Actions",
      isHeader: true,
      onClick: () => {},
    });
    items.push({
      id: "pa-add-media",
      label: `Add ${normPath.includes("anime") ? "Anime" : normPath.includes("drama") ? "Drama" : "Track"} Entry`,
      icon: "➕",
      onClick: () => router.push(`${normPath}?action=new`),
    });
  }

  // 1. Search Integration
  items.push({
    id: "search-global",
    label: "Search Everything...",
    icon: "🔍",
    shortcut: "⌘K",
    divider: items.length > 0,
    onClick: openCommandPalette,
  });

  // 2. Navigation Section
  const allNavItems = [
    { id: "nav-dash", label: "Dashboard", icon: "🏠", path: "/" },
    { id: "nav-chars", label: "Character Directory", icon: "⚔️", path: "/characters" },
    { id: "nav-hof", label: "Hall of Fame", icon: "🏆", path: "/hall-of-fame" },
    { id: "nav-toku", label: "Tokusatsu", icon: "🎬", path: "/tokusatsu" },
    { id: "nav-games", label: "Games Library", icon: "🎮", path: "/games" },
    { id: "nav-gamedb", label: "Game Database", icon: "📚", path: "/heroes" },
    { id: "nav-anime", label: "Anime", icon: "📺", path: "/anime" },
    { id: "nav-drama", label: "Drama", icon: "🎭", path: "/drama" },
    { id: "nav-music", label: "Music", icon: "🎵", path: "/music" },
    { id: "nav-gallery", label: "Gallery", icon: "🖼️", path: "/gallery" },
    { id: "nav-ai", label: "AI Library", icon: "🤖", path: "/ai-library" },
    { id: "nav-notepad", label: "Notepad", icon: "📝", path: "/notepad" },
    { id: "nav-links", label: "Links", icon: "🔗", path: "/links" },
    { id: "nav-prompts", label: "Prompt Vault", icon: "💬", path: "/prompt-vault" },
  ];

  const availableNavItems = allNavItems.filter((item) => {
    if (item.path === "/") {
      return normPath !== "/";
    }
    return !normPath.startsWith(item.path);
  });

  if (availableNavItems.length > 0) {
    items.push({
      id: "hdr-nav",
      label: "Navigation",
      isHeader: true,
      divider: true,
      onClick: () => {},
    });

    availableNavItems.forEach((nav) => {
      items.push({
        id: nav.id,
        label: nav.label,
        icon: nav.icon,
        onClick: () => router.push(nav.path),
      });
    });
  }

  // 3. Theme & Profile Section
  items.push({
    id: "hdr-system",
    label: "System & Theme",
    isHeader: true,
    divider: true,
    onClick: () => {},
  });

  items.push({
    id: "theme-toggle",
    label: isCyber ? "Switch to Neo-Brutalism" : "Switch to Cyberpunk",
    icon: isCyber ? "☀️" : "🌙",
    onClick: () => setTheme(isCyber ? "brutal" : "cyber"),
  });

  items.push({
    id: "prof-view",
    label: "Profile Settings",
    icon: "⚙️",
    onClick: () => router.push("/profile"),
  });

  items.push({
    id: "prof-logout",
    label: "Logout",
    icon: "🚪",
    danger: true,
    onClick: logout,
  });

  return items;
}

