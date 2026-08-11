"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface NewCharacterTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: () => void;
  onSelectTokusatsu: () => void;
}

export function NewCharacterTypeSelector({
  isOpen,
  onClose,
  onSelectArtist,
  onSelectTokusatsu,
}: NewCharacterTypeSelectorProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              backgroundColor: isCyber ? "rgba(5,8,22,0.98)" : "#FFFFFF",
              border: isCyber ? "1.5px solid rgba(0,245,255,0.3)" : "3px solid #000",
              boxShadow: isCyber
                ? "0 0 40px rgba(0,245,255,0.15), 0 20px 60px rgba(0,0,0,0.8)"
                : "8px 8px 0 #000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-7 pt-7 pb-5 border-b"
              style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                    style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
                  >
                    ┼ New Character
                  </p>
                  <h2
                    className="text-xl font-black tracking-tight"
                    style={{
                      color: isCyber ? "#F8FAFC" : "#0F172A",
                      fontFamily: isCyber ? "var(--font-orbitron, monospace)" : "inherit",
                    }}
                  >
                    Choose Character Type
                  </h2>
                  <p
                    className="text-xs mt-1 font-mono"
                    style={{ color: isCyber ? "#94A3B8" : "#64748B" }}
                  >
                    Select the type that best describes this character.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    color: isCyber ? "#94A3B8" : "#475569",
                    border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px solid #CBD5E1",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Type Options */}
            <div className="p-5 space-y-3">
              {/* Artist / Anime */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={onSelectArtist}
                className="w-full text-left p-5 rounded-2xl flex items-start gap-4 cursor-pointer transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#F8FAFC",
                  border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2.5px solid #000",
                  boxShadow: !isCyber ? "3px 3px 0 #000" : "none",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#E0F2FE",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                  }}
                >
                  🎭
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-black text-base"
                      style={{ color: isCyber ? "#F8FAFC" : "#0F172A" }}
                    >
                      Artist / Anime
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#DBEAFE",
                        color: isCyber ? "#00F5FF" : "#1D4ED8",
                        border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "none",
                      }}
                    >
                      Standard Editor
                    </span>
                  </div>
                  <p
                    className="text-xs font-mono leading-relaxed"
                    style={{ color: isCyber ? "#94A3B8" : "#64748B" }}
                  >
                    Actresses, actors, anime characters, singers, VTubers, and other
                    collectible persons or fictional characters.
                  </p>
                </div>
                <span
                  className="text-lg self-center shrink-0"
                  style={{ color: isCyber ? "#00F5FF60" : "#CBD5E1" }}
                >
                  →
                </span>
              </motion.button>

              {/* Tokusatsu */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={onSelectTokusatsu}
                className="w-full text-left p-5 rounded-2xl flex items-start gap-4 cursor-pointer transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(239,68,68,0.06)" : "#FFF1F2",
                  border: isCyber ? "1px solid rgba(239,68,68,0.25)" : "2.5px solid #000",
                  boxShadow: !isCyber ? "3px 3px 0 #000" : "none",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(239,68,68,0.15)" : "#FEE2E2",
                    border: isCyber ? "1px solid rgba(239,68,68,0.35)" : "2px solid #000",
                  }}
                >
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-black text-base"
                      style={{ color: isCyber ? "#F8FAFC" : "#0F172A" }}
                    >
                      Tokusatsu
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isCyber ? "rgba(239,68,68,0.2)" : "#FEE2E2",
                        color: isCyber ? "#FCA5A5" : "#B91C1C",
                        border: isCyber ? "1px solid rgba(239,68,68,0.4)" : "none",
                      }}
                    >
                      Dedicated Editor
                    </span>
                  </div>
                  <p
                    className="text-xs font-mono leading-relaxed"
                    style={{ color: isCyber ? "#94A3B8" : "#64748B" }}
                  >
                    Ultraman, Kamen Rider, Power Rangers, Super Sentai. Opens the
                    dedicated Tokusatsu Hero &amp; Armor System editor.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {["⚡ Ultraman", "🏍️ Kamen Rider", "🔴 Power Rangers", "🛡️ Super Sentai"].map((f) => (
                      <span
                        key={f}
                        className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: isCyber ? "rgba(239,68,68,0.1)" : "#FECDD3",
                          color: isCyber ? "#FCA5A5" : "#9F1239",
                          borderColor: isCyber ? "rgba(239,68,68,0.25)" : "#FDA4AF",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className="text-lg self-center shrink-0"
                  style={{ color: isCyber ? "rgba(239,68,68,0.5)" : "#CBD5E1" }}
                >
                  →
                </span>
              </motion.button>
            </div>

            {/* Footer note */}
            <div className="px-7 pb-6 pt-1">
              <p
                className="text-[10px] font-mono text-center"
                style={{ color: isCyber ? "#475569" : "#94A3B8" }}
              >
                This selection determines the editor and how the character is classified in the database.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
