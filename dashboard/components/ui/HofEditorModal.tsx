"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { HallOfFameEntry, MediaStatus } from "@/lib/store/dashboardStore";

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
  const [type, setType] = useState<"actor" | "actress" | "anime">("actress");
  const [status, setStatus] = useState<MediaStatus>("GOAT Status");
  const [knownFor, setKnownFor] = useState("");
  const [nationality, setNationality] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [note, setNote] = useState("");
  const [rank, setRank] = useState<number | null>(null);
  const [isChampion, setIsChampion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entryToEdit) {
      setName(entryToEdit.name);
      setType(entryToEdit.type);
      setStatus(entryToEdit.status);
      setKnownFor(entryToEdit.knownFor.join(", "));
      setNationality(entryToEdit.nationality || "");
      setImageUrl(entryToEdit.imageUrl || "");
      setNote(entryToEdit.note || "");
      setRank(entryToEdit.rank !== undefined ? entryToEdit.rank : null);
      setIsChampion(entryToEdit.isChampion || false);
      
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
      setImageUrl("");
      setImageSource("upload");
      setNote("");
      setRank(null);
      setIsChampion(false);
    }
    setImgError(false);
  }, [entryToEdit, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setImgError(false);
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
        knownFor: knownFor.split(",").map((s) => s.trim()).filter(Boolean),
        nationality: nationality.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        note: note.trim() || undefined,
        rank: rank === null ? null : Number(rank),
        isChampion,
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

                {/* Form */}
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
                              onChange={handleFileUpload}
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
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className={inputClass + " cursor-pointer"}
                        style={inputStyle}
                      >
                        <option value="actress">💫 Actress</option>
                        <option value="actor">🎭 Actor</option>
                        <option value="anime">⛩️ Anime</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Status Tier</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className={inputClass + " cursor-pointer"}
                        style={inputStyle}
                      >
                        <option value="GOAT Status">👑 GOAT Status</option>
                        <option value="All-Star">⭐ All-Star</option>
                        <option value="Rising">🚀 Rising</option>
                        <option value="Classic">💎 Classic</option>
                      </select>
                    </div>
                  </div>

                  {/* Nationality + Rank */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>Nationality</label>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className={inputClass + " cursor-pointer"}
                        style={inputStyle}
                      >
                        <option value="">— Select —</option>
                        <option value="Korea">🇰🇷 Korea</option>
                        <option value="China">🇨🇳 China</option>
                        <option value="Japan">🇯🇵 Japan</option>
                        <option value="Hollywood">🎬 Hollywood</option>
                        <option value="American">🇺🇸 American</option>
                        <option value="Canadian">🇨🇦 Canadian</option>
                        <option value="Singer">🎤 Singer</option>
                      </select>
                    </div>
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

                  {/* Known For */}
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
          </div>
    </Modal>
  );
}
