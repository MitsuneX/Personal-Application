"use client";

import React from "react";
import { HallOfFameEntry, useDashboardStore } from "@/lib/store/dashboardStore";
import { CharacterDictProfileModal } from "@/components/ui/CharacterDictProfileModal";
import { CharacterProfileModal } from "@/components/game/CharacterProfileModal";
import { TokusatsuProfileModal } from "@/components/ui/TokusatsuProfileModal";
import { isTokusatsuEntry } from "@/lib/data/tokusatsuDataHelper";

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
  onEdit,
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

  // 2. Route Game Character entries to Game Character profile modal
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

  // 3. Route Tokusatsu entries to the dedicated Tokusatsu profile modal
  if (isTokusatsuEntry(entry)) {
    return (
      <TokusatsuProfileModal
        isOpen={isOpen}
        entry={entry}
        onClose={onClose}
        onEdit={onEdit}
        onLike={onLike}
      />
    );
  }

  // 4. Route all other entries (Artist, Actor, Actress, Anime, Singer, etc.) to CharacterDictProfileModal
  return (
    <CharacterDictProfileModal
      isOpen={isOpen}
      entry={entry}
      onClose={onClose}
      onEdit={onEdit}
      onLike={onLike}
    />
  );
}
