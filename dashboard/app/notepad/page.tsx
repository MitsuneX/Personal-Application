"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

type SidebarTab = "all" | "curiosity";

export default function NotepadPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { notes, saveNote, deleteNote, hobbySkills, logHobbyXP } = useDashboardStore();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hobbyId, setHobbyId] = useState<string>("");
  const [isCuriosity, setIsCuriosity] = useState(false);
  const [isSavedStatus, setIsSavedStatus] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("all");
  const [prevHobbyId, setPrevHobbyId] = useState<string>("");

  // Filtered lists
  const allNotes = notes.filter((n) => !n.isCuriosity);
  const curiosityNotes = notes.filter((n) => n.isCuriosity);
  const displayedNotes = sidebarTab === "curiosity" ? curiosityNotes : allNotes;

  // Sync state with active note
  useEffect(() => {
    const notePool = sidebarTab === "curiosity" ? curiosityNotes : allNotes;
    if (notePool.length > 0) {
      const active = notePool.find((n) => n.id === activeNoteId) ?? notePool[0];
      setActiveNoteId(active.id);
      setTitle(active.title);
      setContent(active.content);
      setHobbyId(active.hobbyId ?? "");
      setIsCuriosity(active.isCuriosity ?? false);
      setIsSavedStatus(true);
    } else {
      setActiveNoteId(null);
      setTitle("");
      setContent("");
      setHobbyId("");
      setIsCuriosity(false);
      setIsSavedStatus(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId, notes, sidebarTab]);

  const handleCreateNew = () => {
    const newId = "note-" + Math.random().toString(36).substr(2, 9);
    saveNote(newId, "Untitled Note", "", "", false);
    setActiveNoteId(newId);
  };

  const handleSave = async () => {
    if (!activeNoteId) return;
    const prevContent = notes.find((n) => n.id === activeNoteId)?.content ?? "";
    await saveNote(activeNoteId, title, content, hobbyId || null, isCuriosity);
    setIsSavedStatus(true);

    // If a hobby is linked and content changed, log XP automatically
    if (hobbyId && content.trim() && content !== prevContent) {
      await logHobbyXP(hobbyId, content);
    }
  };

  const handleDelete = async () => {
    if (!activeNoteId) return;
    if (confirm("Are you sure you want to delete this note?")) {
      const remaining = notes.filter((n) => n.id !== activeNoteId);
      await deleteNote(activeNoteId);
      if (remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
      } else {
        setActiveNoteId(null);
      }
    }
  };

  const handleSelectNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setActiveNoteId(id);
    setTitle(note.title);
    setContent(note.content);
    setHobbyId(note.hobbyId ?? "");
    setIsCuriosity(note.isCuriosity ?? false);
    setIsSavedStatus(true);
  };

  return (
    <AppShell>
      {/* Page Header */}
      <motion.div
        className="mb-6 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.06))"
            : "linear-gradient(135deg, #FFE4B5, #FFF9E6)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "5px 5px 0 #000",
        }}
      >
        <h1 className="font-black text-3xl font-mono tracking-wide" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
          {isCyber ? "TERMINAL_NOTEPAD" : "📝 Notepad Workspace"}
        </h1>
        <p className="text-xs theme-text-secondary mt-1">
          Draft notes, store configs, or link entries to your Hobby Tracker for auto XP gain.
        </p>
      </motion.div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch min-h-[480px]">
        {/* Sidebar Notes List */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <button
            onClick={handleCreateNew}
            className="w-full py-2 px-3 text-xs font-black rounded-lg border-adaptive-unique transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFD166",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            ➕ New Memo
          </button>

          {/* Tab Switcher */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px solid #000" }}
          >
            {([["all", "📋 All"], ["curiosity", "🔍 Curiosity"]] as [SidebarTab, string][]).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => { setSidebarTab(tab); setActiveNoteId(null); }}
                className="flex-1 py-1.5 text-[10px] font-black transition-colors"
                style={{
                  background: sidebarTab === tab
                    ? isCyber ? "rgba(0,245,255,0.15)" : "#FFD166"
                    : "transparent",
                  color: sidebarTab === tab
                    ? isCyber ? "#00F5FF" : "#000"
                    : isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A",
                }}
              >
                {label}
                {tab === "curiosity" && curiosityNotes.length > 0 && (
                  <span
                    className="ml-1 px-1 rounded-full text-[8px]"
                    style={{
                      background: isCyber ? "#00F5FF" : "#FF6B35",
                      color: isCyber ? "#000" : "#fff",
                    }}
                  >
                    {curiosityNotes.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-[450px] space-y-2 p-1" style={{ scrollbarWidth: "thin" }}>
            <AnimatePresence>
              {displayedNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                const linkedSkill = hobbySkills.find((s) => s.id === note.hobbyId);
                return (
                  <motion.div
                    key={note.id}
                    layoutId={`note-${note.id}`}
                    onClick={() => handleSelectNote(note.id)}
                    className="p-3 rounded-lg border-adaptive-unique cursor-pointer transition-all relative overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    style={{
                      backgroundColor: isActive
                        ? isCyber ? "rgba(0,245,255,0.08)" : "#FFF9F0"
                        : isCyber ? "rgba(255,255,255,0.02)" : "#FFF",
                      borderColor: isActive
                        ? isCyber ? "#00F5FF" : "#000000"
                        : isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
                    }}
                  >
                    <h3 className="text-xs font-black theme-text-primary truncate">{note.title || "Untitled"}</h3>
                    <p className="text-[10px] theme-text-muted truncate mt-1">{note.content || "Empty content..."}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {linkedSkill && (
                        <span
                          className="text-[8px] font-black px-1 py-0.5 rounded-full"
                          style={{
                            background: isCyber ? "rgba(0,245,255,0.1)" : "rgba(255,107,53,0.1)",
                            color: isCyber ? "#00F5FF" : "#FF6B35",
                          }}
                        >
                          ⚡ {linkedSkill.name}
                        </span>
                      )}
                      {note.isCuriosity && (
                        <span
                          className="text-[8px] font-black px-1 py-0.5 rounded-full"
                          style={{
                            background: isCyber ? "rgba(168,85,247,0.15)" : "rgba(255,209,102,0.2)",
                            color: isCyber ? "#A855F7" : "#B8860B",
                          }}
                        >
                          🔍 Curiosity
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {displayedNotes.length === 0 && (
              <p className="text-[10px] text-center theme-text-muted font-bold font-mono py-8">
                {sidebarTab === "curiosity"
                  ? isCyber ? "NO_CURIOSITY_ENTRIES" : "No curiosity notes yet."
                  : isCyber ? "NO_MEMOS_SAVED" : "No notes yet."}
              </p>
            )}
          </div>
        </div>

        {/* Note Editor Board */}
        <div className="md:col-span-3">
          {activeNoteId ? (
            <motion.div
              className="h-full flex flex-col p-5 rounded-2xl border-adaptive-unique"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                boxShadow: isCyber ? "inset 0 0 20px rgba(0,245,255,0.05)" : "5px 5px 0 #000",
              }}
              layout
            >
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: isSavedStatus ? "#22C55E" : "#EF4444" }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSavedStatus ? "bg-green-500" : "bg-red-500 animate-ping"}`} />
                  {isSavedStatus ? "MEM_SYNCED" : "EDITS_UNSAVED"}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 text-xs font-bold"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 text-xs font-black rounded-lg transition-transform active:scale-95 border-adaptive-unique"
                    style={{
                      backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                      color: isCyber ? "#050816" : "#fff",
                    }}
                  >
                    💾 Save Note
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsSavedStatus(false); }}
                placeholder="Note Title"
                className="w-full text-base font-black border-none outline-none mb-3 bg-transparent theme-text-primary"
                style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              />

              {/* Hobby Link + Curiosity Row */}
              <div className="flex flex-wrap gap-3 mb-3 pb-3" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.06)" : "1px dashed rgba(0,0,0,0.15)" }}>
                {/* Hobby Dropdown */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0" style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}>
                    ⚡ Link Hobby
                  </span>
                  <select
                    value={hobbyId}
                    onChange={(e) => { setHobbyId(e.target.value); setIsSavedStatus(false); }}
                    className="flex-1 text-[11px] font-bold rounded-lg px-2 py-1 outline-none"
                    style={{
                      background: isCyber ? "rgba(0,0,0,0.4)" : "#FFF",
                      border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                      color: isCyber ? "#00F5FF" : "#1A1A1A",
                    }}
                  >
                    <option value="">— None —</option>
                    {hobbySkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Curiosity Toggle */}
                <button
                  onClick={() => { setIsCuriosity((v) => !v); setIsSavedStatus(false); }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black transition-all"
                  style={{
                    background: isCuriosity
                      ? isCyber ? "rgba(168,85,247,0.2)" : "rgba(255,209,102,0.3)"
                      : isCyber ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
                    border: isCuriosity
                      ? isCyber ? "1px solid rgba(168,85,247,0.5)" : "2px solid #B8860B"
                      : isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px solid rgba(0,0,0,0.2)",
                    color: isCuriosity
                      ? isCyber ? "#A855F7" : "#B8860B"
                      : isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A",
                  }}
                >
                  {isCuriosity ? "🔍" : "○"} {isCuriosity ? "Curiosity" : "Mark Curiosity"}
                </button>
              </div>

              {/* Content area */}
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setIsSavedStatus(false); }}
                placeholder="Start writing..."
                className="w-full flex-1 min-h-[250px] p-3 text-xs md:text-sm font-mono border rounded-xl outline-none resize-none"
                style={{
                  backgroundColor: isCyber ? "rgba(0,0,0,0.2)" : "#FFFDF6",
                  borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#000",
                  color: isCyber ? "#00F5FF" : "#1A1A1A",
                }}
              />

              {/* XP hint */}
              {hobbyId && content.trim() && (
                <p className="text-[10px] font-bold mt-2" style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "#8A8A8A" }}>
                  ⚡ Saving will grant +{(0.1 + content.trim().split(/\s+/).filter(Boolean).length * 0.001).toFixed(3)}% XP to {hobbySkills.find((s) => s.id === hobbyId)?.name}
                </p>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-adaptive-unique p-8 rounded-2xl opacity-60 text-center bg-black/5 dark:bg-white/5">
              <p className="text-xl">📝</p>
              <h3 className="font-black text-sm theme-text-primary mt-2">No Memo Selected</h3>
              <p className="text-xs theme-text-muted mt-1">Select a note from the sidebar or create a new enshrinement.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
