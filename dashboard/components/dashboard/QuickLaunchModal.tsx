"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { Modal } from "@/components/ui/modal";
import { QuickLaunchShortcut, DEFAULT_QUICK_LAUNCH_SHORTCUTS } from "@/lib/data/guestSeedData";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Globe,
  Sparkles,
  Bot,
  Gamepad2,
  Tv,
  Film,
  Music,
  Heart,
  Shield,
  Trophy,
  FileText,
  Terminal,
  Bookmark,
  Compass,
} from "lucide-react";

export const PRESET_INTERNAL_ROUTES = [
  { label: "Dashboard (Home)", route: "/dashboard", icon: "compass", color: "#00F5FF" },
  { label: "Game Database", route: "/games", icon: "gamepad", color: "#00F5FF" },
  { label: "Game Characters", route: "/game-characters", icon: "gamepad", color: "#39FF14" },
  { label: "Character Dictionary", route: "/characters", icon: "trophy", color: "#FFD700" },
  { label: "Couples & Romance", route: "/couples", icon: "heart", color: "#FF7EB9" },
  { label: "Creature Archive", route: "/creatures", icon: "shield", color: "#39FF14" },
  { label: "Hall of Fame", route: "/hall-of-fame", icon: "trophy", color: "#FFD700" },
  { label: "Anime Zone", route: "/anime", icon: "tv", color: "#BF5FFF" },
  { label: "Drama Vault", route: "/drama", icon: "film", color: "#EF476F" },
  { label: "Music Station", route: "/music", icon: "music", color: "#00F5FF" },
  { label: "Notepad", route: "/notepad", icon: "file-text", color: "#FFD166" },
  { label: "Media Gallery", route: "/gallery", icon: "film", color: "#06D6A0" },
  { label: "Prompt Vault", route: "/prompt-vault", icon: "sparkles", color: "#FF6B35" },
  { label: "AI Library", route: "/ai-library", icon: "bot", color: "#00F5FF" },
  { label: "Bookmarks", route: "/links", icon: "bookmark", color: "#38BDF8" },
  { label: "Hobbies & Skills", route: "/hobbies", icon: "terminal", color: "#A855F7" },
  { label: "Emergency Contacts", route: "/emergency", icon: "shield", color: "#EF4444" },
];

export const PRESET_ICONS = [
  { id: "youtube", label: "YouTube", icon: Film, color: "#FF0000" },
  { id: "cursor", label: "Cursor", icon: Terminal, color: "#00F5FF" },
  { id: "discord", label: "Discord", icon: Bot, color: "#5865F2" },
  { id: "gemini", label: "Gemini", icon: Sparkles, color: "#4F46E5" },
  { id: "heart", label: "Couples", icon: Heart, color: "#FF7EB9" },
  { id: "shield", label: "Creatures", icon: Shield, color: "#39FF14" },
  { id: "file-text", label: "Notepad", icon: FileText, color: "#FFD166" },
  { id: "gamepad", label: "Games", icon: Gamepad2, color: "#00F5FF" },
  { id: "tv", label: "Anime", icon: Tv, color: "#BF5FFF" },
  { id: "film", label: "Drama", icon: Film, color: "#EF476F" },
  { id: "music", label: "Music", icon: Music, color: "#00F5FF" },
  { id: "trophy", label: "Hall of Fame", icon: Trophy, color: "#FFD700" },
  { id: "bot", label: "AI Tools", icon: Bot, color: "#06D6A0" },
  { id: "bookmark", label: "Bookmarks", icon: Bookmark, color: "#38BDF8" },
  { id: "compass", label: "Explorer", icon: Compass, color: "#F97316" },
  { id: "globe", label: "Web", icon: Globe, color: "#94A3B8" },
];

export function getShortcutIcon(iconKey?: string) {
  const match = PRESET_ICONS.find((i) => i.id === iconKey?.toLowerCase());
  return match ? match.icon : Globe;
}

interface QuickLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: QuickLaunchShortcut[];
  onSave: (shortcuts: QuickLaunchShortcut[]) => Promise<void> | void;
  initialAddMode?: boolean;
}

export function QuickLaunchModal({
  isOpen,
  onClose,
  shortcuts: initialShortcuts,
  onSave,
  initialAddMode = false,
}: QuickLaunchModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [shortcuts, setShortcuts] = useState<QuickLaunchShortcut[]>(initialShortcuts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(initialAddMode);

  // Form State for Add / Edit
  const [name, setName] = useState("");
  const [type, setType] = useState<"internal" | "external">("internal");
  const [target, setTarget] = useState("/dashboard");
  const [icon, setIcon] = useState("compass");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [color, setColor] = useState("#00F5FF");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setShortcuts(initialShortcuts);
  }, [initialShortcuts]);

  useEffect(() => {
    if (initialAddMode) {
      resetForm();
      setIsAdding(true);
    }
  }, [initialAddMode]);

  const resetForm = () => {
    setName("");
    setType("internal");
    setTarget("/dashboard");
    setIcon("compass");
    setOpenInNewTab(false);
    setColor(isCyber ? "#00F5FF" : "#FF6B35");
    setEditingId(null);
    setIsAdding(false);
    setFormError("");
  };

  const handleStartEdit = (sc: QuickLaunchShortcut) => {
    setEditingId(sc.id);
    setIsAdding(false);
    setName(sc.name);
    setType(sc.type);
    setTarget(sc.target);
    setIcon(sc.icon || "globe");
    setOpenInNewTab(Boolean(sc.openInNewTab));
    setColor(sc.color || (isCyber ? "#00F5FF" : "#FF6B35"));
    setFormError("");
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Shortcut name is required.");
      return;
    }

    let finalTarget = target.trim();
    if (!finalTarget) {
      setFormError("Target route or URL is required.");
      return;
    }

    if (type === "external") {
      if (!/^https?:\/\//i.test(finalTarget)) {
        finalTarget = `https://${finalTarget}`;
      }
    } else {
      if (!finalTarget.startsWith("/")) {
        finalTarget = `/${finalTarget}`;
      }
    }

    if (editingId) {
      // Update existing
      setShortcuts((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: name.trim(),
                type,
                target: finalTarget,
                icon,
                openInNewTab,
                color,
              }
            : s
        )
      );
    } else {
      // Add new
      const newShortcut: QuickLaunchShortcut = {
        id: `ql-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name.trim(),
        type,
        target: finalTarget,
        icon,
        openInNewTab,
        color,
      };
      setShortcuts((prev) => [...prev, newShortcut]);
    }

    resetForm();
  };

  const handleRemove = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setShortcuts((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === shortcuts.length - 1) return;
    setShortcuts((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleResetDefaults = () => {
    setShortcuts(DEFAULT_QUICK_LAUNCH_SHORTCUTS);
    resetForm();
  };

  const handleCommitSave = async () => {
    setIsSaving(true);
    try {
      await onSave(shortcuts);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 md:p-6 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 dark:border-white/10">
          <div>
            <h2
              className="text-lg md:text-xl font-black uppercase tracking-wider flex items-center gap-2"
              style={{
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
            >
              <span>⚡</span> {isCyber ? "CUSTOMIZE // QUICK LAUNCH" : "Customize Quick Launch"}
            </h2>
            <p className="text-xs theme-text-secondary mt-0.5">
              Personal launcher shortcuts for internal dashboard pages and external tools
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-transparent hover:border-white/20 transition-all text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts List & Reorder Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-muted">
              Active Shortcuts ({shortcuts.length})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 transition-all active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                  color: isCyber ? "#E2E8F0" : "#475569",
                }}
                title="Restore default shortcut presets"
              >
                <RotateCcw size={12} />
                <span>Reset Presets</span>
              </button>
              {!isAdding && !editingId && (
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "#00F5FF20" : "#FF6B35",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#FFFFFF",
                    boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000",
                  }}
                >
                  <Plus size={14} />
                  <span>Add Shortcut</span>
                </button>
              )}
            </div>
          </div>

          {/* List of shortcuts */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {shortcuts.length === 0 ? (
              <div className="p-6 text-center border rounded-xl border-dashed border-white/20">
                <p className="text-xs theme-text-muted italic">No shortcuts in your Quick Launch.</p>
                <button
                  onClick={handleStartAdd}
                  className="mt-2 text-xs font-bold text-cyan-400 hover:underline"
                >
                  + Add your first shortcut
                </button>
              </div>
            ) : (
              shortcuts.map((sc, index) => {
                const IconComp = getShortcutIcon(sc.icon);
                const isSelected = editingId === sc.id;
                return (
                  <motion.div
                    key={sc.id}
                    layout
                    className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? isCyber
                          ? "rgba(0,245,255,0.1)"
                          : "#FEF3C7"
                        : isCyber
                        ? "rgba(255,255,255,0.03)"
                        : "#F8FAFC",
                      borderColor: isSelected
                        ? isCyber
                          ? "#00F5FF"
                          : "#F59E0B"
                        : isCyber
                        ? "rgba(255,255,255,0.08)"
                        : "#E2E8F0",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === shortcuts.length - 1}
                          onClick={() => handleMoveDown(index)}
                          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      {/* Icon badge */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
                        style={{
                          backgroundColor: `${sc.color || "#00F5FF"}18`,
                          borderColor: `${sc.color || "#00F5FF"}40`,
                          color: sc.color || "#00F5FF",
                        }}
                      >
                        <IconComp size={14} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold theme-text-primary truncate">{sc.name}</span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded border"
                            style={{
                              backgroundColor: sc.type === "internal" ? "rgba(0,245,255,0.08)" : "rgba(239,71,111,0.08)",
                              borderColor: sc.type === "internal" ? "rgba(0,245,255,0.3)" : "rgba(239,71,111,0.3)",
                              color: sc.type === "internal" ? (isCyber ? "#00F5FF" : "#0284C7") : "#EF476F",
                            }}
                          >
                            {sc.type === "internal" ? "Internal" : "External"}
                          </span>
                          {sc.openInNewTab && (
                            <span className="text-[9px] text-slate-400" title="Opens in new tab">
                              ↗
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] theme-text-muted truncate">{sc.target}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sc)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-white/20 text-slate-400 hover:text-white transition-all"
                        title="Edit shortcut"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(sc.id)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
                        title="Remove shortcut"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Add / Edit Form Drawer */}
          <AnimatePresence>
            {(isAdding || editingId) && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveForm}
                className="border rounded-2xl p-4 space-y-3"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,30,0.9)" : "#F1F5F9",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#CBD5E1",
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="font-bold text-xs theme-text-primary flex items-center gap-1.5">
                    {editingId ? <Edit2 size={13} className="text-cyan-400" /> : <Plus size={13} className="text-cyan-400" />}
                    <span>{editingId ? "Edit Shortcut" : "Add New Shortcut"}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <p className="text-[11px] text-red-400 font-bold">{formError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1">
                      Shortcut Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. YouTube, Couples, Gemini"
                      className="w-full px-3 py-1.5 rounded-xl border outline-none transition-all"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                        borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                        color: isCyber ? "#FFFFFF" : "#1A1A1A",
                      }}
                    />
                  </div>

                  {/* Type Selector */}
                  <div>
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1">
                      Shortcut Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setType("internal");
                          setTarget("/dashboard");
                        }}
                        className="py-1.5 px-2 rounded-xl text-xs font-bold border transition-all"
                        style={{
                          backgroundColor: type === "internal" ? (isCyber ? "#00F5FF20" : "#0284C720") : "transparent",
                          borderColor: type === "internal" ? (isCyber ? "#00F5FF" : "#0284C7") : isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                          color: type === "internal" ? (isCyber ? "#00F5FF" : "#0284C7") : isCyber ? "#94A3B8" : "#64748B",
                        }}
                      >
                        Internal Route
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setType("external");
                          setTarget("https://");
                          setOpenInNewTab(true);
                        }}
                        className="py-1.5 px-2 rounded-xl text-xs font-bold border transition-all"
                        style={{
                          backgroundColor: type === "external" ? (isCyber ? "#EF476F20" : "#EF476F20") : "transparent",
                          borderColor: type === "external" ? "#EF476F" : isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                          color: type === "external" ? "#EF476F" : isCyber ? "#94A3B8" : "#64748B",
                        }}
                      >
                        External URL
                      </button>
                    </div>
                  </div>

                  {/* Target Route / URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1">
                      {type === "internal" ? "Target App Page" : "Website URL (https://...)"} *
                    </label>
                    {type === "internal" ? (
                      <select
                        value={target}
                        onChange={(e) => {
                          setTarget(e.target.value);
                          const matched = PRESET_INTERNAL_ROUTES.find((r) => r.route === e.target.value);
                          if (matched) {
                            if (!name) setName(matched.label.split(" (")[0]);
                            setIcon(matched.icon);
                            setColor(matched.color);
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border outline-none cursor-pointer"
                        style={{
                          backgroundColor: isCyber ? "#0A0F1E" : "#FFFFFF",
                          borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                          color: isCyber ? "#FFFFFF" : "#1A1A1A",
                        }}
                      >
                        {PRESET_INTERNAL_ROUTES.map((route) => (
                          <option key={route.route} value={route.route} className="bg-slate-900 text-white">
                            {route.label} ({route.route})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-1.5 rounded-xl border outline-none transition-all font-mono"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                          borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                          color: isCyber ? "#FFFFFF" : "#1A1A1A",
                        }}
                      />
                    )}
                  </div>

                  {/* Icon Picker */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold theme-text-secondary mb-1.5">
                      Choose Icon
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ICONS.map((ico) => {
                        const IconComp = ico.icon;
                        const isSelected = icon === ico.id;
                        return (
                          <button
                            key={ico.id}
                            type="button"
                            onClick={() => {
                              setIcon(ico.id);
                              setColor(ico.color);
                            }}
                            className="p-1.5 rounded-lg border flex items-center gap-1 text-[11px] transition-all cursor-pointer"
                            style={{
                              backgroundColor: isSelected ? `${ico.color}25` : isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                              borderColor: isSelected ? ico.color : isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                              color: isSelected ? ico.color : isCyber ? "#94A3B8" : "#475569",
                              boxShadow: isSelected && isCyber ? `0 0 8px ${ico.color}30` : "none",
                            }}
                            title={ico.label}
                          >
                            <IconComp size={13} style={{ color: ico.color }} />
                            <span>{ico.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open in new tab toggle */}
                  <div className="sm:col-span-2 flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={openInNewTab}
                        onChange={(e) => setOpenInNewTab(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-xs font-bold theme-text-primary">
                        Open in New Tab (recommended for external links)
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                        color: isCyber ? "#000000" : "#FFFFFF",
                        borderColor: isCyber ? "#00F5FF" : "#000000",
                        boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                      }}
                    >
                      {editingId ? "Update Item" : "+ Insert Shortcut"}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] theme-text-muted">
            Changes will be saved to your personal profile.
          </span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-white/15 theme-text-secondary hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCommitSave}
              className="px-5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "#00F5FF" : "#1A1A1A",
                color: isCyber ? "#000000" : "#FFFFFF",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.4)" : "3px 3px 0 #000000",
              }}
            >
              <Check size={14} />
              <span>{isSaving ? "Saving..." : "Save Launcher"}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
