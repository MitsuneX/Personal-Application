"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import { ImageCropModal, CropData } from "@/components/ui/ImageCropModal";
import { VideoCropModal, VideoCropData } from "@/components/ui/VideoCropModal";
import { useToast } from "@/components/ui/ToastProvider";

interface CharacterImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string, cropData?: any) => void;
  onClear?: () => void;
  aspect?: number; // 1 = square avatar, 16/9 = splash
  hint?: string;
  previewClass?: string;
  cropData?: any;
  allowVideo?: boolean;
  onVideoCropChange?: (cropData: VideoCropData) => void;
}

export function CharacterImageUploader({
  label,
  value,
  onChange,
  onClear,
  aspect = 1,
  hint,
  previewClass = "",
  cropData,
  allowVideo = false,
  onVideoCropChange,
}: CharacterImageUploaderProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isVideoCropOpen, setIsVideoCropOpen] = useState(false);
  const [videoCropSrc, setVideoCropSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { error: toastError } = useToast();

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(errText || `Upload failed with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.url) {
        setVideoCropSrc(json.url);
        setIsVideoCropOpen(true);
      } else {
        throw new Error(json.error || "Server returned no URL after upload.");
      }
    } catch (err: any) {
      const msg = err?.message || "Video upload failed. Check the file and try again.";
      console.error("Video upload error:", err);
      toastError(msg, "Upload Failed");
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoCropConfirm = async (videoData: VideoCropData, posterBlob?: Blob | null) => {
    setIsVideoCropOpen(false);
    if (!videoCropSrc) return;

    let posterUrl: string | undefined = videoData.posterUrl;

    if (posterBlob) {
      try {
        const formData = new FormData();
        formData.append("file", posterBlob, `poster-${Date.now()}.jpg`);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.success && json.url) {
          posterUrl = json.url;
        }
      } catch (err) {
        console.warn("Poster upload error:", err);
      }
    }

    const finalVideoCropData: VideoCropData = {
      ...videoData,
      posterUrl,
      originalUrl: videoCropSrc,
    };

    onChange(videoCropSrc, finalVideoCropData);
    onVideoCropChange?.(finalVideoCropData);
    setVideoCropSrc(null);
  };

  const processFile = useCallback((file: File) => {
    // Clear any previous error immediately so the user sees feedback for the new attempt
    setUploadError(null);
    if (file.type.startsWith("video/")) {
      if (!allowVideo) return;
      handleVideoUpload(file);
      return;
    }
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setCropSrc(src);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  }, [allowVideo, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCropComplete = async (blob: Blob, newCropData: CropData) => {
    setIsCropOpen(false);
    setIsUploading(true);
    setUploadError(null);
    try {
      // Create FormData and upload blob to permanent server storage
      const formData = new FormData();
      const filename = `crop-${Date.now()}.png`;
      formData.append("file", blob, filename);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        onChange(json.url, newCropData);
      } else {
        // Fallback to data URL if upload response was missing URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange(dataUrl, newCropData);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error("Upload error, using fallback data URL:", err);
      // For image crops, still fall back to data URL so the user doesn't lose work
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange(dataUrl, newCropData);
      };
      reader.readAsDataURL(blob);
    } finally {
      setIsUploading(false);
      setCropSrc(null);
    }
  };

  const accent = isCyber ? "#00F5FF" : "#000000";
  const hasImage = Boolean(value && (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/")));

  // Detect video: handles local paths (/uploads/clip.mp4), Supabase CDN URLs with query
  // strings (?token=abc), and data: URLs — matches mediaResolver.isVideoUrl() exactly.
  const isVideo = Boolean(
    value && (
      /\.(mp4|webm|mov|ogg)(?:[?#]|$)/i.test(value) ||
      value.startsWith("data:video/")
    )
  );

  return (
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between">
        <label
          className="text-xs font-mono font-bold uppercase tracking-wider"
          style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "#6B7280" }}
        >
          {label}
        </label>
        {hasImage && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-mono opacity-60 hover:opacity-100 text-red-400 transition-opacity cursor-pointer"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Drop Zone / Preview */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isDragging ? "scale-[1.02]" : ""
        } ${previewClass || (aspect === 1 ? "h-28 w-28" : "h-28 w-full")}`}
        style={{
          borderColor: isDragging ? accent : isCyber ? "rgba(0,245,255,0.25)" : "#D1D5DB",
          backgroundColor: isDragging
            ? isCyber ? "rgba(0,245,255,0.08)" : "#F0F9FF"
            : isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-cyan-400">
            <span className="animate-spin text-xl">🌀</span>
            <span className="text-[10px] font-mono font-bold">Uploading…</span>
          </div>
        ) : uploadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
            <span className="text-xl">❌</span>
            <span
              className="text-[10px] font-mono font-bold"
              style={{ color: isCyber ? "#FF3B3B" : "#DC2626" }}
            >
              Upload Failed
            </span>
            <span
              className="text-[9px] font-mono opacity-70 leading-tight"
              style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
            >
              Click to retry
            </span>
          </div>
        ) : hasImage ? (
          <>
            {isVideo ? (
              <video
                src={value}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={value}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <span className="text-white text-xs font-bold bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur">
                ✏️ Replace / Recrop
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
            <span className="text-2xl opacity-40">
              {aspect === 1 ? "👤" : "🖼️"}
            </span>
            <span
              className="text-[10px] font-mono font-bold"
              style={{ color: isCyber ? "rgba(0,245,255,0.5)" : "#9CA3AF" }}
            >
              Drop or Click
            </span>
          </div>
        )}
      </div>

      {hint && (
        <p className="text-[10px] font-mono opacity-50"
           style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
          {hint}
        </p>
      )}

      {isVideo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVideoCropSrc(value!);
            setIsVideoCropOpen(true);
          }}
          className="w-full px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 mt-1"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#F1F5F9",
            borderColor: isCyber ? "#00F5FF" : "#000000",
            color: isCyber ? "#00F5FF" : "#000000",
          }}
        >
          <span>🎬</span>
          <span>Frame 3:4 Video Preview</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={allowVideo ? "image/*,video/mp4,video/webm" : "image/*"}
        className="hidden"
        onChange={handleFileChange}
      />

      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={cropSrc}
        aspect={aspect}
        title={`Position & Crop ${label}`}
        initialCropData={cropData}
        onClose={() => { setIsCropOpen(false); setCropSrc(null); }}
        onCropComplete={handleCropComplete}
      />

      <VideoCropModal
        isOpen={isVideoCropOpen}
        videoSrc={videoCropSrc}
        aspect={aspect || 3 / 4}
        title={`Frame Video for ${label}`}
        initialCropData={cropData}
        onClose={() => { setIsVideoCropOpen(false); setVideoCropSrc(null); }}
        onConfirm={handleVideoCropConfirm}
      />
    </div>
  );
}

// Gallery uploader — multiple images
interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function GalleryUploader({ images, onChange }: GalleryUploaderProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success && json.url) {
          newImages.push(json.url);
        } else {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (e) => {
              newImages.push(e.target?.result as string);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      } catch (err) {
        console.error("Gallery upload error:", err);
      }
    }

    if (newImages.length > 0) {
      const combined = Array.from(new Set([...(images || []), ...newImages]));
      onChange(combined);
    }
    setIsUploading(false);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-mono font-bold uppercase tracking-wider"
        style={{ color: isCyber ? "rgba(0,245,255,0.7)" : "#6B7280" }}
      >
        Gallery
      </label>

      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border"
               style={{ borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#D1D5DB" }}>
            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl transition-all hover:scale-105"
          style={{
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#D1D5DB",
            color: isCyber ? "rgba(0,245,255,0.5)" : "#9CA3AF",
            backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F9FAFB",
          }}
        >
          +
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
