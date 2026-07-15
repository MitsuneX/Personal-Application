"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard, BORDER_CONFIGS } from "@/components/cards/ProfileCard";
import { GamifiedStatsWidget } from "@/components/cards/GamifiedStatsWidget";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";

const PLATFORMS = ["GitHub", "Twitter/X", "Discord", "Instagram", "LinkedIn", "Tiktok"];

export default function ProfilePage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile, updateProfile } = useDashboardStore();

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

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Auto-detect image source
    if (profile.avatar && profile.avatar.startsWith("/uploads/")) {
      setImageSource("upload");
    } else if (profile.avatar) {
      setImageSource("url");
    } else {
      setImageSource("upload");
    }
  }, [profile]);

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
        setAvatar(data.url);
        // Direct local save option
        await updateProfile({ ...profile, avatar: data.url });
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

  const handleSocialChange = (index: number, field: string, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const addSocialRow = () => {
    setSocials([...socials, { platform: "GitHub", handle: "", url: "" }]);
  };

  const removeSocialRow = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        tagline: tagline.trim(),
        location: location.trim(),
        bio: bio.trim(),
        status: status as any,
        avatar: avatar.trim(),
        borderStyle: borderStyle,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        socials: socials.filter((s) => s.handle.trim() !== ""),
        phoneNumber: phoneNumber.trim(),
        mbti: mbti,
        zodiac: zodiac,
      });
      alert("Profile configurations updated successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Failed to update profile settings.");
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
        </div>

        {/* Right Side: Configuration Form */}
        <div className="xl:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            
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
                          onChange={handleFileUpload}
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

            {/* Actions Submit Bar */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-6 py-3 text-sm font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFFFFF",
                  border: isCyber ? "none" : "3.5px solid #000000",
                  boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.4)" : "4px 4px 0px 0px rgba(0,0,0,1)",
                }}
              >
                {isSaving ? "Saving Settings..." : "💾 Update Profile Settings"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </AppShell>
  );
}
