"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, GameShowcaseEntry } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface ShowcaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  itemToEdit?: GameShowcaseEntry | null;
}

const SHOWCASE_CATEGORY_OPTIONS = [
  { value: "Pull / Gacha", label: "✨ Pull / Gacha", icon: "✨" },
  { value: "Build / Stats", label: "📊 Build / Stats", icon: "📊" },
  { value: "PvP / Ranked", label: "🏆 PvP / Ranked", icon: "🏆" },
  { value: "Achievement", label: "🎯 Achievement", icon: "🎯" },
  { value: "Collection", label: "💎 Collection / Inventory", icon: "💎" },
  { value: "Boss Clear", label: "⚔️ Boss Clear", icon: "⚔️" },
  { value: "Funny Moment", label: "🤣 Funny Moment", icon: "🤣" },
  { value: "Other", label: "🖼️ Other Memory", icon: "🖼️" },
];

const PRESET_TAG_SUGGESTIONS = [
  "Luck", "Achievement", "Build", "Character", "Weapon", "Collection", "PvP", "Boss", "Story", "Funny", "Skin", "Relic"
];

export function ShowcaseEditorModal({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  itemToEdit,
}: ShowcaseEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addGameShowcaseItem, updateGameShowcaseItem, removeGameShowcaseItem } = useDashboardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Pull / Gacha");
  const [tagsString, setTagsString] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || "");
      setImageUrl(itemToEdit.imageUrl);
      setCategory(itemToEdit.category || "Pull / Gacha");
      setTagsString(Array.isArray(itemToEdit.tags) ? itemToEdit.tags.join(", ") : "");
      setIsFavorite(itemToEdit.isFavorite ?? false);
    } else {
      setTitle("");
      setDescription("");
      setImageUrl("");
      setCategory("Pull / Gacha");
      setTagsString("");
      setIsFavorite(false);
    }
  }, [itemToEdit, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const currentTags = tagsString.split(",").map((t) => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTagsString([...currentTags, tag].join(", "));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setIsSaving(true);
    const parsedTags = tagsString.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (itemToEdit) {
        await updateGameShowcaseItem(itemToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim(),
          category,
          tags: parsedTags,
          isFavorite,
        });
      } else {
        const newItem: GameShowcaseEntry = {
          id: `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          gameId,
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim(),
          category,
          tags: parsedTags,
          isFavorite,
          createdAt: new Date().toISOString(),
        };
        await addGameShowcaseItem(newItem);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save showcase item:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToEdit) return;
    if (!confirm(`Delete "${itemToEdit.title}" from showcase gallery?`)) return;

    setIsDeleting(true);
    try {
      await removeGameShowcaseItem(itemToEdit.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete showcase item:", err);
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
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
              <span>🖼️</span> {itemToEdit ? "Edit Showcase Item" : "Add Showcase Memory"}
            </h2>
            <p className="text-xs theme-text-muted font-mono mt-0.5">
              Game: <span className="font-bold text-amber-500">{gameTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Showcase Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First Double 5★ Pull or World Boss Solo Clear"
              className="w-full p-2.5 rounded-xl border text-sm font-bold focus:outline-none"
              style={inputStyles}
            />
          </div>

          {/* Image Picker / Upload */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Screenshot Image *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (http://... or /uploads/...)"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                    color: isCyber ? "#00F5FF" : "#1E293B",
                  }}
                >
                  <span>{isUploading ? "⏳ Uploading..." : "📁 Upload Screenshot"}</span>
                </button>
                {imageUrl && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    ✓ Image Ready
                  </span>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-2.5 rounded-xl overflow-hidden aspect-video border relative bg-black/40 max-h-48">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Category
            </label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={SHOWCASE_CATEGORY_OPTIONS}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="e.g. Luck, Achievement, Build"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] theme-text-muted self-center font-mono mr-1">Quick Add:</span>
              {PRESET_TAG_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    color: isCyber ? "#94A3B8" : "#475569",
                  }}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Won both rate-up 5★ characters in one ten pull on pity 25!"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          {/* Favorite Pin Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="showcaseIsFavorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-amber-500"
            />
            <label htmlFor="showcaseIsFavorite" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
              <span>⭐ Pin to Top / Highlight Memory</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            {itemToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
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
              disabled={isSaving || isUploading || isDeleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#FF6B35",
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
              }}
            >
              {isSaving ? "Saving..." : itemToEdit ? "Save Changes" : "Add to Gallery"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
