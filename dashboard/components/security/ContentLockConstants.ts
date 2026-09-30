export interface ProtectedScopeDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  paths: string[];
}

export const PROTECTED_SCOPES: ProtectedScopeDefinition[] = [
  {
    id: "NOTEPAD",
    label: "Notepad",
    description: "Private notes, thoughts, and personal logs",
    icon: "📝",
    paths: ["/notepad"],
  },
  {
    id: "CHARACTERS",
    label: "Characters",
    description: "Character profiles, dossiers, and game character lists",
    icon: "📖",
    paths: ["/characters", "/game-characters"],
  },
  {
    id: "GAMES",
    label: "Games",
    description: "Gaming catalog, databases, and hero rosters",
    icon: "🎮",
    paths: ["/games", "/heroes"],
  },
  {
    id: "FAVOURITES",
    label: "Favourites",
    description: "Hall of Fame, favorite couples, and creatures",
    icon: "⭐",
    paths: ["/hall-of-fame", "/couples", "/creatures"],
  },
  {
    id: "MISC",
    label: "Misc",
    description: "Personal links, media gallery, and prompt vault",
    icon: "⚡",
    paths: ["/links", "/gallery", "/prompt-vault"],
  },
];

/**
 * Checks if a given pathname matches any of the user's enabled protected scopes
 */
export function getProtectedScopeForPath(
  pathname: string,
  userProtectedScopes: string[]
): ProtectedScopeDefinition | null {
  if (!userProtectedScopes || userProtectedScopes.length === 0) return null;

  for (const scopeId of userProtectedScopes) {
    const scopeDef = PROTECTED_SCOPES.find((s) => s.id === scopeId);
    if (!scopeDef) continue;

    for (const path of scopeDef.paths) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return scopeDef;
      }
    }
  }

  return null;
}
