"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { HallOfFameEntry, MediaStatus } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface HofEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: HallOfFameEntry | null;
}

export function HofEditorModal({ isOpen, onClose, entryToEdit }: HofEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { updateHof } = useDashboardStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<"actor" | "actress" | "anime" | "singer" | "tokusatsu" | "none">("actress");
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Crop State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entryToEdit) {
      setName(entryToEdit.name);
      setType(entryToEdit.type);
      setStatus(entryToEdit.status);
      setKnownFor(entryToEdit.knownFor.join(", "));
      setNationality(entryToEdit.nationality || "");
      setSingerType(entryToEdit.singerType || "Solo Artist");
      setImageUrl(entryToEdit.imageUrl || "");
      setNote(entryToEdit.note || "");
      setRank(entryToEdit.rank !== undefined ? entryToEdit.rank : null);
      setIsChampion(entryToEdit.isChampion || false);
      setTokusatsuFranchise(entryToEdit.tokusatsuFranchise || "");
      setTokusatsuShow(entryToEdit.tokusatsuShow || "");
      setAssociatedDramas(entryToEdit.associatedDramas ? entryToEdit.associatedDramas.join(", ") : "");
      
      // Auto-detect image source
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
    }
    setImgError(false);
    setCropImageSrc(null); // Reset crop state on open
  }, [entryToEdit, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read the file as a data URL for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropAndUpload = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");

      const formData = new FormData();
      formData.append("file", croppedBlob, "cropped.jpg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setImgError(false);
        setCropImageSrc(null); // Return to main form
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const id = entryToEdit?.id || "hof-" + Math.random().toString(36).substr(2, 9);
      await updateHof(id, {
        id,
        name: name.trim(),
        type,
        status,
        knownFor: type === "singer" ? [] : knownFor.split(",").map((s) => s.trim()).filter(Boolean),
        nationality: type === "singer" ? "Singer" : (nationality.trim() || undefined),
        singerType: type === "singer" ? singerType : undefined,
        imageUrl: imageUrl.trim() || undefined,
        note: note.trim() || undefined,
        rank: rank === null ? null : Number(rank),
        isChampion,
        tokusatsuFranchise: (type === "tokusatsu" || type === "none") ? (tokusatsuFranchise || null) : null,
        tokusatsuShow: (type === "tokusatsu" || type === "none") ? (tokusatsuShow.trim() || null) : null,
        associatedDramas: (type === "tokusatsu" || type === "none") ? associatedDramas.split(",").map(d => d.trim()).filter(Boolean) : [],
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `w-full px-3 py-2 text-sm font-semibold rounded-lg outline-none border focus:ring-2 transition-all`;
  const inputStyle = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9F9F9",
    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
    color: isCyber ? "#E0E8FF" : "#1A1A1A",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Cyber corner brackets */}
      {isCyber && (
              <>
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#BF5FFF]" />
                </>
              )}

              <div className="p-6">
                {/* Header */}
                <div
                  className="flex justify-between items-center mb-5 pb-3"
                  style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}
                >
                  <h2
                    className="text-lg font-black tracking-wide"
                    style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
                  >
                    {entryToEdit
                      ? (isCyber ? "EDIT_LEGEND.CONFIG" : "✏️ Edit Legend Details")
                      : (isCyber ? "ENSHRINE_NEW_LEGEND" : "✨ Enshrine New Legend")}
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-black/10"
                    style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
                  >
                    ✕
                  </button>
                </div>

                {cropImageSrc ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
                      <Cropper
                        image={cropImageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={3 / 4} // Portrait aspect ratio standard for Hall of Fame
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="flex flex-col gap-2 px-2">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Zoom
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-[#00F5FF]"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setCropImageSrc(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-colors"
                        style={{
                          borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                          color: isCyber ? "#94A3B8" : "#6B7280",
                          backgroundColor: "transparent",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropAndUpload}
                        disabled={isUploading}
                        className="px-5 py-2 text-sm font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60"
                        style={{
                          backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                          color: isCyber ? "#050816" : "#fff",
                        }}
                      >
                        {isUploading ? "Uploading..." : "Crop & Upload"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">

                    {/* Image Preview + Option Toggles */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                      Photo Source
                    </label>
                    <div className="flex gap-4 items-center">
                      {/* Preview avatar */}
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black text-lg border-2"
                        style={{
                          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                          backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F0F0F0",
                        }}
                      >
                        {imageUrl && !imgError ? (
                          <img
                            src={imageUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <span style={{ color: isCyber ? "#00F5FF" : "#999" }}>
                            {name ? name.charAt(0).toUpperCase() : "?"}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        {/* Selector Tabs */}
                        <div
                          className="flex gap-1 p-0.5 rounded-lg border text-xs font-black self-start"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#E5E7EB",
                            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setImageSource("upload")}
                            className="px-3 py-1 rounded transition-colors"
                            style={{
                              backgroundColor: imageSource === "upload"
                                ? (isCyber ? "#00F5FF" : "#FFFFFF")
                                : "transparent",
                              color: imageSource === "upload"
                                ? (isCyber ? "#050816" : "#000000")
                                : (isCyber ? "#94A3B8" : "#4B5563"),
                            }}
                          >
                            📁 Device Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageSource("url")}
                            className="px-3 py-1 rounded transition-colors"
                            style={{
                              backgroundColor: imageSource === "url"
                                ? (isCyber ? "#00F5FF" : "#FFFFFF")
                                : "transparent",
                              color: imageSource === "url"
                                ? (isCyber ? "#050816" : "#000000")
                                : (isCyber ? "#94A3B8" : "#4B5563"),
                            }}
                          >
                            🔗 Image Link
                          </button>
                        </div>

                        {/* Conditional Inputs */}
                        {imageSource === "url" ? (
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
                            placeholder="Paste image link (https://...)"
                            className={inputClass}
                            style={inputStyle}
                          />
                        ) : (
                          <div className="flex gap-2 items-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="px-4 py-2 text-xs font-black rounded border transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                              style={{
                                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                                borderColor: isCyber ? "#00F5FF" : "#9CA3AF",
                                color: isCyber ? "#00F5FF" : "#374151",
                              }}
                            >
                              📁 {isUploading ? "Uploading..." : "Upload from Device"}
                            </button>
                            {imageUrl && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] opacity-60 truncate max-w-[150px]">
                                  {imageUrl.replace("/uploads/", "")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => { setImageUrl(""); setImgError(false); }}
                                  className="text-[10px] text-red-500 font-bold hover:underline self-start"
                                >
                                  Remove File
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kang Mi Na"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  {/* Type + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Type</label>
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
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Status Tier</label>
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

                  {/* Nationality / Singer Type + Rank */}
                  <div className="grid grid-cols-2 gap-3">
                    {type === "singer" ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Singer Type</label>
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
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Nationality</label>
                        <CustomSelect
                          value={nationality}
                          onChange={(val) => setNationality(val)}
                          options={[
                            { value: "", label: "— Select —" },
                            { value: "Korea", label: "Korea", icon: "🇰🇷" },
                            { value: "China", label: "China", icon: "🇨🇳" },
                            { value: "Japan", label: "Japan", icon: "🇯🇵" },
                            { value: "Hollywood", label: "Hollywood", icon: "🎬" },
                            { value: "American", label: "American", icon: "🇺🇸" },
                            { value: "Canadian", label: "Canadian", icon: "🇨🇦" },
                          ]}
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Official Rank</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rank === null ? "" : rank}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRank(val === "" ? null : Number(val));
                        }}
                        placeholder="Unranked (Standard)"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Known For (Hidden for Singer) */}
                  {type !== "singer" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                        Known For <span className="normal-case font-normal opacity-60">(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={knownFor}
                        onChange={(e) => setKnownFor(e.target.value)}
                        placeholder="e.g. Produce 101, Hotel Del Luna"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {/* Note */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Enshrinement Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="e.g. Absolute bias, forever iconic."
                      className={inputClass + " resize-none"}
                      style={inputStyle}
                    />
                  </div>

                  {/* Tokusatsu Ecosystem (Shown only for Tokusatsu / none) */}
                  {(type === "tokusatsu" || type === "none" || tokusatsuFranchise) && (
                    <div className="border border-adaptive-unique p-3 rounded-xl space-y-3 bg-black/5 dark:bg-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#00F5FF]">📺 Tokusatsu Ecosystem</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Franchise</label>
                          <select
                            value={tokusatsuFranchise}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTokusatsuFranchise(val);
                              if (val === "Ultraman" || val === "Kamen Rider" || val === "Power Rangers") {
                                setType("tokusatsu");
                              }
                            }}
                            className={inputClass}
                            style={inputStyle}
                          >
                            <option value="">None (Standard HOF)</option>
                            <option value="Ultraman">Ultraman</option>
                            <option value="Kamen Rider">Kamen Rider</option>
                            <option value="Power Rangers">Power Rangers</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Specific Show</label>
                          <input
                            type="text"
                            value={tokusatsuShow}
                            onChange={(e) => setTokusatsuShow(e.target.value)}
                            placeholder="e.g. Kamen Rider W"
                            className={inputClass}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                          Associated J-Dramas <span className="normal-case font-normal opacity-60">(comma separated titles)</span>
                        </label>
                        <input
                          type="text"
                          value={associatedDramas}
                          onChange={(e) => setAssociatedDramas(e.target.value)}
                          placeholder="e.g. Rikokatsu, Shitsuren Chocolatier"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  {/* Champion Toggle */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer select-none"
                    style={{
                      backgroundColor: isChampion
                        ? (isCyber ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.12)")
                        : (isCyber ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"),
                      border: isChampion ? "1.5px solid #FFD700" : (isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid #E5E7EB"),
                    }}
                    onClick={() => setIsChampion(!isChampion)}
                  >
                    <span className="text-xl">{isChampion ? "👑" : "🏅"}</span>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase tracking-wider" style={{ color: isChampion ? "#FFD700" : (isCyber ? "#94A3B8" : "#6B7280") }}>
                        {isChampion ? "Overall Champion / Leader ✓" : "Make Overall Champion / Leader"}
                      </p>
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {isChampion ? "Will be featured at the top of the Hall of Fame" : "Click to crown as #1 overall favorite"}
                      </p>
                    </div>
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: isChampion ? "#FFD700" : "#999", backgroundColor: isChampion ? "#FFD700" : "transparent" }}
                    >
                      {isChampion && <span className="text-[10px] font-black text-black">✓</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-colors"
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
                      className="px-5 py-2 text-sm font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60"
                      style={{
                        backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                        color: isCyber ? "#050816" : "#fff",
                      }}
                    >
                      {isSaving ? "Saving..." : (entryToEdit ? "Save Changes" : "✨ Enshrine")}
                    </button>
                  </div>
                </form>
              )}
            </div>
    </Modal>
  );
}
