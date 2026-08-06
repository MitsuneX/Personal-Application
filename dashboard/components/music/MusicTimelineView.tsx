"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store/dashboardStore";

interface MusicTimelineViewProps {
  isCyber: boolean;
}

interface TimelineItem {
  id: string;
  songTitle: string;
  artist: string;
  playedAt: string;
  category?: string;
  imageUrl?: string;
}

export function MusicTimelineView({ isCyber }: MusicTimelineViewProps) {
  const { playTrack, songs } = useDashboardStore();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/music/timeline", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.timeline) {
          setTimelineItems(data.timeline);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const border = isCyber ? "rgba(0,245,255,0.2)" : "#000000";
  const cardBg = isCyber ? "rgba(10,15,44,0.5)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";
  const textMuted = isCyber ? "#94A3B8" : "#555555";
  const accent = isCyber ? "#00F5FF" : "#FF6B35";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-xs font-bold animate-pulse" style={{ color: textMuted }}>
          Loading listening timeline…
        </p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest theme-text-muted">
          ⏳ Listening Timeline ({timelineItems.length})
        </h3>
      </div>

      {timelineItems.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: border, backgroundColor: cardBg }}
        >
          <p className="text-2xl mb-2">📻</p>
          <p className="text-xs font-bold opacity-60" style={{ color: textMuted }}>
            No timeline history recorded yet. Start listening to tracks to build your timeline!
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 space-y-4" style={{ borderColor: border }}>
          {timelineItems.map((item, idx) => {
            const matchingSong = songs.find(
              (s) => s.title.toLowerCase() === item.songTitle.toLowerCase()
            );

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="relative flex items-center gap-3 p-3 rounded-xl border group hover:bg-white/5 transition-all"
                style={{ borderColor: border, backgroundColor: cardBg }}
              >
                {/* Timeline node marker */}
                <div
                  className="absolute -left-[31px] w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: idx === 0 ? accent : isCyber ? "#050816" : "#FFF",
                    borderColor: accent,
                  }}
                />

                {/* Thumb */}
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-700 flex items-center justify-center text-xs"
                  style={{ border: `1px solid ${border}` }}
                >
                  {item.imageUrl || matchingSong?.imageUrl ? (
                    <img
                      src={item.imageUrl || matchingSong?.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>🎵</span>
                  )}
                </div>

                {/* Track details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate" style={{ color: textPrimary }}>
                    {item.songTitle}
                  </p>
                  <p className="text-[10px] opacity-70 truncate" style={{ color: textMuted }}>
                    {item.artist} {item.category ? `• ${item.category}` : ""}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-mono opacity-60" style={{ color: textMuted }}>
                    {formatDate(item.playedAt)}
                  </p>
                  {matchingSong && (
                    <button
                      onClick={() => playTrack(matchingSong)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[9px] font-black px-2 py-0.5 rounded"
                      style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
                    >
                      ▶ Replay
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
