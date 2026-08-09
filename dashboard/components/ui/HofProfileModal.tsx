"use client";

import React from "react";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { CharacterDictProfileModal } from "@/components/ui/CharacterDictProfileModal";

interface HofProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: HallOfFameEntry | null;
  rankIndex?: number;
  onEdit?: (entry: HallOfFameEntry) => void;
  onLike?: (id: string) => void;
}

export function HofProfileModal({
  isOpen,
  onClose,
  entry,
  onEdit,
  onLike,
}: HofProfileModalProps) {
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
