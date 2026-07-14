"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklineChart } from "../charts/SparklineChart";

interface HobbyHoverPopupProps {
  isVisible: boolean;
  x: number;
  y: number;
  skillName: string;
  progress: number;
  totalNotes: number;
  totalWords: number;
  sparkData: { progress: number }[];
  isCyber: boolean;
  color: string;
}

export function HobbyHoverPopup({
  isVisible,
  x,
  y,
  skillName,
  progress,
  totalNotes,
  totalWords,
  sparkData,
  isCyber,
  color,
}: HobbyHoverPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="hobby-popup"
          className="fixed z-50 pointer-events-none"
          style={{ left: x + 16, top: y - 20 }}
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 8 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-xl p-3 min-w-[160px]"
            style={{
              background: isCyber
                ? "rgba(5,8,22,0.95)"
                : "#FFFFFF",
              border: isCyber
                ? "1px solid rgba(0,245,255,0.35)"
                : "2.5px solid #000",
              boxShadow: isCyber
                ? `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}40`
                : "4px 4px 0 #000",
              backdropFilter: isCyber ? "blur(12px)" : "none",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: isCyber ? `0 0 6px ${color}` : "none",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-wider truncate"
                style={{
                  color: isCyber ? "#fff" : "#000",
                  fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
                }}
              >
                {skillName}
              </span>
            </div>

            {/* Progress value */}
            <div
              className="text-2xl font-black leading-none mb-2"
              style={{
                color: isCyber ? color : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
                textShadow: isCyber ? `0 0 12px ${color}` : "none",
              }}
            >
              {progress.toFixed(3)}%
            </div>

            {/* Stats row */}
            <div className="flex gap-3 mb-2">
              <div>
                <div
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
                >
                  Notes
                </div>
                <div
                  className="text-xs font-black"
                  style={{ color: isCyber ? "#fff" : "#1A1A1A" }}
                >
                  {totalNotes}
                </div>
              </div>
              <div>
                <div
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: isCyber ? "rgba(255,255,255,0.4)" : "#8A8A8A" }}
                >
                  Words
                </div>
                <div
                  className="text-xs font-black"
                  style={{ color: isCyber ? "#fff" : "#1A1A1A" }}
                >
                  {totalWords.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Sparkline */}
            {sparkData.length > 1 && (
              <div
                className="rounded overflow-hidden"
                style={{
                  height: 32,
                  background: isCyber ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                  border: isCyber ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <SparklineChart data={sparkData} color={color} isCyber={isCyber} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
