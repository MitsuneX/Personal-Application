"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";

export default function GalleryPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { gallery, addGalleryItem, deleteGalleryItem } = useDashboardStore();

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [lightboxTags, setLightboxTags] = useState<string[]>([]);

  const handleAddTag = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = tagInput.trim().replace(/#/g, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^\//.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    const newId = "gallery-" + Math.random().toString(36).substr(2, 9);
    await addGalleryItem(newId, title.trim(), finalUrl, caption.trim(), tags);

    // Reset
    setTitle("");
    setUrl("");
    setCaption("");
    setTags([]);
    setIsOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this image from your gallery?")) {
      await deleteGalleryItem(id);
    }
  };

  return (
    <AppShell>
      {/* Page Header */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(57,255,20,0.04))"
            : "linear-gradient(135deg, #FFE4B5, #F5FFFA)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "5px 5px 0 #000",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-black text-3xl font-mono tracking-wide" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}>
              {isCyber ? "TELEMETRY_GALLERY" : "🖼️ Media Gallery"}
            </h1>
            <p className="text-xs theme-text-secondary mt-1">
              Curate a catalog of favorite screenshots, designs, or concept illustrations synced to your server.
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
            ➕ Add Image
          </button>
        </div>
      </motion.div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`gallery-${item.id}`}
            onClick={() => {
              setLightboxUrl(item.url);
              setLightboxTitle(item.title);
              setLightboxCaption(item.caption || null);
              setLightboxTags(item.tags || []);
            }}
            className="group relative cursor-pointer overflow-hidden rounded-xl border-adaptive-unique aspect-video bg-black/20"
            whileHover={{ scale: 1.02 }}
          >
            {/* Image render */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // Fallback for broken links
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";
              }}
            />

            {/* Hover overlay description */}
            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
              <h3 className="text-white text-xs font-black truncate">{item.title}</h3>
              {item.caption && <p className="text-[10px] text-white/70 line-clamp-2 mt-0.5">{item.caption}</p>}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-1 py-0.25 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 rounded font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-[#00F5FF] font-mono mt-1">Click to expand</p>
            </div>

            {/* Quick delete button */}
            <button
              onClick={(e) => handleDelete(item.id, e)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 text-[10px]"
            >
              🗑️
            </button>
          </motion.div>
        ))}

        {gallery.length === 0 && (
          <div className="col-span-full text-center py-16 border-adaptive-unique rounded-2xl opacity-60 bg-black/5 dark:bg-white/5">
            <p className="text-3xl">🖼️</p>
            <p className="text-xs font-bold theme-text-muted mt-2">No photos in the gallery registry yet.</p>
          </div>
        )}
      </div>

      {/* Add Image Overlay dialog */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="max-w-md">
        <div className="p-6 relative">
          {/* Brackets for Cyber */}
          {isCyber && <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00F5FF]" />}

          <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px dashed #000" }}>
            <h3 className="font-black text-base theme-text-primary">Add Gallery Image</h3>
            <button onClick={() => setIsOpen(false)} className="text-xs opacity-60">✕</button>
          </div>

           <form onSubmit={handleAddImage} className="space-y-4">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Grid Setup"
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
              />
            </div>

            {/* Image URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Image Link URL</label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
              />
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Clean workspace theme detail layout"
                rows={2}
                className="px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
              />
            </div>

            {/* Tag Builder */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const clean = tagInput.trim().replace(/#/g, "");
                      if (clean && !tags.includes(clean)) {
                        setTags([...tags, clean]);
                      }
                      setTagInput("");
                    }
                  }}
                  placeholder="Type a tag & press Enter"
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique theme-text-primary"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-black/5 dark:bg-white/5 theme-text-primary"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)",
                        color: isCyber ? "#00F5FF" : "#FF6B35",
                        border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                      }}
                      onClick={() => handleRemoveTag(idx)}
                    >
                      #{tag} <span className="opacity-60 text-[8px] font-bold">✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setUrl("");
                  setCaption("");
                  setTags([]);
                  setIsOpen(false);
                }}
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
                Add Photo
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Lightbox Modal */}
      <Modal isOpen={!!lightboxUrl} onClose={() => setLightboxUrl(null)} maxWidth="max-w-4xl">
        <div className="relative rounded-2xl overflow-hidden flex flex-col md:flex-row bg-[#050816] border border-adaptive-unique">
          <div className="flex-1 bg-black/40 flex items-center justify-center p-2">
            <img
              src={lightboxUrl || ""}
              alt={lightboxTitle}
              className="max-w-full max-h-[75vh] object-contain block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
              }}
            />
          </div>

          <div className="w-full md:w-80 p-5 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-adaptive-unique" style={{ backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FDFDFD" }}>
            <div>
              <h4 className="text-base font-black theme-text-primary uppercase tracking-wider">{lightboxTitle}</h4>
              {lightboxCaption && <p className="text-xs theme-text-secondary mt-2 leading-relaxed">{lightboxCaption}</p>}
            </div>

            {lightboxTags.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider theme-text-muted mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {lightboxTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.06)",
                        color: isCyber ? "#00F5FF" : "#FF6B35",
                        border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "1.5px solid #000",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setLightboxUrl(null)}
              className="mt-auto w-full py-2 rounded-xl text-xs font-bold border border-adaptive-unique bg-transparent theme-text-primary"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
