"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Image as ImageIcon, Plus, Maximize2, Tag } from "lucide-react";

export interface MemoryScreenshot {
  id: string;
  url: string;
  caption?: string;
  episode?: string;
  character?: string;
}

export interface DossierMemoryGalleryProps {
  screenshots?: MemoryScreenshot[];
  themeConfig: ThemeAccentConfig;
  onAddScreenshot?: (shot: MemoryScreenshot) => void;
}

export function DossierMemoryGallery({
  screenshots = [],
  themeConfig,
  onAddScreenshot,
}: DossierMemoryGalleryProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [userScreenshots, setUserScreenshots] = useState<MemoryScreenshot[]>(screenshots);
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [epInput, setEpInput] = useState("");

  const handleUpload = () => {
    if (!urlInput.trim()) return;
    const newShot: MemoryScreenshot = {
      id: `shot-${Date.now()}`,
      url: urlInput,
      caption: captionInput || "Drama Memory Screenshot",
      episode: epInput || "Ep 1",
    };
    setUserScreenshots((prev) => [...prev, newShot]);
    onAddScreenshot?.(newShot);
    setUrlInput("");
    setCaptionInput("");
    setEpInput("");
    setShowUploadModal(false);
  };

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon size={20} style={{ color: themeConfig.primaryAccent }} />
          <h2
            className="text-lg font-black tracking-wide"
            style={{
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            }}
          >
            {isCyber ? "// MEMORY GALLERY & SCREENSHOTS" : "Memory Gallery"}
          </h2>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
            color: isCyber ? "#00F5FF" : "#000",
          }}
        >
          <Plus size={14} />
          <span>Attach Screenshot</span>
        </button>
      </div>

      {/* Gallery Grid or Empty State */}
      {userScreenshots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userScreenshots.map((shot) => (
            <motion.div
              key={shot.id}
              whileHover={{ scale: 1.03, y: -3 }}
              onClick={() => setActiveImage({ url: shot.url, title: shot.caption || "Screenshot" })}
              className="group relative aspect-video rounded-xl overflow-hidden border cursor-pointer select-none"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                boxShadow: isCyber ? "0 0 15px rgba(0,0,0,0.5)" : "3px 3px 0px #000000",
              }}
            >
              <img src={shot.url} alt={shot.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  {shot.episode && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-white border border-white/20">
                      {shot.episode}
                    </span>
                  )}
                  <Maximize2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-semibold text-white line-clamp-1">{shot.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => setShowUploadModal(true)}
          className="p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}
        >
          <ImageIcon size={32} className="mb-2 opacity-40" style={{ color: themeConfig.primaryAccent }} />
          <p className="text-xs font-mono font-bold uppercase opacity-70">No screenshots attached yet</p>
          <p className="text-[11px] opacity-50 mt-1">Click to attach favorite scenes, wallpapers, or user screenshots</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <ImageLightboxModal
          isOpen={!!activeImage}
          onClose={() => setActiveImage(null)}
          imageUrl={activeImage.url}
          title={activeImage.title}
        />
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="p-6 rounded-2xl max-w-md w-full border bg-slate-900 text-white relative">
              <h3 className="font-black text-lg mb-4">Attach Memory Screenshot</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-mono opacity-70">Image URL</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono opacity-70">Caption / Scene Memory</label>
                  <input
                    type="text"
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    placeholder="e.g. Sunset scene at Namsan"
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono opacity-70">Episode Number</label>
                  <input
                    type="text"
                    value={epInput}
                    onChange={(e) => setEpInput(e.target.value)}
                    placeholder="e.g. Ep 12"
                    className="w-full p-2 rounded-lg text-xs font-mono border bg-transparent mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 text-xs font-mono border rounded-lg">Cancel</button>
                <button onClick={handleUpload} className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-cyan-500 text-black">Attach Memory</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
