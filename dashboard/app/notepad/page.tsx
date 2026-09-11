"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, NoteEntry } from "@/lib/store/dashboardStore";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";

type NoteFilterTab = "all" | "curiosity";
type DrawerTab = "notes" | "settings";

function formatNoteDate(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  } catch {
    return "Recently";
  }
}

function NotepadPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { notes, saveNote, deleteNote, hobbySkills, logHobbyXP } = useDashboardStore();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  // Navigation / View state
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("notes");

  // Active note editor buffers
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hobbyId, setHobbyId] = useState<string>("");
  const [isCuriosity, setIsCuriosity] = useState(false);
  const [isSavedStatus, setIsSavedStatus] = useState(true);

  // List view state
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerSearchQuery, setDrawerSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<NoteFilterTab>("all");

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered notes for main list view
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (filterTab === "curiosity" && !n.isCuriosity) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (n.title || "").toLowerCase().includes(q);
      const matchContent = (n.content || "").toLowerCase().includes(q);
      const linkedHobby = hobbySkills.find((s) => s.id === n.hobbyId);
      const matchHobby = linkedHobby?.name.toLowerCase().includes(q);
      return matchTitle || matchContent || matchHobby;
    });
  }, [notes, filterTab, searchQuery, hobbySkills]);

  // Filtered notes for sliding drawer
  const drawerFilteredNotes = useMemo(() => {
    if (!drawerSearchQuery.trim()) return notes;
    const q = drawerSearchQuery.toLowerCase();
    return notes.filter((n) => {
      const matchTitle = (n.title || "").toLowerCase().includes(q);
      const matchContent = (n.content || "").toLowerCase().includes(q);
      const linkedHobby = hobbySkills.find((s) => s.id === n.hobbyId);
      const matchHobby = linkedHobby?.name.toLowerCase().includes(q);
      return matchTitle || matchContent || matchHobby;
    });
  }, [notes, drawerSearchQuery, hobbySkills]);

  // Curiosity count for counter pills
  const curiosityCount = useMemo(() => notes.filter((n) => n.isCuriosity).length, [notes]);

  // Helper to immediately flush and persist pending changes
  const flushSave = useCallback(
    async (
      targetId = activeNoteId,
      curTitle = title,
      curContent = content,
      curHobby = hobbyId,
      curCuriosity = isCuriosity
    ) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      if (!targetId) return;
      const prevContent = notes.find((n) => n.id === targetId)?.content ?? "";
      await saveNote(targetId, curTitle, curContent, curHobby || null, curCuriosity);
      setIsSavedStatus(true);

      // Auto writing XP awarded when linked to hobby
      if (curHobby && curContent.trim() && curContent !== prevContent) {
        await logHobbyXP(curHobby, curContent);
      }
    },
    [activeNoteId, title, content, hobbyId, isCuriosity, notes, saveNote, logHobbyXP]
  );

  // Trigger debounced auto-save (700ms after last keystroke)
  const scheduleAutoSave = useCallback(() => {
    setIsSavedStatus(false);
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      if (!activeNoteId) return;
      const prevContent = notes.find((n) => n.id === activeNoteId)?.content ?? "";
      await saveNote(activeNoteId, title, content, hobbyId || null, isCuriosity);
      setIsSavedStatus(true);

      if (hobbyId && content.trim() && content !== prevContent) {
        await logHobbyXP(hobbyId, content);
      }
    }, 700);
  }, [activeNoteId, title, content, hobbyId, isCuriosity, notes, saveNote, logHobbyXP]);

  // Global hotkeys for editor: Ctrl+S to save, Escape to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        flushSave();
      }
      if (e.key === "Escape") {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, flushSave]);

  // Open note in full-screen editor
  const handleOpenNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setActiveNoteId(id);
    setTitle(note.title);
    setContent(note.content);
    setHobbyId(note.hobbyId ?? "");
    setIsCuriosity(note.isCuriosity ?? false);
    setIsSavedStatus(true);
    setIsEditorOpen(true);
    setIsDrawerOpen(false);
  };

  // Switch note from inside the side drawer without leaving the editor
  const handleSwitchNoteInDrawer = async (id: string) => {
    if (id === activeNoteId) return;
    await flushSave();
    const next = notes.find((n) => n.id === id);
    if (!next) return;
    setActiveNoteId(id);
    setTitle(next.title);
    setContent(next.content);
    setHobbyId(next.hobbyId ?? "");
    setIsCuriosity(next.isCuriosity ?? false);
    setIsSavedStatus(true);
  };

  // Create brand new memo
  const handleCreateNew = async () => {
    await flushSave();
    const newId = "note-" + Math.random().toString(36).substr(2, 9);
    await saveNote(newId, "Untitled Note", "", "", false);
    setActiveNoteId(newId);
    setTitle("Untitled Note");
    setContent("");
    setHobbyId("");
    setIsCuriosity(false);
    setIsSavedStatus(true);
    setIsEditorOpen(true);
    setIsDrawerOpen(false);
  };

  // Return to note list
  const handleBackToList = async () => {
    await flushSave();
    setIsEditorOpen(false);
    setIsDrawerOpen(false);
  };

  // Delete current active note
  const handleDeleteActiveNote = () => {
    if (!activeNoteId) return;
    const activeNote = notes.find((n) => n.id === activeNoteId);
    confirm({
      title: "Delete Notepad Document",
      message: `Are you sure you want to delete note "${activeNote?.title || "Untitled"}"?`,
      confirmText: "Delete Note",
      variant: "danger",
      itemPreview: {
        title: activeNote?.title || "Untitled Note",
        description: activeNote?.content,
        icon: "📄",
        category: activeNote?.isCuriosity ? "💡 Curiosity Log" : "Notepad",
      },
      successToast: `✓ Note "${activeNote?.title || "Untitled"}" deleted.`,
      onConfirm: async () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = null;
        }
        await deleteNote(activeNoteId);
        setIsEditorOpen(false);
        setIsDrawerOpen(false);
        setActiveNoteId(null);
      },
    });
  };

  // Right-click context menu on Note List items
  const handleNoteContextMenu = (e: React.MouseEvent, note: NoteEntry) => {
    e.preventDefault();
    const linkedSkill = hobbySkills.find((s) => s.id === note.hobbyId);

    openContextMenu(
      e,
      [
        {
          id: "open",
          label: "Open Note Editor",
          icon: "📝",
          onClick: () => handleOpenNote(note.id),
        },
        {
          id: "copy",
          label: "Copy Note Text",
          icon: "📋",
          onClick: () => {
            if (typeof window !== "undefined") {
              navigator.clipboard.writeText(`${note.title}\n\n${note.content}`).catch(() => {});
            }
          },
        },
        {
          id: "duplicate",
          label: "Duplicate Note",
          icon: "📄",
          onClick: async () => {
            const newId = "note-" + Math.random().toString(36).substr(2, 9);
            await saveNote(
              newId,
              `${note.title || "Untitled"} (Copy)`,
              note.content,
              note.hobbyId,
              note.isCuriosity
            );
          },
        },
        {
          id: "hobby",
          label: linkedSkill ? `Hobby: ${linkedSkill.name}` : "Connect to Hobby...",
          icon: "⚡",
          onClick: () => {
            handleOpenNote(note.id);
            setDrawerTab("settings");
            setIsDrawerOpen(true);
          },
        },
        ...(linkedSkill
          ? [
              {
                id: "unlink-hobby",
                label: `Disconnect ${linkedSkill.name}`,
                icon: "🔌",
                onClick: async () => {
                  await saveNote(note.id, note.title, note.content, null, note.isCuriosity);
                  if (activeNoteId === note.id) setHobbyId("");
                },
              },
            ]
          : []),
        {
          id: "curiosity",
          label: note.isCuriosity ? "Unmark Curiosity" : "Mark Curiosity",
          icon: "🔍",
          onClick: async () => {
            await saveNote(note.id, note.title, note.content, note.hobbyId, !note.isCuriosity);
            if (activeNoteId === note.id) setIsCuriosity(!note.isCuriosity);
          },
        },
        {
          id: "delete",
          label: "Delete Note",
          icon: "🗑️",
          danger: true,
          divider: true,
          onClick: () => {
            confirm({
              title: "Delete Notepad Document",
              message: `Are you sure you want to delete note "${note.title || "Untitled"}"?`,
              confirmText: "Delete Note",
              variant: "danger",
              itemPreview: {
                title: note.title || "Untitled Note",
                description: note.content,
                icon: "📄",
                category: note.isCuriosity ? "💡 Curiosity Log" : "Notepad",
              },
              successToast: `✓ Note "${note.title || "Untitled"}" deleted.`,
              onConfirm: async () => {
                await deleteNote(note.id);
                if (activeNoteId === note.id) {
                  setIsEditorOpen(false);
                  setActiveNoteId(null);
                }
              },
            });
          },
        },
      ],
      note.title || "Note Actions"
    );
  };

  // Word & Character count calculation
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [content]);

  const charCount = content.length;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const activeHobbySkill = useMemo(() => {
    return hobbySkills.find((s) => s.id === hobbyId);
  }, [hobbySkills, hobbyId]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW 1: NOTE LIST VIEW (Main Mobile-Notes Inspired List)
      ═════════════════════════════════════════════════════════════════════════ */}
      {!isEditorOpen && (
        <motion.div
          key="notepad-list-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div
            className="p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-6"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.06), rgba(255,0,85,0.04))"
                : "linear-gradient(135deg, #FFE4B5, #FFF9E6)",
              border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "4px solid #000",
              boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "6px 6px 0 #000",
            }}
          >
            <div>
              <h1
                className="font-black text-3xl md:text-4xl font-mono tracking-wide"
                style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
              >
                {isCyber ? "TERMINAL_NOTEPAD" : "📝 Notepad Workspace"}
              </h1>
              <p className="text-xs font-bold mt-1 opacity-70">
                A dedicated notes sanctuary. Draft ideas, capture curiosities, or link entries to your Hobbies for automatic XP progression.
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="px-5 py-3 text-xs font-black rounded-xl border-adaptive-unique transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFD166",
                color: isCyber ? "#00F5FF" : "#000",
                boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.25)" : "4px 4px 0 #000",
              }}
            >
              ➕ New Memo
            </button>
          </div>

          {/* Search Bar & Tab Controls */}
          <div
            className="p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-adaptive-unique"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,44,0.4)" : "#FFFFFF",
              boxShadow: isCyber ? "none" : "4px 4px 0 #000",
            }}
          >
            {/* Search input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isCyber ? "SEARCH // title, content, or hobby..." : "Search notes by title or content..."}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono font-bold rounded-xl outline-none border transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#F9FAFB",
                  borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                  color: isCyber ? "#00F5FF" : "#1A1A1A",
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div
              className="flex rounded-xl overflow-hidden border w-full md:w-auto"
              style={{
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                borderWidth: isCyber ? "1px" : "2px",
              }}
            >
              <button
                onClick={() => setFilterTab("all")}
                className="flex-1 md:flex-initial px-4 py-2 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                style={{
                  background: filterTab === "all" ? (isCyber ? "rgba(0,245,255,0.15)" : "#FFD166") : "transparent",
                  color: filterTab === "all" ? (isCyber ? "#00F5FF" : "#000") : isCyber ? "rgba(255,255,255,0.5)" : "#6B7280",
                }}
              >
                <span>📋 All Notes</span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-mono"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  }}
                >
                  {notes.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab("curiosity")}
                className="flex-1 md:flex-initial px-4 py-2 text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                style={{
                  background: filterTab === "curiosity" ? (isCyber ? "rgba(168,85,247,0.2)" : "#FFD166") : "transparent",
                  color: filterTab === "curiosity" ? (isCyber ? "#A855F7" : "#000") : isCyber ? "rgba(255,255,255,0.5)" : "#6B7280",
                }}
              >
                <span>🔍 Curiosity Logs</span>
                {curiosityCount > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold"
                    style={{
                      background: isCyber ? "#A855F7" : "#FF6B35",
                      color: "#fff",
                    }}
                  >
                    {curiosityCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Notes Grid — Modern Mobile-Notes Item Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <AnimatePresence>
              {filteredNotes.map((note) => {
                const linkedSkill = hobbySkills.find((s) => s.id === note.hobbyId);
                const noteWordCount = note.content.trim() ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;

                return (
                  <motion.div
                    key={note.id}
                    layoutId={`note-${note.id}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    onClick={() => handleOpenNote(note.id)}
                    onContextMenu={(e) => handleNoteContextMenu(e, note)}
                    className="p-5 rounded-2xl border-adaptive-unique cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[170px] relative group overflow-hidden"
                    style={{
                      backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
                      boxShadow: isCyber
                        ? "0 0 15px rgba(0,245,255,0.03)"
                        : "4px 4px 0 #000",
                    }}
                  >
                    {/* Top Row: Title + Curiosity indicator */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className="text-base font-black tracking-wide truncate flex-1 theme-text-primary"
                          style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
                        >
                          {note.title || "Untitled Note"}
                        </h3>
                        {note.isCuriosity && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[9px] font-black shrink-0"
                            style={{
                              backgroundColor: isCyber ? "rgba(168,85,247,0.15)" : "rgba(255,209,102,0.3)",
                              color: isCyber ? "#C084FC" : "#B8860B",
                              border: isCyber ? "1px solid rgba(168,85,247,0.4)" : "1.5px solid #B8860B",
                            }}
                          >
                            🔍 Curiosity
                          </span>
                        )}
                      </div>

                      {/* Content excerpt (2-3 lines) */}
                      <p className="text-xs leading-relaxed theme-text-muted line-clamp-3 font-mono">
                        {note.content.trim() ? note.content : "Empty note. Click to start writing..."}
                      </p>
                    </div>

                    {/* Bottom Row: Date + Word count + Linked Hobby Chip */}
                    <div className="pt-4 mt-3 flex items-center justify-between border-t border-adaptive-unique/30 text-[10px] font-mono">
                      <div className="flex items-center gap-2 opacity-60">
                        <span>{formatNoteDate(note.updatedAt)}</span>
                        <span>•</span>
                        <span>{noteWordCount}w</span>
                      </div>

                      {/* Linked Hobby Badge (Preserved & Clickable) */}
                      {linkedSkill && (
                        <span
                          className="px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "rgba(255,107,53,0.15)",
                            color: isCyber ? "#00F5FF" : "#FF6B35",
                            border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "1.5px solid #FF6B35",
                          }}
                          title={`Linked to ${linkedSkill.name} (${linkedSkill.category})`}
                        >
                          ⚡ {linkedSkill.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty state when zero notes */}
          {filteredNotes.length === 0 && (
            <div
              className="p-12 text-center rounded-2xl border-adaptive-unique flex flex-col items-center justify-center gap-3"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.3)" : "#FFF",
              }}
            >
              <span className="text-4xl">📝</span>
              <h3 className="font-black text-sm uppercase tracking-wider theme-text-primary">
                {searchQuery ? "No Matching Notes Found" : "No Notes Saved"}
              </h3>
              <p className="text-xs theme-text-muted max-w-sm">
                {searchQuery
                  ? "Try adjusting your search query or clear the filter."
                  : "Begin your writing sanctuary by creating your first document."}
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-2 px-4 py-2 text-xs font-black rounded-lg border-adaptive-unique transition-transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FFD166",
                  color: isCyber ? "#050816" : "#000",
                }}
              >
                ➕ Create Note
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW 2: DEDICATED FULL-SCREEN NOTE EDITOR
      ═════════════════════════════════════════════════════════════════════════ */}
      {isEditorOpen && (
        <motion.div
          key="notepad-fullscreen-editor"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative min-h-[calc(100vh-140px)] flex flex-col rounded-2xl border-adaptive-unique overflow-hidden"
          style={{
            backgroundColor: isCyber ? "rgba(7,11,32,0.95)" : "#FFFFFF",
            boxShadow: isCyber ? "0 0 35px rgba(0,245,255,0.08)" : "6px 6px 0 #000",
          }}
        >
          {/* Top Header Navigation Toolbar */}
          <div
            className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-adaptive-unique sticky top-0 z-20 backdrop-blur-md"
            style={{
              backgroundColor: isCyber ? "rgba(5,8,24,0.85)" : "#FFFFFF",
            }}
          >
            {/* Left Controls: Back button + Drawer toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="px-3 py-1.5 text-xs font-black rounded-xl border-adaptive-unique transition-transform active:scale-95 flex items-center gap-1.5"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                  color: isCyber ? "#00F5FF" : "#1A1A1A",
                }}
                title="Return to Note List"
              >
                <span>←</span>
                <span>Notes</span>
              </button>

              {/* Side Drawer Toggle Button (Primary Switcher) */}
              <button
                onClick={() => {
                  setDrawerTab("notes");
                  setIsDrawerOpen(!isDrawerOpen);
                }}
                className="px-3 py-1.5 text-xs font-black rounded-xl border-adaptive-unique transition-transform active:scale-95 flex items-center gap-1.5"
                style={{
                  backgroundColor: isDrawerOpen
                    ? isCyber
                      ? "rgba(0,245,255,0.2)"
                      : "#FFD166"
                    : isCyber
                    ? "rgba(0,245,255,0.08)"
                    : "#FFF",
                  color: isCyber ? "#00F5FF" : "#000",
                }}
                title="Toggle Side Note Navigation Drawer"
              >
                <span>{isDrawerOpen ? "▶" : "◀"}</span>
                <span>{isDrawerOpen ? "Close Drawer" : "Switch Notes"}</span>
              </button>
            </div>

            {/* Center: Save / Persistence Status */}
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSavedStatus ? "bg-emerald-400" : "bg-amber-400 animate-ping"
                }`}
              />
              <span style={{ color: isSavedStatus ? "#10B981" : "#F59E0B" }}>
                {isSavedStatus ? "Saved" : "Saving..."}
              </span>
            </div>

            {/* Right Controls: Linked Hobby chip + Manual Save + Settings + Delete */}
            <div className="flex items-center gap-2">
              {/* Linked Hobby indicator badge */}
              {activeHobbySkill ? (
                <button
                  onClick={() => {
                    setDrawerTab("settings");
                    setIsDrawerOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-transform active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "rgba(255,107,53,0.15)",
                    color: isCyber ? "#00F5FF" : "#FF6B35",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "1.5px solid #FF6B35",
                  }}
                  title="Click to view/change connected Hobby"
                >
                  <span>⚡</span>
                  <span>{activeHobbySkill.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDrawerTab("settings");
                    setIsDrawerOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg text-[10px] font-black opacity-60 hover:opacity-100 transition-opacity"
                  style={{
                    color: isCyber ? "rgba(255,255,255,0.6)" : "#6B7280",
                  }}
                  title="Connect this note to a Hobby"
                >
                  + Link Hobby
                </button>
              )}

              {/* Curiosity pill toggle */}
              <button
                onClick={() => {
                  const nextVal = !isCuriosity;
                  setIsCuriosity(nextVal);
                  scheduleAutoSave();
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
                style={{
                  backgroundColor: isCuriosity
                    ? isCyber
                      ? "rgba(168,85,247,0.2)"
                      : "rgba(255,209,102,0.3)"
                    : "transparent",
                  color: isCuriosity ? (isCyber ? "#C084FC" : "#B8860B") : isCyber ? "#6B7280" : "#9CA3AF",
                  border: isCuriosity
                    ? isCyber
                      ? "1px solid rgba(168,85,247,0.4)"
                      : "1.5px solid #B8860B"
                    : "1px solid transparent",
                }}
                title="Toggle Curiosity classification"
              >
                {isCuriosity ? "🔍 Curiosity" : "○ Curiosity"}
              </button>

              {/* Explicit Save button */}
              <button
                onClick={() => flushSave()}
                className="px-3 py-1.5 text-xs font-black rounded-xl border-adaptive-unique transition-transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#fff",
                  boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.3)" : "2px 2px 0 #000",
                }}
                title="Save Now (Ctrl+S)"
              >
                💾 Save
              </button>

              {/* Settings button to trigger drawer tab (toggle behavior) */}
              <button
                onClick={() => {
                  if (isDrawerOpen && drawerTab === "settings") {
                    setIsDrawerOpen(false);
                  } else {
                    setDrawerTab("settings");
                    setIsDrawerOpen(true);
                  }
                }}
                className="p-1.5 rounded-lg border-adaptive-unique text-xs font-bold opacity-80 hover:opacity-100 transition-opacity"
                title="Note Settings & Metadata"
              >
                ⚙️
              </button>

              {/* Delete button */}
              <button
                onClick={handleDeleteActiveNote}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors"
                title="Delete this note"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Main Writing Canvas (Comfortable, Generous Writing Area) */}
          <div className="flex-1 flex flex-col p-6 md:p-10 max-w-4xl mx-auto w-full">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                scheduleAutoSave();
              }}
              placeholder="Note Title"
              className="w-full text-2xl md:text-4xl font-black border-none outline-none mb-4 bg-transparent theme-text-primary tracking-wide"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
            />

            {/* Note Content Textarea — Generous, Distraction-Free */}
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                scheduleAutoSave();
              }}
              placeholder="Start writing your thoughts, documentation, or creative notes here..."
              className="w-full flex-1 min-h-[420px] md:min-h-[520px] text-sm md:text-base font-mono leading-relaxed bg-transparent outline-none resize-none border-none p-0 focus:ring-0 theme-text-primary"
              style={{
                lineHeight: "1.8",
                color: isCyber ? "#E2E8F0" : "#1A1A1A",
              }}
            />

            {/* Bottom Status Bar / XP hint */}
            <div className="mt-8 pt-4 border-t border-adaptive-unique/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono theme-text-muted">
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
                <span>•</span>
                <span>{estimatedReadingTime} min read</span>
              </div>

              {activeHobbySkill && (
                <div
                  className="font-bold flex items-center gap-1.5"
                  style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
                >
                  <span>⚡ Auto XP:</span>
                  <span>
                    +{(0.1 + wordCount * 0.001).toFixed(3)}% XP to {activeHobbySkill.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SLIDING NOTE NAVIGATION DRAWER
          ═════════════════════════════════════════════════════════════════════ */}
          <AnimatePresence>
            {isDrawerOpen && (
              <>
                {/* Backdrop on mobile/tablet */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute inset-0 bg-black z-30 md:hidden"
                />

                {/* Sliding Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="absolute top-0 right-0 bottom-0 w-full sm:w-80 md:w-96 z-40 flex flex-col border-l border-adaptive-unique shadow-2xl"
                  style={{
                    backgroundColor: isCyber ? "#050818" : "#FFF9E6",
                  }}
                >
                  {/* Drawer Header with Tabs + Close button */}
                  <div className="p-4 border-b border-adaptive-unique flex items-center justify-between gap-3">
                    {/* Switcher Tab */}
                    <div
                      className="flex rounded-lg overflow-hidden border"
                      style={{
                        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                        borderWidth: isCyber ? "1px" : "2px",
                      }}
                    >
                      <button
                        onClick={() => setDrawerTab("notes")}
                        className="px-3 py-1.5 text-xs font-black transition-colors"
                        style={{
                          backgroundColor:
                            drawerTab === "notes"
                              ? isCyber
                                ? "rgba(0,245,255,0.2)"
                                : "#FFD166"
                              : "transparent",
                          color: drawerTab === "notes" ? (isCyber ? "#00F5FF" : "#000") : undefined,
                        }}
                      >
                        📋 Notes ({notes.length})
                      </button>
                      <button
                        onClick={() => setDrawerTab("settings")}
                        className="px-3 py-1.5 text-xs font-black transition-colors"
                        style={{
                          backgroundColor:
                            drawerTab === "settings"
                              ? isCyber
                                ? "rgba(0,245,255,0.2)"
                                : "#FFD166"
                              : "transparent",
                          color: drawerTab === "settings" ? (isCyber ? "#00F5FF" : "#000") : undefined,
                        }}
                      >
                        ⚙️ Settings
                      </button>
                    </div>

                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1.5 rounded-lg border-adaptive-unique text-xs font-black hover:bg-red-500/10 transition-colors"
                      title="Close Drawer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Drawer Tab 1: Notes List with Search and Instant Switching */}
                  {drawerTab === "notes" && (
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                      {/* Search inside drawer */}
                      <div className="relative mb-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-50">🔍</span>
                        <input
                          type="text"
                          value={drawerSearchQuery}
                          onChange={(e) => setDrawerSearchQuery(e.target.value)}
                          placeholder="Search other notes..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg outline-none border"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFF",
                            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                            color: isCyber ? "#00F5FF" : "#1A1A1A",
                          }}
                        />
                      </div>

                      {/* New Note Action */}
                      <button
                        onClick={handleCreateNew}
                        className="w-full py-2 px-3 mb-3 text-xs font-black rounded-lg border-adaptive-unique transition-transform active:scale-95 flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FFD166",
                          color: isCyber ? "#00F5FF" : "#000",
                        }}
                      >
                        ➕ New Memo
                      </button>

                      {/* Scrollable list of notes */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin" }}>
                        {drawerFilteredNotes.map((n) => {
                          const isActive = n.id === activeNoteId;
                          const linked = hobbySkills.find((s) => s.id === n.hobbyId);

                          return (
                            <div
                              key={n.id}
                              onClick={() => handleSwitchNoteInDrawer(n.id)}
                              className="p-3 rounded-xl border-adaptive-unique cursor-pointer transition-all relative"
                              style={{
                                backgroundColor: isActive
                                  ? isCyber
                                    ? "rgba(0,245,255,0.15)"
                                    : "#FFF9F0"
                                  : isCyber
                                  ? "rgba(255,255,255,0.02)"
                                  : "#FFF",
                                borderColor: isActive
                                  ? isCyber
                                    ? "#00F5FF"
                                    : "#000"
                                  : isCyber
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.15)",
                                borderWidth: isActive && !isCyber ? "3px" : undefined,
                              }}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <h4 className="text-xs font-black truncate theme-text-primary">
                                  {n.title || "Untitled"}
                                </h4>
                                {isActive && (
                                  <span
                                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor: isCyber ? "#00F5FF" : "#000",
                                      color: isCyber ? "#000" : "#FFF",
                                    }}
                                  >
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] theme-text-muted truncate font-mono mb-2">
                                {n.content.trim() ? n.content : "Empty content..."}
                              </p>
                              <div className="flex items-center justify-between text-[9px] font-mono opacity-60">
                                <span>{formatNoteDate(n.updatedAt)}</span>
                                {linked && (
                                  <span
                                    className="font-bold"
                                    style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
                                  >
                                    ⚡ {linked.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Drawer Tab 2: Settings & Hobby Link Controls */}
                  {drawerTab === "settings" && (
                    <div className="flex-1 p-5 overflow-y-auto space-y-6" style={{ scrollbarWidth: "thin" }}>
                      {/* Section: Hobby Connection (Preserved & Enhanced) */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 theme-text-primary">
                          <span>⚡</span>
                          <span>Hobby Connection</span>
                        </label>
                        <p className="text-[10px] theme-text-muted">
                          Connect this note to an existing skill to automatically earn writing XP upon saving.
                        </p>

                        <select
                          value={hobbyId}
                          onChange={(e) => {
                            setHobbyId(e.target.value);
                            scheduleAutoSave();
                          }}
                          className="w-full text-xs font-bold rounded-xl px-3 py-2 outline-none border-adaptive-unique"
                          style={{
                            background: isCyber ? "rgba(0,0,0,0.5)" : "#FFF",
                            color: isCyber ? "#00F5FF" : "#1A1A1A",
                          }}
                        >
                          <option value="">— None (Unconnected) —</option>
                          {hobbySkills.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.category}) · Lv.{s.level}
                            </option>
                          ))}
                        </select>

                        {activeHobbySkill && (
                          <div
                            className="p-3 rounded-xl border border-adaptive-unique text-xs space-y-1 font-mono mt-2"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#FFF",
                            }}
                          >
                            <div className="flex justify-between">
                              <span className="opacity-60">Category:</span>
                              <span className="font-bold">{activeHobbySkill.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-60">Level:</span>
                              <span className="font-bold">Lv.{activeHobbySkill.level} ({activeHobbySkill.progress.toFixed(1)}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-60">XP Rate:</span>
                              <span className="font-bold text-emerald-500">
                                +{(0.1 + wordCount * 0.001).toFixed(3)}% / save
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section: Curiosity Classification */}
                      <div className="space-y-2 pt-4 border-t border-adaptive-unique/30">
                        <label className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 theme-text-primary">
                          <span>🔍</span>
                          <span>Curiosity Classification</span>
                        </label>
                        <p className="text-[10px] theme-text-muted">
                          Flag this document as an exploratory inquiry or research memo.
                        </p>

                        <button
                          onClick={() => {
                            const nextVal = !isCuriosity;
                            setIsCuriosity(nextVal);
                            scheduleAutoSave();
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-black border-adaptive-unique flex items-center justify-between"
                          style={{
                            backgroundColor: isCuriosity
                              ? isCyber
                                ? "rgba(168,85,247,0.2)"
                                : "#FFD166"
                              : "transparent",
                            color: isCuriosity ? (isCyber ? "#C084FC" : "#000") : undefined,
                          }}
                        >
                          <span>{isCuriosity ? "🔍 Curiosity Log" : "○ Standard Document"}</span>
                          <span className="text-[10px] font-mono">{isCuriosity ? "ENABLED" : "DISABLED"}</span>
                        </button>
                      </div>

                      {/* Section: Document Metadata */}
                      <div className="space-y-2 pt-4 border-t border-adaptive-unique/30 text-xs font-mono">
                        <label className="text-[11px] font-black uppercase tracking-wider font-sans theme-text-primary">
                          📊 Document Analytics
                        </label>
                        <div className="space-y-1.5 text-[10px] opacity-75">
                          <div className="flex justify-between">
                            <span>Words:</span>
                            <span className="font-bold">{wordCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Characters:</span>
                            <span className="font-bold">{charCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Read Time:</span>
                            <span className="font-bold">~{estimatedReadingTime} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="font-bold" style={{ color: isSavedStatus ? "#10B981" : "#F59E0B" }}>
                              {isSavedStatus ? "All changes saved" : "Unsaved changes"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section: Note Actions */}
                      <div className="pt-4 border-t border-adaptive-unique/30 space-y-2">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              navigator.clipboard.writeText(`${title}\n\n${content}`).catch(() => {});
                            }
                          }}
                          className="w-full py-2 text-xs font-black rounded-xl border-adaptive-unique hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                          📋 Copy Note Text
                        </button>
                        <button
                          onClick={handleDeleteActiveNote}
                          className="w-full py-2 text-xs font-black rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          🗑️ Delete Note
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

export default function NotepadPage() {
  return (
    <AppShell>
      <NotepadPageContent />
    </AppShell>
  );
}
