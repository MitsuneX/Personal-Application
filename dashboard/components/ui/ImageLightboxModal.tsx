"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

export interface LightboxImageItem {
  src: string;
  label?: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  images?: (string | LightboxImageItem)[];
  initialIndex?: number;
  title?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  images,
  initialIndex = 0,
  title = "Media Intelligence Viewer",
}: ImageLightboxModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  // Build unified list of images
  const normalizedImages: LightboxImageItem[] = React.useMemo(() => {
    if (images && images.length > 0) {
      return images.map((item, i) =>
        typeof item === "string" ? { src: item, label: `Image ${i + 1}` } : item
      );
    }
    if (imageUrl) {
      return [{ src: imageUrl, label: title }];
    }
    return [];
  }, [images, imageUrl, title]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sync index when initialIndex or opening state changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex < normalizedImages.length ? initialIndex : 0);
      setScale(1);
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, normalizedImages.length]);

  const activeItem = normalizedImages[currentIndex] || { src: imageUrl || "", label: title };
  const currentSrc = activeItem.src;
  const currentLabel = activeItem.label || title;

  const handlePrev = useCallback(() => {
    if (normalizedImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
    setScale(1);
    setDragPosition({ x: 0, y: 0 });
  }, [normalizedImages.length]);

  const handleNext = useCallback(() => {
    if (normalizedImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % normalizedImages.length);
    setScale(1);
    setDragPosition({ x: 0, y: 0 });
  }, [normalizedImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Desktop mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(1, prev + delta), 4);
      if (next === 1) setDragPosition({ x: 0, y: 0 });
      return Number(next.toFixed(2));
    });
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setDragPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSrc) return;
    const a = document.createElement("a");
    a.href = currentSrc;
    a.download = `nexus-image-${Date.now()}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSrc) return;
    window.open(currentSrc, "_blank");
  };

  if (!isOpen || !currentSrc) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative z-[9999]">
          {/* Fullscreen Backdrop Dark Overlay */}
          <motion.div
            className="fixed inset-0 z-[9999] backdrop-blur-2xl transition-opacity duration-300"
            style={{
              backgroundColor: isCyber ? "rgba(3, 7, 18, 0.94)" : "rgba(15, 23, 42, 0.88)",
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Main Content Area Container */}
          <motion.div
            className="fixed inset-0 z-[10000] flex flex-col justify-between p-3 sm:p-5 md:p-6 pointer-events-none select-none overflow-hidden"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* ── Viewer Header Bar ── */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 pointer-events-auto shrink-0 z-50">
              {/* Title & Scale Badge */}
              <div
                className="px-4 py-2 rounded-2xl flex items-center gap-2.5 border shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: isCyber ? "rgba(10, 15, 30, 0.88)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0, 245, 255, 0.35)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber
                    ? "0 0 15px rgba(0, 245, 255, 0.2)"
                    : "3px 3px 0px #000000",
                }}
              >
                <span className="text-base">🖼️</span>
                <span
                  className="font-black text-xs sm:text-sm tracking-tight truncate max-w-[160px] sm:max-w-xs"
                  style={{
                    color: isCyber ? "#F8FAFC" : "#1A1A1A",
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  }}
                >
                  {currentLabel}
                </span>
                {normalizedImages.length > 1 && (
                  <span className="text-[10px] font-mono opacity-60">
                    ({currentIndex + 1} / {normalizedImages.length})
                  </span>
                )}
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ml-1"
                  style={{
                    backgroundColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#E2E8F0",
                    color: isCyber ? "#00F5FF" : "#334155",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "none",
                  }}
                >
                  {Math.round(scale * 100)}%
                </span>
              </div>

              {/* Action Buttons: Open Original, Download, Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenOriginal}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#F1F5F9",
                    color: isCyber ? "#00F5FF" : "#111827",
                    borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                  title="Open Original Image in New Tab"
                >
                  <span>↗</span>
                  <span className="hidden sm:inline">Original</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: isCyber ? "rgba(191, 95, 255, 0.15)" : "#FEF08A",
                    color: isCyber ? "#BF5FFF" : "#854D0E",
                    borderColor: isCyber ? "rgba(191, 95, 255, 0.3)" : "#000000",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                  title="Download Image"
                >
                  <span>💾</span>
                  <span className="hidden sm:inline">Save</span>
                </button>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center font-black text-base cursor-pointer border shadow-md backdrop-blur-md active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(10, 15, 30, 0.88)" : "#FF4444",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#FFFFFF",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber
                      ? "0 0 15px rgba(0, 245, 255, 0.3)"
                      : "3px 3px 0px #000000",
                  }}
                  title="Close Viewer (ESC)"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            {/* ── Image Viewport Box with Gallery Prev/Next ── */}
            <div
              ref={viewportRef}
              onWheel={handleWheel}
              onClick={onClose}
              className="flex-1 w-full max-w-6xl mx-auto my-2 relative overflow-hidden flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
            >
              {/* Previous Image Button */}
              {normalizedImages.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-2 sm:left-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg cursor-pointer border shadow-xl backdrop-blur-md pointer-events-auto"
                  style={{
                    backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "3px 3px 0 #000",
                  }}
                  title="Previous Image (Left Arrow)"
                >
                  ‹
                </motion.button>
              )}

              {/* Image Transform Wrapper */}
              <motion.div
                drag={scale > 1}
                dragConstraints={viewportRef}
                dragElastic={0.08}
                onDoubleClick={handleDoubleTap}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-full max-h-full flex items-center justify-center"
                style={{
                  x: dragPosition.x,
                  y: dragPosition.y,
                }}
              >
                <motion.img
                  key={currentSrc}
                  src={currentSrc}
                  alt={currentLabel}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{ opacity: 1, scale }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                  className="max-h-[68vh] sm:max-h-[74vh] max-w-[85vw] md:max-w-[75vw] w-auto h-auto object-contain rounded-2xl border shadow-2xl pointer-events-auto select-none"
                  style={{
                    borderColor: isCyber ? "rgba(0, 245, 255, 0.45)" : "#000000",
                    borderWidth: isCyber ? "1.5px" : "3px",
                    boxShadow: isCyber
                      ? "0 0 35px rgba(0, 245, 255, 0.25), 0 0 70px rgba(191, 95, 255, 0.15)"
                      : "6px 6px 0px #000000",
                  }}
                />
              </motion.div>

              {/* Next Image Button */}
              {normalizedImages.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-2 sm:right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg cursor-pointer border shadow-xl backdrop-blur-md pointer-events-auto"
                  style={{
                    backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    color: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "3px 3px 0 #000",
                  }}
                  title="Next Image (Right Arrow)"
                >
                  ›
                </motion.button>
              )}
            </div>

            {/* ── Viewer Footer Control Bar ── */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-center pointer-events-auto shrink-0 z-50">
              <div
                className="p-1.5 sm:p-2 rounded-2xl flex items-center gap-2 border shadow-lg backdrop-blur-md"
                style={{
                  backgroundColor: isCyber ? "rgba(10, 15, 30, 0.88)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(0, 245, 255, 0.35)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2.5px",
                  boxShadow: isCyber
                    ? "0 0 20px rgba(0, 245, 255, 0.25)"
                    : "4px 4px 0px #000000",
                }}
              >
                {/* Zoom Out */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center font-black text-sm cursor-pointer disabled:opacity-40"
                  style={{
                    backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#F1F5F9",
                    color: isCyber ? "#00F5FF" : "#1A1A1A",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "1.5px solid #000",
                  }}
                  title="Zoom Out (-)"
                >
                  −
                </motion.button>

                {/* Reset Zoom / Scale Indicator */}
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-mono font-bold cursor-pointer transition-all hover:opacity-80 flex items-center gap-1"
                  style={{
                    backgroundColor: isCyber ? "rgba(191, 95, 255, 0.15)" : "#FEF08A",
                    color: isCyber ? "#BF5FFF" : "#854D0E",
                    border: isCyber ? "1px solid rgba(191,95,255,0.3)" : "1.5px solid #000",
                  }}
                  title="Reset Zoom (100%)"
                >
                  <span>🔄</span>
                  <span>{Math.round(scale * 100)}%</span>
                </button>

                {/* Zoom In */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleZoomIn}
                  disabled={scale >= 4}
                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center font-black text-sm cursor-pointer disabled:opacity-40"
                  style={{
                    backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#F1F5F9",
                    color: isCyber ? "#00F5FF" : "#1A1A1A",
                    border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "1.5px solid #000",
                  }}
                  title="Zoom In (+)"
                >
                  +
                </motion.button>

                {/* Drag hint when zoomed */}
                {scale > 1 && (
                  <span
                    className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-1 rounded ml-1"
                    style={{
                      color: isCyber ? "#00F5FF" : "#4B5563",
                    }}
                  >
                    ✋ Drag to Pan
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

