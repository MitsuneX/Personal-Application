"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { HallActivityItem } from "@/lib/utils/hofEngine";

interface HofActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: HallActivityItem[];
}

const TYPE_FILTERS = [
  { id: "all", label: "All Activities", icon: "🌐" },
  { id: "climb", label: "Ranks & Climbs", icon: "📈" },
  { id: "vote", label: "Likes & Votes", icon: "❤️" },
  { id: "favorite", label: "Favorites", icon: "💖" },
  { id: "champion", label: "Champions & GOATs", icon: "👑" },
  { id: "milestone", label: "Milestones", icon: "⚡" },
  { id: "addition", label: "Additions", icon: "✨" },
] as const;

export function HofActivityModal({ isOpen, onClose, activities }: HofActivityModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  const counts = useMemo(() => {
    return {
      all: activities.length,
      climb: activities.filter((a) => a.type === "climb").length,
      vote: activities.filter((a) => a.type === "vote").length,
      favorite: activities.filter((a) => a.type === "favorite").length,
      champion: activities.filter((a) => a.type === "champion" || a.type === "goat").length,
      milestone: activities.filter((a) => a.type === "milestone").length,
      addition: activities.filter((a) => a.type === "addition").length,
    };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesType =
        selectedType === "all" ||
        (selectedType === "champion" && (act.type === "champion" || act.type === "goat")) ||
        act.type === selectedType;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.legendName.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [activities, selectedType, searchQuery]);

  const displayedActivities = useMemo(() => {
    return filteredActivities.slice(0, visibleCount);
  }, [filteredActivities, visibleCount]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Centered Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[88vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl z-10 border"
          style={{
            backgroundColor: isCyber ? "#0B0F19" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
            borderWidth: isCyber ? "1px" : "3px",
            boxShadow: isCyber
              ? "0 25px 50px -12px rgba(0,245,255,0.25)"
              : "8px 8px 0 #000000",
          }}
        >
          {/* Header */}
          <div
            className="p-4 sm:p-5 md:p-6 border-b flex items-center justify-between shrink-0"
            style={{
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
              backgroundColor: isCyber ? "rgba(15,23,42,0.8)" : "#F8FAFC",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🏛️</span>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black font-mono tracking-tight theme-text-primary">
                  Museum Activity & Milestone Feed
                </h2>
                <p className="text-[11px] sm:text-xs font-mono theme-text-muted mt-0.5">
                  Complete real-time historical event record • {activities.length} total events logged
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                color: isCyber ? "#FFF" : "#000",
                borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-3.5 sm:p-4 md:p-5 border-b space-y-3 shrink-0" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activity feed by title, character, or event details..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-mono border focus:outline-none transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                  color: isCyber ? "#FFF" : "#000",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
              <span className="absolute left-3.5 top-3 text-sm opacity-60">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Type Filter Chips with Live Counts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {TYPE_FILTERS.map((tf) => {
                const count = counts[tf.id as keyof typeof counts] || 0;
                const isSelected = selectedType === tf.id;

                return (
                  <button
                    key={tf.id}
                    onClick={() => {
                      setSelectedType(tf.id);
                      setVisibleCount(20);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer"
                    style={{
                      backgroundColor: isSelected
                        ? isCyber
                          ? "rgba(0,245,255,0.2)"
                          : "#FFE600"
                        : isCyber
                        ? "rgba(255,255,255,0.04)"
                        : "#F1F5F9",
                      color: isSelected
                        ? isCyber
                          ? "#00F5FF"
                          : "#000000"
                        : isCyber
                        ? "#94A3B8"
                        : "#64748B",
                      borderColor: isSelected
                        ? isCyber
                          ? "#00F5FF"
                          : "#000000"
                        : isCyber
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: isSelected && !isCyber ? "2px 2px 0 #000" : "none",
                    }}
                  >
                    <span>{tf.icon}</span>
                    <span>{tf.label}</span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded-full"
                      style={{
                        backgroundColor: isSelected
                          ? isCyber
                            ? "rgba(0,245,255,0.3)"
                            : "rgba(0,0,0,0.15)"
                          : isCyber
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 md:p-6 space-y-3 font-mono custom-scrollbar">
            {displayedActivities.length === 0 ? (
              <div className="py-12 text-center text-xs sm:text-sm font-mono theme-text-muted">
                No museum activity logs found matching your filters.
              </div>
            ) : (
              displayedActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 sm:gap-4 transition-all"
                  style={{
                    backgroundColor: isCyber ? "rgba(15,23,42,0.5)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* 1:1 Identity Avatar / Thumbnail with overlay badge */}
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border overflow-hidden relative shrink-0 bg-slate-800 flex items-center justify-center aspect-square"
                      style={{
                        borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                        borderWidth: isCyber ? "1px" : "2px",
                      }}
                    >
                      {act.legendImage ? (
                        <Image
                          src={act.legendImage}
                          alt={act.legendName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xl">
                          {act.type === "champion"
                            ? "👑"
                            : act.type === "goat"
                            ? "💎"
                            : act.type === "climb"
                            ? "📈"
                            : act.type === "vote"
                            ? "❤️"
                            : act.type === "favorite"
                            ? "💖"
                            : act.type === "addition"
                            ? "✨"
                            : "⚡"}
                        </span>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-[10px] p-0.5 rounded-full bg-black/80 border border-white/20">
                        {act.type === "champion"
                          ? "👑"
                          : act.type === "goat"
                          ? "💎"
                          : act.type === "climb"
                          ? "📈"
                          : act.type === "vote"
                          ? "❤️"
                          : act.type === "favorite"
                          ? "💖"
                          : act.type === "addition"
                          ? "✨"
                          : "⚡"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <strong className="theme-text-primary text-xs sm:text-sm font-black truncate block">
                        {act.title}
                      </strong>
                      <span className="theme-text-muted text-[11px] sm:text-xs leading-relaxed block mt-0.5 break-words">
                        {act.description}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-bold font-mono theme-text-muted shrink-0 px-2 sm:px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10 whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>
              ))
            )}

            {/* Load More Button */}
            {displayedActivities.length < filteredActivities.length && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                    color: isCyber ? "#00F5FF" : "#000000",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                    boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.2)" : "3px 3px 0 #000000",
                  }}
                >
                  Load More Events ({filteredActivities.length - displayedActivities.length} remaining) ↓
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
