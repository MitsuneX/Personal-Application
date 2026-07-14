"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { AnimeEntry } from "@/lib/store/dashboardStore";

interface ManualAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: AnimeEntry["status"]; label: string; color: string; bg: string }[] = [
  { value: "Watching",      label: "📺 Watching",      color: "#00BFFF", bg: "rgba(0,191,255,0.12)" },
  { value: "Completed",     label: "🏆 Completed",     color: "#39FF14", bg: "rgba(57,255,20,0.1)"  },
  { value: "Plan to Watch", label: "⏳ Plan to Watch", color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
  { value: "Dropped",       label: "❌ Dropped",       color: "#FF4B4B", bg: "rgba(255,75,75,0.1)"  },
];

export function ManualAnimeModal({ isOpen, onClose }: ManualAnimeModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addAnime } = useDashboardStore();

  // Form states
  const [title, setTitle] = useState("");
  const [episodesWatched, setEpisodesWatched] = useState("0");
  const [totalEpisodes, setTotalEpisodes] = useState("12");
  const [status, setStatus] = useState<AnimeEntry["status"]>("Watching");
  const [rating, setRating] = useState("8");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [studio, setStudio] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);

    const anime: AnimeEntry = {
      id: `anime-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      episodesWatched: parseInt(episodesWatched) || 0,
      totalEpisodes: parseInt(totalEpisodes) || 12,
      status,
      rating: rating ? parseInt(rating) : undefined,
      genre: genre || undefined,
      year: year ? parseInt(year) : undefined,
      studio: studio || undefined,
    };

    await addAnime(anime);
    setIsSaving(false);
    onClose();

    // Reset Form
    setTitle("");
    setEpisodesWatched("0");
    setTotalEpisodes("12");
    setStatus("Watching");
    setRating("8");
    setGenre("");
    setYear("");
    setStudio("");
  };

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#fff",
    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
    color: isCyber ? "#fff" : "#000",
    borderWidth: isCyber ? "1px" : "2px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-1 max-h-[82vh] overflow-y-auto pr-2 scrollbar-thin">
        <h2
          className="font-black text-xl font-mono mb-4 text-center"
          style={{
            color: isCyber ? "#00F5FF" : "#003366",
            textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.3)" : "none",
          }}
        >
          {isCyber ? "MANUAL_ANIME::ADD" : "⛩️ Add Anime Manually"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary">ANIME TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Anime Title"
              className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">EPS WATCHED</label>
              <input
                type="number"
                required
                value={episodesWatched}
                onChange={(e) => setEpisodesWatched(e.target.value)}
                placeholder="e.g. 3"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">TOTAL EPISODES</label>
              <input
                type="number"
                required
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(e.target.value)}
                placeholder="e.g. 12"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">GENRE / TYPE</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Action, Fantasy"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">RATING (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 9"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">STUDIO</label>
              <input
                type="text"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                placeholder="e.g. MAPPA, ufotable"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">RELEASE YEAR</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          {/* Watch Status */}

          <div>
            <label className="block text-xs font-bold mb-1.5 theme-text-secondary">WATCH STATUS</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                  style={{
                    background: status === opt.value ? opt.bg : "transparent",
                    color: status === opt.value ? opt.color : (isCyber ? "#94A3B8" : "#4A4A4A"),
                    border: `1.5px solid ${status === opt.value ? opt.color : (isCyber ? "rgba(255,255,255,0.15)" : "#000")}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                color: isCyber ? "#94A3B8" : "#475569",
                border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px solid #000",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#2EC4B6",
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Add Anime"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
