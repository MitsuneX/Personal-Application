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
