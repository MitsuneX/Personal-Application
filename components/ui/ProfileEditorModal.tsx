"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditorModal({ isOpen, onClose }: ProfileEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile, updateProfile } = useDashboardStore();

  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [status, setStatus] = useState(profile.status);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        tagline,
        location,
        bio,
        status: status as any,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="w-full max-w-lg pointer-events-auto rounded-2xl overflow-hidden border-adaptive-unique p-6"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.95)" : "#FFFFFF",
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                border: isCyber ? "1px solid rgba(0,245,255,0.35)" : "3px solid #000000",
                boxShadow: isCyber 
                  ? "0 0 40px rgba(0,245,255,0.25), inset 0 0 20px rgba(0,245,255,0.05)"
                  : "6px 6px 0px 0px rgba(0,0,0,1)",
              }}
            >
              {/* Corner brackets for Cyber */}
              {isCyber && (
                <>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00F5FF]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#BF5FFF]" />
                </>
              )}

              {/* Header */}
              <div className="flex justify-between items-center mb-5 pb-3" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
                <h2 className="text-xl font-black font-mono tracking-wide" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
                  {isCyber ? "EDIT_PROFILE.CONFIG" : "Customise Profile"}
                </h2>
                <button onClick={onClose} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border focus:ring-1"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
                        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                        color: isCyber ? "#fff" : "#1a1a1a",
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border cursor-pointer"
                      style={{
                        backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFF9F0",
                        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                        color: isCyber ? "#fff" : "#1a1a1a",
                      }}
                    >
                      <option value="online">Online</option>
                      <option value="away">Away</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Tagline */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                      color: isCyber ? "#fff" : "#1a1a1a",
                    }}
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                      color: isCyber ? "#fff" : "#1a1a1a",
                    }}
                  />
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                      color: isCyber ? "#fff" : "#1a1a1a",
                    }}
                  />
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border resize-none"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                      color: isCyber ? "#fff" : "#1a1a1a",
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold rounded-lg border-2"
                    style={{
                      backgroundColor: isCyber ? "transparent" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                      color: isCyber ? "#94A3B8" : "#4A4A4A",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-black rounded-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                      color: isCyber ? "#050816" : "#FFFFFF",
                      border: isCyber ? "none" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0px 0px rgba(0,0,0,1)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Config"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
