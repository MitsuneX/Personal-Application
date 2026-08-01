"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { getBadgesForEntry } from "@/lib/utils/hofEngine";

interface HofCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  legends: HallOfFameEntry[];
}

export function HofCompareModal({ isOpen, onClose, legends }: HofCompareModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  if (!isOpen || !legends || legends.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-5xl rounded-3xl border overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
          style={{
            backgroundColor: isCyber ? "#080C1C" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "0 0 45px rgba(0, 245, 255, 0.25)" : "8px 8px 0 #000000",
          }}
        >
          {/* Header */}
          <div
            className="p-5 flex items-center justify-between border-b"
            style={{
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
              backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FEF08A",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚔️</span>
              <h2 className="text-xl font-black theme-text-primary tracking-tight">
                Side-by-Side Legend Comparison ({legends.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-black/10 dark:bg-white/10 theme-text-primary hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Comparison Matrix Grid */}
          <div className="p-6 overflow-x-auto overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 min-w-[550px]">
              {legends.map((item) => {
                const badges = getBadgesForEntry(item);
                const works = Array.isArray(item.knownFor) ? item.knownFor : [item.knownFor].filter(Boolean);

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border flex flex-col space-y-4 font-mono text-xs"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                      borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: !isCyber ? "3px 3px 0 #000" : "none",
                    }}
                  >
                    {/* Portrait & Name */}
                    <div className="text-center space-y-2">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 mx-auto flex items-center justify-center font-black text-2xl bg-black/10">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{item.name.charAt(0)}</span>
                        )}
                      </div>
                      <h3 className="font-black text-sm theme-text-primary">{item.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                        {item.status}
                      </span>
                    </div>

                    {/* Stats Rows */}
                    <div className="space-y-2 border-t pt-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Type / Category:</span>
                        <strong className="theme-text-primary uppercase">{item.type}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Origin Nation:</span>
                        <strong className="theme-text-primary">{item.nationality || "Global"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="theme-text-muted">Community Votes:</span>
                        <strong className="text-pink-400 font-bold">{item.likes || 0} ❤️</strong>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="space-y-1 border-t pt-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                      <span className="text-[10px] theme-text-muted uppercase font-bold block">BADGES</span>
                      <div className="flex flex-wrap gap-1">
                        {badges.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded text-[9px] font-bold border"
                            style={{ backgroundColor: b.bg, color: b.color, borderColor: `${b.color}50` }}
                          >
                            {b.icon} {b.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Known For */}
                    <div className="space-y-1 border-t pt-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
                      <span className="text-[10px] theme-text-muted uppercase font-bold block">MASTERPIECES</span>
                      <div className="flex flex-wrap gap-1">
                        {works.map((w, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[9px] bg-black/10 dark:bg-white/10 theme-text-primary">
                            🎬 {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
