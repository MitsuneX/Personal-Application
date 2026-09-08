"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import type {
  CoupleEntry,
  CoupleSource,
  CouplePartnerRef,
  CoupleRelationship,
  CoupleChemistry,
  CoupleGreenFlags,
  CoupleTimelineEvent,
  CoupleMoment,
  CouplePersonalNotes,
  CoupleMedia,
} from "@/lib/data/coupleSchema";
import {
  RELATIONSHIP_STATUS_OPTIONS,
  RELATIONSHIP_ENDING_OPTIONS,
  POPULAR_DYNAMICS,
  COUPLE_MEDIA_TYPES,
  COUPLE_TIERS,
  TIER_COLORS,
  POPULAR_MOMENT_CATEGORIES,
  CHEMISTRY_DIMENSIONS,
} from "@/lib/data/coupleSchema";
import { CoupleJsonEditorView } from "@/components/ui/CoupleJsonEditorModal";
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";

interface CoupleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupleToEdit?: CoupleEntry | null;
}

type TabKey = "basic" | "partners" | "chemistry" | "moments" | "media";

const DEFAULT_CHEMISTRY: CoupleChemistry = {
  communication: 8,
  trust: 9,
  loyalty: 9,
  support: 8,
  compatibility: 8,
  growth: 8,
  affection: 8,
  humor: 8,
  description: "",
};

export function CoupleEditorModal({ isOpen, onClose, coupleToEdit }: CoupleEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addCouple, updateCouple, deleteCouple, hallOfFame = [], dossierCharacters = [] } =
    useDashboardStore();
  const { confirm } = useConfirm();
  const { success: toastSuccess, warning: toastWarning } = useToast();

  const [editorMode, setEditorMode] = useState<"form" | "json">("form");
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states matching CoupleEntry schema
  const [coupleName, setCoupleName] = useState("");
  const [source, setSource] = useState<CoupleSource>({
    title: "",
    mediaType: "Anime",
    country: "Japan",
    year: new Date().getFullYear(),
  });
  const [relationship, setRelationship] = useState<CoupleRelationship>({
    status: "canon",
    ending: "endgame",
    dynamics: [],
    description: "",
  });
  const [tier, setTier] = useState<CoupleEntry["tier"]>("S");
  const [isFavorite, setIsFavorite] = useState(false);
  const [dynamicInput, setDynamicInput] = useState("");

  const [partnerA, setPartnerA] = useState<CouplePartnerRef>({
    characterId: null,
    name: "",
    avatar: null,
    role: "",
  });
  const [partnerB, setPartnerB] = useState<CouplePartnerRef>({
    characterId: null,
    name: "",
    avatar: null,
    role: "",
  });

  const [greenFlags, setGreenFlags] = useState<CoupleGreenFlags>({
    partnerA: [],
    partnerB: [],
  });
  const [flagAInput, setFlagAInput] = useState("");
  const [flagBInput, setFlagBInput] = useState("");

  const [chemistry, setChemistry] = useState<CoupleChemistry>(DEFAULT_CHEMISTRY);
  const [timeline, setTimeline] = useState<CoupleTimelineEvent[]>([]);
  const [favouriteMoments, setFavouriteMoments] = useState<CoupleMoment[]>([]);
  const [personalNotes, setPersonalNotes] = useState<CouplePersonalNotes>({
    whyILoveThem: "",
    relationshipAnalysis: "",
  });
  const [media, setMedia] = useState<CoupleMedia>({
    cover: "",
    card: "",
    gallery: [],
  });
  const [galleryInput, setGalleryInput] = useState("");

  // Consolidated character dictionary list for partner auto-fill
  const characterDictOptions = useMemo(() => {
    const list: { id: string; name: string; avatar?: string; series?: string; role?: string }[] =
      [];
    const seenIds = new Set<string>();

    hallOfFame.forEach((h) => {
      if (h.id && !seenIds.has(h.id)) {
        seenIds.add(h.id);
        list.push({
          id: h.id,
          name: h.name || "Unknown Character",
          avatar: (h as any).avatarUrl || (h as any).avatar || (h as any).imageUrl,
          series: h.series,
          role: (h as any).role,
        });
      }
    });

    dossierCharacters.forEach((d) => {
      if (d.id && !seenIds.has(d.id)) {
        seenIds.add(d.id);
        list.push({
          id: d.id,
          name: d.name || "Unknown Character",
          avatar: (d as any).avatarUrl || (d as any).avatar,
          series: (d as any).series || (d as any).source,
          role: (d as any).role,
        });
      }
    });

    return list;
  }, [hallOfFame, dossierCharacters]);

  // Sync state when coupleToEdit changes or modal opens
  useEffect(() => {
    if (coupleToEdit) {
      setCoupleName(coupleToEdit.coupleName || "");
      setSource({
        title: coupleToEdit.source?.title || "",
        mediaType: coupleToEdit.source?.mediaType || "Anime",
        country: coupleToEdit.source?.country || "Japan",
        year: coupleToEdit.source?.year || new Date().getFullYear(),
      });
      setRelationship({
        status: coupleToEdit.relationship?.status || "canon",
        ending: coupleToEdit.relationship?.ending || "endgame",
        dynamics: coupleToEdit.relationship?.dynamics || [],
        description: coupleToEdit.relationship?.description || "",
      });
      setTier(coupleToEdit.tier || "S");
      setIsFavorite(coupleToEdit.isFavorite || false);

      setPartnerA({
        characterId: coupleToEdit.partnerA?.characterId || null,
        name: coupleToEdit.partnerA?.name || "",
        avatar: coupleToEdit.partnerA?.avatar || null,
        role: coupleToEdit.partnerA?.role || "",
      });

      setPartnerB({
        characterId: coupleToEdit.partnerB?.characterId || null,
        name: coupleToEdit.partnerB?.name || "",
        avatar: coupleToEdit.partnerB?.avatar || null,
        role: coupleToEdit.partnerB?.role || "",
      });

      setGreenFlags({
        partnerA: coupleToEdit.greenFlags?.partnerA || [],
        partnerB: coupleToEdit.greenFlags?.partnerB || [],
      });

      setChemistry({
        communication: coupleToEdit.chemistry?.communication ?? 8,
        trust: coupleToEdit.chemistry?.trust ?? 9,
        loyalty: coupleToEdit.chemistry?.loyalty ?? 9,
        support: coupleToEdit.chemistry?.support ?? 8,
        compatibility: coupleToEdit.chemistry?.compatibility ?? 8,
        growth: coupleToEdit.chemistry?.growth ?? 8,
        affection: coupleToEdit.chemistry?.affection ?? 8,
        humor: coupleToEdit.chemistry?.humor ?? 8,
        description: coupleToEdit.chemistry?.description || "",
      });

      setTimeline(coupleToEdit.timeline || []);
      setFavouriteMoments(coupleToEdit.favouriteMoments || []);
      setPersonalNotes({
        whyILoveThem: coupleToEdit.personalNotes?.whyILoveThem || "",
        relationshipAnalysis: coupleToEdit.personalNotes?.relationshipAnalysis || "",
      });

      setMedia({
        cover: coupleToEdit.media?.cover || "",
        card: coupleToEdit.media?.card || "",
        gallery: coupleToEdit.media?.gallery || [],
      });
    } else {
      // New couple defaults
      setCoupleName("");
      setSource({
        title: "",
        mediaType: "Anime",
        country: "Japan",
        year: new Date().getFullYear(),
      });
      setRelationship({
        status: "canon",
        ending: "endgame",
        dynamics: [],
        description: "",
      });
      setTier("S");
      setIsFavorite(false);
      setPartnerA({ characterId: null, name: "", avatar: null, role: "" });
      setPartnerB({ characterId: null, name: "", avatar: null, role: "" });
      setGreenFlags({ partnerA: [], partnerB: [] });
      setChemistry(DEFAULT_CHEMISTRY);
      setTimeline([]);
      setFavouriteMoments([]);
      setPersonalNotes({ whyILoveThem: "", relationshipAnalysis: "" });
      setMedia({ cover: "", card: "", gallery: [] });
    }
    setActiveTab("basic");
    setEditorMode("form");
  }, [coupleToEdit, isOpen]);

  // Construct current live payload for JSON sync
  const getLivePayload = (): Partial<CoupleEntry> => ({
    id: coupleToEdit?.id,
    coupleName: coupleName.trim(),
    source,
    relationship,
    tier,
    isFavorite,
    partnerA,
    partnerB,
    greenFlags,
    chemistry,
    timeline,
    favouriteMoments,
    personalNotes,
    media,
  });

  // Handle updates applied from JSON view
  const handleJsonApply = (parsedData: Partial<CoupleEntry>, mode: "replace" | "merge") => {
    if (parsedData.coupleName) setCoupleName(parsedData.coupleName);
    if (parsedData.source) setSource((prev) => ({ ...prev, ...parsedData.source }));
    if (parsedData.relationship) setRelationship((prev) => ({ ...prev, ...parsedData.relationship }));
    if (parsedData.tier) setTier(parsedData.tier);
    if (parsedData.isFavorite !== undefined) setIsFavorite(parsedData.isFavorite);
    if (parsedData.partnerA) setPartnerA((prev) => ({ ...prev, ...parsedData.partnerA }));
    if (parsedData.partnerB) setPartnerB((prev) => ({ ...prev, ...parsedData.partnerB }));
    if (parsedData.greenFlags) setGreenFlags((prev) => ({ ...prev, ...parsedData.greenFlags }));
    if (parsedData.chemistry) setChemistry((prev) => ({ ...prev, ...parsedData.chemistry }));
    if (parsedData.timeline) setTimeline(parsedData.timeline);
    if (parsedData.favouriteMoments) setFavouriteMoments(parsedData.favouriteMoments);
    if (parsedData.personalNotes) setPersonalNotes((prev) => ({ ...prev, ...parsedData.personalNotes }));
    if (parsedData.media) setMedia((prev) => ({ ...prev, ...parsedData.media }));
    setEditorMode("form");
    toastSuccess("JSON changes applied to form!");
  };

  // Partner character picker change handler
  const handleSelectPartnerCharacter = (partnerKey: "A" | "B", charId: string) => {
    if (!charId) {
      if (partnerKey === "A") {
        setPartnerA((prev) => ({ ...prev, characterId: null }));
      } else {
        setPartnerB((prev) => ({ ...prev, characterId: null }));
      }
      return;
    }

    const found = characterDictOptions.find((c) => c.id === charId);
    if (!found) return;

    if (partnerKey === "A") {
      setPartnerA((prev) => {
        // If user already put a 1:1 avatar picture, keep it unchanged. Only fill from Character Dictionary if there is none!
        const hasExistingAvatar = Boolean(prev.avatar && prev.avatar.trim() !== "");
        return {
          ...prev,
          characterId: found.id,
          name: prev.name?.trim() ? prev.name : found.name,
          avatar: hasExistingAvatar ? prev.avatar : (found.avatar || null),
          role: prev.role?.trim() ? prev.role : (found.role || ""),
        };
      });
    } else {
      setPartnerB((prev) => {
        // If user already put a 1:1 avatar picture, keep it unchanged. Only fill from Character Dictionary if there is none!
        const hasExistingAvatar = Boolean(prev.avatar && prev.avatar.trim() !== "");
        return {
          ...prev,
          characterId: found.id,
          name: prev.name?.trim() ? prev.name : found.name,
          avatar: hasExistingAvatar ? prev.avatar : (found.avatar || null),
          role: prev.role?.trim() ? prev.role : (found.role || ""),
        };
      });
    }
  };

  // Dynamics tag handlers
  const handleAddDynamic = (tag?: string) => {
    const toAdd = (tag || dynamicInput).trim();
    if (!toAdd) return;
    if (!relationship.dynamics.includes(toAdd)) {
      setRelationship({ ...relationship, dynamics: [...relationship.dynamics, toAdd] });
    }
    setDynamicInput("");
  };

  const handleRemoveDynamic = (tag: string) => {
    setRelationship({
      ...relationship,
      dynamics: relationship.dynamics.filter((d) => d !== tag),
    });
  };

  // Avatar change handlers that also automatically add custom 1:1 images to Gallery (unless from Character Dictionary)
  const handlePartnerAAvatarChange = (url: string) => {
    setPartnerA((prev) => ({ ...prev, avatar: url || null }));
    const trimmed = url?.trim();
    if (trimmed) {
      const charA = characterDictOptions.find((c) => c.id === partnerA.characterId);
      const isFromDictA = Boolean(
        charA && (
          charA.avatar === trimmed ||
          (charA as any)?.avatarUrl === trimmed ||
          (charA as any)?.imageUrl === trimmed ||
          (charA as any)?.portraitUrl === trimmed
        )
      );
      if (!isFromDictA) {
        setMedia((prev) => {
          const gallery = prev.gallery || [];
          if (!gallery.includes(trimmed)) {
            return { ...prev, gallery: [...gallery, trimmed] };
          }
          return prev;
        });
      }
    }
  };

  const handlePartnerBAvatarChange = (url: string) => {
    setPartnerB((prev) => ({ ...prev, avatar: url || null }));
    const trimmed = url?.trim();
    if (trimmed) {
      const charB = characterDictOptions.find((c) => c.id === partnerB.characterId);
      const isFromDictB = Boolean(
        charB && (
          charB.avatar === trimmed ||
          (charB as any)?.avatarUrl === trimmed ||
          (charB as any)?.imageUrl === trimmed ||
          (charB as any)?.portraitUrl === trimmed
        )
      );
      if (!isFromDictB) {
        setMedia((prev) => {
          const gallery = prev.gallery || [];
          if (!gallery.includes(trimmed)) {
            return { ...prev, gallery: [...gallery, trimmed] };
          }
          return prev;
        });
      }
    }
  };

  // Green flag handlers
  const handleAddFlagA = () => {
    if (!flagAInput.trim()) return;
    setGreenFlags((prev) => ({
      ...prev,
      partnerA: [...prev.partnerA, flagAInput.trim()],
    }));
    setFlagAInput("");
  };

  const handleRemoveFlagA = (index: number) => {
    setGreenFlags((prev) => ({
      ...prev,
      partnerA: prev.partnerA.filter((_, i) => i !== index),
    }));
  };

  const handleAddFlagB = () => {
    if (!flagBInput.trim()) return;
    setGreenFlags((prev) => ({
      ...prev,
      partnerB: [...prev.partnerB, flagBInput.trim()],
    }));
    setFlagBInput("");
  };

  const handleRemoveFlagB = (index: number) => {
    setGreenFlags((prev) => ({
      ...prev,
      partnerB: prev.partnerB.filter((_, i) => i !== index),
    }));
  };

  // Timeline handlers
  const handleAddTimeline = () => {
    setTimeline([
      ...timeline,
      {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: "Milestone Stage",
        description: "Milestone description...",
        episode: "",
        date: "",
      },
    ]);
  };

  const handleUpdateTimeline = (index: number, field: keyof CoupleTimelineEvent, val: string) => {
    setTimeline((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: val } : t)));
  };

  const handleRemoveTimeline = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  // Moments handlers
  const handleAddMoment = () => {
    setFavouriteMoments([
      ...favouriteMoments,
      {
        id: `mom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category: "Favourite Scene",
        title: "Memorable Scene",
        description: "Scene description...",
        episode: "",
      },
    ]);
  };

  const handleUpdateMoment = (index: number, field: keyof CoupleMoment, val: string) => {
    setFavouriteMoments((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)));
  };

  const handleRemoveMoment = (index: number) => {
    setFavouriteMoments(favouriteMoments.filter((_, i) => i !== index));
  };

  // Gallery handlers
  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return;
    setMedia((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), galleryInput.trim()],
    }));
    setGalleryInput("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setMedia((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  };

  // Compute average chemistry score
  const chemistryAvg = useMemo(() => {
    const vals = CHEMISTRY_DIMENSIONS.map((dim) => (chemistry as any)[dim.key] ?? 8);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }, [chemistry]);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupleName.trim()) {
      toastWarning("Please provide a Couple Name (e.g. 'Loid Forger × Yor Forger').");
      setActiveTab("basic");
      return;
    }

    if (!source.title.trim()) {
      toastWarning("Please provide the Source Work Title.");
      setActiveTab("basic");
      return;
    }

    if (!partnerA.name?.trim() || !partnerB.name?.trim()) {
      toastWarning("Please specify names for both Partner A and Partner B.");
      setActiveTab("partners");
      return;
    }

    setIsSaving(true);
    try {
      // Both avatar 1:1 images are also saved in Gallery in Couples unless they are from Character Dictionary
      const charA = characterDictOptions.find((c) => c.id === partnerA.characterId);
      const isFromDictA = Boolean(
        charA && (
          charA.avatar === partnerA.avatar?.trim() ||
          (charA as any)?.avatarUrl === partnerA.avatar?.trim() ||
          (charA as any)?.imageUrl === partnerA.avatar?.trim()
        )
      );

      const charB = characterDictOptions.find((c) => c.id === partnerB.characterId);
      const isFromDictB = Boolean(
        charB && (
          charB.avatar === partnerB.avatar?.trim() ||
          (charB as any)?.avatarUrl === partnerB.avatar?.trim() ||
          (charB as any)?.imageUrl === partnerB.avatar?.trim()
        )
      );

      const finalGallery = [...(media.gallery || []).filter((g) => g.trim())];
      if (partnerA.avatar?.trim() && !isFromDictA && !finalGallery.includes(partnerA.avatar.trim())) {
        finalGallery.push(partnerA.avatar.trim());
      }
      if (partnerB.avatar?.trim() && !isFromDictB && !finalGallery.includes(partnerB.avatar.trim())) {
        finalGallery.push(partnerB.avatar.trim());
      }

      const payload: Partial<CoupleEntry> = {
        coupleName: coupleName.trim(),
        source: {
          title: source.title.trim(),
          mediaType: source.mediaType || "Anime",
          country: source.country || "Japan",
          year: Number(source.year) || new Date().getFullYear(),
        },
        relationship: {
          status: relationship.status || "canon",
          ending: relationship.ending || "endgame",
          dynamics: relationship.dynamics || [],
          description: relationship.description?.trim() || "",
        },
        tier,
        isFavorite,
        partnerA: {
          characterId: partnerA.characterId || null,
          name: (partnerA.name || "").trim(),
          avatar: partnerA.avatar?.trim() || null,
          role: partnerA.role?.trim() || "",
        },
        partnerB: {
          characterId: partnerB.characterId || null,
          name: (partnerB.name || "").trim(),
          avatar: partnerB.avatar?.trim() || null,
          role: partnerB.role?.trim() || "",
        },
        greenFlags: {
          partnerA: greenFlags.partnerA.filter((f) => f.trim()),
          partnerB: greenFlags.partnerB.filter((f) => f.trim()),
        },
        chemistry,
        timeline: timeline.filter((t) => t.title?.trim()),
        favouriteMoments: favouriteMoments.filter((m) => m.title?.trim()),
        personalNotes: {
          whyILoveThem: personalNotes.whyILoveThem?.trim() || "",
          relationshipAnalysis: personalNotes.relationshipAnalysis?.trim() || "",
        },
        media: {
          cover: media.cover?.trim() || null,
          card: media.card?.trim() || null,
          gallery: finalGallery,
        },
      };

      if (coupleToEdit?.id) {
        await updateCouple(coupleToEdit.id, payload);
        toastSuccess(`Updated couple profile for ${coupleName}!`);
      } else {
        await addCouple(payload);
        toastSuccess(`Added new couple profile: ${coupleName}!`);
      }
      onClose();
    } catch (err: any) {
      toastWarning(err?.message || "Failed to save couple profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!coupleToEdit?.id) return;
    confirm({
      title: "Delete Couple Profile",
      message: `Are you sure you want to delete "${coupleToEdit.coupleName}" from your couples collection? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteCouple(coupleToEdit.id);
          toastSuccess(`Deleted ${coupleToEdit.coupleName}.`);
          onClose();
        } catch (err: any) {
          toastWarning(err?.message || "Failed to delete couple.");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Theme styling tokens
  const inputStyle = isCyber
    ? "w-full bg-[#0d1326] border border-cyan-500/25 focus:border-cyan-400 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none transition-all"
    : "w-full bg-white border-2 border-black focus:border-purple-600 text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all";

  const labelStyle = `block text-xs font-bold font-mono uppercase tracking-wider mb-1.5 ${
    isCyber ? "text-cyan-400" : "text-black"
  }`;

  const tabBtnStyle = (tab: TabKey) => {
    const isActive = activeTab === tab;
    if (isCyber) {
      return `px-3.5 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
        isActive
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      }`;
    }
    return `px-3.5 py-2 rounded-lg text-xs font-black font-mono tracking-wider transition-all cursor-pointer border-2 ${
      isActive
        ? "bg-rose-400 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        : "bg-white text-slate-700 border-transparent hover:border-black/20"
    }`;
  };

  const cardContainerStyle = isCyber
    ? "p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3"
    : "p-4 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-5 border-b shrink-0 ${
            isCyber ? "border-cyan-500/20 bg-[#080d1e]/90" : "border-black bg-rose-50/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">💑</span>
            <div>
              <h2
                className={`text-lg font-black tracking-wide ${
                  isCyber ? "text-white" : "text-black"
                }`}
              >
                {coupleToEdit ? `Edit: ${coupleToEdit.coupleName}` : "Create Couple Profile"}
              </h2>
              <p className={`text-xs font-mono ${isCyber ? "text-cyan-400/80" : "text-slate-600"}`}>
                Couples & Romance Archive • Standalone System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorMode(editorMode === "form" ? "json" : "form")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-all ${
                editorMode === "json"
                  ? isCyber
                    ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.2)]"
                    : "border-2 border-black bg-blue-100 text-blue-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : isCyber
                  ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                  : "border-2 border-black bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
              title="Switch between Visual Form and JSON Workspace"
            >
              {editorMode === "json" ? "📋 Form View" : "{ } JSON Workspace"}
            </button>

            {coupleToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-all ${
                  isCyber
                    ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-100 font-black"
                }`}
              >
                {isDeleting ? "Deleting..." : "🗑 Delete"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg text-sm font-mono cursor-pointer transition-all ${
                isCyber
                  ? "text-slate-400 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-black hover:bg-black/10"
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Switch: JSON Workspace or Visual Form */}
        {editorMode === "json" ? (
          <div className="flex-1 overflow-hidden p-3">
            <CoupleJsonEditorView
              profile={getLivePayload()}
              onApply={handleJsonApply}
              onCancel={() => setEditorMode("form")}
            />
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div
              className={`flex items-center gap-1.5 px-5 py-2.5 border-b overflow-x-auto shrink-0 ${
                isCyber ? "border-white/10 bg-[#050814]" : "border-black bg-amber-50/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={tabBtnStyle("basic")}
              >
                📋 Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("partners")}
                className={tabBtnStyle("partners")}
              >
                👥 Partners & Green Flags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chemistry")}
                className={tabBtnStyle("chemistry")}
              >
                ⚡ Chemistry & Timeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("moments")}
                className={tabBtnStyle("moments")}
              >
                ✨ Moments & Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={tabBtnStyle("media")}
              >
                🎨 Media & Cover
              </button>
            </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-5">
              <div>
                <label className={labelStyle}>Couple / Pairing Name *</label>
                <input
                  type="text"
                  required
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  placeholder="e.g. Loid Forger × Yor Forger"
                  className={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelStyle}>Source Title *</label>
                  <input
                    type="text"
                    required
                    value={source.title}
                    onChange={(e) => setSource({ ...source, title: e.target.value })}
                    placeholder="e.g. Spy × Family"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Media Type</label>
                  <select
                    value={source.mediaType}
                    onChange={(e) => setSource({ ...source, mediaType: e.target.value })}
                    className={inputStyle}
                  >
                    {COUPLE_MEDIA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Country</label>
                  <input
                    type="text"
                    value={source.country || ""}
                    onChange={(e) => setSource({ ...source, country: e.target.value })}
                    placeholder="e.g. Japan, South Korea..."
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Release Year</label>
                  <input
                    type="number"
                    value={source.year || ""}
                    onChange={(e) =>
                      setSource({
                        ...source,
                        year: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    placeholder="2022"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyle}>Prestige Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CoupleEntry["tier"])}
                    className={inputStyle}
                  >
                    {COUPLE_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t} Tier ({TIER_COLORS[t].label})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Canon Status</label>
                  <select
                    value={relationship.status}
                    onChange={(e) => setRelationship({ ...relationship, status: e.target.value })}
                    className={inputStyle}
                  >
                    {RELATIONSHIP_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Ending Classification</label>
                  <select
                    value={relationship.ending || "endgame"}
                    onChange={(e) => setRelationship({ ...relationship, ending: e.target.value })}
                    className={inputStyle}
                  >
                    {RELATIONSHIP_ENDING_OPTIONS.map((end) => (
                      <option key={end.id} value={end.id}>
                        {end.icon} {end.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Relationship Summary / Tagline</label>
                <input
                  type="text"
                  value={relationship.description || ""}
                  onChange={(e) =>
                    setRelationship({ ...relationship, description: e.target.value })
                  }
                  placeholder="e.g. A wholesome undercover romance masking world-class espionage and lethal devotion."
                  className={inputStyle}
                />
              </div>

              {/* Relationship Tropes & Dynamics */}
              <div className={cardContainerStyle}>
                <label className={labelStyle}>Relationship Dynamics & Tropes</label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {relationship.dynamics.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        isCyber
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveDynamic(tag)}
                        className="opacity-60 hover:opacity-100 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {relationship.dynamics.length === 0 && (
                    <span className="text-xs font-mono opacity-50 italic">
                      No dynamics selected. Click a preset below or enter a custom one.
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dynamicInput}
                    onChange={(e) => setDynamicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDynamic();
                      }
                    }}
                    placeholder="Add custom dynamic (e.g. 'Slow Burn', 'Mutual Pining')..."
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDynamic()}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-mono cursor-pointer shrink-0 ${
                      isCyber
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30"
                        : "bg-black text-white font-black hover:bg-neutral-800"
                    }`}
                  >
                    + Add
                  </button>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold opacity-60 block mb-1.5">
                    Popular Tropes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_DYNAMICS.map((preset) => {
                      const isSelected = relationship.dynamics.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            isSelected ? handleRemoveDynamic(preset) : handleAddDynamic(preset)
                          }
                          className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-all ${
                            isSelected
                              ? isCyber
                                ? "bg-rose-500 text-white font-bold"
                                : "bg-rose-600 text-white font-bold"
                              : isCyber
                              ? "bg-white/5 text-slate-300 hover:bg-white/10"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {preset} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Favorite Switch */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFavCouple"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-rose-500"
                />
                <label
                  htmlFor="isFavCouple"
                  className={`text-sm font-bold font-mono cursor-pointer ${
                    isCyber ? "text-slate-200" : "text-black"
                  }`}
                >
                  ⭐ Pin as Personal Favorite in Highlights
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNERS & GREEN FLAGS */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
                  isCyber
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200"
                    : "bg-blue-50 border-blue-400 text-blue-900"
                }`}
              >
                ℹ️ <strong>Character Dictionary Integration (Read-Only):</strong> Select a partner from
                your Character Dictionary to link them. Couples editing is strictly read-only towards
                Character Dictionary records and will never alter character data.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PARTNER A */}
                <div className={cardContainerStyle}>
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-sm font-black font-mono uppercase tracking-wider text-rose-500">
                      Partner A
                    </span>
                    {partnerA.characterId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Linked ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={labelStyle}>Character Dictionary Auto-Fill</label>
                    <select
                      value={partnerA.characterId || ""}
                      onChange={(e) => handleSelectPartnerCharacter("A", e.target.value)}
                      className={inputStyle}
                    >
                      <option value="">-- Choose from Character Dictionary (Optional) --</option>
                      {characterDictOptions.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name} {char.series ? `(${char.series})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Partner A Name *</label>
                    <input
                      type="text"
                      required
                      value={partnerA.name || ""}
                      onChange={(e) => setPartnerA({ ...partnerA, name: e.target.value })}
                      placeholder="e.g. Loid Forger"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Role / Title</label>
                    <input
                      type="text"
                      value={partnerA.role || ""}
                      onChange={(e) => setPartnerA({ ...partnerA, role: e.target.value })}
                      placeholder="e.g. Twilight / Psychiatrist"
                      className={inputStyle}
                    />
                  </div>

                  <div className="space-y-2">
                    <CharacterImageUploader
                      label="Partner A Avatar (1:1 Square)"
                      value={partnerA.avatar || ""}
                      onChange={handlePartnerAAvatarChange}
                      onClear={() => setPartnerA((prev) => ({ ...prev, avatar: null }))}
                      aspect={1}
                      hint="Custom 1:1 square avatar. When set, linking with Character Dictionary will preserve this picture."
                      previewClass="h-28 w-28"
                    />
                    <input
                      type="text"
                      value={(partnerA.avatar || "").startsWith("data:") ? "" : (partnerA.avatar || "")}
                      onChange={(e) => setPartnerA((prev) => ({ ...prev, avatar: e.target.value }))}
                      onBlur={(e) => handlePartnerAAvatarChange(e.target.value)}
                      placeholder="Or paste avatar URL (https://...)"
                      className={inputStyle}
                    />
                  </div>

                  {/* Green Flags Partner A */}
                  <div className="pt-2">
                    <label className={labelStyle}>Partner A Green Flags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {greenFlags.partnerA.map((flag, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${
                            isCyber
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          🟢 {flag}
                          <button
                            type="button"
                            onClick={() => handleRemoveFlagA(idx)}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={flagAInput}
                        onChange={(e) => setFlagAInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFlagA();
                          }
                        }}
                        placeholder="e.g. Attentive listener, calm under pressure..."
                        className={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={handleAddFlagA}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono cursor-pointer shrink-0 ${
                          isCyber
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            : "bg-emerald-600 text-white font-black"
                        }`}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* PARTNER B */}
                <div className={cardContainerStyle}>
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="text-sm font-black font-mono uppercase tracking-wider text-purple-500">
                      Partner B
                    </span>
                    {partnerB.characterId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Linked ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={labelStyle}>Character Dictionary Auto-Fill</label>
                    <select
                      value={partnerB.characterId || ""}
                      onChange={(e) => handleSelectPartnerCharacter("B", e.target.value)}
                      className={inputStyle}
                    >
                      <option value="">-- Choose from Character Dictionary (Optional) --</option>
                      {characterDictOptions.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name} {char.series ? `(${char.series})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Partner B Name *</label>
                    <input
                      type="text"
                      required
                      value={partnerB.name || ""}
                      onChange={(e) => setPartnerB({ ...partnerB, name: e.target.value })}
                      placeholder="e.g. Yor Forger"
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Role / Title</label>
                    <input
                      type="text"
                      value={partnerB.role || ""}
                      onChange={(e) => setPartnerB({ ...partnerB, role: e.target.value })}
                      placeholder="e.g. Thorn Princess / City Clerk"
                      className={inputStyle}
                    />
                  </div>

                  <div className="space-y-2">
                    <CharacterImageUploader
                      label="Partner B Avatar (1:1 Square)"
                      value={partnerB.avatar || ""}
                      onChange={handlePartnerBAvatarChange}
                      onClear={() => setPartnerB((prev) => ({ ...prev, avatar: null }))}
                      aspect={1}
                      hint="Custom 1:1 square avatar. When set, linking with Character Dictionary will preserve this picture."
                      previewClass="h-28 w-28"
                    />
                    <input
                      type="text"
                      value={(partnerB.avatar || "").startsWith("data:") ? "" : (partnerB.avatar || "")}
                      onChange={(e) => setPartnerB((prev) => ({ ...prev, avatar: e.target.value }))}
                      onBlur={(e) => handlePartnerBAvatarChange(e.target.value)}
                      placeholder="Or paste avatar URL (https://...)"
                      className={inputStyle}
                    />
                  </div>

                  {/* Green Flags Partner B */}
                  <div className="pt-2">
                    <label className={labelStyle}>Partner B Green Flags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {greenFlags.partnerB.map((flag, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${
                            isCyber
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          🟢 {flag}
                          <button
                            type="button"
                            onClick={() => handleRemoveFlagB(idx)}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={flagBInput}
                        onChange={(e) => setFlagBInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFlagB();
                          }
                        }}
                        placeholder="e.g. Unwavering loyalty, protective..."
                        className={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={handleAddFlagB}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono cursor-pointer shrink-0 ${
                          isCyber
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            : "bg-emerald-600 text-white font-black"
                        }`}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHEMISTRY & TIMELINE */}
          {activeTab === "chemistry" && (
            <div className="space-y-6">
              <div className={cardContainerStyle}>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-black font-mono uppercase tracking-wider text-rose-500">
                    ⚡ Chemistry Matrix (1 to 10)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">Composite Average:</span>
                    <span className="text-base font-black font-mono px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      {chemistryAvg.toFixed(1)} / 10
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {CHEMISTRY_DIMENSIONS.map((dim) => {
                    const val = (chemistry as any)[dim.key] ?? 8;
                    return (
                      <div key={dim.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className={isCyber ? "text-slate-300" : "text-slate-800"}>
                            {dim.icon} {dim.label}
                          </span>
                          <span className="font-bold text-rose-500">{val} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={val}
                          onChange={(e) =>
                            setChemistry({
                              ...chemistry,
                              [dim.key]: Number(e.target.value),
                            })
                          }
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className={labelStyle}>Chemistry Notes / Dynamic Overview</label>
                  <textarea
                    rows={2}
                    value={chemistry.description || ""}
                    onChange={(e) => setChemistry({ ...chemistry, description: e.target.value })}
                    placeholder="Brief description of their synergy, banter, and romantic tension..."
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Relationship Timeline */}
              <div className={cardContainerStyle}>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="text-sm font-black font-mono uppercase tracking-wider text-cyan-400">
                      ⏳ Timeline & Milestones
                    </span>
                    <p className="text-[11px] font-mono opacity-60">
                      Track their relationship progression chronologically
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTimeline}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer ${
                      isCyber
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30"
                        : "bg-black text-white font-black"
                    }`}
                  >
                    + Add Milestone
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {timeline.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-3 rounded-lg border space-y-2 relative ${
                        isCyber ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeline(idx)}
                        className="absolute top-2 right-2 text-xs font-mono text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ✕ Remove
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-16">
                        <div>
                          <label className="text-[10px] font-mono uppercase opacity-60 block">
                            Milestone Title *
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateTimeline(idx, "title", e.target.value)}
                            placeholder="e.g. Grenade Ring Proposal"
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase opacity-60 block">
                            Episode / Chapter
                          </label>
                          <input
                            type="text"
                            value={item.episode || ""}
                            onChange={(e) => handleUpdateTimeline(idx, "episode", e.target.value)}
                            placeholder="e.g. Episode 2"
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase opacity-60 block">
                          Milestone Description
                        </label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateTimeline(idx, "description", e.target.value)}
                          placeholder="What happened and its emotional significance..."
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  ))}

                  {timeline.length === 0 && (
                    <p className="text-xs font-mono opacity-50 italic py-2 text-center">
                      No milestones recorded. Click &quot;+ Add Milestone&quot; to chart their relationship arc.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOMENTS & PERSONAL NOTES */}
          {activeTab === "moments" && (
            <div className="space-y-6">
              {/* Categorized Moments */}
              <div className={cardContainerStyle}>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="text-sm font-black font-mono uppercase tracking-wider text-rose-500">
                      🎬 Categorized Moments & Highlights
                    </span>
                    <p className="text-[11px] font-mono opacity-60">
                      Best scenes, confessions, comedy, and emotional climaxes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMoment}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer ${
                      isCyber
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30"
                        : "bg-black text-white font-black"
                    }`}
                  >
                    + Add Moment
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {favouriteMoments.map((mom, idx) => (
                    <div
                      key={mom.id || idx}
                      className={`p-3 rounded-lg border space-y-2 relative ${
                        isCyber ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveMoment(idx)}
                        className="absolute top-2 right-2 text-xs font-mono text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ✕ Remove
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-16">
                        <div>
                          <label className="text-[10px] font-mono uppercase opacity-60 block">
                            Scene Title *
                          </label>
                          <input
                            type="text"
                            value={mom.title}
                            onChange={(e) => handleUpdateMoment(idx, "title", e.target.value)}
                            placeholder="e.g. Infiltration Tango"
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase opacity-60 block">
                            Category
                          </label>
                          <select
                            value={mom.category}
                            onChange={(e) => handleUpdateMoment(idx, "category", e.target.value)}
                            className={inputStyle}
                          >
                            {POPULAR_MOMENT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase opacity-60 block">
                            Episode / Chapter
                          </label>
                          <input
                            type="text"
                            value={mom.episode || ""}
                            onChange={(e) => handleUpdateMoment(idx, "episode", e.target.value)}
                            placeholder="e.g. Episode 2"
                            className={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase opacity-60 block">
                          Scene Description
                        </label>
                        <textarea
                          rows={2}
                          value={mom.description}
                          onChange={(e) => handleUpdateMoment(idx, "description", e.target.value)}
                          placeholder="What makes this scene so unforgettable..."
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  ))}

                  {favouriteMoments.length === 0 && (
                    <p className="text-xs font-mono opacity-50 italic py-2 text-center">
                      No moments added yet. Click &quot;+ Add Moment&quot; to catalog their best scenes.
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>💖 Why I Love Them (Personal Reflection)</label>
                  <textarea
                    rows={3}
                    value={personalNotes.whyILoveThem || ""}
                    onChange={(e) =>
                      setPersonalNotes({ ...personalNotes, whyILoveThem: e.target.value })
                    }
                    placeholder="Write why this pairing resonates with you, what touches your heart..."
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>🧠 Relationship Analysis & Dynamics Breakdown</label>
                  <textarea
                    rows={3}
                    value={personalNotes.relationshipAnalysis || ""}
                    onChange={(e) =>
                      setPersonalNotes({ ...personalNotes, relationshipAnalysis: e.target.value })
                    }
                    placeholder="In-depth analysis of their emotional balance, communication, and mutual growth..."
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA & COVER */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Media Role Architecture Guide Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  isCyber
                    ? "bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-pink-950/40 border-cyan-500/30 text-slate-200"
                    : "bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🎨</span>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider font-mono">
                    Media Architecture & Artwork Guide
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className={`p-2.5 rounded-lg border ${isCyber ? "bg-black/30 border-cyan-500/20" : "bg-white border border-black/20"}`}>
                    <span className="font-bold text-cyan-400 block mb-0.5">1. OVERVIEW COVER (16:9)</span>
                    <p className="opacity-75 leading-relaxed text-[11px]">
                      Hero artwork displayed across the top of the Couple Overview in the Relationship Dossier.
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isCyber ? "bg-black/30 border-pink-500/20" : "bg-white border border-black/20"}`}>
                    <span className="font-bold text-pink-400 block mb-0.5">2. CARD POSTER (3:4)</span>
                    <p className="opacity-75 leading-relaxed text-[11px]">
                      Portrait artwork filling the full background of the Couple Collection Card.
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isCyber ? "bg-black/30 border-purple-500/20" : "bg-white border border-black/20"}`}>
                    <span className="font-bold text-purple-400 block mb-0.5">3. GALLERY VAULT</span>
                    <p className="opacity-75 leading-relaxed text-[11px]">
                      Additional high-res media, iconic scenes, manga spreads, and photos.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 1: OVERVIEW COVER */}
              <div className={cardContainerStyle}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3 border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                        Slot A
                      </span>
                      <h4 className="font-black text-sm font-mono tracking-wide text-cyan-300">
                        OVERVIEW COVER (Landscape / 16:9)
                      </h4>
                    </div>
                    <p className="text-xs font-mono opacity-70 mt-1">
                      The main Couple artwork displayed in the Couple Overview / dossier banner.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 opacity-75">
                    Used in: Couple Overview / Dossier
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Upload & URL controls */}
                  <div className="lg:col-span-7 space-y-3">
                    <CharacterImageUploader
                      label="Upload Overview Cover (16:9 Widescreen)"
                      value={media.cover || ""}
                      onChange={(url) => setMedia((prev) => ({ ...prev, cover: url }))}
                      onClear={() => setMedia((prev) => ({ ...prev, cover: "" }))}
                      aspect={16 / 9}
                      hint="Widescreen 16:9 landscape image recommended for the large dossier hero header."
                      previewClass="h-44 w-full"
                    />
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono opacity-70 block">
                        Or paste direct Image URL:
                      </label>
                      <input
                        type="text"
                        value={(media.cover || "").startsWith("data:") ? "" : (media.cover || "")}
                        onChange={(e) => setMedia((prev) => ({ ...prev, cover: e.target.value }))}
                        placeholder="https://... (Overview cover URL)"
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Right: Live In-Situ Preview Box */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                          Live Overview Preview:
                        </span>
                        <span className="text-[10px] font-mono opacity-60">Dossier Hero Banner</span>
                      </div>
                      <div
                        className={`relative w-full h-44 rounded-xl overflow-hidden border ${
                          isCyber ? "border-cyan-500/30 bg-black/60" : "border-2 border-black bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                      >
                        {media.cover ? (
                          <>
                            <img
                              src={media.cover}
                              alt="Overview Cover Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between pointer-events-none">
                              <div className="min-w-0">
                                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                                  {source.title || "Source Title"}
                                </span>
                                <span className="text-xs font-black text-white truncate block">
                                  {coupleName || "Couple Profile"}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/30 border border-pink-400/50 text-pink-300">
                                ❤️ Dossier
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-2xl mb-1.5 opacity-50">🖼️</span>
                            <span className="text-xs font-mono font-bold opacity-75">
                              No Overview Cover Selected
                            </span>
                            <span className="text-[10px] font-mono opacity-50 mt-1 max-w-[200px]">
                              Will fall back to Card Poster or primary gallery image
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CARD POSTER */}
              <div className={cardContainerStyle}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3 border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        Slot B
                      </span>
                      <h4 className="font-black text-sm font-mono tracking-wide text-rose-300">
                        CARD POSTER (Portrait / 3:4)
                      </h4>
                    </div>
                    <p className="text-xs font-mono opacity-70 mt-1">
                      Portrait artwork used as the full-art background of the Couple collection card.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 opacity-75">
                    Used in: Couple Collection Card
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Upload & URL controls */}
                  <div className="lg:col-span-7 space-y-3">
                    <CharacterImageUploader
                      label="Upload Card Poster (3:4 Portrait)"
                      value={media.card || ""}
                      onChange={(url) => setMedia((prev) => ({ ...prev, card: url }))}
                      onClear={() => setMedia((prev) => ({ ...prev, card: "" }))}
                      aspect={3 / 4}
                      hint="Portrait 3:4 orientation recommended for optimal display on the full-art collection card."
                      previewClass="h-44 w-full"
                    />
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono opacity-70 block">
                        Or paste direct Image URL:
                      </label>
                      <input
                        type="text"
                        value={(media.card || "").startsWith("data:") ? "" : (media.card || "")}
                        onChange={(e) => setMedia((prev) => ({ ...prev, card: e.target.value }))}
                        placeholder="https://... (Card poster URL)"
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Right: Live In-Situ Card Preview Box */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          Live Card Preview:
                        </span>
                        <span className="text-[10px] font-mono opacity-60">Collection Card View</span>
                      </div>
                      <div
                        className={`relative w-full max-w-[240px] mx-auto h-52 rounded-xl overflow-hidden border flex flex-col justify-between p-2.5 ${
                          isCyber ? "border-pink-500/40 bg-[#080c1a]" : "border-2 border-black bg-rose-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                      >
                        {/* Background */}
                        {media.card || media.cover ? (
                          <>
                            <img
                              src={media.card || media.cover || ""}
                              alt="Card Poster Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />
                          </>
                        ) : (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: isCyber
                                ? "linear-gradient(135deg, rgba(8,12,28,0.95), rgba(30,10,45,0.95))"
                                : "linear-gradient(135deg, #FFF0F5, #F5F0FF)",
                            }}
                          />
                        )}

                        {/* Top bar */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black font-mono bg-pink-500/40 text-pink-200 border border-pink-400/50">
                            {tier}
                          </span>
                          <span className="text-[10px] text-pink-400">★</span>
                        </div>

                        {/* Center lovers mockup */}
                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <div className="flex flex-col items-center max-w-[60px]">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400 bg-black/60 shadow">
                              <img
                                src={
                                  partnerA.avatar?.trim() ||
                                  characterDictOptions.find((c) => c.id === partnerA.characterId)?.avatar ||
                                  "/avatar.png"
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[8px] font-black text-white truncate w-full text-center mt-0.5 drop-shadow">
                              {partnerA.name || "Partner A"}
                            </span>
                          </div>

                          <span className="text-xs text-pink-400">❤️</span>

                          <div className="flex flex-col items-center max-w-[60px]">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-400 bg-black/60 shadow">
                              <img
                                src={
                                  partnerB.avatar?.trim() ||
                                  characterDictOptions.find((c) => c.id === partnerB.characterId)?.avatar ||
                                  "/avatar.png"
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[8px] font-black text-white truncate w-full text-center mt-0.5 drop-shadow">
                              {partnerB.name || "Partner B"}
                            </span>
                          </div>
                        </div>

                        {/* Bottom */}
                        <div className="relative z-10 text-center">
                          <span className="text-[10px] font-black text-white truncate block drop-shadow">
                            {coupleName || "Couple Profile"}
                          </span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-pink-500/40 text-pink-200 border border-pink-400/50">
                            ❤️ MATCH
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: GALLERY & MEDIA VAULT */}
              <div className={cardContainerStyle}>
                <div className="border-b pb-3 mb-3 border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40">
                      Slot C
                    </span>
                    <h4 className="font-black text-sm font-mono tracking-wide text-purple-300">
                      GALLERY & RELATIONSHIP VAULT
                    </h4>
                  </div>
                  <p className="text-xs font-mono opacity-70 mt-1">
                    Upload multiple photos directly, crop, or paste online image links for the relationship dossier gallery.
                  </p>
                </div>

                <GalleryUploader
                  images={media.gallery || []}
                  onChange={(newGallery) => setMedia((prev) => ({ ...prev, gallery: newGallery }))}
                />

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGalleryImage();
                      }
                    }}
                    placeholder="Or paste artwork URL directly (https://...)"
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-mono cursor-pointer shrink-0 ${
                      isCyber
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30"
                        : "bg-black text-white font-black hover:bg-neutral-800"
                    }`}
                  >
                    + Add URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Footer */}
          <div
            className={`flex items-center justify-end gap-3 pt-4 border-t ${
              isCyber ? "border-white/10" : "border-black"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                isCyber
                  ? "border border-white/15 text-slate-300 hover:bg-white/5"
                  : "border-2 border-black bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl text-xs font-black font-mono cursor-pointer transition-all shadow-lg ${
                isCyber
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-rose-500/20"
                  : "bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
              }`}
            >
              {isSaving ? "Saving..." : coupleToEdit ? "Save Changes" : "Create Couple Profile"}
            </button>
          </div>
        </form>
      </>
    )}
  </div>
</Modal>
  );
}
