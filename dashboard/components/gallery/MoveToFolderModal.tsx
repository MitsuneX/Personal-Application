"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { GalleryEntry } from "@/lib/store/dashboardStore";

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryEntry | null;
  folders: string[];
  onMove: (itemId: string, targetFolder: string) => Promise<void>;
}

export function MoveToFolderModal({
  isOpen,
  onClose,
  item,
  folders,
  onMove,
}: MoveToFolderModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<string>("Root");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Available unique destinations (always include Root)
  const availableFolders = useMemo(() => {
    const list = Array.from(new Set(["Root", ...folders])).filter(Boolean);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((f) => f.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const currentFolder = item?.folder || "Root";

  const handleConfirmMove = async () => {
    if (!item) return;
    const destination = isCreatingNew && newFolderName.trim()
      ? newFolderName.trim().replace(/^\/+|\/+$/g, "")
      : selectedTarget;

    if (!destination) return;
    setIsMoving(true);
    try {
      await onMove(item.id, destination);
      onClose();
    } finally {
      setIsMoving(false);
      setNewFolderName("");
      setIsCreatingNew(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 relative space-y-5">
        {/* Cyberpunk accent corner */}
        {isCyber && (
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00F5FF]" />
        )}

        {/* Modal Header */}
        <div
          className="flex justify-between items-start pb-3 border-b"
          style={{
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
            borderBottomWidth: isCyber ? "1px" : "3px",
          }}
        >
          <div>
            <h3
              className="text-base font-black uppercase tracking-wider theme-text-primary"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
            >
              📁 Move Asset to Folder
            </h3>
            <p className="text-[11px] theme-text-muted mt-0.5 truncate max-w-xs font-mono">
              "{item.title || "Untitled Image"}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-black p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
          >
            ✕
          </button>
        </div>

        {/* Current Location Badge */}
        <div
          className="p-3 rounded-xl border flex items-center justify-between text-xs font-mono"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.04)" : "#F9FAFB",
            borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
            borderWidth: isCyber ? "1px" : "2px",
          }}
        >
          <span className="opacity-60">Current Directory:</span>
          <span className="font-bold flex items-center gap-1 theme-text-primary">
            <span>📁</span>
            <span>{currentFolder}</span>
          </span>
        </div>

        {/* Folder Search Input */}
        {!isCreatingNew && (
          <div className="space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination folders..."
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl outline-none border"
              style={{
                backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFF",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
            />

            {/* Folder List */}
            <div
              className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border rounded-xl p-2"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
                scrollbarWidth: "thin",
              }}
            >
              {availableFolders.map((folder) => {
                const isSelected = selectedTarget === folder;
                const isCurrent = currentFolder === folder;

                return (
                  <div
                    key={folder}
                    onClick={() => setSelectedTarget(folder)}
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-xs font-mono"
                    style={{
                      backgroundColor: isSelected
                        ? isCyber
                          ? "rgba(0,245,255,0.15)"
                          : "#FFD166"
                        : "transparent",
                      color: isSelected ? (isCyber ? "#00F5FF" : "#000") : undefined,
                      border: isSelected && !isCyber ? "2px solid #000" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{folder === "Root" ? "🏠" : "📁"}</span>
                      <span className="font-bold truncate">{folder === "Root" ? "Root Base (Top Level)" : folder}</span>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded opacity-50 bg-black/10 dark:bg-white/10 shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}

              {availableFolders.length === 0 && (
                <p className="text-center py-4 text-[10px] theme-text-muted font-mono">
                  No matching folders found.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Create New Folder Inline Toggle */}
        <div className="pt-1">
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="text-xs font-black flex items-center gap-1.5 transition-colors"
              style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
            >
              <span>➕</span>
              <span>Create New Destination Folder</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 rounded-xl border border-adaptive-unique bg-black/5 dark:bg-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span>New Folder Path</span>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="opacity-60 hover:opacity-100"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Anime/Wallpapers or Projects"
                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg outline-none border"
                style={{
                  backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFF",
                  borderColor: isCyber ? "#00F5FF" : "#000",
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique bg-transparent uppercase"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isMoving || (!isCreatingNew && selectedTarget === currentFolder)}
            onClick={handleConfirmMove}
            className="px-5 py-2 text-xs font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#fff",
              boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
              border: !isCyber ? "3px solid #000" : undefined,
              opacity: !isCreatingNew && selectedTarget === currentFolder ? 0.5 : 1,
            }}
          >
            {isMoving ? "Relocating..." : "Confirm Move"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
