"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, NoteEntry } from "@/lib/store/dashboardStore";
import Link from "next/link";
import { FileText, ArrowRight, Sparkles } from "lucide-react";

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function RecentNotesCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { notes = [], hobbySkills = [] } = useDashboardStore();

  const recentNotes = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    return [...notes]
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [notes]);

  const hobbyMap = useMemo(() => {
    const map = new Map<string, string>();
    hobbySkills.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hobbySkills]);

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col justify-between h-full"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255, 209, 102, 0.25)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 15px rgba(255, 209, 102, 0.08)" : "4px 4px 0 #000000",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="notebook">
              📓
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#FFD166" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// NOTEPAD · RECENT THOUGHTS" : "Recent Notes"}
            </h3>
          </div>
          <span className="text-[10px] theme-text-muted">{notes.length} total notes</span>
        </div>

        {/* Notes list */}
        {recentNotes.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-xl border-white/15 my-2">
            <p className="text-xs theme-text-muted italic">No notes recorded yet.</p>
            <Link
              href="/notepad"
              className="mt-2 inline-block text-xs font-bold text-amber-400 hover:underline"
            >
              + Create your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotes.map((note) => {
              const hobbyName = note.hobbyId ? hobbyMap.get(note.hobbyId) : null;
              return (
                <Link
                  key={note.id}
                  href={`/notepad?id=${note.id}`}
                  className="block group"
                >
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-between transition-all group-hover:scale-[1.01]"
                    style={{
                      backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono text-amber-400 shrink-0">
                        ▣
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold theme-text-primary group-hover:text-amber-400 transition-colors truncate">
                          {note.title || "Untitled Note"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] theme-text-muted">
                            Updated {formatRelativeTime(note.updatedAt)}
                          </span>
                          {hobbyName && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded border truncate"
                              style={{
                                backgroundColor: isCyber ? "rgba(255,209,102,0.08)" : "#FEF3C7",
                                borderColor: isCyber ? "rgba(255,209,102,0.3)" : "#FDE68A",
                                color: isCyber ? "#FFD166" : "#B45309",
                              }}
                            >
                              {hobbyName}
                            </span>
                          )}
                          {note.isCuriosity && (
                            <span className="text-[9px] text-pink-400 font-bold">
                              ★ Spark
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ArrowRight
                      size={12}
                      className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400 shrink-0"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] theme-text-muted">Direct editor launcher</span>
        <Link
          href="/notepad"
          className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: isCyber ? "#FFD166" : "#D97706" }}
        >
          <span>Open Notepad</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
