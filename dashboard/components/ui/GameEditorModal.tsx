"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { GameEntry, GameCategory } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface GameEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: GameEntry | null;
}

const CATEGORY_OPTIONS: GameCategory[] = [
  "Gacha RPG",
  "Gacha Action",
  "MOBA",
  "FPS",
  "Action RPG",
  "Fighting",
];

const PLATFORM_OPTIONS: GameEntry["platform"][] = [
  "PC",
  "PSN",
  "Xbox",
  "Switch",
  "Mobile",
  "Multi",
];

export function GameEditorModal({ isOpen, onClose, gameToEdit }: GameEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addGame, updateGame, removeGame } = useDashboardStore();

  // Form states
  const [game, setGame] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<GameEntry["platform"]>("PC");
  const [rank, setRank] = useState("");
  const [mainCharacter, setMainCharacter] = useState("");
  const [mainRole, setMainRole] = useState("");
  const [category, setCategory] = useState<GameCategory>("Gacha RPG");
  const [accentColor, setAccentColor] = useState("#7C3AED");
  const [profileLink, setProfileLink] = useState("");
  const [icon, setIcon] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with gameToEdit
  useEffect(() => {
    if (gameToEdit) {
      setGame(gameToEdit.game || "");
      setHandle(gameToEdit.handle || "");
      setPlatform(gameToEdit.platform || "PC");
      setRank(gameToEdit.rank || "");
      setMainCharacter(gameToEdit.mainCharacter || "");
      setMainRole(gameToEdit.mainRole || "");
      setCategory(gameToEdit.category || "Gacha RPG");
      setAccentColor(gameToEdit.accentColor || "#7C3AED");
      setProfileLink(gameToEdit.profileLink || "");
      setIcon(gameToEdit.icon || "");
    } else {
      setGame("");
      setHandle("");
      setPlatform("PC");
      setRank("");
      setMainCharacter("");
      setMainRole("");
      setCategory("Gacha RPG");
      setAccentColor("#7C3AED");
      setProfileLink("");
      setIcon("");
    }
  }, [gameToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !mainCharacter) return;

    setIsSaving(true);
    try {
      if (gameToEdit) {
        // Update existing game
        await updateGame(gameToEdit.id, {
          game,
          handle: handle || undefined,
          platform,
          rank: rank || undefined,
          mainCharacter,
          mainRole: mainRole || undefined,
          category,
          accentColor,
          profileLink: profileLink || undefined,
          icon: icon || undefined,
        });
      } else {
        // Add new game
        const newGame: GameEntry = {
          id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          game,
          handle: handle || undefined,
          platform,
          rank: rank || undefined,
          mainCharacter,
          mainRole: mainRole || undefined,
          category,
          isActive: true,
          accentColor,
          profileLink: profileLink || undefined,
          icon: icon || undefined,
        };
        await addGame(newGame);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save game:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!gameToEdit) return;
    if (!confirm("Are you sure you want to delete this title?")) return;

    setIsDeleting(true);
    try {
      await removeGame(gameToEdit.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete game:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#fff",
    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
    color: isCyber ? "#fff" : "#000",
    borderWidth: isCyber ? "1px" : "2px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-1 max-h-[82vh] overflow-y-auto pr-2 scrollbar-thin">
        {/* Cyber corner accents */}
        {isCyber && (
          <>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00F5FF]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#BF5FFF]" />
          </>
        )}

        <h2
          className="font-black text-xl font-mono mb-4 text-center"
          style={{
            color: isCyber ? "#00F5FF" : "#003366",
            textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.3)" : "none",
          }}
        >
          {gameToEdit 
            ? (isCyber ? "GAME_ENTRY::UPDATE" : "🎮 Edit Game Title")
            : (isCyber ? "GAME_ENTRY::ADD" : "🎮 Add Game Title")
          }
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">GAME TITLE</label>
              <input
                type="text"
                required
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="e.g. Genshin Impact"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">ICON / EMOJI</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. 🎲 (leave empty for default)"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">CATEGORY</label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as GameCategory)}
                options={CATEGORY_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">SUB-CATEGORY / ROLE</label>
              <input
                type="text"
                value={mainRole}
                onChange={(e) => setMainRole(e.target.value)}
                placeholder="e.g. DPS / Marksman"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">PLATFORM</label>
              <CustomSelect
                value={platform}
                onChange={(val) => setPlatform(val as any)}
                options={PLATFORM_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">RANK VALUE</label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. AR 60 / Mythic"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">MAIN CHARACTER</label>
              <input
                type="text"
                required
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                placeholder="e.g. Xiao"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">ACCENT COLOR (HEX)</label>
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
                  placeholder="#7C3AED"
                  className="flex-1 p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">ACCOUNT CREDENTIAL (UID / USERNAME)</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. UID: 81827727 or Username"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">PROFILE LINK (OPTIONAL)</label>
              <input
                type="url"
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                placeholder="e.g. https://act.hoyolab.com/... (optional)"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {gameToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all border-2 border-transparent active:scale-95 disabled:opacity-50"
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
              {isSaving ? "Saving..." : gameToEdit ? "Save Changes" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
