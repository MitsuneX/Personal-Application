"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard, BORDER_CONFIGS } from "@/components/cards/ProfileCard";
import { GamifiedStatsWidget } from "@/components/cards/GamifiedStatsWidget";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { LandingPreviewModal } from "@/components/landing/LandingPreviewModal";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useToast } from "@/components/ui/ToastProvider";
import { LANDING_MODULE_CATALOG } from "@/lib/config/landingModules";
import { ContentLockSettingsCard } from "@/components/security/ContentLockSettingsCard";

const PLATFORMS = ["GitHub", "Twitter/X", "Discord", "Instagram", "LinkedIn", "Tiktok"];

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile, updateProfile, profileHistory, contentLock } = useDashboardStore();
  const { confirm } = useConfirm();
  const toast = useToast();

  // ── Core Identity State ──
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<"online" | "away" | "busy" | "offline">("online");
  const [avatar, setAvatar] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [borderStyle, setBorderStyle] = useState("default");
  const [skills, setSkills] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mbti, setMbti] = useState("");
  const [zodiac, setZodiac] = useState("");

  // Socials list state
  const [socials, setSocials] = useState<{ platform: string; handle: string; url?: string }[]>([]);

  // ── Landing Page Customization State ──
  const [dashboardName, setDashboardName] = useState("");
  const [landingMode, setLandingMode] = useState<"enabled" | "disabled" | "preview">("enabled");
  const [heroStyle, setHeroStyle] = useState<"cinematic" | "minimal" | "ambient" | "custom">("cinematic");
  const [showPublicStats, setShowPublicStats] = useState(false);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [aboutWorldText, setAboutWorldText] = useState("");
  const [landingBgStyle, setLandingBgStyle] = useState<"matrix" | "nebula" | "grid" | "minimal">("matrix");
  const [landingAccentColor, setLandingAccentColor] = useState("#00F5FF");
  const [visibleFeatures, setVisibleFeatures] = useState<string[]>([
    "game-database", "game-characters", "hall-of-fame", "music", "media", "ai-library", "hobbies", "emergency"
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // ── Account Info & Relink Email state ──
  const [accountInfo, setAccountInfo] = useState<{
    email: string;
    username: string;
    pendingRelink?: { newEmail: string; expiresAt: string } | null;
  } | null>(null);

  const [isRelinkModalOpen, setIsRelinkModalOpen] = useState(false);
  const [relinkStep, setRelinkStep] = useState<"request" | "verify">("request");
  const [newEmailInput, setNewEmailInput] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [isRelinkLoading, setIsRelinkLoading] = useState(false);

  const fetchAccountInfo = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/account-info");
      if (res.ok) {
        const data = await res.json();
        setAccountInfo(data);
      }
    } catch (err) {
      console.error("Failed to load account info:", err);
    }
  }, []);

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  // Sync state with store profile on load or when profile updates
  useEffect(() => {
    setName(profile.name || "");
    setTagline(profile.tagline || "");
    setLocation(profile.location || "");
    setBio(profile.bio || "");
    setStatus(profile.status || "online");
    setAvatar(profile.avatar || "");
    setBorderStyle(profile.borderStyle || "default");
    setSkills(profile.skills ? profile.skills.join(", ") : "");
    setSocials(profile.socials || []);
    setPhoneNumber(profile.phoneNumber || "");
    setMbti(profile.mbti || "");
    setZodiac(profile.zodiac || "");

    // Landing settings
    setDashboardName(profile.dashboardName || "");
    setLandingMode(profile.landingMode || "enabled");
    setHeroStyle(profile.heroStyle || "cinematic");
    setShowPublicStats(Boolean(profile.showPublicStats));
    setShowAboutSection(Boolean(profile.showAboutSection));
    setShowSocialLinks(Boolean(profile.showSocialLinks));
    setAboutWorldText(profile.aboutWorldText || "");
    setLandingBgStyle(profile.landingBgStyle || "matrix");
    setLandingAccentColor(profile.landingAccentColor || "#00F5FF");
    if (profile.visibleFeatures && profile.visibleFeatures.length > 0) {
      setVisibleFeatures(profile.visibleFeatures);
    }

    // Auto-detect image source
    if (profile.avatar && profile.avatar.startsWith("/uploads/")) {
      setImageSource("upload");
    } else if (profile.avatar) {
      setImageSource("url");
    } else {
      setImageSource("upload");
    }
  }, [profile]);

  // Memoized draft profile for live reactive preview
  const draftProfile = useMemo(() => ({
    name,
    tagline,
    bio,
    avatar,
    location,
    status,
    borderStyle,
    skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    socials,
    phoneNumber,
    mbti,
    zodiac,
  }), [name, tagline, bio, avatar, location, status, borderStyle, skills, socials, phoneNumber, mbti, zodiac]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropOpen(false);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "profile-avatar.webp");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        setAvatar(data.url);
        toast.success("Avatar image uploaded cleanly!");
      } else {
        toast.error("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSocialChange = (index: number, field: string, value: string) => {
    const updated = [...socials];
    (updated[index] as any)[field] = value;
    setSocials(updated);
  };

  const addSocialRow = () => {
    setSocials([...socials, { platform: "GitHub", handle: "", url: "" }]);
  };

  const removeSocialRow = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const toggleFeatureSelect = (id: string) => {
    if (visibleFeatures.includes(id)) {
      setVisibleFeatures(visibleFeatures.filter((f) => f !== id));
    } else {
      setVisibleFeatures([...visibleFeatures, id]);
    }
  };

  const handleInitiateRelink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRelinkLoading(true);
    try {
      const res = await fetch("/api/auth/relink-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmailInput, currentPassword: currentPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to request email relink.");
      } else {
        toast.success(data.message || "Verification code dispatched!");
        if (data.devOtpCode) {
          toast.info(`[DEV Verification Code]: ${data.devOtpCode}`);
        }
        setRelinkStep("verify");
        fetchAccountInfo();
      }
    } catch {
      toast.error("Error requesting email relink.");
    } finally {
      setIsRelinkLoading(false);
    }
  };

  const handleVerifyRelink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRelinkLoading(true);
    try {
      const res = await fetch("/api/auth/relink-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: otpCodeInput }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Verification failed.");
      } else {
        toast.success(data.message || "Email successfully relinked!");
        setIsRelinkModalOpen(false);
        setNewEmailInput("");
        setCurrentPasswordInput("");
        setOtpCodeInput("");
        setRelinkStep("request");
        fetchAccountInfo();
      }
    } catch {
      toast.error("Error verifying relink code.");
    } finally {
      setIsRelinkLoading(false);
    }
  };

  const handleCancelRelink = async () => {
    try {
      const res = await fetch("/api/auth/relink-email/cancel", { method: "POST" });
      if (res.ok) {
        toast.success("Pending email relink request cancelled.");
        setRelinkStep("request");
        setNewEmailInput("");
        setOtpCodeInput("");
        fetchAccountInfo();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
        location: location.trim(),
        borderStyle: borderStyle,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        socials: socials.filter((s) => s.handle.trim() !== ""),
        phoneNumber: phoneNumber.trim(),
        mbti: mbti,
        zodiac: zodiac,
        dashboardName: dashboardName.trim() || undefined,
        landingMode: landingMode,
        heroStyle: heroStyle,
        showPublicStats: showPublicStats,
        showAboutSection: showAboutSection,
        showSocialLinks: showSocialLinks,
        aboutWorldText: aboutWorldText.trim(),
        landingBgStyle: landingBgStyle,
        landingAccentColor: landingAccentColor,
        visibleFeatures: visibleFeatures,
      });
      toast.success("Profile & Landing configurations updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Shared Theme Styling Tokens
  const zoneCardClass = "p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-200";
  const zoneCardStyle = {
    backgroundColor: isCyber ? "rgba(10, 15, 44, 0.65)" : "#FFFFFF",
    border: isCyber ? "1px solid rgba(0, 245, 255, 0.25)" : "3px solid #000000",
    boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.08)" : "5px 5px 0px 0px #000000",
  };

  const inputClass = "w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl outline-none border transition-all duration-200 focus:ring-2 focus:ring-cyan-400/40";
  const inputStyle = {
    backgroundColor: isCyber ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF",
    borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
    color: isCyber ? "#E0E8FF" : "#1A1A1A",
  };

  const parsedSkills = useMemo(() => {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }, [skills]);

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto space-y-10 pb-20">

        {/* ── TOP: FULL-WIDTH PROFILE CONTROL WORKSPACE BANNER ── */}
        <motion.div
          className="p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #0A0F2C, rgba(0,245,255,0.06))"
              : "linear-gradient(135deg, #FFF9C4, #FFFFFF)",
            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "3px solid #000000",
            boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.15)" : "6px 6px 0 rgba(0,0,0,1)",
          }}
        >
          {isCyber && <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F5FF]" />}

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl">👤</span>
              <h1
                className="font-black text-2xl md:text-3xl tracking-wide uppercase"
                style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#1A1A1A" }}
              >
                Profile Customizer
              </h1>
              <span
                className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFE600",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  color: isCyber ? "#00F5FF" : "#000000",
                }}
              >
                Command Center Workspace
              </span>
            </div>
            <p className="text-xs md:text-sm theme-text-secondary font-medium max-w-3xl">
              Identity Workspace • Appearance • Activity & RPG • Personalization • Security & Connected Accounts.
            </p>

            {/* Status Pills Strip */}
            <div className="flex items-center gap-3 pt-1 flex-wrap text-[11px] font-mono">
              <span className="flex items-center gap-1.5 opacity-80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Persona: <strong>{name || "Personal User"}</strong></span>
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5 opacity-80">
                <span>Account: <strong>{accountInfo?.username || "Local Sandbox"}</strong></span>
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5 opacity-80">
                <span>Shield: <strong>{contentLock.enabled ? "🔒 Protected" : "🔓 Unprotected"}</strong></span>
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5 opacity-80">
                <span>Theme: <strong>{isCyber ? "Cyberpunk" : "Neo-Brutalism"}</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
                boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.2)" : "3px 3px 0 #000000",
              }}
            >
              <span>👁️</span>
              <span>Preview Landing</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                color: isCyber ? "#050816" : "#FFFFFF",
                border: isCyber ? "none" : "2px solid #000000",
                boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.4)" : "4px 4px 0px 0px #000000",
              }}
            >
              <span>💾</span>
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </motion.div>

        {/* ── MAIN SETTINGS FORM WRAPPER ── */}
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ══════════════════════════════════════════════════════════════════
              ZONE 1: IDENTITY WORKSPACE (FIRST MAJOR FUNCTIONAL ZONE)
              Combines Live Profile Preview + Core Profile Details in one wide zone
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  <span>🪪</span>
                  <span>Zone 1 — Identity Workspace</span>
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  Visual persona anchor, live card preview, and authoritative personal details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT: LIVE PROFILE PREVIEW & PHOTO ENGINE (lg:col-span-5) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👁️</span>
                      <h3 className="text-xs font-black uppercase tracking-widest theme-text-primary">
                        Live Profile Preview
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      Interactive 3D Tilt
                    </span>
                  </div>

                  {/* Render Live Reactive ProfileCard */}
                  <div className="w-full flex justify-center py-2">
                    <div className="w-full max-w-sm sm:max-w-md">
                      <ProfileCard draftProfile={draftProfile} />
                    </div>
                  </div>

                  {/* Avatar Source & Controls (Directly adjacent to Preview) */}
                  <div className="mt-6 pt-5 border-t space-y-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary flex items-center gap-1.5">
                        <span>🖼️</span> Avatar Picture Source
                      </label>

                      {/* Source Toggle Tabs */}
                      <div
                        className="flex gap-1 p-0.5 rounded-lg border text-xs font-black"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#E5E7EB",
                          borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setImageSource("upload")}
                          className="px-2.5 py-1 rounded transition-colors text-[11px]"
                          style={{
                            backgroundColor: imageSource === "upload"
                              ? (isCyber ? "#00F5FF" : "#FFFFFF")
                              : "transparent",
                            color: imageSource === "upload"
                              ? (isCyber ? "#050816" : "#000000")
                              : (isCyber ? "#94A3B8" : "#4B5563"),
                          }}
                        >
                          📁 Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSource("url")}
                          className="px-2.5 py-1 rounded transition-colors text-[11px]"
                          style={{
                            backgroundColor: imageSource === "url"
                              ? (isCyber ? "#00F5FF" : "#FFFFFF")
                              : "transparent",
                            color: imageSource === "url"
                              ? (isCyber ? "#050816" : "#000000")
                              : (isCyber ? "#94A3B8" : "#4B5563"),
                          }}
                        >
                          🔗 URL
                        </button>
                      </div>
                    </div>

                    {imageSource === "url" ? (
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className={inputClass}
                        style={inputStyle}
                      />
                    ) : (
                      <div className="flex gap-2 items-center flex-wrap">
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
                          className="px-3.5 py-2 text-xs font-black rounded-lg border transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                            borderColor: isCyber ? "#00F5FF" : "#9CA3AF",
                            color: isCyber ? "#00F5FF" : "#374151",
                          }}
                        >
                          📁 {isUploading ? "Uploading..." : "Upload & Crop Avatar"}
                        </button>
                        {avatar && (
                          <button
                            type="button"
                            onClick={() => setAvatar("")}
                            className="text-xs text-red-500 font-bold hover:underline px-2 py-1 cursor-pointer"
                          >
                            Remove Avatar
                          </button>
                        )}
                      </div>
                    )}

                    {/* Past Avatar Library */}
                    {profileHistory && profileHistory.filter(h => h.assetType === "avatar").length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-black uppercase tracking-wider theme-text-muted mb-2 block">
                          Past Avatar History (Click to Restore)
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(new Set(profileHistory.filter(h => h.assetType === "avatar").map(h => h.url))).slice(0, 6).map((url, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                confirm({
                                  title: "Restore Profile Picture",
                                  message: "Do you want to set this past avatar as your active profile picture?",
                                  confirmText: "Restore Picture",
                                  variant: "info",
                                  actionType: "restore",
                                  itemPreview: {
                                    title: "Past Profile Picture",
                                    imageUrl: url,
                                    icon: "🖼️",
                                  },
                                  successToast: "✓ Profile picture restored!",
                                  onConfirm: async () => {
                                    setAvatar(url);
                                    await updateProfile({ ...profile, avatar: url });
                                  },
                                });
                              }}
                              className="w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-110 active:scale-95 relative group"
                              style={{ borderColor: avatar === url ? (isCyber ? "#00F5FF" : "#FF6B35") : "transparent" }}
                              title="Restore past avatar"
                            >
                              <img src={url} alt="past avatar" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: CORE PROFILE DETAILS (lg:col-span-7) */}
              <div className="lg:col-span-7 xl:col-span-7">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="border-b pb-3 mb-6" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                      <span>📝</span> Core Profile Details
                    </h3>
                    <p className="text-xs font-mono theme-text-muted mt-0.5">
                      Configure your name, status, bio description, identity attributes, and frame styling.
                    </p>
                  </div>

                  {/* Clean Form Grid Without Nested Boxes */}
                  <div className="space-y-5">
                    {/* Row 1: Name & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Nelvin, Mitsune"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Status Tier
                        </label>
                        <CustomSelect
                          value={status}
                          onChange={(val) => setStatus(val as any)}
                          options={[
                            { value: "online", label: "Online", icon: "🟢" },
                            { value: "away", label: "Away", icon: "🟡" },
                            { value: "busy", label: "Busy", icon: "🔴" },
                            { value: "offline", label: "Offline", icon: "⚪" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Row 2: Tagline & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Persona Tagline
                        </label>
                        <input
                          type="text"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="e.g. Full-Stack Architect & Martial Arts Practitioner"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Location / Base
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Neo-Tokyo, Cyberspace / Jakarta"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Row 3: Bio Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                        Biography & Manifesto
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Write a concise personal bio, mission statement, or philosophy..."
                        className={inputClass + " resize-none"}
                        style={inputStyle}
                      />
                    </div>

                    {/* Row 4: Identity Trio (Phone, MBTI, Zodiac) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+62 812-3456-7890"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          MBTI Archetype
                        </label>
                        <CustomSelect
                          value={mbti}
                          onChange={(val) => setMbti(val)}
                          options={[
                            { value: "", label: "Select MBTI..." },
                            ...["INTJ", "ENTJ", "INFJ", "ENFJ", "INFP", "ENFP", "INTP", "ENTP", "ISTJ", "ESTJ", "ISFJ", "ESFJ", "ISTP", "ESTP", "ISFP", "ESFP"].map(t => ({ value: t, label: t }))
                          ]}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Zodiac Constellation
                        </label>
                        <CustomSelect
                          value={zodiac}
                          onChange={(val) => setZodiac(val)}
                          options={[
                            { value: "", label: "Select Zodiac..." },
                            ...[
                              { name: "Aries", symbol: "♈" },
                              { name: "Taurus", symbol: "♉" },
                              { name: "Gemini", symbol: "♊" },
                              { name: "Cancer", symbol: "♋" },
                              { name: "Leo", symbol: "♌" },
                              { name: "Virgo", symbol: "♍" },
                              { name: "Libra", symbol: "♎" },
                              { name: "Scorpio", symbol: "♏" },
                              { name: "Sagittarius", symbol: "♐" },
                              { name: "Capricorn", symbol: "♑" },
                              { name: "Aquarius", symbol: "♒" },
                              { name: "Pisces", symbol: "♓" }
                            ].map(z => ({ value: z.name, label: z.name, icon: z.symbol }))
                          ]}
                        />
                      </div>
                    </div>

                    {/* Row 5: Custom Profile Border Style Selector */}
                    <div className="pt-2">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary mb-2.5 block">
                        Custom Card Frame & Border Style
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        {Object.entries(BORDER_CONFIGS).map(([key, config]) => {
                          const isSelected = borderStyle === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setBorderStyle(key)}
                              className="p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5"
                              style={{
                                backgroundColor: isSelected
                                  ? (isCyber ? "rgba(0,245,255,0.12)" : "rgba(255,107,53,0.1)")
                                  : (isCyber ? "rgba(255,255,255,0.02)" : "#F9FAFB"),
                                borderColor: isSelected
                                  ? (isCyber ? "#00F5FF" : "#FF6B35")
                                  : (isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB"),
                                borderWidth: isSelected ? "2px" : "1px",
                              }}
                            >
                              <div
                                className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                                style={{
                                  borderColor: isSelected ? (isCyber ? "#00F5FF" : "#FF6B35") : "#9CA3AF",
                                }}
                              >
                                {isSelected && (
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35" }}
                                  />
                                )}
                              </div>
                              <span className="text-xs font-black uppercase tracking-wider truncate">
                                {config.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              ZONE 2: ACTIVITY / RPG & APPEARANCE (SECOND MAJOR ROW)
              Balanced 2-column grid utilizing desktop width with zero cramming
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  <span>⚡</span>
                  <span>Zone 2 — Activity, RPG & Appearance</span>
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  Live progression statistics, dynamic activity feeds, and system visual theme controls.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT: ACTIVITY & GAMIFIED RPG STATS (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                      <span>🎮</span> RPG Progression & Live Activity
                    </h3>
                    <p className="text-xs font-mono theme-text-muted mt-0.5">
                      Combat level, resource vitality bars, and real-time listening/coding feeds.
                    </p>
                  </div>

                  {/* Embed GamifiedStatsWidget with expansive full width */}
                  <div className="w-full">
                    <GamifiedStatsWidget />
                  </div>
                </div>
              </div>

              {/* RIGHT: APPEARANCE & THEME CUSTOMIZATION (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                          <span>🎨</span> Appearance & Visual Themes
                        </h3>
                        <p className="text-xs font-mono theme-text-muted mt-0.5">
                          Ambiance intensity, background animation engine, and accent palettes.
                        </p>
                      </div>

                      {/* Theme Toggle Button */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="px-3 py-1.5 text-xs font-black rounded-lg border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                          borderColor: isCyber ? "#00F5FF" : "#000000",
                          color: isCyber ? "#00F5FF" : "#000000",
                        }}
                      >
                        <span>{isCyber ? "⚡ Cyberpunk" : "🧱 Neo-Brutal"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hero Intensity Style */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Hero Intensity Style
                        </label>
                        <CustomSelect
                          value={heroStyle}
                          onChange={(val) => setHeroStyle(val as any)}
                          options={[
                            { value: "cinematic", label: "Cinematic (Particle Matrix)", icon: "🌌" },
                            { value: "ambient", label: "Ambient (Soft Glow)", icon: "✨" },
                            { value: "minimal", label: "Minimal (Clean Archive)", icon: "📄" },
                          ]}
                        />
                      </div>

                      {/* Background Animation Style */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                          Background Animation
                        </label>
                        <CustomSelect
                          value={landingBgStyle}
                          onChange={(val) => setLandingBgStyle(val as any)}
                          options={[
                            { value: "matrix", label: "Matrix Neon Particles", icon: "⚡" },
                            { value: "nebula", label: "Nebula Atmosphere", icon: "🔮" },
                            { value: "grid", label: "Grid Drift Pattern", icon: "🌐" },
                            { value: "minimal", label: "Minimalist Solid", icon: "⚪" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Accent Color Customizer */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                        Custom Palette Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={landingAccentColor}
                          onChange={(e) => setLandingAccentColor(e.target.value)}
                          className="w-11 h-11 rounded-xl cursor-pointer border-2 bg-transparent shrink-0"
                          style={{ borderColor: isCyber ? "#00F5FF" : "#000000" }}
                        />
                        <input
                          type="text"
                          value={landingAccentColor}
                          onChange={(e) => setLandingAccentColor(e.target.value)}
                          placeholder="#00F5FF"
                          className={inputClass + " font-mono"}
                          style={inputStyle}
                        />
                        {/* Swatch Pill */}
                        <div
                          className="px-4 py-2 rounded-xl border text-xs font-mono font-bold shrink-0 shadow-sm"
                          style={{
                            backgroundColor: landingAccentColor,
                            color: "#000000",
                            borderColor: "#000000",
                          }}
                        >
                          Preview Swatch
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              ZONE 3: PERSONALIZATION & LANDING SHOWCASE (THIRD MAJOR ROW)
              Expansive full-width section with internal groupings
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  <span>🌐</span>
                  <span>Zone 3 — Personalization & Showcase</span>
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  World identity branding, access modes, public visibility flags, and featured showcase catalog.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  color: isCyber ? "#00F5FF" : "#000000",
                }}
              >
                <span>👁️</span>
                <span>Open Preview</span>
              </button>
            </div>

            <div className={zoneCardClass} style={zoneCardStyle}>
              <div className="space-y-6">

                {/* Subgroup A: World Identity & Access */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}>
                    <span>🏷️</span> World Identity & Access Routing
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                        Personal World Name
                      </label>
                      <input
                        type="text"
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        placeholder={`e.g. ${name || "Personal"}'s Sanctuary, Elysium`}
                        className={inputClass}
                        style={inputStyle}
                      />
                      <span className="text-[10px] font-mono opacity-60">
                        Greeting header displays as: <strong className="text-cyan-400">{dashboardName.trim() || `${name || "Personal"}'s World`}</strong>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                        Landing Page Access Mode
                      </label>
                      <CustomSelect
                        value={landingMode}
                        onChange={(val) => setLandingMode(val as any)}
                        options={[
                          { value: "enabled", label: "Always show landing page (Recommended)", icon: "🟢" },
                          { value: "disabled", label: "Skip landing page when authenticated", icon: "⚡" },
                          { value: "preview", label: "Direct dashboard access (Bypass intro)", icon: "🔴" },
                        ]}
                      />
                      <span className="text-[10px] font-mono opacity-60">
                        Governs whether the guest showcase page displays on first application launch.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subgroup B: Public Visibility & Privacy */}
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}>
                    <span>🔒</span> Public Visibility & Privacy Controls
                  </h3>
                  <div className="p-4 rounded-xl border bg-black/10 dark:bg-white/5 space-y-3 font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPublicStats}
                          onChange={(e) => setShowPublicStats(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 cursor-pointer"
                        />
                        <span className="font-semibold">Show Public Stats Counters</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAboutSection}
                          onChange={(e) => setShowAboutSection(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 cursor-pointer"
                        />
                        <span className="font-semibold">Show About World Section</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSocialLinks}
                          onChange={(e) => setShowSocialLinks(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 cursor-pointer"
                        />
                        <span className="font-semibold">Show Public Social Links</span>
                      </label>
                    </div>
                  </div>

                  {showAboutSection && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                        About World Custom Description
                      </label>
                      <textarea
                        value={aboutWorldText}
                        onChange={(e) => setAboutWorldText(e.target.value)}
                        rows={3}
                        placeholder="Enter custom description or narrative introduction for your public digital world..."
                        className={inputClass + " resize-none"}
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>

                {/* Subgroup C: Showcase Modules Catalog */}
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}>
                      <span>🗂️</span> Showcase Modules Catalog
                    </h3>
                    <span className="text-[11px] font-mono opacity-60">
                      {visibleFeatures.length} of {LANDING_MODULE_CATALOG.length} active modules
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    {LANDING_MODULE_CATALOG.map((feat) => {
                      const isChecked = visibleFeatures.includes(feat.id);
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeatureSelect(feat.id)}
                          className="p-3.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-98"
                          style={{
                            backgroundColor: isChecked
                              ? (isCyber ? "rgba(0,245,255,0.14)" : "#FFE600")
                              : (isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF"),
                            borderColor: isChecked
                              ? (isCyber ? "#00F5FF" : "#000000")
                              : (isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB"),
                            color: isChecked
                              ? (isCyber ? "#00F5FF" : "#000000")
                              : (isCyber ? "#94A3B8" : "#4B5563"),
                            boxShadow: isChecked && !isCyber ? "2px 2px 0 #000000" : "none",
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0">{feat.iconEmoji}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-xs truncate">{feat.title}</span>
                              <span className="text-[9px] opacity-60 uppercase">{feat.category}</span>
                            </div>
                          </div>
                          <span className="font-black text-sm shrink-0 ml-2">
                            {isChecked ? "✓" : "○"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              ZONE 4: ACCOUNT, AUTHENTICATION & CONTENT SECURITY (FOURTH ROW)
              Wide comfortable columns with proper readable width
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  <span>🔐</span>
                  <span>Zone 4 — Account & Security Matrix</span>
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  Primary credentials, verified email address, session security, and Content Lock protection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT: ACCOUNT IDENTITY & VERIFICATION (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                        <span>👤</span> Account Credentials
                      </h3>
                      <p className="text-xs font-mono theme-text-muted mt-0.5">
                        Verified login credentials and authentication relink settings.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRelinkStep(accountInfo?.pendingRelink ? "verify" : "request");
                        setNewEmailInput(accountInfo?.pendingRelink?.newEmail || "");
                        setIsRelinkModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-black rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#FEF3C7",
                        border: isCyber ? "1px solid rgba(0, 245, 255, 0.4)" : "2px solid #000000",
                        color: isCyber ? "#00F5FF" : "#B45309",
                        boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
                      }}
                    >
                      <span>📧</span>
                      <span>{accountInfo?.pendingRelink ? "Verify Pending" : "Relink Email"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username Tile */}
                    <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                      <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
                        Account Username
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👤</span>
                        <span className="text-xs font-mono font-bold theme-text-primary">
                          {accountInfo?.username || "Local User"}
                        </span>
                        <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Primary
                        </span>
                      </div>
                    </div>

                    {/* Email Tile */}
                    <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                      <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
                        Verified Email Address
                      </label>
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm">✉️</span>
                        <span className="text-xs font-mono font-bold theme-text-primary truncate">
                          {accountInfo?.email || "sandbox@nexus.dev"}
                        </span>
                        <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold shrink-0">
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Relink Alert */}
                  {accountInfo?.pendingRelink && (
                    <div className="mt-4 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono" style={{ backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7", borderColor: isCyber ? "#F59E0B" : "#D97706" }}>
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">⏳</span>
                        <span>Pending relink to <strong>{accountInfo.pendingRelink.newEmail}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRelinkStep("verify");
                            setIsRelinkModalOpen(true);
                          }}
                          className="text-[10px] font-black px-2.5 py-1 rounded bg-amber-500 text-black hover:brightness-110 cursor-pointer"
                        >
                          Enter OTP
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRelink}
                          className="text-[10px] font-black opacity-60 hover:opacity-100 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Account Logout / Session Termination */}
                  <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider theme-text-primary">
                        Session Termination
                      </h4>
                      <p className="text-[11px] font-mono theme-text-muted">
                        Securely log out of this browser session.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        confirm({
                          title: "Account Logout",
                          message: "Are you sure you want to sign out of Nexus Xenon?",
                          confirmText: "Log Out",
                          cancelText: "Stay Signed In",
                          variant: "warning",
                          actionType: "logout",
                          itemPreview: {
                            title: "Personal Dashboard Session",
                            subtitle: profile.name ? `User: ${profile.name}` : "Nexus Xenon Command Center",
                            imageUrl: avatar,
                            icon: "🚪",
                          },
                          successToast: "✓ Logged out successfully.",
                          onConfirm: async () => {
                            try {
                              useDashboardStore.getState().resetUserStore();
                              document.cookie = "is_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                              localStorage.removeItem("is_guest");
                              const { createClient } = await import("@/utils/supabase/client");
                              const supabase = createClient();
                              await supabase.auth.signOut();
                            } catch (err) {
                              console.error(err);
                            }
                            window.location.href = "/login";
                          },
                        });
                      }}
                      className="px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      style={{
                        backgroundColor: isCyber ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
                        border: isCyber ? "1px solid rgba(239, 68, 68, 0.4)" : "2px solid #000000",
                        color: isCyber ? "#EF4444" : "#991B1B",
                        boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
                      }}
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: CONTENT SECURITY & LOCKS (lg:col-span-6) */}
              <div className="lg:col-span-6 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  {/* Embedded ContentLockSettingsCard with no double borders */}
                  <ContentLockSettingsCard embedded={true} />
                </div>
              </div>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              ZONE 5: SOCIAL PRESENCE & STACK / SKILLS (FIFTH ROW)
              Balanced 2-column workspace for professional and public links
             ══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  <span>🌐</span>
                  <span>Zone 5 — Social Presence & Skills Matrix</span>
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  Professional tech stack chips, badges, and linked public social platforms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* LEFT: TECH STACK & SKILLS (lg:col-span-5) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                      <span>💻</span> Tech Stack & Skills
                    </h3>
                    <p className="text-xs font-mono theme-text-muted mt-0.5">
                      Comma-separated list converted automatically into interactive badge buttons.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Next.js, TypeScript, TailwindCSS, Rust, PostgreSQL"
                      className={inputClass}
                      style={inputStyle}
                    />

                    {/* Live Badges Preview */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-2">
                        Rendered Badge Preview:
                      </span>
                      {parsedSkills.length === 0 ? (
                        <p className="text-xs theme-text-muted italic">Type skills above to view live badges.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {parsedSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border shadow-sm transition-all hover:scale-105"
                              style={{
                                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFE600",
                                borderColor: isCyber ? "#00F5FF" : "#000000",
                                color: isCyber ? "#00F5FF" : "#000000",
                                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000000",
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: SOCIAL ACCOUNTS & LINKS (lg:col-span-7) */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                <div className={zoneCardClass} style={zoneCardStyle}>
                  <div className="flex justify-between items-center border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                        <span>🌐</span> Social Accounts & External Links
                      </h3>
                      <p className="text-xs font-mono theme-text-muted mt-0.5">
                        Manage linked platform handles and direct URLs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addSocialRow}
                      className="px-3 py-1.5 text-xs font-mono font-black rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                        borderColor: isCyber ? "#00F5FF" : "#000000",
                        color: isCyber ? "#00F5FF" : "#000000",
                      }}
                    >
                      <span>➕</span>
                      <span>Add Platform</span>
                    </button>
                  </div>

                  {socials.length === 0 ? (
                    <div className="py-6 text-center text-xs theme-text-muted italic border rounded-xl" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                      No social links configured yet. Click "Add Platform" to connect your accounts.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socials.map((soc, index) => (
                        <div
                          key={index}
                          className="p-2.5 rounded-xl border flex gap-2 items-center flex-wrap sm:flex-nowrap"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F9FAFB",
                            borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB",
                          }}
                        >
                          {/* Platform Select */}
                          <select
                            value={soc.platform}
                            onChange={(e) => handleSocialChange(index, "platform", e.target.value)}
                            className="px-2.5 py-2 text-xs font-semibold rounded-lg border w-full sm:w-1/4 outline-none"
                            style={inputStyle}
                          >
                            {PLATFORMS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>

                          {/* Handle Input */}
                          <input
                            type="text"
                            required
                            value={soc.handle}
                            onChange={(e) => handleSocialChange(index, "handle", e.target.value)}
                            placeholder="@yourhandle"
                            className="px-3 py-2 text-xs font-semibold rounded-lg border w-full sm:w-1/3 outline-none"
                            style={inputStyle}
                          />

                          {/* URL Input */}
                          <input
                            type="url"
                            value={soc.url || ""}
                            onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                            placeholder="https://..."
                            className="px-3 py-2 text-xs font-semibold rounded-lg border w-full sm:w-2/5 outline-none"
                            style={inputStyle}
                          />

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => removeSocialRow(index)}
                            className="p-2 text-xs text-red-500 rounded-lg hover:bg-red-500/10 font-black shrink-0 cursor-pointer transition-colors"
                            title="Remove Link"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              STICKY / DOCKED BOTTOM SAVE ACTION BAR
             ══════════════════════════════════════════════════════════════════ */}
          <div
            className="sticky bottom-6 z-30 p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 shadow-2xl flex-wrap sm:flex-nowrap"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.9)" : "rgba(255, 255, 255, 0.95)",
              borderColor: isCyber ? "#00F5FF" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber
                ? "0 10px 40px rgba(0, 245, 255, 0.25), 0 0 20px rgba(0, 0, 0, 0.8)"
                : "6px 6px 0px #000000",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💾</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider theme-text-primary">
                  Ready to Apply Changes?
                </p>
                <p className="text-[11px] font-mono theme-text-muted">
                  Saves all 5 zones (Identity, Appearance, Activity, Personalization, Security, Socials).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                  borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#D1D5DB",
                  color: isCyber ? "#E0E8FF" : "#374151",
                }}
              >
                👁️ Preview Landing
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-6 py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg flex items-center gap-2"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFFFFF",
                  border: isCyber ? "none" : "2.5px solid #000000",
                  boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.4)" : "4px 4px 0px 0px #000000",
                }}
              >
                <span>💾</span>
                <span>{isSaving ? "Saving Configuration..." : "Save All Profile Settings"}</span>
              </button>
            </div>
          </div>

        </form>

        {/* ── MODALS (Crop, Landing Preview, Relink Email) ── */}
        <ImageCropModal
          isOpen={isCropOpen}
          imageSrc={cropImageSrc}
          aspect={1}
          title="Crop Profile Picture"
          onClose={() => {
            setIsCropOpen(false);
            setCropImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          onCropComplete={handleCropComplete}
        />

        <LandingPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          draftProfile={{
            ...profile,
            name,
            tagline,
            bio,
            avatar,
            location,
            borderStyle,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            socials,
            phoneNumber,
            mbti,
            zodiac,
            dashboardName: dashboardName.trim() || undefined,
            landingMode,
            heroStyle,
            showPublicStats,
            showAboutSection,
            showSocialLinks,
            aboutWorldText,
            landingBgStyle,
            landingAccentColor,
            visibleFeatures,
          }}
        />

        {/* Relink Email Modal */}
        {isRelinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl font-mono"
              style={{
                backgroundColor: isCyber ? "rgba(8,12,28,0.98)" : "#FFFDF0",
                borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                borderWidth: isCyber ? "1.5px" : "3px",
                boxShadow: isCyber
                  ? "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,245,255,0.2)"
                  : "6px 6px 0px #000000",
              }}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000" }}>
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  📧 {relinkStep === "request" ? "Relink Account Email" : "Verify Email OTP Code"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRelinkModalOpen(false)}
                  className="text-xs font-black opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {relinkStep === "request" ? (
                <form onSubmit={handleInitiateRelink} className="space-y-4">
                  <p className="text-xs opacity-75 leading-relaxed">
                    Enter your target new email address and confirm your current password to request a 2-step verification code.
                  </p>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1 theme-text-secondary">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="new.email@domain.com"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1 theme-text-secondary">
                      Current Account Password (Reauthentication)
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRelinkModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold rounded-lg border opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRelinkLoading}
                      className="px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer"
                      style={{
                        backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                        color: isCyber ? "#050816" : "#FFFFFF",
                        border: isCyber ? "none" : "2px solid #000",
                        boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                      }}
                    >
                      {isRelinkLoading ? "Dispatching Code..." : "Send Verification Code →"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyRelink} className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                    <p className="font-bold">✉️ Verification Code Dispatched</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Enter the 6-digit code sent to <strong>{newEmailInput || accountInfo?.pendingRelink?.newEmail}</strong> within 15 minutes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1 theme-text-secondary">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCodeInput}
                      onChange={(e) => setOtpCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="123456"
                      className={inputClass + " text-center text-lg tracking-[0.3em] font-mono"}
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleCancelRelink}
                      className="text-xs text-red-400 hover:underline font-bold cursor-pointer"
                    >
                      Cancel Relink Request
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRelinkStep("request")}
                        className="px-3 py-2 text-xs font-bold rounded-lg border opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isRelinkLoading || otpCodeInput.length < 6}
                        className="px-4 py-2 text-xs font-black rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        style={{
                          backgroundColor: isCyber ? "#00F5FF" : "#10B981",
                          color: isCyber ? "#050816" : "#FFFFFF",
                          border: isCyber ? "none" : "2px solid #000",
                          boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                        }}
                      >
                        {isRelinkLoading ? "Verifying..." : "Verify & Complete Relink ✓"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
