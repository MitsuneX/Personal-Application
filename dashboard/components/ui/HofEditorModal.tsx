"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/ToastProvider";
import type { HallOfFameEntry, MediaStatus } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { searchArtistPresets, ArtistPreset } from "@/lib/data/artistDataHelper";

interface HofEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: HallOfFameEntry | null;
}

type FormTab = "basic" | "identity" | "profile" | "appearances" | "gallery" | "autofill";

export function HofEditorModal({ isOpen, onClose, entryToEdit }: HofEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { updateHof } = useDashboardStore();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeFormTab, setActiveFormTab] = useState<FormTab>("basic");

  // Basic Card Image fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"actor" | "actress" | "anime" | "singer" | "tokusatsu">("actress");
  const [status, setStatus] = useState<MediaStatus>("GOAT Status");
  const [knownFor, setKnownFor] = useState("");
  const [nationality, setNationality] = useState("");
  const [singerType, setSingerType] = useState("Solo Artist");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [note, setNote] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [isChampion, setIsChampion] = useState(false);
  const [tokusatsuFranchise, setTokusatsuFranchise] = useState("");
  const [tokusatsuShow, setTokusatsuShow] = useState("");
  const [associatedDramas, setAssociatedDramas] = useState("");
  const [accentColor, setAccentColor] = useState("#00F5FF");

  // Dedicated 3:4 Portrait fields (Independent of Card Image)
  const [portraitUrl, setPortraitUrl] = useState("");
  const [portraitSource, setPortraitSource] = useState<"card" | "upload" | "url">("card");

  // Extended Identity & Origin fields
  const [fullName, setFullName] = useState("");
  const [alias, setAlias] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [species, setSpecies] = useState("");
  const [universe, setUniverse] = useState("");
  const [series, setSeries] = useState("");
  const [creator, setCreator] = useState("");
  const [firstAppearance, setFirstAppearance] = useState("");
  const [debutYear, setDebutYear] = useState("");

  // Extended Profile & Lore fields
  const [personality, setPersonality] = useState("");
  const [archetype, setArchetype] = useState("");
  const [occupation, setOccupation] = useState("");
  const [alignment, setAlignment] = useState("");
  const [traitsInput, setTraitsInput] = useState("");
  const [motivation, setMotivation] = useState("");
  const [bio, setBio] = useState("");
  const [characterDevelopment, setCharacterDevelopment] = useState("");

  // Extended Appearances & Media fields
  const [mainSeries, setMainSeries] = useState("");
  const [movies, setMovies] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [spinOffs, setSpinOffs] = useState("");
  const [cameos, setCameos] = useState("");
  const [relatedWorks, setRelatedWorks] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  // Artist Data Preset Autofill State
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<ArtistPreset | null>(null);
  const [overwriteNonEmpty, setOverwriteNonEmpty] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Crop State
  const [cropTarget, setCropTarget] = useState<"card" | "portrait" | "gallery" | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portraitFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const artistSearchResults = useMemo(() => {
    return searchArtistPresets(artistSearchQuery);
  }, [artistSearchQuery]);

  useEffect(() => {
    if (entryToEdit) {
      const details = entryToEdit.details || {};

      setName(entryToEdit.name || "");
      setType(entryToEdit.type || "actress");
      setStatus(entryToEdit.status || "GOAT Status");
      setKnownFor(Array.isArray(entryToEdit.knownFor) ? entryToEdit.knownFor.join(", ") : "");
      setNationality(entryToEdit.nationality || "");
      setSingerType(entryToEdit.singerType || "Solo Artist");
      setImageUrl(entryToEdit.imageUrl || "");
      setNote(entryToEdit.note || "");
      setRank(entryToEdit.rank !== undefined ? entryToEdit.rank : null);
      setIsChampion(entryToEdit.isChampion || false);
      setTokusatsuFranchise(entryToEdit.tokusatsuFranchise || "");
      setTokusatsuShow(entryToEdit.tokusatsuShow || "");
      setAssociatedDramas(entryToEdit.associatedDramas ? entryToEdit.associatedDramas.join(", ") : "");
      setAccentColor(entryToEdit.accentColor || "#00F5FF");

      // Portrait
      if (entryToEdit.portraitUrl && entryToEdit.portraitUrl !== entryToEdit.imageUrl) {
        setPortraitUrl(entryToEdit.portraitUrl);
        setPortraitSource(entryToEdit.portraitUrl.startsWith("/uploads/") ? "upload" : "url");
      } else {
        setPortraitUrl("");
        setPortraitSource("card");
      }

      // Identity & Origin
      setFullName(entryToEdit.fullName || entryToEdit.officialName || details.fullName || "");
      setAlias(entryToEdit.alias || details.alias || "");
      setOriginalLanguage(entryToEdit.originalLanguage || entryToEdit.nativeName || details.originalLanguage || "");
      setPronunciation(entryToEdit.pronunciation || details.pronunciation || "");
      setGender(entryToEdit.gender || details.gender || "");
      setAge(entryToEdit.age || details.age || "");
      setSpecies(entryToEdit.species || details.species || "");
      setUniverse(entryToEdit.universe || entryToEdit.work || details.universe || "");
      setSeries(entryToEdit.series || entryToEdit.franchise || details.series || "");
      setCreator(entryToEdit.creator || details.creator || "");
      setFirstAppearance(entryToEdit.firstAppearance || details.firstAppearance || "");
      setDebutYear(entryToEdit.debutYear ? String(entryToEdit.debutYear) : details.debutYear || "");

      // Profile & Lore
      setPersonality(entryToEdit.personality || details.personality || "");
      setArchetype(entryToEdit.archetype || details.archetype || "");
      setOccupation(entryToEdit.occupation || entryToEdit.role || details.occupation || "");
      setAlignment(entryToEdit.alignment || details.alignment || "");
      setTraitsInput(entryToEdit.traits ? entryToEdit.traits.join(", ") : details.traits ? details.traits.join(", ") : "");
      setMotivation(entryToEdit.motivation || details.motivation || "");
      setBio(entryToEdit.background || entryToEdit.bio || details.background || "");
      setCharacterDevelopment(entryToEdit.characterDevelopment || details.characterDevelopment || "");

      // Appearances & Gallery
      setMainSeries(entryToEdit.mainSeries ? entryToEdit.mainSeries.join(", ") : details.mainSeries || "");
      setMovies(entryToEdit.movies ? entryToEdit.movies.join(", ") : details.movies || "");
      setEpisodes(entryToEdit.episodes ? entryToEdit.episodes.join(", ") : details.episodes || "");
      setSpinOffs(entryToEdit.spinOffs ? entryToEdit.spinOffs.join(", ") : details.spinOffs || "");
      setCameos(entryToEdit.cameos ? entryToEdit.cameos.join(", ") : details.cameos || "");
      setRelatedWorks(entryToEdit.works || entryToEdit.relatedWorks ? (entryToEdit.works || entryToEdit.relatedWorks)!.join(", ") : details.relatedWorks || "");
      setGalleryUrls(entryToEdit.gallery || []);

      if (entryToEdit.imageUrl && entryToEdit.imageUrl.startsWith("/uploads/")) {
        setImageSource("upload");
      } else if (entryToEdit.imageUrl) {
        setImageSource("url");
      } else {
        setImageSource("upload");
      }
    } else {
      setName("");
      setType("actress");
      setStatus("GOAT Status");
      setKnownFor("");
      setNationality("");
      setSingerType("Solo Artist");
      setImageUrl("");
      setImageSource("upload");
      setNote("");
      setRank(null);
      setIsChampion(false);
      setTokusatsuFranchise("");
      setTokusatsuShow("");
      setAssociatedDramas("");
      setAccentColor("#00F5FF");

      setPortraitUrl("");
      setPortraitSource("card");

      setFullName("");
      setAlias("");
      setOriginalLanguage("");
      setPronunciation("");
      setGender("");
      setAge("");
      setSpecies("");
      setUniverse("");
      setSeries("");
      setCreator("");
      setFirstAppearance("");
      setDebutYear("");

      setPersonality("");
      setArchetype("");
      setOccupation("");
      setAlignment("");
      setTraitsInput("");
      setMotivation("");
      setBio("");
      setCharacterDevelopment("");

      setMainSeries("");
      setMovies("");
      setEpisodes("");
      setSpinOffs("");
      setCameos("");
      setRelatedWorks("");
      setGalleryUrls([]);
    }

    setImgError(false);
    setCropImageSrc(null);
    setCropTarget(null);
    setActiveFormTab("basic");
    setSelectedPreset(null);
    setArtistSearchQuery("");
  }, [entryToEdit, isOpen]);

  // Handle Artist Data Autofill (Non-destructive)
  const handleApplyPreset = () => {
    if (!selectedPreset) return;

    const fillStr = (current: string, next?: string) => {
      if (!next) return current;
      if (overwriteNonEmpty || !current.trim()) return next;
      return current;
    };

    const fillArrStr = (current: string, nextArr?: string[]) => {
      if (!nextArr || nextArr.length === 0) return current;
      const joined = nextArr.join(", ");
      if (overwriteNonEmpty || !current.trim()) return joined;
      return current;
    };

    setName((prev) => fillStr(prev, selectedPreset.name));
    setFullName((prev) => fillStr(prev, selectedPreset.fullName));
    setAlias((prev) => fillArrStr(prev, selectedPreset.aliases));
    setOriginalLanguage((prev) => fillStr(prev, selectedPreset.originalLanguage));
    setPronunciation((prev) => fillStr(prev, selectedPreset.pronunciation));
    setGender((prev) => fillStr(prev, selectedPreset.gender));
    setAge((prev) => fillStr(prev, selectedPreset.age));
    setNationality((prev) => fillStr(prev, selectedPreset.nationality));
    setBio((prev) => fillStr(prev, selectedPreset.bio));
    setPersonality((prev) => fillStr(prev, selectedPreset.personality));
    setTraitsInput((prev) => fillArrStr(prev, selectedPreset.traits));
    setKnownFor((prev) => fillArrStr(prev, selectedPreset.works));
    setRelatedWorks((prev) => fillArrStr(prev, selectedPreset.works));

    if (selectedPreset.occupation && selectedPreset.occupation.length > 0) {
      setOccupation((prev) => fillArrStr(prev, selectedPreset.occupation));
    }

    toastSuccess(`✓ Autofilled compatible metadata from "${selectedPreset.name}".`);
    setActiveFormTab("basic");
  };

  const handleFileSelect = (target: "card" | "portrait" | "gallery") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, `hof-${cropTarget || "image"}-${Date.now()}.png`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (cropTarget === "portrait") {
          setPortraitUrl(data.url);
          setPortraitSource("upload");
        } else if (cropTarget === "gallery") {
          if (!galleryUrls.includes(data.url)) {
            setGalleryUrls((prev) => [...prev, data.url]);
          }
        } else {
          setImageUrl(data.url);
          setImgError(false);
        }
      } else {
        toastError("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      toastError("Error uploading image");
    } finally {
      setIsUploading(false);
      setCropImageSrc(null);
      setCropTarget(null);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryInput.trim()) return;
    if (!galleryUrls.includes(galleryInput.trim())) {
      setGalleryUrls([...galleryUrls, galleryInput.trim()]);
    }
    setGalleryInput("");
  };

  const handleRemoveGalleryUrl = (url: string) => {
    setGalleryUrls(galleryUrls.filter((u) => u !== url));
  };

  const handleMoveGalleryItem = (index: number, direction: "up" | "down") => {
    const newArr = [...galleryUrls];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setGalleryUrls(newArr);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const id = entryToEdit?.id || "hof-" + Math.random().toString(36).substr(2, 9);

      const splitCsv = (val: string) => val.split(",").map((s) => s.trim()).filter(Boolean);

      const resolvedPortrait = portraitSource === "card" ? undefined : portraitUrl.trim() || undefined;

      const detailsObj: Record<string, any> = {
        fullName: fullName.trim() || undefined,
        alias: alias.trim() || undefined,
        originalLanguage: originalLanguage.trim() || undefined,
        pronunciation: pronunciation.trim() || undefined,
        gender: gender.trim() || undefined,
        age: age.trim() || undefined,
        species: species.trim() || undefined,
        universe: universe.trim() || undefined,
        series: series.trim() || undefined,
        creator: creator.trim() || undefined,
        firstAppearance: firstAppearance.trim() || undefined,
        debutYear: debutYear.trim() || undefined,
        personality: personality.trim() || undefined,
        archetype: archetype.trim() || undefined,
        occupation: occupation.trim() || undefined,
        alignment: alignment.trim() || undefined,
        traits: splitCsv(traitsInput),
        motivation: motivation.trim() || undefined,
        background: bio.trim() || undefined,
        characterDevelopment: characterDevelopment.trim() || undefined,
        mainSeries: splitCsv(mainSeries),
        movies: splitCsv(movies),
        episodes: splitCsv(episodes),
        spinOffs: splitCsv(spinOffs),
        cameos: splitCsv(cameos),
        relatedWorks: splitCsv(relatedWorks),
      };

      await updateHof(id, {
        id,
        name: name.trim(),
        type,
        status,
        knownFor: type === "singer" ? [] : splitCsv(knownFor),
        nationality: type === "singer" ? "Singer" : nationality.trim() || undefined,
        singerType: type === "singer" ? singerType : undefined,
        imageUrl: imageUrl.trim() || undefined,
        portraitUrl: resolvedPortrait,
        note: note.trim() || undefined,
        rank: rank === null ? null : Number(rank),
        isChampion,
        tokusatsuFranchise: type === "tokusatsu" ? tokusatsuFranchise || null : null,
        tokusatsuShow: type === "tokusatsu" ? tokusatsuShow.trim() || null : null,
        associatedDramas: type === "tokusatsu" ? splitCsv(associatedDramas) : [],
        // Extended Fields
        fullName: fullName.trim() || undefined,
        officialName: fullName.trim() || undefined,
        alias: alias.trim() || undefined,
        originalLanguage: originalLanguage.trim() || undefined,
        nativeName: originalLanguage.trim() || undefined,
        pronunciation: pronunciation.trim() || undefined,
        gender: gender.trim() || undefined,
        age: age.trim() || undefined,
        species: species.trim() || undefined,
        universe: universe.trim() || undefined,
        work: universe.trim() || undefined,
        series: series.trim() || undefined,
        franchise: series.trim() || undefined,
        creator: creator.trim() || undefined,
        firstAppearance: firstAppearance.trim() || undefined,
        debutYear: debutYear.trim() || undefined,
        personality: personality.trim() || undefined,
        archetype: archetype.trim() || undefined,
        occupation: occupation.trim() || undefined,
        role: occupation.trim() || undefined,
        alignment: alignment.trim() || undefined,
        traits: splitCsv(traitsInput),
        motivation: motivation.trim() || undefined,
        background: bio.trim() || undefined,
        characterDevelopment: characterDevelopment.trim() || undefined,
        mainSeries: splitCsv(mainSeries),
        movies: splitCsv(movies),
        episodes: splitCsv(episodes),
        spinOffs: splitCsv(spinOffs),
        cameos: splitCsv(cameos),
        works: splitCsv(relatedWorks),
        relatedWorks: splitCsv(relatedWorks),
        gallery: galleryUrls,
        accentColor,
        details: detailsObj,
      });

      toastSuccess(`✓ Saved "${name}" to Master Character Directory.`);
      onClose();
    } catch (err) {
      console.error(err);
      toastError("Failed to save entry changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `w-full px-3 py-2 text-xs font-semibold rounded-lg outline-none border focus:ring-2 transition-all`;
  const inputStyle = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9F9F9",
    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
    color: isCyber ? "#E0E8FF" : "#1A1A1A",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      {/* Cyber corner brackets */}
      {isCyber && (
        <>
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#BF5FFF]" />
        </>
      )}

      <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 scrollbar-thin max-h-[85vh]">
        {/* Compact Header */}
        <div
          className="flex justify-between items-center mb-4 pb-3"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}
        >
          <div>
            <h2
              className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
            >
              {entryToEdit ? "✏️ Edit Character Dossier" : "✨ Enshrine Character Dossier"}
              {name && (
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                  }}
                >
                  {name}
                </span>
              )}
            </h2>
            <p className="text-[10px] font-mono theme-text-muted">
              Encyclopedia knowledge dossier editor & artist preset importer
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFormTab("autofill")}
              className="px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1 border"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FEF08A",
                color: isCyber ? "#00F5FF" : "#854D0E",
                borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
              }}
            >
              ⚡ Auto-Fill
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-black/10 cursor-pointer"
              style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Clear Scannable Tabs Navigation */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto scrollbar-none pb-1 border-b border-white/10 text-xs font-mono font-bold whitespace-nowrap">
          {[
            { id: "basic", label: "Basic", icon: "⚙️" },
            { id: "identity", label: "Identity & Origin", icon: "🏛️" },
            { id: "profile", label: "Profile & Lore", icon: "📖" },
            { id: "appearances", label: "Appearances", icon: "🎬" },
            { id: "gallery", label: "Gallery & Images", icon: "🖼️" },
            { id: "autofill", label: "Artist Preset / Auto-Fill", icon: "⚡" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFormTab(tab.id as FormTab)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                activeFormTab === tab.id
                  ? isCyber
                    ? "bg-[#00F5FF]/20 text-[#00F5FF] border border-[#00F5FF]/40"
                    : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                  : isCyber
                  ? "text-white/40 hover:text-white/80"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* TAB 1: BASIC */}
          {activeFormTab === "basic" && (
            <div className="space-y-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Character Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Carlotta, Takahashi Rie, Megumin"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Type + Status Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Type
                  </label>
                  <CustomSelect
                    value={type}
                    onChange={(val) => setType(val as any)}
                    options={[
                      { value: "actress", label: "Actress", icon: "💫" },
                      { value: "actor", label: "Actor", icon: "🎭" },
                      { value: "singer", label: "Singer", icon: "🎤" },
                      { value: "anime", label: "Anime", icon: "⛩️" },
                      { value: "tokusatsu", label: "Tokusatsu", icon: "🦸" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Status Tier
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as any)}
                    options={[
                      { value: "GOAT Status", label: "GOAT Status", icon: "👑" },
                      { value: "All-Star", label: "All-Star", icon: "⭐" },
                      { value: "Rising", label: "Rising", icon: "🚀" },
                      { value: "Classic", label: "Classic", icon: "💎" },
                    ]}
                  />
                </div>
              </div>

              {/* Singer Type or Country & Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {type === "singer" ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                      Singer Category
                    </label>
                    <CustomSelect
                      value={singerType}
                      onChange={(val) => setSingerType(val)}
                      options={[
                        { value: "Solo Artist", label: "Solo Artist", icon: "🎤" },
                        { value: "Band / Group", label: "Band / Group", icon: "🎸" },
                        { value: "Idol", label: "Idol", icon: "✨" },
                        { value: "VTuber", label: "VTuber", icon: "👾" },
                        { value: "Vocalist", label: "Vocalist", icon: "🎵" },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                      Country / Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Japan, Korea, China"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Roster Rank Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={rank === null ? "" : rank}
                    onChange={(e) => setRank(e.target.value === "" ? null : Number(e.target.value))}
                    placeholder="Unranked (Standard)"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Accent Color & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Accent Theme Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Enshrinement Note / Quote
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Iconic performance, absolute favorite..."
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Overall Champion Leader crown */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none border transition-all"
                style={{
                  backgroundColor: isChampion
                    ? isCyber ? "rgba(255,215,0,0.1)" : "#FEF08A"
                    : isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
                  borderColor: isChampion ? "#FFD700" : isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                }}
                onClick={() => setIsChampion(!isChampion)}
              >
                <span className="text-xl">{isChampion ? "👑" : "🏅"}</span>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: isChampion ? "#FFD700" : isCyber ? "#94A3B8" : "#6B7280" }}>
                    {isChampion ? "Overall Champion / Leader ✓" : "Make Overall Champion / Leader"}
                  </p>
                  <p className="text-[10px] opacity-60">Featured at top of rankings</p>
                </div>
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: isChampion ? "#FFD700" : "#999", backgroundColor: isChampion ? "#FFD700" : "transparent" }}
                >
                  {isChampion && <span className="text-[10px] font-black text-black">✓</span>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY & ORIGIN */}
          {activeFormTab === "identity" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Full / Official Name
                  </label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rie Takahashi (高橋 李依)" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Alias / Nickname
                  </label>
                  <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="e.g. Rieri, The Goldweaver" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Original Language / Native
                  </label>
                  <input type="text" value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)} placeholder="e.g. Japanese (日本語)" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Pronunciation
                  </label>
                  <input type="text" value={pronunciation} onChange={(e) => setPronunciation(e.target.value)} placeholder="e.g. Ta-ka-ha-shi Ri-e" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Gender
                  </label>
                  <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. Female / Male" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Age / Age Range
                  </label>
                  <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 21, 500+ years" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Species / Type
                  </label>
                  <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Human, Nikke, Liberi, Divine Being" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Universe / Work
                  </label>
                  <input type="text" value={universe} onChange={(e) => setUniverse(e.target.value)} placeholder="e.g. Wuthering Waves, Konosuba" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Series / Franchise
                  </label>
                  <input type="text" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="e.g. Honkai: Star Rail, Fate" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Country / Region
                  </label>
                  <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Japan, Huanglong" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Creator / Studio
                  </label>
                  <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="e.g. Kuro Games, 81 Produce" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Debut Year / Date
                  </label>
                  <input type="text" value={debutYear} onChange={(e) => setDebutYear(e.target.value)} placeholder="e.g. 2024" className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE & LORE */}
          {activeFormTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Personality Archetype
                  </label>
                  <input type="text" value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="e.g. Cheerful, energetic, calculating" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Occupation / Role
                  </label>
                  <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Voice Actress, Magistrate, Knight" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Alignment
                  </label>
                  <input type="text" value={alignment} onChange={(e) => setAlignment(e.target.value)} placeholder="e.g. Lawful Good, Chaotic Neutral" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Traits <span className="normal-case font-normal opacity-60">(comma separated)</span>
                  </label>
                  <input type="text" value={traitsInput} onChange={(e) => setTraitsInput(e.target.value)} placeholder="e.g. Expressive, Loyal, Strategic" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Character Motivation
                </label>
                <input type="text" value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="e.g. Protect Jinzhou, excel in vocal performances" className={inputClass} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Background & Biography
                </label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Full lore background narrative..." className={inputClass + " resize-none"} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Character Development Arc
                </label>
                <textarea value={characterDevelopment} onChange={(e) => setCharacterDevelopment(e.target.value)} rows={2} placeholder="Development arc through seasons or story patches..." className={inputClass + " resize-none"} style={inputStyle} />
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCES */}
          {activeFormTab === "appearances" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Main Series <span className="normal-case font-normal opacity-60">(comma separated)</span>
                  </label>
                  <input type="text" value={mainSeries} onChange={(e) => setMainSeries(e.target.value)} placeholder="e.g. Season 1, Season 2" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Movies & Filmography <span className="normal-case font-normal opacity-60">(comma separated)</span>
                  </label>
                  <input type="text" value={movies} onChange={(e) => setMovies(e.target.value)} placeholder="e.g. Kimi no Na wa, Movie 1" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Featured Episodes <span className="normal-case font-normal opacity-60">(comma separated)</span>
                  </label>
                  <input type="text" value={episodes} onChange={(e) => setEpisodes(e.target.value)} placeholder="e.g. Episode 10, Episode 24" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Spin-offs <span className="normal-case font-normal opacity-60">(comma separated)</span>
                  </label>
                  <input type="text" value={spinOffs} onChange={(e) => setSpinOffs(e.target.value)} placeholder="e.g. Carnival Phantasm" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Cameos & Guest Roles <span className="normal-case font-normal opacity-60">(comma separated)</span>
                </label>
                <input type="text" value={cameos} onChange={(e) => setCameos(e.target.value)} placeholder="e.g. Episode 1 Cameo" className={inputClass} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  Related Works & Credits <span className="normal-case font-normal opacity-60">(comma separated)</span>
                </label>
                <input type="text" value={relatedWorks} onChange={(e) => setRelatedWorks(e.target.value)} placeholder="e.g. Re:Zero, Genshin Impact, Oshi no Ko" className={inputClass} style={inputStyle} />
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY & IMAGES (Organized Asset Manager) */}
          {activeFormTab === "gallery" && (
            <div className="space-y-5">
              {/* 1. Card Image Section */}
              <div className="p-4 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    📇 Card Image (Dictionary Roster Thumbnail)
                  </label>
                  <span className="text-[10px] font-mono opacity-60">Primary list thumbnail</span>
                </div>

                <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                  <div
                    className="w-16 h-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-black text-lg border-2 shadow-md relative"
                    style={{
                      borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000",
                      backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F0F0F0",
                    }}
                  >
                    {imageUrl && !imgError ? (
                      <img src={imageUrl} alt="card" className="w-full h-full object-cover object-top" onError={() => setImgError(true)} />
                    ) : (
                      <span style={{ color: isCyber ? "#00F5FF" : "#999" }}>{name ? name.charAt(0).toUpperCase() : "?"}</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex gap-1 p-0.5 rounded-lg border text-xs font-black self-start">
                      <button
                        type="button"
                        onClick={() => setImageSource("upload")}
                        className="px-3 py-1 rounded transition-colors"
                        style={{
                          backgroundColor: imageSource === "upload" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                          color: imageSource === "upload" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        📁 Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSource("url")}
                        className="px-3 py-1 rounded transition-colors"
                        style={{
                          backgroundColor: imageSource === "url" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                          color: imageSource === "url" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        🔗 Image Link
                      </button>
                    </div>

                    {imageSource === "url" ? (
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
                        placeholder="Paste card image URL (https://...)"
                        className={inputClass}
                        style={inputStyle}
                      />
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect("card")} accept="image/*" className="hidden" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 text-xs font-black rounded border transition-all hover:scale-[1.02] cursor-pointer"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                            borderColor: isCyber ? "#00F5FF" : "#9CA3AF",
                            color: isCyber ? "#00F5FF" : "#374151",
                          }}
                        >
                          📁 {isUploading ? "Uploading..." : "Upload Card Image"}
                        </button>
                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Portrait / Modal Image Section */}
              <div className="p-4 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    🖼️ Portrait (3:4 Profile Modal Image)
                  </label>
                  <span className="text-[10px] font-mono opacity-60">Independent vertical portrait</span>
                </div>

                <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                  <div
                    className="w-16 h-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-black text-xs border-2 shadow-md relative"
                    style={{
                      borderColor: isCyber ? "#00F5FF" : "#000",
                      backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F0F0F0",
                    }}
                  >
                    {portraitSource === "card" ? (
                      imageUrl ? (
                        <img src={imageUrl} alt="portrait" className="w-full h-full object-cover object-top" />
                      ) : (
                        <span className="text-[10px] text-center opacity-60">Card Image</span>
                      )
                    ) : portraitUrl ? (
                      <img src={portraitUrl} alt="portrait" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-[10px] text-center opacity-60">No Custom</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex gap-1 p-0.5 rounded-lg border text-[11px] font-bold self-start flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPortraitSource("card")}
                        className="px-2.5 py-1 rounded transition-colors cursor-pointer"
                        style={{
                          backgroundColor: portraitSource === "card" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                          color: portraitSource === "card" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        1. Sync with Card Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortraitSource("url")}
                        className="px-2.5 py-1 rounded transition-colors cursor-pointer"
                        style={{
                          backgroundColor: portraitSource === "url" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                          color: portraitSource === "url" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        2. Custom Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortraitSource("upload")}
                        className="px-2.5 py-1 rounded transition-colors cursor-pointer"
                        style={{
                          backgroundColor: portraitSource === "upload" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                          color: portraitSource === "upload" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        3. Upload Custom Portrait
                      </button>
                    </div>

                    {portraitSource === "card" && (
                      <p className="text-[11px] font-mono theme-text-muted">
                        ✓ Currently synced with Card Image.
                      </p>
                    )}

                    {portraitSource === "url" && (
                      <input
                        type="url"
                        value={portraitUrl}
                        onChange={(e) => setPortraitUrl(e.target.value)}
                        placeholder="Paste dedicated 3:4 portrait image URL (https://...)"
                        className={inputClass}
                        style={inputStyle}
                      />
                    )}

                    {portraitSource === "upload" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          ref={portraitFileInputRef}
                          onChange={handleFileSelect("portrait")}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => portraitFileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 text-xs font-black rounded border transition-all hover:scale-[1.02] cursor-pointer"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                            borderColor: isCyber ? "#00F5FF" : "#9CA3AF",
                            color: isCyber ? "#00F5FF" : "#374151",
                          }}
                        >
                          📁 {isUploading ? "Uploading..." : "Upload 3:4 Custom Portrait"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Personal Gallery Collection Section */}
              <div className="p-4 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    📚 Personal Gallery Collection ({galleryUrls.length} items)
                  </label>
                  <span className="text-[10px] font-mono opacity-60">Manual photo collection</span>
                </div>

                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <input
                    type="url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Paste artwork URL (https://...)"
                    className={inputClass}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-cyan-500 text-black shrink-0 cursor-pointer"
                  >
                    + Add URL
                  </button>

                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    onChange={handleFileSelect("gallery")}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 text-xs font-bold rounded-lg border shrink-0 cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB",
                      borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#9CA3AF",
                      color: isCyber ? "#FFF" : "#000",
                    }}
                  >
                    📁 Upload File
                  </button>
                </div>

                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                    {galleryUrls.map((url, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border group bg-black/40 shadow-sm">
                        <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveGalleryItem(i, "up")}
                              className="w-5 h-5 rounded bg-black/80 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                              title="Move Left"
                            >
                              ←
                            </button>
                          )}
                          {i < galleryUrls.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveGalleryItem(i, "down")}
                              className="w-5 h-5 rounded bg-black/80 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                              title="Move Right"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryUrl(url)}
                            className="w-5 h-5 rounded bg-red-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Remove Image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ARTIST PRESET / AUTO-FILL */}
          {activeFormTab === "autofill" && (
            <div className="space-y-4 p-4 rounded-2xl border bg-black/5 dark:bg-white/5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  ⚡ Reusable Artist Metadata Dataset
                </span>
                <p className="text-xs theme-text-muted">
                  Search pre-configured artist metadata from <code className="text-cyan-300 font-mono">ArtistData.json</code> to autofill fields without manually typing everything again.
                </p>
              </div>

              {/* Search box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={artistSearchQuery}
                  onChange={(e) => setArtistSearchQuery(e.target.value)}
                  placeholder="Search artist by name, role, work..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Preset Selection List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {artistSearchResults.map((preset) => {
                  const isSelected = selectedPreset?.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? isCyber
                            ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
                            : "border-black bg-amber-200 shadow-[2px_2px_0_#000]"
                          : isCyber
                          ? "border-white/10 bg-white/5 hover:bg-white/10"
                          : "border-gray-200 bg-white hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0 border border-cyan-500/40">
                        {preset.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold theme-text-primary truncate">{preset.name}</div>
                        <div className="text-[10px] theme-text-muted truncate">
                          {preset.nationality || "Artist"} • {(preset.occupation || []).join(", ")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview & Autofill Actions */}
              {selectedPreset && (
                <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      Selected: {selectedPreset.name} ({selectedPreset.fullName || ""})
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-white/80 line-clamp-2">{selectedPreset.bio}</p>

                  {/* Autofill Options */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-cyan-500/20 text-xs font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-white/90">
                      <input
                        type="checkbox"
                        checked={overwriteNonEmpty}
                        onChange={(e) => setOverwriteNonEmpty(e.target.checked)}
                        className="rounded accent-cyan-400"
                      />
                      <span>Overwrite existing non-empty fields in form</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyPreset}
                    className="w-full py-2 rounded-xl text-xs font-black bg-cyan-400 text-black border border-black hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    ⚡ Autofill Compatible Form Fields
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form Action Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer"
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
              disabled={isSaving || isUploading}
              className="px-5 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg"
              style={{
                backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                color: isCyber ? "#050816" : "#fff",
              }}
            >
              {isSaving ? "Saving..." : entryToEdit ? "Save Changes" : "✨ Enshrine"}
            </button>
          </div>
        </form>
      </div>

      <ImageCropModal
        isOpen={Boolean(cropImageSrc)}
        imageSrc={cropImageSrc}
        aspect={cropTarget === "portrait" ? 3 / 4 : 3 / 4}
        title={
          cropTarget === "portrait"
            ? "Position & Crop 3:4 Custom Portrait"
            : cropTarget === "gallery"
            ? "Position & Crop Gallery Image"
            : "Position & Crop Card Image"
        }
        onClose={() => {
          setCropImageSrc(null);
          setCropTarget(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </Modal>
  );
}
