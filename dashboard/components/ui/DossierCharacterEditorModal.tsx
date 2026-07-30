"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface DossierCharacterEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle?: string;
  gameCategory?: string;
  characterToEdit?: DossierCharacterEntry | null;
}

export function DossierCharacterEditorModal({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  gameCategory,
  characterToEdit,
}: DossierCharacterEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addDossierCharacter, updateDossierCharacter, removeDossierCharacter } = useDashboardStore();

  const config = getGameDossierConfig(gameTitle, gameCategory);
  const categoryOptions = config.categories.map((c) => c.name);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState(config.categories[0]?.name || "Main Roster");
  const [role, setRole] = useState("");
  const [levelRank, setLevelRank] = useState("");
  const [winRate, setWinRate] = useState<number>(60);
  const [matches, setMatches] = useState<number>(50);
  const [notes, setNotes] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#3B82F6");
  const [isFavorite, setIsFavorite] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name || "");
      setCategory(characterToEdit.category || config.categories[0]?.name || "Main Roster");
      setRole(characterToEdit.role || "");
      setLevelRank(characterToEdit.levelRank || "");
      setWinRate(characterToEdit.winRate ?? 60);
      setMatches(characterToEdit.matches ?? 50);
      setNotes(characterToEdit.notes || "");
      setAvatarUrl(characterToEdit.avatarUrl || "");
      setAccentColor(characterToEdit.accentColor || "#3B82F6");
      setIsFavorite(characterToEdit.isFavorite ?? false);
    } else {
      setName("");
      setCategory(config.categories[0]?.name || "Main Roster");
      setRole("");
      setLevelRank("");
      setWinRate(60);
      setMatches(50);
      setNotes("");
      setAvatarUrl("");
      setAccentColor("#3B82F6");
      setIsFavorite(false);
    }
  }, [characterToEdit, isOpen, gameTitle, gameCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      if (characterToEdit) {
        await updateDossierCharacter(characterToEdit.id, {
          name,
          category,
          role: role || undefined,
          levelRank: levelRank || undefined,
          winRate: Number(winRate),
          matches: Number(matches),
          notes: notes || undefined,
          avatarUrl: avatarUrl || undefined,
          accentColor,
          isFavorite,
        });
      } else {
        const newChar: DossierCharacterEntry = {
          id: `dossier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          gameId,
          name,
          category,
          role: role || undefined,
          levelRank: levelRank || undefined,
          winRate: Number(winRate),
          matches: Number(matches),
          notes: notes || undefined,
          avatarUrl: avatarUrl || undefined,
          accentColor,
          isFavorite,
        };
        await addDossierCharacter(newChar);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save dossier character:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!characterToEdit) return;
    if (!confirm(`Delete ${characterToEdit.name} from dossier?`)) return;

    setIsDeleting(true);
    try {
      await removeDossierCharacter(characterToEdit.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete character:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
    color: isCyber ? "#F8FAFC" : "#0F172A",
    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h2 className="text-xl font-black mb-1 theme-text-primary flex items-center gap-2">
          <span>{characterToEdit ? "✏️ Edit" : "✨ Add"} {config.characterLabel} Entry</span>
        </h2>
        <p className="text-xs theme-text-muted mb-4 font-mono">
          Game: <span className="font-bold text-amber-500">{gameTitle || "Selected Game"}</span> ({config.categoryLabel})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              {config.characterLabel} Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${config.characterLabel === "Agent" ? "Jett" : config.characterLabel === "Hero" ? "Chou" : "Xiao"}`}
              className="w-full p-2.5 rounded-xl border text-sm font-bold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                {config.categoryLabel} *
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={categoryOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Sub-Role / Specialty
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Assassin / Burst"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Mastery / Rank
              </label>
              <input
                type="text"
                value={levelRank}
                onChange={(e) => setLevelRank(e.target.value)}
                placeholder="e.g. Mastery 7"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Win Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={winRate}
                onChange={(e) => setWinRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Matches Played
              </label>
              <input
                type="number"
                min="0"
                value={matches}
                onChange={(e) => setMatches(parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-9 p-0 rounded-lg cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Avatar Image URL / Icon
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Image URL or Emoji"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Personal Notes & Strategy Tips
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Best build path, key combos, or counter pick notes..."
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFavorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-amber-500"
            />
            <label htmlFor="isFavorite" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
              <span>⭐ Mark as Favorite Highlight</span>
            </label>
          </div>

          <div className="flex gap-3 pt-3">
            {characterToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95 disabled:opacity-50"
                style={{
                  border: isCyber ? "none" : "2px solid #000",
                  boxShadow: isCyber ? "none" : "3px 3px 0 #000",
                }}
              >
                {isDeleting ? "..." : "🗑️ Delete"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                color: isCyber ? "#94A3B8" : "#475569",
                border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px solid #000",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#FF6B35",
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
              }}
            >
              {isSaving ? "Saving..." : characterToEdit ? "Save Changes" : "Add to Dossier"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
