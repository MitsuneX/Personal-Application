"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { CHANGELOG_DATA } from "@/lib/data/changelog";
import { motion } from "framer-motion";

export default function ChangelogPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categoriesList = ["All", "New Features", "Bug Fixes & Engine", "UI & Aesthetics", "PWA & Mobile"];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 select-none py-4">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden p-6 md:p-8 border"
          style={{
            background: isCyber
              ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.08), rgba(191,95,255,0.05))"
              : "linear-gradient(135deg, #FFF9C4, #FFF)",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
            boxShadow: isCyber ? "0 0 45px rgba(0,245,255,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📜</span>
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFD700",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#000000",
                  }}
                >
                  RELEASE LOGS
                </span>
              </div>
              <h1
                className="font-black text-3xl md:text-5xl tracking-wide"
                style={{
                  color: isCyber ? "#00F5FF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                }}
              >
                SYSTEM LOG UPDATES
              </h1>
              <p className="text-xs font-semibold opacity-70 mt-1" style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                Complete date-stamped release notes, bug fixes, and feature breakdown for Nexus Xenon
              </p>
            </div>

            <div
              className="px-4 py-2 rounded-xl border text-center font-mono font-black text-xs shrink-0"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFFFFF",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.2)" : "3px 3px 0 #000000",
              }}
            >
              CURRENT BUILD: v2.5.0
            </div>
          </div>
        </motion.div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer"
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
                    ? (isCyber ? "0 0 12px rgba(0,245,255,0.25)" : "2px 2px 0 #000000")
                    : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Updates Feed */}
        <div className="space-y-6">
          {CHANGELOG_DATA.map((entry) => {
            const filteredCategories = activeCategory === "All"
              ? entry.categories
              : entry.categories.filter((c) => c.name === activeCategory);

            if (activeCategory !== "All" && filteredCategories.length === 0) return null;

            return (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border transition-all relative overflow-hidden"
                style={{
                  backgroundColor: isCyber ? "rgba(5, 8, 22, 0.85)" : "#FFF9F0",
                  borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.12)" : "5px 5px 0px #000000",
                }}
              >
                {/* Entry Header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-dashed"
                  style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(0,0,0,0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-lg font-mono text-sm font-black tracking-wider uppercase border"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
                        borderColor: isCyber ? "#00F5FF" : "#000000",
                        color: isCyber ? "#00F5FF" : "#FFFFFF",
                      }}
                    >
                      {entry.version}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: isCyber ? "rgba(191,95,255,0.2)" : "#FFD166",
                        color: isCyber ? "#BF5FFF" : "#000000",
                      }}
                    >
                      {entry.badge}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-semibold opacity-80 flex items-center gap-1.5"
                    style={{ color: isCyber ? "#94A3B8" : "#444444" }}>
                    <span>📅</span>
                    <span>{entry.date}</span>
                  </span>
                </div>

                {/* Entry Title & Summary */}
                <h2 className="font-black text-lg md:text-xl mb-1.5" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                  {entry.title}
                </h2>
                <p className="text-xs md:text-sm font-medium opacity-85 mb-5 leading-relaxed" style={{ color: isCyber ? "#CBD5E1" : "#333333" }}>
                  {entry.summary}
                </p>

                {/* Detailed Categorized Items */}
                <div className="space-y-4 pt-1">
                  {filteredCategories.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-2">
                      <span
                        className="text-[11px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded inline-block"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "rgba(0,0,0,0.06)",
                          color: isCyber ? "#00F5FF" : "#FF6B35",
                        }}
                      >
                        {cat.name}
                      </span>
                      <ul className="space-y-1.5 pl-1">
                        {cat.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="text-xs md:text-sm font-medium flex items-start gap-2.5 leading-snug opacity-90"
                            style={{ color: isCyber ? "#E2E8F0" : "#1F2937" }}
                          >
                            <span className="shrink-0 text-cyan-400 mt-0.5">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
