"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, ProfileHistoryEntry } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { BORDER_CONFIGS } from "@/components/cards/ProfileCard";

interface AestheticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function isVideo(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function HistoryChip({
  entry,
  isCyber,
  onClick,
}: {
  entry: ProfileHistoryEntry;
  isCyber: boolean;
  onClick: () => void;
}) {
  const isVid = isVideo(entry.url);
  const typeLabel = entry.assetType === "avatar" ? "AV" : entry.assetType === "banner" ? "BN" : "NP";
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      title={`Restore ${entry.assetType}: ${entry.url}`}
      style={{
        width: 48,
        height: 48,
        borderRadius: isCyber ? 8 : 4,
        border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "2px solid #000",
        overflow: "hidden",
        flexShrink: 0,
        cursor: "pointer",
        position: "relative",
        background: isCyber ? "rgba(255,255,255,0.04)" : "#f5f5f5",
      }}
    >
      {isVid ? (
        <video
          src={entry.url}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
      ) : (
        <img
          src={entry.url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      {/* Type badge */}
      <div
        style={{
          position: "absolute",
          bottom: 1,
          left: 1,
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.04em",
          padding: "1px 3px",
          borderRadius: 2,
          background: isCyber ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.65)",
          color: isCyber ? "#00F5FF" : "#fff",
          textTransform: "uppercase",
        }}
      >
        {typeLabel}
      </div>
    </motion.button>
  );
}

export function AestheticsModal({ isOpen, onClose }: AestheticsModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile, profileHistory, updateAesthetics } = useDashboardStore();

  // ── Local state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(profile.name);
  const [customTag, setCustomTag] = useState(profile.customTag ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar ?? "");
  const [banner, setBanner] = useState(profile.banner ?? "");
  const [nameplate, setNameplate] = useState(profile.nameplate ?? "");
  const [borderStyle, setBorderStyle] = useState(profile.borderStyle ?? "default");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadType, setUploadType] = useState<"none" | "avatar" | "banner" | "nameplate">("none");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const nameplateInputRef = useRef<HTMLInputElement>(null);

  // Sync when profile changes externally (e.g. fetch)
  useEffect(() => {
    setName(profile.name);
    setCustomTag(profile.customTag ?? "");
    setBio(profile.bio);
    setAvatar(profile.avatar ?? "");
    setBanner(profile.banner ?? "");
    setNameplate(profile.nameplate ?? "");
    setBorderStyle(profile.borderStyle ?? "default");
  }, [profile]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "avatar" | "banner" | "nameplate") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadType(target);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (target === "avatar") setAvatar(data.url);
        if (target === "banner") setBanner(data.url);
        if (target === "nameplate") setNameplate(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadType("none");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAesthetics({
        name: name.trim(),
        customTag: customTag.trim() || undefined,
        bio: bio.trim(),
        avatar: avatar.trim() || undefined,
        banner: banner.trim() || undefined,
        nameplate: nameplate.trim() || undefined,
        borderStyle,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save aesthetics:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Style helpers ──────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
    color: isCyber ? "#E0E8FF" : "#1a1a1a",
    border: "1px solid",
    borderRadius: isCyber ? 8 : 6,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280",
    marginBottom: 4,
    display: "block",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "14px 0",
    borderBottom: isCyber ? "1px solid rgba(255,255,255,0.06)" : "1.5px dashed rgba(0,0,0,0.1)",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      {/* Cyber corner accents */}
      {isCyber && (
        <>
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#BF5FFF]" />
        </>
      )}

      <form onSubmit={handleSave}>
        {/* ── Modal Header ──────────────────────────────────────────── */}
        <div
          className="flex justify-between items-center px-6 pt-6 pb-4"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2.5px solid #000" }}
        >
          <div>
            <h2
              className="text-lg font-black tracking-wide"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
            >
              {isCyber ? "🎨 AESTHETIC.CONFIG" : "🎨 Edit Aesthetics"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: isCyber ? "rgba(224,232,255,0.4)" : "#9CA3AF" }}>
              Customize your profile appearance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "70vh" }}>

          {/* ── Identity ──────────────────────────────────────────────── */}
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 10 }}>
              🪪 Identity
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  id="aesthetics-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Custom Tag (e.g. #4269)</label>
                <input
                  id="aesthetics-tag"
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="#0001"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>About Me</label>
              <textarea
                id="aesthetics-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>
          </div>

          {/* ── Avatar ────────────────────────────────────────────────── */}
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 10 }}>
              🖼️ Avatar
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Preview */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: isCyber ? "2px solid rgba(0,245,255,0.4)" : "3px solid #000",
                  flexShrink: 0,
                  background: isCyber ? "#0A0F2C" : "#FF6B35",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: 18, color: isCyber ? "#00F5FF" : "#fff" }}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  id="aesthetics-avatar-url"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://... or upload below"
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadType !== "none"}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 900,
                      borderRadius: isCyber ? 6 : 4,
                      border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                      background: isCyber ? "rgba(0,245,255,0.1)" : "#F3F4F6",
                      color: isCyber ? "#00F5FF" : "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {uploadType === "avatar" ? "Uploading..." : "📁 Upload File"}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Banner ────────────────────────────────────────────────── */}
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 10 }}>
              🎞️ Profile Banner <span style={{ fontWeight: 400, textTransform: "none" }}>(image/video URL or file upload)</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              <input
                id="aesthetics-banner-url"
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://...jpg / .mp4 / .webm"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input ref={bannerInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, "banner")} />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadType !== "none"}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 900,
                    borderRadius: isCyber ? 6 : 4,
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                    background: isCyber ? "rgba(0,245,255,0.1)" : "#F3F4F6",
                    color: isCyber ? "#00F5FF" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {uploadType === "banner" ? "Uploading..." : "📁 Upload Banner"}
                </button>
                {banner && (
                  <button
                    type="button"
                    onClick={() => setBanner("")}
                    style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Live preview */}
            <AnimatePresence>
              {banner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 80 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    borderRadius: isCyber ? 8 : 4,
                    overflow: "hidden",
                    border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid #000",
                  }}
                >
                  {isVideo(banner) ? (
                    <video
                      src={banner}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={banner}
                      alt="banner preview"
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Nameplate ─────────────────────────────────────────────── */}
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 10 }}>
              💳 Sidebar Nameplate Banner <span style={{ fontWeight: 400, textTransform: "none" }}>(image/video URL or file upload)</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              <input
                id="aesthetics-nameplate-url"
                type="url"
                value={nameplate}
                onChange={(e) => setNameplate(e.target.value)}
                placeholder="https://...jpg / .mp4 / .webm"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input ref={nameplateInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, "nameplate")} />
                <button
                  type="button"
                  onClick={() => nameplateInputRef.current?.click()}
                  disabled={uploadType !== "none"}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 900,
                    borderRadius: isCyber ? 6 : 4,
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                    background: isCyber ? "rgba(0,245,255,0.1)" : "#F3F4F6",
                    color: isCyber ? "#00F5FF" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {uploadType === "nameplate" ? "Uploading..." : "📁 Upload Nameplate"}
                </button>
                {nameplate && (
                  <button
                    type="button"
                    onClick={() => setNameplate("")}
                    style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Live preview */}
            <AnimatePresence>
              {nameplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 80 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    borderRadius: isCyber ? 8 : 4,
                    overflow: "hidden",
                    border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid #000",
                  }}
                >
                  {isVideo(nameplate) ? (
                    <video
                      src={nameplate}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={nameplate}
                      alt="nameplate preview"
                      style={{ width: "100%", height: 80, objectFit: "cover" }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Border Style Grid ─────────────────────────────────────── */}
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 10 }}>
              🔲 Avatar Border Style
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {Object.entries(BORDER_CONFIGS).map(([key, config]) => {
                const isSelected = borderStyle === key;
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setBorderStyle(key)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: isCyber ? 8 : 4,
                      border: isSelected
                        ? isCyber ? "1.5px solid #00F5FF" : "2px solid #FF6B35"
                        : isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px solid #E5E7EB",
                      background: isSelected
                        ? isCyber ? "rgba(0,245,255,0.08)" : "rgba(255,107,53,0.06)"
                        : isCyber ? "rgba(255,255,255,0.02)" : "#FAFAFA",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s",
                    }}
                  >
                    {/* Radio dot */}
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? (isCyber ? "#00F5FF" : "#FF6B35") : "#9CA3AF"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: isCyber ? "#00F5FF" : "#FF6B35",
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 900, color: isCyber ? "#E0E8FF" : "#1A1A1A", margin: 0 }}>
                        {config.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Aesthetic History Log ─────────────────────────────────── */}
          {profileHistory.length > 0 && (
            <div style={{ paddingTop: 14 }}>
              <p style={{ ...labelStyle, color: isCyber ? "#00F5FF" : "#374151", marginBottom: 8 }}>
                🕓 Aesthetic History <span style={{ fontWeight: 400, textTransform: "none" }}>(click to restore)</span>
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 6,
                  scrollbarWidth: "none",
                }}
              >
                {profileHistory.map((entry) => (
                  <HistoryChip
                    key={entry.id}
                    entry={entry}
                    isCyber={isCyber}
                    onClick={() => {
                      if (entry.assetType === "avatar") setAvatar(entry.url);
                      else if (entry.assetType === "banner") setBanner(entry.url);
                      else setNameplate(entry.url);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Action Bar ────────────────────────────────────────────────── */}
        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2.5px solid #000" }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 900,
              borderRadius: isCyber ? 8 : 6,
              border: isCyber ? "1px solid rgba(255,255,255,0.15)" : "2px solid #000",
              background: "transparent",
              color: isCyber ? "#94A3B8" : "#4A4A4A",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            id="aesthetics-save-btn"
            disabled={isSaving || uploadType !== "none"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "8px 20px",
              fontSize: 12,
              fontWeight: 900,
              borderRadius: isCyber ? 8 : 6,
              border: isCyber ? "none" : "2px solid #000",
              background: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#FFF",
              cursor: isSaving ? "wait" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.4)" : "4px 4px 0 #000",
              letterSpacing: "0.04em",
            }}
          >
            {isSaving ? "Saving..." : "💾 Save Aesthetics"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
