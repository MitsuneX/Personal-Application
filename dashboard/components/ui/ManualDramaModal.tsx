"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import type { DramaLogEntry, DramaLogStatus } from "@/lib/store/dashboardStore";

interface ManualDramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCountry?: string;
}

const STATUS_OPTIONS: { value: DramaLogStatus; label: string; color: string; bg: string }[] = [
  { value: "GOAT Status", label: "🏆 GOAT Status", color: "#FFD700", bg: "rgba(255,215,0,0.15)" },
  { value: "All-Star",    label: "⭐ All-Star",    color: "#00BFFF", bg: "rgba(0,191,255,0.12)" },
  { value: "Rising",      label: "🚀 Rising",      color: "#39FF14", bg: "rgba(57,255,20,0.1)"  },
  { value: "Classic",     label: "💎 Classic",     color: "#BF5FFF", bg: "rgba(191,95,255,0.1)" },
];

const COUNTRY_OPTIONS = [
  { value: "korean",    label: "🇰🇷 Korean" },
  { value: "japanese",  label: "🇯🇵 Japanese" },
  { value: "chinese",   label: "🇨🇳 Chinese" },
  { value: "hollywood", label: "🎬 Hollywood" },
  { value: "other",     label: "🌐 Other" },
];

export function ManualDramaModal({ isOpen, onClose, defaultCountry = "other" }: ManualDramaModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { saveDramaLog } = useDashboardStore();

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Movie" | "Series">("Series");
  const [releaseYear, setReleaseYear] = useState("");
  const [plotSummary, setPlotSummary] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [actorsString, setActorsString] = useState("");
  const [statusBadge, setStatusBadge] = useState<DramaLogStatus>("All-Star");
  const [country, setCountry] = useState(defaultCountry);
  const [rating, setRating] = useState("8.0");

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);

    const actors = actorsString
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const entry: DramaLogEntry = {
      id: `drama-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      type,
      releaseYear: releaseYear ? parseInt(releaseYear) : null,
      plotSummary: plotSummary || null,
      posterUrl: posterUrl || null,
      mainActors: actors,
      statusBadge,
      country,
      rating: rating || null,
      createdAt: new Date().toISOString(),
    };

    await saveDramaLog(entry);
    setIsSaving(false);
    onClose();

    // Reset Form
    setTitle("");
    setType("Series");
    setReleaseYear("");
    setPlotSummary("");
    setPosterUrl("");
    setActorsString("");
    setStatusBadge("All-Star");
    setRating("8.0");
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
          {isCyber ? "MANUAL_DRAMA::ADD" : "🎬 Add Drama Manually"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary">DRAMA TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Title"
              className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">TYPE</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "Movie" | "Series")}
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              >
                <option value="Series" className="bg-slate-900 text-white">Series</option>
                <option value="Movie" className="bg-slate-900 text-white">Movie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">RELEASE YEAR</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">REGION / CATEGORY</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary">RATING (e.g. 8.5)</label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g. 9.0"
                className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary">MAIN CAST (Comma-separated)</label>
            <input
              type="text"
              value={actorsString}
              onChange={(e) => setActorsString(e.target.value)}
              placeholder="e.g. Gong Yoo, Song Hye-kyo"
              className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary">POSTER IMAGE URL</label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary">PLOT SUMMARY</label>
            <textarea
              value={plotSummary}
              onChange={(e) => setPlotSummary(e.target.value)}
              placeholder="Enter brief plot summary"
              rows={2}
              className="w-full p-2 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 theme-text-secondary">STATUS BADGE</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setStatusBadge(opt.value)}
                  className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                  style={{
                    background: statusBadge === opt.value ? opt.bg : "transparent",
                    color: statusBadge === opt.value ? opt.color : (isCyber ? "#94A3B8" : "#4A4A4A"),
                    border: `1.5px solid ${statusBadge === opt.value ? opt.color : (isCyber ? "rgba(255,255,255,0.15)" : "#000")}`,
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
              {isSaving ? "Saving..." : "Add Drama"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
