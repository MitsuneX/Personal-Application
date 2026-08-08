"use client";

import React, { useState, useEffect, useRef } from "react";
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

const PLATFORMS = ["GitHub", "Twitter/X", "Discord", "Instagram", "LinkedIn", "Tiktok"];
const ALL_MODULE_FEATURES = [
  { id: "game-database", label: "Game Database" },
  { id: "game-characters", label: "Game Characters" },
  { id: "hall-of-fame", label: "Hall of Fame" },
  { id: "music", label: "Music Vault" },
  { id: "media", label: "Drama, Anime & Tokusatsu" },
  { id: "ai-library", label: "AI Prompt Library" },
  { id: "hobbies", label: "Hobbies & Creative Log" },
  { id: "emergency", label: "Emergency Hub" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile, updateProfile, profileHistory } = useDashboardStore();
  const { confirm } = useConfirm();
  const toast = useToast();

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("online");
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

  const inputClass = `w-full px-3 py-2 text-sm font-semibold rounded-lg outline-none border focus:ring-2 transition-all duration-200`;
  const inputStyle = {
    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF",
    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
    color: isCyber ? "#E0E8FF" : "#1A1A1A",
  };

  return (
    <AppShell>
      {/* Page Title Header */}
      <motion.div
        className="mb-8 p-6 md:p-8 rounded-2xl border-adaptive-unique relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #0A0F2C, rgba(0,245,255,0.04))"
            : "linear-gradient(135deg, #FFF9C4, #FFF)",
          border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "3px solid #000000",
          boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
        }}
      >
        {isCyber && <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F5FF]" />}
        <h1
          className="font-black text-2xl md:text-4xl mb-1 flex items-center gap-2"
          style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#1A1A1A" }}
        >
          👤 PROFILE CUSTOMIZER
        </h1>
        <p className="text-xs theme-text-secondary font-semibold">
          Fine-tune your personal card layout, upload custom pictures, set status tiers, and configure visual borders.
        </p>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Live Preview Card */}
        <div className="xl:col-span-2 space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted mb-2 flex items-center gap-1">
            <span>👁️</span> Live Card Preview
          </h3>
          <div className="w-full flex justify-center xl:justify-start">
            <div className="w-full max-w-md">
              <ProfileCard />
            </div>
          </div>
          <div className="w-full max-w-md">
            <GamifiedStatsWidget />
          </div>

          {/* Account Session / Log Out Section */}
          <div className="w-full max-w-md">
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <h2 className="text-base font-black uppercase tracking-wider mb-2" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                🚪 Account Session
              </h2>
              <p className="text-xs theme-text-secondary font-medium mb-4">
                Sign out of your personal dashboard session securely.
              </p>
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
                className="w-full py-3 px-4 text-xs font-black rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isCyber ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
                  border: isCyber ? "1px solid rgba(239, 68, 68, 0.4)" : "2px solid #000000",
                  color: isCyber ? "#EF4444" : "#991B1B",
                  boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
                }}
              >
                🚪 Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Form */}
        <div className="xl:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 0. Account & Security Subsection */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    🔒 Account & Security Settings
                  </h2>
                  <p className="text-xs font-mono theme-text-muted mt-0.5">
                    Manage your primary identity credentials, verified email address, and authentication preferences.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRelinkStep(accountInfo?.pendingRelink ? "verify" : "request");
                    setNewEmailInput(accountInfo?.pendingRelink?.newEmail || "");
                    setIsRelinkModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#FEF3C7",
                    border: isCyber ? "1px solid rgba(0, 245, 255, 0.4)" : "2px solid #000000",
                    color: isCyber ? "#00F5FF" : "#B45309",
                    boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
                  }}
                >
                  <span>📧</span>
                  <span>{accountInfo?.pendingRelink ? "Verify Pending Email" : "Relink Email Address"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Username */}
                <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                  <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
                    Account Username
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👤</span>
                    <span className="text-xs font-mono font-bold theme-text-primary">
                      {accountInfo?.username || "Loading..."}
                    </span>
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Primary
                    </span>
                  </div>
                </div>

                {/* Verified Account Email */}
                <div className="p-3.5 rounded-xl border flex flex-col gap-1" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
                  <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
                    Verified Email Address
                  </label>
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">✉️</span>
                    <span className="text-xs font-mono font-bold theme-text-primary truncate">
                      {accountInfo?.email || "Loading..."}
                    </span>
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold shrink-0">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Relink Banner if active */}
              {accountInfo?.pendingRelink && (
                <div className="mt-4 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono" style={{ backgroundColor: isCyber ? "rgba(245,158,11,0.1)" : "#FEF3C7", borderColor: isCyber ? "#F59E0B" : "#D97706" }}>
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">⏳</span>
                    <span>
                      Pending relink to <strong>{accountInfo.pendingRelink.newEmail}</strong>
                    </span>
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
                      Enter Code
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
            </div>

            {/* 1. Core Profile Details Card */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <h2 className="text-base font-black uppercase tracking-wider mb-4" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                📝 Core Profile Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Status Tier</label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val)}
                    options={[
                      { value: "online", label: "Online", icon: "🟢" },
                      { value: "away", label: "Away", icon: "🟡" },
                      { value: "busy", label: "Busy", icon: "🔴" },
                      { value: "offline", label: "Offline", icon: "⚪" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Bio Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className={inputClass + " resize-none"}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +62 812-3456-7890"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">MBTI Type</label>
                  <CustomSelect
                    value={mbti}
                    onChange={(val) => setMbti(val)}
                    options={[
                      { value: "", label: "Select MBTI..." },
                      ...["INTJ", "ENTJ", "INFJ", "ENFJ", "INFP", "ENFP", "INTP", "ENTP", "ISTJ", "ESTJ", "ISFJ", "ESFJ", "ISTP", "ESTP", "ISFP", "ESFP"].map(t => ({ value: t, label: t }))
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Zodiac Sign</label>
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
            </div>

            {/* 2. Avatar & Custom Borders Customization */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <h2 className="text-base font-black uppercase tracking-wider mb-4" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                🎨 Avatar & Border Styling
              </h2>

              {/* Profile Picture Upload/URL */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                  Profile Picture Source
                </label>
                <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black text-lg border-2"
                    style={{
                      borderColor: isCyber ? "#00F5FF" : "#000",
                      backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F0F0F0",
                    }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: isCyber ? "#00F5FF" : "#999" }}>
                        {name ? name.charAt(0).toUpperCase() : "?"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-3 w-full">
                    {/* Source Tab Toggle */}
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

                    {/* Conditional Input Rendering */}
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
                          className="px-3 py-1.5 text-xs font-black rounded border transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E5E7EB",
                            borderColor: isCyber ? "#00F5FF" : "#9CA3AF",
                            color: isCyber ? "#00F5FF" : "#374151",
                          }}
                        >
                          📁 {isUploading ? "Uploading..." : "Upload Profile Picture"}
                        </button>
                        {avatar && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] opacity-60 truncate max-w-[150px]">
                              {avatar.replace("/uploads/", "")}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAvatar("")}
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

              {/* Borders styles chooser */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Custom Profile Border Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(BORDER_CONFIGS).map(([key, config]) => {
                    const isSelected = borderStyle === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setBorderStyle(key)}
                        className="p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center gap-3"
                        style={{
                          backgroundColor: isSelected
                            ? (isCyber ? "rgba(0,245,255,0.08)" : "rgba(255,107,53,0.06)")
                            : (isCyber ? "rgba(255,255,255,0.02)" : "#FDFDFD"),
                          borderColor: isSelected
                            ? (isCyber ? "#00F5FF" : "#FF6B35")
                            : (isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB"),
                          borderWidth: isSelected ? "2px" : "1px",
                        }}
                      >
                        {/* Bullet Selector */}
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{
                            borderColor: isSelected ? (isCyber ? "#00F5FF" : "#FF6B35") : "#9CA3AF",
                          }}
                        >
                          {isSelected && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35" }}
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">{config.name}</p>
                          <p className="text-[10px] opacity-60">Apply custom borders and frames</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Profile Pictures Library / History */}
              {profileHistory && profileHistory.filter(h => h.assetType === "avatar").length > 0 && (
                <div className="mt-6 pt-6 border-t border-adaptive-unique">
                  <h3 className="text-xs font-black uppercase tracking-wider theme-text-secondary mb-3 flex items-center gap-1.5">
                    <span>⏳</span> Past Profile Pictures
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {Array.from(new Set(profileHistory.filter(h => h.assetType === "avatar").map(h => h.url))).map((url, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          confirm({
                            title: "Restore Profile Picture",
                            message: "Do you want to set this past avatar image as your active profile picture?",
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
                        className="w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.08] active:scale-95 relative group"
                        style={{ borderColor: avatar === url ? (isCyber ? "#00F5FF" : "#FF6B35") : "transparent" }}
                      >
                        <img src={url} alt="past avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] text-white font-bold">Restore</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tech Stack & Skills Editor */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <h2 className="text-base font-black uppercase tracking-wider mb-4" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                💻 Stack / Skills Configuration
              </h2>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Skills (comma separated values)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Next.js, Rust, TailwindCSS, PostgreSQL"
                  className={inputClass}
                  style={inputStyle}
                />
                <span className="text-[10px] opacity-50 mt-1">Comma-separated entries are converted into modern badge buttons.</span>
              </div>
            </div>

            {/* 4. Social Handles Dynamic Editor */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-black uppercase tracking-wider" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                  🌐 Social Accounts & Links
                </h2>
                <button
                  type="button"
                  onClick={addSocialRow}
                  className="px-2.5 py-1 text-[10px] font-black rounded border border-adaptive-unique hover:bg-black/5"
                >
                  ➕ Add Platform
                </button>
              </div>

              {socials.length === 0 ? (
                <p className="text-xs theme-text-muted italic py-2">No social links configured yet.</p>
              ) : (
                <div className="space-y-3">
                  {socials.map((soc, index) => (
                    <div key={index} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
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
                        placeholder="e.g. @yourhandle"
                        className="px-3 py-2 text-xs font-semibold rounded-lg border w-full sm:w-1/3 outline-none"
                        style={inputStyle}
                      />

                      {/* URL Input */}
                      <input
                        type="url"
                        value={soc.url || ""}
                        onChange={(e) => handleSocialChange(index, "url", e.target.value)}
                        placeholder="Link URL (e.g., https://...)"
                        className="px-3 py-2 text-xs font-semibold rounded-lg border w-full sm:w-2/5 outline-none"
                        style={inputStyle}
                      />

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeSocialRow(index)}
                        className="p-2 text-xs text-red-500 rounded hover:bg-red-500/10 font-black shrink-0"
                        title="Remove Link"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. 🌐 Landing Page & Public Identity Customization */}
            <div
              className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                    🌐 Landing Page & Public Identity
                  </h2>
                  <p className="text-xs opacity-70 mt-0.5 font-mono">
                    Customize how your personal world appears to visitors on /welcome.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.2)" : "#FFE600",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "4px 4px 0 #000000",
                  }}
                >
                  👁️ Preview Landing Page
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* World Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    Dashboard World Name (Leave blank for fallback)
                  </label>
                  <input
                    type="text"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder={`e.g. ${name || "Mitsu"}'s World, Elysium, My Archive`}
                    className={inputClass}
                    style={inputStyle}
                  />
                  <span className="text-[10px] font-mono opacity-60">
                    Displays as: <strong className="text-cyan-400">{dashboardName.trim() || `${name || "Personal"}'s World`}</strong>
                  </span>
                </div>

                {/* Landing Mode */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    Landing Page Access Mode
                  </label>
                  <CustomSelect
                    value={landingMode}
                    onChange={(val) => setLandingMode(val as any)}
                    options={[
                      { value: "enabled", label: "Enabled (Public Intro Gate on /welcome)", icon: "🟢" },
                      { value: "disabled", label: "Disabled (Direct Auth/Dashboard Redirect)", icon: "🔴" },
                      { value: "preview", label: "Public Preview (Testing /welcome Only)", icon: "🧪" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Hero Style */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    Hero Intensity Style
                  </label>
                  <CustomSelect
                    value={heroStyle}
                    onChange={(val) => setHeroStyle(val as any)}
                    options={[
                      { value: "cinematic", label: "Cinematic (Particle Matrix Glow)", icon: "🌌" },
                      { value: "ambient", label: "Ambient (Soft Glow Accent)", icon: "✨" },
                      { value: "minimal", label: "Minimal (Clean Personal Archive)", icon: "📄" },
                    ]}
                  />
                </div>

                {/* Background Animation Style */}
                <div className="flex flex-col gap-1">
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

                {/* Accent Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    Custom Landing Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={landingAccentColor}
                      onChange={(e) => setLandingAccentColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={landingAccentColor}
                      onChange={(e) => setLandingAccentColor(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="p-4 rounded-xl border mb-4 bg-black/10 dark:bg-white/5 space-y-3 font-mono">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  🔒 Data Privacy Toggles (Off by Default)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPublicStats}
                      onChange={(e) => setShowPublicStats(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                    <span>Show Public Stats Counters</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAboutSection}
                      onChange={(e) => setShowAboutSection(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                    <span>Show About World Section</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSocialLinks}
                      onChange={(e) => setShowSocialLinks(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                    <span>Show Public Social Links</span>
                  </label>
                </div>
              </div>

              {/* About World Text */}
              {showAboutSection && (
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">
                    About World Custom Text
                  </label>
                  <textarea
                    value={aboutWorldText}
                    onChange={(e) => setAboutWorldText(e.target.value)}
                    rows={3}
                    placeholder="Enter custom description or bio for your digital sanctuary..."
                    className={inputClass + " resize-none"}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Visible Feature Module Allowlist */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider theme-text-secondary block">
                  Showcase Module Features (Allowlist Selection)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {ALL_MODULE_FEATURES.map((feat) => {
                    const isChecked = visibleFeatures.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeatureSelect(feat.id)}
                        className="p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all"
                        style={{
                          backgroundColor: isChecked
                            ? (isCyber ? "rgba(0,245,255,0.12)" : "#FFE600")
                            : (isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF"),
                          borderColor: isChecked
                            ? (isCyber ? "#00F5FF" : "#000000")
                            : (isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB"),
                          color: isChecked
                            ? (isCyber ? "#00F5FF" : "#000000")
                            : (isCyber ? "#94A3B8" : "#4B5563"),
                        }}
                      >
                        <span className="font-bold">{isChecked ? "✓" : "○"}</span>
                        <span className="font-bold text-[11px] truncate">{feat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions Submit Bar */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-6 py-3 text-sm font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFFFFF",
                  border: isCyber ? "none" : "3.5px solid #000000",
                  boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.4)" : "4px 4px 0px 0px rgba(0,0,0,1)",
                }}
              >
                {isSaving ? "Saving Settings..." : "💾 Update Profile & Landing Settings"}
              </button>
            </div>

          </form>
        </div>

      </div>

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
    </AppShell>
  );
}
