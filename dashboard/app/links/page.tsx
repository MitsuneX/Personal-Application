"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, type LinkEntry } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";
import { buildBookmarkMenu } from "@/lib/context-menu/builders";

export default function LinksPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { links, saveLink, deleteLink } = useDashboardStore();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Watch");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (!title || !url || !finalCategory) return;

    // Validate URL prefix
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    const finalId = editId || "link-" + Math.random().toString(36).substr(2, 9);
    await saveLink(finalId, title.trim(), finalUrl, finalCategory);

    // Reset
    setEditId(null);
    setTitle("");
    setUrl("");
    setCustomCategory("");
    setIsOpen(false);
  };

  const handleCloseModal = () => {
    setEditId(null);
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

  const allCategories = ["All", ...Object.keys(categoriesMap)];

  const displayedCategories = Object.entries(categoriesMap).filter(([cat]) => {
    if (selectedFilter === "All") return true;
    return cat === selectedFilter;
  });

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
            onClick={() => {
              setEditId(null);
              setTitle("");
              setUrl("");
              setCustomCategory("");
              setIsOpen(true);
            }}
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

      {/* Category Filter */}
      {allCategories.length > 1 && (
        <div
          className="mb-6 p-1.5 rounded-xl flex flex-wrap gap-1.5 text-xs font-bold w-fit max-w-full border overflow-x-auto"
          style={{
            backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
            borderWidth: isCyber ? "1.5px" : "3px",
            boxShadow: isCyber ? "none" : "4px 4px 0 #000",
          }}
        >
          {allCategories.map(cat => {
            const isActive = selectedFilter === cat;
            return (
              <button key={cat}
                onClick={() => setSelectedFilter(cat)}
                className="py-1.5 px-3 rounded-lg transition-all uppercase tracking-wider text-[10px] whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: isActive ? (isCyber ? "rgba(0,245,255,0.2)" : "#FF6B35") : "transparent",
                  color: isActive ? (isCyber ? "#00F5FF" : "#FFF") : (isCyber ? "rgba(0,245,255,0.6)" : "#444"),
                  border: isActive && !isCyber ? "2px solid #000" : "2px solid transparent",
                }}
              >
                {cat === "All" ? "📂 All Tags" : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Bookmark Sections */}
      <div className="space-y-8">
        {displayedCategories.map(([cat, list]) => (
          <div key={cat} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black uppercase tracking-widest px-3 py-1 rounded inline-block"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "rgba(0,0,0,0.05)",
                  color: isCyber ? "#00F5FF" : "#FF6B35",
                  border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "1.5px solid #000"
                }}
              >
                📂 {cat} <span className="text-[9px] font-mono opacity-60 ml-1">({list.length})</span>
              </h2>
              <button
                onClick={() => {
                  setEditId(null); setTitle(""); setUrl("");
                  if (["Watch", "Entertainment", "Book", "Productivity", "Misc"].includes(cat)) {
                    setCategory(cat); setCustomCategory("");
                  } else {
                    setCategory("Custom"); setCustomCategory(cat);
                  }
                  setIsOpen(true);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-transform active:scale-95 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                  color: isCyber ? "#00F5FF" : "#000",
                  boxShadow: isCyber ? "none" : "1.5px 1.5px 0 #000",
                }}
                title={`Add bookmark to ${cat}`}
              >＋</button>
              <div className="flex-1 h-px" style={{ background: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.08)" }} />
            </div>

            {/* Premium Bookmark Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((link, li) => {
                let domain = "";
                try { domain = new URL(link.url).hostname; } catch {}
                const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : "";

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: li * 0.04 }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openContextMenu(
                        e,
                        buildBookmarkMenu({
                          bookmark: link,
                          onOpenLink: () => window.open(link.url, "_blank"),
                          onCopyUrl: () => navigator.clipboard.writeText(link.url).catch(() => {}),
                          onEdit: () => {
                            setEditId(link.id);
                            setTitle(link.title);
                            setUrl(link.url);
                            if (["Watch", "Entertainment", "Book", "Productivity", "Misc"].includes(link.category)) {
                              setCategory(link.category);
                              setCustomCategory("");
                            } else {
                              setCategory("Custom");
                              setCustomCategory(link.category);
                            }
                            setIsOpen(true);
                          },
                          onDelete: () => {
                            confirm({
                              title: "Delete Bookmark Link",
                              message: `Delete bookmark "${link.title}"?`,
                              confirmText: "Delete Bookmark",
                              variant: "danger",
                              itemPreview: { title: link.title, subtitle: link.url, icon: "🔗", category: link.category },
                              successToast: `✓ Bookmark "${link.title}" deleted.`,
                              onConfirm: async () => { await deleteLink(link.id); },
                            });
                          },
                        }),
                        link.title
                      );
                    }}
                    className="relative group rounded-2xl overflow-hidden cursor-context-menu"
                    style={{
                      backgroundColor: isCyber ? "rgba(10,15,30,0.8)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
                      borderWidth: isCyber ? "1px" : "2.5px",
                      boxShadow: isCyber ? "0 4px 20px rgba(0,0,0,0.4)" : "4px 4px 0 #000",
                    }}
                    whileHover={{
                      y: -3,
                      boxShadow: isCyber ? "0 8px 30px rgba(0,245,255,0.15)" : "6px 6px 0 #000",
                    }}
                  >
                    {/* Card body - clickable */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4"
                    >
                      <div className="flex items-start gap-3">
                        {/* Favicon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border"
                          style={{
                            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                            borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                          }}
                        >
                          {faviconUrl ? (
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-5 h-5 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <span className="text-base">🔗</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-sm theme-text-primary group-hover:underline leading-snug line-clamp-1">
                            {link.title}
                          </h3>
                          <p className="text-[10px] theme-text-muted mt-0.5 truncate font-mono">
                            {domain || link.url.replace(/^https?:\/\//i, "")}
                          </p>
                        </div>

                        {/* Quick launch icon */}
                        <span
                          className="text-xs shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                          style={{ color: isCyber ? "#00F5FF" : "#1A1A1A" }}
                        >↗</span>
                      </div>

                      {/* Category badge */}
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#F1F5F9",
                            color: isCyber ? "rgba(0,245,255,0.7)" : "#64748B",
                            border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "1px solid #E2E8F0",
                          }}
                        >
                          {link.category}
                        </span>
                      </div>
                    </a>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); e.preventDefault();
                          setEditId(link.id); setTitle(link.title); setUrl(link.url);
                          if (["Watch", "Entertainment", "Book", "Productivity", "Misc"].includes(link.category)) {
                            setCategory(link.category); setCustomCategory("");
                          } else {
                            setCategory("Custom"); setCustomCategory(link.category);
                          }
                          setIsOpen(true);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all active:scale-95 cursor-pointer border"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F7FA",
                          color: isCyber ? "#00F5FF" : "#006064",
                          borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000",
                        }}
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); e.preventDefault();
                          confirm({
                            title: "Delete Bookmark Link",
                            message: `Delete bookmark "${link.title}"?`,
                            confirmText: "Delete Bookmark",
                            variant: "danger",
                            itemPreview: { title: link.title, subtitle: link.url, icon: "🔗", category: link.category },
                            successToast: `✓ Bookmark "${link.title}" deleted.`,
                            onConfirm: async () => { await deleteLink(link.id); },
                          });
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all active:scale-95 cursor-pointer border"
                        style={{
                          backgroundColor: isCyber ? "rgba(239,68,68,0.15)" : "#FEE2E2",
                          color: "#EF4444",
                          borderColor: isCyber ? "rgba(239,68,68,0.4)" : "#000",
                        }}
                        title="Delete"
                      >🗑️</button>
                    </div>
                  </motion.div>
                );
              })}
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
      <Modal isOpen={isOpen} onClose={handleCloseModal} maxWidth="max-w-md">
        <div className="p-6 relative">
          {/* Brackets for Cyber */}
          {isCyber && <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F5FF]" />}

          <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
            <h3 className="font-black text-base theme-text-primary">{editId ? "Edit Bookmark" : "New Bookmark"}</h3>
            <button onClick={handleCloseModal} className="text-xs opacity-60">✕</button>
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
                <option value="Watch" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Watch</option>
                <option value="Entertainment" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Entertainment</option>
                <option value="Book" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Book</option>
                <option value="Productivity" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Productivity</option>
                <option value="Misc" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Misc</option>
                <option value="Custom" className={isCyber ? "bg-[#0b0f2a] text-[#E0E8FF]" : "bg-white text-black"}>Custom Category...</option>
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
                onClick={handleCloseModal}
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
                {editId ? "Save Changes" : "Enshrine Link"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </AppShell>
  );
}
