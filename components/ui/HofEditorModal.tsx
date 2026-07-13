"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
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
  const [type, setType] = useState<"actor" | "actress" | "anime">("actor");
  const [status, setStatus] = useState<MediaStatus>("GOAT Status");
  const [knownFor, setKnownFor] = useState("");
  const [nationality, setNationality] = useState("");
  const [note, setNote] = useState("");
  const [rank, setRank] = useState(1);
  const [isChampion, setIsChampion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setName(entryToEdit.name);
      setType(entryToEdit.type);
      setStatus(entryToEdit.status);
      setKnownFor(entryToEdit.knownFor.join(", "));
      setNationality(entryToEdit.nationality || "");
      setNote(entryToEdit.note || "");
      setRank(entryToEdit.rank || 1);
      setIsChampion(entryToEdit.isChampion || false);
    } else {
      setName("");
      setType("actor");
      setStatus("GOAT Status");
      setKnownFor("");
      setNationality("");
      setNote("");
      setRank(1);
      setIsChampion(false);
    }
  }, [entryToEdit, isOpen]);

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
        note: note.trim() || undefined,
        rank: Number(rank),
        isChampion,
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
                  {entryToEdit ? (isCyber ? "EDIT_LEGEND.CONFIG" : "Edit Legend Details") : (isCyber ? "ENSHRINE_NEW_LEGEND" : "Enshrine New Legend")}
                </h2>
                <button onClick={onClose} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ana de Armas"
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border focus:ring-1 bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border cursor-pointer bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    >
                      <option value="actor">Actor</option>
                      <option value="actress">Actress</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Status Tier</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border cursor-pointer bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    >
                      <option value="GOAT Status">👑 GOAT Status</option>
                      <option value="All-Star">⭐ All-Star</option>
                      <option value="Rising">🚀 Rising</option>
                      <option value="Classic">💎 Classic</option>
                    </select>
                  </div>
                </div>

                {/* Known For */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Known For (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={knownFor}
                    onChange={(e) => setKnownFor(e.target.value)}
                    placeholder="e.g. Blade Runner 2049, Knives Out"
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nationality */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Nationality</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Cuban-Spanish"
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    />
                  </div>

                  {/* Rank */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Official Rank</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={rank}
                      onChange={(e) => setRank(Number(e.target.value))}
                      className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    />
                  </div>
                </div>

                {/* Champion Toggle */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isChampion"
                    checked={isChampion}
                    onChange={(e) => setIsChampion(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                  />
                  <label htmlFor="isChampion" className="text-xs font-black uppercase tracking-wider cursor-pointer theme-text-primary flex items-center gap-1">
                    👑 Make overall Leader / Champion
                  </label>
                </div>

                {/* Note */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase tracking-wider theme-text-secondary">Enshrinement Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. The definition of cool and elegance."
                    className="px-3 py-2 text-sm font-semibold rounded-lg outline-none border resize-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold rounded-lg border-2 border-adaptive-unique bg-transparent theme-text-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-black rounded-lg transition-transform active:scale-95"
                    style={{
                      backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                      color: isCyber ? "#050816" : "#fff",
                    }}
                  >
                    {isSaving ? "Enshrining..." : "Enshrine Legend"}
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
