"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, LinkEntry } from "@/lib/store/dashboardStore";

export default function LinksPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { links, saveLink, deleteLink } = useDashboardStore();

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Watch");
  const [customCategory, setCustomCategory] = useState("");

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (!title || !url || !finalCategory) return;

    // Validate URL prefix
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    const newId = "link-" + Math.random().toString(36).substr(2, 9);
    await saveLink(newId, title.trim(), finalUrl, finalCategory);

    // Reset
    setTitle("");
    setUrl("");
    setCustomCategory("");
    setIsOpen(false);
  };

  // Group links by category
  const categoriesMap = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, LinkEntry[]>);

  return (
    <AppShell>
      {/* Page Header */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(191,95,255,0.06))"
            : "linear-gradient(135deg, #FFE4B5, #E1F8FF)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "5px 5px 0 #000",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-black text-3xl font-mono tracking-wide" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
              {isCyber ? "BOOKMARK_ROUTING" : "🔗 Bookmark Directory"}
            </h1>
            <p className="text-xs theme-text-secondary mt-1">
              Store external resource links, streaming directories, and references grouped by customize tags.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border-adaptive-unique shrink-0"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#fff",
            }}
          >
            ➕ Add Bookmark
          </button>
        </div>
      </motion.div>

      {/* Bookmark Sections */}
      <div className="space-y-8">
        {Object.entries(categoriesMap).map(([cat, list]) => (
          <div key={cat} className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest px-3 py-1 rounded inline-block"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "rgba(0,0,0,0.05)",
                color: isCyber ? "#00F5FF" : "#FF6B35",
                border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "1.5px solid #000"
              }}
            >
              📂 {cat}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((link) => (
                <div key={link.id} className="relative group">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <BentoCard>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-sm theme-text-primary group-hover:underline leading-snug">
                            {link.title}
                          </h3>
                          <p className="text-[10px] theme-text-muted mt-1 truncate max-w-[200px] font-mono">
                            {link.url.replace(/^https?:\/\//i, "")}
                          </p>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                            color: isCyber ? "#94A3B8" : "#4A4A4A"
                          }}
                        >
                          🔗 Link
                        </span>
                      </div>
                    </BentoCard>
                  </a>

                  {/* Absolute delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (confirm(`Delete "${link.title}" bookmark?`)) deleteLink(link.id);
                    }}
                    className="absolute top-2 right-2 p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded hover:bg-red-600 z-20"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="text-center py-12 border-adaptive-unique rounded-2xl opacity-60 bg-black/5 dark:bg-white/5">
            <p className="text-2xl">🔗</p>
            <p className="text-xs font-bold theme-text-muted mt-2">No bookmarks saved yet.</p>
          </div>
        )}
      </div>

      {/* Bookmark Add Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="w-full max-w-md pointer-events-auto rounded-2xl p-6 border-adaptive-unique relative overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.2)" : "5px 5px 0 #000",
                }}
              >
                {/* Brackets for Cyber */}
                {isCyber && <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F5FF]" />}

                <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
                  <h3 className="font-black text-base theme-text-primary">New Bookmark</h3>
                  <button onClick={() => setIsOpen(false)} className="text-xs opacity-60">✕</button>
                </div>

                <form onSubmit={handleAddLink} className="space-y-4">
                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Anime Watchlist"
                      className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    />
                  </div>

                  {/* URL */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">URL</label>
                    <input
                      type="text"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g. anime.com"
                      className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                    />
                  </div>

                  {/* Category select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-transparent border-adaptive-unique theme-text-primary cursor-pointer"
                    >
                      <option value="Watch">Watch</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Book">Book</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Custom">Custom Category...</option>
                    </select>
                  </div>

                  {/* Custom category input */}
                  {category === "Custom" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Custom Name</label>
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="e.g. Coding"
                        className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent theme-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-black rounded-lg transition-transform active:scale-95"
                      style={{
                        backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                        color: isCyber ? "#050816" : "#fff",
                      }}
                    >
                      Enshrine Link
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
