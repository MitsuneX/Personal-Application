"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OverlayPortal } from "@/components/ui/OverlayPortal";
import { Z_INDEX } from "@/components/ui/ViewportBoundary";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/ToastProvider";

export interface VideoCropData {
  x: number;               // -60% to 60%
  y: number;               // -60% to 60%
  zoom: number;            // 1.0 to 3.0 (1.0 = Full Original Video)
  aspect: number;          // 0.75 for 3:4 aspect ratio
  posterUrl?: string;      // Generated poster frame URL
  posterTimestamp?: number;// Video playback timestamp (seconds) used for poster frame
  customPosterUrl?: string;// Optional user-uploaded custom poster image
  originalUrl?: string;    // Preserved source MP4 URL
}

interface VideoCropModalProps {
  isOpen: boolean;
  videoSrc: string | null;
  aspect?: number; // 3/4 = 0.75
  title?: string;
  initialCropData?: Partial<VideoCropData> | null;
  onClose: () => void;
  onConfirm: (cropData: VideoCropData, posterBlob?: Blob | null) => void;
}

export function VideoCropModal({
  isOpen,
  videoSrc,
  aspect = 3 / 4,
  title = "Position & Frame Card Video",
  initialCropData,
  onClose,
  onConfirm,
}: VideoCropModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { error: toastError, success: toastSuccess } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const customPosterInputRef = useRef<HTMLInputElement>(null);

  // ── Default: Neutral Zoom 1.0 for new uploads (Full Source Video First) ───
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [customPosterUrl, setCustomPosterUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  // ── Sync initial values: New uploads start at neutral 1.0 zoom (Full Source) ──
  useEffect(() => {
    if (isOpen) {
      setX(initialCropData?.x !== undefined ? initialCropData.x : 0);
      setY(initialCropData?.y !== undefined ? initialCropData.y : 0);
      setZoom(initialCropData?.zoom !== undefined ? initialCropData.zoom : 1.0);
      setCustomPosterUrl(initialCropData?.customPosterUrl || null);
      setIsPlaying(true);
      setIsProcessing(false);
    }
  }, [isOpen, initialCropData]);

  // ── Play/Pause toggle ────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // ── Time scrub ───────────────────────────────────────────────────────────
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // ── Drag Pan Handlers ───────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x, y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Convert pixels to percentage of container bounds
    const pctX = (deltaX / bounds.width) * 100;
    const pctY = (deltaY / bounds.height) * 100;

    // Clamp offsets between -60% and 60%
    const newX = Math.min(60, Math.max(-60, initialPos.x + pctX));
    const newY = Math.min(60, Math.max(-60, initialPos.y + pctY));

    setX(Math.round(newX * 10) / 10);
    setY(Math.round(newY * 10) / 10);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // ── Optional Custom Poster Upload ────────────────────────────────────────
  const handleCustomPosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastError("Custom poster must be an image file (PNG, JPG, WebP).");
      return;
    }

    setIsUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.url) {
        setCustomPosterUrl(json.url);
        toastSuccess("Custom poster uploaded successfully!");
      } else {
        throw new Error(json.error || "Poster upload failed.");
      }
    } catch (err: any) {
      toastError(err?.message || "Failed to upload custom poster.");
    } finally {
      setIsUploadingPoster(false);
      e.target.value = "";
    }
  };

  // ── Framing Helpers ──────────────────────────────────────────────────────
  const handleReset = () => {
    setX(0);
    setY(0);
    setZoom(1.0); // Full source video view
  };

  const handleFill = () => {
    setZoom(1.35); // Fill 3:4 crop boundary
    setX(0);
    setY(0);
  };

  // ── Poster Capture & Confirmation ───────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    const video = videoRef.current;
    let posterBlob: Blob | null = null;

    if (video && video.videoWidth && video.videoHeight) {
      try {
        const canvas = document.createElement("canvas");
        const canvasWidth = 600;
        const canvasHeight = Math.round(canvasWidth / aspect); // 800px for 3:4 aspect
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Draw framed video onto canvas matching transform
          ctx.save();
          ctx.translate(canvasWidth / 2, canvasHeight / 2);
          ctx.scale(zoom, zoom);
          ctx.translate((x / 100) * canvasWidth, (y / 100) * canvasHeight);

          // Draw centered video
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const vAspect = vw / vh;
          let drawW = canvasWidth;
          let drawH = canvasWidth / vAspect;
          if (drawH < canvasHeight) {
            drawH = canvasHeight;
            drawW = canvasHeight * vAspect;
          }

          ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();

          posterBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
          });
        }
      } catch (err) {
        // Safe CORS / Canvas export fallback — does not corrupt character record
        console.warn("[VideoCropModal] Canvas poster capture skipped (CORS or canvas error):", err);
      }
    }

    const cropDataResult: VideoCropData = {
      x,
      y,
      zoom,
      aspect,
      posterTimestamp: currentTime,
      customPosterUrl: customPosterUrl || undefined,
      originalUrl: videoSrc || undefined,
    };

    onConfirm(cropDataResult, posterBlob);
    setIsProcessing(false);
  }, [x, y, zoom, aspect, currentTime, customPosterUrl, videoSrc, onConfirm]);

  if (!isOpen || !videoSrc) return null;

  return (
    <OverlayPortal>
      <AnimatePresence>
        <div
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          style={{ zIndex: Z_INDEX.MODAL }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
            style={{
              backgroundColor: isCyber ? "#050816" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber ? "0 0 50px rgba(0,245,255,0.15)" : "8px 8px 0 #000000",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
              style={{
                borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#000000",
                backgroundColor: isCyber ? "rgba(10,15,44,0.95)" : "#F8FAFC",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">🎬</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-black truncate" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
                    {title}
                  </h2>
                  <p className="text-[11px] font-mono opacity-60">
                    Full Source Video • Position & Scale for 3:4 Card
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm cursor-pointer transition-transform hover:scale-110 shrink-0"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  color: isCyber ? "#FFFFFF" : "#000000",
                  border: isCyber ? "1px solid rgba(255,255,255,0.2)" : "2px solid #000",
                }}
              >
                ✕
              </button>
            </div>

            {/* Helper Banner */}
            <div
              className="px-4 py-2 border-b text-[11px] font-mono font-bold flex items-center gap-2"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#EFF6FF",
                borderColor: isCyber ? "rgba(0,245,255,0.15)" : "#DBEAFE",
                color: isCyber ? "#00F5FF" : "#1D4ED8",
              }}
            >
              <span>ℹ️</span>
              <span>Full Source Video shown. Drag and zoom to position inside the 3:4 card boundary.</span>
            </div>

            {/* Body / Video Preview Area */}
            <div className="p-4 sm:p-5 flex flex-col items-center gap-4 overflow-y-auto">
              {/* 3:4 Aspect Ratio Viewport Container */}
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-60 sm:w-64 rounded-2xl overflow-hidden shadow-xl border cursor-grab active:cursor-grabbing select-none shrink-0"
                style={{
                  aspectRatio: "3/4",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  borderWidth: isCyber ? "2px" : "3.5px",
                  boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.25)" : "6px 6px 0 #000000",
                  backgroundColor: "#000000",
                }}
              >
                {/* Framed Video */}
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration || 0);
                    }
                  }}
                  onTimeUpdate={() => {
                    if (videoRef.current && !isDragging) {
                      setCurrentTime(videoRef.current.currentTime || 0);
                    }
                  }}
                  style={{
                    transform: `translate(${x}%, ${y}%) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  className="w-full h-full object-contain object-center pointer-events-none"
                />

                {/* Grid Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none border border-dashed border-white/20 grid grid-cols-3 grid-rows-3 opacity-40">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Drag Hint & Zoom Badge */}
                <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none flex items-center justify-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white/90 backdrop-blur-sm border border-white/10">
                    ✋ Drag to Pan ({x}%, {y}%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-cyan-300 backdrop-blur-sm border border-cyan-500/30">
                    {zoom.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Video Scrub Bar & Playback Controls */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border cursor-pointer"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E2E8F0",
                      borderColor: isCyber ? "#00F5FF" : "#000000",
                      color: isCyber ? "#00F5FF" : "#000000",
                    }}
                  >
                    {isPlaying ? "⏸️" : "▶️"}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-black/40 rounded-lg"
                  />

                  <span className="text-[11px] font-mono opacity-70 shrink-0 w-12 text-right">
                    {currentTime.toFixed(1)}s
                  </span>
                </div>

                {/* Zoom & Framing Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <span className="text-xs font-mono font-bold opacity-70 shrink-0">Zoom ({zoom.toFixed(2)}x):</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-black/40 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                        borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                        color: isCyber ? "#CBD5E1" : "#000000",
                      }}
                      title="Reset to unscaled Full Source Video (1.0x)"
                    >
                      Reset (Full Source)
                    </button>
                    <button
                      type="button"
                      onClick={handleFill}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                        borderColor: isCyber ? "#00F5FF" : "#000000",
                        color: isCyber ? "#00F5FF" : "#000000",
                      }}
                      title="Zoom enough to fill the 3:4 card boundary"
                    >
                      Fill 3:4
                    </button>
                  </div>
                </div>

                {/* ── Optional Custom Poster Upload Section ──────────────────────── */}
                <div
                  className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">📷</span>
                    <div className="min-w-0">
                      <p className="font-bold truncate" style={{ color: isCyber ? "#E0E8FF" : "#000000" }}>
                        Custom Poster (Optional)
                      </p>
                      <p className="text-[10px] font-mono opacity-60 truncate">
                        {customPosterUrl ? "Custom thumbnail active" : "Default: generated from current frame"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {customPosterUrl ? (
                      <button
                        type="button"
                        onClick={() => setCustomPosterUrl(null)}
                        className="px-2.5 py-1 text-[10px] font-mono text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 cursor-pointer"
                      >
                        ✕ Remove Custom
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploadingPoster}
                        onClick={() => customPosterInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFFFFF",
                          borderColor: isCyber ? "#00F5FF" : "#000000",
                          color: isCyber ? "#00F5FF" : "#000000",
                        }}
                      >
                        {isUploadingPoster ? "Uploading..." : "Upload Poster"}
                      </button>
                    )}

                    <input
                      ref={customPosterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomPosterSelect}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div
              className="px-5 py-4 border-t flex items-center justify-end gap-2.5 shrink-0"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
                backgroundColor: isCyber ? "rgba(10,15,44,0.8)" : "#F8FAFC",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000000",
                  color: isCyber ? "#CBD5E1" : "#000000",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 text-white shadow-md active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#2563EB",
                  color: isCyber ? "#000000" : "#FFFFFF",
                  border: isCyber ? "1px solid #00F5FF" : "2px solid #000000",
                  boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000000",
                }}
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Processing Framing...</span>
                  </>
                ) : (
                  <span>✓ Apply Video Framing</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </OverlayPortal>
  );
}
