"use client";

import React from "react";
import { HallOfFameEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { CharacterDictProfileModal } from "@/components/ui/CharacterDictProfileModal";
import { CharacterProfileModal } from "@/components/game/CharacterProfileModal";

interface HofProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: (HallOfFameEntry & { isGameCharacterEntry?: boolean; gameCharacterId?: string }) | null;
  rankIndex?: number;
  onEdit?: (entry: HallOfFameEntry) => void;
  onLike?: (id: string) => void;
}

export function HofProfileModal({
  isOpen,
  onClose,
  entry,
  onLike,
}: HofProfileModalProps) {
  const { gameCharacters = [] } = useDashboardStore();

  if (!entry) return null;

  // 1. Resolve explicit Game Character reference if present
  const gcId = entry.gameCharacterId || (entry.id.startsWith("gc-") ? entry.id.replace(/^gc-/, "") : null);
  const matchedGameChar = gcId
    ? gameCharacters.find((gc) => gc.id === gcId)
    : entry.isGameCharacterEntry
    ? gameCharacters.find((gc) => gc.name.toLowerCase() === entry.name.toLowerCase())
    : null;

  // 2. Route Game Character entries to existing Game Character profile modal (Read-Only context: no onEdit)
  if (matchedGameChar) {
    return (
      <CharacterProfileModal
        isOpen={isOpen}
        character={matchedGameChar}
        onClose={onClose}
        onEdit={undefined}
      />
    );
  }

  // 3. Route Character Dictionary, Drama, Anime, Movie, and Tokusatsu entries to CharacterDictProfileModal (Read-Only context: no onEdit)
  return (
    <CharacterDictProfileModal
      isOpen={isOpen}
      entry={entry}
      onClose={onClose}
      onEdit={undefined}
      onLike={onLike}
    />
  );
}
