"use client";

import React, { useEffect, useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { motion, AnimatePresence } from "framer-motion";

export function SessionResumePrompt() {
  const { playTrack, setPlaylistQueue } = useDashboardStore();
  const [session, setSession] = useState<{
    track: any;
    currentTime: number;
    queue: any[];
    loopMode?: string;
    isShuffle?: boolean;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("music_playback_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.track && parsed?.track?.id) {
          setSession(parsed);
          setVisible(true);
        }
      }
    } catch {}
  }, []);

  const handleResume = () => {
    if (!session) return;
    if (session.queue && session.queue.length > 0) {
      setPlaylistQueue(session.queue);
    }
    playTrack(session.track);
    setVisible(false);
    localStorage.removeItem("music_playback_session");
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.removeItem("music_playback_session");
  };

  return (
    <AnimatePresence>
      {visible && session && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl border bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl max-w-sm w-full select-none"
          style={{ borderColor: "rgba(0, 245, 255, 0.4)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
              {session.track.imageUrl ? (
                <img src={session.track.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">📻</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Resume Previous Session?
              </p>
              <p className="text-xs font-black truncate text-white">{session.track.title}</p>
              <p className="text-[10px] opacity-70 truncate text-slate-300">{session.track.artist}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleResume}
              className="px-4 py-1.5 text-xs font-black rounded-lg bg-cyan-400 text-black hover:scale-105 active:scale-95 transition-transform"
            >
              ▶ Resume Listening
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
