"use client";

import React, { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspect?: number;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  aspect = 1,
  title = "Crop Image",
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error("Cropping error:", e);
      alert("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6 relative">
        {/* Cyber corner brackets */}
        {isCyber && (
          <>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#BF5FFF]" />
          </>
        )}

        <div
          className="flex justify-between items-center mb-5 pb-3"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}
        >
          <h2
            className="text-lg font-black tracking-wide"
            style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-black/10"
            style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
          >
            ✕
          </button>
        </div>

        {imageSrc && (
          <div className="space-y-4">
            <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden border border-adaptive-unique">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="flex flex-col gap-2 px-2">
              <label
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
              >
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#00F5FF]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-colors bg-transparent"
                style={{
                  borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                  color: isCyber ? "#94A3B8" : "#6B7280",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-5 py-2 text-sm font-black rounded-lg transition-transform active:scale-95 disabled:opacity-60"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#fff",
                }}
              >
                {isProcessing ? "Cropping..." : "Crop & Confirm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
