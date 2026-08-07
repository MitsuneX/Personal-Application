"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { Compass, Edit3, Calendar, Sparkles, Smile, RotateCcw, Heart, Star, Check } from "lucide-react";

export interface DossierMyJourneyProps {
  startDate?: string;
  finishDate?: string;
  status?: string;
  favoriteEpisode?: string;
  favoriteCharacter?: string;
  emotionalEpisode?: string;
  mood?: string;
  personalScore?: number;
  wouldRewatch?: boolean;
  themeConfig: ThemeAccentConfig;
  onSaveJourney?: (updated: {
    startDate?: string;
    finishDate?: string;
    favoriteEpisode?: string;
    favoriteCharacter?: string;
    emotionalEpisode?: string;
    mood?: string;
    personalScore?: number;
    wouldRewatch?: boolean;
  }) => void;
}

export function DossierMyJourney({
  startDate = "",
  finishDate = "",
  status = "Watching",
  favoriteEpisode = "",
  favoriteCharacter = "",
  emotionalEpisode = "",
  mood = "",
  personalScore = 0,
  wouldRewatch = false,
  themeConfig,
  onSaveJourney,
}: DossierMyJourneyProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formStart, setFormStart] = useState(startDate);
  const [formFinish, setFormFinish] = useState(finishDate);
  const [formFavEp, setFormFavEp] = useState(favoriteEpisode);
  const [formFavChar, setFormFavChar] = useState(favoriteCharacter);
  const [formEmoEp, setFormEmoEp] = useState(emotionalEpisode);
  const [formMood, setFormMood] = useState(mood);
  const [formScore, setFormScore] = useState(personalScore);
  const [formRewatch, setFormRewatch] = useState(wouldRewatch);

  const handleSave = () => {
    onSaveJourney?.({
      startDate: formStart,
      finishDate: formFinish,
      favoriteEpisode: formFavEp,
      favoriteCharacter: formFavChar,
      emotionalEpisode: formEmoEp,
      mood: formMood,
      personalScore: Number(formScore),
      wouldRewatch: formRewatch,
    });
    setIsEditing(false);
  };

  const journeyItems = [
    { label: "Started Watching", value: startDate || "Not recorded", icon: Calendar },
    { label: "Finished Watching", value: finishDate || "In progress", icon: Calendar },
    { label: "Favorite Episode", value: favoriteEpisode || "N/A", icon: Sparkles },
    { label: "Favorite Character", value: favoriteCharacter || "N/A", icon: Heart },
    { label: "Most Emotional Episode", value: emotionalEpisode || "N/A", icon: Sparkles },
    { label: "Watching Mood", value: mood || "Hyped", icon: Smile },
    { label: "Personal Score", value: `${personalScore} / 10`, icon: Star },
    { label: "Would Rewatch", value: wouldRewatch ? "Yes, Absolutely! ✨" : "One-time watch", icon: RotateCcw },
  ];

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.85)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}40` : "#000000",
        boxShadow: isCyber
          ? `0 0 30px ${themeConfig.glowColor}, inset 0 0 25px ${themeConfig.glowColor}`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Compass size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// MY PERSONAL JOURNEY" : "My Watch Journey"}
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
            color: isCyber ? "#00F5FF" : "#000",
            boxShadow: isCyber ? `0 0 10px ${themeConfig.glowColor}` : "2px 2px 0 #000",
          }}
        >
          <Edit3 size={13} />
          <span>{isEditing ? "Close Editor" : "Edit Journey"}</span>
        </motion.button>
      </div>

      {/* View Mode Grid */}
      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {journeyItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border flex flex-col gap-1 select-none"
                style={{
                  backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF5E4",
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold opacity-60">
                  <span>{item.label}</span>
                  <IconComp size={13} style={{ color: themeConfig.primaryAccent }} />
                </div>
                <span
                  className="font-bold text-sm truncate mt-0.5"
                  style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Mode Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border flex flex-col gap-4"
            style={{
              backgroundColor: isCyber ? "rgba(5,8,22,0.9)" : "#FFF9F0",
              borderColor: themeConfig.primaryAccent,
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Started Date
                </label>
                <input
                  type="date"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Finished Date
                </label>
                <input
                  type="date"
                  value={formFinish}
                  onChange={(e) => setFormFinish(e.target.value)}
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Favorite Episode
                </label>
                <input
                  type="text"
                  value={formFavEp}
                  onChange={(e) => setFormFavEp(e.target.value)}
                  placeholder="e.g. Episode 10"
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Favorite Character
                </label>
                <input
                  type="text"
                  value={formFavChar}
                  onChange={(e) => setFormFavChar(e.target.value)}
                  placeholder="e.g. Kim Bong-seok"
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Emotional Episode
                </label>
                <input
                  type="text"
                  value={formEmoEp}
                  onChange={(e) => setFormEmoEp(e.target.value)}
                  placeholder="e.g. Episode 13"
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Watching Mood
                </label>
                <input
                  type="text"
                  value={formMood}
                  onChange={(e) => setFormMood(e.target.value)}
                  placeholder="e.g. Hyped, Emotional"
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1 opacity-70">
                  Personal Score (1-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formScore}
                  onChange={(e) => setFormScore(Number(e.target.value))}
                  className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000" }}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="rewatch"
                  checked={formRewatch}
                  onChange={(e) => setFormRewatch(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="rewatch" className="text-xs font-bold font-mono cursor-pointer">
                  Would Rewatch Title
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-white cursor-pointer shadow-lg"
                style={{ backgroundColor: themeConfig.primaryAccent }}
              >
                <Check size={14} />
                <span>Save Journey</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
