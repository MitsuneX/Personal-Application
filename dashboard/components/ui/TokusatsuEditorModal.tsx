"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";
import { isHofDuplicate } from "@/lib/data/duplicateHelper";
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";
import {
  TokusatsuProfile,
  TokusatsuFranchiseType,
  TokusatsuForm,
  TokusatsuWeapon,
  TokusatsuVehicle,
  TokusatsuAbility,
  TokusatsuAppearance,
  KamenRiderSpecificData,
  UltramanSpecificData,
  PowerRangersSpecificData,
  SuperSentaiSpecificData,
} from "@/lib/types/tokusatsu";
import {
  normalizeTokusatsuProfile,
  extractHofDataFromTokusatsuProfile,
  searchTokusatsuPresets,
  TOKUSATSU_PRESETS,
  defaultKamenRiderData,
  defaultUltramanData,
  defaultPowerRangersData,
  defaultSuperSentaiData,
} from "@/lib/data/tokusatsuDataHelper";
import { TokusatsuJsonEditor } from "@/components/ui/TokusatsuJsonEditor";

interface TokusatsuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: HallOfFameEntry | null;
}

type TokuTab =
  | "basic"
  | "profile"
  | "forms"
  | "weapons"
  | "vehicles"
  | "abilities"
  | "production"
  | "appearances"
  | "franchise"
  | "autofill";

const TOKU_TABS: TokuTab[] = [
  "basic",
  "profile",
  "forms",
  "weapons",
  "vehicles",
  "abilities",
  "production",
  "appearances",
  "franchise",
  "autofill",
];

const TOKU_TAB_ITEMS = [
  { id: "basic", label: "Identity", icon: "⚙️" },
  { id: "profile", label: "Profile & System", icon: "🦸" },
  { id: "forms", label: "Forms & Transformations", icon: "⚡" },
  { id: "weapons", label: "Weapons", icon: "⚔️" },
  { id: "vehicles", label: "Vehicles", icon: "🏍️" },
  { id: "abilities", label: "Powers & Finishers", icon: "💥" },
  { id: "production", label: "Cast & Production", icon: "🎬" },
  { id: "appearances", label: "Appearances", icon: "📺" },
  { id: "franchise", label: "Franchise Data", icon: "🛡️" },
  { id: "autofill", label: "Presets & Autofill", icon: "⚡" },
];

export function TokusatsuEditorModal({
  isOpen,
  onClose,
  entryToEdit,
}: TokusatsuEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { updateHof, hallOfFame } = useDashboardStore();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [activeTab, setActiveTab] = useState<TokuTab>("basic");
  // "visual" = standard form editor | "json" = JSON editor panel
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual");

  // Tab Strip Scroll Refs
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Full Normalized Form State
  const [profile, setProfile] = useState<TokusatsuProfile>(() =>
    normalizeTokusatsuProfile(null, entryToEdit)
  );

  // Preset search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<TokusatsuProfile | null>(null);
  const [overwriteNonEmpty, setOverwriteNonEmpty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or reset form state when entryToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeTokusatsuProfile(null, entryToEdit);
      setProfile(normalized);
      setActiveTab("basic");
      setSelectedPreset(null);
      setSearchQuery("");
    }
  }, [entryToEdit, isOpen]);

  // Tab Auto-scroll
  const scrollToTab = (tabId: TokuTab) => {
    setActiveTab(tabId);
    requestAnimationFrame(() => {
      const container = tabListRef.current;
      const tabEl = tabRefs.current[tabId];
      if (!container || !tabEl) return;

      const containerRect = container.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();

      const padding = 16;
      if (tabRect.right > containerRect.right) {
        const scrollOffset = tabRect.right - containerRect.right + padding;
        container.scrollBy({ left: scrollOffset, behavior: "smooth" });
      } else if (tabRect.left < containerRect.left) {
        const scrollOffset = containerRect.left - tabRect.left + padding;
        container.scrollBy({ left: -scrollOffset, behavior: "smooth" });
      }
    });
  };

  const currentStepIndex = TOKU_TABS.indexOf(activeTab);

  const handleNextTab = () => {
    if (currentStepIndex < TOKU_TABS.length - 1) {
      scrollToTab(TOKU_TABS[currentStepIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    if (currentStepIndex > 0) {
      scrollToTab(TOKU_TABS[currentStepIndex - 1]);
    }
  };

  // Helper updater for simple top-level string/array profile fields
  const updateProfileField = <K extends keyof TokusatsuProfile>(
    field: K,
    value: TokusatsuProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Helper updaters for franchise specific objects
  const updateKRField = <K extends keyof KamenRiderSpecificData>(
    field: K,
    val: KamenRiderSpecificData[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      kamenRider: {
        ...(prev.kamenRider || defaultKamenRiderData()),
        [field]: val,
      },
    }));
  };

  const updateUltraField = <K extends keyof UltramanSpecificData>(
    field: K,
    val: UltramanSpecificData[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      ultraman: {
        ...(prev.ultraman || defaultUltramanData()),
        [field]: val,
      },
    }));
  };

  const updatePRField = <K extends keyof PowerRangersSpecificData>(
    field: K,
    val: PowerRangersSpecificData[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      powerRangers: {
        ...(prev.powerRangers || defaultPowerRangersData()),
        [field]: val,
      },
    }));
  };

  const updateSSField = <K extends keyof SuperSentaiSpecificData>(
    field: K,
    val: SuperSentaiSpecificData[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      superSentai: {
        ...(prev.superSentai || defaultSuperSentaiData()),
        [field]: val,
      },
    }));
  };

  // ─── Repeatable Collection Handlers ──────────────────────────────────────────

  // FORMS
  const handleAddForm = () => {
    const newForm: TokusatsuForm = {
      id: `form-${Date.now()}`,
      name: "New Form / Phase",
      formType: "Base",
      appearance: "",
      transformationDevice: profile.transformationDevice || "",
      transformationItem: "",
      transformationSequence: "",
      transformationPhrase: profile.transformationPhrase || "",
      abilities: [],
      weapons: [],
      finisher: "",
      powerLevelNotes: "",
      debutEpisode: "",
      imageUrl: "",
    };
    setProfile((prev) => ({ ...prev, forms: [...prev.forms, newForm] }));
  };

  const handleUpdateForm = (index: number, updated: Partial<TokusatsuForm>) => {
    setProfile((prev) => {
      const nextForms = [...prev.forms];
      if (nextForms[index]) {
        nextForms[index] = { ...nextForms[index], ...updated };
      }
      return { ...prev, forms: nextForms };
    });
  };

  const handleRemoveForm = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      forms: prev.forms.filter((_, i) => i !== index),
    }));
  };

  const handleMoveForm = (index: number, direction: "up" | "down") => {
    setProfile((prev) => {
      const nextForms = [...prev.forms];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextForms.length) return prev;
      const temp = nextForms[index];
      nextForms[index] = nextForms[targetIndex];
      nextForms[targetIndex] = temp;
      return { ...prev, forms: nextForms };
    });
  };

  // WEAPONS
  const handleAddWeapon = () => {
    const newWep: TokusatsuWeapon = {
      id: `wep-${Date.now()}`,
      name: "New Hero Weapon",
      type: "Blade / Blaster",
      description: "",
      abilities: [],
      specialAttack: "",
      firstAppearance: "",
      associatedForm: "Base Form",
      imageUrl: "",
    };
    setProfile((prev) => ({ ...prev, weapons: [...prev.weapons, newWep] }));
  };

  const handleUpdateWeapon = (index: number, updated: Partial<TokusatsuWeapon>) => {
    setProfile((prev) => {
      const next = [...prev.weapons];
      if (next[index]) next[index] = { ...next[index], ...updated };
      return { ...prev, weapons: next };
    });
  };

  const handleRemoveWeapon = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== index),
    }));
  };

  // VEHICLES
  const handleAddVehicle = () => {
    const newVeh: TokusatsuVehicle = {
      id: `veh-${Date.now()}`,
      name: "New Hero Machine",
      type: "Motorcycle",
      description: "",
      abilities: "",
      associatedHeroForm: "Base Form",
      debut: "",
      imageUrl: "",
    };
    setProfile((prev) => ({ ...prev, vehicles: [...prev.vehicles, newVeh] }));
  };

  const handleUpdateVehicle = (index: number, updated: Partial<TokusatsuVehicle>) => {
    setProfile((prev) => {
      const next = [...prev.vehicles];
      if (next[index]) next[index] = { ...next[index], ...updated };
      return { ...prev, vehicles: next };
    });
  };

  const handleRemoveVehicle = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  // ABILITIES / FINISHERS
  const handleAddAbility = () => {
    const newAbi: TokusatsuAbility = {
      id: `abi-${Date.now()}`,
      name: "New Special Attack",
      category: "Finisher",
      description: "",
      activationMethod: "",
      associatedForm: "Base Form",
      visualEffect: "",
      isFinisher: true,
      debut: "",
    };
    setProfile((prev) => ({ ...prev, abilities: [...prev.abilities, newAbi] }));
  };

  const handleUpdateAbility = (index: number, updated: Partial<TokusatsuAbility>) => {
    setProfile((prev) => {
      const next = [...prev.abilities];
      if (next[index]) next[index] = { ...next[index], ...updated };
      return { ...prev, abilities: next };
    });
  };

  const handleRemoveAbility = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      abilities: prev.abilities.filter((_, i) => i !== index),
    }));
  };

  // APPEARANCES
  const handleAddAppearance = () => {
    const newApp: TokusatsuAppearance = {
      id: `app-${Date.now()}`,
      title: profile.series || "Tokusatsu Series",
      appearanceType: "Main Series",
      episodeFilmNumber: "",
      releaseYear: profile.debutYear || "2023",
      role: "Main Protagonist",
      notes: "",
    };
    setProfile((prev) => ({ ...prev, appearances: [...prev.appearances, newApp] }));
  };

  const handleUpdateAppearance = (index: number, updated: Partial<TokusatsuAppearance>) => {
    setProfile((prev) => {
      const next = [...prev.appearances];
      if (next[index]) next[index] = { ...next[index], ...updated };
      return { ...prev, appearances: next };
    });
  };

  const handleRemoveAppearance = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      appearances: prev.appearances.filter((_, i) => i !== index),
    }));
  };

  // Preset search results
  const presetResults = useMemo(() => {
    return searchTokusatsuPresets(searchQuery);
  }, [searchQuery]);

  // Apply Preset Autofill
  const handleApplyPreset = () => {
    if (!selectedPreset) return;

    if (overwriteNonEmpty) {
      setProfile(selectedPreset);
    } else {
      setProfile((prev) => ({
        ...prev,
        heroName: prev.heroName || selectedPreset.heroName,
        civilianName: prev.civilianName || selectedPreset.civilianName,
        series: prev.series || selectedPreset.series,
        universe: prev.universe || selectedPreset.universe,
        country: prev.country || selectedPreset.country,
        debutYear: prev.debutYear || selectedPreset.debutYear,
        firstAppearance: prev.firstAppearance || selectedPreset.firstAppearance,
        status: prev.status || selectedPreset.status,
        alignment: prev.alignment || selectedPreset.alignment,
        organization: prev.organization || selectedPreset.organization,
        heroType: prev.heroType || selectedPreset.heroType,
        transformationSystem: prev.transformationSystem || selectedPreset.transformationSystem,
        transformationDevice: prev.transformationDevice || selectedPreset.transformationDevice,
        transformationMethod: prev.transformationMethod || selectedPreset.transformationMethod,
        transformationPhrase: prev.transformationPhrase || selectedPreset.transformationPhrase,
        baseForm: prev.baseForm || selectedPreset.baseForm,
        primaryColor: prev.primaryColor || selectedPreset.primaryColor,
        secondaryColor: prev.secondaryColor || selectedPreset.secondaryColor,
        suitDescription: prev.suitDescription || selectedPreset.suitDescription,
        powerSource: prev.powerSource || selectedPreset.powerSource,
        signatureAbility: prev.signatureAbility || selectedPreset.signatureAbility,
        weaknesses: prev.weaknesses || selectedPreset.weaknesses,

        forms: prev.forms.length > 0 ? prev.forms : selectedPreset.forms,
        weapons: prev.weapons.length > 0 ? prev.weapons : selectedPreset.weapons,
        vehicles: prev.vehicles.length > 0 ? prev.vehicles : selectedPreset.vehicles,
        abilities: prev.abilities.length > 0 ? prev.abilities : selectedPreset.abilities,
        appearances: prev.appearances.length > 0 ? prev.appearances : selectedPreset.appearances,

        mainActor: prev.mainActor || selectedPreset.mainActor,
        suitActor: prev.suitActor || selectedPreset.suitActor,
        voiceActor: prev.voiceActor || selectedPreset.voiceActor,
        productionStudio: prev.productionStudio || selectedPreset.productionStudio,
        networkBroadcaster: prev.networkBroadcaster || selectedPreset.networkBroadcaster,
        broadcastPeriod: prev.broadcastPeriod || selectedPreset.broadcastPeriod,

        kamenRider: prev.kamenRider || selectedPreset.kamenRider,
        ultraman: prev.ultraman || selectedPreset.ultraman,
        powerRangers: prev.powerRangers || selectedPreset.powerRangers,
        superSentai: prev.superSentai || selectedPreset.superSentai,
      }));
    }

    toastSuccess(`✓ Applied Tokusatsu preset for "${selectedPreset.heroName}".`);
    scrollToTab("basic");
  };

  // ─── JSON Editor → Visual Editor apply handler ─────────────────────────────
  const handleJsonApply = (updated: TokusatsuProfile, _mode: "replace" | "merge") => {
    // normalizeTokusatsuProfile ensures no runtime crash on partial profiles
    setProfile(normalizeTokusatsuProfile(updated as any, entryToEdit));
    // Switch back to visual editor so the user can inspect the result
    setEditorMode("visual");
    scrollToTab("basic");
    toastSuccess(`✓ JSON applied to visual editor (${_mode} mode).`);
  };

  // ─── Export current profile as JSON file ────────────────────────────────────
  const handleExportJson = () => {
    try {
      const json = JSON.stringify(profile, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(profile.heroName || "tokusatsu-hero").replace(/\s+/g, "_").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess(`✓ JSON exported: ${profile.heroName}.json`);
    } catch {
      toastError("Failed to export JSON.");
    }
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.heroName.trim()) {
      toastError("Hero Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const id = entryToEdit?.id || `toku-${Date.now()}`;

      // ── Duplicate prevention (only for new entries) ──
      if (!entryToEdit) {
        const duplicate = isHofDuplicate(
          { name: profile.heroName.trim(), type: "tokusatsu", tokusatsuFranchise: profile.franchiseType },
          hallOfFame
        );
        if (duplicate) {
          toastWarning(
            `“${duplicate.name}” already exists in the Character Directory. ` +
            `Right-click the existing card and choose “Duplicate Entry” if you intentionally want an independent copy.`
          );
          setIsSaving(false);
          return;
        }
      }

      const payload = extractHofDataFromTokusatsuProfile(profile, entryToEdit);

      await updateHof(id, {
        id,
        ...payload,
      });

      toastSuccess(`✨ Tokusatsu Hero "${profile.heroName}" successfully saved.`);
      onClose();
    } catch (err: any) {
      console.error("Tokusatsu save error:", err);
      toastError("Failed to save Tokusatsu hero entry.");
    } finally {
      setIsSaving(false);
    }
  };

  // Common Input Styles
  const inputClass = `w-full p-2.5 rounded-xl border text-xs font-mono transition-colors focus:outline-none ${
    isCyber
      ? "bg-white/5 border-white/10 text-white focus:border-red-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-black"
  }`;

  const inputStyle = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFFFFF",
    borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#D1D5DB",
    color: isCyber ? "#F8FAFC" : "#0F172A",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden select-none">
        {/* Header */}
        <div
          className="p-3 sm:p-4 border-b flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,30,0.95)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(239,68,68,0.3)" : "#E5E7EB",
          }}
        >
          {/* Title row */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 border border-red-500/40 flex items-center justify-center text-xl shrink-0 font-bold">
              🎬
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black theme-text-primary truncate">
                  {entryToEdit ? `Edit: ${profile.heroName}` : "New Tokusatsu Hero"}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {profile.franchiseType.replace("_", " ")}
                </span>
              </div>
              <p className="text-[10px] theme-text-muted font-mono">
                Tokusatsu Hero & Armor System Editor
              </p>
            </div>
          </div>

          {/* Mode switch + actions row */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Visual / JSON mode toggle */}
            <div
              className="flex items-center rounded-lg border overflow-hidden shrink-0"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
            >
              <button
                type="button"
                onClick={() => setEditorMode("visual")}
                className="px-3 py-1.5 text-[11px] font-bold font-mono transition-all cursor-pointer"
                style={{
                  backgroundColor: editorMode === "visual"
                    ? isCyber ? "#EF4444" : "#1E293B"
                    : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                  color: editorMode === "visual"
                    ? "#FFF"
                    : isCyber ? "#94A3B8" : "#64748B",
                }}
              >
                🖊 Visual
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("json")}
                className="px-3 py-1.5 text-[11px] font-bold font-mono transition-all cursor-pointer"
                style={{
                  backgroundColor: editorMode === "json"
                    ? isCyber ? "#EF4444" : "#1E293B"
                    : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                  color: editorMode === "json"
                    ? "#FFF"
                    : isCyber ? "#94A3B8" : "#64748B",
                }}
              >
                {"{ }"} JSON
              </button>
            </div>

            {/* Export JSON quick-action */}
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 text-[11px] font-bold font-mono rounded-lg border transition-all cursor-pointer shrink-0"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                color: isCyber ? "#94A3B8" : "#475569",
              }}
              title="Export current hero data as .json file"
            >
              ⬇ Export
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm cursor-pointer opacity-70 hover:opacity-100 shrink-0"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#D1D5DB" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip — rendered in visual mode as part of the conditional block below */}

        {/* ── JSON Editor Mode ── */}
        {editorMode === "json" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <TokusatsuJsonEditor
              profile={profile}
              onApply={handleJsonApply}
            />
          </div>
        )}

        {/* ── Visual Editor Tabs + Form ── */}
        {editorMode === "visual" && (
          <>
        {/* Tab Navigation Strip (visual mode only) */}
        <div
          ref={tabListRef}
          className="flex items-center gap-1.5 p-2 overflow-x-auto border-b scrollbar-none shrink-0"
          style={{
            backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "#F8FAFC",
            borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          }}
        >
          {TOKU_TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                onClick={() => scrollToTab(tab.id as TokuTab)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none"
                style={{
                  backgroundColor: isActive
                    ? isCyber ? "#EF4444" : "#FEF08A"
                    : isCyber ? "rgba(255,255,255,0.04)" : "transparent",
                  color: isActive
                    ? isCyber ? "#FFFFFF" : "#854D0E"
                    : isCyber ? "#94A3B8" : "#475569",
                  border: isActive
                    ? isCyber ? "1px solid #EF4444" : "1.5px solid #000"
                    : "1px solid transparent",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "forms" && profile.forms.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-black/20 font-bold">
                    {profile.forms.length}
                  </span>
                )}
                {tab.id === "weapons" && profile.weapons.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-black/20 font-bold">
                    {profile.weapons.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASIC IDENTITY */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Hero / Character Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.heroName}
                    onChange={(e) => updateProfileField("heroName", e.target.value)}
                    placeholder="e.g. Kamen Rider Geats / Ultraman Tiga"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Civilian Name / Human Host
                  </label>
                  <input
                    type="text"
                    value={profile.civilianName}
                    onChange={(e) => updateProfileField("civilianName", e.target.value)}
                    placeholder="e.g. Ace Ukyo / Daigo Madoka / Jason Lee Scott"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Franchise Type
                  </label>
                  <select
                    value={profile.franchiseType}
                    onChange={(e) =>
                      updateProfileField("franchiseType", e.target.value as TokusatsuFranchiseType)
                    }
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="KAMEN_RIDER">Kamen Rider</option>
                    <option value="ULTRAMAN">Ultraman</option>
                    <option value="POWER_RANGERS">Power Rangers</option>
                    <option value="SUPER_SENTAI">Super Sentai</option>
                    <option value="OTHER">Generic / Other Tokusatsu</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Series / Franchise Name
                  </label>
                  <input
                    type="text"
                    value={profile.series}
                    onChange={(e) => updateProfileField("series", e.target.value)}
                    placeholder="e.g. Kamen Rider Geats / Ultraman Tiga"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Universe / Setting
                  </label>
                  <input
                    type="text"
                    value={profile.universe}
                    onChange={(e) => updateProfileField("universe", e.target.value)}
                    placeholder="e.g. Desire Grand Prix World / Neo Frontier"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Country / Region
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => updateProfileField("country", e.target.value)}
                    placeholder="e.g. Japan / United States"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Debut Year
                  </label>
                  <input
                    type="text"
                    value={profile.debutYear}
                    onChange={(e) => updateProfileField("debutYear", e.target.value)}
                    placeholder="e.g. 2022"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Debut Episode / Film
                  </label>
                  <input
                    type="text"
                    value={profile.firstAppearance}
                    onChange={(e) => updateProfileField("firstAppearance", e.target.value)}
                    placeholder="e.g. Episode 1: Day of the Hunt"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Status Tier
                  </label>
                  <input
                    type="text"
                    value={profile.status}
                    onChange={(e) => updateProfileField("status", e.target.value)}
                    placeholder="e.g. GOAT Status, Legendary Hero"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Alignment
                  </label>
                  <input
                    type="text"
                    value={profile.alignment}
                    onChange={(e) => updateProfileField("alignment", e.target.value)}
                    placeholder="e.g. Hero / Lawful Good"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Organization / Affiliation
                  </label>
                  <input
                    type="text"
                    value={profile.organization}
                    onChange={(e) => updateProfileField("organization", e.target.value)}
                    placeholder="e.g. Desire Grand Prix / GUTS / S.P.D."
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Artwork URLs */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <span className="text-xs font-mono font-bold text-red-400 block">
                  🖼️ Hero Card & Profile Artwork
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CharacterImageUploader
                    label="Hero Card Image (3:4)"
                    value={profile.imageUrl}
                    onChange={(url) => updateProfileField("imageUrl", url)}
                    onClear={() => updateProfileField("imageUrl", "")}
                    aspect={3 / 4}
                    hint="Primary roster thumbnail."
                    previewClass="h-40 w-full"
                  />
                  <CharacterImageUploader
                    label="Profile Portrait (3:4)"
                    value={profile.portraitUrl}
                    onChange={(url) => updateProfileField("portraitUrl", url)}
                    onClear={() => updateProfileField("portraitUrl", "")}
                    aspect={3 / 4}
                    hint="Profile view artwork."
                    previewClass="h-40 w-full"
                  />
                  <CharacterImageUploader
                    label="Square Avatar (1:1)"
                    value={profile.avatarUrl}
                    onChange={(url) => updateProfileField("avatarUrl", url)}
                    onClear={() => updateProfileField("avatarUrl", "")}
                    aspect={1}
                    hint="Profile header avatar."
                    previewClass="h-40 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOKUSATSU PROFILE & SYSTEM */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Hero Classification / Role
                  </label>
                  <input
                    type="text"
                    value={profile.heroType}
                    onChange={(e) => updateProfileField("heroType", e.target.value)}
                    placeholder="e.g. Primary Rider, Secondary Rider, 6th Ranger, Giant of Light"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Base Form Name
                  </label>
                  <input
                    type="text"
                    value={profile.baseForm}
                    onChange={(e) => updateProfileField("baseForm", e.target.value)}
                    placeholder="e.g. MagnumBoost Form / Multi Type"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Transformation System
                  </label>
                  <input
                    type="text"
                    value={profile.transformationSystem}
                    onChange={(e) => updateProfileField("transformationSystem", e.target.value)}
                    placeholder="e.g. Desire Driver System, Morphin Grid"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Transformation Device / Belt
                  </label>
                  <input
                    type="text"
                    value={profile.transformationDevice}
                    onChange={(e) => updateProfileField("transformationDevice", e.target.value)}
                    placeholder="e.g. Desire Driver, Spark Lence, Power Morpher"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Transformation Phrase / Call
                  </label>
                  <input
                    type="text"
                    value={profile.transformationPhrase}
                    onChange={(e) => updateProfileField("transformationPhrase", e.target.value)}
                    placeholder="e.g. Henshin! / It's Morphin Time!"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider opacity-70">
                  Transformation Method & Sequence
                </label>
                <textarea
                  rows={2}
                  value={profile.transformationMethod}
                  onChange={(e) => updateProfileField("transformationMethod", e.target.value)}
                  placeholder="e.g. Set Magnum Raise Buckle into Desire Driver, revolve driver, press lever..."
                  className={inputClass + " resize-none"}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Primary Suit Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={profile.primaryColor || "#EF4444"}
                      onChange={(e) => updateProfileField("primaryColor", e.target.value)}
                      className="w-8 h-8 rounded border shrink-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={profile.primaryColor}
                      onChange={(e) => updateProfileField("primaryColor", e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={profile.secondaryColor || "#00F5FF"}
                      onChange={(e) => updateProfileField("secondaryColor", e.target.value)}
                      className="w-8 h-8 rounded border shrink-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={profile.secondaryColor}
                      onChange={(e) => updateProfileField("secondaryColor", e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Power Source
                  </label>
                  <input
                    type="text"
                    value={profile.powerSource}
                    onChange={(e) => updateProfileField("powerSource", e.target.value)}
                    placeholder="e.g. Desire Energy, Plasma Core, Ancient Light"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider opacity-70">
                  Suit & Armor Description
                </label>
                <textarea
                  rows={2}
                  value={profile.suitDescription}
                  onChange={(e) => updateProfileField("suitDescription", e.target.value)}
                  placeholder="Visual details of suit armor, helmet visor, compound eyes, chest emblem..."
                  className={inputClass + " resize-none"}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Signature Ability
                  </label>
                  <input
                    type="text"
                    value={profile.signatureAbility}
                    onChange={(e) => updateProfileField("signatureAbility", e.target.value)}
                    placeholder="e.g. MagnumBoost Grand Victory / Zeperion Beam"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Weaknesses & Limitations
                  </label>
                  <input
                    type="text"
                    value={profile.weaknesses}
                    onChange={(e) => updateProfileField("weaknesses", e.target.value)}
                    placeholder="e.g. 3-minute Color Timer limit, driver overheat"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMS & TRANSFORMATIONS (REPEATABLE COLLECTION) */}
          {activeTab === "forms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    ⚡ Repeatable Forms & Transformations Matrix
                  </span>
                  <p className="text-[11px] theme-text-muted">
                    Configure Base, Upgrade, Super, Final, Movie, and Fusion forms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddForm}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white cursor-pointer hover:scale-105 transition-all"
                >
                  + Add Form
                </button>
              </div>

              {profile.forms.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No forms added yet. Click "+ Add Form" to create forms.
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.forms.map((form, idx) => (
                    <div
                      key={form.id}
                      className="p-4 rounded-2xl border space-y-3 relative"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 border-b pb-2 border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold theme-text-primary">
                            {form.name || `Form ${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveForm(idx, "up")}
                            disabled={idx === 0}
                            className="px-2 py-1 text-[10px] rounded bg-white/10 disabled:opacity-30 cursor-pointer"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveForm(idx, "down")}
                            disabled={idx === profile.forms.length - 1}
                            className="px-2 py-1 text-[10px] rounded bg-white/10 disabled:opacity-30 cursor-pointer"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveForm(idx)}
                            className="px-2 py-1 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleUpdateForm(idx, { name: e.target.value })}
                          placeholder="Form Name (e.g. Geats IX)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <select
                          value={form.formType}
                          onChange={(e) => handleUpdateForm(idx, { formType: e.target.value })}
                          className={inputClass}
                          style={inputStyle}
                        >
                          <option value="Base">Base Form</option>
                          <option value="Upgrade">Upgrade Form</option>
                          <option value="Super">Super Form</option>
                          <option value="Final">Final Form</option>
                          <option value="Movie">Movie Exclusive</option>
                          <option value="Special">Special / Extra</option>
                          <option value="Berserk">Berserk Form</option>
                          <option value="Power Type">Power Type</option>
                          <option value="Speed Type">Speed Type</option>
                          <option value="Sky Type">Sky Type</option>
                          <option value="Strong Type">Strong Type</option>
                          <option value="Fusion">Fusion / Combination</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          type="text"
                          value={form.transformationItem}
                          onChange={(e) => handleUpdateForm(idx, { transformationItem: e.target.value })}
                          placeholder="Item (e.g. Geats IX Buckle)"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={form.finisher}
                          onChange={(e) => handleUpdateForm(idx, { finisher: e.target.value })}
                          placeholder="Finisher Attack"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={form.debutEpisode}
                          onChange={(e) => handleUpdateForm(idx, { debutEpisode: e.target.value })}
                          placeholder="Debut Episode / Film"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={form.appearance}
                        onChange={(e) => handleUpdateForm(idx, { appearance: e.target.value })}
                        placeholder="Suit appearance description & abilities..."
                        className={inputClass + " resize-none"}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEAPONS & EQUIPMENT */}
          {activeTab === "weapons" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    ⚔️ Weapons & Equipment Collection
                  </span>
                  <p className="text-[11px] theme-text-muted">
                    Dedicated weapon items, blasters, swords, shields, and tools.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWeapon}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white cursor-pointer hover:scale-105 transition-all"
                >
                  + Add Weapon
                </button>
              </div>

              {profile.weapons.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No weapons added yet. Click "+ Add Weapon" to add weapons.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.weapons.map((wep, idx) => (
                    <div
                      key={wep.id}
                      className="p-3.5 rounded-2xl border space-y-2"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold theme-text-primary">
                          Weapon #{idx + 1}: {wep.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWeapon(idx)}
                          className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={wep.name}
                          onChange={(e) => handleUpdateWeapon(idx, { name: e.target.value })}
                          placeholder="Weapon Name"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={wep.type}
                          onChange={(e) => handleUpdateWeapon(idx, { type: e.target.value })}
                          placeholder="Type (e.g. Revolver / Sword)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={wep.associatedForm}
                          onChange={(e) => handleUpdateWeapon(idx, { associatedForm: e.target.value })}
                          placeholder="Associated Form"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={wep.specialAttack}
                          onChange={(e) => handleUpdateWeapon(idx, { specialAttack: e.target.value })}
                          placeholder="Special Attack / Finisher Slash"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={wep.description}
                          onChange={(e) => handleUpdateWeapon(idx, { description: e.target.value })}
                          placeholder="Description / Function"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VEHICLES */}
          {activeTab === "vehicles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    🏍️ Rider Machines & Vehicles
                  </span>
                  <p className="text-[11px] theme-text-muted">
                    Motorcycles, aircraft, battle mecha, and zords.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white cursor-pointer hover:scale-105 transition-all"
                >
                  + Add Vehicle
                </button>
              </div>

              {profile.vehicles.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No vehicles added yet. Click "+ Add Vehicle" to add hero machines.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.vehicles.map((veh, idx) => (
                    <div
                      key={veh.id}
                      className="p-3.5 rounded-2xl border space-y-2"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold theme-text-primary">
                          Machine #{idx + 1}: {veh.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(idx)}
                          className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={veh.name}
                          onChange={(e) => handleUpdateVehicle(idx, { name: e.target.value })}
                          placeholder="Machine Name (e.g. Boostriker)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={veh.type}
                          onChange={(e) => handleUpdateVehicle(idx, { type: e.target.value })}
                          placeholder="Type (e.g. Motorcycle / Mecha)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={veh.abilities}
                          onChange={(e) => handleUpdateVehicle(idx, { abilities: e.target.value })}
                          placeholder="Abilities / Features"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: POWERS & FINISHERS */}
          {activeTab === "abilities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    💥 Special Powers & Finishing Moves
                  </span>
                  <p className="text-[11px] theme-text-muted">
                    Rider Kicks, Ultra Beams, Finisher attacks, and passive powers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAbility}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white cursor-pointer hover:scale-105 transition-all"
                >
                  + Add Power/Finisher
                </button>
              </div>

              {profile.abilities.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No special abilities added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.abilities.map((abi, idx) => (
                    <div
                      key={abi.id}
                      className="p-3.5 rounded-2xl border space-y-2"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold theme-text-primary">
                            {abi.name}
                          </span>
                          {abi.isFinisher && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500 text-white">
                              FINISHER 💥
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAbility(idx)}
                          className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={abi.name}
                          onChange={(e) => handleUpdateAbility(idx, { name: e.target.value })}
                          placeholder="Attack Name (e.g. Zeperion Beam)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          value={abi.category}
                          onChange={(e) => handleUpdateAbility(idx, { category: e.target.value })}
                          placeholder="Category (Rider Kick / Ray / Beam)"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={abi.isFinisher}
                            onChange={(e) => handleUpdateAbility(idx, { isFinisher: e.target.checked })}
                            className="rounded accent-red-500"
                          />
                          <span>Signature Finisher Attack</span>
                        </label>
                      </div>

                      <textarea
                        rows={1}
                        value={abi.description}
                        onChange={(e) => handleUpdateAbility(idx, { description: e.target.value })}
                        placeholder="Visual effect & attack details..."
                        className={inputClass + " resize-none"}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CAST & PRODUCTION */}
          {activeTab === "production" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Main / Human Actor
                  </label>
                  <input
                    type="text"
                    value={profile.mainActor}
                    onChange={(e) => updateProfileField("mainActor", e.target.value)}
                    placeholder="e.g. Kan Hideyoshi / Hiroshi Nagano"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Suit Actor / Performer
                  </label>
                  <input
                    type="text"
                    value={profile.suitActor}
                    onChange={(e) => updateProfileField("suitActor", e.target.value)}
                    placeholder="e.g. Yuji Nakata / Koji Nakamura"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Voice Actor
                  </label>
                  <input
                    type="text"
                    value={profile.voiceActor}
                    onChange={(e) => updateProfileField("voiceActor", e.target.value)}
                    placeholder="e.g. Seiyu name if voice-only"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Production Studio
                  </label>
                  <input
                    type="text"
                    value={profile.productionStudio}
                    onChange={(e) => updateProfileField("productionStudio", e.target.value)}
                    placeholder="e.g. Toei Company / Tsuburaya Productions"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Network Broadcaster
                  </label>
                  <input
                    type="text"
                    value={profile.networkBroadcaster}
                    onChange={(e) => updateProfileField("networkBroadcaster", e.target.value)}
                    placeholder="e.g. TV Asahi / MBS"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider opacity-70">
                    Broadcast Period
                  </label>
                  <input
                    type="text"
                    value={profile.broadcastPeriod}
                    onChange={(e) => updateProfileField("broadcastPeriod", e.target.value)}
                    placeholder="e.g. 2022.09.04 – 2023.08.27"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider opacity-70">
                  Production Notes & Backstage Trivia
                </label>
                <textarea
                  rows={3}
                  value={profile.productionNotes}
                  onChange={(e) => updateProfileField("productionNotes", e.target.value)}
                  placeholder="Design notes, suit construction details, anniversary series context..."
                  className={inputClass + " resize-none"}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* TAB 8: APPEARANCES */}
          {activeTab === "appearances" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    📺 Filmography & Appearances
                  </span>
                  <p className="text-[11px] theme-text-muted">
                    Main series, movies, crossovers, and specials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAppearance}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white cursor-pointer hover:scale-105 transition-all"
                >
                  + Add Appearance
                </button>
              </div>

              {profile.appearances.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl">
                  No appearances recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.appearances.map((app, idx) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl border space-y-2"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                        borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#CBD5E1",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold theme-text-primary">
                          Appearance #{idx + 1}: {app.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAppearance(idx)}
                          className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={app.title}
                          onChange={(e) => handleUpdateAppearance(idx, { title: e.target.value })}
                          placeholder="Title"
                          className={inputClass}
                          style={inputStyle}
                        />
                        <select
                          value={app.appearanceType}
                          onChange={(e) =>
                            handleUpdateAppearance(idx, { appearanceType: e.target.value as any })
                          }
                          className={inputClass}
                          style={inputStyle}
                        >
                          <option value="Main Series">Main Series</option>
                          <option value="Movie">Movie</option>
                          <option value="Special">Special / V-Cinext</option>
                          <option value="Crossover">Crossover</option>
                          <option value="Spin-off">Spin-off</option>
                          <option value="Cameo">Cameo</option>
                          <option value="Guest">Guest Role</option>
                        </select>
                        <input
                          type="text"
                          value={app.releaseYear}
                          onChange={(e) => handleUpdateAppearance(idx, { releaseYear: e.target.value })}
                          placeholder="Release Year"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: FRANCHISE-SPECIFIC DATA */}
          {activeTab === "franchise" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border bg-red-500/10 border-red-500/30">
                <span className="text-xs font-mono font-bold text-red-400 block">
                  🛡️ {profile.franchiseType.replace("_", " ")} Dedicated Editorial Metadata
                </span>
                <p className="text-[11px] theme-text-muted">
                  Franchise-specific data fields dynamically rendered for {profile.franchiseType}.
                </p>
              </div>

              {/* KAMEN RIDER SPECIFIC SECTION */}
              {profile.franchiseType === "KAMEN_RIDER" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Rider System
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.riderSystem || ""}
                        onChange={(e) => updateKRField("riderSystem", e.target.value)}
                        placeholder="e.g. Desire Driver System"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Transformation Belt
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.transformationBelt || ""}
                        onChange={(e) => updateKRField("transformationBelt", e.target.value)}
                        placeholder="e.g. Desire Driver / Arcle"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Series Era
                      </label>
                      <select
                        value={profile.kamenRider?.seriesEra || "Reiwa"}
                        onChange={(e) => updateKRField("seriesEra", e.target.value as any)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="Showa">Showa Era</option>
                        <option value="Heisei Phase 1">Heisei Phase 1</option>
                        <option value="Heisei Phase 2">Heisei Phase 2</option>
                        <option value="Reiwa">Reiwa Era</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Rider Kick / Signature Finisher
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.riderKick || ""}
                        onChange={(e) => updateKRField("riderKick", e.target.value)}
                        placeholder="e.g. MagnumBoost Grand Victory"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Rider Machine / Bike
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.riderMachine || ""}
                        onChange={(e) => updateKRField("riderMachine", e.target.value)}
                        placeholder="e.g. Boostriker / Machine HardBoilder"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Final Form Name
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.finalForm || ""}
                        onChange={(e) => updateKRField("finalForm", e.target.value)}
                        placeholder="e.g. Geats IX / Ultimate Kuuga"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Berserk Form Name
                      </label>
                      <input
                        type="text"
                        value={profile.kamenRider?.berserkForm || ""}
                        onChange={(e) => updateKRField("berserkForm", e.target.value)}
                        placeholder="e.g. Metal Cluster Hopper / Hazard Form"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ULTRAMAN SPECIFIC SECTION */}
              {profile.franchiseType === "ULTRAMAN" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Height (m)
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.height || ""}
                        onChange={(e) => updateUltraField("height", e.target.value)}
                        placeholder="e.g. 53m"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Weight (tons)
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.weight || ""}
                        onChange={(e) => updateUltraField("weight", e.target.value)}
                        placeholder="e.g. 44,000t"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Color Timer Limit
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.colorTimer || ""}
                        onChange={(e) => updateUltraField("colorTimer", e.target.value)}
                        placeholder="e.g. 3 Minutes"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Flight Speed
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.flightSpeed || ""}
                        onChange={(e) => updateUltraField("flightSpeed", e.target.value)}
                        placeholder="e.g. Mach 5"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Planet / Origin
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.planetOrigin || ""}
                        onChange={(e) => updateUltraField("planetOrigin", e.target.value)}
                        placeholder="e.g. Nebula M78 / Ancient Earth"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Defense Team
                      </label>
                      <input
                        type="text"
                        value={profile.ultraman?.defenseTeam || ""}
                        onChange={(e) => updateUltraField("defenseTeam", e.target.value)}
                        placeholder="e.g. GUTS / SSSP / ZAT"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* POWER RANGERS SPECIFIC SECTION */}
              {profile.franchiseType === "POWER_RANGERS" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Ranger Color
                      </label>
                      <input
                        type="text"
                        value={profile.powerRangers?.rangerColor || ""}
                        onChange={(e) => updatePRField("rangerColor", e.target.value)}
                        placeholder="e.g. Red / Blue / Sixth Ranger"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Morphing Device
                      </label>
                      <input
                        type="text"
                        value={profile.powerRangers?.morphingDevice || ""}
                        onChange={(e) => updatePRField("morphingDevice", e.target.value)}
                        placeholder="e.g. Power Morpher / Zeonizer"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Personal Zord
                      </label>
                      <input
                        type="text"
                        value={profile.powerRangers?.personalZord || ""}
                        onChange={(e) => updatePRField("personalZord", e.target.value)}
                        placeholder="e.g. Tyrannosaurus Dinozord"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Megazord Form
                      </label>
                      <input
                        type="text"
                        value={profile.powerRangers?.megazord || ""}
                        onChange={(e) => updatePRField("megazord", e.target.value)}
                        placeholder="e.g. Dino Megazord"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Command Center / Mentor
                      </label>
                      <input
                        type="text"
                        value={profile.powerRangers?.mentor || ""}
                        onChange={(e) => updatePRField("mentor", e.target.value)}
                        placeholder="e.g. Zordon & Alpha 5"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUPER SENTAI SPECIFIC SECTION */}
              {profile.franchiseType === "SUPER_SENTAI" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Team Position / Color
                      </label>
                      <input
                        type="text"
                        value={profile.superSentai?.teamPosition || ""}
                        onChange={(e) => updateSSField("teamPosition", e.target.value)}
                        placeholder="e.g. Red Leader / Gokai Red"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Individual Mecha
                      </label>
                      <input
                        type="text"
                        value={profile.superSentai?.individualMecha || ""}
                        onChange={(e) => updateSSField("individualMecha", e.target.value)}
                        placeholder="e.g. Gokai Galleon"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider opacity-70">
                        Combination / Gattai Robo
                      </label>
                      <input
                        type="text"
                        value={profile.superSentai?.combinationGattai || ""}
                        onChange={(e) => updateSSField("combinationGattai", e.target.value)}
                        placeholder="e.g. GokaiOh"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OTHER / GENERIC SPECIFIC SECTION */}
              {profile.franchiseType === "OTHER" && (
                <div className="p-4 rounded-xl border opacity-70 text-xs font-mono text-center">
                  Standard shared Tokusatsu profile fields are active.
                </div>
              )}
            </div>
          )}

          {/* TAB 10: AUTOFILL & PRESETS */}
          {activeTab === "autofill" && (
            <div className="space-y-4 p-4 rounded-2xl border bg-black/5 dark:bg-white/5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 block mb-1">
                  ⚡ Curated Tokusatsu Hero Presets
                </span>
                <p className="text-xs theme-text-muted">
                  Autofill fields using pre-configured Kamen Rider, Ultraman, Power Rangers, and Super Sentai presets.
                </p>
              </div>

              {/* Search box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tokusatsu presets (e.g. Geats, Tiga, Red Ranger)..."
                className={inputClass}
                style={inputStyle}
              />

              {/* Preset List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {presetResults.map((preset, idx) => {
                  const isSelected = selectedPreset?.heroName === preset.heroName;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? "border-red-500 bg-red-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm shrink-0">
                        ⚡
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold theme-text-primary truncate">
                          {preset.heroName}
                        </div>
                        <div className="text-[10px] theme-text-muted truncate">
                          {preset.series} • {preset.franchiseType}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPreset && (
                <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
                  <span className="text-xs font-mono font-bold text-red-400 block">
                    Selected Preset: {selectedPreset.heroName} ({selectedPreset.series})
                  </span>

                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={overwriteNonEmpty}
                      onChange={(e) => setOverwriteNonEmpty(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>Overwrite existing non-empty form fields</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleApplyPreset}
                    className="w-full py-2 rounded-xl text-xs font-black bg-red-500 text-white cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    ⚡ Apply Tokusatsu Hero Preset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form Action Footer */}
          <div
            className="flex items-center justify-between gap-3 pt-3 mt-4 border-t"
            style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000" }}
          >
            {/* Step navigation left */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevTab}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 text-xs font-bold font-mono rounded-lg border transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                  color: isCyber ? "#FFF" : "#000",
                }}
              >
                ← Prev
              </button>
              <span className="text-[11px] font-mono font-bold opacity-40 theme-text-muted px-1">
                {currentStepIndex + 1} / {TOKU_TABS.length}
              </span>
              <button
                type="button"
                onClick={handleNextTab}
                disabled={currentStepIndex === TOKU_TABS.length - 1}
                className="px-3 py-1.5 text-xs font-bold font-mono rounded-lg border transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                  color: isCyber ? "#FFF" : "#000",
                }}
              >
                Next →
              </button>
            </div>

            {/* Submit & Cancel right */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer"
                style={{
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                  color: isCyber ? "#94A3B8" : "#6B7280",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 text-xs font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer shadow-md"
                style={{
                  backgroundColor: isCyber ? "#EF4444" : "#FF6B35",
                  color: "#fff",
                }}
              >
                {isSaving ? "Saving..." : entryToEdit ? "Save Hero Data" : "✨ Enshrine Tokusatsu Hero"}
              </button>
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </Modal>
  );
}
