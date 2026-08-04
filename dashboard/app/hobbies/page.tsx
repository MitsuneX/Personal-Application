"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, HobbySkillEntry, HobbyLogEntry } from "@/lib/store/dashboardStore";
import { HobbyRadialChart } from "@/components/charts/HobbyRadialChart";
import { HobbyAreaChart } from "@/components/charts/HobbyAreaChart";
import { HobbyHoverPopup } from "@/components/ui/HobbyHoverPopup";
import { getLevelDetailsFromXp, formatLastLearned } from "@/lib/utils/hobbyProgression";

// ─── Theme Color Map ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { cyber: string; brutal: string; glow: string }> = {
  "Languages":    { cyber: "#00F5FF", brutal: "#FF6B35", glow: "#00F5FF" },
  "Doctors":      { cyber: "#A855F7", brutal: "#FFD166", glow: "#A855F7" },
  "Martial Arts": { cyber: "#10B981", brutal: "#06D6A0", glow: "#10B981" },
};

const FALLBACK_COLOR = { cyber: "#6366F1", brutal: "#8B5CF6", glow: "#6366F1" };

const PRIORITY_BADGE: Record<string, { label: string; cyberColor: string; brutalColor: string }> = {
  "Priority":        { label: "⚡ Priority",         cyberColor: "#00F5FF", brutalColor: "#FF6B35" },
  "Haven't Started": { label: "❄️ Haven't Started",   cyberColor: "#6366F1", brutalColor: "#8A8A8A" },
  "Manifest":        { label: "✨ Manifest",           cyberColor: "#A855F7", brutalColor: "#FFD166" },
};

// ─── Utility ───────────────────────────────────────────────────────────────────
function buildChartData(logs: HobbyLogEntry[], skillId: string) {
  const filtered = logs.filter((l) => l.skillId === skillId);
  if (filtered.length === 0) return [];
  const byDay: Record<string, number> = {};
  let running = 0;
  filtered.forEach((l) => {
    const day = l.createdAt.slice(0, 10);
    running += l.delta;
    byDay[day] = running;
  });
  return Object.entries(byDay).map(([day, progress]) => ({ day, progress }));
}

function getTodaySparkData(logs: HobbyLogEntry[], skillId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const filtered = logs.filter(
    (l) => l.skillId === skillId && l.createdAt.slice(0, 10) === today
  );
  if (filtered.length === 0) return [];
  let running = 0;
  return filtered.map((l) => {
    running += l.delta;
    return { progress: running };
  });
}

function getCategoryColor(category: string, isCyber: boolean) {
  const colors = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
  return {
    color: isCyber ? colors.cyber : colors.brutal,
    colors,
  };
}

// ─── Learn Today Modal ─────────────────────────────────────────────────────────
interface LearnTodayModalProps {
  skill: HobbySkillEntry;
  isCyber: boolean;
  onClose: () => void;
  onSubmit: (minutes: number, note: string) => void;
  isSubmitting: boolean;
}

function LearnTodayModal({ skill, isCyber, onClose, onSubmit, isSubmitting }: LearnTodayModalProps) {
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState("");
  const { color } = getCategoryColor(skill.category, isCyber);

  const sessionXp = (5.0 + minutes * 0.25).toFixed(2);

  const PRESET_MINUTES = [10, 15, 20, 30, 45, 60, 90];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: isCyber ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)" }}
      />

      <motion.div
        className="relative w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: isCyber ? "rgba(5,8,22,0.98)" : "#FFFFFF",
          border: isCyber ? `1px solid ${color}40` : "2.5px solid #000",
          boxShadow: isCyber
            ? `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${color}20`
            : "6px 6px 0 #000",
        }}
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: isCyber ? `${color}15` : `${color}20`, border: isCyber ? `1px solid ${color}30` : `2px solid ${color}` }}
            >
              📖
            </div>
            <div>
              <h3
                className="font-black text-sm leading-none"
                style={{
                  color: isCyber ? "#FFF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
                }}
              >
                {isCyber ? "LOG_SESSION" : "Learn Today"}
              </h3>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: isCyber ? color : "#8A8A8A" }}>
                {skill.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm opacity-50 hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "1.5px solid #DDD" }}
          >
            ✕
          </button>
        </div>

        {/* Minutes presets */}
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
          >
            Time Spent
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_MINUTES.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                style={{
                  background: minutes === m
                    ? (isCyber ? color : "#FF6B35")
                    : (isCyber ? "rgba(255,255,255,0.05)" : "#F5F5F5"),
                  color: minutes === m ? (isCyber ? "#050816" : "#FFF") : (isCyber ? "rgba(255,255,255,0.6)" : "#555"),
                  border: minutes === m
                    ? "none"
                    : (isCyber ? "1px solid rgba(255,255,255,0.1)" : "1.5px solid #DDD"),
                }}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Custom minutes input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={480}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(480, Number(e.target.value) || 1)))}
              className="w-20 text-xs font-bold px-2 py-1.5 rounded-lg outline-none text-center"
              style={{
                background: isCyber ? "rgba(0,0,0,0.4)" : "#F9F9F9",
                border: isCyber ? `1px solid ${color}30` : "1.5px solid #000",
                color: isCyber ? color : "#1A1A1A",
              }}
            />
            <span className="text-[10px] font-bold" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
              minutes
            </span>
          </div>
        </div>

        {/* Optional note */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
          >
            Note <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isCyber ? "// What did you explore today..." : "What did you explore today..."}
            rows={2}
            className="w-full text-[11px] font-mono p-2.5 rounded-xl outline-none resize-none"
            style={{
              background: isCyber ? "rgba(0,0,0,0.3)" : "#FAFAFA",
              border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid rgba(0,0,0,0.2)",
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
            }}
          />
        </div>

        {/* XP preview + Submit */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
              Session reward
            </span>
            <span
              className="text-sm font-black"
              style={{ color: isCyber ? color : "#FF6B35", textShadow: isCyber ? `0 0 8px ${color}` : "none" }}
            >
              +{sessionXp} XP
            </span>
          </div>
          <motion.button
            onClick={() => onSubmit(minutes, note)}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-black"
            style={{
              background: isSubmitting ? (isCyber ? "#10B981" : "#06D6A0") : (isCyber ? color : "#FF6B35"),
              color: isCyber ? "#050816" : "#FFF",
              border: isCyber ? "none" : "2px solid #000",
              boxShadow: isCyber ? `0 0 20px ${color}40` : "3px 3px 0 #000",
              opacity: isSubmitting ? 0.7 : 1,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? "✅ Logged!" : isCyber ? "COMMIT_SESSION" : "Log Session"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Custom Skill Modal ────────────────────────────────────────────────────
interface AddSkillModalProps {
  isCyber: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: string, priority: string) => void;
}

function AddSkillModal({ isCyber, onClose, onSubmit }: AddSkillModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Languages");
  const [priority, setPriority] = useState("Priority");

  const CATEGORIES = ["Languages", "Doctors", "Martial Arts", "Music", "Art", "Programming", "Other"];
  const PRIORITIES = ["Priority", "Haven't Started", "Manifest"];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: isCyber ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)" }} />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: isCyber ? "rgba(5,8,22,0.98)" : "#FFFFFF",
          border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2.5px solid #000",
          boxShadow: isCyber ? "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,245,255,0.1)" : "6px 6px 0 #000",
        }}
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3
            className="font-black text-sm"
            style={{ color: isCyber ? "#00F5FF" : "#1A1A1A", fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit" }}
          >
            {isCyber ? "ADD_SKILL" : "Add New Skill"}
          </h3>
          <button onClick={onClose} className="text-sm opacity-50 hover:opacity-100">✕</button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
            Skill Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isCyber ? "// Enter skill name..." : "e.g. Guitar, Chess, Python..."}
            maxLength={40}
            className="w-full text-xs font-bold px-3 py-2 rounded-lg outline-none"
            style={{
              background: isCyber ? "rgba(0,0,0,0.4)" : "#F9F9F9",
              border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
              color: isCyber ? "#00F5FF" : "#1A1A1A",
            }}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs font-bold px-2 py-1.5 rounded-lg outline-none"
              style={{
                background: isCyber ? "rgba(0,0,0,0.4)" : "#F9F9F9",
                border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-xs font-bold px-2 py-1.5 rounded-lg outline-none"
              style={{
                background: isCyber ? "rgba(0,0,0,0.4)" : "#F9F9F9",
                border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <motion.button
          onClick={() => { if (name.trim()) onSubmit(name.trim(), category, priority); }}
          disabled={!name.trim()}
          className="w-full py-2 rounded-xl text-xs font-black"
          style={{
            background: isCyber ? "#00F5FF" : "#FF6B35",
            color: isCyber ? "#050816" : "#FFF",
            border: isCyber ? "none" : "2px solid #000",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "3px 3px 0 #000",
            opacity: !name.trim() ? 0.4 : 1,
          }}
          whileTap={{ scale: 0.97 }}
        >
          {isCyber ? "CREATE_SKILL" : "Add Skill"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Skill Card ────────────────────────────────────────────────────────────────
interface SkillCardProps {
  skill: HobbySkillEntry;
  logs: HobbyLogEntry[];
  isCyber: boolean;
  onHover: (e: React.MouseEvent, skill: HobbySkillEntry) => void;
  onLeave: () => void;
  onLearnToday: (skill: HobbySkillEntry) => void;
}

function SkillCard({ skill, logs, isCyber, onHover, onLeave, onLearnToday }: SkillCardProps) {
  const { color, colors } = getCategoryColor(skill.category, isCyber);
  const badge = PRIORITY_BADGE[skill.priority];
  const chartData = buildChartData(logs, skill.id);

  const xp = skill.xp ?? 0;
  const level = skill.level ?? 1;
  const streak = skill.streak ?? 0;

  const levelDetails = getLevelDetailsFromXp(xp);
  const lastLearned = formatLastLearned(skill.lastLearnedAt);
  const learnedToday = lastLearned === "Today";

  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col gap-2.5 relative overflow-hidden cursor-default"
      style={{
        background: isCyber ? "rgba(10,15,30,0.6)" : "#FFFFFF",
        border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px solid #000",
        boxShadow: isCyber ? "0 4px 20px rgba(0,0,0,0.3)" : "4px 4px 0 #000",
      }}
      whileHover={{
        y: -4,
        boxShadow: isCyber
          ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${colors.glow}30`
          : "6px 6px 0 #000",
        borderColor: isCyber ? color : "#000",
      }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => onHover(e, skill)}
      onMouseLeave={onLeave}
    >
      {/* Cyber ambient glow strip */}
      {isCyber && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      )}

      {/* Learned today indicator */}
      {learnedToday && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
          style={{ background: isCyber ? "#10B981" : "#06D6A0", boxShadow: isCyber ? "0 0 6px #10B981" : "none" }}
          title="Learned today!"
        />
      )}

      {/* Header row: name + priority badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="font-black text-sm leading-tight truncate"
            style={{
              color: isCyber ? "#fff" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
            }}
          >
            {skill.name}
          </h3>
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
          >
            {skill.category}
          </span>
        </div>
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: isCyber ? `${color}18` : `${colors.brutal}20`,
            color: isCyber ? colors.cyber : colors.brutal,
            border: isCyber ? `1px solid ${color}40` : `1.5px solid ${colors.brutal}`,
          }}
        >
          {badge?.label ?? skill.priority}
        </span>
      </div>

      {/* Level + XP row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
            style={{
              background: isCyber ? `${color}20` : `${color}15`,
              color: isCyber ? color : color,
              border: isCyber ? `1px solid ${color}40` : `1px solid ${color}60`,
            }}
          >
            Lv.{level}
          </span>
          <span
            className="text-[9px] font-bold"
            style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
          >
            {xp.toFixed(1)} XP
          </span>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <span
            className="text-[9px] font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
            style={{
              background: isCyber ? "rgba(255,107,53,0.1)" : "#FFF3ED",
              color: isCyber ? "#FF6B35" : "#E44D26",
              border: isCyber ? "1px solid rgba(255,107,53,0.3)" : "1px solid #E44D26",
            }}
          >
            🔥{streak}
          </span>
        )}
      </div>

      {/* XP progress bar within current level */}
      <div className="flex flex-col gap-1">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 3,
            background: isCyber ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isCyber
                ? `linear-gradient(90deg, ${color}80, ${color})`
                : color,
              boxShadow: isCyber ? `0 0 6px ${color}` : "none",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${levelDetails.progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold" style={{ color: isCyber ? "rgba(255,255,255,0.3)" : "#AAAAAA" }}>
            {levelDetails.xpInCurrentLevel.toFixed(0)} / {levelDetails.xpNeededForNextLevel.toFixed(0)} XP → Lv.{level + 1}
          </span>
          <span className="text-[8px] font-bold" style={{ color: isCyber ? "rgba(255,255,255,0.25)" : "#C0C0C0" }}>
            {lastLearned}
          </span>
        </div>
      </div>

      {/* Mini Area Chart */}
      <div className="mt-0.5">
        <HobbyAreaChart
          data={chartData}
          isCyber={isCyber}
          color={color}
          height={44}
        />
      </div>

      {/* [ Learn Today ] button */}
      <motion.button
        onClick={(e) => { e.stopPropagation(); onLearnToday(skill); }}
        className="w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider mt-0.5 transition-all"
        style={{
          background: learnedToday
            ? (isCyber ? "rgba(16,185,129,0.15)" : "#EDFAF5")
            : (isCyber ? `${color}12` : "#FFF8F0"),
          color: learnedToday
            ? (isCyber ? "#10B981" : "#059669")
            : (isCyber ? color : "#FF6B35"),
          border: learnedToday
            ? (isCyber ? "1px solid rgba(16,185,129,0.3)" : "1.5px solid #059669")
            : (isCyber ? `1px solid ${color}30` : "1.5px solid #FF6B35"),
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {learnedToday ? "✅ Logged Today" : isCyber ? "[ LEARN_TODAY ]" : "[ Learn Today ]"}
      </motion.button>
    </motion.div>
  );
}

// ─── XP Note Form ──────────────────────────────────────────────────────────────
interface XPNoteFormProps {
  skills: HobbySkillEntry[];
  isCyber: boolean;
  onSubmit: (skillId: string, note: string) => void;
}

function XPNoteForm({ skills, isCyber, onSubmit }: XPNoteFormProps) {
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0]?.id ?? "");
  const [noteText, setNoteText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wordCount = noteText.trim().split(/\s+/).filter(Boolean).length;
  const xpPreview = (wordCount * 0.02).toFixed(3);

  const handleSubmit = async () => {
    if (!selectedSkillId || !noteText.trim()) return;
    await onSubmit(selectedSkillId, noteText);
    setNoteText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: isCyber ? "rgba(10,15,30,0.7)" : "#FFF9F0",
        border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid #000",
        boxShadow: isCyber ? "0 4px 20px rgba(0,0,0,0.3)" : "4px 4px 0 #000",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">📝</span>
        <h3
          className="font-black text-sm"
          style={{
            color: isCyber ? "#00F5FF" : "#000",
            fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
          }}
        >
          {isCyber ? "LOG_XP_ENTRY" : "Log XP Note"}
        </h3>
      </div>

      {/* Skill selector */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: isCyber ? "rgba(255,255,255,0.5)" : "#8A8A8A" }}
        >
          Target Skill
        </label>
        <select
          value={selectedSkillId}
          onChange={(e) => setSelectedSkillId(e.target.value)}
          className="w-full text-xs font-bold rounded-lg px-3 py-2 outline-none"
          style={{
            background: isCyber ? "rgba(0,0,0,0.4)" : "#FFF",
            border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid #000",
            color: isCyber ? "#00F5FF" : "#1A1A1A",
          }}
        >
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
      </div>

      {/* Note textarea */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: isCyber ? "rgba(255,255,255,0.5)" : "#8A8A8A" }}
        >
          Note Content
        </label>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={isCyber ? "// Type your learning note here..." : "Write your learning note here..."}
          rows={4}
          className="w-full text-xs font-mono p-3 rounded-xl outline-none resize-none"
          style={{
            background: isCyber ? "rgba(0,0,0,0.3)" : "#FFFDF6",
            border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid rgba(0,0,0,0.2)",
            color: isCyber ? "#00F5FF" : "#1A1A1A",
          }}
        />
      </div>

      {/* XP Preview + Submit */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span
            className="text-[10px] font-bold"
            style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
          >
            {wordCount} words →{" "}
          </span>
          <span
            className="text-[11px] font-black"
            style={{
              color: isCyber ? "#00F5FF" : "#FF6B35",
              textShadow: isCyber ? "0 0 8px #00F5FF" : "none",
            }}
          >
            +{xpPreview} XP
          </span>
        </div>

        <motion.button
          onClick={handleSubmit}
          className="px-4 py-2 text-xs font-black rounded-xl transition-colors"
          style={{
            background: submitted
              ? isCyber ? "#10B981" : "#06D6A0"
              : isCyber ? "#00F5FF" : "#FF6B35",
            color: isCyber ? "#050816" : "#fff",
            border: isCyber ? "none" : "2px solid #000",
            boxShadow: isCyber ? "none" : "3px 3px 0 #000",
          }}
          whileTap={{ scale: 0.95 }}
          disabled={!noteText.trim() || !selectedSkillId}
        >
          {submitted ? "✅ Logged!" : isCyber ? "COMMIT_XP" : "Log XP"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HobbiesPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    hobbySkills,
    hobbyLogs,
    logHobbyXP,
    logLearningSession,
    addCustomSkill,
  } = useDashboardStore();

  // Modals
  const [learnModal, setLearnModal] = useState<HobbySkillEntry | null>(null);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  // Hover popup state
  const [popup, setPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    skill: HobbySkillEntry | null;
  }>({ visible: false, x: 0, y: 0, skill: null });

  const handleHover = useCallback((e: React.MouseEvent, skill: HobbySkillEntry) => {
    setPopup({ visible: true, x: e.clientX, y: e.clientY, skill });
  }, []);

  const handleLeave = useCallback(() => {
    setPopup((p) => ({ ...p, visible: false }));
  }, []);

  const handleLearnToday = useCallback((skill: HobbySkillEntry) => {
    setLearnModal(skill);
  }, []);

  const handleSessionSubmit = useCallback(async (minutes: number, note: string) => {
    if (!learnModal) return;
    setIsSubmittingSession(true);
    await logLearningSession(learnModal.id, minutes, note || undefined);
    setJustLogged(true);
    setTimeout(() => {
      setJustLogged(false);
      setIsSubmittingSession(false);
      setLearnModal(null);
    }, 1500);
  }, [learnModal, logLearningSession]);

  const handleAddSkill = useCallback(async (name: string, category: string, priority: string) => {
    await addCustomSkill(name, category, priority);
    setAddSkillOpen(false);
  }, [addCustomSkill]);

  // Category aggregate data for radial chart (only fixed 3)
  const categoryData = useMemo(() => {
    const categories = ["Languages", "Doctors", "Martial Arts"] as const;
    return categories.map((cat) => {
      const catSkills = hobbySkills.filter((s) => s.category === cat);
      const rawAvg =
        catSkills.length > 0
          ? catSkills.reduce((sum, s) => sum + (Number(s.progress) || 0), 0) / catSkills.length
          : 0;
      const avg = isFinite(rawAvg) ? rawAvg : 0;
      const colors = CATEGORY_COLORS[cat];
      return {
        name: cat,
        value: Math.round(avg * 100) / 100,
        fill: isCyber ? colors.cyber : colors.brutal,
        glowColor: colors.glow,
      };
    });
  }, [hobbySkills, isCyber]);

  // Group skills by category — include custom categories
  const grouped = useMemo(() => {
    const groups: Record<string, HobbySkillEntry[]> = {};
    hobbySkills.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [hobbySkills]);

  // Popup data
  const popupSkill = popup.skill;
  const popupLogs = popupSkill ? hobbyLogs.filter((l) => l.skillId === popupSkill.id) : [];
  const popupSparkData = popupSkill ? getTodaySparkData(hobbyLogs, popupSkill.id) : [];
  const popupColor = popupSkill
    ? isCyber
      ? (CATEGORY_COLORS[popupSkill.category] ?? FALLBACK_COLOR).cyber
      : (CATEGORY_COLORS[popupSkill.category] ?? FALLBACK_COLOR).brutal
    : "#00F5FF";

  // Global stats
  const totalMinutes = hobbySkills.reduce((s, sk) => s + (sk.totalMinutes ?? 0), 0);
  const activeStreaks = hobbySkills.filter((sk) => (sk.streak ?? 0) > 0).length;
  const totalXp = hobbySkills.reduce((s, sk) => s + (sk.xp ?? 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <AppShell>
      {/* ── Page Header ── */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.06), rgba(168,85,247,0.04))"
            : "linear-gradient(135deg, #FFF5E4, #FFE4B5)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 40px rgba(0,245,255,0.1)" : "6px 6px 0 #000",
        }}
      >
        {isCyber && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <h1
                className="font-black text-3xl"
                style={{ fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit" }}
              >
                {isCyber ? "SKILL_PROGRESSION.SYS" : "Skill Progression & Curiosity"}
              </h1>
            </div>

            {/* Add Skill button */}
            <motion.button
              onClick={() => setAddSkillOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5"
              style={{
                background: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
                border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "2px solid #000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.1)" : "2px 2px 0 #000",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>+</span>
              <span className="hidden sm:inline">{isCyber ? "ADD_SKILL" : "Add Skill"}</span>
            </motion.button>
          </div>

          <p className="text-xs font-bold" style={{ color: isCyber ? "rgba(255,255,255,0.5)" : "#8A8A8A" }}>
            {isCyber
              ? "// Track languages, knowledge domains & martial arts — every note earns XP"
              : "Track languages, knowledge, and martial arts — every note you write earns XP progress."}
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-4">
            {[
              { label: "Total Skills", value: hobbySkills.length },
              { label: "Total XP", value: totalXp.toFixed(0) },
              { label: "Active Streaks", value: activeStreaks },
              { label: "Minutes Studied", value: totalMinutes.toLocaleString() },
              { label: "Words Written", value: hobbyLogs.reduce((s, l) => s + l.wordCount, 0).toLocaleString() },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-lg font-black"
                  style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Top Bento: Radial Overview + Category Stats ── */}
      <motion.div
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Radial Chart Card */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-1 rounded-2xl p-5 flex flex-col items-center justify-center gap-4"
          style={{
            background: isCyber ? "rgba(10,15,30,0.7)" : "#FFFFFF",
            border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid #000",
            boxShadow: isCyber ? "0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(0,245,255,0.05)" : "5px 5px 0 #000",
          }}
        >
          <h2
            className="font-black text-xs uppercase tracking-widest self-start"
            style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
          >
            {isCyber ? "CATEGORY_OVERVIEW" : "Category Overview"}
          </h2>
          <HobbyRadialChart data={categoryData} isCyber={isCyber} size={200} />
          {/* Legend */}
          <div className="flex flex-col gap-1.5 w-full">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: c.fill,
                      boxShadow: isCyber ? `0 0 6px ${c.fill}` : "none",
                    }}
                  />
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: isCyber ? "rgba(255,255,255,0.7)" : "#4A4A4A" }}
                  >
                    {c.name}
                  </span>
                </div>
                <span
                  className="text-[11px] font-black"
                  style={{ color: isCyber ? c.fill : "#1A1A1A" }}
                >
                  {c.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Breakdown Cards */}
        <motion.div variants={itemVariants} className="md:col-span-2 flex flex-col gap-4">
          {(["Languages", "Doctors", "Martial Arts"] as const).map((cat) => {
            const catSkills = hobbySkills.filter((s) => s.category === cat);
            const colors = CATEGORY_COLORS[cat];
            const color = isCyber ? colors.cyber : colors.brutal;
            const avg =
              catSkills.length > 0
                ? (() => {
                    const raw = catSkills.reduce((s, sk) => s + (Number(sk.progress) || 0), 0) / catSkills.length;
                    return isFinite(raw) ? raw : 0;
                  })()
                : 0;

            return (
              <div
                key={cat}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  background: isCyber ? "rgba(10,15,30,0.5)" : "#FFF9F0",
                  border: isCyber ? `1px solid ${color}20` : "2px solid #000",
                  boxShadow: isCyber ? `0 0 20px ${color}08` : "3px 3px 0 #000",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg"
                  style={{
                    background: isCyber ? `${color}15` : `${colors.brutal}20`,
                    border: isCyber ? `1px solid ${color}30` : `2px solid ${colors.brutal}`,
                  }}
                >
                  {cat === "Languages" ? "🗣️" : cat === "Doctors" ? "🧠" : "🥊"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3
                      className="font-black text-sm"
                      style={{ color: isCyber ? "#fff" : "#1A1A1A" }}
                    >
                      {cat}
                    </h3>
                    <span
                      className="font-black text-sm"
                      style={{ color: isCyber ? color : "#1A1A1A" }}
                    >
                      {avg.toFixed(2)}% avg
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {catSkills.map((s) => (
                      <span
                        key={s.id}
                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isCyber ? `${color}15` : `${colors.brutal}15`,
                          color: isCyber ? color : colors.brutal,
                          border: isCyber ? `1px solid ${color}30` : `1px solid ${colors.brutal}50`,
                        }}
                      >
                        {s.name}: Lv.{s.level ?? 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ── Individual Skill Cards Grid ── */}
      {Object.entries(grouped).map(([category, skills]) => {
        const { color } = getCategoryColor(category, isCyber);

        return (
          <motion.section
            key={category}
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-6 rounded-full"
                style={{
                  background: isCyber ? `linear-gradient(180deg, ${color}, transparent)` : color,
                  boxShadow: isCyber ? `0 0 8px ${color}` : "none",
                }}
              />
              <h2
                className="font-black text-base uppercase tracking-wider"
                style={{
                  color: isCyber ? "#fff" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
                }}
              >
                {category}
              </h2>
              <div
                className="flex-1 h-px"
                style={{ background: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)" }}
              />
              <span
                className="text-[10px] font-bold"
                style={{ color: isCyber ? "rgba(255,255,255,0.3)" : "#8A8A8A" }}
              >
                {skills.length} skills
              </span>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
              variants={containerVariants}
            >
              {skills.map((skill) => (
                <motion.div key={skill.id} variants={itemVariants}>
                  <SkillCard
                    skill={skill}
                    logs={hobbyLogs}
                    isCyber={isCyber}
                    onHover={handleHover}
                    onLeave={handleLeave}
                    onLearnToday={handleLearnToday}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        );
      })}

      {/* ── XP Note Form ── */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl"
      >
        <XPNoteForm skills={hobbySkills} isCyber={isCyber} onSubmit={logHobbyXP} />
      </motion.div>

      {/* ── Hover Popup (portal-level) ── */}
      <HobbyHoverPopup
        isVisible={popup.visible && !!popup.skill}
        x={popup.x}
        y={popup.y}
        skillName={popup.skill?.name ?? ""}
        progress={popup.skill?.progress ?? 0}
        totalNotes={popupLogs.length}
        totalWords={popupLogs.reduce((s, l) => s + l.wordCount, 0)}
        sparkData={popupSparkData}
        isCyber={isCyber}
        color={popupColor}
      />

      {/* ── Learn Today Modal ── */}
      <AnimatePresence>
        {learnModal && (
          <LearnTodayModal
            skill={learnModal}
            isCyber={isCyber}
            onClose={() => setLearnModal(null)}
            onSubmit={handleSessionSubmit}
            isSubmitting={justLogged}
          />
        )}
      </AnimatePresence>

      {/* ── Add Skill Modal ── */}
      <AnimatePresence>
        {addSkillOpen && (
          <AddSkillModal
            isCyber={isCyber}
            onClose={() => setAddSkillOpen(false)}
            onSubmit={handleAddSkill}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
