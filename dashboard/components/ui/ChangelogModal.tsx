"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { CHANGELOG_DATA } from "@/lib/data/changelog";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categoriesList = ["All", "New Features", "Bug Fixes & Engine", "UI & Aesthetics", "PWA & Mobile"];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Lock body scroll & listen to Escape key ──────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Centered Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden my-auto"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.96)" : "#FFFBF5",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber
                ? "0 0 50px rgba(0,245,255,0.25), 0 0 100px rgba(191,95,255,0.1)"
                : "8px 8px 0px 0px #000000",
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
            }}
          >
            {/* Header Section (Fixed at top of modal) */}
            <div
              className="p-5 md:p-6 pb-4 border-b shrink-0 space-y-4"
              style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FF6B35",
                      borderColor: isCyber ? "#00F5FF" : "#000000",
                      color: isCyber ? "#00F5FF" : "#FFFFFF",
                      boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.3)" : "3px 3px 0 #000000",
                    }}
                  >
                    📜
                  </div>
                  <div>
                    <h2
                      className="text-lg md:text-xl font-black tracking-wide flex items-center gap-2"
                      style={{
                        fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                        color: isCyber ? "#00F5FF" : "#000000",
                      }}
                    >
                      <span>LOG UPDATES</span>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest border"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFD700",
                          borderColor: isCyber ? "#00F5FF" : "#000000",
                          color: isCyber ? "#00F5FF" : "#000000",
                        }}
                      >
                        CHANGELOG
                      </span>
                    </h2>
                    <p className="text-xs font-semibold opacity-70" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                      Date-stamped release notes & detailed feature history
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-sm font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
                    borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                    color: isCyber ? "#E0E8FF" : "#000000",
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {categoriesList.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="px-3 py-1 text-[11px] md:text-xs font-black rounded-xl border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isActive
                          ? (isCyber ? "rgba(0,245,255,0.2)" : "#FF6B35")
                          : (isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF"),
                        borderColor: isActive
                          ? (isCyber ? "#00F5FF" : "#000000")
                          : (isCyber ? "rgba(255,255,255,0.1)" : "#D1D5DB"),
                        color: isActive
                          ? (isCyber ? "#00F5FF" : "#FFFFFF")
                          : (isCyber ? "#94A3B8" : "#4B5563"),
                        boxShadow: isActive
                          ? (isCyber ? "0 0 10px rgba(0,245,255,0.25)" : "2px 2px 0 #000000")
                          : "none",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Body (Scrollable list area) */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scroll-smooth">
              {CHANGELOG_DATA.map((entry) => {
                const filteredCategories = activeCategory === "All"
                  ? entry.categories
                  : entry.categories.filter((c) => c.name === activeCategory);

                if (activeCategory !== "All" && filteredCategories.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={entry.version}
                    className="p-5 rounded-2xl border transition-all relative overflow-hidden"
                    style={{
                      backgroundColor: isCyber ? "rgba(5, 8, 22, 0.75)" : "#FFF9F0",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2.5px",
                      boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.1)" : "4px 4px 0px #000000",
                    }}
                  >
                    {/* Entry Header */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-dashed"
                      style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.15)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black tracking-wider uppercase border"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
                            borderColor: isCyber ? "#00F5FF" : "#000000",
                            color: isCyber ? "#00F5FF" : "#FFFFFF",
                          }}
                        >
                          {entry.version}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: isCyber ? "rgba(191,95,255,0.2)" : "#FFD166",
                            color: isCyber ? "#BF5FFF" : "#000000",
                          }}
                        >
                          {entry.badge}
                        </span>
                      </div>

                      <span
                        className="text-xs font-mono font-semibold opacity-70 flex items-center gap-1"
                        style={{ color: isCyber ? "#94A3B8" : "#444444" }}
                      >
                        <span>📅</span>
                        <span>{entry.date}</span>
                      </span>
                    </div>

                    {/* Entry Title & Summary */}
                    <h3 className="font-black text-sm md:text-base mb-1" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                      {entry.title}
                    </h3>
                    <p className="text-xs font-medium opacity-80 mb-4 leading-relaxed" style={{ color: isCyber ? "#CBD5E1" : "#333333" }}>
                      {entry.summary}
                    </p>

                    {/* Categorized Bullet Points */}
                    <div className="space-y-3 pt-1">
                      {filteredCategories.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-1.5">
                          <span
                            className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block"
                            style={{
                              backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "rgba(0,0,0,0.06)",
                              color: isCyber ? "#00F5FF" : "#FF6B35",
                            }}
                          >
                            {cat.name}
                          </span>
                          <ul className="space-y-1 pl-1">
                            {cat.items.map((item, itemIdx) => (
                              <li
                                key={itemIdx}
                                className="text-xs font-medium flex items-start gap-2 leading-snug opacity-90"
                                style={{ color: isCyber ? "#E2E8F0" : "#1F2937" }}
                              >
                                <span
                                  className="shrink-0 mt-0.5 font-bold"
                                  style={{ color: isCyber ? "#00F5FF" : "#FF6B35" }}
                                >
                                  ▸
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}