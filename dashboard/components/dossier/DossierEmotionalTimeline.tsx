"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { DossierEmotionMilestone } from "@/lib/store/dashboardStore";
import { Heart, Plus, Calendar, Edit3, Trash2 } from "lucide-react";

export interface DossierEmotionalTimelineProps {
  timeline?: DossierEmotionMilestone[];
  themeConfig: ThemeAccentConfig;
  onSaveTimeline?: (timeline: DossierEmotionMilestone[]) => void;
}

export function DossierEmotionalTimeline({
  timeline = [],
  themeConfig,
  onSaveTimeline,
}: DossierEmotionalTimelineProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [milestones, setMilestones] = useState<DossierEmotionMilestone[]>(timeline);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form State
  const [formEp, setFormEp] = useState("");
  const [formEmotion, setFormEmotion] = useState("😊 Intrigued");
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState("");

  useEffect(() => {
    setMilestones(timeline);
  }, [timeline]);

  const openAddModal = () => {
    setEditingIndex(null);
    setFormEp("");
    setFormEmotion("😊 Intrigued");
    setFormNote("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const openEditModal = (idx: number) => {
    const item = milestones[idx];
    if (!item) return;
    setEditingIndex(idx);
    setFormEp(item.episode || "");
    setFormEmotion(item.emotion || "😊 Intrigued");
    setFormNote(item.note || "");
    setFormDate(item.date || new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formEp.trim()) return;

    const entry: DossierEmotionMilestone = {
      episode: formEp.trim(),
      emotion: formEmotion,
      note: formNote.trim(),
      date: formDate || new Date().toISOString().split("T")[0],
    };

    let updated: DossierEmotionMilestone[];
    if (editingIndex !== null) {
      updated = milestones.map((m, i) => (i === editingIndex ? entry : m));
    } else {
      updated = [...milestones, entry];
    }

    setMilestones(updated);
    onSaveTimeline?.(updated);
    setShowModal(false);
  };

  const handleDelete = (idx: number) => {
    const updated = milestones.filter((_, i) => i !== idx);
    setMilestones(updated);
    onSaveTimeline?.(updated);
  };

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Heart size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// EMOTIONAL MILESTONE TIMELINE" : "Emotional Journey Timeline"}
          </h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
            color: isCyber ? "#00F5FF" : "#000",
          }}
        >
          <Plus size={14} />
          <span>Add Reaction</span>
        </button>
      </div>

      {/* Timeline Visual Flow */}
      {milestones.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-dashed space-y-6" style={{ borderColor: themeConfig.primaryAccent }}>
          {milestones.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative p-4 rounded-xl border group backdrop-blur-md"
              style={{
                backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "#FFF5E4",
                borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
              }}
            >
              {/* Timeline Dot */}
              <div
                className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: themeConfig.primaryAccent }}
              />

              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded border" style={{ borderColor: themeConfig.primaryAccent, color: themeConfig.primaryAccent }}>
                    {m.episode}
                  </span>
                  <span className="font-bold text-sm">{m.emotion}</span>
                </div>

                <div className="flex items-center gap-3">
                  {m.date && (
                    <span className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{m.date}</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(idx)}
                      className="p-1 rounded hover:bg-white/10 text-cyan-400 cursor-pointer"
                      title="Edit milestone"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-1 rounded hover:bg-white/10 text-red-400 cursor-pointer"
                      title="Delete milestone"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed opacity-85 mt-1" style={{ color: isCyber ? "#94A3B8" : "#374151" }}>
                {m.note}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          onClick={openAddModal}
          className="p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}
        >
          <Heart size={32} className="mb-2 opacity-40" style={{ color: themeConfig.primaryAccent }} />
          <p className="text-xs font-mono font-bold uppercase opacity-70">No emotional milestones logged</p>
          <p className="text-[11px] opacity-50 mt-1">Click &apos;Add Reaction&apos; to log your emotional reaction for key episodes</p>
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="p-6 rounded-2xl max-w-md w-full border bg-slate-900 text-white relative">
              <h3 className="font-black text-lg mb-4">
                {editingIndex !== null ? "Edit Emotional Milestone" : "Add Emotional Reaction Milestone"}
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-mono opacity-70">Episode Number / Milestone</label>
                  <input
                    type="text"
                    value={formEp}
                    onChange={(e) => setFormEp(e.target.value)}
                    placeholder="e.g. Episode 10 or Climax"
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent mt-1 border-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono opacity-70">Emotion Tag</label>
                  <select
                    value={formEmotion}
                    onChange={(e) => setFormEmotion(e.target.value)}
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-slate-800 mt-1 border-white/20 text-white"
                  >
                    <option value="😊 Intrigued">😊 Intrigued</option>
                    <option value="😲 Shocked">😲 Shocked</option>
                    <option value="😭 Cried">😭 Cried</option>
                    <option value="🔥 Hyped">🔥 Hyped</option>
                    <option value="❤️ Masterpiece">❤️ Masterpiece</option>
                    <option value="💔 Heartbroken">💔 Heartbroken</option>
                    <option value="🤣 Laughed">🤣 Laughed</option>
                    <option value="✨ Inspiring">✨ Inspiring</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono opacity-70">Personal Note</label>
                  <textarea
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="What happened in this scene that moved you?"
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent mt-1 h-20 border-white/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs font-mono border border-white/20 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-pink-600 text-white">
                  {editingIndex !== null ? "Update Reaction" : "Save Reaction"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
