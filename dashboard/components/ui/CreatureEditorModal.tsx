"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import {
  CreatureEntry,
  CreatureForm,
  CreatureMedia,
  CreatureTier,
  CreatureCharacterRef,
  CLASSIFICATION_PRESETS,
  CREATURE_MEDIA_TYPES,
  CREATURE_TIERS,
  CREATURE_TIER_META,
  CREATURE_RELATIONSHIP_TYPES,
  validateCreatureJson,
  normalizeCreatureJson,
  exportCreatureToJson,
} from "@/lib/data/creatureSchema";
import { CharacterSearchResult } from "@/app/api/characters/search/route";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";
import { CreatureFormCard } from "@/components/creatures/CreatureFormCard";

interface CreatureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatureToEdit?: CreatureEntry | null;
}

type TabKey = "basic" | "lore" | "media" | "connections" | "forms";

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

  // Form states matching CreatureEntry schema
  const [name, setName] = useState("");
  const [classification, setClassification] = useState("Dragon");
  const [customClassification, setCustomClassification] = useState("");
  const [species, setSpecies] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [mediaType, setMediaType] = useState("Anime");
  const [sourceYear, setSourceYear] = useState<number | "">(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [tier, setTier] = useState<CreatureTier>("S");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Connected Characters
  const [connectedCharacters, setConnectedCharacters] = useState<CreatureCharacterRef[]>([]);
  const [charSearchQuery, setCharSearchQuery] = useState("");
  const [charSearchResults, setCharSearchResults] = useState<CharacterSearchResult[]>([]);
  const [isSearchingChars, setIsSearchingChars] = useState(false);

  // Forms
  const [forms, setForms] = useState<CreatureForm[]>([]);
  // Editing state for an in-progress form (null = not editing)
  const [editingFormIdx, setEditingFormIdx] = useState<number | null>(null);
  const [formDraft, setFormDraft] = useState<Partial<CreatureForm>>({});

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
      setTier(creatureToEdit.tier || "S");
      setIsFavorite(Boolean(creatureToEdit.isFavorite));
      setTags(creatureToEdit.tags || []);
      setConnectedCharacters(creatureToEdit.connectedCharacters || []);
      setMedia(creatureToEdit.media || { primary: null, card: null, gallery: [], favouriteMoment: null });
      setForms(creatureToEdit.forms || []);
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
      setTier("S");
      setIsFavorite(false);
      setTags([]);
      setConnectedCharacters([]);
      setMedia({ primary: null, card: null, gallery: [], favouriteMoment: null });
      setForms([]);
      setJsonText(
        JSON.stringify(
          {
            name: "Toothless",
            classification: "Dragon",
            species: "Night Fury",
            sourceTitle: "How to Train Your Dragon",
            mediaType: "Movie",
            sourceYear: 2010,
            tier: "SS",
            description: "The rarest dragon species, playful and fiercely loyal.",
            personalNote: "The golden standard of mythical companions.",
            isFavorite: true,
            media: {
              primary: "https://...",
              card: "https://...",
            },
            tags: ["Night Fury", "Alpha"],
            connectedCharacters: [
              {
                characterId: "sample-hiccup",
                characterType: "character_dict",
                name: "Hiccup",
                sourceTitle: "How to Train Your Dragon",
                relationshipType: "Partner",
              },
            ],
          },
          null,
          2
        )
      );
    }
    setActiveTab("basic");
    setEditorMode("form");
    setJsonErrors([]);
    setCharSearchQuery("");
    setCharSearchResults([]);
    setEditingFormIdx(null);
    setFormDraft({});
  }, [isOpen, creatureToEdit]);

  // Debounced search for characters
  useEffect(() => {
    const q = charSearchQuery.trim();
    if (!q || q.length < 2) {
      setCharSearchResults([]);
      setIsSearchingChars(false);
      return;
    }

    setIsSearchingChars(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/characters/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCharSearchResults(data);
        } else {
          setCharSearchResults([]);
        }
      } catch (err) {
        console.error("Character search query error:", err);
        setCharSearchResults([]);
      } finally {
        setIsSearchingChars(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [charSearchQuery]);

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

  // ── Connection Management ──
  const handleConnectCharacter = (char: CharacterSearchResult) => {
    if (connectedCharacters.some((c) => c.characterId === char.id)) {
      toastWarning(`"${char.name}" is already connected.`);
      return;
    }

    const newRef: CreatureCharacterRef = {
      characterId: char.id,
      characterType: char.characterType,
      name: char.name,
      avatar: char.avatar || null,
      sourceTitle: char.sourceTitle,
      relationshipType: "Companion",
    };

    setConnectedCharacters((prev) => [...prev, newRef]);
    toastSuccess(`Connected "${char.name}" as Companion!`);
    setCharSearchQuery("");
    setCharSearchResults([]);
  };

  const handleRemoveConnection = (characterId: string) => {
    setConnectedCharacters((prev) => prev.filter((c) => c.characterId !== characterId));
  };

  const handleUpdateRelationshipType = (characterId: string, relType: string) => {
    setConnectedCharacters((prev) =>
      prev.map((c) => (c.characterId === characterId ? { ...c, relationshipType: relType } : c))
    );
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
        tier,
        isFavorite,
        media: {
          primary: media.primary || null,
          card: media.card || media.primary || null,
          gallery: media.gallery || [],
          favouriteMoment: media.favouriteMoment || null,
        },
        tags,
        connectedCharacters,
        forms: forms.length > 0 ? forms : [],
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
        toastSuccess(`Updated creature from JSON!`);
      } else {
        await addCreature(normalized);
        toastSuccess(`Created creature from JSON!`);
      }
      onClose();
    } catch (err: any) {
      toastError("Invalid JSON syntax: " + err.message);
    }
  };

  // ── Delete Creature ──
  const handleDelete = () => {
    if (!creatureToEdit) return;
    confirm({
      title: `Delete ${creatureToEdit.name}?`,
      message: `Are you sure you want to delete "${creatureToEdit.name}" from your creature collection? This action cannot be undone.`,
      confirmText: "Delete Creature",
      cancelText: "Cancel",
      variant: "danger",
      actionType: "delete",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteCreature(creatureToEdit.id);
          toastSuccess(`Deleted creature "${creatureToEdit.name}".`);
          onClose();
        } catch (err: any) {
          toastError("Failed to delete creature: " + err.message);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const inputStyle = `w-full px-3.5 py-2 rounded-xl text-xs font-mono border transition-all focus:outline-none ${
    isCyber
      ? "bg-white/5 border-white/10 text-white focus:border-cyan-400 focus:bg-white/10"
      : "bg-white border-2 border-black text-black focus:bg-amber-50"
  }`;

  const labelStyle = "block text-xs font-mono font-bold uppercase tracking-wider mb-1 opacity-80";

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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className={`relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border shadow-2xl transition-all ${
            isCyber
              ? "bg-[#060914] border-cyan-500/40 text-slate-100 shadow-[0_0_50px_rgba(0,245,255,0.2)]"
              : "bg-[#FFFDF9] border-3 border-black text-black shadow-[8px_8px_0px_0px_#000000]"
          }`}
        >
          {/* ── MODAL HEADER ── */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isCyber
                ? "bg-[#080c1a]/95 border-cyan-500/20"
                : "bg-white border-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              <div>
                <h3 className="text-base sm:text-lg font-black font-mono tracking-tight leading-none">
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
                  onClick={() => {
                    // Update JSON preview before switching
                    const liveState: Partial<CreatureEntry> = {
                      id: creatureToEdit?.id,
                      name,
                      classification: currentClassification,
                      species: species || undefined,
                      sourceTitle,
                      mediaType,
                      sourceYear: sourceYear ? Number(sourceYear) : undefined,
                      description: description || undefined,
                      personalNote: personalNote || undefined,
                      tier,
                      isFavorite,
                      media,
                      tags,
                      connectedCharacters,
                    };
                    setJsonText(JSON.stringify(exportCreatureToJson(liveState), null, 2));
                    setEditorMode("json");
                  }}
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
              className={`flex items-center gap-2 px-6 py-2 border-b shrink-0 text-xs font-mono font-bold overflow-x-auto ${
                isCyber ? "bg-[#080c1a]/50 border-white/10" : "bg-amber-50/50 border-black/10"
              }`}
            >
              <button
                onClick={() => setActiveTab("basic")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeTab === "basic"
                    ? isCyber
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                1. Identity & Tier
              </button>
              <button
                onClick={() => setActiveTab("lore")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeTab === "lore"
                    ? isCyber
                      ? "bg-pink-500/20 text-pink-300 border border-pink-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                2. Lore & Scrapbook
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeTab === "media"
                    ? isCyber
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                3. Artwork & Media
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "connections"
                    ? isCyber
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <span>4. Connected Characters</span>
                {connectedCharacters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-black font-black">
                    {connectedCharacters.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("forms")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "forms"
                    ? isCyber
                      ? "bg-violet-500/20 text-violet-300 border border-violet-400"
                      : "bg-black text-white"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <span>5. Forms &amp; Variants</span>
                {forms.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-violet-500 text-black font-black">
                    {forms.length}
                  </span>
                )}
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
                  💻 <strong>In-Editor JSON Workspace:</strong> Directly import, export, or edit creature records as JSON. Tiers and character connections are fully supported.
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

                    {/* Canonical Creature Tier */}
                    <div className="space-y-2 pt-1">
                      <label className={labelStyle}>Canonical Tier / Ranking *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {CREATURE_TIERS.map((t) => {
                          const meta = CREATURE_TIER_META[t];
                          const isSelected = tier === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTier(t)}
                              className={`p-2.5 rounded-xl border text-center font-mono transition-all cursor-pointer ${
                                isSelected
                                  ? isCyber
                                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.35)]"
                                    : "bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000]"
                                  : isCyber
                                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                  : "bg-white border border-black/20 text-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              <span className="block text-base font-black">{t}</span>
                              <span className="text-[10px] opacity-75 block truncate">{meta.label.split(" ")[0]}</span>
                            </button>
                          );
                        })}
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

                {/* TAB 4: CONNECTED CHARACTERS */}
                {activeTab === "connections" && (
                  <div className="space-y-5">
                    {/* Header & Description */}
                    <div
                      className={`p-3.5 rounded-2xl border text-xs font-mono leading-relaxed ${
                        isCyber
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                          : "bg-amber-50 border-2 border-black shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      🔗 <strong>Relational Character Connections:</strong> Connect this creature to characters from your <strong>Character Dictionary</strong> or <strong>Game Characters</strong>. When connected, this creature will dynamically appear in that character&apos;s information profile!
                    </div>

                    {/* Searchable Character Connection Picker */}
                    <div className="space-y-2">
                      <label className={labelStyle}>Search & Connect Characters</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs opacity-60 pointer-events-none">🔎</span>
                        <input
                          type="text"
                          value={charSearchQuery}
                          onChange={(e) => setCharSearchQuery(e.target.value)}
                          placeholder="Type character name, alias, or source work..."
                          className={`${inputStyle} pl-9`}
                        />
                        {isSearchingChars && (
                          <span className="absolute right-3 top-2.5 text-xs opacity-60 animate-spin">⏳</span>
                        )}
                      </div>

                      {/* Search Results Dropdown / Picker List */}
                      {charSearchResults.length > 0 && (
                        <div
                          className={`rounded-2xl border p-2 space-y-1 max-h-60 overflow-y-auto ${
                            isCyber
                              ? "bg-[#0b1026] border-cyan-500/30"
                              : "bg-white border-2 border-black shadow-[4px_4px_0px_#000]"
                          }`}
                        >
                          {charSearchResults.map((res) => {
                            const isAlreadyConnected = connectedCharacters.some(
                              (c) => c.characterId === res.id
                            );
                            const isDict = res.characterType === "character_dict";

                            return (
                              <div
                                key={res.id}
                                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all ${
                                  isCyber
                                    ? "bg-white/5 border-white/10 hover:border-cyan-400/50"
                                    : "bg-slate-50 border-black/15 hover:bg-amber-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {res.avatar ? (
                                    <img
                                      src={res.avatar}
                                      alt={res.name}
                                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                      👤
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <strong className="block truncate font-bold">{res.name}</strong>
                                    <div className="flex items-center gap-1.5 text-[10px] opacity-75">
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-bold ${
                                          isDict
                                            ? isCyber
                                              ? "bg-amber-500/20 text-amber-300"
                                              : "bg-amber-200 text-amber-900"
                                            : isCyber
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "bg-purple-200 text-purple-900"
                                        }`}
                                      >
                                        {isDict ? "Character Dict" : "Game Character"}
                                      </span>
                                      <span className="truncate">{res.sourceTitle}</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={isAlreadyConnected}
                                  onClick={() => handleConnectCharacter(res)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                                    isAlreadyConnected
                                      ? "opacity-40 cursor-not-allowed bg-gray-500/20"
                                      : isCyber
                                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30"
                                      : "bg-black text-white hover:bg-slate-800"
                                  }`}
                                >
                                  {isAlreadyConnected ? "Connected" : "+ Connect"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* List of Connected Characters */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">
                          Active Connections ({connectedCharacters.length})
                        </span>
                        {connectedCharacters.length > 0 && (
                          <span className="text-[11px] font-mono opacity-60">
                            Configure relationship type per character
                          </span>
                        )}
                      </div>

                      {connectedCharacters.length === 0 ? (
                        <div className="p-6 rounded-2xl border border-dashed text-center font-mono text-xs opacity-60 space-y-1">
                          <p>No characters connected yet.</p>
                          <p className="text-[10px]">Use the search bar above to link this creature to characters.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {connectedCharacters.map((conn) => {
                            const isDict = conn.characterType === "character_dict";
                            return (
                              <div
                                key={conn.characterId}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border ${
                                  isCyber
                                    ? "bg-white/5 border-white/10"
                                    : "bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {conn.avatar ? (
                                    <img
                                      src={conn.avatar}
                                      alt={conn.name}
                                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/20"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-base">
                                      👤
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <strong className="block text-sm font-bold truncate">
                                      {conn.name}
                                    </strong>
                                    <div className="flex items-center gap-2 text-[11px] opacity-75 flex-wrap">
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                          isDict
                                            ? isCyber
                                              ? "bg-amber-500/20 text-amber-300"
                                              : "bg-amber-100 text-amber-900 border border-amber-300"
                                            : isCyber
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "bg-purple-100 text-purple-900 border border-purple-300"
                                        }`}
                                      >
                                        {isDict ? "Character Dict" : "Game Character"}
                                      </span>
                                      {conn.sourceTitle && (
                                        <span className="truncate">{conn.sourceTitle}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Relationship type dropdown */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono opacity-60 uppercase">Role:</span>
                                    <select
                                      value={conn.relationshipType || "Companion"}
                                      onChange={(e) =>
                                        handleUpdateRelationshipType(conn.characterId, e.target.value)
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                                        isCyber
                                          ? "bg-black/60 border-white/20 text-cyan-300"
                                          : "bg-slate-100 border-black text-black"
                                      }`}
                                    >
                                      {CREATURE_RELATIONSHIP_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                          {type}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Remove Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveConnection(conn.characterId)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all border cursor-pointer ${
                                      isCyber
                                        ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                                        : "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                                    }`}
                                    title="Remove character connection"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── TAB 5: FORMS & VARIANTS ── */}
            {editorMode === "form" && activeTab === "forms" && (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-black font-mono uppercase ${isCyber ? "text-violet-300" : "text-black"}`}>
                      ✦ Forms &amp; Variants
                    </h4>
                    <p className={`text-[11px] font-mono mt-0.5 ${isCyber ? "text-slate-400" : "text-slate-600"}`}>
                      Optional — add alternate forms, evolutions, or transformations unique to this creature.
                      Each form belongs exclusively to this creature and is displayed in its Dossier.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newForm: CreatureForm = {
                        id: `form-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        name: "",
                        order: forms.length,
                      };
                      setForms((prev) => [...prev, newForm]);
                      setEditingFormIdx(forms.length);
                      setFormDraft(newForm);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                      isCyber
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30"
                        : "bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000000]"
                    }`}
                  >
                    + Add Form
                  </button>
                </div>

                {/* Empty state */}
                {forms.length === 0 && (
                  <div className={`p-8 rounded-2xl border text-center ${
                    isCyber ? "bg-white/[0.02] border-white/10 text-slate-500" : "bg-slate-50 border-2 border-dashed border-black/30 text-slate-500"
                  }`}>
                    <span className="text-3xl block mb-2">✦</span>
                    <p className="text-xs font-mono">No forms defined. Click &ldquo;+ Add Form&rdquo; to define alternate variants for this creature.</p>
                    <p className="text-[10px] font-mono opacity-60 mt-1">Forms section will only appear in the Dossier when at least one form exists.</p>
                  </div>
                )}

                {/* Form list */}
                {forms.length > 0 && (
                  <div className="space-y-3">
                    {forms.map((form, idx) => {
                      const isEditing = editingFormIdx === idx;
                      return (
                        <div
                          key={form.id || idx}
                          className={`rounded-2xl border transition-all ${
                            isEditing
                              ? isCyber
                                ? "bg-violet-950/30 border-violet-500/50"
                                : "bg-violet-50 border-2 border-black shadow-[3px_3px_0px_#000000]"
                              : isCyber
                              ? "bg-white/[0.03] border-white/10"
                              : "bg-white border-2 border-black shadow-[2px_2px_0px_#000000]"
                          }`}
                        >
                          {/* Form header row */}
                          <div className="flex items-center gap-2 p-3">
                            {/* Reorder */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = [...forms];
                                  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                  next.forEach((f, i) => (f.order = i));
                                  setForms(next);
                                  if (editingFormIdx === idx) setEditingFormIdx(idx - 1);
                                }}
                                className={`text-[10px] px-1 rounded cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${isCyber ? "hover:text-violet-300" : "hover:bg-slate-200"}`}
                              >▲</button>
                              <button
                                type="button"
                                disabled={idx === forms.length - 1}
                                onClick={() => {
                                  const next = [...forms];
                                  [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                  next.forEach((f, i) => (f.order = i));
                                  setForms(next);
                                  if (editingFormIdx === idx) setEditingFormIdx(idx + 1);
                                }}
                                className={`text-[10px] px-1 rounded cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${isCyber ? "hover:text-violet-300" : "hover:bg-slate-200"}`}
                              >▼</button>
                            </div>

                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {form.artwork ? (
                                <img
                                  src={form.artwork}
                                  alt={form.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-white/20 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs shrink-0">
                                  ✦
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-black font-mono truncate">
                                  {form.displayName || form.name || <span className="opacity-40">Unnamed Form</span>}
                                </p>
                                {form.variantType && (
                                  <p className={`text-[10px] font-mono opacity-60`}>{form.variantType}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditing) {
                                    // Commit draft
                                    setForms((prev) => prev.map((f, i) => i === idx ? { ...f, ...formDraft, updatedAt: new Date().toISOString() } : f));
                                    setEditingFormIdx(null);
                                    setFormDraft({});
                                  } else {
                                    setEditingFormIdx(idx);
                                    setFormDraft({ ...form });
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                                  isEditing
                                    ? isCyber ? "bg-violet-500 text-black border-violet-400" : "bg-black text-white border-black"
                                    : isCyber ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10" : "bg-white text-black border border-black hover:bg-slate-100"
                                }`}
                              >
                                {isEditing ? "✓ Done" : "✎ Edit"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setForms((prev) => prev.filter((_, i) => i !== idx));
                                  if (editingFormIdx === idx) { setEditingFormIdx(null); setFormDraft({}); }
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-mono text-red-400 hover:bg-red-500/20 transition-all border border-transparent cursor-pointer"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          {/* Inline edit panel */}
                          {isEditing && (
                            <div className={`px-4 pb-4 space-y-3 border-t ${
                              isCyber ? "border-violet-500/20" : "border-black/10"
                            }`}>
                              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Name */}
                                <div className="space-y-1">
                                  <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    isCyber ? "text-violet-300" : "text-slate-600"
                                  }`}>Form Name *</label>
                                  <input
                                    type="text"
                                    value={formDraft.name || ""}
                                    onChange={(e) => setFormDraft((d) => ({ ...d, name: e.target.value }))}
                                    placeholder="e.g. Standard Form, Arc-V Form"
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                                      isCyber
                                        ? "bg-white/5 border-violet-500/30 text-white placeholder-slate-500 focus:border-violet-400"
                                        : "bg-white border-2 border-black text-black placeholder-slate-400 focus:border-violet-500"
                                    } outline-none transition-all`}
                                  />
                                </div>
                                {/* Variant Type */}
                                <div className="space-y-1">
                                  <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    isCyber ? "text-violet-300" : "text-slate-600"
                                  }`}>Variant Type</label>
                                  <input
                                    type="text"
                                    value={formDraft.variantType || ""}
                                    onChange={(e) => setFormDraft((d) => ({ ...d, variantType: e.target.value }))}
                                    placeholder="e.g. Powered Form, Evolution, Transformation"
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                                      isCyber
                                        ? "bg-white/5 border-violet-500/30 text-white placeholder-slate-500 focus:border-violet-400"
                                        : "bg-white border-2 border-black text-black placeholder-slate-400 focus:border-violet-500"
                                    } outline-none transition-all`}
                                  />
                                </div>
                              </div>

                              {/* Form Artwork Upload & Live Preview */}
                              <div className="space-y-2">
                                <CharacterImageUploader
                                  label="Form Artwork"
                                  value={formDraft.artwork || ""}
                                  onChange={(url) => setFormDraft((d) => ({ ...d, artwork: url }))}
                                  onClear={() => setFormDraft((d) => ({ ...d, artwork: null }))}
                                  aspect={4 / 3}
                                  hint="Spans full card width with ambient backdrop in Dossier."
                                  previewClass="h-44 w-full"
                                />

                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono opacity-60">
                                    Or direct image URL:
                                  </label>
                                  <input
                                    type="text"
                                    value={formDraft.artwork || ""}
                                    onChange={(e) => setFormDraft((d) => ({ ...d, artwork: e.target.value || null }))}
                                    placeholder="https://..."
                                    className={inputStyle}
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <div className="space-y-1">
                                <label className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  isCyber ? "text-violet-300" : "text-slate-600"
                                }`}>Description</label>
                                <textarea
                                  value={formDraft.description || ""}
                                  onChange={(e) => setFormDraft((d) => ({ ...d, description: e.target.value }))}
                                  rows={3}
                                  placeholder="What makes this form distinct?"
                                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border resize-none ${
                                    isCyber
                                      ? "bg-white/5 border-violet-500/30 text-white placeholder-slate-500 focus:border-violet-400"
                                      : "bg-white border-2 border-black text-black placeholder-slate-400 focus:border-violet-500"
                                  } outline-none transition-all`}
                                />
                              </div>

                              {/* Live Dossier Card Presentation Preview */}
                              <div className="space-y-1.5 pt-2 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70">
                                    ✦ Live Dossier Card Preview
                                  </span>
                                  <span className="text-[9px] font-mono opacity-50">
                                    (Exact appearance as displayed in the Dossier)
                                  </span>
                                </div>
                                <div className="max-w-md mx-auto pt-1">
                                  <CreatureFormCard
                                    form={formDraft}
                                    isCyber={isCyber}
                                    isPreview={true}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
