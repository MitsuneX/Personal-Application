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

  const allNavItems = [
    { id: "nav-dash", label: "Dashboard", icon: "🏠", path: "/" },
    { id: "nav-games", label: "Games", icon: "🎮", path: "/games" },
    { id: "nav-gamedb", label: "Game Database", icon: "📚", path: "/heroes" },
    { id: "nav-anime", label: "Anime", icon: "📺", path: "/anime" },
    { id: "nav-drama", label: "Drama", icon: "🎭", path: "/drama" },
    { id: "nav-music", label: "Music", icon: "🎵", path: "/music" },
    { id: "nav-hof", label: "Hall of Fame", icon: "🏆", path: "/hall-of-fame" },
    { id: "nav-chars", label: "Characters", icon: "⚔️", path: "/characters" },
    { id: "nav-toku", label: "Tokusatsu", icon: "🎬", path: "/tokusatsu" },
    { id: "nav-gallery", label: "Gallery", icon: "🖼️", path: "/gallery" },
    { id: "nav-ai", label: "AI Library", icon: "🤖", path: "/ai-library" },
    { id: "nav-notepad", label: "Notepad", icon: "📝", path: "/notepad" },
    { id: "nav-links", label: "Links", icon: "🔗", path: "/links" },
    { id: "nav-prompts", label: "Prompt Vault", icon: "💬", path: "/prompt-vault" },
  ];

  // Dynamic Navigation: Hide current active page!
  const availableNavItems = allNavItems.filter((item) => {
    if (item.path === "/") {
      return normPath !== "/";
    }
    return !normPath.startsWith(item.path);
  });

  const items: ContextMenuItem[] = [];

  // 1. Search Integration (Top)
  items.push({
    id: "search-global",
    label: "Search Everything...",
    icon: "🔍",
    shortcut: "⌘K",
    onClick: openCommandPalette,
  });

  // 2. Navigation Section
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

  // 3. Quick Actions Section
  items.push({
    id: "hdr-actions",
    label: "Quick Actions",
    isHeader: true,
    divider: true,
    onClick: () => {},
  });

  items.push({
    id: "qa-add-game",
    label: "Add Game",
    icon: "➕",
    onClick: () => router.push("/games?action=new"),
  });
  items.push({
    id: "qa-add-anime",
    label: "Add Anime",
    icon: "➕",
    onClick: () => router.push("/anime?action=new"),
  });
  items.push({
    id: "qa-add-drama",
    label: "Add Drama",
    icon: "➕",
    onClick: () => router.push("/drama?action=new"),
  });
  items.push({
    id: "qa-new-note",
    label: "New Note",
    icon: "➕",
    onClick: () => router.push("/notepad?action=new"),
  });
  items.push({
    id: "qa-upload-img",
    label: "Upload Image",
    icon: "➕",
    onClick: () => router.push("/gallery?action=upload"),
  });

  // 4. Theme Section
  items.push({
    id: "hdr-theme",
    label: "Theme",
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

  // 5. Profile Section
  items.push({
    id: "hdr-profile",
    label: "Profile",
    isHeader: true,
    divider: true,
    onClick: () => {},
  });

  items.push({
    id: "prof-view",
    label: "Profile",
    icon: "👤",
    onClick: () => router.push("/profile"),
  });
  items.push({
    id: "prof-settings",
    label: "Settings",
    icon: "⚙️",
    onClick: () => router.push("/profile?tab=settings"),
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

