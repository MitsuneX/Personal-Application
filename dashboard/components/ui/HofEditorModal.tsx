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
import { CharacterImageUploader, GalleryUploader } from "@/components/ui/CharacterImageUploader";
import { TokusatsuEditorModal } from "@/components/ui/TokusatsuEditorModal";
import { isTokusatsuEntry } from "@/lib/data/tokusatsuDataHelper";
import { HofJsonEditor } from "@/components/ui/HofJsonEditor";
import { isHofDuplicate } from "@/lib/data/duplicateHelper";
import { mergeCharacterDictionaryMediaIntoGallery } from "@/lib/utils/mediaResolver";

interface HofEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: HallOfFameEntry | null;
}

type FormTab = "basic" | "identity" | "profile" | "appearances" | "gallery" | "links" | "autofill";

const TABS_LIST: FormTab[] = ["basic", "identity", "profile", "appearances", "gallery", "links", "autofill"];

const TABS_LIST_ITEMS = [
  { id: "basic", label: "Basic", icon: "⚙️" },
  { id: "identity", label: "Identity & Origin", icon: "🏛️" },
  { id: "profile", label: "Profile & Lore", icon: "📖" },
  { id: "appearances", label: "Appearances", icon: "🎬" },
  { id: "gallery", label: "Gallery & Images", icon: "🖼️" },
  { id: "links", label: "Links & Social", icon: "🔗" },
  { id: "autofill", label: "Artist Preset / Auto-Fill", icon: "⚡" },
];

export function HofEditorModal({ isOpen, onClose, entryToEdit }: HofEditorModalProps) {
  // Delegate Tokusatsu entries to the dedicated Tokusatsu Editor
  if (isTokusatsuEntry(entryToEdit)) {
    return <TokusatsuEditorModal isOpen={isOpen} onClose={onClose} entryToEdit={entryToEdit} />;
  }
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { updateHof, hallOfFame } = useDashboardStore();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [activeFormTab, setActiveFormTab] = useState<FormTab>("basic");
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual");

  // Tab Strip Scroll Refs
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Basic Card Image fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"actor" | "actress" | "anime" | "singer" | "tokusatsu" | "vtuber">("actress");
  const [status, setStatus] = useState<MediaStatus>("GOAT Status");
  const [knownFor, setKnownFor] = useState("");
  const [nationality, setNationality] = useState("");
  const [singerType, setSingerType] = useState("Solo Artist");
  const [imageUrl, setImageUrl] = useState("");
  // cardVideo stores an MP4/WebM URL when the card image slot holds a video.
  // Persisted via details.cardVideo so no schema migration is needed.
  const [cardVideo, setCardVideo] = useState("");
  const [note, setNote] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [isChampion, setIsChampion] = useState(false);
  const [tokusatsuFranchise, setTokusatsuFranchise] = useState("");
  const [tokusatsuShow, setTokusatsuShow] = useState("");
  const [associatedDramas, setAssociatedDramas] = useState("");
  const [accentColor, setAccentColor] = useState("#00F5FF");

  // VTuber specific fields
  const [agency, setAgency] = useState("");
  const [group, setGroup] = useState("");
  const [oshiMark, setOshiMark] = useState("");
  const [fanbaseName, setFanbaseName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [debutDate, setDebutDate] = useState("");
  const [vtuberStatus, setVtuberStatus] = useState("Active");

  // Dedicated 3:4 Portrait fields (Independent of Card Image)
  const [portraitUrl, setPortraitUrl] = useState("");
  const [portraitSource, setPortraitSource] = useState<"card" | "upload" | "url">("card");

  // Dedicated 1:1 Profile Avatar fields (Independent of Card Image & Portrait)
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSource, setAvatarSource] = useState<"card" | "custom">("card");

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

  // Extended Social Links fields
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);
  const [linkPlatform, setLinkPlatform] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  // Artist Data Preset Autofill State
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<ArtistPreset | null>(null);
  const [overwriteNonEmpty, setOverwriteNonEmpty] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const currentStepIndex = TABS_LIST.indexOf(activeFormTab);

  const scrollToTab = (tabId: FormTab) => {
    setActiveFormTab(tabId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = tabListRef.current;
        const tabEl = tabRefs.current[tabId];
        if (!container || !tabEl) return;

        const containerRect = container.getBoundingClientRect();
        const tabRect = tabEl.getBoundingClientRect();

        // 1. Intelligent Boundary Inspection
        const isClippedLeft = tabRect.left < containerRect.left + 4;
        const isClippedRight = tabRect.right > containerRect.right - 4;

        // 2. Right-to-Left & Left-to-Right Scrolling (16px safety padding)
        if (isClippedLeft) {
          const scrollDelta = tabRect.left - containerRect.left - 16;
          container.scrollTo({
            left: Math.max(0, container.scrollLeft + scrollDelta),
            behavior: "smooth",
          });
        } else if (isClippedRight) {
          const scrollDelta = tabRect.right - containerRect.right + 16;
          container.scrollTo({
            left: container.scrollLeft + scrollDelta,
            behavior: "smooth",
          });
        }
        // 3. Container-Scoped: Only container.scrollTo is called, page/window scroll is unaffected.
      }, 15);
    });
  };

  const handlePrevTab = () => {
    if (currentStepIndex > 0) {
      scrollToTab(TABS_LIST[currentStepIndex - 1]);
    }
  };

  const handleNextTab = () => {
    if (currentStepIndex < TABS_LIST.length - 1) {
      scrollToTab(TABS_LIST[currentStepIndex + 1]);
    }
  };

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
      // imageUrl holds the card image URL (static image).
      // cardVideo holds a video URL when the card slot contains an MP4/WebM.
      const savedCardVideo = details.cardVideo || "";
      const savedImageUrl = entryToEdit.imageUrl || "";
      setImageUrl(savedImageUrl);
      setCardVideo(savedCardVideo);
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

      // Profile Avatar (1:1)
      const customAv = entryToEdit.avatarUrl || details.avatarUrl;
      const avSrc = entryToEdit.avatarSource || details.avatarSource || (customAv ? "custom" : "card");
      setAvatarUrl(customAv || "");
      setAvatarSource(avSrc as "card" | "custom");

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

      // Social Links
      setSocialLinks(entryToEdit.socialLinks || details.socialLinks || []);

      // VTuber fields
      setAgency(entryToEdit.agency || details.agency || "");
      setGroup(entryToEdit.group || details.group || "");
      setOshiMark(entryToEdit.oshiMark || details.oshiMark || "");
      setFanbaseName(entryToEdit.fanbaseName || details.fanbaseName || "");
      setBirthday(entryToEdit.birthday || details.birthday || "");
      setDebutDate(entryToEdit.debutDate || details.debutDate || "");
      setVtuberStatus(entryToEdit.vtuberStatus || details.vtuberStatus || "Active");
    } else {
      setName("");
      setType("actress");
      setStatus("GOAT Status");
      setKnownFor("");
      setNationality("");
      setSingerType("Solo Artist");
      setImageUrl("");
      setCardVideo("");
      setNote("");
      setRank(null);
      setIsChampion(false);
      setTokusatsuFranchise("");
      setTokusatsuShow("");
      setAssociatedDramas("");
      setAccentColor("#00F5FF");

      setPortraitUrl("");
      setPortraitSource("card");

      setAvatarUrl("");
      setAvatarSource("card");

      setAgency("");
      setGroup("");
      setOshiMark("");
      setFanbaseName("");
      setBirthday("");
      setDebutDate("");
      setVtuberStatus("Active");

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
      setSocialLinks([]);
    }

    setLinkPlatform("");
    setLinkUrl("");
    setEditingLinkIndex(null);
    setImgError(false);
    setActiveFormTab("basic");
    setSelectedPreset(null);
    setArtistSearchQuery("");
  }, [entryToEdit, isOpen]);

  // Handle Artist Data Autofill (Non-destructive)
  const handleApplyPreset = () => {
    if (!selectedPreset) return;

    // All fields on ArtistPreset are guaranteed non-null strings or string[]
    // by normalizeArtistPreset() in artistDataHelper.ts. No defensive checks needed.
    const fillStr = (current: string, next: string) => {
      if (!next) return current;
      if (overwriteNonEmpty || !current.trim()) return next;
      return current;
    };

    const fillArrStr = (current: string, nextArr: string[]) => {
      if (nextArr.length === 0) return current;
      const joined = nextArr.join(", ");
      if (overwriteNonEmpty || !current.trim()) return joined;
      return current;
    };

    // ── Basic fields ──────────────────────────────────────────────────────────
    setName((prev) => fillStr(prev, selectedPreset.name));
    setNationality((prev) => fillStr(prev, selectedPreset.nationality));
    setKnownFor((prev) => fillArrStr(prev, selectedPreset.works));

    // ── Identity & Origin fields ──────────────────────────────────────────────
    setFullName((prev) => fillStr(prev, selectedPreset.fullName));
    setAlias((prev) => fillArrStr(prev, selectedPreset.aliases));
    setOriginalLanguage((prev) => fillStr(prev, selectedPreset.originalLanguage));
    setPronunciation((prev) => fillStr(prev, selectedPreset.pronunciation));
    setGender((prev) => fillStr(prev, selectedPreset.gender));
    setAge((prev) => fillStr(prev, selectedPreset.age));
    setSpecies((prev) => fillStr(prev, selectedPreset.species));
    setUniverse((prev) => fillStr(prev, selectedPreset.universe));
    setSeries((prev) => fillStr(prev, selectedPreset.series));
    setCreator((prev) => fillStr(prev, selectedPreset.creator));
    setDebutYear((prev) => fillStr(prev, selectedPreset.debutYear));

    // ── Profile & Lore fields ─────────────────────────────────────────────────
    setBio((prev) => fillStr(prev, selectedPreset.bio));
    setPersonality((prev) => fillStr(prev, selectedPreset.personality));
    setTraitsInput((prev) => fillArrStr(prev, selectedPreset.traits));
    setAlignment((prev) => fillStr(prev, selectedPreset.alignment));
    setMotivation((prev) => fillStr(prev, selectedPreset.motivation));
    setCharacterDevelopment((prev) => fillStr(prev, selectedPreset.characterDevelopment));
    if (selectedPreset.occupation.length > 0) {
      setOccupation((prev) => fillArrStr(prev, selectedPreset.occupation));
    }

    // ── Appearances fields ────────────────────────────────────────────────────
    setMainSeries((prev) => fillArrStr(prev, selectedPreset.mainSeries));
    setMovies((prev) => fillArrStr(prev, selectedPreset.movies));
    setEpisodes((prev) => fillArrStr(prev, selectedPreset.episodes));
    setSpinOffs((prev) => fillArrStr(prev, selectedPreset.spinOffs));
    setCameos((prev) => fillArrStr(prev, selectedPreset.cameos));
    setRelatedWorks((prev) => fillArrStr(prev, selectedPreset.relatedWorks));

    // ── Social Links (merge, deduplicate by URL) ──────────────────────────────
    if (selectedPreset.socialLinks.length > 0) {
      setSocialLinks((prev) => {
        if (overwriteNonEmpty || prev.length === 0) {
          return selectedPreset.socialLinks;
        }
        const existingUrls = new Set(prev.map((l) => l.url));
        const toAdd = selectedPreset.socialLinks.filter((l) => !existingUrls.has(l.url));
        return [...prev, ...toAdd];
      });
    }

    toastSuccess(`✓ Autofilled compatible metadata from "${selectedPreset.name}".`);
    scrollToTab("basic");
  };

  // ── JSON live payload helper ──
  const getLivePayload = (): Partial<HallOfFameEntry> => {
    const str = (val: unknown) => (val === undefined || val === null ? "" : String(val).trim());
    const splitCsv = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
      return [String(val).trim()].filter(Boolean);
    };

    const resolvedPortrait = portraitSource === "card" ? undefined : str(portraitUrl) || undefined;
    const resolvedAvatar = avatarSource === "card" ? undefined : str(avatarUrl) || undefined;
    const validSocialLinks = (Array.isArray(socialLinks) ? socialLinks : []).filter(
      (l) => l && str(l.platform) && str(l.url)
    );

    return {
      id: entryToEdit?.id || `hof-${Date.now()}`,
      name: str(name) || "New Character",
      type,
      status,
      knownFor: type === "singer" ? [] : splitCsv(knownFor),
      nationality: type === "singer" ? "Singer" : str(nationality) || undefined,
      singerType: type === "singer" ? singerType : undefined,
      imageUrl: str(imageUrl) || undefined,
      portraitUrl: resolvedPortrait,
      avatarUrl: resolvedAvatar,
      avatarSource,
      note: str(note) || undefined,
      rank: rank === null ? null : Number(rank),
      isChampion,
      tokusatsuFranchise: type === "tokusatsu" ? tokusatsuFranchise || null : null,
      tokusatsuShow: type === "tokusatsu" ? str(tokusatsuShow) || null : null,
      associatedDramas: type === "tokusatsu" ? splitCsv(associatedDramas) : [],
      fullName: str(fullName) || undefined,
      officialName: str(fullName) || undefined,
      alias: str(alias) || undefined,
      originalLanguage: str(originalLanguage) || undefined,
      nativeName: str(originalLanguage) || undefined,
      pronunciation: str(pronunciation) || undefined,
      gender: str(gender) || undefined,
      age: str(age) || undefined,
      species: str(species) || undefined,
      universe: str(universe) || undefined,
      work: str(universe) || undefined,
      series: str(series) || undefined,
      franchise: str(series) || undefined,
      creator: str(creator) || undefined,
      firstAppearance: str(firstAppearance) || undefined,
      debutYear: str(debutYear) || undefined,
      personality: str(personality) || undefined,
      archetype: str(archetype) || undefined,
      occupation: str(occupation) || undefined,
      role: str(occupation) || undefined,
      alignment: str(alignment) || undefined,
      traits: splitCsv(traitsInput),
      motivation: str(motivation) || undefined,
      background: str(bio) || undefined,
      bio: str(bio) || undefined,
      characterDevelopment: str(characterDevelopment) || undefined,
      mainSeries: splitCsv(mainSeries),
      movies: splitCsv(movies),
      episodes: splitCsv(episodes),
      spinOffs: splitCsv(spinOffs),
      cameos: splitCsv(cameos),
      works: splitCsv(relatedWorks),
      relatedWorks: splitCsv(relatedWorks),
      gallery: Array.isArray(galleryUrls) ? galleryUrls : [],
      socialLinks: validSocialLinks,
      accentColor,
      // VTuber fields
      agency: str(agency) || undefined,
      group: str(group) || undefined,
      oshiMark: str(oshiMark) || undefined,
      fanbaseName: str(fanbaseName) || undefined,
      birthday: str(birthday) || undefined,
      debutDate: str(debutDate) || undefined,
      vtuberStatus: str(vtuberStatus) || undefined,
    };
  };

  // ── JSON Apply handler ──
  const handleJsonApply = (updated: Partial<HallOfFameEntry>, mode: "replace" | "merge") => {
    const toCsvStr = (val: unknown): string => {
      if (!val) return "";
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean).join(", ");
      return String(val);
    };

    if (updated.name !== undefined) setName(updated.name || "");
    if (updated.type !== undefined) setType(updated.type || "actress");
    if (updated.status !== undefined) setStatus(updated.status || "GOAT Status");
    if (updated.knownFor !== undefined) setKnownFor(toCsvStr(updated.knownFor));
    if (updated.nationality !== undefined) setNationality(updated.nationality || "");
    if (updated.singerType !== undefined) setSingerType(updated.singerType || "Solo Artist");
    if (updated.imageUrl !== undefined) setImageUrl(updated.imageUrl || "");
    if (updated.portraitUrl !== undefined) {
      setPortraitUrl(updated.portraitUrl || "");
      setPortraitSource(updated.portraitUrl ? "url" : "card");
    }
    if (updated.avatarUrl !== undefined) {
      setAvatarUrl(updated.avatarUrl || "");
      setAvatarSource(updated.avatarUrl ? "custom" : "card");
    }
    if (updated.note !== undefined) setNote(updated.note || "");
    if (updated.rank !== undefined) setRank(updated.rank !== undefined ? updated.rank : null);
    if (updated.isChampion !== undefined) setIsChampion(Boolean(updated.isChampion));
    if (updated.tokusatsuFranchise !== undefined) setTokusatsuFranchise(updated.tokusatsuFranchise || "");
    if (updated.tokusatsuShow !== undefined) setTokusatsuShow(updated.tokusatsuShow || "");
    if (updated.associatedDramas !== undefined) setAssociatedDramas(toCsvStr(updated.associatedDramas));
    if (updated.accentColor !== undefined) setAccentColor(updated.accentColor || "#00F5FF");

    // VTuber
    if (updated.agency !== undefined) setAgency(updated.agency || "");
    if (updated.group !== undefined) setGroup(updated.group || "");
    if (updated.oshiMark !== undefined) setOshiMark(updated.oshiMark || "");
    if (updated.fanbaseName !== undefined) setFanbaseName(updated.fanbaseName || "");
    if (updated.birthday !== undefined) setBirthday(updated.birthday || "");
    if (updated.debutDate !== undefined) setDebutDate(updated.debutDate || "");
    if (updated.vtuberStatus !== undefined) setVtuberStatus(updated.vtuberStatus || "Active");

    // Identity
    if (updated.fullName !== undefined || updated.officialName !== undefined) setFullName(updated.fullName || updated.officialName || "");
    if (updated.alias !== undefined) setAlias(updated.alias || "");
    if (updated.originalLanguage !== undefined || updated.nativeName !== undefined) setOriginalLanguage(updated.originalLanguage || updated.nativeName || "");
    if (updated.pronunciation !== undefined) setPronunciation(updated.pronunciation || "");
    if (updated.gender !== undefined) setGender(updated.gender || "");
    if (updated.age !== undefined) setAge(updated.age !== undefined ? String(updated.age) : "");
    if (updated.species !== undefined) setSpecies(updated.species || "");
    if (updated.universe !== undefined || updated.work !== undefined) setUniverse(updated.universe || updated.work || "");
    if (updated.series !== undefined || updated.franchise !== undefined) setSeries(updated.series || updated.franchise || "");
    if (updated.creator !== undefined) setCreator(updated.creator || "");
    if (updated.firstAppearance !== undefined) setFirstAppearance(updated.firstAppearance || "");
    if (updated.debutYear !== undefined) setDebutYear(updated.debutYear !== undefined ? String(updated.debutYear) : "");

    // Lore
    if (updated.personality !== undefined) setPersonality(updated.personality || "");
    if (updated.archetype !== undefined) setArchetype(updated.archetype || "");
    if (updated.occupation !== undefined || updated.role !== undefined) setOccupation(updated.occupation || updated.role || "");
    if (updated.alignment !== undefined) setAlignment(updated.alignment || "");
    if (updated.traits !== undefined) setTraitsInput(toCsvStr(updated.traits));
    if (updated.motivation !== undefined) setMotivation(updated.motivation || "");
    if (updated.bio !== undefined || updated.background !== undefined) setBio(updated.bio || updated.background || "");
    if (updated.characterDevelopment !== undefined) setCharacterDevelopment(updated.characterDevelopment || "");

    // Media / Appearances
    if (updated.mainSeries !== undefined) setMainSeries(toCsvStr(updated.mainSeries));
    if (updated.movies !== undefined) setMovies(toCsvStr(updated.movies));
    if (updated.episodes !== undefined) setEpisodes(toCsvStr(updated.episodes));
    if (updated.spinOffs !== undefined) setSpinOffs(toCsvStr(updated.spinOffs));
    if (updated.cameos !== undefined) setCameos(toCsvStr(updated.cameos));
    if (updated.works !== undefined || updated.relatedWorks !== undefined) setRelatedWorks(toCsvStr(updated.works || updated.relatedWorks));
    if (updated.gallery !== undefined) setGalleryUrls(Array.isArray(updated.gallery) ? updated.gallery : []);
    if (updated.socialLinks !== undefined) setSocialLinks(Array.isArray(updated.socialLinks) ? updated.socialLinks : []);

    setEditorMode("visual");
    toastSuccess(`✓ Applied JSON data (${mode} mode).`);
  };

  // ── JSON Export handler ──
  const handleExportJson = () => {
    try {
      const payload = getLivePayload();
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "character").replace(/\s+/g, "_").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess(`✓ Exported ${name || "character"}.json`);
    } catch {
      toastError("Failed to export JSON.");
    }
  };

  const handleAddSocialLink = () => {
    if (!linkPlatform.trim() || !linkUrl.trim()) {
      toastError("Enter both platform name and URL.");
      return;
    }
    const cleanUrl = linkUrl.trim();
    const cleanPlatform = linkPlatform.trim();

    if (editingLinkIndex !== null) {
      const updated = [...socialLinks];
      updated[editingLinkIndex] = { platform: cleanPlatform, url: cleanUrl };
      setSocialLinks(updated);
      setEditingLinkIndex(null);
    } else {
      setSocialLinks([...socialLinks, { platform: cleanPlatform, url: cleanUrl }]);
    }
    setLinkPlatform("");
    setLinkUrl("");
  };

  const handleEditSocialLink = (index: number) => {
    const item = socialLinks[index];
    if (!item) return;
    setLinkPlatform(item.platform);
    setLinkUrl(item.url);
    setEditingLinkIndex(index);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
    if (editingLinkIndex === index) {
      setLinkPlatform("");
      setLinkUrl("");
      setEditingLinkIndex(null);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryInput.trim()) return;
    if (!galleryUrls.includes(galleryInput.trim())) {
      setGalleryUrls([...galleryUrls, galleryInput.trim()]);
    }
    setGalleryInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const str = (val: unknown) => (val === undefined || val === null ? "" : String(val).trim());
    if (!str(name)) return;
    setIsSaving(true);
    try {
      const id = entryToEdit?.id || "hof-" + Math.random().toString(36).substr(2, 9);

      // ── Duplicate prevention (only for new entries) ──
      if (!entryToEdit) {
        const duplicate = isHofDuplicate({ name: String(name).trim(), type }, hallOfFame);
        if (duplicate) {
          toastWarning(
            `“${duplicate.name}” already exists in the Character Directory. ` +
            `Right-click the existing card and choose “Duplicate Entry” if you intentionally want an independent copy.`
          );
          setIsSaving(false);
          return;
        }
      }

      const splitCsv = (val: unknown): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
        if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
        return [String(val).trim()].filter(Boolean);
      };

      const resolvedPortrait = portraitSource === "card" ? undefined : str(portraitUrl) || undefined;
      const resolvedAvatar = avatarSource === "card" ? undefined : str(avatarUrl) || undefined;

      const validSocialLinks = (Array.isArray(socialLinks) ? socialLinks : []).filter(
        (l) => l && str(l.platform) && str(l.url)
      );

      const detailsObj: Record<string, any> = {
        fullName: str(fullName) || undefined,
        alias: str(alias) || undefined,
        originalLanguage: str(originalLanguage) || undefined,
        pronunciation: str(pronunciation) || undefined,
        gender: str(gender) || undefined,
        age: str(age) || undefined,
        species: str(species) || undefined,
        universe: str(universe) || undefined,
        series: str(series) || undefined,
        creator: str(creator) || undefined,
        firstAppearance: str(firstAppearance) || undefined,
        debutYear: str(debutYear) || undefined,
        personality: str(personality) || undefined,
        archetype: str(archetype) || undefined,
        occupation: str(occupation) || undefined,
        alignment: str(alignment) || undefined,
        traits: splitCsv(traitsInput),
        motivation: str(motivation) || undefined,
        background: str(bio) || undefined,
        characterDevelopment: str(characterDevelopment) || undefined,
        mainSeries: splitCsv(mainSeries),
        movies: splitCsv(movies),
        episodes: splitCsv(episodes),
        spinOffs: splitCsv(spinOffs),
        cameos: splitCsv(cameos),
        relatedWorks: splitCsv(relatedWorks),
        socialLinks: validSocialLinks,
        avatarUrl: resolvedAvatar,
        avatarSource,
        // Store card video URL separately so imageUrl stays a static-image URL.
        // getCardVideoUrl() already reads entry.details.cardVideo — no DB migration needed.
        cardVideo: str(cardVideo) || undefined,
        // VTuber fields
        agency: str(agency) || undefined,
        group: str(group) || undefined,
        oshiMark: str(oshiMark) || undefined,
        fanbaseName: str(fanbaseName) || undefined,
        birthday: str(birthday) || undefined,
        debutDate: str(debutDate) || undefined,
        vtuberStatus: str(vtuberStatus) || undefined,
      };

      await updateHof(id, {
        id,
        name: str(name),
        type,
        status,
        knownFor: type === "singer" ? [] : splitCsv(knownFor),
        nationality: type === "singer" ? "Singer" : str(nationality) || undefined,
        singerType: type === "singer" ? singerType : undefined,
        imageUrl: str(imageUrl) || undefined,
        portraitUrl: resolvedPortrait,
        avatarUrl: resolvedAvatar,
        avatarSource,
        note: str(note) || undefined,
        rank: rank === null ? null : Number(rank),
        isChampion,
        tokusatsuFranchise: type === "tokusatsu" ? tokusatsuFranchise || null : null,
        tokusatsuShow: type === "tokusatsu" ? str(tokusatsuShow) || null : null,
        associatedDramas: type === "tokusatsu" ? splitCsv(associatedDramas) : [],
        // Extended Fields
        fullName: str(fullName) || undefined,
        officialName: str(fullName) || undefined,
        alias: str(alias) || undefined,
        originalLanguage: str(originalLanguage) || undefined,
        nativeName: str(originalLanguage) || undefined,
        pronunciation: str(pronunciation) || undefined,
        gender: str(gender) || undefined,
        age: str(age) || undefined,
        species: str(species) || undefined,
        universe: str(universe) || undefined,
        work: str(universe) || undefined,
        series: str(series) || undefined,
        franchise: str(series) || undefined,
        creator: str(creator) || undefined,
        firstAppearance: str(firstAppearance) || undefined,
        debutYear: str(debutYear) || undefined,
        personality: str(personality) || undefined,
        archetype: str(archetype) || undefined,
        occupation: str(occupation) || undefined,
        role: str(occupation) || undefined,
        alignment: str(alignment) || undefined,
        traits: splitCsv(traitsInput),
        motivation: str(motivation) || undefined,
        background: str(bio) || undefined,
        characterDevelopment: str(characterDevelopment) || undefined,
        mainSeries: splitCsv(mainSeries),
        movies: splitCsv(movies),
        episodes: splitCsv(episodes),
        spinOffs: splitCsv(spinOffs),
        cameos: splitCsv(cameos),
        works: splitCsv(relatedWorks),
        relatedWorks: splitCsv(relatedWorks),
        // VTuber fields
        agency: str(agency) || undefined,
        group: str(group) || undefined,
        oshiMark: str(oshiMark) || undefined,
        fanbaseName: str(fanbaseName) || undefined,
        birthday: str(birthday) || undefined,
        debutDate: str(debutDate) || undefined,
        vtuberStatus: str(vtuberStatus) || undefined,
        gallery: mergeCharacterDictionaryMediaIntoGallery(galleryUrls, {
          imageUrl: str(imageUrl) || undefined,
          portraitUrl: resolvedPortrait,
          avatarUrl: resolvedAvatar,
        }),
        socialLinks: validSocialLinks,
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      {/* Cyber corner brackets */}
      {isCyber && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00F5FF]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#BF5FFF]" />
        </>
      )}

      <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-5 scrollbar-thin max-h-[85vh]">
        {/* Compact Header */}
        <div
          className="flex justify-between items-center mb-3 pb-2.5"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}
        >
          <div className="min-w-0 flex-1 pr-2">
            <h2
              className="text-sm sm:text-base font-black tracking-wide flex items-center gap-2 truncate"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
            >
              <span className="shrink-0">{entryToEdit ? "✏️" : "✨"}</span>
              <span className="truncate">
                {entryToEdit ? "Edit Character Dossier" : "New Character Dictionary Entry"}
              </span>
              {name && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 truncate max-w-[120px]"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FEF08A",
                    color: isCyber ? "#00F5FF" : "#854D0E",
                  }}
                >
                  {name}
                </span>
              )}
            </h2>
            <p className="text-[10px] font-mono theme-text-muted truncate">
              Encyclopedia knowledge dossier editor & artist preset importer
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Visual / JSON mode toggle */}
            <div
              className="flex items-center rounded-lg border overflow-hidden shrink-0"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB" }}
            >
              <button
                type="button"
                onClick={() => setEditorMode("visual")}
                className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all cursor-pointer"
                style={{
                  backgroundColor: editorMode === "visual"
                    ? isCyber ? "#00F5FF" : "#1E293B"
                    : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                  color: editorMode === "visual"
                    ? isCyber ? "#000" : "#FFF"
                    : isCyber ? "#94A3B8" : "#64748B",
                }}
              >
                🖊 Visual
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("json")}
                className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all cursor-pointer"
                style={{
                  backgroundColor: editorMode === "json"
                    ? isCyber ? "#00F5FF" : "#1E293B"
                    : isCyber ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                  color: editorMode === "json"
                    ? isCyber ? "#000" : "#FFF"
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
              className="px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer shrink-0"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                color: isCyber ? "#94A3B8" : "#475569",
              }}
              title="Export entry data as .json file"
            >
              ⬇ Export
            </button>

            <button
              type="button"
              onClick={() => scrollToTab("autofill")}
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

        {/* Mode Content Switch */}
        {editorMode === "json" ? (
          <div className="py-2">
            <HofJsonEditor
              profile={getLivePayload()}
              onApply={handleJsonApply}
            />
          </div>
        ) : (
          <>
            {/* Clear Scannable Tabs Navigation (Horizontal Scrollable with Auto-Scroll to Active Tab) */}
            <div
              ref={tabListRef}
              className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-none pb-1 border-b border-white/10 text-xs font-mono font-bold whitespace-nowrap scroll-smooth"
            >
              {TABS_LIST_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  type="button"
                  onClick={() => scrollToTab(tab.id as FormTab)}
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
                      { value: "vtuber", label: "VTuber", icon: "👾" },
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

              {/* VTuber-specific Fields (When type === 'vtuber') */}
              {type === "vtuber" && (
                <div className="space-y-3 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                  <div className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1 text-purple-400">
                    <span>👾</span> VTuber Attributes
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Agency / Affiliation
                      </label>
                      <input
                        type="text"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder="e.g. Hololive Production, NIJISANJI, Independent"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Group / Generation / Unit
                      </label>
                      <input
                        type="text"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        placeholder="e.g. holoEN Myth, Gamers, Gen 3, Obsydia"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Oshi Mark
                      </label>
                      <input
                        type="text"
                        value={oshiMark}
                        onChange={(e) => setOshiMark(e.target.value)}
                        placeholder="e.g. 🔱, 🥐, ☄️, 🦊"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Fanbase / Fandom Name
                      </label>
                      <input
                        type="text"
                        value={fanbaseName}
                        onChange={(e) => setFanbaseName(e.target.value)}
                        placeholder="e.g. Chumbuds, Dead Beats, Hoshiyomi"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Status
                      </label>
                      <CustomSelect
                        value={vtuberStatus}
                        onChange={(val) => setVtuberStatus(val)}
                        options={[
                          { value: "Active", label: "Active", icon: "🟢" },
                          { value: "Hiatus", label: "Hiatus", icon: "🟡" },
                          { value: "Graduated", label: "Graduated", icon: "🎓" },
                          { value: "Affiliated", label: "Affiliated", icon: "💼" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Debut Date
                      </label>
                      <input
                        type="text"
                        value={debutDate}
                        onChange={(e) => setDebutDate(e.target.value)}
                        placeholder="e.g. September 13, 2020 (2020-09-13)"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Birthday
                      </label>
                      <input
                        type="text"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        placeholder="e.g. June 20, November 13"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

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
                      placeholder="e.g. Japan, Korea, Global"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Age / Age Range
                  </label>
                  <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 21, 500+ years" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Birthday
                  </label>
                  <input type="text" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="e.g. June 20, November 13" className={inputClass} style={inputStyle} />
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
                    Universe / Work / Agency
                  </label>
                  <input type="text" value={universe || agency} onChange={(e) => { setUniverse(e.target.value); if (!agency) setAgency(e.target.value); }} placeholder="e.g. Hololive, Wuthering Waves, Konosuba" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Series / Franchise / Group
                  </label>
                  <input type="text" value={series || group} onChange={(e) => { setSeries(e.target.value); if (!group) setGroup(e.target.value); }} placeholder="e.g. holoEN Myth, Honkai: Star Rail, Fate" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Country / Region
                  </label>
                  <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Japan, Global" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Creator / Studio / Illustrator
                  </label>
                  <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="e.g. COVER Corp, Kuro Games, 81 Produce" className={inputClass} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                    Debut Year / Date
                  </label>
                  <input type="text" value={debutYear || debutDate} onChange={(e) => { setDebutYear(e.target.value); if (!debutDate) setDebutDate(e.target.value); }} placeholder="e.g. 2024, 2020-09-12" className={inputClass} style={inputStyle} />
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

          {/* TAB 5: GALLERY & IMAGES (Adapted from GameCharacterEditorModal Images Architecture) */}
          {activeFormTab === "gallery" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Card Image (Dictionary Roster Thumbnail) */}
                <div className="space-y-2">
                  <CharacterImageUploader
                    label="Card Image / Preview (3:4)"
                    allowVideo={true}
                    value={cardVideo || imageUrl}
                    onChange={(url) => {
                      setImgError(false);
                      // Detect whether the uploaded file is a video or static image
                      // and route to the correct state field.
                      const isVid = /\.(mp4|webm|mov|ogg)(?:[?#]|$)/i.test(url) || url.startsWith("data:video/");
                      if (isVid) {
                        setCardVideo(url);
                        // Keep imageUrl as-is so a prior static image isn't lost
                      } else {
                        setImageUrl(url);
                        setCardVideo(""); // clear any prior video when replaced with image
                      }
                    }}
                    onClear={() => {
                      setImageUrl("");
                      setCardVideo("");
                      setImgError(false);
                    }}
                    aspect={3 / 4}
                    hint="Supports images and MP4 video previews."
                    previewClass="h-44 w-full"
                  />
                  <input
                    type="text"
                    value={(cardVideo || imageUrl).startsWith("data:") ? "" : (cardVideo || imageUrl)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImgError(false);
                      const isVid = /\.(mp4|webm|mov|ogg)(?:[?#]|$)/i.test(val) || val.startsWith("data:video/");
                      if (isVid) {
                        setCardVideo(val);
                      } else {
                        setImageUrl(val);
                        setCardVideo("");
                      }
                    }}
                    placeholder="Or paste image / video URL…"
                    className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
                      borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
                    }}
                  />
                </div>

                {/* 2. Profile Avatar (1:1 Square - NEW Field) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-mono font-bold uppercase tracking-wider block"
                      style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "#6B7280" }}
                    >
                      Profile Avatar (1:1 Square)
                    </label>
                  </div>

                  {/* Mode selector: Sync vs Custom */}
                  <div className="flex gap-1 p-0.5 rounded-lg border text-[10px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setAvatarSource("card")}
                      className="px-2 py-1 rounded transition-colors cursor-pointer flex-1 text-center truncate"
                      style={{
                        backgroundColor: avatarSource === "card" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                        color: avatarSource === "card" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                      }}
                    >
                      1. Sync Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarSource("custom")}
                      className="px-2 py-1 rounded transition-colors cursor-pointer flex-1 text-center truncate"
                      style={{
                        backgroundColor: avatarSource === "custom" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                        color: avatarSource === "custom" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                      }}
                    >
                      2. Custom Avatar
                    </button>
                  </div>

                  {avatarSource === "card" ? (
                    <div className="space-y-2">
                      <div className="h-44 w-full rounded-xl overflow-hidden border flex flex-col items-center justify-center relative bg-black/10">
                        {imageUrl ? (
                          <img src={imageUrl} alt="synced avatar" className="w-full h-full object-cover object-center" />
                        ) : (
                          <span className="text-xs font-mono opacity-60">No Card Image Set</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono theme-text-muted">
                        ✓ Synced with Card Image fallback.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <CharacterImageUploader
                        label="Custom 1:1 Avatar"
                        value={avatarUrl}
                        onChange={(url) => setAvatarUrl(url)}
                        onClear={() => setAvatarUrl("")}
                        aspect={1}
                        hint="Square profile avatar artwork."
                        previewClass="h-44 w-full"
                      />
                      <input
                        type="text"
                        value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Or paste avatar URL…"
                        className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
                          borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Portrait (3:4 Profile Modal Image) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-mono font-bold uppercase tracking-wider block"
                      style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "#6B7280" }}
                    >
                      Portrait (3:4 Profile Modal Image)
                    </label>
                  </div>

                  {/* Mode selector buttons: 1. Sync, 2. Custom URL, 3. Upload */}
                  <div className="flex gap-1 p-0.5 rounded-lg border text-[10px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setPortraitSource("card")}
                      className="px-2 py-1 rounded transition-colors cursor-pointer flex-1 text-center truncate"
                      style={{
                        backgroundColor: portraitSource === "card" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                        color: portraitSource === "card" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                      }}
                    >
                      1. Sync Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortraitSource("url")}
                      className="px-2 py-1 rounded transition-colors cursor-pointer flex-1 text-center truncate"
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
                      className="px-2 py-1 rounded transition-colors cursor-pointer flex-1 text-center truncate"
                      style={{
                        backgroundColor: portraitSource === "upload" ? (isCyber ? "#00F5FF" : "#FFFFFF") : "transparent",
                        color: portraitSource === "upload" ? (isCyber ? "#050816" : "#000000") : (isCyber ? "#94A3B8" : "#4B5563"),
                      }}
                    >
                      3. Upload
                    </button>
                  </div>

                  {portraitSource === "card" ? (
                    <div className="space-y-2">
                      <div className="h-44 w-full rounded-xl overflow-hidden border flex flex-col items-center justify-center relative bg-black/10">
                        {imageUrl ? (
                          <img src={imageUrl} alt="synced portrait" className="w-full h-full object-cover object-top" />
                        ) : (
                          <span className="text-xs font-mono opacity-60">No Card Image Set</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono theme-text-muted">
                        ✓ Currently synced with Card Image.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <CharacterImageUploader
                        label="Custom 3:4 Portrait"
                        value={portraitUrl}
                        onChange={(url) => {
                          setPortraitUrl(url);
                          setPortraitSource("upload");
                        }}
                        onClear={() => setPortraitUrl("")}
                        aspect={3 / 4}
                        hint="Dedicated profile portrait image."
                        previewClass="h-44 w-full"
                      />
                      {portraitSource === "url" && (
                        <input
                          type="text"
                          value={portraitUrl.startsWith("data:") ? "" : portraitUrl}
                          onChange={(e) => setPortraitUrl(e.target.value)}
                          placeholder="Or paste portrait URL…"
                          className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
                            borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Personal Gallery Collection */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <GalleryUploader images={galleryUrls} onChange={setGalleryUrls} />

                {/* Quick Paste URL for Gallery */}
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Or paste artwork URL directly (https://...)"
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LINKS & SOCIAL */}
          {activeFormTab === "links" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border bg-black/5 dark:bg-white/5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider block" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  🔗 External Links & Social Profiles
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Platform Name</label>
                    <input
                      type="text"
                      value={linkPlatform}
                      onChange={(e) => setLinkPlatform(e.target.value)}
                      placeholder="e.g. Twitter / X, YouTube, Official Website, Wiki"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">URL</label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 text-black cursor-pointer transition-all hover:scale-105"
                >
                  {editingLinkIndex !== null ? "✓ Update Link" : "+ Add Social Link"}
                </button>

                {editingLinkIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLinkIndex(null);
                      setLinkPlatform("");
                      setLinkUrl("");
                    }}
                    className="ml-2 text-xs font-bold text-gray-400 hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {/* Added Links List */}
              {socialLinks.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold opacity-60 block">Configured Links ({socialLinks.length})</span>
                  <div className="space-y-2">
                    {socialLinks.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
                          borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold theme-text-primary block">{item.platform}</span>
                          <span className="text-[10px] font-mono theme-text-muted truncate block">{item.url}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditSocialLink(idx)}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSocialLink(idx)}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs font-mono opacity-50 border border-dashed rounded-xl">
                  No external social links added yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ARTIST PRESET / AUTO-FILL */}
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
                        {preset.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold theme-text-primary truncate">{preset.name}</div>
                        <div className="text-[10px] theme-text-muted truncate">
                          {preset.nationality || "Artist"}{preset.occupation.length > 0 ? ` • ${preset.occupation.join(", ")}` : ""}
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
                      Selected: {selectedPreset.name}{selectedPreset.fullName ? ` (${selectedPreset.fullName})` : ""}
                    </span>
                  </div>

                  {selectedPreset.bio && (
                    <p className="text-xs leading-relaxed text-white/80 line-clamp-2">{selectedPreset.bio}</p>
                  )}

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
                {currentStepIndex + 1} / {TABS_LIST.length}
              </span>
              <button
                type="button"
                onClick={handleNextTab}
                disabled={currentStepIndex === TABS_LIST.length - 1}
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
                disabled={isSaving || isUploading}
                className="px-4 py-1.5 text-xs font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer shadow-md"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#fff",
                }}
              >
                {isSaving ? "Saving..." : entryToEdit ? "Save Changes" : "✨ Enshrine"}
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
