"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { GameEntry, GameCategory } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

import { resolveGameIcon } from "@/lib/data/gameIcons";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";

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
  const { confirm } = useConfirm();
  const { warning: toastWarning } = useToast();

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
  const [screenshot, setScreenshot] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
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
      setScreenshot(gameToEdit.screenshot || "");
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
      setScreenshot("");
    }
  }, [gameToEdit, isOpen]);

  const resolvedIconInfo = resolveGameIcon(game, icon);

  const handleIconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      toastWarning("Please select a valid image file (PNG, JPG, JPEG, or WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setIcon(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      toastWarning("Please select a valid image file (PNG, JPG, JPEG, or WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setScreenshot(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

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
          screenshot: screenshot || undefined,
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
          screenshot: screenshot || undefined,
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

  const handleDelete = () => {
    if (!gameToEdit) return;
    const resolvedIcon = resolveGameIcon(gameToEdit.game, gameToEdit.icon);
    confirm({
      title: "Delete Game Database Entry",
      message: `Are you sure you want to delete "${gameToEdit.game}" from your library?`,
      confirmText: "Delete Game",
      variant: "danger",
      itemPreview: {
        title: gameToEdit.game,
        subtitle: `${gameToEdit.platform} · ${gameToEdit.category}`,
        description: gameToEdit.rank ? `Rank: ${gameToEdit.rank}` : undefined,
        imageUrl: gameToEdit.screenshot || ((resolvedIcon as any).isImage ? (resolvedIcon as any).value : undefined),
        icon: (resolvedIcon as any).isEmoji ? (resolvedIcon as any).value : "🎮",
        category: gameToEdit.category,
      },
      successToast: `✓ Game "${gameToEdit.game}" removed from database.`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await removeGame(gameToEdit.id);
          onClose();
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#fff",
    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
    color: isCyber ? "#fff" : "#000",
    borderWidth: isCyber ? "1px" : "2px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Scrollable content area — takes all available space inside the flex-col card */}
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 scrollbar-thin">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Game Icon Field (Automatic Recognition + Optional Custom Override) */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary flex items-center justify-between">
                <span>GAME ICON (AUTOMATIC OR CUSTOM OVERRIDE)</span>
                <span className="text-[10px] font-normal opacity-70">PNG, JPG, WEBP, URL</span>
              </label>

              {/* Live Recognition Status Badge */}
              <div 
                className="mb-2.5 p-2.5 rounded-xl border flex items-center gap-3 text-xs font-semibold"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.03)",
                  borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                <div 
                  className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border bg-slate-900 shadow-sm"
                  style={{ borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000" }}
                >
                  {resolvedIconInfo.isImage ? (
                    <img src={resolvedIconInfo.iconUrl} alt="Icon Preview" className="w-full h-full object-cover p-1" />
                  ) : (
                    <span className="text-base">{resolvedIconInfo.fallbackEmoji || "🎮"}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {resolvedIconInfo.source === "custom" && (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <span>🖼️</span> Custom Icon Override Active
                    </span>
                  )}
                  {resolvedIconInfo.source === "recognized" && (
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>⚡</span> Auto-Recognized: {resolvedIconInfo.matchedName}
                    </span>
                  )}
                  {resolvedIconInfo.source === "fallback" && (
                    <span className="theme-text-muted font-bold flex items-center gap-1">
                      <span>🎮</span> Default Category Fallback Icon
                    </span>
                  )}
                </div>

                {icon && (
                  <button
                    type="button"
                    onClick={() => setIcon("")}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600/30 font-bold cursor-pointer transition-all border border-red-600/30"
                    title="Remove custom icon and revert to automatic recognition"
                  >
                    Reset Override
                  </button>
                )}
              </div>

              {/* Custom Icon URL Input & File Upload Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Custom Icon URL or upload image file →"
                  className="flex-1 p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => iconFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                  title="Upload PNG, JPG, JPEG, or WEBP custom icon file"
                >
                  <span>🖼️ Icon File</span>
                </button>
                <input
                  type="file"
                  ref={iconFileInputRef}
                  onChange={handleIconFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Landscape Screenshot Field */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary flex items-center justify-between">
                <span>GAME SCREENSHOT (OPTIONAL LANDSCAPE)</span>
                <span className="text-[10px] font-normal opacity-70">PNG, JPG, WEBP</span>
              </label>

              {/* Input & Upload Controls */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={screenshot}
                  onChange={(e) => setScreenshot(e.target.value)}
                  placeholder="Paste Image URL or upload image file →"
                  className="flex-1 p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                  title="Upload PNG, JPG, or WEBP file"
                >
                  <span>🖼️ Upload File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
              </div>

              {/* Screenshot Preview & Clear Option */}
              {screenshot && (
                <div 
                  className="relative rounded-xl overflow-hidden aspect-video w-full border mt-2 group"
                  style={{
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.15)" : "3px 3px 0 #000",
                  }}
                >
                  <img src={screenshot} alt="Screenshot Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshot("")}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow transition-all cursor-pointer"
                  >
                    🗑️ Remove Screenshot
                  </button>
                </div>
              )}
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
