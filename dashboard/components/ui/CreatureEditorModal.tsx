"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  CreatureEntry,
  CreatureMedia,
  CLASSIFICATION_PRESETS,
  CREATURE_MEDIA_TYPES,
  validateCreatureJson,
  normalizeCreatureJson,
  exportCreatureToJson,
} from "@/lib/data/creatureSchema";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";

interface CreatureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatureToEdit?: CreatureEntry | null;
}

type TabKey = "basic" | "lore" | "media";

export function CreatureEditorModal({
  isOpen,
  onClose,
  creatureToEdit,
}: CreatureEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addCreature, updateCreature, deleteCreature } = useDashboardStore();
  const { confirm } = useConfirm();
  const { success: toastSuccess, warning: toastWarning, error: toastError } = useToast();

  const [editorMode, setEditorMode] = useState<"form" | "json">("form");
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [classification, setClassification] = useState("Dragon");
  const [customClassification, setCustomClassification] = useState("");
  const [species, setSpecies] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [mediaType, setMediaType] = useState("Anime");
  const [sourceYear, setSourceYear] = useState<number | "">(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Media states
  const [media, setMedia] = useState<CreatureMedia>({
    primary: null,
    card: null,
    gallery: [],
    favouriteMoment: null,
  });

  // JSON mode state
  const [jsonText, setJsonText] = useState("");
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);

  // Reset or populate fields when opened
  useEffect(() => {
    if (!isOpen) return;

    if (creatureToEdit) {
      setName(creatureToEdit.name || "");
      const isKnownPreset = Object.keys(CLASSIFICATION_PRESETS).includes(
        creatureToEdit.classification
      );
      if (isKnownPreset) {
        setClassification(creatureToEdit.classification);
        setCustomClassification("");
      } else {
        setClassification("custom");
        setCustomClassification(creatureToEdit.classification || "");
      }
      setSpecies(creatureToEdit.species || "");
      setSourceTitle(creatureToEdit.sourceTitle || "");
      setMediaType(creatureToEdit.mediaType || "Anime");
      setSourceYear(creatureToEdit.sourceYear || "");
      setDescription(creatureToEdit.description || "");
      setPersonalNote(creatureToEdit.personalNote || "");
      setIsFavorite(Boolean(creatureToEdit.isFavorite));
      setTags(creatureToEdit.tags || []);
      setMedia(creatureToEdit.media || { primary: null, card: null, gallery: [], favouriteMoment: null });
      setJsonText(JSON.stringify(exportCreatureToJson(creatureToEdit), null, 2));
    } else {
      setName("");
      setClassification("Dragon");
      setCustomClassification("");
      setSpecies("");
      setSourceTitle("");
      setMediaType("Anime");
      setSourceYear(new Date().getFullYear());
      setDescription("");
      setPersonalNote("");
      setIsFavorite(false);
      setTags([]);
      setMedia({ primary: null, card: null, gallery: [], favouriteMoment: null });
      setJsonText(
        JSON.stringify(
          {
            name: "Toothless",
            classification: "Dragon",
            species: "Night Fury",
            sourceTitle: "How to Train Your Dragon",
            mediaType: "Movie",
            sourceYear: 2010,
            description: "The rarest dragon species, playful and fiercely loyal.",
            personalNote: "The golden standard of mythical companions.",
            isFavorite: true,
            media: {
              primary: "https://...",
              card: "https://...",
            },
            tags: ["Night Fury", "Alpha"],
          },
          null,
          2
        )
      );
    }
    setEditorMode("form");
    setActiveTab("basic");
    setJsonErrors([]);
  }, [isOpen, creatureToEdit]);

  if (!isOpen) return null;

  const currentClassification =
    classification === "custom"
      ? customClassification.trim() || "Other"
      : classification;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // ── Save Creature Form ──
  const handleSave = async () => {
    if (!name.trim()) {
      toastWarning("Please enter a Creature Name.");
      setActiveTab("basic");
      return;
    }
    if (!sourceTitle.trim()) {
      toastWarning("Please enter the Source Work Title.");
      setActiveTab("basic");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<CreatureEntry> = {
        name: name.trim(),
        classification: currentClassification,
        species: species.trim() || undefined,
        sourceTitle: sourceTitle.trim(),
        mediaType,
        sourceYear: sourceYear ? Number(sourceYear) : undefined,
        description: description.trim() || undefined,
        personalNote: personalNote.trim() || undefined,
        isFavorite,
        media: {
          primary: media.primary || null,
          card: media.card || media.primary || null,
          gallery: media.gallery || [],
          favouriteMoment: media.favouriteMoment || null,
        },
        tags,
      };

      if (creatureToEdit?.id) {
        await updateCreature(creatureToEdit.id, payload);
        toastSuccess(`Updated creature "${payload.name}"!`);
      } else {
        await addCreature(payload);
        toastSuccess(`Archived new creature "${payload.name}"!`);
      }
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      toastError("Failed to save creature: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Apply JSON Mode ──
  const handleApplyJson = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateCreatureJson(parsed);
      if (!validation.valid) {
        setJsonErrors(validation.errors.map((e) => `${e.path}: ${e.message}`));
        toastWarning("JSON has validation errors. Please check below.");
        return;
      }
      setJsonErrors([]);
      const normalized = normalizeCreatureJson(parsed, creatureToEdit?.id);

      if (creatureToEdit?.id) {
        await updateCreature(creatureToEdit.id, normalized);
        toastSuccess(`Applied JSON updates to "${normalized.name}"!`);
      } else {
        await addCreature(normalized);
        toastSuccess(`Imported creature "${normalized.name}" from JSON!`);
      }
      onClose();
    } catch (err: any) {
      setJsonErrors([err.message || "Invalid JSON syntax."]);
      toastError("Failed to parse JSON.");
    }
  };

  // ── Delete Creature ──
  const handleDelete = () => {
    if (!creatureToEdit) return;
    confirm({
      title: `Delete Creature "${creatureToEdit.name}"?`,
      message: `Are you sure you want to remove ${creatureToEdit.name} from your personal Creature Archive?`,
      confirmText: "Delete Creature",
      variant: "danger",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteCreature(creatureToEdit.id);
          toastSuccess(`Deleted creature "${creatureToEdit.name}".`);
          onClose();
        } catch (err: any) {
          toastError("Failed to delete creature.");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const inputStyle = `w-full px-3.5 py-2 rounded-xl text-xs font-mono transition-all border outline-none ${
    isCyber
      ? "bg-black/40 border-cyan-500/30 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,245,255,0.25)]"
      : "bg-white border-2 border-black text-black placeholder-slate-400 shadow-[2px_2px_0px_#000000] focus:bg-amber-50"
  }`;

  const labelStyle = "block text-xs font-mono font-bold uppercase tracking-wider mb-1 opacity-75";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border z-10 ${
            isCyber
              ? "bg-[#050816] border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(0,245,255,0.2)]"
              : "bg-[#FFFBF5] border-3 border-black text-black shadow-[8px_8px_0px_0px_#000000]"
          }`}
        >
          {/* ── MODAL HEADER ── */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isCyber
                ? "bg-[#080c1a]/90 border-cyan-500/20"
                : "bg-white border-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              <div>
                <h3 className="text-base font-black font-mono uppercase tracking-wider">
                  {creatureToEdit ? `Edit: ${creatureToEdit.name}` : "Archive New Creature"}
                </h3>
                <span className="text-[11px] font-mono opacity-60">
                  Personal Bestiary & Creature Scrapbook
                </span>
              </div>
            </div>

            {/* Form Mode vs JSON Mode Toggle */}
            <div className="flex items-center gap-2">
              <div
                className={`flex p-0.5 rounded-xl border ${
                  isCyber ? "bg-black/50 border-white/10" : "bg-slate-100 border-black/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditorMode("form")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    editorMode === "form"
                      ? isCyber
                        ? "bg-cyan-500 text-black font-black shadow"
                        : "bg-black text-white font-black"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  Form
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("json")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    editorMode === "json"
                      ? isCyber
                        ? "bg-cyan-500 text-black font-black shadow"
                        : "bg-black text-white font-black"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  JSON
                </button>
              </div>

              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-mono font-bold transition-all border cursor-pointer ${
                  isCyber
                    ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                    : "bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#000000]"
                }`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── FORM TABS (When in Form Mode) ── */}
          {editorMode === "form" && (
            <div
              className={`flex items-center gap-2 px-6 py-2 border-b shrink-0 text-xs font-mono font-bold ${
                isCyber ? "bg-[#080c1a]/50 border-white/10" : "bg-amber-50/50 border-black/10"
              }`}
            >
              <button
                onClick={() => setActiveTab("basic")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "basic"
                    ? isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                1. Identity & Classification
              </button>
              <button
                onClick={() => setActiveTab("lore")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "lore"
                    ? isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                2. Lore & Personal Note
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "media"
                    ? isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                3. Artwork & Media
              </button>
            </div>
          )}

          {/* ── FORM CONTENT / SCROLLABLE BODY ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {editorMode === "json" ? (
              /* JSON WORKSPACE MODE */
              <div className="space-y-4">
                <div
                  className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                    isCyber
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200"
                      : "bg-blue-50 border-blue-400 text-blue-950"
                  }`}
                >
                  💻 <strong>In-Editor JSON Workspace:</strong> Directly import, export, or edit creature records as JSON. This keeps the primary collection header clean while empowering full JSON backups and imports.
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className={labelStyle}>Creature JSON Data</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(jsonText);
                        toastSuccess("Copied creature JSON to clipboard!");
                      }}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Copy JSON 📋
                    </button>
                  </div>
                  <textarea
                    rows={16}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className={`${inputStyle} font-mono text-xs leading-relaxed`}
                  />
                </div>

                {jsonErrors.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono space-y-1">
                    <strong className="block font-bold">Validation Errors:</strong>
                    {jsonErrors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* FORM MODE */
              <>
                {/* TAB 1: IDENTITY & CLASSIFICATION */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    {/* Name & Species */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelStyle}>Creature Name *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Toothless, Appa, Chopper..."
                          className={inputStyle}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Species / Sub-type</label>
                        <input
                          type="text"
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                          placeholder="e.g. Night Fury, Sky Bison, Kitsune..."
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Extensible Classification */}
                    <div className="space-y-2">
                      <label className={labelStyle}>Classification *</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(CLASSIFICATION_PRESETS).map((key) => {
                          const meta = CLASSIFICATION_PRESETS[key];
                          const isSelected = classification === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setClassification(key);
                                setCustomClassification("");
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? isCyber
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.4)]"
                                    : "bg-black text-white border-2 border-black"
                                  : isCyber
                                  ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                                  : "bg-white text-slate-800 border border-black/20 hover:bg-amber-100"
                              }`}
                            >
                              <span>{meta.icon}</span>
                              <span>{meta.label}</span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setClassification("custom")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                            classification === "custom"
                              ? isCyber
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.4)]"
                                : "bg-black text-white border-2 border-black"
                              : isCyber
                              ? "bg-white/5 text-slate-300 border-white/10"
                              : "bg-white text-slate-800 border border-black/20"
                          }`}
                        >
                          ✏️ Custom...
                        </button>
                      </div>

                      {classification === "custom" && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={customClassification}
                            onChange={(e) => setCustomClassification(e.target.value)}
                            placeholder="Type custom classification (e.g. Chimera, Cyber-Beast, Elemental)..."
                            className={inputStyle}
                          />
                        </div>
                      )}
                    </div>

                    {/* Source Work Title, Media Type, Release Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className={labelStyle}>Source Title *</label>
                        <input
                          type="text"
                          value={sourceTitle}
                          onChange={(e) => setSourceTitle(e.target.value)}
                          placeholder="e.g. How to Train Your Dragon"
                          className={inputStyle}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Media Type</label>
                        <select
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value)}
                          className={inputStyle}
                        >
                          {CREATURE_MEDIA_TYPES.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelStyle}>Release Year</label>
                        <input
                          type="number"
                          value={sourceYear}
                          onChange={(e) =>
                            setSourceYear(e.target.value ? Number(e.target.value) : "")
                          }
                          placeholder="e.g. 2010"
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className={labelStyle}>Personal Tags</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                              isCyber
                                ? "bg-white/5 border-cyan-500/30 text-cyan-200"
                                : "bg-white border border-black shadow-[1px_1px_0px_#000000]"
                            }`}
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="opacity-60 hover:opacity-100 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag (e.g. Alpha, Loyal, Fluffy) and press Enter"
                          className={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold shrink-0 cursor-pointer ${
                            isCyber
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-black text-white"
                          }`}
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Favorite Pin Checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="isFavoriteCreature"
                        checked={isFavorite}
                        onChange={(e) => setIsFavorite(e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-amber-400"
                      />
                      <label
                        htmlFor="isFavoriteCreature"
                        className="text-xs font-mono font-bold cursor-pointer"
                      >
                        ⭐ Pin as Featured / Highlight in Creature Spotlight
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: LORE & PERSONAL NOTE */}
                {activeTab === "lore" && (
                  <div className="space-y-5">
                    {/* Canonical Lore */}
                    <div className="space-y-1">
                      <label className={labelStyle}>Official Lore & Background</label>
                      <p className="text-[11px] font-mono opacity-60 mb-1">
                        Canonical information about the creature&apos;s origin, powers, and role in the story.
                      </p>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. The unholy offspring of lightning and death itself..."
                        className={inputStyle}
                      />
                    </div>

                    {/* WHY I LOVE THIS CREATURE (Personal Scrapbook Note) */}
                    <div
                      className={`p-4 rounded-2xl border space-y-2 ${
                        isCyber
                          ? "bg-pink-950/20 border-pink-500/40 text-pink-100"
                          : "bg-pink-50 border-2 border-black shadow-[3px_3px_0px_#000000]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">💖</span>
                        <label className="text-xs font-mono font-black uppercase tracking-wider text-pink-400">
                          Why I Love This Creature * (Personal Scrapbook Note)
                        </label>
                      </div>
                      <p className="text-[11px] font-mono opacity-75">
                        Your personal reflections on why this creature stole your heart. What makes them so special to you?
                      </p>
                      <textarea
                        rows={4}
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        placeholder="Write why you love this creature..."
                        className={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: ARTWORK & MEDIA */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    {/* SLOT 1: PRIMARY ARTWORK */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 border-white/10">
                        <div>
                          <span className="text-xs font-mono font-black uppercase tracking-wider text-cyan-400 block">
                            Slot 1: Primary Artwork (Hero / Dossier Banner)
                          </span>
                          <span className="text-[11px] font-mono opacity-60">
                            Dominant artwork displayed on the Creature Dossier and Spotlight.
                          </span>
                        </div>
                      </div>

                      <CharacterImageUploader
                        label="Primary Artwork"
                        value={media.primary || ""}
                        onChange={(url) => setMedia((prev) => ({ ...prev, primary: url }))}
                        onClear={() => setMedia((prev) => ({ ...prev, primary: null }))}
                        aspect={16 / 9}
                        hint="16:9 or 4:3 artwork recommended."
                        previewClass="h-44 w-full"
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono opacity-60">
                          Or direct image URL:
                        </label>
                        <input
                          type="text"
                          value={media.primary || ""}
                          onChange={(e) => setMedia((prev) => ({ ...prev, primary: e.target.value }))}
                          placeholder="https://..."
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* SLOT 2: CARD POSTER */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 border-white/10">
                        <div>
                          <span className="text-xs font-mono font-black uppercase tracking-wider text-cyan-400 block">
                            Slot 2: Card Poster (3:4 Portrait)
                          </span>
                          <span className="text-[11px] font-mono opacity-60">
                            Optional portrait image optimized for the collection card. Falls back to Primary Artwork.
                          </span>
                        </div>
                      </div>

                      <CharacterImageUploader
                        label="Card Poster"
                        value={media.card || ""}
                        onChange={(url) => setMedia((prev) => ({ ...prev, card: url }))}
                        onClear={() => setMedia((prev) => ({ ...prev, card: null }))}
                        aspect={3 / 4}
                        hint="3:4 portrait crop recommended for card grid."
                        previewClass="h-48 w-36 mx-auto"
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono opacity-60">
                          Or direct card poster URL:
                        </label>
                        <input
                          type="text"
                          value={media.card || ""}
                          onChange={(e) => setMedia((prev) => ({ ...prev, card: e.target.value }))}
                          placeholder="https://..."
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    {/* SLOT 3: FAVOURITE MOMENT */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 border-white/10">
                        <div>
                          <span className="text-xs font-mono font-black uppercase tracking-wider text-pink-400 block">
                            Slot 3: Favourite Moment / Scene
                          </span>
                          <span className="text-[11px] font-mono opacity-60">
                            Optional picture of an iconic scene or tender moment.
                          </span>
                        </div>
                      </div>

                      <CharacterImageUploader
                        label="Favourite Moment"
                        value={media.favouriteMoment || ""}
                        onChange={(url) => setMedia((prev) => ({ ...prev, favouriteMoment: url }))}
                        onClear={() => setMedia((prev) => ({ ...prev, favouriteMoment: null }))}
                        aspect={16 / 9}
                        hint="Widescreen scene capture."
                        previewClass="h-40 w-full"
                      />
                    </div>

                    {/* SLOT 4: GALLERY */}
                    <div className="space-y-3">
                      <GalleryUploader
                        images={media.gallery || []}
                        onChange={(images) => setMedia((prev) => ({ ...prev, gallery: images }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── MODAL FOOTER ── */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-t shrink-0 ${
              isCyber
                ? "bg-[#080c1a]/95 border-cyan-500/20"
                : "bg-white border-black"
            }`}
          >
            {creatureToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "🗑 Delete"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                  isCyber
                    ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    : "bg-slate-100 text-slate-800 border border-black/20"
                }`}
              >
                Cancel
              </button>

              {editorMode === "json" ? (
                <button
                  type="button"
                  onClick={handleApplyJson}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isCyber
                      ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                      : "bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000000]"
                  }`}
                >
                  Apply JSON
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isCyber
                      ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.5)]"
                      : "bg-black text-white hover:bg-slate-800 border-2 border-black shadow-[3px_3px_0px_#000000]"
                  }`}
                >
                  {isSaving ? "Saving..." : creatureToEdit ? "Save Changes" : "Archive Creature"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
